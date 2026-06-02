import { and, eq, gte } from 'drizzle-orm'
import { db } from '@/db'
import { suscripcionesPush, logNotificaciones } from '@/db/schema'
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

/**
 * Indica si ya se envio una notificacion exitosa de este recordatorio para la
 * ocurrencia actual. Se usa para deduplicar cuando el pinger externo (cron-job.org)
 * dispara varias veces dentro de la ventana de notificacion: solo cuenta un log
 * con `estado='sent'` cuyo `enviadoEn` sea posterior o igual al `notificarEn` de la
 * ocurrencia. Un envio fallido (estado='failed') no bloquea el reintento.
 */
export async function yaSeNotifico(recordatorioId: string, desde: Date): Promise<boolean> {
  const filas = await db
    .select({ id: logNotificaciones.id })
    .from(logNotificaciones)
    .where(
      and(
        eq(logNotificaciones.recordatorioId, recordatorioId),
        eq(logNotificaciones.estado, 'sent'),
        gte(logNotificaciones.enviadoEn, desde),
      ),
    )
    .limit(1)

  return filas.length > 0
}
