'use client'

import { useState, useEffect, useCallback } from 'react'

interface EventoInstalacion extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface EstadoPWAInstall {
  soportado: boolean
  instalado: boolean
  esIOS: boolean
  esIOSSinSoportePush: boolean
  instalar: () => Promise<void>
}

function esIOSAntiguo(): boolean {
  const coincidencia = navigator.userAgent.match(/OS (\d+)_(\d+)/)
  if (!coincidencia) return false
  const mayor = parseInt(coincidencia[1], 10)
  const menor = parseInt(coincidencia[2], 10)
  return mayor < 16 || (mayor === 16 && menor < 4)
}

export function usePWAInstall(): EstadoPWAInstall {
  const [eventoInstalacion, setEventoInstalacion] = useState<EventoInstalacion | null>(null)
  const [instalado, setInstalado] = useState(false)
  const [esIOS, setEsIOS] = useState(false)
  const [sinSoportePush, setSinSoportePush] = useState(false)

  useEffect(() => {
    const enStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      !!(navigator as unknown as { standalone?: boolean }).standalone

    setInstalado(enStandalone)

    const enIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setEsIOS(enIOS)
    if (enIOS) setSinSoportePush(esIOSAntiguo())

    const alPedirInstalacion = (evento: Event) => {
      evento.preventDefault()
      setEventoInstalacion(evento as EventoInstalacion)
    }

    window.addEventListener('beforeinstallprompt', alPedirInstalacion)

    const mq = window.matchMedia('(display-mode: standalone)')
    const alCambiar = (e: MediaQueryListEvent) => setInstalado(e.matches)
    mq.addEventListener('change', alCambiar)

    return () => {
      window.removeEventListener('beforeinstallprompt', alPedirInstalacion)
      mq.removeEventListener('change', alCambiar)
    }
  }, [])

  const instalar = useCallback(async () => {
    if (!eventoInstalacion) return
    await eventoInstalacion.prompt()
    const { outcome } = await eventoInstalacion.userChoice
    if (outcome === 'accepted') {
      setInstalado(true)
      setEventoInstalacion(null)
    }
  }, [eventoInstalacion])

  return {
    soportado: !!eventoInstalacion,
    instalado,
    esIOS,
    esIOSSinSoportePush: sinSoportePush,
    instalar,
  }
}
