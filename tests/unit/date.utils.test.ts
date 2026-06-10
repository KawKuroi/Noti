import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  agruparPorDia,
  parsearReglaRecurrencia,
  serializarReglaRecurrencia,
  calcularProximaOcurrencia,
  obtenerProximaFecha,
  combinarFechaHora,
  partesEnZona,
  inicioDiaLocalEnUTC,
  segundosHastaFinDiaLocal,
  diasHastaCumple,
  expandirOcurrenciasEnRango,
  formatearHora,
  formatearFechaSinHora,
} from '@/lib/utils/date.utils'
import type { Recordatorio } from '@/types/reminder.types'

// Referencia: el 1 de junio de 2026 es lunes; el 10 es miercoles.

function crearRecordatorio(parcial: Partial<Recordatorio>): Recordatorio {
  return {
    id: 'rec-1',
    usuarioId: 'user-1',
    categoriaId: 1,
    titulo: 'Recordatorio de prueba',
    descripcion: null,
    fechaVencimiento: null,
    notificarEn: null,
    esRecurrente: false,
    reglaRecurrencia: null,
    estaCompletado: false,
    completadoEn: null,
    eliminadoEn: null,
    tmdbId: null,
    metadatos: null,
    creadoEn: new Date(2026, 0, 1),
    actualizadoEn: new Date(2026, 0, 1),
    ...parcial,
  }
}

describe('parsearReglaRecurrencia', () => {
  it('parsea "yearly" simple', () => {
    expect(parsearReglaRecurrencia('yearly')).toEqual({ tipo: 'yearly' })
  })

  it('parsea "yearly:DD-MM" ignorando el sufijo (el dia/mes viene del ancla)', () => {
    expect(parsearReglaRecurrencia('yearly:15-06')).toEqual({ tipo: 'yearly' })
  })

  it('parsea "weekly" con un dia', () => {
    expect(parsearReglaRecurrencia('weekly:3')).toEqual({ tipo: 'weekly', dias: [3] })
  })

  it('parsea "weekly" con varios dias', () => {
    expect(parsearReglaRecurrencia('weekly:1,3,5')).toEqual({ tipo: 'weekly', dias: [1, 3, 5] })
  })

  it('devuelve null para "weekly:" sin dias', () => {
    expect(parsearReglaRecurrencia('weekly:')).toBeNull()
  })

  it('devuelve null para reglas desconocidas', () => {
    expect(parsearReglaRecurrencia('daily')).toBeNull()
    expect(parsearReglaRecurrencia('')).toBeNull()
  })
})

describe('serializarReglaRecurrencia', () => {
  it('serializa yearly', () => {
    expect(serializarReglaRecurrencia({ tipo: 'yearly' })).toBe('yearly')
  })

  it('serializa weekly con dias', () => {
    expect(serializarReglaRecurrencia({ tipo: 'weekly', dias: [1, 3] })).toBe('weekly:1,3')
  })

  it('devuelve cadena vacia para weekly sin dias', () => {
    expect(serializarReglaRecurrencia({ tipo: 'weekly' })).toBe('')
  })
})

describe('calcularProximaOcurrencia — yearly', () => {
  it('devuelve la fecha de este ano si aun no paso', () => {
    const ancla = new Date(2020, 5, 15)
    const ahora = new Date(2026, 5, 10)
    expect(calcularProximaOcurrencia('yearly', ancla, ahora)).toEqual(new Date(2026, 5, 15))
  })

  it('suma un ano si la fecha ya paso', () => {
    const ancla = new Date(2020, 5, 1)
    const ahora = new Date(2026, 5, 10)
    expect(calcularProximaOcurrencia('yearly', ancla, ahora)).toEqual(new Date(2027, 5, 1))
  })

  it('el mismo dia cuenta como ocurrencia de hoy (no salta al proximo ano)', () => {
    const ancla = new Date(2020, 5, 10)
    const ahora = new Date(2026, 5, 10, 18, 0)
    expect(calcularProximaOcurrencia('yearly', ancla, ahora)).toEqual(new Date(2026, 5, 10))
  })
})

