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

function aResultado(libro: GoogleBooksVolume, fecha: string | null, tba: boolean): ResultadoLanzamiento {
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

export async function buscarLibro(
  titulo: string,
  autor?: string,
): Promise<ResultadoLanzamiento | null> {
  const query = autor
    ? `intitle:${encodeURIComponent(titulo)}+inauthor:${encodeURIComponent(autor)}`
    : `intitle:${encodeURIComponent(titulo)}`

  const items = await consultar(query, { orderBy: 'relevance' })
  if (items.length === 0) return null

  const coincidentes = items.filter((it) => coincideTitulo(titulo, it.volumeInfo.title))
  const pool = coincidentes.length > 0 ? coincidentes : items

  const conFechaCompleta = pool.find((it) => {
    const pd = it.volumeInfo.publishedDate
    if (!pd) return false
    const norm = normalizarFecha(pd)
    return /^\d{4}-\d{2}-\d{2}$/.test(norm) && /^\d{4}-\d{2}-\d{2}$/.test(pd)
  })
  if (conFechaCompleta) {
    return aResultado(conFechaCompleta, conFechaCompleta.volumeInfo.publishedDate!, false)
  }

  const conFechaParcial = pool.find((it) => {
    const pd = it.volumeInfo.publishedDate
    if (!pd) return false
    const norm = normalizarFecha(pd)
    return /^\d{4}-\d{2}-\d{2}$/.test(norm)
  })
  if (conFechaParcial) {
    const fecha = normalizarFecha(conFechaParcial.volumeInfo.publishedDate!)
    return aResultado(conFechaParcial, fecha, true)
  }

  if (coincidentes.length > 0) {
    return aResultado(coincidentes[0], null, true)
  }

  return null
}

export async function proximoLibro(autor: string): Promise<ResultadoLanzamiento | null> {
  const query = `inauthor:${encodeURIComponent(autor)}`
  const items = await consultar(query, { orderBy: 'newest' })
  if (items.length === 0) return null

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
  if (futuros.length > 0) {
    const elegido = futuros[0]
    return aResultado(elegido.item, elegido.fecha, !elegido.completa)
  }

  const pasados = conFecha.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
  if (pasados.length > 0) {
    const elegido = pasados[0]
    return aResultado(elegido.item, elegido.fecha, !elegido.completa)
  }

  return null
}
