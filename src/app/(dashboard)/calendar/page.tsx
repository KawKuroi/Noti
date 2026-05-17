import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
} from 'date-fns'
import { requerirUsuario } from '@/lib/auth'
import { getRecordatoriosEnRango } from '@/lib/queries/reminder.queries'
import { getCategorias } from '@/lib/queries/category.queries'
import { expandirOcurrenciasEnRango } from '@/lib/utils/date.utils'
import { VistaCalendario } from '@/components/features/calendar/vista-calendario'

interface Props {
  searchParams: Promise<{ mes?: string; vista?: string }>
}

export default async function PaginaCalendario({ searchParams }: Props) {
  const usuario = await requerirUsuario()
  const { mes, vista } = await searchParams

  const vistaActual = vista === 'semana' ? 'semana' : 'mes'

  // Parsear referencia del mes desde query param o usar hoy
  let referencia = new Date()
  if (mes) {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
        <p className="text-sm text-gray-500 mt-1">Vista mensual y semanal de todos tus recordatorios.</p>
      </div>

      <VistaCalendario
        recordatorios={recordatorios}
        categorias={categorias}
        vistaInicial={vistaActual}
        referenciaInicial={referencia}
      />
    </div>
  )
}
