'use client'

import { useRef, useState, useEffect } from 'react'
import { Play, Pause, Trash2, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  src: string
  nombreArchivo: string
  onEliminar?: () => void
}

function formatearTiempo(segundos: number): string {
  if (!isFinite(segundos)) return '0:00'
  const m = Math.floor(segundos / 60)
  const s = Math.floor(segundos % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function ReproductorAudio({ src, nombreArchivo, onEliminar }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [reproduciendo, setReproduciendo] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [duracion, setDuracion] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const alActualizar = () => setProgreso(audio.currentTime)
    const alCargar = () => setDuracion(audio.duration)
    const alTerminar = () => {
      setReproduciendo(false)
      setProgreso(0)
    }

    audio.addEventListener('timeupdate', alActualizar)
    audio.addEventListener('loadedmetadata', alCargar)
    audio.addEventListener('ended', alTerminar)

    return () => {
      audio.removeEventListener('timeupdate', alActualizar)
      audio.removeEventListener('loadedmetadata', alCargar)
      audio.removeEventListener('ended', alTerminar)
    }
  }, [])

  function alternarReproduccion() {
    const audio = audioRef.current
    if (!audio) return
    if (reproduciendo) {
      audio.pause()
    } else {
      void audio.play()
    }
    setReproduciendo(!reproduciendo)
  }

  function manejarSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current
    if (!audio) return
    const nuevoTiempo = Number(e.target.value)
    audio.currentTime = nuevoTiempo
    setProgreso(nuevoTiempo)
  }

  return (
    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2 min-w-[220px] max-w-[280px]">
      <audio ref={audioRef} src={src} preload="metadata" />

      <Music size={14} className="text-indigo-400 flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="text-xs text-indigo-700 font-medium truncate">{nombreArchivo}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <Button
            variante="fantasma"
            tamano="icono"
            onClick={alternarReproduccion}
            className="h-6 w-6 text-indigo-600 hover:text-indigo-800"
          >
            {reproduciendo ? <Pause size={13} /> : <Play size={13} />}
          </Button>
          <input
            type="range"
            min={0}
            max={duracion || 0}
            step={0.1}
            value={progreso}
            onChange={manejarSeek}
            className="flex-1 h-1 accent-indigo-500"
          />
          <span className="text-xs text-indigo-500 flex-shrink-0 tabular-nums">
            {formatearTiempo(progreso)}/{formatearTiempo(duracion)}
          </span>
        </div>
      </div>

      {onEliminar && (
        <button
          onClick={onEliminar}
          className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
          title="Eliminar audio"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  )
}
