import { eq, and, desc, asc, count, lte, gte, or, ilike, isNotNull } from 'drizzle-orm'
import { db } from '@/db'
import { recordatorios, categorias, perfiles } from '@/db/schema'
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
        isNotNull(recordatorios.fechaVencimiento),
      ),
    )
    .orderBy(asc(recordatorios.fechaVencimiento))
    .limit(limite ?? 50)

  return filas.map(mapearRecordatorio)
}

export async function getNotas(usuarioId: string): Promise<Recordatorio[]> {
  const filas = await db
    .select()
    .from(recordatorios)
    .innerJoin(categorias, eq(recordatorios.categoriaId, categorias.id))
    .where(
      and(
        eq(recordatorios.usuarioId, usuarioId),
        eq(categorias.slug, 'notes'),
      ),
    )
    .orderBy(desc(recordatorios.creadoEn))

  return filas.map((f) => mapearRecordatorio(f.reminders))
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
    .select({ categoriaId: recordatorios.categoriaId, cantidad: count() })
    .from(recordatorios)
    .where(
      and(
        eq(recordatorios.usuarioId, usuarioId),
        eq(recordatorios.estaCompletado, false),
      ),
    )
    .groupBy(recordatorios.categoriaId)

  const contadores: Record<number, number> = {}
  for (const fila of filas) {
    contadores[fila.categoriaId] = fila.cantidad
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

// Devuelve recordatorios no recurrentes cuya fechaVencimiento cae en [inicio, fin]
// y TODOS los recurrentes del usuario para que el cliente expanda ocurrencias en el rango.
export async function getRecordatoriosEnRango(
  usuarioId: string,
  inicio: Date,
  fin: Date,
): Promise<Recordatorio[]> {
  const filas = await db
    .select()
    .from(recordatorios)
    .where(
      and(
        eq(recordatorios.usuarioId, usuarioId),
        eq(recordatorios.estaCompletado, false),
        or(
          eq(recordatorios.esRecurrente, true),
          and(
            gte(recordatorios.fechaVencimiento, inicio),
            lte(recordatorios.fechaVencimiento, fin),
          ),
        ),
      ),
    )
    .orderBy(asc(recordatorios.fechaVencimiento))

  return filas.map(mapearRecordatorio)
}

export async function buscarRecordatorios(
  usuarioId: string,
  texto: string,
  limite = 10,
): Promise<Recordatorio[]> {
  const termino = `%${texto}%`
  const filas = await db
    .select()
    .from(recordatorios)
    .where(
      and(
        eq(recordatorios.usuarioId, usuarioId),
        eq(recordatorios.estaCompletado, false),
        or(
          ilike(recordatorios.titulo, termino),
          ilike(recordatorios.descripcion, termino),
        ),
      ),
    )
    .orderBy(asc(recordatorios.fechaVencimiento))
    .limit(limite)

  return filas.map(mapearRecordatorio)
}

export interface RecordatorioConAnticipacion extends Recordatorio {
  anticipacionNotificacion: number
}

// Devuelve recordatorios cuyo notify_at cayo en la ventana [ahora - ventanaMin, ahora]
// Se usa en el cron para saber que notificaciones enviar cada minuto
export async function getRecordatoriosANotificar(
  ahora: Date,
  ventanaMin = 1,
): Promise<RecordatorioConAnticipacion[]> {
  const limiteInferior = new Date(ahora.getTime() - ventanaMin * 60 * 1000)

  const filas = await db
    .select({
      id: recordatorios.id,
      usuarioId: recordatorios.usuarioId,
      categoriaId: recordatorios.categoriaId,
      titulo: recordatorios.titulo,
      descripcion: recordatorios.descripcion,
      fechaVencimiento: recordatorios.fechaVencimiento,
      notificarEn: recordatorios.notificarEn,
      esRecurrente: recordatorios.esRecurrente,
      reglaRecurrencia: recordatorios.reglaRecurrencia,
      estaCompletado: recordatorios.estaCompletado,
      tmdbId: recordatorios.tmdbId,
      metadatos: recordatorios.metadatos,
      creadoEn: recordatorios.creadoEn,
      actualizadoEn: recordatorios.actualizadoEn,
      anticipacionNotificacion: perfiles.anticipacionNotificacion,
    })
    .from(recordatorios)
    .innerJoin(perfiles, eq(recordatorios.usuarioId, perfiles.id))
    .where(
      and(
        isNotNull(recordatorios.notificarEn),
        lte(recordatorios.notificarEn, ahora),
        gte(recordatorios.notificarEn, limiteInferior),
        eq(recordatorios.estaCompletado, false),
      ),
    )
    .orderBy(asc(recordatorios.notificarEn))

  return filas.map((fila) => ({
    ...mapearRecordatorio(fila),
    anticipacionNotificacion: fila.anticipacionNotificacion,
  }))
}
