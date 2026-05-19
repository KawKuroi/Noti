# Roadmap: Noti

## Estado actual

Fases 0-11 completadas. Pendiente manual: aplicar migracion de BD en Supabase dashboard (`src/db/migrations/0003_lanzamientos.sql`) y pruebas manuales de Fase 10.

Las fases 12-16 estan ordenadas por importancia descendente: las primeras son las que mas cambian la logica y el desarrollo de la aplicacion (refactores estructurales, nuevas categorias, bugfixes criticos), y las ultimas son features aditivas o de limpieza. Cada fase es ejecutable de forma independiente salvo la Fase 16, que depende de la Fase 9.

---

## Historico de fases completadas (0-11)

- **Fase 0 — Setup inicial:** PRD, Arquitectura, Roadmap, CLAUDE.md, .gitignore, .env.example, .editorconfig.
- **Fase 1 — Foundation:** Next.js 15 + App Router + TypeScript + Tailwind, Supabase (DB + Auth), Drizzle, Google OAuth + email/password, middleware de proteccion, layouts auth/dashboard, seed de 6 categorias, PWA basica, primer deploy a Vercel.
- **Fase 2 — CRUD de recordatorios:** schema `reminders`, server actions completas, queries por categoria/upcoming, validaciones Zod, formulario modal con campos por categoria, soporte de recurrencias (semanal/anual), dashboard agrupado por dia, pagina por categoria.
- **Fase 3 — Notificaciones push:** VAPID keys, Service Worker con `push` y `notificationclick`, schema `push_subscriptions` y `notification_log`, endpoints `subscribe` y `action`, cron `check-reminders` cada minuto, multi-dispositivo, anticipacion configurable, acciones desde la notificacion, reprogramacion de recurrentes.
- **Fase 4 — Chat IA para lanzamientos:** servicios TMDB / RAWG / MusicBrainz + orquestador, capa `tools.ts` y `prompt.ts` (`buscarLanzamiento`, `pedirFechaManual`, `agregarRecordatorio`) con AI SDK v6, endpoint `/api/chat`, pagina `/movies`, anti-alucinacion, atribuciones obligatorias.
- **Fase 5 — Pomodoro + calendario:** PomodoroTimer 25/5/15, sonido opcional, integracion con estudio, vista calendario mensual y semanal con dots y dialog por dia. *(Pomodoro queda marcado para eliminacion en Fase 15.)*
- **Fase 6 — Pulido + deploy publico:** landing, perfil, gestion de dispositivos, empty states, skeletons, error handling con toasts, meta tags, favicon, README, RLS y rate limiting. *Pendientes manuales:* Lighthouse audit, testing manual multi-browser, screenshots para portafolio.
- **Fase 7 — Busqueda, IA general y segundo plano:** Ctrl+K con debounce, asistente IA en dashboard (`/api/ai/recordatorio` con `generateObject`), `crearRecordatorioDesdeIA`, resumen diario por push (cron `resumen-diario` cada hora), Background Sync en Service Worker, shortcuts y `window-controls-overlay` en manifest.
- **Fase 8 — Reestructuracion de Lanzamientos:** categoria `movies` dividida en 5 (`movies`, `tv`, `games`, `music`, `books`), hub `/lanzamientos` con tabs y formulario manual, Google Books para libros, `SLUGS_LANZAMIENTO`, sidebar con entrada unica "Lanzamientos", mapeo tipo→slug en `crearRecordatorioLanzamiento`. *Pendiente manual:* aplicar `0003_lanzamientos.sql` en Supabase.
- **Fase 9 — Categoria Notas:** schema nullable para `due_date` y `notify_at`, migracion `0004_notas.sql`, categoria `notes` en constantes y seed, grid de tarjetas en `/notes`, editor con titulo y cuerpo, vista detalle `/notes/[id]`, toggle `Recordarme` con fecha opcional, acciones editar/eliminar/duplicar, integracion en busqueda global Ctrl+K.
- **Fase 10 — Refinar busqueda y modelo de IA para lanzamientos:** Mejoras en RAWG, TMDB, MusicBrainz, y prompts para IA. *Pendiente:* Pruebas manuales.
- **Fase 11 — Calendario:** Bugfix vista semana, filtro por categoria, corrección del error gráfico de las fechas.
- **Fase 12 — Refactor IA lanzamientos + chat unificado:** Bug critico de RAWG resuelto (ya no inventa fechas TBA como `${año+1}-12-31`). Nueva tool `buscarProximoLanzamiento` para prompts genericos ("nuevo album de X", "proximo Zelda"). Chat de lanzamientos y asistente IA general consolidados en un unico chat global con FAB sparkles + bottom sheet y atajo Ctrl+I, persistido via sessionStorage para sobrevivir navegacion entre rutas. Validacion de match de titulo en todos los servicios via `coincidencia-titulo.ts`. TarjetaConfirmacion permite editar fecha inline cuando es tentativa.
- **Fase 12b — Pipeline deterministico + command palette:** El chat conversacional con tool calling se reemplaza por un pipeline de 3 pasos para subir la precision al ~95%. (1) Extraccion estructurada con generateObject + Zod usando `openai/gpt-oss-120b` via Groq — un solo modelo decide intencion y rellena campos. (2) Busqueda multi-candidato: cada servicio ahora expone `candidatos<X>()` que devuelve hasta 5 resultados; `obtenerCandidatos()` paraleliza fuentes cuando el tipo es desconocido y re-rankea por fecha confirmada, futuro, coincidencia y tipo. (3) UI: command palette estilo Raycast (Ctrl+I) que muestra al usuario 3-5 candidatos como cards seleccionables; el usuario es el arbitro final. Eliminado todo lo conversacional (chat-provider, bottom-sheet, tools.ts, prompt.ts, /api/chat).

