import { NextRequest, NextResponse } from 'next/server'
import { registrarSuscripcion } from '@/lib/actions/push-subscription.actions'

function detectarDispositivo(userAgent: string): string {
  if (/android/i.test(userAgent)) return 'Chrome Android'
  if (/iphone|ipad/i.test(userAgent)) return 'Safari iOS'
  if (/windows/i.test(userAgent) && /edg/i.test(userAgent)) return 'Edge Windows'
  if (/windows/i.test(userAgent)) return 'Chrome Windows'
  if (/macintosh/i.test(userAgent)) return 'Chrome Mac'
  return 'Navegador desconocido'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { endpoint, keys } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Suscripcion invalida' }, { status: 400 })
    }

    const userAgent = req.headers.get('user-agent') ?? ''
    const nombreDispositivo = detectarDispositivo(userAgent)

    const resultado = await registrarSuscripcion({
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      nombreDispositivo,
    })

    if (!resultado.ok) {
      return NextResponse.json({ error: resultado.error }, { status: 401 })
    }

    return NextResponse.json({ ok: true, id: resultado.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
