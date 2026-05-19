'use client'

import { Sparkles } from 'lucide-react'
import { useChatGlobal } from './chat-provider'

export function FabAsistente() {
  const { abierto, alternar } = useChatGlobal()

  if (abierto) return null

  return (
    <button
      type="button"
      onClick={alternar}
      className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-gray-900 text-white shadow-xl shadow-gray-900/20 flex items-center justify-center hover:bg-gray-700 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
      aria-label="Abrir asistente (Ctrl+I)"
      title="Asistente (Ctrl+I)"
    >
      <Sparkles size={22} />
    </button>
  )
}
