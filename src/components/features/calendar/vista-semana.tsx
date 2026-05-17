'use client'

import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  format,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils/cn'
import { formatearHora } from '@/lib/utils/date.utils'
import type { Recordatorio } from '@/types/reminder.types'
import type { Categoria } from '@/types/category.types'

interface Props {
  referencia: Date
  recordatorios: Recordatorio[]
  categorias: Categoria[]
  onDiaClick: (dia: Date) => void
}

export function VistaSemana({ referencia, recordatorios, categorias, onDiaClick }: Props) {
  const inicio = startOfWeek(referencia, { weekStartsOn: 1 })
  const fin = endOfWeek(referencia, { weekStartsOn: 1 })
  const dias = eachDayOfInterval({ start: inicio, end: fin })

  const coloresPorCategoria = new Map<number, string>()
  for (const cat of categorias) {
    coloresPorCategoria.set(cat.id, cat.color)
  }

  function recordatoriosDelDia(dia: Date): Recordatorio[] {
    return recordatorios
      .filter((rec) => {
        const fecha = rec.fechaVencimiento instanceof Date ? rec.fechaVencimiento : new Date(rec.fechaVencimiento)
        return isSameDay(fecha, dia)
      })
      .sort((a, b) => {
        const fa = a.fechaVencimiento instanceof Date ? a.fechaVencimiento : new Date(a.fechaVencimiento)
        const fb = b.fechaVencimiento instanceof Date ? b.fechaVencimiento : new Date(b.fechaVencimiento)
        return fa.getTime() - fb.getTime()
      })
  }

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-xl overflow-hidden">
      {dias.map((dia) => {
        const esDiaHoy = isToday(dia)
        const items = recordatoriosDelDia(dia)

        return (
          <div key={dia.toISOString()} className="bg-white min-h-[200px] flex flex-col">
            {/* Cabecera del dia */}
            <div
              className={cn(
                'px-2 py-2 text-center border-b border-gray-50',
                esDiaHoy && 'bg-gray-900',
              )}
            >
              <p className={cn('text-xs font-medium uppercase', esDiaHoy ? 'text-white' : 'text-gray-400')}>
                {format(dia, 'EEE', { locale: es })}
              </p>
              <p className={cn('text-sm font-bold', esDiaHoy ? 'text-white' : 'text-gray-900')}>
                {format(dia, 'd')}
              </p>
            </div>

            {/* Recordatorios del dia */}
            <div className="flex-1 p-1.5 space-y-1 overflow-y-auto max-h-64">
              {items.map((rec) => {
                const fecha = rec.fechaVencimiento instanceof Date ? rec.fechaVencimiento : new Date(rec.fechaVencimiento)
                const color = coloresPorCategoria.get(rec.categoriaId) ?? '#6b7280'

                return (
                  <button
                    key={`${rec.id}-${fecha.getTime()}`}
                    onClick={() => onDiaClick(dia)}
                    className="w-full text-left rounded-md px-1.5 py-1 hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: `${color}18`, borderLeft: `2px solid ${color}` }}
                  >
                    <p className="text-xs font-medium text-gray-900 truncate">{rec.titulo}</p>
                    <p className="text-xs text-gray-400">{formatearHora(fecha)}</p>
                  </button>
                )
              })}

              {items.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <span className="text-xs text-gray-300">—</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
