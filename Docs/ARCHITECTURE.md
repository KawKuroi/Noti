# Arquitectura: Noti

## Stack tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend | Next.js 15 (App Router) | SSR, API routes, PWA support, deploy en Vercel gratis |
| Lenguaje | TypeScript | Type safety, mejor DX, estándar de la industria |
| Estilos | Tailwind CSS | Consistente con diseño minimalista, utility-first |
| UI Components | shadcn/ui | Componentes accesibles, minimalistas, personalizables |
| Base de datos | PostgreSQL (Supabase) | Relacional, gratis, pg_cron integrado |
| ORM | Drizzle ORM | Type-safe, ligero, excelente con Supabase/Postgres |
| Autenticación | Supabase Auth | Google OAuth + email/password, gratis hasta 50K MAU |
| Cron Jobs | Vercel Cron | Cron cada minuto para recordatorios, cada hora para resumen diario |
| Notificaciones | Web Push API + VAPID | Push nativo en Android y Windows, $0 |
| API de películas/series | TMDB API | Gratis, 40 req/10s, soporta preferencia regional CO |
| API de videojuegos | RAWG.io | Gratis, 20.000 req/mes, base de datos amplia |
| API de música | MusicBrainz | Sin API key, 1 req/s, datos estructurados de releases |
| API de libros | Google Books API | Gratis sin clave obligatoria, cobertura amplia con ISBN, autor y fecha (introducida en Fase 8) |
| IA para lanzamientos | Groq Llama 3.3 70B Versatile via AI SDK v6 — streamText + tools | Free tier 30 RPM / 1000 req/día, streaming + tool calling. Evaluar `qwen3-32b` o `kimi-k2-instruct-0905` para mejor tool calling (Fase 10) |
| IA para recordatorios | Groq Llama 3.1 8B Instant via AI SDK v6 — generateObject | Extrae estructura desde lenguaje natural, free tier 30 RPM / 14.400 req/día |
| Transcripción de audio | Groq Whisper Large v3 Turbo | Speech-to-text en español, free tier amplio, baja latencia (Fase 14) |
| Storage de adjuntos | Vercel Blob | Hasta 1 GB en tier gratuito, integración nativa con Next.js (Fase 16) |
| Hosting | Vercel (Hobby) | Deploy automático, CDN global, gratis para uso personal |
| Validación | Zod | Validación de schemas en runtime, integra con TypeScript |
| Toasts | Sonner | Notificaciones UI globales |

## Estructura de carpetas

