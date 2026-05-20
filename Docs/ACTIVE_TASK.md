# Tarea activa

## Solicitud original (usuario, 2026-05-19)

> Hacer el titulo del inicio mas grande. Eliminar el boton flotante de asistente IA (FabAsistente) y reemplazarlo por la barra "Que te recuerdo o agendo" implementada en las distintas pestanas de categorias. El calendario debe ocupar todo el espacio vertical de la pagina. La vista de semana debe mostrar las horas del dia a la izquierda (timeline tipo Google Calendar).

## Decisiones acordadas con el usuario

- La barra de asistente aparece en: Inicio (ya existe), Lanzamientos, Pendientes, Estudio, Cumpleanos, Eventos.
- La barra NO aparece en: Calendario, Notas, Ajustes (settings).
- Vista Semana: timeline real estilo Google Calendar con columna de horas 00-23 a la izquierda y eventos posicionados verticalmente segun su `fechaVencimiento`.
- Calendario: se mantienen el titulo "Calendario" y el subtitulo descriptivo; la grilla (mes o semana) ocupa el resto de la altura disponible de la pagina con scroll interno si hace falta.
- El boton flotante `FabAsistente` se elimina por completo del dashboard. El acceso al asistente queda disponible via Ctrl+I (CommandPalette ya montado en el layout) y via las barras inline.

## 1. Contexto y Archivos Afectados

La solicitud agrupa cuatro cambios de UI sobre el dashboard. Por la naturaleza transversal del rediseno se exceden los 5 archivos atomicos del protocolo del Lector porque cada cambio toca un modulo distinto y no hay archivos irrelevantes en la lista. El planificador debera respetar este alcance sin agregar mas.

### Cambio A — Titulo de inicio mas grande
- [src/components/features/inicio/saludo-dinamico.tsx](src/components/features/inicio/saludo-dinamico.tsx) — el `<h1>` usa `text-2xl font-bold`. Hay que escalarlo (objetivo: `text-4xl` o `text-5xl`) sin romper el layout de dos columnas de `/inicio`. El resumen (`<p>`) puede crecer ligeramente para mantener jerarquia.

### Cambio B — Eliminar FAB y promover la barra de asistente
- [src/app/(dashboard)/layout.tsx](src/app/(dashboard)/layout.tsx) — actualmente renderiza `<FabAsistente />` junto a `<CommandPalette />` y `<BusquedaGlobal />`. Hay que eliminar el FAB (boton flotante) y el import asociado.
- [src/components/features/asistente/index.ts](src/components/features/asistente/index.ts) — barrel que reexporta `FabAsistente`. Limpiar el export huerfano tras quitar el FAB.
- [src/components/features/asistente/fab-asistente.tsx](src/components/features/asistente/fab-asistente.tsx) — componente que queda sin consumidores tras el cambio; eliminar el archivo.
- [src/components/features/inicio/input-asistente-inicio.tsx](src/components/features/inicio/input-asistente-inicio.tsx) — la barra "Que te recuerdo o agendo" hoy vive en la carpeta `inicio/` con nombre especifico de esa pagina. Hay que promoverla a un componente reutilizable bajo `src/components/features/asistente/barra-asistente.tsx` (renombrado para reflejar su nuevo alcance) y reexportarla desde el index del asistente. El archivo original se borra para evitar duplicacion.
- [src/app/(dashboard)/inicio/page.tsx](src/app/(dashboard)/inicio/page.tsx) — actualizar el import de `InputAsistenteInicio` por el nuevo `BarraAsistente`.
- [src/app/(dashboard)/[slug]/page.tsx](src/app/(dashboard)/[slug]/page.tsx) — pagina dinamica que sirve `pendientes`, `estudio`, `cumpleanos`, `eventos`. Insertar la `<BarraAsistente />` debajo del header (entre el bloque del titulo de categoria y la `<ListaRecordatorios />`).
- [src/app/(dashboard)/lanzamientos/page.tsx](src/app/(dashboard)/lanzamientos/page.tsx) — actualmente muestra `<BotonAbrirAsistente />` en la esquina superior derecha. Reemplazar el boton por la `<BarraAsistente />` ubicada debajo del header (mismo patron que `/inicio` y `/[slug]`). Verificar si `BotonAbrirAsistente` queda huerfano para limpiar.

