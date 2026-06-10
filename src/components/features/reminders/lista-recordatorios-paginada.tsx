'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
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

type FiltroEstado = 'todos' | 'activos' | 'vencidos' | 'hoy' | 'completados'

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
  const [filtro, setFiltro] = useState<FiltroEstado>('todos')
  const centinela = useRef<HTMLDivElement>(null)

  // Refs para evitar closures viejas en el IntersectionObserver.
  // Se sincronizan en un effect (no durante el render) para cumplir las
  // reglas de react-hooks v6: corre tras cada render, sin array de deps.
  const registrosRef = useRef(registros)
  const hasMasRef = useRef(hasMas)
  const cargandoRef = useRef(cargando)
  const ordenamientoRef = useRef(ordenamiento)
  useEffect(() => {
    registrosRef.current = registros
    hasMasRef.current = hasMas
    cargandoRef.current = cargando
    ordenamientoRef.current = ordenamiento
  })

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

  const ahora = useMemo(() => new Date(), [])
  const inicioDia = useMemo(() => {
    const d = new Date(ahora)
    d.setHours(0, 0, 0, 0)
    return d
  }, [ahora])
  const finDia = useMemo(() => {
    const d = new Date(ahora)
    d.setHours(23, 59, 59, 999)
    return d
  }, [ahora])

  const conteos = useMemo(() => {
    const activos = registros.filter(
      (r) => !r.estaCompletado && (!r.fechaVencimiento || new Date(r.fechaVencimiento) >= inicioDia),
    ).length
    const vencidos = registros.filter(
      (r) => !r.estaCompletado && r.fechaVencimiento && new Date(r.fechaVencimiento) < inicioDia,
    ).length
    const hoy = registros.filter(
      (r) =>
        !r.estaCompletado &&
        r.fechaVencimiento &&
        new Date(r.fechaVencimiento) >= inicioDia &&
        new Date(r.fechaVencimiento) <= finDia,
    ).length
    const completados = registros.filter((r) => r.estaCompletado).length
    return { activos, vencidos, hoy, completados }
  }, [registros, inicioDia, finDia])

  const registrosFiltrados = useMemo(() => {
    if (filtro === 'todos') return registros
    if (filtro === 'activos')
      return registros.filter(
        (r) => !r.estaCompletado && (!r.fechaVencimiento || new Date(r.fechaVencimiento) >= inicioDia),
      )
    if (filtro === 'vencidos')
      return registros.filter(
        (r) => !r.estaCompletado && r.fechaVencimiento && new Date(r.fechaVencimiento) < inicioDia,
      )
    if (filtro === 'hoy')
      return registros.filter(
        (r) =>
          !r.estaCompletado &&
          r.fechaVencimiento &&
          new Date(r.fechaVencimiento) >= inicioDia &&
          new Date(r.fechaVencimiento) <= finDia,
      )
    if (filtro === 'completados') return registros.filter((r) => r.estaCompletado)
    return registros
  }, [registros, filtro, inicioDia, finDia])

  const pillsFiltro: { id: FiltroEstado; label: string; count: number }[] = [
    { id: 'todos', label: 'Todos', count: registros.length },
    { id: 'activos', label: 'Activos', count: conteos.activos },
    { id: 'vencidos', label: 'Vencidos', count: conteos.vencidos },
    { id: 'hoy', label: 'Hoy', count: conteos.hoy },
    { id: 'completados', label: 'Completados', count: conteos.completados },
  ]

  return (
    <div>
      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {pillsFiltro.map((pill) => {
          const activo = filtro === pill.id
          return (
            <button
              key={pill.id}
              onClick={() => setFiltro(pill.id)}
              className="inline-flex items-center gap-1.5 transition-all duration-150"
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                fontSize: '12.5px',
                fontWeight: activo ? 500 : 400,
                background: activo ? 'var(--ink)' : 'var(--bg)',
                color: activo ? 'var(--bg)' : 'var(--ink-2)',
                border: `1px solid ${activo ? 'var(--ink)' : 'var(--line-2)'}`,
              }}
            >
              {pill.label}
              <span
                className="mono"
                style={{
                  fontSize: '10.5px',
                  fontWeight: 500,
                  padding: '1px 5px',
                  borderRadius: '999px',
                  background: activo ? 'rgba(255,255,255,0.2)' : 'var(--bg-soft)',
                  color: activo ? 'var(--bg)' : 'var(--ink-3)',
                }}
              >
                {pill.count}
              </span>
            </button>
          )
        })}

        <div className="ml-auto">
          <Select
            value={ordenamiento}
            onValueChange={(v) => void cambiarOrdenamiento(v as OrdenamientoRecordatorio)}
            disabled={cargando}
          >
            <SelectTrigger className="w-44 h-8 text-xs">
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
      </div>

      <ListaRecordatorios
        recordatorios={registrosFiltrados}
        categorias={categorias}
        mensajeVacio={mensajeVacio}
        diasAutoEliminar={diasAutoEliminar}
        destacadoId={destacadoId}
      />

      <div ref={centinela} className="h-10 flex items-center justify-center mt-2">
        {cargando && <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--ink-3)' }} />}
      </div>
    </div>
  )
}
