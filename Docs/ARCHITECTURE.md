# ARCHITECTURE — Noti

## Estructura de carpetas (resumen)

```
src/
├── app/
│   ├── (auth)/              login, register
│   ├── (dashboard)/
│   │   ├── inicio/          Dashboard principal
│   │   ├── calendar/        Vistas mes/semana
│   │   ├── lanzamientos/    Hub con tabs por tipo (movies/tv/games/music/books)
│   │   ├── notes/           Grid de tarjetas + [id] vista detalle
│   │   └── settings/        Perfil, notificaciones, resumen diario, auto-eliminación
│   └── api/
│       ├── push/            subscribe, action
│       ├── chat/            streamText + tools (lanzamientos)
│       ├── ai/              recordatorio (generateObject), transcribir (Whisper)
│       ├── search/          Búsqueda global
│       └── cron/            check-reminders (1min), resumen-diario (1h), limpiar-tareas (diario)
├── components/
│   ├── ui/                  shadcn primitives
│   └── features/            Componentes por dominio
│       ├── reminders/       tarjeta, formulario, lista, filtro
│       ├── asistente/       asistente-ia.tsx (separado en Fase 12)
│       ├── calendar/        vista-mes, vista-semana, dialog-dia, filtro
│       ├── lanzamientos/    chat, tarjeta-confirmacion, formulario-manual
│       ├── notas/           editor-nota, tarjeta-nota
│       └── settings/        formularios de configuración
├── lib/
│   ├── actions/             Server Actions (mutaciones)
│   ├── queries/             Queries de solo lectura
│   ├── services/            tmdb, rawg, musicbrainz, google-books, release-search, push
│   ├── ai/                  tools.ts, prompt.ts
│   ├── utils/               date, cn, constants, formato-fecha, rate-limit
│   ├── supabase/            client.ts, server.ts
│   └── validations/         schemas Zod
└── db/
    ├── schema.ts            Fuente de verdad del modelo de datos
    ├── seed.ts              Categorías iniciales
    └── migrations/          SQL aplicados vía Drizzle o manualmente en Supabase
```

## Modelo de datos (tablas principales)

```sql
profiles          -- Extiende auth.users. Campos clave: timezone, notification_advance,
                  --   daily_summary (bool), summary_hour, auto_delete_completed_tasks_days

categories        -- Fijas. Campos: id, name, slug, color, icon

reminders         -- Campos clave: id, user_id, category_id, title, description,
                  --   due_date (nullable desde Fase 9), notify_at (nullable desde Fase 9),
                  --   is_completed, completed_at, is_recurring, recurrence_rule,
                  --   release_type, image_url

push_subscriptions -- endpoint, p256dh, auth, device_name. UNIQUE(user_id, endpoint)

notification_log  -- reminder_id, user_id, status ('sent'|'failed'), sent_at

note_attachments  -- reminder_id, tipo, url, mime, tamano (Fase 16+)
```

## Flujos clave

### Push notifications
```
Browser → solicita permiso → genera suscripción VAPID → POST /api/push/subscribe
Vercel cron (cada minuto) → GET /api/cron/check-reminders
  → busca reminders con notify_at en [ahora-1min, ahora]
  → web-push a todos los endpoints del usuario
SW → recibe push → showNotification con acciones Ver/Posponer/Completar
SW → notificationclick → POST /api/push/action o abre app
```

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
    → usuario confirma con Enter → server action crearRecordatorioDesdeIA()
    → INSERT en BD. Sin APIs externas.

  [lanzamiento_especifico] / [lanzamiento_generico]
    Ej: "Lanzamiento de GTA 6", "Nuevo album de The Weeknd"
    → POST /api/asistente/candidatos con la extraccion
    → release-search.obtenerCandidatos():
        - Si tipo conocido: candidatos<X>() solo de esa fuente.
        - Si tipo desconocido (null): TODAS las fuentes en paralelo (Promise.all).
        - Para generico: proximo<X>() por tipo (futuros del artista/franquicia).
        - Cada servicio devuelve hasta 5 candidatos (no 1).
        - Deduplica por id.
        - Re-rankea por score: +3 fecha confirmada, +2 fecha futura,
          +1 coincide-titulo exacto, +0.5 tipo coincide.
        - Devuelve top 5.
    → palette renderiza CandidatoCard[] (poster, titulo, metadatos por tipo, fecha)
    → usuario navega con ↑/↓, Enter selecciona
    → Si candidato tiene tba=true o fecha null: date picker inline obligatorio
    → server action crearRecordatorioLanzamiento() → INSERT con notify_at=06:00 dia X
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

### Auto-eliminación de tareas
```
Usuario elige 7/30/90 días en /settings
Cron diario 03:00 UTC → /api/cron/limpiar-tareas
→ DELETE reminders WHERE category=tasks AND is_completed
  AND completed_at < NOW() - INTERVAL '$días days'
```

## Migraciones

Las migraciones en `src/db/migrations/` marcadas como "aplicar manualmente" se ejecutan en el SQL Editor de Supabase (afectan RLS o requieren privilegios de superusuario). Las demás se aplican con Drizzle.

| Migración | Estado |
|-----------|--------|
| 0000 | Aplicada |
| 0001_rls_policies.sql | Manual — aplicada |
| 0002_magical_maddog.sql | Manual — aplicada |
| 0003_lanzamientos.sql | **Manual — PENDIENTE en producción** |
| 0004_notas.sql | Pendiente (Fase 9) |
| 0005_note_attachments.sql | Pendiente (Fase 16) |
| 0006_auto_delete_tasks.sql | Aplicada |
