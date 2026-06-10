import type { ResultadoLanzamiento } from '@/types/release.types'
import { fetchConTimeout } from '@/lib/utils/fetch-con-timeout'

const USER_AGENT = 'Noti/1.0 (https://noti.vercel.app)'

// MusicBrainz exige maximo 1 peticion por segundo. Cola secuencial a nivel de
// modulo: cada llamada espera a la anterior y respeta un intervalo minimo.
// Las llamadas paralelas (Promise.all) se serializan automaticamente aqui.
const INTERVALO_MS = 1100
let colaMb: Promise<unknown> = Promise.resolve()
let ultimaLlamadaMb = 0

function conThrottle<T>(fn: () => Promise<T>): Promise<T> {
  const resultado = colaMb.then(async () => {
    const espera = ultimaLlamadaMb + INTERVALO_MS - Date.now()
    if (espera > 0) await new Promise((r) => setTimeout(r, espera))
    ultimaLlamadaMb = Date.now()
    return fn()
  })
  // La cola nunca debe quedar rechazada o bloquearia llamadas futuras.
  colaMb = resultado.catch(() => {})
  return resultado
}

interface MbReleaseGroup {
  id: string
  title: string
  'first-release-date'?: string
  'primary-type'?: string
  'artist-credit'?: Array<{ name: string }>
  score?: number
}

interface MbSearchResponse {
  'release-groups': MbReleaseGroup[]
}

interface MbRelease {
  id: string
  date?: string
  country?: string
  status?: string
}

interface MbReleaseSearchResponse {
  releases: MbRelease[]
}

interface MbArtist {
  id: string
  name: string
  score?: number
}

interface MbArtistSearchResponse {
  artists: MbArtist[]
}

