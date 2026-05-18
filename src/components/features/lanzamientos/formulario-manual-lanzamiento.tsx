'use client'

import { useState, useTransition } from 'react'
import { PlusCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

export function FormularioManualLanzamiento() {
  const [abierto, setAbierto] = useState(false)
  const [tipo, setTipo] = useState<TipoLanzamiento>('movie')
  const [titulo, setTitulo] = useState('')
  const [fecha, setFecha] = useState('')
  const [autor, setAutor] = useState('')
  const [pending, startTransition] = useTransition()

  function resetear() {
    setTipo('movie')
    setTitulo('')
    setFecha('')
    setAutor('')
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
        ...(tipo === 'book' && autor.trim() ? { autor: autor.trim() } : {}),
        ...(tipo === 'album' && autor.trim() ? {} : {}),
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
  const etiquetaExtra = mostrarAutor ? 'Autor' : mostrarArtista ? 'Artista / Banda' : null

  return (
    <>
      <Button variante="contorno" tamano="sm" onClick={() => setAbierto(true)}>
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
