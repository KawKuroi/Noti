import type { Metadata } from 'next'
import { NotebookPen } from 'lucide-react'
import { requerirUsuario } from '@/lib/auth'
import { obtenerCuadernos } from '@/lib/queries/notas.queries'
import { ListaCuadernos } from '@/components/features/notas/lista-cuadernos'
import { BotonNuevoCuaderno } from '@/components/features/notas/boton-nuevo-cuaderno'
import { PageHeader } from '@/components/ui/page-header'

export const metadata: Metadata = { title: 'Notas | Noti' }

export default async function PaginaNotas() {
  const user = await requerirUsuario()
  const cuadernos = await obtenerCuadernos(user.id)

  const subtitulo = `${cuadernos.length} cuaderno${cuadernos.length !== 1 ? 's' : ''}`

  return (
    <div>
      <PageHeader
        icon={<NotebookPen size={22} />}
        iconColor="var(--cat-notas)"
        title="Notas"
        subtitle={subtitulo}
        action={<BotonNuevoCuaderno />}
      />
      <ListaCuadernos cuadernos={cuadernos} />
    </div>
  )
}
