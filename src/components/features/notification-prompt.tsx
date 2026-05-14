'use client'

import { useState } from 'react'
import { Bell, X } from 'lucide-react'
import { usePushNotifications } from '@/hooks/use-push-notifications'

export function NotificationPrompt() {
  const { soportado, permiso, suscrito, cargando, activar } = usePushNotifications()
  const [descartado, setDescartado] = useState(false)

  if (!soportado || permiso === 'denied' || suscrito || descartado) {
    return null
  }

  if (permiso === 'granted' && suscrito) {
    return null
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 mb-5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
      <Bell size={16} className="text-gray-500 shrink-0" />
      <p className="flex-1 text-gray-700">
        Activa las notificaciones para recibir recordatorios en este dispositivo.
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={activar}
          disabled={cargando}
          className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {cargando ? 'Activando...' : 'Activar'}
        </button>
        <button
          onClick={() => setDescartado(true)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
