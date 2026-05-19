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

// Escapa caracteres especiales de la sintaxis Lucene que usa MusicBrainz
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

function elegirCandidato(grupos: MbReleaseGroup[]): MbReleaseGroup | null {
  if (grupos.length === 0) return null

  const hoy = new Date().toISOString().slice(0, 10)
  const tipos = ['Album', 'EP', 'Single']
  const filtradoPorTipo = grupos.filter((g) => tipos.includes(g['primary-type'] ?? ''))
  const candidatos = filtradoPorTipo.length > 0 ? filtradoPorTipo : grupos

  // Priorizar releases con fecha futura
  const futuros = candidatos.filter((g) => {
    const fecha = g['first-release-date']
    return fecha && fecha >= hoy
  })
  const pool = futuros.length > 0 ? futuros : candidatos

  return pool.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0] ?? null
}

export async function buscarAlbum(
  titulo: string,
  artista?: string,
): Promise<ResultadoLanzamiento | null> {
  const tituloEsc = escaparLucene(titulo)
  const artistaEsc = artista ? escaparLucene(artista) : null

  // Primera pasada: consulta exacta con comillas
  const consultaPrecisa = artistaEsc
    ? `release:"${tituloEsc}" AND artist:"${artistaEsc}"`
    : `release:"${tituloEsc}"`

  let datos = await llamarMusicBrainz<MbSearchResponse>('/release-group/', {
    query: consultaPrecisa,
    limit: '10',
  })
  let grupos = datos?.['release-groups'] ?? []

  // Segunda pasada: fuzzy sin comillas si la primera fue vacía
  if (grupos.length === 0) {
    const consultaFuzzy = artistaEsc
      ? `${tituloEsc} AND artist:${artistaEsc}`
      : tituloEsc

    datos = await llamarMusicBrainz<MbSearchResponse>('/release-group/', {
      query: consultaFuzzy,
      limit: '10',
    })
    grupos = datos?.['release-groups'] ?? []
  }

  if (grupos.length === 0) return null

  const elegido = elegirCandidato(grupos)
  if (!elegido || !elegido['first-release-date']) return null

  const fechaCruda = elegido['first-release-date']
  const fechaCompleta =
    fechaCruda.length === 4
      ? `${fechaCruda}-01-01`
      : fechaCruda.length === 7
        ? `${fechaCruda}-01`
        : fechaCruda

  const artistaCredito = elegido['artist-credit']?.[0]?.name
  const posterUrl = await obtenerPortada(elegido.id)

  console.log('[MusicBrainz]', { titulo, artista, encontrado: elegido.title, fecha: fechaCompleta })

  return {
    fuente: 'musicbrainz',
    tipo: 'album',
    titulo: artistaCredito ? `${elegido.title} — ${artistaCredito}` : elegido.title,
    fechaLanzamiento: fechaCompleta.slice(0, 10),
    musicbrainzId: elegido.id,
    posterUrl,
    descripcion: artistaCredito
      ? `Album de ${artistaCredito}${elegido['primary-type'] ? ` (${elegido['primary-type']})` : ''}`
      : undefined,
    artista: artistaCredito,
  }
}
