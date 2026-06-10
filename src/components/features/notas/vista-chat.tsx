'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Pencil, Trash2, Send, Upload, X, FileText, Image as ImageIcon, Music, Video, File } from 'lucide-react'
import { useSubirAdjunto } from '@/hooks/use-subir-adjunto'
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

const DRAG_ACCEPT = 'Files'

interface Props {
  cuaderno: CuadernoConPrevia
  entradasIniciales: NotaEntrada[]
  adjuntosIniciales: AdjuntoNota[]
}

function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function IconoArchivo({ mime, className }: { mime: string; className?: string }) {
  if (mime.startsWith('image/')) return <ImageIcon size={20} className={className} />
  if (mime.startsWith('audio/')) return <Music size={20} className={className} />
  if (mime.startsWith('video/')) return <Video size={20} className={className} />
  if (mime === 'application/pdf' || mime === 'text/plain') return <FileText size={20} className={className} />
  return <File size={20} className={className} />
}

export function VistaChatNotas({ cuaderno, entradasIniciales, adjuntosIniciales }: Props) {
  const router = useRouter()
  const [entradas, setEntradas] = useState<NotaEntrada[]>(entradasIniciales)
  const [adjuntos, setAdjuntos] = useState<AdjuntoNota[]>(adjuntosIniciales)
  const [textoNuevo, setTextoNuevo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [archivoPendiente, setArchivoPendiente] = useState<File | null>(null)
  const [previewImagen, setPreviewImagen] = useState<string | null>(null)
  const [tituloCuaderno, setTituloCuaderno] = useState(cuaderno.titulo)
  const [renombrando, setRenombrando] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState(cuaderno.titulo)
  const [guardandoNombre, setGuardandoNombre] = useState(false)
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)
  const [eliminandoCuaderno, setEliminandoCuaderno] = useState(false)
  const [arrastrando, setArrastrando] = useState(false)
  const contadorDragRef = useRef(0)

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

  // Genera/limpia el ObjectURL del preview de imagen segun el archivo pendiente.
  useEffect(() => {
    if (!archivoPendiente || !archivoPendiente.type.startsWith('image/')) {
      setPreviewImagen(null)
      return
    }
    const url = URL.createObjectURL(archivoPendiente)
    setPreviewImagen(url)
    return () => URL.revokeObjectURL(url)
  }, [archivoPendiente])

  function manejarAdjuntoSubido(adjunto: AdjuntoNota) {
    setAdjuntos((prev) => [...prev, adjunto])
  }

  const { subiendo, subirArchivo } = useSubirAdjunto(cuaderno.id, manejarAdjuntoSubido)

  const manejarEnviar = useCallback(async () => {
    const limpio = textoNuevo.trim()
    if (!limpio && !archivoPendiente) return
    if (enviando || subiendo) return

    setEnviando(true)
    try {
      // Subir archivo primero si hay; luego enviar texto (orden: archivo arriba, texto abajo)
      if (archivoPendiente) {
        await subirArchivo(archivoPendiente)
        setArchivoPendiente(null)
      }
      if (limpio) {
        const resultado = await crearEntrada(cuaderno.id, limpio)
        if (resultado.ok && resultado.entrada) {
          setEntradas((prev) => [...prev, resultado.entrada!])
          setTextoNuevo('')
        } else {
          toast.error(resultado.error ?? 'No se pudo enviar el mensaje')
        }
      }
    } finally {
      setEnviando(false)
    }
  }, [textoNuevo, archivoPendiente, enviando, subiendo, cuaderno.id, subirArchivo])

  function manejarActualizarEntrada(id: string, contenido: string) {
    setEntradas((prev) => prev.map((e) => (e.id === id ? { ...e, contenido } : e)))
  }

  function manejarEliminarEntrada(id: string) {
    setEntradas((prev) => prev.filter((e) => e.id !== id))
  }

  function manejarSeleccionArchivo(archivo: File) {
    setArchivoPendiente(archivo)
  }

  function quitarArchivoPendiente() {
    setArchivoPendiente(null)
  }

  function manejarDragEnter(e: React.DragEvent) {
    if (!e.dataTransfer.types.includes(DRAG_ACCEPT)) return
    e.preventDefault()
    contadorDragRef.current += 1
    if (contadorDragRef.current === 1) setArrastrando(true)
  }

  function manejarDragOver(e: React.DragEvent) {
    if (!e.dataTransfer.types.includes(DRAG_ACCEPT)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  function manejarDragLeave(e: React.DragEvent) {
    if (!e.dataTransfer.types.includes(DRAG_ACCEPT)) return
    contadorDragRef.current -= 1
    if (contadorDragRef.current === 0) setArrastrando(false)
  }

  function manejarDrop(e: React.DragEvent) {
    e.preventDefault()
    contadorDragRef.current = 0
    setArrastrando(false)
    const archivo = e.dataTransfer.files[0]
    if (!archivo) return
    if (e.dataTransfer.files.length > 1) {
      toast.info('Solo se admite un archivo a la vez')
    }
    setArchivoPendiente(archivo)
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

  const puedeEnviar = (textoNuevo.trim().length > 0 || !!archivoPendiente) && !enviando && !subiendo

  return (
    <>
      <div
        className="flex flex-col h-full relative"
        onDragEnter={manejarDragEnter}
        onDragOver={manejarDragOver}
        onDragLeave={manejarDragLeave}
        onDrop={manejarDrop}
      >
        {arrastrando && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg pointer-events-none"
            style={{
              border: '2px dashed var(--cat-notas)',
              background: 'color-mix(in oklab, var(--cat-notas) 8%, transparent)',
            }}
          >
            <Upload size={32} style={{ color: 'var(--cat-notas)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--cat-notas)' }}>
              Suelta el archivo para adjuntarlo
            </p>
          </div>
        )}
        {/* Cabecera */}
        <div
          className="flex items-center gap-3 px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg)' }}
        >
          <Button
            variante="fantasma"
            tamano="sm"
            onClick={() => router.push('/notes')}
            className="gap-1.5 shrink-0"
            style={{ color: 'var(--ink-3)' }}
          >
            <ArrowLeft size={15} />
            <span className="mono" style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>Notas</span>
          </Button>

          <h1
            className="font-medium flex-1 truncate"
            style={{ color: 'var(--ink)', fontSize: '15px' }}
          >
            {tituloCuaderno}
          </h1>

          <div className="flex items-center gap-1 shrink-0">
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
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: 'var(--bg-soft)' }}>
          {elementosTimeline.length === 0 && (
            <p className="text-center text-sm mt-10" style={{ color: 'var(--ink-3)' }}>
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

        {/* Chip-preview del archivo pendiente (estilo LLM) */}
        {archivoPendiente && (
          <div
            className="px-4 pt-3 pb-1 shrink-0"
            style={{ borderTop: '1px solid var(--line)', background: 'var(--bg)' }}
          >
            <div
              className="inline-flex items-center gap-2 rounded-xl pl-2 pr-1 py-1.5 max-w-full"
              style={{ background: 'var(--bg-soft)', border: '1px solid var(--line)' }}
            >
              {previewImagen ? (
                // Preview local (objectURL blob:) de 40x40 px; next/image no aplica a blob:
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewImagen}
                  alt={archivoPendiente.name}
                  className="w-10 h-10 rounded-md object-cover shrink-0"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', color: 'var(--ink-3)' }}
                >
                  <IconoArchivo mime={archivoPendiente.type} />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate max-w-[240px]" style={{ color: 'var(--ink)' }}>
                  {archivoPendiente.name}
                </span>
                <span className="mono" style={{ fontSize: '11px', color: 'var(--ink-3)', fontWeight: 500 }}>
                  {formatearTamano(archivoPendiente.size)}
                </span>
              </div>
              <button
                type="button"
                onClick={quitarArchivoPendiente}
                className="ml-1 shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'var(--ink-4)', color: 'var(--bg)' }}
                title="Quitar archivo"
                aria-label="Quitar archivo"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Zona de entrada */}
        <div
          className="px-4 py-3 flex items-center gap-2 shrink-0"
          style={{ borderTop: '1px solid var(--line)', background: 'var(--bg)' }}
        >
          <SubirAdjunto
            onArchivoSeleccionado={manejarSeleccionArchivo}
            subiendo={subiendo}
            deshabilitado={!!archivoPendiente || enviando}
          />
          <Textarea
            value={textoNuevo}
            onChange={(e) => setTextoNuevo(e.target.value)}
            placeholder="Escribe un mensaje..."
            rows={1}
            className="h-10 min-h-10 max-h-[120px] resize-none flex-1 text-sm py-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void manejarEnviar()
              }
            }}
          />
          <Button
            onClick={() => void manejarEnviar()}
            disabled={!puedeEnviar}
            className="shrink-0 h-10 w-10 p-0"
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
