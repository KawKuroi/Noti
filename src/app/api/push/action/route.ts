import { NextRequest, NextResponse } from 'next/server'
import { esquemaAccionNotificacion } from '@/lib/validations/push.schemas'
import { posponerRecordatorio, completarDesdeNotificacion } from '@/lib/actions/notification.actions'

export async function POST(req: NextRequest) {
  try {
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
