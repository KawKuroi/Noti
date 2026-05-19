'use client'

import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAsistente } from '@/components/features/asistente'

export function BotonAbrirAsistente() {
  const { abrir } = useAsistente()
  return (
    <Button variante="contorno" tamano="sm" onClick={abrir}>
      <Sparkles size={14} />
      Abrir asistente
    </Button>
  )
}
