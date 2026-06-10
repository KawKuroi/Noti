import { Resend } from 'resend'
import { verificarLimite } from '@/lib/utils/rate-limit'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anonimo'

  const limite = await verificarLimite(`contacto:${ip}`, 5, 3_600_000)
  if (!limite.ok) {
    return new Response('Demasiadas peticiones', {
      status: 429,
      headers: { 'Retry-After': String(limite.retryAfter ?? 3600) },
    })
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('[contacto] RESEND_API_KEY no configurada')
    return new Response('Servicio no configurado', { status: 503 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response('Cuerpo invalido', { status: 400 })
  }

  const mensaje = (
    (body as Record<string, unknown>).mensaje as string | undefined
  )?.trim()

  if (!mensaje || mensaje.length < 5) {
    return new Response('El mensaje debe tener al menos 5 caracteres', { status: 400 })
  }

  const nombre = ((body as Record<string, unknown>).nombre as string | undefined)?.trim() || 'Anonimo'
  const emailRemitente = ((body as Record<string, unknown>).email as string | undefined)?.trim() || null

  const lineas = [`De: ${nombre}`]
  if (emailRemitente) lineas.push(`Email: ${emailRemitente}`)
  lineas.push('', mensaje)

  const destinatario = process.env.CONTACT_DESTINATION_EMAIL
  if (!destinatario) {
    console.error('[contacto] CONTACT_DESTINATION_EMAIL no configurada')
    return new Response('Servicio no configurado', { status: 503 })
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Noti Sugerencias <onboarding@resend.dev>',
      to: destinatario,
      replyTo: emailRemitente ?? undefined,
      subject: `Sugerencia de ${nombre}`,
      text: lineas.join('\n'),
    })

    if (error) {
      console.error('[contacto] Resend rechazo el envio:', error)
      const detalle = error.message ?? 'error desconocido'
      return new Response(`Resend: ${detalle}`, { status: 502 })
    }

    console.log('[contacto] Email enviado, id=', data?.id)
    return Response.json({ ok: true, id: data?.id })
  } catch (e) {
    console.error('[contacto] Excepcion al enviar:', e)
    return new Response('Error al enviar el correo', { status: 502 })
  }
}
