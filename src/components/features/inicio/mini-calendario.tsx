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
    <div className="bg-card rounded-xl border border-border p-5">
      <p className="text-xs font-semibold text-foreground mb-3">
        {MESES[mesActual]} {anioActual}
      </p>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DIAS_SEMANA.map((d) => (
          <span key={d} className="text-center text-[10px] font-medium text-muted-foreground">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {diasDelMes.map((dia, i) => {
          if (dia === null) return <span key={`vacio-${i}`} />

          const esHoy = dia === diaHoy
          const colores = diasConRecordatorios[dia] ?? []
          const tieneRec = colores.length > 0

          return (
            <div key={dia} className="flex flex-col items-center gap-0.5 py-0.5">
              <span
                className={cn(
                  'w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium',
                  esHoy ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent',
                )}
              >
                {dia}
              </span>
              {tieneRec && !esHoy && (
                <div className="flex gap-0.5">
                  {colores.slice(0, 3).map((c, idx) => (
                    <span
                      key={idx}
                      className="w-1.5 h-1.5 rounded-full"
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
