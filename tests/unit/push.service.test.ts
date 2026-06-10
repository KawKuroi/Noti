import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'

// Mocks de infraestructura: web-push, base de datos y queries. Aqui se prueba
// la logica de envio (reintentos, limpieza de suscripciones 410, dedup,
// reglas de cumpleanos y resumen diario), no la red ni la DB reales.

const mocks = vi.hoisted(() => ({
  whereDelete: vi.fn(),
  valuesInsert: vi.fn(),
  limitSelect: vi.fn(),
}))

vi.mock('web-push', () => ({
  default: { setVapidDetails: vi.fn(), sendNotification: vi.fn() },
}))

vi.mock('@/db', () => ({
  db: {
    delete: vi.fn(() => ({ where: mocks.whereDelete })),
    insert: vi.fn(() => ({ values: mocks.valuesInsert })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ limit: mocks.limitSelect })),
      })),
    })),
  },
}))

vi.mock('@/lib/queries/push.queries', () => ({
  getSuscripcionesPorUsuario: vi.fn(),
  yaSeNotifico: vi.fn(),
}))

vi.mock('@/lib/queries/reminder.queries', () => ({
  getRecordatoriosANotificar: vi.fn(),
  getRecordatoriosEnRango: vi.fn(),
  getCumpleanosActivos: vi.fn(),
}))

import webpush from 'web-push'
import { getSuscripcionesPorUsuario, yaSeNotifico } from '@/lib/queries/push.queries'
import {
  getRecordatoriosANotificar,
  getRecordatoriosEnRango,
  getCumpleanosActivos,
} from '@/lib/queries/reminder.queries'
import {
  enviarPushAUsuario,
  enviarResumenDiario,
  procesarRecordatoriosPendientes,
  procesarCumpleanos,
  type PayloadPush,
} from '@/lib/services/push.service'
import type { SuscripcionPush } from '@/lib/queries/push.queries'
import type { RecordatorioConAnticipacion } from '@/lib/queries/reminder.queries'

function crearSuscripcion(parcial: Partial<SuscripcionPush> = {}): SuscripcionPush {
  return {
    id: 'sus-1',
    usuarioId: 'user-1',
    endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
    p256dh: 'p256dh',
    auth: 'auth',
    nombreDispositivo: null,
    creadoEn: new Date(),
    ...parcial,
  }
}

function crearPayload(): PayloadPush {
  return {
    title: 'Titulo de prueba',
    body: 'Cuerpo de prueba',
    data: { url: '/inicio', reminderId: 'rec-1' },
  }
}

function crearPendiente(parcial: Partial<RecordatorioConAnticipacion> = {}): RecordatorioConAnticipacion {
  return {
    id: 'rec-1',
    usuarioId: 'user-1',
    categoriaId: 1,
    titulo: 'Entregar informe',
    descripcion: null,
    fechaVencimiento: new Date(),
    notificarEn: new Date(),
    esRecurrente: false,
    reglaRecurrencia: null,
    estaCompletado: false,
    completadoEn: null,
    eliminadoEn: null,
    tmdbId: null,
    metadatos: null,
    creadoEn: new Date(),
    actualizadoEn: new Date(),
    anticipacionNotificacion: 15,
    zonaHoraria: 'America/Bogota',
    ...parcial,
  }
}

// Payload del ultimo push enviado (segundo argumento de sendNotification).
function ultimoPayloadEnviado(): PayloadPush {
  const llamadas = vi.mocked(webpush.sendNotification).mock.calls
  return JSON.parse(llamadas[llamadas.length - 1][1] as string) as PayloadPush
}

beforeAll(() => {
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'clave-publica-test'
  process.env.VAPID_PRIVATE_KEY = 'clave-privada-test'
  process.env.VAPID_EMAIL = 'mailto:test@noti.app'
})

