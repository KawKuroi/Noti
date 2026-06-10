// fetch con timeout y reintento para los servicios de APIs externas.
// Sin esto, una API lenta cuelga la request hasta el limite de Vercel (30s)
// y un fallo transitorio de red pierde la busqueda completa.

interface OpcionesFetchConTimeout {
  // Milisegundos antes de abortar cada intento
  timeoutMs?: number
  // Reintentos adicionales ante error de red o respuesta 5xx
  reintentos?: number
  // Espera entre reintentos
  esperaMs?: number
}

const DEFAULTS: Required<OpcionesFetchConTimeout> = {
  timeoutMs: 6000,
  reintentos: 1,
  esperaMs: 300,
}

export async function fetchConTimeout(
  url: string,
  init: RequestInit = {},
  opciones: OpcionesFetchConTimeout = {},
): Promise<Response> {
  const { timeoutMs, reintentos, esperaMs } = { ...DEFAULTS, ...opciones }

  let ultimoError: unknown
  for (let intento = 0; intento <= reintentos; intento++) {
    try {
      const respuesta = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(timeoutMs),
      })
      // 5xx transitorio: reintentar; 4xx es definitivo, se devuelve tal cual
      if (respuesta.status >= 500 && intento < reintentos) {
        ultimoError = new Error(`HTTP ${respuesta.status}`)
        await new Promise((r) => setTimeout(r, esperaMs))
        continue
      }
      return respuesta
    } catch (e) {
      ultimoError = e
      if (intento < reintentos) {
        await new Promise((r) => setTimeout(r, esperaMs))
      }
    }
  }
  throw ultimoError
}