### Cambio C — Calendario ocupa todo el alto de la pagina
- [src/app/(dashboard)/layout.tsx](src/app/(dashboard)/layout.tsx) — el `<main>` ya es `flex-1 overflow-y-auto p-6`. La pagina del calendario necesita propagar `h-full` para que los hijos puedan crecer con flex.
- [src/app/(dashboard)/calendar/page.tsx](src/app/(dashboard)/calendar/page.tsx) — el contenedor raiz usa `space-y-6` sin altura. Convertirlo a un layout flex columnar `h-full` que pase el alto a `<VistaCalendario />`.
- [src/components/features/calendar/vista-calendario.tsx](src/components/features/calendar/vista-calendario.tsx) — wrapper `space-y-4` sin control de alto. El bloque de la vista activa (`VistaMes` / `VistaSemana`) debe estar dentro de un contenedor `flex-1 min-h-0` para que la grilla rellene el espacio disponible. El `EmptyState` debe convivir con el layout flex sin colapsarlo.
- [src/components/features/calendar/vista-mes.tsx](src/components/features/calendar/vista-mes.tsx) — actualmente las celdas tienen `min-h-[72px]` fijo. Cambiar el grid a uno con filas iguales (`grid-rows-6`, `h-full`) para que las semanas se repartan la altura proporcionalmente sin scroll innecesario.

### Cambio E — Mas aire en la parte superior de las pestanas
- [src/app/(dashboard)/layout.tsx](src/app/(dashboard)/layout.tsx) — el `<main>` usa `p-6` (24px en los 4 lados). El usuario percibe el contenido pegado al techo. Aumentar el padding-top a `pt-10` o `pt-12` manteniendo `px-6 pb-6` para conservar margenes laterales y respiracion inferior.
- Verificar que el cambio no rompa el calendario (Cambio C): el calendario calcula su altura con flex sobre la altura del `<main>`, por lo que el padding extra arriba reduce ligeramente el alto disponible pero no rompe la grilla.
- Verificar que el sidebar derecho de `/inicio` (sticky `top-4`) sigue alineado correctamente con el nuevo padding del main; si se nota desfase, ajustar el `top` del aside.

### Cambio D — Vista Semana como timeline con horas a la izquierda
- [src/components/features/calendar/vista-semana.tsx](src/components/features/calendar/vista-semana.tsx) — refactor mayor. Pasar de "7 columnas de tarjetas apiladas" a "1 columna de horas (24h) + 7 columnas de slots verticales". Cada evento se posiciona en la columna del dia y a la altura `hora * altoFila` segun su `fechaVencimiento`. Considerar:
  - Eventos sin hora (`fechaVencimiento` a 00:00 sin minutos definidos) — agruparlos en una fila all-day arriba o usar un placeholder neutro.
  - Eventos solapados en el mismo dia — basta apilarlos lado a lado o aceptar overlap si la fase no exige polish.
  - Scroll interno vertical para que el timeline no fuerce la pagina entera a hacer scroll.
  - Posicionamiento inicial: hacer scroll auto a la hora actual (o a las 07:00) cuando se monta la vista.
  - Reutilizar `formatearHora` y `coloresPorCategoria` ya presentes en el archivo.

## Notas para el Planificador

- No introducir dependencias nuevas. `date-fns` ya esta disponible para manipular horas.
- Respetar la regla de "cambios con impacto global" de `GLOBAL.md`: al renombrar `InputAsistenteInicio` -> `BarraAsistente`, verificar con grep que no haya otros consumidores ademas de `/inicio/page.tsx`.
- Mantener tipografia, espaciados y paleta actuales (minimalismo de la Fase 17).
- Esta tarea NO altera schema, queries ni server actions: es 100% UI.
- Esta tarea es de Fase 17 ampliada (no hay numero de fase nuevo aun en `ROADMAP.md`); el Completador decidira si abrir Fase 17.1 o registrar como pulido.

## Decisiones finales del Planificador (acordadas con el usuario)

- Timeline vista Semana: rango fijo 00:00 a 23:00 con scroll vertical interno; al montar el componente hacer scroll automatico a las 07:00.
- Eventos sin hora (`fechaVencimiento` a las 00:00 en punto): se renderizan en una fila "Todo el dia" horizontal sobre el timeline, no en el slot de medianoche.
- Padding del `<main>` del dashboard: `pt-10 px-6 pb-6` (40px arriba, 24px en los demas lados).
- Confirmado por grep: `BotonAbrirAsistente`, `InputAsistenteInicio` y `FabAsistente` no tienen consumidores fuera de lo listado en seccion 1. Se pueden eliminar sin romper otras vistas.

