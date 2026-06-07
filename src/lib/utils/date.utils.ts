import {
  isToday,
  isTomorrow,
  isThisWeek,
  isYesterday,
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
  getYear,
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
  vencidos: Recordatorio[]
  hoy: Recordatorio[]
  manana: Recordatorio[]
  estaSemana: Recordatorio[]
  masAdelante: Recordatorio[]
}

export function agruparPorDia(recordatorios: Recordatorio[]): GruposRecordatorios {
  const grupos: GruposRecordatorios = { vencidos: [], hoy: [], manana: [], estaSemana: [], masAdelante: [] }
  const inicioHoy = startOfDay(new Date())

  for (const rec of recordatorios) {
    if (!rec.fechaVencimiento) continue

    // Los recurrentes se agrupan por su proxima ocurrencia y nunca son "vencidos".
    const fechaBase = rec.fechaVencimiento instanceof Date ? rec.fechaVencimiento : new Date(rec.fechaVencimiento)
    const fecha = rec.esRecurrente ? obtenerProximaFecha(rec) ?? fechaBase : fechaBase

    if (!rec.esRecurrente && !rec.estaCompletado && isBefore(fecha, inicioHoy)) {
      grupos.vencidos.push(rec)
    } else if (isToday(fecha)) {
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
  // Acepta tanto "yearly" como "yearly:DD-MM" (el dia/mes se toma de la ancla).
  if (regla === 'yearly' || regla.startsWith('yearly:')) return { tipo: 'yearly' }

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

// --- Helpers de zona horaria (Intl, sin dependencias extra) ---

export interface PartesFechaLocal {
  anio: number
  mes: number // 1-12
  dia: number // 1-31
  hora: number // 0-23
  minuto: number // 0-59
}

// Descompone un instante UTC en las partes de fecha/hora de una zona horaria dada.
export function partesEnZona(fecha: Date, zona: string): PartesFechaLocal {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: zona,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const partes = fmt.formatToParts(fecha)
  const valor = (tipo: string) => Number(partes.find((p) => p.type === tipo)?.value)
  // Intl puede devolver "24" para la medianoche en hour12:false; normalizar a 0.
  const horaCruda = valor('hour')
  return {
    anio: valor('year'),
    mes: valor('month'),
    dia: valor('day'),
    hora: horaCruda === 24 ? 0 : horaCruda,
    minuto: valor('minute'),
  }
}

// Offset de la zona (local - UTC) en ms en el instante `fecha`. Para America/Bogota = -5h.
function offsetZonaMs(fecha: Date, zona: string): number {
  const p = partesEnZona(fecha, zona)
  const comoSiFueraUTC = Date.UTC(p.anio, p.mes - 1, p.dia, p.hora, p.minuto, 0)
  const baseAlMinuto = Math.floor(fecha.getTime() / 60000) * 60000
  return comoSiFueraUTC - baseAlMinuto
}

// Instante UTC correspondiente a la medianoche (00:00) local del dia de `fecha` en `zona`.
export function inicioDiaLocalEnUTC(fecha: Date, zona: string): Date {
  const { anio, mes, dia } = partesEnZona(fecha, zona)
  const medianocheComoUTC = Date.UTC(anio, mes - 1, dia, 0, 0, 0)
  // local 00:00 como-si-UTC, menos el offset, da el instante UTC real de esa medianoche local.
  return new Date(medianocheComoUTC - offsetZonaMs(fecha, zona))
}

// Segundos restantes hasta el fin del dia local (23:59:59) en `zona`. Se usa como TTL
// de los push: un aviso de hoy sigue siendo entregable hasta el fin del dia local y
// luego expira en el servicio de push (FCM), evitando el backlog al reabrir el navegador.
export function segundosHastaFinDiaLocal(zona: string, ahora: Date = new Date()): number {
  const finDiaLocal = inicioDiaLocalEnUTC(ahora, zona).getTime() + 24 * 60 * 60 * 1000
  const segundos = Math.floor((finDiaLocal - ahora.getTime()) / 1000)
  // Margen minimo para no enviar TTL=0 cerca de la medianoche.
  return Math.max(segundos, 60)
}

// Dias-calendario locales desde hoy hasta la proxima ocurrencia del mes-dia de un
// cumpleanos (0 = es hoy, 3 = faltan 3 dias). Ignora el ano del cumpleanos.
export function diasHastaCumple(fechaCumple: Date, zona: string, ahora: Date = new Date()): number {
  const hoy = partesEnZona(ahora, zona)
  const cumple = partesEnZona(fechaCumple, zona)

  const hoyUTC = Date.UTC(hoy.anio, hoy.mes - 1, hoy.dia)
  let objetivo = Date.UTC(hoy.anio, cumple.mes - 1, cumple.dia)
  if (objetivo < hoyUTC) {
    objetivo = Date.UTC(hoy.anio + 1, cumple.mes - 1, cumple.dia)
  }
  return Math.round((objetivo - hoyUTC) / (24 * 60 * 60 * 1000))
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

    // Defensa en profundidad: evitar duplicados del mismo dia si la regla no avanza
    const insertadas = new Set<number>()
    let cursor = startOfDay(inicio)
    const maxIteraciones = 400 // tope de seguridad (rango max ~1 año con recurrencia diaria)

    for (let intentos = 0; intentos < maxIteraciones && !isAfter(cursor, endOfDay(fin)); intentos++) {
      const ocurrencia = calcularProximaOcurrencia(rec.reglaRecurrencia, ancla, cursor)

      if (isAfter(ocurrencia, endOfDay(fin))) break

      if (!isBefore(ocurrencia, startOfDay(inicio))) {
        const clave = startOfDay(ocurrencia).getTime()
        if (!insertadas.has(clave)) {
          insertadas.add(clave)
          resultado.push({ ...rec, fechaVencimiento: ocurrencia })
        }
      }

      // Avanzar cursor al dia siguiente de la ocurrencia, garantizando avance estricto
      // para evitar bucles infinitos cuando la regla devuelve una fecha anterior al cursor
      const siguienteCursor = addDays(startOfDay(ocurrencia), 1)
      cursor = isAfter(siguienteCursor, cursor) ? siguienteCursor : addDays(cursor, 1)
    }
  }

  return resultado
}

// Formato para timestamps de burbujas de nota: hoy solo hora, ayer "Ayer HH:mm",
// resto del año "d MMM HH:mm", años anteriores "d MMM yyyy HH:mm".
export function formatearMomentoNota(fecha: Date): string {
  if (isToday(fecha)) return format(fecha, 'HH:mm')
  if (isYesterday(fecha)) return `Ayer ${format(fecha, 'HH:mm')}`
  const mismoAno = getYear(fecha) === getYear(new Date())
  return mismoAno
    ? format(fecha, "d MMM HH:mm", { locale: es })
    : format(fecha, "d MMM yyyy HH:mm", { locale: es })
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
