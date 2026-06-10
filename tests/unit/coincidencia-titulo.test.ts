import { describe, it, expect } from 'vitest'
import {
  normalizarTexto,
  coincideTitulo,
  similitudDice,
  coincideTituloAproximado,
  tieneNumeralCoincidente,
  arabeARomano,
  romanoAArabe,
} from '@/lib/utils/coincidencia-titulo'

describe('normalizarTexto', () => {
  it('pasa a minusculas', () => {
    expect(normalizarTexto('AVATAR')).toBe('avatar')
  })

  it('elimina diacriticos', () => {
    expect(normalizarTexto('Pelícúla de acción')).toBe('pelicula de accion')
  })

  it('reemplaza puntuacion por espacios', () => {
    expect(normalizarTexto('Spider-Man: No Way Home')).toBe('spider man no way home')
  })

  it('colapsa espacios multiples', () => {
    expect(normalizarTexto('  hola    mundo  ')).toBe('hola mundo')
  })

  it('devuelve cadena vacia para entrada vacia', () => {
    expect(normalizarTexto('')).toBe('')
  })
})

describe('coincideTitulo', () => {
  it('coincide cuando el buscado es subconjunto del encontrado', () => {
    expect(coincideTitulo('Avatar', 'Avatar: Fire and Ash')).toBe(true)
  })

  it('coincide ignorando guiones y mayusculas', () => {
    expect(coincideTitulo('spider man 2', "Marvel's Spider-Man 2")).toBe(true)
  })

  it('convierte numerales romanos a arabigos en ambos lados', () => {
    expect(coincideTitulo('the witcher 4', 'The Witcher IV')).toBe(true)
    expect(coincideTitulo('Final Fantasy VII', 'Final Fantasy 7 Remake')).toBe(true)
  })

  it('ignora palabras vacias del titulo buscado', () => {
    expect(coincideTitulo('el senor de los anillos', 'Senor Anillos')).toBe(true)
  })

  it('no coincide cuando falta un token del buscado', () => {
    expect(coincideTitulo('GTA 6', 'Grand Theft Auto VI')).toBe(false)
  })

  it('no coincide con un numeral distinto', () => {
    expect(coincideTitulo('Avatar 3', 'Avatar 2')).toBe(false)
  })

  it('devuelve true si el buscado queda vacio tras filtrar stopwords', () => {
    expect(coincideTitulo('the', 'Cualquier Cosa')).toBe(true)
  })
})

describe('similitudDice', () => {
  it('devuelve 1 para cadenas identicas', () => {
    expect(similitudDice('Zelda', 'Zelda')).toBe(1)
  })

  it('tolera typos comunes con similitud alta', () => {
    expect(similitudDice('Spidermman', 'Spider-Man')).toBeGreaterThan(0.75)
  })

  it('da similitud baja a titulos distintos', () => {
    expect(similitudDice('Halo Infinite', 'Stardew Valley')).toBeLessThan(0.3)
  })

  it('ignora espacios y separadores', () => {
    expect(similitudDice('Spider Man', 'SpiderMan')).toBe(1)
  })

  it('cadenas de un caracter: 1 si son iguales', () => {
    expect(similitudDice('a', 'a')).toBe(1)
  })

  it('cadenas de un caracter: 0 si son distintas', () => {
    expect(similitudDice('a', 'b')).toBe(0)
  })

  it('es simetrica', () => {
    const ab = similitudDice('Elden Ring', 'Eldenring 2')
    const ba = similitudDice('Eldenring 2', 'Elden Ring')
    expect(ab).toBeCloseTo(ba, 10)
  })
})

describe('coincideTituloAproximado', () => {
  it('acepta el match exacto por tokens', () => {
    expect(coincideTituloAproximado('Dune', 'Dune: Part Two')).toBe(true)
  })

  it('acepta typos via similitud Dice', () => {
    expect(coincideTituloAproximado('Spidermman', 'Spider-Man')).toBe(true)
  })

  it('rechaza titulos realmente distintos', () => {
    expect(coincideTituloAproximado('Halo', 'Stardew Valley')).toBe(false)
  })

  it('respeta un umbral personalizado mas estricto', () => {
    expect(coincideTituloAproximado('Spidermman', 'Spider-Man', 0.99)).toBe(false)
  })
})

describe('tieneNumeralCoincidente', () => {
  it('true cuando el buscado no tiene numeral', () => {
    expect(tieneNumeralCoincidente('Avatar', 'Avatar 3')).toBe(true)
  })

  it('true cuando ambos comparten el numeral', () => {
    expect(tieneNumeralCoincidente('Avatar 3', 'Avatar 3: La Semilla')).toBe(true)
  })

  it('false cuando el encontrado no tiene el numeral buscado', () => {
    expect(tieneNumeralCoincidente('Avatar 3', 'Avatar: Fire and Ash')).toBe(false)
  })

  it('compara numerales romanos contra arabigos', () => {
    expect(tieneNumeralCoincidente('Final Fantasy VII', 'Final Fantasy 7')).toBe(true)
  })

  it('false cuando los numerales difieren', () => {
    expect(tieneNumeralCoincidente('Rocky II', 'Rocky 3')).toBe(false)
  })
})

describe('arabeARomano / romanoAArabe', () => {
  it('convierte arabigo a romano dentro del rango', () => {
    expect(arabeARomano(7)).toBe('VII')
    expect(arabeARomano(20)).toBe('XX')
  })

  it('devuelve null fuera del rango soportado', () => {
    expect(arabeARomano(21)).toBeNull()
    expect(arabeARomano(0)).toBeNull()
  })

  it('convierte romano a arabigo sin importar mayusculas', () => {
    expect(romanoAArabe('ix')).toBe(9)
    expect(romanoAArabe('XIV')).toBe(14)
  })

  it('devuelve null para cadenas que no son romanos validos', () => {
    expect(romanoAArabe('ABC')).toBeNull()
  })
})
