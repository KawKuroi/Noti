import type { Metadata } from 'next'
import { requerirUsuario } from '@/lib/auth'
import { getPerfilDelUsuarioActual } from '@/lib/queries/user.queries'
import { getSuscripcionesDelUsuarioActual } from '@/lib/queries/push.queries'
import { FormularioAnticipacion } from '@/components/features/settings/formulario-anticipacion'
import { ListaDispositivos } from '@/components/features/settings/lista-dispositivos'
import { FormularioSonido } from '@/components/features/settings/formulario-sonido'
import { FormularioPerfil } from '@/components/features/settings/formulario-perfil'

export const metadata: Metadata = { title: 'Configuracion | Noti' }

export default async function PaginaSettings() {
  await requerirUsuario()

  const [perfil, suscripciones] = await Promise.all([
    getPerfilDelUsuarioActual(),
    getSuscripcionesDelUsuarioActual(),
  ])

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuracion</h1>
        <p className="text-sm text-gray-500 mt-1">Gestiona tus preferencias de notificacion</p>
      </div>

      <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Perfil</h2>
        <p className="text-sm text-gray-500">
          Tu nombre y zona horaria para las notificaciones.
        </p>
        <FormularioPerfil
          nombreActual={perfil?.nombreMostrado}
          zonaHorariaActual={perfil?.zonaHoraria ?? 'America/Bogota'}
        />
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Notificaciones</h2>
        <p className="text-sm text-gray-500">
          Con cuanta anticipacion quieres recibir el aviso antes de que venza un recordatorio.
        </p>
        <FormularioAnticipacion anticipacionActual={perfil?.anticipacionNotificacion ?? 15} />
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Dispositivos registrados</h2>
        <p className="text-sm text-gray-500">
          Dispositivos que recibiran notificaciones push.
        </p>
        <ListaDispositivos suscripciones={suscripciones} />
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Sonido del pomodoro</h2>
        <p className="text-sm text-gray-500">
          Reproduce un beep al terminar cada sesion o descanso del pomodoro.
        </p>
        <FormularioSonido sonidoActual={perfil?.sonidoHabilitado ?? true} />
      </section>
    </div>
  )
}
