import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Next 16: proxy.ts reemplaza a middleware.ts (misma semantica de intercepcion).
export async function proxy(solicitud: NextRequest) {
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
        setAll(cookiesAConfigurar: { name: string; value: string; options: Record<string, unknown> }[]) {
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

  const ruta = solicitud.nextUrl.pathname
  const estaEnRutaAuth = ruta.startsWith('/login') || ruta.startsWith('/register')
  const esRutaPublica =
    ruta === '/' ||
    ruta === '/auth/callback' ||
    // Formulario de sugerencias de la landing: visitantes sin sesion
    // (la ruta tiene su propio rate limiting)
    ruta === '/api/contacto' ||
    ruta.startsWith('/api/cron/') ||
    ruta.startsWith('/api/push/')

  if (!user && !estaEnRutaAuth && !esRutaPublica) {
    return NextResponse.redirect(new URL('/login', solicitud.url))
  }

  if (user && ruta === '/') {
    return NextResponse.redirect(new URL('/inicio', solicitud.url))
  }

  if (user && estaEnRutaAuth) {
    return NextResponse.redirect(new URL('/inicio', solicitud.url))
  }

  return respuesta
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|robots.txt|sitemap.xml|opengraph-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
