'use server'

import { revalidatePath } from 'next/cache'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { recordatorios } from '@/db/schema'
import { obtenerUsuario } from '@/lib/auth'
import { validarRecordatorio } from '@/lib/validations/reminder.schemas'
import { calcularProximaOcurrencia, combinarFechaHora } from '@/lib/utils/date.utils'
import { getCategorias } from '@/lib/queries/category.queries'
import { HORA_NOTIFICACION_LANZAMIENTO, TIPO_LANZAMIENTO_A_SLUG } from '@/lib/utils/constants'
import { getRecordatoriosPorCategoriaPaginados, buscarRecordatoriosSimilares } from '@/lib/queries/reminder.queries'
import type { EstadoAccionRecordatorio, OrdenamientoRecordatorio, Recordatorio } from '@/types/reminder.types'
import type { FuenteLanzamiento, TipoLanzamiento } from '@/types/release.types'

async function obtenerUsuarioId(): Promise<string | null> {
  const user = await obtenerUsuario()
  return user?.id ?? null
}

function revalidarRutas(slug?: string) {
  revalidatePath('/inicio')
  if (slug) {
    revalidatePath(`/${slug}`)
  }
}

export async function crearRecordatorio(
  prevState: EstadoAccionRecordatorio,
  formData: FormData,
): Promise<EstadoAccionRecordatorio> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  const slug = formData.get('slug') as string
  if (!slug) return { ok: false, error: 'Categoria requerida' }

  const categorias = await getCategorias()
  const categoria = categorias.find((c) => c.slug === slug)
  if (!categoria) return { ok: false, error: 'Categoria invalida' }

  const resultado = validarRecordatorio(slug, formData)
  if (!resultado.ok) return { ok: false, error: resultado.errores as Record<string, string[]> }

  const { datos, metadatos } = resultado
  const esNota = slug === 'notes'
  const recordarme = esNota && Boolean((metadatos as { recordarme?: boolean }).recordarme)

  let fechaVencimiento: Date | null = null
  let notificarEn: Date | null = null

  if (!esNota || recordarme) {
    const fechaHoraUtc = formData.get('fechaHoraUtc') as string | null
    if (fechaHoraUtc && !isNaN(new Date(fechaHoraUtc).getTime())) {
      fechaVencimiento = new Date(fechaHoraUtc)
    } else if (datos.fechaVencimiento) {
      fechaVencimiento = combinarFechaHora(datos.fechaVencimiento, datos.horaVencimiento ?? '00:00')
    } else {
      return { ok: false, error: 'La fecha es requerida' }
    }
    const anticipacionMs = (datos.anticipacionMin ?? 15) * 60 * 1000
    notificarEn = new Date(fechaVencimiento.getTime() - anticipacionMs)
  }

  try {
    const [fila] = await db
      .insert(recordatorios)
      .values({
        usuarioId,
        categoriaId: datos.categoriaId,
        titulo: datos.titulo,
        descripcion: datos.descripcion ?? null,
        fechaVencimiento,
        notificarEn,
        esRecurrente: Boolean(datos.esRecurrente),
        reglaRecurrencia: datos.reglaRecurrencia ?? null,
        estaCompletado: false,
        metadatos: Object.keys(metadatos).length > 0 ? metadatos : null,
      })
      .returning()

    revalidarRutas(slug)
    return { ok: true, data: fila as unknown as Recordatorio }
  } catch (e) {
    console.error('Error al crear recordatorio:', e)
    return { ok: false, error: 'Error al guardar el recordatorio' }
  }
}

