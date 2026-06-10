# DECISIONS — Noti

> Log de decisiones técnicas y de producto. Consultar antes de proponer cambios.
> Formato: **Decisión** → _Alternativa descartada_ → Razón

---

## Producto

**UI español primero**
_Alternativa:_ inglés desde el inicio
_Razón:_ El usuario objetivo es hispanohablante. i18n se agrega en iteración futura cuando haya usuarios internacionales.

**Categorías fijas, no custom**
_Alternativa:_ permitir que el usuario cree sus propias categorías
_Razón:_ Simplifica la lógica de notificaciones, recurrencias y el chat IA. Categorías custom son iteración futura documentada en Fase 17+.

**IA como atajo, no sustituto del formulario manual**
_Alternativa:_ reemplazar el formulario con el asistente IA
_Razón:_ El formulario manual da control total y sirve como fallback cuando la IA falla. El asistente IA vive como acceso adicional (header/FAB) desde Fase 12.

**Anti-alucinación: nunca inventar fechas de lanzamiento**
_Alternativa:_ que el LLM infiera o estime la fecha
_Razón:_ Una fecha incorrecta en un recordatorio es peor que no tener fecha. Si la API no devuelve fecha, siempre se llama `pedirFechaManual`.

**Lanzamientos a las 06:00 hora local del día del lanzamiento**
_Alternativa:_ usar la anticipación configurable del usuario (5min/15min/etc.)
_Razón:_ Los lanzamientos no tienen hora exacta conocida — la notificación temprana tiene más valor que la precisión del minuto.

**Anticipación de notificación GLOBAL, no por recordatorio**
_Alternativa:_ un selector "Notificar (X min antes)" en cada alta/edición de recordatorio.
_Razón:_ El selector por recordatorio era confuso y causaba footguns (ej: recordatorio a +3 min con anticipación 15 → `notify_at` 12 min en el pasado → el cron nunca lo enviaba). Ahora el sistema deriva `notify_at = fechaVencimiento − anticipaciónGlobal` leyendo la anticipación única del perfil (`notification_advance`, configurable en `/settings`). Si el cálculo cae en el pasado, se hace clamp a "ahora" para que el siguiente tick del cron lo entregue. Selector eliminado del formulario manual y de la card del asistente IA.

**Cumpleaños: aviso 3 días antes y el día, a las 6:00 am hora local**
_Alternativa:_ avisar 3 y 1 día antes sin hora fija (comportamiento previo) / usar la anticipación global como cualquier recordatorio.
_Razón:_ Un cumpleaños es un evento de día completo: importa avisar con margen (3 días antes para comprar/organizar) y el mismo día, a una hora civilizada (6am local, no medianoche). Por eso los cumpleaños NO usan `notify_at` (queda `NULL`); los maneja `procesarCumpleanos`, que calcula los días en la zona del usuario (`Intl`, default America/Bogota), dispara solo desde las 6am local y deduplica con `notification_log` (una vez por día) para sobrevivir al pinger de cada minuto.

**Notas como archivos individuales**
_Alternativa:_ un único documento tipo Notion donde el usuario escribe todo
_Razón:_ Permite búsqueda, filtros, recordatorios individuales por nota y extensión futura a multimedia (Fase 16).

**Auto-eliminación opt-in, desactivada por defecto**
_Alternativa:_ activada por defecto con opción de desactivar
_Razón:_ Eliminar datos silenciosamente es una mala sorpresa. El usuario debe elegirlo explícitamente.

**Fusión `classes` dentro de `study`** _(Fase 14)_
_Alternativa:_ mantener ambas categorías separadas
_Razón:_ En el uso real "Estudio" y "Clases" se solapan (preparar examen, asistir a clase, hacer tarea) y agregan ruido al sidebar. Los casos excepcionales que no encajan se cubren con la categoría "Eventos". Una sola categoría reduce la fricción al crear y al filtrar.

