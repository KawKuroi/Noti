'use client'

import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import type { CuadernoConPrevia } from '@/types/notas.types'

interface Props {
  cuaderno: CuadernoConPrevia
  onRenombrar: (id: string, tituloActual: string) => void
  onEliminar: (id: string) => void
}

export function ItemCuaderno({ cuaderno, onRenombrar, onEliminar }: Props) {
  const router = useRouter()
  const inicial = cuaderno.titulo.trim()[0]?.toUpperCase() ?? 'N'
  const tiempoRelativo = formatDistanceToNow(new Date(cuaderno.actualizadoEn), {
    locale: es,
    addSuffix: true,
  })

  return (
    <div
      className="group flex items-center gap-3 px-3 py-3 rounded-xl border border-border hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={() => router.push(`/notes/${cuaderno.id}`)}
    >
      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 select-none">
        <span className="text-sm font-semibold text-indigo-600">{inicial}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{cuaderno.titulo}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {cuaderno.ultimaEntrada
            ? cuaderno.ultimaEntrada.contenido
            : <span className="italic">Sin mensajes</span>}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-xs text-muted-foreground">{tiempoRelativo}</span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variante="fantasma"
            tamano="icono"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              onRenombrar(cuaderno.id, cuaderno.titulo)
            }}
            title="Renombrar"
          >
            <Pencil size={11} />
          </Button>
          <Button
            variante="fantasma"
            tamano="icono"
            className="h-6 w-6 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation()
              onEliminar(cuaderno.id)
            }}
            title="Eliminar"
          >
            <Trash2 size={11} />
          </Button>
        </div>
      </div>
    </div>
  )
}
