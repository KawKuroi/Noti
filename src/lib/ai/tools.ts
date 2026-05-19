import { tool } from 'ai'
import { z } from 'zod'
import {
  buscarLanzamiento as buscarLanzamientoServicio,
  buscarProximoLanzamiento as buscarProximoLanzamientoServicio,
} from '@/lib/services/release-search.service'
import {
  crearRecordatorioLanzamiento,
  crearRecordatorioDesdeIA,
} from '@/lib/actions/reminder.actions'
import { TIPOS_LANZAMIENTO, FUENTES_LANZAMIENTO } from '@/lib/utils/constants'

const tipoSchema = z.enum(TIPOS_LANZAMIENTO)
const fuenteSchema = z.enum(FUENTES_LANZAMIENTO)

const categoriaPersonalSchema = z.enum([
  'birthdays',
  'study',
  'classes',
  'tasks',
  'events',
  'notes',
])

export const buscarLanzamientoTool = tool({
  description:
    'Busca la fecha de lanzamiento real de una pelicula, serie, videojuego, album o libro consultando fuentes verificadas (TMDB, RAWG, MusicBrainz, Google Books). Usa esta tool cuando el usuario menciona un TITULO ESPECIFICO de un lanzamiento (ej: "GTA 6", "Avatar 4", "Dune Messiah"). Devuelve encontrado=false si no hay resultado. NUNCA inventes la fecha.',
  inputSchema: z.object({
    titulo: z.string().min(1).describe('Titulo del lanzamiento a buscar, sin frases interrogativas'),
    tipo: tipoSchema.describe(
      'Tipo: movie (pelicula), tv (serie), game (videojuego), album (album musical), book (libro)',
    ),
    artista: z
      .string()
      .nullable()
      .describe(
        'Para tipo album: nombre del artista o banda. Para tipo book: nombre del autor. Ayuda a desambiguar.',
      ),
  }),
  execute: async ({ titulo, tipo, artista }) => {
    const resultado = await buscarLanzamientoServicio(titulo, tipo, artista ?? undefined)
    if (!resultado) {
      return { encontrado: false as const }
    }
    return { encontrado: true as const, ...resultado }
  },
})

export const buscarProximoLanzamientoTool = tool({
  description:
    'Busca el PROXIMO lanzamiento futuro de una franquicia, saga, artista o autor cuando el usuario NO especifica un titulo concreto (ej: "nuevo album de The Weeknd", "proximo Zelda", "nuevo libro de Sanderson"). Devuelve el resultado con la misma forma que buscarLanzamiento. NUNCA inventes la fecha.',
  inputSchema: z.object({
    tipo: tipoSchema.describe('Tipo de lanzamiento deducido del contexto'),
    contexto: z
      .string()
      .min(1)
      .describe('Franquicia, saga, artista o autor (ej: "Zelda", "The Weeknd", "Sanderson")'),
    esFranquicia: z
      .boolean()
      .describe('true si el contexto es una franquicia/saga, false si es persona/artista/autor'),
  }),
  execute: async ({ tipo, contexto }) => {
    const resultado = await buscarProximoLanzamientoServicio(tipo, contexto)
    if (!resultado) {
      return { encontrado: false as const }
    }
    return { encontrado: true as const, ...resultado }
  },
})

export const pedirFechaManualTool = tool({
  description:
    'Llama a esta herramienta cuando buscarLanzamiento o buscarProximoLanzamiento devuelven encontrado=false. Solicita al usuario que ingrese la fecha de lanzamiento manualmente. NUNCA inventes la fecha tu mismo.',
  inputSchema: z.object({
    titulo: z.string().min(1).describe('Titulo del lanzamiento que el usuario buscaba'),
    tipo: tipoSchema.describe('Tipo de lanzamiento deducido del contexto'),
    motivo: z
      .string()
      .optional()
      .describe('Razon breve por la que no se encontro la fecha (opcional)'),
  }),
  execute: async ({ titulo, tipo, motivo }) => {
    return {
      requiereFechaManual: true as const,
      titulo,
      tipo,
      motivo: motivo ?? 'No se encontro la fecha en las fuentes consultadas.',
    }
  },
})