**Portadas no persistentes en lanzamientos** _(Fase 16)_
_Alternativa:_ guardar la URL de la portada en BD (campo `image_url`) o subir la imagen a Vercel Blob
_Razón:_ Las URLs de imágenes externas (TMDB, RAWG, MusicBrainz, Google Books) son volátiles y pueden romperse sin aviso. Subir a Blob agrega complejidad operativa y costo. Las portadas aportan valor solo en el momento de selección (palette IA); después de guardado, el título + tipo + fecha bastan.

**Recordatorios recurrentes sin checkbox** _(Fase 14)_
_Alternativa:_ checkbox deshabilitado con tooltip explicativo
_Razón:_ Marcar como completada una "Clase de inglés los lunes" o un "Cumpleaños de Juan" no tiene semántica clara — la actividad vuelve a ocurrir. El checkbox solo aporta confusión. Las acciones útiles para recurrentes son editar y eliminar.

**Búsqueda como atajo de teclado primario** _(Fase 15)_
_Alternativa:_ mantener la barra de búsqueda fija en el top del dashboard
_Razón:_ La barra ocupaba espacio vertical en el área más valiosa del dashboard (encima de la lista de recordatorios) y duplicaba el atajo Ctrl+K. Moverla al sidebar como icono libera la pantalla y consolida la entrada única.

**Paleta de color minimalista por tipo de lanzamiento** _(Fase 16)_
_Alternativa:_ usar el mismo color (gris/negro) para todos los lanzamientos, o usar fondos coloridos completos
_Razón:_ En la pestaña "Todos" la diferenciación visual ayuda al escaneo rápido. Color como acento (borde izquierdo, badge, dot) preserva el minimalismo. Paleta elegida: Películas `#0A0A0A`, Series `#2563EB`, Juegos `#16A34A`, Música `#DC2626`, Libros `#7C3AED`.

**PWA-first, sin app nativa** _(SUPERADA en revision junio 2026 — ver "PWA + apps Tauri v2")_
_Alternativa:_ Flutter o React Native
_Razón:_ La PWA cubre los casos de uso (push notifications reales en Android y Windows), es deployable en Vercel gratis y no requiere cuentas de developer store.

**Mejorar instalación PWA antes que generar instaladores nativos** _(Fase 25; SUPERADA PARCIALMENTE — ver "PWA + apps Tauri v2")_
_Alternativa:_ PWABuilder (.msix Windows + .apk Android TWA), Tauri 2.0, o Electron
_Razón:_ El usuario quiere notificaciones nativas sin browser abierto. Una vez instalada, la PWA cubre ese caso en Android y desktop con cero overhead. PWABuilder/Tauri agregan binarios para mantener (regenerar al cambiar manifest, builds CI, hosting de archivos) sin mejorar el runtime — la app instalada y un .msix de PWABuilder corren el mismo bundle. Electron descartado por peso (~100 MB vs ~2 KB de hook). iOS sin instalador descartado por costo (Apple Dev USD 99/año); queda vía "Agregar a inicio" con instrucciones in-app.

**PWA + apps Tauri v2 (Windows y Android)** _(revision junio 2026 — Fases 30/31)_
_Alternativa:_ mantener solo PWA (decision previa) / Flutter / React Native / Electron / Capacitor
_Razón:_ La PWA instalada sigue siendo el camino principal, pero tiene limites estructurales que ningun ajuste de codigo resuelve: en Windows no llega nada con el navegador completamente cerrado salvo que el SO mantenga el proceso del browser; en Android, Doze puede retrasar Web Push 15-60 min; y todo el sistema depende de un cron externo (cron-job.org). Tauri v2 permite, con UNA base de codigo y costo cero: envolver la web de produccion (cero duplicacion de UI), bandeja del sistema + autoarranque en Windows, y scheduling local de notificaciones (AlarmManager en Android) que dispara a la hora exacta sin cron ni red. Flutter/RN descartados (reescritura completa, prohibidos en PROJECT.md); Electron por peso; Capacitor porque no cubre desktop sin Electron. La app Tauri consume el endpoint `GET /api/recordatorios/proximos` y programa notificaciones locales; el push web sigue funcionando como respaldo (dedup por `reminderId`).

