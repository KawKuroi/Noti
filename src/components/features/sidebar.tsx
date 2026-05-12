'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Film,
  BookOpen,
  CalendarDays,
  Cake,
  CheckSquare,
  MapPin,
  LayoutDashboard,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { Categoria } from '@/types/category.types'

const ICONOS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Film,
  BookOpen,
  CalendarDays,
  Cake,
  CheckSquare,
  MapPin,
}

interface Props {
  categorias: Categoria[]
}

export function Sidebar({ categorias }: Props) {
  const ruta = usePathname()

  return (
    <aside className="w-60 h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0">
      <div className="px-6 py-5 border-b border-gray-100">
        <span className="text-lg font-bold text-gray-900">Noti</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <Link
          href="/"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            ruta === '/'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          )}
        >
          <LayoutDashboard size={16} />
          Inicio
        </Link>

        <div className="pt-3 pb-1 px-3">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Categorias
          </span>
        </div>

        {categorias.map((cat) => {
          const Icono = ICONOS[cat.icono]
          const estaActiva = ruta === `/${cat.slug}`

          return (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                estaActiva
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              {Icono && (
                <Icono
                  size={16}
                  style={{ color: estaActiva ? cat.color : undefined }}
                />
              )}
              {cat.nombre}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
