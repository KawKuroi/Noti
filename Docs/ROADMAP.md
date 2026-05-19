# Roadmap: Noti

## Estado actual

Las fases 14-19 son la nueva ola priorizada por el usuario (bugfixes, refactor de categorias, reestructuracion de navegacion, rediseno del inicio, mejoras al asistente y landing). Las fases 20-23 son aditivas y quedan en cola para iteraciones posteriores. Estan ordenadas por importancia descendente: las primeras son las que mas cambian la logica y el desarrollo de la aplicacion, y las ultimas son features aditivas o de limpieza. Cada fase es ejecutable de forma independiente salvo Fase 22 (notas multimedia), que depende de la Fase 9.

---

## Historico de fases completadas (0-13)

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
- **Fase 12 — Refactor IA lanzamientos:** Bug RAWG resuelto, chat unificado con bottom sheet y Ctrl+I, validacion de coincidencia de titulo, edicion inline de fecha tentativa.
- **Fase 12b — Pipeline deterministico + command palette:** Reemplazo del chat conversacional por pipeline de 3 pasos (extraccion estructurada, busqueda multi-candidato, UI de seleccion estilo Raycast). Precision ~95%.
- **Fase 13 — Eliminar Pomodoro:** Retirado del producto todo lo relacionado con el temporizador Pomodoro.

---

## Fase 14: Bugfixes criticos + refactor de categorias

**Objetivo:** corregir los dos bugs criticos visibles en produccion y reducir la friccion conceptual unificando categorias que se solapan. Bloquea al resto del plan porque cambia el modelo de categorias.

- [ ] **Bug recurrencia 400 ocurrencias**: arreglar `expandirOcurrenciasEnRango()` en `src/lib/utils/date.utils.ts:161-203`. Asegurar avance estricto del cursor cuando `calcularProximaOcurrencia()` devuelve la misma fecha o una fecha <= cursor.
- [ ] **Bug formulario manual de notas**: el formulario retorna `null` para `notes` (`src/components/features/reminders/formulario-recordatorio.tsx:156`); revisar handler de submit para `notes` (campos minimos: titulo + cuerpo; sin fecha obligatoria).
- [ ] **Fusion `classes` -> `study`**: migracion SQL `0007_fusion_classes_study.sql` que actualiza `reminders.category_id` y elimina la fila de `categories` con slug `classes`. Quitar `classes` de `src/lib/utils/constants.ts` y `src/db/seed.ts`. Actualizar prompts del extractor (`src/lib/ai/extractor.ts`) para que `classes` ya no exista como intencion.
- [ ] **Rename label "Tareas" -> "Pendientes"**: solo cambiar `nombre` en seed y en constantes UI. Slug `tasks` se mantiene en BD.
- [ ] **Ocultar checkbox en cards recurrentes**: condicionar el render del checkbox a `!esRecurrente` en `tarjeta-recordatorio.tsx`. Las acciones disponibles para recurrentes son editar y eliminar.

**Done when:** Una clase recurrente genera 1 fila en BD y se ve correctamente expandida en el calendario sin duplicados (no aparecen 400 entradas en el dialog del dia). Crear una nota desde el formulario manual persiste y aparece en `/notes`. La categoria `classes` ya no existe en BD ni en UI. En el sidebar y filtros, donde decia "Tareas" ahora dice "Pendientes". Las cards de clase/cumpleanos no tienen checkbox.

---

## Fase 15: Reestructuracion del sidebar y navegacion

**Objetivo:** liberar espacio vertical en el dashboard moviendo la busqueda al sidebar, agrupar herramientas accesorias (Calendario + Notas) y mover el usuario al footer del sidebar.

- [ ] Crear grupo "Herramientas" colapsable en `src/components/features/sidebar.tsx` que contenga `Calendario` y `Notas`. Las rutas `/calendar` y `/notes` no cambian.
- [ ] Mover la busqueda global a un icono de lupa en el sidebar; al hacer click abre el modal Ctrl+K. Eliminar la barra superior de busqueda del dashboard (`src/app/(dashboard)/inicio/page.tsx`).
- [ ] Footer del sidebar: mostrar nombre del usuario + icono engranaje al lado (link a `/settings`). Eliminar el bloque de usuario/logout que hoy vive en la esquina superior derecha.
- [ ] Mover accion "Cerrar sesion" dentro de la pagina `/settings` (zona Cuenta).

