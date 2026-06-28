import type { Metadata } from 'next'
import { Clapperboard } from 'lucide-react'
import { requerirUsuario } from '@/lib/auth'
import { getCategorias } from '@/lib/queries/category.queries'
import { getRecordatoriosPorCategoria, getLanzamientosTodos } from '@/lib/queries/reminder.queries'
import { HubLanzamientos } from '@/components/features/lanzamientos/hub-lanzamientos'
import { AtribucionFuentes } from '@/components/features/lanzamientos/atribucion-fuentes'
import { BarraAsistente } from '@/components/features/asistente'
import { PageHeader } from '@/components/ui/page-header'
import { SLUGS_LANZAMIENTO } from '@/lib/utils/constants'

export const metadata: Metadata = { title: { absolute: 'Lanzamientos' } }
export const dynamic = 'force-dynamic'

export default async function PaginaLanzamientos() {
  const user = await requerirUsuario()
  const categorias = await getCategorias()

  const categoriasLanzamiento = categorias.filter((c) =>
    (SLUGS_LANZAMIENTO as readonly string[]).includes(c.slug),
  )

  const [datos, todos] = await Promise.all([
    Promise.all(
      categoriasLanzamiento.map(async (cat) => ({
        cat,
        recordatorios: await getRecordatoriosPorCategoria(user.id, cat.id),
      })),
    ),
    getLanzamientosTodos(user.id),
  ])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Lanzamientos"
        subtitle="Películas, series, videojuegos, música y libros."
        icon={<Clapperboard size={20} />}
        iconColor="var(--cat-series)"
      />

      <BarraAsistente placeholder="Pídele a la IA un estreno: «GTA 6 nov 19»" />

      <section className="pt-2">
        <HubLanzamientos datos={datos} todos={todos} categorias={categorias} />
      </section>

      <AtribucionFuentes />
    </div>
  )
}
