'use client'

import { Calendar, Check, Clock, Repeat, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ETIQUETAS_CATEGORIA } from '@/lib/utils/constants'
import { formatearFechaLanzamiento } from '@/lib/utils/formato-fecha'
import type { Extraccion } from '@/lib/ai/extractor'

interface Props {
  recordatorio: NonNullable<Extraccion['recordatorio']>
  creando: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

function describirRecurrencia(regla: string | null): string | null {
  if (!regla) return null
  if (regla.startsWith('yearly:')) return 'Cada año'
  if (regla.startsWith('weekly:')) {
    const dias = regla.slice('weekly:'.length).split(',').join(', ')
    return `Cada semana (${dias})`
  }
  return regla
}

export function RecordatorioExtraidoCard({ recordatorio, creando, onConfirmar, onCancelar }: Props) {
  const categoria = ETIQUETAS_CATEGORIA[recordatorio.categoriaSlug] ?? recordatorio.categoriaSlug
  const recurrencia = describirRecurrencia(recordatorio.reglaRecurrencia)

  return (
    <div className="rounded-lg border border-gray-900 ring-1 ring-gray-900 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-base text-gray-900 leading-snug">
            {recordatorio.titulo}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{categoria}</p>
        </div>
        <button
          type="button"
          onClick={onCancelar}
          className="text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Descartar"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar size={14} className="text-gray-400" />
          <span>
            {recordatorio.fechaVencimiento
              ? formatearFechaLanzamiento(recordatorio.fechaVencimiento)
              : 'Sin fecha'}
          </span>
        </div>
        {recordatorio.horaVencimiento && (
          <div className="flex items-center gap-2 text-gray-700">
            <Clock size={14} className="text-gray-400" />
            <span>{recordatorio.horaVencimiento}</span>
          </div>
        )}
        {recurrencia && (
          <div className="flex items-center gap-2 text-gray-700">
            <Repeat size={14} className="text-gray-400" />
            <span>{recurrencia}</span>
          </div>
        )}
        {recordatorio.descripcion && (
          <p className="text-xs text-gray-500 mt-2 italic">{recordatorio.descripcion}</p>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Button variante="primario" tamano="sm" onClick={onConfirmar} disabled={creando} className="flex-1">
          <Check size={14} />
          {creando ? 'Creando...' : 'Crear recordatorio'}
        </Button>
        <Button variante="contorno" tamano="sm" onClick={onCancelar} disabled={creando}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
