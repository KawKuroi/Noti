'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TarjetaConfirmacion } from '@/components/features/lanzamientos/tarjeta-confirmacion'
import { FormularioFechaManual } from '@/components/features/lanzamientos/formulario-fecha-manual'
import { useChatGlobal } from './chat-provider'
import { ETIQUETAS_CATEGORIA } from '@/lib/utils/constants'
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

interface SalidaCrearSimple {
  agregado: boolean
  error?: string
  titulo?: string
  categoriaSlug?: string
  fechaVencimiento?: string | null
}

function ResultadoAgregadoLanzamiento({
  salida,
  idUnico,
  onAgregado,
}: {
  salida: SalidaAgregar
  idUnico: string
  onAgregado: () => void
}) {
  const notificadoRef = useRef(false)
  useEffect(() => {
    if (notificadoRef.current) return
    notificadoRef.current = true
    if (salida.agregado) {
      toast.success('Lanzamiento agregado al calendario')
      onAgregado()
    } else {
      toast.error(salida.error ?? 'No se pudo agregar el lanzamiento')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idUnico])

  return salida.agregado ? (
    <p className="text-xs text-emerald-600 italic">Lanzamiento agregado al calendario.</p>
  ) : (
    <p className="text-xs text-red-600 italic">Error: {salida.error ?? 'no se pudo agregar'}</p>
  )
}

function ResultadoCreadoSimple({
  salida,
  idUnico,
  onAgregado,
}: {
  salida: SalidaCrearSimple
  idUnico: string
  onAgregado: () => void
}) {
  const notificadoRef = useRef(false)
  useEffect(() => {
    if (notificadoRef.current) return
    notificadoRef.current = true
    if (salida.agregado) {
      toast.success('Recordatorio creado')
      onAgregado()
    } else {
      toast.error(salida.error ?? 'No se pudo crear el recordatorio')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idUnico])

  if (!salida.agregado) {
    return <p className="text-xs text-red-600 italic">Error: {salida.error ?? 'no se pudo crear'}</p>
  }
  const categoria = salida.categoriaSlug
    ? ETIQUETAS_CATEGORIA[salida.categoriaSlug] ?? salida.categoriaSlug
    : ''
  return (
    <p className="text-xs text-emerald-600 italic">
      Recordatorio creado{categoria ? ` en ${categoria}` : ''}.
    </p>
  )
}

interface Props {
  altura?: string
}

export function ChatMensajes({ altura = 'h-[560px]' }: Props) {
  const router = useRouter()
  const { messages, sendMessage, status } = useChatGlobal()
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

  function confirmarAgregarLanzamiento(
    resultado: ResultadoLanzamiento,
    fechaConfirmada: string,
    fuenteFinal: ResultadoLanzamiento['fuente'],
  ) {
    const partes = [
      'Si, agregalo a mi calendario.',
      `Datos: titulo="${resultado.titulo}"`,
      `tipo=${resultado.tipo}`,
      `fechaLanzamiento=${fechaConfirmada}`,
      `fuente=${fuenteFinal}`,
      resultado.tmdbId ? `tmdbId=${resultado.tmdbId}` : null,
      resultado.rawgId ? `rawgId=${resultado.rawgId}` : null,
      resultado.musicbrainzId ? `musicbrainzId=${resultado.musicbrainzId}` : null,
      resultado.googleBooksId ? `googleBooksId=${resultado.googleBooksId}` : null,
      resultado.posterUrl ? `posterUrl=${resultado.posterUrl}` : null,
      resultado.autor ? `autor=${resultado.autor}` : null,
      resultado.artista ? `artista=${resultado.artista}` : null,
      resultado.plataforma ? `plataforma=${resultado.plataforma}` : null,
      resultado.director ? `director=${resultado.director}` : null,
      resultado.temporada ? `temporada=${resultado.temporada}` : null,
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

  function manejarAgregado() {
    router.refresh()
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div
        ref={contenedorRef}
        className={`${altura} overflow-y-auto p-4 space-y-4 bg-gray-50/50`}
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

                if (
                  parte.type === 'tool-buscarLanzamiento' ||
                  parte.type === 'tool-buscarProximoLanzamiento'
                ) {
                  if (parte.state === 'output-available') {
                    const salida = parte.output as ResultadoBusqueda
                    if (salida.encontrado) {
                      return (
                        <TarjetaConfirmacion
                          key={idx}
                          resultado={salida}
                          onConfirmar={(fecha, fuente) =>
                            confirmarAgregarLanzamiento(salida, fecha, fuente)
                          }
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
                    return (
                      <ResultadoAgregadoLanzamiento
                        key={`${mensaje.id}-${idx}`}
                        idUnico={`${mensaje.id}-${idx}`}
                        salida={salida}
                        onAgregado={manejarAgregado}
                      />
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

                if (parte.type === 'tool-crearRecordatorioSimple') {
                  if (parte.state === 'output-available') {
                    const salida = parte.output as SalidaCrearSimple
                    return (
                      <ResultadoCreadoSimple
                        key={`${mensaje.id}-${idx}`}
                        idUnico={`${mensaje.id}-${idx}`}
                        salida={salida}
                        onAgregado={manejarAgregado}
                      />
                    )
                  }
                  if (parte.state === 'input-streaming' || parte.state === 'input-available') {
                    return (
                      <p key={idx} className="text-xs text-gray-400 italic">
                        Guardando recordatorio...
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
                <span
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </span>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={manejarEnvio}
        className="flex items-center gap-2 p-3 border-t border-gray-100 bg-white"
      >
        <Input
          value={borrador}
          onChange={(e) => setBorrador(e.target.value)}
          placeholder="Pide un recordatorio o pregunta por un lanzamiento..."
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
      <p className="text-sm font-medium text-gray-800">Tu asistente para todo</p>
      <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
        Crea recordatorios personales o busca lanzamientos de cine, TV, juegos, musica y libros.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-1.5 text-xs text-gray-500">
        <span className="px-2 py-0.5 rounded-full bg-gray-100">{'"Cumpleanos de Marta el 21"'}</span>
        <span className="px-2 py-0.5 rounded-full bg-gray-100">{'"Clase de ingles los martes 7pm"'}</span>
        <span className="px-2 py-0.5 rounded-full bg-gray-100">{'"Lanzamiento de GTA 6"'}</span>
        <span className="px-2 py-0.5 rounded-full bg-gray-100">{'"Nuevo album de The Weeknd"'}</span>
        <span className="px-2 py-0.5 rounded-full bg-gray-100">{'"Cuando sale el nuevo Zelda"'}</span>
      </div>
    </div>
  )
}
