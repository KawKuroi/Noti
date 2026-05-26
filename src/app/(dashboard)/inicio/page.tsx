import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { isToday } from 'date-fns'
import { requerirUsuario } from '@/lib/auth'
import { getCategorias } from '@/lib/queries/category.queries'
import { getRecordatoriosProximos, getContadoresPorCategoria } from '@/lib/queries/reminder.queries'
import { getPerfilDelUsuarioActual } from '@/lib/queries/user.queries'
import { BotonNuevoRecordatorio } from '@/components/features/reminders/boton-nuevo-recordatorio'
import { ListaRecordatorios } from '@/components/features/reminders/lista-recordatorios'
import { NotificationPrompt } from '@/components/features/notification-prompt'
import { SaludoDinamico } from '@/components/features/inicio/saludo-dinamico'
import { BarraAsistente } from '@/components/features/asistente'
import { MiniCalendario } from '@/components/features/inicio/mini-calendario'
import { ChipsCategoriasSidebar } from '@/components/features/inicio/chips-categorias-sidebar'

export const metadata: Metadata = { title: 'Inicio | Noti' }

interface Props {
  searchParams: Promise<{ categoria?: string }>
}

function construirResumen(recordatorios: { fechaVencimiento: Date | null }[]): string {
  const hoy = recordatorios.filter(
    (r) => r.fechaVencimiento && isToday(r.fechaVencimiento),
  ).length

  if (hoy === 0) return 'No tienes recordatorios para hoy.'
  if (hoy === 1) return 'Tienes 1 recordatorio para hoy.'
  return `Tienes ${hoy} recordatorios para hoy.`
}

function obtenerDiasConRecordatorios(
  recordatorios: { fechaVencimiento: Date | null; categoriaId: number }[],
  categorias: { id: number; color: string }[],
): Record<number, string[]> {
  const mesActual = new Date().getMonth()
  const anioActual = new Date().getFullYear()
  const colorPorCategoria = new Map(categorias.map((c) => [c.id, c.color]))
  const diasMap: Record<number, string[]> = {}

  for (const rec of recordatorios) {
    if (!rec.fechaVencimiento) continue
    const fecha = rec.fechaVencimiento instanceof Date
      ? rec.fechaVencimiento
      : new Date(rec.fechaVencimiento)
    if (fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual) {
      const dia = fecha.getDate()
      const color = colorPorCategoria.get(rec.categoriaId) ?? '#000000'
      if (!diasMap[dia]) diasMap[dia] = []
      if (!diasMap[dia].includes(color)) diasMap[dia].push(color)
    }
  }

  return diasMap
}

export default async function PaginaInicio({ searchParams }: Props) {
  const user = await requerirUsuario()
  const { categoria: categoriaIdParam } = await searchParams

  const [perfil, categorias, todosLosRecordatorios, contadores] = await Promise.all([
    getPerfilDelUsuarioActual(),
    getCategorias(),
    getRecordatoriosProximos(user.id),
    getContadoresPorCategoria(user.id),
  ])

  const nombre = perfil?.nombreMostrado ?? user.email?.split('@')[0] ?? 'Usuario'
  const resumen = construirResumen(todosLosRecordatorios)
  const diasConRecordatorios = obtenerDiasConRecordatorios(todosLosRecordatorios, categorias)

  const recordatoriosFiltrados = categoriaIdParam
    ? todosLosRecordatorios.filter((r) => r.categoriaId === Number(categoriaIdParam))
    : todosLosRecordatorios

  return (
    <div className="max-w-5xl mx-auto">
      <NotificationPrompt />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Columna principal */}
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <SaludoDinamico nombre={nombre} resumen={resumen} />
            <div className="shrink-0">
              <BotonNuevoRecordatorio categorias={categorias} />
            </div>
          </div>

          <BarraAsistente />

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Próximos recordatorios</h2>
              {categoriaIdParam && (
                <Link
                  href="/inicio"
                  className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                >
                  Ver todos
                </Link>
              )}
            </div>

            <ListaRecordatorios
              recordatorios={recordatoriosFiltrados}
              categorias={categorias}
              agrupar={!categoriaIdParam}
              mostrarCategoria={!categoriaIdParam}
              mensajeVacio="Crea tu primer recordatorio"
            />
          </section>
        </div>

        {/* Sidebar derecho */}
        <aside className="space-y-4 lg:sticky lg:top-4">
          <MiniCalendario diasConRecordatorios={diasConRecordatorios} />
          <Suspense fallback={null}>
            <ChipsCategoriasSidebar categorias={categorias} contadores={contadores} />
          </Suspense>
        </aside>
      </div>
    </div>
  )
}
