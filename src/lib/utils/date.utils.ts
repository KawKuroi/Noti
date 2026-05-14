import {
  isToday,
  isTomorrow,
  isThisWeek,
  startOfDay,
  addWeeks,
  addYears,
  setMonth,
  setDate,
  getMonth,
  getDate,
  getDay,
  format,
  isBefore,
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

export function obtenerProximaFecha(recordatorio: Recordatorio): Date {
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
