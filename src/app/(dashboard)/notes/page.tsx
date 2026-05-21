import type { Metadata } from 'next'
import { StickyNote } from 'lucide-react'
import { requerirUsuario } from '@/lib/auth'
import { obtenerCuadernos } from '@/lib/queries/notas.queries'
import { ListaCuadernos } from '@/components/features/notas/lista-cuadernos'
import { BotonNuevoCuaderno } from '@/components/features/notas/boton-nuevo-cuaderno'

export const metadata: Metadata = { title: 'Notas | Noti' }

export default async function PaginaNotas() {
  const user = await requerirUsuario()
  const cuadernos = await obtenerCuadernos(user.id)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50">
            <StickyNote size={20} className="text-indigo-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notas</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {cuadernos.length} cuaderno{cuadernos.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <BotonNuevoCuaderno />
      </div>
      <ListaCuadernos cuadernos={cuadernos} />
    </div>
  )
}