```
noti/
├── public/
│   ├── manifest.json          # PWA manifest (shortcuts, display_override)
│   ├── sw.js                  # Service Worker (push, Background Sync, cache)
│   └── icons/                 # Íconos PWA (192x192, 512x512 SVG)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── inicio/page.tsx        # Dashboard: próximos recordatorios (AsistenteIA se separa en Fase 12)
│   │   │   ├── calendar/page.tsx      # Vistas mes/semana con filtro por categoría (Fase 11)
│   │   │   ├── lanzamientos/page.tsx  # Hub con tabs Películas/Series/Juegos/Música/Libros (Fase 8, reemplaza movies/)
│   │   │   ├── notes/                 # Categoría Notas (Fase 9)
│   │   │   │   ├── page.tsx           # Grid de tarjetas
│   │   │   │   └── [id]/page.tsx      # Vista detalle / editor
│   │   │   ├── settings/page.tsx      # Perfil, notificaciones, resumen diario, auto-eliminación tareas (Fase 13)
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── push/
│   │   │   │   ├── subscribe/route.ts
│   │   │   │   └── action/route.ts
│   │   │   ├── chat/route.ts          # streamText + tools para lanzamientos (refinado en Fase 10)
│   │   │   ├── ai/
│   │   │   │   ├── recordatorio/route.ts  # generateObject para lenguaje natural
│   │   │   │   └── transcribir/route.ts   # Whisper transcription (Fase 14)
│   │   │   ├── search/route.ts            # Búsqueda global de recordatorios
│   │   │   ├── cron/
│   │   │   │   ├── check-reminders/route.ts   # Cada minuto
│   │   │   │   ├── resumen-diario/route.ts    # Cada hora
│   │   │   │   └── limpiar-tareas/route.ts    # Diario, 03:00 UTC (Fase 13)
│   │   │   └── auth/callback/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                # Primitives shadcn/ui
│   │   └── features/
│   │       ├── reminders/
│   │       │   ├── tarjeta-recordatorio.tsx   # Muestra aviso "Se eliminará en X días" para tareas (Fase 13)
│   │       │   ├── formulario-recordatorio.tsx # Toggle Recordarme para notas (Fase 9)
│   │       │   ├── lista-recordatorios.tsx
│   │       │   ├── filtro-categorias.tsx
│   │       │   └── boton-nuevo-recordatorio.tsx
│   │       ├── asistente/                # Asistente IA separado del flujo principal (Fase 12)
│   │       │   └── asistente-ia.tsx      # Antes en reminders/; se invoca desde header / FAB / ruta dedicada
│   │       ├── calendar/
│   │       │   ├── vista-calendario.tsx
│   │       │   ├── vista-mes.tsx
│   │       │   ├── vista-semana.tsx
│   │       │   ├── dialog-dia.tsx
│   │       │   └── filtro-calendario.tsx # Pills multi-select por categoría (Fase 11)
│   │       ├── lanzamientos/             # Antes movies/ (renombrado en Fase 8)
│   │       │   ├── chat-lanzamientos.tsx
│   │       │   ├── tarjeta-confirmacion.tsx
│   │       │   ├── formulario-fecha-manual.tsx
│   │       │   ├── formulario-manual-lanzamiento.tsx  # Crear sin chat IA (Fase 8)
│   │       │   └── atribucion-fuentes.tsx  # Incluye Google Books (Fase 8)
│   │       ├── notas/                    # Editor y tarjetas de notas (Fase 9)
│   │       │   ├── editor-nota.tsx
│   │       │   └── tarjeta-nota.tsx
│   │       ├── settings/
│   │       │   ├── formulario-perfil.tsx
│   │       │   ├── formulario-anticipacion.tsx
│   │       │   ├── formulario-resumen-diario.tsx  # Toggle resumen diario + hora
│   │       │   ├── formulario-auto-delete-tareas.tsx  # Select 7/30/90/Nunca (Fase 13)
│   │       │   └── lista-dispositivos.tsx
│   │       ├── busqueda-global.tsx        # Modal Ctrl+K
│   │       ├── notification-prompt.tsx
│   │       ├── sidebar.tsx                # Hub Lanzamientos hardcoded (Fase 8), sin Pomodoro (Fase 15)
│   │       ├── header.tsx                 # Incluye BusquedaGlobal y botón asistente IA (Fase 12)
│   │       └── registrar-sw.tsx
│   ├── lib/
│   │   ├── actions/
│   │   │   ├── reminder.actions.ts        # crearRecordatorio, crearRecordatorioDesdeIA, ...
│   │   │   ├── notification.actions.ts    # anticipacion, sonido, resumenDiario, posponer, ...
│   │   │   ├── push-subscription.actions.ts
│   │   │   └── user.actions.ts
│   │   ├── queries/
│   │   │   ├── reminder.queries.ts        # incluye buscarRecordatorios (ilike)
│   │   │   ├── category.queries.ts
│   │   │   ├── push.queries.ts
│   │   │   └── user.queries.ts            # incluye getPerfilesConResumenDiario
│   │   ├── ai/
│   │   │   ├── tools.ts                   # Tools para chat lanzamientos (streamText), extendido con `book` (Fase 8)
│   │   │   └── prompt.ts                  # Prompts por tipo (película/serie/juego/álbum/libro), refinado en Fase 10
│   │   ├── services/
│   │   │   ├── tmdb.service.ts
│   │   │   ├── rawg.service.ts            # Manejo TBA + aliases + doble pasada (Fase 10)
│   │   │   ├── musicbrainz.service.ts     # Doble pasada precisa/fuzzy + escape Lucene (Fase 10)
│   │   │   ├── google-books.service.ts    # Búsqueda de libros con Google Books API (Fase 8)
│   │   │   ├── release-search.service.ts  # Routing por tipo + retry cross-source (Fase 10)
│   │   │   └── push.service.ts            # enviarPushAUsuario, enviarResumenDiario, ...
│   │   ├── utils/
│   │   │   ├── date.utils.ts
│   │   │   ├── cn.ts
│   │   │   ├── constants.ts               # CATEGORIAS extendidas (notes + 5 tipos lanzamiento), SLUGS_LANZAMIENTO, OPCIONES_AUTO_DELETE_TAREAS
│   │   │   ├── formato-fecha.ts
│   │   │   └── rate-limit.ts
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── auth.ts
│   │   └── validations/
│   │       ├── reminder.schemas.ts
│   │       ├── push.schemas.ts
│   │       └── user.schemas.ts
│   ├── db/
│   │   ├── schema.ts                       # due_date y notify_at nullable (Fase 9); completed_at (Fase 13)
│   │   ├── index.ts
│   │   ├── seed.ts                         # Categorías ampliadas (notes + 5 tipos lanzamiento)
│   │   └── migrations/
│   │       ├── 0000_...sql
│   │       ├── 0001_rls_policies.sql        # Aplicar manualmente en Supabase
│   │       ├── 0002_magical_maddog.sql      # Aplicar manualmente en Supabase
│   │       ├── 0003_lanzamientos.sql        # 5 categorías de lanzamiento (Fase 8)
│   │       ├── 0004_notas.sql               # Categoría notas + nullable due_date/notify_at (Fase 9)
│   │       ├── 0005_note_attachments.sql    # Tabla note_attachments (Fase 16.A)
│   │       └── 0006_auto_delete_tasks.sql   # completed_at + auto_delete_completed_tasks_days (Fase 13)
│   ├── types/
│   │   ├── reminder.types.ts                # Date | null en fechas (Fase 9); completedAt (Fase 13)
│   │   ├── category.types.ts
│   │   ├── user.types.ts                    # autoDeleteTareasCompletadasDias (Fase 13)
│   │   └── release.types.ts                 # `book` en TipoLanzamiento, `autor` opcional (Fase 8)
│   ├── hooks/
│   │   ├── use-push-notifications.ts
│   │   └── use-audio-recorder.ts            # MediaRecorder para Whisper (Fase 14) y notas de audio (Fase 16.B)
│   └── middleware.ts
├── Docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   └── ROADMAP.md
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── vercel.json                # Cron jobs: check-reminders (cada minuto), resumen-diario (cada hora)
```

