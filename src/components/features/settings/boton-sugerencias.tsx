'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { FormularioSugerencias } from '@/components/features/formulario-sugerencias'

export function BotonSugerencias() {
  const [abierto, setAbierto] = useState(false)

  return (
    <>
      <Button onClick={() => setAbierto(true)} className="gap-2">
        <Send size={14} />
        Enviar sugerencia
      </Button>
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tienes una sugerencia?</DialogTitle>
            <DialogDescription>
              Tu feedback ayuda a decidir que construir en Noti. Lo recibo por correo.
            </DialogDescription>
          </DialogHeader>
          <FormularioSugerencias onEnviado={() => setAbierto(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
