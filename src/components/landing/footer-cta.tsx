'use client'

import Link from 'next/link'
import { ArrowRight, Github } from 'lucide-react'
import { REPO_NOMBRE, REPO_URL } from './data'

export function FooterCTA() {
  return (
    <section style={{ paddingTop: 46, paddingBottom: 69 }}>
      <div className="wrap">
        <div
          className="reveal card-landing"
          style={{
            padding: '69px 46px',
            textAlign: 'center',
            borderRadius: 25,
            background: 'var(--ink)',
            color: 'var(--bg)',
            border: 'none',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            className="dotgrid"
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.08,
              pointerEvents: 'none',
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.25) 1px, transparent 1px)',
            }}
          />
          <div style={{ position: 'relative' }}>
            <h2
              style={{
                fontSize: 'clamp(39px,5vw,74px)',
                lineHeight: 1,
                fontWeight: 500,
                letterSpacing: '-0.03em',
              }}
            >
              Empieza a recordar
              <br />
              <span style={{ color: 'color-mix(in oklab, var(--bg) 50%, transparent)' }}>lo que importa.</span>
            </h2>
            <div
              style={{
                marginTop: 30,
                display: 'flex',
                gap: 10,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Link
                href="/register"
                className="btn"
                style={{ background: 'var(--bg)', color: 'var(--ink)' }}
              >
                Crear cuenta gratis <ArrowRight size={14} />
              </Link>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
                style={{ borderColor: 'color-mix(in oklab, var(--bg) 20%, transparent)', color: 'var(--bg)' }}
              >
                <Github size={16} /> {REPO_NOMBRE}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--line)', paddingTop: 42, paddingBottom: 42 }}>
      <div
        className="wrap"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 7,
              background: 'var(--ink)',
              color: 'var(--bg)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            N
          </div>
          <span
            className="mono"
            style={{ fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.02em' }}
          >
            Noti - push reales, sin apps, sin ruido.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="mono"
            style={{
              fontSize: 12.5,
              color: 'var(--ink-2)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              transition: 'color .2s ease',
            }}
          >
            <Github size={14} /> {REPO_NOMBRE}
          </a>
          <Link
            href="/login"
            className="mono"
            style={{ fontSize: 12.5, color: 'var(--ink-3)', transition: 'color .2s ease' }}
          >
            Iniciar sesion
          </Link>
        </div>
      </div>
    </footer>
  )
}
