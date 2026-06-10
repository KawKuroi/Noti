'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { actualizarResumenDiario } from '@/lib/actions/notification.actions'

const OPCIONES_HORA = [
  { valor: '06:00', etiqueta: '6:00 AM' },
  { valor: '07:00', etiqueta: '7:00 AM' },
  { valor: '08:00', etiqueta: '8:00 AM' },
  { valor: '09:00', etiqueta: '9:00 AM' },
]

interface Props {
  activoActual: boolean
  horaActual: string
}

export function FormularioResumenDiario({ activoActual, horaActual }: Props) {
  const [activo, setActivo] = useState(activoActual)
  const [hora, setHora] = useState(horaActual)
  const [isPending, startTransition] = useTransition()

  function guardar(nuevoActivo: boolean, nuevaHora: string) {
    startTransition(async () => {
      const resultado = await actualizarResumenDiario(nuevoActivo, nuevaHora)
      if (resultado.ok) {
        toast.success('Configuracion guardada')
      } else {
        toast.error(resultado.error ?? 'Error al guardar')
      }
    })
  }

  function toggleActivo() {
    const nuevo = !activo
    setActivo(nuevo)
    guardar(nuevo, hora)
  }

  function cambiarHora(e: React.ChangeEvent<HTMLSelectElement>) {
    const nuevaHora = e.target.value
    setHora(nuevaHora)
    if (activo) guardar(activo, nuevaHora)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-(--ink)">Resumen matutino</p>
          <p className="text-xs text-(--ink-3) mt-0.5">
            Recibe una notificacion push con tus recordatorios del dia
          </p>
        </div>
        <button
          onClick={toggleActivo}
          disabled={isPending}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
            activo ? 'bg-(--ink)' : 'bg-(--line-2)'
          }`}
          role="switch"
          aria-checked={activo}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-(--bg) transition-transform ${
              activo ? 'translate-x-4' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {activo && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-(--ink-3)">Hora de envio:</label>
          <select
            value={hora}
            onChange={cambiarHora}
            disabled={isPending}
            className="text-sm border border-(--line-2) rounded-[8px] px-2 py-1 bg-(--bg) text-(--ink) focus:outline-hidden focus:border-(--ink) disabled:opacity-50"
          >
            {OPCIONES_HORA.map((op) => (
              <option key={op.valor} value={op.valor}>
                {op.etiqueta}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
