'use client'

import { useState, useEffect } from 'react'
import { Download, X, Share } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { usePWAInstall } from '@/hooks/use-pwa-install'
import { useEsAppNativa } from '@/hooks/use-es-app-nativa'

const CLAVE_DESCARTADO = 'noti-install-prompt-dismissed-at'
const DIAS_RE_MOSTRAR = 14

function estaDescartado(): boolean {
  try {
    const valor = localStorage.getItem(CLAVE_DESCARTADO)
    if (!valor) return false
    const diasPasados = (Date.now() - new Date(valor).getTime()) / (1000 * 60 * 60 * 24)
    return diasPasados < DIAS_RE_MOSTRAR
  } catch {
    return false
  }
}

function marcarDescartado() {
  try {
    localStorage.setItem(CLAVE_DESCARTADO, new Date().toISOString())
  } catch {
    // ignorar errores de storage
  }
}

export function InstallPrompt() {
  const { soportado, instalado, esIOS, esIOSSinSoportePush, instalar } = usePWAInstall()
  const esAppNativa = useEsAppNativa()
  const [descartado, setDescartado] = useState(true)
  const [dialogAbierto, setDialogAbierto] = useState(false)

  useEffect(() => {
    setDescartado(estaDescartado())
  }, [])

  const descartar = () => {
    marcarDescartado()
    setDescartado(true)
  }

  const manejarInstalar = async () => {
    await instalar()
    toast.success('Noti instalada')
  }

  // Dentro de una app nativa instalada no tiene sentido ofrecer instalar.
  if (esAppNativa) return null
  if (instalado || descartado) return null
  if (!soportado && !esIOS) return null

  // iOS antiguo (< 16.4): mensaje informativo
  if (esIOS && esIOSSinSoportePush) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 mb-5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
        <Download size={16} className="text-gray-500 shrink-0" />
        <p className="flex-1 text-gray-700">
          Para instalar Noti y recibir notificaciones en iOS, actualiza a iOS 16.4 o superior.
        </p>
        <button
          onClick={descartar}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar"
        >
          <X size={14} />
        </button>
      </div>
    )
  }

  // iOS 16.4+: guia manual
  if (esIOS) {
    return (
      <>
        <div className="flex items-center gap-3 px-4 py-3 mb-5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
          <Share size={16} className="text-gray-500 shrink-0" />
          <p className="flex-1 text-gray-700">
            Instala Noti en tu iPhone para recibir notificaciones con el navegador cerrado.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setDialogAbierto(true)}
              className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              Como instalar
            </button>
            <button
              onClick={descartar}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Instalar Noti en iOS</DialogTitle>
            </DialogHeader>
            <ol className="space-y-4 text-sm text-gray-700 pt-2">
              <li className="flex gap-3">
                <span className="font-semibold text-gray-900 shrink-0">1.</span>
                <span>
                  Toca el boton de compartir{' '}
                  <Share size={13} className="inline align-middle mx-0.5" /> en la barra inferior de Safari.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-gray-900 shrink-0">2.</span>
                <span>Desplazate hacia abajo y toca <strong>Agregar a inicio</strong>.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-gray-900 shrink-0">3.</span>
                <span>Confirma tocando <strong>Agregar</strong> en la esquina superior derecha.</span>
              </li>
            </ol>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Nativo (Android / desktop Chrome / Edge)
  return (
    <div className="flex items-center gap-3 px-4 py-3 mb-5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
      <Download size={16} className="text-gray-500 shrink-0" />
      <p className="flex-1 text-gray-700">
        Instala Noti como app para recibir notificaciones aunque el navegador este cerrado.
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={manejarInstalar}
          className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md hover:bg-gray-700 transition-colors"
        >
          Instalar
        </button>
        <button
          onClick={descartar}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
