# Tarea activa

## Solicitud original (usuario, 2026-05-19)

> Ejecuta la Fase 18 del roadmap: que la IA entienda fechas naturales en el texto (nov 19, 20/06, 3 mar, viernes 21) sin re-prompt, y que la card de extraccion permita editar cualquier campo antes de confirmar.

## Decisiones acordadas con el usuario

- Flujo de fecha tentativa COMPLETO: el extractor gana `lanzamiento.fechaTentativa`, el pipeline parsea con `parsearFechaNatural` cuando viene null y el texto contiene token de fecha, y la `CandidatoCard` pre-rellena el datepicker con la fecha tentativa cuando la fuente devuelve TBA o sin fecha.
- Anticipacion editable: nuevo Select con `OPCIONES_ANTICIPACION` en la card; `crearRecordatorioDesdeIA` acepta `anticipacionMin` opcional (default 15).
- Autor/artista/director/tipo de lanzamiento editables en la card cuando la categoria seleccionada es un slug de lanzamiento (`movies`, `tv`, `games`, `music`, `books`). Se persisten en metadatos via `crearRecordatorioLanzamiento` con `fuente='manual'`.

## 1. Contexto y Archivos Afectados

La tarea es transversal: cubre capa IA (prompt + schema), utility de parsing, pipeline cliente (provider), UI de edicion (form-card), UI de candidatos (candidato-card) y server action. Por la naturaleza cohesiva del refactor se exceden los 5 archivos atomicos del protocolo del Lector con justificacion explicita: cada archivo toca un modulo distinto y no hay forma de consolidar sin perder cohesion.

### Cambio A - Utility de parsing de fechas naturales

- [src/lib/utils/parsear-fecha-natural.ts](src/lib/utils/parsear-fecha-natural.ts) - CREAR. Funcion `parsearFechaNatural(texto: string, hoy: Date): string | null` que devuelve `YYYY-MM-DD` o `null`. Cubre los formatos: `dd/mm`, `dd-mm`, `dd mmm`, `mmm dd`, `dd de mmmm`. Inferencia de ano: si la fecha resultante es estrictamente anterior a `hoy`, suma 1 ano. Usa `date-fns/parse` con `locale/es`. Reconoce abreviaciones de meses comunes (`ene`, `feb`, `mar`, ..., `dic`) y nombres completos. NO maneja dias de la semana relativos (`viernes 21`) en esta iteracion para evitar complejidad ambigua; el extractor LLM ya resuelve dias relativos via la regla "fecha relativa, calculala desde la fecha actual".

### Cambio B - Extender extractor con ejemplos y fecha tentativa

- [src/lib/ai/extractor.ts](src/lib/ai/extractor.ts) - Anadir al schema `lanzamiento.fechaTentativa: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable()`. En el prompt, anadir bloque de ejemplos para que el LLM reconozca `"nov 19"`, `"20/06"`, `"3 mar"`, `"viernes 21"` y los devuelva en `fechaTentativa` (lanzamientos) o `fechaVencimiento` (recordatorios) usando fecha absoluta `YYYY-MM-DD`. Mantener la regla anti-alucinacion: si no hay senal de fecha, devolver `null`.

### Cambio C - Pipeline aplica fallback y propaga fechaTentativa

- [src/components/features/asistente/asistente-provider.tsx](src/components/features/asistente/asistente-provider.tsx):
  - Tras `generateObject` (recibir `Extraccion`): si la intencion es `recordatorio_personal` y `recordatorio.fechaVencimiento` viene `null`, intentar `parsearFechaNatural(textoOriginal, hoy)` antes de marcar listo. Si devuelve fecha, mutarla en la extraccion antes de `setExtraccion`.
  - Si la intencion es `lanzamiento_*` y `lanzamiento.fechaTentativa` viene `null`, aplicar el mismo fallback.
  - Al recibir candidatos del backend, mapearlos y propagar la `fechaTentativa` de la extraccion a CADA candidato cuyo `fechaLanzamiento` sea `null` o que tenga `tba=true`. La propagacion permite que `CandidatoCard` muestre la fecha tentativa pre-rellenada.
  - En `confirmarRecordatorioEditado`: si `categoriaSlug` es un slug de lanzamiento Y la card recibe `tipoLanzamiento`, rutear a `crearRecordatorioLanzamiento` con `fuente='manual'`; si no, mantener la ruta actual a `crearRecordatorioDesdeIA` con `anticipacionMin`.
  - `inicialDesdeExtraccion`: pre-rellenar `fechaVencimiento` con `lanzamiento.fechaTentativa` cuando aplica, copiar `tipoLanzamiento`, `autor`, `artista` desde la extraccion al formulario.

