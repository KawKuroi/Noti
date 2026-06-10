import type { ResultadoLanzamiento } from '@/types/release.types'
import { coincideTituloAproximado } from '@/lib/utils/coincidencia-titulo'
import { fetchConTimeout } from '@/lib/utils/fetch-con-timeout'

const POSTER_BASE = 'https://image.tmdb.org/t/p/w500'

// TMDB popularity es un valor abierto (~0 a 1000+); 100 ya es muy popular.
function normalizarPopularidad(popularity?: number): number {
  return Math.min((popularity ?? 0) / 100, 1)
}

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

interface TmdbMovieDetalle {
  credits?: {
    crew: Array<{ job: string; name: string }>
  }
  release_dates?: TmdbReleaseDates
}

interface TmdbReleaseDates {
  results: Array<{
    iso_3166_1: string
    release_dates: Array<{ release_date: string; type: number }>
  }>
}

interface TmdbSerieDetalle {
  id: number
  name?: string
  original_name?: string
  first_air_date?: string
  poster_path?: string | null
  overview?: string
  next_episode_to_air?: {
    air_date: string
    episode_number: number
    season_number: number
  } | null
}

function obtenerConfig() {
  const apiKey = process.env.TMDB_API_KEY
  const baseUrl = process.env.TMDB_API_BASE_URL ?? 'https://api.themoviedb.org/3'
  if (!apiKey) throw new Error('TMDB_API_KEY no configurada')
  return { apiKey, baseUrl }
}

// Lanza Error ante key ausente, HTTP !ok o fallo de red (tras reintento):
// el orquestador (release-search) captura por fuente con allSettled y reporta
// la fuente caida en lugar de devolver una lista vacia silenciosa.
async function llamarTmdb<T>(
  ruta: string,
  params: Record<string, string> = {},
  opciones: { sinIdioma?: boolean } = {},
): Promise<T> {
  const { apiKey, baseUrl } = obtenerConfig()
  const url = new URL(`${baseUrl}${ruta}`)
  url.searchParams.set('api_key', apiKey)
  if (!opciones.sinIdioma) url.searchParams.set('language', 'es-ES')
  for (const [key, valor] of Object.entries(params)) {
    url.searchParams.set(key, valor)
  }
  const respuesta = await fetchConTimeout(url.toString(), { next: { revalidate: 3600 } })
  if (!respuesta.ok) {
    throw new Error(`TMDB respondio ${respuesta.status}`)
  }
  return (await respuesta.json()) as T
}

// Busqueda con fallback de idioma: es-ES primero (metadata localizada) y, si
// no hay resultados, sin language (TMDB usa en-US y amplia el matching).
async function buscarConFallbackIdioma(
  ruta: '/search/movie' | '/search/tv',
  params: Record<string, string>,
): Promise<TmdbSearchResponse> {
  const localizada = await llamarTmdb<TmdbSearchResponse>(ruta, params)
  if (localizada.results.length > 0) return localizada
  return llamarTmdb<TmdbSearchResponse>(ruta, params, { sinIdioma: true })
}

function fechaPeliculaLocalizada(datos: TmdbReleaseDates | undefined): string | null {
  if (!datos) return null
  for (const pais of ['CO', 'US']) {
    const entrada = datos.results.find((r) => r.iso_3166_1 === pais)
    const teatral = entrada?.release_dates.find((rd) => rd.type === 3)
    const cualquiera = entrada?.release_dates[0]
    const fecha = (teatral ?? cualquiera)?.release_date
    if (fecha) return fecha.slice(0, 10)
  }
  return null
}

async function peliculaAResultado(r: TmdbSearchResult): Promise<ResultadoLanzamiento | null> {
  // Una sola llamada de detalle con credits + release_dates (antes eran dos).
  // Si el detalle falla, degradar a los datos del resultado de busqueda en
  // lugar de descartar el candidato.
  let detalle: TmdbMovieDetalle | null = null
  try {
    detalle = await llamarTmdb<TmdbMovieDetalle>(`/movie/${r.id}`, {
      append_to_response: 'credits,release_dates',
    })
  } catch (e) {
    console.error('TMDB detalle de pelicula fallo:', e)
  }

  const fecha = fechaPeliculaLocalizada(detalle?.release_dates) ?? r.release_date
  if (!fecha) return null

  const director = detalle?.credits?.crew?.find((c) => c.job === 'Director')?.name

  return {
    fuente: 'tmdb',
    tipo: 'movie',
    titulo: r.title ?? r.original_title ?? '',
    fechaLanzamiento: fecha.slice(0, 10),
    tmdbId: r.id,
    posterUrl: r.poster_path ? `${POSTER_BASE}${r.poster_path}` : undefined,
    descripcion: r.overview || undefined,
    director,
    popularidad: normalizarPopularidad(r.popularity),
  }
}

async function serieAResultado(r: TmdbSearchResult): Promise<ResultadoLanzamiento | null> {
  let detalle: TmdbSerieDetalle | null = null
  try {
    detalle = await llamarTmdb<TmdbSerieDetalle>(`/tv/${r.id}`)
  } catch (e) {
    console.error('TMDB detalle de serie fallo:', e)
  }

  const fechaProximoEp = detalle?.next_episode_to_air?.air_date
  const fechaPrimera = r.first_air_date ?? detalle?.first_air_date
  const fecha = fechaProximoEp ?? fechaPrimera
  if (!fecha) return null

  const temporada = detalle?.next_episode_to_air?.season_number

  return {
    fuente: 'tmdb',
    tipo: 'tv',
    titulo: r.name ?? r.original_name ?? '',
    fechaLanzamiento: fecha.slice(0, 10),
    tmdbId: r.id,
    posterUrl: r.poster_path ? `${POSTER_BASE}${r.poster_path}` : undefined,
    descripcion: r.overview || undefined,
    temporada,
    popularidad: normalizarPopularidad(r.popularity),
  }
}

