export type Prioridad = 'baja' | 'media' | 'alta'

export interface MetadatosTareas {
  prioridad: Prioridad
}

export interface MetadatosCumpleanos {
  edad?: number
}

export interface MetadatosEventos {
  ubicacion?: string
}

export interface MetadatosEstudio {
  duracionMin?: number
}

export interface MetadatosPelicula {
  posterPath?: string
  fechaEstreno?: string
}

export type MetadatosPorSlug = {
  tasks: MetadatosTareas
  birthdays: MetadatosCumpleanos
  events: MetadatosEventos
  study: MetadatosEstudio
  movies: MetadatosPelicula
}

export interface Recordatorio {
  id: string
  usuarioId: string
  categoriaId: number
  titulo: string
  descripcion: string | null
  fechaVencimiento: Date | null
  notificarEn: Date | null
  esRecurrente: boolean
  reglaRecurrencia: string | null
  estaCompletado: boolean
  completadoEn: Date | null
  tmdbId: number | null
  metadatos: Record<string, unknown> | null
  creadoEn: Date
  actualizadoEn: Date
}

export interface EntradaFormularioRecordatorio {
  titulo: string
  descripcion?: string
  categoriaId: number
  fechaVencimiento: string // ISO string del input date
  horaVencimiento?: string // "HH:mm" solo si tiene hora
  notificarEn?: string // ISO string
  esRecurrente: boolean
  reglaRecurrencia?: string
  metadatos?: Record<string, unknown>
}

export interface EstadoAccionRecordatorio {
  ok: boolean
  error?: string | Record<string, string[]>
  data?: Recordatorio
}
