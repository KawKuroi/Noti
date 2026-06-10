import { obtenerUsuario } from '@/lib/auth'
import { verificarLimite } from '@/lib/utils/rate-limit'

export const maxDuration = 30

export async function POST(req: Request) {
  const usuario = await obtenerUsuario()
  if (!usuario) return new Response('No autenticado', { status: 401 })

  const limite = await verificarLimite(`transcribir:${usuario.id}`, 10, 60_000)
  if (!limite.ok) {
    return new Response('Demasiadas peticiones', {
      status: 429,
      headers: { 'Retry-After': String(limite.retryAfter ?? 60) },
    })
  }

  if (!process.env.GROQ_API_KEY) {
    return Response.json({ error: 'GROQ_API_KEY no configurada' }, { status: 500 })
  }

  let datos: FormData
  try {
    datos = await req.formData()
  } catch {
    return Response.json({ error: 'Formato de solicitud invalido' }, { status: 400 })
  }

  const audio = datos.get('audio')
  if (!audio || !(audio instanceof Blob)) {
    return Response.json({ error: 'Audio requerido' }, { status: 400 })
  }

  if (audio.size > 25 * 1024 * 1024) {
    return Response.json({ error: 'Audio demasiado grande (max 25 MB)' }, { status: 413 })
  }

  const formularioGroq = new FormData()
  formularioGroq.append('file', audio, 'audio.webm')
  formularioGroq.append('model', 'whisper-large-v3-turbo')
  formularioGroq.append('language', 'es')
  formularioGroq.append('response_format', 'json')

  let respuesta: Response
  try {
    respuesta = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: formularioGroq,
    })
  } catch {
    return Response.json({ error: 'Error de conexion con Groq' }, { status: 502 })
  }

  if (!respuesta.ok) {
    const cuerpo = await respuesta.text()
    console.error('[ai/transcribir] error Groq', respuesta.status, cuerpo)
    return Response.json({ error: 'Error al transcribir el audio' }, { status: 502 })
  }

  const resultado = (await respuesta.json()) as { text: string }
  return Response.json({ texto: resultado.text })
}