beforeEach(() => {
  vi.clearAllMocks()
  mocks.whereDelete.mockResolvedValue(undefined)
  mocks.valuesInsert.mockResolvedValue(undefined)
  mocks.limitSelect.mockResolvedValue([])
  vi.mocked(getSuscripcionesPorUsuario).mockResolvedValue([crearSuscripcion()])
  vi.mocked(yaSeNotifico).mockResolvedValue(false)
  vi.mocked(webpush.sendNotification).mockResolvedValue({ statusCode: 201, body: '', headers: {} })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('enviarPushAUsuario', () => {
  it('envia a la suscripcion y registra el log como "sent"', async () => {
    const resultado = await enviarPushAUsuario('user-1', 'rec-1', crearPayload())

    expect(resultado).toEqual({ enviados: 1, fallidos: 0 })
    expect(mocks.valuesInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        recordatorioId: 'rec-1',
        usuarioId: 'user-1',
        estado: 'sent',
        titulo: 'Titulo de prueba',
        cuerpo: 'Cuerpo de prueba',
        mensajeError: null,
      }),
    )
  })

  it('un 410 elimina la suscripcion expirada y registra "failed"', async () => {
    vi.mocked(webpush.sendNotification).mockRejectedValue({ statusCode: 410 })

    const resultado = await enviarPushAUsuario('user-1', 'rec-1', crearPayload())

    expect(resultado).toEqual({ enviados: 0, fallidos: 1 })
    expect(mocks.whereDelete).toHaveBeenCalledTimes(1)
    expect(mocks.valuesInsert).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'failed', mensajeError: expect.any(String) }),
    )
  })

  it('un 404 tambien invalida la suscripcion sin reintentar', async () => {
    vi.mocked(webpush.sendNotification).mockRejectedValue({ statusCode: 404 })

    await enviarPushAUsuario('user-1', 'rec-1', crearPayload())

    expect(webpush.sendNotification).toHaveBeenCalledTimes(1)
    expect(mocks.whereDelete).toHaveBeenCalledTimes(1)
  })

  it('reintenta una vez ante un 5xx transitorio y envia con exito', async () => {
    vi.mocked(webpush.sendNotification)
      .mockRejectedValueOnce({ statusCode: 503 })
      .mockResolvedValueOnce({ statusCode: 201, body: '', headers: {} })

    const resultado = await enviarPushAUsuario('user-1', 'rec-1', crearPayload())

    expect(resultado).toEqual({ enviados: 1, fallidos: 0 })
    expect(webpush.sendNotification).toHaveBeenCalledTimes(2)
  })

  it('un error definitivo (4xx distinto de 404/410) no reintenta', async () => {
    vi.mocked(webpush.sendNotification).mockRejectedValue({ statusCode: 400 })

    const resultado = await enviarPushAUsuario('user-1', 'rec-1', crearPayload())

    expect(resultado).toEqual({ enviados: 0, fallidos: 1 })
    expect(webpush.sendNotification).toHaveBeenCalledTimes(1)
    expect(mocks.whereDelete).not.toHaveBeenCalled()
  })

  it('propaga TTL y urgencia al servicio de push', async () => {
    await enviarPushAUsuario('user-1', 'rec-1', crearPayload(), {
      ttlSegundos: 120,
      urgencia: 'high',
    })

    expect(webpush.sendNotification).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(String),
      { TTL: 120, urgency: 'high' },
    )
  })

  it('con varias suscripciones cuenta enviados y fallidos por separado', async () => {
    vi.mocked(getSuscripcionesPorUsuario).mockResolvedValue([
      crearSuscripcion({ id: 'sus-1', endpoint: 'https://fcm.test/1' }),
      crearSuscripcion({ id: 'sus-2', endpoint: 'https://fcm.test/2' }),
    ])
    vi.mocked(webpush.sendNotification)
      .mockResolvedValueOnce({ statusCode: 201, body: '', headers: {} })
      .mockRejectedValueOnce({ statusCode: 410 })

    const resultado = await enviarPushAUsuario('user-1', 'rec-1', crearPayload())

    expect(resultado).toEqual({ enviados: 1, fallidos: 1 })
    // Hubo al menos un envio exitoso: el log queda como 'sent'
    expect(mocks.valuesInsert).toHaveBeenCalledWith(expect.objectContaining({ estado: 'sent' }))
  })
})

describe('procesarRecordatoriosPendientes', () => {
  it('envia el push de un pendiente no notificado', async () => {
    vi.mocked(getRecordatoriosANotificar).mockResolvedValue([crearPendiente()])

    const resultado = await procesarRecordatoriosPendientes()

    expect(resultado).toEqual({ procesados: 1 })
    expect(ultimoPayloadEnviado().title).toBe('Entregar informe')
  })

  it('deduplica: si yaSeNotifico, no envia de nuevo', async () => {
    vi.mocked(getRecordatoriosANotificar).mockResolvedValue([crearPendiente()])
    vi.mocked(yaSeNotifico).mockResolvedValue(true)

    const resultado = await procesarRecordatoriosPendientes()

    expect(resultado).toEqual({ procesados: 0 })
    expect(webpush.sendNotification).not.toHaveBeenCalled()
  })

  it('salta filas sin notificarEn (defensa ante el tipo nullable)', async () => {
    vi.mocked(getRecordatoriosANotificar).mockResolvedValue([crearPendiente({ notificarEn: null })])

    const resultado = await procesarRecordatoriosPendientes()

    expect(resultado).toEqual({ procesados: 0 })
    expect(webpush.sendNotification).not.toHaveBeenCalled()
  })

  it('usa la descripcion como cuerpo si existe', async () => {
    vi.mocked(getRecordatoriosANotificar).mockResolvedValue([
      crearPendiente({ descripcion: 'Llevar el USB' }),
    ])

    await procesarRecordatoriosPendientes()

    expect(ultimoPayloadEnviado().body).toBe('Llevar el USB')
  })
})

