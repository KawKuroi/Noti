import { obtenerUsuario } from '@/lib/auth'
import { verificarLimite } from '@/lib/utils/rate-limit'
import { extraerIntencion } from '@/lib/ai/extractor'

export const maxDuration = 30

export async function POST(req: Request) {
  const usuario = await obtenerUsuario()
  if (!usuario) return new Response('No autenticado', { status: 401 })

  const limite = verificarLimite(`asistente-extraer:${usuario.id}`, 20, 60_000)
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

  const resultado = await extraerIntencion({
    texto,
    fechaHoy: fechaHoy ?? new Date().toISOString().slice(0, 10),
  })

  if (!resultado.ok) {
    return Response.json({ error: resultado.error }, { status: 422 })
  }

  console.log('[asistente/extraer]', {
    intencion: resultado.extraccion.intencion,
    tipo: resultado.extraccion.lanzamiento?.tipo,
  })

  return Response.json(resultado.extraccion)
}
