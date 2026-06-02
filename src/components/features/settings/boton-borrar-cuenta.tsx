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
import { softDeleteCuenta } from '@/lib/actions/user.actions'

export function BotonBorrarCuenta() {
  const [abierto, setAbierto] = useState(false)
  const [confirmacion, setConfirmacion] = useState('')
  const [pending, startTransition] = useTransition()

  const confirmacionValida = confirmacion === 'ELIMINAR'

  function abrir() {
    setConfirmacion('')
    setAbierto(true)
  }

  function manejarEliminar() {
    if (!confirmacionValida) return

    startTransition(async () => {
      const resultado = await softDeleteCuenta()
      if (resultado && !resultado.ok) {
        toast.error(resultado.error ?? 'Error al eliminar la cuenta')
        setAbierto(false)
      }
    })
  }

  return (
    <>
      <Button variante="destructivo" onClick={abrir} className="gap-2">
        <Trash2 size={14} />
        Eliminar cuenta
      </Button>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--ink)' }}>Eliminar cuenta</DialogTitle>
            <DialogDescription style={{ color: 'var(--ink-3)' }}>
              Tu cuenta y todos tus datos seran eliminados. Tendras 30 dias para recuperarlos
              usando el enlace que recibirás por correo.
            </DialogDescription>
          </DialogHeader>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '4px' }}>
            <div
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '13px',
                color: '#ef4444',
                lineHeight: 1.5,
              }}
            >
              Esta accion eliminara tu perfil, todos tus recordatorios y suscripciones push.
              Despues de 30 dias la eliminacion sera permanente e irreversible.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                htmlFor="confirmacion-cuenta"
                style={{ fontSize: '13px', color: 'var(--ink-3)' }}
              >
                Escribe <strong style={{ color: 'var(--ink)' }}>ELIMINAR</strong> para confirmar
              </label>
              <input
                id="confirmacion-cuenta"
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
                {pending ? 'Eliminando...' : 'Eliminar mi cuenta'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
