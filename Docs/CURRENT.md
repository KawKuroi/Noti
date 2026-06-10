# CURRENT — Noti

> Refleja el estado real del proyecto hoy. El historial detallado de fases completadas vive en `git log` y en `Docs/ROADMAP.md` (one-liner por fase).
> Actualizar al empezar y al terminar cada sesion.

## Fase activa

**En progreso:** Fase 26 (Seguridad) — primera fase de la revision integral de junio 2026.
**Estado:** Fases 0-24 completadas. Fase 25 implementada; pendiente solo la verificacion manual 25.6 (puede cerrarse en paralelo). Fases 26-31 planificadas en `Docs/ROADMAP.md`.

## Revision integral (junio 2026) — resumen

Auditoria completa de seguridad, busqueda IA, notificaciones y dependencias. Conclusiones:

**Fuerte:** RLS completo + `eq(userId)` en todas las queries, middleware de auth correcto, `CRON_SECRET` timing-safe, validacion Zod, sin XSS/SSRF, arquitectura limpia, pipeline anti-alucinacion del asistente, SW maduro. `.env.local` NO esta en git (verificado).

**Flojo (ataca cada fase):** busqueda de candidatos fragil (Promise.all sin tolerancia, sin timeouts, MusicBrainz viola 1 req/s, matching sin fuzzy, fallos silenciosos) → Fase 27; rate limiting en memoria inefectivo en serverless y sin headers HTTP de seguridad → Fase 26; notificaciones limitadas estructuralmente por la PWA (cron externo, Windows con navegador cerrado, Doze) → Fases 28/30/31; majors pendientes (Next 16, Tailwind 4, Zod 4, Drizzle 1.x) → Fase 29.

## Fase 25 — notas de implementacion

Sub-fases completadas en esta sesion:
- 25.1 PNGs generados: icon-192.png, icon-512.png, icon-maskable-512.png, icon-180.png (via sharp-cli desde icon-512.svg)
- 25.2 Hook `src/hooks/use-pwa-install.ts` creado
- 25.3 Componente `src/components/features/install-prompt.tsx` creado (3 ramas: nativo / iOS 16.4+ / iOS antiguo)
- 25.4 Seccion "Aplicacion" en `/settings` con `formulario-instalacion.tsx`
- 25.5 Namespace `Instalacion` en `messages/es.json` y `messages/en.json`; SW ajustado (SVG → PNG en icon/badge)
- manifest.json y layout.tsx actualizados con PNGs
- `screenshots[]` en manifest.json poblado con los 5 PNG de `public/screenshots/` (1920x901, `form_factor: wide`). Hecho.

## Verificacion Fase 25 (25.6) — checklist de cierre

Codigo: completo y verificado (build + lint + typecheck OK). Falta solo lo manual:

1. [ ] **cron-job.org (CRITICO)** — crear los 2 jobs (ver "Pendientes manuales bloqueantes"). Validar que cada ejecucion devuelve HTTP 200 (401 = header mal puesto).
2. [ ] **Env vars en Vercel (Production):** `CRON_SECRET` (igual al header de cron-job.org), `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`, `NEXT_PUBLIC_APP_URL`.
3. [ ] **Prueba E2E Windows:** instalar via Edge/Chrome → activar notificaciones → crear recordatorio a +2 min → cerrar navegador por completo → la notificacion llega al Centro de actividades.
4. [ ] **Prueba E2E Android:** instalar via Chrome → activar notificaciones → recordatorio a +2 min → cerrar Chrome → llega al centro de notificaciones del SO.
5. [ ] **Lighthouse PWA:** DevTools → Lighthouse → categoria PWA → debe figurar como "Installable" sin errores de manifest.
6. [ ] **`npm run test:e2e`** sin regresiones.

Orden de sospecha si una notificacion no llega: (a) job en cron-job.org con respuesta != 200, (b) permiso de notificacion no concedido, (c) ahorro de bateria del SO matando el proceso en background del navegador.

