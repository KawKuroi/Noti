# Roadmap: Noti

## Estado actual

Fase 7 completada. Busqueda global con Ctrl+K, asistente IA para crear recordatorios por lenguaje natural, resumen diario por push notification, Background Sync en el Service Worker y shortcuts en el manifest PWA. Pendiente manual: aplicar migracion de BD en Supabase dashboard (columnas `daily_summary` y `summary_hour` en tabla `profiles` — SQL en `src/db/migrations/0002_magical_maddog.sql`).

## Sobre las fases 8-16

Las fases 8-16 estan ordenadas por importancia descendente: las primeras son las que mas cambian la logica y el desarrollo de la aplicacion (refactores estructurales, nuevas categorias, bugfixes criticos), y las ultimas son features aditivas o de limpieza. Cada fase es ejecutable de forma independiente salvo la Fase 16, que depende de la Fase 9.

---

## Fase 0: Setup inicial (infraestructura base)

**Objetivo:** El repositorio tiene todos los archivos de configuracion base antes de escribir una sola linea de codigo de aplicacion.

- [x] Definir PRD (`Docs/PRD.md`)
- [x] Definir Arquitectura (`Docs/ARCHITECTURE.md`)
- [x] Definir Roadmap (`Docs/ROADMAP.md`)
- [x] Configurar instrucciones del proyecto (`CLAUDE.md`)
- [x] Crear `.gitignore` (Next.js + Node.js + Supabase + entorno)
- [x] Crear `.env.example` (template documentado de variables de entorno)
- [x] Crear `.editorconfig` (UTF-8, LF, 2 espacios)

**Done when:** Se puede clonar el repositorio y saber exactamente que variables de entorno configurar antes de iniciar el desarrollo.

---

## Fase 1: Foundation (semana 1)

**Objetivo:** Setup completo del proyecto. Usuario puede registrarse, hacer login, y ver el dashboard vacío. PWA instalable.

- [x] Inicializar Next.js 14+ con App Router + TypeScript + Tailwind
- [x] Configurar Supabase (proyecto, DB, Auth)
- [x] Configurar Drizzle ORM + schema inicial (`profiles`, `categories`)
- [x] Implementar autenticación con Supabase Auth (Google OAuth + email/password)
- [x] Crear middleware de protección de rutas
- [x] Layout autenticado: sidebar con categorías + header con perfil
- [x] Layout de auth: páginas de login y registro
- [x] Dashboard vacío con mensaje "Crea tu primer recordatorio"
- [x] Seed de categorías iniciales (6 categorías fijas)
- [x] Configurar PWA: manifest.json, Service Worker básico, íconos
- [x] Configurar variables de entorno en Vercel
- [x] Primer deploy a Vercel

**Done when:** Puedo instalar la PWA desde Chrome en Android/Windows, registrarme con Google, y ver el dashboard vacío con la sidebar de categorías.

---

## Fase 2: CRUD de recordatorios (semana 2)

**Objetivo:** Usuario puede crear, ver, editar, eliminar y completar recordatorios en todas las categorías.

- [x] Schema DB: tabla `reminders` con migraciones
- [x] Server actions: `createReminder`, `updateReminder`, `deleteReminder`, `toggleComplete`
- [x] Queries: `getReminders`, `getRemindersByCategory`, `getUpcomingReminders`
- [x] Validaciones Zod para crear/editar recordatorios
- [x] Componente `ReminderForm`: formulario modal con campos por categoría
  - Campos comunes: título, descripción, fecha, hora, categoría
  - Campos de cumpleaños: fecha sin hora, recurrencia anual automática
  - Campos de clases: día de la semana, hora inicio/fin, recurrencia semanal
  - Campos de tareas: fecha límite, prioridad (baja/media/alta)
