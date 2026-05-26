'use client'

import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import type { CuadernoConPrevia } from '@/types/notas.types'

interface Props {
  cuaderno: CuadernoConPrevia
  onRenombrar: (id: string, tituloActual: string) => void
  onEliminar: (id: string) => void
}

export function ItemCuaderno({ cuaderno, onRenombrar, onEliminar }: Props) {
  const router = useRouter()
  const inicial = cuaderno.titulo.trim()[0]?.toUpperCase() ?? 'N'
  const tiempoRelativo = formatDistanceToNow(new Date(cuaderno.actualizadoEn), {
    locale: es,
    addSuffix: true,
  })

  return (
    <div
      className="group flex items-center gap-3 px-3 py-3 cursor-pointer transition-all duration-150"
      style={{
        border: '1px solid var(--line)',
        borderRadius: '14px',
        background: 'var(--bg)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--ink-4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--line)'
      }}
      onClick={() => router.push(`/notes/${cuaderno.id}`)}
    >
      <div
        className="w-[38px] h-[38px] rounded-full flex items-center justify-center flex-shrink-0 select-none"
        style={{
          background: 'color-mix(in oklab, var(--cat-notas) 14%, transparent)',
        }}
      >
        <span
          className="mono text-sm font-semibold"
          style={{ color: 'var(--cat-notas)' }}
        >
          {inicial}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className="text-sm font-medium truncate"
            style={{ color: 'var(--ink)', fontWeight: 500 }}
          >
            {cuaderno.titulo}
          </p>
          <span
            className="mono shrink-0"
            style={{
              fontSize: '10.5px',
              fontWeight: 500,
              padding: '2px 7px',
              borderRadius: '999px',
              background: 'var(--bg-soft)',
              border: '1px solid var(--line)',
              color: 'var(--ink-3)',
            }}
          >
            {cuaderno.totalEntradas}
          </span>
        </div>
        <p
          className="text-xs truncate mt-0.5"
          style={{ color: 'var(--ink-3)' }}
        >
          {cuaderno.ultimaEntrada
            ? cuaderno.ultimaEntrada.contenido
            : <span className="italic">Sin mensajes</span>}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="mono" style={{ fontSize: '11px', color: 'var(--ink-3)', fontWeight: 500 }}>
          {tiempoRelativo}
        </span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variante="fantasma"
            tamano="icono"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              onRenombrar(cuaderno.id, cuaderno.titulo)
            }}
            title="Renombrar"
          >
            <Pencil size={11} />
          </Button>
          <Button
            variante="fantasma"
            tamano="icono"
            className="h-6 w-6 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation()
              onEliminar(cuaderno.id)
            }}
            title="Eliminar"
          >
            <Trash2 size={11} />
          </Button>
        </div>
      </div>
    </div>
  )
}