const inputAgregarSchema = z.object({
  titulo: z.string().min(1),
  tipo: tipoSchema,
  fechaLanzamiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato esperado YYYY-MM-DD'),
  fuente: fuenteSchema,
  tmdbId: z.number().int().optional(),
  rawgId: z.number().int().optional(),
  musicbrainzId: z.string().optional(),
  googleBooksId: z.string().optional(),
  posterUrl: z.string().url().optional(),
  descripcion: z.string().optional(),
  autor: z.string().optional(),
  artista: z.string().optional(),
  plataforma: z.string().optional(),
  director: z.string().optional(),
  temporada: z.number().int().optional(),
})

export const agregarRecordatorioTool = tool({
  description:
    'Crea el recordatorio del lanzamiento en el calendario del usuario. La notificacion se envia automaticamente a las 06:00 del dia del lanzamiento. Solo llama a esta herramienta DESPUES de que el usuario haya confirmado explicitamente que quiere agregarlo. Si la fecha original era tentativa (tba), usa la fecha confirmada por el usuario y fuente="manual".',
  inputSchema: inputAgregarSchema,
  execute: async (input) => {
    const resultado = await crearRecordatorioLanzamiento(input)
    if (!resultado.ok) {
      return {
        agregado: false as const,
        error: typeof resultado.error === 'string' ? resultado.error : 'No se pudo agregar',
      }
    }
    return {
      agregado: true as const,
      titulo: input.titulo,
      fechaLanzamiento: input.fechaLanzamiento,
      tipo: input.tipo,
      fuente: input.fuente,
    }
  },
})

export const crearRecordatorioSimpleTool = tool({
  description:
    'Crea un recordatorio PERSONAL del usuario sin consultar APIs externas. Usa esta tool cuando el usuario pide agendar cosas como cumpleanos, clases, tareas, citas, eventos personales o notas. NO la uses para lanzamientos de entretenimiento (peliculas, series, juegos, albumes, libros) — esos van por buscarLanzamiento. Solo llama a esta tool DESPUES de que el usuario haya confirmado.',
  inputSchema: z.object({
    titulo: z.string().min(1).describe('Titulo corto del recordatorio'),
    categoriaSlug: categoriaPersonalSchema.describe(
      'Categoria: birthdays (cumpleanos), study (estudio), classes (clase/horario), tasks (tarea/pendiente), events (evento), notes (nota sin fecha)',
    ),
    fechaVencimiento: z
      .string()
      .nullable()
      .describe('Fecha YYYY-MM-DD. Puede ser null solo para notas sin fecha.'),
    horaVencimiento: z
      .string()
      .nullable()
      .describe('Hora HH:mm en formato 24h. Null si no aplica.'),
    esRecurrente: z.boolean().describe('true si el recordatorio se repite'),
    reglaRecurrencia: z
      .string()
      .nullable()
      .describe(
        'Regla de recurrencia. weekly:MON,WED,FRI para semanal en esos dias. yearly:DD-MM para anual. null si no es recurrente.',
      ),
    descripcion: z.string().nullable().describe('Descripcion adicional opcional'),
  }),
  execute: async (input) => {
    const resultado = await crearRecordatorioDesdeIA({
      titulo: input.titulo,
      categoriaSlug: input.categoriaSlug,
      fechaVencimiento: input.fechaVencimiento,
      horaVencimiento: input.horaVencimiento,
      esRecurrente: input.esRecurrente,
      reglaRecurrencia: input.reglaRecurrencia,
      descripcion: input.descripcion,
    })
    if (!resultado.ok) {
      return {
        agregado: false as const,
        error: typeof resultado.error === 'string' ? resultado.error : 'No se pudo crear',
      }
    }
    return {
      agregado: true as const,
      titulo: input.titulo,
      categoriaSlug: input.categoriaSlug,
      fechaVencimiento: input.fechaVencimiento,
    }
  },
})

export const herramientasUnificadas = {
  buscarLanzamiento: buscarLanzamientoTool,
  buscarProximoLanzamiento: buscarProximoLanzamientoTool,
  pedirFechaManual: pedirFechaManualTool,
  agregarRecordatorio: agregarRecordatorioTool,
  crearRecordatorioSimple: crearRecordatorioSimpleTool,
} as const

export const herramientasLanzamientos = herramientasUnificadas
