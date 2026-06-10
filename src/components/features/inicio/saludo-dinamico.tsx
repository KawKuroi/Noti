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
      <h1 className="text-[30px] font-medium tracking-tight text-(--ink) leading-tight">
        {saludo}, {nombre}
      </h1>
      <p className="text-[14.5px] text-(--ink-2) mt-0.5 leading-normal select-none">
        {resumen}
      </p>
    </div>
  )
}
