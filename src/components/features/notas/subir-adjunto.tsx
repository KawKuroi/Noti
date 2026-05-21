'use client'

import { useCallback, useRef, useState } from 'react'
import { Paperclip, Mic, MicOff, Loader2 } from 'lucide-react'
import { upload } from '@vercel/blob/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useGrabadorAudioAdjunto } from '@/hooks/use-grabador-audio-adjunto'
import { registrarAdjunto } from '@/lib/actions/adjuntos.actions'
import type { AdjuntoNota, TipoAdjunto } from '@/types/notas.types'

interface Props {
  cuadernoId: string
  onAdjuntoSubido: (adjunto: AdjuntoNota) => void
}

const LIMITE_MB: Record<TipoAdjunto, number> = {
  imagen: 5,
  audio: 10,
  documento: 10,
  video: 25,
}

const MIMES_A_TIPO: [string[], TipoAdjunto][] = [
  [['image/jpeg', 'image/png', 'image/webp'], 'imagen'],
  [['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm'], 'audio'],
  [
    [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    'documento',
  ],
  [['video/mp4', 'video/webm'], 'video'],
]

function determinarTipo(mime: string): TipoAdjunto | null {
  for (const [mimes, tipo] of MIMES_A_TIPO) {
    if (mimes.includes(mime)) return tipo
  }
  return null
}

export function SubirAdjunto({ cuadernoId, onAdjuntoSubido }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState(false)

  const subirArchivo = useCallback(
    async (archivo: File) => {
      const tipo = determinarTipo(archivo.type)
      if (!tipo) {
        toast.error('Tipo de archivo no soportado')
        return
      }

      const limiteMb = LIMITE_MB[tipo]
      if (archivo.size > limiteMb * 1024 * 1024) {
        toast.error(`El archivo supera el limite de ${limiteMb} MB para ${tipo}`)
        return
      }

      setSubiendo(true)
      try {
        const nombreUnico = `notas/${cuadernoId}/${Date.now()}-${archivo.name}`
        const resultado = await upload(nombreUnico, archivo, {
          access: 'public',
          handleUploadUrl: '/api/notas/adjunto',
          clientPayload: JSON.stringify({
            cuadernoId,
            tipo,
            nombreArchivo: archivo.name,
            tamano: archivo.size,
          }),
        })

        const accion = await registrarAdjunto(
          cuadernoId,
          tipo,
          resultado.url,
          archivo.name,
          archivo.type,
          archivo.size,
        )

        if (accion.ok && accion.adjunto) {
          onAdjuntoSubido(accion.adjunto)
        } else {
          toast.error(accion.error ?? 'Error al guardar el adjunto')
        }
      } catch {
        toast.error('Error al subir el archivo')
      } finally {
        setSubiendo(false)
      }
    },
    [cuadernoId, onAdjuntoSubido],
  )

  function manejarSeleccion(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    if (archivo) void subirArchivo(archivo)
    e.target.value = ''
  }

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
