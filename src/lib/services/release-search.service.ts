import { buscarPelicula, buscarSerie } from './tmdb.service'
import { buscarJuego } from './rawg.service'
import { buscarAlbum } from './musicbrainz.service'
import { buscarLibro } from './google-books.service'
import type { ResultadoLanzamiento, TipoLanzamiento } from '@/types/release.types'

// Frases interrogativas y relleno en espanol e ingles que el modelo puede pasar como titulo
const PREFIJOS_INTERROGATIVOS = [
  /^cuando sale\s+/i,
  /^cuando estrena\s+/i,
  /^cuando se estrena\s+/i,
  /^cuando llega\s+/i,
  /^quiero saber la fecha de\s+/i,
  /^quiero la fecha de\s+/i,
  /^fecha de lanzamiento de\s+/i,
  /^nuevo\s+/i,
  /^nueva\s+/i,
  /^ultimo\s+/i,
  /^ultima\s+/i,
  /^when does\s+/i,
  /^when is\s+/i,
  /^release date of\s+/i,
]

export function limpiarTitulo(titulo: string): string {
  let limpio = titulo.trim()
  for (const regex of PREFIJOS_INTERROGATIVOS) {
    limpio = limpio.replace(regex, '')
  }
  return limpio.trim()
}

// Mapa de tipos a funciones de busqueda para cross-source fallback
type BusquedaFn = (titulo: string, artista?: string) => Promise<ResultadoLanzamiento | null>

const FUENTES_POR_TIPO: Record<TipoLanzamiento, BusquedaFn[]> = {
  movie: [buscarPelicula, (t) => buscarSerie(t)],
  tv: [buscarSerie, (t) => buscarPelicula(t)],
  game: [buscarJuego],
  album: [buscarAlbum],
  book: [buscarLibro],
}

export async function buscarLanzamiento(
  titulo: string,
  tipo: TipoLanzamiento,
  artista?: string,
): Promise<ResultadoLanzamiento | null> {
  const tituloLimpio = limpiarTitulo(titulo)
  if (!tituloLimpio) return null

  const fuentes = FUENTES_POR_TIPO[tipo] ?? []

  for (const fn of fuentes) {
    const resultado = await fn(tituloLimpio, artista)
    if (resultado) {
      console.log('[release-search]', { titulo: tituloLimpio, tipo, fuente: resultado.fuente, encontrado: true })
      return resultado
    }
  }

  console.log('[release-search]', { titulo: tituloLimpio, tipo, encontrado: false })
  return null
}
