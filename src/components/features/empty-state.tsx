import { cn } from '@/lib/utils/cn'

interface Props {
  titulo: string
  descripcion?: string
  className?: string
  accion?: React.ReactNode
}

export function EmptyState({ titulo, descripcion, className, accion }: Props) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <p className="text-base font-medium text-gray-500">{titulo}</p>
      {descripcion && (
        <p className="mt-1 text-sm text-gray-400 max-w-sm">{descripcion}</p>
      )}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  )
}
