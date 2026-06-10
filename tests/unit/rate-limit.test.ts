import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Sin Redis provisionado: se prueba el fallback en memoria, que es el camino
// de dev local y la degradacion cuando Redis falla en produccion.
vi.mock('@/lib/utils/redis', () => ({ redis: null }))

import { verificarLimite } from '@/lib/utils/rate-limit'

describe('verificarLimite — fallback en memoria', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 10, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('permite solicitudes dentro del limite', async () => {
    for (let i = 0; i < 3; i++) {
      expect(await verificarLimite('clave-dentro', 3, 60000)).toEqual({ ok: true })
    }
  })

  it('bloquea la solicitud que excede el limite', async () => {
    for (let i = 0; i < 2; i++) {
      await verificarLimite('clave-bloqueo', 2, 60000)
    }
    const resultado = await verificarLimite('clave-bloqueo', 2, 60000)
    expect(resultado.ok).toBe(false)
  })

  it('reporta retryAfter en segundos hasta liberar la ventana', async () => {
    await verificarLimite('clave-retry', 1, 60000)
    const resultado = await verificarLimite('clave-retry', 1, 60000)
    expect(resultado.ok).toBe(false)
    expect(resultado.retryAfter).toBe(60)
  })

  it('la ventana se desliza: pasado el tiempo vuelve a permitir', async () => {
    await verificarLimite('clave-ventana', 1, 60000)
    expect((await verificarLimite('clave-ventana', 1, 60000)).ok).toBe(false)

    vi.advanceTimersByTime(60001)
    expect((await verificarLimite('clave-ventana', 1, 60000)).ok).toBe(true)
  })

  it('claves distintas no comparten contador', async () => {
    await verificarLimite('clave-a', 1, 60000)
    expect((await verificarLimite('clave-b', 1, 60000)).ok).toBe(true)
  })

  it('un avance parcial reduce el retryAfter', async () => {
    await verificarLimite('clave-parcial', 1, 60000)
    vi.advanceTimersByTime(45000)
    const resultado = await verificarLimite('clave-parcial', 1, 60000)
    expect(resultado.ok).toBe(false)
    expect(resultado.retryAfter).toBe(15)
  })
})