## 2. Plan de Accion Detallado

Secuencia ordenada para evitar imports rotos: primero crear el nuevo componente compartido, luego eliminar el antiguo y limpiar consumidores. El refactor del calendario se hace al final porque vive aislado del cambio del asistente.

### Bloque 1 — Aire arriba del dashboard (Cambio E)

- [x] **Paso 1: `src/app/(dashboard)/layout.tsx`** Cambiar la clase del `<main>` de `flex-1 overflow-y-auto p-6` a `flex-1 overflow-y-auto px-6 pt-10 pb-6` para que el contenido de cada pestana respire 40px del borde superior. No tocar el resto del layout.

### Bloque 2 — Titulo de inicio mas grande (Cambio A)

- [x] **Paso 2: `src/components/features/inicio/saludo-dinamico.tsx`** Cambiar el `<h1>` de `text-2xl font-bold text-gray-900` a `text-4xl font-bold text-gray-900 tracking-tight` y el `<p>` de `text-sm text-gray-500 mt-1` a `text-base text-gray-500 mt-2` para conservar la jerarquia visual. Mantener la logica de `obtenerSaludo` y la firma de props.

### Bloque 3 — Promover la barra del asistente y eliminar el FAB (Cambio B)

- [x] **Paso 3: `src/components/features/asistente/barra-asistente.tsx`** Crear archivo nuevo. Copiar el contenido actual de `src/components/features/inicio/input-asistente-inicio.tsx` y renombrar la funcion exportada a `BarraAsistente`. Mantener exactamente la misma UI (icono `Sparkles` morado, placeholder "Que te recuerdo o agendo?", kbd `Ctrl+I`) y el hook `useAsistente` con `abrir`. No agregar props nuevas: el componente sigue siendo full-width.

- [x] **Paso 4: `src/components/features/asistente/index.ts`** Reemplazar el reexport de `FabAsistente` por `BarraAsistente`. Estado final del archivo: exportar `AsistenteProvider`, `CommandPalette`, `BarraAsistente` (y cualquier otro export ya presente que no sea `FabAsistente`).

- [x] **Paso 5: `src/components/features/asistente/fab-asistente.tsx`** Eliminar el archivo. Ya no hay consumidores tras el Paso 4.

- [x] **Paso 6: `src/components/features/inicio/input-asistente-inicio.tsx`** Eliminar el archivo. Su funcionalidad migro al Paso 3.

- [x] **Paso 7: `src/app/(dashboard)/layout.tsx`** Quitar `FabAsistente` del import desde `@/components/features/asistente` y eliminar `<FabAsistente />` del JSX. El layout queda con `AsistenteProvider`, `Sidebar`, `<main>{children}</main>`, `BusquedaGlobal` y `CommandPalette`.

- [x] **Paso 8: `src/app/(dashboard)/inicio/page.tsx`** Reemplazar el import `import { InputAsistenteInicio } from '@/components/features/inicio/input-asistente-inicio'` por `import { BarraAsistente } from '@/components/features/asistente'`. Sustituir `<InputAsistenteInicio />` por `<BarraAsistente />` en el JSX (sigue debajo del bloque saludo + boton nuevo recordatorio).

- [x] **Paso 9: `src/app/(dashboard)/[slug]/page.tsx`** Importar `BarraAsistente` desde `@/components/features/asistente`. Insertar `<BarraAsistente />` justo debajo del bloque header (el `<div className="flex items-center justify-between mb-6">...`) y antes de `<ListaRecordatorios />`. Envolver la barra con `<div className="mb-6"><BarraAsistente /></div>` para conservar el espaciado vertical con la lista. Aplica a las 4 categorias servidas por la ruta dinamica (Pendientes, Estudio, Cumpleanos, Eventos); Notas queda excluida porque `slug === 'notes'` ya devuelve `notFound()`.

- [x] **Paso 10: `src/app/(dashboard)/lanzamientos/page.tsx`** Quitar el import y el uso de `BotonAbrirAsistente`. En su lugar importar `BarraAsistente` desde `@/components/features/asistente`. El header pasa de tener un boton a la derecha a quedar solo con el bloque icono+titulo+subtitulo (`<div className="flex items-center gap-3">...</div>`). Insertar `<BarraAsistente />` debajo del header y antes de `<section>`, envuelta en un wrapper que respete el `space-y-8` ya existente del contenedor padre (no requiere wrapper extra porque el `space-y-8` se aplica al `<div>` raiz).

