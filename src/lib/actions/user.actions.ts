'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { perfiles } from '@/db/schema'
import { ZONA_HORARIA_DEFECTO, ANTICIPACION_DEFECTO } from '@/lib/utils/constants'
import { esquemaPerfil } from '@/lib/validations/user.schemas'
import { obtenerUsuario } from '@/lib/auth'

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

export async function actualizarPerfil(
  input: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const usuario = await obtenerUsuario()
  if (!usuario) return { ok: false, error: 'No autenticado' }

  const resultado = esquemaPerfil.safeParse(input)
  if (!resultado.success) {
    const primer = Object.values(resultado.error.flatten().fieldErrors)[0]?.[0]
    return { ok: false, error: primer ?? 'Datos invalidos' }
  }

  const { nombreMostrado, zonaHoraria } = resultado.data

  try {
    await db
      .update(perfiles)
      .set({
        ...(nombreMostrado !== undefined ? { nombreMostrado } : {}),
        zonaHoraria,
        actualizadoEn: new Date(),
      })
      .where(eq(perfiles.id, usuario.id))

    revalidatePath('/settings')
    return { ok: true }
  } catch (e) {
    console.error('Error en actualizarPerfil:', e)
    return { ok: false, error: 'Error al guardar el perfil' }
  }
}
