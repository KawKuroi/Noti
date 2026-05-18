import { Skeleton } from '@/components/ui/skeleton'

export default function CargandoLanzamientos() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-1">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl p-4 space-y-3">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-3/4 rounded-lg" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
