'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Github, Mic, Sparkles } from 'lucide-react'
import { EJEMPLOS_HERO, REPO_URL } from './data'
import { useTypewriter } from './hooks'

const HEADLINE = ['Recuerda lo que importa.', 'Sin apps. Sin ruido.']
const EYE = 'Push reales - Sin apps - Sin ruido'
const SUB = 'PWA minimalista con push reales, chat IA y categorias. Gratis, para siempre.'

export function Hero() {
  return (
    <section style={{ position: 'relative', paddingTop: 130, paddingBottom: 'var(--pad-section)' }}>
      <div
        className="dotgrid"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          maskImage: 'radial-gradient(ellipse at 50% 30%, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 0%, transparent 70%)',
          opacity: 0.6,
        }}
      />
      <div className="wrap" style={{ position: 'relative' }}>
        <div style={{ textAlign: 'center', maxWidth: 820, margin: '0 auto' }}>
          <div className="reveal in eyebrow">{EYE}</div>
          <h1
            className="reveal in"
            data-d="1"
            style={{
              fontSize: 'clamp(44px, 7vw, 88px)',
              lineHeight: 0.96,
              marginTop: 22,
              marginBottom: 22,
              fontWeight: 500,
            }}
          >
            {HEADLINE.map((linea, i) => (
              <span key={i} style={{ display: 'block' }}>
                {i === HEADLINE.length - 1 ? (
                  <span style={{ color: 'var(--ink-3)' }}>{linea}</span>
                ) : (
                  linea
                )}
              </span>
            ))}
          </h1>
          <p
            className="reveal in"
            data-d="2"
            style={{
              fontSize: 'clamp(16px, 1.4vw, 19px)',
              lineHeight: 1.55,
              color: 'var(--ink-2)',
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            {SUB}
          </p>
          <div
            className="reveal in"
            data-d="3"
            style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
              marginTop: 32,
              flexWrap: 'wrap',
            }}
          >
            <Link className="btn btn-primary" href="/register">
              Empezar gratis <ArrowRight size={14} />
            </Link>
            <a className="btn btn-ghost" href={REPO_URL} target="_blank" rel="noreferrer">
              <Github size={16} /> Ver en GitHub
            </a>
          </div>
        </div>

        <div className="reveal in" data-d="5" style={{ marginTop: 64 }}>
          <HeroChat />
        </div>
      </div>
    </section>
  )
}

type Fase = 'typing' | 'thinking' | 'reply'

function HeroChat() {
  const [idx, setIdx] = useState(0)
  const [fase, setFase] = useState<Fase>('typing')
  const ej = EJEMPLOS_HERO[idx]
  const tipeado = useTypewriter(ej.user, 42, 250)

  useEffect(() => {
    setFase('typing')
    const duracionTipeo = 250 + ej.user.length * 42 + 200
    const tFinish = setTimeout(() => setFase('thinking'), duracionTipeo)
    const tReply = setTimeout(() => setFase('reply'), duracionTipeo + 700)
    const tNext = setTimeout(
      () => setIdx((i) => (i + 1) % EJEMPLOS_HERO.length),
      duracionTipeo + 700 + 2800,
    )
    return () => {
      clearTimeout(tFinish)
      clearTimeout(tReply)
      clearTimeout(tNext)
    }
  }, [idx, ej.user.length])

  const IconoReply = ej.reply.icono

  return (
    <div style={{ width: '100%', maxWidth: 520, margin: '0 auto' }}>
      <div
        className="card-landing"
        style={{
          padding: 16,
          borderRadius: 18,
          boxShadow: '0 30px 80px -30px rgba(10,10,10,.18)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '4px 6px 14px',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 7,
              background: 'var(--ink)',
              color: 'var(--bg)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Sparkles size={13} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Asistente</div>
          <div
            className="mono"
            style={{
              fontSize: 10.5,
              color: 'var(--ink-3)',
              marginLeft: 'auto',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Lenguaje natural
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: '16px 6px 12px',
            minHeight: 170,
          }}
        >
          <div style={{ alignSelf: 'flex-end', maxWidth: '82%' }}>
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '14px 14px 4px 14px',
                background: 'var(--ink)',
                color: 'var(--bg)',
                fontSize: 13.5,
              }}
            >
              {tipeado}
              {fase === 'typing' && (
                <span
                  className="anim-blink"
                  style={{
                    display: 'inline-block',
                    width: 2,
                    height: 14,
                    background: 'var(--bg)',
                    marginLeft: 2,
                    verticalAlign: '-2px',
                  }}
                />
              )}
            </div>
          </div>

          {fase === 'thinking' && (
            <div
              style={{
                alignSelf: 'flex-start',
                display: 'flex',
                gap: 4,
                padding: '10px 14px',
                background: 'var(--bg-soft)',
                borderRadius: '14px 14px 14px 4px',
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 99,
                    background: 'var(--ink-3)',
                    animation: `landing-pulse 1.1s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
          )}

          {fase === 'reply' && (
            <div
              className="anim-float-in"
              style={{ alignSelf: 'flex-start', maxWidth: '92%', animationDuration: '.35s' }}
            >
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6, paddingLeft: 4 }}>
                Creado:
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: 12,
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'var(--bg-soft)',
                  border: '1px solid var(--line)',
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    display: 'grid',
                    placeItems: 'center',
                    background: `color-mix(in oklab, ${ej.reply.color} 16%, transparent)`,
                    color: ej.reply.color,
                  }}
                >
                  <IconoReply size={14} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{ej.reply.titulo}</div>
                  <div
                    className="mono"
                    style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}
                  >
                    {ej.reply.fecha}
                  </div>
                </div>
                <span
                  className="mono"
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '4px 8px',
                    borderRadius: 99,
                    background: `color-mix(in oklab, ${ej.reply.color} 14%, transparent)`,
                    color: ej.reply.color,
                  }}
                >
                  {ej.reply.cat}
                </span>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 6,
            padding: '10px 12px',
            borderRadius: 12,
            background: 'var(--bg-soft)',
            border: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: 'var(--ink-3)',
            fontSize: 13,
          }}
        >
          <Mic size={14} />
          <span style={{ flex: 1 }}>&quot;recordame algo...&quot;</span>
          <span
            className="mono"
            style={{ fontSize: 10.5, color: 'var(--ink-4)', letterSpacing: '0.06em' }}
          >
            return
          </span>
        </div>
      </div>
    </div>
  )
}
