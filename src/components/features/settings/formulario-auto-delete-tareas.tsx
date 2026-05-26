'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { actualizarAutoDeleteTareas } from '@/lib/actions/user.actions'
import { OPCIONES_AUTO_DELETE_TAREAS } from '@/lib/utils/constants'

interface Props {
  valorActual: number | null
}

export function FormularioAutoDeleteTareas({ valorActual }: Props) {
  const [valor, setValor] = useState<number | null>(valorActual)
  const [pending, startTransition] = useTransition()

  const manejarCambio = (nuevoValor: number | null) => {
    setValor(nuevoValor)

    startTransition(async () => {
      const resultado = await actualizarAutoDeleteTareas(nuevoValor)
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
        value={valor === null ? '' : String(valor)}
        onChange={(e) => {
          const val = e.target.value === '' ? null : Number(e.target.value)
          manejarCambio(val)
        }}
        disabled={pending}
        className="px-3 py-2 text-sm border border-[var(--line-2)] rounded-[10px] bg-[var(--bg)] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] disabled:opacity-50"
      >
        {OPCIONES_AUTO_DELETE_TAREAS.map((op) => (
          <option key={op.valor === null ? 'null' : op.valor} value={op.valor === null ? '' : op.valor}>
            {op.etiqueta}
          </option>
        ))}
      </select>
    </div>
  )
}
