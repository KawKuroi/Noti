'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { actualizarPerfil } from '@/lib/actions/user.actions'
import { ZONAS_HORARIAS_LATAM } from '@/lib/validations/user.schemas'

interface Props {
  nombreActual?: string | null
  zonaHorariaActual: string
}

export function FormularioPerfil({ nombreActual, zonaHorariaActual }: Props) {
  const [nombre, setNombre] = useState(nombreActual ?? '')
  const [zona, setZona] = useState(zonaHorariaActual)
  const [pending, startTransition] = useTransition()

  function manejarEnvio(e: React.FormEvent) {
    e.preventDefault()

    startTransition(async () => {
      const resultado = await actualizarPerfil({
        nombreMostrado: nombre.trim() || null,
        zonaHoraria: zona,
      })

      if (resultado.ok) {
        toast.success('Perfil actualizado')
      } else {
        toast.error(resultado.error ?? 'Error al guardar el perfil')
      }
    })
  }

  const labelClass =
    'mono block text-[11px] font-medium uppercase tracking-[0.08em] text-(--ink-3) mb-1.5'
  const fieldClass =
    'w-full px-3 py-2 border border-(--line-2) rounded-[10px] text-sm bg-(--bg) text-(--ink) placeholder:text-(--ink-3) focus:outline-hidden focus:border-(--ink)'

  return (
    <form onSubmit={manejarEnvio} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="nombre" className={labelClass}>
          Nombre
        </label>
        <input
          id="nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={60}
          placeholder="Tu nombre"
          className={fieldClass}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="zona" className={labelClass}>
          Zona horaria
        </label>
        <select
          id="zona"
          value={zona}
          onChange={(e) => setZona(e.target.value)}
          className={fieldClass}
        >
          {ZONAS_HORARIAS_LATAM.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-(--ink) text-(--bg) text-sm font-medium rounded-[10px] hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
