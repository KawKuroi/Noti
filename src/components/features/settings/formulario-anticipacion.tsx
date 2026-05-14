'use client'

import { useState, useTransition } from 'react'
import { actualizarAnticipacion } from '@/lib/actions/notification.actions'

const OPCIONES = [
  { valor: 0, etiqueta: 'En el momento' },
  { valor: 5, etiqueta: '5 minutos antes' },
  { valor: 15, etiqueta: '15 minutos antes' },
  { valor: 30, etiqueta: '30 minutos antes' },
  { valor: 60, etiqueta: '1 hora antes' },
  { valor: 1440, etiqueta: '1 dia antes' },
]

interface Props {
  anticipacionActual: number
}

export function FormularioAnticipacion({ anticipacionActual }: Props) {
  const [valor, setValor] = useState(anticipacionActual)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const manejarCambio = (nuevoValor: number) => {
    setValor(nuevoValor)
    setMensaje(null)

    startTransition(async () => {
      const resultado = await actualizarAnticipacion(nuevoValor)
      setMensaje(resultado.ok ? 'Guardado' : (resultado.error ?? 'Error al guardar'))
    })
  }

  return (
    <div className="flex items-center gap-4">
      <select
        value={valor}
        onChange={(e) => manejarCambio(Number(e.target.value))}
        disabled={pending}
        className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
      >
        {OPCIONES.map((op) => (
          <option key={op.valor} value={op.valor}>
            {op.etiqueta}
          </option>
        ))}
      </select>
      {mensaje && (
        <span className={`text-xs ${mensaje === 'Guardado' ? 'text-gray-500' : 'text-red-500'}`}>
          {mensaje}
        </span>
      )}
    </div>
  )
}
