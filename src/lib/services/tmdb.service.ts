import type { ResultadoLanzamiento } from '@/types/release.types'
import { coincideTitulo } from '@/lib/utils/coincidencia-titulo'

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

interface TmdbMovieDetalle {
  credits?: {
    crew: Array<{ job: string; name: string }>
  }
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

async function llamarTmdb<T>(ruta: string, params: Record<string, string> = {}): Promise<T | null> {
  try {
    const { apiKey, baseUrl } = obtenerConfig()
    const url = new URL(`${baseUrl}${ruta}`)
    url.searchParams.set('api_key', apiKey)
    url.searchParams.set('language', 'es-ES')
    for (const [key, valor] of Object.entries(params)) {
      url.searchParams.set(key, valor)
    }
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

function elegirMejorResultado(resultados: TmdbSearchResult[], campoFecha: 'release_date' | 'first_air_date'): TmdbSearchResult | null {
  if (resultados.length === 0) return null
  const hoy = new Date().toISOString().slice(0, 10)

  const futuros = resultados.filter((r) => {
    const fecha = r[campoFecha]
    return fecha && fecha >= hoy
  })

  if (futuros.length > 0) {
    return futuros.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))[0]
  }

  return [...resultados].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))[0]
}

async function obtenerFechaPeliculaLocalizada(tmdbId: number): Promise<string | null> {
  const datos = await llamarTmdb<TmdbReleaseDates>(`/movie/${tmdbId}/release_dates`)
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

export async function buscarPelicula(titulo: string): Promise<ResultadoLanzamiento | null> {
  const busqueda = await llamarTmdb<TmdbSearchResponse>('/search/movie', { query: titulo })
  if (!busqueda || busqueda.results.length === 0) return null

  const mejor = elegirMejorResultado(busqueda.results, 'release_date')
  if (!mejor) return null

  const fechaLocalizada = await obtenerFechaPeliculaLocalizada(mejor.id)
  const fecha = fechaLocalizada ?? mejor.release_date
  if (!fecha) return null

  const detalle = await llamarTmdb<TmdbMovieDetalle>(`/movie/${mejor.id}`, { append_to_response: 'credits' })
  const director = detalle?.credits?.crew?.find(c => c.job === 'Director')?.name

  console.log('[TMDB/movie]', { titulo, encontrado: mejor.title, fecha, director })

  return {
    fuente: 'tmdb',
    tipo: 'movie',
    titulo: mejor.title ?? mejor.original_title ?? titulo,
    fechaLanzamiento: fecha.slice(0, 10),
    tmdbId: mejor.id,
    posterUrl: mejor.poster_path ? `${POSTER_BASE}${mejor.poster_path}` : undefined,
    descripcion: mejor.overview || undefined,
    director,
  }
}

export async function buscarSerie(titulo: string): Promise<ResultadoLanzamiento | null> {
  const busqueda = await llamarTmdb<TmdbSearchResponse>('/search/tv', { query: titulo })
  if (!busqueda || busqueda.results.length === 0) return null

  const mejor = elegirMejorResultado(busqueda.results, 'first_air_date')
  if (!mejor) return null

  const detalle = await llamarTmdb<TmdbSerieDetalle>(`/tv/${mejor.id}`)

  // Preferir la fecha del proximo episodio si ya esta emitida
  const fechaProximoEp = detalle?.next_episode_to_air?.air_date
  const fechaPrimera = mejor.first_air_date ?? detalle?.first_air_date
  const fecha = fechaProximoEp ?? fechaPrimera
  if (!fecha) return null

  const temporada = detalle?.next_episode_to_air?.season_number

  console.log('[TMDB/tv]', {
    titulo,
    encontrado: mejor.name,
    fechaProximoEp,
    fecha,
    temporada,
  })

  return {
    fuente: 'tmdb',
    tipo: 'tv',
    titulo: mejor.name ?? mejor.original_name ?? titulo,
    fechaLanzamiento: fecha.slice(0, 10),
    tmdbId: mejor.id,
    posterUrl: mejor.poster_path ? `${POSTER_BASE}${mejor.poster_path}` : undefined,
    descripcion: mejor.overview || undefined,
    temporada,
  }
}

export async function proximaPelicula(franquicia: string): Promise<ResultadoLanzamiento | null> {
  const hoy = new Date().toISOString().slice(0, 10)

  const busqueda = await llamarTmdb<TmdbSearchResponse>('/search/movie', {
    query: franquicia,
    include_adult: 'false',
  })
  if (!busqueda || busqueda.results.length === 0) return null

  const coincidentes = busqueda.results.filter((r) =>
    coincideTitulo(franquicia, r.title ?? r.original_title ?? ''),
  )
  const pool = coincidentes.length > 0 ? coincidentes : busqueda.results

  const futuros = pool
    .filter((r) => r.release_date && r.release_date >= hoy)
    .sort((a, b) => (a.release_date! < b.release_date! ? -1 : 1))
  if (futuros.length === 0) return null

  const mejor = futuros[0]
  const detalle = await llamarTmdb<TmdbMovieDetalle>(`/movie/${mejor.id}`, { append_to_response: 'credits' })
  const director = detalle?.credits?.crew?.find((c) => c.job === 'Director')?.name

  console.log('[TMDB/movie/proximo]', { franquicia, encontrado: mejor.title, fecha: mejor.release_date })

  return {
    fuente: 'tmdb',
    tipo: 'movie',
    titulo: mejor.title ?? mejor.original_title ?? franquicia,
    fechaLanzamiento: mejor.release_date!.slice(0, 10),
    tmdbId: mejor.id,
    posterUrl: mejor.poster_path ? `${POSTER_BASE}${mejor.poster_path}` : undefined,
    descripcion: mejor.overview || undefined,
    director,
  }
}

export async function proximaSerie(franquicia: string): Promise<ResultadoLanzamiento | null> {
  const busqueda = await llamarTmdb<TmdbSearchResponse>('/search/tv', { query: franquicia })
  if (!busqueda || busqueda.results.length === 0) return null

  const coincidentes = busqueda.results.filter((r) =>
    coincideTitulo(franquicia, r.name ?? r.original_name ?? ''),
  )
  const pool = coincidentes.length > 0 ? coincidentes : busqueda.results

  const ordenados = [...pool].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))

  for (const candidato of ordenados.slice(0, 5)) {
    const detalle = await llamarTmdb<TmdbSerieDetalle>(`/tv/${candidato.id}`)
    const fechaProximoEp = detalle?.next_episode_to_air?.air_date
    if (fechaProximoEp) {
      const temporada = detalle?.next_episode_to_air?.season_number
      console.log('[TMDB/tv/proximo]', { franquicia, encontrado: candidato.name, fechaProximoEp, temporada })
      return {
        fuente: 'tmdb',
        tipo: 'tv',
        titulo: candidato.name ?? candidato.original_name ?? franquicia,
        fechaLanzamiento: fechaProximoEp.slice(0, 10),
        tmdbId: candidato.id,
        posterUrl: candidato.poster_path ? `${POSTER_BASE}${candidato.poster_path}` : undefined,
        descripcion: candidato.overview || undefined,
        temporada,
      }
    }
  }

  return null
}
