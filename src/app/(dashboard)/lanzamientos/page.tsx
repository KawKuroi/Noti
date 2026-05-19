import type { Metadata } from 'next'
import { Clapperboard } from 'lucide-react'
import { requerirUsuario } from '@/lib/auth'
import { getCategorias } from '@/lib/queries/category.queries'
import { getRecordatoriosPorCategoria } from '@/lib/queries/reminder.queries'
import { HubLanzamientos } from '@/components/features/lanzamientos/hub-lanzamientos'
import { AtribucionFuentes } from '@/components/features/lanzamientos/atribucion-fuentes'
import { BotonAbrirAsistente } from '@/components/features/lanzamientos/boton-abrir-asistente'
import { SLUGS_LANZAMIENTO } from '@/lib/utils/constants'

export const metadata: Metadata = { title: 'Lanzamientos | Noti' }
export const dynamic = 'force-dynamic'

export default async function PaginaLanzamientos() {
  const user = await requerirUsuario()
  const categorias = await getCategorias()

  const categoriasLanzamiento = categorias.filter((c) =>
    (SLUGS_LANZAMIENTO as readonly string[]).includes(c.slug),
  )

  const datos = await Promise.all(
    categoriasLanzamiento.map(async (cat) => ({
      cat,
      recordatorios: await getRecordatoriosPorCategoria(user.id, cat.id),
    })),
  )

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50">
            <span className="text-purple-600">
              <Clapperboard size={20} />
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lanzamientos</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Peliculas, series, videojuegos, musica y libros.
            </p>
          </div>
        </div>
        <BotonAbrirAsistente />
      </div>

      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Mis lanzamientos seguidos
        </h2>
        <HubLanzamientos datos={datos} categorias={categorias} />
      </section>

      <AtribucionFuentes />
    </div>
  )
}
