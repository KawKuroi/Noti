# Roadmap: Noti

## Estado actual

Fases 0–24 completadas. En progreso: **Fase 25 — Instalacion PWA nativa** (solo falta verificacion manual 25.6).
Planificadas (en orden de ejecucion): **Fases 26–31** — producto de la revision integral de junio 2026 (seguridad, busqueda IA, notificaciones robustas, upgrades, apps Tauri).

> El detalle granular de fases ya entregadas vive en `CURRENT.md` (sesiones recientes) y en `git log` (sesiones antiguas). Este archivo solo lista el titulo y el outcome para mantener bajo el coste de contexto.

---

## Historico (resumen de una linea por fase)

- **Fase 0** — Setup (PRD, Arquitectura, Roadmap, CLAUDE.md, env).
- **Fase 1** — Foundation Next.js 15 + Supabase + Drizzle + auth + PWA basica + primer deploy.
- **Fase 2** — CRUD de recordatorios con recurrencias y dashboard agrupado por dia.
- **Fase 3** — Notificaciones push (VAPID, SW, multi-dispositivo, anticipacion configurable).
- **Fase 4** — Chat IA para lanzamientos (TMDB/RAWG/MusicBrainz, AI SDK v6).
- **Fase 5** — Pomodoro + vistas mes/semana del calendario. *(Pomodoro retirado en Fase 13.)*
- **Fase 6** — Landing, perfil, gestion de dispositivos, empty states, RLS y rate limiting.
- **Fase 7** — Ctrl+K, asistente IA general, resumen diario, Background Sync.
- **Fase 8** — Reestructuracion de Lanzamientos en 5 tipos + hub `/lanzamientos` + Google Books.
- **Fase 9** — Categoria Notas con `due_date`/`notify_at` nullable.
- **Fase 10** — Refinamiento de busquedas y prompts IA.
- **Fase 11** — Bugfixes calendario + filtro por categoria.
- **Fase 12** — Refactor IA lanzamientos (RAWG fix, validacion titulo, edicion inline).
- **Fase 12b** — Pipeline IA deterministico + command palette (precision ~95%).
- **Fase 13** — Retirar Pomodoro.
- **Fase 14** — Bugfixes criticos + fusion `classes`→`study` + rename "Tareas"→"Pendientes".
- **Fase 15** — Reestructuracion del sidebar (Herramientas, lupa Ctrl+K, settings con cerrar sesion).
- **Fase 16** — Lanzamientos: tab "Todos", paleta de color por tipo, formulario completo, portadas no persistentes.
- **Fase 17** — Rediseno de `/inicio` (saludo dinamico, BarraAsistente, mini-calendario, chips).
- **Fase 18** — IA fechas naturales (`parsearFechaNatural`) + edicion inline completa.
- **Fase 19** — Landing con enlace a GitHub (hero + footer).
- **Fase 20** — Auto-eliminacion de tareas completadas (7/30/90 dias, cron 03:00 UTC).
- **Fase 21** — Entrada por audio en el asistente IA (Whisper Large v3 Turbo).
- **Fase 22** — Notas multimedia (chat WhatsApp + adjuntos imagen/audio/doc/video via Vercel Blob).
- **Fase 23** — Dark mode, optimistic updates, infinite scroll, FTS, SWR, Playwright E2E, PWA Widget API, i18n next-intl.

---

## Fase 24 — Zona de peligro [completada]

**Objetivo:** Dos funciones destructivas en `/settings` con soft delete y ventana de recuperacion de 30 dias: borrar todos los recordatorios (por categoria o todos) y borrar la cuenta completa. Ambas con verificacion textual ("ELIMINAR"), correos HTML estilizados y cron de limpieza definitiva.

### 24.1 — Base de datos [x]
- `perfiles`: campo `deleted_at` (timestamp nullable)
- `reminders`: campo `deleted_at` (timestamp nullable)
- Nueva tabla `recovery_tokens`: id, user_id, tipo, token, metadatos (jsonb), expires_at
- Migracion `0010_soft_delete_cuenta.sql` — **aplicar manualmente en Supabase**
- Tipo `Perfil` actualizado con `eliminadoEn`; `mapearPerfil` en `user.queries.ts` actualizado

