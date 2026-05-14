'use client'

import { useEffect } from 'react'

export function RegistrarSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.error('Error al registrar Service Worker:', err))
    }
  }, [])

  return null
}
