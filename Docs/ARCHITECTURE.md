# Arquitectura: Noti

## Stack tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend | Next.js 14+ (App Router) | SSR, API routes, PWA support, deploy en Vercel gratis |
| Lenguaje | TypeScript | Type safety, mejor DX, estándar de la industria |
| Estilos | Tailwind CSS | Consistente con diseño minimalista, utility-first |
| UI Components | shadcn/ui | Componentes accesibles, minimalistas, personalizables |
| Base de datos | PostgreSQL (Supabase) | Relacional, gratis, pg_cron integrado |
| ORM | Drizzle ORM | Type-safe, ligero, excelente con Supabase/Postgres |
| Autenticación | Supabase Auth | Google OAuth + email/password, gratis hasta 50K MAU |
| Cron Jobs | pg_cron (Supabase) | Ejecución cada minuto, gratis, sin servidor externo |
| Edge Functions | Supabase Edge Functions | Procesamiento de notificaciones, scraping TMDB |
| Notificaciones | Web Push API + VAPID | Push nativo en Android y Windows, $0 |
| API de películas/series | TMDB API | Gratis, 40 req/10s, soporta preferencia regional CO |
| API de videojuegos | RAWG.io | Gratis, 20.000 req/mes, base de datos amplia |
| API de música | MusicBrainz | Sin API key, 1 req/s, datos estructurados de releases |
| Chat IA | Google Gemini 2.0 Flash via AI SDK v6 | Tier gratuito 1500 req/día, streaming + tools |
| Hosting | Vercel (Hobby) | Deploy automático, CDN global, gratis para uso personal |
| Validación | Zod | Validación de schemas en runtime, integra con TypeScript |
| Estado cliente | Zustand | Solo si se necesita estado global (mínimo uso) |

## Estructura de carpetas

```
noti/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service Worker
│   ├── icons/                 # Íconos PWA (192x192, 512x512)
│   └── sounds/                # Sonido de notificación (opcional)
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Layout group: login, register
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx     # Layout sin sidebar
│   │   ├── (dashboard)/       # Layout group: app autenticada
│   │   │   ├── page.tsx       # Dashboard principal
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx   # Vista calendario
│   │   │   ├── movies/
│   │   │   │   └── page.tsx   # Explorar estrenos TMDB
│   │   │   ├── pomodoro/
│   │   │   │   └── page.tsx   # Timer pomodoro
│   │   │   ├── settings/
│   │   │   │   └── page.tsx   # Configuración de perfil
│   │   │   └── layout.tsx     # Layout con sidebar + header
│   │   ├── api/
│   │   │   ├── push/
│   │   │   │   ├── subscribe/
│   │   │   │   │   └── route.ts   # Registrar suscripción push
│   │   │   │   └── action/
│   │   │   │       └── route.ts   # Acciones desde notificación push
│   │   │   ├── chat/
│   │   │   │   └── route.ts       # Endpoint streaming AI SDK + Gemini Flash
│   │   │   └── cron/
│   │   │       └── check-reminders/
│   │   │           └── route.ts   # Endpoint que revisa recordatorios pendientes
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Tailwind imports + custom vars
│   ├── components/
│   │   ├── ui/                # Primitives sin lógica (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   └── features/          # Componentes con lógica de negocio
│   │       ├── reminders/
│   │       │   ├── tarjeta-recordatorio.tsx
│   │       │   ├── formulario-recordatorio.tsx
│   │       │   └── lista-recordatorios.tsx
│   │       ├── movies/
│   │       │   ├── chat-lanzamientos.tsx
│   │       │   ├── tarjeta-confirmacion.tsx
│   │       │   ├── formulario-fecha-manual.tsx
│   │       │   └── atribucion-fuentes.tsx
│   │       ├── settings/
│   │       ├── notification-prompt.tsx
│   │       ├── sidebar.tsx
│   │       └── header.tsx
│   ├── lib/
│   │   ├── actions/           # Server actions (mutaciones)
│   │   │   ├── reminder.actions.ts
│   │   │   ├── category.actions.ts
│   │   │   └── push-subscription.actions.ts
│   │   ├── queries/           # Lectura desde DB (solo lectura)
│   │   │   ├── reminder.queries.ts
│   │   │   ├── category.queries.ts
│   │   │   ├── push.queries.ts
│   │   │   └── user.queries.ts
│   │   ├── ai/                # Capa AI (tools + prompt para el chat)
│   │   │   ├── tools.ts
│   │   │   └── prompt.ts
│   │   ├── services/          # Lógica externa
│   │   │   ├── tmdb.service.ts
│   │   │   ├── rawg.service.ts
│   │   │   ├── musicbrainz.service.ts
│   │   │   ├── release-search.service.ts
│   │   │   └── push.service.ts
│   │   ├── utils/             # Helpers puros
│   │   │   ├── date.utils.ts
│   │   │   ├── cn.ts          # Tailwind class merge helper
│   │   │   └── constants.ts
│   │   ├── supabase/
│   │   │   ├── client.ts      # Supabase client (browser)
│   │   │   ├── server.ts      # Supabase client (server)
│   │   │   └── middleware.ts  # Auth middleware
│   │   └── validations/       # Schemas Zod
│   │       ├── reminder.schema.ts
│   │       └── user.schema.ts
│   ├── db/
│   │   ├── schema.ts          # Drizzle schema completo
│   │   ├── migrations/        # Auto-generadas por Drizzle
│   │   └── seed.ts            # Datos iniciales (categorías)
│   ├── types/                 # TypeScript types compartidos
│   │   ├── reminder.types.ts
│   │   ├── category.types.ts
│   │   ├── user.types.ts
│   │   └── tmdb.types.ts
│   └── hooks/                 # React hooks custom
│       ├── use-reminders.ts
│       ├── use-push-notifications.ts
│       └── use-pomodoro.ts
├── supabase/
│   ├── functions/             # Supabase Edge Functions
│   │   └── process-notifications/
│   │       └── index.ts
│   ├── migrations/            # Migraciones SQL de Supabase
│   └── config.toml
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── vercel.json                # Cron jobs config
└── .env.local                 # Variables de entorno
```

