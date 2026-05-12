import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(solicitud: NextRequest) {
  let respuesta = NextResponse.next({
    request: solicitud,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return solicitud.cookies.getAll()
        },
        setAll(cookiesAConfigurar) {
          cookiesAConfigurar.forEach(({ name, value }) => {
            solicitud.cookies.set(name, value)
          })
          respuesta = NextResponse.next({ request: solicitud })
          cookiesAConfigurar.forEach(({ name, value, options }) => {
            respuesta.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const estaEnRutaAuth = solicitud.nextUrl.pathname.startsWith('/login') ||
    solicitud.nextUrl.pathname.startsWith('/register')

  if (!user && !estaEnRutaAuth && solicitud.nextUrl.pathname !== '/auth/callback') {
    return NextResponse.redirect(new URL('/login', solicitud.url))
  }

  if (user && estaEnRutaAuth) {
    return NextResponse.redirect(new URL('/', solicitud.url))
  }

  return respuesta
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
