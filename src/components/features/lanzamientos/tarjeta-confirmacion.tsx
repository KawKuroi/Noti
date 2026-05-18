'use client'

import Image from 'next/image'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatearFechaLanzamiento } from '@/lib/utils/formato-fecha'
import {
  ETIQUETAS_TIPO_LANZAMIENTO,
  ETIQUETAS_FUENTE_LANZAMIENTO,
} from '@/lib/utils/constants'
import type { ResultadoLanzamiento } from '@/types/release.types'

interface Props {
  resultado: ResultadoLanzamiento
  onConfirmar: () => void
  onRechazar: () => void
}

export function TarjetaConfirmacion({ resultado, onConfirmar, onRechazar }: Props) {
  const fechaFormateada = formatearFechaLanzamiento(resultado.fechaLanzamiento)

  return (
    <div className="mt-2 rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex gap-3 p-3">
        {resultado.posterUrl ? (
          <div className="relative w-16 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
            <Image
              src={resultado.posterUrl}
              alt={resultado.titulo}
              fill
              sizes="64px"
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-16 h-24 flex-shrink-0 rounded-md bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-purple-600 text-2xl">
            ?
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <p className="font-semibold text-sm text-gray-900 leading-snug flex-1">
              {resultado.titulo}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {ETIQUETAS_TIPO_LANZAMIENTO[resultado.tipo]}
            {resultado.autor ? ` · ${resultado.autor}` : ''}
          </p>
          <p className="text-sm text-gray-700 mt-1.5">{fechaFormateada}</p>
          <div className="mt-1.5">
            <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 uppercase tracking-wider">
              {ETIQUETAS_FUENTE_LANZAMIENTO[resultado.fuente]}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 p-2 border-t border-gray-100 bg-gray-50">
        <Button variante="primario" tamano="sm" onClick={onConfirmar} className="flex-1">
          <Check size={14} /> Si, agregar
        </Button>
        <Button variante="contorno" tamano="sm" onClick={onRechazar}>
          <X size={14} /> Cancelar
        </Button>
      </div>
    </div>
  )
}
