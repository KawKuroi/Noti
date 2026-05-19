import type { ResultadoLanzamiento } from '@/types/release.types'

interface RawgGame {
  id: number
  name: string
  released: string | null
  tba: boolean
  background_image: string | null
  rating: number
  added: number
}

interface RawgSearchResponse {
  results: RawgGame[]
}

interface RawgGameDetail extends RawgGame {
  description_raw?: string
  platforms?: Array<{ platform: { name: string } }>
}

const ALIAS_JUEGO: Record<string, string> = {
  gta: 'Grand Theft Auto',
  cod: 'Call of Duty',
  re: 'Resident Evil',
}

const A_ROMANO: Record<string, string> = {
  '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V',
  '6': 'VI', '7': 'VII', '8': 'VIII', '9': 'IX', '10': 'X',
}
const A_ARABE: Record<string, string> = Object.fromEntries(
  Object.entries(A_ROMANO).map(([a, r]) => [r, a]),
)

function expandirAlias(titulo: string): string {
  for (const [abrev, expansion] of Object.entries(ALIAS_JUEGO)) {
    const regex = new RegExp(`^${abrev}(\\s|$)`, 'i')
    if (regex.test(titulo)) {
      return expansion + titulo.slice(abrev.length)
    }
  }
  return titulo
}

function variantesNumerales(titulo: string): string[] {
  const variantes = new Set<string>([titulo])

  const matchArabe = titulo.match(/^(.*?)\s+(\d{1,2})$/)
  if (matchArabe) {
    const romano = A_ROMANO[matchArabe[2]]
    if (romano) variantes.add(`${matchArabe[1]} ${romano}`)
  }

  const matchRomano = titulo.match(/^(.*?)\s+(I{1,3}|IV|VI{0,3}|IX|XI{0,3}|X{1,3})$/i)
  if (matchRomano) {
    const arabe = A_ARABE[matchRomano[2].toUpperCase()]
    if (arabe) variantes.add(`${matchRomano[1]} ${arabe}`)
  }

  return Array.from(variantes)
}

function obtenerApiKey(): string {
  const apiKey = process.env.RAWG_API_KEY
  if (!apiKey) throw new Error('RAWG_API_KEY no configurada')
  return apiKey
}

async function llamarRawg<T>(ruta: string, params: Record<string, string> = {}): Promise<T | null> {
  try {
    const apiKey = obtenerApiKey()
    const url = new URL(`https://api.rawg.io/api${ruta}`)
    url.searchParams.set('key', apiKey)
    for (const [key, valor] of Object.entries(params)) {
      url.searchParams.set(key, valor)
    }
    const respuesta = await fetch(url.toString(), { cache: 'no-store' })
    if (!respuesta.ok) {
      console.error('RAWG error:', respuesta.status, await respuesta.text())
      return null
    }
    return (await respuesta.json()) as T
  } catch (e) {
    console.error('RAWG fetch fallo:', e)
    return null
  }
}

async function buscarTermino(termino: string): Promise<RawgGame[] | null> {
  const precisa = await llamarRawg<RawgSearchResponse>('/games', {
    search: termino,
    page_size: '10',
    search_precise: 'true',
  })
  if (precisa && precisa.results.length > 0) return precisa.results

  const relajada = await llamarRawg<RawgSearchResponse>('/games', {
    search: termino,
    page_size: '10',
  })
  return relajada && relajada.results.length > 0 ? relajada.results : null
}

export async function buscarJuego(titulo: string): Promise<ResultadoLanzamiento | null> {
  const expandido = expandirAlias(titulo)
  const terminos = new Set<string>([
    ...variantesNumerales(expandido),
    ...variantesNumerales(titulo),
  ])

  let resultados: RawgGame[] | null = null
  for (const termino of terminos) {
    resultados = await buscarTermino(termino)
    if (resultados) break
  }

  if (!resultados || resultados.length === 0) return null

  const conFecha = resultados.filter((j) => j.released && !j.tba)
  let mejor: RawgGame
  let esTba = false

  if (conFecha.length > 0) {
    mejor = [...conFecha].sort((a, b) => (b.added ?? 0) - (a.added ?? 0))[0]
  } else {
    mejor = [...resultados].sort((a, b) => (b.added ?? 0) - (a.added ?? 0))[0]
    esTba = true
  }

  const detalle = await llamarRawg<RawgGameDetail>(`/games/${mejor.id}`)
  const descripcionBase = detalle?.description_raw?.slice(0, 500)

  const fechaRaw = mejor.released ?? `${new Date().getFullYear() + 1}-12-31`
  const plataformasArray = detalle?.platforms?.map(p => p.platform.name) ?? []
  const plataforma = plataformasArray.length > 0 ? plataformasArray.slice(0, 3).join(', ') + (plataformasArray.length > 3 ? '...' : '') : undefined

  console.log('[RAWG]', { titulo, encontrado: mejor.name, tba: esTba, fecha: fechaRaw, plataforma })

  return {
    fuente: 'rawg',
    tipo: 'game',
    titulo: mejor.name,
    fechaLanzamiento: fechaRaw.slice(0, 10),
    tba: esTba || undefined,
    rawgId: mejor.id,
    posterUrl: mejor.background_image ?? undefined,
    descripcion: esTba
      ? `(Fecha aproximada, sin confirmar)${descripcionBase ? ` ${descripcionBase}` : ''}`
      : descripcionBase,
    plataforma,
  }
}
