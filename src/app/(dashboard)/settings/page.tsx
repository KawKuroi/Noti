import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { requerirUsuario } from '@/lib/auth'
import { getPerfilDelUsuarioActual } from '@/lib/queries/user.queries'
import { getSuscripcionesDelUsuarioActual } from '@/lib/queries/push.queries'
import { FormularioAnticipacion } from '@/components/features/settings/formulario-anticipacion'
import { ListaDispositivos } from '@/components/features/settings/lista-dispositivos'
import { FormularioPerfil } from '@/components/features/settings/formulario-perfil'
import { FormularioResumenDiario } from '@/components/features/settings/formulario-resumen-diario'
import { FormularioAutoDeleteTareas } from '@/components/features/settings/formulario-auto-delete-tareas'
import { FormularioApariencia } from '@/components/features/settings/formulario-apariencia'
import { FormularioIdioma } from '@/components/features/settings/formulario-idioma'
import { BotonSugerencias } from '@/components/features/settings/boton-sugerencias'
import { BotonCerrarSesion } from '@/components/features/settings/boton-cerrar-sesion'
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

  const [perfil, suscripciones, localeActual] = await Promise.all([
    getPerfilDelUsuarioActual(),
    getSuscripcionesDelUsuarioActual(),
    getLocale(),
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

      <ConfigCard titulo="Dispositivos registrados" descripcion="Dispositivos que recibiran notificaciones push.">
        <ListaDispositivos suscripciones={suscripciones} />
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

      <ConfigCard titulo="Idioma" descripcion="Elige el idioma de la interfaz.">
        <FormularioIdioma localeActual={localeActual} />
      </ConfigCard>

      <ConfigCard titulo="Sugerencias" descripcion="Tienes una idea o detectaste un bug? Envialo y lo recibo por correo.">
        <BotonSugerencias />
      </ConfigCard>

      <ConfigCard titulo="Cuenta" descripcion="Gestiona tu sesion activa.">
        <BotonCerrarSesion />
      </ConfigCard>
    </div>
  )
}
