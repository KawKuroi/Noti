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
import { EditorNota } from './editor-nota'
import type { Categoria } from '@/types/category.types'

interface Props {
  categorias: Categoria[]
}

export function BotonNuevaNota({ categorias }: Props) {
  const [abierto, setAbierto] = useState(false)

  return (
    <>
      <Button onClick={() => setAbierto(true)}>
        <Plus size={16} className="mr-1.5" />
        Nueva nota
      </Button>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva nota</DialogTitle>
            <DialogDescription>Escribe el contenido de tu nota.</DialogDescription>
          </DialogHeader>
          <EditorNota categorias={categorias} onExito={() => setAbierto(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
