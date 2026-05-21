import { Bell } from 'lucide-react'
import { TarjetaRecordatorio } from './tarjeta-recordatorio'
import { agruparPorDia } from '@/lib/utils/date.utils'
import type { Recordatorio } from '@/types/reminder.types'
import type { Categoria } from '@/types/category.types'

interface Props {
  recordatorios: Recordatorio[]
  categorias: Categoria[]
  agrupar?: boolean
  mostrarCategoria?: boolean
  mensajeVacio?: string
  diasAutoEliminar?: number | null
  destacadoId?: string
}

function SeccionDia({
  titulo,
  items,
  categorias,
  mostrarCategoria,
  diasAutoEliminar,
  destacadoId,
}: {
  titulo: string
  items: Recordatorio[]
  categorias: Categoria[]
  mostrarCategoria?: boolean
  diasAutoEliminar?: number | null
  destacadoId?: string
}) {
  if (items.length === 0) return null

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {titulo}
      </h3>
      <div className="space-y-2">
        {items.map((rec) => (
          <TarjetaRecordatorio
            key={rec.id}
            recordatorio={rec}
            categorias={categorias}
            mostrarCategoria={mostrarCategoria}
            diasAutoEliminar={diasAutoEliminar}
            destacado={rec.id === destacadoId}
          />
        ))}
      </div>
    </div>
  )
}

export function ListaRecordatorios({
  recordatorios,
  categorias,
  agrupar = false,
  mostrarCategoria = false,
  mensajeVacio,
  diasAutoEliminar,
  destacadoId,
}: Props) {
  if (recordatorios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mb-3">
          <Bell className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">
          {mensajeVacio ?? 'Sin recordatorios pendientes'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Los recordatorios creados apareceran aqui.</p>
      </div>
    )
  }

  if (!agrupar) {
    return (
      <div className="space-y-2">
        {recordatorios.map((rec) => (
          <TarjetaRecordatorio
            key={rec.id}
            recordatorio={rec}
            categorias={categorias}
            mostrarCategoria={mostrarCategoria}
            diasAutoEliminar={diasAutoEliminar}
            destacado={rec.id === destacadoId}
          />
        ))}
      </div>
    )
  }

  const grupos = agruparPorDia(recordatorios)
  const hayContenido =
    grupos.hoy.length + grupos.manana.length + grupos.estaSemana.length + grupos.masAdelante.length > 0

  if (!hayContenido) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mb-3">
          <Bell className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">Sin recordatorios proximos</p>
        <p className="text-xs text-muted-foreground mt-1">Todos tus recordatorios estan al dia.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SeccionDia titulo="Hoy" items={grupos.hoy} categorias={categorias} mostrarCategoria={mostrarCategoria} diasAutoEliminar={diasAutoEliminar} destacadoId={destacadoId} />
      <SeccionDia titulo="Manana" items={grupos.manana} categorias={categorias} mostrarCategoria={mostrarCategoria} diasAutoEliminar={diasAutoEliminar} destacadoId={destacadoId} />
      <SeccionDia titulo="Esta semana" items={grupos.estaSemana} categorias={categorias} mostrarCategoria={mostrarCategoria} diasAutoEliminar={diasAutoEliminar} destacadoId={destacadoId} />
      <SeccionDia titulo="Mas adelante" items={grupos.masAdelante} categorias={categorias} mostrarCategoria={mostrarCategoria} diasAutoEliminar={diasAutoEliminar} destacadoId={destacadoId} />
    </div>
  )
}
