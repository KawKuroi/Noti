# Roadmap: Noti

## Estado actual

Fases 0–32 completadas. Releases publicados en GitHub: Windows (`app-v0.1.0`, .msi/.exe) y Android (`android-v0.1.0`, APK firmado). Fase 25 solo con verificacion manual 25.6 pendiente.
**Siguientes:** pruebas de las apps en dispositivos reales (notificacion exacta con la app cerrada).

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
- **Fase 26** — Seguridad: headers HTTP (HSTS, X-Frame-Options, CSP report-only), rate limiting distribuido con Upstash Redis (fallback memoria en dev).
- **Fase 27** — Busqueda IA robusta: allSettled + fuentesFallidas en el palette, fetch-con-timeout, throttle MusicBrainz 1 req/s, fuzzy Dice, scoring con popularidad, cache 3600, TMDB fallback de idioma, prompt con dia de semana y DD/MM.
- **Fase 28** — PWA robusta: reintento 5xx en push, watchdog del cron (Redis + aviso en /settings).
- **Fase 29** — Upgrades: date-fns 4, Zod 4, Next 16 + eslint 9 flat (middleware→proxy.ts), Tailwind 4 CSS-first, drizzle-kit 0.31.10 (Drizzle 1.0 en RC, no adoptado).
- **Fase 29.5** — Limpieza: exports muertos eliminados, warnings react-hooks 20→7, migracion 0012 housekeeping.
- **Fase 29.6** — Testing profundo: Vitest (223 unit tests en 10 suites), 2 E2E nuevos (settings, asistente), CI en GitHub Actions; bugfix en `calcularProximaOcurrencia` (offset 7 semanal) hallado por los tests.
- **Fase 32** — Descargas de las apps nativas en landing (seccion nueva) y settings (card Aplicacion), servicio github-releases (API de GitHub, cache 1 h); SEO: titulo nuevo, og:url, favicon.ico multirresolucion, descriptions ≤160.
- **Fase 33** — Refinado visual de la landing: hero compacto (chat visible en el fold), titular "Sin ruido. Sin olvidos.", strip de confianza mono, bento de features con 2 destacadas y mini-visuales, Geist Mono real, hover de cards consistente, enlace Descargas en el nav.

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

## Fase 29.6 — Sistema de testing profundo [completada]

**Objetivo:** Pasar de 4 E2E basicos a una bateria que cubra la logica critica.
**Nota:** se ejecuta en una sesion de trabajo paralela; otras sesiones NO deben tocar `tests/`, `vitest.config.ts` ni los scripts de test.

- 29.6.1 Setup Vitest + vite-tsconfig-paths; scripts `test` y `test:watch` [hecho — vitest.config.ts y primeros specs en el repo]
- 29.6.2 Unit tests (~150 casos) en `tests/unit/`: coincidencia-titulo, parsear-fecha-natural, date.utils (zonas/recurrencias/TTL — el mas critico), release-search (score/dedup/allSettled con mocks), rate-limit (fallback), fetch-con-timeout, validations Zod, esquemaExtraccion (regex recurrencia), cron-health y push.service con mocks (reintentos, 410, dedup)
- 29.6.3 E2E adicionales modestos (settings, palette) con patron skip-sin-credenciales
- 29.6.4 CI `.github/workflows/ci.yml`: lint + test + build en push/PR a main (E2E solo local)

**Done when:** `npm run test` verde, CI verde en GitHub, convencion documentada en PROJECT.md.

---

## Fase 30 — App Tauri v2: nucleo + Windows [completada — release app-v0.1.0 publicado]

> Codigo en `src-tauri/` + endpoint `/api/recordatorios/proximos` (commit adb502d).
> Falta solo: taggear `app-v0.1.0` (el CI compila y publica el .msi/.exe) y la
> prueba manual de notificacion nativa con la ventana oculta en bandeja.

