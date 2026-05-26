'use client'

import { useEffect, useRef, useState } from 'react'
import { Lock, Mic, Send, Sparkles } from 'lucide-react'
import { EJEMPLOS_IA } from './data'

type Fase = 'idle' | 'typing' | 'thinking' | 'done'

export function AIDemo() {
  const [seleccionado, setSeleccionado] = useState(0)
  const [fase, setFase] = useState<Fase>('idle')
  const [tipeado, setTipeado] = useState('')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const intervalo = useRef<ReturnType<typeof setInterval> | null>(null)

  const reset = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (intervalo.current) {
      clearInterval(intervalo.current)
      intervalo.current = null
    }
    setFase('idle')
    setTipeado('')
  }

  const correr = (idx: number) => {
    reset()
    setSeleccionado(idx)
    const ej = EJEMPLOS_IA[idx]
    setFase('typing')
    let i = 0
    intervalo.current = setInterval(() => {
      i += 1
      setTipeado(ej.prompt.slice(0, i))
      if (i >= ej.prompt.length && intervalo.current) {
        clearInterval(intervalo.current)
        intervalo.current = null
      }
    }, 40)
    timers.current.push(setTimeout(() => setFase('thinking'), 200 + ej.prompt.length * 40))
    timers.current.push(setTimeout(() => setFase('done'), 200 + ej.prompt.length * 40 + 900))
  }

  useEffect(() => {
    const t = setTimeout(() => correr(0), 800)
    return () => {
      clearTimeout(t)
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (fase === 'done') {
      const t = setTimeout(() => {
        const next = (seleccionado + 1) % EJEMPLOS_IA.length
        correr(next)
      }, 4200)
      timers.current.push(t)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, seleccionado])

  const ej = EJEMPLOS_IA[seleccionado]
  const IconoEj = ej.icono

  return (
    <section
      id="demo"
      style={{ paddingTop: 'var(--pad-section)', paddingBottom: 'var(--pad-section)' }}
    >
      <div className="wrap">
        <div className="reveal" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 56px' }}>
          <div className="eyebrow" style={{ justifyContent: 'center' }}>
            El asistente
          </div>
          <h2 style={{ fontSize: 'clamp(32px,4.5vw,56px)', lineHeight: 1.04, marginTop: 14 }}>
            Lo escribes como hablas.
            <br />
            <span style={{ color: 'var(--ink-3)' }}>Lo entiende como debe.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.55, marginTop: 18 }}>
            El chat IA agenda recordatorios desde texto libre. Para estrenos consulta fuentes reales
            (TMDB, RAWG, MusicBrainz, Google Books). Nunca inventa fechas.
          </p>
        </div>

        <div className="reveal demo-grid" data-d="2">
          <div>
            <div
              className="mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                marginBottom: 14,
              }}
            >
              Prueba un prompt
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {EJEMPLOS_IA.map((p, i) => {
                const activo = i === seleccionado
                const IconoP = p.icono
                return (
                  <button
                    key={p.prompt}
                    type="button"
                    onClick={() => correr(i)}
                    style={{
                      textAlign: 'left',
                      padding: '14px 16px',
                      borderRadius: 12,
                      background: activo ? 'var(--ink)' : 'var(--bg-elev)',
                      color: activo ? 'var(--bg)' : 'var(--ink)',
                      border: `1px solid ${activo ? 'var(--ink)' : 'var(--line)'}`,
                      cursor: 'pointer',
                      transition: 'all .2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 14,
                    }}
                  >
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        display: 'grid',
                        placeItems: 'center',
                        background: activo
                          ? 'rgba(255,255,255,.1)'
                          : `color-mix(in oklab, ${p.color} 14%, transparent)`,
                        color: activo ? 'var(--bg)' : p.color,
                        flexShrink: 0,
                      }}
                    >
                      <IconoP size={14} />
                    </span>
                    <span
                      className="mono"
                      style={{ flex: 1, fontSize: 13 }}
                    >
                      &quot;{p.prompt}&quot;
                    </span>
                    {activo && <span style={{ opacity: 0.5, fontSize: 12 }}>{'>'}</span>}
                  </button>
                )
              })}
            </div>
          </div>

          <div
            className="card-landing"
            style={{
              padding: 18,
              borderRadius: 18,
              minHeight: 380,
              boxShadow: '0 30px 80px -30px rgba(10,10,10,.18)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                paddingBottom: 14,
                borderBottom: '1px solid var(--line)',
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  background: 'var(--ink)',
                  color: 'var(--bg)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Sparkles size={13} />
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>Asistente</div>
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
                Groq - Llama 3.3 70B
              </div>
            </div>

            <div
              style={{
                flex: 1,
                padding: '16px 4px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                minHeight: 220,
              }}
            >
              <div style={{ alignSelf: 'flex-end', maxWidth: '85%' }}>
                <div
                  className="mono"
                  style={{
                    padding: '10px 14px',
                    borderRadius: '14px 14px 4px 14px',
                    background: 'var(--ink)',
                    color: 'var(--bg)',
                    fontSize: 14,
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
                <div style={{ alignSelf: 'flex-start' }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: 4,
                      padding: '12px 16px',
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
                  {ej.fuente !== 'manual' && (
                    <div
                      className="mono"
                      style={{
                        marginTop: 8,
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        paddingLeft: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: 99,
                          background: ej.color,
                          animation: 'landing-pulse 1.1s ease-in-out infinite',
                        }}
                      />
                      consultando {ej.fuente}...
                    </div>
                  )}
                </div>
              )}

              {fase === 'done' && (
                <div
                  className="anim-float-in"
                  style={{
                    alignSelf: 'flex-start',
                    maxWidth: '95%',
                    width: '100%',
                    animationDuration: '.4s',
                  }}
                >
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6, paddingLeft: 4 }}>
                    Recordatorio creado{ej.fuente !== 'manual' ? ` - fuente: ${ej.fuente}` : ''}
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      gap: 12,
                      alignItems: 'center',
                      padding: '14px 16px',
                      borderRadius: 12,
                      background: 'var(--bg-soft)',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 9,
                        display: 'grid',
                        placeItems: 'center',
                        background: `color-mix(in oklab, ${ej.color} 16%, transparent)`,
                        color: ej.color,
                      }}
                    >
                      <IconoEj size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{ej.titulo}</div>
                      <div
                        className="mono"
                        style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}
                      >
                        {ej.fecha}
                      </div>
                    </div>
                    <span
                      className="mono"
                      style={{
                        fontSize: 10.5,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '5px 9px',
                        borderRadius: 99,
                        background: `color-mix(in oklab, ${ej.color} 14%, transparent)`,
                        color: ej.color,
                      }}
                    >
                      {ej.cat}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                padding: '12px 14px',
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
              <span style={{ flex: 1 }}>Escribe o dicta...</span>
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: 'var(--ink)',
                  color: 'var(--bg)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Send size={12} />
              </span>
            </div>
          </div>
        </div>

        <div
          className="mono reveal"
          data-d="3"
          style={{
            marginTop: 32,
            fontSize: 11.5,
            color: 'var(--ink-3)',
            letterSpacing: '0.03em',
            textAlign: 'center',
          }}
        >
          <Lock size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />
          Anti-alucinacion: si la fuente no tiene fecha exacta, te pregunta antes de agendar.
        </div>
      </div>

      <style jsx>{`
        .demo-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 840px) {
          .demo-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
      `}</style>
    </section>
  )
}
