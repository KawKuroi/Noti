'use client'

import { useState, useRef, useEffect, useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import {
  Check,
  Pencil,
  Trash2,
  RotateCcw,
  Timer,
  Clapperboard,
  BookOpen,
  Cake,
  CheckSquare,
  MapPin,
  Music,
  Gamepad2,
  Tv,
  HelpCircle,
  CalendarDays,
  StickyNote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { FormularioRecordatorio } from './formulario-recordatorio'
import { eliminarRecordatorio, alternarCompletado } from '@/lib/actions/reminder.actions'
import { formatearFechaCorta, formatearFechaSinHora } from '@/lib/utils/date.utils'
import type { Recordatorio } from '@/types/reminder.types'
import type { Categoria } from '@/types/category.types'
import type { TipoLanzamiento } from '@/types/release.types'

const COLOR_CATEGORIA_VAR: Record<string, string> = {
  movies: 'var(--cat-series)',
  tv: 'var(--cat-series)',
  games: 'var(--cat-juegos)',
  music: 'var(--cat-musica)',
  books: 'var(--cat-libros)',
  study: 'var(--cat-estudio)',
  birthdays: 'var(--cat-cumple)',
  tasks: 'var(--cat-pendientes)',
  events: 'var(--cat-eventos)',
  notes: 'var(--cat-notas)',
}

const ICONOS_CATEGORIA: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  movies: Clapperboard,
  tv: Tv,
  games: Gamepad2,
  music: Music,
  books: BookOpen,
  study: BookOpen,
  birthdays: Cake,
  tasks: CheckSquare,
  events: MapPin,
  notes: StickyNote,
}

interface Props {
  recordatorio: Recordatorio
  categorias: Categoria[]
  mostrarCategoria?: boolean
  diasAutoEliminar?: number | null
  destacado?: boolean
}

export function TarjetaRecordatorio({ recordatorio, categorias, mostrarCategoria, diasAutoEliminar, destacado }: Props) {
  const [editarAbierto, setEditarAbierto] = useState(false)
  const [eliminarAbierto, setEliminarAbierto] = useState(false)
  const [pending, startTransition] = useTransition()
  const [mostrarRing, setMostrarRing] = useState(destacado ?? false)
  const tarjetaRef = useRef<HTMLDivElement>(null)

  const [estaCompletado, actualizarCompletado] = useOptimistic(
    recordatorio.estaCompletado,
    (_actual: boolean, siguiente: boolean) => siguiente,
  )
  const [eliminado, marcarEliminado] = useOptimistic(
    false,
    (_actual: boolean, nuevo: boolean) => nuevo,
  )

  useEffect(() => {
    if (!destacado) return
    tarjetaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const t = setTimeout(() => setMostrarRing(false), 3000)
    return () => clearTimeout(t)
  }, [destacado])

  const manejarCompletar = () => {
    const siguiente = !estaCompletado
    startTransition(async () => {
      actualizarCompletado(siguiente)
      const r = await alternarCompletado(recordatorio.id)
      if (!r.ok) {
        actualizarCompletado(!siguiente)
        toast.error(r.error ?? 'No se pudo actualizar')
      }
    })
  }

  const confirmarEliminar = () => {
    startTransition(async () => {
      marcarEliminado(true)
      const r = await eliminarRecordatorio(recordatorio.id)
      if (!r.ok) {
        marcarEliminado(false)
        toast.error(r.error ?? 'No se pudo eliminar')
      } else {
        toast.success('Recordatorio eliminado')
        setEliminarAbierto(false)
      }
    })
  }

  if (eliminado) return null

  const categoria = categorias.find((c) => c.id === recordatorio.categoriaId)
  const slug = categoria?.slug ?? 'events'
  const esCumpleanos = slug === 'birthdays'
  const fechaFormateada = recordatorio.fechaVencimiento
    ? esCumpleanos
      ? formatearFechaSinHora(new Date(recordatorio.fechaVencimiento))
      : formatearFechaCorta(new Date(recordatorio.fechaVencimiento))
    : null

  const metadatos = recordatorio.metadatos as Record<string, unknown> | null
  const tipoLanzamiento = metadatos?.tipo as TipoLanzamiento | undefined
  const director = metadatos?.director as string | undefined
  const artista = metadatos?.artista as string | undefined
  const plataforma = metadatos?.plataforma as string | undefined
  const temporada = metadatos?.temporada as number | undefined

  const colorCat = categoria ? (COLOR_CATEGORIA_VAR[categoria.slug] || categoria.color) : 'var(--ink)'
  const IconoCat = categoria ? (ICONOS_CATEGORIA[categoria.slug] || HelpCircle) : HelpCircle

  const etiquetaAutoDelete = (() => {
    if (!estaCompletado || !diasAutoEliminar || !recordatorio.fechaVencimiento) return null
    const transcurridos = Math.ceil(
      (Date.now() - new Date(recordatorio.fechaVencimiento).getTime()) / 86400000,
    )
    const dias = Math.max(0, diasAutoEliminar - transcurridos)
    if (transcurridos < 0 || dias > diasAutoEliminar) return null
    return { dias, urgente: dias <= 1 }
  })()

  return (
    <>
      <div
        ref={tarjetaRef}
        className={cn(
          'group flex items-start gap-4 p-[10px_14px] min-h-[56px] bg-transparent hover:bg-[var(--bg-soft)] rounded-[14px] border border-transparent hover:border-[var(--line)] transition-all duration-150 relative min-w-0 w-full',
          estaCompletado ? 'opacity-60' : '',
          mostrarRing ? 'ring-2 ring-purple-400 ring-offset-2' : ''
        )}
      >
        {/* Boton completar — solo para recordatorios no recurrentes */}
        {!recordatorio.esRecurrente ? (
          <button
            onClick={manejarCompletar}
            disabled={pending}
            title="Marcar como completado"
            className={cn(
              'w-[20px] h-[20px] rounded-[6px] border-[1.5px] flex items-center justify-center shrink-0 mt-[3px] cursor-pointer transition-all duration-150 focus:outline-none',
              estaCompletado ? 'border-transparent text-white' : 'border-[var(--line-2)] hover:border-[var(--ink-4)] bg-transparent'
            )}
            style={estaCompletado ? { backgroundColor: colorCat } : undefined}
          >
            {estaCompletado && <Check size={11} className="stroke-[3px]" />}
          </button>
        ) : (
          <div className="w-[20px] shrink-0" />
        )}

        {/* Icon Block */}
        <div
          className="w-[32px] h-[32px] rounded-[9px] flex items-center justify-center shrink-0 mt-[2px]"
          style={{
            backgroundColor: `color-mix(in oklab, ${colorCat} 14%, transparent)`,
            color: colorCat,
          }}
        >
          <IconoCat size={15} />
        </div>

        {/* Contenido (Title + Description + Meta) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'text-[14.5px] font-normal text-[var(--ink)] leading-tight select-none',
                  estaCompletado ? 'line-through text-[var(--ink-3)] opacity-55 font-normal' : 'font-medium'
                )}
              >
                {recordatorio.titulo}
              </p>

              {recordatorio.descripcion && (
                <p className="text-[12.5px] text-[var(--ink-2)] mt-0.5 leading-normal truncate select-none">
                  {recordatorio.descripcion}
                </p>
              )}

              {(director || artista || plataforma || temporada) && (
                <p className="text-[12.5px] text-[var(--ink-3)] mt-0.5 leading-normal truncate select-none font-mono text-[10px] tracking-wide uppercase">
                  {[
                    director ? `Dir. ${director}` : null,
                    artista,
                    plataforma,
                    temporada ? `Temp. ${temporada}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
            </div>

            {/* Acciones — visibles al hover */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 ml-2 self-start mt-[-2px]">
              <Button
                variante="fantasma"
                tamano="icono"
                onClick={() => setEditarAbierto(true)}
                title="Editar"
                className="h-7 w-7 rounded-md text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--bg-soft)]"
              >
                <Pencil size={12} />
              </Button>
              <Button
                variante="fantasma"
                tamano="icono"
                onClick={() => setEliminarAbierto(true)}
                disabled={pending}
                title="Eliminar"
                className="h-7 w-7 rounded-md text-[var(--ink-2)] hover:text-red-500 hover:bg-red-500/10"
              >
                <Trash2 size={12} />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mt-1.5 font-mono text-[10.5px] font-medium text-[var(--ink-3)] uppercase tracking-[0.03em] select-none">
            {fechaFormateada && (
              <span suppressHydrationWarning className="flex items-center gap-1">
                <CalendarDays size={10.5} className="text-[var(--ink-3)]" />
                {fechaFormateada}
              </span>
            )}

            {mostrarCategoria && categoria && (
              <span
                className="px-2 py-0.5 rounded-[999px] font-semibold text-[10px] uppercase tracking-wider"
                style={{
                  backgroundColor: `color-mix(in oklab, ${colorCat} 12%, transparent)`,
                  color: colorCat,
                }}
              >
                {categoria.nombre}
              </span>
            )}

            {recordatorio.esRecurrente && (
              <span className="flex items-center gap-1 font-semibold">
                <RotateCcw size={10} className="animate-[spin_10s_linear_infinite]" />
                Recurrente
              </span>
            )}

            {etiquetaAutoDelete && (
              <span
                suppressHydrationWarning
                className={cn(
                  'flex items-center gap-1 font-semibold',
                  etiquetaAutoDelete.urgente ? 'text-amber-600' : 'text-[var(--ink-3)]'
                )}
              >
                <Timer size={10} />
                {etiquetaAutoDelete.dias === 1
                  ? 'Se elimina mañana'
                  : `Se elimina en ${etiquetaAutoDelete.dias}d`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dialog de edicion */}
      <Dialog open={editarAbierto} onOpenChange={setEditarAbierto}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar recordatorio</DialogTitle>
            <DialogDescription>Modifica los detalles del recordatorio.</DialogDescription>
          </DialogHeader>
          <FormularioRecordatorio
            categorias={categorias}
            recordatorio={recordatorio}
            slugInicial={slug}
            onExito={() => setEditarAbierto(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmacion de eliminacion */}
      <Dialog open={eliminarAbierto} onOpenChange={setEliminarAbierto}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar recordatorio</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer. El recordatorio sera eliminado permanentemente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button
              variante="contorno"
              className="flex-1"
              onClick={() => setEliminarAbierto(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmarEliminar}
              disabled={pending}
            >
              {pending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
