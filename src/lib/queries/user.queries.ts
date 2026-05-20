import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { perfiles } from '@/db/schema'
import { requerirUsuario } from '@/lib/auth'
import type { Perfil } from '@/types/user.types'

export interface PerfilResumen {
  id: string
  zonaHoraria: string
  horaResumen: string
}

function mapearPerfil(fila: typeof perfiles.$inferSelect): Perfil {
  return {
    id: fila.id,
    nombreMostrado: fila.nombreMostrado,
    zonaHoraria: fila.zonaHoraria,
    anticipacionNotificacion: fila.anticipacionNotificacion,
    resumenDiario: fila.resumenDiario,
    horaResumen: fila.horaResumen,
    autoEliminarTareasCompletadasDias: fila.autoEliminarTareasCompletadasDias,
    creadoEn: fila.creadoEn,
    actualizadoEn: fila.actualizadoEn,
  }
}

export async function getPerfilesConResumenDiario(horaUTC: string): Promise<PerfilResumen[]> {
  const filas = await db
    .select({
      id: perfiles.id,
      zonaHoraria: perfiles.zonaHoraria,
      horaResumen: perfiles.horaResumen,
    })
    .from(perfiles)
    .where(eq(perfiles.resumenDiario, true))

  return filas.filter((f) => f.horaResumen === horaUTC)
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
