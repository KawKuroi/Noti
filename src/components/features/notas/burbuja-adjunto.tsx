'use client'

import { VisorImagen } from './visor-imagen'
import { ReproductorAudio } from './reproductor-audio'
import { VisorDocumento } from './visor-documento'
import { ReproductorVideo } from './reproductor-video'
import { formatearMomentoNota } from '@/lib/utils/date.utils'
import type { AdjuntoNota } from '@/types/notas.types'

interface Props {
  adjunto: AdjuntoNota
  onEliminar: (id: string) => void
}

export function BurbujaAdjunto({ adjunto, onEliminar }: Props) {
  const momento = formatearMomentoNota(new Date(adjunto.creadoEn))

  function manejarEliminar() {
    onEliminar(adjunto.id)
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {adjunto.tipo === 'imagen' && (
        <VisorImagen
          src={adjunto.url}
          nombreArchivo={adjunto.nombreArchivo}
          onEliminar={manejarEliminar}
        />
      )}
      {adjunto.tipo === 'audio' && (
        <ReproductorAudio
          src={adjunto.url}
          nombreArchivo={adjunto.nombreArchivo}
          onEliminar={manejarEliminar}
        />
      )}
      {(adjunto.tipo === 'documento' || adjunto.tipo === 'otros') && (
        <VisorDocumento
          src={adjunto.url}
          nombreArchivo={adjunto.nombreArchivo}
          mime={adjunto.mime}
          onEliminar={manejarEliminar}
        />
      )}
      {adjunto.tipo === 'video' && (
        <ReproductorVideo
          src={adjunto.url}
          nombreArchivo={adjunto.nombreArchivo}
          onEliminar={manejarEliminar}
        />
      )}
      <span className="text-xs text-gray-400">{momento}</span>
    </div>
  )
}