- [x] **Paso 11: `src/components/features/lanzamientos/boton-abrir-asistente.tsx`** Eliminar el archivo (sin consumidores tras el Paso 10).

### Bloque 4 — Calendario al alto completo (Cambio C)

- [x] **Paso 12: `src/app/(dashboard)/calendar/page.tsx`** Cambiar el contenedor raiz de `<div className="space-y-6">` a `<div className="flex flex-col gap-6 h-full">`. El bloque de titulo + subtitulo queda como esta. Envolver `<VistaCalendario />` en un `<div className="flex-1 min-h-0">` para que el calendario reciba el alto restante del `<main>` (que ya es `flex-1 overflow-y-auto` desde el layout). Esto permite que la grilla mes/semana crezca a la altura disponible.

- [x] **Paso 13: `src/components/features/calendar/vista-calendario.tsx`** Cambiar el wrapper raiz de `<div className="space-y-4">` a `<div className="flex flex-col gap-4 h-full min-h-0">`. La cabecera (controles + toggle) y el `<FiltroCalendario />` permanecen igual. Envolver el bloque condicional `vista === 'mes' ? <VistaMes /> : <VistaSemana />` dentro de `<div className="flex-1 min-h-0">` para que la vista activa reciba el alto sobrante. El `EmptyState` ya no se renderiza superpuesto a la grilla: dejarlo como overlay condicional fuera del flex (o moverlo dentro del wrapper de la vista activa si esta vacio, lo que sea consistente con el comportamiento actual de no mostrar grilla vacia es aceptable). Decision: mantener el `<EmptyState />` despues del wrapper de la vista, igual que ahora; el flex-1 garantiza que la grilla se extienda incluso cuando hay 0 recordatorios.

- [x] **Paso 14: `src/components/features/calendar/vista-mes.tsx`** Cambiar la estructura para que el grid de dias rellene el alto disponible. Concretamente:
  - El contenedor exterior pasa de `<div>` simple a `<div className="flex flex-col h-full">`.
  - La cabecera de dias (`DIAS_CABECERA`) mantiene `grid grid-cols-7 mb-1`.
  - La grilla de dias cambia de `grid grid-cols-7 gap-px ... rounded-xl overflow-hidden` a `grid grid-cols-7 grid-rows-[repeat(var(--filas),minmax(0,1fr))] gap-px ... rounded-xl overflow-hidden flex-1 min-h-0`. Calcular `const filas = dias.length / 7` y pasarlo como CSS variable via `style={{ ['--filas' as string]: filas }}` (o usar `grid-rows-5` / `grid-rows-6` segun longitud).
  - Las celdas dejan de tener `min-h-[72px]` y solo conservan padding y layout interno; el alto lo decide el grid. Para evitar overflow vertical en celdas con muchos dots, mantener `flex flex-col items-start gap-1` y considerar `overflow-hidden` en el `<button>`.

- [x] **Paso 15: `src/components/features/calendar/vista-mes.tsx` (continuacion del Paso 14)** Revisar que la firma de props no cambie. Si TypeScript se queja por el cast de `'--filas' as string`, usar un objeto tipado: `{ ['--filas' as unknown as string]: filas }` o pasar `style={{ gridTemplateRows: \`repeat(\${filas}, minmax(0, 1fr))\` }}` directamente para evitar el truco de CSS variable. Preferir la segunda forma por simplicidad.

### Bloque 5 — Timeline real en vista Semana (Cambio D)

