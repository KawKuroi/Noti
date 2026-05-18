import type { ResultadoLanzamiento } from '@/types/release.types'

interface GoogleBooksVolume {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    publishedDate?: string
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

export async function buscarLibro(
  titulo: string,
  autor?: string,
): Promise<ResultadoLanzamiento | null> {
  try {
    const terminos = autor
      ? `intitle:${encodeURIComponent(titulo)}+inauthor:${encodeURIComponent(autor)}`
      : `intitle:${encodeURIComponent(titulo)}`

    const url = `https://www.googleapis.com/books/v1/volumes?q=${terminos}&maxResults=1&orderBy=relevance`
    const res = await fetch(url, { next: { revalidate: 3600 } })

    if (!res.ok) return null

    const datos: GoogleBooksResponse = await res.json()
    if (!datos.items || datos.items.length === 0) return null

    const libro = datos.items[0]
    const { title, authors, publishedDate, imageLinks } = libro.volumeInfo

    if (!publishedDate) return null

    const fechaLanzamiento = normalizarFecha(publishedDate)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaLanzamiento)) return null

    return {
      fuente: 'google_books',
      tipo: 'book',
      titulo: title,
      fechaLanzamiento,
      googleBooksId: libro.id,
      autor: authors?.[0],
      posterUrl: imageLinks?.thumbnail ?? imageLinks?.smallThumbnail,
    }
  } catch {
    return null
  }
}
