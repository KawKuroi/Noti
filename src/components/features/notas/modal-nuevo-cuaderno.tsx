'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  DialogFooter,
} from '@/components/ui/dialog'
import { crearCuaderno } from '@/lib/actions/notas.actions'

interface Props {
  abierto: boolean
  onCerrar: () => void
}

export function ModalNuevoCuaderno({ abierto, onCerrar }: Props) {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [creando, setCreando] = useState(false)

  async function manejarCrear() {
    const nombreLimpio = nombre.trim()
    if (!nombreLimpio) return

    setCreando(true)
    const resultado = await crearCuaderno(nombreLimpio)
    setCreando(false)

    if (resultado.ok && resultado.id) {
      setNombre('')
      onCerrar()
      router.push(`/notes/${resultado.id}`)
    } else {
      toast.error(resultado.error ?? 'No se pudo crear el cuaderno')
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && onCerrar()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nuevo cuaderno</DialogTitle>
          <DialogDescription>Dale un nombre a tu nuevo cuaderno de notas.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          <Label htmlFor="nombre-cuaderno">Nombre</Label>
          <Input
            id="nombre-cuaderno"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Ideas, Trabajo, Compras..."
            maxLength={100}
            onKeyDown={(e) => e.key === 'Enter' && manejarCrear()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variante="contorno" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button onClick={manejarCrear} disabled={creando || !nombre.trim()}>
            {creando ? 'Creando...' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
