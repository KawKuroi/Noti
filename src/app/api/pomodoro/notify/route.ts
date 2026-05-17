import { NextResponse } from 'next/server'
import { obtenerUsuario } from '@/lib/auth'
import { enviarPushAUsuario } from '@/lib/services/push.service'
import { esquemaNotificacionPomodoro } from '@/lib/validations/push.schemas'
import { verificarLimite } from '@/lib/utils/rate-limit'
import type { PayloadPush } from '@/lib/services/push.service'

const MENSAJES: Record<string, { titulo: string; body: (titulo?: string) => string }> = {
  trabajo: {
    titulo: 'Pomodoro: sesion terminada',
    body: (titulo) =>
      titulo
        ? `"${titulo}" completado. Es momento de descansar.`
        : 'Sesion de trabajo terminada. Es momento de descansar.',
  },
  descanso_corto: {
    titulo: 'Pomodoro: descanso terminado',
    body: () => 'Descanso corto terminado. A trabajar.',
  },
  descanso_largo: {
    titulo: 'Pomodoro: descanso largo terminado',
    body: () => 'Descanso largo terminado. Nueva ronda de sesiones.',
  },
}

export async function POST(request: Request) {
  const usuario = await obtenerUsuario()
  if (!usuario) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const limite = verificarLimite(`pomodoro-notify:${usuario.id}`, 60, 60_000)
  if (!limite.ok) {
    return NextResponse.json({ error: 'Demasiadas peticiones' }, {
      status: 429,
      headers: { 'Retry-After': String(limite.retryAfter ?? 60) },
    })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body invalido' }, { status: 400 })
  }

  const resultado = esquemaNotificacionPomodoro.safeParse(body)
  if (!resultado.success) {
    return NextResponse.json({ error: 'Datos invalidos' }, { status: 400 })
  }

  const { fase, tituloReminder, reminderId } = resultado.data
  const mensaje = MENSAJES[fase]

  const payload: PayloadPush = {
    title: mensaje.titulo,
    body: mensaje.body(tituloReminder),
    data: {
      url: reminderId ? `/pomodoro?reminderId=${reminderId}` : '/pomodoro',
      reminderId: reminderId ?? 'pomodoro',
    },
  }

  const { enviados, fallidos } = await enviarPushAUsuario(usuario.id, null, payload)

  return NextResponse.json({ ok: true, enviados, fallidos })
}