### 24.2 — Server actions [ ]
- `softDeleteCuenta()`: marca `deleted_at`, genera token, envia correo, cierra sesion, redirige a `/`
- `softDeleteRecordatorios(payload)`: soft delete por categorias o todos, genera token, envia correo con categorias afectadas
- Ambas en `src/lib/actions/user.actions.ts`

### 24.3 — Endpoint de recuperacion [ ]
- `GET /api/auth/recuperar?token=...`
- Valida token, restaura `deleted_at = null` en perfil o recordatorios
- Token expirado o invalido → redirige a `/` con `?error=token-invalido`
- Token valido → redirige a `/inicio?recovered=true`

### 24.4 — Cron de limpieza definitiva [ ]
- `GET /api/cron/limpiar-eliminados`: elimina permanentemente registros con `deleted_at < NOW() - 30 dias`
- Para cuentas: `supabase.auth.admin.deleteUser()` (hace cascade)
- Cron en `vercel.json`: `0 4 * * *`

### 24.5 — Plantillas de correo HTML [ ]
- `src/lib/services/email-templates.ts`
- `plantillaRecuperacionCuenta(...)`: link de recuperacion + advertencia 30 dias
- `plantillaRecuperacionRecordatorios(...)`: lista de categorias afectadas + link de recuperacion
- HTML puro con estilos inline que imitan el tema de la app (fondo oscuro, colores de la app)

### 24.6 — Componentes UI [ ]
- `boton-borrar-recordatorios.tsx`: modal con Select de categoria + input "ELIMINAR"
- `boton-borrar-cuenta.tsx`: modal con advertencia + input "ELIMINAR"
- `settings/page.tsx`: nueva seccion "Zona de peligro" al final

### 24.7 — Filtrado de soft-deleted en queries [ ]
- `src/lib/queries/reminder.queries.ts`: filtrar `deleted_at IS NULL` en todos los queries que devuelven recordatorios al usuario

**Done when:** El usuario puede borrar recordatorios o su cuenta desde settings, recibe un correo con link de recuperacion valido 30 dias, y tras ese plazo el cron elimina los datos definitivamente.

---

## Fase 25 — Instalacion PWA nativa [en progreso]

**Objetivo:** Que el usuario pueda "descargar" Noti como app del sistema en Android y desktop (Windows/macOS/Linux) sin pasar por tiendas, para que las notificaciones push lleguen al SO aunque el navegador este cerrado. iOS 16.4+ via "Agregar a inicio".

**Decision clave:** sin PWABuilder, Tauri ni Electron — la PWA instalada usa el mismo bundle de Vercel (cero overhead). Ver `DECISIONS.md`.

### 25.1 — Iconos PNG y screenshots [ ]
- PNGs maskables 192/512 + maskable-512 (con safe area 20%) + apple-touch-icon-180 en `public/icons/`
- Generar desde `icon-512.svg` con `npx --yes sharp-cli` (sin agregar `sharp` al package.json)
- Screenshots wide (1280×720) y mobile (750×1334) en `public/screenshots/`
- `public/manifest.json`: agregar entradas PNG al array `icons` (manteniendo SVG como fallback) y poblar `screenshots[]`
- `src/app/layout.tsx:64`: apple-touch-icon → PNG

### 25.2 — Hook `use-pwa-install` [ ]
- `src/hooks/use-pwa-install.ts` siguiendo patron de `use-push-notifications.ts`
- API: `{ soportado, instalado, esIOS, esIOSSinSoportePush, instalar() }`
- Listener `beforeinstallprompt` con `preventDefault()` + guardado del evento
- `instalado` derivado de `matchMedia('(display-mode: standalone)')` + `navigator.standalone` (iOS)
- `esIOSSinSoportePush` parsea version del UA y compara < 16.4
- Sin `any` (regla CLAUDE.md): usar `navigator as unknown as { standalone?: boolean }`

