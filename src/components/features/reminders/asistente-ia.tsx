'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Sparkles, SendHorizontal, Check, X, Loader2 } from 'lucide-react'
import { crearRecordatorioDesdeIA } from '@/lib/actions/reminder.actions'
import { SLUGS_VALIDOS, CATEGORIAS } from '@/lib/utils/constants'

interface RecordatorioParseado {
  titulo: string
  categoriaSlug: (typeof SLUGS_VALIDOS)[number]
  fechaVencimiento: string
  horaVencimiento?: string
  descripcion?: string
  esRecurrente: boolean
  reglaRecurrencia?: string
}

const ETIQUETAS_CATEGORIA: Record<string, string> = Object.fromEntries(
  CATEGORIAS.map((c) => [c.slug, c.nombre]),
)

export function AsistenteIA() {
  const [texto, setTexto] = useState('')
  const [cargando, setCargando] = useState(false)
  const [parseado, setParseado] = useState<RecordatorioParseado | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function parsear(e: React.FormEvent) {
    e.preventDefault()
    if (!texto.trim() || cargando) return

    setCargando(true)
    setParseado(null)
    setError(null)

    try {
      const res = await fetch('/api/ai/recordatorio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto: texto.trim(),
          fechaHoy: new Date().toISOString().split('T')[0],
        }),
      })

      if (!res.ok) {
        if (res.status === 429) {
          const msg = 'Demasiadas peticiones, intenta en un momento'
          setError(msg)
          toast.error(msg)
          return
        }
        const data = await res.json().catch(() => null)
        const msg = data?.error ?? 'Error al procesar'
        setError(msg)
        toast.error(msg)
        return
      }

      const datos: RecordatorioParseado = await res.json()
      setParseado(datos)
    } catch {
      const msg = 'No se pudo conectar con el asistente'
      setError(msg)
      toast.error(msg)
    } finally {
      setCargando(false)
    }
  }

  async function confirmar() {
    if (!parseado) return
    setGuardando(true)
    setError(null)

    const resultado = await crearRecordatorioDesdeIA(parseado)

    if (resultado.ok) {
      toast.success('Recordatorio creado correctamente')
      setParseado(null)
      setTexto('')
    } else {
      const msg = typeof resultado.error === 'string' ? resultado.error : 'Error al crear'
      setError(msg)
      toast.error(msg)
    }
    setGuardando(false)
  }

  function cancelar() {
    setParseado(null)
    setError(null)
    inputRef.current?.focus()
  }

  function formatearFecha(fecha: string, hora?: string) {
    const [anio, mes, dia] = fecha.split('-').map(Number)
    const d = new Date(anio, mes - 1, dia)
    const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
    const fechaStr = d.toLocaleDateString('es', opciones)
    return hora ? `${fechaStr} a las ${hora}` : fechaStr
  }

  return (
    <div className="mb-5">
      {parseado && (
        <div className="mb-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-sm font-medium text-gray-900">{parseado.titulo}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {ETIQUETAS_CATEGORIA[parseado.categoriaSlug] ?? parseado.categoriaSlug} &middot;{' '}
                {formatearFecha(parseado.fechaVencimiento, parseado.horaVencimiento)}
                {parseado.esRecurrente && ' (recurrente)'}
              </p>
              {parseado.descripcion && (
                <p className="text-xs text-gray-400 mt-1">{parseado.descripcion}</p>
              )}
            </div>
            <button onClick={cancelar} className="text-gray-400 hover:text-gray-600 shrink-0">
              <X size={14} />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={confirmar}
              disabled={guardando}
              className="flex items-center gap-1.5 text-xs bg-gray-900 text-white rounded-md px-3 py-1.5 hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {guardando ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              Confirmar
            </button>
            <button
              onClick={cancelar}
              className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mb-2 text-xs text-red-600">{error}</p>
      )}

      <form onSubmit={parsear} className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-gray-400 transition-colors">
          <Sparkles size={14} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Crear con IA (ej: 'cumpleanos de Maria el 20 de junio')"
            className="flex-1 text-sm bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
            disabled={cargando || guardando}
          />
        </div>
        <button
          type="submit"
          disabled={!texto.trim() || cargando || guardando}
          className="flex items-center justify-center w-9 h-9 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors shrink-0"
          aria-label="Crear con IA"
        >
          {cargando ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <SendHorizontal size={14} />
          )}
        </button>
      </form>
    </div>
  )
}
