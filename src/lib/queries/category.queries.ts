import { unstable_cache } from 'next/cache'
import { db } from '@/db'
import { categorias } from '@/db/schema'
import { CATEGORIAS } from '@/lib/utils/constants'
import type { Categoria } from '@/types/category.types'

const COLOR_POR_SLUG = Object.fromEntries(CATEGORIAS.map((c) => [c.slug, c.color]))

export const getCategorias = unstable_cache(
  async (): Promise<Categoria[]> => {
    const filas = await db.select().from(categorias).orderBy(categorias.id)

    return filas.map((f) => ({
      id: f.id,
      slug: f.slug,
      nombre: f.nombre,
      icono: f.icono,
      color: COLOR_POR_SLUG[f.slug] ?? f.color,
      creadaEn: f.creadaEn,
    }))
  },
  ['categorias'],
  { revalidate: false },
)
