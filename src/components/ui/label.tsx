import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/utils/cn'

interface Props extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {}

export function Label({ className, ...props }: Props) {
  return (
    <LabelPrimitive.Root
      className={cn('text-sm font-medium text-gray-700 leading-none', className)}
      {...props}
    />
  )
}
