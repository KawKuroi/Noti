# CURRENT — Noti

> Este archivo cambia frecuentemente. Refleja el estado real del proyecto hoy.
> Actualízalo al empezar y terminar cada sesión de trabajo.

## Fase activa

**Activo:** Ninguna. El roadmap completo (Fases 0–23) esta terminado.
**Estado general:** Todas las fases completadas. El producto esta en estado de mantenimiento.

## Fase 23 — Sprint final (sesion 2026-05-24)

- **Tests E2E con Playwright** — `playwright.config.ts` con webServer y chromium; `tests/e2e/flujo-recordatorio.spec.ts` con 3 tests sin auth (landing, login, redireccion protegida) y 1 test salteable que requiere `E2E_EMAIL`/`E2E_PASSWORD` para el flujo completo de creacion.
- **PWA Widget API** — propiedad `"widgets"` en `public/manifest.json` con plantilla Adaptive Cards v1.5 (`/widget-template.json`); handlers `widgetinstall`, `widgetuninstall`, `widgetresume`, `widgetclick` en `public/sw.js`; endpoint autenticado `GET /api/widget` que devuelve los proximos 5 recordatorios como JSON.
- **i18n con next-intl** — `next-intl` instalado, `src/i18n/request.ts` con `getRequestConfig` cookie-based (`NEXT_LOCALE`); `next.config.ts` envuelto con `createNextIntlPlugin`; `messages/es.json` y `messages/en.json` con namespaces Sidebar, Comun y Settings; `layout.tsx` convertido a async con `NextIntlClientProvider`; `sidebar.tsx` con `useTranslations`; `FormularioIdioma` en settings con toggle ES/EN que escribe cookie y llama `router.refresh()`.

## Fase 23 — IA y contenido + Tecnico (sesion 2026-05-24)

- **Full-text search** — `buscarRecordatorios` agrega FTS con `to_tsvector('spanish', ...)` + `websearch_to_tsquery` como primera condicion del `or()`, manteniendo `ilike` como fallback para busquedas simples.
- **Deteccion de duplicados** — `buscarRecordatoriosSimilares` en reminder.queries; `verificarDuplicado` server action; aviso `toast.warning` no bloqueante en `asistente-provider.tsx` antes de crear via IA.
- **Sugerencias de categoria** — `MAPA_PALABRAS_CLAVE` y `inferirCategoria` en formulario-recordatorio; chip con borde punteado que aparece cuando el titulo inferido difiere del seleccionado y al pulsarlo cambia la categoria.
- **Cache SWR en busqueda global** — `swr` instalado; `busqueda-global.tsx` reemplaza fetch+debounce manual con `useSWR` (clave `/api/search?q=...`, `dedupingInterval: 10000`, `revalidateOnFocus: false`) y `queryDemorada` con delay de 300 ms.

## Fase 23 — Notificaciones y segundo plano (sesion 2026-05-24)

- **Countdown de cumpleanos** — `getCumpleanosEnDias(n)` en reminder.queries filtra recordatorios de categoria birthdays cuya fechaVencimiento cae en N dias UTC; `procesarCountdownCumpleanos()` en push.service itera `[3, 1]` dias y envia push "Faltan N dias para el cumpleanos / Manana es el cumpleanos" con el titulo del recordatorio; cron `check-reminders` lo ejecuta en paralelo con `procesarRecordatoriosPendientes()`.

## Fase 23 — UX/Productividad (sesion 2026-05-24)

- **Infinite scroll y ordenamiento en lista de recordatorios (23.4)** — query paginada `getRecordatoriosPorCategoriaPaginados` con offset/limit/ordenamiento; server action `cargarMasRecordatorios`; componente cliente `ListaRecordatoriosPaginada` con IntersectionObserver (`rootMargin: 300px`) y selector de orden (mas proximo, mas lejano, creacion reciente, pendientes primero); paginas de categoria usan carga inicial de 20 registros con carga incremental al hacer scroll.

## Fase 23 — Dark mode (sesion 2026-05-21)

- **Correcciones dark mode + notas UX (23.3)** — tokens semánticos en `tarjeta-recordatorio` (bg-card, border-border, text-foreground), `lista-recordatorios` (empty states con bg-muted), `vista-chat` (cabecera e input area bg-background), `lista-cuadernos` (divide-border), `item-cuaderno` (borde visible + clic en toda la tarjeta vía onClick/stopPropagation).

