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

### Chat IA unificado (Fase 12)
Un solo chat global accesible desde cualquier ruta del dashboard via FAB sparkles + bottom sheet o Ctrl+I. Persistido en sessionStorage para sobrevivir cambios de ruta.

```
Usuario abre asistente (FAB / Ctrl+I) en cualquier ruta
→ POST /api/chat (streamText + tools unificadas, stopWhen=8)
→ LLM decide intencion:

  [Intencion A — recordatorio personal]
  Ej: "Cumpleanos de Marta el 21", "Clase de ingles los martes 7pm"
  → tool crearRecordatorioSimple({titulo, categoriaSlug, fechaVencimiento,
       horaVencimiento, esRecurrente, reglaRecurrencia, descripcion})
  → reusa crearRecordatorioDesdeIA() del backend
  → tras confirmacion explicita: INSERT en BD

  [Intencion B — lanzamiento con titulo especifico]
  Ej: "Lanzamiento de GTA 6", "Avatar 4"
  → tool buscarLanzamiento({titulo, tipo, artista})
  → release-search.service enruta a TMDB|RAWG|MusicBrainz|Google Books
  → Si encontrado con tba=true: TarjetaConfirmacion con badge "tentativa"
       + botón editar fecha inline antes de confirmar
  → Si encontrado=false: tool pedirFechaManual
  → Tras confirmacion: tool agregarRecordatorio → INSERT con notify_at=06:00

  [Intencion C — lanzamiento generico por franquicia/artista]
  Ej: "Nuevo album de The Weeknd", "Proximo Zelda", "Nuevo libro de Sanderson"
  → tool buscarProximoLanzamiento({tipo, contexto, esFranquicia})
  → release-search.service llama a proximoJuego / proximaPelicula / proximaSerie /
       proximoAlbum / proximoLibro segun tipo
  → Mismo flujo de confirmacion que Intencion B
```

Anti-alucinacion (Fase 12):
- RAWG ya no genera fechas falsas: si no hay `released` ni se confirma TBA, devuelve `fechaLanzamiento=null` con `tba=true` y la UI obliga al usuario a editarla.
- Validacion `coincidencia-titulo.ts`: tokeniza (normaliza acentos, equivale romano↔arabe) y descarta resultados que no coincidan en numerales (GTA 6 ya no devuelve GTA 5).
- MusicBrainz: si release-group no tiene fecha completa, fallback a `/release/`. Para "proximo album de X", buscar artist-id primero.
- Google Books: `maxResults=10` con iteracion para encontrar la primera fecha valida.

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
