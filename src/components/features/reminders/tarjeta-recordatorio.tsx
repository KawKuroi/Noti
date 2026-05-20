'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { Check, Pencil, Trash2, RotateCcw, Clock, Timer } from 'lucide-react'
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
import { PALETA_LANZAMIENTOS } from '@/lib/utils/constants'
import type { Recordatorio } from '@/types/reminder.types'
import type { Categoria } from '@/types/category.types'
import type { TipoLanzamiento } from '@/types/release.types'

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
  const [cargando, setCargando] = useState(false)
  const [mostrarRing, setMostrarRing] = useState(destacado ?? false)
  const tarjetaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!destacado) return
    tarjetaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const t = setTimeout(() => setMostrarRing(false), 3000)
    return () => clearTimeout(t)
  }, [destacado])

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

  const colorAcento = tipoLanzamiento ? PALETA_LANZAMIENTOS[tipoLanzamiento] : undefined

  const etiquetaAutoDelete = (() => {
    if (!recordatorio.estaCompletado || !recordatorio.completadoEn || !diasAutoEliminar) return null
    const fechaEliminar = new Date(
      new Date(recordatorio.completadoEn).getTime() + diasAutoEliminar * 86400000,
    )
    const diasRestantes = Math.ceil((fechaEliminar.getTime() - Date.now()) / 86400000)
    if (diasRestantes <= 0) return null
    return { dias: diasRestantes, urgente: diasRestantes <= 3 }
  })()

  async function manejarCompletar() {
    setCargando(true)
    const estabaCompletado = recordatorio.estaCompletado
    const resultado = await alternarCompletado(recordatorio.id)
    setCargando(false)
    if (resultado.ok) {
      if (estabaCompletado) {
        toast.success('Recordatorio reabierto')
      } else if (recordatorio.esRecurrente) {
        toast.success('Avanzado a la proxima ocurrencia')
      } else {
        toast.success('Recordatorio completado')
      }
    } else {
      toast.error(resultado.error ?? 'No se pudo actualizar el recordatorio')
    }
  }

  async function confirmarEliminar() {
    setEliminarAbierto(false)
    setCargando(true)
    const resultado = await eliminarRecordatorio(recordatorio.id)
    setCargando(false)
    if (resultado.ok) {
      toast.success('Recordatorio eliminado')
    } else {
      toast.error(resultado.error ?? 'No se pudo eliminar el recordatorio')
    }
  }

  return (
    <>
      <div
        ref={tarjetaRef}
        className={`group flex items-start gap-3 p-4 bg-white rounded-xl border transition-colors ${
          recordatorio.estaCompletado
            ? 'border-gray-100 opacity-60'
            : 'border-gray-100 hover:border-gray-200'
        } ${mostrarRing ? 'ring-2 ring-purple-400 ring-offset-2' : ''}`}
        style={colorAcento ? { borderLeftColor: colorAcento, borderLeftWidth: '3px' } : undefined}
      >
        {/* Boton completar — solo para recordatorios no recurrentes */}
        {!recordatorio.esRecurrente && (
          <button
            onClick={manejarCompletar}
            disabled={cargando}
            title="Marcar como completado"
            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              recordatorio.estaCompletado
                ? 'border-green-500 bg-green-500'
                : 'border-gray-300 hover:border-gray-500'
            }`}
          >
            {recordatorio.estaCompletado && <Check size={10} className="text-white" />}
          </button>
        )}

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm font-medium text-gray-900 ${
                recordatorio.estaCompletado ? 'line-through text-gray-400' : ''
              }`}
            >
              {recordatorio.titulo}
            </p>

            {/* Acciones — visibles al hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <Button
                variante="fantasma"
                tamano="icono"
                onClick={() => setEditarAbierto(true)}
                title="Editar"
              >
                <Pencil size={13} />
              </Button>
              <Button
                variante="fantasma"
                tamano="icono"
                onClick={() => setEliminarAbierto(true)}
                disabled={cargando}
                title="Eliminar"
                className="hover:text-red-500"
              >
                <Trash2 size={13} />
              </Button>
            </div>
          </div>

          {recordatorio.descripcion && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{recordatorio.descripcion}</p>
          )}

          {(director || artista || plataforma || temporada) && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {[
                director ? `Dir. ${director}` : null,
                artista,
                plataforma,
                temporada ? `Temp. ${temporada}` : null,
              ].filter(Boolean).join(' · ')}
            </p>
          )}

          <div className="flex items-center gap-2 mt-1.5">
            {fechaFormateada && (
              <span suppressHydrationWarning className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={10} />
                {fechaFormateada}
              </span>
            )}

            {mostrarCategoria && categoria && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                style={{ backgroundColor: `${categoria.color}20`, color: categoria.color }}
              >
                {categoria.nombre}
              </span>
            )}

            {recordatorio.esRecurrente && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <RotateCcw size={10} />
                Recurrente
              </span>
            )}

            {etiquetaAutoDelete && (
              <span
                suppressHydrationWarning
                className={`text-xs flex items-center gap-1 ${etiquetaAutoDelete.urgente ? 'text-amber-500' : 'text-gray-400'}`}
              >
                <Timer size={10} />
                {etiquetaAutoDelete.dias === 1
                  ? 'Se elimina manana'
                  : `Se elimina en ${etiquetaAutoDelete.dias} dias`}
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
              disabled={cargando}
            >
              {cargando ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
