'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModalNuevoCuaderno } from './modal-nuevo-cuaderno'

export function BotonNuevoCuaderno() {
  const [abierto, setAbierto] = useState(false)

  return (
    <>
      <Button onClick={() => setAbierto(true)}>
        <Plus size={16} className="mr-1.5" />
        Nuevo cuaderno
      </Button>
      <ModalNuevoCuaderno abierto={abierto} onCerrar={() => setAbierto(false)} />
    </>
  )
}