function ordenarPorRelevancia(
  resultados: TmdbSearchResult[],
  campoFecha: 'release_date' | 'first_air_date',
): TmdbSearchResult[] {
  const hoy = new Date().toISOString().slice(0, 10)
  const futuros = resultados.filter((r) => {
    const f = r[campoFecha]
    return f && f >= hoy
  })
  const pasados = resultados.filter((r) => {
    const f = r[campoFecha]
    return !f || f < hoy
  })
  const sortPop = (a: TmdbSearchResult, b: TmdbSearchResult) =>
    (b.popularity ?? 0) - (a.popularity ?? 0)
  return [...futuros.sort(sortPop), ...pasados.sort(sortPop)]
}

export async function candidatosPelicula(titulo: string, limite = 5): Promise<ResultadoLanzamiento[]> {
  const busqueda = await buscarConFallbackIdioma('/search/movie', { query: titulo })
  if (busqueda.results.length === 0) return []

  const coincidentes = busqueda.results.filter((r) =>
    coincideTituloAproximado(titulo, r.title ?? r.original_title ?? ''),
  )
  const pool = coincidentes.length > 0 ? coincidentes : busqueda.results
  const ordenados = ordenarPorRelevancia(pool, 'release_date').slice(0, limite)

  const resultados = await Promise.all(ordenados.map(peliculaAResultado))
  const filtrados = resultados.filter((r): r is ResultadoLanzamiento => r !== null)
  if (process.env.NODE_ENV !== 'production') console.log('[TMDB/movie/candidatos]', { titulo, candidatos: filtrados.length })
  return filtrados
}

export async function candidatosSerie(titulo: string, limite = 5): Promise<ResultadoLanzamiento[]> {
  const busqueda = await buscarConFallbackIdioma('/search/tv', { query: titulo })
  if (busqueda.results.length === 0) return []

  const coincidentes = busqueda.results.filter((r) =>
    coincideTituloAproximado(titulo, r.name ?? r.original_name ?? ''),
  )
  const pool = coincidentes.length > 0 ? coincidentes : busqueda.results
  const ordenados = ordenarPorRelevancia(pool, 'first_air_date').slice(0, limite)

  const resultados = await Promise.all(ordenados.map(serieAResultado))
  const filtrados = resultados.filter((r): r is ResultadoLanzamiento => r !== null)
  if (process.env.NODE_ENV !== 'production') console.log('[TMDB/tv/candidatos]', { titulo, candidatos: filtrados.length })
  return filtrados
}

export async function proximaPelicula(franquicia: string, limite = 5): Promise<ResultadoLanzamiento[]> {
  const hoy = new Date().toISOString().slice(0, 10)
  const busqueda = await buscarConFallbackIdioma('/search/movie', {
    query: franquicia,
    include_adult: 'false',
  })
  if (busqueda.results.length === 0) return []

  const coincidentes = busqueda.results.filter((r) =>
    coincideTituloAproximado(franquicia, r.title ?? r.original_title ?? ''),
  )
  const pool = coincidentes.length > 0 ? coincidentes : busqueda.results

  const futuros = pool
    .filter((r) => r.release_date && r.release_date >= hoy)
    .sort((a, b) => (a.release_date! < b.release_date! ? -1 : 1))
  if (futuros.length === 0) return []

  const resultados = await Promise.all(futuros.slice(0, limite).map(peliculaAResultado))
  return resultados.filter((r): r is ResultadoLanzamiento => r !== null)
}

export async function proximaSerie(franquicia: string, limite = 5): Promise<ResultadoLanzamiento[]> {
  const busqueda = await buscarConFallbackIdioma('/search/tv', { query: franquicia })
  if (busqueda.results.length === 0) return []

  const coincidentes = busqueda.results.filter((r) =>
    coincideTituloAproximado(franquicia, r.name ?? r.original_name ?? ''),
  )
  const pool = coincidentes.length > 0 ? coincidentes : busqueda.results
  const ordenados = [...pool].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))

  const candidatos: ResultadoLanzamiento[] = []
  // Acotar las llamadas de detalle (N+1) a los primeros 8 mas populares.
  for (const candidato of ordenados.slice(0, 8)) {
    if (candidatos.length >= limite) break
    let detalle: TmdbSerieDetalle | null = null
    try {
      detalle = await llamarTmdb<TmdbSerieDetalle>(`/tv/${candidato.id}`)
    } catch (e) {
      console.error('TMDB detalle de serie fallo:', e)
      continue
    }
    const fechaProximoEp = detalle?.next_episode_to_air?.air_date
    if (!fechaProximoEp) continue
    candidatos.push({
      fuente: 'tmdb',
      tipo: 'tv',
      titulo: candidato.name ?? candidato.original_name ?? franquicia,
      fechaLanzamiento: fechaProximoEp.slice(0, 10),
      tmdbId: candidato.id,
      posterUrl: candidato.poster_path ? `${POSTER_BASE}${candidato.poster_path}` : undefined,
      descripcion: candidato.overview || undefined,
      temporada: detalle?.next_episode_to_air?.season_number,
      popularidad: normalizarPopularidad(candidato.popularity),
    })
  }
  return candidatos
}
