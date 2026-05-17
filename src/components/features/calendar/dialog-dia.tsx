'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { TarjetaRecordatorio } from '@/components/features/reminders/tarjeta-recordatorio'
import { formatearFechaSinHora } from '@/lib/utils/date.utils'
import type { Recordatorio } from '@/types/reminder.types'
import type { Categoria } from '@/types/category.types'

interface Props {
  dia: Date | null
  recordatorios: Recordatorio[]
  categorias: Categoria[]
  onCerrar: () => void
}

export function DialogDia({ dia, recordatorios, categorias, onCerrar }: Props) {
  if (!dia) return null

  const titulo = `Recordatorios del ${formatearFechaSinHora(dia)}`

  return (
    <Dialog open={!!dia} onOpenChange={(abierto) => { if (!abierto) onCerrar() }}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>
            {recordatorios.length === 0
              ? 'Sin recordatorios para este dia.'
              : `${recordatorios.length} recordatorio${recordatorios.length !== 1 ? 's' : ''}`}
          </DialogDescription>
        </DialogHeader>

        {recordatorios.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            No hay recordatorios para este dia.
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {recordatorios.map((rec) => (
              <TarjetaRecordatorio
                key={`${rec.id}-${rec.fechaVencimiento instanceof Date ? rec.fechaVencimiento.getTime() : rec.fechaVencimiento}`}
                recordatorio={rec}
                categorias={categorias}
                mostrarCategoria
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
