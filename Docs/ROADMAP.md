# Roadmap: Noti

## Estado actual

Fases 0-8 completadas. Pendiente manual: aplicar migracion de BD en Supabase dashboard (`src/db/migrations/0003_lanzamientos.sql`).

Las fases 9-16 estan ordenadas por importancia descendente: las primeras son las que mas cambian la logica y el desarrollo de la aplicacion (refactores estructurales, nuevas categorias, bugfixes criticos), y las ultimas son features aditivas o de limpieza. Cada fase es ejecutable de forma independiente salvo la Fase 16, que depende de la Fase 9.

---

## Historico de fases completadas (0-8)

- **Fase 0 — Setup inicial:** PRD, Arquitectura, Roadmap, CLAUDE.md, .gitignore, .env.example, .editorconfig.
- **Fase 1 — Foundation:** Next.js 15 + App Router + TypeScript + Tailwind, Supabase (DB + Auth), Drizzle, Google OAuth + email/password, middleware de proteccion, layouts auth/dashboard, seed de 6 categorias, PWA basica, primer deploy a Vercel.
- **Fase 2 — CRUD de recordatorios:** schema `reminders`, server actions completas, queries por categoria/upcoming, validaciones Zod, formulario modal con campos por categoria, soporte de recurrencias (semanal/anual), dashboard agrupado por dia, pagina por categoria.
- **Fase 3 — Notificaciones push:** VAPID keys, Service Worker con `push` y `notificationclick`, schema `push_subscriptions` y `notification_log`, endpoints `subscribe` y `action`, cron `check-reminders` cada minuto, multi-dispositivo, anticipacion configurable, acciones desde la notificacion, reprogramacion de recurrentes.
- **Fase 4 — Chat IA para lanzamientos:** servicios TMDB / RAWG / MusicBrainz + orquestador, capa `tools.ts` y `prompt.ts` (`buscarLanzamiento`, `pedirFechaManual`, `agregarRecordatorio`) con AI SDK v6, endpoint `/api/chat`, pagina `/movies`, anti-alucinacion, atribuciones obligatorias.
- **Fase 5 — Pomodoro + calendario:** PomodoroTimer 25/5/15, sonido opcional, integracion con estudio, vista calendario mensual y semanal con dots y dialog por dia. *(Pomodoro queda marcado para eliminacion en Fase 15.)*
- **Fase 6 — Pulido + deploy publico:** landing, perfil, gestion de dispositivos, empty states, skeletons, error handling con toasts, meta tags, favicon, README, RLS y rate limiting. *Pendientes manuales:* Lighthouse audit, testing manual multi-browser, screenshots para portafolio.
- **Fase 7 — Busqueda, IA general y segundo plano:** Ctrl+K con debounce, asistente IA en dashboard (`/api/ai/recordatorio` con `generateObject`), `crearRecordatorioDesdeIA`, resumen diario por push (cron `resumen-diario` cada hora), Background Sync en Service Worker, shortcuts y `window-controls-overlay` en manifest.
- **Fase 8 — Reestructuracion de Lanzamientos:** categoria `movies` dividida en 5 (`movies`, `tv`, `games`, `music`, `books`), hub `/lanzamientos` con tabs y formulario manual, Google Books para libros, `SLUGS_LANZAMIENTO`, sidebar con entrada unica "Lanzamientos", mapeo tipo→slug en `crearRecordatorioLanzamiento`. *Pendiente manual:* aplicar `0003_lanzamientos.sql` en Supabase.

---

## Fase 9: Categoria Notas (historial de archivos individuales)

**Objetivo:** las notas se manejan como archivos individuales en un historial (estilo Google Keep / Apple Notes), no como un unico documento. Cada nota tiene su propio titulo, cuerpo y opcionalmente fecha de recordatorio. La vista principal es un grid/lista de tarjetas; clic en una nota abre su contenido completo. Cambia el schema (`due_date` y `notify_at` se vuelven nullable), introduce nuevos patrones de UI (vista detalle, editor dedicado) y abre la puerta a la Fase 16 (multimedia).