- [x] Componente `ReminderCard`: tarjeta con acciones (editar, eliminar, completar)
- [x] Componente `ReminderList`: lista filtrable y ordenable
- [x] Componente `CategoryFilter`: pills de categorías con contadores
- [x] Dashboard: mostrar recordatorios próximos agrupados por día
- [x] Página por categoría: vista filtrada con UI específica
- [x] Soporte para recordatorios recurrentes (semanal para clases, anual para cumpleaños)

**Done when:** Puedo crear recordatorios en las 6 categorías, verlos en el dashboard filtrados, editarlos, eliminarlos y marcarlos como completados. Los recurrentes se muestran correctamente.

---

## Fase 3: Notificaciones push (semana 3)

**Objetivo:** El usuario recibe notificaciones push reales en Android y Windows cuando un recordatorio está por vencer.

- [x] Generar VAPID keys (par público/privado)
- [x] Service Worker: handler de evento `push` para mostrar notificación
- [x] Service Worker: handler de `notificationclick` para abrir la app
- [x] Componente `NotificationPrompt`: pedir permiso al usuario
- [x] Schema DB: tabla `push_subscriptions`
- [x] API route: `POST /api/push/subscribe` — guardar suscripción
- [x] API route: `POST /api/push/action` — acciones desde notificación (posponer/completar)
- [x] Servicio `push.service.ts`: lógica de envío con librería `web-push`
- [x] Vercel Cron Job: `/api/cron/check-reminders` cada minuto
- [x] Schema DB: tabla `notification_log` para tracking
- [x] Página de settings: configurar anticipación de notificación (5min, 15min, 30min, 1h, 1 día)
- [x] Gestión de múltiples dispositivos por usuario
- [x] Acciones desde la notificación: "Ver", "Posponer 15min", "Completar"
- [x] Reprogramación automática de recordatorios recurrentes al enviar la notificación

**Done when:** Al crear un recordatorio para dentro de 5 minutos, recibo una notificación push real en mi celular Android y en mi PC Windows. Puedo posponer o completar desde la notificación.

---

## Fase 4: Chat IA para lanzamientos (semana 4)

**Objetivo:** Asistente conversacional que busca fechas exactas de lanzamientos en TMDB, RAWG y MusicBrainz, y las agrega al calendario tras confirmacion del usuario.

- [x] Servicio `tmdb.service.ts`: busqueda de peliculas y series con preferencia de estreno en Colombia
- [x] Servicio `rawg.service.ts`: busqueda de videojuegos por nombre
- [x] Servicio `musicbrainz.service.ts`: busqueda de albumes (sin API key, User-Agent identificable)
- [x] Servicio orquestador `release-search.service.ts`: selecciona la fuente correcta por tipo
- [x] Capa AI con `tools.ts` y `prompt.ts`: tres herramientas (`buscarLanzamiento`, `pedirFechaManual`, `agregarRecordatorio`) con AI SDK v6
- [x] Endpoint `POST /api/chat`: streaming con Google Gemini 2.0 Flash
- [x] Pagina `/movies`: chat + lista de lanzamientos seguidos + atribuciones
- [x] Componente `ChatLanzamientos` con `useChat` y renderizado de partes por herramienta
- [x] Componente `TarjetaConfirmacion`: poster, fecha, badge de fuente, botones Si/Cancelar
- [x] Componente `FormularioFechaManual`: fallback cuando ninguna fuente tiene la fecha
- [x] Server action `crearRecordatorioLanzamiento`: crea recordatorio con `notify_at = 06:00 del dia del lanzamiento`
- [x] Atribucion TMDB + RAWG + MusicBrainz (requisito de TMDB ToS)
- [x] Anti-alucinacion: el modelo solo reporta fechas devueltas por herramientas verificadas

**Done when:** Puedo preguntar al chat "cuando sale Avatar 4", "agenda GTA 6" o "nuevo album de Bad Bunny", recibir la fecha exacta desde la fuente correspondiente, confirmar con un boton y obtener una notificacion push a las 06:00 del dia del lanzamiento.

