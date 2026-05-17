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

export async function buscarAlbum(
  titulo: string,
  artista?: string,
): Promise<ResultadoLanzamiento | null> {
  const consulta = artista ? `release:"${titulo}" AND artist:"${artista}"` : `release:"${titulo}"`
  const datos = await llamarMusicBrainz<MbSearchResponse>('/release-group/', {
    query: consulta,
    limit: '10',
  })

  const grupos = datos?.['release-groups'] ?? []
  if (grupos.length === 0) return null

  const albumes = grupos.filter(
    (g) => g['primary-type'] === 'Album' || g['primary-type'] === 'EP' || g['primary-type'] === 'Single',
  )
  const candidatos = albumes.length > 0 ? albumes : grupos
  const conFecha = candidatos.filter((g) => g['first-release-date'])
  const elegido = (conFecha.length > 0 ? conFecha : candidatos).sort(
    (a, b) => (b.score ?? 0) - (a.score ?? 0),
  )[0]
  if (!elegido || !elegido['first-release-date']) return null

  const fechaCruda = elegido['first-release-date']
  const fechaCompleta = fechaCruda.length === 4
    ? `${fechaCruda}-01-01`
    : fechaCruda.length === 7
      ? `${fechaCruda}-01`
      : fechaCruda

  const artistaCredito = elegido['artist-credit']?.[0]?.name
  const posterUrl = await obtenerPortada(elegido.id)
  const descripcion = artistaCredito
    ? `Album de ${artistaCredito}${elegido['primary-type'] ? ` (${elegido['primary-type']})` : ''}`
    : undefined

  return {
    fuente: 'musicbrainz',
    tipo: 'album',
    titulo: artistaCredito ? `${elegido.title} — ${artistaCredito}` : elegido.title,
    fechaLanzamiento: fechaCompleta.slice(0, 10),
    musicbrainzId: elegido.id,
    posterUrl,
    descripcion,
  }
}
