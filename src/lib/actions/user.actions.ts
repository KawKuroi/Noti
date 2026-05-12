'use server'

import { db } from '@/db'
import { perfiles } from '@/db/schema'
import { ZONA_HORARIA_DEFECTO, ANTICIPACION_DEFECTO } from '@/lib/utils/constants'

export async function upsertPerfil(
  usuarioId: string,
  nombreMostrado?: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await db
      .insert(perfiles)
      .values({
        id: usuarioId,
        nombreMostrado: nombreMostrado ?? null,
        zonaHoraria: ZONA_HORARIA_DEFECTO,
        anticipacionNotificacion: ANTICIPACION_DEFECTO,
      })
      .onConflictDoUpdate({
        target: perfiles.id,
        set: {
          actualizadoEn: new Date(),
          ...(nombreMostrado ? { nombreMostrado } : {}),
        },
      })

    return { ok: true }
  } catch (e) {
    console.error('Error en upsertPerfil:', e)
    return { ok: false, error: 'Error al crear o actualizar el perfil' }
  }
}
