'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { and, eq, isNull, inArray } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import { Resend } from 'resend'
import { db } from '@/db'
import { perfiles, recordatorios, categorias, tokensRecuperacion } from '@/db/schema'
import { ZONA_HORARIA_DEFECTO, ANTICIPACION_DEFECTO } from '@/lib/utils/constants'
import { esquemaPerfil } from '@/lib/validations/user.schemas'
import { obtenerUsuario } from '@/lib/auth'
import { crearClienteServidor } from '@/lib/supabase/server'
import {
  plantillaRecuperacionCuenta,
  plantillaRecuperacionRecordatorios,
} from '@/lib/services/email-templates'

export async function actualizarAutoDeleteTareas(
  dias: number | null,
): Promise<{ ok: boolean; error?: string }> {
  const usuario = await obtenerUsuario()
  if (!usuario) return { ok: false, error: 'No autenticado' }

  try {
    await db
      .update(perfiles)
      .set({ autoEliminarTareasCompletadasDias: dias, actualizadoEn: new Date() })
      .where(eq(perfiles.id, usuario.id))

    revalidatePath('/settings')
    return { ok: true }
  } catch (e) {
    console.error('Error en actualizarAutoDeleteTareas:', e)
    return { ok: false, error: 'Error al guardar la configuracion' }
  }
}

export async function upsertPerfil(
  usuarioId: string,
  nombreMostrado?: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await db
      .insert(perfiles)
      .values({
        id: usuarioId,
        nombreMostrado: nombreMostrado ?? null,
        zonaHoraria: ZONA_HORARIA_DEFECTO,
        anticipacionNotificacion: ANTICIPACION_DEFECTO,
      })
      .onConflictDoUpdate({
        target: perfiles.id,
        set: {
          actualizadoEn: new Date(),
          ...(nombreMostrado ? { nombreMostrado } : {}),
        },
      })

    return { ok: true }
  } catch (e) {
    console.error('Error en upsertPerfil:', e)
    return { ok: false, error: 'Error al crear o actualizar el perfil' }
  }
}

export async function softDeleteCuenta(): Promise<{ ok: boolean; error?: string }> {
  const usuario = await obtenerUsuario()
  if (!usuario) return { ok: false, error: 'No autenticado' }

  const emailUsuario = usuario.email
  if (!emailUsuario) return { ok: false, error: 'La cuenta no tiene email asociado' }

  try {
    const [perfil] = await db
      .select({ nombreMostrado: perfiles.nombreMostrado })
      .from(perfiles)
      .where(eq(perfiles.id, usuario.id))
      .limit(1)

    await db
      .update(perfiles)
      .set({ eliminadoEn: new Date() })
      .where(and(eq(perfiles.id, usuario.id), isNull(perfiles.eliminadoEn)))

    const token = randomBytes(32).toString('hex')
    const expiraEn = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await db.insert(tokensRecuperacion).values({
      usuarioId: usuario.id,
      tipo: 'cuenta',
      token,
      metadatos: null,
      expiraEn,
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    const urlRecuperacion = `${appUrl}/api/auth/recuperar?token=${token}`

    const resend = new Resend(process.env.RESEND_API_KEY)
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
    const { error: resendError } = await resend.emails.send({
      from: `Noti <${fromEmail}>`,
      to: emailUsuario,
      subject: 'Tu cuenta de Noti fue eliminada — tienes 30 dias para recuperarla',
      html: plantillaRecuperacionCuenta({
        nombreMostrado: perfil?.nombreMostrado ?? null,
        urlRecuperacion,
      }),
    })
    if (resendError) {
      console.error('[softDeleteCuenta] Error al enviar email de recuperacion:', resendError)
    }

    const supabase = await crearClienteServidor()
    await supabase.auth.signOut()
  } catch (e) {
    console.error('Error en softDeleteCuenta:', e)
    return { ok: false, error: 'Error al eliminar la cuenta' }
  }

  redirect('/')
}

export async function softDeleteRecordatorios(payload: {
  categoriaId: number | null
}): Promise<{ ok: boolean; error?: string }> {
  const usuario = await obtenerUsuario()
  if (!usuario) return { ok: false, error: 'No autenticado' }

  const emailUsuario = usuario.email
  if (!emailUsuario) return { ok: false, error: 'La cuenta no tiene email asociado' }

  try {
    const [perfil] = await db
      .select({ nombreMostrado: perfiles.nombreMostrado })
      .from(perfiles)
      .where(eq(perfiles.id, usuario.id))
      .limit(1)

    let nombresCategorias: string[] = []

    if (payload.categoriaId !== null) {
      await db
        .update(recordatorios)
        .set({ eliminadoEn: new Date() })
        .where(
          and(
            eq(recordatorios.usuarioId, usuario.id),
            eq(recordatorios.categoriaId, payload.categoriaId),
            isNull(recordatorios.eliminadoEn),
          ),
        )

      const [cat] = await db
        .select({ nombre: categorias.nombre })
        .from(categorias)
        .where(eq(categorias.id, payload.categoriaId))
        .limit(1)

      if (cat) nombresCategorias = [cat.nombre]
    } else {
      await db
        .update(recordatorios)
        .set({ eliminadoEn: new Date() })
        .where(
          and(
            eq(recordatorios.usuarioId, usuario.id),
            isNull(recordatorios.eliminadoEn),
          ),
        )
    }

    const token = randomBytes(32).toString('hex')
    const expiraEn = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await db.insert(tokensRecuperacion).values({
      usuarioId: usuario.id,
      tipo: 'recordatorios',
      token,
      metadatos: { categoriaId: payload.categoriaId },
      expiraEn,
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    const urlRecuperacion = `${appUrl}/api/auth/recuperar?token=${token}`

    const resend = new Resend(process.env.RESEND_API_KEY)
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
    const { error: resendError } = await resend.emails.send({
      from: `Noti <${fromEmail}>`,
      to: emailUsuario,
      subject: 'Tus recordatorios de Noti fueron eliminados — tienes 30 dias para recuperarlos',
      html: plantillaRecuperacionRecordatorios({
        nombreMostrado: perfil?.nombreMostrado ?? null,
        nombresCategorias,
        urlRecuperacion,
      }),
    })
    if (resendError) {
      console.error('[softDeleteRecordatorios] Error al enviar email de recuperacion:', resendError)
    }

    revalidatePath('/inicio')
    revalidatePath('/settings')
    return { ok: true }
  } catch (e) {
    console.error('Error en softDeleteRecordatorios:', e)
    return { ok: false, error: 'Error al eliminar los recordatorios' }
  }
}

export async function actualizarPerfil(
  input: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const usuario = await obtenerUsuario()
  if (!usuario) return { ok: false, error: 'No autenticado' }

  const resultado = esquemaPerfil.safeParse(input)
  if (!resultado.success) {
    const primer = Object.values(resultado.error.flatten().fieldErrors)[0]?.[0]
    return { ok: false, error: primer ?? 'Datos invalidos' }
  }

  const { nombreMostrado, zonaHoraria } = resultado.data

  try {
    await db
      .update(perfiles)
      .set({
        ...(nombreMostrado !== undefined ? { nombreMostrado } : {}),
        zonaHoraria,
        actualizadoEn: new Date(),
      })
      .where(eq(perfiles.id, usuario.id))

    revalidatePath('/settings')
    return { ok: true }
  } catch (e) {
    console.error('Error en actualizarPerfil:', e)
    return { ok: false, error: 'Error al guardar el perfil' }
  }
}
