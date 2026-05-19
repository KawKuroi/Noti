import { tool } from 'ai'
import { z } from 'zod'
import { buscarLanzamiento as buscarLanzamientoServicio } from '@/lib/services/release-search.service'
import { crearRecordatorioLanzamiento } from '@/lib/actions/reminder.actions'
import { TIPOS_LANZAMIENTO, FUENTES_LANZAMIENTO } from '@/lib/utils/constants'

const tipoSchema = z.enum(TIPOS_LANZAMIENTO)
const fuenteSchema = z.enum(FUENTES_LANZAMIENTO)

export const buscarLanzamientoTool = tool({
  description:
    'Busca la fecha de lanzamiento real de una pelicula, serie, videojuego, album o libro consultando fuentes verificadas (TMDB, RAWG, MusicBrainz, Google Books). Devuelve null si no encuentra resultado. NUNCA inventes la fecha.',
  inputSchema: z.object({
    titulo: z.string().min(1).describe('Titulo del lanzamiento a buscar'),
    tipo: tipoSchema.describe(
      'Tipo de lanzamiento: movie (pelicula), tv (serie), game (videojuego), album (album musical), book (libro)',
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

export const pedirFechaManualTool = tool({
  description:
    'Llama a esta herramienta cuando buscarLanzamiento devuelve encontrado=false. Solicita al usuario que ingrese la fecha de lanzamiento manualmente porque la fuente no la tiene. NUNCA inventes la fecha tu mismo.',
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
    'Crea el recordatorio del lanzamiento en el calendario del usuario. La notificacion se envia automaticamente a las 06:00 del dia del lanzamiento. Solo llama a esta herramienta DESPUES de que el usuario haya confirmado explicitamente que quiere agregarlo.',
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

export const herramientasLanzamientos = {
  buscarLanzamiento: buscarLanzamientoTool,
  pedirFechaManual: pedirFechaManualTool,
  agregarRecordatorio: agregarRecordatorioTool,
} as const
