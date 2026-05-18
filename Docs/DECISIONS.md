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

**Notas como archivos individuales**
_Alternativa:_ un único documento tipo Notion donde el usuario escribe todo
_Razón:_ Permite búsqueda, filtros, recordatorios individuales por nota y extensión futura a multimedia (Fase 16).

**Auto-eliminación opt-in, desactivada por defecto**
_Alternativa:_ activada por defecto con opción de desactivar
_Razón:_ Eliminar datos silenciosamente es una mala sorpresa. El usuario debe elegirlo explícitamente.

**PWA-first, sin app nativa**
_Alternativa:_ Flutter o React Native
_Razón:_ La PWA cubre los casos de uso (push notifications reales en Android y Windows), es deployable en Vercel gratis y no requiere cuentas de developer store.

---

## Técnico

**Drizzle ORM sobre Prisma**
_Alternativa:_ Prisma
_Razón:_ Drizzle es más ligero, type-safe nativo con Supabase/Postgres y no genera un cliente pesado. Mejor para Vercel Hobby.

**Vercel Cron sobre pg_cron de Supabase para reminders**
_Alternativa:_ pg_cron en Supabase
_Razón:_ Vercel Cron tiene granularidad de 1 minuto en Hobby (necesario para `check-reminders`). pg_cron en Supabase gratis es menos predecible.

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