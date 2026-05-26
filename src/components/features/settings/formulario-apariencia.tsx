'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'

const OPCIONES_TEMA = [
  { valor: 'light', etiqueta: 'Claro', icono: Sun },
  { valor: 'dark', etiqueta: 'Oscuro', icono: Moon },
  { valor: 'system', etiqueta: 'Sistema', icono: Monitor },
]

export function FormularioApariencia() {
  const { theme, setTheme } = useTheme()
  const temaActual = theme ?? 'system'

  return (
    <div className="flex gap-3">
      {OPCIONES_TEMA.map(({ valor, etiqueta, icono: Icono }) => {
        const activo = temaActual === valor
        return (
          <button
            key={valor}
            onClick={() => setTheme(valor)}
            className="flex flex-col items-center gap-2 transition-all duration-150"
            style={{
              flex: 1,
              padding: '14px 12px',
              borderRadius: '12px',
              border: `1px solid ${activo ? 'var(--ink)' : 'var(--line-2)'}`,
              background: activo ? 'color-mix(in oklab, var(--ink) 6%, transparent)' : 'var(--bg)',
              color: activo ? 'var(--ink)' : 'var(--ink-3)',
            }}
          >
            <Icono size={20} />
            <span
              className="font-medium"
              style={{ fontSize: '13px', color: activo ? 'var(--ink)' : 'var(--ink-2)' }}
            >
              {etiqueta}
            </span>
          </button>
        )
      })}
    </div>
  )
}
