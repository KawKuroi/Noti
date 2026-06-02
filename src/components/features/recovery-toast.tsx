'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Props {
  recovered?: boolean
  error?: string
}

export function RecoveryToast({ recovered, error }: Props) {
  const router = useRouter()

  useEffect(() => {
    if (recovered) {
      toast.success('Datos recuperados correctamente.')
    } else if (error === 'token-invalido') {
      toast.error('El enlace de recuperacion no es valido o ya fue usado.')
    } else if (error === 'demasiadas-peticiones') {
      toast.error('Demasiados intentos. Espera un momento antes de volver a intentarlo.')
    } else if (error === 'error-interno') {
      toast.error('Error al procesar la recuperacion. Intentalo de nuevo.')
    }

    if (recovered || error) {
      const url = new URL(window.location.href)
      url.searchParams.delete('recovered')
      url.searchParams.delete('error')
      router.replace(url.pathname + (url.search || ''), { scroll: false })
    }
  }, [recovered, error, router])

  return null
}
