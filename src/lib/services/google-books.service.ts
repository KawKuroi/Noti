import type { ResultadoLanzamiento } from '@/types/release.types'
import { coincideTitulo } from '@/lib/utils/coincidencia-titulo'

interface GoogleBooksVolume {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    publishedDate?: string
    publisher?: string
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
  }
}

interface GoogleBooksResponse {
  totalItems: number
  items?: GoogleBooksVolume[]
}

function normalizarFecha(fecha: string): string {
  if (/^\d{4}$/.test(fecha)) return `${fecha}-01-01`
  if (/^\d{4}-\d{2}$/.test(fecha)) return `${fecha}-01`
  return fecha
}

function aResultado(
  libro: GoogleBooksVolume,
  fecha: string | null,
  tba: boolean,
): ResultadoLanzamiento {
  const { title, authors, imageLinks } = libro.volumeInfo
  return {
    fuente: 'google_books',
    tipo: 'book',
    titulo: title,
    fechaLanzamiento: fecha,
    tba: tba || undefined,
    googleBooksId: libro.id,
    autor: authors?.[0],
    posterUrl: imageLinks?.thumbnail ?? imageLinks?.smallThumbnail,
  }
}

async function consultar(query: string, params: Record<string, string> = {}): Promise<GoogleBooksVolume[]> {
  const url = new URL('https://www.googleapis.com/books/v1/volumes')
  url.searchParams.set('q', query)
  url.searchParams.set('maxResults', '20')
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const datos = (await res.json()) as GoogleBooksResponse
    return datos.items ?? []
  } catch {
    return []
  }
}

export async function candidatosLibro(
  titulo: string,
  autor?: string,
  limite = 5,
): Promise<ResultadoLanzamiento[]> {
  const query = autor
    ? `intitle:${encodeURIComponent(titulo)}+inauthor:${encodeURIComponent(autor)}`
    : `intitle:${encodeURIComponent(titulo)}`

  const items = await consultar(query, { orderBy: 'relevance' })
  if (items.length === 0) return []

  const coincidentes = items.filter((it) => coincideTitulo(titulo, it.volumeInfo.title))
  const pool = coincidentes.length > 0 ? coincidentes : items

  const candidatos: ResultadoLanzamiento[] = []
  for (const it of pool) {
    if (candidatos.length >= limite) break
    const pd = it.volumeInfo.publishedDate
    if (!pd) continue
    const norm = normalizarFecha(pd)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(norm)) continue
    const tba = !/^\d{4}-\d{2}-\d{2}$/.test(pd)
    candidatos.push(aResultado(it, norm, tba))
  }

  if (process.env.NODE_ENV !== 'production') console.log('[GoogleBooks/candidatos]', { titulo, autor, candidatos: candidatos.length })
  return candidatos
}

export async function buscarLibro(
  titulo: string,
  autor?: string,
): Promise<ResultadoLanzamiento | null> {
  const candidatos = await candidatosLibro(titulo, autor, 1)
  return candidatos[0] ?? null
}

export async function proximoLibro(autor: string, limite = 5): Promise<ResultadoLanzamiento[]> {
  const query = `inauthor:${encodeURIComponent(autor)}`
  const items = await consultar(query, { orderBy: 'newest' })
  if (items.length === 0) return []

  const hoy = new Date().toISOString().slice(0, 10)

  const conFecha = items
    .map((it) => {
      const pd = it.volumeInfo.publishedDate
      if (!pd) return null
      const norm = normalizarFecha(pd)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(norm)) return null
      return { item: it, fecha: norm, completa: /^\d{4}-\d{2}-\d{2}$/.test(pd) }
    })
    .filter((x): x is { item: GoogleBooksVolume; fecha: string; completa: boolean } => x !== null)

  const futuros = conFecha
    .filter((x) => x.fecha >= hoy)
    .sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
  const pasados = conFecha
    .filter((x) => x.fecha < hoy)
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))

  const ordenados = [...futuros, ...pasados].slice(0, limite)
  return ordenados.map((x) => aResultado(x.item, x.fecha, !x.completa))
}
