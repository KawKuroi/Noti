import type { ReactNode } from 'react'

// Tarjeta contenedora de cada bloque de configuracion en /settings.
// Compartida por la pagina (server) y por formularios cliente que se auto-ocultan.
export function ConfigCard({
  titulo,
  descripcion,
  children,
}: {
  titulo: string
  descripcion?: string
  children: ReactNode
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
        <p style={{ fontSize: '13.5px', color: 'var(--ink-3)', marginBottom: '16px', lineHeight: 1.5 }}>
          {descripcion}
        </p>
      )}
      {children}
    </section>
  )
}
