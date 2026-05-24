'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { crearClienteNavegador } from '@/lib/supabase/client'
import { upsertPerfil } from '@/lib/actions/user.actions'

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

    // Si Supabase tiene confirmacion de email desactivada, la sesion
    // esta disponible de inmediato y el callback nunca se ejecuta.
    // En ese caso creamos el perfil aqui y redirigimos al dashboard.
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
      <div className="text-center space-y-3">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-semibold text-gray-900">Revisa tu email</h3>
        <p className="text-sm text-gray-500">
          Te enviamos un enlace de confirmacion a <strong>{email}</strong>. Abrelo para activar tu cuenta.
        </p>
        <Link href="/login" className="block text-sm text-gray-900 font-medium hover:underline">
          Volver al inicio de sesion
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Crear cuenta</h2>
        <p className="text-sm text-gray-500 mt-1">Empieza a organizar tus recordatorios</p>
      </div>

      <form onSubmit={manejarRegistro} className="space-y-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-1">
            Contrasena
          </label>
          <input
            id="contrasena"
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Minimo 6 caracteres"
          />
        </div>
        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Ya tienes cuenta?{' '}
        <Link href="/login" className="text-gray-900 font-medium hover:underline">
          Inicia sesion
        </Link>
      </p>
    </div>
  )
}
