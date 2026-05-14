import { eq, and, desc, asc } from 'drizzle-orm'
import { db } from '@/db'
import { recordatorios } from '@/db/schema'
import type { Recordatorio } from '@/types/reminder.types'

function mapearRecordatorio(fila: typeof recordatorios.$inferSelect): Recordatorio {
  return {
    id: fila.id,
    usuarioId: fila.usuarioId,
    categoriaId: fila.categoriaId,
    titulo: fila.titulo,
    descripcion: fila.descripcion,
    fechaVencimiento: fila.fechaVencimiento,
    notificarEn: fila.notificarEn,
    esRecurrente: fila.esRecurrente,
    reglaRecurrencia: fila.reglaRecurrencia,
    estaCompletado: fila.estaCompletado,
    tmdbId: fila.tmdbId,
    metadatos: fila.metadatos as Record<string, unknown> | null,
    creadoEn: fila.creadoEn,
    actualizadoEn: fila.actualizadoEn,
  }
}

export async function getRecordatoriosProximos(
  usuarioId: string,
  limite?: number,
): Promise<Recordatorio[]> {
  const filas = await db
    .select()
    .from(recordatorios)
    .where(
      and(
        eq(recordatorios.usuarioId, usuarioId),
        eq(recordatorios.estaCompletado, false),
      ),
    )
    .orderBy(asc(recordatorios.fechaVencimiento))
    .limit(limite ?? 50)

  return filas.map(mapearRecordatorio)
}

export async function getRecordatoriosPorCategoria(
  usuarioId: string,
  categoriaId: number,
): Promise<Recordatorio[]> {
  const filas = await db
    .select()
    .from(recordatorios)
    .where(
      and(
        eq(recordatorios.usuarioId, usuarioId),
        eq(recordatorios.categoriaId, categoriaId),
      ),
    )
    .orderBy(asc(recordatorios.fechaVencimiento))

  return filas.map(mapearRecordatorio)
}

export async function getRecordatorioPorId(
  usuarioId: string,
  id: string,
): Promise<Recordatorio | null> {
  const filas = await db
    .select()
    .from(recordatorios)
    .where(
      and(
        eq(recordatorios.id, id),
        eq(recordatorios.usuarioId, usuarioId),
      ),
    )
    .limit(1)

  return filas[0] ? mapearRecordatorio(filas[0]) : null
}

export async function getContadoresPorCategoria(
  usuarioId: string,
): Promise<Record<number, number>> {
  const filas = await db
    .select()
    .from(recordatorios)
    .where(
      and(
        eq(recordatorios.usuarioId, usuarioId),
        eq(recordatorios.estaCompletado, false),
      ),
    )

  const contadores: Record<number, number> = {}
  for (const fila of filas) {
    contadores[fila.categoriaId] = (contadores[fila.categoriaId] ?? 0) + 1
  }
  return contadores
}

export async function getRecordatoriosTodos(usuarioId: string): Promise<Recordatorio[]> {
  const filas = await db
    .select()
    .from(recordatorios)
    .where(eq(recordatorios.usuarioId, usuarioId))
    .orderBy(desc(recordatorios.creadoEn))

  return filas.map(mapearRecordatorio)
}