- **Optimistic updates (23.2)** — `useOptimistic` en `TarjetaRecordatorio` para completar (toggle inmediato de checkbox y tachado) y eliminar (desaparición inmediata); `useTransition` reemplaza el estado `cargando`; revert automático si el servidor falla.

- **Dark mode (23.1)** — `next-themes` instalado; variables CSS `.dark {}` con tokens shadcn/ui estándar en `globals.css`; `ProvedorTema` cliente en `src/components/providers/`; `layout.tsx` envuelve con el proveedor y tiene `suppressHydrationWarning`; sidebar migrado a tokens semánticos (`bg-background`, `text-foreground`, `border-border`, `bg-accent`, `text-muted-foreground`); `(dashboard)/layout.tsx` usa `bg-background`; sección "Apariencia" en `/settings` con selector Claro/Oscuro/Sistema (`formulario-apariencia.tsx`); `settings/page.tsx` migrado a tokens semánticos.

## Fase 22 completada (sesion 2026-05-21)

- **Adjuntos multimedia en cuadernos (22.A–22.D)** — tabla `note_attachments` (migracion `0009_note_attachments.sql` — aplicar manualmente en Supabase); schema Drizzle `notasAdjuntos`; dependencia `@vercel/blob` instalada; API route `/api/notas/adjunto` con `handleUpload` para generacion de token de subida; actions `registrarAdjunto` y `eliminarAdjunto` (borra de BD y de Blob); query `obtenerAdjuntos`; tipos `AdjuntoNota`, `TipoAdjunto`, `ElementoTimeline`; componentes `VisorImagen` (lightbox), `ReproductorAudio` (play/pause/seek), `VisorDocumento` (icono+descarga+preview PDF), `ReproductorVideo` (inline); `BurbujaAdjunto` despacha por tipo; hook `useGrabadorAudioAdjunto` para grabacion de audio como adjunto; `SubirAdjunto` con boton clip, drag-and-drop y boton mic; timeline mezclada en `VistaChatNotas` con entradas y adjuntos ordenados por creadoEn.

## Fase 22.0 completada (sesion 2026-05-21)

- **Reestructuracion de notas a cuadernos tipo chat** — tabla `note_entries` (migracion `0008_note_entries.sql` — aplicar manualmente en Supabase); schema Drizzle `notasEntradas`; queries `obtenerCuadernos` y `obtenerEntradas`; acciones `crearCuaderno`, `renombrarCuaderno`, `eliminarCuaderno`, `crearEntrada`, `actualizarEntrada`, `eliminarEntrada`; lista de cuadernos en `/notes` estilo WhatsApp con avatar inicial, preview de ultimo mensaje y tiempo relativo; vista de chat en `/notes/[id]` con burbujas indigo alineadas a la derecha, edicion inline, envio con Enter, auto-scroll, renombrar y eliminar cuaderno desde la cabecera; modal de creacion con solo nombre del cuaderno; descripciones existentes migradas como primera entrada.

## Pendientes manuales bloqueantes

- [ ] Aplicar migracion `src/db/migrations/0009_note_attachments.sql` en el SQL Editor de Supabase (requerida para que la Fase 22.A–22.D funcione en produccion)

- [ ] Agregar variable `BLOB_READ_WRITE_TOKEN` en Vercel Dashboard → Settings → Environment Variables (obtenida en Vercel → Storage → Blob)

- [ ] Aplicar migracion `src/db/migrations/0008_note_entries.sql` en el SQL Editor de Supabase (requerida para que la Fase 22.0 funcione en produccion)

- [ ] Aplicar migracion `src/db/migrations/0006_auto_delete_tasks.sql` en el SQL Editor de Supabase (requerida para que la Fase 20 funcione en produccion)

## Fase 21 completada (sesion 2026-05-20)

- **Entrada por audio en el asistente IA** — endpoint `src/app/api/ai/transcribir/route.ts` con Groq `whisper-large-v3-turbo` y rate-limit 10 req/min; hook `src/hooks/use-audio-recorder.ts` con `MediaRecorder`, seleccion de mimeType por compatibilidad, timer, auto-stop a 60 s y manejo de permisos; boton Mic en `CommandPalette` con estados grabando (rojo + timer), procesando (loader purpura) y error inline.

## Fase 20 completada (sesion 2026-05-20)