export async function actualizarRecordatorio(
  id: string,
  prevState: EstadoAccionRecordatorio,
  formData: FormData,
): Promise<EstadoAccionRecordatorio> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  const slug = formData.get('slug') as string
  if (!slug) return { ok: false, error: 'Categoria requerida' }

  const categorias = await getCategorias()
  const categoria = categorias.find((c) => c.slug === slug)
  if (!categoria) return { ok: false, error: 'Categoria invalida' }

  const resultado = validarRecordatorio(slug, formData)
  if (!resultado.ok) return { ok: false, error: resultado.errores as Record<string, string[]> }

  const { datos, metadatos } = resultado
  const esNota = slug === 'notes'
  const recordarme = esNota && Boolean((metadatos as { recordarme?: boolean }).recordarme)

  let fechaVencimiento: Date | null = null
  let notificarEn: Date | null = null

  if (!esNota || recordarme) {
    const fechaHoraUtc = formData.get('fechaHoraUtc') as string | null
    if (fechaHoraUtc && !isNaN(new Date(fechaHoraUtc).getTime())) {
      fechaVencimiento = new Date(fechaHoraUtc)
    } else if (datos.fechaVencimiento) {
      fechaVencimiento = combinarFechaHora(datos.fechaVencimiento, datos.horaVencimiento ?? '00:00')
    } else {
      return { ok: false, error: 'La fecha es requerida' }
    }
    const anticipacionMs = (datos.anticipacionMin ?? 15) * 60 * 1000
    notificarEn = new Date(fechaVencimiento.getTime() - anticipacionMs)
  }

  try {
    const [previo] = await db
      .select({ metadatos: recordatorios.metadatos })
      .from(recordatorios)
      .where(and(eq(recordatorios.id, id), eq(recordatorios.usuarioId, usuarioId)))
      .limit(1)

    const metadatosPrevios = (previo?.metadatos as Record<string, unknown> | null) ?? {}
    const metadatosFusionados = { ...metadatosPrevios, ...metadatos }

    const [fila] = await db
      .update(recordatorios)
      .set({
        categoriaId: datos.categoriaId,
        titulo: datos.titulo,
        descripcion: datos.descripcion ?? null,
        fechaVencimiento,
        notificarEn,
        esRecurrente: Boolean(datos.esRecurrente),
        reglaRecurrencia: datos.reglaRecurrencia ?? null,
        metadatos: Object.keys(metadatosFusionados).length > 0 ? metadatosFusionados : null,
        actualizadoEn: new Date(),
      })
      .where(and(eq(recordatorios.id, id), eq(recordatorios.usuarioId, usuarioId)))
      .returning()

    if (!fila) return { ok: false, error: 'Recordatorio no encontrado' }

    revalidarRutas(slug)
    return { ok: true, data: fila as unknown as Recordatorio }
  } catch (e) {
    console.error('Error al actualizar recordatorio:', e)
    return { ok: false, error: 'Error al actualizar el recordatorio' }
  }
}

export async function eliminarRecordatorio(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  try {
    const [fila] = await db
      .select({ categoriaId: recordatorios.categoriaId })
      .from(recordatorios)
      .where(and(eq(recordatorios.id, id), eq(recordatorios.usuarioId, usuarioId)))
      .limit(1)

    await db
      .delete(recordatorios)
      .where(and(eq(recordatorios.id, id), eq(recordatorios.usuarioId, usuarioId)))

    const slug = fila ? (await getCategorias()).find((c) => c.id === fila.categoriaId)?.slug : undefined
    revalidarRutas(slug)
    return { ok: true }
  } catch (e) {
    console.error('Error al eliminar recordatorio:', e)
    return { ok: false, error: 'Error al eliminar el recordatorio' }
  }
}

export async function alternarCompletado(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  try {
    const [actual] = await db
      .select()
      .from(recordatorios)
      .where(and(eq(recordatorios.id, id), eq(recordatorios.usuarioId, usuarioId)))
      .limit(1)

    if (!actual) return { ok: false, error: 'Recordatorio no encontrado' }

    if (actual.esRecurrente && actual.reglaRecurrencia && actual.fechaVencimiento && actual.notificarEn) {
      // Para recurrentes: avanzar a la proxima ocurrencia en lugar de marcar completado
      const proxima = calcularProximaOcurrencia(
        actual.reglaRecurrencia,
        actual.fechaVencimiento,
        new Date(),
      )
      const diferenciaMsOriginal =
        actual.fechaVencimiento.getTime() - actual.notificarEn.getTime()
      const nuevoNotificarEn = new Date(proxima.getTime() - diferenciaMsOriginal)

      await db
        .update(recordatorios)
        .set({
          fechaVencimiento: proxima,
          notificarEn: nuevoNotificarEn,
          estaCompletado: false,
          actualizadoEn: new Date(),
        })
        .where(eq(recordatorios.id, id))
    } else {
      const ahora = new Date()
      await db
        .update(recordatorios)
        .set({
          estaCompletado: !actual.estaCompletado,
          completadoEn: !actual.estaCompletado ? ahora : null,
          actualizadoEn: ahora,
        })
        .where(eq(recordatorios.id, id))
    }

    const slug = (await getCategorias()).find((c) => c.id === actual.categoriaId)?.slug
    revalidarRutas(slug)
    return { ok: true }
  } catch (e) {
    console.error('Error al alternar completado:', e)
    return { ok: false, error: 'Error al actualizar el recordatorio' }
  }
}

