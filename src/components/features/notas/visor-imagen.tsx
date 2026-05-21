'use client'

import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface Props {
  src: string
  nombreArchivo: string
  onEliminar?: () => void
}

export function VisorImagen({ src, nombreArchivo, onEliminar }: Props) {
  const [abierto, setAbierto] = useState(false)

  return (
    <>
      <div className="relative group/img inline-block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={nombreArchivo}
          onClick={() => setAbierto(true)}
          className="max-w-[200px] max-h-[200px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
        />
        {onEliminar && (
          <button
            onClick={onEliminar}
            className="absolute top-1 right-1 opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/60 hover:bg-red-600 text-white rounded p-0.5"
            title="Eliminar imagen"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-w-3xl p-2 bg-black/90 border-none">
          <div className="relative">
            <Button
              variante="fantasma"
              tamano="icono"
              onClick={() => setAbierto(false)}
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
            >
              <X size={16} />
            </Button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={nombreArchivo}
              className="max-h-[80vh] w-full object-contain rounded-lg"
            />
            <p className="text-center text-sm text-gray-400 mt-2 px-2">{nombreArchivo}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
