const ROMANOS_A_ARABE: Record<string, number> = {
  I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10,
  XI: 11, XII: 12, XIII: 13, XIV: 14, XV: 15, XVI: 16, XVII: 17, XVIII: 18, XIX: 19, XX: 20,
}

const PALABRAS_VACIAS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al',
  'y', 'o', 'a', 'en', 'the', 'of', 'and', 'or', 'an',
])

const REGEX_DIACRITICOS = /[̀-ͯ]/g

export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(REGEX_DIACRITICOS, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenizarConNumerales(texto: string): string[] {
  const normalizado = normalizarTexto(texto)
  const tokens = normalizado.split(' ').filter(Boolean)

  return tokens.map((token) => {
    const upper = token.toUpperCase()
    if (ROMANOS_A_ARABE[upper] !== undefined) {
      return String(ROMANOS_A_ARABE[upper])
    }
    return token
  })
}

export function coincideTitulo(buscado: string, encontrado: string): boolean {
  const tokensBuscado = tokenizarConNumerales(buscado).filter(
    (t) => !PALABRAS_VACIAS.has(t) && t.length > 0,
  )
  if (tokensBuscado.length === 0) return true

  const tokensEncontrado = new Set(tokenizarConNumerales(encontrado))

  return tokensBuscado.every((token) => tokensEncontrado.has(token))
}

export function tieneNumeralCoincidente(buscado: string, encontrado: string): boolean {
  const numeralBuscado = tokenizarConNumerales(buscado).find((t) => /^\d+$/.test(t))
  if (!numeralBuscado) return true

  const numeralesEncontrado = tokenizarConNumerales(encontrado).filter((t) => /^\d+$/.test(t))
  return numeralesEncontrado.includes(numeralBuscado)
}

export function arabeARomano(num: number): string | null {
  for (const [r, a] of Object.entries(ROMANOS_A_ARABE)) {
    if (a === num) return r
  }
  return null
}

export function romanoAArabe(romano: string): number | null {
  return ROMANOS_A_ARABE[romano.toUpperCase()] ?? null
}