function escaparLucene(texto: string): string {
  return texto.replace(/[+\-&|!(){}[\]^"~*?:\\]/g, '\\$&')
}

// Lanza Error ante HTTP !ok o fallo de red (tras reintento): el orquestador
// captura por fuente y reporta la fuente caida al usuario.
async function llamarMusicBrainz<T>(
  ruta: string,
  params: Record<string, string>,
): Promise<T> {
  const url = new URL(`https://musicbrainz.org/ws/2${ruta}`)
  url.searchParams.set('fmt', 'json')
  for (const [key, valor] of Object.entries(params)) {
    url.searchParams.set(key, valor)
  }
  return conThrottle(async () => {
    const respuesta = await fetchConTimeout(
      url.toString(),
      { headers: { 'User-Agent': USER_AGENT }, next: { revalidate: 3600 } },
      // El throttle ya espacia las llamadas; un solo intento extra basta.
      { timeoutMs: 6000, reintentos: 1 },
    )
    if (!respuesta.ok) {
      throw new Error(`MusicBrainz respondio ${respuesta.status}`)
    }
    return (await respuesta.json()) as T
  })
}

// coverartarchive.org es un servicio aparte (sin limite de 1 req/s).
async function obtenerPortada(releaseGroupId: string): Promise<string | undefined> {
  try {
    const respuesta = await fetchConTimeout(
      `https://coverartarchive.org/release-group/${releaseGroupId}/front-500`,
      { method: 'HEAD' },
      { timeoutMs: 4000, reintentos: 0 },
    )
    if (respuesta.ok || respuesta.status === 307) {
      return `https://coverartarchive.org/release-group/${releaseGroupId}/front-500`
    }
  } catch {}
  return undefined
}

async function fechaDesdeReleases(releaseGroupId: string): Promise<string | null> {
  const datos = await llamarMusicBrainz<MbReleaseSearchResponse>('/release/', {
    'release-group': releaseGroupId,
    limit: '25',
  })
  if (datos.releases.length === 0) return null

  const fechasValidas = datos.releases
    .map((r) => r.date)
    .filter((d): d is string => !!d && /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort()

  return fechasValidas[0] ?? null
}

// buscarFechaProfunda limita el N+1: la consulta extra a /release/ (1.1s cada
// una por el throttle) solo se hace para los primeros candidatos del ranking.
async function grupoAResultado(
  grupo: MbReleaseGroup,
  buscarFechaProfunda = true,
): Promise<ResultadoLanzamiento | null> {
  const fechaCruda = grupo['first-release-date']
  let fechaCompleta: string | null = null
  let tba = false

  if (fechaCruda && /^\d{4}-\d{2}-\d{2}$/.test(fechaCruda)) {
    fechaCompleta = fechaCruda
  } else {
    let desdeReleases: string | null = null
    if (buscarFechaProfunda) {
      try {
        desdeReleases = await fechaDesdeReleases(grupo.id)
      } catch (e) {
        console.error('MusicBrainz fecha desde releases fallo:', e)
      }
    }
    if (desdeReleases) {
      fechaCompleta = desdeReleases
    } else if (fechaCruda) {
      fechaCompleta = fechaCruda.length === 4 ? `${fechaCruda}-01-01` : `${fechaCruda}-01`
      tba = true
    } else {
      tba = true
    }
  }

  const artistaCredito = grupo['artist-credit']?.[0]?.name
  const posterUrl = await obtenerPortada(grupo.id)

  return {
    fuente: 'musicbrainz',
    tipo: 'album',
    titulo: grupo.title,
    fechaLanzamiento: fechaCompleta,
    tba: tba || undefined,
    musicbrainzId: grupo.id,
    posterUrl,
    descripcion: artistaCredito
      ? `${grupo['primary-type'] ?? 'Album'} de ${artistaCredito}`
      : undefined,
    artista: artistaCredito,
  }
}

async function buscarArtistaId(artista: string): Promise<string | null> {
  const datos = await llamarMusicBrainz<MbArtistSearchResponse>('/artist/', {
    query: escaparLucene(artista),
    limit: '5',
  })
  if (datos.artists.length === 0) return null
  const ordenado = [...datos.artists].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  return ordenado[0]?.id ?? null
}

export async function candidatosAlbum(
  titulo: string,
  artista?: string,
  limite = 5,
): Promise<ResultadoLanzamiento[]> {
  const tituloEsc = escaparLucene(titulo)
  const artistaEsc = artista ? escaparLucene(artista) : null

  const consultaPrecisa = artistaEsc
    ? `release:"${tituloEsc}" AND artist:"${artistaEsc}"`
    : `release:"${tituloEsc}"`

  let datos = await llamarMusicBrainz<MbSearchResponse>('/release-group/', {
    query: consultaPrecisa,
    limit: '15',
  })
  let grupos = datos['release-groups'] ?? []

  if (grupos.length === 0) {
    const consultaFuzzy = artistaEsc
      ? `${tituloEsc} AND artist:${artistaEsc}`
      : tituloEsc
    datos = await llamarMusicBrainz<MbSearchResponse>('/release-group/', {
      query: consultaFuzzy,
      limit: '15',
    })
    grupos = datos['release-groups'] ?? []
  }

  if (grupos.length === 0) return []

  const tipos = ['Album', 'EP', 'Single']
  const filtradoPorTipo = grupos.filter((g) => tipos.includes(g['primary-type'] ?? ''))
  const pool = filtradoPorTipo.length > 0 ? filtradoPorTipo : grupos
  const ordenados = pool.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, limite)

  // Busqueda profunda de fecha solo para los 3 primeros (cada una cuesta
  // ~1.1s por el throttle de MusicBrainz).
  const resultados = await Promise.all(ordenados.map((g, i) => grupoAResultado(g, i < 3)))
  const filtrados = resultados.filter((r): r is ResultadoLanzamiento => r !== null)
  if (process.env.NODE_ENV !== 'production') console.log('[MusicBrainz/candidatos]', { titulo, artista, candidatos: filtrados.length })
  return filtrados
}

export async function proximoAlbum(artista: string, limite = 5): Promise<ResultadoLanzamiento[]> {
  const artistaId = await buscarArtistaId(artista)
  if (!artistaId) return []

  const datos = await llamarMusicBrainz<MbSearchResponse>('/release-group/', {
    artist: artistaId,
    type: 'album',
    limit: '50',
  })

  const grupos = datos['release-groups'] ?? []
  if (grupos.length === 0) return []

  const hoy = new Date().toISOString().slice(0, 10)
  const conFecha = grupos.filter((g) => g['first-release-date'])

  const futuros = conFecha
    .filter((g) => g['first-release-date']! >= hoy)
    .sort((a, b) => (a['first-release-date']! < b['first-release-date']! ? -1 : 1))

  const pasados = conFecha
    .filter((g) => g['first-release-date']! < hoy)
    .sort((a, b) => (a['first-release-date']! < b['first-release-date']! ? 1 : -1))

  const ordenados = [...futuros, ...pasados].slice(0, limite)
  const resultados = await Promise.all(ordenados.map((g, i) => grupoAResultado(g, i < 3)))
  return resultados.filter((r): r is ResultadoLanzamiento => r !== null)
}
