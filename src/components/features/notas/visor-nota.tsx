'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Trash2, Copy, ArrowLeft, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { EditorNota } from './editor-nota'
import { eliminarRecordatorio, duplicarNota } from '@/lib/actions/reminder.actions'
import { formatearFechaCorta } from '@/lib/utils/date.utils'
import type { Recordatorio } from '@/types/reminder.types'
import type { Categoria } from '@/types/category.types'

interface Props {
  nota: Recordatorio
  categorias: Categoria[]
}

export function VisorNota({ nota, categorias }: Props) {
  const router = useRouter()
  const [editarAbierto, setEditarAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)

  const tieneRecordatorio = nota.fechaVencimiento !== null
  const fechaRecordatorio = nota.fechaVencimiento
    ? formatearFechaCorta(new Date(nota.fechaVencimiento))
    : null

  async function manejarEliminar() {
    if (!confirm('¿Eliminar esta nota?')) return
    setCargando(true)
    const resultado = await eliminarRecordatorio(nota.id)
    setCargando(false)
    if (resultado.ok) {
      toast.success('Nota eliminada')
      router.push('/notes')
    } else {
      toast.error(resultado.error ?? 'No se pudo eliminar la nota')
    }
  }

  async function manejarDuplicar() {
    setCargando(true)
    const resultado = await duplicarNota(nota.id)
    setCargando(false)
    if (resultado.ok) {
      toast.success('Nota duplicada')
      if (resultado.nuevoId) router.push(`/notes/${resultado.nuevoId}`)
    } else {
      toast.error(resultado.error ?? 'No se pudo duplicar la nota')
    }
  }

  return (
    <>
      <div className="max-w-2xl mx-auto">
        {/* Cabecera */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variante="fantasma"
            tamano="sm"
            onClick={() => router.push('/notes')}
            className="gap-1.5 text-gray-500"
          >
            <ArrowLeft size={15} />
            Notas
          </Button>

          <div className="flex items-center gap-1">
            <Button
              variante="contorno"
              tamano="sm"
              onClick={() => setEditarAbierto(true)}
              className="gap-1.5"
            >
              <Pencil size={13} />
              Editar
            </Button>
            <Button
              variante="contorno"
              tamano="sm"
              onClick={manejarDuplicar}
              disabled={cargando}
              className="gap-1.5"
            >
              <Copy size={13} />
              Duplicar
            </Button>
            <Button
              variante="contorno"
              tamano="sm"
              onClick={manejarEliminar}
              disabled={cargando}
              className="gap-1.5 hover:text-red-500 hover:border-red-200"
            >
              <Trash2 size={13} />
              Eliminar
            </Button>
          </div>
        </div>

        {/* Contenido */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {nota.titulo || 'Sin titulo'}
          </h1>

          {tieneRecordatorio && fechaRecordatorio && (
            <div className="flex items-center gap-1.5 text-sm text-indigo-600 font-medium mb-4">
              <Bell size={14} />
              Recordatorio: {fechaRecordatorio}
            </div>
          )}

          {nota.descripcion ? (
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {nota.descripcion}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">Sin contenido</p>
          )}
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
