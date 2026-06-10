import { z } from 'zod'

const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

export const esquemaMetadatosClases = z
  .object({
    horaInicio: z.string().regex(horaRegex, 'Formato HH:mm requerido'),
    horaFin: z.string().regex(horaRegex, 'Formato HH:mm requerido'),
    aula: z.string().max(100).optional(),
  })
  .refine((d) => d.horaFin > d.horaInicio, {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['horaFin'],
  })

export const esquemaMetadatosTareas = z.object({
  prioridad: z.enum(['baja', 'media', 'alta']),
})

export const esquemaMetadatosCumpleanos = z.object({
  edad: z.coerce.number().int().min(0).max(150).optional(),
})

export const esquemaMetadatosEventos = z.object({
  ubicacion: z.string().max(200).optional(),
})

export const esquemaMetadatosEstudio = z.object({
  duracionMin: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
    z.number().int().min(1).max(480).optional(),
  ),
})

const tipoLanzamientoOpcional = z
  .preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : v),
    z.enum(['movie', 'tv', 'game', 'album', 'book']).optional(),
  )

export const esquemaMetadatosPelicula = z.object({
  tipo: tipoLanzamientoOpcional,
  director: z.string().max(120).optional(),
  posterPath: z.string().optional(),
  fechaEstreno: z.string().optional(),
})

export const esquemaMetadatosSerie = z.object({
  tipo: tipoLanzamientoOpcional,
  director: z.string().max(120).optional(),
  plataforma: z.string().max(80).optional(),
  temporada: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
    z.number().int().min(1).max(99).optional(),
  ),
})

export const esquemaMetadatosJuego = z.object({
  tipo: tipoLanzamientoOpcional,
  plataforma: z.string().max(80).optional(),
  desarrolladora: z.string().max(120).optional(),
})

export const esquemaMetadatosMusica = z.object({
  tipo: tipoLanzamientoOpcional,
  artista: z.string().max(120).optional(),
})

export const esquemaMetadatosLibros = z.object({
  tipo: tipoLanzamientoOpcional,
  autor: z.string().max(120).optional(),
  editorial: z.string().max(120).optional(),
})

export const esquemaMetadatosNotas = z.object({
  recordarme: z
    .string()
    .transform((v) => v === 'true')
    .or(z.boolean())
    .default(false),
})

const esquemasMetadatosPorSlug = {
  tasks: esquemaMetadatosTareas,
  birthdays: esquemaMetadatosCumpleanos,
  events: esquemaMetadatosEventos,
  study: esquemaMetadatosEstudio,
  movies: esquemaMetadatosPelicula,
  tv: esquemaMetadatosSerie,
  games: esquemaMetadatosJuego,
  music: esquemaMetadatosMusica,
  books: esquemaMetadatosLibros,
  notes: esquemaMetadatosNotas,
} as const

export type SlugConSchema = keyof typeof esquemasMetadatosPorSlug

// Schema base para todos los recordatorios
export const esquemaRecordatorioBase = z
  .object({
    titulo: z.string().min(1, 'El titulo es requerido').max(100, 'Maximo 100 caracteres'),
    descripcion: z.string().max(500, 'Maximo 500 caracteres').optional(),
    categoriaId: z.coerce.number().int().positive('Categoria requerida'),
    fechaVencimiento: z.string().min(1, 'La fecha es requerida'),
    horaVencimiento: z.preprocess(
      (v) => (v === '' ? undefined : v),
      z.string().regex(horaRegex, 'Formato HH:mm requerido').optional(),
    ),
    esRecurrente: z
      .string()
      .transform((v) => v === 'true')
      .or(z.boolean())
      .default(false),
    reglaRecurrencia: z.string().optional(),
  })

// Para notas: fecha opcional y descripcion con limite mayor (es el cuerpo)
export const esquemaRecordatorioBaseNotas = esquemaRecordatorioBase.extend({
  fechaVencimiento: z.string().optional().default(''),
  descripcion: z.string().max(10000, 'Maximo 10000 caracteres').optional(),
})

export function obtenerEsquemaMetadatos(slug: string) {
  return esquemasMetadatosPorSlug[slug as SlugConSchema] ?? z.looseObject({})
}

export function validarRecordatorio(slug: string, datos: FormData | Record<string, unknown>) {
  const raw = datos instanceof FormData ? Object.fromEntries(datos.entries()) : datos
  const esquemaBase = slug === 'notes' ? esquemaRecordatorioBaseNotas : esquemaRecordatorioBase
  const baseResult = esquemaBase.safeParse(raw)

  if (!baseResult.success) {
    return { ok: false as const, errores: baseResult.error.flatten().fieldErrors }
  }

  const metadatosRaw: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(raw)) {
    if (key.startsWith('meta_')) {
      metadatosRaw[key.slice(5)] = value
    }
  }

  const esquemaMeta = obtenerEsquemaMetadatos(slug)
  const metaResult = esquemaMeta.safeParse(metadatosRaw)

  if (!metaResult.success) {
    return { ok: false as const, errores: metaResult.error.flatten().fieldErrors }
  }

  return {
    ok: true as const,
    datos: baseResult.data,
    metadatos: metaResult.data as Record<string, unknown>,
  }
}
