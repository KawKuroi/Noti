import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { and, eq, gt } from 'drizzle-orm'
import { db } from '@/db'
import { tokensRecuperacion, perfiles, recordatorios } from '@/db/schema'
import { verificarLimite } from '@/lib/utils/rate-limit'

const origen = (req: NextRequest) =>
  process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anonimo'

  const limite = verificarLimite(`recuperar:${ip}`, 10, 3_600_000)
  if (!limite.ok) {
    return NextResponse.redirect(`${origen(req)}/?error=demasiadas-peticiones`)
  }

  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(`${origen(req)}/?error=token-invalido`)
  }

  try {
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
      return NextResponse.redirect(`${origen(req)}/?error=token-invalido`)
    }

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

    revalidatePath('/inicio')
    revalidatePath('/settings')

    return NextResponse.redirect(`${origen(req)}/inicio?recovered=true`)
  } catch (e) {
    console.error('Error en endpoint de recuperacion:', e)
    return NextResponse.redirect(`${origen(req)}/?error=error-interno`)
  }
}
