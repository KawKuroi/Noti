'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { actualizarSonido } from '@/lib/actions/notification.actions'

interface Props {
  sonidoActual: boolean
}

export function FormularioSonido({ sonidoActual }: Props) {
  const [activo, setActivo] = useState(sonidoActual)
  const [pending, startTransition] = useTransition()

  function manejarCambio(nuevoValor: boolean) {
    setActivo(nuevoValor)

    startTransition(async () => {
      const resultado = await actualizarSonido(nuevoValor)
      if (resultado.ok) {
        toast.success('Configuracion guardada')
      } else {
        toast.error(resultado.error ?? 'Error al guardar')
      }
    })
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        role="switch"
        aria-checked={activo}
        disabled={pending}
        onClick={() => manejarCambio(!activo)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 ${
          activo ? 'bg-gray-900' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            activo ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="text-sm text-gray-600">{activo ? 'Activado' : 'Desactivado'}</span>
    </div>
  )
}
