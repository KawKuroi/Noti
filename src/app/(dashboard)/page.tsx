import { Suspense } from 'react'
import { requerirUsuario } from '@/lib/auth'
import { getCategorias } from '@/lib/queries/category.queries'
import { getRecordatoriosProximos, getContadoresPorCategoria } from '@/lib/queries/reminder.queries'
import { BotonNuevoRecordatorio } from '@/components/features/reminders/boton-nuevo-recordatorio'
import { ListaRecordatorios } from '@/components/features/reminders/lista-recordatorios'
import { FiltroCategorias } from '@/components/features/reminders/filtro-categorias'

interface Props {
  searchParams: Promise<{ categoria?: string }>
}

export default async function PaginaDashboard({ searchParams }: Props) {
  const user = await requerirUsuario()

  const { categoria: categoriaIdParam } = await searchParams

  const [categorias, todosLosRecordatorios, contadores] = await Promise.all([
    getCategorias(),
    getRecordatoriosProximos(user.id),
    getContadoresPorCategoria(user.id),
  ])

  const recordatoriosFiltrados = categoriaIdParam
    ? todosLosRecordatorios.filter((r) => r.categoriaId === Number(categoriaIdParam))
    : todosLosRecordatorios

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proximos recordatorios</h1>
          <p className="text-sm text-gray-500 mt-1">Todo lo que tienes pendiente</p>
        </div>
        <BotonNuevoRecordatorio categorias={categorias} />
      </div>

      <div className="mb-5">
        <Suspense fallback={null}>
          <FiltroCategorias categorias={categorias} contadores={contadores} />
        </Suspense>
      </div>

      <ListaRecordatorios
        recordatorios={recordatoriosFiltrados}
        categorias={categorias}
        agrupar={!categoriaIdParam}
        mostrarCategoria={!categoriaIdParam}
        mensajeVacio="Crea tu primer recordatorio"
      />
    </div>
  )
}
