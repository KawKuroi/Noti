import { redirect } from 'next/navigation'
import { crearClienteServidor } from '@/lib/supabase/server'
import { getCategorias } from '@/lib/queries/category.queries'
import { Sidebar } from '@/components/features/sidebar'
import { Header } from '@/components/features/header'

interface Props {
  children: React.ReactNode
}

export default async function LayoutDashboard({ children }: Props) {
  const supabase = await crearClienteServidor()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const categorias = await getCategorias()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar categorias={categorias} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header usuario={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
