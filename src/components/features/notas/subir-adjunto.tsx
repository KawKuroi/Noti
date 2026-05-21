'use client'

import { useCallback, useRef } from 'react'
import { Paperclip, Mic, MicOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGrabadorAudioAdjunto } from '@/hooks/use-grabador-audio-adjunto'

interface Props {
  subirArchivo: (archivo: File) => Promise<void>
  subiendo: boolean
}

export function SubirAdjunto({ subirArchivo, subiendo }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const manejarBlobAudio = useCallback(
    (blob: Blob, mimeType: string) => {
      const extension = mimeType.includes('ogg') ? 'ogg' : 'webm'
      const archivo = new File([blob], `audio-${Date.now()}.${extension}`, { type: mimeType })
      void subirArchivo(archivo)
    },
    [subirArchivo],
  )

  const { grabando, segundosGrabando, errorGrabacion, iniciarGrabacion, detenerGrabacion } =
    useGrabadorAudioAdjunto(manejarBlobAudio)

  function manejarSeleccion(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    if (archivo) void subirArchivo(archivo)
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
      <div className="flex items-center gap-1 text-indigo-500">
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
        accept="image/jpeg,image/png,image/webp,audio/mpeg,audio/ogg,audio/wav,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,video/mp4,video/webm"
        className="hidden"
        onChange={manejarSeleccion}
      />
      <Button
        variante="fantasma"
        tamano="icono"
        onClick={() => inputRef.current?.click()}
        className="h-8 w-8 text-gray-400 hover:text-gray-700"
        title="Adjuntar archivo"
      >
        <Paperclip size={15} />
      </Button>

      <Button
        variante="fantasma"
        tamano="icono"
        onClick={alternarGrabacion}
        className={
          grabando
            ? 'h-8 w-8 text-red-500 hover:text-red-600'
            : 'h-8 w-8 text-gray-400 hover:text-gray-700'
        }
        title={grabando ? `Detener (${segundosGrabando}s)` : 'Grabar audio'}
      >
        {grabando ? <MicOff size={15} /> : <Mic size={15} />}
      </Button>

      {errorGrabacion && (
        <span className="text-xs text-red-500">{errorGrabacion}</span>
      )}
    </div>
  )
}
