import { redis } from '@/lib/utils/redis'

// Watchdog del cron externo (cron-job.org): registra el ultimo ping OK de
// check-reminders para que /settings pueda avisar si el pinger esta caido
// (sin el, las notificaciones no se disparan). Requiere Redis; sin el
// (dev local) el watchdog queda deshabilitado silenciosamente.

const CLAVE_ULTIMO_PING = 'noti:cron:ultimo-ping'
// Si el ultimo ping OK es mas viejo que esto, el cron se considera caido.
export const UMBRAL_CRON_CAIDO_MS = 10 * 60 * 1000

export async function registrarPingCron(): Promise<void> {
  if (!redis) return
  try {
    await redis.set(CLAVE_ULTIMO_PING, Date.now())
  } catch (e) {
    console.error('[cron-health] No se pudo registrar el ping:', e)
  }
}

export async function obtenerUltimoPingCron(): Promise<Date | null> {
  if (!redis) return null
  try {
    const valor = await redis.get<number>(CLAVE_ULTIMO_PING)
    return valor ? new Date(valor) : null
  } catch (e) {
    console.error('[cron-health] No se pudo leer el ultimo ping:', e)
    return null
  }
}

// null = sin datos (Redis no provisionado o nunca llego un ping): no avisar.
export async function cronEstaCaido(): Promise<boolean | null> {
  const ultimo = await obtenerUltimoPingCron()
  if (!ultimo) return null
  return Date.now() - ultimo.getTime() > UMBRAL_CRON_CAIDO_MS
}
