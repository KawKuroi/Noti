'use client'

import { useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ETIQUETAS_TIPO_LANZAMIENTO } from '@/lib/utils/constants'
import type { TipoLanzamiento } from '@/types/release.types'

interface Props {
  titulo: string
  tipo: TipoLanzamiento
  motivo: string
  onEnviar: (fecha: string) => void
}

export function FormularioFechaManual({ titulo, tipo, motivo, onEnviar }: Props) {
  const [fecha, setFecha] = useState('')
  const [enviado, setEnviado] = useState(false)

  function manejarEnvio(e: React.FormEvent) {
    e.preventDefault()
    if (!fecha || enviado) return
    setEnviado(true)
    onEnviar(fecha)
  }

  if (enviado) {
    return (
      <p className="text-xs text-gray-500 italic mt-2">
        Fecha enviada al asistente para confirmar.
      </p>
    )
  }

  return (
    <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
      <div className="flex items-start gap-2 mb-2">
        <CalendarPlus className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900">
          <p className="font-medium">No encontre la fecha de {`"${titulo}"`} ({ETIQUETAS_TIPO_LANZAMIENTO[tipo]}).</p>
          <p className="text-amber-700 mt-0.5">{motivo}</p>
          <p className="mt-1">Si la conoces, ingresala manualmente:</p>
        </div>
      </div>
      <form onSubmit={manejarEnvio} className="flex gap-2">
        <Input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" tamano="sm" disabled={!fecha}>
          Agregar
        </Button>
      </form>
    </div>
  )
}