**Done when:** El sidebar incluye un grupo "Herramientas" con Calendario + Notas. La busqueda global solo se accede por la lupa del sidebar o `Ctrl+K`. El nombre del usuario aparece en el footer del sidebar con un engranaje al lado. La esquina superior derecha ya no muestra el bloque de usuario/logout. Logout se hace desde `/settings`.

---

## Fase 16: Lanzamientos - pestana Todos, paleta de color, formulario completo, portadas no persistentes

**Objetivo:** mejorar la experiencia del hub de lanzamientos con vision agregada, diferenciacion visual por tipo y formulario manual completo. Definir formalmente que las portadas son UX visual durante la seleccion, no datos persistidos.

- [ ] Agregar pestana "Todos" en `/lanzamientos` que muestra todos los tipos mezclados, ordenados por fecha de lanzamiento.
- [ ] Aplicar paleta de color por tipo (constantes nuevas en `src/lib/utils/constants.ts`):
  - Peliculas `#0A0A0A` (negro)
  - Series `#2563EB` (azul)
  - Juegos `#16A34A` (verde)
  - Musica `#DC2626` (rojo)
  - Libros `#7C3AED` (morado)
  - Usar el color como acento sutil (borde izquierdo, badge, dot). No fondos completos. Mantener minimalismo.
- [ ] Extender `formulario-manual-lanzamiento.tsx` con campos faltantes:
  - Descripcion (opcional, todas las categorias)
  - Autor (solo `books`)
  - Artista/Banda (solo `music`)
  - Director/Showrunner (opcional, `movies`/`tv`)
  - Persistir en `metadatos` (jsonb).
- [ ] **Portadas no persistentes**: en el palette de candidatos IA se siguen mostrando las portadas (UX visual). Al guardar (`crearRecordatorioLanzamiento`), **no** se persiste la imagen. Ignorar/eliminar la columna `image_url` en escrituras.
- [ ] Actualizar la card de lanzamiento para no leer `image_url` (placeholder de icono por tipo segun la paleta).

**Done when:** En `/lanzamientos` aparece la pestana "Todos" con cards diferenciadas por color segun tipo. El formulario manual permite anadir artista/autor/descripcion y se persiste en `metadatos`. Al crear un lanzamiento via IA, en el palette se ven las portadas, pero la card guardada no muestra portada (icono por tipo). Ninguna ruta de creacion escribe `image_url`.

---

## Fase 17: Redisenno del inicio

**Objetivo:** convertir `/inicio` en un panel personal con saludo dinamico, input IA prominente, lista de proximos recordatorios y widgets laterales (mini-calendario + chips de categorias). Mantener el minimalismo actual.

- [ ] Reorganizar `src/app/(dashboard)/inicio/page.tsx` con la estructura:
  1. Saludo dinamico ("Buenos dias/tardes/noches, {nombre}") segun hora local.
  2. Subtitulo con resumen rapido ("Tienes X tareas para hoy y un evento proximo").
  3. Input IA prominente (mismo componente del asistente, full-width) con microfono.
  4. Seccion "Proximos Recordatorios" con link "Ver todos".
  5. Sidebar derecho con mini-calendario del mes actual + seccion "Categorias" con chips filtrables.
- [ ] Mantener tipografia, espaciados y paleta actuales (minimalismo).
- [ ] El input IA del inicio comparte estado con el palette Ctrl+I (no duplicar logica).

**Done when:** Al entrar a `/inicio` se ve un saludo personalizado, el input IA grande, una lista de proximos recordatorios con la opcion "Ver todos", un mini-calendario lateral y los chips de categorias. La UI conserva el aire minimalista.

---

## Fase 18: Asistente IA - fechas naturales y edicion inline completa

**Objetivo:** que la IA entienda fechas tipo "nov 19", "20/06", "3 mar" y "viernes 21" sin necesidad de re-prompt, y que la card de extraccion permita editar cualquier campo antes de confirmar.

