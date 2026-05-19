import type { ResultadoLanzamiento } from '@/types/release.types'
import {
  coincideTitulo,
  tieneNumeralCoincidente,
  arabeARomano,
  romanoAArabe,
} from '@/lib/utils/coincidencia-titulo'

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
    page_size: '15',
    search_precise: 'true',
  })
  if (precisa && precisa.results.length > 0) return precisa.results

  const relajada = await llamarRawg<RawgSearchResponse>('/games', {
    search: termino,
    page_size: '15',
  })
  return relajada && relajada.results.length > 0 ? relajada.results : null
}

function elegirMejorJuego(
  resultados: RawgGame[],
  tituloOriginal: string,
): { juego: RawgGame; esTba: boolean } | null {
  const coincidentes = resultados.filter(
    (j) =>
      coincideTitulo(tituloOriginal, j.name) &&
      tieneNumeralCoincidente(tituloOriginal, j.name),
  )

  const pool = coincidentes.length > 0 ? coincidentes : resultados

  const conFecha = pool.filter((j) => j.released && !j.tba)
  if (conFecha.length > 0) {
    const ordenado = [...conFecha].sort((a, b) => (b.added ?? 0) - (a.added ?? 0))
    return { juego: ordenado[0], esTba: false }
  }

  if (coincidentes.length === 0) return null

  const ordenado = [...pool].sort((a, b) => (b.added ?? 0) - (a.added ?? 0))
  return { juego: ordenado[0], esTba: true }
}

async function construirResultado(
  base: RawgGame,
  esTba: boolean,
): Promise<ResultadoLanzamiento> {
  const detalle = await llamarRawg<RawgGameDetail>(`/games/${base.id}`)
  const descripcionBase = detalle?.description_raw?.slice(0, 500)

  const fechaLanzamiento = !esTba && base.released ? base.released.slice(0, 10) : null
  const plataformasArray = detalle?.platforms?.map((p) => p.platform.name) ?? []
  const plataforma =
    plataformasArray.length > 0
      ? plataformasArray.slice(0, 3).join(', ') + (plataformasArray.length > 3 ? '...' : '')
      : undefined

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
  }
}

export async function buscarJuego(titulo: string): Promise<ResultadoLanzamiento | null> {
  const expandido = expandirAlias(titulo)
  const terminos = new Set<string>([
    ...variantesNumerales(expandido),
    ...variantesNumerales(titulo),
  ])

  let mejor: { juego: RawgGame; esTba: boolean } | null = null

  for (const termino of terminos) {
    const resultados = await buscarTermino(termino)
    if (!resultados || resultados.length === 0) continue

    const elegido = elegirMejorJuego(resultados, expandido)
    if (elegido) {
      if (!elegido.esTba) {
        mejor = elegido
        break
      }
      if (!mejor) mejor = elegido
    }
  }

  if (!mejor) return null

  console.log('[RAWG]', {
    titulo,
    encontrado: mejor.juego.name,
    tba: mejor.esTba,
    fecha: mejor.juego.released,
  })

  return construirResultado(mejor.juego, mejor.esTba)
}

export async function proximoJuego(franquicia: string): Promise<ResultadoLanzamiento | null> {
  const expandido = expandirAlias(franquicia)
  const hoy = new Date().toISOString().slice(0, 10)
  const limiteFuturo = new Date()
  limiteFuturo.setFullYear(limiteFuturo.getFullYear() + 5)
  const limiteIso = limiteFuturo.toISOString().slice(0, 10)

  const conFiltro = await llamarRawg<RawgSearchResponse>('/games', {
    search: expandido,
    page_size: '20',
    dates: `${hoy},${limiteIso}`,
    ordering: '-added',
  })

  const coincidentes =
    conFiltro?.results.filter((j) => coincideTitulo(expandido, j.name)) ?? []

  if (coincidentes.length > 0) {
    const conFechaFutura = coincidentes
      .filter((j) => j.released && j.released >= hoy && !j.tba)
      .sort((a, b) => (a.released! < b.released! ? -1 : 1))
    if (conFechaFutura.length > 0) {
      return construirResultado(conFechaFutura[0], false)
    }
  }

  const sinFiltro = await llamarRawg<RawgSearchResponse>('/games', {
    search: expandido,
    page_size: '20',
  })

  const candidatos =
    sinFiltro?.results.filter((j) => coincideTitulo(expandido, j.name)) ?? []

  const tba = candidatos
    .filter((j) => j.tba || !j.released)
    .sort((a, b) => (b.added ?? 0) - (a.added ?? 0))[0]

  if (tba) {
    return construirResultado(tba, true)
  }

  return null
}
