import { timingSafeEqual } from 'crypto'

// Verifica el header Authorization de las rutas de cron contra CRON_SECRET usando una
// comparacion de tiempo constante (evita timing attacks sobre el token). Devuelve false
// si falta el secreto, falta el header o no coincide.
export function verificarCronSecret(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return false

  const authHeader = req.headers.get('authorization')
  if (!authHeader) return false

  const recibido = Buffer.from(authHeader)
  const esperado = Buffer.from(`Bearer ${cronSecret}`)

  // timingSafeEqual exige longitudes iguales; la diferencia de longitud no es secreta.
  if (recibido.length !== esperado.length) return false
  return timingSafeEqual(recibido, esperado)
}
