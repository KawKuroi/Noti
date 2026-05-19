'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'

const CLAVE_STORAGE = 'noti:chat:messages'

interface ChatGlobalContextValue {
  messages: ReturnType<typeof useChat>['messages']
  sendMessage: ReturnType<typeof useChat>['sendMessage']
  status: ReturnType<typeof useChat>['status']
  setMessages: ReturnType<typeof useChat>['setMessages']
  abierto: boolean
  abrir: () => void
  cerrar: () => void
  alternar: () => void
  limpiar: () => void
}

const ChatGlobalContext = createContext<ChatGlobalContextValue | null>(null)

interface Props {
  children: React.ReactNode
}

export function ChatProvider({ children }: Props) {
  const [abierto, setAbierto] = useState(false)
  const hidratadoRef = useRef(false)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  useEffect(() => {
    if (hidratadoRef.current) return
    hidratadoRef.current = true
    try {
      const guardado = sessionStorage.getItem(CLAVE_STORAGE)
      if (!guardado) return
      const parsed = JSON.parse(guardado)
      if (Array.isArray(parsed) && parsed.length > 0) {
        setMessages(parsed)
      }
    } catch {}
  }, [setMessages])

  useEffect(() => {
    if (!hidratadoRef.current) return
    try {
      if (messages.length === 0) {
        sessionStorage.removeItem(CLAVE_STORAGE)
      } else {
        sessionStorage.setItem(CLAVE_STORAGE, JSON.stringify(messages))
      }
    } catch {}
  }, [messages])

  const abrir = useCallback(() => setAbierto(true), [])
  const cerrar = useCallback(() => setAbierto(false), [])
  const alternar = useCallback(() => setAbierto((v) => !v), [])

  const limpiar = useCallback(() => {
    setMessages([])
    try {
      sessionStorage.removeItem(CLAVE_STORAGE)
    } catch {}
  }, [setMessages])

  useEffect(() => {
    function manejarTecla(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault()
        setAbierto((v) => !v)
      }
      if (e.key === 'Escape') {
        setAbierto(false)
      }
    }
    window.addEventListener('keydown', manejarTecla)
    return () => window.removeEventListener('keydown', manejarTecla)
  }, [])

  const valor = useMemo<ChatGlobalContextValue>(
    () => ({ messages, sendMessage, status, setMessages, abierto, abrir, cerrar, alternar, limpiar }),
    [messages, sendMessage, status, setMessages, abierto, abrir, cerrar, alternar, limpiar],
  )

  return <ChatGlobalContext.Provider value={valor}>{children}</ChatGlobalContext.Provider>
}

export function useChatGlobal(): ChatGlobalContextValue {
  const ctx = useContext(ChatGlobalContext)
  if (!ctx) {
    throw new Error('useChatGlobal debe usarse dentro de ChatProvider')
  }
  return ctx
}
