import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatearFechaLanzamiento(fechaIso: string | null | undefined): string {
  if (!fechaIso) return 'Sin fecha confirmada'
  try {
    const fecha = parseISO(fechaIso)
    return format(fecha, "d 'de' MMMM 'de' yyyy", { locale: es })
  } catch {
    return fechaIso
  }
}