- [x] **Paso 16: `src/components/features/calendar/vista-semana.tsx`** Refactor completo del componente. Mantener la firma de props (`referencia`, `recordatorios`, `categorias`, `onDiaClick`). Estructura nueva:
  1. Constantes locales: `const HORAS = Array.from({ length: 24 }, (_, i) => i)`, `const ALTO_FILA = 48` (px por hora; valor inicial razonable).
  2. Funciones helper internas:
     - `esTodoElDia(fecha: Date): boolean` -> devuelve `true` si `fecha.getHours() === 0 && fecha.getMinutes() === 0`.
     - `recordatoriosDelDia(dia: Date)` -> ya existe, mantener.
     - Separar por dia en dos buckets: `eventosConHora` y `eventosTodoElDia`.
  3. Layout JSX:
     - Wrapper raiz `<div className="flex flex-col h-full min-h-0 border border-gray-100 rounded-xl overflow-hidden bg-white">`.
     - Cabecera fija arriba: grid `grid grid-cols-[60px_repeat(7,1fr)]`. Primera celda vacia (sobre la columna de horas). Las 7 columnas de dias replican la cabecera actual (`EEE` + `d`) con highlight de hoy.
     - Fila "Todo el dia": misma grilla `grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-100`. Primera celda con texto "Todo el dia" en `text-xs text-gray-400 px-2 py-1`. Las 7 columnas muestran los eventos de `eventosTodoElDia` apilados (igual estilo que las cards actuales). Solo renderizar la fila si al menos un dia de la semana tiene eventos all-day; ocultarla si todos los buckets `eventosTodoElDia` estan vacios para no desperdiciar espacio.
     - Cuerpo scrolleable: `<div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto">` que contiene la grilla del timeline.
     - Dentro del scroll: grilla `grid grid-cols-[60px_repeat(7,1fr)]` con altura total `24 * ALTO_FILA`. Primera columna: 24 celdas con la etiqueta de hora (formato `HH:00`, `text-xs text-gray-400 text-right pr-2 -mt-2` para alinear visualmente con la linea). Cada una de las 7 columnas de dia es un `<div className="relative border-l border-gray-50" style={{ height: 24 * ALTO_FILA }}>` con lineas horizontales por hora (`<div className="border-t border-gray-50" style={{ height: ALTO_FILA }}>` x 24, o usar background-image repeating).
     - Eventos con hora: posicion absoluta dentro de la columna del dia. `top = (hora + minutos/60) * ALTO_FILA`. Alto minimo: `ALTO_FILA - 4` (1 hora visual). Estilos identicos a la card actual (color por categoria con `${color}18` y borde lateral `${color}`). Click llama a `onDiaClick(dia)`.
  4. `useEffect(() => { ... }, [])` que al montar haga `scrollRef.current?.scrollTo({ top: 7 * ALTO_FILA, behavior: 'instant' })` para posicionar la vista en las 07:00.
  5. Eventos solapados: no se manejan en este refactor; se renderizan apilados con `z-index` por orden de llegada, aceptando overlap visual. Documentar en un comentario corto en espanol que el manejo de solapamientos queda fuera del alcance.
  6. Mantener `useState`/`useRef` con imports adecuados (`useEffect`, `useRef` desde `react`).
  7. Reutilizar `coloresPorCategoria` ya existente.
  8. Mantener uso de `format` con locale `es` para las cabeceras de dia.

### Bloque 6 — Verificacion final

- [x] **Paso 17: Validacion manual rapida** Antes de cerrar la tarea, abrir en navegador (`pnpm dev` o equivalente) y comprobar:
  - `/inicio`: saludo grande, barra IA, padding superior visible. Sin FAB.
  - `/pendientes`, `/estudio`, `/cumpleanos`, `/eventos`: cada una muestra la BarraAsistente debajo del header.
  - `/lanzamientos`: BarraAsistente en vez del boton "Abrir asistente". Sin FAB.
  - `/notes`, `/calendar`, `/settings`: sin barra, sin FAB. Solo el atajo Ctrl+I sigue funcionando.
  - `/calendar` vista Mes: grilla ocupa todo el alto disponible.
  - `/calendar` vista Semana: columna de horas a la izquierda, eventos posicionados verticalmente segun hora, fila "Todo el dia" si aplica, scroll inicial a 07:00.

## 3. Reporte de Pruebas

**Estado:** [APROBADO]

### Auditoria de cumplimiento funcional

Cada cambio del plan fue verificado por inspeccion estatica del codigo final:

