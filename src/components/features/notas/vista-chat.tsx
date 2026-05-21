'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Pencil, Trash2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { BurbujaEntrada } from './burbuja-entrada'
import { BurbujaAdjunto } from './burbuja-adjunto'
import { SubirAdjunto } from './subir-adjunto'
import {
  crearEntrada,
  renombrarCuaderno,
  eliminarCuaderno,
} from '@/lib/actions/notas.actions'
import { eliminarAdjunto } from '@/lib/actions/adjuntos.actions'
import type { CuadernoConPrevia, NotaEntrada, AdjuntoNota, ElementoTimeline } from '@/types/notas.types'

interface Props {
  cuaderno: CuadernoConPrevia
  entradasIniciales: NotaEntrada[]
  adjuntosIniciales: AdjuntoNota[]
}

export function VistaChatNotas({ cuaderno, entradasIniciales, adjuntosIniciales }: Props) {
  const router = useRouter()
  const [entradas, setEntradas] = useState<NotaEntrada[]>(entradasIniciales)
  const [adjuntos, setAdjuntos] = useState<AdjuntoNota[]>(adjuntosIniciales)
  const [textoNuevo, setTextoNuevo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [tituloCuaderno, setTituloCuaderno] = useState(cuaderno.titulo)
  const [renombrando, setRenombrando] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState(cuaderno.titulo)
  const [guardandoNombre, setGuardandoNombre] = useState(false)
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)
  const [eliminandoCuaderno, setEliminandoCuaderno] = useState(false)

  const finRef = useRef<HTMLDivElement>(null)

  const elementosTimeline = useMemo((): ElementoTimeline[] => {
    const lista: ElementoTimeline[] = [
      ...entradas.map((e): ElementoTimeline => ({ tipo: 'entrada', datos: e })),
      ...adjuntos.map((a): ElementoTimeline => ({ tipo: 'adjunto', datos: a })),
    ]
    lista.sort((a, b) => {
      const fechaA = a.tipo === 'entrada' ? a.datos.creadoEn : a.datos.creadoEn
      const fechaB = b.tipo === 'entrada' ? b.datos.creadoEn : b.datos.creadoEn
      return new Date(fechaA).getTime() - new Date(fechaB).getTime()
    })
    return lista
  }, [entradas, adjuntos])

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [elementosTimeline])

  const manejarEnviar = useCallback(async () => {
    const limpio = textoNuevo.trim()
    if (!limpio || enviando) return

    setEnviando(true)
    const resultado = await crearEntrada(cuaderno.id, limpio)
    setEnviando(false)

    if (resultado.ok && resultado.entrada) {
      setEntradas((prev) => [...prev, resultado.entrada!])
      setTextoNuevo('')
    } else {
      toast.error(resultado.error ?? 'No se pudo enviar el mensaje')
    }
  }, [textoNuevo, enviando, cuaderno.id])

  function manejarActualizarEntrada(id: string, contenido: string) {
    setEntradas((prev) => prev.map((e) => (e.id === id ? { ...e, contenido } : e)))
  }

  function manejarEliminarEntrada(id: string) {
    setEntradas((prev) => prev.filter((e) => e.id !== id))
  }

  function manejarAdjuntoSubido(adjunto: AdjuntoNota) {
    setAdjuntos((prev) => [...prev, adjunto])
  }

  async function manejarEliminarAdjunto(id: string) {
    const resultado = await eliminarAdjunto(id)
    if (resultado.ok) {
      setAdjuntos((prev) => prev.filter((a) => a.id !== id))
    } else {
      toast.error(resultado.error ?? 'No se pudo eliminar el adjunto')
    }
  }

  async function manejarRenombrar() {
    const nombreLimpio = nuevoNombre.trim()
    if (!nombreLimpio) return
    setGuardandoNombre(true)
    const resultado = await renombrarCuaderno(cuaderno.id, nombreLimpio)
    setGuardandoNombre(false)
    if (resultado.ok) {
      setTituloCuaderno(nombreLimpio)
      setRenombrando(false)
    } else {
      toast.error(resultado.error ?? 'No se pudo renombrar')
    }
  }

  async function manejarEliminarCuaderno() {
    setEliminandoCuaderno(true)
    const resultado = await eliminarCuaderno(cuaderno.id)
    setEliminandoCuaderno(false)
    if (resultado.ok) {
      toast.success('Cuaderno eliminado')
      router.push('/notes')
    } else {
      toast.error(resultado.error ?? 'No se pudo eliminar')
      setConfirmandoEliminar(false)
    }
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Cabecera */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
          <Button
            variante="fantasma"
            tamano="sm"
            onClick={() => router.push('/notes')}
            className="gap-1.5 text-gray-500 flex-shrink-0"
          >
            <ArrowLeft size={15} />
            Notas
          </Button>

          <h1 className="font-semibold text-gray-900 flex-1 truncate">{tituloCuaderno}</h1>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variante="fantasma"
              tamano="icono"
              onClick={() => {
                setNuevoNombre(tituloCuaderno)
                setRenombrando(true)
              }}
              title="Renombrar"
            >
              <Pencil size={15} />
            </Button>
            <Button
              variante="fantasma"
              tamano="icono"
              className="hover:text-red-500"
              onClick={() => setConfirmandoEliminar(true)}
              title="Eliminar cuaderno"
            >
              <Trash2 size={15} />
            </Button>
          </div>
        </div>

        {/* Zona de mensajes */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {elementosTimeline.length === 0 && (
            <p className="text-center text-sm text-gray-400 mt-10">
              Aun no hay mensajes. Escribe el primero.
            </p>
          )}
          {elementosTimeline.map((elemento) =>
            elemento.tipo === 'entrada' ? (
              <BurbujaEntrada
                key={`entrada-${elemento.datos.id}`}
                entrada={elemento.datos}
                onActualizar={manejarActualizarEntrada}
                onEliminar={manejarEliminarEntrada}
              />
            ) : (
              <BurbujaAdjunto
                key={`adjunto-${elemento.datos.id}`}
                adjunto={elemento.datos}
                onEliminar={manejarEliminarAdjunto}
              />
            ),
          )}
          <div ref={finRef} />
        </div>

        {/* Zona de entrada */}
        <div className="border-t border-gray-100 bg-white px-4 py-3 flex items-end gap-2 flex-shrink-0">
          <SubirAdjunto cuadernoId={cuaderno.id} onAdjuntoSubido={manejarAdjuntoSubido} />
          <Textarea
            value={textoNuevo}
            onChange={(e) => setTextoNuevo(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="min-h-[40px] max-h-[120px] resize-none flex-1 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void manejarEnviar()
              }
            }}
          />
          <Button
            onClick={() => void manejarEnviar()}
            disabled={!textoNuevo.trim() || enviando}
            className="flex-shrink-0 h-10 w-10 p-0"
            title="Enviar"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>

      {/* Dialog renombrar */}
      <Dialog open={renombrando} onOpenChange={(open) => !open && setRenombrando(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Renombrar cuaderno</DialogTitle>
            <DialogDescription>Escribe el nuevo nombre para este cuaderno.</DialogDescription>
          </DialogHeader>
          <Input
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            maxLength={100}
            onKeyDown={(e) => e.key === 'Enter' && void manejarRenombrar()}
            autoFocus
          />
          <DialogFooter>
            <Button variante="contorno" onClick={() => setRenombrando(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void manejarRenombrar()} disabled={guardandoNombre || !nuevoNombre.trim()}>
              {guardandoNombre ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog eliminar cuaderno */}
      <AlertDialog open={confirmandoEliminar} onOpenChange={setConfirmandoEliminar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cuaderno</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminaran todos los mensajes y adjuntos de este cuaderno. Esta accion no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void manejarEliminarCuaderno()}
              disabled={eliminandoCuaderno}
              className="bg-red-500 hover:bg-red-600"
            >
              {eliminandoCuaderno ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
