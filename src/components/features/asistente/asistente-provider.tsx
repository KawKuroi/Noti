'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { Extraccion } from '@/lib/ai/extractor'
import type { ResultadoLanzamiento, FuenteLanzamiento } from '@/types/release.types'
import {
  crearRecordatorioDesdeIA,
  crearRecordatorioLanzamiento,
} from '@/lib/actions/reminder.actions'

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
  confirmarRecordatorio: () => Promise<boolean>
  limpiar: () => void
}

const AsistenteContext = createContext<AsistenteContextValue | null>(null)

interface Props {
  children: React.ReactNode
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
      const estado: EstadoPersistido = { query, extraccion, candidatos }
      sessionStorage.setItem(CLAVE_STORAGE, JSON.stringify(estado))
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
        setError(datosExtraccion.aclaracion ?? 'Se mas especifico, por favor')
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

  const confirmarRecordatorio = useCallback(async (): Promise<boolean> => {
    if (!extraccion?.recordatorio) return false
    const r = extraccion.recordatorio
    setEstado('creando')
    const resultado = await crearRecordatorioDesdeIA({
      titulo: r.titulo,
      categoriaSlug: r.categoriaSlug,
      fechaVencimiento: r.fechaVencimiento,
      horaVencimiento: r.horaVencimiento,
      esRecurrente: r.esRecurrente,
      reglaRecurrencia: r.reglaRecurrencia,
      descripcion: r.descripcion,
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
  }, [extraccion, limpiar])

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
      confirmarRecordatorio,
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
      confirmarRecordatorio,
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
