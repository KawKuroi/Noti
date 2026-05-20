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
      categoriaSlug: z.enum(['birthdays', 'study', 'tasks', 'events', 'notes']),
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
      fechaTentativa: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .nullable(),
    })
    .nullable(),
  aclaracion: z.string().nullable(),
})

export type Extraccion = z.infer<typeof esquemaExtraccion>

const PROMPT = `Eres un clasificador estructurado para una app de recordatorios. Tu unica tarea es leer el texto del usuario y devolver un objeto JSON con la intencion y los datos extraidos. NUNCA inventes fechas ni horas: si no estan claras, devuelve null.

Las cuatro intenciones posibles:

1) recordatorio_personal — el usuario quiere agendar algo personal (cumpleanos, clases, tareas, eventos, citas, notas). Llena el campo "recordatorio".
   - categoriaSlug debe ser uno de: birthdays | study | tasks | events | notes
   - Si la fecha es relativa ("manana", "el viernes", "la proxima semana"), calculala a partir de la fecha actual.
   - Si la fecha viene en formato natural corto ("nov 19", "20/06", "3 mar", "19 de noviembre", "viernes 21"), conviertela a YYYY-MM-DD. Si el dia ya paso este ano, usa el proximo ano disponible.
   - HORA (horaVencimiento): si el texto contiene una hora explicita, conviertela a formato 24h "HH:mm". Ejemplos:
       "5am" → "05:00"
       "5:30 am" → "05:30"
       "a las 3 de la tarde" → "15:00"
       "8pm" → "20:00"
       "21:30" → "21:30"
       "medianoche" → "00:00"
       "mediodia" → "12:00"
       "noche" sin numero → null (impreciso)
       "manana temprano" sin numero → null
     Si NO hay senal explicita de hora, horaVencimiento=null. NUNCA inventes una hora por defecto.
   - Para cumpleanos y aniversarios CON FECHA mencionada: esRecurrente=true, reglaRecurrencia="yearly:DD-MM", fechaVencimiento=proximo aniversario (este año si aun no paso, sino el siguiente).
   - Para clases o eventos semanales: esRecurrente=true, reglaRecurrencia="weekly:1,3" (dias ISO numericos: lunes=1, martes=2, miercoles=3, jueves=4, viernes=5, sabado=6, domingo=7). Ejemplo: lunes y miercoles → "weekly:1,3". OBLIGATORIO: fechaVencimiento DEBE ser la proxima fecha futura (incluyendo hoy si aun no pasa la hora) que caiga en el primer dia listado. NUNCA dejes fechaVencimiento=null si la regla es semanal.
   - Para notas sin fecha: categoriaSlug="notes", fechaVencimiento=null.
   - Si NO mencionan fecha y NO es nota (ej: "cumpleanos de pardo" sin fecha): fechaVencimiento=null, esRecurrente=false. El usuario rellenara la fecha manualmente despues.

2) lanzamiento_especifico — el usuario menciona un TITULO concreto de pelicula, serie, videojuego, album o libro ("GTA 6", "Avatar 4", "Stranger Things temporada 5", "Dune Messiah"). Llena el campo "lanzamiento" con titulo y tipo.
   - tipo: movie | tv | game | album | book. Si no estas seguro, deja tipo=null y la app buscara en todas las fuentes.
   - titulo: el nombre del lanzamiento, limpio de frases interrogativas y SIN la fecha si aparece pegada al titulo.
   - artista: para albums/libros, nombre del artista o autor si el usuario lo da.
   - fechaTentativa: si el texto contiene una fecha natural ("nov 19", "20/06", "3 mar", "19 de noviembre"), conviertela a YYYY-MM-DD y devuelvela aqui. Si el dia ya paso este ano, usa el proximo ano disponible (suma 1 al ano). Si NO hay senal de fecha, deja fechaTentativa=null. Ejemplo: "Lanzamiento de GTA 6 nov 19" -> titulo="GTA 6", fechaTentativa="<ano>-11-19".

3) lanzamiento_generico — el usuario pregunta por el proximo lanzamiento de una FRANQUICIA o ARTISTA sin titulo especifico ("nuevo album de The Weeknd", "proximo Zelda", "ultimo libro de Sanderson"). Llena "lanzamiento" con tipo y contexto.
   - contexto: la franquicia o artista.
   - titulo: null.
   - fechaTentativa: misma regla que en lanzamiento_especifico. Por defecto null.

4) desconocido — texto vago o no clasificable. Llena solo "aclaracion" con una pregunta corta en espanol para que el usuario aclare.

Reglas de oro:
- Solo llena el sub-objeto correspondiente a la intencion. Los demas en null.
- NUNCA inventes fechas ni horas. Si no hay senal explicita, devuelve null en ese campo.
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
