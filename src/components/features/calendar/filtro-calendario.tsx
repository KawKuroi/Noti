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
  seleccionadas: number[]
  onChange: (seleccionadas: number[]) => void
}

export function FiltroCalendario({ categorias, seleccionadas, onChange }: Props) {
  function toggle(id: number) {
    if (seleccionadas.includes(id)) {
      onChange(seleccionadas.filter((c) => c !== id))
    } else {
      onChange([...seleccionadas, id])
    }
  }

  const activaTodo = seleccionadas.length === 0

  const activeClass =
    'flex items-center gap-1.5 px-3 py-1 rounded-[999px] text-[12.5px] font-medium transition-colors text-left bg-(--ink) text-(--bg) border border-(--ink) focus:outline-hidden'
  const inactiveClass =
    'flex items-center gap-1.5 px-3 py-1 rounded-[999px] text-[12.5px] font-normal transition-colors text-left bg-transparent text-(--ink-2) hover:bg-(--bg-soft) hover:text-(--ink) border border-(--line-2) hover:border-(--ink-4) focus:outline-hidden'

  return (
    <div className="flex flex-wrap gap-1.5 mb-2 items-center select-none">
      <button
        onClick={() => onChange([])}
        className={activaTodo ? activeClass : inactiveClass}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            activaTodo ? 'bg-(--bg)' : 'bg-(--ink-3)'
          }`}
        />
        <span>Todas</span>
      </button>

      {categorias.map((cat) => {
        const activa = seleccionadas.includes(cat.id)
        const catColor = COLOR_CATEGORIA_VAR[cat.slug] || cat.color

        return (
          <button
            key={cat.id}
            onClick={() => toggle(cat.id)}
            className={activa ? activeClass : inactiveClass}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: activa ? 'var(--bg)' : catColor }}
            />
            <span>{cat.nombre}</span>
          </button>
        )
      })}
    </div>
  )
}
