import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { requerirUsuario } from '@/lib/auth'
import { getPerfilDelUsuarioActual } from '@/lib/queries/user.queries'
import { getSuscripcionesDelUsuarioActual } from '@/lib/queries/push.queries'
import { getCategorias } from '@/lib/queries/category.queries'
import { cronEstaCaido } from '@/lib/services/cron-health.service'
import { FormularioAnticipacion } from '@/components/features/settings/formulario-anticipacion'
import { ListaDispositivos } from '@/components/features/settings/lista-dispositivos'
import { BotonActivarNotificaciones } from '@/components/features/settings/boton-activar-notificaciones'
import { BotonEnviarPushPrueba } from '@/components/features/settings/boton-enviar-push-prueba'
import { FormularioPerfil } from '@/components/features/settings/formulario-perfil'
import { FormularioResumenDiario } from '@/components/features/settings/formulario-resumen-diario'
import { FormularioAutoDeleteTareas } from '@/components/features/settings/formulario-auto-delete-tareas'
import { FormularioAutoDeleteVencidos } from '@/components/features/settings/formulario-auto-delete-vencidos'
import { FormularioApariencia } from '@/components/features/settings/formulario-apariencia'
import { FormularioIdioma } from '@/components/features/settings/formulario-idioma'
import { FormularioInstalacion } from '@/components/features/settings/formulario-instalacion'
import { BotonSugerencias } from '@/components/features/settings/boton-sugerencias'
import { BotonCerrarSesion } from '@/components/features/settings/boton-cerrar-sesion'
import { BotonBorrarCuenta } from '@/components/features/settings/boton-borrar-cuenta'
import { BotonBorrarRecordatorios } from '@/components/features/settings/boton-borrar-recordatorios'
import { PageHeader } from '@/components/ui/page-header'
import { Settings } from 'lucide-react'

export const metadata: Metadata = { title: 'Configuracion | Noti' }

function ConfigCard({
  titulo,
  descripcion,
  children,
}: {
  titulo: string
  descripcion?: string
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--line)',
        borderRadius: '14px',
        padding: '22px 24px',
      }}
    >
      <h2
        className="font-medium"
        style={{ fontSize: '15px', color: 'var(--ink)', marginBottom: descripcion ? '4px' : '16px' }}
      >
        {titulo}
      </h2>
      {descripcion && (
        <p
          style={{ fontSize: '13.5px', color: 'var(--ink-3)', marginBottom: '16px', lineHeight: 1.5 }}
        >
          {descripcion}
        </p>
      )}
      {children}
    </section>
  )
}

export default async function PaginaSettings() {
  await requerirUsuario()

  const [perfil, suscripciones, localeActual, todasLasCategorias, cronCaido] = await Promise.all([
    getPerfilDelUsuarioActual(),
    getSuscripcionesDelUsuarioActual(),
    getLocale(),
    getCategorias(),
    cronEstaCaido(),
  ])

  return (
    <div className="max-w-2xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        icon={<Settings size={22} />}
        title="Configuracion"
        subtitle="Personaliza tu experiencia en Noti."
      />

      <ConfigCard titulo="Perfil" descripcion="Tu nombre y zona horaria para las notificaciones.">
        <FormularioPerfil
          nombreActual={perfil?.nombreMostrado}
          zonaHorariaActual={perfil?.zonaHoraria ?? 'America/Bogota'}
        />
      </ConfigCard>

      <ConfigCard titulo="Apariencia" descripcion="Elige entre el tema claro, oscuro o el del sistema operativo.">
        <FormularioApariencia />
      </ConfigCard>

      <ConfigCard titulo="Notificaciones" descripcion="Con cuanta anticipacion quieres recibir el aviso antes de que venza un recordatorio.">
        <FormularioAnticipacion anticipacionActual={perfil?.anticipacionNotificacion ?? 15} />
      </ConfigCard>

      <ConfigCard titulo="Dispositivos y notificaciones" descripcion="Activa las notificaciones push en este dispositivo y administra los registrados.">
        {cronCaido === true && (
          <div
            role="alert"
            style={{
              marginBottom: '14px',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #f59e0b55',
              background: '#f59e0b14',
              fontSize: '13px',
              color: 'var(--ink-2)',
              lineHeight: 1.5,
            }}
          >
            El verificador de recordatorios lleva mas de 10 minutos sin ejecutarse. Las
            notificaciones pueden estar retrasadas. Revisa los jobs en cron-job.org.
          </div>
        )}
        <BotonActivarNotificaciones />
        <div className="mt-4">
          <ListaDispositivos suscripciones={suscripciones} />
        </div>
        <div className="mt-4">
          <BotonEnviarPushPrueba />
        </div>
      </ConfigCard>

      <ConfigCard titulo="Resumen diario" descripcion="Recibe una notificacion push cada manana con el resumen de tus recordatorios del dia.">
        <FormularioResumenDiario
          activoActual={perfil?.resumenDiario ?? false}
          horaActual={perfil?.horaResumen ?? '07:00'}
        />
      </ConfigCard>

      <ConfigCard titulo="Tareas completadas" descripcion="Cuanto tiempo se conservan las tareas marcadas como completadas antes de eliminarse automaticamente.">
        <FormularioAutoDeleteTareas valorActual={perfil?.autoEliminarTareasCompletadasDias ?? null} />
      </ConfigCard>

      <ConfigCard titulo="Recordatorios vencidos" descripcion="Cuanto tiempo se conservan los recordatorios con fecha fija ya pasada (eventos, pendientes con fecha, etc.) antes de eliminarse automaticamente. No aplica a recurrentes como cumpleanos.">
        <FormularioAutoDeleteVencidos valorActual={perfil?.autoEliminarVencidosDias ?? null} />
      </ConfigCard>

      <ConfigCard titulo="Aplicacion" descripcion="Instala Noti como app nativa para recibir notificaciones aunque el navegador este cerrado.">
        <FormularioInstalacion />
      </ConfigCard>

      <ConfigCard titulo="Idioma" descripcion="Elige el idioma de la interfaz.">
        <FormularioIdioma localeActual={localeActual} />
      </ConfigCard>

      <ConfigCard titulo="Sugerencias" descripcion="Tienes una idea o detectaste un bug? Envialo y lo recibo por correo.">
        <BotonSugerencias />
      </ConfigCard>

      <ConfigCard titulo="Cuenta" descripcion="Gestiona tu sesion activa.">
        <BotonCerrarSesion />
      </ConfigCard>

      <ConfigCard
        titulo="Zona de peligro"
        descripcion="Acciones destructivas con ventana de recuperacion de 30 dias. Recibirás un correo con el enlace para deshacer la accion."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <BotonBorrarRecordatorios
            categorias={todasLasCategorias.map((c) => ({ id: c.id, nombre: c.nombre }))}
          />
          <BotonBorrarCuenta />
        </div>
      </ConfigCard>
    </div>
  )
}
