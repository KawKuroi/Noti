'use client'

import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { ConfigCard } from './config-card'

interface ConfigInicio {
  autostart: boolean
  iniciarMinimizado: boolean
  cerrarABandeja: boolean
}

type Clave = keyof ConfigInicio

const COMANDOS: Record<Clave, string> = {
  autostart: 'set_autostart',
  iniciarMinimizado: 'set_iniciar_minimizado',
  cerrarABandeja: 'set_cerrar_a_bandeja',
}

export function FormularioInicioEscritorio() {
  const [config, setConfig] = useState<ConfigInicio | null>(null)
  const [isPending, startTransition] = useTransition()

  // La deteccion ocurre tras montar para no divergir del HTML del server.
  // Solo escritorio Tauri: navegador/mobile no tienen __TAURI__; en Android el
  // userAgent lo delata; un build antiguo de la app hace fallar el invoke.
  useEffect(() => {
    const tauri = window.__TAURI__
    if (!tauri || /Android/i.test(navigator.userAgent)) return
    tauri.core
      .invoke<ConfigInicio>('obtener_config_inicio')
      .then(setConfig)
      .catch(() => {
        // Build antiguo sin estos comandos: la seccion queda oculta.
      })
  }, [])

  if (!config) return null

  function alternar(clave: Clave) {
    const tauri = window.__TAURI__
    if (!tauri || !config) return
    const nuevoValor = !config[clave]
    const previo = config
    setConfig({ ...config, [clave]: nuevoValor })
    startTransition(async () => {
      try {
        await tauri.core.invoke(COMANDOS[clave], { activado: nuevoValor })
      } catch {
        setConfig(previo)
        toast.error('No se pudo guardar la configuracion')
      }
    })
  }

  return (
    <ConfigCard
      titulo="Aplicacion de escritorio"
      descripcion="Opciones de inicio disponibles solo en la app de escritorio de Noti."
    >
      <div className="space-y-3">
        <FilaToggle
          titulo="Iniciar con el PC"
          detalle="Abre Noti automaticamente al encender el equipo."
          activo={config.autostart}
          onToggle={() => alternar('autostart')}
          disabled={isPending}
        />
        <FilaToggle
          titulo="Iniciar minimizado en la bandeja"
          detalle="Al arrancar, Noti se abre directo en la bandeja del sistema."
          activo={config.iniciarMinimizado}
          onToggle={() => alternar('iniciarMinimizado')}
          disabled={isPending}
        />
        <FilaToggle
          titulo="Minimizar a la bandeja al cerrar"
          detalle="Al cerrar la ventana, Noti sigue en la bandeja para seguir notificando. Si lo desactivas, cerrar la ventana sale de Noti."
          activo={config.cerrarABandeja}
          onToggle={() => alternar('cerrarABandeja')}
          disabled={isPending}
        />
      </div>
    </ConfigCard>
  )
}

function FilaToggle({
  titulo,
  detalle,
  activo,
  onToggle,
  disabled,
}: {
  titulo: string
  detalle: string
  activo: boolean
  onToggle: () => void
  disabled: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-(--ink)">{titulo}</p>
        <p className="text-xs text-(--ink-3) mt-0.5">{detalle}</p>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
          activo ? 'bg-(--ink)' : 'bg-(--line-2)'
        }`}
        role="switch"
        aria-checked={activo}
        aria-label={titulo}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-(--bg) transition-transform ${
            activo ? 'translate-x-4' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
