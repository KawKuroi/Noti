'use client'

import { useState } from 'react'
import { CATEGORIAS_LANDING } from './data'

export function Categories() {
  const [hover, setHover] = useState(0)
  const activa = CATEGORIAS_LANDING[hover] ?? CATEGORIAS_LANDING[0]
  const IconoActivo = activa.icono

  return (
    <section
      style={{
        paddingTop: 'var(--pad-section)',
        paddingBottom: 'var(--pad-section)',
        borderTop: '1px solid var(--line)',
        background: 'var(--bg-soft)',
      }}
    >
      <div className="wrap">
        <div className="reveal" style={{ marginBottom: 74 }}>
          <div className="eyebrow">Una bandeja, diez tipos</div>
          <h2
            style={{
              fontSize: 'clamp(37px,4.5vw,64px)',
              lineHeight: 1.04,
              marginTop: 16,
              maxWidth: 760,
            }}
          >
            Diez categorias.{' '}
            <span style={{ color: 'var(--ink-3)' }}>Cada una con su logica.</span>
          </h2>
        </div>

        <div className="cat-grid">
          <div className="reveal" data-d="1">
            {CATEGORIAS_LANDING.map((c, i) => {
              const isActive = hover === i
              const Icono = c.icono
              return (
                <div
                  key={c.slug}
                  onMouseEnter={() => setHover(i)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto auto 1fr auto',
                    gap: 18,
                    alignItems: 'center',
                    padding: '18px 4px',
                    borderTop: '1px solid var(--line)',
                    borderBottom:
                      i === CATEGORIAS_LANDING.length - 1 ? '1px solid var(--line)' : 'none',
                    cursor: 'pointer',
                    transition: 'padding-left .2s ease',
                    paddingLeft: isActive ? 12 : 4,
                  }}
                >
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: isActive ? 'var(--ink)' : 'var(--ink-4)',
                      letterSpacing: '0.04em',
                      fontVariantNumeric: 'tabular-nums',
                      transition: 'color .2s ease',
                      width: 24,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      display: 'grid',
                      placeItems: 'center',
                      background: isActive
                        ? `color-mix(in oklab, ${c.color} 16%, transparent)`
                        : 'transparent',
                      color: isActive ? c.color : 'var(--ink-3)',
                      transition: 'all .25s ease',
                    }}
                  >
                    <Icono size={14} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 'clamp(20px, 2.4vw, 28px)',
                        fontWeight: 500,
                        letterSpacing: '-0.02em',
                        color: isActive ? 'var(--ink)' : 'var(--ink-3)',
                        transition: 'color .25s ease',
                      }}
                    >
                      {c.nombre}
                    </div>
                  </div>
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: 'var(--ink-3)',
                      letterSpacing: '0.02em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {c.hint}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="reveal cat-preview" data-d="2" style={{ position: 'sticky', top: 'max(80px, calc(50vh - 180px))' }}>
            <div
              className="mono"
              style={{
                fontSize: 11,
                color: 'var(--ink-3)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              Ejemplo
            </div>
            <div
              key={activa.slug}
              className="card-landing anim-float-in"
              style={{
                padding: 28,
                borderRadius: 18,
                animationDuration: '.4s',
                boxShadow: '0 30px 80px -40px rgba(10,10,10,.18)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
                <span
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    display: 'grid',
                    placeItems: 'center',
                    background: `color-mix(in oklab, ${activa.color} 16%, transparent)`,
                    color: activa.color,
                  }}
                >
                  <IconoActivo size={16} />
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{activa.nombre}</div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 10.5,
                      color: 'var(--ink-3)',
                      marginTop: 2,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {activa.hint}
                  </div>
                </div>
              </div>

              <p
                style={{
                  fontSize: 13.5,
                  color: 'var(--ink-2)',
                  lineHeight: 1.55,
                  marginBottom: 22,
                }}
              >
                {activa.descripcion}
              </p>

              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 18 }}>
                <div
                  className="mono"
                  style={{
                    fontSize: 10.5,
                    color: 'var(--ink-3)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  Proximo
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    letterSpacing: '-0.015em',
                    lineHeight: 1.15,
                  }}
                >
                  {activa.ejemplo.titulo}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 8 }}
                >
                  {activa.ejemplo.fecha}
                </div>
              </div>

              <div style={{ marginTop: 22, display: 'flex', gap: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    padding: '5px 10px',
                    borderRadius: 999,
                    background: `color-mix(in oklab, ${activa.color} 12%, transparent)`,
                    color: activa.color,
                    fontWeight: 500,
                  }}
                >
                  {activa.nombre}
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: 10.5,
                    padding: '5px 10px',
                    borderRadius: 999,
                    background: 'var(--bg-soft)',
                    border: '1px solid var(--line)',
                    color: 'var(--ink-3)',
                    letterSpacing: '0.04em',
                  }}
                >
                  push 06:00
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cat-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
          gap: 55px;
          align-items: start;
        }
        @media (max-width: 840px) {
          .cat-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .cat-preview {
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>
    </section>
  )
}