## Capas y reglas

### Reglas estrictas de imports

```
components/ui/       → solo importa de sí mismo y lib/utils
components/features/ → puede importar de ui/, lib/queries, lib/utils, hooks/, types/
lib/actions/         → única capa que puede mutar DB (INSERT, UPDATE, DELETE)
lib/queries/         → solo lectura de DB (SELECT)
lib/services/        → lógica de integración externa (TMDB, RAWG, MusicBrainz, Web Push)
lib/ai/              → tools + prompt para el chat; puede importar de lib/services y lib/actions
lib/supabase/        → configuración de cliente, no importa nada de la app
db/                  → no importa nada de la app, solo Drizzle + tipos SQL
types/               → no importa nada, solo exporta interfaces
hooks/               → puede importar de lib/queries, lib/actions, types/
```

### Reglas críticas

- NUNCA usar `fetch` directo en componentes server → usar queries de `lib/queries/`
- NUNCA exportar tipos de Drizzle directo → crear interfaces en `types/`
- NUNCA usar `'use client'` sin necesidad real (interactividad, hooks de browser)
- NUNCA hardcodear strings de UI → usar constantes en `lib/utils/constants.ts`
- NUNCA almacenar VAPID private key en el frontend → solo en variables de entorno del server
- SIEMPRE validar input con Zod antes de mutar DB
- SIEMPRE usar `revalidatePath` después de mutaciones para refrescar datos

## Schema de base de datos

```sql
-- Users (extendido de Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  timezone TEXT DEFAULT 'America/Bogota',
  notification_advance INTEGER DEFAULT 15, -- minutos antes
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categorías (fijas en MVP, extensibles después)
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,        -- 'movies', 'study', 'classes', 'birthdays', 'tasks', 'events'
  name TEXT NOT NULL,               -- 'Películas/series', 'Estudio', etc.
  icon TEXT NOT NULL,               -- emoji o nombre de ícono
  color TEXT NOT NULL,              -- hex color para la UI
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Recordatorios
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,    -- cuándo ocurre el evento
  notify_at TIMESTAMPTZ NOT NULL,   -- cuándo enviar la notificación
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,             -- 'weekly:mon,wed,fri', 'yearly', etc.
  is_completed BOOLEAN DEFAULT false,
  tmdb_id INTEGER,                  -- solo para películas (referencia a TMDB)
  metadata JSONB,                   -- datos extra flexibles por categoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Suscripciones push (un usuario puede tener múltiples dispositivos)
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_name TEXT,                 -- 'Chrome Android', 'Chrome Windows'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Log de notificaciones enviadas
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID REFERENCES reminders(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL,             -- 'sent', 'failed', 'clicked'
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

## Patrones a seguir

### Server actions

Todas en `lib/actions/`. Una función por acción lógica. Validan input con Zod. Devuelven `{ ok: true, data }` o `{ ok: false, error }`.

```typescript
// lib/actions/reminder.actions.ts
'use server'

