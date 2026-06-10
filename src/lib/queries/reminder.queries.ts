import { eq, and, desc, asc, count, lte, gte, or, ilike, isNotNull, isNull, sql, type SQL } from 'drizzle-orm'
import { db } from '@/db'
import { recordatorios, categorias, perfiles } from '@/db/schema'
import type { Recordatorio, OrdenamientoRecordatorio } from '@/types/reminder.types'

function obtenerOrden(ordenamiento: OrdenamientoRecordatorio): SQL[] {
  switch (ordenamiento) {
    case 'fecha-asc':
      return [asc(recordatorios.fechaVencimiento)]
    case 'fecha-desc':
      return [desc(recordatorios.fechaVencimiento)]
    case 'reciente':
      return [desc(recordatorios.creadoEn)]
    case 'estado':
      return [asc(recordatorios.estaCompletado), asc(recordatorios.fechaVencimiento)]
    default:
      return [asc(recordatorios.fechaVencimiento)]
  }
}

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
    completadoEn: fila.completadoEn,
    eliminadoEn: fila.eliminadoEn,
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
        isNull(recordatorios.eliminadoEn),
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
        isNull(recordatorios.eliminadoEn),
      ),
    )
    .orderBy(asc(recordatorios.fechaVencimiento))

  return filas.map(mapearRecordatorio)
}

export async function getRecordatoriosPorCategoriaPaginados(
  usuarioId: string,
  categoriaId: number,
  limite: number,
  desplazamiento: number,
  ordenamiento: OrdenamientoRecordatorio,
): Promise<{ recordatorios: Recordatorio[]; hasMas: boolean }> {
  const filas = await db
    .select()
    .from(recordatorios)
    .where(
      and(
        eq(recordatorios.usuarioId, usuarioId),
        eq(recordatorios.categoriaId, categoriaId),
        isNull(recordatorios.eliminadoEn),
      ),
    )
    .orderBy(...obtenerOrden(ordenamiento))
    .limit(limite + 1)
    .offset(desplazamiento)

  return {
    recordatorios: filas.slice(0, limite).map(mapearRecordatorio),
    hasMas: filas.length > limite,
  }
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
        isNull(recordatorios.eliminadoEn),
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
        isNull(recordatorios.eliminadoEn),
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
    .where(
      and(
        eq(recordatorios.usuarioId, usuarioId),
        isNull(recordatorios.eliminadoEn),
      ),
    )
    .orderBy(desc(recordatorios.creadoEn))

  return filas.map(mapearRecordatorio)
}

export async function getLanzamientosTodos(usuarioId: string): Promise<Recordatorio[]> {
  const SLUGS = ['movies', 'tv', 'games', 'music', 'books']
  const filas = await db
    .select({ recordatorio: recordatorios })
    .from(recordatorios)
    .innerJoin(categorias, eq(recordatorios.categoriaId, categorias.id))
    .where(
      and(
        eq(recordatorios.usuarioId, usuarioId),
        isNull(recordatorios.eliminadoEn),
        or(...SLUGS.map((slug) => eq(categorias.slug, slug))),
      ),
    )
    .orderBy(asc(recordatorios.fechaVencimiento))

  return filas.map((f) => mapearRecordatorio(f.recordatorio))
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
        isNull(recordatorios.eliminadoEn),
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
        isNull(recordatorios.eliminadoEn),
        or(
          sql`to_tsvector('spanish', coalesce(${recordatorios.titulo}, '') || ' ' || coalesce(${recordatorios.descripcion}, '')) @@ websearch_to_tsquery('spanish', ${texto})`,
          ilike(recordatorios.titulo, termino),
          ilike(recordatorios.descripcion, termino),
          sql`${recordatorios.metadatos}::text ILIKE ${termino}`,
        ),
      ),
    )
    .orderBy(asc(recordatorios.fechaVencimiento))
    .limit(limite)

  return filas.map(mapearRecordatorio)
}

export async function buscarRecordatoriosSimilares(
  usuarioId: string,
  titulo: string,
  categoriaSlug: string,
): Promise<{ id: string; titulo: string }[]> {
  const [categoria] = await db
    .select({ id: categorias.id })
    .from(categorias)
    .where(eq(categorias.slug, categoriaSlug))
    .limit(1)

  if (!categoria) return []

  return db
    .select({ id: recordatorios.id, titulo: recordatorios.titulo })
    .from(recordatorios)
    .where(
      and(
        eq(recordatorios.usuarioId, usuarioId),
        eq(recordatorios.categoriaId, categoria.id),
        eq(recordatorios.estaCompletado, false),
        isNull(recordatorios.eliminadoEn),
        ilike(recordatorios.titulo, `%${titulo}%`),
      ),
    )
    .limit(3)
}

