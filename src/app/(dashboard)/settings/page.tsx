import type { Metadata } from 'next'
import { requerirUsuario } from '@/lib/auth'
import { getPerfilDelUsuarioActual } from '@/lib/queries/user.queries'
import { getSuscripcionesDelUsuarioActual } from '@/lib/queries/push.queries'
import { FormularioAnticipacion } from '@/components/features/settings/formulario-anticipacion'
import { ListaDispositivos } from '@/components/features/settings/lista-dispositivos'
import { FormularioPerfil } from '@/components/features/settings/formulario-perfil'
import { FormularioResumenDiario } from '@/components/features/settings/formulario-resumen-diario'
import { FormularioAutoDeleteTareas } from '@/components/features/settings/formulario-auto-delete-tareas'
import { FormularioApariencia } from '@/components/features/settings/formulario-apariencia'
import { BotonCerrarSesion } from '@/components/features/settings/boton-cerrar-sesion'

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
        <h1 className="text-2xl font-bold text-foreground">Configuracion</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestiona tus preferencias de notificacion</p>
      </div>

      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Perfil</h2>
        <p className="text-sm text-muted-foreground">
          Tu nombre y zona horaria para las notificaciones.
        </p>
        <FormularioPerfil
          nombreActual={perfil?.nombreMostrado}
          zonaHorariaActual={perfil?.zonaHoraria ?? 'America/Bogota'}
        />
      </section>

      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Apariencia</h2>
        <p className="text-sm text-muted-foreground">
          Elige entre el tema claro, oscuro o el del sistema operativo.
        </p>
        <FormularioApariencia />
      </section>

      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Notificaciones</h2>
        <p className="text-sm text-muted-foreground">
          Con cuanta anticipacion quieres recibir el aviso antes de que venza un recordatorio.
        </p>
        <FormularioAnticipacion anticipacionActual={perfil?.anticipacionNotificacion ?? 15} />
      </section>

      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Dispositivos registrados</h2>
        <p className="text-sm text-muted-foreground">
          Dispositivos que recibiran notificaciones push.
        </p>
        <ListaDispositivos suscripciones={suscripciones} />
      </section>

      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Resumen diario</h2>
        <p className="text-sm text-muted-foreground">
          Recibe una notificacion push cada manana con el resumen de tus recordatorios del dia.
        </p>
        <FormularioResumenDiario
          activoActual={perfil?.resumenDiario ?? false}
          horaActual={perfil?.horaResumen ?? '07:00'}
        />
      </section>

      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Tareas completadas</h2>
        <p className="text-sm text-muted-foreground">
          Cuanto tiempo se conservan las tareas marcadas como completadas antes de eliminarse automaticamente.
        </p>
        <FormularioAutoDeleteTareas valorActual={perfil?.autoEliminarTareasCompletadasDias ?? null} />
      </section>

      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Cuenta</h2>
        <p className="text-sm text-muted-foreground">Gestiona tu sesion activa.</p>
        <BotonCerrarSesion />
      </section>
    </div>
  )
}
