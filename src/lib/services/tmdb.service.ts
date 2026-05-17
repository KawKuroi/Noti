import type { ResultadoLanzamiento } from '@/types/release.types'

const POSTER_BASE = 'https://image.tmdb.org/t/p/w500'

interface TmdbSearchResult {
  id: number
  title?: string
  name?: string
  original_title?: string
  original_name?: string
  release_date?: string
  first_air_date?: string
  poster_path?: string | null
  overview?: string
  popularity?: number
}

interface TmdbSearchResponse {
  results: TmdbSearchResult[]
}

interface TmdbReleaseDates {
  results: Array<{
    iso_3166_1: string
    release_dates: Array<{ release_date: string; type: number }>
  }>
}

function obtenerConfig() {
  const apiKey = process.env.TMDB_API_KEY
  const baseUrl = process.env.TMDB_API_BASE_URL ?? 'https://api.themoviedb.org/3'
  if (!apiKey) {
    throw new Error('TMDB_API_KEY no configurada')
  }
  return { apiKey, baseUrl }
}

async function llamarTmdb<T>(ruta: string, params: Record<string, string> = {}): Promise<T | null> {
  const { apiKey, baseUrl } = obtenerConfig()
  const url = new URL(`${baseUrl}${ruta}`)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('language', 'es-ES')
  for (const [key, valor] of Object.entries(params)) {
    url.searchParams.set(key, valor)
  }

  try {
    const respuesta = await fetch(url.toString(), { cache: 'no-store' })
    if (!respuesta.ok) {
      console.error('TMDB error:', respuesta.status, await respuesta.text())
      return null
    }
    return (await respuesta.json()) as T
  } catch (e) {
    console.error('TMDB fetch fallo:', e)
    return null
  }
}

function elegirMejorResultado(resultados: TmdbSearchResult[]): TmdbSearchResult | null {
  if (resultados.length === 0) return null
  return [...resultados].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))[0]
}

async function obtenerFechaPeliculaEnCo(tmdbId: number): Promise<string | null> {
  const datos = await llamarTmdb<TmdbReleaseDates>(`/movie/${tmdbId}/release_dates`)
  if (!datos) return null
  const co = datos.results.find((r) => r.iso_3166_1 === 'CO')
  const teatral = co?.release_dates.find((rd) => rd.type === 3) ?? co?.release_dates[0]
  return teatral?.release_date?.slice(0, 10) ?? null
}

export async function buscarPelicula(titulo: string): Promise<ResultadoLanzamiento | null> {
  const busqueda = await llamarTmdb<TmdbSearchResponse>('/search/movie', { query: titulo })
  if (!busqueda || busqueda.results.length === 0) return null

  const mejor = elegirMejorResultado(busqueda.results)
  if (!mejor) return null

  const fechaCo = await obtenerFechaPeliculaEnCo(mejor.id)
  const fecha = fechaCo ?? mejor.release_date
  if (!fecha) return null

  return {
    fuente: 'tmdb',
    tipo: 'movie',
    titulo: mejor.title ?? mejor.original_title ?? titulo,
    fechaLanzamiento: fecha.slice(0, 10),
    tmdbId: mejor.id,
    posterUrl: mejor.poster_path ? `${POSTER_BASE}${mejor.poster_path}` : undefined,
    descripcion: mejor.overview || undefined,
  }
}

export async function buscarSerie(titulo: string): Promise<ResultadoLanzamiento | null> {
  const busqueda = await llamarTmdb<TmdbSearchResponse>('/search/tv', { query: titulo })
  if (!busqueda || busqueda.results.length === 0) return null

  const mejor = elegirMejorResultado(busqueda.results)
  if (!mejor || !mejor.first_air_date) return null

  return {
    fuente: 'tmdb',
    tipo: 'tv',
    titulo: mejor.name ?? mejor.original_name ?? titulo,
    fechaLanzamiento: mejor.first_air_date.slice(0, 10),
    tmdbId: mejor.id,
    posterUrl: mejor.poster_path ? `${POSTER_BASE}${mejor.poster_path}` : undefined,
    descripcion: mejor.overview || undefined,
  }
}
