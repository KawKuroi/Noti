'use client'

import { useState } from 'react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ConfigPomodoro } from '@/lib/utils/pomodoro.utils'

interface Props {
  config: ConfigPomodoro
  onGuardar: (parcial: Partial<ConfigPomodoro>) => void
}

export function ConfiguracionPomodoro({ config, onGuardar }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [trabajo, setTrabajo] = useState(String(config.trabajo))
  const [descansoCorto, setDescansoCorto] = useState(String(config.descansoCorto))
  const [descansoLargo, setDescansoLargo] = useState(String(config.descansoLargo))

  function manejarGuardar() {
    const t = Math.max(1, Math.min(120, parseInt(trabajo) || config.trabajo))
    const dc = Math.max(1, Math.min(30, parseInt(descansoCorto) || config.descansoCorto))
    const dl = Math.max(1, Math.min(60, parseInt(descansoLargo) || config.descansoLargo))
    onGuardar({ trabajo: t, descansoCorto: dc, descansoLargo: dl })
    setAbierto(false)
  }

  function alAbrir() {
    setTrabajo(String(config.trabajo))
    setDescansoCorto(String(config.descansoCorto))
    setDescansoLargo(String(config.descansoLargo))
    setAbierto(true)
  }

  return (
    <>
      <Button variante="secundario" tamano="sm" onClick={alAbrir}>
        <Settings size={14} className="mr-1.5" />
        Configurar
      </Button>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Duraciones del pomodoro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="trabajo-min">Sesion de trabajo (min)</Label>
              <Input
                id="trabajo-min"
                type="number"
                min={1}
                max={120}
                value={trabajo}
                onChange={(e) => setTrabajo(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="descanso-corto-min">Descanso corto (min)</Label>
              <Input
                id="descanso-corto-min"
                type="number"
                min={1}
                max={30}
                value={descansoCorto}
                onChange={(e) => setDescansoCorto(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="descanso-largo-min">Descanso largo (min)</Label>
              <Input
                id="descanso-largo-min"
                type="number"
                min={1}
                max={60}
                value={descansoLargo}
                onChange={(e) => setDescansoLargo(e.target.value)}
              />
            </div>
            <Button onClick={manejarGuardar} className="w-full">
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
