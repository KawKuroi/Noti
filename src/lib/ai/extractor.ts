import { generateObject, NoObjectGeneratedError } from 'ai'
import { groq } from '@ai-sdk/groq'
import { z } from 'zod'
import { TIPOS_LANZAMIENTO } from '@/lib/utils/constants'

export const esquemaExtraccion = z.object({
  intencion: z.enum([
    'recordatorio_personal',
    'lanzamiento_especifico',
    'lanzamiento_generico',
    'desconocido',
  ]),
  recordatorio: z
    .object({
      titulo: z.string(),
      categoriaSlug: z.enum(['birthdays', 'study', 'classes', 'tasks', 'events', 'notes']),
      fechaVencimiento: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .nullable(),
      horaVencimiento: z
        .string()
        .regex(/^\d{2}:\d{2}$/)
        .nullable(),
      esRecurrente: z.boolean(),
      reglaRecurrencia: z.string().nullable(),
      descripcion: z.string().nullable(),
    })
    .nullable(),
  lanzamiento: z
    .object({
      tipo: z.enum(TIPOS_LANZAMIENTO).nullable(),
      titulo: z.string().nullable(),
      contexto: z.string().nullable(),
      artista: z.string().nullable(),
    })
    .nullable(),
  aclaracion: z.string().nullable(),
})

export type Extraccion = z.infer<typeof esquemaExtraccion>

const PROMPT = `Eres un clasificador estructurado para una app de recordatorios. Tu unica tarea es leer el texto del usuario y devolver un objeto JSON con la intencion y los datos extraidos. NUNCA inventes fechas: si la fecha no esta clara, devuelve null.

Las cuatro intenciones posibles:

1) recordatorio_personal — el usuario quiere agendar algo personal (cumpleanos, clases, tareas, eventos, citas, notas). Llena el campo "recordatorio".
   - categoriaSlug debe ser uno de: birthdays | study | classes | tasks | events | notes
   - Si la fecha es relativa ("manana", "el viernes", "la proxima semana"), calculala a partir de la fecha actual.
   - Para cumpleanos y aniversarios CON FECHA mencionada: esRecurrente=true, reglaRecurrencia="yearly:DD-MM", fechaVencimiento=proximo aniversario (este año si aun no paso, sino el siguiente).
   - Para clases o eventos semanales: esRecurrente=true, reglaRecurrencia="weekly:MON,WED" (dias en ingles abreviado, lunes=MON, martes=TUE, miercoles=WED, jueves=THU, viernes=FRI, sabado=SAT, domingo=SUN). OBLIGATORIO: fechaVencimiento DEBE ser la proxima fecha futura (incluyendo hoy si aun no pasa la hora) que caiga en el primer dia listado. NUNCA dejes fechaVencimiento=null si la regla es semanal.
   - Para notas sin fecha: categoriaSlug="notes", fechaVencimiento=null.
   - Si NO mencionan fecha y NO es nota (ej: "cumpleanos de pardo" sin fecha): fechaVencimiento=null, esRecurrente=false. El usuario rellenara la fecha manualmente despues.

2) lanzamiento_especifico — el usuario menciona un TITULO concreto de pelicula, serie, videojuego, album o libro ("GTA 6", "Avatar 4", "Stranger Things temporada 5", "Dune Messiah"). Llena el campo "lanzamiento" con titulo y tipo.
   - tipo: movie | tv | game | album | book. Si no estas seguro, deja tipo=null y la app buscara en todas las fuentes.
   - titulo: el nombre del lanzamiento, limpio de frases interrogativas.
   - artista: para albums/libros, nombre del artista o autor si el usuario lo da.

3) lanzamiento_generico — el usuario pregunta por el proximo lanzamiento de una FRANQUICIA o ARTISTA sin titulo especifico ("nuevo album de The Weeknd", "proximo Zelda", "ultimo libro de Sanderson"). Llena "lanzamiento" con tipo y contexto.
   - contexto: la franquicia o artista.
   - titulo: null.

4) desconocido — texto vago o no clasificable. Llena solo "aclaracion" con una pregunta corta en espanol para que el usuario aclare.

Reglas de oro:
- Solo llena el sub-objeto correspondiente a la intencion. Los demas en null.
- NUNCA inventes fechas. Si no hay senal de fecha, fechaVencimiento=null.
- Para fechas relativas, usa la fecha actual provista.
- Devuelve siempre todos los campos del schema, usando null cuando no apliquen.`

interface OpcionesExtraccion {
  texto: string
  fechaHoy: string
}

export async function extraerIntencion({ texto, fechaHoy }: OpcionesExtraccion): Promise<
  | { ok: true; extraccion: Extraccion }
  | { ok: false; error: string }
> {
  try {
    const { object } = await generateObject({
      model: groq('openai/gpt-oss-120b'),
      schema: esquemaExtraccion,
      prompt: `${PROMPT}

Fecha actual: ${fechaHoy}
Texto del usuario: ${texto.trim()}`,
    })

    return { ok: true, extraccion: object }
  } catch (error) {
    console.error('[ai/extractor]', error)
    if (NoObjectGeneratedError.isInstance(error)) {
      return {
        ok: false,
        error: 'No pude entender el texto. Se mas especifico.',
      }
    }
    return {
      ok: false,
      error: 'El asistente no pudo procesar la solicitud.',
    }
  }
}
