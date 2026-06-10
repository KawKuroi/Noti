'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  Search,
  CalendarDays,
  NotebookText,
  Settings,
  Menu,
  X,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { cn } from '@/lib/utils/cn'
import { SLUGS_LANZAMIENTO } from '@/lib/utils/constants'
import type { Categoria } from '@/types/category.types'
import { CentroNotificaciones } from '@/components/features/notificaciones/centro-notificaciones'
import type { NotificacionHistorial } from '@/lib/queries/push.queries'

const SLUGS_HERRAMIENTAS = ['notes'] as const

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
  usuario: User
  nombrePerfil?: string | null
  notificacionesIniciales: NotificacionHistorial[]
  noLeidasIniciales: number
}

export function Sidebar({
  categorias,
  usuario,
  nombrePerfil,
  notificacionesIniciales,
  noLeidasIniciales,
}: Props) {
  const ruta = usePathname()
  const t = useTranslations('Sidebar')
  const [drawerAbierto, setDrawerAbierto] = useState(false)

  // Cierra el drawer cuando cambia la ruta: patron "adjust state during
  // render" (sin effect, evita un render extra con el drawer abierto).
  const [rutaPrevia, setRutaPrevia] = useState(ruta)
  if (rutaPrevia !== ruta) {
    setRutaPrevia(ruta)
    setDrawerAbierto(false)
  }

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

  const linkActivoClase =
    'flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-all duration-150 border border-(--line) bg-(--bg-soft) text-(--ink)'
  const linkInactivoClase =
    'flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] font-normal transition-all duration-150 border border-transparent text-(--ink-2) hover:bg-(--bg-soft) hover:text-(--ink)'

  return (
    <>
      {/* Header mobile — solo visible en <md */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4"
        style={{ height: '52px', background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'var(--ink)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--bg)', fontWeight: 700, fontSize: '14px',
            }}
          >
            N
          </div>
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>Noti</span>
        </div>
        <div className="flex items-center gap-1">
          <CentroNotificaciones
            itemsIniciales={notificacionesIniciales}
            noLeidasIniciales={noLeidasIniciales}
            variante="compacto"
          />
          <button
            onClick={() => setDrawerAbierto(true)}
            style={{ padding: '6px', color: 'var(--ink-2)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Overlay backdrop mobile */}
      {drawerAbierto && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(10,10,10,0.32)' }}
          onClick={() => setDrawerAbierto(false)}
        />
      )}

      {/* Aside — fijo en mobile como drawer, estático en desktop */}
      <aside
        className={cn(
          'h-screen bg-(--bg) border-r border-(--line) flex flex-col',
          // Desktop: estático en el grid
          'md:w-[230px] md:sticky md:top-0 md:translate-x-0 md:z-auto',
          // Mobile: drawer fijo con transición
          'fixed top-0 left-0 bottom-0 z-50 w-[230px] transition-transform duration-200 md:transition-none',
          drawerAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* Botón cerrar en mobile */}
        <button
          className="md:hidden absolute top-3 right-3"
          onClick={() => setDrawerAbierto(false)}
          style={{ padding: '4px', color: 'var(--ink-3)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          aria-label="Cerrar menu"
        >
          <X size={16} />
        </button>
      {/* 1. Logo Noti */}
      <div className="px-6 py-5 border-b border-(--line) flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-(--ink) flex items-center justify-center text-(--bg) font-bold text-base select-none">
          N
        </div>
        <span className="text-base font-semibold tracking-tight text-(--ink)">Noti</span>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {/* 2. Items top: Inicio, Buscar */}
        <div className="space-y-0.5">
          <Link
            href="/inicio"
            className={ruta === '/inicio' ? linkActivoClase : linkInactivoClase}
          >
            <LayoutDashboard size={16} className="text-(--ink-2)" />
            <span>{t('inicio')}</span>
          </Link>

          <button
            onClick={abrirBusqueda}
            className={cn(
              linkInactivoClase,
              'w-full text-left flex items-center justify-between'
            )}
          >
            <div className="flex items-center gap-3">
              <Search size={16} className="text-(--ink-2)" />
              <span>{t('buscar')}</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded border border-(--line-2) bg-(--bg-soft) font-mono text-[10px] font-medium text-(--ink-3)">
              ⌘K
            </kbd>
          </button>

          <CentroNotificaciones
            itemsIniciales={notificacionesIniciales}
            noLeidasIniciales={noLeidasIniciales}
          />
        </div>

        {/* 3. Sección Categorías */}
        <div className="space-y-0.5">
          <div className="pt-2 pb-1.5 px-3">
            <span className="font-mono text-[10px] font-medium text-(--ink-3) uppercase tracking-[0.09em]">
              {t('categorias')}
            </span>
          </div>

          {/* Lanzamientos siempre va primero */}
          <Link
            href="/lanzamientos"
            className={ruta === '/lanzamientos' ? linkActivoClase : linkInactivoClase}
          >
            <span className="w-2 h-2 rounded-full shrink-0 bg-(--cat-series)" />
            <span>{t('lanzamientos')}</span>
          </Link>

          {categoriasGenerales.map((cat) => {
            const estaActiva = ruta === `/${cat.slug}` || ruta.startsWith(`/${cat.slug}/`)
            const colorVar = COLOR_CATEGORIA_VAR[cat.slug] || cat.color

            return (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className={estaActiva ? linkActivoClase : linkInactivoClase}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: colorVar }}
                />
                <span>{cat.nombre}</span>
              </Link>
            )
          })}
        </div>

        {/* 4. Sección Herramientas */}
        <div className="space-y-0.5">
          <div className="pt-2 pb-1.5 px-3">
            <span className="font-mono text-[10px] font-medium text-(--ink-3) uppercase tracking-[0.09em]">
              {t('herramientas')}
            </span>
          </div>

          <div className="space-y-0.5">
            <Link
              href="/calendar"
              className={ruta === '/calendar' ? linkActivoClase : linkInactivoClase}
            >
              <CalendarDays size={16} className="text-(--ink-2)" />
              <span>{t('calendario')}</span>
            </Link>

            <Link
              href="/notes"
              className={cn(
                ruta === '/notes' || ruta.startsWith('/notes/') ? linkActivoClase : linkInactivoClase
              )}
            >
              <NotebookText size={16} className="text-(--ink-2)" />
              <span>{t('notas')}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 5. Footer user */}
      <div className="p-3 border-t border-(--line) flex items-center gap-3 shrink-0 bg-(--bg)">
        <div className="w-8 h-8 rounded-full bg-(--bg-soft) border border-(--line-2) flex items-center justify-center text-[12px] font-mono font-medium text-(--ink-2) select-none shrink-0">
          {nombre.charAt(0).toUpperCase()}
        </div>
        <span className="flex-1 text-[13px] font-medium text-(--ink) truncate select-none">
          {nombre}
        </span>
        <Link
          href="/settings"
          className={cn(
            'p-2 rounded-lg transition-colors shrink-0',
            ruta === '/settings'
              ? 'bg-(--bg-soft) border border-(--line) text-(--ink)'
              : 'text-(--ink-3) hover:text-(--ink) hover:bg-(--bg-soft)',
          )}
          aria-label={t('configuracion')}
        >
          <Settings size={16} />
        </Link>
      </div>

      {/* Espaciado mobile para compensar el header fijo */}
      <style>{`@media (max-width: 767px) { main { padding-top: calc(52px + clamp(20px, 3vw, 40px)) !important; } }`}</style>
    </aside>
    </>
  )
}
