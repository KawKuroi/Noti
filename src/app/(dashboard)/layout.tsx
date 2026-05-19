import { requerirUsuario } from '@/lib/auth'
import { getCategorias } from '@/lib/queries/category.queries'
import { Sidebar } from '@/components/features/sidebar'
import { BusquedaGlobal } from '@/components/features/busqueda-global'
import {
  AsistenteProvider,
  FabAsistente,
  CommandPalette,
} from '@/components/features/asistente'

interface Props {
  children: React.ReactNode
}

export default async function LayoutDashboard({ children }: Props) {
  const user = await requerirUsuario()

  const categorias = await getCategorias()

  return (
    <AsistenteProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar categorias={categorias} usuario={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <BusquedaGlobal />
      <FabAsistente />
      <CommandPalette />
    </AsistenteProvider>
  )
}
