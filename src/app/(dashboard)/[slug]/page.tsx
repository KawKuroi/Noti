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
import { getRecordatoriosPorCategoria } from '@/lib/queries/reminder.queries'
import { BotonNuevoRecordatorio } from '@/components/features/reminders/boton-nuevo-recordatorio'
import { ListaRecordatorios } from '@/components/features/reminders/lista-recordatorios'
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
}

export default async function PaginaCategoria({ params }: Props) {
  const { slug } = await params

  if (!SLUGS_VALIDOS.includes(slug as (typeof SLUGS_VALIDOS)[number])) {
    notFound()
  }

  const user = await requerirUsuario()

  const categorias = await getCategorias()
  const categoria = categorias.find((c) => c.slug === slug)

  if (!categoria) notFound()

  const recordatorios = await getRecordatoriosPorCategoria(user.id, categoria.id)

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
            <h1 className="text-2xl font-bold text-gray-900">{categoria.nombre}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {recordatorios.length} recordatorio{recordatorios.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <BotonNuevoRecordatorio categorias={categorias} slugInicial={slug} />
      </div>

      <ListaRecordatorios
        recordatorios={recordatorios}
        categorias={categorias}
        mensajeVacio={`Sin recordatorios en ${categoria.nombre}`}
      />
    </div>
  )
}
