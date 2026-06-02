'use client'

import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { usePWAInstall } from '@/hooks/use-pwa-install'

export function FormularioInstalacion() {
  const { soportado, instalado, instalar } = usePWAInstall()

  const manejarInstalar = async () => {
    await instalar()
    toast.success('Noti instalada')
  }

  if (instalado) {
    return (
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--ink-3)' }}>
        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
        Ya instalada en este dispositivo
      </div>
    )
  }

  if (!soportado) {
    return (
      <p className="text-sm" style={{ color: 'var(--ink-3)' }}>
        La instalacion no esta disponible en este navegador. En Chrome o Edge puedes instalar Noti
        desde la barra de direcciones.
      </p>
    )
  }

  return (
    <button
      onClick={manejarInstalar}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors"
      style={{
        background: 'var(--ink)',
        color: 'var(--bg)',
      }}
    >
      <Download size={15} />
      Instalar Noti
    </button>
  )
}
