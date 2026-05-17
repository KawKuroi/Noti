'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  type FasePomodoro,
  type ConfigPomodoro,
  CONFIG_DEFECTO,
  duracionFaseMs,
  siguienteFase,
  reproducirBeep,
} from '@/lib/utils/pomodoro.utils'

const CLAVE_CONFIG = 'pomodoro:config'
const CLAVE_SESIONES = 'pomodoro:sesiones'

function leerConfigGuardada(): ConfigPomodoro {
  if (typeof window === 'undefined') return CONFIG_DEFECTO
  try {
    const raw = localStorage.getItem(CLAVE_CONFIG)
    if (!raw) return CONFIG_DEFECTO
    const parsed = JSON.parse(raw) as Partial<ConfigPomodoro>
    return {
      trabajo: parsed.trabajo ?? CONFIG_DEFECTO.trabajo,
      descansoCorto: parsed.descansoCorto ?? CONFIG_DEFECTO.descansoCorto,
      descansoLargo: parsed.descansoLargo ?? CONFIG_DEFECTO.descansoLargo,
    }
  } catch {
    return CONFIG_DEFECTO
  }
}

function leerSesionesGuardadas(): number {
  if (typeof window === 'undefined') return 0
  try {
    return parseInt(localStorage.getItem(CLAVE_SESIONES) ?? '0', 10) || 0
  } catch {
    return 0
  }
}

export interface EstadoPomodoro {
  fase: FasePomodoro
  tiempoRestanteMs: number
  corriendo: boolean
  sesionesCompletadas: number
  config: ConfigPomodoro
  iniciar: () => void
  pausar: () => void
  reiniciar: () => void
  saltarFase: () => void
  actualizarConfig: (parcial: Partial<ConfigPomodoro>) => void
}

interface OpcionesUsePomodoro {
  sonidoHabilitado?: boolean
  reminderId?: string
  tituloReminder?: string
}

export function usePomodoro({
  sonidoHabilitado = true,
  reminderId,
  tituloReminder,
}: OpcionesUsePomodoro = {}): EstadoPomodoro {
  const [config, setConfig] = useState<ConfigPomodoro>(CONFIG_DEFECTO)
  const [fase, setFase] = useState<FasePomodoro>('inactivo')
  const [tiempoRestanteMs, setTiempoRestante] = useState(0)
  const [corriendo, setCorriendo] = useState(false)
  const [sesionesCompletadas, setSesionesCompletadas] = useState(0)

  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const faseRef = useRef<FasePomodoro>('inactivo')
  const sesionesRef = useRef(0)
  const sonidoRef = useRef(sonidoHabilitado)
  const configRef = useRef(config)

  // Sincronizar refs con estado para usarlos en closures
  useEffect(() => { faseRef.current = fase }, [fase])
  useEffect(() => { sesionesRef.current = sesionesCompletadas }, [sesionesCompletadas])
  useEffect(() => { sonidoRef.current = sonidoHabilitado }, [sonidoHabilitado])
  useEffect(() => { configRef.current = config }, [config])

  // Cargar desde localStorage al montar
  useEffect(() => {
    const configGuardada = leerConfigGuardada()
    const sesionesGuardadas = leerSesionesGuardadas()
    setConfig(configGuardada)
    setSesionesCompletadas(sesionesGuardadas)
    configRef.current = configGuardada
    sesionesRef.current = sesionesGuardadas
  }, [])

  const detenerIntervalo = useCallback(() => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current)
      intervaloRef.current = null
    }
  }, [])

  const manejarFinFase = useCallback(() => {
    detenerIntervalo()
    setCorriendo(false)

    const faseTerminada = faseRef.current
    let nuevasSesiones = sesionesRef.current
    if (faseTerminada === 'trabajo') {
      nuevasSesiones = sesionesRef.current + 1
      setSesionesCompletadas(nuevasSesiones)
      sesionesRef.current = nuevasSesiones
      try { localStorage.setItem(CLAVE_SESIONES, String(nuevasSesiones)) } catch {}
    }

    const proxFase = siguienteFase(faseTerminada, nuevasSesiones - (faseTerminada === 'trabajo' ? 1 : 0))

    if (sonidoRef.current) {
      reproducirBeep()
    }

    // Enviar push inmediato a todos los dispositivos suscritos
    fetch('/api/pomodoro/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fase: faseTerminada,
        siguienteFase: proxFase,
        reminderId,
        tituloReminder,
      }),
    }).catch(() => null)

    setFase(proxFase)
    faseRef.current = proxFase
    setTiempoRestante(duracionFaseMs(proxFase, configRef.current))
  }, [detenerIntervalo, reminderId, tituloReminder])

  const iniciar = useCallback(() => {
    let faseInicial = faseRef.current
    if (faseInicial === 'inactivo') {
      faseInicial = 'trabajo'
      setFase('trabajo')
      faseRef.current = 'trabajo'
      setTiempoRestante(duracionFaseMs('trabajo', configRef.current))
    }

    setCorriendo(true)

    const inicio = Date.now()
    const duracionInicial = tiempoRestanteMs > 0 ? tiempoRestanteMs : duracionFaseMs(faseInicial, configRef.current)
    let restante = duracionInicial

    intervaloRef.current = setInterval(() => {
      const transcurrido = Date.now() - inicio
      restante = duracionInicial - transcurrido

      if (restante <= 0) {
        manejarFinFase()
      } else {
        setTiempoRestante(restante)
      }
    }, 200)
  }, [tiempoRestanteMs, manejarFinFase])

  const pausar = useCallback(() => {
    detenerIntervalo()
    setCorriendo(false)
  }, [detenerIntervalo])

  const reiniciar = useCallback(() => {
    detenerIntervalo()
    setCorriendo(false)
    setFase('inactivo')
    faseRef.current = 'inactivo'
    setTiempoRestante(0)
  }, [detenerIntervalo])

  const saltarFase = useCallback(() => {
    detenerIntervalo()
    setCorriendo(false)
    const proxFase = siguienteFase(faseRef.current, sesionesRef.current)
    setFase(proxFase)
    faseRef.current = proxFase
    setTiempoRestante(duracionFaseMs(proxFase, configRef.current))
  }, [detenerIntervalo])

  const actualizarConfig = useCallback((parcial: Partial<ConfigPomodoro>) => {
    setConfig((prev) => {
      const nueva = { ...prev, ...parcial }
      try { localStorage.setItem(CLAVE_CONFIG, JSON.stringify(nueva)) } catch {}
      configRef.current = nueva
      // Si no esta corriendo, actualizar el tiempo restante segun la fase actual
      if (!corriendo) {
        setTiempoRestante(duracionFaseMs(faseRef.current === 'inactivo' ? 'trabajo' : faseRef.current, nueva))
      }
      return nueva
    })
  }, [corriendo])

  // Limpiar al desmontar
  useEffect(() => () => detenerIntervalo(), [detenerIntervalo])

  // Tiempo inicial cuando la fase cambia y no hay tiempo establecido
  useEffect(() => {
    if (fase !== 'inactivo' && tiempoRestanteMs === 0) {
      setTiempoRestante(duracionFaseMs(fase, config))
    }
  }, [fase, config, tiempoRestanteMs])

  return {
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
  }
}
