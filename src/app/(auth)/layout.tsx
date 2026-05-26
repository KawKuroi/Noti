export const dynamic = 'force-dynamic'

interface Props {
  children: React.ReactNode
}

export default function LayoutAuth({ children }: Props) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: 'var(--bg)',
      }}
      className="auth-layout"
    >
      {/* Columna izquierda — formulario */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(32px, 6vw, 80px)',
          maxWidth: '480px',
          margin: '0 auto',
          width: '100%',
        }}
        className="auth-form-col"
      >
        {/* Logo */}
        <div style={{ marginBottom: '40px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              background: 'var(--ink)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                color: 'var(--bg)',
                fontWeight: 700,
                fontSize: '18px',
                fontFamily: 'inherit',
                letterSpacing: '-0.04em',
              }}
            >
              N
            </span>
          </div>
        </div>

        {children}
      </div>

      {/* Columna derecha — visual marketing. Fondo oscuro fijo (no se invierte en dark mode). */}
      <div
        className="auth-visual-col"
        style={{
          background: 'var(--panel-dark-bg)',
          color: 'var(--panel-dark-ink)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'clamp(32px, 6vw, 80px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Dot-grid sutil */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle, rgba(250,250,250,0.12) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            pointerEvents: 'none',
          }}
        />

        {/* Contenido */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p
            className="mono"
            style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(250,250,250,0.5)',
              marginBottom: '28px',
            }}
          >
            Push reales &middot; Sin apps &middot; Sin ruido
          </p>

          <h2
            style={{
              fontSize: 'clamp(28px, 3.5vw, 42px)',
              fontWeight: 500,
              letterSpacing: '-0.028em',
              lineHeight: 1.15,
              color: 'rgba(250,250,250,1)',
            }}
          >
            Recuerda lo que<br />
            <span style={{ color: 'rgba(250,250,250,0.45)' }}>importa.</span>
          </h2>
        </div>

        {/* Mini-notificaciones */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {[
            { emoji: '🎬', titulo: 'GTA VI', sub: 'Estreno en 2 días' },
            { emoji: '🎂', titulo: 'Cumpleaños de Laura', sub: 'Mañana · 12:00' },
            { emoji: '📚', titulo: 'Entregar informe', sub: 'Hoy · 18:00' },
          ].map(({ emoji, titulo, sub }) => (
            <div
              key={titulo}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <span style={{ fontSize: '20px', flexShrink: 0 }}>{emoji}</span>
              <div>
                <p
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'rgba(250,250,250,0.9)',
                    lineHeight: 1.2,
                  }}
                >
                  {titulo}
                </p>
                <p
                  className="mono"
                  style={{ fontSize: '11px', color: 'rgba(250,250,250,0.4)', fontWeight: 500 }}
                >
                  {sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer mono */}
        <p
          className="mono"
          style={{
            position: 'relative',
            zIndex: 1,
            fontSize: '10.5px',
            color: 'rgba(250,250,250,0.28)',
            fontWeight: 500,
            letterSpacing: '0.04em',
          }}
        >
          noti.app &middot; Recordatorios inteligentes
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-layout {
            grid-template-columns: 1fr !important;
          }
          .auth-visual-col {
            display: none !important;
          }
          .auth-form-col {
            max-width: 100% !important;
            padding: 32px 24px !important;
          }
        }
      `}</style>
    </div>
  )
}