---

## Fase 13: Auto-eliminacion de tareas completadas

**Objetivo:** el usuario configura cada cuanto se borran sus tareas completadas (7 / 30 / 90 dias o Nunca). Alcance limitado a la categoria `tasks`.

- [ ] Migracion `0006_auto_delete_tasks.sql`: agregar columna `auto_delete_completed_tasks_days` en `profiles` y `completed_at` en `reminders`; indice parcial `idx_reminders_completed_at WHERE is_completed = true`
- [ ] Actualizar `src/db/schema.ts` y types correspondientes
- [ ] Modificar `alternarCompletado` para llenar `completed_at = NOW()` al completar y `NULL` al desmarcar
- [ ] Nuevo cron `src/app/api/cron/limpiar-tareas/route.ts` protegido con `CRON_SECRET`
- [ ] Agregar entrada en `vercel.json`: schedule `0 3 * * *` (diario, 03:00 UTC)
- [ ] Nueva constante `OPCIONES_AUTO_DELETE_TAREAS` (Nunca / 7 / 30 / 90)
- [ ] Nuevo `src/components/features/settings/formulario-auto-delete-tareas.tsx`
- [ ] Server action `actualizarAutoDeleteTareas`
- [ ] Mostrar "Se eliminara en X dias" en tarjetas de tareas completadas (color ambar si <= 3 dias)

**Done when:** Configuro "A los 7 dias" en settings; marco una tarea como completada; al disparar el cron tras 8 dias la tarea desaparece. Cambiar a "Nunca" preserva el historial. Otras categorias completadas no se borran.

---

## Fase 14: Entrada por audio en el asistente IA

**Objetivo:** boton de microfono que graba, transcribe con Groq Whisper y rellena el input para que el usuario revise.

- [ ] Nuevo endpoint `src/app/api/ai/transcribir/route.ts` con `whisper-large-v3-turbo` y rate-limit 10 req/min
- [ ] Nuevo hook `src/hooks/use-audio-recorder.ts` que encapsula `MediaRecorder`
- [ ] Boton `Mic` junto al input de `asistente-ia.tsx` y `chat-lanzamientos.tsx`
- [ ] Indicador visual de grabacion (waveform o timer)
- [ ] Manejo de permisos del navegador y fallback de error

**Done when:** Puedo pulsar el microfono, dictar "cumpleanos de Lucas el 5 de julio", soltar, y el texto aparece en el input. Reviso y envio normal. Funciona en Chrome Android y Windows.

---

## Fase 15: Eliminar herramienta Pomodoro

**Objetivo:** retirar Pomodoro del producto porque se aleja del objetivo (gestion de recordatorios). La categoria `Estudio` se mantiene desacoplada del pomodoro.

- [ ] Borrar `src/app/(dashboard)/pomodoro/page.tsx` y `loading.tsx`
- [ ] Borrar `src/app/api/pomodoro/notify/route.ts`
- [ ] Borrar carpeta `src/components/features/pomodoro/`
- [ ] Borrar `src/hooks/use-pomodoro.ts`
- [ ] Borrar `src/lib/utils/pomodoro.utils.ts`
- [ ] Eliminar link y icono `Timer` de `src/components/features/sidebar.tsx`
- [ ] Quitar shortcut `Pomodoro` de `public/manifest.json`
- [ ] Revisar `src/components/features/settings/formulario-sonido.tsx`: si era exclusivo del pomodoro, eliminarlo; si se usa para notificaciones generales, ajustar copy
- [ ] Limpiar constantes y action `actualizarSonido` si quedan huerfanas
- [ ] Verificar que el form de categoria `Estudio` no tenga campos especificos de pomodoro
- [ ] Dejar columna `sound_enabled` en `profiles` por ahora (housekeeping futuro)

