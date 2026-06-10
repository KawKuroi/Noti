import { describe, it, expect } from 'vitest'
import { parsearFechaNatural } from '@/lib/utils/parsear-fecha-natural'

// Fecha de referencia fija: miercoles 10 de junio de 2026 (hora local).
const HOY = new Date(2026, 5, 10)

describe('parsearFechaNatural — formato numerico dd/mm', () => {
  it('parsea dd/mm futuro dentro del ano actual', () => {
    expect(parsearFechaNatural('20/06', HOY)).toBe('2026-06-20')
  })

  it('parsea dd/mm con cero inicial', () => {
    expect(parsearFechaNatural('05/11', HOY)).toBe('2026-11-05')
  })

  it('suma un ano si la fecha ya paso', () => {
    expect(parsearFechaNatural('01/03', HOY)).toBe('2027-03-01')
  })

  it('la fecha de hoy se mantiene en el ano actual', () => {
    expect(parsearFechaNatural('10/06', HOY)).toBe('2026-06-10')
  })

  it('acepta guion como separador', () => {
    expect(parsearFechaNatural('15-08', HOY)).toBe('2026-08-15')
  })

  it('ignora el ano pegado al final (dd/mm/yyyy usa solo dd/mm)', () => {
    expect(parsearFechaNatural('20/06/2026', HOY)).toBe('2026-06-20')
  })

  it('rechaza un dia inexistente para el mes', () => {
    expect(parsearFechaNatural('31/02', HOY)).toBeNull()
  })

  it('rechaza mes fuera de rango', () => {
    expect(parsearFechaNatural('10/13', HOY)).toBeNull()
  })

  it('encuentra la fecha embebida en una frase', () => {
    expect(parsearFechaNatural('sale el 20/06 en cines', HOY)).toBe('2026-06-20')
  })
})

describe('parsearFechaNatural — dia + mes con nombre', () => {
  it('parsea "dd de mmmm"', () => {
    expect(parsearFechaNatural('19 de noviembre', HOY)).toBe('2026-11-19')
  })

  it('parsea "dd mmm" abreviado', () => {
    expect(parsearFechaNatural('19 nov', HOY)).toBe('2026-11-19')
  })

  it('suma un ano cuando "dd mmm" ya paso', () => {
    expect(parsearFechaNatural('3 mar', HOY)).toBe('2027-03-03')
  })

  it('acepta acentos en el nombre del mes', () => {
    expect(parsearFechaNatural('5 de Septiembre', HOY)).toBe('2026-09-05')
  })

  it('acepta la variante "setiembre"', () => {
    expect(parsearFechaNatural('5 de setiembre', HOY)).toBe('2026-09-05')
  })

  it('ignora el ano explicito al final ("19 de noviembre de 2027" usa regla de ano propio)', () => {
    expect(parsearFechaNatural('19 de noviembre de 2027', HOY)).toBe('2026-11-19')
  })
})

describe('parsearFechaNatural — mes + dia (orden ingles)', () => {
  it('parsea "mmm dd"', () => {
    expect(parsearFechaNatural('nov 19', HOY)).toBe('2026-11-19')
  })

  it('parsea "mmmm dd" con nombre completo', () => {
    expect(parsearFechaNatural('noviembre 19', HOY)).toBe('2026-11-19')
  })

  it('suma un ano cuando ya paso', () => {
    expect(parsearFechaNatural('enero 15', HOY)).toBe('2027-01-15')
  })
})

describe('parsearFechaNatural — sin fecha', () => {
  it('devuelve null para texto sin fecha', () => {
    expect(parsearFechaNatural('comprar pan', HOY)).toBeNull()
  })

  it('devuelve null para cadena vacia', () => {
    expect(parsearFechaNatural('', HOY)).toBeNull()
  })

  it('devuelve null para palabra que no es mes seguida de numero', () => {
    expect(parsearFechaNatural('sabado 21', HOY)).toBeNull()
  })
})
