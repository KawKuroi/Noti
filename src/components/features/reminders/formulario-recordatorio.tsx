'use client'

import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { crearRecordatorio, actualizarRecordatorio } from '@/lib/actions/reminder.actions'
import { PRIORIDADES, DIAS_SEMANA, OPCIONES_ANTICIPACION } from '@/lib/utils/constants'
import { serializarReglaRecurrencia } from '@/lib/utils/date.utils'
import type { Categoria } from '@/types/category.types'
import type { Recordatorio, EstadoAccionRecordatorio } from '@/types/reminder.types'

const estadoInicial: EstadoAccionRecordatorio = { ok: false }

function CamposClases() {
  const [diasSeleccionados, setDias] = useState<number[]>([1])

  function alternarDia(dia: number) {
    setDias((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia],
    )
  }

  const regla = serializarReglaRecurrencia({ tipo: 'weekly', dias: diasSeleccionados })

  return (
    <>
      <input type="hidden" name="esRecurrente" value="true" />
      <input type="hidden" name="reglaRecurrencia" value={regla} />
      <div className="space-y-1">
        <Label>Dias de clase</Label>
        <div className="flex gap-1.5 flex-wrap">
          {DIAS_SEMANA.map((dia) => (
            <button
              key={dia.valor}
              type="button"
              onClick={() => alternarDia(dia.valor)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                diasSeleccionados.includes(dia.valor)
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {dia.corto}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="meta_horaInicio">Hora inicio</Label>
          <Input id="meta_horaInicio" name="meta_horaInicio" type="time" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="meta_horaFin">Hora fin</Label>
          <Input id="meta_horaFin" name="meta_horaFin" type="time" required />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="meta_aula">Aula (opcional)</Label>
        <Input id="meta_aula" name="meta_aula" placeholder="Ej: Salon 301" maxLength={100} />
      </div>
    </>
  )
}

function CamposTareas() {
  return (
    <div className="space-y-1">
      <Label htmlFor="meta_prioridad">Prioridad</Label>
      <select
        id="meta_prioridad"
        name="meta_prioridad"
        defaultValue="media"
        className="flex h-9 w-full rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
      >
        {PRIORIDADES.map((p) => (
          <option key={p.valor} value={p.valor}>
            {p.etiqueta}
          </option>
        ))}
      </select>
    </div>
  )
}

function CamposCumpleanos() {
  return (
    <>
      <input type="hidden" name="esRecurrente" value="true" />
      <input type="hidden" name="reglaRecurrencia" value="yearly" />
      <div className="space-y-1">
        <Label htmlFor="meta_edad">Edad (opcional)</Label>
        <Input
          id="meta_edad"
          name="meta_edad"
          type="number"
          min={0}
          max={150}
          placeholder="Ej: 25"
        />
      </div>
      <p className="text-xs text-gray-400">
        Este recordatorio se repetira cada ano automaticamente.
      </p>
    </>
  )
}

function CamposEventos() {
  return (
    <div className="space-y-1">
      <Label htmlFor="meta_ubicacion">Ubicacion (opcional)</Label>
      <Input
        id="meta_ubicacion"
        name="meta_ubicacion"
        placeholder="Ej: Calle 72 con Carrera 10"
        maxLength={200}
      />
    </div>
  )
}

function CamposEstudio() {
  return (
    <div className="space-y-1">
      <Label htmlFor="meta_duracionMin">Duracion estimada (minutos)</Label>
      <Input
        id="meta_duracionMin"
        name="meta_duracionMin"
        type="number"
        min={1}
        max={480}
        placeholder="Ej: 90"
      />
    </div>
  )
}

function BloqueCondicional({ slug }: { slug: string }) {
  switch (slug) {
    case 'classes':
      return <CamposClases />
    case 'tasks':
      return <CamposTareas />
    case 'birthdays':
      return <CamposCumpleanos />
    case 'events':
      return <CamposEventos />
    case 'study':
      return <CamposEstudio />
    default:
      return null
  }
}

function BotonEnvio({ editar }: { editar: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Guardando...' : editar ? 'Guardar cambios' : 'Crear recordatorio'}
    </Button>
  )
}

interface Props {
  categorias: Categoria[]
  recordatorio?: Recordatorio
  slugInicial?: string
  onExito?: () => void
}

export function FormularioRecordatorio({ categorias, recordatorio, slugInicial, onExito }: Props) {
  const esEdicion = Boolean(recordatorio)
  const accion = esEdicion
    ? actualizarRecordatorio.bind(null, recordatorio!.id)
    : crearRecordatorio

  const [estado, dispatch] = useActionState(accion, estadoInicial)

  const categoriaInicial = recordatorio
    ? categorias.find((c) => c.id === recordatorio.categoriaId)
    : categorias.find((c) => c.slug === slugInicial) ?? categorias[0]

  const [slugActual, setSlugActual] = useState(categoriaInicial?.slug ?? 'events')
  const [categoriaIdActual, setCategoriaId] = useState(categoriaInicial?.id ?? categorias[0]?.id)

  useEffect(() => {
    if (estado.ok) {
      toast.success(esEdicion ? 'Recordatorio actualizado' : 'Recordatorio creado')
      if (onExito) onExito()
    }
  }, [estado.ok, esEdicion, onExito])

  function alCambiarCategoria(slug: string) {
    const cat = categorias.find((c) => c.slug === slug)
    if (cat) {
      setSlugActual(slug)
      setCategoriaId(cat.id)
    }
  }

  const fechaVencimientoInicial = recordatorio
    ? new Date(recordatorio.fechaVencimiento).toISOString().split('T')[0]
    : ''
  const horaVencimientoInicial = recordatorio
    ? new Date(recordatorio.fechaVencimiento).toTimeString().slice(0, 5)
    : ''

  const tieneError = !estado.ok && estado.error && typeof estado.error === 'string'

  return (
    <form action={dispatch} className="space-y-4">
      <input type="hidden" name="slug" value={slugActual} />
      <input type="hidden" name="categoriaId" value={categoriaIdActual} />

      {/* Selector de categoria */}
      {!esEdicion && (
        <div className="space-y-1">
          <Label>Categoria</Label>
          <div className="flex gap-1.5 flex-wrap">
            {categorias.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => alCambiarCategoria(cat.slug)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  slugActual === cat.slug
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Titulo */}
      <div className="space-y-1">
        <Label htmlFor="titulo">Titulo</Label>
        <Input
          id="titulo"
          name="titulo"
          defaultValue={recordatorio?.titulo}
          placeholder="Ej: Estudiar calculo"
          maxLength={100}
          required
        />
      </div>

      {/* Descripcion */}
      <div className="space-y-1">
        <Label htmlFor="descripcion">Descripcion (opcional)</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          defaultValue={recordatorio?.descripcion ?? ''}
          placeholder="Agrega detalles adicionales..."
          maxLength={500}
        />
      </div>

      {/* Fecha y hora (cumpleanos solo fecha) */}
      <div className={`grid gap-3 ${slugActual !== 'birthdays' ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <div className="space-y-1">
          <Label htmlFor="fechaVencimiento">
            {slugActual === 'birthdays' ? 'Fecha de nacimiento' : 'Fecha'}
          </Label>
          <Input
            id="fechaVencimiento"
            name="fechaVencimiento"
            type="date"
            defaultValue={fechaVencimientoInicial}
            required
          />
        </div>
        {slugActual !== 'birthdays' && (
          <div className="space-y-1">
            <Label htmlFor="horaVencimiento">Hora</Label>
            <Input
              id="horaVencimiento"
              name="horaVencimiento"
              type="time"
              defaultValue={horaVencimientoInicial}
            />
          </div>
        )}
      </div>

      {/* Anticipacion de notificacion */}
      <div className="space-y-1">
        <Label htmlFor="anticipacionMin">Notificar</Label>
        <select
          id="anticipacionMin"
          name="anticipacionMin"
          defaultValue="15"
          className="flex h-9 w-full rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          {OPCIONES_ANTICIPACION.map((op) => (
            <option key={op.valor} value={op.valor}>
              {op.etiqueta}
            </option>
          ))}
        </select>
      </div>

      {/* Campos condicionales por categoria */}
      <BloqueCondicional slug={slugActual} />

      {/* Errores */}
      {tieneError && (
        <p className="text-sm text-red-500">{estado.error as string}</p>
      )}

      <BotonEnvio editar={esEdicion} />
    </form>
  )
}
