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
| IA para lanzamientos | Groq Llama 3.3 70B Versatile via AI SDK v6 — streamText + tools | Free tier 30 RPM / 1000 req/día, streaming + tool calling |
| IA para recordatorios | Groq Llama 3.1 8B Instant via AI SDK v6 — generateObject | Extrae estructura desde lenguaje natural, free tier 30 RPM / 14.400 req/día |
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
│   │   │   ├── inicio/page.tsx        # Dashboard: próximos recordatorios + AsistenteIA
│   │   │   ├── calendar/page.tsx
│   │   │   ├── movies/page.tsx        # Chat IA para lanzamientos
│   │   │   ├── pomodoro/page.tsx
│   │   │   ├── settings/page.tsx      # Perfil, notificaciones, resumen diario
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── push/
│   │   │   │   ├── subscribe/route.ts
│   │   │   │   └── action/route.ts
│   │   │   ├── chat/route.ts          # streamText + tools para lanzamientos
│   │   │   ├── ai/
│   │   │   │   └── recordatorio/route.ts  # generateObject para lenguaje natural
│   │   │   ├── search/route.ts            # Búsqueda global de recordatorios
│   │   │   ├── cron/
│   │   │   │   ├── check-reminders/route.ts   # Cada minuto
│   │   │   │   └── resumen-diario/route.ts    # Cada hora
│   │   │   ├── pomodoro/notify/route.ts
│   │   │   └── auth/callback/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                # Primitives shadcn/ui
│   │   └── features/
│   │       ├── reminders/
│   │       │   ├── tarjeta-recordatorio.tsx
│   │       │   ├── formulario-recordatorio.tsx
│   │       │   ├── lista-recordatorios.tsx
│   │       │   ├── filtro-categorias.tsx
│   │       │   ├── boton-nuevo-recordatorio.tsx
│   │       │   └── asistente-ia.tsx       # Input lenguaje natural + tarjeta confirmación
│   │       ├── calendar/
│   │       │   ├── vista-calendario.tsx
│   │       │   ├── vista-mes.tsx
│   │       │   ├── vista-semana.tsx
│   │       │   └── dialog-dia.tsx
│   │       ├── movies/
│   │       │   ├── chat-lanzamientos.tsx
│   │       │   ├── tarjeta-confirmacion.tsx
│   │       │   ├── formulario-fecha-manual.tsx
│   │       │   └── atribucion-fuentes.tsx
│   │       ├── pomodoro/
│   │       │   ├── temporizador.tsx
│   │       │   └── configuracion-pomodoro.tsx
│   │       ├── settings/
│   │       │   ├── formulario-perfil.tsx
│   │       │   ├── formulario-anticipacion.tsx
│   │       │   ├── formulario-sonido.tsx
│   │       │   ├── formulario-resumen-diario.tsx  # Toggle resumen diario + hora
│   │       │   └── lista-dispositivos.tsx
│   │       ├── busqueda-global.tsx        # Modal Ctrl+K
│   │       ├── notification-prompt.tsx
│   │       ├── sidebar.tsx
│   │       ├── header.tsx                 # Incluye BusquedaGlobal
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
│   │   │   ├── tools.ts                   # Tools para chat lanzamientos (streamText)
│   │   │   └── prompt.ts                  # Prompts para lanzamientos y recordatorio IA
│   │   ├── services/
│   │   │   ├── tmdb.service.ts
│   │   │   ├── rawg.service.ts
│   │   │   ├── musicbrainz.service.ts
│   │   │   ├── release-search.service.ts
│   │   │   └── push.service.ts            # enviarPushAUsuario, enviarResumenDiario, ...
│   │   ├── utils/
│   │   │   ├── date.utils.ts
│   │   │   ├── cn.ts
│   │   │   ├── constants.ts
│   │   │   ├── formato-fecha.ts
│   │   │   ├── pomodoro.utils.ts
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
│   │   ├── schema.ts
│   │   ├── index.ts
│   │   ├── seed.ts
│   │   └── migrations/
│   │       ├── 0000_...sql
│   │       ├── 0001_rls_policies.sql      # Aplicar manualmente en Supabase
│   │       └── 0002_magical_maddog.sql    # Aplicar manualmente en Supabase
│   ├── types/
│   │   ├── reminder.types.ts
│   │   ├── category.types.ts
│   │   ├── user.types.ts
│   │   └── release.types.ts
│   ├── hooks/
│   │   ├── use-push-notifications.ts
│   │   └── use-pomodoro.ts
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categorías (fijas)
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,  -- 'movies', 'study', 'classes', 'birthdays', 'tasks', 'events'
  name TEXT NOT NULL,
  icon TEXT NOT NULL,         -- nombre de icono Lucide
  color TEXT NOT NULL,        -- hex color para la UI
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Recordatorios
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,     -- cuándo ocurre el evento
  notify_at TIMESTAMPTZ NOT NULL,    -- cuándo enviar la notificación
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,              -- RRULE string (ej: RRULE:FREQ=WEEKLY;BYDAY=MO)
  is_completed BOOLEAN DEFAULT false,
  tmdb_id INTEGER,                   -- referencia a TMDB para lanzamientos
  metadata JSONB,                    -- datos extra por categoría (prioridad, ubicación, etc.)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
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
[Usuario]      → escribe en /movies ("cuando sale GTA 6")
[/api/chat]    → streamText() con Groq Llama 3.3 70B + tools
[LLM]          → tool buscarLanzamiento({titulo, tipo})
[Tool]         → TMDB | RAWG | MusicBrainz según tipo
[Tool]         → devuelve ResultadoLanzamiento o { encontrado: false }
[LLM]          → si false: tool pedirFechaManual (no inventa fecha)
               → si true: responde con fecha y pide confirmación
[UI]           → renderiza <TarjetaConfirmacion> o <FormularioFechaManual>
[Usuario]      → confirma
[LLM]          → tool agregarRecordatorio
[Tool]         → crearRecordatorioLanzamiento → INSERT con notify_at = 06:00 del día
```

## Flujo del asistente IA general

```
[Usuario]      → escribe en el input del dashboard ("cita médica el viernes a las 3pm")
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

# Groq (Llama 3.3 70B + Llama 3.1 8B)
GROQ_API_KEY=gsk_...

# App
NEXT_PUBLIC_APP_URL=https://noti.vercel.app
CRON_SECRET=xxx...   # Token para proteger /api/cron/*
```

## Deployment

- **Vercel:** Push a `main` → deploy automático. Preview deployments en PRs.
- **Crons:** Configurados en `vercel.json` — `check-reminders` cada minuto (`* * * * *`), `resumen-diario` cada hora (`0 * * * *`). Ambos protegidos con `Authorization: Bearer CRON_SECRET`.
- **Migraciones manuales:** Las migraciones en `src/db/migrations/` marcadas como "aplicar manualmente" se ejecutan en el SQL Editor de Supabase porque afectan RLS o requieren privilegios de superusuario.
- **Dominio:** `noti-seven-peach.vercel.app` (gratis) o dominio custom si se tiene.
