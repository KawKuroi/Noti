import { eq, and, desc, asc, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { recordatorios, categorias, notasEntradas } from '@/db/schema'
import type { CuadernoConPrevia, NotaEntrada } from '@/types/notas.types'

function mapearEntrada(fila: typeof notasEntradas.$inferSelect): NotaEntrada {
  return {
    id: fila.id,
    cuadernoId: fila.cuadernoId,
    contenido: fila.contenido,
    creadoEn: fila.creadoEn.toISOString(),
    actualizadoEn: fila.actualizadoEn.toISOString(),
  }
}

export async function obtenerCuadernos(usuarioId: string): Promise<CuadernoConPrevia[]> {
  const filasRecordatorios = await db
    .select({ recordatorio: recordatorios })
    .from(recordatorios)
    .innerJoin(categorias, eq(recordatorios.categoriaId, categorias.id))
    .where(and(eq(recordatorios.usuarioId, usuarioId), eq(categorias.slug, 'notes')))
    .orderBy(desc(recordatorios.actualizadoEn))

  if (filasRecordatorios.length === 0) return []

  const ids = filasRecordatorios.map((f) => f.recordatorio.id)

  const filasEntradas = await db
    .select()
    .from(notasEntradas)
    .where(inArray(notasEntradas.cuadernoId, ids))
    .orderBy(desc(notasEntradas.creadoEn))

  const entradasPorCuaderno = new Map<string, typeof filasEntradas>()
  for (const entrada of filasEntradas) {
    const lista = entradasPorCuaderno.get(entrada.cuadernoId) ?? []
    lista.push(entrada)
    entradasPorCuaderno.set(entrada.cuadernoId, lista)
  }

  return filasRecordatorios.map(({ recordatorio }) => {
    const entradas = entradasPorCuaderno.get(recordatorio.id) ?? []
    const ultimaEntrada = entradas[0] ? mapearEntrada(entradas[0]) : null
    return {
      id: recordatorio.id,
      titulo: recordatorio.titulo,
      creadoEn: recordatorio.creadoEn.toISOString(),
      actualizadoEn: recordatorio.actualizadoEn.toISOString(),
      ultimaEntrada,
      totalEntradas: entradas.length,
    }
  })
}

export async function obtenerEntradas(
  cuadernoId: string,
  usuarioId: string,
): Promise<NotaEntrada[]> {
  const filaCuaderno = await db
    .select({ id: recordatorios.id })
    .from(recordatorios)
    .where(and(eq(recordatorios.id, cuadernoId), eq(recordatorios.usuarioId, usuarioId)))
    .limit(1)

  if (!filaCuaderno[0]) return []

  const filas = await db
    .select()
    .from(notasEntradas)
    .where(eq(notasEntradas.cuadernoId, cuadernoId))
    .orderBy(asc(notasEntradas.creadoEn))

  return filas.map(mapearEntrada)
}
