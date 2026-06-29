'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Download, RefreshCw } from 'lucide-react'
import { ConfigCard } from './config-card'

interface InfoActualizacion {
  disponible: boolean
  version: string | null
  notas: string | null
}

type Estado = 'cargando' | 'al-dia' | 'disponible' | 'instalando'

export function FormularioActualizacion() {
  const [visible, setVisible] = useState(false)
  const [estado, setEstado] = useState<Estado>('cargando')
  const [info, setInfo] = useState<InfoActualizacion | null>(null)

  // Solo escritorio Tauri: navegador/mobile no tienen __TAURI__; Android lo delata
  // por userAgent; un build antiguo sin el comando hace fallar el invoke -> oculto.
  useEffect(() => {
    const tauri = window.__TAURI__
    if (!tauri || /Android/i.test(navigator.userAgent)) return
    tauri.core
      .invoke<InfoActualizacion>('buscar_actualizacion')
      .then((resultado) => {
        setVisible(true)
        setInfo(resultado)
        setEstado(resultado.disponible ? 'disponible' : 'al-dia')
      })
      .catch(() => {
        // Build antiguo sin el comando, o sin endpoint todavia: seccion oculta.
      })
  }, [])

  if (!visible) return null

  async function buscar() {
    const tauri = window.__TAURI__
    if (!tauri) return
    setEstado('cargando')
    try {
      const resultado = await tauri.core.invoke<InfoActualizacion>('buscar_actualizacion')
      setInfo(resultado)
      setEstado(resultado.disponible ? 'disponible' : 'al-dia')
      if (!resultado.disponible) toast.success('Ya tienes la ultima version')
    } catch {
      setEstado('al-dia')
      toast.error('No se pudo buscar actualizaciones')
    }
  }

  async function instalar() {
    const tauri = window.__TAURI__
    if (!tauri) return
    setEstado('instalando')
    try {
      // La app se descarga, instala y se reinicia sola; si vuelve aqui es que fallo.
      await tauri.core.invoke('instalar_actualizacion')
    } catch {
      setEstado('disponible')
      toast.error('No se pudo instalar la actualizacion')
    }
  }

  return (
    <ConfigCard
      titulo="Actualizaciones"
      descripcion="Manten Noti al dia. Las actualizaciones se descargan e instalan desde la propia app y se aplican al reiniciar."
    >
      {estado === 'disponible' && info?.version ? (
        <div className="space-y-3">
          <p className="text-sm text-(--ink)">
            Hay una version nueva disponible:{' '}
            <span className="font-medium">v{info.version}</span>
          </p>
          <button
            onClick={instalar}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors self-start"
            style={{ background: 'var(--ink)', color: 'var(--bg)' }}
          >
            <Download size={15} />
            Actualizar e instalar
          </button>
        </div>
      ) : estado === 'instalando' ? (
        <p className="text-sm text-(--ink-3)">
          Descargando e instalando la actualizacion. La app se reiniciara automaticamente.
        </p>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-(--ink-3)">
            {estado === 'cargando' ? 'Buscando actualizaciones...' : 'Estas en la ultima version.'}
          </p>
          <button
            onClick={buscar}
            disabled={estado === 'cargando'}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border transition-colors disabled:opacity-50 self-start"
            style={{ borderColor: 'var(--line-2)', color: 'var(--ink-2)' }}
          >
            <RefreshCw size={14} />
            Buscar actualizaciones
          </button>
        </div>
      )}
    </ConfigCard>
  )
}