### Cambio D - Form card editable completo

- [src/components/features/asistente/recordatorio-form-card.tsx](src/components/features/asistente/recordatorio-form-card.tsx):
  - Extender `DatosFormulario` con: `anticipacionMin: number`, `tipoLanzamiento: TipoLanzamiento | null`, `autor: string | null`, `artista: string | null`, `director: string | null`.
  - Anadir Select de anticipacion (debajo de Hora) con `OPCIONES_ANTICIPACION`. Default 15.
  - Cuando `categoriaSlug` esta en `SLUGS_LANZAMIENTO_SET`: mostrar Select de tipo de lanzamiento (mapeo `SlugLanzamiento -> TipoLanzamiento` automatico al cambiar categoria) e inputs opcionales segun tipo:
    - `book`: `autor`.
    - `album`: `artista`.
    - `movie`: `director`.
    - `tv` / `game`: sin input adicional por ahora (campos `temporada`/`plataforma` son numericos/derivados y no aportan en edicion manual).
  - Validacion: si la categoria es de lanzamiento y `tipoLanzamiento` esta vacio, error claro.
  - Mantener la firma de `onGuardar(datos)` y `onCancelar()`. El provider decide la ruta de guardado.

### Cambio E - Candidato pre-rellena datepicker con fecha tentativa

- [src/components/features/asistente/candidato-card.tsx](src/components/features/asistente/candidato-card.tsx):
  - Si `candidato.fechaTentativa` existe y `esTentativa(candidato)` es true, inicializar `fechaEditada` con `candidato.fechaTentativa` y `editandoFecha` con `true` para que el usuario vea la fecha pre-rellenada y solo tenga que confirmar. Si el usuario no edita, al confirmar usar la fecha tentativa con `fuente='manual'`.
  - Mantener todo lo demas igual; el cambio es minimo y compatible.

### Cambio F - Acción server acepta anticipación

- [src/lib/actions/reminder.actions.ts](src/lib/actions/reminder.actions.ts) - Funcion `crearRecordatorioDesdeIA`:
  - Anadir `anticipacionMin?: number` a `EntradaRecordatorioIA`.
  - Reemplazar `const anticipacionMs = 15 * 60 * 1000` por `const anticipacionMs = (input.anticipacionMin ?? 15) * 60 * 1000`.
  - Mantener todo el resto del flujo intacto.

### Cambio G - Tipo de candidato gana fechaTentativa

- [src/types/release.types.ts](src/types/release.types.ts) - Anadir `fechaTentativa?: string` a `ResultadoLanzamiento` como campo opcional documentado: "fecha pre-rellenada desde el texto natural del usuario cuando la fuente no la confirma (Fase 18)".

## Notas para el Planificador

- No introducir dependencias nuevas. `date-fns` v3 ya esta disponible y expone `parse` y `locale/es`.
- Regla "cambios con impacto global": `DatosFormulario` es consumida por `recordatorio-form-card.tsx`, `asistente-provider.tsx`. Verificado con grep antes de planear; ambos archivos estan en el plan.
- Esta tarea NO toca DB ni migraciones: anticipacion ya esta soportada via `notify_at` calculado en server; los metadatos de lanzamiento ya existen en columna JSONB.
- Esta tarea cierra la Fase 18 completa segun el roadmap. El Completador debera marcar todos los checkboxes de Fase 18 y mover la fase al historico si queda completa.

## 2. Plan de Accion Detallado

Secuencia: utility -> tipos -> extractor -> action -> form-card -> candidato-card -> provider. Cada paso es atomico.

### Bloque 1 - Utility de parseo de fechas naturales

