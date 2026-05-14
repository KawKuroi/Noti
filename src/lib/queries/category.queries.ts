import { unstable_cache } from 'next/cache'
import { db } from '@/db'
import { categorias } from '@/db/schema'
import type { Categoria } from '@/types/category.types'

export const getCategorias = unstable_cache(
  async (): Promise<Categoria[]> => {
    const filas = await db.select().from(categorias).orderBy(categorias.id)

    return filas.map((f) => ({
      id: f.id,
      slug: f.slug,
      nombre: f.nombre,
      icono: f.icono,
      color: f.color,
      creadaEn: f.creadaEn,
    }))
  },
  ['categorias'],
  { revalidate: false },
)