## Capas y reglas de imports

```
components/ui/        → solo importa de sí mismo y lib/utils
components/features/  → puede importar de ui/, lib/queries, lib/actions, lib/utils, hooks/, types/
lib/actions/          → única capa que puede mutar DB (INSERT, UPDATE, DELETE)
lib/queries/          → solo lectura de DB (SELECT)
lib/services/         → lógica de integración externa (TMDB, RAWG, MusicBrainz, Web Push)
lib/ai/               → tools + prompt para el chat; puede importar de lib/services y lib/actions
lib/supabase/         → configuración de cliente, no importa nada de la app
db/                   → no importa nada de la app, solo Drizzle + tipos SQL
types/                → no importa nada, solo exporta interfaces
hooks/                → puede importar de lib/queries, lib/actions, types/
```

## Reglas críticas

- NUNCA usar `fetch` directo en componentes server → usar queries de `lib/queries/`
- NUNCA exportar tipos de Drizzle directo → crear interfaces en `types/`
- NUNCA usar `'use client'` sin necesidad real (interactividad, hooks de browser)
- NUNCA hardcodear strings de UI → usar constantes en `lib/utils/constants.ts`
- NUNCA almacenar VAPID private key en el frontend → solo en variables de entorno del server
- SIEMPRE validar input con Zod antes de mutar DB
- SIEMPRE usar `revalidatePath` después de mutaciones para refrescar datos
- NUNCA cachear API routes en el Service Worker → los datos deben ser siempre frescos

## Schema de base de datos

