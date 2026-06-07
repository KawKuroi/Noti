import webpush from 'web-push'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { suscripcionesPush, logNotificaciones, recordatorios, perfiles } from '@/db/schema'
import { getSuscripcionesPorUsuario, yaSeNotifico } from '@/lib/queries/push.queries'
import { getRecordatoriosANotificar, getRecordatoriosEnRango, getCumpleanosActivos } from '@/lib/queries/reminder.queries'
import { calcularProximaOcurrencia, diasHastaCumple, inicioDiaLocalEnUTC, partesEnZona, segundosHastaFinDiaLocal } from '@/lib/utils/date.utils'
import { ZONA_HORARIA_DEFECTO } from '@/lib/utils/constants'

// Hora local (inclusive) a partir de la cual se envian los avisos de cumpleanos.
const HORA_AVISO_CUMPLEANOS = 6
// Dias de anticipacion para cumpleanos: el dia (0) y 3 dias antes.
const DIAS_AVISO_CUMPLEANOS = [0, 3]

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

// TTL: segundos que el servicio de push (FCM/Mozilla) retiene el aviso si el
// dispositivo esta desconectado. Sin esto, web-push usa ~4 semanas y los avisos
// viejos se acumulan y llegan de golpe al reabrir el navegador. urgencia: prioridad
// de entrega ('high' para avisos con hora, 'normal' para el resumen diario).
export interface OpcionesPush {
  ttlSegundos?: number
  urgencia?: 'high' | 'normal' | 'low'
}

async function enviarPushASuscripcion(
  suscripcion: { id: string; endpoint: string; p256dh: string; auth: string },
  payload: PayloadPush,
  opciones?: OpcionesPush,
): Promise<{ enviado: boolean; invalida?: boolean }> {
  configurarVapid()

  const suscripcionWebPush = {
    endpoint: suscripcion.endpoint,
    keys: { p256dh: suscripcion.p256dh, auth: suscripcion.auth },
  }

  try {
    await webpush.sendNotification(suscripcionWebPush, JSON.stringify(payload), {
      ...(opciones?.ttlSegundos !== undefined ? { TTL: opciones.ttlSegundos } : {}),
      ...(opciones?.urgencia ? { urgency: opciones.urgencia } : {}),
    })
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
  opciones?: OpcionesPush,
): Promise<{ enviados: number; fallidos: number }> {
  const suscripciones = await getSuscripcionesPorUsuario(usuarioId)

  let enviados = 0
  let fallidos = 0

  await Promise.all(
    suscripciones.map(async (sus) => {
      const resultado = await enviarPushASuscripcion(sus, payload, opciones)

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

  // Registrar resultado en el log (alimenta el centro de notificaciones).
  // Guardamos titulo/cuerpo para que el historial sobreviva al borrado del recordatorio.
  const estado = enviados > 0 ? 'sent' : 'failed'
  await db.insert(logNotificaciones).values({
    recordatorioId,
    usuarioId,
    estado,
    titulo: payload.title,
    cuerpo: payload.body,
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

  // El resumen solo es relevante durante el dia; expira al terminar el dia local.
  const [perfil] = await db
    .select({ zonaHoraria: perfiles.zonaHoraria })
    .from(perfiles)
    .where(eq(perfiles.id, usuarioId))
    .limit(1)
  const zona = perfil?.zonaHoraria || ZONA_HORARIA_DEFECTO

  await enviarPushAUsuario(usuarioId, null, payload, {
    ttlSegundos: segundosHastaFinDiaLocal(zona, ahora),
    urgencia: 'normal',
  })
}

export async function procesarRecordatoriosPendientes(): Promise<{ procesados: number }> {
  const ahora = new Date()
  // Ventana de 5 min: el pinger externo (cron-job.org) corre cada minuto, pero un
  // ping retrasado u omitido no debe perder la notificacion. La deduplicacion via
  // `yaSeNotifico` garantiza un unico envio por ocurrencia aunque varios pings
  // caigan dentro de la ventana.
  const pendientes = await getRecordatoriosANotificar(ahora, 5)

  let procesados = 0

  for (const recordatorio of pendientes) {
    // La query filtra isNotNull(notificarEn), pero el tipo lo permite nullable.
    if (!recordatorio.notificarEn) continue
    const notificarEn = recordatorio.notificarEn instanceof Date
      ? recordatorio.notificarEn
      : new Date(recordatorio.notificarEn)

    // Saltar si esta ocurrencia ya se notifico con exito en un ping anterior.
    if (await yaSeNotifico(recordatorio.id, notificarEn)) continue

    const payload: PayloadPush = {
      title: recordatorio.titulo,
      body: recordatorio.descripcion ?? 'Es momento de revisar este recordatorio',
      data: {
        url: '/',
        reminderId: recordatorio.id,
      },
    }

    // El aviso es relevante solo durante el dia local del usuario; luego expira en
    // el servicio de push y no se entrega al reabrir el navegador al dia siguiente.
    const zona = recordatorio.zonaHoraria || ZONA_HORARIA_DEFECTO
    await enviarPushAUsuario(recordatorio.usuarioId, recordatorio.id, payload, {
      ttlSegundos: segundosHastaFinDiaLocal(zona, ahora),
      urgencia: 'high',
    })
    procesados++

    if (recordatorio.esRecurrente && recordatorio.reglaRecurrencia && recordatorio.fechaVencimiento && recordatorio.notificarEn) {
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

export async function procesarCumpleanos(): Promise<{ enviados: number }> {
  const ahora = new Date()
  const cumpleanos = await getCumpleanosActivos()

  let enviados = 0

  for (const c of cumpleanos) {
    const zona = c.zonaHoraria || ZONA_HORARIA_DEFECTO

    // Regla "desde las 6am hora local": no avisar antes de esa hora.
    if (partesEnZona(ahora, zona).hora < HORA_AVISO_CUMPLEANOS) continue

    const dias = diasHastaCumple(c.fechaVencimiento, zona, ahora)
    if (!DIAS_AVISO_CUMPLEANOS.includes(dias)) continue

    // Dedup: una sola vez por dia local (sobrevive al pinger cada minuto).
    const inicioDia = inicioDiaLocalEnUTC(ahora, zona)
    if (await yaSeNotifico(c.id, inicioDia)) continue

    const payload: PayloadPush = {
      title: dias === 0 ? 'Hoy es el cumpleanos' : `Faltan ${dias} dias para el cumpleanos`,
      body: c.titulo,
      data: {
        url: '/inicio',
        reminderId: c.id,
      },
    }

    await enviarPushAUsuario(c.usuarioId, c.id, payload, {
      ttlSegundos: segundosHastaFinDiaLocal(zona, ahora),
      urgencia: 'high',
    })
    enviados++
  }

  return { enviados }
}
