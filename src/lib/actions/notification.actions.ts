'use server'

import { revalidatePath } from 'next/cache'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { perfiles, recordatorios } from '@/db/schema'
import { obtenerUsuario } from '@/lib/auth'
import { esquemaAnticipacion, esquemaSonido } from '@/lib/validations/push.schemas'

async function obtenerUsuarioId(): Promise<string | null> {
  const user = await obtenerUsuario()
  return user?.id ?? null
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

export async function actualizarSonido(
  activo: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  const resultado = esquemaSonido.safeParse({ activo })
  if (!resultado.success) return { ok: false, error: 'Valor invalido' }

  try {
    await db
      .update(perfiles)
      .set({ sonidoHabilitado: resultado.data.activo, actualizadoEn: new Date() })
      .where(eq(perfiles.id, usuarioId))

    revalidatePath('/settings')
    return { ok: true }
  } catch (e) {
    console.error('Error al actualizar sonido:', e)
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
