'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { crearClienteNavegador } from '@/lib/supabase/client'
import { upsertPerfil } from '@/lib/actions/user.actions'

const inputEstilo: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1px solid var(--line-2)',
  background: 'var(--bg)',
  color: 'var(--ink)',
  fontSize: '14px',
  outline: 'none',
}

const labelEstilo: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 500,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: 'var(--ink-3)',
  marginBottom: '6px',
}

export default function PaginaRegistro() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  const supabase = crearClienteNavegador()
  const router = useRouter()

  async function manejarRegistro(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError(null)

    const { error, data } = await supabase.auth.signUp({
      email,
      password: contrasena,
      options: {
        data: { full_name: nombre },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setCargando(false)
      return
    }

    if (data.session) {
      await upsertPerfil(data.session.user.id, nombre || null)
      router.push('/inicio')
      return
    }

    setExito(true)
    setCargando(false)
  }

  if (exito) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '999px',
            background: 'color-mix(in oklab, #16a34a 12%, transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <svg
            style={{ color: '#16a34a' }}
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3
          style={{ fontWeight: 500, fontSize: '16px', color: 'var(--ink)', marginBottom: '8px' }}
        >
          Revisa tu email
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--ink-3)', marginBottom: '20px', lineHeight: 1.5 }}>
          Te enviamos un enlace de confirmación a <strong style={{ color: 'var(--ink)' }}>{email}</strong>. Ábrelo para activar tu cuenta.
        </p>
        <Link
          href="/login"
          className="mono"
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--ink)',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          Volver al inicio de sesión
        </Link>
      </div>
    )
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
        Crea tu cuenta.
      </h1>
      <p style={{ fontSize: '14.5px', color: 'var(--ink-3)', marginBottom: '28px' }}>
        Empieza a organizar tus recordatorios.
      </p>

      <form
        onSubmit={manejarRegistro}
        style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
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
          <label htmlFor="nombre" className="mono" style={labelEstilo}>Nombre</label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            placeholder="Tu nombre"
            style={inputEstilo}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--ink)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line-2)')}
          />
        </div>

        <div>
          <label htmlFor="email" className="mono" style={labelEstilo}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            style={inputEstilo}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--ink)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line-2)')}
          />
        </div>

        <div>
          <label htmlFor="contrasena" className="mono" style={labelEstilo}>Contraseña</label>
          <input
            id="contrasena"
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
            style={inputEstilo}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--ink)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line-2)')}
          />
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
          {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
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
        ¿Ya tienes cuenta?{' '}
        <Link
          href="/login"
          style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
