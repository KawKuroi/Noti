import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requerirUsuario } from '@/lib/auth'
import { getCategorias } from '@/lib/queries/category.queries'
import { getRecordatorioPorId } from '@/lib/queries/reminder.queries'
import { VisorNota } from '@/components/features/notas/visor-nota'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const user = await requerirUsuario()
  const nota = await getRecordatorioPorId(user.id, id)
  return { title: nota ? `${nota.titulo} | Noti` : 'Nota | Noti' }
}

export default async function PaginaNota({ params }: Props) {
  const { id } = await params
  const user = await requerirUsuario()

  const [categorias, nota] = await Promise.all([
    getCategorias(),
    getRecordatorioPorId(user.id, id),
  ])

  if (!nota) notFound()

  const categoriaNotas = categorias.find((c) => c.slug === 'notes')
  if (!categoriaNotas || nota.categoriaId !== categoriaNotas.id) notFound()

  return <VisorNota nota={nota} categorias={categorias} />
}