export interface EntradaRecordatorioIA {
  titulo: string
  categoriaSlug: string
  fechaVencimiento?: string | null
  horaVencimiento?: string | null
  fechaHoraUtc?: string
  descripcion?: string | null
  esRecurrente?: boolean
  reglaRecurrencia?: string | null
  anticipacionMin?: number
  metadatos?: Record<string, unknown>
}

export async function crearRecordatorioDesdeIA(
  input: EntradaRecordatorioIA,
): Promise<EstadoAccionRecordatorio> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  const categorias = await getCategorias()
  const categoria = categorias.find((c) => c.slug === input.categoriaSlug)
  if (!categoria) return { ok: false, error: 'Categoria invalida' }

  const esNota = input.categoriaSlug === 'notes'

  let fechaVencimiento: Date | null = null
  let notificarEn: Date | null = null

  if (input.fechaVencimiento) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.fechaVencimiento)) {
      return { ok: false, error: 'Formato de fecha invalido' }
    }
    const hora = input.horaVencimiento ?? '09:00'
    fechaVencimiento =
      input.fechaHoraUtc && !isNaN(new Date(input.fechaHoraUtc).getTime())
        ? new Date(input.fechaHoraUtc)
        : combinarFechaHora(input.fechaVencimiento, hora)
    const anticipacionMs = (input.anticipacionMin ?? 15) * 60 * 1000
    notificarEn = new Date(fechaVencimiento.getTime() - anticipacionMs)
  } else if (!esNota) {
    return { ok: false, error: 'La fecha es requerida' }
  }

  const metadatosFinal: Record<string, unknown> = { ...(input.metadatos ?? {}) }
  if (esNota && !input.fechaVencimiento && metadatosFinal.recordarme === undefined) {
    metadatosFinal.recordarme = false
  }

  try {
    const [fila] = await db
      .insert(recordatorios)
      .values({
        usuarioId,
        categoriaId: categoria.id,
        titulo: input.titulo,
        descripcion: input.descripcion ?? null,
        fechaVencimiento,
        notificarEn,
        esRecurrente: Boolean(input.esRecurrente),
        reglaRecurrencia: input.reglaRecurrencia ?? null,
        estaCompletado: false,
        metadatos: Object.keys(metadatosFinal).length > 0 ? metadatosFinal : null,
      })
      .returning()

    revalidarRutas(input.categoriaSlug)
    return { ok: true, data: fila as unknown as Recordatorio }
  } catch (e) {
    console.error('Error al crear recordatorio desde IA:', e)
    return { ok: false, error: 'Error al guardar el recordatorio' }
  }
}

export interface EntradaCrearLanzamiento {
  titulo: string
  tipo: TipoLanzamiento
  fechaLanzamiento: string
  fuente: FuenteLanzamiento
  tmdbId?: number
  rawgId?: number
  musicbrainzId?: string
  googleBooksId?: string
  posterUrl?: string
  descripcion?: string
  autor?: string
  artista?: string
  plataforma?: string
  director?: string
  temporada?: number
  desarrolladora?: string
  editorial?: string
}

