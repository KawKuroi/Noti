import {
  buscarPelicula,
  buscarSerie,
  candidatosPelicula,
  candidatosSerie,
  proximaPelicula,
  proximaSerie,
} from './tmdb.service'
import { buscarJuego, candidatosJuego, proximoJuego } from './rawg.service'
import { buscarAlbum, candidatosAlbum, proximoAlbum } from './musicbrainz.service'
import { buscarLibro, candidatosLibro, proximoLibro } from './google-books.service'
import { coincideTitulo } from '@/lib/utils/coincidencia-titulo'
import type { ResultadoLanzamiento, TipoLanzamiento } from '@/types/release.types'
import type { Extraccion } from '@/lib/ai/extractor'

const PREFIJOS_INTERROGATIVOS = [
  /^cuando sale\s+/i,
  /^cuando estrena\s+/i,
  /^cuando se estrena\s+/i,
  /^cuando llega\s+/i,
  /^quiero saber la fecha de\s+/i,
  /^quiero la fecha de\s+/i,
  /^fecha de lanzamiento de\s+/i,
  /^when does\s+/i,
  /^when is\s+/i,
  /^release date of\s+/i,
]

const PALABRAS_RELLENO = [
  /\b(el|la|los|las)\s+(nuevo|nueva|nuevos|nuevas|proximo|proxima|proximos|proximas|ultimo|ultima|ultimos|ultimas)\s+/gi,
  /\b(nuevo|nueva|nuevos|nuevas|proximo|proxima|proximos|proximas|ultimo|ultima|ultimos|ultimas)\s+/gi,
  /^del?\s+/i,
]

export function limpiarTitulo(titulo: string): string {
  let limpio = titulo.trim()
  for (const regex of PREFIJOS_INTERROGATIVOS) {
    limpio = limpio.replace(regex, '')
  }
  for (const regex of PALABRAS_RELLENO) {
    limpio = limpio.replace(regex, ' ')
  }
  return limpio.replace(/\s+/g, ' ').trim()
}

type BusquedaFn = (titulo: string, artista?: string) => Promise<ResultadoLanzamiento | null>

const FUENTES_POR_TIPO: Record<TipoLanzamiento, BusquedaFn[]> = {
  movie: [buscarPelicula, (t) => buscarSerie(t)],
  tv: [buscarSerie, (t) => buscarPelicula(t)],
  game: [buscarJuego],
  album: [buscarAlbum],
  book: [buscarLibro],
}

export async function buscarLanzamiento(
  titulo: string,
  tipo: TipoLanzamiento,
  artista?: string,
): Promise<ResultadoLanzamiento | null> {
  const tituloLimpio = limpiarTitulo(titulo)
  if (!tituloLimpio) return null

  const fuentes = FUENTES_POR_TIPO[tipo] ?? []

  for (const fn of fuentes) {
    const resultado = await fn(tituloLimpio, artista)
    if (resultado) return resultado
  }
  return null
}

function calcularScore(
  candidato: ResultadoLanzamiento,
  tituloBuscado: string,
  tipoPreferido: TipoLanzamiento | null,
): number {
  let score = 0
  if (candidato.fechaLanzamiento && !candidato.tba) score += 3
  if (candidato.fechaLanzamiento && candidato.fechaLanzamiento >= new Date().toISOString().slice(0, 10)) {
    score += 2
  }
  if (tituloBuscado && coincideTitulo(tituloBuscado, candidato.titulo)) {
    score += 1
  }
  if (tipoPreferido && candidato.tipo === tipoPreferido) {
    score += 0.5
  }
  return score
}

function deduplicar(candidatos: ResultadoLanzamiento[]): ResultadoLanzamiento[] {
  const vistos = new Set<string>()
  const unicos: ResultadoLanzamiento[] = []
  for (const c of candidatos) {
    const clave = c.tmdbId
      ? `tmdb:${c.tmdbId}`
      : c.rawgId
        ? `rawg:${c.rawgId}`
        : c.musicbrainzId
          ? `mb:${c.musicbrainzId}`
          : c.googleBooksId
            ? `gb:${c.googleBooksId}`
            : `${c.fuente}:${c.titulo}`
    if (vistos.has(clave)) continue
    vistos.add(clave)
    unicos.push(c)
  }
  return unicos
}