Cuando creo un evento a cierta hora, el evento cuando es creado me aparece otra hora, hay una desincronización en los horarios para los eventos que se crean con fecha. Habria que arreglar esto antes de pasar a la Fase 9.

- [ ] Migracion `0004_notas.sql`: INSERT categoria `notes`; `ALTER COLUMN due_date DROP NOT NULL` y `notify_at DROP NOT NULL`
- [ ] Actualizar `src/db/schema.ts` (quitar `.notNull()` de `fechaVencimiento` y `notificarEn`)
- [ ] Actualizar `src/types/reminder.types.ts` (Date -> Date | null en los campos correspondientes)
- [ ] Agregar `notes` a `CATEGORIAS` y `SLUGS_VALIDOS` en constants y seed
- [ ] Nueva entrada `esquemaMetadatosNotas` (campo `recordarme: boolean`) en `reminder.schemas.ts`
- [ ] Ajustar `crearRecordatorio` para aceptar fecha vacia cuando `slug==='notes'`
- [ ] Ajustar `getUpcomingReminders` para excluir notas sin `due_date`; nueva query `getNotas` ordenadas por `creadoEn DESC`
- [ ] Ajustar `src/app/api/cron/check-reminders/route.ts` para ignorar `notify_at IS NULL`
- [ ] Nueva ruta `src/app/(dashboard)/notes/page.tsx`: grid/lista de tarjetas (cada nota = una tarjeta) con titulo, preview de las primeras lineas, fecha de creacion y badge si tiene recordatorio activo
- [ ] Boton prominente `Nueva nota` que abre un editor (dialog o panel) con titulo + textarea grande para el cuerpo
- [ ] Nueva ruta `src/app/(dashboard)/notes/[id]/page.tsx` (o dialog modal) para ver/editar una nota completa
- [ ] Toggle `Recordarme` dentro del editor que muestra campos de fecha/hora cuando se activa
- [ ] Acciones por nota: editar, eliminar, duplicar
- [ ] Las notas aparecen en la busqueda global Ctrl+K como cualquier otro recordatorio
- [ ] Agregar icono `StickyNote` en el map de `sidebar.tsx`

**Done when:** Puedo crear muchas notas independientes, verlas como tarjetas en `/notes`, abrir cualquiera para leerla o editarla en una vista dedicada, y opcionalmente convertir una nota en recordatorio activando una fecha. Las notas sin fecha no aparecen en el dashboard ni disparan notificacion.

---

## Fase 10: Refinar busqueda y modelo de IA para lanzamientos

**Objetivo:** corregir los bugs que hacen que consultas como "Cuando sale GTA 6" devuelvan sin resultado, aunque la informacion exista en RAWG / TMDB / MusicBrainz. Mejorar la robustez del prompt y el modelo para que encadene tools correctamente. Critico para que el chat de Lanzamientos funcione bien (hoy falla en una mayoria de consultas reales).

La idea es escribir algo como "Cuando sale el nuevo Zelda" o "Nuevo album de The Weeknd" y que el sistema sea capaz de encontrar el lanzamiento correspondiente. Que devuelva la información concreta, como el titulo original, fecha de lanzamiento, director, autor, artista, dependiendo de la categoria y que yo pueda confirmar como se va a guardar la información y en base a esa información se cree el recordatorio.

Tipos de lanzamientos y campos asociados:
- Album de musica: titulo del album, el artista, la fecha de lanzamiento
- Videojuego: titulo, fecha de lanzamiento, plataforma
- Pelicula: titulo, fecha de lanzamiento, director
- Serie: titulo, fecha de lanzamiento, temporada
- Libro: titulo, fecha de lanzamiento, autor

Tambien me gustaria que se asignara una imagen con respecto al lanzamiento, por ejemplo para un album de musica una imagen de la portada, para un videojuego la portada, para una pelicula la portada, para una serie la portada y para un libro la portada, todas estas imagenes se guardarian en la base de datos junto con la información del lanzamiento (Preguntar viabilidad de esta peticion)

