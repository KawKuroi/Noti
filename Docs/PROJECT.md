# PROJECT — Noti

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router, `src/proxy.ts` en lugar de middleware) |
| Lenguaje | TypeScript (strict) |
| Estilos | Tailwind CSS 4 (config CSS-first en globals.css) + shadcn/ui |
| Base de datos | PostgreSQL via Supabase |
| ORM | Drizzle ORM |
| Auth | Supabase Auth (Google OAuth + email/password) |
| IA — asistente unico | Groq openai/gpt-oss-120b · AI SDK v6 · generateObject (extraccion estructurada con Zod). Sin tool calling: el LLM solo clasifica intencion; la busqueda es deterministica y los candidatos los elige el usuario. |
| Transcripción | Groq Whisper Large v3 Turbo |
| Notificaciones | Web Push API + VAPID |
| Cron | cron-job.org (check-reminders cada minuto, resumen-diario cada hora) + Vercel Cron como fallback diario (limpiar-tareas 03:00 UTC, limpiar-eliminados 04:00 UTC) |
| APIs externas | TMDB · RAWG · MusicBrainz · Google Books |
| Hosting | Vercel Hobby (gratis) |
| Validación | Zod 4 |
| Lint | eslint 9 flat config (`eslint.config.mjs`; `next lint` retirado en Next 16) |
| Testing | Vitest (unit, `tests/unit/`, `npm run test`) + Playwright (E2E, `tests/e2e/`, `npm run test:e2e`) |
| CI | GitHub Actions (`.github/workflows/ci.yml`): lint + unit tests + build en push/PR a main; E2E solo local |
| Storage | Vercel Blob (Fase 16+) |
| Rate limiting | Upstash Redis via `@upstash/ratelimit` (Fase 26+; fallback en memoria en dev) |
| Apps nativas | Tauri v2 — wrapper de la web + notificaciones locales (Windows Fase 30, Android Fase 31) |

## Restricciones no negociables

- **Tier gratuito always:** toda decisión técnica debe funcionar sin costo
- **Español primero:** toda la UI en español; inglés es iteración futura con i18n
- **PWA-first + wrapper Tauri:** la web es la fuente de verdad de la UI; las apps de Windows/Android (Fases 30/31) son wrappers Tauri v2 con notificaciones locales. No se propone Flutter/React Native (reescritura)
- **Categorías fijas:** no se pueden crear categorías custom (Fase futura)
- **Sin dependencias de mensajería:** sin Slack, WhatsApp, Telegram, email

## Convenciones de código

```
src/lib/actions/     → Server Actions (mutaciones)
src/lib/queries/     → Queries de solo lectura
src/lib/services/    → Integraciones con APIs externas
src/lib/ai/          → extractor.ts (schema Zod + prompt del asistente)
src/lib/utils/       → Utilidades puras (date, cn, rate-limit, etc.)
src/lib/validations/ → Schemas Zod
src/components/ui/   → Primitives shadcn
src/components/features/<categoria>/ → Componentes de dominio
src/db/schema.ts     → Schema Drizzle (fuente de verdad del modelo de datos)
```

- Nombres de archivos de componentes: kebab-case en español (`tarjeta-recordatorio.tsx`)
- Nombres de funciones/variables: camelCase en español (`crearRecordatorio`, `obtenerNotificaciones`)
- Toda query de `reminders` lleva `eq(reminders.userId, userId)` — sin excepción
- Toda ruta API lleva rate limiting usando `src/lib/utils/rate-limit.ts` (async — siempre con `await`)
- Cliente Redis compartido en `src/lib/utils/redis.ts` (rate limit, watchdog cron); `null` sin env vars
- Fetch a APIs externas siempre via `src/lib/utils/fetch-con-timeout.ts` (timeout 6s + 1 reintento)
- Después de cualquier mutación que cambie el dashboard: `revalidatePath('/inicio')`
- Nunca `any` en TypeScript
- Warnings react-hooks v6 (set-state-in-effect, refs, purity) estan en `warn`: los ~7 restantes son patrones de hidratacion aceptados — no agregar nuevos sin justificar

## Convenciones de testing (Fase 29.6)

- Unit tests en `tests/unit/<modulo>.test.ts` (Vitest, `vitest.config.ts` con `resolve.tsconfigPaths` para el alias `@/*`). Imports explicitos de `vitest` (sin globals).
- Solo se testea logica pura y orquestacion; la infraestructura se mockea con `vi.mock`: `web-push`, `@/db` (chains de Drizzle), `@/lib/utils/redis` y las queries (`@/lib/queries/*`). Nada de red ni DB reales en unit tests.
- Fechas deterministas: instantes UTC con `Date.UTC(...)` + zonas explicitas (Intl) para que los tests pasen en cualquier TZ (local y CI); `vi.useFakeTimers()` + `vi.setSystemTime()` cuando el codigo usa `new Date()` interno.
- E2E en `tests/e2e/*.spec.ts` (Playwright): los flujos autenticados usan el patron skip-sin-credenciales (`test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, ...)`) y nunca disparan busquedas IA reales.
- Comandos: `npm run test` (una pasada), `npm run test:watch` (desarrollo), `npm run test:e2e` (Playwright, local).

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
UPSTASH_REDIS_REST_URL     ← Fase 26+ (rate limiting; opcional en dev — fallback a memoria)
UPSTASH_REDIS_REST_TOKEN   ← Fase 26+
```