### 25.3 — Banner `<InstallPrompt />` [ ]
- `src/components/features/install-prompt.tsx` analogo a `notification-prompt.tsx`
- 3 ramas: nativo (`soportado`) / iOS 16.4+ (Dialog con pasos ilustrados) / iOS antiguo (mensaje)
- Toast "Noti instalada" al aceptar
- Descarte persistido en `localStorage` con clave `noti-install-prompt-dismissed-at`, re-show a 14 dias
- Montar en `src/app/(dashboard)/inicio/page.tsx:79` ENCIMA de `<NotificationPrompt />`

### 25.4 — Seccion "Aplicacion" en /settings [ ]
- `src/components/features/settings/formulario-instalacion.tsx`
- Boton permanente "Instalar Noti" o badge "Ya instalada"
- Cumple regla de memoria "Controles de config van en /settings"

### 25.5 — i18n y ajuste de SW [ ]
- Namespace `Instalacion` en `messages/es.json` y `messages/en.json`:
  `titulo`, `descripcion`, `botonInstalar`, `botonComoInstalar`, `iosTitulo`, `iosPaso1`, `iosPaso2`, `iosPaso3`, `iosVersionAntigua`, `yaInstalada`, `instaladaExitosamente`
- `public/sw.js`: `showNotification` apunta a `/icons/icon-192.png` (Windows no renderiza SVG en el centro de notificaciones)

### 25.6 — Verificacion end-to-end [ ]
- Lighthouse PWA audit pasa de "Not installable" a "Installable"
- Desktop: instalar via Edge/Chrome → cerrar navegador → cron dispara notificacion → llega al Action Center
- Android: instalar via Chrome → cerrar navegador → cron dispara notificacion → llega al centro del SO
- iOS 16.4+: Dialog con pasos → "Agregar a inicio" → notificacion llega
- `npm run lint && npm run build` sin errores
- `npm run test:e2e` sin regresiones

**Done when:** El usuario instala Noti desde el banner o desde /settings, cierra el navegador, y recibe la notificacion push del recordatorio en el centro de notificaciones del SO con el icono PNG.

**Fuera de alcance:** generar `.apk` / `.msix` / `.ipa`, subir a tiendas, soportar iOS < 16.4.

---

## Fase 26 — Seguridad [planificada]

**Objetivo:** Endurecer la capa HTTP y el rate limiting tras la auditoria de junio 2026.

### 26.1 — Rotacion de secretos (manual)
- Regenerar `RESEND_API_KEY` (dashboard Resend) y `CRON_SECRET` (`openssl rand -base64 32`)
- Actualizar `.env.local`, Vercel env vars y el header de los 2 jobs de cron-job.org

### 26.2 — Headers de seguridad en `next.config.ts`
- HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy (microfono `self` por Whisper)
- CSP en modo Report-Only inicialmente; enforce en commit posterior si no hay violaciones

### 26.3 — Rate limiting distribuido
- `@upstash/ratelimit` + `@upstash/redis` (Vercel Marketplace, free tier)
- Reescribir `src/lib/utils/rate-limit.ts` conservando la firma `verificarLimite()`; fallback a memoria sin env vars (dev local)

### 26.4 — Verificar pertenencia en `/api/push/action`
- Confirmar que posponer/completar validan que el reminder pertenece al usuario

**Done when:** Headers visibles en produccion, 429 real bajo rafaga desde multiples instancias, secretos rotados.

---

## Fase 27 — Busqueda IA robusta [planificada]

**Objetivo:** Que la busqueda de candidatos deje de fallar en silencio y el usuario no tenga que recurrir al formulario manual.

### 27.1 — Tolerancia a fallos
- `Promise.allSettled` en `obtenerCandidatos()` (una fuente caida no tumba la busqueda)
- `fetchConTimeout()` en `src/lib/utils/`: AbortSignal 6s + 1 reintento para 5xx/red, usado por los 4 servicios