```sql
-- Perfiles (extendido de Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  timezone TEXT DEFAULT 'America/Bogota',
  notification_advance INTEGER DEFAULT 15,  -- minutos antes
  sound_enabled BOOLEAN DEFAULT true,
  daily_summary BOOLEAN DEFAULT false,       -- resumen diario habilitado
  summary_hour TEXT DEFAULT '07:00',         -- hora del resumen (HH:MM UTC)
  auto_delete_completed_tasks_days INTEGER,  -- 7/30/90 o NULL (nunca) -- Fase 13
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categorías (fijas) -- Fase 8 amplía a: movies, tv, games, music, books; Fase 9 añade notes
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,  -- 'movies', 'tv', 'games', 'music', 'books', 'notes', 'study', 'classes', 'birthdays', 'tasks', 'events'
  name TEXT NOT NULL,
  icon TEXT NOT NULL,         -- nombre de icono Lucide
  color TEXT NOT NULL,        -- hex color para la UI
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Recordatorios -- Fase 9: due_date y notify_at se vuelven nullable para notas
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,              -- cuándo ocurre el evento; NULL permitido para notas sin fecha
  notify_at TIMESTAMPTZ,             -- cuándo enviar la notificación; NULL si no notifica
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,              -- RRULE string (ej: RRULE:FREQ=WEEKLY;BYDAY=MO)
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,          -- se llena al marcar completada; NULL al desmarcar (Fase 13)
  tmdb_id INTEGER,                   -- referencia a TMDB para lanzamientos
  metadata JSONB,                    -- datos extra por categoría (prioridad, ubicación, autor, artista, etc.)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Adjuntos de notas (Fase 16.A) -- almacenados en Vercel Blob
CREATE TABLE note_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,                -- 'image', 'audio', 'document', 'video'
  url TEXT NOT NULL,                 -- URL pública o firmada del blob
  mime TEXT NOT NULL,
  tamano INTEGER NOT NULL,           -- bytes
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Suscripciones push
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Log de notificaciones
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID REFERENCES reminders(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL,              -- 'sent', 'failed'
  sent_at TIMESTAMPTZ DEFAULT now(),
  error_message TEXT
);

-- Índices
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_notify_at ON reminders(notify_at);
CREATE INDEX idx_reminders_category ON reminders(category_id);
CREATE INDEX idx_reminders_due_date ON reminders(due_date);
CREATE INDEX idx_reminders_completed_at ON reminders(completed_at) WHERE is_completed = true;  -- Fase 13 (índice parcial)
CREATE INDEX idx_note_attachments_reminder ON note_attachments(reminder_id);  -- Fase 16.A
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);
```

## Flujo de notificaciones push

```
[Browser]   → Service Worker registrado al instalar PWA
[Browser]   → Solicita permiso de notificación
[Browser]   → Genera suscripción con VAPID public key
[Browser]   → POST /api/push/subscribe → se guarda en push_subscriptions
[Vercel]    → Cron cada minuto: GET /api/cron/check-reminders
[Server]    → busca reminders con notify_at en la ventana [ahora-1min, ahora]
[Server]    → envía Web Push con web-push a todos los endpoints del usuario
[SW]        → recibe push → showNotification con acciones Ver/Posponer/Completar
[SW]        → notificationclick → POST /api/push/action o abre la app
[Vercel]    → Cron cada hora: GET /api/cron/resumen-diario
[Server]    → busca usuarios con daily_summary=true y summary_hour == horaUTC actual
[Server]    → para cada usuario: obtiene recordatorios del día y envía push resumen
```

## Flujo de Background Sync

```
[Browser]   → intenta POST /api/... y falla por sin conexión
[SW fetch]  → captura el fallo, guarda {url, método, cuerpo} en IndexedDB
[SW]        → registra evento 'sync-recordatorios' via BackgroundSync API
[Browser]   → cuando vuelve la conexión, dispara el evento 'sync'
[SW sync]   → lee operaciones pendientes de IndexedDB
[SW sync]   → reintenta cada operación; si todas exitosas, limpia IndexedDB
```

## Flujo de chat IA para lanzamientos

```
[Usuario]      → en /lanzamientos escribe o dicta ("cuando sale GTA 6")
[/api/chat]    → streamText() con Groq + tools (stopWhen=8 desde Fase 10)
[LLM]          → infiere tipo (movie | tv | game | album | book) y tool buscarLanzamiento({titulo, tipo, artista?, autor?})
[Tool]         → release-search.service enruta a TMDB | RAWG | MusicBrainz | Google Books según tipo
[Tool]         → (Fase 10) limpia título, prueba alias, doble pasada precisa/relajada, retry cross-source si null
[Tool]         → devuelve ResultadoLanzamiento (incluso TBA con fecha aproximada) o { encontrado: false }
[LLM]          → si false: SIEMPRE llama pedirFechaManual (no inventa fecha)
               → si true: responde con fecha y pide confirmación
[UI]           → renderiza <TarjetaConfirmacion> o <FormularioFechaManual>
                 también disponible "Añadir manualmente" sin pasar por chat (Fase 8)
[Usuario]      → confirma
[LLM]          → tool agregarRecordatorio (acepta book con autor + googleBooksId)
[Tool]         → crearRecordatorioLanzamiento → INSERT con notify_at = 06:00 del día y category según tipo
```

