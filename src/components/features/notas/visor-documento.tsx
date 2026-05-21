'use client'

import { useState } from 'react'
import { FileText, File, Download, Eye, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  src: string
  nombreArchivo: string
  mime: string
  onEliminar?: () => void
}

function IconoDocumento({ mime }: { mime: string }) {
  if (mime === 'application/pdf') return <FileText size={18} className="text-red-500" />
  if (
    mime ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    return <FileText size={18} className="text-blue-500" />
  return <File size={18} className="text-gray-500" />
}

export function VisorDocumento({ src, nombreArchivo, mime, onEliminar }: Props) {
  const [abierto, setAbierto] = useState(false)
  const esPdf = mime === 'application/pdf'

  return (
    <>
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 min-w-[200px] max-w-[260px]">
        <IconoDocumento mime={mime} />
        <span className="flex-1 text-sm text-gray-700 truncate min-w-0">{nombreArchivo}</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {esPdf && (
            <Button
              variante="fantasma"
              tamano="icono"
              onClick={() => setAbierto(true)}
              className="h-6 w-6 text-gray-400 hover:text-gray-700"
              title="Ver PDF"
            >
              <Eye size={13} />
            </Button>
          )}
          <a href={src} download={nombreArchivo} title="Descargar">
            <Button
              variante="fantasma"
              tamano="icono"
              className="h-6 w-6 text-gray-400 hover:text-gray-700"
              asChild
            >
              <span>
                <Download size={13} />
              </span>
            </Button>
          </a>
          {onEliminar && (
            <button
              onClick={onEliminar}
              className="text-gray-300 hover:text-red-500 transition-colors"
              title="Eliminar documento"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {esPdf && (
        <Dialog open={abierto} onOpenChange={setAbierto}>
          <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="truncate">{nombreArchivo}</DialogTitle>
            </DialogHeader>
            <embed
              src={src}
              type="application/pdf"
              className="flex-1 w-full rounded border"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
