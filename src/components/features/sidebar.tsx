'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
  nombrePerfil?: string | null
}

export function Sidebar({ categorias, usuario, nombrePerfil }: Props) {
  const ruta = usePathname()
  const t = useTranslations('Sidebar')
  const [herramientasAbiertas, setHerramientasAbiertas] = useState(true)
  const categoriasGenerales = categorias.filter(
    (c) =>
      !(SLUGS_LANZAMIENTO as readonly string[]).includes(c.slug) &&
      !(SLUGS_HERRAMIENTAS as readonly string[]).includes(c.slug),
  )

  const nombre =
    nombrePerfil ??
    (usuario.user_metadata?.full_name
      ? (usuario.user_metadata.full_name as string).split(' ')[0]
      : usuario.email?.split('@')[0] ?? 'Usuario')

  function abrirBusqueda() {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true }),
    )
  }

  return (
    <aside className="w-60 h-screen bg-background border-r border-border flex flex-col sticky top-0">
      <div className="px-6 py-5 border-b border-border">
        <span className="text-lg font-bold text-foreground">Noti</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <Link
          href="/inicio"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            ruta === '/inicio'
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
          )}
        >
          <LayoutDashboard size={16} />
          {t('inicio')}
        </Link>

        <button
          onClick={abrirBusqueda}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        >
          <Search size={16} />
          {t('buscar')}
        </button>

        <div className="pt-3 pb-1 px-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t('categorias')}
          </span>
        </div>

        <Link
          href="/lanzamientos"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            ruta === '/lanzamientos'
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
          )}
        >
          <Clapperboard size={16} />
          {t('lanzamientos')}
        </Link>

        {categoriasGenerales.map((cat) => {
          const Icono = ICONOS[cat.icono]
          const estaActiva = ruta === `/${cat.slug}` || ruta.startsWith(`/${cat.slug}/`)

          return (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              style={{ '--cat-color': cat.color } as React.CSSProperties}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                estaActiva
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-[color:var(--cat-color)]/10 hover:text-[color:var(--cat-color)]',
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
            aria-label={herramientasAbiertas ? t('cerrarHerramientas') : t('abrirHerramientas')}
          >
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('herramientas')}
            </span>
            {herramientasAbiertas ? (
              <ChevronDown size={12} className="text-muted-foreground group-hover:text-foreground" />
            ) : (
              <ChevronRight size={12} className="text-muted-foreground group-hover:text-foreground" />
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
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )}
            >
              <Calendar size={16} />
              {t('calendario')}
            </Link>

            <Link
              href="/notes"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                ruta === '/notes' || ruta.startsWith('/notes/')
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )}
            >
              <StickyNote size={16} />
              {t('notas')}
            </Link>
          </>
        )}
      </nav>

      <div className="px-3 py-3 border-t border-border flex items-center gap-2">
        <span className="flex-1 text-sm font-medium text-foreground px-3 truncate">{nombre}</span>
        <Link
          href="/settings"
          className={cn(
            'p-2 rounded-lg transition-colors shrink-0',
            ruta === '/settings'
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
          )}
          aria-label={t('configuracion')}
        >
          <Settings size={16} />
        </Link>
      </div>
    </aside>
  )
}
