'use client'

import { BENEFICIOS } from './data'

export function Features() {
  return (
    <section
      id="features"
      style={{ paddingTop: 'var(--pad-section)', paddingBottom: 'var(--pad-section)' }}
    >
      <div className="wrap">
        <div className="reveal" style={{ maxWidth: 680, marginBottom: 64 }}>
          <div className="eyebrow">Caracteristicas</div>
          <h2
            style={{
              fontSize: 'clamp(32px,4vw,52px)',
              lineHeight: 1.04,
              marginTop: 14,
            }}
          >
            Hecho para que <span style={{ color: 'var(--ink-3)' }}>de verdad</span> no se te pase.
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--gap)',
          }}
        >
          {BENEFICIOS.map((b, i) => {
            const Icono = b.icono
            return (
              <div
                key={b.titulo}
                className="reveal card-landing"
                data-d={(i % 3) + 1}
                style={{
                  padding: 24,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform .25s ease, border-color .25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ink-4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--line)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 32,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: 'var(--bg-soft)',
                      border: '1px solid var(--line)',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Icono size={16} />
                  </div>
                  <span
                    className="mono"
                    style={{
                      fontSize: 10.5,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--ink-3)',
                    }}
                  >
                    {b.etiqueta}
                  </span>
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 500, letterSpacing: '-0.015em' }}>
                  {b.titulo}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: 'var(--ink-2)',
                    marginTop: 10,
                  }}
                >
                  {b.descripcion}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
