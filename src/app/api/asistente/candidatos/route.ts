import { obtenerUsuario } from '@/lib/auth'
import { verificarLimite } from '@/lib/utils/rate-limit'
import { obtenerCandidatos } from '@/lib/services/release-search.service'
import { esquemaExtraccion } from '@/lib/ai/extractor'

export const maxDuration = 30

export async function POST(req: Request) {
  const usuario = await obtenerUsuario()
  if (!usuario) return new Response('No autenticado', { status: 401 })

  const limite = await verificarLimite(`asistente-candidatos:${usuario.id}`, 60, 60_000)
  if (!limite.ok) {
    return new Response('Demasiadas peticiones', {
      status: 429,
      headers: { 'Retry-After': String(limite.retryAfter ?? 60) },
    })
  }

  const cuerpo = await req.json()
  const parse = esquemaExtraccion.safeParse(cuerpo.extraccion ?? cuerpo)
  if (!parse.success) {
    return Response.json({ error: 'Extraccion invalida' }, { status: 400 })
  }

  const candidatos = await obtenerCandidatos(parse.data)
  return Response.json({ candidatos })
}
