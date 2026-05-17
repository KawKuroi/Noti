import { generateObject, NoObjectGeneratedError } from 'ai'
import { groq } from '@ai-sdk/groq'
import { z } from 'zod'
import { obtenerUsuario } from '@/lib/auth'
import { verificarLimite } from '@/lib/utils/rate-limit'
import { SLUGS_VALIDOS } from '@/lib/utils/constants'

export const maxDuration = 30

const esquemaRecordatorioIA = z.object({
  titulo: z.string().describe('Titulo descriptivo del recordatorio'),
  categoriaSlug: z.enum(SLUGS_VALIDOS).describe(
    'Categoria: movies=peliculas/series/videojuegos/musica, study=estudio/leer, classes=clases/cursos, birthdays=cumpleanos/aniversarios, tasks=tareas/pendientes/compras, events=eventos/citas/reuniones',
  ),
  fechaVencimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Fecha en formato YYYY-MM-DD'),
  horaVencimiento: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable()
    .describe('Hora en formato HH:MM si se menciona, sino null'),
  descripcion: z
    .string()
    .nullable()
    .describe('Detalle adicional si el usuario lo menciono, sino null'),
  esRecurrente: z.boolean().describe('True si el recordatorio se repite periodicamente'),
  reglaRecurrencia: z
    .string()
    .nullable()
    .describe(
      'Regla RRULE si esRecurrente=true (ej: RRULE:FREQ=WEEKLY;BYDAY=MO para cada lunes, RRULE:FREQ=YEARLY para anual). Si no es recurrente, null.',
    ),
})

export async function POST(req: Request) {
  const usuario = await obtenerUsuario()
  if (!usuario) return new Response('No autenticado', { status: 401 })

  const limite = verificarLimite(`ai-recordatorio:${usuario.id}`, 20, 60_000)
  if (!limite.ok) {
    return new Response('Demasiadas peticiones', {
      status: 429,
      headers: { 'Retry-After': String(limite.retryAfter ?? 60) },
    })
  }

  if (!process.env.GROQ_API_KEY) {
    return Response.json({ error: 'GROQ_API_KEY no configurada' }, { status: 500 })
  }

  const { texto, fechaHoy } = await req.json()

  if (!texto || typeof texto !== 'string' || texto.trim().length < 3) {
    return Response.json({ error: 'Texto demasiado corto' }, { status: 400 })
  }

  try {
    const { object } = await generateObject({
      model: groq('openai/gpt-oss-20b'),
      schema: esquemaRecordatorioIA,
      prompt: `Fecha actual: ${fechaHoy ?? new Date().toISOString().split('T')[0]}

Extrae los datos del siguiente recordatorio en lenguaje natural y devuelve un objeto estructurado.
Si la fecha es relativa (manana, el jueves, la proxima semana), calcula la fecha absoluta a partir de la fecha actual.
Para cumpleanos y eventos anuales, usa el proximo aniversario a partir de hoy.
Devuelve null en los campos opcionales (horaVencimiento, descripcion, reglaRecurrencia) cuando no apliquen.

Texto del usuario: ${texto.trim()}`,
    })

    return Response.json({
      titulo: object.titulo,
      categoriaSlug: object.categoriaSlug,
      fechaVencimiento: object.fechaVencimiento,
      horaVencimiento: object.horaVencimiento ?? undefined,
      descripcion: object.descripcion ?? undefined,
      esRecurrente: object.esRecurrente,
      reglaRecurrencia: object.reglaRecurrencia ?? undefined,
    })
  } catch (error) {
    console.error('[ai/recordatorio]', error)

    if (NoObjectGeneratedError.isInstance(error)) {
      return Response.json(
        {
          error:
            'No pude extraer una fecha clara del texto. Se mas especifico (ej: "20 de junio", "el viernes a las 8pm").',
        },
        { status: 422 },
      )
    }

    return Response.json(
      { error: 'El asistente no pudo procesar la solicitud. Intenta de nuevo.' },
      { status: 500 },
    )
  }
}
