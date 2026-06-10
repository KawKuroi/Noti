import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  limpiarTitulo,
  calcularScore,
  deduplicar,
  obtenerCandidatosDetallado,
} from '@/lib/services/release-search.service'
import type { ResultadoLanzamiento } from '@/types/release.types'
import type { Extraccion } from '@/lib/ai/extractor'

// Se mockean las cuatro fuentes externas: aqui solo se prueba la orquestacion
// (allSettled, ranking, dedup), no las integraciones reales.
vi.mock('@/lib/services/tmdb.service', () => ({
  candidatosPelicula: vi.fn(),
  candidatosSerie: vi.fn(),
  proximaPelicula: vi.fn(),
  proximaSerie: vi.fn(),
}))
vi.mock('@/lib/services/rawg.service', () => ({
  candidatosJuego: vi.fn(),
  proximoJuego: vi.fn(),
}))
vi.mock('@/lib/services/musicbrainz.service', () => ({
  candidatosAlbum: vi.fn(),
  proximoAlbum: vi.fn(),
}))
vi.mock('@/lib/services/google-books.service', () => ({
  candidatosLibro: vi.fn(),
  proximoLibro: vi.fn(),
}))

import { candidatosPelicula, candidatosSerie, proximaPelicula, proximaSerie } from '@/lib/services/tmdb.service'
import { candidatosJuego, proximoJuego } from '@/lib/services/rawg.service'
import { candidatosAlbum, proximoAlbum } from '@/lib/services/musicbrainz.service'
import { candidatosLibro, proximoLibro } from '@/lib/services/google-books.service'

function crearCandidato(parcial: Partial<ResultadoLanzamiento>): ResultadoLanzamiento {
  return {
    fuente: 'tmdb',
    tipo: 'movie',
    titulo: 'Pelicula generica',
    fechaLanzamiento: null,
    ...parcial,
  }
}

function crearExtraccion(parcial: Partial<Extraccion>): Extraccion {
  return {
    intencion: 'lanzamiento_especifico',
    recordatorio: null,
    lanzamiento: null,
    aclaracion: null,
    ...parcial,
  }
}

describe('limpiarTitulo', () => {
  it('quita prefijos interrogativos en espanol', () => {
    expect(limpiarTitulo('cuando sale GTA 6')).toBe('GTA 6')
    expect(limpiarTitulo('fecha de lanzamiento de Avatar 4')).toBe('Avatar 4')
  })

  it('quita prefijos interrogativos en ingles', () => {
    expect(limpiarTitulo('when does Hollow Knight')).toBe('Hollow Knight')
  })

  it('quita palabras de relleno como "el nuevo" o "proximo"', () => {
    expect(limpiarTitulo('el nuevo album de The Weeknd')).toBe('album de The Weeknd')
    expect(limpiarTitulo('proximo Zelda')).toBe('Zelda')
  })

  it('colapsa espacios y recorta extremos', () => {
    expect(limpiarTitulo('  cuando estrena   Dune   ')).toBe('Dune')
  })

  it('deja intacto un titulo limpio', () => {
    expect(limpiarTitulo('Elden Ring')).toBe('Elden Ring')
  })
})

describe('calcularScore', () => {
  it('premia tener fecha confirmada y futura', () => {
    const conFecha = crearCandidato({ titulo: 'X', fechaLanzamiento: '2099-01-01' })
    const sinFecha = crearCandidato({ titulo: 'X', fechaLanzamiento: null })
    expect(calcularScore(conFecha, 'X', null)).toBeGreaterThan(calcularScore(sinFecha, 'X', null))
  })

  it('una fecha pasada vale menos que una futura', () => {
    const futura = crearCandidato({ fechaLanzamiento: '2099-01-01' })
    const pasada = crearCandidato({ fechaLanzamiento: '2000-01-01' })
    expect(calcularScore(futura, '', null)).toBeGreaterThan(calcularScore(pasada, '', null))
  })

  it('un TBA no recibe el bono de fecha confirmada', () => {
    const tba = crearCandidato({ fechaLanzamiento: '2099-01-01', tba: true })
    const confirmado = crearCandidato({ fechaLanzamiento: '2099-01-01' })
    expect(calcularScore(confirmado, '', null)).toBeGreaterThan(calcularScore(tba, '', null))
  })

  it('premia la coincidencia exacta de titulo', () => {
    const exacto = crearCandidato({ titulo: 'Elden Ring' })
    const distinto = crearCandidato({ titulo: 'Otra Cosa Total' })
    expect(calcularScore(exacto, 'Elden Ring', null)).toBeGreaterThan(
      calcularScore(distinto, 'Elden Ring', null),
    )
  })

  it('da credito parcial por similitud fuzzy cuando no hay match exacto', () => {
    const typo = crearCandidato({ titulo: 'Eldenn Ring' })
    const distinto = crearCandidato({ titulo: 'Otra Cosa Total' })
    expect(calcularScore(typo, 'Elden Ring', null)).toBeGreaterThan(
      calcularScore(distinto, 'Elden Ring', null),
    )
  })

  it('premia el tipo preferido', () => {
    const juego = crearCandidato({ tipo: 'game', titulo: 'X' })
    const pelicula = crearCandidato({ tipo: 'movie', titulo: 'X' })
    expect(calcularScore(juego, 'X', 'game')).toBeGreaterThan(calcularScore(pelicula, 'X', 'game'))
  })

  it('usa la popularidad como desempate', () => {
    const popular = crearCandidato({ titulo: 'X', popularidad: 0.9 })
    const nicho = crearCandidato({ titulo: 'X', popularidad: 0.1 })
    expect(calcularScore(popular, 'X', null)).toBeGreaterThan(calcularScore(nicho, 'X', null))
  })
})