- **Auto-eliminacion de tareas completadas** — columna `auto_delete_completed_tasks_days` en `profiles` y `completed_at` en `reminders`; migracion `0006_auto_delete_tasks.sql`; `alternarCompletado` graba la fecha de completado; cron `limpiar-tareas` diario a las 03:00 UTC elimina tareas segun config del perfil; selector en settings (Nunca / 7 / 30 / 90 dias); countdown ambar en tarjetas de tareas completadas cuando quedan 3 dias o menos.

## Fase 19 completada (sesion 2026-05-20)

- **Enlace a GitHub en landing** — boton secundario "Ver en GitHub" (icono `Github` + texto, estilo outline) agregado al bloque de CTAs del hero en `src/app/page.tsx`. Link con icono GitHub agregado al footer junto al texto del proyecto. Ambos abren `https://github.com/KawKuroi/Noti` en nueva pestana.

## Bugs resueltos (sesión 2026-05-19)

- **Bug A** — `horaVencimiento: ''` fallaba el regex en Zod aunque sea opcional. Fix: `z.preprocess` convierte `''` a `undefined` en `reminder.schemas.ts`.
- **Bug B** — Formulario manual de lanzamientos no preseleccionaba la subcategoría activa. Fix: `hub-lanzamientos.tsx` mapea `tabActiva` → `TipoLanzamiento` y lo pasa como `tipoInicial` a `FormularioManualLanzamiento`.
- **Bug C** — Editor no mostraba selector de categoría ni cargaba metadata existente. Fix: selector siempre visible, `anticipacionMin` inicializado desde el recordatorio, campos condicionales pre-llenados con metadata, `actualizarRecordatorio` ahora guarda `categoriaId`.
- **Bug D** — `confirm()` nativo al eliminar. Fix: reemplazado con `Dialog` de confirmación con botones Cancelar / Eliminar.

## Fase 18 completada (sesión 2026-05-19)

- **Utility `parsearFechaNatural`** — nuevo `src/lib/utils/parsear-fecha-natural.ts` con tabla de meses ES; resuelve `dd/mm`, `dd-mm`, `dd mmm`, `mmm dd`, `dd de mmmm`. Suma 1 año si la fecha es estrictamente anterior a hoy.
- **Extractor IA con `fechaTentativa`** — `src/lib/ai/extractor.ts` gana campo `lanzamiento.fechaTentativa: string|null` y el prompt incluye ejemplos `nov 19`, `20/06`, `3 mar`, `viernes 21` con regla anti-alucinación.
- **Pipeline con fallback determinista** — `asistente-provider.tsx` aplica `parsearFechaNatural(texto, hoy)` cuando el LLM devuelve `null` y propaga `fechaTentativa` a los candidatos sin fecha confirmada.
- **Card de extracción editable completa** — `recordatorio-form-card.tsx` ahora expone Select de anticipación (`OPCIONES_ANTICIPACION`), bloque condicional con tipo de lanzamiento + autor (libros) / artista (música) / director (películas).
- **Card de candidato pre-rellenada** — `candidato-card.tsx` abre el datepicker en modo edición con `fechaTentativa` cuando la fuente devuelve TBA o sin fecha; al confirmar persiste con `fuente='manual'`.
- **Server action con anticipación** — `crearRecordatorioDesdeIA` acepta `anticipacionMin?: number` opcional (default 15) que viaja al cálculo de `notify_at`.
- **Ruteo dual de guardado** — `confirmarRecordatorioEditado` rutea a `crearRecordatorioLanzamiento` cuando la categoría es un slug de lanzamiento (persiste metadatos JSONB), o a `crearRecordatorioDesdeIA` para recordatorios personales.

## Cambios UI (sesión 2026-05-19, ampliación post-Fase 17)

