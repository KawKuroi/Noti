'use client'

import { useMemo, useState } from 'react'
import { ListaRecordatorios } from '@/components/features/reminders/lista-recordatorios'
import { FormularioManualLanzamiento } from './formulario-manual-lanzamiento'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Categoria } from '@/types/category.types'
import type { Recordatorio } from '@/types/reminder.types'
import { SLUGS_LANZAMIENTO } from '@/lib/utils/constants'
import type { TipoLanzamiento } from '@/types/release.types'

type SlugLanzamiento = (typeof SLUGS_LANZAMIENTO)[number]
type OrdenLanzamiento = 'fecha-asc' | 'fecha-desc' | 'reciente'

function ordenarRecordatorios(records: Recordatorio[], orden: OrdenLanzamiento): Recordatorio[] {
  return [...records].sort((a, b) => {
    if (orden === 'fecha-asc') {
      const fa = a.fechaVencimiento ? new Date(a.fechaVencimiento).getTime() : Infinity
      const fb = b.fechaVencimiento ? new Date(b.fechaVencimiento).getTime() : Infinity
      return fa - fb
    }
    if (orden === 'fecha-desc') {
      const fa = a.fechaVencimiento ? new Date(a.fechaVencimiento).getTime() : -Infinity
      const fb = b.fechaVencimiento ? new Date(b.fechaVencimiento).getTime() : -Infinity
      return fb - fa
    }
    return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()
  })
}

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
  study: 'var(--cat-estudio)',
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
  const [ordenamiento, setOrdenamiento] = useState<OrdenLanzamiento>('fecha-asc')

  const categoriaActiva = datosOrdenados.find((d) => d.cat.slug === tabActiva)
  const tipoActivo = SLUG_A_TIPO[tabActiva as SlugLanzamiento]

  const todosOrdenados = useMemo(
    () => ordenarRecordatorios(todos, ordenamiento),
    [todos, ordenamiento],
  )
  const categoriaActivaOrdenada = useMemo(
    () => (categoriaActiva ? ordenarRecordatorios(categoriaActiva.recordatorios, ordenamiento) : []),
    [categoriaActiva, ordenamiento],
  )

  const activeTabClass =
    'flex items-center px-3.5 py-[5px] rounded-[999px] text-[12.5px] font-medium text-(--ink) bg-(--bg) shadow-[0_1px_3px_rgba(10,10,10,0.05)] border border-(--line-2) focus:outline-hidden transition-all'
  const inactiveTabClass =
    'flex items-center px-3.5 py-[5px] rounded-[999px] text-[12.5px] font-normal text-(--ink-2) hover:text-(--ink) border border-transparent focus:outline-hidden transition-all'

  return (
    <div className="space-y-5">
      {/* Eyebrow + ordenamiento + manual trigger */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <span className="font-mono text-[10.5px] font-medium text-(--ink-3) uppercase tracking-[0.09em]">
          Mis lanzamientos seguidos
        </span>
        <div className="flex items-center gap-2">
          <Select
            value={ordenamiento}
            onValueChange={(v) => setOrdenamiento(v as OrdenLanzamiento)}
          >
            <SelectTrigger className="w-44 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fecha-asc">Más próximo primero</SelectItem>
              <SelectItem value="fecha-desc">Más lejano primero</SelectItem>
              <SelectItem value="reciente">Creación reciente</SelectItem>
            </SelectContent>
          </Select>
          <FormularioManualLanzamiento tipoInicial={tipoActivo} />
        </div>
      </div>

      {/* Segmented Tab pills */}
      <div className="flex flex-wrap items-center gap-1 p-[3px] bg-(--bg-soft) border border-(--line) rounded-[999px] max-w-max select-none">
        <button
          onClick={() => setTabActiva('todos')}
          className={tabActiva === 'todos' ? activeTabClass : inactiveTabClass}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-(--ink-3) mr-1.5" />
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
            recordatorios={todosOrdenados}
            categorias={categorias}
            mostrarCategoria
            mensajeVacio="Sin lanzamientos. Usa el chat o agrega uno manualmente."
          />
        ) : (
          categoriaActiva && (
            <ListaRecordatorios
              recordatorios={categoriaActivaOrdenada}
              categorias={categorias}
              mensajeVacio={`Sin lanzamientos en ${categoriaActiva.cat.nombre}. Usa el chat o agrega uno manualmente.`}
            />
          )
        )}
      </div>
    </div>
  )
}
