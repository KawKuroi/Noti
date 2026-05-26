'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Mic, Search, Sparkles, Square, X } from 'lucide-react'
import { useAsistente } from './asistente-provider'
import { CandidatoCard } from './candidato-card'
import { RecordatorioFormCard } from './recordatorio-form-card'
import { useAudioRecorder } from '@/hooks/use-audio-recorder'

const EJEMPLOS = [
  'Cumpleaños de Marta el 21 de junio',
  'Clase de inglés los martes a las 7pm',
  'Lanzamiento de GTA 6',
  'Nuevo álbum de The Weeknd',
  'Cuándo sale el nuevo Zelda',
]

interface BarraInputAsistenteProps {
  inputRef: React.RefObject<HTMLInputElement | null>
}

// Header/anchor del asistente: mismo padding y estructura que el boton cerrado de
// BarraAsistente, pero con input real + acciones (mic, buscar, limpiar, cerrar).
// Mantiene la misma apariencia para que no haya salto visual al abrir.
export function BarraInputAsistente({ inputRef }: BarraInputAsistenteProps) {
  const {
    cerrar,
    query,
    setQuery,
    estado,
    extraccion,
    candidatos,
    procesar,
    confirmarCandidato,
    limpiar,
  } = useAsistente()

  const alTranscribir = useCallback(
    (texto: string) => {
      setQuery(texto)
    },
    [setQuery],
  )

  const { estadoGrabacion, segundosGrabando, errorGrabacion, iniciarGrabacion, detenerGrabacion } =
    useAudioRecorder(alTranscribir)

  const cargando = estado === 'extrayendo' || estado === 'buscando'
  const creando = estado === 'creando'
  const hayResultado = !!extraccion || candidatos.length > 0
  const puedeBuscar = query.trim().length >= 3 && !cargando && !creando
  const micDeshabilitado = cargando || creando || estadoGrabacion === 'procesando'

  const ejecutarBusqueda = useCallback(() => {
    if (query.trim().length < 3) return
    procesar(query)
  }, [query, procesar])

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      cerrar()
      return
    }
    if (e.key === 'Enter') {
      if (candidatos.length > 0) {
        e.preventDefault()
        const c = candidatos[0]
        if (c && c.fechaLanzamiento && !c.tba) {
          confirmarCandidato(c, c.fechaLanzamiento, c.fuente)
        }
        return
      }
      e.preventDefault()
      ejecutarBusqueda()
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border bg-card shadow-sm">
        <Sparkles size={18} className="text-purple-600 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="¿Qué te recuerdo o agendo?"
          className="flex-1 text-sm outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
        />

        {estadoGrabacion === 'grabando' ? (
          <button
            type="button"
            onClick={detenerGrabacion}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-colors shrink-0"
            title="Detener grabacion"
          >
            <Square size={12} />
            {segundosGrabando}s
          </button>
        ) : estadoGrabacion === 'procesando' ? (
          <Loader2 size={14} className="text-purple-500 animate-spin shrink-0" />
        ) : (
          <button
            type="button"
            onClick={iniciarGrabacion}
            disabled={micDeshabilitado}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            title="Dictado por voz"
            aria-label="Dictado por voz"
          >
            <Mic size={14} />
          </button>
        )}

        <button
          type="button"
          onClick={ejecutarBusqueda}
          disabled={!puedeBuscar}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          aria-label="Buscar"
          title="Buscar (Enter)"
        >
          <Search size={12} />
          Buscar
        </button>
        {hayResultado && !cargando && (
          <button
            type="button"
            onClick={limpiar}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            Limpiar
          </button>
        )}
        <button
          type="button"
          onClick={cerrar}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
      </div>

      {errorGrabacion && (
        <div className="mt-2 px-3 py-2 rounded-md bg-red-50 border border-red-100">
          <p className="text-xs text-red-600">{errorGrabacion}</p>
        </div>
      )}
    </>
  )
}

