'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { ArrowRight, Github, Moon, Sun } from 'lucide-react'
import { REPO_URL } from './data'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [montado, setMontado] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMontado(true)
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const oscuro = montado && theme === 'dark'

  return (
    <nav
      className={'nav-glass fixed left-0 right-0 top-0 z-[100] py-[0.875rem]' + (scrolled ? ' scrolled' : '')}
    >
      <div className="wrap flex items-center justify-between">
        <Link href="/" className="flex items-center gap-[10px]">
          <div
            className="grid h-7 w-7 place-items-center rounded-[8px] font-semibold"
            style={{
              background: 'var(--ink)',
              color: 'var(--bg)',
              fontSize: 14,
              letterSpacing: '-0.02em',
            }}
          >
            N
          </div>
          <span className="font-semibold" style={{ fontSize: 16, letterSpacing: '-0.015em' }}>
            Noti
          </span>
        </Link>

        <div className="flex items-center gap-[22px]">
          <div className="nav-links hidden items-center gap-[22px] md:flex">
            <a href="#features" style={enlaceNav}>
              Caracteristicas
            </a>
            <a href="#demo" style={enlaceNav}>
              Demo
            </a>
            <a href="#faq" style={enlaceNav}>
              FAQ
            </a>
          </div>

          <button
            type="button"
            onClick={() => setTheme(oscuro ? 'light' : 'dark')}
            aria-label="Cambiar tema"
            title="Cambiar tema"
            className="grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-full border transition-colors"
            style={{
              borderColor: 'var(--line-2)',
              background: 'transparent',
              color: 'var(--ink)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-soft)'
              e.currentTarget.style.borderColor = 'var(--ink-4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'var(--line-2)'
            }}
          >
            {oscuro ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost hidden sm:inline-flex"
            style={{ padding: '7px 12px', fontSize: 13 }}
          >
            <Github size={16} /> GitHub
          </a>

          <Link href="/inicio" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 13 }}>
            Abrir app <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </nav>
  )
}

const enlaceNav: React.CSSProperties = {
  fontSize: 13.5,
  color: 'var(--ink-2)',
  transition: 'color .15s ease',
}
