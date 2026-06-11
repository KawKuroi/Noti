import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { requerirUsuario } from '@/lib/auth'
import { getCategorias } from '@/lib/queries/category.queries'
import { getPerfilDelUsuarioActual } from '@/lib/queries/user.queries'
import { getHistorialNotificaciones } from '@/lib/queries/push.queries'
import { upsertPerfil } from '@/lib/actions/user.actions'
import { Sidebar } from '@/components/features/sidebar'
import { BusquedaGlobal } from '@/components/features/busqueda-global'
import { AsistenteProvider } from '@/components/features/asistente'
import { AjustarLang } from '@/components/providers/ajustar-lang'

interface Props {
  children: React.ReactNode
}

export default async function LayoutDashboard({ children }: Props) {
  const user = await requerirUsuario()

  const [categorias, perfil, notificaciones, locale, messages] = await Promise.all([
    getCategorias(),
    getPerfilDelUsuarioActual(),
    getHistorialNotificaciones(user.id),
    getLocale(),
    getMessages(),
  ])

  // Fallback: si el usuario existe en auth pero no tiene perfil creado
  // (puede ocurrir cuando Supabase tiene confirmacion de email desactivada
  // y el callback nunca se ejecuto), lo creamos aqui para desbloquear el acceso.
  if (!perfil) {
    await upsertPerfil(user.id, user.user_metadata?.full_name ?? user.email ?? null)
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AjustarLang locale={locale} />
      <AsistenteProvider>
      <div
        className="h-screen overflow-hidden"
        style={{ background: 'var(--bg)' }}
      >
        <div className="flex h-full">
          <Sidebar
            categorias={categorias}
            usuario={user}
            nombrePerfil={perfil?.nombreMostrado}
            notificacionesIniciales={notificaciones}
            noLeidasIniciales={notificaciones.length}
          />
          <main
            className="flex-1 overflow-y-auto"
            style={{ padding: 'clamp(20px, 3vw, 40px) clamp(22px, 3.5vw, 44px)' }}
          >
            {children}
          </main>
        </div>
      </div>
      <BusquedaGlobal />
      </AsistenteProvider>
    </NextIntlClientProvider>
  )
}
