'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { FormularioRecordatorio } from './formulario-recordatorio'
import type { Categoria } from '@/types/category.types'

interface Props {
  categorias: Categoria[]
  slugInicial?: string
}

export function BotonNuevoRecordatorio({ categorias, slugInicial }: Props) {
  const [abierto, setAbierto] = useState(false)

  return (
    <>
      <Button onClick={() => setAbierto(true)}>
        <Plus size={16} />
        Nuevo recordatorio
      </Button>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo recordatorio</DialogTitle>
            <DialogDescription>
              Completa los detalles del recordatorio.
            </DialogDescription>
          </DialogHeader>
          <FormularioRecordatorio
            categorias={categorias}
            slugInicial={slugInicial}
            onExito={() => setAbierto(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
