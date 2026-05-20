'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils/cn'

interface Props {
  diasConRecordatorios: number[]
}

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function MiniCalendario({ diasConRecordatorios }: Props) {
  const hoy = new Date()
  const mesActual = hoy.getMonth()
  const anioActual = hoy.getFullYear()
  const diaHoy = hoy.getDate()

  const diasDelMes = useMemo(() => {
    const primero = new Date(anioActual, mesActual, 1)
    // lunes = 0, domingo = 6 (ajuste para semana que empieza en lunes)
    const primerDiaSemana = (primero.getDay() + 6) % 7
    const totalDias = new Date(anioActual, mesActual + 1, 0).getDate()

    const celdas: (number | null)[] = Array(primerDiaSemana).fill(null)
    for (let d = 1; d <= totalDias; d++) celdas.push(d)
    // rellenar hasta múltiplo de 7
    while (celdas.length % 7 !== 0) celdas.push(null)
    return celdas
  }, [mesActual, anioActual])

  const conjuntoConRec = useMemo(() => new Set(diasConRecordatorios), [diasConRecordatorios])

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-semibold text-gray-700 mb-3">
        {MESES[mesActual]} {anioActual}
      </p>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DIAS_SEMANA.map((d) => (
          <span key={d} className="text-center text-[10px] font-medium text-gray-400">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {diasDelMes.map((dia, i) => {
          if (dia === null) return <span key={`vacio-${i}`} />

          const esHoy = dia === diaHoy
          const tieneRec = conjuntoConRec.has(dia)

          return (
            <div key={dia} className="flex flex-col items-center gap-0.5 py-0.5">
              <span
                className={cn(
                  'w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-medium',
                  esHoy ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100',
                )}
              >
                {dia}
              </span>
              {tieneRec && !esHoy && (
                <span className="w-1 h-1 rounded-full bg-purple-400" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