describe('calcularProximaOcurrencia — weekly', () => {
  // Ancla: miercoles 3 de junio de 2026 a las 10:00
  const ancla = new Date(2026, 5, 3, 10, 0)

  it('encuentra el proximo dia valido conservando la hora del ancla', () => {
    const ahora = new Date(2026, 5, 8) // lunes
    expect(calcularProximaOcurrencia('weekly:3', ancla, ahora)).toEqual(new Date(2026, 5, 10, 10, 0))
  })

  it('hoy es valido si la hora del ancla no paso', () => {
    const ahora = new Date(2026, 5, 10, 8, 0) // miercoles 8am
    expect(calcularProximaOcurrencia('weekly:3', ancla, ahora)).toEqual(new Date(2026, 5, 10, 10, 0))
  })

  it('hoy con hora ya pasada salta a la proxima semana', () => {
    const ahora = new Date(2026, 5, 10, 11, 0) // miercoles 11am
    expect(calcularProximaOcurrencia('weekly:3', ancla, ahora)).toEqual(new Date(2026, 5, 17, 10, 0))
  })

  it('con varios dias elige el mas cercano', () => {
    const ahora = new Date(2026, 5, 11) // jueves
    expect(calcularProximaOcurrencia('weekly:1,3', ancla, ahora)).toEqual(new Date(2026, 5, 15, 10, 0))
  })

  it('convierte el domingo ISO (7) correctamente', () => {
    const ahora = new Date(2026, 5, 10) // miercoles
    expect(calcularProximaOcurrencia('weekly:7', ancla, ahora)).toEqual(new Date(2026, 5, 14, 10, 0))
  })

  it('una regla invalida devuelve el ancla sin cambios', () => {
    const ahora = new Date(2026, 5, 10)
    expect(calcularProximaOcurrencia('daily', ancla, ahora)).toEqual(ancla)
  })
})

