import { cn } from '@/lib/utils/cn'

interface Props {
  className?: string
}

export function Skeleton({ className }: Props) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
    />
  )
}
