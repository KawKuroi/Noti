import webpush from 'web-push'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { suscripcionesPush, logNotificaciones, recordatorios } from '@/db/schema'
import { getSuscripcionesPorUsuario } from '@/lib/queries/push.queries'
import { getRecordatoriosANotificar, getRecordatoriosEnRango } from '@/lib/queries/reminder.queries'
import { calcularProximaOcurrencia } from '@/lib/utils/date.utils'

let vapidConfigurado = false

function configurarVapid() {
  if (vapidConfigurado) return
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const email = process.env.VAPID_EMAIL
  if (!publicKey || !privateKey || !email) {
    throw new Error('Variables de entorno VAPID no configuradas')
  }
  webpush.setVapidDetails(email, publicKey, privateKey)
  vapidConfigurado = true
}

export interface PayloadPush {
  title: string
  body: string
  data: {
    url: string
    reminderId: string
  }
}

async function enviarPushASuscripcion(
  suscripcion: { id: string; endpoint: string; p256dh: string; auth: string },
  payload: PayloadPush,
): Promise<{ enviado: boolean; invalida?: boolean }> {
  configurarVapid()

  const suscripcionWebPush = {
    endpoint: suscripcion.endpoint,
    keys: { p256dh: suscripcion.p256dh, auth: suscripcion.auth },
  }

  try {
    await webpush.sendNotification(suscripcionWebPush, JSON.stringify(payload))
    return { enviado: true }
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number })?.statusCode
    if (statusCode === 404 || statusCode === 410) {
      return { enviado: false, invalida: true }
    }
    console.error('Error al enviar push a', suscripcion.endpoint, err)
    return { enviado: false }
  }
}

export async function enviarPushAUsuario(
  usuarioId: string,
  recordatorioId: string | null,
  payload: PayloadPush,
): Promise<{ enviados: number; fallidos: number }> {
  const suscripciones = await getSuscripcionesPorUsuario(usuarioId)

  let enviados = 0
  let fallidos = 0

  await Promise.all(
    suscripciones.map(async (sus) => {
      const resultado = await enviarPushASuscripcion(sus, payload)

      if (resultado.invalida) {
        // Eliminar suscripcion expirada
        await db
          .delete(suscripcionesPush)
          .where(eq(suscripcionesPush.id, sus.id))
        fallidos++
      } else if (resultado.enviado) {
        enviados++
      } else {
        fallidos++
      }
    }),
  )

  // Registrar resultado en el log
  const estado = enviados > 0 ? 'sent' : 'failed'
  await db.insert(logNotificaciones).values({
    recordatorioId,
    usuarioId,
    estado,
    mensajeError: enviados === 0 && fallidos > 0 ? 'No se pudo enviar a ninguna suscripcion' : null,
  })

  return { enviados, fallidos }
}

export async function enviarResumenDiario(usuarioId: string): Promise<void> {
  const ahora = new Date()
  const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 0, 0, 0)
  const finHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59)

  const pendientesHoy = await getRecordatoriosEnRango(usuarioId, inicioHoy, finHoy)
  if (pendientesHoy.length === 0) return

  const cuerpo =
    pendientesHoy.length === 1
      ? pendientesHoy[0].titulo
      : `${pendientesHoy.slice(0, 2).map((r) => r.titulo).join(', ')}${pendientesHoy.length > 2 ? ` y ${pendientesHoy.length - 2} mas` : ''}`

  const payload: PayloadPush = {
    title: `Buenos dias - ${pendientesHoy.length} ${pendientesHoy.length === 1 ? 'recordatorio' : 'recordatorios'} hoy`,
    body: cuerpo,
    data: {
      url: '/inicio',
      reminderId: 'daily-summary',
    },
  }

  await enviarPushAUsuario(usuarioId, null, payload)
}

export async function procesarRecordatoriosPendientes(): Promise<{ procesados: number }> {
  const ahora = new Date()
  const pendientes = await getRecordatoriosANotificar(ahora)

  let procesados = 0

  for (const recordatorio of pendientes) {
    const payload: PayloadPush = {
      title: recordatorio.titulo,
      body: recordatorio.descripcion ?? 'Es momento de revisar este recordatorio',
      data: {
        url: '/',
        reminderId: recordatorio.id,
      },
    }

    await enviarPushAUsuario(recordatorio.usuarioId, recordatorio.id, payload)
    procesados++

    if (recordatorio.esRecurrente && recordatorio.reglaRecurrencia) {
      // Avanzar a la proxima ocurrencia
      const ancla = recordatorio.fechaVencimiento instanceof Date
        ? recordatorio.fechaVencimiento
        : new Date(recordatorio.fechaVencimiento)

      const proxima = calcularProximaOcurrencia(recordatorio.reglaRecurrencia, ancla, ahora)
      const diferenciaNot = ancla.getTime() - (
        recordatorio.notificarEn instanceof Date
          ? recordatorio.notificarEn
          : new Date(recordatorio.notificarEn)
      ).getTime()
      const proximoNotificarEn = new Date(proxima.getTime() - diferenciaNot)

      await db
        .update(recordatorios)
        .set({
          fechaVencimiento: proxima,
          notificarEn: proximoNotificarEn,
          estaCompletado: false,
          actualizadoEn: new Date(),
        })
        .where(
          and(
            eq(recordatorios.id, recordatorio.id),
            eq(recordatorios.usuarioId, recordatorio.usuarioId),
          ),
        )
    }
    // Si no es recurrente, no se autocompletada — el usuario lo marca desde la notificacion
  }

  return { procesados }
}
