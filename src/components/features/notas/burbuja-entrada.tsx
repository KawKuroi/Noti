'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { actualizarEntrada, eliminarEntrada } from '@/lib/actions/notas.actions'
import type { NotaEntrada } from '@/types/notas.types'

interface Props {
  entrada: NotaEntrada
  onActualizar: (id: string, contenido: string) => void
  onEliminar: (id: string) => void
}

export function BurbujaEntrada({ entrada, onActualizar, onEliminar }: Props) {
  const [editando, setEditando] = useState(false)
  const [textoEdit, setTextoEdit] = useState(entrada.contenido)
  const [cargando, setCargando] = useState(false)

  const hora = format(new Date(entrada.creadoEn), 'HH:mm', { locale: es })

  async function manejarGuardar() {
    const limpio = textoEdit.trim()
    if (!limpio || limpio === entrada.contenido) {
      setEditando(false)
      return
    }
    setCargando(true)
    const resultado = await actualizarEntrada(entrada.id, limpio)
    setCargando(false)
    if (resultado.ok) {
      onActualizar(entrada.id, limpio)
      setEditando(false)
    } else {
      toast.error(resultado.error ?? 'No se pudo actualizar')
    }
  }

  async function manejarEliminar() {
    setCargando(true)
    const resultado = await eliminarEntrada(entrada.id)
    setCargando(false)
    if (resultado.ok) {
      onEliminar(entrada.id)
    } else {
      toast.error(resultado.error ?? 'No se pudo eliminar')
    }
  }

  return (
    <div className="group flex items-end justify-end gap-2">
      {editando ? (
        <div className="flex flex-col gap-2 w-full max-w-sm">
          <Textarea
            value={textoEdit}
            onChange={(e) => setTextoEdit(e.target.value)}
            className="min-h-[60px] text-sm resize-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                manejarGuardar()
              }
              if (e.key === 'Escape') setEditando(false)
            }}
          />
          <div className="flex items-center gap-2 justify-end">
            <Button
              variante="fantasma"
              tamano="sm"
              onClick={() => setEditando(false)}
              disabled={cargando}
            >
              <X size={14} className="mr-1" />
              Cancelar
            </Button>
            <Button tamano="sm" onClick={manejarGuardar} disabled={cargando}>
              <Check size={14} className="mr-1" />
              {cargando ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 pb-1">
            <Button
              variante="fantasma"
              tamano="icono"
              className="h-6 w-6"
              onClick={() => setEditando(true)}
              title="Editar"
            >
              <Pencil size={11} />
            </Button>
            <Button
              variante="fantasma"
              tamano="icono"
              className="h-6 w-6 hover:text-red-500"
              onClick={manejarEliminar}
              disabled={cargando}
              title="Eliminar"
            >
              <Trash2 size={11} />
            </Button>
          </div>

          <div className="flex flex-col items-end gap-1 max-w-[75%]">
            <div className="bg-indigo-500 text-white text-sm rounded-2xl rounded-br-md px-4 py-2.5 leading-relaxed break-words">
              {entrada.contenido}
            </div>
            <span className="text-xs text-gray-400 px-1">{hora}</span>
          </div>
        </>
      )}
    </div>
  )
}
