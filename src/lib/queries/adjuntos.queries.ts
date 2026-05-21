import { eq, and, asc } from 'drizzle-orm'
import { db } from '@/db'
import { notasAdjuntos, recordatorios } from '@/db/schema'
import type { AdjuntoNota } from '@/types/notas.types'

function mapearAdjunto(fila: typeof notasAdjuntos.$inferSelect): AdjuntoNota {
  return {
    id: fila.id,
    cuadernoId: fila.cuadernoId,
    tipo: fila.tipo,
    url: fila.url,
    nombreArchivo: fila.nombreArchivo,
    mime: fila.mime,
    tamano: fila.tamano,
    creadoEn: fila.creadoEn.toISOString(),
  }
}

export async function obtenerAdjuntos(
  cuadernoId: string,
  usuarioId: string,
): Promise<AdjuntoNota[]> {
  const filaCuaderno = await db
    .select({ id: recordatorios.id })
    .from(recordatorios)
    .where(and(eq(recordatorios.id, cuadernoId), eq(recordatorios.usuarioId, usuarioId)))
    .limit(1)

  if (!filaCuaderno[0]) return []

  const filas = await db
    .select()
    .from(notasAdjuntos)
    .where(eq(notasAdjuntos.cuadernoId, cuadernoId))
    .orderBy(asc(notasAdjuntos.creadoEn))

  return filas.map(mapearAdjunto)
}
