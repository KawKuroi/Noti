import type { Categoria } from '@/types/category.types'

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

  return (
    <div className="flex flex-wrap gap-2 mb-4 items-center">
      <button
        onClick={() => onChange([])}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border flex items-center gap-2 ${
          seleccionadas.length === 0
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-background text-muted-foreground border-border hover:bg-accent/50'
        }`}
      >
        Todas
      </button>
      
      {categorias.map((cat) => {
        const activa = seleccionadas.includes(cat.id)
        return (
          <button
            key={cat.id}
            onClick={() => toggle(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border flex items-center gap-2 ${
              activa
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:bg-accent/50'
            }`}
          >
            {activa && (
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
            )}
            {cat.nombre}
          </button>
        )
      })}
    </div>
  )
}
