import type { ResultadoLanzamiento } from '@/types/release.types'

const USER_AGENT = 'Noti/1.0 (https://noti.vercel.app)'

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

async function llamarMusicBrainz<T>(
  ruta: string,
  params: Record<string, string>,
): Promise<T | null> {
  const url = new URL(`https://musicbrainz.org/ws/2${ruta}`)
  url.searchParams.set('fmt', 'json')
  for (const [key, valor] of Object.entries(params)) {
    url.searchParams.set(key, valor)
  }
  try {
    const respuesta = await fetch(url.toString(), {
      headers: { 'User-Agent': USER_AGENT },
      cache: 'no-store',
    })
    if (!respuesta.ok) {
      console.error('MusicBrainz error:', respuesta.status, await respuesta.text())
      return null
    }
    return (await respuesta.json()) as T
  } catch (e) {
    console.error('MusicBrainz fetch fallo:', e)
    return null
  }
}

async function obtenerPortada(releaseGroupId: string): Promise<string | undefined> {
  try {
    const respuesta = await fetch(
      `https://coverartarchive.org/release-group/${releaseGroupId}/front-500`,
      { method: 'HEAD' },
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
  if (!datos || datos.releases.length === 0) return null

  const fechasValidas = datos.releases
    .map((r) => r.date)
    .filter((d): d is string => !!d && /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort()

  return fechasValidas[0] ?? null
}

async function grupoAResultado(grupo: MbReleaseGroup): Promise<ResultadoLanzamiento | null> {
  let fechaCruda = grupo['first-release-date']
  let fechaCompleta: string | null = null
  let tba = false

  if (fechaCruda && /^\d{4}-\d{2}-\d{2}$/.test(fechaCruda)) {
    fechaCompleta = fechaCruda
  } else {
    const desdeReleases = await fechaDesdeReleases(grupo.id)
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
  if (!datos || datos.artists.length === 0) return null
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
  let grupos = datos?.['release-groups'] ?? []

  if (grupos.length === 0) {
    const consultaFuzzy = artistaEsc
      ? `${tituloEsc} AND artist:${artistaEsc}`
      : tituloEsc
    datos = await llamarMusicBrainz<MbSearchResponse>('/release-group/', {
      query: consultaFuzzy,
      limit: '15',
    })
    grupos = datos?.['release-groups'] ?? []
  }

  if (grupos.length === 0) return []

  const tipos = ['Album', 'EP', 'Single']
  const filtradoPorTipo = grupos.filter((g) => tipos.includes(g['primary-type'] ?? ''))
  const pool = filtradoPorTipo.length > 0 ? filtradoPorTipo : grupos
  const ordenados = pool.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, limite)

  const resultados = await Promise.all(ordenados.map(grupoAResultado))
  const filtrados = resultados.filter((r): r is ResultadoLanzamiento => r !== null)
  console.log('[MusicBrainz/candidatos]', { titulo, artista, candidatos: filtrados.length })
  return filtrados
}

export async function buscarAlbum(
  titulo: string,
  artista?: string,
): Promise<ResultadoLanzamiento | null> {
  const candidatos = await candidatosAlbum(titulo, artista, 1)
  return candidatos[0] ?? null
}

export async function proximoAlbum(artista: string, limite = 5): Promise<ResultadoLanzamiento[]> {
  const artistaId = await buscarArtistaId(artista)
  if (!artistaId) return []

  const datos = await llamarMusicBrainz<MbSearchResponse>('/release-group/', {
    artist: artistaId,
    type: 'album',
    limit: '50',
  })

  const grupos = datos?.['release-groups'] ?? []
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
  const resultados = await Promise.all(ordenados.map(grupoAResultado))
  return resultados.filter((r): r is ResultadoLanzamiento => r !== null)
}