async function obtenerCandidatosPorTipo(
  tipo: TipoLanzamiento,
  titulo: string,
  artista: string | null,
  limite: number,
): Promise<ResultadoLanzamiento[]> {
  switch (tipo) {
    case 'movie':
      return candidatosPelicula(titulo, limite)
    case 'tv':
      return candidatosSerie(titulo, limite)
    case 'game':
      return candidatosJuego(titulo, limite)
    case 'album':
      return candidatosAlbum(titulo, artista ?? undefined, limite)
    case 'book':
      return candidatosLibro(titulo, artista ?? undefined, limite)
  }
}

async function obtenerProximosPorTipo(
  tipo: TipoLanzamiento,
  contexto: string,
  limite: number,
): Promise<ResultadoLanzamiento[]> {
  switch (tipo) {
    case 'movie':
      return proximaPelicula(contexto, limite)
    case 'tv':
      return proximaSerie(contexto, limite)
    case 'game':
      return proximoJuego(contexto, limite)
    case 'album':
      return proximoAlbum(contexto, limite)
    case 'book':
      return proximoLibro(contexto, limite)
  }
}

export async function obtenerCandidatos(extraccion: Extraccion): Promise<ResultadoLanzamiento[]> {
  if (extraccion.intencion === 'recordatorio_personal' || extraccion.intencion === 'desconocido') {
    return []
  }
  if (!extraccion.lanzamiento) return []

  const { tipo, titulo, contexto, artista } = extraccion.lanzamiento
  const limitePorFuente = 5
  const limiteFinal = 5

  let candidatos: ResultadoLanzamiento[] = []

  if (extraccion.intencion === 'lanzamiento_generico') {
    const consulta = contexto ?? titulo ?? ''
    if (!consulta.trim()) return []
    const consultaLimpia = limpiarTitulo(consulta)

    if (tipo) {
      candidatos = await obtenerProximosPorTipo(tipo, consultaLimpia, limitePorFuente)
    } else {
      const todos = await Promise.all([
        proximaPelicula(consultaLimpia, 3),
        proximaSerie(consultaLimpia, 3),
        proximoJuego(consultaLimpia, 3),
        proximoAlbum(consultaLimpia, 3),
        proximoLibro(consultaLimpia, 3),
      ])
      candidatos = todos.flat()
    }
  } else {
    const consulta = titulo ?? contexto ?? ''
    if (!consulta.trim()) return []
    const consultaLimpia = limpiarTitulo(consulta)

    if (tipo) {
      candidatos = await obtenerCandidatosPorTipo(tipo, consultaLimpia, artista, limitePorFuente)
    } else {
      const todos = await Promise.all([
        candidatosPelicula(consultaLimpia, 3),
        candidatosSerie(consultaLimpia, 3),
        candidatosJuego(consultaLimpia, 3),
        candidatosAlbum(consultaLimpia, artista ?? undefined, 3),
        candidatosLibro(consultaLimpia, artista ?? undefined, 3),
      ])
      candidatos = todos.flat()
    }
  }

  const tituloRanking = titulo ?? contexto ?? ''
  const unicos = deduplicar(candidatos)
  const rankeados = unicos
    .map((c) => ({ c, score: calcularScore(c, tituloRanking, tipo) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limiteFinal)
    .map((x) => x.c)

  if (process.env.NODE_ENV !== 'production') {
    console.log('[release-search/obtenerCandidatos]', {
      intencion: extraccion.intencion,
      tipo,
      devueltos: rankeados.length,
      totalUnicos: unicos.length,
    })
  }

  return rankeados
}

export async function buscarProximoLanzamiento(
  tipo: TipoLanzamiento,
  contexto: string,
): Promise<ResultadoLanzamiento | null> {
  const limpio = limpiarTitulo(contexto)
  if (!limpio) return null
  const candidatos = await obtenerProximosPorTipo(tipo, limpio, 1)
  return candidatos[0] ?? null
}
