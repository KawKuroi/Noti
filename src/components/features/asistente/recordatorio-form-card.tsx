'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CATEGORIAS,
  ETIQUETAS_TIPO_LANZAMIENTO,
  OPCIONES_ANTICIPACION,
  SLUGS_LANZAMIENTO,
  TIPOS_LANZAMIENTO,
  TIPO_LANZAMIENTO_A_SLUG,
} from '@/lib/utils/constants'
import type { TipoLanzamiento } from '@/types/release.types'

export interface DatosFormulario {
  titulo: string
  categoriaSlug: string
  fechaVencimiento: string | null
  horaVencimiento: string | null
  esRecurrente: boolean
  reglaRecurrencia: string | null
  descripcion: string | null
  anticipacionMin: number
  tipoLanzamiento: TipoLanzamiento | null
  autor: string | null
  artista: string | null
  director: string | null
  edad: number | null
  ubicacion: string | null
  duracionMin: number | null
  prioridad: 'baja' | 'media' | 'alta' | null
}

interface Props {
  inicial: DatosFormulario
  modo: 'personal' | 'lanzamiento'
  creando: boolean
  onGuardar: (datos: DatosFormulario) => void
  onCancelar: () => void
}

type TipoRecurrencia = 'ninguna' | 'yearly' | 'weekly'

const DIAS_SEMANA = [
  { codigo: 'MON', etiqueta: 'L' },
  { codigo: 'TUE', etiqueta: 'M' },
  { codigo: 'WED', etiqueta: 'X' },
  { codigo: 'THU', etiqueta: 'J' },
  { codigo: 'FRI', etiqueta: 'V' },
  { codigo: 'SAT', etiqueta: 'S' },
  { codigo: 'SUN', etiqueta: 'D' },
] as const

function parsearRegla(regla: string | null): { tipo: TipoRecurrencia; dias: string[] } {
  if (!regla) return { tipo: 'ninguna', dias: [] }
  if (regla.startsWith('yearly:')) return { tipo: 'yearly', dias: [] }
  if (regla.startsWith('weekly:')) {
    return { tipo: 'weekly', dias: regla.slice('weekly:'.length).split(',').filter(Boolean) }
  }
  return { tipo: 'ninguna', dias: [] }
}

const SLUGS_LANZAMIENTO_SET = new Set<string>(SLUGS_LANZAMIENTO)

const SLUG_A_TIPO: Record<string, TipoLanzamiento> = Object.fromEntries(
  (Object.entries(TIPO_LANZAMIENTO_A_SLUG) as [TipoLanzamiento, string][]).map(
    ([tipo, slug]) => [slug, tipo],
  ),
) as Record<string, TipoLanzamiento>

