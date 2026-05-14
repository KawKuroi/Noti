import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { suscripcionesPush } from '@/db/schema'
import { requerirUsuario } from '@/lib/auth'

export interface SuscripcionPush {
  id: string
  usuarioId: string
  endpoint: string
  p256dh: string
  auth: string
  nombreDispositivo: string | null
  creadoEn: Date
}

function mapearSuscripcion(fila: typeof suscripcionesPush.$inferSelect): SuscripcionPush {
  return {
    id: fila.id,
    usuarioId: fila.usuarioId,
    endpoint: fila.endpoint,
    p256dh: fila.p256dh,
    auth: fila.auth,
    nombreDispositivo: fila.nombreDispositivo,
    creadoEn: fila.creadoEn,
  }
}

export async function getSuscripcionesPorUsuario(usuarioId: string): Promise<SuscripcionPush[]> {
  const filas = await db
    .select()
    .from(suscripcionesPush)
    .where(eq(suscripcionesPush.usuarioId, usuarioId))

  return filas.map(mapearSuscripcion)
}

export async function getSuscripcionesDelUsuarioActual(): Promise<SuscripcionPush[]> {
  const usuario = await requerirUsuario()
  return getSuscripcionesPorUsuario(usuario.id)
}
