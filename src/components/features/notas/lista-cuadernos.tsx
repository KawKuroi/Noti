'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import { EmptyState } from '@/components/features/empty-state'
import { ItemCuaderno } from './item-cuaderno'
import { renombrarCuaderno, eliminarCuaderno } from '@/lib/actions/notas.actions'
import type { CuadernoConPrevia } from '@/types/notas.types'

interface Props {
  cuadernos: CuadernoConPrevia[]
}

export function ListaCuadernos({ cuadernos: cuadernosIniciales }: Props) {
  const [lista, setLista] = useState<CuadernoConPrevia[]>(cuadernosIniciales)
  const [renombrando, setRenombrando] = useState<{ id: string; titulo: string } | null>(null)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [guardandoNombre, setGuardandoNombre] = useState(false)
  const [eliminando, setEliminando] = useState<string | null>(null)
  const [confirmandoEliminar, setConfirmandoEliminar] = useState<string | null>(null)

  function abrirRenombrar(id: string, tituloActual: string) {
    setRenombrando({ id, titulo: tituloActual })
    setNuevoNombre(tituloActual)
  }

  async function manejarRenombrar() {
    if (!renombrando) return
    const nombreLimpio = nuevoNombre.trim()
    if (!nombreLimpio) return

    setGuardandoNombre(true)
    const resultado = await renombrarCuaderno(renombrando.id, nombreLimpio)
    setGuardandoNombre(false)

    if (resultado.ok) {
      setLista((prev) =>
        prev.map((c) => (c.id === renombrando.id ? { ...c, titulo: nombreLimpio } : c)),
      )
      setRenombrando(null)
    } else {
      toast.error(resultado.error ?? 'No se pudo renombrar')
    }
  }

  async function manejarEliminar(id: string) {
    setEliminando(id)
    const resultado = await eliminarCuaderno(id)
    setEliminando(null)

    if (resultado.ok) {
      setLista((prev) => prev.filter((c) => c.id !== id))
      toast.success('Cuaderno eliminado')
    } else {
      toast.error(resultado.error ?? 'No se pudo eliminar')
    }
    setConfirmandoEliminar(null)
  }

  if (lista.length === 0) {
    return (
      <EmptyState
        titulo="Sin cuadernos"
        descripcion="Crea tu primer cuaderno para guardar mensajes, ideas o cualquier cosa."
      />
    )
  }

  return (
    <>
      <div className="divide-y divide-gray-100">
        {lista.map((cuaderno) => (
          <ItemCuaderno
            key={cuaderno.id}
            cuaderno={cuaderno}
            onRenombrar={abrirRenombrar}
            onEliminar={(id) => setConfirmandoEliminar(id)}
          />
        ))}
      </div>

      <Dialog open={Boolean(renombrando)} onOpenChange={(open) => !open && setRenombrando(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Renombrar cuaderno</DialogTitle>
            <DialogDescription>Escribe el nuevo nombre para este cuaderno.</DialogDescription>
          </DialogHeader>
          <Input
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            maxLength={100}
            onKeyDown={(e) => e.key === 'Enter' && manejarRenombrar()}
            autoFocus
          />
          <DialogFooter>
            <Button variante="contorno" onClick={() => setRenombrando(null)}>
              Cancelar
            </Button>
            <Button onClick={manejarRenombrar} disabled={guardandoNombre || !nuevoNombre.trim()}>
              {guardandoNombre ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(confirmandoEliminar)}
        onOpenChange={(open) => !open && setConfirmandoEliminar(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cuaderno</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminaran todos los mensajes de este cuaderno. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmandoEliminar && manejarEliminar(confirmandoEliminar)}
              disabled={eliminando === confirmandoEliminar}
              className="bg-red-500 hover:bg-red-600"
            >
              {eliminando === confirmandoEliminar ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
