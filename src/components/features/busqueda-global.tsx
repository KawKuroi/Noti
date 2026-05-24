'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import useSWR from 'swr'
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

async function buscadorFetch(url: string): Promise<ResultadoBusqueda[]> {
  const res = await fetch(url)
  if (!res.ok) return []
  return res.json()
}

export function BusquedaGlobal() {
  const [abierto, setAbierto] = useState(false)
  const [query, setQuery] = useState('')
  const [queryDemorada, setQueryDemorada] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

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
      setQueryDemorada('')
    }
  }, [abierto])

  useEffect(() => {
    const t = setTimeout(() => setQueryDemorada(query), 300)
    return () => clearTimeout(t)
  }, [query])

  const claveSwr =
    queryDemorada.trim().length >= 2
      ? `/api/search?q=${encodeURIComponent(queryDemorada.trim())}`
      : null

  const { data: resultados = [], isLoading: cargando } = useSWR(
    claveSwr,
    buscadorFetch,
    { revalidateOnFocus: false, dedupingInterval: 10000 },
  )

  const onTranscripcion = useCallback((texto: string) => {
    const limpio = texto.trim()
    if (!limpio) return
    setQuery(limpio)
  }, [])

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
      <div className="relative w-full max-w-xl bg-card rounded-xl shadow-xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={onChange}
            placeholder="Buscar recordatorios..."
            className="flex-1 text-sm outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
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
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              title="Dictado por voz"
              aria-label="Dictado por voz"
            >
              <Mic size={14} />
            </button>
          )}

          <button
            onClick={() => setAbierto(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
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
                <div key={i} className="h-10 bg-muted rounded animate-pulse" />
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
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
                  >
                    {r.categoria && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: r.categoria.color }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.titulo}</p>
                      <p className="text-xs text-muted-foreground">
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

          {!cargando && queryDemorada.length >= 2 && resultados.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No se encontraron resultados para &quot;{queryDemorada}&quot;
            </p>
          )}

          {!cargando && queryDemorada.length < 2 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Escribe al menos 2 caracteres para buscar
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
