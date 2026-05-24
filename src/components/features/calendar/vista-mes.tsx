'use client'

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from 'date-fns'
import { cn } from '@/lib/utils/cn'
import type { Recordatorio } from '@/types/reminder.types'
import type { Categoria } from '@/types/category.types'

const DIAS_CABECERA = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']

interface Props {
  referencia: Date
  recordatorios: Recordatorio[]
  categorias: Categoria[]
  onDiaClick: (dia: Date) => void
}

export function VistaMes({ referencia, recordatorios, categorias, onDiaClick }: Props) {
  const inicio = startOfWeek(startOfMonth(referencia), { weekStartsOn: 1 })
  const fin = endOfWeek(endOfMonth(referencia), { weekStartsOn: 1 })
  const dias = eachDayOfInterval({ start: inicio, end: fin })

  function getDotInfo(dia: Date): { dots: { color: string; id: string }[]; total: number } {
    const delDia = recordatorios.filter((rec) => {
      if (!rec.fechaVencimiento) return false
      const fecha = rec.fechaVencimiento instanceof Date ? rec.fechaVencimiento : new Date(rec.fechaVencimiento)
      return isSameDay(fecha, dia)
    })

    const coloresPorCategoria = new Map<number, string>()
    for (const cat of categorias) {
      coloresPorCategoria.set(cat.id, cat.color)
    }

    const vistos = new Set<number>()
    const dots: { color: string; id: string }[] = []

    for (const rec of delDia) {
      if (!vistos.has(rec.categoriaId)) {
        vistos.add(rec.categoriaId)
        dots.push({
          color: coloresPorCategoria.get(rec.categoriaId) ?? '#6b7280',
          id: `${rec.categoriaId}`,
        })
      }
      if (dots.length >= 3) break
    }

    return { dots, total: delDia.length }
  }

  const filas = dias.length / 7

  return (
    <div className="flex flex-col h-full">
      {/* Cabecera de dias */}
      <div className="grid grid-cols-7 mb-1">
        {DIAS_CABECERA.map((dia) => (
          <div
            key={dia}
            className="py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            {dia}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div
        className="grid grid-cols-7 gap-px bg-border border border-border rounded-xl overflow-hidden flex-1 min-h-0"
        style={{ gridTemplateRows: `repeat(${filas}, minmax(0, 1fr))` }}
      >
        {dias.map((dia) => {
          const esDelMes = isSameMonth(dia, referencia)
          const esDiaHoy = isToday(dia)
          const { dots, total } = getDotInfo(dia)
          const extras = total - dots.length

          return (
            <button
              key={dia.toISOString()}
              onClick={() => total > 0 || esDelMes ? onDiaClick(dia) : undefined}
              className={cn(
                'bg-card p-2 flex flex-col items-start gap-1 hover:bg-accent/50 transition-colors text-left overflow-hidden',
                !esDelMes && 'bg-muted/40',
                total > 0 && 'cursor-pointer',
                total === 0 && !esDelMes && 'cursor-default',
              )}
            >
              <span
                className={cn(
                  'text-sm font-medium leading-none w-6 h-6 flex items-center justify-center rounded-full',
                  esDiaHoy && 'bg-primary text-primary-foreground',
                  !esDiaHoy && esDelMes && 'text-foreground',
                  !esDiaHoy && !esDelMes && 'text-muted-foreground/40',
                )}
              >
                {format(dia, 'd')}
              </span>

              {dots.length > 0 && (
                <div className="flex items-center gap-0.5 flex-wrap">
                  {dots.map((dot) => (
                    <span
                      key={dot.id}
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: dot.color }}
                    />
                  ))}
                  {extras > 0 && (
                    <span className="text-xs text-muted-foreground ml-0.5">+{extras}</span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
