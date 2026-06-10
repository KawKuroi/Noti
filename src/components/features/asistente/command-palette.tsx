'use client'

import { useEffect, useState } from 'react'
import { useAsistente } from './asistente-provider'
import { CandidatoCard } from './candidato-card'
import { RecordatorioFormCard } from './recordatorio-form-card'

const EJEMPLOS = [
  'Cumpleaños de Marta el 21 de junio',
  'Clase de inglés los martes a las 7pm',
  'Lanzamiento de GTA 6',
  'Nuevo álbum de The Weeknd',
  'Cuándo sale el nuevo Zelda',
]

// Panel desplegable de sugerencias/resultados. Se renderiza posicionado absoluto
// debajo de la barra para no empujar el contenido inferior.
export function PanelSugerencias() {
  const {
    query,
    setQuery,
    estado,
    extraccion,
    candidatos,
    fuentesFallidas,
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
    <div className="flex flex-col max-h-[85vh] bg-[var(--bg-elev)] rounded-xl shadow-2xl border border-[var(--line)] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!hayResultado && !cargando && (
          <div className="py-2">
            <p className="text-xs text-[var(--ink-3)] uppercase tracking-wider mb-2">Ejemplos</p>
            <div className="flex flex-wrap gap-1.5">
              {EJEMPLOS.map((ej) => (
                <button
                  key={ej}
                  type="button"
                  onClick={() => usarEjemplo(ej)}
                  className="text-xs px-2 py-1 rounded-full bg-[var(--bg-soft)] text-[var(--ink-3)] hover:bg-[var(--bg-soft)]/80 transition-colors"
                >
                  {ej}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[var(--ink-3)] mt-3">
              Atajo: Ctrl+I para abrir/cerrar · Enter o botón Buscar para procesar
            </p>
          </div>
        )}

        {cargando && (
          <div className="space-y-2 py-2">
            <div className="h-20 bg-[var(--bg-soft)] rounded-lg animate-pulse" />
            <div className="h-20 bg-[var(--bg-soft)] rounded-lg animate-pulse" />
          </div>
        )}

        {!cargando && mostrarFormDesconocido && extraccion?.aclaracion && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {extraccion.aclaracion}
          </div>
        )}

        {/* Fuente caida: distinto de "sin resultados" — avisa que el resultado
            puede estar incompleto y ofrece reintentar la busqueda. */}
        {!cargando && esLanzamiento && fuentesFallidas.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 flex items-center justify-between gap-3">
            <span>
              No pude consultar {fuentesFallidas.join(', ')}. El resultado puede estar
              incompleto.
            </span>
            <button
              type="button"
              onClick={() => procesar(query)}
              className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-md border border-amber-300 hover:bg-amber-100 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {!cargando && mostrarFormFallbackLanzamiento && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {fuentesFallidas.length > 0
              ? 'Las fuentes que respondieron no tienen candidatos. Reintenta o crealo manualmente.'
              : 'No encontré candidatos en las fuentes. Puedes crearlo manualmente con la info que tengamos hasta ahora.'}
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
            <p className="text-xs text-[var(--ink-3)] uppercase tracking-wider">
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
              className="w-full text-xs text-[var(--ink-3)] hover:text-[var(--ink)] underline underline-offset-2 py-2 transition-colors"
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
        <footer className="border-t border-[var(--line)] px-4 py-2 text-[11px] text-[var(--ink-3)]">
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
