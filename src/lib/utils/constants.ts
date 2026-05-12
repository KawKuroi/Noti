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
