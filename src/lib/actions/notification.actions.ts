'use server'

import { revalidatePath } from 'next/cache'
import { eq, and, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { perfiles, recordatorios, logNotificaciones } from '@/db/schema'
import { obtenerUsuario } from '@/lib/auth'
import { esquemaAnticipacion } from '@/lib/validations/push.schemas'
import {
  getHistorialNotificaciones,
  type NotificacionHistorial,
} from '@/lib/queries/push.queries'

async function obtenerUsuarioId(): Promise<string | null> {
  const user = await obtenerUsuario()
  return user?.id ?? null
}

export interface EstadoNotificaciones {
  items: NotificacionHistorial[]
  noLeidas: number
}

// Devuelve las notificaciones sin leer para el centro de notificaciones (campana).
// El badge se deriva de la cantidad de items (el menu solo lista no leidas), por lo que
// no hace falta un COUNT aparte. Lo usa el componente para refrescar al abrir el menu o
// al recibir un push (mensaje del SW).
export async function obtenerNotificaciones(): Promise<EstadoNotificaciones> {
  const usuario = await obtenerUsuario()
  if (!usuario) return { items: [], noLeidas: 0 }

  const items = await getHistorialNotificaciones(usuario.id)
  return { items, noLeidas: items.length }
}

// Marca todas las notificaciones del usuario como leidas (las saca del menu).
export async function marcarNotificacionesLeidas(): Promise<{ ok: boolean }> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false }

  try {
    await db
      .update(logNotificaciones)
      .set({ leidoEn: new Date() })
      .where(
        and(
          eq(logNotificaciones.usuarioId, usuarioId),
          isNull(logNotificaciones.leidoEn),
        ),
      )
    return { ok: true }
  } catch (e) {
    console.error('Error al marcar notificaciones leidas:', e)
    return { ok: false }
  }
}

export async function actualizarAnticipacion(
  minutos: number,
): Promise<{ ok: boolean; error?: string }> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  const resultado = esquemaAnticipacion.safeParse({ minutos })
  if (!resultado.success) return { ok: false, error: 'Valor de anticipacion invalido' }

  try {
    await db
      .update(perfiles)
      .set({ anticipacionNotificacion: resultado.data.minutos, actualizadoEn: new Date() })
      .where(eq(perfiles.id, usuarioId))

    revalidatePath('/settings')
    return { ok: true }
  } catch (e) {
    console.error('Error al actualizar anticipacion:', e)
    return { ok: false, error: 'Error al guardar la configuracion' }
  }
}


export async function posponerRecordatorio(
  reminderId: string,
  minutos = 15,
): Promise<{ ok: boolean; error?: string }> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  try {
    const [actual] = await db
      .select({ notificarEn: recordatorios.notificarEn })
      .from(recordatorios)
      .where(
        and(
          eq(recordatorios.id, reminderId),
          eq(recordatorios.usuarioId, usuarioId),
        ),
      )
      .limit(1)

    if (!actual) return { ok: false, error: 'Recordatorio no encontrado' }
    if (!actual.notificarEn) return { ok: false, error: 'Recordatorio sin fecha de notificacion' }

    const nuevoNotificarEn = new Date(
      actual.notificarEn.getTime() + minutos * 60 * 1000,
    )

    await db
      .update(recordatorios)
      .set({ notificarEn: nuevoNotificarEn, actualizadoEn: new Date() })
      .where(
        and(
          eq(recordatorios.id, reminderId),
          eq(recordatorios.usuarioId, usuarioId),
        ),
      )

    revalidatePath('/inicio')
    return { ok: true }
  } catch (e) {
    console.error('Error al posponer recordatorio:', e)
    return { ok: false, error: 'Error al posponer' }
  }
}

export async function actualizarResumenDiario(
  activo: boolean,
  hora: string,
): Promise<{ ok: boolean; error?: string }> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  if (!/^\d{2}:\d{2}$/.test(hora)) return { ok: false, error: 'Formato de hora invalido' }

  try {
    await db
      .update(perfiles)
      .set({ resumenDiario: activo, horaResumen: hora, actualizadoEn: new Date() })
      .where(eq(perfiles.id, usuarioId))

    revalidatePath('/settings')
    return { ok: true }
  } catch (e) {
    console.error('Error al actualizar resumen diario:', e)
    return { ok: false, error: 'Error al guardar la configuracion' }
  }
}

export async function completarDesdeNotificacion(
  reminderId: string,
): Promise<{ ok: boolean; error?: string }> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  try {
    await db
      .update(recordatorios)
      .set({ estaCompletado: true, actualizadoEn: new Date() })
      .where(
        and(
          eq(recordatorios.id, reminderId),
          eq(recordatorios.usuarioId, usuarioId),
        ),
      )

    revalidatePath('/inicio')
    return { ok: true }
  } catch (e) {
    console.error('Error al completar recordatorio:', e)
    return { ok: false, error: 'Error al completar' }
  }
}