**Objetivo:** App de escritorio que envuelve la web de produccion (webview, cero duplicacion de UI) y programa notificaciones locales — elimina la dependencia de cron-job.org en el PC. Reemplaza la decision "sin app nativa" (ver DECISIONS.md). Ver tambien "Apps nativas (Tauri v2)" en ARCHITECTURE.md.

**Prerequisito local:** Rust no esta instalado (`winget install Rustlang.Rustup` + toolchain MSVC); el CI compila aunque la maquina local no pueda.

- 30.1 Endpoint compartido `GET /api/recordatorios/proximos`: auth por sesion, rate limited (30/min), recordatorios con `notify_at` en proximas 48h + cumpleanos de hoy/3 dias. Query nueva en `reminder.queries.ts` con `eq(userId)` SIEMPRE
- 30.2 Scaffold `src-tauri/`: tauri.conf.json con la URL de produccion como ventana, `withGlobalTauri`, capabilities con contexto `remote` para el dominio (permisos notification/event). Iconos via `tauri icon public/icons/icon-512.png`
- 30.3 Rust (lib.rs): tray con menu Abrir/Salir, cerrar = ocultar a bandeja (proceso vivo), autostart, single-instance
- 30.4 Scheduler (script de inicializacion, solo si `window.__TAURI__`): cada 15 min y al recuperar foco consulta `/api/recordatorios/proximos` (misma sesion del webview), reconcilia timers JS y dispara notificaciones nativas con `tag = reminderId`
- 30.5 CI `tauri-release.yml` (tauri-action): `.msi`/`.exe` adjuntos al Release al taggear `app-v*`

**Done when:** Con el navegador cerrado y sin cron externo, la notificacion nativa llega desde la app en bandeja (verificado via build de CI o local).

---

## Fase 31 — App Tauri v2: Android [completada — release android-v0.1.0 publicado]

> Mismo crate que Windows; la rama Android del scheduler (init/programador.js)
> usa `schedule()` → AlarmManager. El workflow `tauri-android-release.yml` genera
> el proyecto Gradle en CI (`tauri android init`), compila, firma y publica el APK.
> Falta solo la prueba en dispositivo (recordatorio a +3 min con la app cerrada).

**Objetivo:** Recordatorios que suenan a la hora EXACTA con la app cerrada y Doze activo — lo que Web Push en Android no garantiza. Mismo `src-tauri/` que Windows.

- 31.1 `tauri android init` (genera `src-tauri/gen/android`). Entorno: Android Studio (SDK 34+, NDK) y `JAVA_HOME`; alternativa sin entorno local: compilar solo en CI
- 31.2 Permisos en el manifest: `POST_NOTIFICATIONS` (Android 13+, runtime via plugin), `SCHEDULE_EXACT_ALARM`/`USE_EXACT_ALARM` (Android 12+/13+, alarmas exactas), `RECEIVE_BOOT_COMPLETED` (reprogramar tras reinicio)
- 31.3 Scheduler movil (mismo init script, rama por plataforma): en Android NO usa timers JS (mueren con la app); usa `schedule({ at })` de tauri-plugin-notification → AlarmManager dispara con la app cerrada. Reconciliacion al abrir/foco: `pending()` → `cancel(obsoletas)` → programar nuevas. `id` numerico = hash del reminderId; `extra.url` para deep-link
- 31.4 UX anti-duplicados: con la app instalada se recomienda desactivar la suscripcion Web Push del navegador del telefono (aviso en settings; sin dedup cross-sistema en v1)
- 31.5 Build y firma: keystore self-signed (`keytool`) en secrets de GitHub (`ANDROID_KEYSTORE_B64`, `ANDROID_KEYSTORE_PASSWORD`); workflow `tauri-android-release.yml` (Java 17 + SDK/NDK + target `aarch64-linux-android`) → `tauri android build --apk` → firma con `apksigner` → APK en el Release (sideload, sin Play Store)

**Done when:** Instalar APK → login → recordatorio a +3 min → cerrar la app por completo → la notificacion llega a la hora exacta; tras reiniciar el telefono sigue llegando.
