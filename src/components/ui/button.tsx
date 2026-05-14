import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const variantes = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variante: {
        primario: 'bg-gray-900 text-white hover:bg-gray-700',
        secundario: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        destructivo: 'bg-red-500 text-white hover:bg-red-600',
        contorno: 'border border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
        fantasma: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
      },
      tamano: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4',
        lg: 'h-10 px-6',
        icono: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variante: 'primario',
      tamano: 'md',
    },
  },
)

interface Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof variantes> {
  asChild?: boolean
}

export function Button({ className, variante, tamano, asChild = false, ...props }: Props) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(variantes({ variante, tamano }), className)} {...props} />
}