### Bugs identificados a corregir

**RAWG (`src/lib/services/rawg.service.ts`)**
- [ ] Manejar resultados TBA: cuando todos los `results` tienen `tba: true` o `released: null`, devolver el mejor candidato con `tba: true` y la fecha aproximada (RAWG suele tener "2026-12-31" como placeholder de Q4). No retornar `null` silencioso.
- [ ] Quitar `search_precise: 'true'` por defecto. Hacer doble pasada: primera precisa, segunda relajada si la primera trae 0 resultados.
- [ ] Mapeo de aliases comunes: "GTA" -> "Grand Theft Auto", "CoD" -> "Call of Duty", "RE" -> "Resident Evil". Tabla de aliases en el servicio.
- [ ] Si la consulta termina en numero romano vs arabe (VI vs 6), probar ambos.

**TMDB (`src/lib/services/tmdb.service.ts`)**
- [ ] `elegirMejorResultado`: cuando hay varios candidatos, priorizar los que tienen fecha futura sobre los populares ya estrenados (relevante para "cuando sale X 5" cuando X 1-4 ya existen).
- [ ] Para series, manejar el caso de `next_episode_to_air` (proximo episodio) cuando ya esta emitida. Endpoint `/tv/{id}` trae ese campo util.
- [ ] Si la pelicula no tiene fecha en CO, intentar US como segundo fallback antes de la fecha generica `release_date`.

**MusicBrainz (`src/lib/services/musicbrainz.service.ts`)**
- [ ] Hacer doble pasada: primero con quotes exactas (precisa), si vacio sin quotes (fuzzy).
- [ ] Escapar caracteres especiales del titulo y artista antes de armar la consulta Lucene.
- [ ] Priorizar releases con fecha futura cuando el usuario pregunta "cuando sale".

**Prompt IA (`src/lib/ai/prompt.ts`)**
- [ ] Agregar regla explicita: "Extrae SOLO el titulo del lanzamiento. NUNCA pases frases interrogativas. Ejemplo: usuario dice 'cuando sale GTA 6' -> titulo='GTA 6', no 'cuando sale GTA 6'."
- [ ] Reforzar: "Si buscarLanzamiento devuelve encontrado=false, SIEMPRE debes llamar pedirFechaManual a continuacion. NUNCA respondas con texto plano diciendo que no encontraste sin haber llamado pedirFechaManual primero."
- [ ] Agregar few-shot examples: 2-3 ejemplos resueltos en el prompt para anclar el comportamiento (consulta -> tool call con titulo limpio -> respuesta).
- [ ] Para juegos con sufijo numerico ("GTA 6", "Half-Life 3"), guiar al modelo a buscar tanto la forma numerica como su expansion conocida ("Grand Theft Auto VI").

**Flujo de tools (`src/app/api/chat/route.ts`)**
- [ ] Aumentar `stopWhen: stepCountIs(5)` a `stepCountIs(8)` para dar margen al encadenamiento buscar -> pedirFechaManual -> agregarRecordatorio.
- [ ] Evaluar modelos alternativos en Groq con mejor tool calling: `qwen/qwen3-32b` o `moonshotai/kimi-k2-instruct-0905`. Hacer un benchmark con 10 consultas representativas y comparar tasa de exito.

**Logica de retry cross-source (`src/lib/services/release-search.service.ts`)**
- [ ] Si el tipo es ambiguo o la primera busqueda devuelve null, ejecutar busqueda paralela en las otras fuentes como fallback (ej: si tipo='game' devuelve null para "Avatar", probar movie/tv).
- [ ] Funcion `limpiarTitulo(titulo)` que quita frases interrogativas en espanol e ingles antes de llamar a las APIs (defensa en profundidad ademas del prompt).

### Telemetria y debug

- [ ] Loguear cada consulta con `{ titulo, tipo, fuente, encontrado, mejorScore }` para identificar patrones de fallo. Sin PII.
- [ ] En desarrollo (`NODE_ENV !== 'production'`), incluir en la respuesta del tool un campo opcional `debug: { query, resultados }` que el UI puede mostrar al desarrollador.

