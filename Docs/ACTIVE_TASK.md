### 1. Contexto y Archivos Afectados

**Tarea:** Sprint de 4 features de Fase 23 — full-text search, deteccion de duplicados IA, sugerencias de categoria en formulario manual, y cache SWR en busqueda global.

| Archivo | Feature | Rol |
|---|---|---|
| `src/lib/queries/reminder.queries.ts` | FTS + duplicados | Mejorar `buscarRecordatorios` con tsvector; agregar `buscarRecordatoriosSimilares` |
| `src/lib/actions/reminder.actions.ts` | Duplicados | Agregar server action `verificarDuplicado(titulo, categoriaSlug)` |
| `src/components/features/asistente/asistente-provider.tsx` | Duplicados | Llamar `verificarDuplicado` en `confirmarRecordatorioEditado` antes de crear |
| `src/components/features/reminders/formulario-recordatorio.tsx` | Sugerencias | Tracking del titulo + mapa de palabras clave + chip de sugerencia de categoria |
| `src/components/features/busqueda-global.tsx` | SWR | Reemplazar fetch+debounce manual por `useSWR` con cache de resultados |
| `package.json` | SWR | Agregar dependencia `swr` via npm install |

**Justificacion de exceso (6 archivos):** el usuario solicito explicitamente los 4 features en un solo ciclo; cada feature es independiente y toca archivos distintos.

### 3. Reporte de Pruebas

**Estado:** [APROBADO]

- Cumplimiento funcional: FTS con tsvector + ilike fallback, deteccion de duplicados (warning no bloqueante), sugerencias de categoria por palabras clave, SWR con cache 10s y revalidacion desactivada en foco.
- Espanol absoluto: todos los identificadores, constantes y funciones nuevas en espanol. Verificado.
- Seguridad: sin secretos hardcodeados. RLS respetado en todas las queries. Verificado.
- `npx tsc --noEmit`: sin errores.
- `npx next lint`: sin warnings ni errores.

### 2. Plan de Accion Detallado

#### Bloque 1 — Full-text search (reminder.queries.ts)

- [x] **Paso 1: [src/lib/queries/reminder.queries.ts]** Modificar `buscarRecordatorios`: agregar como primera condicion del `or()` un bloque FTS con `sql\`to_tsvector('spanish', coalesce(${recordatorios.titulo}, '') || ' ' || coalesce(${recordatorios.descripcion}, '')) @@ websearch_to_tsquery('spanish', ${texto})\`` (usando `texto` limpio, sin %). Mantener las tres condiciones `ilike` existentes como fallback. Extraer `texto` del parametro antes de construir `termino`.

- [x] **Paso 2: [src/lib/queries/reminder.queries.ts]** Agregar al final del archivo la funcion exportada `buscarRecordatoriosSimilares(usuarioId: string, titulo: string, categoriaSlug: string): Promise<{ id: string; titulo: string }[]>`. Une con `categorias` por `slug = categoriaSlug`, filtra por `usuarioId`, `estaCompletado = false` e `ilike(titulo, '%texto%')`. Limite de 3 resultados.

#### Bloque 2 — Deteccion de duplicados (reminder.actions.ts + asistente-provider.tsx)

- [x] **Paso 3: [src/lib/actions/reminder.actions.ts]** Agregar import de `buscarRecordatoriosSimilares` desde reminder.queries. Agregar al final la server action exportada `verificarDuplicado(titulo: string, categoriaSlug: string): Promise<{ encontrado: boolean; titulos: string[] }>`. Llama a `obtenerUsuarioId()` y luego a `buscarRecordatoriosSimilares`. Retorna `{ encontrado: similares.length > 0, titulos: similares.map(r => r.titulo) }`.

- [x] **Paso 4: [src/components/features/asistente/asistente-provider.tsx]** Agregar import de `verificarDuplicado` desde reminder.actions. En `confirmarRecordatorioEditado`, antes de la llamada a `crearRecordatorioDesdeIA` (rama no-lanzamiento), insertar: `const chequeo = await verificarDuplicado(datos.titulo, datos.categoriaSlug)` y si `chequeo.encontrado` mostrar `toast.warning(\`Ya tienes algo similar: "${chequeo.titulos[0]}"\`)`. El flujo de creacion continua igualmente (solo avisa, no bloquea).

#### Bloque 3 — Sugerencias de categoria (formulario-recordatorio.tsx)

- [x] **Paso 5: [src/components/features/reminders/formulario-recordatorio.tsx]** En el cuerpo del modulo (fuera del componente) definir `MAPA_PALABRAS_CLAVE: Array<{ palabras: string[]; slug: string }>` con reglas para birthdays, study, movies, tv, games, books, music, tasks, events, notes. Definir la funcion pura `inferirCategoria(titulo: string): string | null`. En el componente `FormularioRecordatorio`: agregar `const [tituloActual, setTituloActual] = useState(recordatorio?.titulo ?? '')`. En el campo titulo agregar `onChange={(e) => setTituloActual(e.target.value)}`. Agregar `const categoriaInferida = useMemo(() => inferirCategoria(tituloActual), [tituloActual])`. Justo debajo del selector de categorias mostrar, cuando `categoriaInferida && categoriaInferida !== slugActual`, un `<button type="button">` con texto `Usar "NombreCategoria"` que llama a `alCambiarCategoria(categoriaInferida)` y tiene estilo borde punteado / texto gris sutil.

#### Bloque 4 — Cache SWR en busqueda global (package.json + busqueda-global.tsx)

- [x] **Paso 6: [npm install]** Ejecutar `npm install swr` para agregar la dependencia al proyecto.

- [x] **Paso 7: [src/components/features/busqueda-global.tsx]** Agregar import `import useSWR from 'swr'`. Reemplazar los estados `resultados`, `cargando` y el ref `timeoutRef` con: `const [queryDemorada, setQueryDemorada] = useState('')` + `useEffect(() => { const t = setTimeout(() => setQueryDemorada(query), 300); return () => clearTimeout(t) }, [query])` + la clave `const claveSwr = queryDemorada.trim().length >= 2 ? '/api/search?q=...' : null` + `const { data: resultados = [], isLoading: cargando } = useSWR(claveSwr, buscadorFetch, { revalidateOnFocus: false, dedupingInterval: 10000 })`. Definir `buscadorFetch` fuera del componente. Simplificar `onChange` para solo llamar `setQuery`. Simplificar `onTranscripcion` para solo llamar `setQuery`. Quitar el `useCallback` de `buscar` (ya no existe). Mantener `useCallback` para `onTranscripcion`. Actualizar la lista de imports de React quitando lo que ya no se usa.
