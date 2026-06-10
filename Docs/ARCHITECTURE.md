# ARCHITECTURE — Noti

## Estructura de carpetas (resumen)

```
src/
├── proxy.ts                 Intercepta requests (Next 16; antes middleware.ts). Auth + rutas publicas
├── app/
│   ├── (auth)/              login, register (cada uno con layout.tsx propio para metadata SEO)
│   ├── (dashboard)/
│   │   ├── inicio/          Dashboard principal (rediseñado en Fase 17)
│   │   ├── calendar/        Vistas mes/semana — agrupado bajo "Herramientas" en el sidebar (Fase 15)
│   │   ├── lanzamientos/    Hub con tabs por tipo (movies/tv/games/music/books) + tab "Todos" (Fase 16)
│   │   ├── notes/           Grid de tarjetas + [id] vista detalle — agrupado bajo "Herramientas" en el sidebar (Fase 15)
│   │   └── settings/        Perfil, notificaciones (+aviso de cron caido), resumen diario, auto-eliminación, cerrar sesión
│   ├── robots.ts            SEO: indexa solo rutas publicas
│   ├── sitemap.ts           SEO: /, /login, /register
│   ├── opengraph-image.tsx  OG image dinamica via ImageResponse (next/og)
│   └── api/
│       ├── push/            subscribe, action
│       ├── asistente/       extraer (generateObject), candidatos (release-search)
│       ├── ai/              transcribir (Whisper)
│       ├── search/          Búsqueda global
│       ├── contacto/        Formulario de sugerencias (publico, rate limited)
│       ├── cron/            check-reminders (1min + ping watchdog), resumen-diario (1h), limpiar-tareas (diario), limpiar-eliminados (04:00 UTC)
│       └── auth/            recuperar (GET ?token= — restaura soft delete)
├── components/
│   ├── ui/                  shadcn primitives
│   ├── landing/             hero, features, faq, datos-estructurados (JSON-LD), data.ts
│   └── features/            Componentes por dominio
│       ├── reminders/       tarjeta, formulario, lista, filtro
│       ├── asistente/       provider, barra, command-palette (muestra fuentesFallidas + reintento)
│       ├── calendar/        vista-mes, vista-semana, dialog-dia, filtro
│       ├── lanzamientos/    hub, tarjeta-confirmacion, formulario-manual
│       ├── notas/           editor-nota, tarjeta-nota
│       └── settings/        formularios de configuración
├── lib/
│   ├── actions/             Server Actions (mutaciones)
│   ├── queries/             Queries de solo lectura
│   ├── services/            tmdb, rawg, musicbrainz, google-books, release-search, push, cron-health
│   ├── ai/                  extractor.ts (generateObject + schema Zod del asistente)
│   ├── utils/               date, cn, constants, formato-fecha, rate-limit (Upstash), redis (cliente compartido), fetch-con-timeout, coincidencia-titulo, parsear-fecha-natural
│   ├── supabase/            client.ts, server.ts
│   └── validations/         schemas Zod
├── db/
│   ├── schema.ts            Fuente de verdad del modelo de datos
│   ├── seed.ts              Categorías iniciales
│   └── migrations/          SQL aplicados vía Drizzle o manualmente en Supabase
tests/
├── unit/                    Vitest (npm run test)
└── e2e/                     Playwright (npm run test:e2e)
src-tauri/                   App nativa Tauri v2 (Fases 30/31 — Windows y Android)
```

## Sidebar (estructura visual desde Fase 15)

```
Sidebar
  ├─ Inicio
  ├─ Lanzamientos
  ├─ Pendientes
  ├─ Estudio
  ├─ Cumpleaños
  ├─ Eventos
  ├─ Lupa (icono) → abre modal Ctrl+K
  ├─ Herramientas (grupo colapsable)
  │   ├─ Calendario
  │   └─ Notas
  └─ Footer: {nombre del usuario} ⚙ (engranaje → /settings)
```

## Modelo de datos (tablas principales)

```sql
profiles          -- Extiende auth.users. Campos clave: timezone, notification_advance,
                  --   daily_summary (bool), summary_hour, auto_delete_completed_tasks_days,
                  --   deleted_at (nullable — soft delete, zona de peligro)

categories        -- Fijas. Campos: id, name, slug, color, icon.
                  -- Slug `classes` retirado en Fase 14 (fusionado en `study`).

reminders         -- Campos clave: id, user_id, category_id, title, description,
                  --   due_date (nullable desde Fase 9), notify_at (nullable desde Fase 9),
                  --   is_completed, completed_at, is_recurring, recurrence_rule,
                  --   release_type, image_url (DEPRECATED desde Fase 16 — no se escribe,
                  --   queda hasta limpieza futura), metadatos (jsonb),
                  --   deleted_at (nullable — soft delete, zona de peligro)

push_subscriptions -- endpoint, p256dh, auth, device_name. UNIQUE(user_id, endpoint)

notification_log  -- reminder_id, user_id, status ('sent'|'failed'), title, body,
                  --   read_at (nullable — centro de notificaciones), sent_at.
                  --   Tope MAX_HISTORIAL_NOTIFICACIONES por usuario (purga en cron diario).

note_attachments  -- reminder_id, tipo, url, mime, tamano (Fase 16+)

recovery_tokens   -- id, user_id, tipo ('cuenta'|'recordatorios'), token (uuid unico),
                  --   metadatos (jsonb — categorias afectadas), expires_at, created_at
```

