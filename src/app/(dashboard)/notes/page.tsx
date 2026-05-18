import type { Metadata } from 'next'
import { StickyNote } from 'lucide-react'
import { requerirUsuario } from '@/lib/auth'
import { getCategorias } from '@/lib/queries/category.queries'
import { getNotas } from '@/lib/queries/reminder.queries'
import { TarjetaNota } from '@/components/features/notas/tarjeta-nota'
import { BotonNuevaNota } from '@/components/features/notas/boton-nueva-nota'
import { EmptyState } from '@/components/features/empty-state'

export const metadata: Metadata = { title: 'Notas | Noti' }

export default async function PaginaNotas() {
  const user = await requerirUsuario()

  const [categorias, notas] = await Promise.all([
    getCategorias(),
    getNotas(user.id),
  ])

  const categoriaNotas = categorias.find((c) => c.slug === 'notes')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${categoriaNotas?.color ?? '#6366F1'}20` }}
          >
            <StickyNote
              size={20}
              style={{ color: categoriaNotas?.color ?? '#6366F1' }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notas</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {notas.length} nota{notas.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <BotonNuevaNota categorias={categorias} />
      </div>

      {notas.length === 0 ? (
        <EmptyState
          titulo="Sin notas todavia"
          descripcion="Crea tu primera nota para guardar ideas, listas o cualquier cosa que quieras recordar."
          accion={<BotonNuevaNota categorias={categorias} />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {notas.map((nota) => (
            <TarjetaNota key={nota.id} nota={nota} categorias={categorias} />
          ))}
        </div>
      )}
    </div>
  )
}