- **Cambio A (saludo grande):** `src/components/features/inicio/saludo-dinamico.tsx` aplica `text-4xl font-bold tracking-tight` al `<h1>` y `text-base mt-2` al resumen. Cumple Paso 2.
- **Cambio B (FAB fuera, barra dentro):** `src/components/features/asistente/index.ts` ya no exporta `FabAsistente`. `src/app/(dashboard)/layout.tsx` no contiene `<FabAsistente />` ni el import. La nueva `BarraAsistente` se importa correctamente en `inicio/page.tsx`, `[slug]/page.tsx` y `lanzamientos/page.tsx`. Los archivos `fab-asistente.tsx`, `input-asistente-inicio.tsx` y `boton-abrir-asistente.tsx` ya no existen en el filesystem (verificado con `git status`). Sin consumidores huerfanos.
- **Cambio C (calendario alto completo):** `calendar/page.tsx` envuelve `<VistaCalendario />` en `<div className="flex-1 min-h-0">` dentro de un raiz `flex flex-col gap-6 h-full`. `vista-calendario.tsx` usa `flex flex-col gap-4 h-full min-h-0` con la vista activa en un wrapper `flex-1 min-h-0`. `vista-mes.tsx` calcula `filas = dias.length / 7` y aplica `gridTemplateRows: repeat(filas, minmax(0, 1fr))` con `flex-1 min-h-0` para repartir altura. Las celdas perdieron el `min-h-[72px]` fijo.
- **Cambio D (timeline semanal):** `vista-semana.tsx` reescrito con cabecera `grid-cols-[60px_repeat(7,1fr)]`, fila condicional "Todo el dia" (solo renderiza si `hayEventosTodoElDia`), cuerpo scrolleable con altura `24 * ALTO_FILA`, columna de horas con etiquetas `HH:00`, eventos posicionados absolutamente con `top = (hora + minutos/60) * ALTO_FILA` y `useEffect` que setea `scrollTop = 7 * ALTO_FILA` al montar.
- **Cambio E (aire arriba):** `layout.tsx` aplica `px-6 pt-10 pb-6` al `<main>`. Cumple Paso 1.

### Auditoria de espanol absoluto

Variables, funciones y constantes nuevas en `vista-semana.tsx`: `HORAS`, `ALTO_FILA`, `esTodoElDia`, `recordatoriosDelDia`, `coloresPorCategoria`, `refScroll`, `eventosPorDia`, `hayEventosTodoElDia`, `conHora`, `todoElDia`, `posicionTop`, `indice`, `dia`, `inicio`, `fin`, `linea`. Todas en espanol o terminos tecnicos universalmente aceptados (`top`, `scroll`, `linea`). Comentarios de codigo redactados en espanol. No se detectan identificadores en ingles introducidos por esta tarea. El archivo `barra-asistente.tsx` reutiliza la firma del componente original sin nombres nuevos.

### Auditoria de seguridad y fugas

Grep contra `api[_-]?key|secret|token|password|VAPID|SUPABASE.*KEY|GROQ_API|TMDB|RAWG` sobre los archivos modificados: cero coincidencias. Esta tarea es 100% UI; no toca rutas API, queries, server actions ni variables de entorno. Sin nuevas dependencias instaladas.

### Verificacion de consola

- `npx tsc --noEmit`: ejecutado sin errores ni advertencias.
- `npx next lint --dir src/components/features/calendar --dir src/components/features/asistente --dir src/components/features/inicio --dir 'src/app/(dashboard)'`: `No ESLint warnings or errors`.
- Grep de referencias eliminadas (`FabAsistente|InputAsistenteInicio|BotonAbrirAsistente|input-asistente-inicio|fab-asistente|boton-abrir-asistente`): cero matches, no quedan imports rotos.

### Nota sobre validacion visual

El Tester automatizado no dispone de navegador interactivo, por lo que el Paso 17 se valida mediante inspeccion estatica + lint + tipos + grep. El usuario es el arbitro final del aspecto visual antes de hacer commit; especificamente debe confirmar en navegador local (`pnpm dev`):

- Saludo `text-4xl` en `/inicio` sin romper la columna lateral.
- `BarraAsistente` visible en Inicio, Lanzamientos, Pendientes, Estudio, Cumpleanos y Eventos.
- Ausencia del FAB en Calendario, Notas y Ajustes.
- Calendario llena el alto disponible con scroll interno cuando aplica.
- Vista Semana abre con scroll posicionado en las 07:00 y muestra eventos en sus horas.

### Observacion menor (no bloqueante)

`git status` lista `Docs/ACTIVE_TASK.md` con `D` mayuscula. En el filesystem case-insensitive de Windows apunta al mismo `docs/` ya existente; no afecta el funcionamiento ni el deploy a Vercel (Linux), pero conviene verificar al hacer commit que el path final usa la capitalizacion correcta (`docs/`) para evitar duplicacion accidental.
