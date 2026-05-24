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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variante="fantasma" tamano="icono" onClick={() => navegar(-1)} title="Anterior">
            <ChevronLeft size={16} />
          </Button>
          <h2 className="text-base font-semibold text-foreground capitalize min-w-[180px] text-center">
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
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => cambiarVista('mes')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              vista === 'mes'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-accent/50'
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => cambiarVista('semana')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              vista === 'semana'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-accent/50'
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
            <div className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1 text-xs text-muted-foreground shadow-sm ring-1 ring-border backdrop-blur">
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
