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

const HORAS = Array.from({ length: 24 }, (_, indice) => indice)

function esTodoElDia(fecha: Date): boolean {
  return fecha.getHours() === 0 && fecha.getMinutes() === 0
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
        if (!rec.fechaVencimiento) return false
        const fecha = rec.fechaVencimiento instanceof Date ? rec.fechaVencimiento : new Date(rec.fechaVencimiento)
        return isSameDay(fecha, dia)
      })
      .sort((a, b) => {
        const fa = a.fechaVencimiento instanceof Date ? a.fechaVencimiento : new Date(a.fechaVencimiento!)
        const fb = b.fechaVencimiento instanceof Date ? b.fechaVencimiento : new Date(b.fechaVencimiento!)
        return fa.getTime() - fb.getTime()
      })
  }

  const eventosPorDia = dias.map((dia) => {
    const items = recordatoriosDelDia(dia)
    const todoElDia: Recordatorio[] = []
    const conHora: Recordatorio[] = []
    for (const rec of items) {
      const fecha = rec.fechaVencimiento instanceof Date ? rec.fechaVencimiento : new Date(rec.fechaVencimiento!)
      if (esTodoElDia(fecha)) {
        todoElDia.push(rec)
      } else {
        conHora.push(rec)
      }
    }
    return { dia, todoElDia, conHora }
  })

  const hayEventosTodoElDia = eventosPorDia.some((d) => d.todoElDia.length > 0)

  return (
    <div className="flex flex-col h-full min-h-0 border border-(--line) rounded-[14px] overflow-hidden bg-(--bg)">
      {/* Cabecera de dias */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-(--line) bg-(--bg)">
        <div />
        {dias.map((dia) => {
          const esDiaHoy = isToday(dia)
          return (
            <div
              key={dia.toISOString()}
              className={cn(
                'px-2 py-2 text-center border-l border-(--line)',
                esDiaHoy && 'bg-(--ink)',
              )}
            >
              <p className={cn('mono text-[11px] uppercase tracking-[0.08em]', esDiaHoy ? 'text-(--bg)' : 'text-(--ink-3)')}>
                {format(dia, 'EEE', { locale: es })}
              </p>
              <p className={cn('text-sm font-medium', esDiaHoy ? 'text-(--bg)' : 'text-(--ink)')}>
                {format(dia, 'd')}
              </p>
            </div>
          )
        })}
      </div>

      {/* Fila "Todo el dia" — solo si hay al menos un evento sin hora esa semana. */}
      {hayEventosTodoElDia && (
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-(--line) bg-(--bg-soft)">
          <div className="mono text-[11px] text-(--ink-3) uppercase tracking-[0.08em] px-2 py-1 text-right">Todo el dia</div>
          {eventosPorDia.map(({ dia, todoElDia }) => (
            <div key={`allday-${dia.toISOString()}`} className="border-l border-(--line) p-1 space-y-1">
              {todoElDia.map((rec) => {
                const color = coloresPorCategoria.get(rec.categoriaId) ?? 'var(--ink-3)'
                return (
                  <button
                    key={`allday-${rec.id}`}
                    onClick={() => onDiaClick(dia)}
                    className="w-full text-left rounded-[5px] px-1.5 py-1 hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: `color-mix(in oklab, ${color} 8%, transparent)`, color }}
                  >
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--ink)' }}>{rec.titulo}</p>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* Cuerpo del timeline horario. */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div
          className="grid grid-cols-[60px_repeat(7,1fr)] h-full"
          style={{ gridTemplateRows: 'repeat(24, minmax(0, 1fr))' }}
        >
          {/* Columna de horas */}
          {HORAS.map((hora) => (
            <div
              key={`hora-${hora}`}
              className="mono text-[10px] text-(--ink-3) text-right pr-2 leading-none -translate-y-1.5"
              style={{ gridColumn: '1', gridRow: `${hora + 1}` }}
            >
              {hora === 0 ? '' : `${String(hora).padStart(2, '0')}:00`}
            </div>
          ))}

          {/* Una columna por dia. */}
          {eventosPorDia.map(({ dia, conHora }, indiceDia) => (
            <div
              key={`col-${dia.toISOString()}`}
              className="relative border-l border-(--line)"
              style={{ gridColumn: `${indiceDia + 2}`, gridRow: '1 / span 24' }}
            >
              {HORAS.map((hora) => (
                <div
                  key={`linea-${dia.toISOString()}-${hora}`}
                  className="absolute left-0 right-0 border-t border-(--line)"
                  style={{ top: `${(hora / 24) * 100}%` }}
                />
              ))}

              {conHora.map((rec) => {
                const fecha =
                  rec.fechaVencimiento instanceof Date
                    ? rec.fechaVencimiento
                    : new Date(rec.fechaVencimiento!)
                const color = coloresPorCategoria.get(rec.categoriaId) ?? 'var(--ink-3)'
                const posicionTop =
                  ((fecha.getHours() + fecha.getMinutes() / 60) / 24) * 100

                return (
                  <button
                    key={`${rec.id}-${fecha.getTime()}`}
                    onClick={() => onDiaClick(dia)}
                    className="absolute left-1 right-1 rounded-[5px] px-1.5 text-left hover:opacity-80 transition-opacity overflow-hidden"
                    style={{
                      top: `${posicionTop}%`,
                      height: `${(1 / 24) * 100}%`,
                      backgroundColor: `color-mix(in oklab, ${color} 8%, transparent)`,
                      borderLeft: `2px solid ${color}`,
                    }}
                  >
                    <p className="text-[11px] font-medium text-(--ink) truncate leading-tight">
                      {rec.titulo}
                    </p>
                    <p className="mono text-[10px] text-(--ink-3) leading-tight">
                      {formatearHora(fecha)}
                    </p>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
