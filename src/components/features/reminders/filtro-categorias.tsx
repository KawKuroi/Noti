'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import type { Categoria } from '@/types/category.types'

interface Props {
  categorias: Categoria[]
  contadores: Record<number, number>
}

export function FiltroCategorias({ categorias, contadores }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const categoriaActual = searchParams.get('categoria')

  function seleccionar(id: number | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (id === null) {
      params.delete('categoria')
    } else {
      params.set('categoria', String(id))
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const total = Object.values(contadores).reduce((a, b) => a + b, 0)

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => seleccionar(null)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
          !categoriaActual
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        )}
      >
        Todos
        {total > 0 && (
          <span
            className={cn(
              'text-xs px-1.5 rounded-full',
              !categoriaActual ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600',
            )}
          >
            {total}
          </span>
        )}
      </button>

      {categorias.map((cat) => {
        const activa = categoriaActual === String(cat.id)
        const count = contadores[cat.id] ?? 0

        return (
          <button
            key={cat.id}
            onClick={() => seleccionar(cat.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              activa ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
            style={activa ? { backgroundColor: cat.color } : undefined}
          >
            {cat.nombre}
            {count > 0 && (
              <span
                className={cn(
                  'text-xs px-1.5 rounded-full',
                  activa ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600',
                )}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
