'use client'

import { Trash2 } from 'lucide-react'

interface Props {
  src: string
  nombreArchivo: string
  onEliminar?: () => void
}

export function ReproductorVideo({ src, nombreArchivo, onEliminar }: Props) {
  return (
    <div className="max-w-xs">
      <video
        src={src}
        controls
        className="w-full rounded-lg"
        aria-label={nombreArchivo}
      />
      {onEliminar && (
        <button
          onClick={onEliminar}
          className="flex items-center gap-1 mt-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
          title="Eliminar video"
        >
          <Trash2 size={11} />
          Eliminar
        </button>
      )}
    </div>
  )
}