- [x] **Paso 1: `src/lib/utils/parsear-fecha-natural.ts`** Crear archivo nuevo. Exportar `parsearFechaNatural(texto: string, hoy: Date): string | null`. Implementacion:
  - Tabla de meses en espanol: `{ ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, set: 8, oct: 9, nov: 10, dic: 11 }`. Tambien nombres completos: `enero`, `febrero`, etc.
  - Normalizar `texto`: lowercase, quitar acentos via `String.prototype.normalize('NFD').replace(/[̀-ͯ]/g, '')`.
  - Probar regex en orden:
    1. `(\d{1,2})[\/\-](\d{1,2})` -> dia/mes numerico.
    2. `(\d{1,2})\s+(?:de\s+)?([a-z]{3,9})` -> dia + mes textual ("3 mar", "19 de noviembre").
    3. `([a-z]{3,9})\s+(\d{1,2})` -> mes + dia ("nov 19", "noviembre 3").
  - Si match: extraer dia y mes; validar dia 1-31 y mes en tabla.
  - Construir candidato `new Date(hoy.getFullYear(), mes, dia)`. Si es estrictamente menor que `hoy` (a nivel dia), sumar 1 ano.
  - Devolver `YYYY-MM-DD` con `padStart(2, '0')`.
  - Si nada matchea, devolver `null`.
  - NO usar `date-fns` para esta utility (evita conflictos con zona horaria); todo manual con `Date` local. El JSDoc explica el porque en espanol.

### Bloque 2 - Tipo compartido

- [x] **Paso 2: `src/types/release.types.ts`** Anadir campo opcional `fechaTentativa?: string` a `ResultadoLanzamiento` con comentario corto en espanol: "Fecha pre-rellenada desde el texto natural del usuario cuando la fuente no la confirma (Fase 18)".

### Bloque 3 - Extractor con ejemplos y fechaTentativa

- [x] **Paso 3: `src/lib/ai/extractor.ts`** Anadir al schema de `lanzamiento`: `fechaTentativa: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable()`. Actualizar el prompt:
  - En el bloque del intent `lanzamiento_especifico`/`generico`, anadir reglas: "Si el texto contiene una fecha natural (`nov 19`, `20/06`, `3 mar`), conviertela a fecha absoluta `YYYY-MM-DD` y devuelvela en `lanzamiento.fechaTentativa`. Si no, deja `fechaTentativa=null`. Si la fecha cae en el pasado respecto a la fecha actual, usa el proximo ano disponible (suma 1 al ano)."
  - En el bloque de `recordatorio_personal`, ampliar los ejemplos del campo `fechaVencimiento` con: `nov 19`, `20/06`, `3 mar`, `viernes 21`.
  - Recordar la regla anti-alucinacion: si no hay senal de fecha, devolver `null`.

### Bloque 4 - Acción server con anticipación

- [x] **Paso 4: `src/lib/actions/reminder.actions.ts`** En la interfaz `EntradaRecordatorioIA`, anadir `anticipacionMin?: number`. En `crearRecordatorioDesdeIA`, reemplazar la linea `const anticipacionMs = 15 * 60 * 1000` por `const anticipacionMs = (input.anticipacionMin ?? 15) * 60 * 1000`. No tocar nada mas de la funcion.

### Bloque 5 - Form card editable completo

- [x] **Paso 5: `src/components/features/asistente/recordatorio-form-card.tsx`** Extender `DatosFormulario`:
  - Anadir campos: `anticipacionMin: number`, `tipoLanzamiento: TipoLanzamiento | null`, `autor: string | null`, `artista: string | null`, `director: string | null`.
  - Imports: `TipoLanzamiento` desde `@/types/release.types`, `OPCIONES_ANTICIPACION` desde `@/lib/utils/constants`. Tambien importar `TIPOS_LANZAMIENTO` para el Select.
  - Mapeo `slug -> tipo` reusando `TIPO_LANZAMIENTO_A_SLUG` de constants (invertido localmente como `Record<SlugLanzamiento, TipoLanzamiento>`).
  - Estados nuevos: `anticipacionMin`, `tipoLanzamiento`, `autor`, `artista`, `director`.
  - UI nueva:
    - Bajo el bloque `grid-cols-2` de fecha/hora, anadir un Select de anticipacion con label "Avisar".
    - Bloque condicional `esLanzamientoCategoria = SLUGS_LANZAMIENTO_SET.has(categoriaSlug)`:
      - Select de tipo de lanzamiento (`movie`, `tv`, `game`, `album`, `book`) con etiquetas de `ETIQUETAS_TIPO_LANZAMIENTO`.
      - Inputs condicionales por tipo: `book` -> `autor`, `album` -> `artista`, `movie` -> `director`. Cada uno opcional.
    - Cuando el usuario cambia `categoriaSlug` a un slug de lanzamiento, derivar `tipoLanzamiento` con el mapeo inverso y pre-rellenar (si quedo `null`).
  - Validacion en `handleGuardar`:
    - Si la categoria es de lanzamiento, exigir `tipoLanzamiento` no nulo (error: "Selecciona el tipo de lanzamiento").
  - Propagacion en `onGuardar`: pasar el objeto extendido con todos los campos nuevos.

