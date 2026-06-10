'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Bell, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { EditorNota } from './editor-nota'
import { eliminarRecordatorio } from '@/lib/actions/reminder.actions'
import type { Recordatorio } from '@/types/reminder.types'
import type { Categoria } from '@/types/category.types'

interface Props {
  nota: Recordatorio
  categorias: Categoria[]
}

export function TarjetaNota({ nota, categorias }: Props) {
  const [editarAbierto, setEditarAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)

  const preview = nota.descripcion
    ? nota.descripcion.split('\n').slice(0, 2).join('\n')
    : null
  const fechaCreacion = format(new Date(nota.creadoEn), "d 'de' MMM yyyy", { locale: es })
  const tieneRecordatorio = nota.fechaVencimiento !== null

  async function manejarEliminar(e: React.MouseEvent) {
    e.preventDefault()
    if (!confirm('¿Eliminar esta nota?')) return
    setCargando(true)
    const resultado = await eliminarRecordatorio(nota.id)
    setCargando(false)
    if (!resultado.ok) toast.error(resultado.error ?? 'No se pudo eliminar la nota')
  }

  return (
    <>
      <div className="group relative bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-xs transition-all flex flex-col">
        <Link href={`/notes/${nota.id}`} className="flex-1 p-4 block">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {nota.titulo || 'Sin titulo'}
          </p>
          {preview && (
            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 whitespace-pre-line">
              {preview}
            </p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-gray-400">{fechaCreacion}</span>
            {tieneRecordatorio && (
              <span className="flex items-center gap-1 text-xs text-indigo-500 font-medium">
                <Bell size={10} />
                Recordatorio
              </span>
            )}
          </div>
        </Link>

        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variante="fantasma"
            tamano="icono"
            onClick={() => setEditarAbierto(true)}
            title="Editar"
          >
            <Pencil size={13} />
          </Button>
          <Button
            variante="fantasma"
            tamano="icono"
            onClick={manejarEliminar}
            disabled={cargando}
            title="Eliminar"
            className="hover:text-red-500"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </div>

      <Dialog open={editarAbierto} onOpenChange={setEditarAbierto}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar nota</DialogTitle>
            <DialogDescription>Modifica el titulo y contenido de la nota.</DialogDescription>
          </DialogHeader>
          <EditorNota
            categorias={categorias}
            nota={nota}
            onExito={() => setEditarAbierto(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
