'use client'

import { useTransition } from 'react'
import { Trash2, Monitor } from 'lucide-react'
import { toast } from 'sonner'
import { eliminarSuscripcion } from '@/lib/actions/push-subscription.actions'
import type { SuscripcionPush } from '@/lib/queries/push.queries'

interface Props {
  suscripciones: SuscripcionPush[]
}

export function ListaDispositivos({ suscripciones }: Props) {
  const [pending, startTransition] = useTransition()

  const eliminar = (id: string) => {
    startTransition(async () => {
      const resultado = await eliminarSuscripcion(id)
      if (resultado.ok) {
        toast.success('Dispositivo eliminado')
      } else {
        toast.error(resultado.error ?? 'Error al eliminar el dispositivo')
      }
    })
  }

  if (suscripciones.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ningun dispositivo registrado. Activa las notificaciones desde el dashboard.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {suscripciones.map((sus) => (
        <li
          key={sus.id}
          className="flex items-center justify-between px-3 py-2.5 bg-muted/50 rounded-lg"
        >
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Monitor size={15} className="text-muted-foreground" />
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