### Bloque 6 - Candidato pre-rellena datepicker

- [x] **Paso 6: `src/components/features/asistente/candidato-card.tsx`** Modificaciones minimas:
  - Estado `fechaEditada`: inicializar con `candidato.fechaLanzamiento ?? candidato.fechaTentativa ?? ''`.
  - Estado `editandoFecha`: inicializar con `!candidato.fechaLanzamiento && Boolean(candidato.fechaTentativa)` (true cuando hay tentativa pero no fecha confirmada). Esto auto-abre el datepicker con la fecha pre-rellenada para que el usuario solo confirme.
  - La logica de `handleConfirmar` queda igual: si la fecha final difiere de `candidato.fechaLanzamiento`, fuente cambia a `'manual'`.
  - El badge "Tentativa" sigue mostrandose; nada mas cambia.

### Bloque 7 - Provider: fallback de parseo y nuevo ruteo de guardado

- [x] **Paso 7: `src/components/features/asistente/asistente-provider.tsx`** Ampliar logica:
  - Imports nuevos: `parsearFechaNatural` desde `@/lib/utils/parsear-fecha-natural`, `SLUGS_LANZAMIENTO`, `TIPO_LANZAMIENTO_A_SLUG` (ya existe). Construir constante `SLUGS_LANZAMIENTO_SET = new Set<string>(SLUGS_LANZAMIENTO)` al nivel de modulo.
  - Helper local `slugAtipo(slug: string): TipoLanzamiento | null` que devuelve el tipo inverso buscando en `TIPO_LANZAMIENTO_A_SLUG`.
  - `inicialVacia(query)`: devolver tambien `anticipacionMin: 15`, `tipoLanzamiento: null`, `autor: null`, `artista: null`, `director: null`.
  - `inicialDesdeExtraccion`:
    - Caso `recordatorio_personal`: agregar `anticipacionMin: 15`, `tipoLanzamiento: null`, `autor: null`, `artista: null`, `director: null`.
    - Caso `lanzamiento_*`: usar `l.fechaTentativa` como `fechaVencimiento` inicial; setear `tipoLanzamiento = l.tipo`; setear `autor`/`artista` desde `l.artista` (no hay distincion clara en el extractor; cuando tipo es `book` usar como `autor`, cuando es `album` usar como `artista`, cuando es `movie` propagar a `descripcion` si esta vacio). Anticipacion: para lanzamientos la usaremos solo si se rutea a `crearRecordatorioDesdeIA`, asi que el default 15 esta bien.
  - En `procesar`, tras recibir `datosExtraccion`:
    - Si `intencion === 'recordatorio_personal'` y `recordatorio.fechaVencimiento === null`, llamar `parsearFechaNatural(trimmed, hoy)`. Si devuelve fecha, mutar `datosExtraccion.recordatorio.fechaVencimiento` antes de `setExtraccion`.
    - Si `intencion` es `lanzamiento_*` y `lanzamiento.fechaTentativa === null`, igual: aplicar fallback y mutar `datosExtraccion.lanzamiento.fechaTentativa`.
  - En `procesar`, tras recibir candidatos: mapear `nuevos.map(c => ({ ...c, fechaTentativa: c.fechaLanzamiento === null || c.tba ? datosExtraccion.lanzamiento?.fechaTentativa ?? undefined : undefined }))` antes de `setCandidatos`.
  - `confirmarRecordatorioEditado`: si `datos.categoriaSlug` esta en `SLUGS_LANZAMIENTO_SET` y `datos.tipoLanzamiento` no es null y hay `datos.fechaVencimiento`, rutear a `crearRecordatorioLanzamiento({ titulo, tipo: datos.tipoLanzamiento, fechaLanzamiento: datos.fechaVencimiento, fuente: 'manual', autor: datos.autor ?? undefined, artista: datos.artista ?? undefined, director: datos.director ?? undefined, descripcion: datos.descripcion ?? undefined })`. Mostrar `toast.success('Lanzamiento agregado al calendario')`. Si no, mantener la ruta actual a `crearRecordatorioDesdeIA` agregando el campo `anticipacionMin: datos.anticipacionMin`.

