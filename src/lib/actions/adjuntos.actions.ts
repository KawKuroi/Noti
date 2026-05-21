'use server'

import { revalidatePath } from 'next/cache'
import { eq, and } from 'drizzle-orm'
import { del } from '@vercel/blob'
import { db } from '@/db'
import { notasAdjuntos, recordatorios } from '@/db/schema'
import { obtenerUsuario } from '@/lib/auth'
import type { AdjuntoNota, TipoAdjunto } from '@/types/notas.types'

interface ResultadoAccion {
  ok: boolean
  error?: string
}

interface ResultadoAdjunto extends ResultadoAccion {
  adjunto?: AdjuntoNota
}

async function obtenerUsuarioId(): Promise<string | null> {
  const user = await obtenerUsuario()
  return user?.id ?? null
}

function urlEsDeBlob(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      parsed.protocol === 'https:' &&
      (parsed.hostname.endsWith('.vercel-storage.com') ||
        parsed.hostname.endsWith('.public.blob.vercel-storage.com'))
    )
  } catch {
    return false
  }
}

export async function registrarAdjunto(
  cuadernoId: string,
  tipo: TipoAdjunto,
  url: string,
  nombreArchivo: string,
  mime: string,
  tamano: number,
): Promise<ResultadoAdjunto> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  if (!urlEsDeBlob(url)) return { ok: false, error: 'URL de archivo no valida' }

  const filaCuaderno = await db
    .select({ id: recordatorios.id })
    .from(recordatorios)
    .where(and(eq(recordatorios.id, cuadernoId), eq(recordatorios.usuarioId, usuarioId)))
    .limit(1)

  if (!filaCuaderno[0]) return { ok: false, error: 'Cuaderno no encontrado' }

  try {
    const [fila] = await db
      .insert(notasAdjuntos)
      .values({ cuadernoId, tipo, url, nombreArchivo, mime, tamano })
      .returning()

    await db
      .update(recordatorios)
      .set({ actualizadoEn: new Date() })
      .where(eq(recordatorios.id, cuadernoId))

    revalidatePath(`/notes/${cuadernoId}`)
    revalidatePath('/notes')

    return {
      ok: true,
      adjunto: {
        id: fila.id,
        cuadernoId: fila.cuadernoId,
        tipo: fila.tipo,
        url: fila.url,
        nombreArchivo: fila.nombreArchivo,
        mime: fila.mime,
        tamano: fila.tamano,
        creadoEn: fila.creadoEn.toISOString(),
      },
    }
  } catch {
    return { ok: false, error: 'Error al registrar el adjunto' }
  }
}

export async function eliminarAdjunto(id: string): Promise<ResultadoAccion> {
  const usuarioId = await obtenerUsuarioId()
  if (!usuarioId) return { ok: false, error: 'No autenticado' }

  const filaAdjunto = await db
    .select({ url: notasAdjuntos.url, cuadernoId: notasAdjuntos.cuadernoId })
    .from(notasAdjuntos)
    .innerJoin(recordatorios, eq(notasAdjuntos.cuadernoId, recordatorios.id))
    .where(and(eq(notasAdjuntos.id, id), eq(recordatorios.usuarioId, usuarioId)))
    .limit(1)

  if (!filaAdjunto[0]) return { ok: false, error: 'Adjunto no encontrado' }

  const { url, cuadernoId } = filaAdjunto[0]

  try {
    await db.delete(notasAdjuntos).where(eq(notasAdjuntos.id, id))
    await del(url)

    revalidatePath(`/notes/${cuadernoId}`)
    revalidatePath('/notes')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Error al eliminar el adjunto' }
  }
}
