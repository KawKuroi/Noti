'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { Extraccion } from '@/lib/ai/extractor'
import type { ResultadoLanzamiento, FuenteLanzamiento } from '@/types/release.types'
import {
  crearRecordatorioDesdeIA,
  crearRecordatorioLanzamiento,
} from '@/lib/actions/reminder.actions'
import { TIPO_LANZAMIENTO_A_SLUG } from '@/lib/utils/constants'
import type { DatosFormulario } from './recordatorio-form-card'

const CLAVE_STORAGE = 'noti:asistente:ultimo'

type Estado = 'idle' | 'extrayendo' | 'buscando' | 'listo' | 'creando' | 'error'

interface EstadoPersistido {
  query: string
  extraccion: Extraccion | null
  candidatos: ResultadoLanzamiento[]
}

interface AsistenteContextValue {
  abierto: boolean
  abrir: () => void
  cerrar: () => void
  alternar: () => void

  query: string
  setQuery: (v: string) => void
  estado: Estado
  extraccion: Extraccion | null
  candidatos: ResultadoLanzamiento[]
  error: string | null

  procesar: (texto: string) => Promise<void>
  confirmarCandidato: (
    candidato: ResultadoLanzamiento,
    fechaConfirmada: string,
    fuente: FuenteLanzamiento,
  ) => Promise<boolean>
  confirmarRecordatorioEditado: (datos: DatosFormulario) => Promise<boolean>
  construirInicialFormulario: () => DatosFormulario
  limpiar: () => void
}

const AsistenteContext = createContext<AsistenteContextValue | null>(null)

interface Props {
  children: React.ReactNode
}

function inicialVacia(query: string): DatosFormulario {
  return {
    titulo: query.trim(),
    categoriaSlug: 'events',
    fechaVencimiento: null,
    horaVencimiento: null,
    esRecurrente: false,
    reglaRecurrencia: null,
    descripcion: null,
  }
}

function inicialDesdeExtraccion(extraccion: Extraccion, query: string): DatosFormulario {
  if (extraccion.intencion === 'recordatorio_personal' && extraccion.recordatorio) {
    const r = extraccion.recordatorio
    return {
      titulo: r.titulo,
      categoriaSlug: r.categoriaSlug,
      fechaVencimiento: r.fechaVencimiento,
      horaVencimiento: r.horaVencimiento,
      esRecurrente: r.esRecurrente,
      reglaRecurrencia: r.reglaRecurrencia,
      descripcion: r.descripcion,
    }
  }

  if (
    (extraccion.intencion === 'lanzamiento_especifico' ||
      extraccion.intencion === 'lanzamiento_generico') &&
    extraccion.lanzamiento
  ) {
    const l = extraccion.lanzamiento
    const slug = l.tipo ? TIPO_LANZAMIENTO_A_SLUG[l.tipo] : 'events'
    const titulo = l.titulo?.trim() || l.contexto?.trim() || query.trim()
    const descPartes: string[] = []
    if (l.artista) descPartes.push(l.artista)
    if (l.contexto && l.titulo && l.contexto !== l.titulo) descPartes.push(l.contexto)
    return {
      titulo,
      categoriaSlug: slug,
      fechaVencimiento: null,
      horaVencimiento: null,
      esRecurrente: false,
      reglaRecurrencia: null,
      descripcion: descPartes.length > 0 ? descPartes.join(' · ') : null,
    }
  }

  return inicialVacia(query)
}

