# Roadmap: Noti

## Estado actual

Fase 7 completada. Busqueda global con Ctrl+K, asistente IA para crear recordatorios por lenguaje natural, resumen diario por push notification, Background Sync en el Service Worker y shortcuts en el manifest PWA. Pendiente manual: aplicar migracion de BD en Supabase dashboard (columnas `daily_summary` y `summary_hour` en tabla `profiles` — SQL en `src/db/migrations/0002_magical_maddog.sql`).

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

## Fase 8 (futuras mejoras)

**No priorizado — oportunidades de mejora identificadas:**

### UX / Productividad
- [ ] Dark mode — Tailwind lo soporta nativamente, impacto visual alto
- [ ] Drag & drop para reordenar recordatorios dentro de una categoria
- [ ] Optimistic updates en completar/eliminar — el item desaparece visualmente de inmediato sin esperar al servidor
- [ ] Paginacion o infinite scroll en la lista de recordatorios para usuarios con muchos items
- [ ] Atajos de teclado adicionales: `N` para nuevo recordatorio, `C` para ir al calendario

### Notificaciones y segundo plano
- [ ] PWA Widget API (Windows 11 + Android) — widget nativo en la pantalla de inicio con los proximos recordatorios del dia (experimental, requiere Edge/Chrome reciente)
- [ ] Share Target API — recibir texto desde otras apps para crear un recordatorio directamente
- [ ] Notificacion por email como fallback cuando las push notifications estan bloqueadas
- [ ] Recordatorio de cumpleanos con cuenta regresiva ("Faltan 3 dias para el cumpleanos de Juan")

### IA y contenido
- [ ] Asistente IA conversacional en el dashboard (no solo single-shot) — historial de conversacion para refinar recordatorios
- [ ] Deteccion automatica de duplicados al crear con IA — avisar si ya existe un recordatorio similar
- [ ] Integracion con mas fuentes: eventos deportivos, lanzamientos de software, estrenos de temporadas de TV
- [ ] Sugerencias de categoria inteligente al tipear en el formulario manual

### Estadisticas
- [ ] Pagina de estadisticas: recordatorios completados por semana, sesiones pomodoro, racha de dias activos, categoria mas usada
- [ ] Resumen semanal — push notification cada domingo con el resumen de la semana pasada y los proximos 7 dias

### Personalizacion
- [ ] Categorias custom — el usuario puede crear y nombrar sus propias categorias con color e icono
- [ ] Temas de color — no solo dark/light, sino paletas personalizables

### Tecnico
- [ ] Internacionalizacion (i18n) — soporte para ingles ademas de espanol
- [ ] Cache de cliente con SWR o React Query para reducir recargas al navegar entre paginas
- [ ] Full-text search con `tsvector` en PostgreSQL para busqueda mas precisa con soporte de acentos y sinonimos
- [ ] Tests E2E con Playwright para el flujo critico (crear recordatorio → recibir notificacion)
