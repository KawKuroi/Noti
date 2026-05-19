'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Sparkles, X, Loader2 } from 'lucide-react'
import { useAsistente } from './asistente-provider'
import { CandidatoCard } from './candidato-card'
import { RecordatorioExtraidoCard } from './recordatorio-extraido-card'

const EJEMPLOS = [
  'Cumpleaños de Marta el 21 de junio',
  'Clase de inglés los martes a las 7pm',
  'Lanzamiento de GTA 6',
  'Nuevo álbum de The Weeknd',
  'Cuándo sale el nuevo Zelda',
]

export function CommandPalette() {
  const {
    abierto,
    cerrar,
    query,
    setQuery,
    estado,
    extraccion,
    candidatos,
    error,
    procesar,
    confirmarCandidato,
    confirmarRecordatorio,
    limpiar,
  } = useAsistente()

  const inputRef = useRef<HTMLInputElement | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(0)

  useEffect(() => {
    if (abierto) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [abierto])

  useEffect(() => {
    setIndiceSeleccionado(0)
  }, [candidatos])

  useEffect(() => {
    if (!abierto) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [abierto])

  const ejecutarDebounce = useCallback(
    (texto: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (texto.trim().length < 3) return
      debounceRef.current = setTimeout(() => {
        procesar(texto)
      }, 600)
    },
    [procesar],
  )

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setQuery(v)
    ejecutarDebounce(v)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      cerrar()
      return
    }
    if (e.key === 'Enter' && candidatos.length === 0 && extraccion?.intencion === 'recordatorio_personal') {
      e.preventDefault()
      confirmarRecordatorio()
      return
    }
    if (candidatos.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndiceSeleccionado((i) => Math.min(i + 1, candidatos.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndiceSeleccionado((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const c = candidatos[indiceSeleccionado]
      if (c && c.fechaLanzamiento && !c.tba) {
        confirmarCandidato(c, c.fechaLanzamiento, c.fuente)
      }
    }
  }

  if (!abierto) return null

  const cargando = estado === 'extrayendo' || estado === 'buscando'
  const creando = estado === 'creando'
  const hayResultado = !!extraccion || candidatos.length > 0
  const usarEjemplo = (texto: string) => {
    setQuery(texto)
    procesar(texto)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-black/40" onClick={cerrar} />
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[80vh]">
        <header className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Sparkles size={16} className="text-purple-600 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder="¿Qué te recuerdo o agendo?"
            className="flex-1 text-sm outline-none text-gray-900 placeholder:text-gray-400"
          />
          {cargando && <Loader2 size={14} className="text-gray-400 animate-spin shrink-0" />}
          {hayResultado && !cargando && (
            <button
              type="button"
              onClick={limpiar}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors shrink-0"
            >
              Limpiar
            </button>
          )}
          <button
            type="button"
            onClick={cerrar}
            className="text-gray-400 hover:text-gray-700 transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!hayResultado && !cargando && (
            <div className="py-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Ejemplos</p>
              <div className="flex flex-wrap gap-1.5">
                {EJEMPLOS.map((ej) => (
                  <button
                    key={ej}
                    type="button"
                    onClick={() => usarEjemplo(ej)}
                    className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    {ej}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-4">
                Atajo: Ctrl+I · Esc cierra
              </p>
            </div>
          )}

          {cargando && (
            <div className="space-y-2 py-2">
              <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          )}

          {!cargando && extraccion?.intencion === 'desconocido' && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-900">
                {extraccion.aclaracion ?? 'No entendí del todo. Intenta ser más específico.'}
              </p>
            </div>
          )}

          {!cargando && extraccion?.intencion === 'recordatorio_personal' && extraccion.recordatorio && (
            <RecordatorioExtraidoCard
              recordatorio={extraccion.recordatorio}
              creando={creando}
              onConfirmar={confirmarRecordatorio}
              onCancelar={limpiar}
            />
          )}

          {!cargando &&
            extraccion?.intencion !== 'recordatorio_personal' &&
            extraccion?.intencion !== 'desconocido' &&
            candidatos.length === 0 &&
            estado === 'listo' && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                <p className="text-sm text-gray-700">
                  No encontré candidatos en las fuentes consultadas.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Intenta con otro título o usa el formulario manual en /lanzamientos.
                </p>
              </div>
            )}

          {!cargando && candidatos.length > 0 && (
            <>
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                {candidatos.length} {candidatos.length === 1 ? 'candidato' : 'candidatos'} · elige
                el correcto
              </p>
              <div className="space-y-2">
                {candidatos.map((c, idx) => (
                  <CandidatoCard
                    key={`${c.fuente}-${c.tmdbId ?? c.rawgId ?? c.musicbrainzId ?? c.googleBooksId ?? idx}`}
                    candidato={c}
                    seleccionado={idx === indiceSeleccionado}
                    creando={creando && idx === indiceSeleccionado}
                    onSeleccionar={() => setIndiceSeleccionado(idx)}
                    onConfirmar={(fecha, fuente) => confirmarCandidato(c, fecha, fuente)}
                  />
                ))}
              </div>
            </>
          )}

          {error && estado === 'error' && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {hayResultado && (
          <footer className="border-t border-gray-100 px-4 py-2 text-[11px] text-gray-400 flex items-center justify-between">
            <span>↑↓ navega · Enter selecciona · Esc cierra</span>
          </footer>
        )}
      </div>
    </div>
  )
}
