<div align="center">
  <!-- TODO: añadir screenshot del proyecto en funcionamiento -->

  <h1>Noti</h1>

  <p>PWA minimalista para centralizar todos tus recordatorios con notificaciones push reales, asistente IA por lenguaje natural y búsqueda global.</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js_15-000000?style=flat&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat&logo=drizzle&logoColor=black" alt="Drizzle ORM" />
    <img src="https://img.shields.io/badge/Vercel_AI_SDK_v6-000000?style=flat&logo=vercel&logoColor=white" alt="Vercel AI SDK" />
    <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat&logo=googlegemini&logoColor=white" alt="Google Gemini" />
    <img src="https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white" alt="Vercel" />
  </p>
</div>

---

## Capturas de pantalla

<!-- TODO: añadir screenshots del dashboard, asistente IA, búsqueda global y settings -->

## Características

### Recordatorios
- 6 categorías visuales: Lanzamientos, Estudio, Clases, Cumpleaños, Tareas y Eventos
- Crear, editar, eliminar y completar recordatorios
- Recurrencia automática — clases semanales y cumpleaños anuales
- Vista de calendario mensual y semanal con badges por día

### Asistente IA
- Crear cualquier recordatorio por lenguaje natural: *"recuérdame llamar al médico el juernes a las 3pm"*
- Chat dedicado para agendar lanzamientos consultando TMDB, RAWG y MusicBrainz
- Anti-alucinación: solo reporta fechas devueltas por fuentes verificadas, nunca las inventa

### Notificaciones push
- Notificaciones push reales en Android y Windows via Web Push API + VAPID
- Acciones desde la notificación: "Ver", "Posponer 15min", "Completar"
- Resumen diario configurable: push matutino con los recordatorios del día
- Múltiples dispositivos por usuario con gestión desde Settings
- Reprogramación automática de recordatorios recurrentes al enviar la notificación

### Búsqueda y navegación
- Búsqueda global con Ctrl+K — filtra por título y descripción con debounce
- Atajos de acceso rápido desde el icono PWA instalado (Nuevo, Pomodoro, Calendario)

### PWA y segundo plano
- Instalable directamente desde Chrome — sin tienda de apps
- Service Worker con Background Sync: las mutaciones fallidas se reintentan al volver la conexión
- `window-controls-overlay` para mejor integración en Windows

### Técnico
- Autenticación con Google OAuth y email/contraseña vía Supabase Auth
- Timer Pomodoro 25/5/15 min con notificación push al terminar cada sesión
- Rate limiting en todas las API routes
- Row Level Security (RLS) en todas las tablas de Supabase
- 100% en tier gratuito: Supabase + Vercel + Google AI Studio

## Prerrequisitos

- [Node.js >= 18.17](https://nodejs.org/)
- Cuenta en [Supabase](https://supabase.com) (plan gratuito)
- API key de [TMDB](https://www.themoviedb.org/settings/api) para películas y series
- API key de [RAWG](https://rawg.io/apidocs) para videojuegos
- API key de [Google AI Studio](https://aistudio.google.com/app/apikey) para Gemini 2.0 Flash

## Instalación

```bash
git clone https://github.com/KawKuroi/Noti.git
cd Noti
npm install
```

## Configuración

```bash
cp .env.example .env.local
```

| Variable | Descripción | Requerida |
|---|---|---|
| `DATABASE_URL` | Conexión a Postgres de Supabase (Transaction Pooler para Vercel) | Sí |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase | Sí |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de rol de servicio (privada) | Sí |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Clave pública VAPID para Web Push | Sí |
| `VAPID_PRIVATE_KEY` | Clave privada VAPID (privada) | Sí |
| `VAPID_EMAIL` | Email de contacto VAPID (formato `mailto:`) | Sí |
| `TMDB_API_KEY` | API key de TMDB | Sí |
| `RAWG_API_KEY` | API key de RAWG | Sí |
| `GOOGLE_GENERATIVE_AI_API_KEY` | API key de Google AI Studio | Sí |
| `CRON_SECRET` | Token para proteger los endpoints de cron | Sí |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app (sin barra final) | Sí |

> MusicBrainz no requiere API key.

Aplica el esquema de base de datos:

```bash
npm run db:push
npm run db:seed
```

Si es la primera vez o estás migrando, aplica también en el SQL Editor de Supabase:

```sql
-- Migración 0002: resumen diario
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "daily_summary" boolean DEFAULT false NOT NULL;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "summary_hour" text DEFAULT '07:00' NOT NULL;
```

## Cómo ejecutar

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

**Otros comandos:**

```bash
npm run lint            # ESLint
npm run db:generate     # Generar migraciones Drizzle
npm run db:push         # Aplicar migraciones
npm run db:studio       # Abrir Drizzle Studio (UI visual de la BD)
```

## Demo en vivo

[https://noti-seven-peach.vercel.app/](https://noti-seven-peach.vercel.app/)
