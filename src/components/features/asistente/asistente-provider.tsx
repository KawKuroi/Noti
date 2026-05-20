'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { Extraccion } from '@/lib/ai/extractor'
import type { ResultadoLanzamiento, FuenteLanzamiento, TipoLanzamiento } from '@/types/release.types'
import {
  crearRecordatorioDesdeIA,
  crearRecordatorioLanzamiento,
} from '@/lib/actions/reminder.actions'
import { SLUGS_LANZAMIENTO, TIPO_LANZAMIENTO_A_SLUG } from '@/lib/utils/constants'
import { parsearFechaNatural } from '@/lib/utils/parsear-fecha-natural'
import type { DatosFormulario } from './recordatorio-form-card'

const CLAVE_STORAGE = 'noti:asistente:ultimo'

type Estado = 'idle' | 'extrayendo' | 'buscando' | 'listo' | 'creando' | 'error'

const SLUGS_LANZAMIENTO_SET = new Set<string>(SLUGS_LANZAMIENTO)

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

  // Las paginas que montan la barra `<BarraAsistente />` se registran aqui
  // para que el atajo global Ctrl+I solo dispare cuando hay un ancla visible.
  registrarBarra: () => () => void

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
    anticipacionMin: 15,
    tipoLanzamiento: null,
    autor: null,
    artista: null,
    director: null,
    edad: null,
    ubicacion: null,
    duracionMin: null,
    prioridad: null,
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
      anticipacionMin: 15,
      tipoLanzamiento: null,
      autor: null,
      artista: null,
      director: null,
      edad: null,
      ubicacion: null,
      duracionMin: null,
      prioridad: r.categoriaSlug === 'tasks' ? 'media' : null,
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
    const autor = l.tipo === 'book' ? l.artista ?? null : null
    const artista = l.tipo === 'album' ? l.artista ?? null : null
    return {
      titulo,
      categoriaSlug: slug,
      fechaVencimiento: l.fechaTentativa,
      horaVencimiento: null,
      esRecurrente: false,
      reglaRecurrencia: null,
      descripcion: descPartes.length > 0 ? descPartes.join(' · ') : null,
      anticipacionMin: 15,
      tipoLanzamiento: l.tipo,
      autor,
      artista,
      director: null,
      edad: null,
      ubicacion: null,
      duracionMin: null,
      prioridad: null,
    }
  }

  return inicialVacia(query)
}

function tipoDesdeSlug(slug: string): TipoLanzamiento | null {
  const entrada = (Object.entries(TIPO_LANZAMIENTO_A_SLUG) as [TipoLanzamiento, string][]).find(
    ([, valor]) => valor === slug,
  )
  return entrada ? entrada[0] : null
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

  // Contador de instancias de la barra montadas. Solo cuando >0 el atajo Ctrl+I
  // actua, ya que el dropdown necesita un ancla DOM para posicionarse.
  const barrasMontadasRef = useRef(0)
  const registrarBarra = useCallback(() => {
    barrasMontadasRef.current += 1
    return () => {
      barrasMontadasRef.current = Math.max(0, barrasMontadasRef.current - 1)
      // Si la pagina cambio y ya no hay barras, cerrar el dropdown abierto.
      if (barrasMontadasRef.current === 0) setAbierto(false)
    }
  }, [])

  useEffect(() => {
    function manejarTecla(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        if (barrasMontadasRef.current === 0) return
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

      // Fallback determinista: si el LLM no devolvio fecha pero el texto la contiene,
      // intentar parseo natural antes de continuar.
      if (
        datosExtraccion.intencion === 'recordatorio_personal' &&
        datosExtraccion.recordatorio &&
        datosExtraccion.recordatorio.fechaVencimiento === null
      ) {
        const fechaParseada = parsearFechaNatural(trimmed, hoy)
        if (fechaParseada) {
          datosExtraccion.recordatorio.fechaVencimiento = fechaParseada
        }
      }

      if (
        (datosExtraccion.intencion === 'lanzamiento_especifico' ||
          datosExtraccion.intencion === 'lanzamiento_generico') &&
        datosExtraccion.lanzamiento &&
        datosExtraccion.lanzamiento.fechaTentativa === null
      ) {
        const fechaParseada = parsearFechaNatural(trimmed, hoy)
        if (fechaParseada) {
          datosExtraccion.lanzamiento.fechaTentativa = fechaParseada
        }
      }

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

      // Propagar fechaTentativa a candidatos cuya fuente no confirmo la fecha,
      // para que la CandidatoCard pre-rellene el datepicker.
      const fechaTentativa = datosExtraccion.lanzamiento?.fechaTentativa ?? null
      const enriquecidos: ResultadoLanzamiento[] = fechaTentativa
        ? nuevos.map((c) =>
            !c.fechaLanzamiento || c.tba ? { ...c, fechaTentativa } : c,
          )
        : nuevos

      setCandidatos(enriquecidos)
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

      const esLanzamientoCategoria = SLUGS_LANZAMIENTO_SET.has(datos.categoriaSlug)
      const tipoEfectivo = datos.tipoLanzamiento ?? tipoDesdeSlug(datos.categoriaSlug)

      if (esLanzamientoCategoria && tipoEfectivo && datos.fechaVencimiento) {
        const resultado = await crearRecordatorioLanzamiento({
          titulo: datos.titulo,
          tipo: tipoEfectivo,
          fechaLanzamiento: datos.fechaVencimiento,
          fuente: 'manual',
          descripcion: datos.descripcion ?? undefined,
          autor: datos.autor ?? undefined,
          artista: datos.artista ?? undefined,
          director: datos.director ?? undefined,
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
      }

      const metadatos: Record<string, unknown> = {}
      if (datos.categoriaSlug === 'birthdays' && datos.edad != null) {
        metadatos.edad = datos.edad
      }
      if (datos.categoriaSlug === 'events' && datos.ubicacion) {
        metadatos.ubicacion = datos.ubicacion
      }
      if (datos.categoriaSlug === 'study' && datos.duracionMin != null) {
        metadatos.duracionMin = datos.duracionMin
      }
      if (datos.categoriaSlug === 'tasks' && datos.prioridad) {
        metadatos.prioridad = datos.prioridad
      }

      // Construir fechaHoraUtc en cliente respetando la zona horaria local.
      // `new Date('YYYY-MM-DDTHH:mm:00')` se interpreta como hora local del navegador,
      // y `.toISOString()` devuelve el UTC equivalente — coherente con el form manual.
      // Si no hay hora explicita, usamos 09:00 LOCAL del usuario (no del servidor).
      let fechaHoraUtc: string | undefined
      if (datos.fechaVencimiento) {
        const horaParaCombinar = datos.horaVencimiento ?? '09:00'
        const d = new Date(`${datos.fechaVencimiento}T${horaParaCombinar}:00`)
        if (!isNaN(d.getTime())) fechaHoraUtc = d.toISOString()
      }

      const resultado = await crearRecordatorioDesdeIA({
        titulo: datos.titulo,
        categoriaSlug: datos.categoriaSlug,
        fechaVencimiento: datos.fechaVencimiento,
        horaVencimiento: datos.horaVencimiento,
        fechaHoraUtc,
        esRecurrente: datos.esRecurrente,
        reglaRecurrencia: datos.reglaRecurrencia,
        descripcion: datos.descripcion,
        anticipacionMin: datos.anticipacionMin,
        metadatos: Object.keys(metadatos).length > 0 ? metadatos : undefined,
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
      registrarBarra,
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
      registrarBarra,
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