## Flujo del asistente IA general

```
[Usuario]      → invoca el asistente IA (header / FAB / ruta dedicada — Fase 12)
[Usuario]      → escribe o dicta ("cita médica el viernes a las 3pm")
[AsistenteIA]  → POST /api/ai/recordatorio con {texto, fechaHoy}
[/api/ai/rec.] → generateObject() con Groq Llama 3.1 8B Instant
[LLM]          → extrae {titulo, categoriaSlug, fechaVencimiento, horaVencimiento,
                          descripcion, esRecurrente, reglaRecurrencia}
[API]          → devuelve objeto estructurado (sin streaming)
[AsistenteIA]  → muestra tarjeta de confirmación con los datos parseados
[Usuario]      → confirma
[AsistenteIA]  → llama server action crearRecordatorioDesdeIA → INSERT en DB
[Next.js]      → revalidatePath('/inicio') → dashboard se actualiza
```

## Flujo de transcripción de audio (Fase 14)

```
[Usuario]      → pulsa botón micrófono en el asistente IA o el chat de lanzamientos
[Browser]      → solicita permiso de micrófono (primera vez)
[MediaRecorder]→ graba como audio/webm hasta que el usuario suelta el botón
[useAudioRec.] → expone blob al componente cliente
[Cliente]      → POST FormData a /api/ai/transcribir con el blob
[API]          → groq.audio.transcriptions.create({ model: 'whisper-large-v3-turbo', file })
[API]          → devuelve { texto: string }
[Cliente]      → rellena el input con el texto transcrito; el usuario revisa y envía normal
```

## Flujo de auto-eliminación de tareas (Fase 13)

```
[Usuario]      → en /settings elige "A los 30 días" para auto-eliminación
[Server action]→ UPDATE profiles SET auto_delete_completed_tasks_days = 30
[Usuario]      → marca una tarea como completada
[alternarComp.]→ UPDATE reminders SET is_completed = true, completed_at = NOW()
[Vercel]       → Cron diario 03:00 UTC: GET /api/cron/limpiar-tareas
[Server]       → DELETE FROM reminders WHERE category=tasks AND is_completed
                 AND completed_at < NOW() - INTERVAL '$días days'
                 (por cada perfil con auto_delete_completed_tasks_days IS NOT NULL)
[Tarjeta UI]   → muestra "Se eliminará en X días" calculado sobre completed_at + días
```

## Variables de entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
DATABASE_URL=postgresql://postgres.xxx:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BNx...
VAPID_PRIVATE_KEY=xxx...
VAPID_EMAIL=mailto:tu@email.com

# APIs de contenido
TMDB_API_KEY=xxx...
RAWG_API_KEY=xxx...
# MusicBrainz no requiere API key
# Google Books no requiere API key obligatoria (introducida en Fase 8)

# Groq (Llama 3.3 70B + Llama 3.1 8B + Whisper Large v3 Turbo desde Fase 14)
GROQ_API_KEY=gsk_...

# Vercel Blob (Fase 16: notas multimedia)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# App
NEXT_PUBLIC_APP_URL=https://noti.vercel.app
CRON_SECRET=xxx...   # Token para proteger /api/cron/*
```

## Deployment

- **Vercel:** Push a `main` → deploy automático. Preview deployments en PRs.
- **Crons:** Configurados en `vercel.json` — `check-reminders` cada minuto (`* * * * *`), `resumen-diario` cada hora (`0 * * * *`), `limpiar-tareas` diario 03:00 UTC (`0 3 * * *`, Fase 13). Todos protegidos con `Authorization: Bearer CRON_SECRET`.
- **Migraciones manuales:** Las migraciones en `src/db/migrations/` marcadas como "aplicar manualmente" se ejecutan en el SQL Editor de Supabase porque afectan RLS o requieren privilegios de superusuario.
- **Dominio:** `noti-seven-peach.vercel.app` (gratis) o dominio custom si se tiene.
