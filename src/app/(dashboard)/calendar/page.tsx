import type { Metadata } from 'next'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { requerirUsuario } from '@/lib/auth'
import { getRecordatoriosEnRango } from '@/lib/queries/reminder.queries'
import { getCategorias } from '@/lib/queries/category.queries'
import { expandirOcurrenciasEnRango } from '@/lib/utils/date.utils'
import { VistaCalendario } from '@/components/features/calendar/vista-calendario'
import { PageHeader } from '@/components/ui/page-header'

export const metadata: Metadata = { title: 'Calendario | Noti' }

interface Props {
  searchParams: Promise<{ mes?: string; vista?: string; fecha?: string }>
}

export default async function PaginaCalendario({ searchParams }: Props) {
  const usuario = await requerirUsuario()
  const { mes, vista, fecha } = await searchParams

  const vistaActual = vista === 'semana' ? 'semana' : 'mes'

  // Parsear referencia del mes desde query param o usar hoy
  let referencia = new Date()
  if (fecha) {
    const [anio, mesNum, diaNum] = fecha.split('-').map(Number)
    if (!isNaN(anio) && !isNaN(mesNum) && !isNaN(diaNum)) {
      referencia = new Date(anio, mesNum - 1, diaNum)
    }
  } else if (mes) {
    const [anio, mesNum] = mes.split('-').map(Number)
    if (!isNaN(anio) && !isNaN(mesNum)) {
      referencia = new Date(anio, mesNum - 1, 1)
    }
  }

  // Calcular rango ampliado para incluir dias del mes anterior/siguiente visibles en la grilla
  let rangoInicio: Date
  let rangoFin: Date

  if (vistaActual === 'mes') {
    rangoInicio = startOfWeek(startOfMonth(referencia), { weekStartsOn: 1 })
    rangoFin = endOfWeek(endOfMonth(referencia), { weekStartsOn: 1 })
  } else {
    rangoInicio = startOfWeek(referencia, { weekStartsOn: 1 })
    rangoFin = endOfWeek(referencia, { weekStartsOn: 1 })
  }

  const [recordatoriosRaw, categorias] = await Promise.all([
    getRecordatoriosEnRango(usuario.id, rangoInicio, rangoFin),
    getCategorias(),
  ])

  const recordatorios = expandirOcurrenciasEnRango(recordatoriosRaw, rangoInicio, rangoFin)

  return (
    <div className="flex flex-col gap-4 h-full">
      <PageHeader
        title="Calendario"
        subtitle="Vista mensual y semanal de todos tus recordatorios."
        icon={<CalendarDays size={20} />}
        iconColor="var(--cat-estudio)"
      />

      <div className="flex-1 min-h-0">
        <VistaCalendario
          recordatorios={recordatorios}
          categorias={categorias}
          vistaInicial={vistaActual}
          referenciaInicial={referencia}
        />
      </div>
    </div>
  )
}
