'use client'

import { Bell } from 'lucide-react'
import { usePushNotifications } from '@/hooks/use-push-notifications'

export function BotonActivarNotificaciones() {
  const { soportado, permiso, suscrito, cargando, activar, desactivar } = usePushNotifications()

  if (!soportado) {
    return (
      <p className="text-sm" style={{ color: 'var(--ink-3)' }}>
        Este navegador no soporta notificaciones push.
      </p>
    )
  }

  if (permiso === 'denied') {
    return (
      <p className="text-sm" style={{ color: 'var(--ink-3)' }}>
        Bloqueaste las notificaciones en este navegador. Habilitalas desde el candado junto a la
        barra de direcciones (Permisos - Notificaciones) y recarga la pagina.
      </p>
    )
  }

  if (suscrito) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--ink-3)' }}>
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          Notificaciones activadas en este dispositivo
        </div>
        <button
          onClick={desactivar}
          disabled={cargando}
          className="text-sm underline transition-colors disabled:opacity-50"
          style={{ color: 'var(--ink-3)' }}
        >
          Desactivar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={activar}
      disabled={cargando}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50"
      style={{ background: 'var(--ink)', color: 'var(--bg)' }}
    >
      <Bell size={15} />
      {cargando ? 'Activando...' : 'Activar notificaciones en este dispositivo'}
    </button>
  )
}
