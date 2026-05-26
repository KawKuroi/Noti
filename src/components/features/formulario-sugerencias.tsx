'use client'

import { useState } from 'react'

interface Props {
  onEnviado?: () => void
}

export function FormularioSugerencias({ onEnviado }: Props = {}) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (mensaje.trim().length < 5) {
      setError('El mensaje debe tener al menos 5 caracteres.')
      return
    }

    setEnviando(true)
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() || undefined, email: email.trim() || undefined, mensaje: mensaje.trim() }),
      })

      if (!res.ok) {
        const texto = await res.text()
        setError(texto || 'No se pudo enviar la sugerencia. Intenta de nuevo.')
        return
      }

      setEnviado(true)
      if (onEnviado) {
        setTimeout(onEnviado, 1500)
      }
    } catch {
      setError('Error de red. Revisa tu conexion e intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <div className="text-center py-8">
        <p className="text-lg font-semibold text-foreground mb-2">Gracias por tu sugerencia.</p>
        <p className="text-sm text-muted-foreground">La lei con atencion y me ayuda a mejorar Noti.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-foreground mb-1">
            Nombre <span className="text-muted-foreground font-normal">(opcional)</span>
          </label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
            Email <span className="text-muted-foreground font-normal">(opcional)</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Para que pueda responderte"
            className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
          />
        </div>
      </div>

      <div>
        <label htmlFor="mensaje" className="block text-sm font-medium text-foreground mb-1">
          Sugerencia
        </label>
        <textarea
          id="mensaje"
          rows={5}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Que mejorarias o agregarias a Noti?"
          className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full sm:w-auto px-6 py-2.5 bg-foreground text-background text-sm font-medium rounded-xl hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {enviando ? 'Enviando...' : 'Enviar sugerencia'}
      </button>
    </form>
  )
}
