'use client'

import { Check, Sparkles } from 'lucide-react'
import { BENEFICIOS } from './data'

// Bento: las dos primeras BENEFICIOS (push real y chat IA) son destacadas con
// un mini-visual propio; las seis restantes quedan compactas en tres columnas.
const DESTACADAS = BENEFICIOS.slice(0, 2)
const RESTO = BENEFICIOS.slice(2)

export function Features() {
  return (
    <section
      id="features"
      style={{ paddingTop: 'var(--pad-section)', paddingBottom: 'var(--pad-section)' }}
    >
      <div className="wrap">
        <div className="reveal" style={{ maxWidth: 680, marginBottom: 48 }}>
          <div className="eyebrow">Caracteristicas</div>
          <h2
            style={{
              fontSize: 'clamp(32px,4.5vw,56px)',
              lineHeight: 1.04,
              marginTop: 14,
            }}
          >
            Hecho para que <span style={{ color: 'var(--ink-3)' }}>de verdad</span> no se te pase.
          </h2>
        </div>

        <div className="bento-top">
          {DESTACADAS.map((b, i) => {
            const Icono = b.icono
            return (
              <div
                key={b.titulo}
                className="reveal card-landing card-hover"
                data-d={i + 1}
                style={{
                  padding: 28,
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CabeceraCard icono={<Icono size={16} />} etiqueta={b.etiqueta} />
                <h3 style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em' }}>
                  {b.titulo}
                </h3>
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.55,
                    color: 'var(--ink-2)',
                    marginTop: 10,
                    marginBottom: 24,
                  }}
                >
                  {b.descripcion}
                </p>
                <div style={{ marginTop: 'auto' }}>
                  {i === 0 ? <MiniNotificacion /> : <MiniChat />}
                </div>
              </div>
            )
          })}
        </div>

        <div className="bento-resto">
          {RESTO.map((b, i) => {
            const Icono = b.icono
            return (
              <div
                key={b.titulo}
                className="reveal card-landing card-hover"
                data-d={(i % 3) + 1}
                style={{ padding: 24, position: 'relative', overflow: 'hidden' }}
              >
                <CabeceraCard icono={<Icono size={16} />} etiqueta={b.etiqueta} />
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

      <style jsx>{`
        .bento-top {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--gap);
          margin-bottom: var(--gap);
        }
        .bento-resto {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--gap);
        }
        @media (max-width: 980px) {
          .bento-resto {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .bento-top,
          .bento-resto {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  )
}

function CabeceraCard({ icono, etiqueta }: { icono: React.ReactNode; etiqueta: string }) {
  return (
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
        {icono}
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
        {etiqueta}
      </span>
    </div>
  )
}

// Toast de notificacion del sistema en miniatura (estatico, sin interaccion).
function MiniNotificacion() {
  return (
    <div
      style={{
        maxWidth: 360,
        padding: '12px 14px',
        borderRadius: 12,
        border: '1px solid var(--line)',
        background: 'var(--bg-soft)',
        boxShadow: '0 14px 36px -22px rgba(10, 10, 10, 0.25)',
      }}
    >
      <div
        className="mono"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 10,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
          marginBottom: 6,
        }}
      >
        <span>Noti</span>
        <span>ahora</span>
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 500 }}>Clase de ingles</div>
      <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
        hoy, 18:00
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {['Posponer 15 min', 'Completar'].map((accion) => (
          <span
            key={accion}
            className="mono"
            style={{
              fontSize: 10.5,
              padding: '4px 10px',
              borderRadius: 999,
              border: '1px solid var(--line-2)',
              color: 'var(--ink-2)',
            }}
          >
            {accion}
          </span>
        ))}
      </div>
    </div>
  )
}

// Intercambio de chat en miniatura: pregunta del usuario y fecha verificada.
function MiniChat() {
  return (
    <div style={{ maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          alignSelf: 'flex-end',
          padding: '8px 12px',
          borderRadius: '12px 12px 4px 12px',
          background: 'var(--ink)',
          color: 'var(--bg)',
          fontSize: 12.5,
        }}
      >
        avisame cuando salga Dune: Parte 3
      </div>
      <div
        style={{
          alignSelf: 'flex-start',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          borderRadius: '12px 12px 12px 4px',
          border: '1px solid var(--line)',
          background: 'var(--bg-soft)',
          fontSize: 12.5,
        }}
      >
        <Sparkles size={12} style={{ color: 'var(--ink-3)' }} />
        <span>18 dic 2026</span>
        <span
          className="mono"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 10,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
          }}
        >
          <Check size={11} /> TMDB
        </span>
      </div>
    </div>
  )
}
