'use client'

import { useRef, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cargarMasRecordatorios } from '@/lib/actions/reminder.actions'
import { ListaRecordatorios } from './lista-recordatorios'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Recordatorio, OrdenamientoRecordatorio } from '@/types/reminder.types'
import type { Categoria } from '@/types/category.types'

interface Props {
  recordatoriosIniciales: Recordatorio[]
  hasMasInicial: boolean
  categoriaId: number
  categorias: Categoria[]
  mensajeVacio?: string
  diasAutoEliminar?: number | null
  destacadoId?: string
}

export function ListaRecordatoriosPaginada({
  recordatoriosIniciales,
  hasMasInicial,
  categoriaId,
  categorias,
  mensajeVacio,
  diasAutoEliminar,
  destacadoId,
}: Props) {
  const [registros, setRegistros] = useState<Recordatorio[]>(recordatoriosIniciales)
  const [hasMas, setHasMas] = useState(hasMasInicial)
  const [ordenamiento, setOrdenamiento] = useState<OrdenamientoRecordatorio>('fecha-asc')
  const [cargando, setCargando] = useState(false)
  const centinela = useRef<HTMLDivElement>(null)

  // Refs para evitar closures viejas en el IntersectionObserver
  const registrosRef = useRef(registros)
  registrosRef.current = registros
  const hasMasRef = useRef(hasMas)
  hasMasRef.current = hasMas
  const cargandoRef = useRef(cargando)
  cargandoRef.current = cargando
  const ordenamientoRef = useRef(ordenamiento)
  ordenamientoRef.current = ordenamiento

  async function ejecutarCargaMas() {
    if (cargandoRef.current || !hasMasRef.current) return
    setCargando(true)
    try {
      const resultado = await cargarMasRecordatorios(
        categoriaId,
        registrosRef.current.length,
        ordenamientoRef.current,
      )
      setRegistros((prev) => [...prev, ...resultado.recordatorios])
      setHasMas(resultado.hasMas)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void ejecutarCargaMas()
      },
      { rootMargin: '300px' },
    )
    const el = centinela.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
    // El observer usa refs para leer estado actualizado — sin dependencias externas
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function cambiarOrdenamiento(nuevoOrdenamiento: OrdenamientoRecordatorio) {
    setCargando(true)
    try {
      const resultado = await cargarMasRecordatorios(categoriaId, 0, nuevoOrdenamiento)
      setRegistros(resultado.recordatorios)
      setHasMas(resultado.hasMas)
      setOrdenamiento(nuevoOrdenamiento)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <Select
          value={ordenamiento}
          onValueChange={(v) => void cambiarOrdenamiento(v as OrdenamientoRecordatorio)}
          disabled={cargando}
        >
          <SelectTrigger className="w-48 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fecha-asc">Mas proximo primero</SelectItem>
            <SelectItem value="fecha-desc">Mas lejano primero</SelectItem>
            <SelectItem value="reciente">Creacion reciente</SelectItem>
            <SelectItem value="estado">Pendientes primero</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ListaRecordatorios
        recordatorios={registros}
        categorias={categorias}
        mensajeVacio={mensajeVacio}
        diasAutoEliminar={diasAutoEliminar}
        destacadoId={destacadoId}
      />

      <div ref={centinela} className="h-10 flex items-center justify-center mt-2">
        {cargando && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>
    </div>
  )
}
