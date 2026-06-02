'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { softDeleteRecordatorios } from '@/lib/actions/user.actions'

interface Categoria {
  id: number
  nombre: string
}

interface Props {
  categorias: Categoria[]
}

export function BotonBorrarRecordatorios({ categorias }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todas')
  const [confirmacion, setConfirmacion] = useState('')
  const [pending, startTransition] = useTransition()

  const confirmacionValida = confirmacion === 'ELIMINAR'

  function abrir() {
    setCategoriaSeleccionada('todas')
    setConfirmacion('')
    setAbierto(true)
  }

  function manejarEliminar() {
    if (!confirmacionValida) return

    const categoriaId =
      categoriaSeleccionada === 'todas' ? null : Number(categoriaSeleccionada)

    startTransition(async () => {
      const resultado = await softDeleteRecordatorios({ categoriaId })
      if (resultado.ok) {
        toast.success('Recordatorios eliminados. Revisa tu correo para recuperarlos.')
        setAbierto(false)
        setConfirmacion('')
      } else {
        toast.error(resultado.error ?? 'Error al eliminar los recordatorios')
      }
    })
  }

  return (
    <>
      <Button variante="destructivo" onClick={abrir} className="gap-2">
        <Trash2 size={14} />
        Borrar recordatorios
      </Button>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--ink)' }}>Borrar recordatorios</DialogTitle>
            <DialogDescription style={{ color: 'var(--ink-3)' }}>
              Puedes borrar todos tus recordatorios o solo los de una categoria. Tendras 30 dias
              para recuperarlos con el enlace que recibirás por correo.
            </DialogDescription>
          </DialogHeader>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '4px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                htmlFor="categoria-select"
                style={{ fontSize: '13px', color: 'var(--ink-3)' }}
              >
                Categoria
              </label>
              <select
                id="categoria-select"
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                disabled={pending}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid var(--line-2)',
                  borderRadius: '8px',
                  background: 'var(--bg)',
                  color: 'var(--ink)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="todas">Todas las categorias</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                htmlFor="confirmacion-recordatorios"
                style={{ fontSize: '13px', color: 'var(--ink-3)' }}
              >
                Escribe <strong style={{ color: 'var(--ink)' }}>ELIMINAR</strong> para confirmar
              </label>
              <input
                id="confirmacion-recordatorios"
                type="text"
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                placeholder="ELIMINAR"
                autoComplete="off"
                disabled={pending}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid var(--line-2)',
                  borderRadius: '8px',
                  background: 'var(--bg)',
                  color: 'var(--ink)',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button
                variante="contorno"
                onClick={() => setAbierto(false)}
                disabled={pending}
              >
                Cancelar
              </Button>
              <Button
                variante="destructivo"
                onClick={manejarEliminar}
                disabled={!confirmacionValida || pending}
              >
                {pending ? 'Eliminando...' : 'Eliminar recordatorios'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
