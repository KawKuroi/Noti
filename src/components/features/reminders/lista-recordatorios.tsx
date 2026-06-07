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
      <h3
        className="mono mb-2"
        style={{
          fontSize: '11px',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--ink-3)',
        }}
      >
        {titulo}
      </h3>
      <div className="space-y-1">
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
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
          style={{ background: 'var(--bg-soft)', border: '1px solid var(--line)' }}
        >
          <Bell className="w-6 h-6" style={{ color: 'var(--ink-4)' }} />
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
          {mensajeVacio ?? 'Sin recordatorios pendientes'}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--ink-3)' }}>
          Los recordatorios creados apareceran aqui.
        </p>
      </div>
    )
  }

  if (!agrupar) {
    return (
      <div className="space-y-1.5">
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
    grupos.vencidos.length + grupos.hoy.length + grupos.manana.length + grupos.estaSemana.length + grupos.masAdelante.length > 0

  if (!hayContenido) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
          style={{ background: 'var(--bg-soft)', border: '1px solid var(--line)' }}
        >
          <Bell className="w-6 h-6 text-[var(--ink-3)]" />
        </div>
        <p className="text-sm font-medium text-[var(--ink)]">Sin recordatorios proximos</p>
        <p className="text-xs text-[var(--ink-3)] mt-1">Todos tus recordatorios estan al dia.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SeccionDia titulo="Vencidos" items={grupos.vencidos} categorias={categorias} mostrarCategoria={mostrarCategoria} diasAutoEliminar={diasAutoEliminar} destacadoId={destacadoId} />
      <SeccionDia titulo="Hoy" items={grupos.hoy} categorias={categorias} mostrarCategoria={mostrarCategoria} diasAutoEliminar={diasAutoEliminar} destacadoId={destacadoId} />
      <SeccionDia titulo="Manana" items={grupos.manana} categorias={categorias} mostrarCategoria={mostrarCategoria} diasAutoEliminar={diasAutoEliminar} destacadoId={destacadoId} />
      <SeccionDia titulo="Esta semana" items={grupos.estaSemana} categorias={categorias} mostrarCategoria={mostrarCategoria} diasAutoEliminar={diasAutoEliminar} destacadoId={destacadoId} />
      <SeccionDia titulo="Mas adelante" items={grupos.masAdelante} categorias={categorias} mostrarCategoria={mostrarCategoria} diasAutoEliminar={diasAutoEliminar} destacadoId={destacadoId} />
    </div>
  )
}
