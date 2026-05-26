'use client'

import { useEffect, useRef } from 'react'
import { Sparkles } from 'lucide-react'
import { useAsistente } from './asistente-provider'
import { BarraInputAsistente, PanelSugerencias } from './command-palette'

export function BarraAsistente({ placeholder = '¿Qué te recuerdo o agendo?' }: { placeholder?: string }) {
  const { abrir, cerrar, abierto, registrarBarra } = useAsistente()
  const contenedorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Registrar esta instancia para que el atajo global Ctrl+I sepa que hay
  // un ancla visible donde anclar el dropdown.
  useEffect(() => registrarBarra(), [registrarBarra])

  // Auto-focus al input del dropdown cuando se expande.
  useEffect(() => {
    if (abierto) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [abierto])

  // Click fuera del contenedor cierra el dropdown.
  useEffect(() => {
    if (!abierto) return
    function alClickFuera(ev: MouseEvent) {
      if (!contenedorRef.current) return
      if (!contenedorRef.current.contains(ev.target as Node)) {
        cerrar()
      }
    }
    document.addEventListener('mousedown', alClickFuera)
    return () => document.removeEventListener('mousedown', alClickFuera)
  }, [abierto, cerrar])

  return (
    <div ref={contenedorRef} className="relative w-full">
      {!abierto ? (
        <button
          type="button"
          onClick={abrir}
          className="w-full flex items-center justify-between border border-[var(--line-2)] bg-[var(--bg)] hover:border-[var(--ink-4)] rounded-[12px] px-[14px] py-[12px] transition-colors text-left focus:outline-none"
        >
          <div className="flex items-center flex-1">
            <div className="w-[32px] h-[32px] rounded-[8px] bg-[color-mix(in oklab,var(--cat-series)_14%,transparent)] flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-[var(--cat-series)]" />
            </div>
            <span className="text-[14px] text-[var(--ink-3)] font-normal ml-3 select-none">
              {placeholder}
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10.5px] font-mono font-medium text-[var(--ink-3)] border border-[var(--line-2)] bg-[var(--bg-soft)] rounded-[6px] px-1.5 py-0.5">
            Ctrl+I
          </kbd>
        </button>
      ) : (
        <>
          <BarraInputAsistente inputRef={inputRef} />
          <div className="absolute top-full left-0 right-0 mt-2 z-40">
            <PanelSugerencias />
          </div>
        </>
      )}
    </div>
  )
}
