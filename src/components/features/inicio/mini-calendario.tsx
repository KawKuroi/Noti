'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils/cn'

interface Props {
  diasConRecordatorios: Record<number, string[]>
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


  return (
    <div className="bg-[var(--bg)] rounded-[14px] border border-[var(--line)] p-4 select-none">
      <p className="font-mono text-[11px] font-medium text-[var(--ink-3)] uppercase tracking-[0.09em] mb-4">
        {MESES[mesActual]} {anioActual}
      </p>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DIAS_SEMANA.map((d) => (
          <span key={d} className="text-center font-mono text-[10px] font-medium text-[var(--ink-3)] uppercase">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {diasDelMes.map((dia, i) => {
          if (dia === null) return <span key={`vacio-${i}`} className="min-h-[38px]" />

          const esHoy = dia === diaHoy
          const colores = diasConRecordatorios[dia] ?? []
          const tieneRec = colores.length > 0

          return (
            <div key={dia} className="flex flex-col items-center py-0.5 min-h-[38px] justify-start">
              <span
                className={cn(
                  'w-7 h-7 flex items-center justify-center rounded-full text-[12.5px] transition-colors',
                  esHoy
                    ? 'bg-[var(--ink)] text-[var(--bg)] font-semibold shadow-sm'
                    : 'text-[var(--ink-2)] hover:bg-[var(--bg-soft)] font-normal cursor-pointer',
                )}
              >
                {dia}
              </span>
              {tieneRec && (
                <div className="flex gap-[3px] mt-[3px] h-1 justify-center">
                  {colores.slice(0, 3).map((c, idx) => (
                    <span
                      key={idx}
                      className="w-[4px] h-[4px] rounded-full shrink-0"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