export async function crearRecordatorioLanzamiento(
  input: EntradaCrearLanzamiento,
): Promise<EstadoAccionRecordatorio> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  const categorias = await getCategorias()
  const slugCategoria = TIPO_LANZAMIENTO_A_SLUG[input.tipo]
  const categoria = categorias.find((c) => c.slug === slugCategoria)
  if (!categoria) return { ok: false, error: `Categoria ${slugCategoria} no disponible` }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.fechaLanzamiento)) {
    return { ok: false, error: 'Formato de fecha invalido' }
  }

  const fechaVencimiento = combinarFechaHora(input.fechaLanzamiento, HORA_NOTIFICACION_LANZAMIENTO)
  const notificarEn = fechaVencimiento

  const metadatos = {
    tipo: input.tipo,
    fuente: input.fuente,
    fechaEstreno: input.fechaLanzamiento,
    ...(input.rawgId ? { rawgId: input.rawgId } : {}),
    ...(input.musicbrainzId ? { musicbrainzId: input.musicbrainzId } : {}),
    ...(input.googleBooksId ? { googleBooksId: input.googleBooksId } : {}),
    ...(input.autor ? { autor: input.autor } : {}),
    ...(input.artista ? { artista: input.artista } : {}),
    ...(input.plataforma ? { plataforma: input.plataforma } : {}),
    ...(input.director ? { director: input.director } : {}),
    ...(input.temporada ? { temporada: input.temporada } : {}),
    ...(input.desarrolladora ? { desarrolladora: input.desarrolladora } : {}),
    ...(input.editorial ? { editorial: input.editorial } : {}),
  }

  try {
    const [fila] = await db
      .insert(recordatorios)
      .values({
        usuarioId,
        categoriaId: categoria.id,
        titulo: input.titulo,
        descripcion: input.descripcion ?? null,
        fechaVencimiento,
        notificarEn,
        esRecurrente: false,
        reglaRecurrencia: null,
        estaCompletado: false,
        tmdbId: input.tmdbId ?? null,
        metadatos,
      })
      .returning()

    revalidarRutas(slugCategoria)
    revalidatePath('/lanzamientos')
    return { ok: true, data: fila as unknown as Recordatorio }
  } catch (e) {
    console.error('Error al crear recordatorio de lanzamiento:', e)
    return { ok: false, error: 'Error al guardar el lanzamiento' }
  }
}

const LIMITE_PAGINACION = 20

export async function cargarMasRecordatorios(
  categoriaId: number,
  desplazamiento: number,
  ordenamiento: OrdenamientoRecordatorio,
): Promise<{ recordatorios: Recordatorio[]; hasMas: boolean }> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { recordatorios: [], hasMas: false }

  return getRecordatoriosPorCategoriaPaginados(
    usuarioId,
    categoriaId,
    LIMITE_PAGINACION,
    desplazamiento,
    ordenamiento,
  )
}

export async function duplicarNota(
  id: string,
): Promise<{ ok: boolean; nuevoId?: string; error?: string }> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  try {
    const [original] = await db
      .select()
      .from(recordatorios)
      .where(and(eq(recordatorios.id, id), eq(recordatorios.usuarioId, usuarioId)))
      .limit(1)

    if (!original) return { ok: false, error: 'Nota no encontrada' }

    const [copia] = await db
      .insert(recordatorios)
      .values({
        usuarioId,
        categoriaId: original.categoriaId,
        titulo: `${original.titulo} (copia)`,
        descripcion: original.descripcion,
        fechaVencimiento: null,
        notificarEn: null,
        esRecurrente: false,
        reglaRecurrencia: null,
        estaCompletado: false,
        metadatos: { recordarme: false },
      })
      .returning({ id: recordatorios.id })

    revalidatePath('/notes')
    return { ok: true, nuevoId: copia.id }
  } catch (e) {
    console.error('Error al duplicar nota:', e)
    return { ok: false, error: 'Error al duplicar la nota' }
  }
}

export async function verificarDuplicado(
  titulo: string,
  categoriaSlug: string,
): Promise<{ encontrado: boolean; titulos: string[] }> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { encontrado: false, titulos: [] }

  const similares = await buscarRecordatoriosSimilares(usuarioId, titulo, categoriaSlug)
  return {
    encontrado: similares.length > 0,
    titulos: similares.map((r) => r.titulo),
  }
}
