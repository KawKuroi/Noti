'use server'

import { NextRequest, NextResponse } from 'next/server'
import { eq, and, isNotNull, lte } from 'drizzle-orm'
import { db } from '@/db'
import { perfiles, recordatorios, categorias } from '@/db/schema'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const [categoriasTareas] = await db
      .select({ id: categorias.id })
      .from(categorias)
      .where(eq(categorias.slug, 'tasks'))
      .limit(1)

    if (!categoriasTareas) {
      return NextResponse.json({ ok: true, eliminados: 0 })
    }

    const perfilesConAutoDelete = await db
      .select({
        id: perfiles.id,
        diasAutoEliminar: perfiles.autoEliminarTareasCompletadasDias,
      })
      .from(perfiles)
      .where(isNotNull(perfiles.autoEliminarTareasCompletadasDias))

    let eliminados = 0

    for (const perfil of perfilesConAutoDelete) {
      if (perfil.diasAutoEliminar === null) continue

      const fechaLimite = new Date()
      fechaLimite.setDate(fechaLimite.getDate() - perfil.diasAutoEliminar)

      const filas = await db
        .delete(recordatorios)
        .where(
          and(
            eq(recordatorios.usuarioId, perfil.id),
            eq(recordatorios.categoriaId, categoriasTareas.id),
            eq(recordatorios.estaCompletado, true),
            isNotNull(recordatorios.completadoEn),
            lte(recordatorios.completadoEn, fechaLimite),
          ),
        )
        .returning({ id: recordatorios.id })

      eliminados += filas.length
    }

    return NextResponse.json({ ok: true, eliminados })
  } catch (e) {
    console.error('Error en cron limpiar-tareas:', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
