import { describe, it, expect } from 'vitest'
import { esquemaExtraccion, type Extraccion } from '@/lib/ai/extractor'

// Valida el contrato estructural que el LLM debe cumplir (generateObject).
// Es la barrera anti-alucinacion: formatos de fecha/hora/recurrencia estrictos.

function extraccionValida(parcial: Partial<Extraccion> = {}): Record<string, unknown> {
  return {
    intencion: 'recordatorio_personal',
    recordatorio: {
      titulo: 'Cumpleanos de Pardo',
      categoriaSlug: 'birthdays',
      fechaVencimiento: '2026-11-19',
      horaVencimiento: null,
      esRecurrente: true,
      reglaRecurrencia: 'yearly:19-11',
      descripcion: null,
    },
    lanzamiento: null,
    aclaracion: null,
    ...parcial,
  }
}

describe('esquemaExtraccion — estructura general', () => {
  it('acepta una extraccion de recordatorio personal completa', () => {
    expect(esquemaExtraccion.safeParse(extraccionValida()).success).toBe(true)
  })

  it('acepta sub-objetos null (solo se llena el de la intencion)', () => {
    const r = esquemaExtraccion.safeParse({
      intencion: 'desconocido',
      recordatorio: null,
      lanzamiento: null,
      aclaracion: 'Que quieres agendar exactamente?',
    })
    expect(r.success).toBe(true)
  })

  it('rechaza intenciones fuera del enum', () => {
    expect(esquemaExtraccion.safeParse(extraccionValida({ intencion: 'otra' as never })).success).toBe(false)
  })

  it('rechaza categorias fuera del enum', () => {
    const datos = extraccionValida()
    ;(datos.recordatorio as Record<string, unknown>).categoriaSlug = 'gimnasio'
    expect(esquemaExtraccion.safeParse(datos).success).toBe(false)
  })
})

describe('esquemaExtraccion — regex de recurrencia', () => {
  function conRegla(regla: string | null): Record<string, unknown> {
    const datos = extraccionValida()
    ;(datos.recordatorio as Record<string, unknown>).reglaRecurrencia = regla
    return datos
  }

  it('acepta "yearly:DD-MM"', () => {
    expect(esquemaExtraccion.safeParse(conRegla('yearly:19-11')).success).toBe(true)
  })

  it('acepta "weekly" con uno o varios dias ISO', () => {
    expect(esquemaExtraccion.safeParse(conRegla('weekly:1')).success).toBe(true)
    expect(esquemaExtraccion.safeParse(conRegla('weekly:1,3,5')).success).toBe(true)
  })

  it('acepta null cuando no hay recurrencia', () => {
    expect(esquemaExtraccion.safeParse(conRegla(null)).success).toBe(true)
  })

  it('rechaza "yearly" sin dia-mes (el LLM debe anclar la fecha)', () => {
    expect(esquemaExtraccion.safeParse(conRegla('yearly')).success).toBe(false)
  })

  it('rechaza dias ISO fuera de 1-7', () => {
    expect(esquemaExtraccion.safeParse(conRegla('weekly:8')).success).toBe(false)
    expect(esquemaExtraccion.safeParse(conRegla('weekly:0')).success).toBe(false)
  })

  it('rechaza formatos libres', () => {
    expect(esquemaExtraccion.safeParse(conRegla('cada lunes')).success).toBe(false)
    expect(esquemaExtraccion.safeParse(conRegla('weekly:')).success).toBe(false)
  })
})

describe('esquemaExtraccion — formatos de fecha y hora', () => {
  function conFechaHora(fecha: string | null, hora: string | null): Record<string, unknown> {
    const datos = extraccionValida()
    const rec = datos.recordatorio as Record<string, unknown>
    rec.fechaVencimiento = fecha
    rec.horaVencimiento = hora
    rec.esRecurrente = false
    rec.reglaRecurrencia = null
    return datos
  }

  it('exige fecha YYYY-MM-DD', () => {
    expect(esquemaExtraccion.safeParse(conFechaHora('2026-11-19', null)).success).toBe(true)
    expect(esquemaExtraccion.safeParse(conFechaHora('19-11-2026', null)).success).toBe(false)
    expect(esquemaExtraccion.safeParse(conFechaHora('manana', null)).success).toBe(false)
  })

  it('exige hora HH:mm de dos digitos', () => {
    expect(esquemaExtraccion.safeParse(conFechaHora('2026-11-19', '09:30')).success).toBe(true)
    expect(esquemaExtraccion.safeParse(conFechaHora('2026-11-19', '9:30')).success).toBe(false)
  })

  it('fecha y hora null son validas (el usuario completa despues)', () => {
    expect(esquemaExtraccion.safeParse(conFechaHora(null, null)).success).toBe(true)
  })
})

describe('esquemaExtraccion — lanzamientos', () => {
  it('acepta un lanzamiento especifico con tipo del enum', () => {
    const r = esquemaExtraccion.safeParse({
      intencion: 'lanzamiento_especifico',
      recordatorio: null,
      lanzamiento: {
        tipo: 'game',
        titulo: 'GTA 6',
        contexto: null,
        artista: null,
        fechaTentativa: '2026-11-19',
      },
      aclaracion: null,
    })
    expect(r.success).toBe(true)
  })

  it('acepta tipo null (busqueda en todas las fuentes)', () => {
    const r = esquemaExtraccion.safeParse({
      intencion: 'lanzamiento_generico',
      recordatorio: null,
      lanzamiento: { tipo: null, titulo: null, contexto: 'Zelda', artista: null, fechaTentativa: null },
      aclaracion: null,
    })
    expect(r.success).toBe(true)
  })

  it('rechaza tipos de lanzamiento desconocidos', () => {
    const r = esquemaExtraccion.safeParse({
      intencion: 'lanzamiento_especifico',
      recordatorio: null,
      lanzamiento: { tipo: 'anime', titulo: 'X', contexto: null, artista: null, fechaTentativa: null },
      aclaracion: null,
    })
    expect(r.success).toBe(false)
  })

  it('rechaza fechaTentativa con formato libre', () => {
    const r = esquemaExtraccion.safeParse({
      intencion: 'lanzamiento_especifico',
      recordatorio: null,
      lanzamiento: { tipo: 'movie', titulo: 'Avatar 4', contexto: null, artista: null, fechaTentativa: 'nov 19' },
      aclaracion: null,
    })
    expect(r.success).toBe(false)
  })
})