### Bloque 8 - Verificacion final

- [x] **Paso 8: Validacion estatica** Ejecutar `npx tsc --noEmit` y `npx next lint --dir src/components/features/asistente --dir src/lib/ai --dir src/lib/utils --dir src/lib/actions --dir src/types`. Cero errores y cero warnings.

## 3. Reporte de Pruebas

**Estado:** [APROBADO]

### Auditoria de cumplimiento funcional

- **Cambio A (utility):** `parsearFechaNatural` resuelve `dd/mm`, `dd-mm`, `dd mmm`, `dd de mmmm`, `mmm dd` con normalizacion de acentos y tabla de meses ES. Ajusta ano cuando la fecha resultante es estrictamente anterior a hoy.
- **Cambio B (extractor):** schema gana `lanzamiento.fechaTentativa: string|null`. Prompt incluye ejemplos `nov 19`, `20/06`, `3 mar`, `viernes 21`, regla de futuro y limpieza del titulo cuando la fecha esta pegada.
- **Cambio C (pipeline):** `procesar` aplica `parsearFechaNatural(trimmed, hoy)` cuando `recordatorio.fechaVencimiento` o `lanzamiento.fechaTentativa` vienen `null`. Los candidatos sin fecha confirmada heredan `fechaTentativa` para que la `CandidatoCard` muestre el datepicker pre-rellenado.
- **Cambio D (form card):** anticipacion via Select, tipo de lanzamiento + autor/artista/director condicionales por categoria, derivacion automatica slug-tipo via `useEffect`, validacion de tipo de lanzamiento obligatorio.
- **Cambio E (candidato card):** auto-abre el datepicker con `fechaTentativa` cuando la fuente no confirma fecha. Si el usuario solo confirma, la fecha tentativa se persiste con `fuente='manual'`.
- **Cambio F (acción server):** `crearRecordatorioDesdeIA` recibe `anticipacionMin?` y lo usa para calcular `notify_at`. Default 15 minutos.
- **Cambio G (tipo):** `ResultadoLanzamiento.fechaTentativa?` documentado como canal de propagacion Fase 18.

### Auditoria de espanol absoluto

Identificadores nuevos: `parsearFechaNatural`, `MESES`, `normalizar`, `obtenerMes`, `fechaValida`, `ajustarAno`, `formatear`, `tipoDesdeSlug`, `esLanzamientoCategoria`, `tipoEfectivo`, `tipoDerivado`, `SLUG_A_TIPO`, `anticipacionMin`, `tipoLanzamiento`, `fechaTentativa`, `fechaInicialEditada`, `enriquecidos`. Todos en espanol o terminos universales (`Date`, `slug`, `set`, `record`). Comentarios redactados en espanol.

### Auditoria de seguridad y fugas

Grep de patrones `api[_-]?key|secret|token|password|VAPID|SUPABASE.*KEY|GROQ_API|TMDB|RAWG` sobre los 7 archivos modificados: cero matches. Sin nuevas dependencias. Sin secretos hardcodeados. La tarea no toca rutas API, queries ni variables de entorno.

### Verificacion de consola

- `npx tsc --noEmit`: salida vacia (sin errores).
- `npx next lint --dir src/components/features/asistente --dir src/lib/ai --dir src/lib/utils --dir src/lib/actions --dir src/types`: `No ESLint warnings or errors`.
- Grep de `any` en codigo nuevo: cero matches.

### Nota sobre validacion visual

Hay cambios de UI en `recordatorio-form-card.tsx` y `candidato-card.tsx`. Antes de cerrar la tarea, el usuario debe validar en navegador: que la card de extraccion muestra Select de anticipacion + bloque condicional de tipo de lanzamiento, y que la `CandidatoCard` abre con el datepicker pre-rellenado cuando la fuente devuelve TBA.
