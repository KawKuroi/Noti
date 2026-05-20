'use client'

import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { cn } from '@/lib/utils/cn'

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
  const [error, setError] = useState<string | null>(null)

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
    })
  }

  return (
    <div className="rounded-lg border border-gray-900 ring-1 ring-gray-900 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs uppercase tracking-wider text-gray-400">
          {modo === 'lanzamiento' ? 'Crear lanzamiento manual' : 'Crear recordatorio'}
        </p>
        <button
          type="button"
          onClick={onCancelar}
          className="text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Descartar"
        >
          <X size={14} />
        </button>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Título</label>
        <Input
          autoFocus
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título del recordatorio"
          disabled={creando}
        />
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Categoría</label>
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
          <label className="text-xs text-gray-500 mb-1 block">
            Fecha {esNota && <span className="text-gray-400">(opcional)</span>}
          </label>
          <Input
            type="date"
            value={fechaVencimiento}
            onChange={(e) => setFechaVencimiento(e.target.value)}
            disabled={creando}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Hora</label>
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
          <label className="text-xs text-gray-500 mb-1 block">Avisar</label>
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
        <div className="space-y-3 rounded-md border border-gray-100 bg-gray-50 p-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Tipo de lanzamiento</label>
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
              <label className="text-xs text-gray-500 mb-1 block">
                Autor <span className="text-gray-400">(opcional)</span>
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
              <label className="text-xs text-gray-500 mb-1 block">
                Artista <span className="text-gray-400">(opcional)</span>
              </label>
              <Input
                value={artista}
                onChange={(e) => setArtista(e.target.value)}
                disabled={creando}
              />
            </div>
          )}

          {tipoLanzamiento === 'movie' && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Director <span className="text-gray-400">(opcional)</span>
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

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={esRecurrente}
            onChange={(e) => {
              setEsRecurrente(e.target.checked)
              if (e.target.checked && tipoRec === 'ninguna') setTipoRec('yearly')
            }}
            disabled={creando}
            className="rounded border-gray-300"
          />
          Recurrente
        </label>

        {esRecurrente && (
          <div className="ml-6 space-y-2">
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
                    className={cn(
                      'w-8 h-8 rounded-md text-xs font-medium transition-colors',
                      diasSemana.includes(d.codigo)
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                    )}
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
        <label className="text-xs text-gray-500 mb-1 block">
          Descripción <span className="text-gray-400">(opcional)</span>
        </label>
        <Textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={2}
          disabled={creando}
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button
          variante="primario"
          tamano="sm"
          onClick={handleGuardar}
          disabled={creando}
          className="flex-1"
        >
          <Check size={14} />
          {creando ? 'Creando...' : 'Crear recordatorio'}
        </Button>
        <Button variante="contorno" tamano="sm" onClick={onCancelar} disabled={creando}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
