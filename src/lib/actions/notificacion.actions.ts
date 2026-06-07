'use server'

import { and, eq, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { logNotificaciones } from '@/db/schema'
import { obtenerUsuario } from '@/lib/auth'
import {
  getHistorialNotificaciones,
  contarNotificacionesNoLeidas,
  type NotificacionHistorial,
} from '@/lib/queries/push.queries'

export interface EstadoNotificaciones {
  items: NotificacionHistorial[]
  noLeidas: number
}

// Devuelve el historial reciente + el conteo de no leidas. Lo usa el centro de
// notificaciones para refrescar al abrir el menu o al recibir un push (mensaje del SW).
export async function obtenerNotificaciones(): Promise<EstadoNotificaciones> {
  const usuario = await obtenerUsuario()
  if (!usuario) return { items: [], noLeidas: 0 }

  const [items, noLeidas] = await Promise.all([
    getHistorialNotificaciones(usuario.id),
    contarNotificacionesNoLeidas(usuario.id),
  ])

  return { items, noLeidas }
}

// Marca todas las notificaciones del usuario como leidas (limpia el badge).
export async function marcarNotificacionesLeidas(): Promise<{ ok: boolean }> {
  const usuario = await obtenerUsuario()
  if (!usuario) return { ok: false }

  try {
    await db
      .update(logNotificaciones)
      .set({ leidoEn: new Date() })
      .where(
        and(
          eq(logNotificaciones.usuarioId, usuario.id),
          isNull(logNotificaciones.leidoEn),
        ),
      )
    return { ok: true }
  } catch (e) {
    console.error('Error al marcar notificaciones leidas:', e)
    return { ok: false }
  }
}
