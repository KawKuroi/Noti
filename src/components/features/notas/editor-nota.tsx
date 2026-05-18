'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { crearRecordatorio, actualizarRecordatorio } from '@/lib/actions/reminder.actions'
import { format } from 'date-fns'
import type { Categoria } from '@/types/category.types'
import type { Recordatorio, EstadoAccionRecordatorio } from '@/types/reminder.types'

const estadoInicial: EstadoAccionRecordatorio = { ok: false }

function BotonGuardar({ editar }: { editar: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Guardando...' : editar ? 'Guardar cambios' : 'Crear nota'}
    </Button>
  )
}

interface Props {
  categorias: Categoria[]
  nota?: Recordatorio
  onExito?: () => void
}

export function EditorNota({ categorias, nota, onExito }: Props) {
  const esEdicion = Boolean(nota)
  const categoriaNotas = categorias.find((c) => c.slug === 'notes')

  const accion = esEdicion && nota
    ? actualizarRecordatorio.bind(null, nota.id)
    : crearRecordatorio

  const [estado, dispatch] = useActionState(accion, estadoInicial)

  const metadatos = nota?.metadatos as { recordarme?: boolean } | null
  const [recordarme, setRecordarme] = useState(metadatos?.recordarme ?? false)

  const [fecha, setFecha] = useState(
    nota?.fechaVencimiento ? format(new Date(nota.fechaVencimiento), 'yyyy-MM-dd') : '',
  )
  const [hora, setHora] = useState(
    nota?.fechaVencimiento ? format(new Date(nota.fechaVencimiento), 'HH:mm') : '',
  )

  const fechaHoraUtc = useMemo(() => {
    if (!recordarme || !fecha || !hora) return ''
    const d = new Date(`${fecha}T${hora}:00`)
    return isNaN(d.getTime()) ? '' : d.toISOString()
  }, [recordarme, fecha, hora])

  useEffect(() => {
    if (estado.ok) {
      toast.success(esEdicion ? 'Nota actualizada' : 'Nota creada')
      onExito?.()
    } else if (!estado.ok && estado.error && typeof estado.error === 'string') {
      toast.error(estado.error)
    }
  }, [estado, esEdicion, onExito])

  if (!categoriaNotas) return null

  return (
    <form action={dispatch} className="space-y-4">
      <input type="hidden" name="slug" value="notes" />
      <input type="hidden" name="categoriaId" value={categoriaNotas.id} />
      <input type="hidden" name="meta_recordarme" value={String(recordarme)} />
      <input type="hidden" name="fechaHoraUtc" value={fechaHoraUtc} />

      <div className="space-y-1">
        <Label htmlFor="titulo">Titulo</Label>
        <Input
          id="titulo"
          name="titulo"
          defaultValue={nota?.titulo}
          placeholder="Sin titulo"
          maxLength={100}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="descripcion">Contenido</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          defaultValue={nota?.descripcion ?? ''}
          placeholder="Escribe aqui..."
          maxLength={10000}
          className="min-h-[200px] resize-y"
        />
      </div>

      <div className="space-y-3 rounded-lg border border-gray-100 p-3">
        <button
          type="button"
          onClick={() => setRecordarme((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 w-full"
        >
          <div
            className={`w-8 h-4.5 rounded-full transition-colors flex items-center px-0.5 ${
              recordarme ? 'bg-indigo-500' : 'bg-gray-200'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                recordarme ? 'translate-x-3.5' : 'translate-x-0'
              }`}
            />
          </div>
          <Bell size={14} />
          Recordarme
        </button>

        {recordarme && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <Label htmlFor="fechaVencimiento">Fecha</Label>
              <Input
                id="fechaVencimiento"
                name="fechaVencimiento"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="horaVencimiento">Hora</Label>
              <Input
                id="horaVencimiento"
                name="horaVencimiento"
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <BotonGuardar editar={esEdicion} />
    </form>
  )
}
