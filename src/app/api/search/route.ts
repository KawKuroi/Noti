import { obtenerUsuario } from '@/lib/auth'
import { buscarRecordatorios } from '@/lib/queries/reminder.queries'
import { getCategorias } from '@/lib/queries/category.queries'
import { verificarLimite } from '@/lib/utils/rate-limit'

export async function GET(req: Request) {
  const usuario = await obtenerUsuario()
  if (!usuario) return new Response('No autenticado', { status: 401 })

  const limite = await verificarLimite(`search:${usuario.id}`, 30, 60_000)
  if (!limite.ok) {
    return new Response('Demasiadas peticiones', {
      status: 429,
      headers: { 'Retry-After': String(limite.retryAfter ?? 60) },
    })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return Response.json([])
  }

  const [resultados, categorias] = await Promise.all([
    buscarRecordatorios(usuario.id, q),
    getCategorias(),
  ])

  const categoriasMap = Object.fromEntries(categorias.map((c) => [c.id, c]))

  const data = resultados.map((r) => ({
    id: r.id,
    titulo: r.titulo,
    descripcion: r.descripcion,
    fechaVencimiento: r.fechaVencimiento,
    categoria: categoriasMap[r.categoriaId] ?? null,
  }))

  return Response.json(data)
}
