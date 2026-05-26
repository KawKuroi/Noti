'use client'

import { useCallback, useRef } from 'react'
import { Paperclip, Mic, MicOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGrabadorAudioAdjunto } from '@/hooks/use-grabador-audio-adjunto'

interface Props {
  onArchivoSeleccionado: (archivo: File) => void
  subiendo: boolean
  deshabilitado?: boolean
}

export function SubirAdjunto({ onArchivoSeleccionado, subiendo, deshabilitado }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const manejarBlobAudio = useCallback(
    (blob: Blob, mimeType: string) => {
      const extension = mimeType.includes('ogg') ? 'ogg' : 'webm'
      const archivo = new File([blob], `audio-${Date.now()}.${extension}`, { type: mimeType })
      onArchivoSeleccionado(archivo)
    },
    [onArchivoSeleccionado],
  )

  const { grabando, segundosGrabando, errorGrabacion, iniciarGrabacion, detenerGrabacion } =
    useGrabadorAudioAdjunto(manejarBlobAudio)

  function manejarSeleccion(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    if (archivo) onArchivoSeleccionado(archivo)
    e.target.value = ''
  }

  function alternarGrabacion() {
    if (grabando) {
      detenerGrabacion()
    } else {
      void iniciarGrabacion()
    }
  }

  if (subiendo) {
    return (
      <div className="flex items-center gap-1 text-indigo-500 h-10 px-2">
        <Loader2 size={15} className="animate-spin" />
        <span className="text-xs">Subiendo...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="*/*"
        className="hidden"
        onChange={manejarSeleccion}
      />
      <Button
        variante="fantasma"
        tamano="icono"
        onClick={() => inputRef.current?.click()}
        disabled={deshabilitado}
        className="h-10 w-10 text-gray-400 hover:text-gray-700 disabled:opacity-40"
        title="Adjuntar archivo"
      >
        <Paperclip size={16} />
      </Button>

      <Button
        variante="fantasma"
        tamano="icono"
        onClick={alternarGrabacion}
        disabled={deshabilitado && !grabando}
        className={
          grabando
            ? 'h-10 w-10 text-red-500 hover:text-red-600'
            : 'h-10 w-10 text-gray-400 hover:text-gray-700 disabled:opacity-40'
        }
        title={grabando ? `Detener (${segundosGrabando}s)` : 'Grabar audio'}
      >
        {grabando ? <MicOff size={16} /> : <Mic size={16} />}
      </Button>

      {errorGrabacion && (
        <span className="text-xs text-red-500">{errorGrabacion}</span>
      )}
    </div>
  )
}
