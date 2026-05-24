import { notFound } from 'next/navigation'
import {
  BookOpen,
  CalendarDays,
  Cake,
  CheckSquare,
  MapPin,
} from 'lucide-react'
import { requerirUsuario } from '@/lib/auth'
import { getCategorias } from '@/lib/queries/category.queries'
import { getRecordatoriosPorCategoriaPaginados } from '@/lib/queries/reminder.queries'
import { getPerfilDelUsuarioActual } from '@/lib/queries/user.queries'
import { BotonNuevoRecordatorio } from '@/components/features/reminders/boton-nuevo-recordatorio'
import { ListaRecordatoriosPaginada } from '@/components/features/reminders/lista-recordatorios-paginada'
import { BarraAsistente } from '@/components/features/asistente'
import { SLUGS_VALIDOS } from '@/lib/utils/constants'

const ICONOS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  BookOpen,
  CalendarDays,
  Cake,
  CheckSquare,
  MapPin,
}

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ destacado?: string }>
}

export default async function PaginaCategoria({ params, searchParams }: Props) {
  const { slug } = await params
  const { destacado } = await searchParams

  if (!SLUGS_VALIDOS.includes(slug as (typeof SLUGS_VALIDOS)[number]) || slug === 'notes') {
    notFound()
  }

  const user = await requerirUsuario()

  const categorias = await getCategorias()
  const categoria = categorias.find((c) => c.slug === slug)

  if (!categoria) notFound()

  const [{ recordatorios, hasMas }, perfil] = await Promise.all([
    getRecordatoriosPorCategoriaPaginados(user.id, categoria.id, 20, 0, 'fecha-asc'),
    slug === 'tasks' ? getPerfilDelUsuarioActual() : Promise.resolve(null),
  ])

  const Icono = ICONOS[categoria.icono]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icono && (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${categoria.color}20` }}
            >
              <span style={{ color: categoria.color }}>
                <Icono size={20} />
              </span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{categoria.nombre}</h1>
          </div>
        </div>
        <BotonNuevoRecordatorio categorias={categorias} slugInicial={slug} />
      </div>

      <div className="mb-6">
        <BarraAsistente />
      </div>

      <ListaRecordatoriosPaginada
        recordatoriosIniciales={recordatorios}
        hasMasInicial={hasMas}
        categoriaId={categoria.id}
        categorias={categorias}
        mensajeVacio={`Sin recordatorios en ${categoria.nombre}`}
        diasAutoEliminar={perfil?.autoEliminarTareasCompletadasDias ?? null}
        destacadoId={destacado}
      />
    </div>
  )
}
