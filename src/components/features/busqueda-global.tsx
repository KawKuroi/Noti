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

type FiltroModal = 'todo' | 'recordatorios' | 'notas' | 'lanzamientos'

const FILTROS_MODAL: { id: FiltroModal; label: string }[] = [
  { id: 'todo', label: 'Todo' },
  { id: 'recordatorios', label: 'Recordatorios' },
  { id: 'notas', label: 'Notas' },
  { id: 'lanzamientos', label: 'Lanzamientos' },
]

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
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export function BusquedaGlobal() {
  const [abierto, setAbierto] = useState(false)
  const [query, setQuery] = useState('')
  const [queryDemorada, setQueryDemorada] = useState('')
  const [filtro, setFiltro] = useState<FiltroModal>('todo')
  const [itemActivo, setItemActivo] = useState(0)
  const [tiempoMs, setTiempoMs] = useState<number | null>(null)
  const tiempoInicio = useRef<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setAbierto((prev) => !prev)
      }
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // El focus es interaccion con el DOM (effect legitimo); los resets de estado
  // al cerrar van con el patron "adjust state during render".
  useEffect(() => {
    if (abierto) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [abierto])

  const [abiertoPrevio, setAbiertoPrevio] = useState(abierto)
  if (abiertoPrevio !== abierto) {
    setAbiertoPrevio(abierto)
    if (!abierto) {
      setQuery('')
      setQueryDemorada('')
      setFiltro('todo')
      setItemActivo(0)
      setTiempoMs(null)
    }
  }

  useEffect(() => {
    tiempoInicio.current = performance.now()
    const t = setTimeout(() => setQueryDemorada(query), 300)
    return () => clearTimeout(t)
  }, [query])

  const claveSwr =
    queryDemorada.trim().length >= 2
      ? `/api/search?q=${encodeURIComponent(queryDemorada.trim())}`
      : null

  const { data: resultadosRaw = [], isLoading: cargando, error: errorBusqueda } = useSWR(
    claveSwr,
    buscadorFetch,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
      onSuccess: () => {
        setTiempoMs(Math.round(performance.now() - tiempoInicio.current))
      },
    },
  )

  const resultados = resultadosRaw.filter((r) => {
    if (filtro === 'todo') return true
    if (filtro === 'notas') return r.categoria?.slug === 'notes'
    if (filtro === 'lanzamientos')
      return r.categoria?.slug ? (SLUGS_LANZAMIENTO as readonly string[]).includes(r.categoria.slug) : false
    if (filtro === 'recordatorios')
      return (
        r.categoria?.slug !== 'notes' &&
        !(r.categoria?.slug ? (SLUGS_LANZAMIENTO as readonly string[]).includes(r.categoria.slug) : false)
      )
    return true
  })

  // Reset del item activo cuando cambia el numero de resultados (adjust
  // state during render, sin effect).
  const [cantidadPrevia, setCantidadPrevia] = useState(resultados.length)
  if (cantidadPrevia !== resultados.length) {
    setCantidadPrevia(resultados.length)
    setItemActivo(0)
  }

  useEffect(() => {
    if (!abierto) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setItemActivo((prev) => Math.min(prev + 1, resultados.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setItemActivo((prev) => Math.max(prev - 1, 0))
      }
      if (e.key === 'Enter' && resultados[itemActivo]) {
        e.preventDefault()
        window.location.href = construirHref(resultados[itemActivo])
        setAbierto(false)
      }
      if (e.key === 'Tab') {
        e.preventDefault()
        const idx = FILTROS_MODAL.findIndex((f) => f.id === filtro)
        const siguiente = FILTROS_MODAL[(idx + 1) % FILTROS_MODAL.length]
        setFiltro(siguiente.id)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [abierto, resultados, itemActivo, filtro])

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

  if (!abierto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center"
      style={{ paddingTop: '16vh', paddingLeft: '16px', paddingRight: '16px' }}
    >
      {/* Backdrop con blur */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(6px) saturate(0.7)',
          background: 'rgba(10,10,10,0.32)',
        }}
        onClick={() => setAbierto(false)}
      />

      {/* Modal */}
      <div
        className="relative w-full overflow-hidden flex flex-col"
        style={{
          maxWidth: '620px',
          maxHeight: '70vh',
          background: 'var(--bg)',
          border: '1px solid var(--line-2)',
          borderRadius: '14px',
          boxShadow: '0 30px 80px -30px rgba(10,10,10,0.28)',
        }}
      >
        {/* Header: búsqueda */}
        <div
          className="flex items-center gap-3 px-4"
          style={{ height: '52px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}
        >
          <Search size={16} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar recordatorios, notas, lanzamientos..."
            className="flex-1 outline-hidden bg-transparent"
            style={{ fontSize: '14px', color: 'var(--ink)' }}
          />

          {estadoGrabacion === 'grabando' ? (
            <button
              type="button"
              onClick={detenerGrabacion}
              className="flex items-center gap-1 transition-colors"
              style={{
                fontSize: '11.5px',
                padding: '4px 8px',
                borderRadius: '6px',
                background: 'color-mix(in oklab, var(--danger) 12%, transparent)',
                color: 'var(--danger)',
                flexShrink: 0,
              }}
              title="Detener grabación"
            >
              <Square size={11} />
              <span className="mono font-medium">{segundosGrabando}s</span>
            </button>
          ) : estadoGrabacion === 'procesando' ? (
            <Loader2
              size={14}
              className="animate-spin shrink-0"
              style={{ color: 'var(--cat-series)' }}
            />
          ) : (
            <button
              type="button"
              onClick={iniciarGrabacion}
              disabled={micDeshabilitado}
              className="transition-colors shrink-0"
              style={{
                padding: '5px',
                borderRadius: '6px',
                color: 'var(--ink-3)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-3)')}
              title="Dictado por voz"
              aria-label="Dictado por voz"
            >
              <Mic size={14} />
            </button>
          )}

          <button
            onClick={() => setAbierto(false)}
            className="transition-colors shrink-0"
            style={{ color: 'var(--ink-3)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-3)')}
          >
            <span
              className="mono"
              style={{
                fontSize: '10.5px',
                fontWeight: 500,
                padding: '3px 7px',
                borderRadius: '5px',
                border: '1px solid var(--line-2)',
                background: 'var(--bg-soft)',
                color: 'var(--ink-3)',
              }}
            >
              ESC
            </span>
          </button>
        </div>

        {/* Chips de filtro */}
        <div
          className="flex items-center gap-2 px-4"
          style={{ paddingTop: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}
        >
          {FILTROS_MODAL.map((f) => {
            const activo = filtro === f.id
            return (
              <button
                key={f.id}
                onClick={() => setFiltro(f.id)}
                className="transition-all duration-150"
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: activo ? 500 : 400,
                  background: activo ? 'var(--ink)' : 'var(--bg)',
                  color: activo ? 'var(--bg)' : 'var(--ink-2)',
                  border: `1px solid ${activo ? 'var(--ink)' : 'var(--line-2)'}`,
                }}
              >
                {f.label}
              </button>
            )
          })}

          {/* Eyebrow de resultados */}
          {!cargando && queryDemorada.length >= 2 && !errorBusqueda && (
            <span
              className="mono ml-auto"
              style={{ fontSize: '11px', color: 'var(--ink-3)', fontWeight: 500 }}
            >
              {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
              {tiempoMs !== null ? ` · ${tiempoMs}ms` : ''}
            </span>
          )}
        </div>

        {/* Error grabacion */}
        {errorGrabacion && (
          <div
            className="px-4 py-2"
            style={{
              background: 'color-mix(in oklab, var(--danger) 8%, transparent)',
              borderBottom: '1px solid var(--line)',
              flexShrink: 0,
            }}
          >
            <p className="text-xs" style={{ color: 'var(--danger)' }}>{errorGrabacion}</p>
          </div>
        )}

        {/* Lista de resultados */}
        <div className="overflow-y-auto flex-1">
          {cargando && (
            <div className="p-4" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse"
                  style={{ height: '44px', background: 'var(--bg-soft)', borderRadius: '8px' }}
                />
              ))}
            </div>
          )}

          {!cargando && resultados.length > 0 && (
            <ul>
              {resultados.map((r, idx) => (
                <li key={r.id}>
                  <a
                    href={construirHref(r)}
                    onClick={() => setAbierto(false)}
                    onMouseEnter={() => setItemActivo(idx)}
                    className="flex items-center gap-3 px-4 py-3 transition-colors"
                    style={{
                      background: itemActivo === idx ? 'var(--bg-soft)' : 'transparent',
                    }}
                  >
                    {r.categoria && (
                      <span
                        className="shrink-0"
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '999px',
                          background: r.categoria.color,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium truncate"
                        style={{ fontSize: '13.5px', color: 'var(--ink)' }}
                      >
                        {r.titulo}
                      </p>
                      <p className="mono truncate" style={{ fontSize: '11px', color: 'var(--ink-3)', fontWeight: 500 }}>
                        {r.categoria?.nombre}
                        {r.fechaVencimiento && (
                          <> &middot;{' '}
                            {formatDistanceToNow(new Date(r.fechaVencimiento), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </>
                        )}
                      </p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}

          {!cargando && errorBusqueda && (
            <p className="px-4 py-6 text-center text-sm" style={{ color: 'var(--danger)' }}>
              Error al buscar. Verifica tu conexión.
            </p>
          )}

          {!cargando && !errorBusqueda && queryDemorada.length >= 2 && resultados.length === 0 && (
            <p className="px-4 py-6 text-center text-sm" style={{ color: 'var(--ink-3)' }}>
              No se encontraron resultados para &quot;{queryDemorada}&quot;
            </p>
          )}

          {!cargando && !errorBusqueda && queryDemorada.length < 2 && (
            <p className="px-4 py-6 text-center text-sm" style={{ color: 'var(--ink-3)' }}>
              Escribe al menos 2 caracteres para buscar
            </p>
          )}
        </div>

        {/* Footer con hints de teclado */}
        <div
          className="flex items-center gap-4 px-4"
          style={{
            height: '38px',
            borderTop: '1px solid var(--line)',
            background: 'var(--bg-soft)',
            flexShrink: 0,
          }}
        >
          {[
            { kbd: '↑↓', label: 'Navegar' },
            { kbd: '↵', label: 'Abrir' },
            { kbd: 'Tab', label: 'Filtrar' },
            { kbd: '⌘K', label: 'Cerrar' },
          ].map(({ kbd, label }) => (
            <span
              key={kbd}
              className="mono flex items-center gap-1"
              style={{ fontSize: '10.5px', color: 'var(--ink-3)', fontWeight: 500 }}
            >
              <span
                style={{
                  padding: '1px 5px',
                  borderRadius: '4px',
                  border: '1px solid var(--line-2)',
                  background: 'var(--bg)',
                  color: 'var(--ink-3)',
                }}
              >
                {kbd}
              </span>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