describe('deduplicar', () => {
  it('elimina duplicados por tmdbId conservando el primero', () => {
    const a = crearCandidato({ titulo: 'A', tmdbId: 1 })
    const b = crearCandidato({ titulo: 'B (duplicado)', tmdbId: 1 })
    const resultado = deduplicar([a, b])
    expect(resultado).toHaveLength(1)
    expect(resultado[0].titulo).toBe('A')
  })

  it('deduplica por rawgId, musicbrainzId y googleBooksId', () => {
    const juegos = [
      crearCandidato({ fuente: 'rawg', tipo: 'game', rawgId: 7 }),
      crearCandidato({ fuente: 'rawg', tipo: 'game', rawgId: 7 }),
      crearCandidato({ fuente: 'musicbrainz', tipo: 'album', musicbrainzId: 'mb-1' }),
      crearCandidato({ fuente: 'musicbrainz', tipo: 'album', musicbrainzId: 'mb-1' }),
      crearCandidato({ fuente: 'google_books', tipo: 'book', googleBooksId: 'gb-1' }),
      crearCandidato({ fuente: 'google_books', tipo: 'book', googleBooksId: 'gb-1' }),
    ]
    expect(deduplicar(juegos)).toHaveLength(3)
  })

  it('sin id externo usa fuente+titulo como clave', () => {
    const a = crearCandidato({ fuente: 'manual', titulo: 'Mismo Titulo' })
    const b = crearCandidato({ fuente: 'manual', titulo: 'Mismo Titulo' })
    const c = crearCandidato({ fuente: 'manual', titulo: 'Otro Titulo' })
    expect(deduplicar([a, b, c])).toHaveLength(2)
  })

  it('ids distintos no se confunden entre fuentes', () => {
    const a = crearCandidato({ tmdbId: 1 })
    const b = crearCandidato({ fuente: 'rawg', tipo: 'game', rawgId: 1 })
    expect(deduplicar([a, b])).toHaveLength(2)
  })

  it('devuelve vacio para entrada vacia', () => {
    expect(deduplicar([])).toEqual([])
  })
})

