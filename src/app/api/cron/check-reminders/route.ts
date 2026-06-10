import { NextRequest, NextResponse } from 'next/server'
import { procesarRecordatoriosPendientes, procesarCumpleanos } from '@/lib/services/push.service'
import { registrarPingCron } from '@/lib/services/cron-health.service'
import { verificarCronSecret } from '@/lib/utils/cron-auth'

export async function GET(req: NextRequest) {
  if (!verificarCronSecret(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const [{ procesados }, { enviados: cumpleanosEnviados }] = await Promise.all([
      procesarRecordatoriosPendientes(),
      procesarCumpleanos(),
    ])
    // Watchdog: /settings avisa si este ping deja de llegar (cron caido).
    await registrarPingCron()
    return NextResponse.json({ ok: true, procesados, cumpleanosEnviados })
  } catch (e) {
    console.error('Error en cron de notificaciones:', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
