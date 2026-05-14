'use server'

import { revalidatePath } from 'next/cache'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { recordatorios } from '@/db/schema'
import { crearClienteServidor } from '@/lib/supabase/server'
import { validarRecordatorio } from '@/lib/validations/reminder.schemas'
import { calcularProximaOcurrencia, combinarFechaHora } from '@/lib/utils/date.utils'
import { getCategorias } from '@/lib/queries/category.queries'
import type { EstadoAccionRecordatorio, Recordatorio } from '@/types/reminder.types'

async function obtenerUsuarioId(): Promise<string | null> {
  const supabase = await crearClienteServidor()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

function revalidarRutas() {
  revalidatePath('/', 'layout')
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
  const fecha = datos.fechaVencimiento
  const hora = datos.horaVencimiento ?? '00:00'
  const fechaVencimiento = combinarFechaHora(fecha, hora)

  const anticipacionMs = (datos.anticipacionMin ?? 15) * 60 * 1000
  const notificarEn = new Date(fechaVencimiento.getTime() - anticipacionMs)

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

    revalidarRutas()
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
  const fecha = datos.fechaVencimiento
  const hora = datos.horaVencimiento ?? '00:00'
  const fechaVencimiento = combinarFechaHora(fecha, hora)

  const anticipacionMs = (datos.anticipacionMin ?? 15) * 60 * 1000
  const notificarEn = new Date(fechaVencimiento.getTime() - anticipacionMs)

  try {
    const [fila] = await db
      .update(recordatorios)
      .set({
        titulo: datos.titulo,
        descripcion: datos.descripcion ?? null,
        fechaVencimiento,
        notificarEn,
        esRecurrente: Boolean(datos.esRecurrente),
        reglaRecurrencia: datos.reglaRecurrencia ?? null,
        metadatos: Object.keys(metadatos).length > 0 ? metadatos : null,
        actualizadoEn: new Date(),
      })
      .where(and(eq(recordatorios.id, id), eq(recordatorios.usuarioId, usuarioId)))
      .returning()

    if (!fila) return { ok: false, error: 'Recordatorio no encontrado' }

    revalidarRutas()
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
    await db
      .delete(recordatorios)
      .where(and(eq(recordatorios.id, id), eq(recordatorios.usuarioId, usuarioId)))

    revalidarRutas()
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

    if (actual.esRecurrente && actual.reglaRecurrencia) {
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
      await db
        .update(recordatorios)
        .set({
          estaCompletado: !actual.estaCompletado,
          actualizadoEn: new Date(),
        })
        .where(eq(recordatorios.id, id))
    }

    revalidarRutas()
    return { ok: true }
  } catch (e) {
    console.error('Error al alternar completado:', e)
    return { ok: false, error: 'Error al actualizar el recordatorio' }
  }
}