describe('obtenerCandidatosDetallado', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('devuelve vacio para recordatorio_personal y desconocido', async () => {
    for (const intencion of ['recordatorio_personal', 'desconocido'] as const) {
      const resultado = await obtenerCandidatosDetallado(crearExtraccion({ intencion }))
      expect(resultado).toEqual({ candidatos: [], fuentesFallidas: [] })
    }
    expect(candidatosPelicula).not.toHaveBeenCalled()
  })

  it('devuelve vacio sin objeto lanzamiento o sin consulta', async () => {
    const sinLanzamiento = await obtenerCandidatosDetallado(crearExtraccion({}))
    expect(sinLanzamiento.candidatos).toEqual([])

    const sinConsulta = await obtenerCandidatosDetallado(
      crearExtraccion({
        lanzamiento: { tipo: 'game', titulo: '   ', contexto: null, artista: null, fechaTentativa: null },
      }),
    )
    expect(sinConsulta.candidatos).toEqual([])
  })

  it('con tipo definido consulta solo esa fuente', async () => {
    vi.mocked(candidatosJuego).mockResolvedValue([
      crearCandidato({ fuente: 'rawg', tipo: 'game', titulo: 'GTA 6', rawgId: 1 }),
    ])

    const resultado = await obtenerCandidatosDetallado(
      crearExtraccion({
        lanzamiento: { tipo: 'game', titulo: 'GTA 6', contexto: null, artista: null, fechaTentativa: null },
      }),
    )

    expect(resultado.candidatos).toHaveLength(1)
    expect(resultado.fuentesFallidas).toEqual([])
    expect(candidatosJuego).toHaveBeenCalledWith('GTA 6', 5)
    expect(candidatosPelicula).not.toHaveBeenCalled()
  })

  it('sin tipo consulta las cinco fuentes y mezcla resultados', async () => {
    vi.mocked(candidatosPelicula).mockResolvedValue([crearCandidato({ titulo: 'Dune', tmdbId: 1 })])
    vi.mocked(candidatosSerie).mockResolvedValue([])
    vi.mocked(candidatosJuego).mockResolvedValue([
      crearCandidato({ fuente: 'rawg', tipo: 'game', titulo: 'Dune Awakening', rawgId: 2 }),
    ])
    vi.mocked(candidatosAlbum).mockResolvedValue([])
    vi.mocked(candidatosLibro).mockResolvedValue([])

    const resultado = await obtenerCandidatosDetallado(
      crearExtraccion({
        lanzamiento: { tipo: null, titulo: 'Dune', contexto: null, artista: null, fechaTentativa: null },
      }),
    )

    expect(resultado.candidatos).toHaveLength(2)
    expect(candidatosPelicula).toHaveBeenCalled()
    expect(candidatosSerie).toHaveBeenCalled()
    expect(candidatosJuego).toHaveBeenCalled()
    expect(candidatosAlbum).toHaveBeenCalled()
    expect(candidatosLibro).toHaveBeenCalled()
  })

  it('una fuente caida no tumba la busqueda y queda en fuentesFallidas', async () => {
    vi.mocked(candidatosPelicula).mockResolvedValue([crearCandidato({ titulo: 'Avatar 4', tmdbId: 9 })])
    vi.mocked(candidatosSerie).mockRejectedValue(new Error('TMDB caido'))
    vi.mocked(candidatosJuego).mockRejectedValue(new Error('RAWG sin API key'))
    vi.mocked(candidatosAlbum).mockResolvedValue([])
    vi.mocked(candidatosLibro).mockResolvedValue([])

    const resultado = await obtenerCandidatosDetallado(
      crearExtraccion({
        lanzamiento: { tipo: null, titulo: 'Avatar 4', contexto: null, artista: null, fechaTentativa: null },
      }),
    )

    expect(resultado.candidatos).toHaveLength(1)
    expect(resultado.fuentesFallidas).toEqual(['series', 'videojuegos'])
  })

  it('lanzamiento_generico usa el contexto y las funciones de "proximos"', async () => {
    vi.mocked(proximoAlbum).mockResolvedValue([
      crearCandidato({ fuente: 'musicbrainz', tipo: 'album', titulo: 'Album X', musicbrainzId: 'mb-9' }),
    ])

    const resultado = await obtenerCandidatosDetallado(
      crearExtraccion({
        intencion: 'lanzamiento_generico',
        lanzamiento: { tipo: 'album', titulo: null, contexto: 'el nuevo album de The Weeknd', artista: null, fechaTentativa: null },
      }),
    )

    expect(proximoAlbum).toHaveBeenCalledWith('album de The Weeknd', 5)
    expect(resultado.candidatos).toHaveLength(1)
  })

  it('lanzamiento_generico sin tipo consulta los proximos de las cinco fuentes', async () => {
    vi.mocked(proximaPelicula).mockResolvedValue([])
    vi.mocked(proximaSerie).mockResolvedValue([])
    vi.mocked(proximoJuego).mockResolvedValue([])
    vi.mocked(proximoAlbum).mockResolvedValue([])
    vi.mocked(proximoLibro).mockResolvedValue([])

    await obtenerCandidatosDetallado(
      crearExtraccion({
        intencion: 'lanzamiento_generico',
        lanzamiento: { tipo: null, titulo: null, contexto: 'Zelda', artista: null, fechaTentativa: null },
      }),
    )

    expect(proximaPelicula).toHaveBeenCalledWith('Zelda', 3)
    expect(proximoJuego).toHaveBeenCalledWith('Zelda', 3)
  })

  it('rankea primero el mejor match y limita a 5 candidatos', async () => {
    const relleno = Array.from({ length: 6 }, (_, i) =>
      crearCandidato({ titulo: `Relleno ${i}`, tmdbId: 100 + i }),
    )
    const mejor = crearCandidato({
      titulo: 'Dune Part Three',
      tmdbId: 1,
      fechaLanzamiento: '2099-01-01',
    })
    vi.mocked(candidatosPelicula).mockResolvedValue([...relleno, mejor])

    const resultado = await obtenerCandidatosDetallado(
      crearExtraccion({
        lanzamiento: { tipo: 'movie', titulo: 'Dune Part Three', contexto: null, artista: null, fechaTentativa: null },
      }),
    )

    expect(resultado.candidatos).toHaveLength(5)
    expect(resultado.candidatos[0].titulo).toBe('Dune Part Three')
  })

  it('deduplica entre fuentes antes de rankear', async () => {
    const duplicado = crearCandidato({ titulo: 'Dune', tmdbId: 1 })
    vi.mocked(candidatosPelicula).mockResolvedValue([duplicado, { ...duplicado }])
    vi.mocked(candidatosSerie).mockResolvedValue([])
    vi.mocked(candidatosJuego).mockResolvedValue([])
    vi.mocked(candidatosAlbum).mockResolvedValue([])
    vi.mocked(candidatosLibro).mockResolvedValue([])

    const resultado = await obtenerCandidatosDetallado(
      crearExtraccion({
        lanzamiento: { tipo: null, titulo: 'Dune', contexto: null, artista: null, fechaTentativa: null },
      }),
    )

    expect(resultado.candidatos).toHaveLength(1)
  })
})
