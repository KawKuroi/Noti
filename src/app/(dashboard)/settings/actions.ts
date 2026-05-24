'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

const LOCALES_VALIDOS = ['es', 'en'] as const

export async function cambiarIdiomaAction(locale: string): Promise<void> {
  if (!LOCALES_VALIDOS.includes(locale as (typeof LOCALES_VALIDOS)[number])) return
  const jar = await cookies()
  jar.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 31536000,
    sameSite: 'lax',
  })
  revalidatePath('/', 'layout')
}
