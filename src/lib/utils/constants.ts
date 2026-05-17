import type { DefinicionCategoria } from '@/types/category.types'

export const CATEGORIAS: DefinicionCategoria[] = [
  {
    slug: 'movies',
    nombre: 'Peliculas y series',
    icono: 'Film',
    color: '#7C3AED',
  },
  {
    slug: 'study',
    nombre: 'Estudio',
    icono: 'BookOpen',
    color: '#0284C7',
  },
  {
    slug: 'classes',
    nombre: 'Clases',
    icono: 'CalendarDays',
    color: '#059669',
  },
  {
    slug: 'birthdays',
    nombre: 'Cumpleanos',
    icono: 'Cake',
    color: '#DB2777',
  },
  {
    slug: 'tasks',
    nombre: 'Tareas',
    icono: 'CheckSquare',
    color: '#D97706',
  },
  {
    slug: 'events',
    nombre: 'Eventos',
    icono: 'MapPin',
    color: '#DC2626',
  },
]

export const ZONA_HORARIA_DEFECTO = 'America/Bogota'
export const ANTICIPACION_DEFECTO = 15

export const PRIORIDADES: { valor: string; etiqueta: string }[] = [
  { valor: 'baja', etiqueta: 'Baja' },
  { valor: 'media', etiqueta: 'Media' },
  { valor: 'alta', etiqueta: 'Alta' },
]

export const DIAS_SEMANA: { valor: number; etiqueta: string; corto: string }[] = [
  { valor: 1, etiqueta: 'Lunes', corto: 'Lun' },
  { valor: 2, etiqueta: 'Martes', corto: 'Mar' },
  { valor: 3, etiqueta: 'Miercoles', corto: 'Mie' },
  { valor: 4, etiqueta: 'Jueves', corto: 'Jue' },
  { valor: 5, etiqueta: 'Viernes', corto: 'Vie' },
  { valor: 6, etiqueta: 'Sabado', corto: 'Sab' },
  { valor: 7, etiqueta: 'Domingo', corto: 'Dom' },
]

export const OPCIONES_ANTICIPACION: { valor: number; etiqueta: string }[] = [
  { valor: 5, etiqueta: '5 minutos antes' },
  { valor: 15, etiqueta: '15 minutos antes' },
  { valor: 30, etiqueta: '30 minutos antes' },
  { valor: 60, etiqueta: '1 hora antes' },
  { valor: 1440, etiqueta: '1 dia antes' },
]

export const SLUGS_VALIDOS = ['movies', 'study', 'classes', 'birthdays', 'tasks', 'events'] as const
export type SlugCategoria = (typeof SLUGS_VALIDOS)[number]

export const HORA_NOTIFICACION_LANZAMIENTO = '06:00'

export const TIPOS_LANZAMIENTO = ['movie', 'tv', 'game', 'album'] as const
export const FUENTES_LANZAMIENTO = ['tmdb', 'rawg', 'musicbrainz', 'manual'] as const

export const ETIQUETAS_TIPO_LANZAMIENTO: Record<(typeof TIPOS_LANZAMIENTO)[number], string> = {
  movie: 'Pelicula',
  tv: 'Serie',
  game: 'Videojuego',
  album: 'Album',
}

export const ETIQUETAS_FUENTE_LANZAMIENTO: Record<(typeof FUENTES_LANZAMIENTO)[number], string> = {
  tmdb: 'TMDB',
  rawg: 'RAWG',
  musicbrainz: 'MusicBrainz',
  manual: 'Manual',
}
