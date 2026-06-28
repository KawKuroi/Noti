'use client'

import { useEffect, useState } from 'react'
import { Download, MonitorDown, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { usePWAInstall } from '@/hooks/use-pwa-install'
import { useEsAppNativa } from '@/hooks/use-es-app-nativa'
import { ConfigCard } from './config-card'
import { URL_RELEASES, type EnlacesDescarga } from '@/lib/services/github-releases.service'

const DESCRIPCION =
  'La PWA se instala al instante desde el navegador. Las apps nativas de Windows y Android programan las notificaciones en el sistema, asi que llegan a la hora exacta aunque la app este cerrada; si instalas una, conviene desactivar las notificaciones del navegador en ese dispositivo para no recibirlas duplicadas.'

interface Props {
  enlaces: EnlacesDescarga
}

type Plataforma = 'windows' | 'android' | 'otra'

export function FormularioInstalacion({ enlaces }: Props) {
  const { soportado, instalado, instalar } = usePWAInstall()
  const esAppNativa = useEsAppNativa()

  // La plataforma se detecta tras montar para no divergir del HTML del server.
  const [plataforma, setPlataforma] = useState<Plataforma>('otra')
  useEffect(() => {
    const ua = navigator.userAgent
    if (/Android/i.test(ua)) setPlataforma('android')
    else if (/Windows/i.test(ua)) setPlataforma('windows')
  }, [])

  // Dentro de una app nativa instalada no tiene sentido ofrecer instalar/descargar.
  if (esAppNativa) return null

  const manejarInstalar = async () => {
    await instalar()
    toast.success('Noti instalada')
  }

  const descargas = [
    {
      id: 'windows' as const,
      icono: MonitorDown,
      etiqueta: 'App de escritorio para Windows',
      detalle: 'Vive en la bandeja del sistema; notifica aunque cierres la ventana.',
      enlace: enlaces.windows,
    },
    {
      id: 'android' as const,
      icono: Smartphone,
      etiqueta: 'App de Android (APK)',
      detalle: 'Alarmas exactas del sistema con la app cerrada. Permite "origenes desconocidos" al instalar.',
      enlace: enlaces.android,
    },
  ].sort((a, b) => (a.id === plataforma ? -1 : b.id === plataforma ? 1 : 0))

  return (
    <ConfigCard titulo="Aplicacion" descripcion={DESCRIPCION}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {instalado ? (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--ink-3)' }}>
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            PWA ya instalada en este dispositivo
          </div>
        ) : soportado ? (
          <button
            onClick={manejarInstalar}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors self-start"
            style={{
              background: 'var(--ink)',
              color: 'var(--bg)',
            }}
          >
            <Download size={15} />
            Instalar Noti (PWA)
          </button>
        ) : (
          <p className="text-sm" style={{ color: 'var(--ink-3)' }}>
            Si ya instalaste Noti, abrela desde el menu de inicio de tu sistema (se abre en su propia
            ventana). Si todavia no la instalaste, usa el icono de instalar en la barra de direcciones
            de Chrome o Edge.
          </p>
        )}

        <div style={{ borderTop: '1px solid var(--line)', paddingTop: '14px' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--ink-2)', marginBottom: '10px' }}>
            O descarga la app nativa
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {descargas.map((d) => {
              const Icono = d.icono
              return (
                <a
                  key={d.id}
                  href={d.enlace ?? URL_RELEASES}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 rounded-md transition-colors"
                  style={{
                    padding: '10px 12px',
                    border: '1px solid var(--line)',
                    background: 'var(--bg-soft)',
                  }}
                >
                  <Icono size={16} style={{ color: 'var(--ink-2)', marginTop: '2px' }} />
                  <span>
                    <span className="block text-sm font-medium" style={{ color: 'var(--ink)' }}>
                      {d.etiqueta}
                    </span>
                    <span className="block" style={{ fontSize: '12.5px', color: 'var(--ink-3)', marginTop: '2px' }}>
                      {d.detalle}
                    </span>
                  </span>
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </ConfigCard>
  )
}