## Flujos clave

### Push notifications
```
Browser → solicita permiso → genera suscripción VAPID → POST /api/push/subscribe
cron-job.org (cada minuto) → GET /api/cron/check-reminders
  → busca reminders con notify_at en ventana de 5 min (tolera pings perdidos)
  → web-push a todos los endpoints del usuario, con TTL = fin del día local
    (evita el backlog que FCM entregaba de golpe al reabrir el navegador) y
    urgency 'high'. Reintento 1x con backoff ante 5xx transitorio; 404/410
    invalida y elimina la suscripción. Se registra title/body en notification_log.
  → al terminar OK registra el ping en Redis (cron-health): /settings muestra
    aviso si el cron lleva >10 min sin ejecutarse.
SW → recibe push → showNotification con acciones Ver/Posponer/Completar
  → postMessage a las pestañas abiertas → la campana refresca su badge en vivo
SW → notificationclick → POST /api/push/action o abre app
```

> Cuando la PWA esta instalada (display-mode: standalone), el SO mantiene el SW activo
> en su propio scheduler — las notificaciones llegan al centro de notificaciones del SO
> con el navegador cerrado. En modo navegador requiere Chrome/Edge corriendo en background.
> Ver Fase 25 en `ROADMAP.md` para el flujo de instalacion.

### Pipeline asistente (Fase 12b — actual)
Un command palette global (Ctrl+I o FAB sparkles) que ejecuta un pipeline determinístico de 3 pasos. Persistido en sessionStorage para sobrevivir cambios de ruta.

```
Usuario abre palette y escribe texto libre
→ debounce 600ms
→ POST /api/asistente/extraer  (generateObject con openai/gpt-oss-120b via Groq)
  Schema Zod unico: { intencion, recordatorio?, lanzamiento?, aclaracion? }
  El LLM SOLO clasifica intencion y rellena campos. No elige tools, no llama APIs.

→ Ruteo deterministico segun intencion:

  [recordatorio_personal]
    Ej: "Cumpleanos de Marta el 21", "Clase de ingles los martes 7pm"
    → palette muestra RecordatorioExtraidoCard con campos extraidos
    → Si la fecha viene `null` pero el texto original contiene un token de fecha
      ("nov 19", "20/06", "3 mar", "viernes 21") aplicar parsearFechaNatural() (Fase 18).
    → usuario puede editar TODOS los campos antes de confirmar (Fase 18):
      titulo, descripcion, categoria, fecha, hora, recurrencia, dias semana,
      anticipacion, autor/artista (si aplica), tipo de lanzamiento.
    → usuario confirma con Enter → server action crearRecordatorioDesdeIA()
    → INSERT en BD. Sin APIs externas.

  [lanzamiento_especifico] / [lanzamiento_generico]
    Ej: "Lanzamiento de GTA 6", "Nuevo album de The Weeknd"
    → POST /api/asistente/candidatos con la extraccion
    → release-search.obtenerCandidatosDetallado():
        - Si tipo conocido: candidatos<X>() solo de esa fuente.
        - Si tipo desconocido (null): TODAS las fuentes con Promise.allSettled —
          una fuente caida (key ausente, timeout, 5xx) NO tumba la busqueda;
          queda reportada en fuentesFallidas y el palette muestra
          "No pude consultar X" con boton Reintentar.
        - Los servicios usan fetch-con-timeout (6s + 1 reintento) y cache
          revalidate 3600. MusicBrainz con throttle de 1 req/s (cola).
          TMDB: fallback de idioma (es-ES → sin language si 0 resultados).
        - Para generico: proximo<X>() por tipo (futuros del artista/franquicia).
        - Cada servicio devuelve hasta 5 candidatos (no 1).
        - Deduplica por id.
        - Re-rankea por score: +3 fecha confirmada, +2 fecha futura,
          +0..1 coincidencia de titulo (exacta o fuzzy Dice), +0.5 tipo
          coincide, +0..1 popularidad normalizada (TMDB popularity, RAWG added).
        - Devuelve top 5 + fuentesFallidas.
    → palette renderiza CandidatoCard[] (poster, titulo, metadatos por tipo, fecha).
      Las portadas se muestran aqui (UX visual) pero NO se persisten al guardar (Fase 16).
    → usuario navega con ↑/↓, Enter selecciona
    → Si candidato tiene tba=true o fecha null: date picker inline obligatorio
    → server action crearRecordatorioLanzamiento() → INSERT con notify_at=06:00 dia X.
      No escribe `image_url`.
    → Si el usuario edito la fecha, fuente='manual'; sino la fuente original.

  [desconocido]
    → palette muestra mensaje de aclaracion del LLM
```

