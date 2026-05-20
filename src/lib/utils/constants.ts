import type { DefinicionCategoria } from '@/types/category.types'

export const CATEGORIAS: DefinicionCategoria[] = [
  {
    slug: 'movies',
    nombre: 'Peliculas',
    icono: 'Film',
    color: '#0A0A0A',
  },
  {
    slug: 'tv',
    nombre: 'Series',
    icono: 'Tv',
    color: '#2563EB',
  },
  {
    slug: 'games',
    nombre: 'Videojuegos',
    icono: 'Gamepad2',
    color: '#16A34A',
  },
  {
    slug: 'music',
    nombre: 'Musica',
    icono: 'Music',
    color: '#DC2626',
  },
  {
    slug: 'books',
    nombre: 'Libros',
    icono: 'BookMarked',
    color: '#7C3AED',
  },
  {
    slug: 'study',
    nombre: 'Estudio',
    icono: 'BookOpen',
    color: '#0284C7',
  },
  {
    slug: 'birthdays',
    nombre: 'Cumpleanos',
    icono: 'Cake',
    color: '#DB2777',
  },
  {
    slug: 'tasks',
    nombre: 'Pendientes',
    icono: 'CheckSquare',
    color: '#D97706',
  },
  {
    slug: 'events',
    nombre: 'Eventos',
    icono: 'MapPin',
    color: '#DC2626',
  },
  {
    slug: 'notes',
    nombre: 'Notas',
    icono: 'StickyNote',
    color: '#6366F1',
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

export const OPCIONES_AUTO_DELETE_TAREAS: { valor: number | null; etiqueta: string }[] = [
  { valor: null, etiqueta: 'Nunca' },
  { valor: 7, etiqueta: 'A los 7 dias' },
  { valor: 30, etiqueta: 'A los 30 dias' },
  { valor: 90, etiqueta: 'A los 90 dias' },
]

export const OPCIONES_ANTICIPACION: { valor: number; etiqueta: string }[] = [
  { valor: 5, etiqueta: '5 minutos antes' },
  { valor: 15, etiqueta: '15 minutos antes' },
  { valor: 30, etiqueta: '30 minutos antes' },
  { valor: 60, etiqueta: '1 hora antes' },
  { valor: 1440, etiqueta: '1 dia antes' },
]

export const SLUGS_LANZAMIENTO = ['movies', 'tv', 'games', 'music', 'books'] as const
export type SlugLanzamiento = (typeof SLUGS_LANZAMIENTO)[number]

export const SLUGS_VALIDOS = ['study', 'birthdays', 'tasks', 'events', 'notes'] as const
export type SlugCategoria = (typeof SLUGS_VALIDOS)[number]

export const HORA_NOTIFICACION_LANZAMIENTO = '06:00'

export const TIPOS_LANZAMIENTO = ['movie', 'tv', 'game', 'album', 'book'] as const
export const FUENTES_LANZAMIENTO = ['tmdb', 'rawg', 'musicbrainz', 'google_books', 'manual'] as const

export const ETIQUETAS_TIPO_LANZAMIENTO: Record<(typeof TIPOS_LANZAMIENTO)[number], string> = {
  movie: 'Pelicula',
  tv: 'Serie',
  game: 'Videojuego',
  album: 'Album',
  book: 'Libro',
}

export const ETIQUETAS_FUENTE_LANZAMIENTO: Record<(typeof FUENTES_LANZAMIENTO)[number], string> = {
  tmdb: 'TMDB',
  rawg: 'RAWG',
  musicbrainz: 'MusicBrainz',
  google_books: 'Google Books',
  manual: 'Manual',
}

export const ETIQUETAS_CATEGORIA: Record<string, string> = Object.fromEntries(
  CATEGORIAS.map((c) => [c.slug, c.nombre]),
)

export const TIPO_LANZAMIENTO_A_SLUG: Record<
  (typeof TIPOS_LANZAMIENTO)[number],
  SlugLanzamiento
> = {
  movie: 'movies',
  tv: 'tv',
  game: 'games',
  album: 'music',
  book: 'books',
}

export const PALETA_LANZAMIENTOS: Record<(typeof TIPOS_LANZAMIENTO)[number], string> = {
  movie: '#0A0A0A',
  tv: '#2563EB',
  game: '#16A34A',
  album: '#DC2626',
  book: '#7C3AED',
}
