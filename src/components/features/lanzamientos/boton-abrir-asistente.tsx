'use client'

import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChatGlobal } from '@/components/features/asistente'

export function BotonAbrirAsistente() {
  const { abrir } = useChatGlobal()
  return (
    <Button variante="contorno" tamano="sm" onClick={abrir}>
      <Sparkles size={14} />
      Abrir asistente
    </Button>
  )
}
