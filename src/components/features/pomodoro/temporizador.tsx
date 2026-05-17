'use client'

import Link from 'next/link'
import { BookOpen, Play, Pause, RotateCcw, SkipForward, Bell, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePomodoro } from '@/hooks/use-pomodoro'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import { ConfiguracionPomodoro } from './configuracion-pomodoro'
import { formatearTiempoMs, ETIQUETAS_FASE } from '@/lib/utils/pomodoro.utils'

const COLORES_FASE = {
  inactivo: 'text-gray-400',
  trabajo: 'text-gray-900',
  descanso_corto: 'text-sky-600',
  descanso_largo: 'text-emerald-600',
}

const FONDO_FASE = {
  inactivo: 'bg-gray-50',
  trabajo: 'bg-white',
  descanso_corto: 'bg-sky-50',
  descanso_largo: 'bg-emerald-50',
}

interface Props {
  sonidoHabilitado: boolean
  reminderId?: string
  tituloReminder?: string
}

export function Temporizador({ sonidoHabilitado, reminderId, tituloReminder }: Props) {
  const {
    fase,
    tiempoRestanteMs,
    corriendo,
    sesionesCompletadas,
    config,
    iniciar,
    pausar,
    reiniciar,
    saltarFase,
    actualizarConfig,
  } = usePomodoro({ sonidoHabilitado, reminderId, tituloReminder })

  const { suscrito } = usePushNotifications()

  const colorFase = COLORES_FASE[fase]
  const fondoFase = FONDO_FASE[fase]

  const tiempoDisplay =
    fase === 'inactivo'
      ? formatearTiempoMs(config.trabajo * 60 * 1000)
      : formatearTiempoMs(tiempoRestanteMs)

  return (
    <div className={`flex flex-col items-center gap-8 rounded-2xl border border-gray-100 p-10 transition-colors ${fondoFase}`}>
      {/* Contexto del reminder */}
      {tituloReminder && (
        <div className="flex items-center gap-2 text-sm text-sky-600 bg-sky-50 px-4 py-2 rounded-lg border border-sky-100">
          <BookOpen size={14} />
          <span>{tituloReminder}</span>
        </div>
      )}

      {/* Fase actual */}
      <div className="text-center space-y-1">
        <p className={`text-sm font-medium uppercase tracking-widest ${colorFase}`}>
          {ETIQUETAS_FASE[fase]}
        </p>
        <p className="text-xs text-gray-400">
          Sesion {sesionesCompletadas % 4 === 0 && sesionesCompletadas > 0 ? 4 : sesionesCompletadas % 4} de 4
        </p>
      </div>

      {/* Tiempo */}
      <div className={`text-8xl font-bold tabular-nums tracking-tight ${colorFase}`}>
        {tiempoDisplay}
      </div>

      {/* Contador de sesiones */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i < sesionesCompletadas % 4 || (sesionesCompletadas > 0 && sesionesCompletadas % 4 === 0)
                ? 'bg-gray-900'
                : 'bg-gray-200'
            }`}
          />
        ))}
        <span className="ml-2 text-xs text-gray-400">{sesionesCompletadas} completadas</span>
      </div>

      {/* Controles */}
      <div className="flex items-center gap-3">
        <Button variante="fantasma" tamano="icono" onClick={reiniciar} title="Reiniciar">
          <RotateCcw size={16} />
        </Button>

        {corriendo ? (
          <Button variante="primario" onClick={pausar} className="px-8 py-2.5 text-base h-auto">
            <Pause size={18} className="mr-2" />
            Pausar
          </Button>
        ) : (
          <Button variante="primario" onClick={iniciar} className="px-8 py-2.5 text-base h-auto">
            <Play size={18} className="mr-2" />
            {fase === 'inactivo' ? 'Iniciar' : 'Continuar'}
          </Button>
        )}

        <Button variante="fantasma" tamano="icono" onClick={saltarFase} title="Saltar fase">
          <SkipForward size={16} />
        </Button>
      </div>

      {/* Configurar */}
      <ConfiguracionPomodoro config={config} onGuardar={actualizarConfig} />

      {/* Hint de notificaciones */}
      {!suscrito && (
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-lg max-w-xs text-center">
          <BellOff size={13} className="flex-shrink-0" />
          <span>
            Activa las notificaciones en{' '}
            <Link href="/settings" className="underline">Configuracion</Link>{' '}
            para recibir aviso al terminar en todos tus dispositivos.
          </span>
        </div>
      )}

      {suscrito && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Bell size={12} />
          <span>Notificaciones activas en tus dispositivos</span>
        </div>
      )}
    </div>
  )
}
