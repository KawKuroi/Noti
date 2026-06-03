'use server'

import { revalidatePath } from 'next/cache'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { suscripcionesPush } from '@/db/schema'
import { obtenerUsuario } from '@/lib/auth'
import { enviarPushAUsuario } from '@/lib/services/push.service'
import { esquemaSuscripcionPush, type SuscripcionPushInput } from '@/lib/validations/push.schemas'

async function obtenerUsuarioId(): Promise<string | null> {
  const user = await obtenerUsuario()
  return user?.id ?? null
}

export async function registrarSuscripcion(
  input: SuscripcionPushInput,
): Promise<{ ok: boolean; error?: string; id?: string }> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  const resultado = esquemaSuscripcionPush.safeParse(input)
  if (!resultado.success) {
    return { ok: false, error: 'Datos de suscripcion invalidos' }
  }

  const { endpoint, p256dh, auth, nombreDispositivo } = resultado.data

  try {
    const [fila] = await db
      .insert(suscripcionesPush)
      .values({ usuarioId, endpoint, p256dh, auth, nombreDispositivo: nombreDispositivo ?? null })
      .onConflictDoUpdate({
        target: [suscripcionesPush.usuarioId, suscripcionesPush.endpoint],
        set: { p256dh, auth, nombreDispositivo: nombreDispositivo ?? null },
      })
      .returning({ id: suscripcionesPush.id })

    return { ok: true, id: fila.id }
  } catch (e) {
    console.error('Error al registrar suscripcion push:', e)
    return { ok: false, error: 'Error al guardar la suscripcion' }
  }
}

export async function eliminarSuscripcion(
  suscripcionId: string,
): Promise<{ ok: boolean; error?: string }> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  try {
    await db
      .delete(suscripcionesPush)
      .where(
        and(
          eq(suscripcionesPush.id, suscripcionId),
          eq(suscripcionesPush.usuarioId, usuarioId),
        ),
      )

    revalidatePath('/settings')
    return { ok: true }
  } catch (e) {
    console.error('Error al eliminar suscripcion:', e)
    return { ok: false, error: 'Error al eliminar la suscripcion' }
  }
}

/**
 * Envia una notificacion push de prueba al usuario actual, sin pasar por el cron
 * ni por un recordatorio. Aisla la cadena VAPID + suscripcion + Service Worker +
 * SO para depurar por que no llegan las notificaciones.
 */
export async function enviarNotificacionPrueba(): Promise<{
  ok: boolean
  enviados?: number
  error?: string
}> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  try {
    const { enviados } = await enviarPushAUsuario(usuarioId, null, {
      title: 'Noti - notificacion de prueba',
      body: 'Si ves esto, las notificaciones funcionan correctamente.',
      data: { url: '/inicio', reminderId: 'test' },
    })

    if (enviados === 0) {
      return {
        ok: false,
        error: 'No hay dispositivos suscritos. Activa las notificaciones primero.',
      }
    }

    return { ok: true, enviados }
  } catch (e) {
    console.error('Error al enviar notificacion de prueba:', e)
    return { ok: false, error: 'Error al enviar la notificacion' }
  }
}
