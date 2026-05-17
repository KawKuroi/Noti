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

  return (
    <form onSubmit={manejarEnvio} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          id="nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={60}
          placeholder="Tu nombre"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="zona" className="block text-sm font-medium text-gray-700">
          Zona horaria
        </label>
        <select
          id="zona"
          value={zona}
          onChange={(e) => setZona(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
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
        className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {pending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
