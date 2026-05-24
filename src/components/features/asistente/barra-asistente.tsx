'use client'

import { useEffect, useRef } from 'react'
import { Sparkles } from 'lucide-react'
import { useAsistente } from './asistente-provider'
import { PaletteContenido } from './command-palette'

export function BarraAsistente() {
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
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border bg-card shadow-sm hover:border-border/80 hover:shadow-md transition-all text-left group"
        >
          <Sparkles size={18} className="text-purple-600 shrink-0" />
          <span className="flex-1 text-sm text-muted-foreground group-hover:text-foreground/70 transition-colors">
            ¿Qué te recuerdo o agendo?
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-xs text-muted-foreground/50 border border-border rounded px-1.5 py-0.5 font-mono">
            Ctrl+I
          </kbd>
        </button>
      ) : (
        <PaletteContenido inputRef={inputRef} />
      )}
    </div>
  )
}
