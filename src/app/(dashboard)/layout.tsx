import { requerirUsuario } from '@/lib/auth'
import { getCategorias } from '@/lib/queries/category.queries'
import { getPerfilDelUsuarioActual } from '@/lib/queries/user.queries'
import { Sidebar } from '@/components/features/sidebar'
import { BusquedaGlobal } from '@/components/features/busqueda-global'
import {
  AsistenteProvider,
  CommandPalette,
} from '@/components/features/asistente'

interface Props {
  children: React.ReactNode
}

export default async function LayoutDashboard({ children }: Props) {
  const user = await requerirUsuario()

  const [categorias, perfil] = await Promise.all([getCategorias(), getPerfilDelUsuarioActual()])

  return (
    <AsistenteProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar categorias={categorias} usuario={user} nombrePerfil={perfil?.nombreMostrado} />
        <main className="flex-1 overflow-y-auto px-6 pt-10 pb-6">{children}</main>
      </div>
      <BusquedaGlobal />
      <CommandPalette />
    </AsistenteProvider>
  )
}
