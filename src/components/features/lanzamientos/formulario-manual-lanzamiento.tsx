'use client'

import { useState, useTransition } from 'react'
import { PlusCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Agregar lanzamiento</DialogTitle>
            <DialogDescription>
              Registra manualmente la fecha de un lanzamiento.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={manejarEnvio} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="tipo-lanzamiento">Tipo</Label>
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

            <div className="space-y-1.5">
              <Label htmlFor="titulo-lanzamiento">Titulo</Label>
              <Input
                id="titulo-lanzamiento"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Dune 3"
                required
              />
            </div>

            {etiquetaExtra && (
              <div className="space-y-1.5">
                <Label htmlFor="autor-lanzamiento">{etiquetaExtra}</Label>
                <Input
                  id="autor-lanzamiento"
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  placeholder={mostrarAutor ? 'Ej: Brandon Sanderson' : 'Ej: Bad Bunny'}
                />
              </div>
            )}

            {mostrarDirector && (
              <div className="space-y-1.5">
                <Label htmlFor="director-lanzamiento">{etiquetaDirector}</Label>
                <Input
                  id="director-lanzamiento"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  placeholder={tipo === 'tv' ? 'Ej: Vince Gilligan' : 'Ej: Denis Villeneuve'}
                />
              </div>
            )}

            {mostrarPlataforma && (
              <div className="space-y-1.5">
                <Label htmlFor="plataforma-lanzamiento">Plataforma (opcional)</Label>
                <Input
                  id="plataforma-lanzamiento"
                  value={plataforma}
                  onChange={(e) => setPlataforma(e.target.value)}
                  placeholder={tipo === 'game' ? 'Ej: PS5, PC, Xbox' : 'Ej: Netflix, HBO Max'}
                />
              </div>
            )}

            {mostrarTemporada && (
              <div className="space-y-1.5">
                <Label htmlFor="temporada-lanzamiento">Temporada (opcional)</Label>
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
              <div className="space-y-1.5">
                <Label htmlFor="desarrolladora-lanzamiento">Desarrolladora (opcional)</Label>
                <Input
                  id="desarrolladora-lanzamiento"
                  value={desarrolladora}
                  onChange={(e) => setDesarrolladora(e.target.value)}
                  placeholder="Ej: Rockstar Games"
                />
              </div>
            )}

            {mostrarEditorial && (
              <div className="space-y-1.5">
                <Label htmlFor="editorial-lanzamiento">Editorial (opcional)</Label>
                <Input
                  id="editorial-lanzamiento"
                  value={editorial}
                  onChange={(e) => setEditorial(e.target.value)}
                  placeholder="Ej: Tor Books"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="descripcion-lanzamiento">Descripcion (opcional)</Label>
              <Textarea
                id="descripcion-lanzamiento"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Breve descripcion..."
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fecha-lanzamiento">Fecha de lanzamiento</Label>
              <Input
                id="fecha-lanzamiento"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variante="contorno"
                tamano="sm"
                className="flex-1"
                onClick={() => setAbierto(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variante="primario"
                tamano="sm"
                className="flex-1"
                disabled={pending || !titulo.trim() || !fecha}
              >
                {pending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
