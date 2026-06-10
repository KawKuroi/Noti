'use client'

import { useTransition } from 'react'
import { Bell } from 'lucide-react'
import { toast } from 'sonner'
import { enviarNotificacionPrueba } from '@/lib/actions/push-subscription.actions'

export function BotonEnviarPushPrueba() {
  const [pending, startTransition] = useTransition()

  const manejarEnviar = () => {
    startTransition(async () => {
      const resultado = await enviarNotificacionPrueba()
      if (resultado.ok) {
        toast.success('Notificacion enviada. Revisa tu Centro de actividades.')
      } else {
        toast.error(resultado.error ?? 'Error al enviar la notificacion')
      }
    })
  }

  return (
    <button
      onClick={manejarEnviar}
      disabled={pending}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-[10px] border border-(--line-2) bg-(--bg) text-(--ink) transition-colors hover:border-(--ink) disabled:opacity-50"
    >
      <Bell size={15} />
      {pending ? 'Enviando...' : 'Enviar notificacion de prueba'}
    </button>
  )
}
