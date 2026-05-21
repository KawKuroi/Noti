import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requerirUsuario } from '@/lib/auth'
import { getCategorias } from '@/lib/queries/category.queries'
import { getRecordatorioPorId } from '@/lib/queries/reminder.queries'
import { obtenerEntradas } from '@/lib/queries/notas.queries'
import { obtenerAdjuntos } from '@/lib/queries/adjuntos.queries'
import { VistaChatNotas } from '@/components/features/notas/vista-chat'
import type { CuadernoConPrevia } from '@/types/notas.types'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const user = await requerirUsuario()
  const nota = await getRecordatorioPorId(user.id, id)
  return { title: nota ? `${nota.titulo} | Noti` : 'Cuaderno | Noti' }
}

export default async function PaginaCuaderno({ params }: Props) {
  const { id } = await params
  const user = await requerirUsuario()

  const [categorias, nota, entradas, adjuntos] = await Promise.all([
    getCategorias(),
    getRecordatorioPorId(user.id, id),
    obtenerEntradas(id, user.id),
    obtenerAdjuntos(id, user.id),
  ])

  if (!nota) notFound()

  const categoriaNotas = categorias.find((c) => c.slug === 'notes')
  if (!categoriaNotas || nota.categoriaId !== categoriaNotas.id) notFound()

  const cuaderno: CuadernoConPrevia = {
    id: nota.id,
    titulo: nota.titulo,
    creadoEn: nota.creadoEn.toISOString(),
    actualizadoEn: nota.actualizadoEn.toISOString(),
    ultimaEntrada: entradas.length > 0 ? entradas[entradas.length - 1] : null,
    totalEntradas: entradas.length,
  }

  return (
    <VistaChatNotas
      cuaderno={cuaderno}
      entradasIniciales={entradas}
      adjuntosIniciales={adjuntos}
    />
  )
}
