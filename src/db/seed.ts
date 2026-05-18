import { config } from 'dotenv'
config({ path: '.env.local' })
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { categorias } from './schema'

const CATEGORIAS = [
  { slug: 'movies', nombre: 'Peliculas', icono: 'Film', color: '#7C3AED' },
  { slug: 'tv', nombre: 'Series', icono: 'Tv', color: '#0EA5E9' },
  { slug: 'games', nombre: 'Videojuegos', icono: 'Gamepad2', color: '#16A34A' },
  { slug: 'music', nombre: 'Musica', icono: 'Music', color: '#EA580C' },
  { slug: 'books', nombre: 'Libros', icono: 'BookMarked', color: '#8B5CF6' },
  { slug: 'study', nombre: 'Estudio', icono: 'BookOpen', color: '#0284C7' },
  { slug: 'classes', nombre: 'Clases', icono: 'CalendarDays', color: '#059669' },
  { slug: 'birthdays', nombre: 'Cumpleanos', icono: 'Cake', color: '#DB2777' },
  { slug: 'tasks', nombre: 'Tareas', icono: 'CheckSquare', color: '#D97706' },
  { slug: 'events', nombre: 'Eventos', icono: 'MapPin', color: '#DC2626' },
  { slug: 'notes', nombre: 'Notas', icono: 'StickyNote', color: '#6366F1' },
]

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool)

async function seed() {
  console.log('Iniciando seed de categorias...')

  for (const cat of CATEGORIAS) {
    await db
      .insert(categorias)
      .values({
        slug: cat.slug,
        nombre: cat.nombre,
        icono: cat.icono,
        color: cat.color,
      })
      .onConflictDoNothing()
  }

  console.log(`${CATEGORIAS.length} categorias insertadas (o ya existian).`)
  await pool.end()
}

seed().catch((err) => {
  console.error('Error en seed:', err)
  process.exit(1)
})
