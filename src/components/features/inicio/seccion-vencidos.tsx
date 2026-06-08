'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { TarjetaRecordatorio } from '@/components/features/reminders/tarjeta-recordatorio'
import type { Recordatorio } from '@/types/reminder.types'
import type { Categoria } from '@/types/category.types'

interface Props {
  vencidos: Recordatorio[]
  categorias: Categoria[]
  diasAutoEliminar?: number | null
}

// Apartado plegable al final del inicio. Los vencidos ya no salen de primeras en el
// listado superior; aqui quedan accesibles pero colapsados por defecto. Si no hay
// vencidos no se renderiza nada.
export function SeccionVencidos({ vencidos, categorias, diasAutoEliminar }: Props) {
  const [abierto, setAbierto] = useState(false)

  if (vencidos.length === 0) return null

  return (
    <section>
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="w-full flex items-center gap-2 mb-2"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <ChevronRight
          size={14}
          style={{
            color: 'var(--ink-3)',
            transition: 'transform 150ms ease',
            transform: abierto ? 'rotate(90deg)' : 'none',
          }}
        />
        <span
          className="mono"
          style={{
            fontSize: '11px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--ink-3)',
          }}
        >
          Vencidos ({vencidos.length})
        </span>
      </button>

      {abierto && (
        <div className="space-y-1">
          {vencidos.map((rec) => (
            <TarjetaRecordatorio
              key={rec.id}
              recordatorio={rec}
              categorias={categorias}
              mostrarCategoria
              diasAutoEliminar={diasAutoEliminar}
            />
          ))}
        </div>
      )}
    </section>
  )
}