### 27.2 — Cumplir limites de las APIs
- Throttle MusicBrainz a 1 req/s (cola secuencial a nivel de modulo)
- Reducir N+1: fechas/creditos/portadas solo para candidatos finalistas
- Cache consistente: `next: { revalidate: 3600 }` en TMDB/RAWG/MusicBrainz (como Google Books)

### 27.3 — Matching y ranking
- Fuzzy matching (coeficiente Dice de bigramas, umbral ~0.75) como segundo criterio en `coincidencia-titulo.ts`
- Scoring con popularidad normalizada (TMDB `popularity`, RAWG `added`) y bonus proporcional por tokens
- TMDB: reintento sin `language` si es-ES devuelve 0 resultados

### 27.4 — Feedback al usuario
- `/api/asistente/candidatos` devuelve `{ candidatos, fuentesFallidas }`
- El palette distingue "sin resultados" de "fuente caida" y ofrece reintento

### 27.5 — Prompt del extractor
- Pasar dia de la semana actual, fijar convencion DD/MM, validar `reglaRecurrencia` con regex en el schema

**Done when:** Las 6 busquedas de prueba (GTA 6, The Weeknd, Dune 3, Sanderson, typo, fuente caida) devuelven candidatos o aviso claro.

---

## Fase 28 — Notificaciones PWA robustas [planificada]

### 28.1 — Reintento en push
- 1 reintento con backoff para 5xx transitorios en `push.service.ts`; 404/410 siguen invalidando

### 28.2 — Watchdog del cron
- Timestamp del ultimo ping OK de check-reminders (Redis de Upstash)
- Aviso en `/settings` si lleva >10 min sin ejecutarse

### 28.3 — Cierre de Fase 25 (manual)
- Migracion 0011, jobs cron-job.org, env vars Vercel, E2E Windows/Android, Lighthouse

**Done when:** Un 5xx transitorio de FCM no pierde la notificacion y el usuario ve en settings si el cron esta caido.

---

## Fase 29 — Upgrades mayores [planificada]

Un commit por upgrade, con `build + lint + test:e2e` tras cada uno. Orden:

1. date-fns 3→4 y `@types/node` 20→24 (seguros)
2. Zod 3→4 (schemas en `src/lib/validations/` y `src/lib/ai/`)
3. Next 15→16 + eslint 8→9 flat config (codemod oficial; `next lint` se retira)
4. Tailwind 3→4 (codemod `@tailwindcss/upgrade`; verificar shadcn/ui pantalla por pantalla)
5. Drizzle 0.45→1.x + drizzle-kit (revisar changelog; `db:generate` sin drift)

**Done when:** Stack en majors actuales sin regresiones E2E.

---

## Fase 30 — App Tauri v2: Windows [planificada]

**Objetivo:** App de escritorio que envuelve la web de produccion y programa notificaciones locales — elimina la dependencia de cron-job.org en el PC. Reemplaza la decision "sin app nativa" (ver DECISIONS.md).

- 30.1 Scaffold `src-tauri/` (webview a `NEXT_PUBLIC_APP_URL`)
- 30.2 Plugins: notification, autostart, system tray (cerrar = minimizar, proceso vivo)
- 30.3 Endpoint `GET /api/recordatorios/proximos` (auth, rate limited, ventana 24-48h)
- 30.4 Scheduler local: timers desde la bandeja, refresh cada ~15 min, dedup por `reminderId`
- 30.5 CI: GitHub Actions + `tauri-action` para `.msi`/`.exe` en releases

**Done when:** Con el navegador cerrado y sin cron externo, la notificacion nativa llega desde la app en bandeja.

---

## Fase 31 — App Tauri v2: Android [planificada]

- 31.1 `tauri android init` sobre el mismo `src-tauri/`
- 31.2 `tauri-plugin-notification` con scheduling (AlarmManager) — notificaciones exactas con la app cerrada
- 31.3 Mismo sync con `/api/recordatorios/proximos`; reprogramacion al abrir
- 31.4 APK self-signed en GitHub Releases (sin Play Store)

**Done when:** El recordatorio suena en Android a la hora exacta con la app cerrada y modo Doze activo.
