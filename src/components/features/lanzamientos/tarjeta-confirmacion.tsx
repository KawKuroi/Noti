'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, X, Pencil, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatearFechaLanzamiento } from '@/lib/utils/formato-fecha'
import {
  ETIQUETAS_TIPO_LANZAMIENTO,
  ETIQUETAS_FUENTE_LANZAMIENTO,
} from '@/lib/utils/constants'
import type { ResultadoLanzamiento } from '@/types/release.types'

interface Props {
  resultado: ResultadoLanzamiento
  onConfirmar: (fechaConfirmada: string, fuenteFinal: ResultadoLanzamiento['fuente']) => void
  onRechazar: () => void
}

function fechaParcialDe01(fecha: string | null): boolean {
  if (!fecha) return false
  return /^\d{4}-01-01$/.test(fecha) || /^\d{4}-\d{2}-01$/.test(fecha)
}

function BloquePorTipo({ resultado }: { resultado: ResultadoLanzamiento }) {
  switch (resultado.tipo) {
    case 'movie':
      return (
        <div className="space-y-0.5 text-xs text-gray-600">
          {resultado.director && (
            <p>
              <span className="text-gray-400">Director:</span> {resultado.director}
            </p>
          )}
        </div>
      )
    case 'tv':
      return (
        <div className="space-y-0.5 text-xs text-gray-600">
          {resultado.temporada && (
            <p>
              <span className="text-gray-400">Temporada:</span> {resultado.temporada}
            </p>
          )}
        </div>
      )
    case 'game':
      return (
        <div className="space-y-0.5 text-xs text-gray-600">
          {resultado.plataforma && (
            <p>
              <span className="text-gray-400">Plataformas:</span> {resultado.plataforma}
            </p>
          )}
        </div>
      )
    case 'album':
      return (
        <div className="space-y-0.5 text-xs text-gray-600">
          {resultado.artista && (
            <p>
              <span className="text-gray-400">Artista:</span> {resultado.artista}
            </p>
          )}
        </div>
      )
    case 'book':
      return (
        <div className="space-y-0.5 text-xs text-gray-600">
          {resultado.autor && (
            <p>
              <span className="text-gray-400">Autor:</span> {resultado.autor}
            </p>
          )}
        </div>
      )
    default:
      return null
  }
}

export function TarjetaConfirmacion({ resultado, onConfirmar, onRechazar }: Props) {
  const [usado, setUsado] = useState(false)
  const [editandoFecha, setEditandoFecha] = useState(false)
  const [fechaEditada, setFechaEditada] = useState(resultado.fechaLanzamiento ?? '')

  const esTentativa = Boolean(resultado.tba) || fechaParcialDe01(resultado.fechaLanzamiento)
  const sinFecha = !resultado.fechaLanzamiento

  function handleConfirmar() {
    if (usado) return
    const fechaFinal = fechaEditada || resultado.fechaLanzamiento
    if (!fechaFinal || !/^\d{4}-\d{2}-\d{2}$/.test(fechaFinal)) {
      setEditandoFecha(true)
      return
    }
    const fuenteFinal: ResultadoLanzamiento['fuente'] =
      fechaFinal !== resultado.fechaLanzamiento ? 'manual' : resultado.fuente
    setUsado(true)
    onConfirmar(fechaFinal, fuenteFinal)
  }

  function handleRechazar() {
    if (usado) return
    setUsado(true)
    onRechazar()
  }

  return (
    <div className="mt-2 rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex gap-3 p-3">
        {resultado.posterUrl ? (
          <div className="relative w-20 h-28 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
            <Image
              src={resultado.posterUrl}
              alt={resultado.titulo}
              fill
              sizes="80px"
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-20 h-28 flex-shrink-0 rounded-md bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-purple-600 text-2xl">
            ?
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 leading-snug">{resultado.titulo}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {ETIQUETAS_TIPO_LANZAMIENTO[resultado.tipo]}
          </p>

          <div className="mt-2">
            <BloquePorTipo resultado={resultado} />
          </div>

          <div className="mt-2">
            {editandoFecha ? (
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-gray-400" />
                <Input
                  type="date"
                  value={fechaEditada}
                  onChange={(e) => setFechaEditada(e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-700">
                  {sinFecha ? 'Sin fecha confirmada' : formatearFechaLanzamiento(fechaEditada || resultado.fechaLanzamiento)}
                </p>
                {(esTentativa || sinFecha) && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 uppercase tracking-wider">
                    Tentativa
                  </span>
                )}
                {!usado && (
                  <button
                    type="button"
                    onClick={() => setEditandoFecha(true)}
                    className="text-gray-400 hover:text-gray-700 transition-colors"
                    aria-label="Editar fecha"
                  >
                    <Pencil size={12} />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-2">
            <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 uppercase tracking-wider">
              {ETIQUETAS_FUENTE_LANZAMIENTO[resultado.fuente]}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 p-2 border-t border-gray-100 bg-gray-50">
        <Button
          variante="primario"
          tamano="sm"
          onClick={handleConfirmar}
          disabled={usado}
          className="flex-1"
        >
          <Check size={14} /> Si, agregar
        </Button>
        <Button variante="contorno" tamano="sm" onClick={handleRechazar} disabled={usado}>
          <X size={14} /> Cancelar
        </Button>
      </div>
    </div>
  )
}