- [ ] Extender `src/lib/ai/extractor.ts` con ejemplos en el prompt: "nov 19", "20/06", "3 mar", "viernes 21".
- [ ] Crear `src/lib/utils/parsear-fecha-natural.ts` (date-fns + locale espanol) que toma un string libre y devuelve `Date | null`. Inferir el ano: si la fecha resultante es pasada respecto a `hoy`, sumar 1 ano. Cubrir formatos: `dd/mm`, `dd-mm`, `mmm dd`, `dd mmm`, `dd de mmmm`.
- [ ] Pipeline: tras `generateObject`, si `lanzamiento.fechaTentativa`/`recordatorio.fecha` sigue siendo `null` pero el texto original contenia un token de fecha, intentar `parsearFechaNatural()` antes de marcar TBA/pedir aclaracion.
- [ ] Extender `RecordatorioExtraidoCard` (`src/components/features/asistente/recordatorio-form-card.tsx`) para permitir editar **todos** los campos antes de confirmar: titulo, descripcion, categoria, fecha, hora, recurrencia, dias semana, anticipacion, autor/artista (si aplica), tipo de lanzamiento.

**Done when:** "Lanzamiento de GTA 6 nov 19" rellena automaticamente la fecha 19 noviembre del proximo ano disponible en la card de candidatos. La card de edicion permite cambiar cualquier campo antes de pulsar Enter para confirmar. Una fecha pasada se reinterpreta al proximo ano.

---

## Fase 19: Landing page - enlace a GitHub

**Objetivo:** dar visibilidad al repositorio publico desde la landing para que visitantes interesados puedan explorar el codigo.

- [ ] Agregar enlace al repositorio de GitHub en el footer del landing (`src/app/page.tsx`).
- [ ] Boton secundario "Ver en GitHub" en el hero junto al CTA principal.
- [ ] Icono de GitHub usando `lucide-react`.

**Done when:** La landing tiene un link visible al repo (hero + footer) que abre en nueva pestana.

---

## Fase 20: Auto-eliminacion de tareas completadas

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

## Fase 21: Entrada por audio en el asistente IA

**Objetivo:** boton de microfono que graba, transcribe con Groq Whisper y rellena el input para que el usuario revise.

- [ ] Nuevo endpoint `src/app/api/ai/transcribir/route.ts` con `whisper-large-v3-turbo` y rate-limit 10 req/min
- [ ] Nuevo hook `src/hooks/use-audio-recorder.ts` que encapsula `MediaRecorder`
- [ ] Boton `Mic` junto al input de `asistente-ia.tsx` y `chat-lanzamientos.tsx`
- [ ] Indicador visual de grabacion (waveform o timer)
- [ ] Manejo de permisos del navegador y fallback de error

**Done when:** Puedo pulsar el microfono, dictar "cumpleanos de Lucas el 5 de julio", soltar, y el texto aparece en el input. Reviso y envio normal. Funciona en Chrome Android y Windows.

---

## Fase 22: Notas multimedia (multi-iteracion)

**Objetivo:** convertir las notas en un baul de cosas - texto, imagenes, audio, documentos y video - implementado en sub-fases progresivas. Depende de la Fase 9.

### Fase 22.0: Reestructuracion de notas
Antes de cualquier cambio, quiero que las notas se parezcan a chats de whatsapp, que cada "chat" funcione como un "archivo" que se puede modificar su nombre y eliminar, dentro de cada "archivo" se puede guardar cualquier tipo de informacion, primero texto, luego el resto de caracteristicas que aparecen en la lista de las fases.

Cada sub-fase amplia la tabla `note_attachments (id, reminder_id, tipo, url, mime, tamano, creado_en)` (creada en 22.A) y la UI; cada una es un PR independiente.

### Fase 22.A - Imagenes
- [ ] Migracion `0005_note_attachments.sql`: CREATE TABLE `note_attachments`
- [ ] Integracion con Vercel Blob (variable `BLOB_READ_WRITE_TOKEN`)
- [ ] Server action `subirAdjunto` con validacion (JPG/PNG/WebP, max 5MB)
- [ ] UI: drag & drop o input file, galeria con lightbox
- [ ] Borrado de adjunto y de blob asociado

### Fase 22.B - Audios
- [ ] Aceptar MP3/OGG/WAV; reusar `MediaRecorder` para grabacion in-app
- [ ] Reproductor con play/pause/seek

### Fase 22.C - Documentos
- [ ] Aceptar PDF/DOCX/TXT
- [ ] Icono por tipo + boton de descarga; preview opcional para PDF

### Fase 22.D - Videos
- [ ] Aceptar MP4/WebM con limite de tamano
- [ ] Reproductor inline

**Done when (toda la fase):** Una nota puede tener texto + cualquier combinacion de imagenes, audios, documentos y videos como un baul personal.

---

## Fase 23 (futuras mejoras)

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
