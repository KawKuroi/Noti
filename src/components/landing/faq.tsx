'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { FAQS } from './data'

export function FAQ() {
  const [abierto, setAbierto] = useState<number>(0)

  return (
    <section
      id="faq"
      style={{ paddingTop: 'var(--pad-section)', paddingBottom: 'var(--pad-section)' }}
    >
      <div className="wrap" style={{ maxWidth: 880 }}>
        <div className="reveal" style={{ marginBottom: 32 }}>
          <div className="eyebrow">Preguntas</div>
          <h2 style={{ fontSize: 'clamp(32px,4.5vw,52px)', lineHeight: 1.04, marginTop: 14 }}>
            Lo que <span style={{ color: 'var(--ink-3)' }}>te estas preguntando.</span>
          </h2>
        </div>
        <div className="reveal" data-d="1">
          {FAQS.map((item, i) => (
            <FAQItem
              key={item.pregunta}
              pregunta={item.pregunta}
              respuesta={item.respuesta}
              abierto={abierto === i}
              onToggle={() => setAbierto(abierto === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQItem({
  pregunta,
  respuesta,
  abierto,
  onToggle,
}: {
  pregunta: string
  respuesta: string
  abierto: boolean
  onToggle: () => void
}) {
  return (
    <div style={{ borderBottom: '1px solid var(--line)' }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '22px 0',
          background: 'transparent',
          border: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          color: 'var(--ink)',
        }}
      >
        <span style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em' }}>{pregunta}</span>
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            border: '1px solid var(--line)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            transition: 'transform .25s ease, background .25s ease, color .25s ease',
            transform: abierto ? 'rotate(45deg)' : 'none',
            background: abierto ? 'var(--ink)' : 'transparent',
            color: abierto ? 'var(--bg)' : 'var(--ink-2)',
          }}
        >
          <Plus size={14} />
        </span>
      </button>
      <div
        style={{
          overflow: 'hidden',
          maxHeight: abierto ? 240 : 0,
          opacity: abierto ? 1 : 0,
          transition: 'max-height .35s cubic-bezier(.2,.7,.2,1), opacity .25s ease',
        }}
      >
        <p
          style={{
            paddingBottom: 22,
            fontSize: 15,
            lineHeight: 1.6,
            color: 'var(--ink-2)',
            maxWidth: 720,
          }}
        >
          {respuesta}
        </p>
      </div>
    </div>
  )
}
