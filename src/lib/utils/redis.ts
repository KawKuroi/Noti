import { Redis } from '@upstash/redis'

// Cliente Redis compartido (rate limiting, watchdog del cron). Acepta los
// nombres nativos de Upstash y los que inyecta el Marketplace de Vercel.
// Devuelve null si no esta provisionado (dev local): cada consumidor decide
// su fallback.
function crearRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

export const redis = crearRedis()
