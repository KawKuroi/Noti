import { requerirUsuario } from '@/lib/auth'
import { getCategorias } from '@/lib/queries/category.queries'
import { getPerfilDelUsuarioActual } from '@/lib/queries/user.queries'
import { upsertPerfil } from '@/lib/actions/user.actions'
import { Sidebar } from '@/components/features/sidebar'
import { BusquedaGlobal } from '@/components/features/busqueda-global'
import { AsistenteProvider } from '@/components/features/asistente'

interface Props {
  children: React.ReactNode
}

export default async function LayoutDashboard({ children }: Props) {
  const user = await requerirUsuario()

  const [categorias, perfil] = await Promise.all([getCategorias(), getPerfilDelUsuarioActual()])

  // Fallback: si el usuario existe en auth pero no tiene perfil creado
  // (puede ocurrir cuando Supabase tiene confirmacion de email desactivada
  // y el callback nunca se ejecuto), lo creamos aqui para desbloquear el acceso.
  if (!perfil) {
    await upsertPerfil(user.id, user.user_metadata?.full_name ?? user.email ?? null)
  }

  return (
    <AsistenteProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar categorias={categorias} usuario={user} nombrePerfil={perfil?.nombreMostrado} />
        <main className="flex-1 overflow-y-auto px-6 pt-10 pb-6">{children}</main>
      </div>
      <BusquedaGlobal />
    </AsistenteProvider>
  )
}
