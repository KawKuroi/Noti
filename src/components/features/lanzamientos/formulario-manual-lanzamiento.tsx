'use client'

import { useState, useTransition } from 'react'
import { PlusCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { crearRecordatorioLanzamiento } from '@/lib/actions/reminder.actions'
import { TIPOS_LANZAMIENTO, ETIQUETAS_TIPO_LANZAMIENTO } from '@/lib/utils/constants'
import type { TipoLanzamiento } from '@/types/release.types'

interface Props {
  tipoInicial?: TipoLanzamiento
}

const estiloLabel: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--ink-3)',
  display: 'block',
  marginBottom: '6px',
}

const estiloBotonSecundario: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: '10px',
  fontSize: '13px',
  fontWeight: 500,
  background: 'var(--bg)',
  color: 'var(--ink)',
  border: '1px solid var(--line-2)',
  cursor: 'pointer',
}

const estiloBotonPrimario: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: '10px',
  fontSize: '13px',
  fontWeight: 500,
  background: 'var(--ink)',
  color: 'var(--bg)',
  border: '1px solid var(--ink)',
}

export function FormularioManualLanzamiento({ tipoInicial }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [tipo, setTipo] = useState<TipoLanzamiento>(tipoInicial ?? 'movie')
  const [titulo, setTitulo] = useState('')
  const [fecha, setFecha] = useState('')
  const [autor, setAutor] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [director, setDirector] = useState('')
  const [plataforma, setPlataforma] = useState('')
  const [desarrolladora, setDesarrolladora] = useState('')
  const [temporada, setTemporada] = useState('')
  const [editorial, setEditorial] = useState('')
  const [pending, startTransition] = useTransition()

  function resetear() {
    setTipo(tipoInicial ?? 'movie')
    setTitulo('')
    setFecha('')
    setAutor('')
    setDescripcion('')
    setDirector('')
    setPlataforma('')
    setDesarrolladora('')
    setTemporada('')
    setEditorial('')
  }

  function manejarEnvio(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim() || !fecha) return

    startTransition(async () => {
      const resultado = await crearRecordatorioLanzamiento({
        titulo: titulo.trim(),
        tipo,
        fechaLanzamiento: fecha,
        fuente: 'manual',
        ...(descripcion.trim() ? { descripcion: descripcion.trim() } : {}),
        ...(tipo === 'book' && autor.trim() ? { autor: autor.trim() } : {}),
        ...(tipo === 'album' && autor.trim() ? { artista: autor.trim() } : {}),
        ...((tipo === 'movie' || tipo === 'tv') && director.trim()
          ? { director: director.trim() }
          : {}),
        ...(tipo === 'tv' && plataforma.trim() ? { plataforma: plataforma.trim() } : {}),
        ...(tipo === 'tv' && temporada.trim() ? { temporada: Number(temporada) } : {}),
        ...(tipo === 'game' && plataforma.trim() ? { plataforma: plataforma.trim() } : {}),
        ...(tipo === 'game' && desarrolladora.trim() ? { desarrolladora: desarrolladora.trim() } : {}),
        ...(tipo === 'book' && editorial.trim() ? { editorial: editorial.trim() } : {}),
      })

      if (resultado.ok) {
        toast.success('Lanzamiento agregado al calendario')
        resetear()
        setAbierto(false)
      } else {
        toast.error(
          typeof resultado.error === 'string' ? resultado.error : 'No se pudo agregar',
        )
      }
    })
  }

  const mostrarAutor = tipo === 'book'
  const mostrarArtista = tipo === 'album'
  const mostrarDirector = tipo === 'movie' || tipo === 'tv'
  const mostrarPlataforma = tipo === 'tv' || tipo === 'game'
  const mostrarDesarrolladora = tipo === 'game'
  const mostrarTemporada = tipo === 'tv'
  const mostrarEditorial = tipo === 'book'
  const etiquetaExtra = mostrarAutor ? 'Autor' : mostrarArtista ? 'Artista / Banda' : null
  const etiquetaDirector = tipo === 'tv' ? 'Showrunner' : 'Director'

  return (
    <>
      <Button variante="contorno" tamano="sm" onClick={() => { setTipo(tipoInicial ?? 'movie'); setAbierto(true) }}>
        <PlusCircle size={15} />
        Agregar manualmente
      </Button>

      <Sheet open={abierto} onOpenChange={setAbierto}>
        <SheetContent
          title="Agregar lanzamiento"
          description="Registra manualmente la fecha de un lanzamiento."
          onClose={() => setAbierto(false)}
        >
          <form
            onSubmit={manejarEnvio}
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div>
                <label
                  htmlFor="tipo-lanzamiento"
                  className="mono"
                  style={estiloLabel}
                >
                  Tipo
                </label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as TipoLanzamiento)}>
                  <SelectTrigger id="tipo-lanzamiento">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_LANZAMIENTO.map((t) => (
                      <SelectItem key={t} value={t}>
                        {ETIQUETAS_TIPO_LANZAMIENTO[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  htmlFor="titulo-lanzamiento"
                  className="mono"
                  style={estiloLabel}
                >
                  Título
                </label>
                <Input
                  id="titulo-lanzamiento"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Dune 3"
                  required
                />
              </div>

              {etiquetaExtra && (
                <div>
                  <label
                    htmlFor="autor-lanzamiento"
                    className="mono"
                    style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', display: 'block', marginBottom: '6px' }}
                  >
                    {etiquetaExtra}
                  </label>
                  <Input
                    id="autor-lanzamiento"
                    value={autor}
                    onChange={(e) => setAutor(e.target.value)}
                    placeholder={mostrarAutor ? 'Ej: Brandon Sanderson' : 'Ej: Bad Bunny'}
                  />
                </div>
              )}

              {mostrarDirector && (
                <div>
                  <label
                    htmlFor="director-lanzamiento"
                    className="mono"
                    style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', display: 'block', marginBottom: '6px' }}
                  >
                    {etiquetaDirector}
                  </label>
                  <Input
                    id="director-lanzamiento"
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                    placeholder={tipo === 'tv' ? 'Ej: Vince Gilligan' : 'Ej: Denis Villeneuve'}
                  />
                </div>
              )}

              {mostrarPlataforma && (
                <div>
                  <label
                    htmlFor="plataforma-lanzamiento"
                    className="mono"
                    style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', display: 'block', marginBottom: '6px' }}
                  >
                    Plataforma (opcional)
                  </label>
                  <Input
                    id="plataforma-lanzamiento"
                    value={plataforma}
                    onChange={(e) => setPlataforma(e.target.value)}
                    placeholder={tipo === 'game' ? 'Ej: PS5, PC, Xbox' : 'Ej: Netflix, HBO Max'}
                  />
                </div>
              )}

              {mostrarTemporada && (
                <div>
                  <label
                    htmlFor="temporada-lanzamiento"
                    className="mono"
                    style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', display: 'block', marginBottom: '6px' }}
                  >
                    Temporada (opcional)
                  </label>
                  <Input
                    id="temporada-lanzamiento"
                    type="number"
                    min={1}
                    max={99}
                    value={temporada}
                    onChange={(e) => setTemporada(e.target.value)}
                    placeholder="Ej: 2"
                  />
                </div>
              )}

              {mostrarDesarrolladora && (
                <div>
                  <label
                    htmlFor="desarrolladora-lanzamiento"
                    className="mono"
                    style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', display: 'block', marginBottom: '6px' }}
                  >
                    Desarrolladora (opcional)
                  </label>
                  <Input
                    id="desarrolladora-lanzamiento"
                    value={desarrolladora}
                    onChange={(e) => setDesarrolladora(e.target.value)}
                    placeholder="Ej: Rockstar Games"
                  />
                </div>
              )}

              {mostrarEditorial && (
                <div>
                  <label
                    htmlFor="editorial-lanzamiento"
                    className="mono"
                    style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', display: 'block', marginBottom: '6px' }}
                  >
                    Editorial (opcional)
                  </label>
                  <Input
                    id="editorial-lanzamiento"
                    value={editorial}
                    onChange={(e) => setEditorial(e.target.value)}
                    placeholder="Ej: Tor Books"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="descripcion-lanzamiento"
                  className="mono"
                  style={estiloLabel}
                >
                  Descripción (opcional)
                </label>
                <Textarea
                  id="descripcion-lanzamiento"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Breve descripción..."
                  rows={2}
                  className="resize-none"
                />
              </div>

              <div>
                <label
                  htmlFor="fecha-lanzamiento"
                  className="mono"
                  style={estiloLabel}
                >
                  Fecha de lanzamiento
                </label>
                <Input
                  id="fecha-lanzamiento"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                />
              </div>
            </div>

            <div
              style={{
                flexShrink: 0,
                padding: '14px 24px',
                borderTop: '1px solid var(--line)',
                background: 'var(--bg)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={() => setAbierto(false)}
                style={estiloBotonSecundario}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending || !titulo.trim() || !fecha}
                style={{
                  ...estiloBotonPrimario,
                  cursor: pending || !titulo.trim() || !fecha ? 'not-allowed' : 'pointer',
                  opacity: pending || !titulo.trim() || !fecha ? 0.5 : 1,
                }}
              >
                {pending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
