import { NextRequest, NextResponse } from 'next/server'
import { procesarRecordatoriosPendientes, procesarCountdownCumpleanos } from '@/lib/services/push.service'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const [{ procesados }, { enviados: cumpleanosEnviados }] = await Promise.all([
      procesarRecordatoriosPendientes(),
      procesarCountdownCumpleanos(),
    ])
    return NextResponse.json({ ok: true, procesados, cumpleanosEnviados })
  } catch (e) {
    console.error('Error en cron de notificaciones:', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
