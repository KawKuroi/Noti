import { Ratelimit } from '@upstash/ratelimit'
import type { Redis } from '@upstash/redis'
import { redis } from './redis'

// Rate limiting distribuido con Upstash Redis (sliding window).
// En Vercel serverless cada instancia tiene su propia memoria, por lo que un
// Map local solo protege dentro de la instancia; Redis comparte el contador
// entre todas. Si faltan las env vars (desarrollo local sin Redis) se usa el
// fallback en memoria con la misma semantica.

interface ResultadoLimite {
  ok: boolean
  retryAfter?: number
}

// ---------------------------------------------------------------------------
// Fallback en memoria (dev local / Redis no provisionado)
// ---------------------------------------------------------------------------

const ventanas = new Map<string, number[]>()

function verificarLimiteMemoria(
  clave: string,
  max: number,
  ventanaMs: number,
): ResultadoLimite {
  const ahora = Date.now()
  const inicio = ahora - ventanaMs
  const previas = (ventanas.get(clave) ?? []).filter((t) => t > inicio)

  if (previas.length >= max) {
    const retryAfter = Math.ceil((previas[0] + ventanaMs - ahora) / 1000)
    return { ok: false, retryAfter }
  }

  previas.push(ahora)
  ventanas.set(clave, previas)
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Upstash Redis (produccion)
// ---------------------------------------------------------------------------

// Un Ratelimit por combinacion max/ventana, cacheado a nivel de modulo para
// reutilizarlo entre invocaciones de la misma instancia.
const limitadores = new Map<string, Ratelimit>()

function obtenerLimitador(max: number, ventanaMs: number): Ratelimit {
  const claveConfig = `${max}:${ventanaMs}`
  let limitador = limitadores.get(claveConfig)
  if (!limitador) {
    limitador = new Ratelimit({
      redis: redis as Redis,
      limiter: Ratelimit.slidingWindow(max, `${ventanaMs} ms`),
      prefix: 'noti-rl',
    })
    limitadores.set(claveConfig, limitador)
  }
  return limitador
}

// ---------------------------------------------------------------------------
// API publica — misma firma que la version en memoria, ahora async
// ---------------------------------------------------------------------------

export async function verificarLimite(
  clave: string,
  max: number,
  ventanaMs: number,
): Promise<ResultadoLimite> {
  if (!redis) return verificarLimiteMemoria(clave, max, ventanaMs)

  try {
    const resultado = await obtenerLimitador(max, ventanaMs).limit(clave)
    if (resultado.success) return { ok: true }
    const retryAfter = Math.max(1, Math.ceil((resultado.reset - Date.now()) / 1000))
    return { ok: false, retryAfter }
  } catch (e) {
    // Redis caido no debe tumbar la ruta: degradar al fallback en memoria.
    console.error('[rate-limit] Error de Redis, usando fallback en memoria:', e)
    return verificarLimiteMemoria(clave, max, ventanaMs)
  }
}
