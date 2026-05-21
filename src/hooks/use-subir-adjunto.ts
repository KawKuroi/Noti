import { useCallback, useState } from 'react'
import { upload } from '@vercel/blob/client'
import { toast } from 'sonner'
import { registrarAdjunto } from '@/lib/actions/adjuntos.actions'
import type { AdjuntoNota, TipoAdjunto } from '@/types/notas.types'

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

export function determinarTipoArchivo(mime: string): TipoAdjunto | null {
  for (const [mimes, tipo] of MIMES_A_TIPO) {
    if (mimes.includes(mime)) return tipo
  }
  return null
}

interface ResultadoSubirAdjunto {
  subiendo: boolean
  subirArchivo: (archivo: File) => Promise<void>
}

export function useSubirAdjunto(
  cuadernoId: string,
  onAdjuntoSubido: (adjunto: AdjuntoNota) => void,
): ResultadoSubirAdjunto {
  const [subiendo, setSubiendo] = useState(false)

  const subirArchivo = useCallback(
    async (archivo: File) => {
      const tipo = determinarTipoArchivo(archivo.type)
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

  return { subiendo, subirArchivo }
}
