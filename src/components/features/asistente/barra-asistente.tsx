'use client'

import { useCallback, useEffect, useRef } from 'react'
import { Loader2, Mic, Search, Sparkles, Square, X } from 'lucide-react'
import { useAsistente } from './asistente-provider'
import { PanelSugerencias } from './command-palette'
import { useAudioRecorder } from '@/hooks/use-audio-recorder'

export function BarraAsistente({ placeholder = '¿Qué te recuerdo o agendo?' }: { placeholder?: string }) {
  const {
    abrir,
    cerrar,
    abierto,
    registrarBarra,
    query,
    setQuery,
    estado,
    extraccion,
    candidatos,
    procesar,
    confirmarCandidato,
    limpiar,
  } = useAsistente()

  const contenedorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Registrar esta instancia para que el atajo global Ctrl+I sepa que hay
  // un ancla visible donde anclar el dropdown.
  useEffect(() => registrarBarra(), [registrarBarra])

  // Auto-focus al input cuando se expande (p. ej. al abrir con Ctrl+I).
  useEffect(() => {
    if (abierto) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [abierto])

  // Click fuera cierra el dropdown. Ignora los portales de Radix (Select/dropdown),
  // que se renderizan fuera del contenedor: sin esto, elegir una opcion lo cerraria.
  useEffect(() => {
    if (!abierto) return
    function alClickFuera(ev: MouseEvent) {
      const objetivo = ev.target as Element | null
      // Click dentro de un portal de Radix (las opciones del Select): no cerrar nada.
      if (objetivo?.closest?.('[data-radix-popper-content-wrapper]')) return
      // Cierre secuencial: si hay un Select/popper abierto, este click solo lo descarta
      // a el (Radix lo cierra). No cerramos el asistente hasta el siguiente click fuera.
      if (document.querySelector('[data-radix-popper-content-wrapper]')) return
      if (!contenedorRef.current) return
      if (!contenedorRef.current.contains(objetivo as Node)) {
        cerrar()
      }
    }
    document.addEventListener('mousedown', alClickFuera)
    return () => document.removeEventListener('mousedown', alClickFuera)
  }, [abierto, cerrar])

  const alTranscribir = useCallback((texto: string) => setQuery(texto), [setQuery])

  const { estadoGrabacion, segundosGrabando, errorGrabacion, iniciarGrabacion, detenerGrabacion } =
    useAudioRecorder(alTranscribir)

  const cargando = estado === 'extrayendo' || estado === 'buscando'
  const creando = estado === 'creando'
  const hayResultado = !!extraccion || candidatos.length > 0
  const puedeBuscar = query.trim().length >= 3 && !cargando && !creando
  const micDeshabilitado = cargando || creando || estadoGrabacion === 'procesando'

  const ejecutarBusqueda = useCallback(() => {
    if (query.trim().length < 3) return
    procesar(query)
  }, [query, procesar])

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      cerrar()
      return
    }
    if (e.key === 'Enter') {
      if (candidatos.length > 0) {
        e.preventDefault()
        const c = candidatos[0]
        if (c && c.fechaLanzamiento && !c.tba) {
          confirmarCandidato(c, c.fechaLanzamiento, c.fuente)
        }
        return
      }
      e.preventDefault()
      ejecutarBusqueda()
    }
  }

  return (
    <div ref={contenedorRef} className="relative w-full">
      {/* Barra unica: mismas dimensiones en ambos estados; solo cambian fondo/borde,
          el lado derecho (kbd <-> acciones) y la elevacion, con una transicion corta. */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={`flex items-center rounded-[12px] px-[14px] py-[12px] border transition-[background-color,border-color,box-shadow] duration-150 ${
          abierto
            ? 'bg-[var(--bg-elev)] border-[var(--line)] shadow-sm'
            : 'bg-[var(--bg)] border-[var(--line-2)] hover:border-[var(--ink-4)] cursor-text'
        }`}
      >
        <div className="w-[32px] h-[32px] rounded-[8px] bg-[color-mix(in_oklab,var(--cat-series)_14%,transparent)] flex items-center justify-center shrink-0">
          <Sparkles size={16} className="text-[var(--cat-series)]" />
        </div>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={abrir}
          placeholder={placeholder}
          className="flex-1 ml-3 text-[14px] outline-none bg-transparent text-[var(--ink)] placeholder:text-[var(--ink-3)]"
        />

        {!abierto ? (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10.5px] font-mono font-medium text-[var(--ink-3)] border border-[var(--line-2)] bg-[var(--bg-soft)] rounded-[6px] px-1.5 py-0.5 shrink-0">
            Ctrl+I
          </kbd>
        ) : (
          <div className="flex items-center gap-3 shrink-0 animate-in fade-in slide-in-from-right-1 duration-150">
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
                className="p-1 rounded-md text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--bg-soft)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                title="Dictado por voz"
                aria-label="Dictado por voz"
              >
                <Mic size={14} />
              </button>
            )}

            <button
              type="button"
              onClick={ejecutarBusqueda}
              disabled={!puedeBuscar}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              aria-label="Buscar"
              title="Buscar (Enter)"
            >
              <Search size={12} />
              Buscar
            </button>

            {hayResultado && !cargando && (
              <button
                type="button"
                onClick={limpiar}
                className="text-xs text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors shrink-0"
              >
                Limpiar
              </button>
            )}

            <button
              type="button"
              onClick={cerrar}
              className="text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors shrink-0"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {abierto && errorGrabacion && (
        <div className="mt-2 px-3 py-2 rounded-md bg-red-50 border border-red-100">
          <p className="text-xs text-red-600">{errorGrabacion}</p>
        </div>
      )}

      {abierto && (
        <div className="absolute top-full left-0 right-0 mt-2 z-40">
          <PanelSugerencias />
        </div>
      )}
    </div>
  )
}