### Tests manuales del done

Validar al menos 10 consultas reales que hoy fallan:
- [ ] "Cuando sale GTA 6" -> trae fecha aproximada o TBA (no null silencioso)
- [ ] "Cuando sale Hollow Knight Silksong" -> trae fecha
- [ ] "Cuando sale Avatar 4" -> prefiere fecha futura sobre Avatar 1 (mas popular)
- [ ] "Nuevo album de Bad Bunny" -> trae el ultimo lanzamiento
- [ ] "Album DeBI TiRAR MaS FOToS" (con mayusculas raras) -> trae resultado
- [ ] "Half-Life 3" -> reconoce que es juego, devuelve TBA / sin fecha sin colgarse
- [ ] "Stranger Things temporada 5" -> trae la serie y la proxima fecha de emision
- [ ] "Resident Evil 9" -> reconoce alias "RE 9" tambien

**Done when:** Al menos 8 de las 10 consultas anteriores resuelven correctamente (con fecha real, fecha aproximada con disclaimer, o cayendo limpiamente al formulario manual con prefill del titulo). El log no muestra `encontrado: false` cuando la informacion si existe en la fuente.

---

## Fase 11: Calendario - bugfix vista semana y filtro por categoria

**Objetivo:** corregir el bug de navegacion en vista semana (no trae los recordatorios correctos) y permitir filtrar el calendario por categoria.

Además, hay un error grafico en el que se ven los dias de la semana. pues aparece semana del 17-17 de mayo, cuando deberia ser del 11-17 de mayo.

- [ ] Cambiar query param de `/calendar` de `?mes=YYYY-MM` a `?fecha=YYYY-MM-DD` para que vista semana fetchee el rango correcto
- [ ] Actualizar `src/app/(dashboard)/calendar/page.tsx` para parsear `fecha`; mantener fallback con `mes`
- [ ] Actualizar `vista-calendario.tsx` (`navegar`, `irAHoy`, `cambiarVista`) para construir el nuevo param
- [ ] Nuevo componente `src/components/features/calendar/filtro-calendario.tsx` (pills multi-select por categoria)
- [ ] Estado de filtro en `VistaCalendario`; filtrar `recordatorios` antes de pasar a `VistaMes` / `VistaSemana`

**Done when:** Navegar entre semanas trae los recordatorios reales de cada semana. Puedo activar/desactivar categorias en el filtro y los dots (mes) o bloques (semana) responden.

---

## Fase 12: Rediseno del asistente IA

**Objetivo:** sacar el asistente IA del flujo principal del dashboard para que sea opcional y no domine la lista de recordatorios. Esta fase **arranca con prototipos** para que el usuario elija el diseno final entre varias opciones.

### Opciones a prototipar
- **A)** FAB (Floating Action Button) con sparkles + bottom sheet
- **B)** Boton sparkles en el header + dialog centrado (atajo Ctrl+I)
- **C)** Ruta dedicada `/asistente` con chat full-page
- **D)** Hibrida: boton en header + ruta dedicada

### Implementacion (tras eleccion)
- [ ] Prototipos rapidos de 2-3 opciones con dummy data
- [ ] Decision del diseno final
- [ ] Extraer logica reutilizable de `asistente-ia.tsx` a hook o componente headless
- [ ] Quitar `<AsistenteIA />` de `src/app/(dashboard)/inicio/page.tsx`
- [ ] Mover `asistente-ia.tsx` desde `reminders/` a `features/asistente/` para reflejar independencia
- [ ] Integrar boton de audio (Fase 14) en el nuevo contenedor
- [ ] Tooltip o tour breve para descubrimiento la primera vez

**Done when:** El dashboard inicio se ve limpio (solo lista de recordatorios + filtros). Puedo invocar el asistente IA desde cualquier ruta con uno o dos clicks o atajo de teclado. Crear con IA funciona identico al actual.

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
