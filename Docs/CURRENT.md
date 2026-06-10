# CURRENT — Noti

> Refleja el estado real del proyecto hoy. El historial detallado de fases completadas vive en `git log` y en `Docs/ROADMAP.md` (one-liner por fase).
> Actualizar al empezar y al terminar cada sesion.

## Fase activa

**Siguiente:** verificacion manual de las apps en dispositivos (Windows y Android ya publicadas en GitHub Releases).
**Estado:** Fases 0-32 completadas y en produccion. Fase 32 (jun 10): seccion de descargas de las apps nativas en landing y settings (servicio github-releases con cache de 1 h) + ajustes SEO del reporte OG (titulo nuevo, og:url, favicon.ico, descriptions ≤160). Revision integral de junio 2026 entregada: SEO+landing, seguridad (headers + Upstash), busqueda IA robusta, PWA robusta (retry push + watchdog cron), upgrades (date-fns 4, Zod 4, Next 16 + eslint 9 flat, Tailwind 4, drizzle-kit 0.31.10 — Drizzle 1.0 sigue en RC), limpieza post-upgrades, testing profundo (Fase 29.6) y apps nativas Tauri v2 (Fases 30/31).
**Verificado en produccion (jun 10):** landing/robots/sitemap/og-image en 200, headers de seguridad activos (HSTS, CSP report-only, X-Frame-Options), crons protegidos con 401, migraciones 0011 y 0012 aplicadas en Supabase (columnas y indice confirmados por SQL).

## Fase 29.6 — notas de implementacion (esta sesion)

- 29.6.1: Vitest 4 instalado; `vitest.config.ts` con `resolve.tsconfigPaths` (soporte nativo de Vite, sin plugin); scripts `test` y `test:watch`. `calcularScore`/`deduplicar` ya estaban exportadas.
- 29.6.2: 223 unit tests en 10 suites (`tests/unit/`): coincidencia-titulo, parsear-fecha-natural, date.utils, release-search, rate-limit, fetch-con-timeout, validations, esquema-extraccion, cron-health, push.service. Todo verde; lint 0 errores; build verde.
- 29.6.3: E2E nuevos `settings.spec.ts` y `asistente.spec.ts` (patron skip-sin-credenciales; no disparan IA real).
- 29.6.4: `.github/workflows/ci.yml` (lint + test + build en push/PR a main, Node 24, env dummies para el build). Convencion documentada en `PROJECT.md`.
- **Bugfix hallado por los tests:** `calcularProximaOcurrencia` (date.utils) no alcanzaba el offset 7 en reglas semanales de un solo dia con la hora de hoy ya pasada; el fallback `addWeeks(ancla, 1)` devolvia una fecha relativa al ancla (en el pasado). Afectaba a `obtenerProximaFecha` y al avance de recurrentes en `alternarCompletado`. Corregido: el bucle ahora cubre offsets 0-7.
- CI verde en GitHub (run del commit `d60a901`). En el primer run el build fallo por `new Resend(env)` a nivel de modulo en `/api/contacto` (lanza sin key; CI no tiene secretos): corregido instanciando dentro del handler. Fase cerrada.

## Pendientes manuales bloqueantes (por criticidad)

1. [x] **API keys de busqueda (Fase 27):** `TMDB_API_KEY`, `RAWG_API_KEY` y `GROQ_API_KEY` configuradas en Vercel (jun 10). Verificacion funcional pendiente: probar una busqueda real en el palette ("avisame cuando salga X pelicula").
2. [x] **Migraciones en Supabase:** 0011 y 0012 aplicadas y verificadas por SQL (jun 10).
3. [x] **Jobs de cron-job.org:** creados y verificados (jun 10): check-reminders cada 1 min y resumen-diario cada 1 h, ambos con ejecuciones exitosas.
4. [x] **Upstash Redis (Fase 26.3):** provisionado via Vercel Marketplace (`upstash-kv-amethyst-canvas`); credenciales en `.env.local`. Confirmar que el store quedo conectado al proyecto en Vercel (las vars `KV_REST_API_URL/TOKEN` deben aparecer en Environment Variables) — `redis.ts` soporta esos nombres.
5. [ ] **Rotacion de secretos (Fase 26.1) — riesgo aceptado por ahora:** el usuario no puede regenerar `RESEND_API_KEY` ni `CRON_SECRET` por el momento. Riesgo bajo (transcripcion local); retomar cuando sea posible.
6. [ ] **Env vars de push en Vercel (verificar):** `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`, `NEXT_PUBLIC_APP_URL`, `BLOB_READ_WRITE_TOKEN`. Si el push ya funcionaba en produccion, ya estan — solo confirmar en el dashboard.
7. [x] **Releases Tauri (Fases 30/31):** publicados (jun 10) — Windows `app-v0.1.0` (.exe/.msi) y Android `android-v0.1.0` (APK firmado; el primer run fallo por falta de `npm ci` + script `tauri`, corregido en `d749e0f`). Keystore en `C:\Users\kevin\noti-android-keys\` (hacer backup; NO subir al repo). Pendiente solo la prueba en dispositivo: recordatorio a +3 min con la app cerrada.

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