---

## Fase 5: Pomodoro + calendario (semana 5)

**Objetivo:** Timer de pomodoro funcional integrado con los recordatorios de estudio. Vista de calendario completa.

- [x] Componente `PomodoroTimer`: temporizador 25/5/15 min configurable
- [x] Estados del pomodoro: trabajo, descanso corto, descanso largo
- [x] Contador de sesiones completadas
- [x] Integración con recordatorios de estudio: al crear un reminder de estudio, opción de iniciar pomodoro
- [x] Notificación push al terminar cada sesión de pomodoro
- [x] Sonido de notificación (opcional, toggle en settings)
- [x] Vista de calendario mensual (`CalendarView`)
- [x] Vista de calendario semanal
- [x] Recordatorios visibles como dots/badges en los días del calendario
- [x] Click en un día → ver recordatorios de ese día
- [x] Navegación entre meses/semanas

**Done when:** Puedo iniciar un pomodoro de 25 minutos vinculado a mi recordatorio "Estudiar Cálculo", recibir una notificación push al terminar, y ver todos mis recordatorios del mes en la vista de calendario.

---

## Fase 6: Pulido + deploy público (semana 6)

**Objetivo:** La app está pulida, testeada, y lista para que cualquier persona la use. Portafolio-ready.

- [x] Landing page pública con descripción de la app y CTA de registro
- [x] Página de perfil: editar nombre, zona horaria, preferencias
- [x] Gestionar dispositivos: ver y eliminar suscripciones push
- [x] Empty states para cada sección (sin recordatorios, sin películas seguidas, etc.)
- [x] Loading states y skeletons
- [x] Error handling global con toasts
- [x] Validación de formularios con mensajes claros
- [x] Meta tags y OG tags para SEO y compartir
- [x] Favicon y splash screens para PWA
- [ ] Lighthouse audit: PWA score > 90, Performance > 80 (manual)
- [ ] Testing manual en Android Chrome + Windows Chrome + Windows Edge (manual)
- [x] Documentar README del repositorio para portafolio
- [ ] Screenshots y demo GIF para portafolio (manual)
- [x] Row Level Security (RLS) en Supabase: migration en `src/db/migrations/0001_rls_policies.sql` — aplicar en Supabase dashboard
- [x] Rate limiting básico en API routes

**Done when:** Puedo compartir `noti.vercel.app` con 5 personas, todas pueden registrarse, crear recordatorios, y recibir notificaciones sin problemas. El README del repo tiene screenshots y explica el proyecto.

---

## Fase 7: Busqueda, IA general y segundo plano (completada)

**Objetivo:** App funcionando en segundo plano, asistente IA para cualquier tipo de recordatorio, busqueda global, mejoras PWA.

- [x] Busqueda global con Ctrl+K — modal flotante con debounce 300ms, ilike sobre titulo y descripcion, badge de categoria y fecha relativa en resultados
- [x] Asistente IA en dashboard — input de lenguaje natural que usa Gemini (`generateObject`) para parsear la intencion y mostrar tarjeta de confirmacion antes de crear
- [x] Endpoint `POST /api/ai/recordatorio` — extrae titulo, categoria, fecha, hora, recurrencia y regla RRULE desde texto libre
- [x] Server action `crearRecordatorioDesdeIA` — crea cualquier tipo de recordatorio desde datos parseados por IA
- [x] Resumen diario por push notification — toggle en Settings para recibir una notificacion matutina con los recordatorios del dia
- [x] Cron `/api/cron/resumen-diario` ejecutado cada hora en Vercel — envia a usuarios configurados segun su hora preferida
- [x] Funcion `enviarResumenDiario` en push.service.ts
- [x] Schema DB: columnas `daily_summary` y `summary_hour` en tabla `profiles` — migracion en `src/db/migrations/0002_magical_maddog.sql` (aplicar manualmente en Supabase)
- [x] Background Sync en Service Worker — guarda mutaciones fallidas en IndexedDB y las reintenta cuando vuelve la conexion
- [x] API routes excluidas del cache del Service Worker para garantizar datos frescos
- [x] Shortcuts en manifest.json — accesos rapidos a "Nuevo recordatorio", "Pomodoro" y "Calendario" desde el icono instalado
- [x] `display_override: window-controls-overlay` en manifest.json para mejor integracion en Windows

