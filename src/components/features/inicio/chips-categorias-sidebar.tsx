'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import type { Categoria } from '@/types/category.types'

const COLOR_CATEGORIA_VAR: Record<string, string> = {
  movies: 'var(--cat-series)',
  tv: 'var(--cat-series)',
  games: 'var(--cat-juegos)',
  music: 'var(--cat-musica)',
  books: 'var(--cat-libros)',
  study: 'var(--cat-estudio)',
  birthdays: 'var(--cat-cumple)',
  tasks: 'var(--cat-pendientes)',
  events: 'var(--cat-eventos)',
  notes: 'var(--cat-notas)',
}

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

  const activeClass = 'flex items-center justify-between px-2.5 py-1.5 rounded-[10px] text-[13px] font-medium transition-colors text-left bg-[var(--ink)] text-[var(--bg)] border border-[var(--ink)] focus:outline-none'
  const inactiveClass = 'flex items-center justify-between px-2.5 py-1.5 rounded-[10px] text-[13px] font-normal transition-colors text-left bg-transparent text-[var(--ink-2)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)] border border-transparent focus:outline-none'

  return (
    <div className="bg-[var(--bg)] rounded-[14px] border border-[var(--line)] p-4 select-none">
      <p className="font-mono text-[11px] font-medium text-[var(--ink-3)] uppercase tracking-[0.09em] mb-3">
        Categorías
      </p>
      <div className="flex flex-col gap-1">
        <button
          onClick={() => seleccionar(null)}
          className={!categoriaActual ? activeClass : inactiveClass}
        >
          <div className="flex items-center min-w-0">
            <span
              className={cn(
                'w-2 h-2 rounded-full shrink-0 mr-2.5',
                !categoriaActual ? 'bg-[var(--bg)]' : 'bg-[var(--ink-3)]'
              )}
            />
            <span className="truncate">Todos</span>
          </div>
          {total > 0 && (
            <span
              className={cn(
                'px-1.5 py-[2px] rounded-[999px] font-mono text-[10.5px] font-medium transition-colors',
                !categoriaActual
                  ? 'bg-[color-mix(in oklab,var(--bg)_20%,transparent)] border border-[color-mix(in oklab,var(--bg)_30%,transparent)] text-[var(--bg)]'
                  : 'bg-[var(--bg-soft)] border border-[var(--line)] text-[var(--ink-3)]'
              )}
            >
              {total}
            </span>
          )}
        </button>

        {categorias.map((cat) => {
          const activa = categoriaActual === String(cat.id)
          const count = contadores[cat.id] ?? 0
          const catColor = COLOR_CATEGORIA_VAR[cat.slug] || cat.color

          return (
            <button
              key={cat.id}
              onClick={() => seleccionar(cat.id)}
              className={activa ? activeClass : inactiveClass}
            >
              <div className="flex items-center min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0 mr-2.5"
                  style={{ backgroundColor: activa ? 'var(--bg)' : catColor }}
                />
                <span className="truncate">{cat.nombre}</span>
              </div>
              {count > 0 && (
                <span
                  className={cn(
                    'px-1.5 py-[2px] rounded-[999px] font-mono text-[10.5px] font-medium transition-colors',
                    activa
                      ? 'bg-[color-mix(in oklab,var(--bg)_20%,transparent)] border border-[color-mix(in oklab,var(--bg)_30%,transparent)] text-[var(--bg)]'
                      : 'bg-[var(--bg-soft)] border border-[var(--line)] text-[var(--ink-3)]'
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
