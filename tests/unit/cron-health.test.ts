import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Redis intercambiable por test: getter para que el modulo bajo prueba lea el
// valor vigente en cada acceso (null = no provisionado).
interface RedisFalso {
  set: ReturnType<typeof vi.fn>
  get: ReturnType<typeof vi.fn>
}
const estado: { redis: RedisFalso | null } = { redis: null }

vi.mock('@/lib/utils/redis', () => ({
  get redis() {
    return estado.redis
  },
}))

import {
  registrarPingCron,
  obtenerUltimoPingCron,
  cronEstaCaido,
  UMBRAL_CRON_CAIDO_MS,
} from '@/lib/services/cron-health.service'

describe('cron-health — sin Redis (dev local)', () => {
  beforeEach(() => {
    estado.redis = null
  })

  it('registrarPingCron es un no-op silencioso', async () => {
    await expect(registrarPingCron()).resolves.toBeUndefined()
  })

  it('obtenerUltimoPingCron devuelve null', async () => {
    expect(await obtenerUltimoPingCron()).toBeNull()
  })

  it('cronEstaCaido devuelve null (sin datos, no avisar)', async () => {
    expect(await cronEstaCaido()).toBeNull()
  })
})

describe('cron-health — con Redis', () => {
  beforeEach(() => {
    estado.redis = { set: vi.fn().mockResolvedValue('OK'), get: vi.fn() }
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('registrarPingCron guarda el timestamp actual', async () => {
    await registrarPingCron()
    expect(estado.redis!.set).toHaveBeenCalledWith('noti:cron:ultimo-ping', expect.any(Number))
  })

  it('obtenerUltimoPingCron convierte el valor a Date', async () => {
    const timestamp = Date.now() - 1000
    estado.redis!.get.mockResolvedValue(timestamp)
    expect(await obtenerUltimoPingCron()).toEqual(new Date(timestamp))
  })

  it('cronEstaCaido es false con un ping reciente', async () => {
    estado.redis!.get.mockResolvedValue(Date.now() - 60 * 1000)
    expect(await cronEstaCaido()).toBe(false)
  })

  it('cronEstaCaido es true cuando el ping supera el umbral', async () => {
    estado.redis!.get.mockResolvedValue(Date.now() - UMBRAL_CRON_CAIDO_MS - 1000)
    expect(await cronEstaCaido()).toBe(true)
  })

  it('cronEstaCaido es null si nunca llego un ping', async () => {
    estado.redis!.get.mockResolvedValue(null)
    expect(await cronEstaCaido()).toBeNull()
  })

  it('un error de lectura no propaga: devuelve null', async () => {
    estado.redis!.get.mockRejectedValue(new Error('Redis caido'))
    expect(await obtenerUltimoPingCron()).toBeNull()
  })

  it('un error de escritura no propaga', async () => {
    estado.redis!.set.mockRejectedValue(new Error('Redis caido'))
    await expect(registrarPingCron()).resolves.toBeUndefined()
  })
})
