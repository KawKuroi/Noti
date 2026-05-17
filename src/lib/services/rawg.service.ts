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
}

function obtenerApiKey(): string {
  const apiKey = process.env.RAWG_API_KEY
  if (!apiKey) {
    throw new Error('RAWG_API_KEY no configurada')
  }
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

export async function buscarJuego(titulo: string): Promise<ResultadoLanzamiento | null> {
  const busqueda = await llamarRawg<RawgSearchResponse>('/games', {
    search: titulo,
    page_size: '5',
    search_precise: 'true',
  })
  if (!busqueda || busqueda.results.length === 0) return null

  const conFecha = busqueda.results.filter((j) => j.released && !j.tba)
  const candidatos = conFecha.length > 0 ? conFecha : busqueda.results
  const mejor = [...candidatos].sort((a, b) => (b.added ?? 0) - (a.added ?? 0))[0]
  if (!mejor || !mejor.released) return null

  const detalle = await llamarRawg<RawgGameDetail>(`/games/${mejor.id}`)
  const descripcion = detalle?.description_raw?.slice(0, 500)

  return {
    fuente: 'rawg',
    tipo: 'game',
    titulo: mejor.name,
    fechaLanzamiento: mejor.released.slice(0, 10),
    rawgId: mejor.id,
    posterUrl: mejor.background_image ?? undefined,
    descripcion,
  }
}
