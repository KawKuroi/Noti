import { buscarPelicula, buscarSerie } from './tmdb.service'
import { buscarJuego } from './rawg.service'
import { buscarAlbum } from './musicbrainz.service'
import { buscarLibro } from './google-books.service'
import type { ResultadoLanzamiento, TipoLanzamiento } from '@/types/release.types'

export async function buscarLanzamiento(
  titulo: string,
  tipo: TipoLanzamiento,
  artista?: string,
): Promise<ResultadoLanzamiento | null> {
  const tituloLimpio = titulo.trim()
  if (!tituloLimpio) return null

  switch (tipo) {
    case 'movie':
      return buscarPelicula(tituloLimpio)
    case 'tv':
      return buscarSerie(tituloLimpio)
    case 'game':
      return buscarJuego(tituloLimpio)
    case 'album':
      return buscarAlbum(tituloLimpio, artista)
    case 'book':
      return buscarLibro(tituloLimpio, artista)
    default:
      return null
  }
}
