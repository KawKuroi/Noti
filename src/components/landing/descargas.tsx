import Link from 'next/link'
import { ArrowRight, Download, Globe, MonitorDown, Smartphone } from 'lucide-react'
import { URL_RELEASES, type EnlacesDescarga } from '@/lib/services/github-releases.service'

interface Props {
  enlaces: EnlacesDescarga
}

// Seccion publica de descargas: la web/PWA es el camino principal y las apps
// nativas (bandeja en Windows, AlarmManager en Android) son opcionales para
// quien quiere notificaciones exactas con todo cerrado.
export function Descargas({ enlaces }: Props) {
  const plataformas = [
    {
      icono: Globe,
      nombre: 'Web',
      hint: 'PWA instalable',
      descripcion:
        'Entra desde cualquier navegador y, si quieres, instalala con un click. Sin descargas, siempre actualizada.',
    },
    {
      icono: MonitorDown,
      nombre: 'Windows',
      hint: 'instalador .exe',
      descripcion:
        'Vive en la bandeja del sistema y avisa con notificaciones nativas aunque cierres la ventana.',
      enlace: enlaces.windows,
    },
    {
      icono: Smartphone,
      nombre: 'Android',
      hint: 'APK directo',
      descripcion:
        'Programa las alarmas en el sistema: la notificacion llega a la hora exacta con la app cerrada. Acepta "origenes desconocidos" al instalar.',
      enlace: enlaces.android,
    },
  ]

  return (
    <section
      id="descargas"
      style={{
        paddingTop: 'var(--pad-section)',
        paddingBottom: 'var(--pad-section)',
        borderTop: '1px solid var(--line)',
      }}
    >
      <div className="wrap">
        <div className="reveal" style={{ marginBottom: 56 }}>
          <div className="eyebrow">Donde tu quieras</div>
          <h2
            style={{
              fontSize: 'clamp(37px,4.5vw,64px)',
              lineHeight: 1.04,
              marginTop: 16,
              maxWidth: 760,
            }}
          >
            Una cuenta.{' '}
            <span style={{ color: 'var(--ink-3)' }}>Web, Windows y Android.</span>
          </h2>
        </div>

        <div
          className="reveal"
          data-d="1"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 18,
          }}
        >
          {plataformas.map((p) => {
            const Icono = p.icono
            return (
              <div
                key={p.nombre}
                className="card-landing card-hover"
                style={{
                  padding: 28,
                  borderRadius: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      display: 'grid',
                      placeItems: 'center',
                      background: 'var(--bg-soft)',
                      border: '1px solid var(--line)',
                      color: 'var(--ink-2)',
                    }}
                  >
                    <Icono size={16} />
                  </span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{p.nombre}</div>
                    <div
                      className="mono"
                      style={{
                        fontSize: 10.5,
                        color: 'var(--ink-3)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        marginTop: 2,
                      }}
                    >
                      {p.hint}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55, flex: 1 }}>
                  {p.descripcion}
                </p>

                {'enlace' in p ? (
                  <a
                    className="btn btn-ghost"
                    style={{ alignSelf: 'flex-start' }}
                    href={p.enlace ?? URL_RELEASES}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download size={14} /> Descargar
                  </a>
                ) : (
                  <Link
                    className="btn btn-primary"
                    style={{ alignSelf: 'flex-start' }}
                    href="/register"
                  >
                    Empezar gratis <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        <p
          className="reveal"
          data-d="2"
          style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 22, lineHeight: 1.5 }}
        >
          Las apps nativas se publican firmadas en{' '}
          <a
            href={URL_RELEASES}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            GitHub Releases
          </a>
          . Misma cuenta y mismos datos en todas las plataformas.
        </p>
      </div>
    </section>
  )
}
