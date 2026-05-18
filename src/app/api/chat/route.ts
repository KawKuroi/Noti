import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from 'ai'
import { groq } from '@ai-sdk/groq'
import { obtenerUsuario } from '@/lib/auth'
import { herramientasLanzamientos } from '@/lib/ai/tools'
import { PROMPT_SISTEMA_LANZAMIENTOS } from '@/lib/ai/prompt'
import { verificarLimite } from '@/lib/utils/rate-limit'

export const maxDuration = 30

export async function POST(req: Request) {
  const usuario = await obtenerUsuario()
  if (!usuario) {
    return new Response('No autenticado', { status: 401 })
  }

  const limite = verificarLimite(`chat:${usuario.id}`, 20, 60_000)
  if (!limite.ok) {
    return new Response('Demasiadas peticiones', {
      status: 429,
      headers: { 'Retry-After': String(limite.retryAfter ?? 60) },
    })
  }

  if (!process.env.GROQ_API_KEY) {
    return new Response('GROQ_API_KEY no configurada', { status: 500 })
  }

  const { messages }: { messages: UIMessage[] } = await req.json()

  const modelMessages = await convertToModelMessages(messages)

  const resultado = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: PROMPT_SISTEMA_LANZAMIENTOS,
    messages: modelMessages,
    tools: herramientasLanzamientos,
    stopWhen: stepCountIs(8),
    onError: ({ error }) => {
      console.error('[chat]', error)
    },
  })

  return resultado.toUIMessageStreamResponse({
    onError: (error) => {
      if (error == null) return 'El asistente no pudo procesar la solicitud. Intenta de nuevo.'
      if (typeof error === 'string') return error
      if (error instanceof Error) return error.message
      return 'Error desconocido en el asistente.'
    },
  })
}
