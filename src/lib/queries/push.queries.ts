import { and, eq, gte, desc, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { suscripcionesPush, logNotificaciones } from '@/db/schema'
import { requerirUsuario } from '@/lib/auth'
import { MAX_HISTORIAL_NOTIFICACIONES } from '@/lib/utils/constants'

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

export interface NotificacionHistorial {
  id: string
  recordatorioId: string | null
  titulo: string | null
  cuerpo: string | null
  enviadoEn: Date
}

// Notificaciones pendientes para el centro de notificaciones (campana). Solo envios
// exitosos y NO leidos, mas reciente primero, acotado al tope. Al marcar como leidas
// desaparecen del menu (no quedan como historial visible). El badge se deriva de la
// cantidad devuelta, por eso no hay un COUNT aparte.
export async function getHistorialNotificaciones(
  usuarioId: string,
): Promise<NotificacionHistorial[]> {
  return db
    .select({
      id: logNotificaciones.id,
      recordatorioId: logNotificaciones.recordatorioId,
      titulo: logNotificaciones.titulo,
      cuerpo: logNotificaciones.cuerpo,
      enviadoEn: logNotificaciones.enviadoEn,
    })
    .from(logNotificaciones)
    .where(
      and(
        eq(logNotificaciones.usuarioId, usuarioId),
        eq(logNotificaciones.estado, 'sent'),
        isNull(logNotificaciones.leidoEn),
      ),
    )
    .orderBy(desc(logNotificaciones.enviadoEn))
    .limit(MAX_HISTORIAL_NOTIFICACIONES)
}
