'use client'

import { useState } from 'react'
import Link from 'next/link'
import { crearClienteNavegador } from '@/lib/supabase/client'

export default function PaginaLogin() {
  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [recordarme, setRecordarme] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = crearClienteNavegador()

  async function manejarLoginGoogle() {
    setCargando(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setError(error.message)
    setCargando(false)
  }

  async function manejarLoginEmail(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password: contrasena })

    if (error) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
      setCargando(false)
      return
    }

    window.location.href = '/inicio'
  }

  return (
    <div>
      <h1
        style={{
          fontSize: '28px',
          fontWeight: 500,
          letterSpacing: '-0.025em',
          color: 'var(--ink)',
          lineHeight: 1.2,
          marginBottom: '8px',
        }}
      >
        Bienvenido de vuelta.
      </h1>
      <p style={{ fontSize: '14.5px', color: 'var(--ink-3)', marginBottom: '28px' }}>
        Accede a tus recordatorios y lanzamientos.
      </p>

      {/* Boton Google */}
      <button
        onClick={manejarLoginGoogle}
        disabled={cargando}
        className="w-full flex items-center justify-center gap-3 transition-colors"
        style={{
          padding: '10px 14px',
          border: '1px solid var(--line-2)',
          borderRadius: '10px',
          fontSize: '13.5px',
          fontWeight: 500,
          color: 'var(--ink)',
          background: 'var(--bg)',
          cursor: cargando ? 'not-allowed' : 'pointer',
          opacity: cargando ? 0.6 : 1,
          marginBottom: '20px',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-soft)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg)')}
      >
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
          <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Continuar con Google
      </button>

      {/* Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
        <span
          className="mono"
          style={{
            fontSize: '10.5px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--ink-4)',
          }}
        >
          O POR EMAIL
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
      </div>

      <form onSubmit={manejarLoginEmail} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {error && (
          <p
            style={{
              fontSize: '13px',
              color: 'var(--danger)',
              background: 'color-mix(in oklab, var(--danger) 8%, transparent)',
              border: '1px solid color-mix(in oklab, var(--danger) 20%, transparent)',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
          >
            {error}
          </p>
        )}

        <div>
          <label
            htmlFor="email"
            className="mono"
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--ink-3)',
              marginBottom: '6px',
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--line-2)',
              background: 'var(--bg)',
              color: 'var(--ink)',
              fontSize: '14px',
              outline: 'none',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--ink)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line-2)')}
          />
        </div>

        <div>
          <label
            htmlFor="contrasena"
            className="mono"
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--ink-3)',
              marginBottom: '6px',
            }}
          >
            Contraseña
          </label>
          <input
            id="contrasena"
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--line-2)',
              background: 'var(--bg)',
              color: 'var(--ink)',
              fontSize: '14px',
              outline: 'none',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--ink)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line-2)')}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={recordarme}
              onChange={(e) => setRecordarme(e.target.checked)}
              style={{ width: '14px', height: '14px', accentColor: 'var(--ink)' }}
            />
            <span style={{ fontSize: '13px', color: 'var(--ink-2)' }}>Recordarme</span>
          </label>
          <Link
            href="/forgot-password"
            style={{ fontSize: '13px', color: 'var(--ink-3)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          type="submit"
          disabled={cargando}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '13.5px',
            fontWeight: 500,
            background: 'var(--ink)',
            color: 'var(--bg)',
            border: '1px solid var(--ink)',
            cursor: cargando ? 'not-allowed' : 'pointer',
            opacity: cargando ? 0.6 : 1,
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            marginTop: '4px',
          }}
          onMouseEnter={(e) => {
            if (!cargando) {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(10,10,10,0.5)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = ''
            e.currentTarget.style.boxShadow = ''
          }}
        >
          {cargando ? 'Iniciando...' : 'Iniciar sesión'}
        </button>
      </form>

      <p
        className="mono"
        style={{
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--ink-3)',
          fontWeight: 500,
          marginTop: '24px',
        }}
      >
        ¿Aún no tienes cuenta?{' '}
        <Link
          href="/register"
          style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
        >
          Crear una
        </Link>
      </p>
    </div>
  )
}