// Panel desplegable de sugerencias/resultados. Se renderiza posicionado absoluto
// debajo de la barra para no empujar el contenido inferior.
export function PanelSugerencias() {
  const {
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
  } = useAsistente()

  const [indiceSeleccionado, setIndiceSeleccionado] = useState(0)
  const [mostrarFormManual, setMostrarFormManual] = useState(false)

  useEffect(() => {
    setIndiceSeleccionado(0)
    setMostrarFormManual(false)
  }, [candidatos, extraccion])

  const cargando = estado === 'extrayendo' || estado === 'buscando'
  const creando = estado === 'creando'
  const hayResultado = !!extraccion || candidatos.length > 0

  const usarEjemplo = (texto: string) => {
    setQuery(texto)
    procesar(texto)
  }

  const intencion = extraccion?.intencion
  const esLanzamiento =
    intencion === 'lanzamiento_especifico' || intencion === 'lanzamiento_generico'

  const mostrarFormPersonal = intencion === 'recordatorio_personal'
  const mostrarFormFallbackLanzamiento =
    esLanzamiento && estado === 'listo' && candidatos.length === 0
  const mostrarFormDesconocido = intencion === 'desconocido'
  const mostrarFormVoluntario = esLanzamiento && candidatos.length > 0 && mostrarFormManual

  const mostrarForm =
    mostrarFormPersonal ||
    mostrarFormFallbackLanzamiento ||
    mostrarFormDesconocido ||
    mostrarFormVoluntario

  const modoForm: 'personal' | 'lanzamiento' = esLanzamiento ? 'lanzamiento' : 'personal'

  // Cuando esta cerrado el query y no hay resultados ni carga, muestra solo ejemplos.
  // Aunque el query sea breve, seguimos mostrando ejemplos para guiar al usuario.
  return (
    <div className="flex flex-col max-h-[60vh] bg-card rounded-xl shadow-2xl border border-border overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!hayResultado && !cargando && (
          <div className="py-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Ejemplos</p>
            <div className="flex flex-wrap gap-1.5">
              {EJEMPLOS.map((ej) => (
                <button
                  key={ej}
                  type="button"
                  onClick={() => usarEjemplo(ej)}
                  className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  {ej}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              Atajo: Ctrl+I para abrir/cerrar · Enter o botón Buscar para procesar
            </p>
          </div>
        )}

        {cargando && (
          <div className="space-y-2 py-2">
            <div className="h-20 bg-muted rounded-lg animate-pulse" />
            <div className="h-20 bg-muted rounded-lg animate-pulse" />
          </div>
        )}

        {!cargando && mostrarFormDesconocido && extraccion?.aclaracion && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {extraccion.aclaracion}
          </div>
        )}

        {!cargando && mostrarFormFallbackLanzamiento && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            No encontré candidatos en las fuentes. Puedes crearlo manualmente con la info
            que tengamos hasta ahora.
          </div>
        )}

        {!cargando && mostrarForm && (
          <RecordatorioFormCard
            inicial={construirInicialFormulario()}
            modo={modoForm}
            creando={creando}
            onGuardar={confirmarRecordatorioEditado}
            onCancelar={limpiar}
          />
        )}

        {!cargando && esLanzamiento && candidatos.length > 0 && !mostrarFormManual && (
          <>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {candidatos.length} {candidatos.length === 1 ? 'candidato' : 'candidatos'} · elige
              el correcto
            </p>
            <div className="space-y-2">
              {candidatos.map((c, idx) => (
                <CandidatoCard
                  key={`${c.fuente}-${c.tmdbId ?? c.rawgId ?? c.musicbrainzId ?? c.googleBooksId ?? idx}`}
                  candidato={c}
                  seleccionado={idx === indiceSeleccionado}
                  creando={creando && idx === indiceSeleccionado}
                  onSeleccionar={() => setIndiceSeleccionado(idx)}
                  onConfirmar={(fecha, fuente) => confirmarCandidato(c, fecha, fuente)}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMostrarFormManual(true)}
              className="w-full text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 py-2 transition-colors"
            >
              ¿No es ninguno? Crear manualmente
            </button>
          </>
        )}

        {error && estado === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {hayResultado && (
        <footer className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          {mostrarForm ? (
            <span>Esc cancela · completa los campos y guarda</span>
          ) : esLanzamiento && candidatos.length > 0 ? (
            <span>↑↓ navega · Enter selecciona · Esc cierra</span>
          ) : (
            <span>Esc cierra</span>
          )}
        </footer>
      )}
    </div>
  )
}

// Compatibilidad con el layout antiguo (no se monta a nivel layout).
export function CommandPalette() {
  return null
}
