'use server'

import { NextRequest, NextResponse } from 'next/server'
import { eq, and, isNotNull, isNull, lte, lt, sql } from 'drizzle-orm'
import { db } from '@/db'
import { perfiles, recordatorios, categorias } from '@/db/schema'
import { MAX_HISTORIAL_NOTIFICACIONES } from '@/lib/utils/constants'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    let eliminados = 0
    let vencidosEliminados = 0

    // --- 1) Tareas completadas (regla auto_delete_completed_tasks_days) ---
    const [categoriaTareas] = await db
      .select({ id: categorias.id })
      .from(categorias)
      .where(eq(categorias.slug, 'tasks'))
      .limit(1)

    if (categoriaTareas) {
      const perfilesConAutoDelete = await db
        .select({
          id: perfiles.id,
          diasAutoEliminar: perfiles.autoEliminarTareasCompletadasDias,
        })
        .from(perfiles)
        .where(isNotNull(perfiles.autoEliminarTareasCompletadasDias))

      for (const perfil of perfilesConAutoDelete) {
        if (perfil.diasAutoEliminar === null) continue

        const fechaLimite = new Date()
        fechaLimite.setDate(fechaLimite.getDate() - perfil.diasAutoEliminar)

        const filas = await db
          .delete(recordatorios)
          .where(
            and(
              eq(recordatorios.usuarioId, perfil.id),
              eq(recordatorios.categoriaId, categoriaTareas.id),
              eq(recordatorios.estaCompletado, true),
              isNotNull(recordatorios.completadoEn),
              lte(recordatorios.completadoEn, fechaLimite),
            ),
          )
          .returning({ id: recordatorios.id })

        eliminados += filas.length
      }
    }

    // --- 2) Recordatorios vencidos (regla auto_delete_overdue_days) ---
    // Recordatorios con fecha fija pasada, no recurrentes y no completados. Los
    // recurrentes (cumpleanos, estudio recurrente) se excluyen porque siempre
    // tienen una proxima ocurrencia.
    const perfilesConAutoVencidos = await db
      .select({
        id: perfiles.id,
        diasVencidos: perfiles.autoEliminarVencidosDias,
      })
      .from(perfiles)
      .where(isNotNull(perfiles.autoEliminarVencidosDias))

    for (const perfil of perfilesConAutoVencidos) {
      if (perfil.diasVencidos === null) continue

      const fechaLimite = new Date()
      fechaLimite.setDate(fechaLimite.getDate() - perfil.diasVencidos)

      const filas = await db
        .delete(recordatorios)
        .where(
          and(
            eq(recordatorios.usuarioId, perfil.id),
            eq(recordatorios.esRecurrente, false),
            eq(recordatorios.estaCompletado, false),
            isNull(recordatorios.eliminadoEn),
            isNotNull(recordatorios.fechaVencimiento),
            lt(recordatorios.fechaVencimiento, fechaLimite),
          ),
        )
        .returning({ id: recordatorios.id })

      vencidosEliminados += filas.length
    }

    // --- 3) Purga del historial de notificaciones (tope por usuario) ---
    await db.execute(sql`
      DELETE FROM notification_log
      WHERE id IN (
        SELECT id FROM (
          SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY sent_at DESC) AS rn
          FROM notification_log
        ) t
        WHERE t.rn > ${MAX_HISTORIAL_NOTIFICACIONES}
      )
    `)

    return NextResponse.json({ ok: true, eliminados, vencidosEliminados })
  } catch (e) {
    console.error('Error en cron limpiar-tareas:', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
