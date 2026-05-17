'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addMonths, addWeeks, isSameDay } from 'date-fns'
import { Button } from '@/components/ui/button'
import { VistaMes } from './vista-mes'
import { VistaSemana } from './vista-semana'
import { DialogDia } from './dialog-dia'
import { formatearMesAno, formatearRangoSemana } from '@/lib/utils/date.utils'
import type { Recordatorio } from '@/types/reminder.types'
import type { Categoria } from '@/types/category.types'

type VistaCalendario = 'mes' | 'semana'

interface Props {
  recordatorios: Recordatorio[]
  categorias: Categoria[]
  vistaInicial: VistaCalendario
  referenciaInicial: Date
}

export function VistaCalendario({
  recordatorios,
  categorias,
  vistaInicial,
  referenciaInicial,
}: Props) {
  const router = useRouter()
  const [vista, setVista] = useState<VistaCalendario>(vistaInicial)
  const [referencia, setReferencia] = useState<Date>(referenciaInicial)
  const [diaAbierto, setDiaAbierto] = useState<Date | null>(null)

  const recordatoriosDeDia = diaAbierto
    ? recordatorios.filter((rec) => {
        const fecha = rec.fechaVencimiento instanceof Date ? rec.fechaVencimiento : new Date(rec.fechaVencimiento)
        return isSameDay(fecha, diaAbierto)
      })
    : []

  function navegar(delta: 1 | -1) {
    const nueva = vista === 'mes'
      ? addMonths(referencia, delta)
      : addWeeks(referencia, delta)
    setReferencia(nueva)

    const mesParam = `${nueva.getFullYear()}-${String(nueva.getMonth() + 1).padStart(2, '0')}`
    router.replace(`/calendar?mes=${mesParam}&vista=${vista}`)
  }

  function irAHoy() {
    const hoy = new Date()
    setReferencia(hoy)
    const mesParam = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
    router.replace(`/calendar?mes=${mesParam}&vista=${vista}`)
  }

  function cambiarVista(nueva: VistaCalendario) {
    setVista(nueva)
    const mesParam = `${referencia.getFullYear()}-${String(referencia.getMonth() + 1).padStart(2, '0')}`
    router.replace(`/calendar?mes=${mesParam}&vista=${nueva}`)
  }

  const titulo = vista === 'mes'
    ? formatearMesAno(referencia)
    : formatearRangoSemana(referencia)

  return (
    <div className="space-y-4">
      {/* Header del calendario */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variante="fantasma" tamano="icono" onClick={() => navegar(-1)} title="Anterior">
            <ChevronLeft size={16} />
          </Button>
          <h2 className="text-base font-semibold text-gray-900 capitalize min-w-[180px] text-center">
            {titulo}
          </h2>
          <Button variante="fantasma" tamano="icono" onClick={() => navegar(1)} title="Siguiente">
            <ChevronRight size={16} />
          </Button>
          <Button variante="contorno" tamano="sm" onClick={irAHoy}>
            Hoy
          </Button>
        </div>

        {/* Toggle vista */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => cambiarVista('mes')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              vista === 'mes'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => cambiarVista('semana')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              vista === 'semana'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Semana
          </button>
        </div>
      </div>

      {/* Vista activa */}
      {vista === 'mes' ? (
        <VistaMes
          referencia={referencia}
          recordatorios={recordatorios}
          categorias={categorias}
          onDiaClick={setDiaAbierto}
        />
      ) : (
        <VistaSemana
          referencia={referencia}
          recordatorios={recordatorios}
          categorias={categorias}
          onDiaClick={setDiaAbierto}
        />
      )}

      <DialogDia
        dia={diaAbierto}
        recordatorios={recordatoriosDeDia}
        categorias={categorias}
        onCerrar={() => setDiaAbierto(null)}
      />
    </div>
  )
}
