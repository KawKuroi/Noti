import type { Metadata } from 'next'
import { Film } from 'lucide-react'

export const metadata: Metadata = { title: 'Lanzamientos | Noti' }
import { requerirUsuario } from '@/lib/auth'
import { getCategorias } from '@/lib/queries/category.queries'
import { getRecordatoriosPorCategoria } from '@/lib/queries/reminder.queries'
import { ListaRecordatorios } from '@/components/features/reminders/lista-recordatorios'
import { ChatLanzamientos } from '@/components/features/movies/chat-lanzamientos'
import { AtribucionFuentes } from '@/components/features/movies/atribucion-fuentes'

export const dynamic = 'force-dynamic'

export default async function PaginaMovies() {
  const user = await requerirUsuario()

  const categorias = await getCategorias()
  const categoriaMovies = categorias.find((c) => c.slug === 'movies')

  const recordatoriosSeguidos = categoriaMovies
    ? await getRecordatoriosPorCategoria(user.id, categoriaMovies.id)
    : []

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${categoriaMovies?.color ?? '#7C3AED'}20` }}
        >
          <span style={{ color: categoriaMovies?.color ?? '#7C3AED' }}>
            <Film size={20} />
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lanzamientos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Pregunta por una pelicula, serie, videojuego o album y lo agendamos.
          </p>
        </div>
      </div>

      <section>
        <ChatLanzamientos />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Mis lanzamientos seguidos
        </h2>
        <ListaRecordatorios
          recordatorios={recordatoriosSeguidos}
          categorias={categorias}
          mensajeVacio="Aun no sigues ningun lanzamiento. Pregunta por uno arriba."
        />
      </section>

      <AtribucionFuentes />
    </div>
  )
}