describe('agruparPorDia / obtenerProximaFecha (reloj fijo)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Miercoles 10 de junio de 2026, mediodia local
    vi.setSystemTime(new Date(2026, 5, 10, 12, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('clasifica vencidos, hoy, manana, esta semana y mas adelante', () => {
    const grupos = agruparPorDia([
      crearRecordatorio({ id: 'vencido', fechaVencimiento: new Date(2026, 5, 8, 9, 0) }),
      crearRecordatorio({ id: 'hoy', fechaVencimiento: new Date(2026, 5, 10, 18, 0) }),
      crearRecordatorio({ id: 'manana', fechaVencimiento: new Date(2026, 5, 11, 9, 0) }),
      crearRecordatorio({ id: 'semana', fechaVencimiento: new Date(2026, 5, 13, 9, 0) }),
      crearRecordatorio({ id: 'lejos', fechaVencimiento: new Date(2026, 5, 25, 9, 0) }),
    ])

    expect(grupos.vencidos.map((r) => r.id)).toEqual(['vencido'])
    expect(grupos.hoy.map((r) => r.id)).toEqual(['hoy'])
    expect(grupos.manana.map((r) => r.id)).toEqual(['manana'])
    expect(grupos.estaSemana.map((r) => r.id)).toEqual(['semana'])
    expect(grupos.masAdelante.map((r) => r.id)).toEqual(['lejos'])
  })

  it('un completado con fecha pasada no cuenta como vencido', () => {
    const grupos = agruparPorDia([
      crearRecordatorio({ fechaVencimiento: new Date(2026, 5, 8, 9, 0), estaCompletado: true }),
    ])
    expect(grupos.vencidos).toHaveLength(0)
  })

  it('ignora recordatorios sin fecha', () => {
    const grupos = agruparPorDia([crearRecordatorio({ fechaVencimiento: null })])
    const total = Object.values(grupos).reduce((acc, g) => acc + g.length, 0)
    expect(total).toBe(0)
  })

  it('un recurrente nunca es vencido: se agrupa por su proxima ocurrencia', () => {
    const grupos = agruparPorDia([
      crearRecordatorio({
        id: 'clase',
        fechaVencimiento: new Date(2026, 4, 1, 10, 0), // ancla vieja
        esRecurrente: true,
        reglaRecurrencia: 'weekly:5', // viernes -> 12 de junio
      }),
    ])
    expect(grupos.vencidos).toHaveLength(0)
    expect(grupos.estaSemana.map((r) => r.id)).toEqual(['clase'])
  })

  it('obtenerProximaFecha devuelve la fecha tal cual para no recurrentes', () => {
    const fecha = new Date(2026, 5, 20, 9, 0)
    const rec = crearRecordatorio({ fechaVencimiento: fecha })
    expect(obtenerProximaFecha(rec)).toEqual(fecha)
  })

  it('obtenerProximaFecha calcula la proxima ocurrencia para recurrentes', () => {
    const rec = crearRecordatorio({
      fechaVencimiento: new Date(2026, 4, 4, 10, 0),
      esRecurrente: true,
      reglaRecurrencia: 'weekly:1', // lunes -> 15 de junio
    })
    expect(obtenerProximaFecha(rec)).toEqual(new Date(2026, 5, 15, 10, 0))
  })

  it('obtenerProximaFecha devuelve null sin fechaVencimiento', () => {
    expect(obtenerProximaFecha(crearRecordatorio({ fechaVencimiento: null }))).toBeNull()
  })
})

describe('combinarFechaHora', () => {
  it('combina fecha y hora en un Date local', () => {
    const fecha = combinarFechaHora('2026-06-10', '09:30')
    expect(fecha.getFullYear()).toBe(2026)
    expect(fecha.getMonth()).toBe(5)
    expect(fecha.getDate()).toBe(10)
    expect(fecha.getHours()).toBe(9)
    expect(fecha.getMinutes()).toBe(30)
  })
})

describe('partesEnZona', () => {
  it('descompone un instante UTC en la hora local de Bogota (UTC-5)', () => {
    const instante = new Date(Date.UTC(2026, 5, 10, 3, 0))
    expect(partesEnZona(instante, 'America/Bogota')).toEqual({
      anio: 2026,
      mes: 6,
      dia: 9,
      hora: 22,
      minuto: 0,
    })
  })

  it('normaliza la medianoche (Intl puede devolver hora 24)', () => {
    const instante = new Date(Date.UTC(2026, 5, 10, 5, 0)) // 00:00 en Bogota
    const partes = partesEnZona(instante, 'America/Bogota')
    expect(partes.dia).toBe(10)
    expect(partes.hora).toBe(0)
    expect(partes.minuto).toBe(0)
  })

  it('es identidad para la zona UTC', () => {
    const instante = new Date(Date.UTC(2026, 5, 10, 14, 45))
    expect(partesEnZona(instante, 'UTC')).toEqual({
      anio: 2026,
      mes: 6,
      dia: 10,
      hora: 14,
      minuto: 45,
    })
  })

  it('maneja zonas con horario de verano (Madrid en junio = UTC+2)', () => {
    const instante = new Date(Date.UTC(2026, 5, 10, 23, 30))
    expect(partesEnZona(instante, 'Europe/Madrid')).toEqual({
      anio: 2026,
      mes: 6,
      dia: 11,
      hora: 1,
      minuto: 30,
    })
  })
})

describe('inicioDiaLocalEnUTC', () => {
  it('devuelve el instante UTC de la medianoche local en Bogota', () => {
    const instante = new Date(Date.UTC(2026, 5, 10, 15, 0))
    expect(inicioDiaLocalEnUTC(instante, 'America/Bogota')).toEqual(
      new Date(Date.UTC(2026, 5, 10, 5, 0)),
    )
  })

  it('en UTC la medianoche local coincide con la UTC', () => {
    const instante = new Date(Date.UTC(2026, 5, 10, 15, 0))
    expect(inicioDiaLocalEnUTC(instante, 'UTC')).toEqual(new Date(Date.UTC(2026, 5, 10, 0, 0)))
  })

  it('en Madrid (UTC+2 en junio) la medianoche local es del dia anterior en UTC', () => {
    const instante = new Date(Date.UTC(2026, 5, 10, 15, 0))
    expect(inicioDiaLocalEnUTC(instante, 'Europe/Madrid')).toEqual(
      new Date(Date.UTC(2026, 5, 9, 22, 0)),
    )
  })
})

describe('segundosHastaFinDiaLocal (TTL de push)', () => {
  it('a medianoche local quedan 24h completas', () => {
    const ahora = new Date(Date.UTC(2026, 5, 10, 5, 0)) // 00:00 Bogota
    expect(segundosHastaFinDiaLocal('America/Bogota', ahora)).toBe(86400)
  })

  it('al mediodia local quedan 12h', () => {
    const ahora = new Date(Date.UTC(2026, 5, 10, 17, 0)) // 12:00 Bogota
    expect(segundosHastaFinDiaLocal('America/Bogota', ahora)).toBe(43200)
  })

  it('cerca de la medianoche aplica el margen minimo de 60s', () => {
    const ahora = new Date(Date.UTC(2026, 5, 11, 4, 59, 30)) // 23:59:30 Bogota
    expect(segundosHastaFinDiaLocal('America/Bogota', ahora)).toBe(60)
  })
})

describe('diasHastaCumple', () => {
  const zona = 'America/Bogota'
  // Mediodia UTC = manana en Bogota, sin ambiguedad de dia.
  const ahora = new Date(Date.UTC(2026, 5, 10, 12, 0)) // 10 de junio en Bogota

  it('devuelve 0 si el cumpleanos es hoy (ignora el ano)', () => {
    const cumple = new Date(Date.UTC(2000, 5, 10, 12, 0))
    expect(diasHastaCumple(cumple, zona, ahora)).toBe(0)
  })

  it('devuelve 1 si es manana', () => {
    const cumple = new Date(Date.UTC(1995, 5, 11, 12, 0))
    expect(diasHastaCumple(cumple, zona, ahora)).toBe(1)
  })

  it('devuelve 3 si faltan 3 dias', () => {
    const cumple = new Date(Date.UTC(1990, 5, 13, 12, 0))
    expect(diasHastaCumple(cumple, zona, ahora)).toBe(3)
  })

  it('si ya paso este ano cuenta hasta el proximo', () => {
    const cumple = new Date(Date.UTC(1990, 5, 9, 12, 0)) // 9 de junio
    expect(diasHastaCumple(cumple, zona, ahora)).toBe(364)
  })

  it('usa el dia local de la zona, no el de UTC', () => {
    // 03:00 UTC del 10 de junio = 22:00 del 9 de junio en Bogota
    const ahoraNoche = new Date(Date.UTC(2026, 5, 10, 3, 0))
    const cumple = new Date(Date.UTC(2000, 5, 10, 12, 0))
    expect(diasHastaCumple(cumple, zona, ahoraNoche)).toBe(1)
  })
})

describe('expandirOcurrenciasEnRango', () => {
  const inicio = new Date(2026, 5, 1) // lunes
  const fin = new Date(2026, 5, 14) // domingo

  it('incluye no recurrentes dentro del rango', () => {
    const rec = crearRecordatorio({ fechaVencimiento: new Date(2026, 5, 5, 9, 0) })
    expect(expandirOcurrenciasEnRango([rec], inicio, fin)).toHaveLength(1)
  })

  it('excluye no recurrentes fuera del rango', () => {
    const rec = crearRecordatorio({ fechaVencimiento: new Date(2026, 5, 20, 9, 0) })
    expect(expandirOcurrenciasEnRango([rec], inicio, fin)).toHaveLength(0)
  })

  it('expande un semanal en cada ocurrencia del rango', () => {
    const rec = crearRecordatorio({
      fechaVencimiento: new Date(2026, 4, 4, 10, 0),
      esRecurrente: true,
      reglaRecurrencia: 'weekly:1', // lunes
    })
    const ocurrencias = expandirOcurrenciasEnRango([rec], inicio, fin)
    expect(ocurrencias.map((o) => o.fechaVencimiento)).toEqual([
      new Date(2026, 5, 1, 10, 0),
      new Date(2026, 5, 8, 10, 0),
    ])
  })

  it('expande un anual una sola vez dentro del rango', () => {
    const rec = crearRecordatorio({
      fechaVencimiento: new Date(2020, 5, 5),
      esRecurrente: true,
      reglaRecurrencia: 'yearly',
    })
    const ocurrencias = expandirOcurrenciasEnRango([rec], inicio, fin)
    expect(ocurrencias).toHaveLength(1)
    expect(ocurrencias[0].fechaVencimiento).toEqual(new Date(2026, 5, 5))
  })

  it('devuelve vacio si el recurrente no tiene ocurrencias en el rango', () => {
    const rec = crearRecordatorio({
      fechaVencimiento: new Date(2026, 4, 4, 10, 0),
      esRecurrente: true,
      reglaRecurrencia: 'weekly:1', // lunes
    })
    // Rango martes a sabado: sin lunes
    const ocurrencias = expandirOcurrenciasEnRango([rec], new Date(2026, 5, 2), new Date(2026, 5, 6))
    expect(ocurrencias).toHaveLength(0)
  })

  it('ignora recordatorios sin fecha', () => {
    const rec = crearRecordatorio({ fechaVencimiento: null, esRecurrente: true, reglaRecurrencia: 'weekly:1' })
    expect(expandirOcurrenciasEnRango([rec], inicio, fin)).toHaveLength(0)
  })
})

describe('formateadores', () => {
  it('formatearHora devuelve HH:mm en 24h', () => {
    expect(formatearHora(new Date(2026, 5, 10, 9, 5))).toBe('09:05')
    expect(formatearHora(new Date(2026, 5, 10, 21, 30))).toBe('21:30')
  })

  it('formatearFechaSinHora usa el locale espanol', () => {
    expect(formatearFechaSinHora(new Date(2026, 5, 10))).toBe('10 de junio')
  })
})
