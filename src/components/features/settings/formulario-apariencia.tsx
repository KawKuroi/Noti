'use client'

import { useTheme } from 'next-themes'

const OPCIONES_TEMA = [
  { valor: 'system', etiqueta: 'Igual que el sistema' },
  { valor: 'light', etiqueta: 'Claro' },
  { valor: 'dark', etiqueta: 'Oscuro' },
]

export function FormularioApariencia() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-4">
      <select
        value={theme ?? 'system'}
        onChange={(e) => setTheme(e.target.value)}
        className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {OPCIONES_TEMA.map((op) => (
          <option key={op.valor} value={op.valor}>
            {op.etiqueta}
          </option>
        ))}
      </select>
    </div>
  )
}
