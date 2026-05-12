import { NextResponse } from 'next/server'
import { crearClienteServidor } from '@/lib/supabase/server'
import { upsertPerfil } from '@/lib/actions/user.actions'

export async function GET(solicitud: Request) {
  const { searchParams, origin } = new URL(solicitud.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await crearClienteServidor()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      await upsertPerfil(
        data.user.id,
        data.user.user_metadata?.full_name ?? data.user.email,
      )
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
