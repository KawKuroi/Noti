import { buscarPelicula, buscarSerie, proximaPelicula, proximaSerie } from './tmdb.service'
import { buscarJuego, proximoJuego } from './rawg.service'
import { buscarAlbum, proximoAlbum } from './musicbrainz.service'
import { buscarLibro, proximoLibro } from './google-books.service'
import type { ResultadoLanzamiento, TipoLanzamiento } from '@/types/release.types'

const PREFIJOS_INTERROGATIVOS = [
  /^cuando sale\s+/i,
  /^cuando estrena\s+/i,
  /^cuando se estrena\s+/i,
  /^cuando llega\s+/i,
  /^quiero saber la fecha de\s+/i,
  /^quiero la fecha de\s+/i,
  /^fecha de lanzamiento de\s+/i,
  /^when does\s+/i,
  /^when is\s+/i,
  /^release date of\s+/i,
]

const PALABRAS_RELLENO = [
  /\b(el|la|los|las)\s+(nuevo|nueva|nuevos|nuevas|proximo|proxima|proximos|proximas|ultimo|ultima|ultimos|ultimas)\s+/gi,
  /\b(nuevo|nueva|nuevos|nuevas|proximo|proxima|proximos|proximas|ultimo|ultima|ultimos|ultimas)\s+/gi,
  /^del?\s+/i,
]

export function limpiarTitulo(titulo: string): string {
  let limpio = titulo.trim()
  for (const regex of PREFIJOS_INTERROGATIVOS) {
    limpio = limpio.replace(regex, '')
  }
  for (const regex of PALABRAS_RELLENO) {
    limpio = limpio.replace(regex, ' ')
  }
  return limpio.replace(/\s+/g, ' ').trim()
}

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
      console.log('[release-search]', {
        titulo: tituloLimpio,
        tipo,
        fuente: resultado.fuente,
        encontrado: true,
        tba: resultado.tba ?? false,
      })
      return resultado
    }
  }

  console.log('[release-search]', { titulo: tituloLimpio, tipo, encontrado: false })
  return null
}

export async function buscarProximoLanzamiento(
  tipo: TipoLanzamiento,
  contexto: string,
): Promise<ResultadoLanzamiento | null> {
  const limpio = limpiarTitulo(contexto)
  if (!limpio) return null

  let resultado: ResultadoLanzamiento | null = null
  switch (tipo) {
    case 'movie':
      resultado = await proximaPelicula(limpio)
      break
    case 'tv':
      resultado = await proximaSerie(limpio)
      break
    case 'game':
      resultado = await proximoJuego(limpio)
      break
    case 'album':
      resultado = await proximoAlbum(limpio)
      break
    case 'book':
      resultado = await proximoLibro(limpio)
      break
  }

  console.log('[release-search:proximo]', {
    contexto: limpio,
    tipo,
    encontrado: !!resultado,
    tba: resultado?.tba ?? false,
  })

  return resultado
}
