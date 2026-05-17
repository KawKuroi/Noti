export const DURACION_TRABAJO_DEFECTO = 25
export const DURACION_DESCANSO_CORTO_DEFECTO = 5
export const DURACION_DESCANSO_LARGO_DEFECTO = 15
export const SESIONES_HASTA_DESCANSO_LARGO = 4

export type FasePomodoro = 'inactivo' | 'trabajo' | 'descanso_corto' | 'descanso_largo'

export const ETIQUETAS_FASE: Record<FasePomodoro, string> = {
  inactivo: 'Listo para comenzar',
  trabajo: 'Sesion de trabajo',
  descanso_corto: 'Descanso corto',
  descanso_largo: 'Descanso largo',
}

export interface ConfigPomodoro {
  trabajo: number
  descansoCorto: number
  descansoLargo: number
}

export const CONFIG_DEFECTO: ConfigPomodoro = {
  trabajo: DURACION_TRABAJO_DEFECTO,
  descansoCorto: DURACION_DESCANSO_CORTO_DEFECTO,
  descansoLargo: DURACION_DESCANSO_LARGO_DEFECTO,
}

export function formatearTiempoMs(ms: number): string {
  const totalSegundos = Math.max(0, Math.ceil(ms / 1000))
  const minutos = Math.floor(totalSegundos / 60)
  const segundos = totalSegundos % 60
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
}

export function duracionFaseMs(fase: FasePomodoro, config: ConfigPomodoro): number {
  switch (fase) {
    case 'trabajo':
      return config.trabajo * 60 * 1000
    case 'descanso_corto':
      return config.descansoCorto * 60 * 1000
    case 'descanso_largo':
      return config.descansoLargo * 60 * 1000
    default:
      return 0
  }
}

export function siguienteFase(
  faseActual: FasePomodoro,
  sesionesCompletadas: number,
): FasePomodoro {
  if (faseActual === 'trabajo') {
    const totalDespues = sesionesCompletadas + 1
    return totalDespues % SESIONES_HASTA_DESCANSO_LARGO === 0
      ? 'descanso_largo'
      : 'descanso_corto'
  }
  return 'trabajo'
}

// Genera un beep simple usando Web Audio API para notificar fin de fase.
export function reproducirBeep(): void {
  if (typeof window === 'undefined') return
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sine'
    osc.frequency.value = 880

    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.4)

    osc.onended = () => ctx.close()
  } catch {
    // AudioContext puede estar bloqueado si no hay interaccion del usuario
  }
}
