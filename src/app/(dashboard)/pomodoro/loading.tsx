import { Skeleton } from '@/components/ui/skeleton'

export default function CargandoPomodoro() {
  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="flex flex-col items-center gap-6">
        <Skeleton className="h-52 w-52 rounded-full" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
