import { NextRequest, NextResponse } from 'next/server'
import { and, isNotNull, lte } from 'drizzle-orm'
import { db } from '@/db'
import { perfiles, recordatorios } from '@/db/schema'
import { crearClienteAdmin } from '@/lib/supabase/admin'
import { verificarCronSecret } from '@/lib/utils/cron-auth'

export async function GET(req: NextRequest) {
  if (!verificarCronSecret(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const limiteFecha = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  try {
    const recordatoriosEliminados = await db
      .delete(recordatorios)
      .where(
        and(
          isNotNull(recordatorios.eliminadoEn),
          lte(recordatorios.eliminadoEn, limiteFecha),
        ),
      )
      .returning({ id: recordatorios.id })

    const cuentasAEliminar = await db
      .select({ id: perfiles.id })
      .from(perfiles)
      .where(
        and(
          isNotNull(perfiles.eliminadoEn),
          lte(perfiles.eliminadoEn, limiteFecha),
        ),
      )

    const supabaseAdmin = crearClienteAdmin()
    let cuentasEliminadas = 0

    for (const cuenta of cuentasAEliminar) {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(cuenta.id)
      if (error) {
        console.error(`Error al eliminar usuario ${cuenta.id}:`, error.message)
      } else {
        cuentasEliminadas++
      }
    }

    return NextResponse.json({
      ok: true,
      recordatoriosEliminados: recordatoriosEliminados.length,
      cuentasEliminadas,
    })
  } catch (e) {
    console.error('Error en cron limpiar-eliminados:', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
