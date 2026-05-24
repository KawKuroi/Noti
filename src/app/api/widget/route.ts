import { NextResponse } from 'next/server'
import { obtenerUsuario } from '@/lib/auth'
import { getRecordatoriosProximos } from '@/lib/queries/reminder.queries'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export async function GET() {
  const usuario = await obtenerUsuario()
  if (!usuario) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const proximos = await getRecordatoriosProximos(usuario.id, 5)

  if (proximos.length === 0) {
    return NextResponse.json({ proximosTexto: 'No tienes recordatorios proximos.' })
  }

  const lineas = proximos.map((r) => {
    const fecha = r.fechaVencimiento
      ? format(new Date(r.fechaVencimiento), "d 'de' MMMM", { locale: es })
      : ''
    return fecha ? `• ${r.titulo} — ${fecha}` : `• ${r.titulo}`
  })

  return NextResponse.json({ proximosTexto: lineas.join('\n') })
}
