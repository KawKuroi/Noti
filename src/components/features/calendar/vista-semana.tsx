'use client'

import { useEffect, useRef } from 'react'
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

// Altura en pixeles asignada a cada hora del timeline. Define la densidad vertical.
const ALTO_FILA = 48
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

  const refScroll = useRef<HTMLDivElement>(null)

  // Posicionar el timeline a las 07:00 al montar la vista para no aparecer en madrugada vacia.
  useEffect(() => {
    if (refScroll.current) {
      refScroll.current.scrollTop = 7 * ALTO_FILA
    }
  }, [])

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

  // Pre-calcular eventos por dia separando los all-day del timeline horario.
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
    <div className="flex flex-col h-full min-h-0 border border-gray-100 rounded-xl overflow-hidden bg-white">
      {/* Cabecera de dias (sticky visualmente arriba) */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-100 bg-white">
        <div />
        {dias.map((dia) => {
          const esDiaHoy = isToday(dia)
          return (
            <div
              key={dia.toISOString()}
              className={cn(
                'px-2 py-2 text-center border-l border-gray-50',
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
          )
        })}
      </div>

      {/* Fila "Todo el dia" — solo se renderiza si hay al menos un evento sin hora esa semana. */}
      {hayEventosTodoElDia && (
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-100 bg-gray-50/40">
          <div className="text-xs text-gray-400 px-2 py-1 text-right">Todo el dia</div>
          {eventosPorDia.map(({ dia, todoElDia }) => (
            <div key={`allday-${dia.toISOString()}`} className="border-l border-gray-50 p-1 space-y-1">
              {todoElDia.map((rec) => {
                const color = coloresPorCategoria.get(rec.categoriaId) ?? '#6b7280'
                return (
                  <button
                    key={`allday-${rec.id}`}
                    onClick={() => onDiaClick(dia)}
                    className="w-full text-left rounded-md px-1.5 py-1 hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: `${color}18`, borderLeft: `2px solid ${color}` }}
                  >
                    <p className="text-xs font-medium text-gray-900 truncate">{rec.titulo}</p>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* Cuerpo scrolleable con timeline horario. */}
      <div ref={refScroll} className="flex-1 min-h-0 overflow-y-auto">
        <div
          className="grid grid-cols-[60px_repeat(7,1fr)]"
          style={{ height: 24 * ALTO_FILA }}
        >
          {/* Columna de horas */}
          <div className="relative">
            {HORAS.map((hora) => (
              <div
                key={`hora-${hora}`}
                className="text-xs text-gray-400 text-right pr-2 -mt-2"
                style={{ height: ALTO_FILA }}
              >
                {hora === 0 ? '' : `${String(hora).padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          {/* Una columna por dia con eventos posicionados absolutamente.
              El manejo de eventos solapados queda fuera de alcance: si dos eventos comparten hora se renderizan apilados con overlap visual. */}
          {eventosPorDia.map(({ dia, conHora }) => (
            <div
              key={`col-${dia.toISOString()}`}
              className="relative border-l border-gray-50"
              style={{ height: 24 * ALTO_FILA }}
            >
              {/* Lineas guia horizontales por cada hora. */}
              {HORAS.map((hora) => (
                <div
                  key={`linea-${dia.toISOString()}-${hora}`}
                  className="border-t border-gray-50"
                  style={{ height: ALTO_FILA }}
                />
              ))}

              {/* Eventos del dia posicionados por hora. */}
              {conHora.map((rec) => {
                const fecha = rec.fechaVencimiento instanceof Date ? rec.fechaVencimiento : new Date(rec.fechaVencimiento!)
                const color = coloresPorCategoria.get(rec.categoriaId) ?? '#6b7280'
                const posicionTop = (fecha.getHours() + fecha.getMinutes() / 60) * ALTO_FILA

                return (
                  <button
                    key={`${rec.id}-${fecha.getTime()}`}
                    onClick={() => onDiaClick(dia)}
                    className="absolute left-1 right-1 rounded-md px-1.5 py-1 text-left hover:opacity-80 transition-opacity overflow-hidden"
                    style={{
                      top: posicionTop,
                      height: ALTO_FILA - 4,
                      backgroundColor: `${color}18`,
                      borderLeft: `2px solid ${color}`,
                    }}
                  >
                    <p className="text-xs font-medium text-gray-900 truncate">{rec.titulo}</p>
                    <p className="text-xs text-gray-400">{formatearHora(fecha)}</p>
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
