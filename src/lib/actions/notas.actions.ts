'use server'

import { revalidatePath } from 'next/cache'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { recordatorios, categorias, notasEntradas } from '@/db/schema'
import { obtenerUsuario } from '@/lib/auth'
import type { NotaEntrada } from '@/types/notas.types'

interface ResultadoAccion {
  ok: boolean
  error?: string
}

interface ResultadoCuaderno extends ResultadoAccion {
  id?: string
}

interface ResultadoEntrada extends ResultadoAccion {
  entrada?: NotaEntrada
}

async function obtenerUsuarioId(): Promise<string | null> {
  const user = await obtenerUsuario()
  return user?.id ?? null
}

export async function crearCuaderno(nombre: string): Promise<ResultadoCuaderno> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  const nombreLimpio = nombre.trim()
  if (!nombreLimpio) return { ok: false, error: 'El nombre no puede estar vacio' }

  const filaCategoria = await db
    .select()
    .from(categorias)
    .where(eq(categorias.slug, 'notes'))
    .limit(1)

  if (!filaCategoria[0]) return { ok: false, error: 'Categoria notas no encontrada' }

  try {
    const [fila] = await db
      .insert(recordatorios)
      .values({
        usuarioId,
        categoriaId: filaCategoria[0].id,
        titulo: nombreLimpio,
        estaCompletado: false,
      })
      .returning({ id: recordatorios.id })

    revalidatePath('/notes')
    return { ok: true, id: fila.id }
  } catch {
    return { ok: false, error: 'Error al crear el cuaderno' }
  }
}

export async function renombrarCuaderno(id: string, nombre: string): Promise<ResultadoAccion> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  const nombreLimpio = nombre.trim()
  if (!nombreLimpio) return { ok: false, error: 'El nombre no puede estar vacio' }

  try {
    await db
      .update(recordatorios)
      .set({ titulo: nombreLimpio, actualizadoEn: new Date() })
      .where(and(eq(recordatorios.id, id), eq(recordatorios.usuarioId, usuarioId)))

    revalidatePath('/notes')
    revalidatePath(`/notes/${id}`)
    return { ok: true }
  } catch {
    return { ok: false, error: 'Error al renombrar el cuaderno' }
  }
}

export async function eliminarCuaderno(id: string): Promise<ResultadoAccion> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  try {
    await db
      .delete(recordatorios)
      .where(and(eq(recordatorios.id, id), eq(recordatorios.usuarioId, usuarioId)))

    revalidatePath('/notes')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Error al eliminar el cuaderno' }
  }
}

export async function crearEntrada(
  cuadernoId: string,
  contenido: string,
): Promise<ResultadoEntrada> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  const contenidoLimpio = contenido.trim()
  if (!contenidoLimpio) return { ok: false, error: 'El mensaje no puede estar vacio' }

  const filaCuaderno = await db
    .select({ id: recordatorios.id })
    .from(recordatorios)
    .where(and(eq(recordatorios.id, cuadernoId), eq(recordatorios.usuarioId, usuarioId)))
    .limit(1)

  if (!filaCuaderno[0]) return { ok: false, error: 'Cuaderno no encontrado' }

  try {
    const [fila] = await db
      .insert(notasEntradas)
      .values({ cuadernoId, contenido: contenidoLimpio })
      .returning()

    await db
      .update(recordatorios)
      .set({ actualizadoEn: new Date() })
      .where(eq(recordatorios.id, cuadernoId))

    revalidatePath(`/notes/${cuadernoId}`)
    revalidatePath('/notes')

    return {
      ok: true,
      entrada: {
        id: fila.id,
        cuadernoId: fila.cuadernoId,
        contenido: fila.contenido,
        creadoEn: fila.creadoEn.toISOString(),
        actualizadoEn: fila.actualizadoEn.toISOString(),
      },
    }
  } catch {
    return { ok: false, error: 'Error al guardar el mensaje' }
  }
}

export async function actualizarEntrada(id: string, contenido: string): Promise<ResultadoAccion> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  const contenidoLimpio = contenido.trim()
  if (!contenidoLimpio) return { ok: false, error: 'El mensaje no puede estar vacio' }

  const filaEntrada = await db
    .select({ cuadernoId: notasEntradas.cuadernoId })
    .from(notasEntradas)
    .innerJoin(recordatorios, eq(notasEntradas.cuadernoId, recordatorios.id))
    .where(and(eq(notasEntradas.id, id), eq(recordatorios.usuarioId, usuarioId)))
    .limit(1)

  if (!filaEntrada[0]) return { ok: false, error: 'Entrada no encontrada' }

  const { cuadernoId } = filaEntrada[0]

  try {
    await db
      .update(notasEntradas)
      .set({ contenido: contenidoLimpio, actualizadoEn: new Date() })
      .where(eq(notasEntradas.id, id))

    revalidatePath(`/notes/${cuadernoId}`)
    return { ok: true }
  } catch {
    return { ok: false, error: 'Error al actualizar el mensaje' }
  }
}

export async function eliminarEntrada(id: string): Promise<ResultadoAccion> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  const filaEntrada = await db
    .select({ cuadernoId: notasEntradas.cuadernoId })
    .from(notasEntradas)
    .innerJoin(recordatorios, eq(notasEntradas.cuadernoId, recordatorios.id))
    .where(and(eq(notasEntradas.id, id), eq(recordatorios.usuarioId, usuarioId)))
    .limit(1)

  if (!filaEntrada[0]) return { ok: false, error: 'Entrada no encontrada' }

  const { cuadernoId } = filaEntrada[0]

  try {
    await db.delete(notasEntradas).where(eq(notasEntradas.id, id))

    revalidatePath(`/notes/${cuadernoId}`)
    revalidatePath('/notes')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Error al eliminar el mensaje' }
  }
}
