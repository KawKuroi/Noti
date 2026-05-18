'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Send, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TarjetaConfirmacion } from './tarjeta-confirmacion'
import { FormularioFechaManual } from './formulario-fecha-manual'
import type { ResultadoLanzamiento } from '@/types/release.types'

type ResultadoBusqueda =
  | ({ encontrado: true } & ResultadoLanzamiento)
  | { encontrado: false }

interface SalidaPedirFechaManual {
  requiereFechaManual: true
  titulo: string
  tipo: ResultadoLanzamiento['tipo']
  motivo: string
}

interface SalidaAgregar {
  agregado: boolean
  error?: string
  titulo?: string
  fechaLanzamiento?: string
}

export function ChatLanzamientos() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })
  const [borrador, setBorrador] = useState('')
  const contenedorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (contenedorRef.current) {
      contenedorRef.current.scrollTop = contenedorRef.current.scrollHeight
    }
  }, [messages, status])

  const cargando = status === 'submitted' || status === 'streaming'

  function manejarEnvio(e: React.FormEvent) {
    e.preventDefault()
    const texto = borrador.trim()
    if (!texto || cargando) return
    sendMessage({ text: texto })
    setBorrador('')
  }

  function confirmarAgregar(resultado: ResultadoLanzamiento) {
    const partes = [
      `Si, agregalo a mi calendario.`,
      `Datos: titulo="${resultado.titulo}"`,
      `tipo=${resultado.tipo}`,
      `fechaLanzamiento=${resultado.fechaLanzamiento}`,
      `fuente=${resultado.fuente}`,
      resultado.tmdbId ? `tmdbId=${resultado.tmdbId}` : null,
      resultado.rawgId ? `rawgId=${resultado.rawgId}` : null,
      resultado.musicbrainzId ? `musicbrainzId=${resultado.musicbrainzId}` : null,
      resultado.googleBooksId ? `googleBooksId=${resultado.googleBooksId}` : null,
      resultado.posterUrl ? `posterUrl=${resultado.posterUrl}` : null,
      resultado.autor ? `autor=${resultado.autor}` : null,
    ].filter(Boolean)
    sendMessage({ text: partes.join('\n') })
  }

  function rechazar() {
    sendMessage({ text: 'No, mejor no lo agregues.' })
  }

  function enviarFechaManual(titulo: string, tipo: string, fecha: string) {
    sendMessage({
      text: `Conozco la fecha exacta: ${fecha}. Agregalo con titulo="${titulo}", tipo=${tipo}, fechaLanzamiento=${fecha}, fuente=manual.`,
    })
  }

  return (
    <div className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
      <div
        ref={contenedorRef}
        className="h-[420px] overflow-y-auto p-4 space-y-4 bg-gray-50/50"
      >
        {messages.length === 0 && <MensajeBienvenida />}

        {messages.map((mensaje) => (
          <div
            key={mensaje.id}
            className={`flex ${mensaje.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                mensaje.role === 'user'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              {mensaje.parts.map((parte, idx) => {
                if (parte.type === 'text') {
                  return (
                    <p key={idx} className="whitespace-pre-wrap leading-relaxed">
                      {parte.text}
                    </p>
                  )
                }

                if (parte.type === 'tool-buscarLanzamiento') {
                  if (parte.state === 'output-available') {
                    const salida = parte.output as ResultadoBusqueda
                    if (salida.encontrado) {
                      return (
                        <TarjetaConfirmacion
                          key={idx}
                          resultado={salida}
                          onConfirmar={() => confirmarAgregar(salida)}
                          onRechazar={rechazar}
                        />
                      )
                    }
                  }
                  if (parte.state === 'input-streaming' || parte.state === 'input-available') {
                    return (
                      <p key={idx} className="text-xs text-gray-400 italic">
                        Consultando fuentes...
                      </p>
                    )
                  }
                  return null
                }

                if (parte.type === 'tool-pedirFechaManual') {
                  if (parte.state === 'output-available') {
                    const salida = parte.output as SalidaPedirFechaManual
                    return (
                      <FormularioFechaManual
                        key={idx}
                        titulo={salida.titulo}
                        tipo={salida.tipo}
                        motivo={salida.motivo}
                        onEnviar={(fecha) => enviarFechaManual(salida.titulo, salida.tipo, fecha)}
                      />
                    )
                  }
                  return null
                }

                if (parte.type === 'tool-agregarRecordatorio') {
                  if (parte.state === 'output-available') {
                    const salida = parte.output as SalidaAgregar
                    if (salida.agregado) {
                      toast.success('Lanzamiento agregado al calendario')
                      return (
                        <p key={idx} className="text-xs text-emerald-600 italic">
                          Lanzamiento agregado al calendario.
                        </p>
                      )
                    }
                    toast.error(salida.error ?? 'No se pudo agregar el lanzamiento')
                    return (
                      <p key={idx} className="text-xs text-red-600 italic">
                        Error: {salida.error ?? 'no se pudo agregar'}
                      </p>
                    )
                  }
                  if (parte.state === 'input-streaming' || parte.state === 'input-available') {
                    return (
                      <p key={idx} className="text-xs text-gray-400 italic">
                        Guardando lanzamiento...
                      </p>
                    )
                  }
                  return null
                }

                return null
              })}
            </div>
          </div>
        ))}

        {cargando && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={manejarEnvio} className="flex items-center gap-2 p-3 border-t border-gray-100 bg-white">
        <Input
          value={borrador}
          onChange={(e) => setBorrador(e.target.value)}
          placeholder="Cuando sale Avatar 4? o agenda GTA 6..."
          disabled={cargando}
          autoFocus
        />
        <Button type="submit" disabled={cargando || !borrador.trim()} tamano="md">
          <Send size={16} />
        </Button>
      </form>
    </div>
  )
}

function MensajeBienvenida() {
  return (
    <div className="text-center py-8 px-4">
      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <Sparkles className="w-5 h-5 text-purple-600" />
      </div>
      <p className="text-sm font-medium text-gray-800">
        Pregunta por un lanzamiento y lo agendamos
      </p>
      <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
        Peliculas, series, videojuegos, albumes o libros. Buscamos la fecha exacta en TMDB, RAWG, MusicBrainz o Google Books.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-1.5 text-xs text-gray-500">
        <span className="px-2 py-0.5 rounded-full bg-gray-100">{'"Cuando sale Avatar 4?"'}</span>
        <span className="px-2 py-0.5 rounded-full bg-gray-100">{'"Agenda GTA 6"'}</span>
        <span className="px-2 py-0.5 rounded-full bg-gray-100">{'"Nuevo album de Bad Bunny"'}</span>
        <span className="px-2 py-0.5 rounded-full bg-gray-100">{'"Ultimo libro de Sanderson"'}</span>
      </div>
    </div>
  )
}