export interface RecordatorioConAnticipacion extends Recordatorio {
  anticipacionNotificacion: number
  zonaHoraria: string
}

// Devuelve recordatorios cuyo notify_at cayo en la ventana [ahora - ventanaMin, ahora]
// Se usa en el cron para saber que notificaciones enviar cada minuto
// Todos los cumpleanos activos con su fecha y la zona horaria del usuario. El calculo
// de "3 dias antes / el dia a las 6am local" se hace en `procesarCumpleanos`.
export async function getCumpleanosActivos(): Promise<
  { id: string; usuarioId: string; titulo: string; fechaVencimiento: Date; zonaHoraria: string }[]
> {
  const filas = await db
    .select({
      id: recordatorios.id,
      usuarioId: recordatorios.usuarioId,
      titulo: recordatorios.titulo,
      fechaVencimiento: recordatorios.fechaVencimiento,
      zonaHoraria: perfiles.zonaHoraria,
    })
    .from(recordatorios)
    .innerJoin(categorias, eq(recordatorios.categoriaId, categorias.id))
    .innerJoin(perfiles, eq(recordatorios.usuarioId, perfiles.id))
    .where(
      and(
        eq(categorias.slug, 'birthdays'),
        eq(recordatorios.estaCompletado, false),
        isNull(recordatorios.eliminadoEn),
        isNotNull(recordatorios.fechaVencimiento),
      ),
    )

  return filas
    .filter((f): f is typeof f & { fechaVencimiento: Date } => f.fechaVencimiento !== null)
    .map((f) => ({ ...f, fechaVencimiento: new Date(f.fechaVencimiento) }))
}

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
      completadoEn: recordatorios.completadoEn,
      eliminadoEn: recordatorios.eliminadoEn,
      tmdbId: recordatorios.tmdbId,
      metadatos: recordatorios.metadatos,
      creadoEn: recordatorios.creadoEn,
      actualizadoEn: recordatorios.actualizadoEn,
      anticipacionNotificacion: perfiles.anticipacionNotificacion,
      zonaHoraria: perfiles.zonaHoraria,
    })
    .from(recordatorios)
    .innerJoin(perfiles, eq(recordatorios.usuarioId, perfiles.id))
    .where(
      and(
        isNotNull(recordatorios.notificarEn),
        lte(recordatorios.notificarEn, ahora),
        gte(recordatorios.notificarEn, limiteInferior),
        eq(recordatorios.estaCompletado, false),
        // Los recurrentes (ej. clases semanales) no generan push por-ocurrencia: solo
        // se ven en la app. Los cumpleanos van por procesarCumpleanos (notificarEn null).
        eq(recordatorios.esRecurrente, false),
        isNull(recordatorios.eliminadoEn),
      ),
    )
    .orderBy(asc(recordatorios.notificarEn))

  return filas.map((fila) => ({
    ...mapearRecordatorio(fila),
    anticipacionNotificacion: fila.anticipacionNotificacion,
    zonaHoraria: fila.zonaHoraria,
  }))
}

// Recordatorios con aviso programado en las proximas `horas` para un usuario.
// Lo consume /api/recordatorios/proximos: el scheduler local de la app Tauri
// (Fases 30/31) los usa para programar notificaciones nativas sin depender
// del cron externo. Solo no-recurrentes con notificarEn futuro (los
// cumpleanos siguen via push web; ver ARCHITECTURE.md "Apps nativas").
export interface RecordatorioProximoApp {
  id: string
  titulo: string
  descripcion: string | null
  notificarEn: Date
}

export async function getRecordatoriosProximosParaApp(
  usuarioId: string,
  horas = 48,
): Promise<RecordatorioProximoApp[]> {
  const ahora = new Date()
  const limite = new Date(ahora.getTime() + horas * 60 * 60 * 1000)

  const filas = await db
    .select({
      id: recordatorios.id,
      titulo: recordatorios.titulo,
      descripcion: recordatorios.descripcion,
      notificarEn: recordatorios.notificarEn,
    })
    .from(recordatorios)
    .where(
      and(
        eq(recordatorios.usuarioId, usuarioId),
        isNotNull(recordatorios.notificarEn),
        gte(recordatorios.notificarEn, ahora),
        lte(recordatorios.notificarEn, limite),
        eq(recordatorios.estaCompletado, false),
        eq(recordatorios.esRecurrente, false),
        isNull(recordatorios.eliminadoEn),
      ),
    )
    .orderBy(asc(recordatorios.notificarEn))

  // isNotNull ya filtra en SQL; el filter refina el tipo sin casts.
  return filas.filter(
    (f): f is RecordatorioProximoApp & { descripcion: string | null } => f.notificarEn !== null,
  )
}
