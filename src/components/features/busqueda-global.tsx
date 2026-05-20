'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X, Mic, Square, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAudioRecorder } from '@/hooks/use-audio-recorder'
import { SLUGS_LANZAMIENTO } from '@/lib/utils/constants'
import type { Categoria } from '@/types/category.types'

interface ResultadoBusqueda {
  id: string
  titulo: string
  descripcion: string | null
  fechaVencimiento: string
  categoria: Categoria | null
}

function construirHref(r: ResultadoBusqueda): string {
  if (!r.categoria) return '/inicio'
  const slug = r.categoria.slug
  if (slug === 'notes') return `/notes/${r.id}`
  if ((SLUGS_LANZAMIENTO as readonly string[]).includes(slug)) {
    return `/lanzamientos?tab=${slug}&destacado=${r.id}`
  }
  return `/${slug}?destacado=${r.id}`
}

export function BusquedaGlobal() {
  const [abierto, setAbierto] = useState(false)
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([])
  const [cargando, setCargando] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setAbierto(true)
      }
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (abierto) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResultados([])
    }
  }, [abierto])

  const buscar = useCallback((texto: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (texto.trim().length < 2) {
      setResultados([])
      return
    }
    setCargando(true)
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(texto)}`)
        if (res.ok) {
          const data = await res.json()
          setResultados(data)
        }
      } finally {
        setCargando(false)
      }
    }, 300)
  }, [])

  const onTranscripcion = useCallback(
    (texto: string) => {
      const limpio = texto.trim()
      if (!limpio) return
      setQuery(limpio)
      buscar(limpio)
    },
    [buscar],
  )

  const {
    estadoGrabacion,
    segundosGrabando,
    errorGrabacion,
    iniciarGrabacion,
    detenerGrabacion,
  } = useAudioRecorder(onTranscripcion)

  const micDeshabilitado = cargando || estadoGrabacion === 'procesando'

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    buscar(e.target.value)
  }

  if (!abierto) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => setAbierto(false)}
      />
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={onChange}
            placeholder="Buscar recordatorios..."
            className="flex-1 text-sm outline-none text-gray-900 placeholder:text-gray-400"
          />

          {estadoGrabacion === 'grabando' ? (
            <button
              type="button"
              onClick={detenerGrabacion}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-colors shrink-0"
              title="Detener grabacion"
            >
              <Square size={12} />
              {segundosGrabando}s
            </button>
          ) : estadoGrabacion === 'procesando' ? (
            <Loader2 size={14} className="text-purple-500 animate-spin shrink-0" />
          ) : (
            <button
              type="button"
              onClick={iniciarGrabacion}
              disabled={micDeshabilitado}
              className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              title="Dictado por voz"
              aria-label="Dictado por voz"
            >
              <Mic size={14} />
            </button>
          )}

          <button
            onClick={() => setAbierto(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {errorGrabacion && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-100">
            <p className="text-xs text-red-600">{errorGrabacion}</p>
          </div>
        )}

        <div className="max-h-72 overflow-y-auto">
          {cargando && (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          )}

          {!cargando && resultados.length > 0 && (
            <ul>
              {resultados.map((r) => (
                <li key={r.id}>
                  <a
                    href={construirHref(r)}
                    onClick={() => setAbierto(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    {r.categoria && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: r.categoria.color }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.titulo}</p>
                      <p className="text-xs text-gray-400">
                        {r.categoria?.nombre} &middot;{' '}
                        {formatDistanceToNow(new Date(r.fechaVencimiento), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}

          {!cargando && query.length >= 2 && resultados.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-gray-400">
              No se encontraron resultados para &quot;{query}&quot;
            </p>
          )}

          {!cargando && query.length < 2 && (
            <p className="px-4 py-6 text-center text-sm text-gray-400">
              Escribe al menos 2 caracteres para buscar
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