---

## Técnico

**Drizzle ORM sobre Prisma**
_Alternativa:_ Prisma
_Razón:_ Drizzle es más ligero, type-safe nativo con Supabase/Postgres y no genera un cliente pesado. Mejor para Vercel Hobby.

**Pinger externo (cron-job.org) sobre Vercel Cron para `check-reminders`**
_Alternativa:_ Vercel Cron / pg_cron en Supabase
_Razón:_ CORRECCION (premisa original equivocada): Vercel Cron en Hobby **solo permite una ejecucion diaria** — expresiones mas frecuentes (`* * * * *`) fallan en el deploy, y la diaria se dispara en cualquier momento dentro de la hora. Eso rompia `check-reminders`, que necesita granularidad de minuto. Solucion en tier gratuito: un job de cron-job.org pinea `GET /api/cron/check-reminders` cada minuto con el header `Authorization: Bearer ${CRON_SECRET}`; otro job hace lo mismo cada hora con `/api/cron/resumen-diario`. La query usa ventana de 5 min + deduplicacion via `notification_log` (`yaSeNotifico`) para tolerar pings retrasados/omitidos sin enviar push duplicados. Las entradas en `vercel.json` quedan como fallback diario inofensivo (la dedup evita duplicados). Ver `ARCHITECTURE.md` (flujo Push) y `CURRENT.md` (pendiente manual).

**Groq sobre OpenAI para IA**
_Alternativa:_ OpenAI GPT-4o / GPT-4o mini
_Razón:_ Free tier de Groq suficiente para el volumen esperado; latencia baja para streaming. Evaluando `qwen3-32b` y `kimi-k2-instruct-0905` para mejorar tool calling en Fase 10.

**AI SDK v6 (Vercel) sobre llamadas directas a la API de Groq**
_Alternativa:_ fetch directo a la API de Groq
_Razón:_ `streamText` con tools y `generateObject` abstraen el manejo de streaming y schema validation. Facilita cambiar de modelo sin reescribir la integración.

**RLS en todas las tablas de Supabase**
_Alternativa:_ validar user_id solo a nivel de server action
_Razón:_ Defensa en profundidad. Si una server action filtra mal, RLS es la última línea de defensa.

**Retirar Pomodoro en Fase 15**
_Alternativa:_ mantenerlo como feature de "estudio"
_Razón:_ El Pomodoro se aleja del objetivo del producto (gestión de recordatorios) y agrega complejidad de mantenimiento. La categoría `Estudio` se mantiene desacoplada.

**Regla de búsqueda de consumidores antes de cambiar tipos globales**
_Alternativa:_ cambiar la interfaz y dejar que tsc encuentre los errores después
_Razón:_ En Fase 9 el cambio de `Date` a `Date | null` generó una cascada de
12 errores TS2769 en 4 archivos que no estaban en el plan inicial.

**Upstash Redis para rate limiting** _(revision junio 2026 — Fase 26)_
_Alternativa:_ mantener el Map en memoria de `rate-limit.ts`
_Razón:_ En Vercel serverless cada instancia tiene su propio Map: la proteccion solo aplica dentro de una instancia y se pierde entre cold starts. Upstash (via Vercel Marketplace) tiene free tier (500K comandos/mes, sobra para la escala actual) y `@upstash/ratelimit` implementa sliding window distribuido. Se conserva la firma `verificarLimite()` y un fallback en memoria cuando faltan las env vars (desarrollo local sin Redis), asi ninguna ruta cambia.

**Upgrades mayores en commits dedicados** _(revision junio 2026 — Fase 29)_
_Alternativa:_ actualizar todas las dependencias en un solo commit junto con fixes funcionales
_Razón:_ Next 16, Tailwind 4, Zod 4 y Drizzle 1.x tienen breaking changes independientes. Un commit por upgrade con verificacion completa (`build + lint + test:e2e`) permite hacer bisect y revertir sin arrastrar fixes funcionales. Orden por riesgo creciente: date-fns/@types → Zod → Next+eslint → Tailwind → Drizzle.