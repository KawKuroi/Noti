# PROJECT — Noti

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript (strict) |
| Estilos | Tailwind CSS + shadcn/ui |
| Base de datos | PostgreSQL via Supabase |
| ORM | Drizzle ORM |
| Auth | Supabase Auth (Google OAuth + email/password) |
| IA — asistente unico | Groq openai/gpt-oss-120b · AI SDK v6 · generateObject (extraccion estructurada con Zod). Sin tool calling: el LLM solo clasifica intencion; la busqueda es deterministica y los candidatos los elige el usuario. |
| Transcripción | Groq Whisper Large v3 Turbo |
| Notificaciones | Web Push API + VAPID |
| Cron | Vercel Cron (check-reminders cada minuto, resumen-diario cada hora, limpiar-tareas 03:00 UTC) |
| APIs externas | TMDB · RAWG · MusicBrainz · Google Books |
| Hosting | Vercel Hobby (gratis) |
| Validación | Zod |
| Storage | Vercel Blob (Fase 16+) |

## Restricciones no negociables

- **Tier gratuito always:** toda decisión técnica debe funcionar sin costo
- **Español primero:** toda la UI en español; inglés es iteración futura con i18n
- **PWA-first:** no hay app nativa, no se propone Flutter/React Native
- **Categorías fijas:** no se pueden crear categorías custom (Fase futura)
- **Sin dependencias de mensajería:** sin Slack, WhatsApp, Telegram, email

## Convenciones de código

```
src/lib/actions/     → Server Actions (mutaciones)
src/lib/queries/     → Queries de solo lectura
src/lib/services/    → Integraciones con APIs externas
src/lib/ai/          → tools.ts y prompt.ts para los modelos
src/lib/utils/       → Utilidades puras (date, cn, rate-limit, etc.)
src/lib/validations/ → Schemas Zod
src/components/ui/   → Primitives shadcn
src/components/features/<categoria>/ → Componentes de dominio
src/db/schema.ts     → Schema Drizzle (fuente de verdad del modelo de datos)
```

- Nombres de archivos de componentes: kebab-case en español (`tarjeta-recordatorio.tsx`)
- Nombres de funciones/variables: camelCase en español (`crearRecordatorio`, `obtenerNotificaciones`)
- Toda query de `reminders` lleva `eq(reminders.userId, userId)` — sin excepción
- Toda ruta API lleva rate limiting usando `src/lib/utils/rate-limit.ts`
- Después de cualquier mutación que cambie el dashboard: `revalidatePath('/inicio')`
- Nunca `any` en TypeScript

## Categorías disponibles

`birthday` · `study` · `task` · `event` · `notes` · `movies` · `tv` · `games` · `music` · `books`

Los slugs de lanzamiento (`movies`, `tv`, `games`, `music`, `books`) están agrupados en el hub `/lanzamientos`. Las notas viven en `/notes` y se muestran en el sidebar bajo el grupo "Herramientas" junto al Calendario. El resto en `/inicio`.

Notas sobre nombres visibles:
- El slug `task` muestra "Pendientes" en la UI (rename hecho en Fase 14; slug se mantiene).
- El slug `study` absorbió a `classes` en Fase 14 (ambos casos de uso se solapaban en la práctica).

## Variables de entorno requeridas

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_EMAIL
TMDB_API_KEY
RAWG_API_KEY
GROQ_API_KEY
NEXT_PUBLIC_APP_URL
CRON_SECRET
BLOB_READ_WRITE_TOKEN      ← solo Fase 16+
```
