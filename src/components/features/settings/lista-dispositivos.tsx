'use client'

import { useTransition } from 'react'
import { Trash2, Monitor } from 'lucide-react'
import { eliminarSuscripcion } from '@/lib/actions/push-subscription.actions'
import type { SuscripcionPush } from '@/lib/queries/push.queries'

interface Props {
  suscripciones: SuscripcionPush[]
}

export function ListaDispositivos({ suscripciones }: Props) {
  const [pending, startTransition] = useTransition()

  const eliminar = (id: string) => {
    startTransition(async () => {
      await eliminarSuscripcion(id)
    })
  }

  if (suscripciones.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        Ningun dispositivo registrado. Activa las notificaciones desde el dashboard.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {suscripciones.map((sus) => (
        <li
          key={sus.id}
          className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Monitor size={15} className="text-gray-400" />
            <span>{sus.nombreDispositivo ?? 'Dispositivo desconocido'}</span>
          </div>
          <button
            onClick={() => eliminar(sus.id)}
            disabled={pending}
            className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
            aria-label="Eliminar dispositivo"
          >
            <Trash2 size={14} />
          </button>
        </li>
      ))}
    </ul>
  )
}
