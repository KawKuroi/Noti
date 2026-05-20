'use client'

import { Sparkles } from 'lucide-react'
import { useAsistente } from '@/components/features/asistente/asistente-provider'

export function InputAsistenteInicio() {
  const { abrir } = useAsistente()

  return (
    <button
      type="button"
      onClick={abrir}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-gray-300 hover:shadow-md transition-all text-left group"
    >
      <Sparkles size={18} className="text-purple-600 shrink-0" />
      <span className="flex-1 text-sm text-gray-400 group-hover:text-gray-500 transition-colors">
        ¿Qué te recuerdo o agendo?
      </span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 text-xs text-gray-300 border border-gray-200 rounded px-1.5 py-0.5 font-mono">
        Ctrl+I
      </kbd>
    </button>
  )
}