export function RecordatorioFormCard({ inicial, modo, creando, onGuardar, onCancelar }: Props) {
  const [titulo, setTitulo] = useState(inicial.titulo)
  const [categoriaSlug, setCategoriaSlug] = useState(inicial.categoriaSlug)
  const [fechaVencimiento, setFechaVencimiento] = useState(inicial.fechaVencimiento ?? '')
  const [horaVencimiento, setHoraVencimiento] = useState(inicial.horaVencimiento ?? '')
  const initRecurrencia = parsearRegla(inicial.reglaRecurrencia)
  const [esRecurrente, setEsRecurrente] = useState(inicial.esRecurrente)
  const [tipoRec, setTipoRec] = useState<TipoRecurrencia>(
    inicial.esRecurrente ? (initRecurrencia.tipo === 'ninguna' ? 'yearly' : initRecurrencia.tipo) : 'ninguna',
  )
  const [diasSemana, setDiasSemana] = useState<string[]>(initRecurrencia.dias)
  const [descripcion, setDescripcion] = useState(inicial.descripcion ?? '')
  const [anticipacionMin, setAnticipacionMin] = useState<number>(inicial.anticipacionMin)
  const [tipoLanzamiento, setTipoLanzamiento] = useState<TipoLanzamiento | null>(
    inicial.tipoLanzamiento,
  )
  const [autor, setAutor] = useState(inicial.autor ?? '')
  const [artista, setArtista] = useState(inicial.artista ?? '')
  const [director, setDirector] = useState(inicial.director ?? '')
  const [edad, setEdad] = useState<string>(inicial.edad != null ? String(inicial.edad) : '')
  const [ubicacion, setUbicacion] = useState(inicial.ubicacion ?? '')
  const [duracionMin, setDuracionMin] = useState<string>(
    inicial.duracionMin != null ? String(inicial.duracionMin) : '',
  )
  const [prioridad, setPrioridad] = useState<'baja' | 'media' | 'alta'>(
    inicial.prioridad ?? 'media',
  )
  const [error, setError] = useState<string | null>(null)
  // Guard contra doble submit: aunque `creando` cambia a true tras un await,
  // un doble click sincrono puede colarse antes del re-render. El ref bloquea
  // entradas concurrentes al mismo handler.
  const enviandoRef = useRef(false)

  const esNota = categoriaSlug === 'notes'
  const esLanzamientoCategoria = SLUGS_LANZAMIENTO_SET.has(categoriaSlug)

  // Cuando la categoria se cambia a un slug de lanzamiento, derivar el tipo si esta vacio.
  useEffect(() => {
    if (esLanzamientoCategoria && !tipoLanzamiento) {
      const tipoDerivado = SLUG_A_TIPO[categoriaSlug]
      if (tipoDerivado) setTipoLanzamiento(tipoDerivado)
    }
    if (!esLanzamientoCategoria && tipoLanzamiento) {
      setTipoLanzamiento(null)
    }
  }, [categoriaSlug, esLanzamientoCategoria, tipoLanzamiento])

  // Libera el guard de envio cuando el provider deja de estar en estado "creando"
  // (caso exitoso desmonta la card; caso de error la mantiene pero permite reintento).
  useEffect(() => {
    if (!creando) {
      enviandoRef.current = false
    }
  }, [creando])

  function toggleDia(dia: string) {
    setDiasSemana((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia],
    )
  }

  function construirRegla(): string | null {
    if (!esRecurrente || tipoRec === 'ninguna') return null
    if (tipoRec === 'yearly') {
      if (!fechaVencimiento) return null
      const [, mes, dia] = fechaVencimiento.split('-')
      return `yearly:${dia}-${mes}`
    }
    if (tipoRec === 'weekly') {
      if (diasSemana.length === 0) return null
      return `weekly:${diasSemana.join(',')}`
    }
    return null
  }

  function handleGuardar() {
    if (enviandoRef.current || creando) return
    if (titulo.trim().length < 2) {
      setError('El título es requerido')
      return
    }
    if (!esNota && !fechaVencimiento) {
      setError('La fecha es requerida para esta categoría')
      return
    }
    if (esRecurrente && tipoRec === 'weekly' && diasSemana.length === 0) {
      setError('Selecciona al menos un día de la semana')
      return
    }
    if (esLanzamientoCategoria && !tipoLanzamiento) {
      setError('Selecciona el tipo de lanzamiento')
      return
    }
    setError(null)
    enviandoRef.current = true
    // Si el provider llama a setEstado('listo') tras un error, `creando` vuelve a false
    // y el guard debe liberarse para permitir reintento. El useEffect de abajo lo maneja.
    const edadNumero = edad.trim() === '' ? null : Number(edad)
    const duracionNumero = duracionMin.trim() === '' ? null : Number(duracionMin)
    onGuardar({
      titulo: titulo.trim(),
      categoriaSlug,
      fechaVencimiento: fechaVencimiento || null,
      horaVencimiento: horaVencimiento || null,
      esRecurrente: esRecurrente && tipoRec !== 'ninguna',
      reglaRecurrencia: construirRegla(),
      descripcion: descripcion.trim() || null,
      anticipacionMin,
      tipoLanzamiento,
      autor: autor.trim() || null,
      artista: artista.trim() || null,
      director: director.trim() || null,
      edad: edadNumero != null && !Number.isNaN(edadNumero) ? edadNumero : null,
      ubicacion: ubicacion.trim() || null,
      duracionMin:
        duracionNumero != null && !Number.isNaN(duracionNumero) ? duracionNumero : null,
      prioridad: categoriaSlug === 'tasks' ? prioridad : null,
    })
  }

  const estiloLabel: React.CSSProperties = {
    fontSize: '11px',
    color: 'var(--ink-3)',
    marginBottom: '4px',
    display: 'block',
  }

  return (
    <div
      style={{
        borderRadius: '12px',
        border: '1px solid var(--line-2)',
        background: 'var(--bg-elev)',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className="mono"
          style={{ fontSize: '10.5px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)' }}
        >
          {modo === 'lanzamiento' ? 'Crear lanzamiento manual' : 'Crear recordatorio'}
        </p>
        <button
          type="button"
          onClick={onCancelar}
          style={{
            color: 'var(--ink-3)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
          }}
          aria-label="Descartar"
        >
          <X size={14} />
        </button>
      </div>

      <div>
        <label style={estiloLabel}>Título</label>
        <Input
          autoFocus
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título del recordatorio"
          disabled={creando}
        />
      </div>

      <div>
        <label style={estiloLabel}>Categoría</label>
        <Select value={categoriaSlug} onValueChange={setCategoriaSlug} disabled={creando}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Personales</SelectLabel>
              {CATEGORIAS.filter((c) => !SLUGS_LANZAMIENTO_SET.has(c.slug)).map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Lanzamientos</SelectLabel>
              {CATEGORIAS.filter((c) => SLUGS_LANZAMIENTO_SET.has(c.slug)).map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label style={estiloLabel}>
            Fecha {esNota && <span style={{ color: 'var(--ink-4)' }}>(opcional)</span>}
          </label>
          <Input
            type="date"
            value={fechaVencimiento}
            onChange={(e) => setFechaVencimiento(e.target.value)}
            disabled={creando}
          />
        </div>
        <div>
          <label style={estiloLabel}>Hora</label>
          <Input
            type="time"
            value={horaVencimiento}
            onChange={(e) => setHoraVencimiento(e.target.value)}
            disabled={creando || !fechaVencimiento}
          />
        </div>
      </div>

      {!esNota && (
        <div>
          <label style={estiloLabel}>Avisar</label>
          <Select
            value={String(anticipacionMin)}
            onValueChange={(v) => setAnticipacionMin(Number(v))}
            disabled={creando}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPCIONES_ANTICIPACION.map((op) => (
                <SelectItem key={op.valor} value={String(op.valor)}>
                  {op.etiqueta}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {esLanzamientoCategoria && (
        <div
          style={{
            borderRadius: '10px',
            border: '1px solid var(--line)',
            background: 'var(--bg-soft)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div>
            <label style={estiloLabel}>Tipo de lanzamiento</label>
            <Select
              value={tipoLanzamiento ?? ''}
              onValueChange={(v) => setTipoLanzamiento(v as TipoLanzamiento)}
              disabled={creando}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_LANZAMIENTO.map((t) => (
                  <SelectItem key={t} value={t}>
                    {ETIQUETAS_TIPO_LANZAMIENTO[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {tipoLanzamiento === 'book' && (
            <div>
              <label style={estiloLabel}>
                Autor <span style={{ color: 'var(--ink-4)' }}>(opcional)</span>
              </label>
              <Input
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                disabled={creando}
              />
            </div>
          )}

          {tipoLanzamiento === 'album' && (
            <div>
              <label style={estiloLabel}>
                Artista <span style={{ color: 'var(--ink-4)' }}>(opcional)</span>
              </label>
              <Input
                value={artista}
                onChange={(e) => setArtista(e.target.value)}
                disabled={creando}
              />
            </div>
          )}

          {(tipoLanzamiento === 'movie' || tipoLanzamiento === 'tv') && (
            <div>
              <label style={estiloLabel}>
                {tipoLanzamiento === 'tv' ? 'Showrunner' : 'Director'}{' '}
                <span style={{ color: 'var(--ink-4)' }}>(opcional)</span>
              </label>
              <Input
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                disabled={creando}
              />
            </div>
          )}
        </div>
      )}

      {categoriaSlug === 'birthdays' && (
        <div>
          <label style={estiloLabel}>
            Edad <span style={{ color: 'var(--ink-4)' }}>(opcional)</span>
          </label>
          <Input
            type="number"
            min={0}
            max={150}
            value={edad}
            onChange={(e) => setEdad(e.target.value)}
            disabled={creando}
            placeholder="Ej: 25"
          />
        </div>
      )}

      {categoriaSlug === 'events' && (
        <div>
          <label style={estiloLabel}>
            Ubicación <span style={{ color: 'var(--ink-4)' }}>(opcional)</span>
          </label>
          <Input
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            disabled={creando}
            placeholder="Ej: Calle 72 con Carrera 10"
            maxLength={200}
          />
        </div>
      )}

      {categoriaSlug === 'study' && (
        <div>
          <label style={estiloLabel}>
            Duración estimada (minutos) <span style={{ color: 'var(--ink-4)' }}>(opcional)</span>
          </label>
          <Input
            type="number"
            min={1}
            max={480}
            value={duracionMin}
            onChange={(e) => setDuracionMin(e.target.value)}
            disabled={creando}
            placeholder="Ej: 90"
          />
        </div>
      )}

      {categoriaSlug === 'tasks' && (
        <div>
          <label style={estiloLabel}>Prioridad</label>
          <Select
            value={prioridad}
            onValueChange={(v) => setPrioridad(v as 'baja' | 'media' | 'alta')}
            disabled={creando}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baja">Baja</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label
          style={{
            fontSize: '13px',
            color: 'var(--ink)',
            cursor: creando ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <input
            type="checkbox"
            checked={esRecurrente}
            onChange={(e) => {
              setEsRecurrente(e.target.checked)
              if (e.target.checked && tipoRec === 'ninguna') setTipoRec('yearly')
            }}
            disabled={creando}
          />
          Recurrente
        </label>

        {esRecurrente && (
          <div style={{ marginLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Select
              value={tipoRec}
              onValueChange={(v) => setTipoRec(v as TipoRecurrencia)}
              disabled={creando}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yearly">Cada año (mismo día y mes)</SelectItem>
                <SelectItem value="weekly">Cada semana (días específicos)</SelectItem>
              </SelectContent>
            </Select>

            {tipoRec === 'weekly' && (
              <div className="flex gap-1">
                {DIAS_SEMANA.map((d) => (
                  <button
                    key={d.codigo}
                    type="button"
                    onClick={() => toggleDia(d.codigo)}
                    disabled={creando}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 500,
                      border: 'none',
                      cursor: creando ? 'not-allowed' : 'pointer',
                      background: diasSemana.includes(d.codigo) ? 'var(--ink)' : 'var(--bg-soft)',
                      color: diasSemana.includes(d.codigo) ? 'var(--bg)' : 'var(--ink-2)',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                    aria-label={d.codigo}
                  >
                    {d.etiqueta}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <label style={estiloLabel}>
          Descripción <span style={{ color: 'var(--ink-4)' }}>(opcional)</span>
        </label>
        <Textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={2}
          disabled={creando}
        />
      </div>

      {error && <p style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</p>}

      <div
        style={{
          display: 'flex',
          gap: '8px',
          paddingTop: '10px',
          marginTop: '2px',
          borderTop: '1px solid var(--line)',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={onCancelar}
          disabled={creando}
          style={{
            padding: '9px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 500,
            background: 'var(--bg)',
            color: 'var(--ink)',
            border: '1px solid var(--line-2)',
            cursor: creando ? 'not-allowed' : 'pointer',
            opacity: creando ? 0.6 : 1,
          }}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleGuardar}
          disabled={creando}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '9px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 500,
            background: 'var(--ink)',
            color: 'var(--bg)',
            border: '1px solid var(--ink)',
            cursor: creando ? 'not-allowed' : 'pointer',
            opacity: creando ? 0.6 : 1,
          }}
        >
          <Check size={14} />
          {creando ? 'Creando...' : 'Crear recordatorio'}
        </button>
      </div>
    </div>
  )
}
