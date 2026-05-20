'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import type { Categoria } from '@/types/category.types'

interface Props {
  categorias: Categoria[]
  contadores: Record<number, number>
}

export function ChipsCategoriasSidebar({ categorias, contadores }: Props) {
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
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-semibold text-gray-700 mb-3">Categorías</p>
      <div className="flex flex-col gap-1">
        <button
          onClick={() => seleccionar(null)}
          className={cn(
            'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left',
            !categoriaActual
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-100',
          )}
        >
          <span>Todos</span>
          {total > 0 && (
            <span
              className={cn(
                'text-xs px-1.5 rounded-full',
                !categoriaActual ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500',
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
                'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left',
                activa ? 'text-white' : 'text-gray-600 hover:bg-gray-100',
              )}
              style={activa ? { backgroundColor: cat.color } : undefined}
            >
              <span>{cat.nombre}</span>
              {count > 0 && (
                <span
                  className={cn(
                    'text-xs px-1.5 rounded-full',
                    activa ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