describe('procesarCumpleanos (reloj fijo)', () => {
  const cumpleHoy = {
    id: 'cumple-1',
    usuarioId: 'user-1',
    titulo: 'Cumpleanos de Pardo',
    // 10 de junio en Bogota (el ano del ancla no importa)
    fechaVencimiento: new Date(Date.UTC(2000, 5, 10, 12, 0)),
    zonaHoraria: 'America/Bogota',
  }

  it('envia el aviso del dia a partir de las 6am locales', async () => {
    // 13:00 UTC = 08:00 en Bogota
    vi.useFakeTimers()
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 10, 13, 0)))
    vi.mocked(getCumpleanosActivos).mockResolvedValue([cumpleHoy])

    const resultado = await procesarCumpleanos()

    expect(resultado).toEqual({ enviados: 1 })
    expect(ultimoPayloadEnviado().title).toBe('Hoy es el cumpleanos')
  })

  it('no avisa antes de las 6am locales', async () => {
    // 08:00 UTC = 03:00 en Bogota
    vi.useFakeTimers()
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 10, 8, 0)))
    vi.mocked(getCumpleanosActivos).mockResolvedValue([cumpleHoy])

    const resultado = await procesarCumpleanos()

    expect(resultado).toEqual({ enviados: 0 })
    expect(webpush.sendNotification).not.toHaveBeenCalled()
  })

  it('avisa con 3 dias de anticipacion', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 10, 13, 0)))
    vi.mocked(getCumpleanosActivos).mockResolvedValue([
      { ...cumpleHoy, fechaVencimiento: new Date(Date.UTC(2000, 5, 13, 12, 0)) },
    ])

    const resultado = await procesarCumpleanos()

    expect(resultado).toEqual({ enviados: 1 })
    expect(ultimoPayloadEnviado().title).toBe('Faltan 3 dias para el cumpleanos')
  })

  it('no avisa en dias fuera de la regla (0 y 3)', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 10, 13, 0)))
    vi.mocked(getCumpleanosActivos).mockResolvedValue([
      { ...cumpleHoy, fechaVencimiento: new Date(Date.UTC(2000, 5, 12, 12, 0)) }, // faltan 2
    ])

    expect(await procesarCumpleanos()).toEqual({ enviados: 0 })
  })

  it('deduplica por dia local: si ya se notifico, no reenvia', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 10, 13, 0)))
    vi.mocked(getCumpleanosActivos).mockResolvedValue([cumpleHoy])
    vi.mocked(yaSeNotifico).mockResolvedValue(true)

    expect(await procesarCumpleanos()).toEqual({ enviados: 0 })
    expect(webpush.sendNotification).not.toHaveBeenCalled()
  })
})

describe('enviarResumenDiario', () => {
  it('no envia nada si no hay pendientes hoy', async () => {
    vi.mocked(getRecordatoriosEnRango).mockResolvedValue([])

    await enviarResumenDiario('user-1')

    expect(webpush.sendNotification).not.toHaveBeenCalled()
    expect(mocks.valuesInsert).not.toHaveBeenCalled()
  })

  it('con un pendiente usa singular y su titulo como cuerpo', async () => {
    vi.mocked(getRecordatoriosEnRango).mockResolvedValue([crearPendiente({ titulo: 'Pagar recibo' })])

    await enviarResumenDiario('user-1')

    const payload = ultimoPayloadEnviado()
    expect(payload.title).toContain('1 recordatorio hoy')
    expect(payload.body).toBe('Pagar recibo')
  })

  it('con varios pendientes lista dos y agrega "y N mas"', async () => {
    vi.mocked(getRecordatoriosEnRango).mockResolvedValue([
      crearPendiente({ id: 'a', titulo: 'Tarea A' }),
      crearPendiente({ id: 'b', titulo: 'Tarea B' }),
      crearPendiente({ id: 'c', titulo: 'Tarea C' }),
    ])

    await enviarResumenDiario('user-1')

    const payload = ultimoPayloadEnviado()
    expect(payload.title).toContain('3 recordatorios hoy')
    expect(payload.body).toBe('Tarea A, Tarea B y 1 mas')
  })

  it('excluye los recurrentes del resumen', async () => {
    vi.mocked(getRecordatoriosEnRango).mockResolvedValue([
      crearPendiente({ esRecurrente: true, reglaRecurrencia: 'weekly:1' }),
    ])

    await enviarResumenDiario('user-1')

    expect(webpush.sendNotification).not.toHaveBeenCalled()
  })
})
