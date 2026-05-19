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

export function HubLanzamientos({ datos, todos, categorias }: Props) {
  const datosOrdenados = ORDEN_TABS.flatMap((slug) => {
    const encontrado = datos.find((d) => d.cat.slug === slug)
    return encontrado ? [encontrado] : []
  })

  const [tabActiva, setTabActiva] = useState<string>('todos')

  const categoriaActiva = datosOrdenados.find((d) => d.cat.slug === tabActiva)
  const tipoActivo = SLUG_A_TIPO[tabActiva as SlugLanzamiento]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 border-b border-gray-100 w-full">
          <button
            onClick={() => setTabActiva('todos')}
            className={cn(
              'px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap',
              tabActiva === 'todos'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            Todos
          </button>
          {datosOrdenados.map(({ cat }) => (
            <button
              key={cat.slug}
              onClick={() => setTabActiva(cat.slug)}
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap',
                tabActiva === cat.slug
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              )}
            >
              {cat.nombre}
            </button>
          ))}
          <div className="flex-1" />
          <div className="pb-2">
            <FormularioManualLanzamiento tipoInicial={tipoActivo} />
          </div>
        </div>
      </div>

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
  )
}
