'use client'

import { useMemo } from 'react'

interface Props {
  nombre: string
  resumen: string
}

function obtenerSaludo(hora: number): string {
  if (hora < 12) return 'Buenos días'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export function SaludoDinamico({ nombre, resumen }: Props) {
  const saludo = useMemo(() => obtenerSaludo(new Date().getHours()), [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        {saludo}, {nombre}
      </h1>
      <p className="text-sm text-gray-500 mt-1">{resumen}</p>
    </div>
  )
}