export function AsistenteProvider({ children }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [query, setQueryRaw] = useState('')
  const [estado, setEstado] = useState<Estado>('idle')
  const [extraccion, setExtraccion] = useState<Extraccion | null>(null)
  const [candidatos, setCandidatos] = useState<ResultadoLanzamiento[]>([])
  const [error, setError] = useState<string | null>(null)
  const hidratadoRef = useRef(false)

  useEffect(() => {
    if (hidratadoRef.current) return
    hidratadoRef.current = true
    try {
      const guardado = sessionStorage.getItem(CLAVE_STORAGE)
      if (!guardado) return
      const parsed = JSON.parse(guardado) as EstadoPersistido
      if (parsed.query) setQueryRaw(parsed.query)
      if (parsed.extraccion) setExtraccion(parsed.extraccion)
      if (Array.isArray(parsed.candidatos)) setCandidatos(parsed.candidatos)
      if (parsed.extraccion || parsed.candidatos.length > 0) setEstado('listo')
    } catch {}
  }, [])

  useEffect(() => {
    if (!hidratadoRef.current) return
    try {
      if (!query && !extraccion && candidatos.length === 0) {
        sessionStorage.removeItem(CLAVE_STORAGE)
        return
      }
      const snapshot: EstadoPersistido = { query, extraccion, candidatos }
      sessionStorage.setItem(CLAVE_STORAGE, JSON.stringify(snapshot))
    } catch {}
  }, [query, extraccion, candidatos])

  const abrir = useCallback(() => setAbierto(true), [])
  const cerrar = useCallback(() => setAbierto(false), [])
  const alternar = useCallback(() => setAbierto((v) => !v), [])

  useEffect(() => {
    function manejarTecla(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault()
        setAbierto((v) => !v)
      }
    }
    window.addEventListener('keydown', manejarTecla)
    return () => window.removeEventListener('keydown', manejarTecla)
  }, [])

  const setQuery = useCallback((v: string) => setQueryRaw(v), [])

  const limpiar = useCallback(() => {
    setQueryRaw('')
    setExtraccion(null)
    setCandidatos([])
    setError(null)
    setEstado('idle')
    try {
      sessionStorage.removeItem(CLAVE_STORAGE)
    } catch {}
  }, [])

  const procesar = useCallback(async (texto: string) => {
    const trimmed = texto.trim()
    if (trimmed.length < 3) {
      setEstado('idle')
      setExtraccion(null)
      setCandidatos([])
      setError(null)
      return
    }

    setEstado('extrayendo')
    setError(null)
    setExtraccion(null)
    setCandidatos([])

    try {
      const hoy = new Date()
      const fechaHoy = [
        hoy.getFullYear(),
        String(hoy.getMonth() + 1).padStart(2, '0'),
        String(hoy.getDate()).padStart(2, '0'),
      ].join('-')

      const resExt = await fetch('/api/asistente/extraer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: trimmed, fechaHoy }),
      })

      if (!resExt.ok) {
        const data = await resExt.json().catch(() => null)
        setError(data?.error ?? 'No pude entender el texto')
        setEstado('error')
        return
      }

      const datosExtraccion = (await resExt.json()) as Extraccion
      setExtraccion(datosExtraccion)

      if (datosExtraccion.intencion === 'recordatorio_personal') {
        setEstado('listo')
        return
      }

      if (datosExtraccion.intencion === 'desconocido') {
        setError(datosExtraccion.aclaracion ?? 'Sé más específico, por favor')
        setEstado('listo')
        return
      }

      setEstado('buscando')
      const resCand = await fetch('/api/asistente/candidatos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extraccion: datosExtraccion }),
      })

      if (!resCand.ok) {
        setError('No se pudieron obtener candidatos')
        setEstado('error')
        return
      }

      const { candidatos: nuevos } = (await resCand.json()) as {
        candidatos: ResultadoLanzamiento[]
      }
      setCandidatos(nuevos)
      setEstado('listo')
    } catch (e) {
      console.error(e)
      setError('Error de conexion con el asistente')
      setEstado('error')
    }
  }, [])

  const confirmarCandidato = useCallback(
    async (
      candidato: ResultadoLanzamiento,
      fechaConfirmada: string,
      fuente: FuenteLanzamiento,
    ): Promise<boolean> => {
      setEstado('creando')
      const resultado = await crearRecordatorioLanzamiento({
        titulo: candidato.titulo,
        tipo: candidato.tipo,
        fechaLanzamiento: fechaConfirmada,
        fuente,
        tmdbId: candidato.tmdbId,
        rawgId: candidato.rawgId,
        musicbrainzId: candidato.musicbrainzId,
        googleBooksId: candidato.googleBooksId,
        posterUrl: candidato.posterUrl,
        descripcion: candidato.descripcion,
        autor: candidato.autor,
        artista: candidato.artista,
        plataforma: candidato.plataforma,
        director: candidato.director,
        temporada: candidato.temporada,
      })
      if (resultado.ok) {
        toast.success('Lanzamiento agregado al calendario')
        limpiar()
        setAbierto(false)
        return true
      }
      const msg = typeof resultado.error === 'string' ? resultado.error : 'No se pudo agregar'
      toast.error(msg)
      setError(msg)
      setEstado('listo')
      return false
    },
    [limpiar],
  )

  const confirmarRecordatorioEditado = useCallback(
    async (datos: DatosFormulario): Promise<boolean> => {
      setEstado('creando')
      const resultado = await crearRecordatorioDesdeIA({
        titulo: datos.titulo,
        categoriaSlug: datos.categoriaSlug,
        fechaVencimiento: datos.fechaVencimiento,
        horaVencimiento: datos.horaVencimiento,
        esRecurrente: datos.esRecurrente,
        reglaRecurrencia: datos.reglaRecurrencia,
        descripcion: datos.descripcion,
      })
      if (resultado.ok) {
        toast.success('Recordatorio creado')
        limpiar()
        setAbierto(false)
        return true
      }
      const msg = typeof resultado.error === 'string' ? resultado.error : 'No se pudo crear'
      toast.error(msg)
      setError(msg)
      setEstado('listo')
      return false
    },
    [limpiar],
  )

  const construirInicialFormulario = useCallback((): DatosFormulario => {
    if (extraccion) return inicialDesdeExtraccion(extraccion, query)
    return inicialVacia(query)
  }, [extraccion, query])

  const valor = useMemo<AsistenteContextValue>(
    () => ({
      abierto,
      abrir,
      cerrar,
      alternar,
      query,
      setQuery,
      estado,
      extraccion,
      candidatos,
      error,
      procesar,
      confirmarCandidato,
      confirmarRecordatorioEditado,
      construirInicialFormulario,
      limpiar,
    }),
    [
      abierto,
      abrir,
      cerrar,
      alternar,
      query,
      setQuery,
      estado,
      extraccion,
      candidatos,
      error,
      procesar,
      confirmarCandidato,
      confirmarRecordatorioEditado,
      construirInicialFormulario,
      limpiar,
    ],
  )

  return <AsistenteContext.Provider value={valor}>{children}</AsistenteContext.Provider>
}

export function useAsistente(): AsistenteContextValue {
  const ctx = useContext(AsistenteContext)
  if (!ctx) throw new Error('useAsistente debe usarse dentro de AsistenteProvider')
  return ctx
}
