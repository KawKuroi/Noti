import { NextRequest, NextResponse } from 'next/server'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { tokensRecuperacion, perfiles, recordatorios } from '@/db/schema'
import { verificarLimite } from '@/lib/utils/rate-limit'

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anonimo'

  const limite = verificarLimite(`recuperar:${ip}`, 10, 3_600_000)
  if (!limite.ok) {
    return NextResponse.redirect(
      new URL('/?error=demasiadas-peticiones', req.url),
    )
  }

  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/?error=token-invalido', req.url))
  }

  const ahora = new Date()

  const [registro] = await db
    .select()
    .from(tokensRecuperacion)
    .where(
      and(
        eq(tokensRecuperacion.token, token),
        gt(tokensRecuperacion.expiraEn, ahora),
      ),
    )
    .limit(1)

  if (!registro) {
    return NextResponse.redirect(new URL('/?error=token-invalido', req.url))
  }

  try {
    if (registro.tipo === 'cuenta') {
      await db
        .update(perfiles)
        .set({ eliminadoEn: null })
        .where(eq(perfiles.id, registro.usuarioId))
    } else {
      const metadatos = registro.metadatos as { categoriaId: number | null } | null
      const categoriaId = metadatos?.categoriaId ?? null

      if (categoriaId !== null) {
        await db
          .update(recordatorios)
          .set({ eliminadoEn: null })
          .where(
            and(
              eq(recordatorios.usuarioId, registro.usuarioId),
              eq(recordatorios.categoriaId, categoriaId),
            ),
          )
      } else {
        await db
          .update(recordatorios)
          .set({ eliminadoEn: null })
          .where(eq(recordatorios.usuarioId, registro.usuarioId))
      }
    }

    await db
      .delete(tokensRecuperacion)
      .where(eq(tokensRecuperacion.id, registro.id))

    return NextResponse.redirect(
      new URL('/inicio?recovered=true', req.url),
    )
  } catch (e) {
    console.error('Error en endpoint de recuperacion:', e)
    return NextResponse.redirect(new URL('/?error=error-interno', req.url))
  }
}
