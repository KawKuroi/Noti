import { NextRequest, NextResponse } from 'next/server'
import { esquemaAccionNotificacion } from '@/lib/validations/push.schemas'
import { posponerRecordatorio, completarDesdeNotificacion } from '@/lib/actions/notification.actions'
import { verificarLimite } from '@/lib/utils/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const limite = await verificarLimite(`push-action:${ip}`, 30, 60_000)
    if (!limite.ok) {
      return NextResponse.json({ error: 'Demasiadas peticiones' }, {
        status: 429,
        headers: { 'Retry-After': String(limite.retryAfter ?? 60) },
      })
    }

    const body = await req.json()
    const resultado = esquemaAccionNotificacion.safeParse(body)

    if (!resultado.success) {
      return NextResponse.json({ error: 'Datos invalidos' }, { status: 400 })
    }

    const { reminderId, action, minutos } = resultado.data

    if (action === 'posponer') {
      await posponerRecordatorio(reminderId, minutos ?? 15)
    } else {
      await completarDesdeNotificacion(reminderId)
    }

    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
