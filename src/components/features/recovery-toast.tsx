'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

// Lee recovered/error de window.location en el cliente, no como props del
// server: los parametros de recovery solo llegan via redirect de pagina
// completa, y asi las paginas que lo montan pueden ser estaticas/ISR.
// El toast va con un tick de retraso porque este efecto (hoja de la pagina)
// corre antes de que el Toaster del layout se suscriba a sonner, y sonner no
// reproduce toasts emitidos sin suscriptores. La URL se limpia con
// history.replaceState (shallow update soportado por Next, sincrono).
export function RecoveryToast() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const recovered = params.get('recovered') === 'true'
    const error = params.get('error')

    if (!recovered && !error) return

    const url = new URL(window.location.href)
    url.searchParams.delete('recovered')
    url.searchParams.delete('error')
    window.history.replaceState(window.history.state, '', url.pathname + (url.search || ''))

    const temporizador = setTimeout(() => {
      if (recovered) {
        toast.success('Datos recuperados correctamente.')
      } else if (error === 'token-invalido') {
        toast.error('El enlace de recuperacion no es valido o ya fue usado.')
      } else if (error === 'demasiadas-peticiones') {
        toast.error('Demasiados intentos. Espera un momento antes de volver a intentarlo.')
      } else if (error === 'error-interno') {
        toast.error('Error al procesar la recuperacion. Intentalo de nuevo.')
      }
    }, 80)

    return () => clearTimeout(temporizador)
  }, [])

  return null
}
