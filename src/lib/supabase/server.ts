import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function crearClienteServidor() {
  const almacenCookies = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return almacenCookies.getAll()
        },
        setAll(cookiesAConfigurar) {
          try {
            cookiesAConfigurar.forEach(({ name, value, options }) => {
              almacenCookies.set(name, value, options)
            })
          } catch {
            // setAll puede fallar en Server Components, es seguro ignorarlo
          }
        },
      },
    },
  )
}
