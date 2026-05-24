'use client'

import { useActionState, useEffect, useMemo, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { crearRecordatorio, actualizarRecordatorio } from '@/lib/actions/reminder.actions'
import { PRIORIDADES, OPCIONES_ANTICIPACION } from '@/lib/utils/constants'
import { format } from 'date-fns'
import type { Categoria } from '@/types/category.types'
import type { Recordatorio, EstadoAccionRecordatorio } from '@/types/reminder.types'

const estadoInicial: EstadoAccionRecordatorio = { ok: false }

const MAPA_PALABRAS_CLAVE: Array<{ palabras: string[]; slug: string }> = [
  { palabras: ['cumpleanos', 'cumple', 'birthday', 'aniversario'], slug: 'birthdays' },
  { palabras: ['estudiar', 'examen', 'clase', 'curso', 'practica', 'aprender'], slug: 'study' },
  { palabras: ['pelicula', 'film', 'cine', 'estreno', 'movie'], slug: 'movies' },
  { palabras: ['serie', 'temporada', 'episodio', 'netflix', 'hbo', 'disney', 'streaming'], slug: 'tv' },
  { palabras: ['juego', 'videojuego', 'game', 'dlc', 'expansion'], slug: 'games' },
  { palabras: ['libro', 'novela', 'editorial', 'author'], slug: 'books' },
  { palabras: ['album', 'disco', 'cancion', 'concierto', 'musica', 'artista', 'banda'], slug: 'music' },
  { palabras: ['tarea', 'pendiente', 'hacer', 'completar', 'entregar', 'enviar'], slug: 'tasks' },
  { palabras: ['evento', 'reunion', 'conferencia', 'cita', 'fiesta', 'boda'], slug: 'events' },
  { palabras: ['nota', 'apunte', 'memo', 'ideas'], slug: 'notes' },
]

function inferirCategoria(titulo: string): string | null {
  const normalizado = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
  for (const regla of MAPA_PALABRAS_CLAVE) {
    if (regla.palabras.some((p) => normalizado.includes(p))) {
      return regla.slug
    }
  }
  return null
}

function CamposTareas({ prioridadInicial }: { prioridadInicial?: string }) {
  return (
    <div className="space-y-1">
      <Label htmlFor="meta_prioridad">Prioridad</Label>
      <select
        id="meta_prioridad"
        name="meta_prioridad"
        defaultValue={prioridadInicial ?? 'media'}
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

function CamposCumpleanos({ edadInicial }: { edadInicial?: number }) {
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
          defaultValue={edadInicial}
        />
      </div>
      <p className="text-xs text-gray-400">
        Este recordatorio se repetira cada ano automaticamente.
      </p>
    </>
  )
}

function CamposEventos({ ubicacionInicial }: { ubicacionInicial?: string }) {
  return (
    <div className="space-y-1">
      <Label htmlFor="meta_ubicacion">Ubicacion (opcional)</Label>
      <Input
        id="meta_ubicacion"
        name="meta_ubicacion"
        placeholder="Ej: Calle 72 con Carrera 10"
        maxLength={200}
        defaultValue={ubicacionInicial ?? ''}
      />
    </div>
  )
}

function CamposEstudio({ duracionInicial }: { duracionInicial?: number }) {
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
        defaultValue={duracionInicial}
      />
    </div>
  )
}

function CamposPelicula({ directorInicial }: { directorInicial?: string }) {
  return (
    <>
      <input type="hidden" name="meta_tipo" value="movie" />
      <div className="space-y-1">
        <Label htmlFor="meta_director">Director (opcional)</Label>
        <Input
          id="meta_director"
          name="meta_director"
          placeholder="Ej: Denis Villeneuve"
          maxLength={120}
          defaultValue={directorInicial ?? ''}
        />
      </div>
    </>
  )
}

function CamposSerie({
  directorInicial,
  plataformaInicial,
  temporadaInicial,
}: {
  directorInicial?: string
  plataformaInicial?: string
  temporadaInicial?: number
}) {
  return (
    <>
      <input type="hidden" name="meta_tipo" value="tv" />
      <div className="space-y-1">
        <Label htmlFor="meta_director">Showrunner (opcional)</Label>
        <Input
          id="meta_director"
          name="meta_director"
          placeholder="Ej: Vince Gilligan"
          maxLength={120}
          defaultValue={directorInicial ?? ''}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="meta_plataforma">Plataforma (opcional)</Label>
          <Input
            id="meta_plataforma"
            name="meta_plataforma"
            placeholder="Ej: Netflix"
            maxLength={80}
            defaultValue={plataformaInicial ?? ''}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="meta_temporada">Temporada</Label>
          <Input
            id="meta_temporada"
            name="meta_temporada"
            type="number"
            min={1}
            max={99}
            placeholder="Ej: 2"
            defaultValue={temporadaInicial}
          />
        </div>
      </div>
    </>
  )
}

function CamposJuego({
  plataformaInicial,
  desarrolladoraInicial,
}: {
  plataformaInicial?: string
  desarrolladoraInicial?: string
}) {
  return (
    <>
      <input type="hidden" name="meta_tipo" value="game" />
      <div className="space-y-1">
        <Label htmlFor="meta_plataforma">Plataforma (opcional)</Label>
        <Input
          id="meta_plataforma"
          name="meta_plataforma"
          placeholder="Ej: PS5, PC, Switch"
          maxLength={80}
          defaultValue={plataformaInicial ?? ''}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="meta_desarrolladora">Desarrolladora (opcional)</Label>
        <Input
          id="meta_desarrolladora"
          name="meta_desarrolladora"
          placeholder="Ej: Rockstar Games"
          maxLength={120}
          defaultValue={desarrolladoraInicial ?? ''}
        />
      </div>
    </>
  )
}

function CamposMusica({ artistaInicial }: { artistaInicial?: string }) {
  return (
    <>
      <input type="hidden" name="meta_tipo" value="album" />
      <div className="space-y-1">
        <Label htmlFor="meta_artista">Artista (opcional)</Label>
        <Input
          id="meta_artista"
          name="meta_artista"
          placeholder="Ej: Bad Bunny"
          maxLength={120}
          defaultValue={artistaInicial ?? ''}
        />
      </div>
    </>
  )
}

function CamposLibro({
  autorInicial,
  editorialInicial,
}: {
  autorInicial?: string
  editorialInicial?: string
}) {
  return (
    <>
      <input type="hidden" name="meta_tipo" value="book" />
      <div className="space-y-1">
        <Label htmlFor="meta_autor">Autor (opcional)</Label>
        <Input
          id="meta_autor"
          name="meta_autor"
          placeholder="Ej: Brandon Sanderson"
          maxLength={120}
          defaultValue={autorInicial ?? ''}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="meta_editorial">Editorial (opcional)</Label>
        <Input
          id="meta_editorial"
          name="meta_editorial"
          placeholder="Ej: Tor Books"
          maxLength={120}
          defaultValue={editorialInicial ?? ''}
        />
      </div>
    </>
  )
}

function BloqueCondicional({
  slug,
  metadatos,
}: {
  slug: string
  metadatos?: Record<string, unknown>
}) {
  switch (slug) {
    case 'tasks':
      return <CamposTareas prioridadInicial={metadatos?.prioridad as string | undefined} />
    case 'birthdays':
      return <CamposCumpleanos edadInicial={metadatos?.edad as number | undefined} />
    case 'events':
      return <CamposEventos ubicacionInicial={metadatos?.ubicacion as string | undefined} />
    case 'study':
      return <CamposEstudio duracionInicial={metadatos?.duracionMin as number | undefined} />
    case 'movies':
      return <CamposPelicula directorInicial={metadatos?.director as string | undefined} />
    case 'tv':
      return (
        <CamposSerie
          directorInicial={metadatos?.director as string | undefined}
          plataformaInicial={metadatos?.plataforma as string | undefined}
          temporadaInicial={metadatos?.temporada as number | undefined}
        />
      )
    case 'games':
      return (
        <CamposJuego
          plataformaInicial={metadatos?.plataforma as string | undefined}
          desarrolladoraInicial={metadatos?.desarrolladora as string | undefined}
        />
      )
    case 'music':
      return <CamposMusica artistaInicial={metadatos?.artista as string | undefined} />
    case 'books':
      return (
        <CamposLibro
          autorInicial={metadatos?.autor as string | undefined}
          editorialInicial={metadatos?.editorial as string | undefined}
        />
      )
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
  const [metadatosIniciales] = useState(
    recordatorio?.metadatos as Record<string, unknown> | undefined,
  )
  const [slugInicialEdicion] = useState(categoriaInicial?.slug)
  const [tituloActual, setTituloActual] = useState(recordatorio?.titulo ?? '')

  const onExitoRef = useRef(onExito)
  onExitoRef.current = onExito

  useEffect(() => {
    if (estado.ok) {
      toast.success(esEdicion ? 'Recordatorio actualizado' : 'Recordatorio creado')
      onExitoRef.current?.()
    } else if (typeof estado.error === 'string') {
      toast.error(estado.error)
    } else if (estado.error && typeof estado.error === 'object') {
      toast.error('Revisa los campos del formulario')
    }
  }, [estado.ok, estado.error, esEdicion])

  function alCambiarCategoria(slug: string) {
    const cat = categorias.find((c) => c.slug === slug)
    if (cat) {
      setSlugActual(slug)
      setCategoriaId(cat.id)
    }
  }

  const fechaVencimientoInicial = recordatorio?.fechaVencimiento
    ? format(new Date(recordatorio.fechaVencimiento), 'yyyy-MM-dd')
    : ''
  const horaVencimientoInicial = recordatorio?.fechaVencimiento
    ? format(new Date(recordatorio.fechaVencimiento), 'HH:mm')
    : ''

  const [fecha, setFecha] = useState(fechaVencimientoInicial)
  const [hora, setHora] = useState(horaVencimientoInicial)

  const fechaHoraUtc = useMemo(() => {
    if (!fecha || !hora) return ''
    const d = new Date(`${fecha}T${hora}:00`)
    return isNaN(d.getTime()) ? '' : d.toISOString()
  }, [fecha, hora])

  const anticipacionMinInicial = useMemo(() => {
    if (!recordatorio?.fechaVencimiento || !recordatorio?.notificarEn) return 15
    const diff = Math.round(
      (new Date(recordatorio.fechaVencimiento).getTime() -
        new Date(recordatorio.notificarEn).getTime()) /
        60000,
    )
    return diff > 0 ? diff : 15
  }, [recordatorio])

  const tieneError = !estado.ok && estado.error && typeof estado.error === 'string'
  const categoriaInferida = useMemo(() => inferirCategoria(tituloActual), [tituloActual])

  const metadatosParaCampos = slugActual === slugInicialEdicion ? metadatosIniciales : undefined

  return (
    <form action={dispatch} className="space-y-4">
      <input type="hidden" name="slug" value={slugActual} />
      <input type="hidden" name="categoriaId" value={categoriaIdActual} />
      <input type="hidden" name="fechaHoraUtc" value={fechaHoraUtc} />

      {/* Selector de categoria (visible siempre) */}
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
        {categoriaInferida && categoriaInferida !== slugActual && (
          <button
            type="button"
            onClick={() => alCambiarCategoria(categoriaInferida)}
            className="mt-1 text-xs text-gray-400 border border-dashed border-gray-300 rounded px-2 py-0.5 hover:text-gray-600 hover:border-gray-400 transition-colors"
          >
            Usar &ldquo;{categorias.find((c) => c.slug === categoriaInferida)?.nombre ?? categoriaInferida}&rdquo;
          </button>
        )}
      </div>

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
          onChange={(e) => setTituloActual(e.target.value)}
        />
      </div>

      {/* Descripcion / cuerpo de nota */}
      <div className="space-y-1">
        <Label htmlFor="descripcion">
          {slugActual === 'notes' ? 'Contenido' : 'Descripcion (opcional)'}
        </Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          defaultValue={recordatorio?.descripcion ?? ''}
          placeholder={slugActual === 'notes' ? 'Escribe tu nota aqui...' : 'Agrega detalles adicionales...'}
          maxLength={slugActual === 'notes' ? 10000 : 500}
          rows={slugActual === 'notes' ? 6 : 3}
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
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required={slugActual !== 'notes'}
          />
        </div>
        {slugActual !== 'birthdays' && (
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
        )}
      </div>

      {/* Anticipacion de notificacion */}
      <div className="space-y-1">
        <Label htmlFor="anticipacionMin">Notificar</Label>
        <select
          id="anticipacionMin"
          name="anticipacionMin"
          defaultValue={String(anticipacionMinInicial)}
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
      <BloqueCondicional key={slugActual} slug={slugActual} metadatos={metadatosParaCampos} />

      {/* Errores */}
      {tieneError && (
        <p className="text-sm text-red-500">{estado.error as string}</p>
      )}

      <BotonEnvio editar={esEdicion} />
    </form>
  )
}
