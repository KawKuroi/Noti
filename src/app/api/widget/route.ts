import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { obtenerUsuario } from '@/lib/auth'
import { getRecordatoriosProximos } from '@/lib/queries/reminder.queries'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'

export async function GET() {
  const usuario = await obtenerUsuario()
  if (!usuario) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const jar = await cookies()
  const locale = jar.get('NEXT_LOCALE')?.value === 'en' ? enUS : es
  const sinResultados = locale === enUS ? 'No upcoming reminders.' : 'No tienes recordatorios proximos.'

  const proximos = await getRecordatoriosProximos(usuario.id, 5)

  if (proximos.length === 0) {
    return NextResponse.json({ proximosTexto: sinResultados })
  }

  const patron = locale === enUS ? 'MMMM d' : "d 'de' MMMM"
  const lineas = proximos.map((r) => {
    const fecha = r.fechaVencimiento
      ? format(new Date(r.fechaVencimiento), patron, { locale })
      : ''
    return fecha ? `• ${r.titulo} — ${fecha}` : `• ${r.titulo}`
  })

  return NextResponse.json({ proximosTexto: lineas.join('\n') })
}
