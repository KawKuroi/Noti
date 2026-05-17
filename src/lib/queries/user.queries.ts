import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { perfiles } from '@/db/schema'
import { requerirUsuario } from '@/lib/auth'
import type { Perfil } from '@/types/user.types'

function mapearPerfil(fila: typeof perfiles.$inferSelect): Perfil {
  return {
    id: fila.id,
    nombreMostrado: fila.nombreMostrado,
    zonaHoraria: fila.zonaHoraria,
    anticipacionNotificacion: fila.anticipacionNotificacion,
    sonidoHabilitado: fila.sonidoHabilitado,
    creadoEn: fila.creadoEn,
    actualizadoEn: fila.actualizadoEn,
  }
}

export async function getPerfilDelUsuarioActual(): Promise<Perfil | null> {
  const usuario = await requerirUsuario()

  const filas = await db
    .select()
    .from(perfiles)
    .where(eq(perfiles.id, usuario.id))
    .limit(1)

  return filas[0] ? mapearPerfil(filas[0]) : null
}
