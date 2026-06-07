import { getPerfilesConResumenDiario } from '@/lib/queries/user.queries'
import { enviarResumenDiario } from '@/lib/services/push.service'
import { verificarCronSecret } from '@/lib/utils/cron-auth'

export const maxDuration = 60

export async function GET(req: Request) {
  if (!verificarCronSecret(req)) {
    return new Response('No autorizado', { status: 401 })
  }

  const ahora = new Date()
  const horaUTC = `${String(ahora.getUTCHours()).padStart(2, '0')}:00`

  const perfiles = await getPerfilesConResumenDiario(horaUTC)

  let enviados = 0
  for (const perfil of perfiles) {
    await enviarResumenDiario(perfil.id)
    enviados++
  }

  return Response.json({ ok: true, horaUTC, enviados })
}
