'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
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
  const [pending, startTransition] = useTransition()

  const manejarCambio = (nuevoValor: number) => {
    setValor(nuevoValor)

    startTransition(async () => {
      const resultado = await actualizarAnticipacion(nuevoValor)
      if (resultado.ok) {
        toast.success('Configuracion guardada')
      } else {
        toast.error(resultado.error ?? 'Error al guardar')
      }
    })
  }

  return (
    <div className="flex items-center gap-4">
      <select
        value={valor}
        onChange={(e) => manejarCambio(Number(e.target.value))}
        disabled={pending}
        className="px-3 py-2 text-sm border border-[var(--line-2)] rounded-[10px] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] disabled:opacity-50"
      >
        {OPCIONES.map((op) => (
          <option key={op.valor} value={op.valor}>
            {op.etiqueta}
          </option>
        ))}
      </select>
    </div>
  )
}
