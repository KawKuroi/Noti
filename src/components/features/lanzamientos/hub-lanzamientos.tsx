'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { ListaRecordatorios } from '@/components/features/reminders/lista-recordatorios'
import { FormularioManualLanzamiento } from './formulario-manual-lanzamiento'
import type { Categoria } from '@/types/category.types'
import type { Recordatorio } from '@/types/reminder.types'
import { SLUGS_LANZAMIENTO } from '@/lib/utils/constants'
import type { TipoLanzamiento } from '@/types/release.types'

type SlugLanzamiento = (typeof SLUGS_LANZAMIENTO)[number]

interface DatosCategoria {
  cat: Categoria
  recordatorios: Recordatorio[]
}

interface Props {
  datos: DatosCategoria[]
  todos: Recordatorio[]
  categorias: Categoria[]
}

const ORDEN_TABS: SlugLanzamiento[] = ['movies', 'tv', 'games', 'music', 'books']

const SLUG_A_TIPO: Record<SlugLanzamiento, TipoLanzamiento> = {
  movies: 'movie',
  tv: 'tv',
  games: 'game',
  music: 'album',
  books: 'book',
}

const COLOR_CATEGORIA_VAR: Record<string, string> = {
  movies: 'var(--cat-series)',
  tv: 'var(--cat-series)',
  games: 'var(--cat-juegos)',
  music: 'var(--cat-musica)',
  books: 'var(--cat-libros)',
  study: 'var(--var-estudio)',
  birthdays: 'var(--cat-cumple)',
  tasks: 'var(--cat-pendientes)',
  events: 'var(--cat-eventos)',
  notes: 'var(--cat-notas)',
}

export function HubLanzamientos({ datos, todos, categorias }: Props) {
  const datosOrdenados = ORDEN_TABS.flatMap((slug) => {
    const encontrado = datos.find((d) => d.cat.slug === slug)
    return encontrado ? [encontrado] : []
  })

  const [tabActiva, setTabActiva] = useState<string>('todos')

  const categoriaActiva = datosOrdenados.find((d) => d.cat.slug === tabActiva)
  const tipoActivo = SLUG_A_TIPO[tabActiva as SlugLanzamiento]

  const activeTabClass =
    'flex items-center px-3.5 py-[5px] rounded-[999px] text-[12.5px] font-medium text-[var(--ink)] bg-[var(--bg)] shadow-[0_1px_3px_rgba(10,10,10,0.05)] border border-[var(--line-2)] focus:outline-none transition-all'
  const inactiveTabClass =
    'flex items-center px-3.5 py-[5px] rounded-[999px] text-[12.5px] font-normal text-[var(--ink-2)] hover:text-[var(--ink)] border border-transparent focus:outline-none transition-all'

  return (
    <div className="space-y-5">
      {/* Eyebrow + manual trigger */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <span className="font-mono text-[10.5px] font-medium text-[var(--ink-3)] uppercase tracking-[0.09em]">
          Mis lanzamientos seguidos
        </span>
        <FormularioManualLanzamiento tipoInicial={tipoActivo} />
      </div>

      {/* Segmented Tab pills */}
      <div className="flex flex-wrap items-center gap-1 p-[3px] bg-[var(--bg-soft)] border border-[var(--line)] rounded-[999px] max-w-max select-none">
        <button
          onClick={() => setTabActiva('todos')}
          className={tabActiva === 'todos' ? activeTabClass : inactiveTabClass}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[var(--ink-3)] mr-1.5" />
          <span>Todos</span>
        </button>
        {datosOrdenados.map(({ cat }) => {
          const catColor = COLOR_CATEGORIA_VAR[cat.slug] || cat.color
          const activa = tabActiva === cat.slug
          return (
            <button
              key={cat.slug}
              onClick={() => setTabActiva(cat.slug)}
              className={activa ? activeTabClass : inactiveTabClass}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0 mr-1.5"
                style={{ backgroundColor: catColor }}
              />
              <span>{cat.nombre}</span>
            </button>
          )
        })}
      </div>

      <div className="pt-2">
        {tabActiva === 'todos' ? (
          <ListaRecordatorios
            recordatorios={todos}
            categorias={categorias}
            mostrarCategoria
            mensajeVacio="Sin lanzamientos. Usa el chat o agrega uno manualmente."
          />
        ) : (
          categoriaActiva && (
            <ListaRecordatorios
              recordatorios={categoriaActiva.recordatorios}
              categorias={categorias}
              mensajeVacio={`Sin lanzamientos en ${categoriaActiva.cat.nombre}. Usa el chat o agrega uno manualmente.`}
            />
          )
        )}
      </div>
    </div>
  )
}
