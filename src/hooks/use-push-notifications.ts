'use client'

import { useState, useEffect } from 'react'

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray as Uint8Array<ArrayBuffer>
}

export type PermisoNotificacion = 'default' | 'granted' | 'denied'

export interface EstadoPushNotifications {
  soportado: boolean
  permiso: PermisoNotificacion
  suscrito: boolean
  cargando: boolean
  activar: () => Promise<void>
  desactivar: () => Promise<void>
}

export function usePushNotifications(): EstadoPushNotifications {
  const [soportado, setSoportado] = useState(false)
  const [permiso, setPermiso] = useState<PermisoNotificacion>('default')
  const [suscrito, setSuscrito] = useState(false)
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    const tieneSoporte =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window

    setSoportado(tieneSoporte)

    if (tieneSoporte) {
      setPermiso(Notification.permission as PermisoNotificacion)

      navigator.serviceWorker.ready.then((registro) => {
        registro.pushManager.getSubscription().then((sus) => {
          setSuscrito(!!sus)
        })
      })
    }
  }, [])

  const activar = async () => {
    if (!soportado || cargando) return
    setCargando(true)

    try {
      const permisoObtenido = await Notification.requestPermission()
      setPermiso(permisoObtenido as PermisoNotificacion)

      if (permisoObtenido !== 'granted') return

      const registro = await navigator.serviceWorker.ready
      const clavePublica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

      if (!clavePublica) {
        console.error('NEXT_PUBLIC_VAPID_PUBLIC_KEY no configurada')
        return
      }

      const suscripcion = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(clavePublica),
      })

      const respuesta = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suscripcion.toJSON()),
      })

      if (respuesta.ok) {
        setSuscrito(true)
      }
    } catch (err) {
      console.error('Error al activar notificaciones:', err)
    } finally {
      setCargando(false)
    }
  }

  const desactivar = async () => {
    if (!soportado || cargando) return
    setCargando(true)

    try {
      const registro = await navigator.serviceWorker.ready
      const suscripcion = await registro.pushManager.getSubscription()
      if (suscripcion) {
        await suscripcion.unsubscribe()
        setSuscrito(false)
      }
    } catch (err) {
      console.error('Error al desactivar notificaciones:', err)
    } finally {
      setCargando(false)
    }
  }

  return { soportado, permiso, suscrito, cargando, activar, desactivar }
}