import { createReminderSchema } from '@/lib/validations/reminder.schema'
import { db } from '@/db/schema'

export async function createReminder(input: unknown) {
  const parsed = createReminderSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() }
  }

  try {
    const reminder = await db.insert(reminders).values(parsed.data).returning()
    revalidatePath('/')
    return { ok: true as const, data: reminder[0] }
  } catch (e) {
    return { ok: false as const, error: 'Error al crear recordatorio' }
  }
}
```

### Componentes

- Funcionales con TypeScript
- Props con `interface`, no `type`
- No `default exports` excepto en `page.tsx` y `layout.tsx`
- Componentes server por defecto, `'use client'` solo cuando hay interactividad

### Estado

- Estado de UI → `useState` local
- Estado servidor → server actions + `revalidatePath`
- Estado global cliente → Zustand (solo si es estrictamente necesario)
- NO usar Context para data, solo para themes/locale

### Notificaciones push

```
[Browser] → Service Worker registrado al instalar PWA
[Browser] → Solicita permiso de notificación al usuario
[Browser] → Genera suscripción con VAPID public key
[Browser] → Envía suscripción al server → se guarda en push_subscriptions
[pg_cron]  → Cada minuto ejecuta función que busca reminders con notify_at <= now()
[Server]  → Para cada reminder pendiente, busca push_subscriptions del usuario
[Server]  → Envía Web Push a cada endpoint con web-push library
[Browser] → Service Worker recibe push → muestra notificación nativa
```

### Flujo de chat IA para lanzamientos

```
[Usuario]      → escribe en lenguaje natural en /movies (ej: "cuando sale GTA 6")
[/api/chat]    → recibe UIMessage[], llama streamText() con Gemini 2.0 Flash
[Gemini]       → invoca tool buscarLanzamiento({titulo, tipo, artista?})
[Tool server]  → orquesta TMDB | RAWG | MusicBrainz segun tipo
[Tool server]  → devuelve ResultadoLanzamiento o { encontrado: false }
[Gemini]       → si encontrado=false: llama tool pedirFechaManual (no inventa)
              → si encontrado=true: responde con fecha y pide confirmacion
[Cliente UI]   → renderiza <TarjetaConfirmacion> con poster + botones Si/Cancelar
              → o renderiza <FormularioFechaManual> con input date
[Usuario]      → confirma o ingresa fecha manual
[Gemini]       → invoca tool agregarRecordatorio con datos estructurados
[Tool server]  → llama crearRecordatorioLanzamiento (server action)
[Server action]→ INSERT en reminders con notify_at = 06:00 del dia del lanzamiento
[pg_cron]      → /api/cron/check-reminders detecta notify_at <= now() y envia push
```

## Variables de entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BNx...
VAPID_PRIVATE_KEY=xxx...
VAPID_EMAIL=mailto:tu@email.com

# TMDB (peliculas y series)
TMDB_API_KEY=xxx...
TMDB_API_BASE_URL=https://api.themoviedb.org/3

# RAWG (videojuegos)
RAWG_API_KEY=xxx...

# Google Generative AI (chat IA con Gemini 2.0 Flash)
GOOGLE_GENERATIVE_AI_API_KEY=xxx...

# App
NEXT_PUBLIC_APP_URL=https://noti.vercel.app

# Cron Security
CRON_SECRET=xxx...
```

## Deployment

- **Vercel:** Push a `main` → deploy automático. Preview deployments en PRs.
- **Supabase:** Migraciones via CLI (`supabase db push`). Edge Functions via `supabase functions deploy`.
- **Dominio:** `noti.vercel.app` (gratis) o dominio custom si se tiene.
