import type { TIPOS_LANZAMIENTO, FUENTES_LANZAMIENTO } from '@/lib/utils/constants'

export type TipoLanzamiento = (typeof TIPOS_LANZAMIENTO)[number]
export type FuenteLanzamiento = (typeof FUENTES_LANZAMIENTO)[number]

export interface ResultadoLanzamiento {
  fuente: FuenteLanzamiento
  tipo: TipoLanzamiento
  titulo: string
  fechaLanzamiento: string | null
  tba?: boolean
  tmdbId?: number
  rawgId?: number
  musicbrainzId?: string
  googleBooksId?: string
  posterUrl?: string
  descripcion?: string
  autor?: string
  artista?: string
  plataforma?: string
  director?: string
  temporada?: number
}

export interface MetadatosLanzamiento {
  tipo: TipoLanzamiento
  fuente: FuenteLanzamiento
  fechaEstreno: string
  posterUrl?: string
  rawgId?: number
  musicbrainzId?: string
  googleBooksId?: string
  autor?: string
  artista?: string
  plataforma?: string
  director?: string
  temporada?: number
}
