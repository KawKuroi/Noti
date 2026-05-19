'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  CalendarDays,
  Cake,
  CheckSquare,
  MapPin,
  StickyNote,
  LayoutDashboard,
  Settings,
  Calendar,
  Clapperboard,
  Search,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { cn } from '@/lib/utils/cn'
import { SLUGS_LANZAMIENTO } from '@/lib/utils/constants'
import type { Categoria } from '@/types/category.types'

const ICONOS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  BookOpen,
  CalendarDays,
  Cake,
  CheckSquare,
  MapPin,
  StickyNote,
}

const SLUGS_HERRAMIENTAS = ['notes'] as const

interface Props {
  categorias: Categoria[]
  usuario: User
}

export function Sidebar({ categorias, usuario }: Props) {
  const ruta = usePathname()
  const [herramientasAbiertas, setHerramientasAbiertas] = useState(true)

  const categoriasGenerales = categorias.filter(
    (c) =>
      !(SLUGS_LANZAMIENTO as readonly string[]).includes(c.slug) &&
      !(SLUGS_HERRAMIENTAS as readonly string[]).includes(c.slug),
  )

  const nombre = usuario.user_metadata?.full_name
    ? (usuario.user_metadata.full_name as string).split(' ')[0]
    : usuario.email?.split('@')[0] ?? 'Usuario'

  function abrirBusqueda() {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true }),
    )
  }

  return (
    <aside className="w-60 h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0">
      <div className="px-6 py-5 border-b border-gray-100">
        <span className="text-lg font-bold text-gray-900">Noti</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <Link
          href="/inicio"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            ruta === '/inicio'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          )}
        >
          <LayoutDashboard size={16} />
          Inicio
        </Link>

        <button
          onClick={abrirBusqueda}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <Search size={16} />
          Buscar
        </button>

        <div className="pt-3 pb-1 px-3">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Categorias
          </span>
        </div>

        <Link
          href="/lanzamientos"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            ruta === '/lanzamientos'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          )}
        >
          <Clapperboard size={16} />
          Lanzamientos
        </Link>

        {categoriasGenerales.map((cat) => {
          const Icono = ICONOS[cat.icono]
          const estaActiva = ruta === `/${cat.slug}` || ruta.startsWith(`/${cat.slug}/`)

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
                <span style={{ color: estaActiva ? cat.color : undefined }}>
                  <Icono size={16} />
                </span>
              )}
              {cat.nombre}
            </Link>
          )
        })}

        <div className="pt-3 pb-1 px-3">
          <button
            onClick={() => setHerramientasAbiertas((prev) => !prev)}
            className="flex items-center justify-between w-full group"
          >
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Herramientas
            </span>
            {herramientasAbiertas ? (
              <ChevronDown size={12} className="text-gray-400 group-hover:text-gray-600" />
            ) : (
              <ChevronRight size={12} className="text-gray-400 group-hover:text-gray-600" />
            )}
          </button>
        </div>

        {herramientasAbiertas && (
          <>
            <Link
              href="/calendar"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                ruta === '/calendar'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <Calendar size={16} />
              Calendario
            </Link>

            <Link
              href="/notes"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                ruta === '/notes' || ruta.startsWith('/notes/')
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <StickyNote size={16} />
              Notas
            </Link>
          </>
        )}
      </nav>

      <div className="px-3 py-3 border-t border-gray-100 flex items-center gap-2">
        <span className="flex-1 text-sm font-medium text-gray-700 px-3 truncate">{nombre}</span>
        <Link
          href="/settings"
          className={cn(
            'p-2 rounded-lg transition-colors shrink-0',
            ruta === '/settings'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50',
          )}
          aria-label="Configuracion"
        >
          <Settings size={16} />
        </Link>
      </div>
    </aside>
  )
}
