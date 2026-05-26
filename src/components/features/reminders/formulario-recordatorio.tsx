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

export function BotonEnvio({ editar, onCancelar }: { editar: boolean; onCancelar?: () => void }) {
  const { pending } = useFormStatus()
  return (
    <>
      <span
        className="mono mr-auto"
        style={{ fontSize: '10.5px', color: 'var(--ink-4)', fontWeight: 500 }}
      >
        {editar ? '⌘↵ Guardar' : '⌘↵ Crear'}
      </span>
      {onCancelar && (
        <button
          type="button"
          onClick={onCancelar}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 500,
            background: 'var(--bg)',
            color: 'var(--ink)',
            border: '1px solid var(--line-2)',
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      )}
      <button
        type="submit"
        disabled={pending}
        style={{
          padding: '8px 14px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 500,
          background: 'var(--ink)',
          color: 'var(--bg)',
          border: '1px solid var(--ink)',
          cursor: pending ? 'not-allowed' : 'pointer',
          opacity: pending ? 0.6 : 1,
        }}
      >
        {pending ? 'Guardando...' : editar ? 'Guardar cambios' : 'Crear'}
      </button>
    </>
  )
}

interface Props {
  categorias: Categoria[]
  recordatorio?: Recordatorio
  slugInicial?: string
  onExito?: () => void
  onCancelar?: () => void
}

export function FormularioRecordatorio({ categorias, recordatorio, slugInicial, onExito, onCancelar }: Props) {
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
    <form
      action={dispatch}
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.currentTarget.requestSubmit()
        }
      }}
    >
      <input type="hidden" name="slug" value={slugActual} />
      <input type="hidden" name="categoriaId" value={categoriaIdActual} />
      <input type="hidden" name="fechaHoraUtc" value={fechaHoraUtc} />

      {/* Body scroll */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Selector de categoria */}
        <div>
          <label
            className="mono"
            style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', display: 'block', marginBottom: '8px' }}
          >
            Categoria
          </label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {categorias.map((cat) => {
              const activo = slugActual === cat.slug
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => alCambiarCategoria(cat.slug)}
                  className="inline-flex items-center gap-1.5 transition-all duration-150"
                  style={{
                    padding: '5px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: activo ? 500 : 400,
                    background: activo ? 'var(--ink)' : 'var(--bg)',
                    color: activo ? 'var(--bg)' : 'var(--ink-2)',
                    border: `1px solid ${activo ? 'var(--ink)' : 'var(--line-2)'}`,
                  }}
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '999px',
                      background: cat.color,
                      flexShrink: 0,
                    }}
                  />
                  {cat.nombre}
                </button>
              )
            })}
          </div>
          {categoriaInferida && categoriaInferida !== slugActual && (
            <button
              type="button"
              onClick={() => alCambiarCategoria(categoriaInferida)}
              style={{
                marginTop: '6px',
                fontSize: '11.5px',
                color: 'var(--ink-3)',
                border: '1px dashed var(--line-2)',
                borderRadius: '6px',
                padding: '2px 8px',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              Usar &ldquo;{categorias.find((c) => c.slug === categoriaInferida)?.nombre ?? categoriaInferida}&rdquo;
            </button>
          )}
        </div>

        {/* Titulo */}
        <div>
          <label
            htmlFor="titulo"
            className="mono"
            style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', display: 'block', marginBottom: '6px' }}
          >
            Titulo
          </label>
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

        {/* Descripcion */}
        <div>
          <label
            htmlFor="descripcion"
            className="mono"
            style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', display: 'block', marginBottom: '6px' }}
          >
            {slugActual === 'notes' ? 'Contenido' : 'Descripcion (opcional)'}
          </label>
          <Textarea
            id="descripcion"
            name="descripcion"
            defaultValue={recordatorio?.descripcion ?? ''}
            placeholder={slugActual === 'notes' ? 'Escribe tu nota aqui...' : 'Agrega detalles adicionales...'}
            maxLength={slugActual === 'notes' ? 10000 : 500}
            rows={slugActual === 'notes' ? 6 : 3}
          />
        </div>

        {/* Fecha y hora */}
        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: slugActual !== 'birthdays' ? '1fr 1fr' : '1fr' }}>
          <div>
            <label
              htmlFor="fechaVencimiento"
              className="mono"
              style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', display: 'block', marginBottom: '6px' }}
            >
              {slugActual === 'birthdays' ? 'Fecha de nacimiento' : 'Fecha'}
            </label>
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
            <div>
              <label
                htmlFor="horaVencimiento"
                className="mono"
                style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', display: 'block', marginBottom: '6px' }}
              >
                Hora
              </label>
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

        {/* Anticipacion */}
        <div>
          <label
            htmlFor="anticipacionMin"
            className="mono"
            style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', display: 'block', marginBottom: '6px' }}
          >
            Notificar
          </label>
          <select
            id="anticipacionMin"
            name="anticipacionMin"
            defaultValue={String(anticipacionMinInicial)}
            style={{
              width: '100%',
              height: '38px',
              borderRadius: '10px',
              border: '1px solid var(--line-2)',
              background: 'var(--bg)',
              color: 'var(--ink)',
              fontSize: '14px',
              padding: '0 12px',
              outline: 'none',
            }}
          >
            {OPCIONES_ANTICIPACION.map((op) => (
              <option key={op.valor} value={op.valor}>
                {op.etiqueta}
              </option>
            ))}
          </select>
        </div>

        {/* Campos condicionales */}
        <BloqueCondicional key={slugActual} slug={slugActual} metadatos={metadatosParaCampos} />

        {/* Errores */}
        {tieneError && (
          <p style={{ fontSize: '13px', color: 'var(--cat-peliculas)' }}>{estado.error as string}</p>
        )}
      </div>

      {/* Footer fijo dentro del form */}
      <div
        style={{
          flexShrink: 0,
          padding: '14px 24px',
          borderTop: '1px solid var(--line)',
          background: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <BotonEnvio editar={esEdicion} onCancelar={onCancelar} />
      </div>
    </form>
  )
}
