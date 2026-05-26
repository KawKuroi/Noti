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

  function getDotInfo(dia: Date): { items: { titulo: string; color: string; id: string }[]; total: number } {
    const delDia = recordatorios.filter((rec) => {
      if (!rec.fechaVencimiento) return false
      const fecha = rec.fechaVencimiento instanceof Date ? rec.fechaVencimiento : new Date(rec.fechaVencimiento)
      return isSameDay(fecha, dia)
    })

    const coloresPorCategoria = new Map<number, string>()
    for (const cat of categorias) {
      coloresPorCategoria.set(cat.id, cat.color)
    }

    const items = delDia.slice(0, 3).map((rec) => ({
      titulo: rec.titulo,
      color: coloresPorCategoria.get(rec.categoriaId) ?? '#6b7280',
      id: rec.id,
    }))

    return { items, total: delDia.length }
  }

  const filas = dias.length / 7

  return (
    <div className="flex flex-col h-full">
      {/* Cabecera de días */}
      <div className="grid grid-cols-7 mb-1">
        {DIAS_CABECERA.map((dia) => (
          <div
            key={dia}
            className="py-2 text-center font-mono text-[10px] font-medium text-[var(--ink-3)] uppercase tracking-[0.09em]"
          >
            {dia}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div
        className="grid grid-cols-7 border border-[var(--line)] rounded-[14px] overflow-hidden flex-1 min-h-0"
        style={{ gridTemplateRows: `repeat(${filas}, minmax(0, 1fr))` }}
      >
        {dias.map((dia, idx) => {
          const esDelMes = isSameMonth(dia, referencia)
          const esDiaHoy = isToday(dia)
          const { items, total } = getDotInfo(dia)
          const extras = total - items.length

          // Border separators
          const esUltFila = idx >= dias.length - 7
          const esPrimerColumna = idx % 7 === 0

          return (
            <button
              key={dia.toISOString()}
              onClick={() => total > 0 || esDelMes ? onDiaClick(dia) : undefined}
              className={cn(
                'p-2 flex flex-col items-start gap-1 transition-colors text-left overflow-hidden focus:outline-none',
                'border-b border-r border-[var(--line)]',
                !esUltFila ? '' : 'border-b-0',
                esPrimerColumna ? 'border-l-0' : '',
                esDelMes
                  ? 'bg-[var(--bg)] hover:bg-[var(--bg-soft)]'
                  : 'bg-[var(--bg-soft)] opacity-60 hover:opacity-80',
                total > 0 && 'cursor-pointer',
                total === 0 && !esDelMes && 'cursor-default',
              )}
            >
              <span
                className={cn(
                  'font-mono text-[12px] font-medium leading-none w-6 h-6 flex items-center justify-center rounded-full',
                  esDiaHoy && 'bg-[var(--ink)] text-[var(--bg)] font-semibold',
                  !esDiaHoy && esDelMes && 'text-[var(--ink-2)]',
                  !esDiaHoy && !esDelMes && 'text-[var(--ink-4)]',
                )}
              >
                {format(dia, 'd')}
              </span>

              {items.length > 0 && (
                <div className="flex flex-col gap-[2px] w-full">
                  {items.map((item) => (
                    <span
                      key={item.id}
                      className="flex items-center gap-1 text-[10px] font-medium leading-tight px-1 py-[2px] rounded-[5px] w-full"
                      style={{
                        backgroundColor: `color-mix(in oklab, ${item.color} 8%, transparent)`,
                        color: item.color,
                      }}
                    >
                      <span
                        className="w-[5px] h-[5px] rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate">{item.titulo}</span>
                    </span>
                  ))}
                  {extras > 0 && (
                    <span className="font-mono text-[10px] text-[var(--ink-3)] mt-0.5 pl-1">
                      +{extras} más
                    </span>
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
