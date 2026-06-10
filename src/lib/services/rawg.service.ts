import type { ResultadoLanzamiento } from '@/types/release.types'
import {
  coincideTituloAproximado,
  tieneNumeralCoincidente,
  arabeARomano,
  romanoAArabe,
} from '@/lib/utils/coincidencia-titulo'
import { fetchConTimeout } from '@/lib/utils/fetch-con-timeout'

// RAWG added es el numero de usuarios que agregaron el juego (~0 a 20000+).
function normalizarPopularidad(added?: number): number {
  return Math.min((added ?? 0) / 10000, 1)
}

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
  lou: 'The Last of Us',
  botw: 'Breath of the Wild',
  totk: 'Tears of the Kingdom',
}

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
    const romano = arabeARomano(Number(matchArabe[2]))
    if (romano) variantes.add(`${matchArabe[1]} ${romano}`)
  }

  const matchRomano = titulo.match(/^(.*?)\s+(I{1,3}|IV|VI{0,3}|IX|XI{0,3}|XV|XVI{0,3}|XIX|XX|X{1,3})$/i)
  if (matchRomano) {
    const arabe = romanoAArabe(matchRomano[2])
    if (arabe !== null) variantes.add(`${matchRomano[1]} ${arabe}`)
  }

  return Array.from(variantes)
}

function obtenerApiKey(): string {
  const apiKey = process.env.RAWG_API_KEY
  if (!apiKey) throw new Error('RAWG_API_KEY no configurada')
  return apiKey
}

// Lanza Error ante key ausente, HTTP !ok o fallo de red (tras reintento):
// el orquestador captura por fuente y reporta la fuente caida al usuario.
async function llamarRawg<T>(ruta: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = obtenerApiKey()
  const url = new URL(`https://api.rawg.io/api${ruta}`)
  url.searchParams.set('key', apiKey)
  for (const [key, valor] of Object.entries(params)) {
    url.searchParams.set(key, valor)
  }
  const respuesta = await fetchConTimeout(url.toString(), { next: { revalidate: 3600 } })
  if (!respuesta.ok) {
    throw new Error(`RAWG respondio ${respuesta.status}`)
  }
  return (await respuesta.json()) as T
}

async function buscarTermino(termino: string): Promise<RawgGame[] | null> {
  const precisa = await llamarRawg<RawgSearchResponse>('/games', {
    search: termino,
    page_size: '15',
    search_precise: 'true',
  })
  if (precisa.results.length > 0) return precisa.results

  const relajada = await llamarRawg<RawgSearchResponse>('/games', {
    search: termino,
    page_size: '15',
  })
  return relajada.results.length > 0 ? relajada.results : null
}

async function juegoAResultado(base: RawgGame, esTba: boolean): Promise<ResultadoLanzamiento> {
  // El detalle aporta descripcion y plataformas; si falla, degradar a los
  // datos base de la busqueda en lugar de perder el candidato.
  let detalle: RawgGameDetail | null = null
  try {
    detalle = await llamarRawg<RawgGameDetail>(`/games/${base.id}`)
  } catch (e) {
    console.error('RAWG detalle fallo:', e)
  }
  const descripcionBase = detalle?.description_raw?.slice(0, 500)
  const plataformasArray = detalle?.platforms?.map((p) => p.platform.name) ?? []
  const plataforma =
    plataformasArray.length > 0
      ? plataformasArray.slice(0, 3).join(', ') + (plataformasArray.length > 3 ? '...' : '')
      : undefined
  const fechaLanzamiento = !esTba && base.released ? base.released.slice(0, 10) : null

  return {
    fuente: 'rawg',
    tipo: 'game',
    titulo: base.name,
    fechaLanzamiento,
    tba: esTba || undefined,
    rawgId: base.id,
    posterUrl: base.background_image ?? undefined,
    descripcion: esTba
      ? `(Fecha sin confirmar)${descripcionBase ? ` ${descripcionBase}` : ''}`
      : descripcionBase,
    plataforma,
    popularidad: normalizarPopularidad(base.added),
  }
}

export async function candidatosJuego(titulo: string, limite = 5): Promise<ResultadoLanzamiento[]> {
  const expandido = expandirAlias(titulo)
  const terminos = new Set<string>([
    ...variantesNumerales(expandido),
    ...variantesNumerales(titulo),
  ])

  const recolectados = new Map<number, RawgGame>()

  for (const termino of terminos) {
    const resultados = await buscarTermino(termino)
    if (!resultados) continue
    for (const r of resultados) {
      if (!recolectados.has(r.id)) recolectados.set(r.id, r)
    }
    if (recolectados.size >= 20) break
  }

  if (recolectados.size === 0) return []

  const todos = Array.from(recolectados.values())
  const coincidentes = todos.filter(
    (j) => coincideTituloAproximado(expandido, j.name) && tieneNumeralCoincidente(expandido, j.name),
  )
  const pool = coincidentes.length > 0 ? coincidentes : todos

  const conFecha = pool
    .filter((j) => j.released && !j.tba)
    .sort((a, b) => (b.added ?? 0) - (a.added ?? 0))
  const sinFecha = pool
    .filter((j) => !j.released || j.tba)
    .sort((a, b) => (b.added ?? 0) - (a.added ?? 0))

  const ordenados = [...conFecha, ...sinFecha].slice(0, limite)

  const resultados = await Promise.all(
    ordenados.map((j) => juegoAResultado(j, !j.released || j.tba)),
  )

  if (process.env.NODE_ENV !== 'production') console.log('[RAWG/candidatos]', { titulo, candidatos: resultados.length })
  return resultados
}

export async function buscarJuego(titulo: string): Promise<ResultadoLanzamiento | null> {
  const candidatos = await candidatosJuego(titulo, 1)
  return candidatos[0] ?? null
}

export async function proximoJuego(franquicia: string, limite = 5): Promise<ResultadoLanzamiento[]> {
  const expandido = expandirAlias(franquicia)
  const hoy = new Date().toISOString().slice(0, 10)
  const limiteFuturo = new Date()
  limiteFuturo.setFullYear(limiteFuturo.getFullYear() + 5)
  const limiteIso = limiteFuturo.toISOString().slice(0, 10)

  const conFiltro = await llamarRawg<RawgSearchResponse>('/games', {
    search: expandido,
    page_size: '25',
    dates: `${hoy},${limiteIso}`,
    ordering: '-added',
  })

  const coincidentes =
    conFiltro.results.filter((j) => coincideTituloAproximado(expandido, j.name))

  const futuros = coincidentes
    .filter((j) => j.released && j.released >= hoy && !j.tba)
    .sort((a, b) => (a.released! < b.released! ? -1 : 1))

  if (futuros.length > 0) {
    return Promise.all(futuros.slice(0, limite).map((j) => juegoAResultado(j, false)))
  }

  const sinFiltro = await llamarRawg<RawgSearchResponse>('/games', {
    search: expandido,
    page_size: '25',
  })

  const candidatos =
    sinFiltro.results.filter((j) => coincideTituloAproximado(expandido, j.name))
  const tba = candidatos
    .filter((j) => j.tba || !j.released)
    .sort((a, b) => (b.added ?? 0) - (a.added ?? 0))

  if (tba.length > 0) {
    return Promise.all(tba.slice(0, limite).map((j) => juegoAResultado(j, true)))
  }

  return []
}