Anti-alucinacion (acumulado de fase 12 + 12b):
- RAWG: si no hay `released` ni se confirma TBA, devuelve `fechaLanzamiento=null` con `tba=true` (eliminado el fallback que inventaba `${año+1}-12-31`).
- `coincidencia-titulo.ts` tokeniza (normaliza acentos, equivale romano↔arabe) y descarta resultados que no coincidan en numerales (GTA 6 ya no devuelve GTA 5).
- MusicBrainz: si release-group no tiene fecha completa, fallback a `/release/`. Para genericos, busca artist-id primero.
- Google Books: `maxResults=20` con iteracion para encontrar la primera fecha valida.
- **El usuario es el arbitro final**: el LLM nunca elige cual candidato es; solo presenta 3-5 ordenados por score.

### Background Sync
```
POST /api/* falla por sin conexión
→ SW guarda {url, método, cuerpo} en IndexedDB
→ Registra evento 'sync-recordatorios'
→ Al volver conexión: reintenta operaciones pendientes → limpia IndexedDB
```

### Auto-eliminación de tareas y vencidos
```
Usuario elige 7/30/90 días en /settings (dos reglas independientes)
Cron diario 03:00 UTC → /api/cron/limpiar-tareas
→ Tareas: DELETE reminders WHERE category=tasks AND is_completed
    AND completed_at < NOW() - INTERVAL '$auto_delete_completed_tasks_days days'
→ Vencidos: DELETE reminders WHERE NOT is_recurring AND NOT is_completed
    AND due_date < NOW() - INTERVAL '$auto_delete_overdue_days days'
    (excluye recurrentes como cumpleaños/estudio recurrente)
→ Purga notification_log más allá de MAX_HISTORIAL_NOTIFICACIONES por usuario
```

> En el hub `/inicio`, `agruparPorDia` separa los no completados con fecha pasada en un
> grupo "Vencidos" que NO se muestra en el listado superior: va en un apartado plegable
> (`SeccionVencidos`) colapsado al final del inicio. Las páginas de categoría ya tienen el
> pill "Vencidos".
>
> Notificaciones: los recurrentes (clases semanales, etc.) no generan push por-ocurrencia
> ni entran al resumen diario; solo se ven en la app (`getRecordatoriosANotificar` los
> excluye y `enviarResumenDiario` los filtra). Los cumpleaños conservan su push propio
> (`procesarCumpleanos`). Los recordatorios ya vencidos al crearse/editarse no programan
> aviso (`calcularNotificarEn` devuelve null si la fecha ya pasó).

## Apps nativas (Tauri v2 — Fases 30/31)

Arquitectura wrapper: la app Tauri carga la web de produccion en un webview
(cero duplicacion de UI) y agrega una capa nativa de notificaciones locales
que elimina la dependencia de cron-job.org en dispositivos con la app.

```
App Tauri (Windows .msi / Android .apk)
  → webview a NEXT_PUBLIC_APP_URL (sesion Supabase normal, cookies propias)
  → script de inicializacion (solo si window.__TAURI__):
      cada 15 min y al recuperar foco:
        GET /api/recordatorios/proximos (same-origin, sesion del webview)
        → Windows: reconcilia timers JS + notificacion nativa via plugin
          (la app vive en la bandeja del sistema; cerrar = ocultar)
        → Android: reconcilia notificaciones programadas con
          tauri-plugin-notification schedule({ at }) — AlarmManager:
          disparan a la hora exacta con la app CERRADA y Doze activo
  → el Web Push existente sigue funcionando como respaldo en navegadores
    (sin dedup cross-sistema en v1; se recomienda desactivar la suscripcion
    del navegador en dispositivos con la app instalada)
```

Distribucion sin tiendas: GitHub Actions (tauri-action) genera .msi/.exe y
.apk self-signed adjuntos a los Releases.

## Migraciones

Todas las migraciones viven en `src/db/migrations/`. Las marcadas como **manual** se ejecutan en el SQL Editor de Supabase porque afectan RLS o requieren privilegios de superusuario; las demas se aplican con Drizzle. El estado puntual en produccion vive en `Docs/CURRENT.md` (seccion "Pendientes manuales bloqueantes").

| Migracion | Tipo |
|---|---|
| 0000_chilly_hellfire_club.sql | Drizzle (schema base) |
| 0001_burly_peter_quill.sql | Drizzle |
| 0002_magical_maddog.sql | Manual |
| 0002_rls_policies.sql | Manual (RLS) |
| 0003_bitter_tyger_tiger.sql | Drizzle |
| 0003_lanzamientos.sql | Manual |
| 0004_notas.sql | Drizzle |
| 0006_auto_delete_tasks.sql | Manual |
| 0007_fusion_classes_study.sql | Drizzle |
| 0008_note_entries.sql | Manual |
| 0009_note_attachments.sql | Manual |
| 0010_soft_delete_cuenta.sql | Manual |
| 0011_notificaciones_historial_vencidos.sql | Drizzle (solo agrega columnas/indice) |
| 0012_housekeeping_columnas.sql | Manual (DROP de columnas huerfanas sound_enabled / image_url) |
