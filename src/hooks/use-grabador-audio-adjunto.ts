'use client'

import { useCallback, useRef, useState } from 'react'

const DURACION_MAX_SEG = 60

function elegirMimeType(): string {
  const candidatos = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg']
  return (
    candidatos.find((t) => {
      try {
        return MediaRecorder.isTypeSupported(t)
      } catch {
        return false
      }
    }) ?? ''
  )
}

interface ResultadoGrabador {
  grabando: boolean
  segundosGrabando: number
  errorGrabacion: string | null
  iniciarGrabacion: () => Promise<void>
  detenerGrabacion: () => void
}

export function useGrabadorAudioAdjunto(
  onBlobListo: (blob: Blob, mimeType: string) => void,
): ResultadoGrabador {
  const [grabando, setGrabando] = useState(false)
  const [segundosGrabando, setSegundosGrabando] = useState(0)
  const [errorGrabacion, setErrorGrabacion] = useState<string | null>(null)

  const grabadorRef = useRef<MediaRecorder | null>(null)
  const chunkRef = useRef<Blob[]>([])
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const limpiarTimers = useCallback(() => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current)
      intervaloRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const detenerGrabacion = useCallback(() => {
    if (grabadorRef.current && grabadorRef.current.state === 'recording') {
      grabadorRef.current.stop()
    }
    limpiarTimers()
  }, [limpiarTimers])

  const iniciarGrabacion = useCallback(async () => {
    setErrorGrabacion(null)

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (e) {
      const nombre = e instanceof Error ? e.name : ''
      const mensaje =
        nombre === 'NotAllowedError' || nombre === 'PermissionDeniedError'
          ? 'Permiso de microfono denegado'
          : 'Microfono no disponible'
      setErrorGrabacion(mensaje)
      return
    }

    chunkRef.current = []
    const mimeType = elegirMimeType()
    const opciones = mimeType ? { mimeType } : {}
    const grabador = new MediaRecorder(stream, opciones)
    grabadorRef.current = grabador

    grabador.ondataavailable = (e) => {
      if (e.data.size > 0) chunkRef.current.push(e.data)
    }

    grabador.onstop = () => {
      stream.getTracks().forEach((t) => t.stop())
      limpiarTimers()
      setGrabando(false)
      setSegundosGrabando(0)

      const blob = new Blob(chunkRef.current, { type: mimeType || 'audio/webm' })
      onBlobListo(blob, mimeType || 'audio/webm')
    }

    setGrabando(true)
    setSegundosGrabando(0)

    intervaloRef.current = setInterval(() => {
      setSegundosGrabando((s) => s + 1)
    }, 1000)

    timeoutRef.current = setTimeout(() => {
      if (grabadorRef.current?.state === 'recording') {
        grabadorRef.current.stop()
      }
      limpiarTimers()
    }, DURACION_MAX_SEG * 1000)

    grabador.start()
  }, [onBlobListo, limpiarTimers])

  return { grabando, segundosGrabando, errorGrabacion, iniciarGrabacion, detenerGrabacion }
}