**Done when:** `/pomodoro` devuelve 404, el sidebar no muestra la entrada, el shortcut PWA desaparece tras update del Service Worker, y `npm run build` no rompe.

---

## Fase 16: Notas multimedia (multi-iteracion)

**Objetivo:** convertir las notas en un baul de cosas - texto, imagenes, audio, documentos y video - implementado en sub-fases progresivas. Depende de la Fase 9.

Cada sub-fase amplia la tabla `note_attachments (id, reminder_id, tipo, url, mime, tamano, creado_en)` (creada en 16.A) y la UI; cada una es un PR independiente.

### Fase 16.A - Imagenes
- [ ] Migracion `0005_note_attachments.sql`: CREATE TABLE `note_attachments`
- [ ] Integracion con Vercel Blob (variable `BLOB_READ_WRITE_TOKEN`)
- [ ] Server action `subirAdjunto` con validacion (JPG/PNG/WebP, max 5MB)
- [ ] UI: drag & drop o input file, galeria con lightbox
- [ ] Borrado de adjunto y de blob asociado

### Fase 16.B - Audios
- [ ] Aceptar MP3/OGG/WAV; reusar `MediaRecorder` para grabacion in-app
- [ ] Reproductor con play/pause/seek

### Fase 16.C - Documentos
- [ ] Aceptar PDF/DOCX/TXT
- [ ] Icono por tipo + boton de descarga; preview opcional para PDF

### Fase 16.D - Videos
- [ ] Aceptar MP4/WebM con limite de tamano
- [ ] Reproductor inline

**Done when (toda la fase):** Una nota puede tener texto + cualquier combinacion de imagenes, audios, documentos y videos como un baul personal.

---

## Fase 17 (futuras mejoras)

**No priorizado - oportunidades de mejora identificadas:**

### UX / Productividad
- [ ] Dark mode - Tailwind lo soporta nativamente, impacto visual alto
- [ ] Drag & drop para reordenar recordatorios dentro de una categoria
- [ ] Optimistic updates en completar/eliminar - el item desaparece visualmente de inmediato sin esperar al servidor
- [ ] Paginacion o infinite scroll en la lista de recordatorios para usuarios con muchos items
- [ ] Atajos de teclado adicionales: `N` para nuevo recordatorio, `C` para ir al calendario

### Notificaciones y segundo plano
- [ ] PWA Widget API (Windows 11 + Android) - widget nativo en la pantalla de inicio con los proximos recordatorios del dia (experimental, requiere Edge/Chrome reciente)
- [ ] Share Target API - recibir texto desde otras apps para crear un recordatorio directamente
- [ ] Notificacion por email como fallback cuando las push notifications estan bloqueadas
- [ ] Recordatorio de cumpleanos con cuenta regresiva ("Faltan 3 dias para el cumpleanos de Juan")

### IA y contenido
- [ ] Asistente IA conversacional en el dashboard (no solo single-shot) - historial de conversacion para refinar recordatorios
- [ ] Deteccion automatica de duplicados al crear con IA - avisar si ya existe un recordatorio similar
- [ ] Integracion con mas fuentes: eventos deportivos, lanzamientos de software, estrenos de temporadas de TV
- [ ] Sugerencias de categoria inteligente al tipear en el formulario manual
- [ ] Extender auto-eliminacion a otras categorias completadas (eventos pasados, lanzamientos viejos)

### Estadisticas
- [ ] Pagina de estadisticas: recordatorios completados por semana, racha de dias activos, categoria mas usada
- [ ] Resumen semanal - push notification cada domingo con el resumen de la semana pasada y los proximos 7 dias

### Personalizacion
- [ ] Categorias custom - el usuario puede crear y nombrar sus propias categorias con color e icono
- [ ] Temas de color - no solo dark/light, sino paletas personalizables

### Tecnico
- [ ] Internacionalizacion (i18n) - soporte para ingles ademas de espanol
- [ ] Cache de cliente con SWR o React Query para reducir recargas al navegar entre paginas
- [ ] Full-text search con `tsvector` en PostgreSQL para busqueda mas precisa con soporte de acentos y sinonimos
- [ ] Tests E2E con Playwright para el flujo critico (crear recordatorio -> recibir notificacion)
