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
import { coincideTitulo, similitudDice } from '@/lib/utils/coincidencia-titulo'
import type { ResultadoLanzamiento, TipoLanzamiento } from '@/types/release.types'
import type { Extraccion } from '@/lib/ai/extractor'

// Etiquetas visibles al usuario cuando una fuente falla ("No pude consultar X").
const ETIQUETA_FUENTE: Record<TipoLanzamiento, string> = {
  movie: 'peliculas',
  tv: 'series',
  game: 'videojuegos',
  album: 'musica',
  book: 'libros',
}

export interface ResultadoBusquedaCandidatos {
  candidatos: ResultadoLanzamiento[]
  // Fuentes que lanzaron error (API caida, key ausente, timeout). Distinto de
  // "sin resultados": permite avisar al usuario en lugar de callar.
  fuentesFallidas: string[]
}

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
    // Los servicios lanzan ante fallo de API; aqui una fuente caida no debe
    // impedir probar la siguiente.
    try {
      const resultado = await fn(tituloLimpio, artista)
      if (resultado) return resultado
    } catch (e) {
      console.error('[release-search/buscarLanzamiento] fuente fallo:', e)
    }
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
  // Coincidencia de titulo en dos niveles: exacta por tokens (+1) o
  // aproximada por similitud de bigramas (proporcional, max +1).
  if (tituloBuscado) {
    if (coincideTitulo(tituloBuscado, candidato.titulo)) {
      score += 1
    } else {
      score += Math.max(0, similitudDice(tituloBuscado, candidato.titulo) - 0.5)
    }
  }
  if (tipoPreferido && candidato.tipo === tipoPreferido) {
    score += 0.5
  }
  // Popularidad normalizada [0,1] como desempate entre matches equivalentes.
  score += candidato.popularidad ?? 0
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

// Ejecuta las busquedas etiquetadas por fuente con allSettled: una fuente
// caida (API key ausente, timeout, 5xx) no tumba la busqueda completa y queda
// reportada en fuentesFallidas.
async function recolectarFuentes(
  consultas: Array<{ tipo: TipoLanzamiento; promesa: Promise<ResultadoLanzamiento[]> }>,
): Promise<ResultadoBusquedaCandidatos> {
  const resultados = await Promise.allSettled(consultas.map((c) => c.promesa))
  const candidatos: ResultadoLanzamiento[] = []
  const fuentesFallidas: string[] = []

  resultados.forEach((resultado, i) => {
    if (resultado.status === 'fulfilled') {
      candidatos.push(...resultado.value)
    } else {
      fuentesFallidas.push(ETIQUETA_FUENTE[consultas[i].tipo])
      console.error(
        `[release-search] fuente "${consultas[i].tipo}" fallo:`,
        resultado.reason,
      )
    }
  })

  return { candidatos, fuentesFallidas }
}

export async function obtenerCandidatosDetallado(
  extraccion: Extraccion,
): Promise<ResultadoBusquedaCandidatos> {
  const vacio: ResultadoBusquedaCandidatos = { candidatos: [], fuentesFallidas: [] }

  if (extraccion.intencion === 'recordatorio_personal' || extraccion.intencion === 'desconocido') {
    return vacio
  }
  if (!extraccion.lanzamiento) return vacio

  const { tipo, titulo, contexto, artista } = extraccion.lanzamiento
  const limitePorFuente = 5
  const limiteFinal = 5

  const esGenerico = extraccion.intencion === 'lanzamiento_generico'
  const consulta = esGenerico ? (contexto ?? titulo ?? '') : (titulo ?? contexto ?? '')
  if (!consulta.trim()) return vacio
  const consultaLimpia = limpiarTitulo(consulta)

  let recolectado: ResultadoBusquedaCandidatos

  if (tipo) {
    recolectado = await recolectarFuentes([
      {
        tipo,
        promesa: esGenerico
          ? obtenerProximosPorTipo(tipo, consultaLimpia, limitePorFuente)
          : obtenerCandidatosPorTipo(tipo, consultaLimpia, artista, limitePorFuente),
      },
    ])
  } else if (esGenerico) {
    recolectado = await recolectarFuentes([
      { tipo: 'movie', promesa: proximaPelicula(consultaLimpia, 3) },
      { tipo: 'tv', promesa: proximaSerie(consultaLimpia, 3) },
      { tipo: 'game', promesa: proximoJuego(consultaLimpia, 3) },
      { tipo: 'album', promesa: proximoAlbum(consultaLimpia, 3) },
      { tipo: 'book', promesa: proximoLibro(consultaLimpia, 3) },
    ])
  } else {
    recolectado = await recolectarFuentes([
      { tipo: 'movie', promesa: candidatosPelicula(consultaLimpia, 3) },
      { tipo: 'tv', promesa: candidatosSerie(consultaLimpia, 3) },
      { tipo: 'game', promesa: candidatosJuego(consultaLimpia, 3) },
      { tipo: 'album', promesa: candidatosAlbum(consultaLimpia, artista ?? undefined, 3) },
      { tipo: 'book', promesa: candidatosLibro(consultaLimpia, artista ?? undefined, 3) },
    ])
  }

  const tituloRanking = titulo ?? contexto ?? ''
  const unicos = deduplicar(recolectado.candidatos)
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
      fuentesFallidas: recolectado.fuentesFallidas,
    })
  }

  return { candidatos: rankeados, fuentesFallidas: recolectado.fuentesFallidas }
}

export async function obtenerCandidatos(extraccion: Extraccion): Promise<ResultadoLanzamiento[]> {
  const { candidatos } = await obtenerCandidatosDetallado(extraccion)
  return candidatos
}

export async function buscarProximoLanzamiento(
  tipo: TipoLanzamiento,
  contexto: string,
): Promise<ResultadoLanzamiento | null> {
  const limpio = limpiarTitulo(contexto)
  if (!limpio) return null
  try {
    const candidatos = await obtenerProximosPorTipo(tipo, limpio, 1)
    return candidatos[0] ?? null
  } catch (e) {
    console.error('[release-search/buscarProximoLanzamiento] fuente fallo:', e)
    return null
  }
}
