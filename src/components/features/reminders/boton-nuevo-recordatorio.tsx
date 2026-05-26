'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
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

      <Sheet open={abierto} onOpenChange={setAbierto}>
        <SheetContent
          title="Nuevo recordatorio"
          description="O pideselo a la IA con Ctrl+I"
          onClose={() => setAbierto(false)}
        >
          <FormularioRecordatorio
            categorias={categorias}
            slugInicial={slugInicial}
            onExito={() => setAbierto(false)}
            onCancelar={() => setAbierto(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
