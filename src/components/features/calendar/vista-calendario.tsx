'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { addMonths, addWeeks, isSameDay } from 'date-fns'
import { Button } from '@/components/ui/button'
import { VistaMes } from './vista-mes'
import { VistaSemana } from './vista-semana'
import { DialogDia } from './dialog-dia'
import { FiltroCalendario } from './filtro-calendario'
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
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<number[]>([])

  const recordatoriosFiltrados = categoriasSeleccionadas.length > 0
    ? recordatorios.filter((rec) => categoriasSeleccionadas.includes(rec.categoriaId))
    : recordatorios

  const recordatoriosDeDia = diaAbierto
    ? recordatoriosFiltrados.filter((rec) => {
        if (!rec.fechaVencimiento) return false
        const fecha = rec.fechaVencimiento instanceof Date ? rec.fechaVencimiento : new Date(rec.fechaVencimiento)
        return isSameDay(fecha, diaAbierto)
      })
    : []

  function navegar(delta: 1 | -1) {
    const nueva = vista === 'mes'
      ? addMonths(referencia, delta)
      : addWeeks(referencia, delta)
    setReferencia(nueva)

    const fechaParam = `${nueva.getFullYear()}-${String(nueva.getMonth() + 1).padStart(2, '0')}-${String(nueva.getDate()).padStart(2, '0')}`
    router.replace(`/calendar?fecha=${fechaParam}&vista=${vista}`)
  }

  function irAHoy() {
    const hoy = new Date()
    setReferencia(hoy)
    const fechaParam = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
    router.replace(`/calendar?fecha=${fechaParam}&vista=${vista}`)
  }

  function cambiarVista(nueva: VistaCalendario) {
    setVista(nueva)
    const fechaParam = `${referencia.getFullYear()}-${String(referencia.getMonth() + 1).padStart(2, '0')}-${String(referencia.getDate()).padStart(2, '0')}`
    router.replace(`/calendar?fecha=${fechaParam}&vista=${nueva}`)
  }

  const titulo = vista === 'mes'
    ? formatearMesAno(referencia)
    : formatearRangoSemana(referencia)

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      {/* Header del calendario */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navegar(-1)}
            title="Anterior"
            className="w-8 h-8 flex items-center justify-center rounded-[10px] border border-[var(--line-2)] bg-[var(--bg)] text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--ink-4)] transition-colors focus:outline-none"
          >
            <ChevronLeft size={16} />
          </button>
          <h2 className="font-mono text-[13px] font-medium text-[var(--ink)] capitalize min-w-[160px] text-center tracking-tight">
            {titulo}
          </h2>
          <button
            onClick={() => navegar(1)}
            title="Siguiente"
            className="w-8 h-8 flex items-center justify-center rounded-[10px] border border-[var(--line-2)] bg-[var(--bg)] text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--ink-4)] transition-colors focus:outline-none"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={irAHoy}
            className="flex items-center px-3 py-1.5 rounded-[10px] text-[12.5px] font-medium text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--bg-soft)] border border-[var(--line-2)] hover:border-[var(--ink-4)] transition-colors focus:outline-none"
          >
            Hoy
          </button>
        </div>

        {/* Toggle vista Mes/Semana — pill container */}
        <div className="flex items-center gap-1 p-[3px] bg-[var(--bg-soft)] border border-[var(--line)] rounded-[999px] select-none">
          <button
            onClick={() => cambiarVista('mes')}
            className={`px-3.5 py-[5px] rounded-[999px] text-[12.5px] font-medium transition-all focus:outline-none ${
              vista === 'mes'
                ? 'bg-[var(--bg)] text-[var(--ink)] shadow-[0_1px_3px_rgba(10,10,10,0.05)] border border-[var(--line-2)]'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)] border border-transparent'
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => cambiarVista('semana')}
            className={`px-3.5 py-[5px] rounded-[999px] text-[12.5px] font-medium transition-all focus:outline-none ${
              vista === 'semana'
                ? 'bg-[var(--bg)] text-[var(--ink)] shadow-[0_1px_3px_rgba(10,10,10,0.05)] border border-[var(--line-2)]'
                : 'text-[var(--ink-2)] hover:text-[var(--ink)] border border-transparent'
            }`}
          >
            Semana
          </button>
        </div>
      </div>

      <FiltroCalendario
        categorias={categorias}
        seleccionadas={categoriasSeleccionadas}
        onChange={setCategoriasSeleccionadas}
      />

      {/* Vista activa: ocupa siempre el alto disponible; el mensaje de "sin recordatorios" flota
          encima sin alterar el layout. */}
      <div className="relative flex-1 min-h-0">
        {vista === 'mes' ? (
          <VistaMes
            referencia={referencia}
            recordatorios={recordatoriosFiltrados}
            categorias={categorias}
            onDiaClick={setDiaAbierto}
          />
        ) : (
          <VistaSemana
            referencia={referencia}
            recordatorios={recordatoriosFiltrados}
            categorias={categorias}
            onDiaClick={setDiaAbierto}
          />
        )}

        {recordatoriosFiltrados.length === 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
            <div
              className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-[var(--ink-3)] backdrop-blur"
              style={{ background: 'color-mix(in oklab, var(--bg) 90%, transparent)', border: '1px solid var(--line)' }}
            >
              <Info size={12} />
              Sin recordatorios en este filtro
            </div>
          </div>
        )}
      </div>

      <DialogDia
        dia={diaAbierto}
        recordatorios={recordatoriosDeDia}
        categorias={categorias}
        onCerrar={() => setDiaAbierto(null)}
      />
    </div>
  )
}