- **Saludo de inicio** — `saludo-dinamico.tsx` escalado de `text-2xl` a `text-4xl tracking-tight`; resumen pasa a `text-base mt-2` para mantener jerarquía.
- **Eliminación del FAB de asistente** — Quitado `<FabAsistente />` y su archivo. El acceso al asistente queda en Ctrl+I (CommandPalette) y en la nueva `BarraAsistente`.
- **Promoción de la barra "¿Qué te recuerdo o agendo?"** — `InputAsistenteInicio` migrado a `src/components/features/asistente/barra-asistente.tsx` como componente reutilizable. Insertado en Inicio, Lanzamientos, Pendientes, Estudio, Cumpleaños y Eventos. Calendario, Notas y Ajustes quedan sin barra (decisión explícita del usuario). Eliminado `BotonAbrirAsistente` del hub de lanzamientos por redundancia.
- **Calendario al alto completo** — `calendar/page.tsx` y `vista-calendario.tsx` ahora son `flex flex-col h-full min-h-0`; `vista-mes.tsx` usa `gridTemplateRows: repeat(filas, minmax(0, 1fr))` para que las semanas se repartan la altura disponible.
- **Vista Semana como timeline** — `vista-semana.tsx` reescrito al estilo Google Calendar: columna fija de 60px con horas 00–23 a la izquierda, 7 columnas de día, fila condicional "Todo el día" sobre el timeline (solo si existen eventos sin hora esa semana), eventos posicionados absolutamente con `top = (hora + minutos/60) * 48px`, scroll vertical interno con auto-scroll a las 07:00 al montar. Manejo de eventos solapados queda fuera de alcance.
- **Aire superior en el dashboard** — `<main>` del layout pasa de `p-6` a `px-6 pt-10 pb-6` para despegar el contenido del borde superior.

## Pendientes manuales bloqueantes

- [ ] Aplicar migracion `src/db/migrations/0006_auto_delete_tasks.sql` en el SQL Editor de Supabase (requerida para que la Fase 20 funcione en produccion)

- [ ] Aplicar migración `src/db/migrations/0003_lanzamientos.sql` en el SQL Editor de Supabase (requerida para que Fase 8 funcione correctamente en producción)
- [ ] `getCategorias` usa `unstable_cache({ revalidate: false })` — tras el deploy, limpiar caché en Vercel o hacer redeploy para que los cambios de categorías de la Fase 14 se reflejen en el sidebar

## Pruebas manuales pendientes para validar la nueva ola

- [x] **Fase 14 — Recurrencia**: Crear una clase recurrente "Clase de inglés los lunes 14:00". Abrir el calendario y verificar que el dialog del día lunes muestra UNA sola entrada (no 400).
- [x] **Fase 14 — Notas**: Crear nota desde el formulario manual con título "Probar" y cuerpo "test". Confirmar que aparece en `/notes` y se puede abrir.
- [x] **Fase 14 — Fusión**: Recordatorios viejos con categoría `classes` aparecen ahora bajo `study` en el sidebar. La categoría `classes` no aparece en filtros, formulario ni asistente.
- [x] **Fase 14 — Rename**: Donde decía "Tareas" ahora dice "Pendientes" (sidebar, filtros, formulario, asistente).
- [x] **Fase 14 — Recurrentes sin checkbox**: Una clase semanal y un cumpleaños anual no muestran checkbox en su card; sí muestran botones editar/eliminar.
- [x] **Fase 15 — Sidebar**: Grupo "Herramientas" agrupa Calendario + Notas. Icono de lupa en sidebar abre Ctrl+K. Footer muestra nombre del usuario + engranaje. Cerrar sesión vive en `/settings`.
- [x] **Fase 16 — Lanzamientos**: Pestaña "Todos" en `/lanzamientos`. Cards diferenciadas por color (negro/azul/verde/rojo/morado). Formulario manual pide artista/autor/descripción/director. Las portadas se ven en el palette IA pero la card guardada no muestra portada.
- [x] **Fase 17 — Inicio**: Saludo dinámico, input IA grande, próximos recordatorios, mini-calendario lateral y chips de categorías visibles al entrar a `/inicio`.
- [ ] **Fase 18 — IA fechas**: "Lanzamiento de GTA 6 nov 19" → la card de candidatos muestra fecha 19 noviembre. La card de edición permite cambiar cualquier campo antes de confirmar. (Implementado 2026-05-19, pendiente validación visual.)
- [ ] **Fase 19 — Landing**: Botón "Ver en GitHub" en hero y link en footer abren el repo en nueva pestaña.

## Deuda técnica conocida

- La columna `sound_enabled` en `profiles` queda huérfana tras eliminar Pomodoro — housekeeping futuro
- La columna `image_url` en `reminders` queda huérfana tras la Fase 16 (decisión: portadas no persistentes) — housekeeping futuro
- La migración `0003_lanzamientos.sql` requiere aplicación manual en Supabase
- `/api/ai/recordatorio` ya no lo invoca el cliente. Mantener por compatibilidad; eliminarlo en una iteración futura tras confirmar que nada lo usa.
