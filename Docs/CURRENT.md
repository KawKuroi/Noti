# CURRENT — Noti

> Refleja el estado real del proyecto hoy. El historial detallado de fases completadas vive en `git log` y en `Docs/ROADMAP.md` (one-liner por fase).
> Actualizar al empezar y al terminar cada sesion.

## Fase activa

**Siguiente:** Fases 30/31 (apps Tauri v2 Windows/Android).
**Estado:** Fases 0-29.6 completadas y en produccion. Revision integral de junio 2026 entregada: SEO+landing, seguridad (headers + Upstash), busqueda IA robusta, PWA robusta (retry push + watchdog cron), upgrades (date-fns 4, Zod 4, Next 16 + eslint 9 flat, Tailwind 4, drizzle-kit 0.31.10 — Drizzle 1.0 sigue en RC), limpieza post-upgrades y testing profundo (Fase 29.6).

## Fase 29.6 — notas de implementacion (esta sesion)

- 29.6.1: Vitest 4 instalado; `vitest.config.ts` con `resolve.tsconfigPaths` (soporte nativo de Vite, sin plugin); scripts `test` y `test:watch`. `calcularScore`/`deduplicar` ya estaban exportadas.
- 29.6.2: 223 unit tests en 10 suites (`tests/unit/`): coincidencia-titulo, parsear-fecha-natural, date.utils, release-search, rate-limit, fetch-con-timeout, validations, esquema-extraccion, cron-health, push.service. Todo verde; lint 0 errores; build verde.
- 29.6.3: E2E nuevos `settings.spec.ts` y `asistente.spec.ts` (patron skip-sin-credenciales; no disparan IA real).
- 29.6.4: `.github/workflows/ci.yml` (lint + test + build en push/PR a main, Node 24, env dummies para el build). Convencion documentada en `PROJECT.md`.
- **Bugfix hallado por los tests:** `calcularProximaOcurrencia` (date.utils) no alcanzaba el offset 7 en reglas semanales de un solo dia con la hora de hoy ya pasada; el fallback `addWeeks(ancla, 1)` devolvia una fecha relativa al ancla (en el pasado). Afectaba a `obtenerProximaFecha` y al avance de recurrentes en `alternarCompletado`. Corregido: el bucle ahora cubre offsets 0-7.
- Pendiente unico de la fase: ver el primer run de CI verde en GitHub tras el push.

## Pendientes manuales bloqueantes (por criticidad)

1. [ ] **API keys de busqueda (CRITICO — Fase 27):** verificar `TMDB_API_KEY`, `RAWG_API_KEY` y `GROQ_API_KEY` en Vercel → Settings → Environment Variables (`.env.local` local NO las tiene). Sin TMDB/RAWG las busquedas de peliculas/series/juegos fallan; el palette ahora avisa "No pude consultar X". Obtener: themoviedb.org/settings/api · rawg.io/apidocs · console.groq.com.
2. [ ] **Migraciones en Supabase (CRITICO):** `0011_notificaciones_historial_vencidos.sql` (centro de notificaciones + auto-eliminacion de vencidos dependen de ella) y `0012_housekeeping_columnas.sql` (DROP de columnas huerfanas).
3. [ ] **Jobs de cron-job.org (CRITICO):** Vercel Hobby solo permite crons diarios. Job 1: cada 1 min → `GET /api/cron/check-reminders`; Job 2: cada 1 h → `GET /api/cron/resumen-diario`; ambos con header `Authorization: Bearer <CRON_SECRET>`. Validar HTTP 200 (401 = header mal puesto). El codigo tolera pings retrasados (ventana 5 min + dedup).
4. [ ] **Upstash Redis (Fase 26.3):** Vercel Marketplace → Upstash (free tier). Sin `UPSTASH_REDIS_REST_URL/TOKEN` el rate limiting cae al fallback en memoria y el watchdog del cron queda deshabilitado.
5. [ ] **Rotacion de secretos (Fase 26.1):** regenerar `RESEND_API_KEY` y `CRON_SECRET` (aparecieron en una transcripcion de auditoria — precaucion). Actualizar `.env.local`, Vercel y el header de cron-job.org.
6. [ ] **Env vars de push en Vercel:** `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`, `NEXT_PUBLIC_APP_URL`, `BLOB_READ_WRITE_TOKEN`.
7. [ ] **Apps Tauri (Fases 30/31):** (a) para el primer release de Windows: `git tag app-v0.1.0 && git push origin app-v0.1.0` — el workflow compila y publica el .msi/.exe; (b) para Android: crear el keystore self-signed (`keytool -genkeypair -v -keystore noti.keystore -alias noti -keyalg RSA -keysize 2048 -validity 10000`), guardarlo como secrets `ANDROID_KEYSTORE_B64` (base64) y `ANDROID_KEYSTORE_PASSWORD` en GitHub, y taggear `android-v0.1.0`; (c) opcional para compilar local: `winget install Rustlang.Rustup` (Windows) y Android Studio + NDK (Android).

## Verificacion Fase 25 (25.6) — checklist manual

1. [ ] E2E Windows: instalar PWA via Edge/Chrome → notificaciones ON → recordatorio a +2 min → cerrar navegador → llega al Centro de actividades.
2. [ ] E2E Android: igual via Chrome → llega al centro de notificaciones del SO.
3. [ ] Lighthouse PWA: "Installable" sin errores de manifest.
4. [ ] `npm run test:e2e` sin regresiones.

Orden de sospecha si no llega: (a) job cron != 200, (b) permiso no concedido, (c) ahorro de bateria del SO.

## Deuda tecnica conocida

- 7 warnings react-hooks v6 aceptados (hidratacion desde storage, deteccion de montaje/standalone, ObjectURL, Date.now en etiqueta). Regla en `warn` en eslint.config.mjs.
- Drizzle ORM se queda en 0.45.2 (latest estable); adoptar 1.0 cuando salga de RC.
- Web Push y notificaciones locales de la app Tauri pueden duplicarse en un mismo dispositivo (sin dedup cross-sistema en v1) — se documenta en settings al implementar Fase 31.
