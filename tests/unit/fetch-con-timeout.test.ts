import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { fetchConTimeout } from '@/lib/utils/fetch-con-timeout'

// esperaMs minimo para que los reintentos no alarguen la suite.
const OPCIONES_RAPIDAS = { esperaMs: 1 }

function respuesta(status: number): Response {
  return new Response('cuerpo', { status })
}

describe('fetchConTimeout', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('devuelve la respuesta exitosa al primer intento', async () => {
    fetchMock.mockResolvedValue(respuesta(200))
    const res = await fetchConTimeout('https://api.test/ok', {}, OPCIONES_RAPIDAS)
    expect(res.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('reintenta ante un 5xx y devuelve el exito posterior', async () => {
    fetchMock.mockResolvedValueOnce(respuesta(503)).mockResolvedValueOnce(respuesta(200))
    const res = await fetchConTimeout('https://api.test/5xx-luego-ok', {}, OPCIONES_RAPIDAS)
    expect(res.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('un 5xx persistente agota los reintentos y devuelve la ultima respuesta', async () => {
    fetchMock.mockResolvedValue(respuesta(500))
    const res = await fetchConTimeout('https://api.test/5xx', {}, OPCIONES_RAPIDAS)
    expect(res.status).toBe(500)
    expect(fetchMock).toHaveBeenCalledTimes(2) // intento original + 1 reintento
  })

  it('un 4xx es definitivo: no reintenta', async () => {
    fetchMock.mockResolvedValue(respuesta(404))
    const res = await fetchConTimeout('https://api.test/404', {}, OPCIONES_RAPIDAS)
    expect(res.status).toBe(404)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('reintenta ante error de red y devuelve el exito posterior', async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(respuesta(200))
    const res = await fetchConTimeout('https://api.test/red-luego-ok', {}, OPCIONES_RAPIDAS)
    expect(res.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('un error de red persistente lanza el ultimo error', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'))
    await expect(fetchConTimeout('https://api.test/red', {}, OPCIONES_RAPIDAS)).rejects.toThrow(
      'fetch failed',
    )
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('respeta la cantidad de reintentos configurada', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'))
    await expect(
      fetchConTimeout('https://api.test/3-reintentos', {}, { ...OPCIONES_RAPIDAS, reintentos: 3 }),
    ).rejects.toThrow()
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('aborta por timeout cuando la API no responde', async () => {
    // El mock nunca resuelve: solo rechaza cuando AbortSignal.timeout dispara.
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal!.reason))
        }),
    )
    await expect(
      fetchConTimeout('https://api.test/lenta', {}, { ...OPCIONES_RAPIDAS, timeoutMs: 30, reintentos: 0 }),
    ).rejects.toMatchObject({ name: 'TimeoutError' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('pasa los headers del init al fetch subyacente', async () => {
    fetchMock.mockResolvedValue(respuesta(200))
    await fetchConTimeout(
      'https://api.test/headers',
      { headers: { 'User-Agent': 'Noti' } },
      OPCIONES_RAPIDAS,
    )
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.test/headers',
      expect.objectContaining({ headers: { 'User-Agent': 'Noti' } }),
    )
  })
})
