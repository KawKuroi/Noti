import {
  isToday,
  isTomorrow,
  isThisWeek,
  startOfDay,
  endOfDay,
  addWeeks,
  addYears,
  addDays,
  setMonth,
  setDate,
  getMonth,
  getDate,
  getDay,
  format,
  isBefore,
  isAfter,
  startOfWeek,
  endOfWeek,
  parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'
import type { Recordatorio } from '@/types/reminder.types'

export interface GruposRecordatorios {
  hoy: Recordatorio[]
  manana: Recordatorio[]
  estaSemana: Recordatorio[]
  masAdelante: Recordatorio[]
}

export function agruparPorDia(recordatorios: Recordatorio[]): GruposRecordatorios {
  const grupos: GruposRecordatorios = { hoy: [], manana: [], estaSemana: [], masAdelante: [] }

  for (const rec of recordatorios) {
    if (!rec.fechaVencimiento) continue
    const fecha = rec.fechaVencimiento instanceof Date ? rec.fechaVencimiento : new Date(rec.fechaVencimiento)

    if (isToday(fecha)) {
      grupos.hoy.push(rec)
    } else if (isTomorrow(fecha)) {
      grupos.manana.push(rec)
    } else if (isThisWeek(fecha, { weekStartsOn: 1 })) {
      grupos.estaSemana.push(rec)
    } else {
      grupos.masAdelante.push(rec)
    }
  }

  return grupos
}

export function formatearFechaCorta(fecha: Date): string {
  return format(fecha, "eee d MMM, HH:mm", { locale: es })
}

export function formatearFechaSinHora(fecha: Date): string {
  return format(fecha, "d 'de' MMMM", { locale: es })
}

export function formatearHora(fecha: Date): string {
  return format(fecha, 'HH:mm')
}

export interface ReglaRecurrencia {
  tipo: 'weekly' | 'yearly'
  dias?: number[] // para weekly: dias ISO (1=lunes, 7=domingo)
}

export function parsearReglaRecurrencia(regla: string): ReglaRecurrencia | null {
  if (regla === 'yearly') return { tipo: 'yearly' }

  if (regla.startsWith('weekly:')) {
    const partes = regla.slice(7).split(',').map(Number).filter(Boolean)
    if (partes.length === 0) return null
    return { tipo: 'weekly', dias: partes }
  }

  return null
}

export function serializarReglaRecurrencia(regla: ReglaRecurrencia): string {
  if (regla.tipo === 'yearly') return 'yearly'
  if (regla.tipo === 'weekly' && regla.dias) {
    return `weekly:${regla.dias.join(',')}`
  }
  return ''
}

// Convierte dia ISO (1=lunes...7=domingo) a indice JS (0=domingo...6=sabado)
function diaIsoAJs(diaIso: number): number {
  return diaIso === 7 ? 0 : diaIso
}

export function calcularProximaOcurrencia(regla: string, ancla: Date, ahora: Date = new Date()): Date {
  const reglaParseada = parsearReglaRecurrencia(regla)
  if (!reglaParseada) return ancla

  if (reglaParseada.tipo === 'yearly') {
    // Misma fecha pero en este año o el siguiente
    let proxima = setDate(setMonth(ahora, getMonth(ancla)), getDate(ancla))
    proxima = startOfDay(proxima)
    if (isBefore(proxima, startOfDay(ahora))) {
      proxima = addYears(proxima, 1)
    }
    return proxima
  }

  if (reglaParseada.tipo === 'weekly' && reglaParseada.dias) {
    const diasJs = reglaParseada.dias.map(diaIsoAJs)
    const hoy = startOfDay(ahora)

    // Buscar el proximo dia valido en los proximos 7 dias
    for (let offset = 0; offset < 7; offset++) {
      const candidato = new Date(hoy)
      candidato.setDate(candidato.getDate() + offset)
      if (diasJs.includes(getDay(candidato))) {
        // Si es hoy, solo es valido si la hora de la ancla no paso
        if (offset === 0) {
          const conHora = new Date(candidato)
          conHora.setHours(ancla.getHours(), ancla.getMinutes(), 0, 0)
          if (!isBefore(conHora, ahora)) return conHora
          continue
        }
        const conHora = new Date(candidato)
        conHora.setHours(ancla.getHours(), ancla.getMinutes(), 0, 0)
        return conHora
      }
    }

    // Si no encontro en los proximos 7 dias, avanzar una semana
    return addWeeks(ancla, 1)
  }

  return ancla
}

export function obtenerProximaFecha(recordatorio: Recordatorio): Date | null {
  if (!recordatorio.fechaVencimiento) return null

  if (!recordatorio.esRecurrente || !recordatorio.reglaRecurrencia) {
    return recordatorio.fechaVencimiento instanceof Date
      ? recordatorio.fechaVencimiento
      : new Date(recordatorio.fechaVencimiento)
  }

  const ancla = recordatorio.fechaVencimiento instanceof Date
    ? recordatorio.fechaVencimiento
    : new Date(recordatorio.fechaVencimiento)

  return calcularProximaOcurrencia(recordatorio.reglaRecurrencia, ancla)
}

export function combinarFechaHora(fecha: string, hora: string): Date {
  return parseISO(`${fecha}T${hora}:00`)
}

// Expande los recordatorios en ocurrencias concretas dentro del rango [inicio, fin].
// Los no recurrentes se incluyen si su fechaVencimiento cae en el rango.
// Los recurrentes se expanden en cada ocurrencia dentro del rango clonando el objeto.
export function expandirOcurrenciasEnRango(
  items: Recordatorio[],
  inicio: Date,
  fin: Date,
): Recordatorio[] {
  const resultado: Recordatorio[] = []

  for (const rec of items) {
    if (!rec.fechaVencimiento) continue

    if (!rec.esRecurrente || !rec.reglaRecurrencia) {
      const fecha = rec.fechaVencimiento instanceof Date
        ? rec.fechaVencimiento
        : new Date(rec.fechaVencimiento)
      if (!isBefore(fecha, startOfDay(inicio)) && !isAfter(fecha, endOfDay(fin))) {
        resultado.push(rec)
      }
      continue
    }

    const ancla = rec.fechaVencimiento instanceof Date
      ? rec.fechaVencimiento
      : new Date(rec.fechaVencimiento)

    // Expandir desde el inicio del rango hasta el fin
    let cursor = startOfDay(inicio)
    const maxIteraciones = 400 // tope de seguridad (rango max ~1 año con recurrencia diaria)

    for (let intentos = 0; intentos < maxIteraciones && !isAfter(cursor, endOfDay(fin)); intentos++) {
      const ocurrencia = calcularProximaOcurrencia(rec.reglaRecurrencia, ancla, cursor)

      if (isAfter(ocurrencia, endOfDay(fin))) break

      if (!isBefore(ocurrencia, startOfDay(inicio))) {
        resultado.push({ ...rec, fechaVencimiento: ocurrencia })
      }

      // Avanzar cursor al dia siguiente de la ocurrencia, garantizando avance estricto
      // para evitar bucles infinitos cuando la regla devuelve una fecha anterior al cursor
      const siguienteCursor = addDays(startOfDay(ocurrencia), 1)
      cursor = isAfter(siguienteCursor, cursor) ? siguienteCursor : addDays(cursor, 1)
    }
  }

  return resultado
}

export function formatearMesAno(fecha: Date): string {
  return format(fecha, "MMMM yyyy", { locale: es })
}

export function formatearRangoSemana(fecha: Date): string {
  const inicio = startOfWeek(fecha, { weekStartsOn: 1 })
  const fin = endOfWeek(fecha, { weekStartsOn: 1 })
  if (getMonth(inicio) === getMonth(fin)) {
    return format(inicio, "d") + "-" + format(fin, "d MMM yyyy", { locale: es })
  }
  return format(inicio, "d MMM", { locale: es }) + " - " + format(fin, "d MMM yyyy", { locale: es })
}
