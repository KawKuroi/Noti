import { Skeleton } from '@/components/ui/skeleton'

export default function CargandoSettings() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-9 w-48 rounded-lg" />
        </div>
      ))}
    </div>
  )
}