**Done when:** Puedo crear un recordatorio escribiendo "cumpleanos de Maria el 20 de junio", buscarlo con Ctrl+K, y recibir un resumen push cada manana con mis pendientes del dia.

---

## Fase 8: Reestructuracion de Lanzamientos

**Objetivo:** dividir lanzamientos por tipo (pelicula, serie, videojuego, album, libro) con UI y prompts especificos, hub unificado en `/lanzamientos`, soporte para libros y formulario manual. Refactor mayor: cambia el modelo de datos (5 categorias en lugar de 1), la capa de IA (prompts y tools por tipo), las APIs externas (anade Google Books) y la navegacion (hub con tabs en sidebar).

- [ ] Migracion `0003_lanzamientos.sql`: INSERT categorias `tv`, `games`, `music`, `books`; renombrar `movies` a "Peliculas"; reasignar `category_id` de recordatorios existentes segun `metadata->>'tipo'`
- [ ] Actualizar `src/db/seed.ts` y `src/lib/utils/constants.ts` (`CATEGORIAS`, `SLUGS_VALIDOS`, nueva constante `SLUGS_LANZAMIENTO`)
- [ ] Extender `TIPOS_LANZAMIENTO` con `book` y `FUENTES_LANZAMIENTO` con `google_books`; actualizar etiquetas
- [ ] Agregar campo `autor?` opcional en `ResultadoLanzamiento` (`src/types/release.types.ts`)
- [ ] Nuevo `src/lib/services/google-books.service.ts` con `buscarLibro(titulo, autor?)`
- [ ] Extender `src/lib/services/release-search.service.ts` con routing para `book`
- [ ] Actualizar `src/lib/ai/tools.ts` (`buscarLanzamientoTool` con `autor`, `inputAgregarSchema` con `book` y `googleBooksId`)
- [ ] Enriquecer `PROMPT_SISTEMA_LANZAMIENTOS` con reglas por tipo (artista para album, autor para libro)
- [ ] Renombrar `src/components/features/movies/` -> `src/components/features/lanzamientos/`
- [ ] Nueva ruta `src/app/(dashboard)/lanzamientos/page.tsx` (hub con tabs Peliculas | Series | Videojuegos | Musica | Libros)
- [ ] Nuevo componente `formulario-manual-lanzamiento.tsx` (dialog con campos por tipo)
- [ ] Actualizar `src/components/features/sidebar.tsx`: filtrar slugs de lanzamiento y agregar entrada hardcoded `Lanzamientos`
- [ ] Borrar `src/app/(dashboard)/movies/page.tsx`
- [ ] Actualizar `AtribucionFuentes` con Google Books

**Done when:** Puedo preguntar al chat IA por una pelicula, serie, videojuego, album o libro y agendar cada uno en su tab correcta. Puedo anadir manualmente cualquier tipo desde un boton. El sidebar muestra una unica entrada `Lanzamientos`.

---

## Fase 9: Categoria Notas (historial de archivos individuales)

**Objetivo:** las notas se manejan como archivos individuales en un historial (estilo Google Keep / Apple Notes), no como un unico documento. Cada nota tiene su propio titulo, cuerpo y opcionalmente fecha de recordatorio. La vista principal es un grid/lista de tarjetas; clic en una nota abre su contenido completo. Cambia el schema (`due_date` y `notify_at` se vuelven nullable), introduce nuevos patrones de UI (vista detalle, editor dedicado) y abre la puerta a la Fase 16 (multimedia).

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
