'use client'

import { useEffect } from 'react'
import { Sparkles, Trash2, X } from 'lucide-react'
import { useChatGlobal } from './chat-provider'
import { ChatMensajes } from './chat-mensajes'

export function BottomSheetAsistente() {
  const { abierto, cerrar, limpiar, messages } = useChatGlobal()

  useEffect(() => {
    if (!abierto) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [abierto])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col" role="dialog" aria-modal="true">
      <button
        type="button"
        onClick={cerrar}
        className="flex-1 bg-black/40 animate-in fade-in"
        aria-label="Cerrar asistente"
      />
      <div className="bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-200">
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center">
              <Sparkles size={14} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Asistente Noti</p>
              <p className="text-[11px] text-gray-500">Crea recordatorios o busca lanzamientos</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={limpiar}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Limpiar conversacion"
                title="Limpiar conversacion"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={cerrar}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Cerrar"
            >
              <X size={14} />
            </button>
          </div>
        </header>
        <div className="flex flex-col flex-1 min-h-0">
          <ChatMensajes altura="h-[60vh]" />
        </div>
      </div>
    </div>
  )
}