## Pendientes manuales bloqueantes

- [ ] **API keys de busqueda (CRITICO — Fase 27):** `.env.local` NO tiene `TMDB_API_KEY`, `RAWG_API_KEY` ni `GROQ_API_KEY`. Verificar que existan y sean validas en Vercel → Settings → Environment Variables (sin TMDB/RAWG, las busquedas de peliculas/series/juegos fallan; ahora el palette avisa "No pude consultar X" en vez de callar). Obtenerlas: TMDB themoviedb.org/settings/api, RAWG rawg.io/apidocs, Groq console.groq.com.
- [ ] **Rotacion de secretos (Fase 26.1):** regenerar `RESEND_API_KEY` y `CRON_SECRET` (sus valores aparecieron en la transcripcion de una auditoria automatizada — precaucion, no compromiso confirmado). Actualizar `.env.local`, Vercel y el header de los jobs de cron-job.org.
- [ ] **Provisionar Upstash Redis (Fase 26.3):** Vercel Marketplace → Upstash → free tier; agrega `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` (o `KV_REST_API_*`) a las env vars.
- [ ] **Migracion 0011 (CRITICO):** aplicar `src/db/migrations/0011_notificaciones_historial_vencidos.sql` en Supabase (o `npm run db:push`). Agrega `notification_log.title/body/read_at` + indice y `profiles.auto_delete_overdue_days`. Sin esto fallan el centro de notificaciones y la autoeliminacion de vencidos.
- [ ] Agregar `BLOB_READ_WRITE_TOKEN` en Vercel → Settings → Environment Variables (obtenida en Vercel → Storage → Blob).
- [ ] **Notificaciones (CRITICO):** crear dos jobs en cron-job.org (gratis) porque Vercel Hobby solo permite crons diarios. Sin esto, las notificaciones solo se disparan ~1 vez/dia. Ver `DECISIONS.md`.
  - Job 1 — cada 1 min → `GET https://<APP_URL>/api/cron/check-reminders`, header `Authorization: Bearer <CRON_SECRET>`.
  - Job 2 — cada 1 h (minuto 0) → `GET https://<APP_URL>/api/cron/resumen-diario`, mismo header.
  - El codigo ya tolera pings retrasados/omitidos: ventana de 5 min + dedup via `notification_log` (`yaSeNotifico`), sin push duplicados.

## Notificaciones — alcance del push (ajuste reciente)

- Los recurrentes no-cumpleanos (clases semanales, etc.) NO generan push por-ocurrencia ni entran al resumen diario; solo se ven en la app. `getRecordatoriosANotificar` filtra `esRecurrente=false` y `enviarResumenDiario` descarta recurrentes. Los cumpleanos siguen por `procesarCumpleanos`.
- Los recordatorios ya vencidos al crearse/editarse no programan aviso: `calcularNotificarEn` devuelve `null` si la fecha ya paso. Se conserva el caso "vence pronto con anticipacion en el pasado" (la fecha sigue futura -> avisa ahora).
- En `/inicio` los vencidos ya no salen de primeras: van en `SeccionVencidos`, un apartado plegable colapsado al final.

## Pruebas manuales pendientes

- [ ] Fase 18 — "Lanzamiento de GTA 6 nov 19" muestra fecha 19 noviembre en la card de candidatos y permite editar todos los campos antes de confirmar.
- [ ] Fase 19 — Boton "Ver en GitHub" en hero del landing y link en footer abren el repo en nueva pestana.

## Deuda tecnica conocida

- Columna `sound_enabled` en `profiles` quedo huerfana tras retirar Pomodoro (Fase 13). Housekeeping futuro.
- Columna `image_url` en `reminders` quedo huerfana tras Fase 16 (portadas no persistentes). Housekeeping futuro.
- `/api/ai/recordatorio` ya no lo invoca el cliente. Mantener por compatibilidad; eliminar tras confirmar que nada lo usa.
