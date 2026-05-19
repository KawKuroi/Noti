'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Calendar, Check, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatearFechaLanzamiento } from '@/lib/utils/formato-fecha'
import {
  ETIQUETAS_TIPO_LANZAMIENTO,
  ETIQUETAS_FUENTE_LANZAMIENTO,
} from '@/lib/utils/constants'
import { cn } from '@/lib/utils/cn'
import type { ResultadoLanzamiento, FuenteLanzamiento } from '@/types/release.types'

interface Props {
  candidato: ResultadoLanzamiento
  seleccionado: boolean
  creando: boolean
  onSeleccionar: () => void
  onConfirmar: (fechaConfirmada: string, fuente: FuenteLanzamiento) => void
}

function esTentativa(c: ResultadoLanzamiento): boolean {
  if (c.tba) return true
  if (!c.fechaLanzamiento) return true
  return /^\d{4}-(01-01|\d{2}-01)$/.test(c.fechaLanzamiento)
}

function metadatosPorTipo(c: ResultadoLanzamiento): string[] {
  const items: string[] = [ETIQUETAS_TIPO_LANZAMIENTO[c.tipo]]
  if (c.tipo === 'movie' && c.director) items.push(`Dir. ${c.director}`)
  if (c.tipo === 'tv' && c.temporada) items.push(`Temporada ${c.temporada}`)
  if (c.tipo === 'game' && c.plataforma) items.push(c.plataforma)
  if (c.tipo === 'album' && c.artista) items.push(c.artista)
  if (c.tipo === 'book' && c.autor) items.push(c.autor)
  return items
}

export function CandidatoCard({ candidato, seleccionado, creando, onSeleccionar, onConfirmar }: Props) {
  const tentativa = esTentativa(candidato)
  const [editandoFecha, setEditandoFecha] = useState(false)
  const [fechaEditada, setFechaEditada] = useState(candidato.fechaLanzamiento ?? '')

  function handleConfirmar() {
    const fechaFinal = editandoFecha ? fechaEditada : candidato.fechaLanzamiento
    if (!fechaFinal || !/^\d{4}-\d{2}-\d{2}$/.test(fechaFinal)) {
      setEditandoFecha(true)
      return
    }
    const fuente: FuenteLanzamiento =
      fechaFinal !== candidato.fechaLanzamiento ? 'manual' : candidato.fuente
    onConfirmar(fechaFinal, fuente)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSeleccionar}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !editandoFecha) {
          e.preventDefault()
          if (seleccionado) handleConfirmar()
          else onSeleccionar()
        }
      }}
      className={cn(
        'rounded-lg border bg-white p-3 cursor-pointer transition-all',
        seleccionado
          ? 'border-gray-900 ring-1 ring-gray-900 shadow-sm'
          : 'border-gray-200 hover:border-gray-300',
      )}
    >
      <div className="flex gap-3">
        {candidato.posterUrl ? (
          <div className="relative w-14 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
            <Image
              src={candidato.posterUrl}
              alt={candidato.titulo}
              fill
              sizes="56px"
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-14 h-20 flex-shrink-0 rounded-md bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-purple-600">
            ?
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 leading-snug">{candidato.titulo}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {metadatosPorTipo(candidato).join(' · ')}
          </p>

          <div className="mt-1.5 flex items-center gap-2">
            {editandoFecha ? (
              <>
                <Calendar size={12} className="text-gray-400" />
                <Input
                  type="date"
                  value={fechaEditada}
                  onChange={(e) => setFechaEditada(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-7 text-xs flex-1"
                />
              </>
            ) : (
              <>
                <p className="text-sm text-gray-700">
                  {candidato.fechaLanzamiento
                    ? formatearFechaLanzamiento(candidato.fechaLanzamiento)
                    : 'Sin fecha confirmada'}
                </p>
                {tentativa && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 uppercase tracking-wider">
                    Tentativa
                  </span>
                )}
                {seleccionado && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditandoFecha(true)
                    }}
                    className="text-gray-400 hover:text-gray-700 transition-colors"
                    aria-label="Editar fecha"
                  >
                    <Pencil size={12} />
                  </button>
                )}
              </>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 uppercase tracking-wider">
              {ETIQUETAS_FUENTE_LANZAMIENTO[candidato.fuente]}
            </span>
            {seleccionado && (
              <Button
                variante="primario"
                tamano="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleConfirmar()
                }}
                disabled={creando}
                className="ml-auto"
              >
                <Check size={12} />
                {creando ? 'Agregando...' : 'Agregar'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
