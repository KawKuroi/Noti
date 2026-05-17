<div align="center">
  <!-- TODO: añadir screenshot del proyecto en funcionamiento -->

  <h1>Noti</h1>

  <p>PWA minimalista que unifica todos tus recordatorios con notificaciones push reales y chat IA para agendar lanzamientos de películas, series, videojuegos y álbumes.</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat&logo=drizzle&logoColor=black" alt="Drizzle ORM" />
    <img src="https://img.shields.io/badge/Vercel_AI_SDK-000000?style=flat&logo=vercel&logoColor=white" alt="Vercel AI SDK" />
    <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat&logo=googlegemini&logoColor=white" alt="Google Gemini" />
    <img src="https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white" alt="Vercel" />
  </p>
</div>

---

## Capturas de pantalla

<!-- TODO: añadir screenshot del proyecto en funcionamiento -->

## Características

- Autenticación completa con Google OAuth y email/contraseña vía Supabase Auth
- 6 categorías de recordatorios: lanzamientos, estudio, clases, cumpleaños, tareas y eventos personales
- Notificaciones push reales en Android y Windows sin depender de apps de mensajería
- Chat IA con Google Gemini 2.0 Flash que consulta TMDB, RAWG y MusicBrainz para encontrar fechas exactas de lanzamientos
- Anti-alucinación: el asistente solo reporta fechas devueltas por fuentes verificadas; fallback manual si no las encuentra
- Notificación automática a las 06:00 del día del lanzamiento (películas, series, videojuegos y álbumes)
- Acciones desde la notificación: "Ver", "Posponer 15min", "Completar"
- Instalable como PWA directamente desde Chrome, sin pasar por una tienda de apps

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js >= 18.17](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (incluido con Node.js)
- Una cuenta en [Supabase](https://supabase.com) (plan gratuito)
- Una API key gratuita de [TMDB](https://www.themoviedb.org/settings/api) para películas y series
- Una API key gratuita de [RAWG](https://rawg.io/apidocs) para videojuegos
- Una API key gratuita de [Google AI Studio](https://aistudio.google.com/app/apikey) para Gemini Flash

## Instalación

```bash
git clone https://github.com/KawKuroi/Noti.git
cd Noti
npm install
```

## Configuración

Copia el archivo de ejemplo y completa las variables:

```bash
cp .env.example .env.local
```

| Variable | Descripción | Requerida |
|---|---|---|
| `DATABASE_URL` | Conexión a Postgres de Supabase (Pooler para Vercel) | Sí |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase | Sí |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de rol de servicio (privada) | Sí |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Clave pública VAPID para Web Push | Sí |
| `VAPID_PRIVATE_KEY` | Clave privada VAPID (privada) | Sí |
| `VAPID_EMAIL` | Email de contacto para VAPID (formato `mailto:`) | Sí |
| `TMDB_API_KEY` | API key de TMDB para películas y series | Sí |
| `RAWG_API_KEY` | API key de RAWG para videojuegos | Sí |
| `GOOGLE_GENERATIVE_AI_API_KEY` | API key de Google AI Studio para Gemini Flash | Sí |
| `CRON_SECRET` | Token para proteger el endpoint del cron | Sí |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app (sin barra final) | Sí |

> MusicBrainz no requiere API key.

Para aplicar el esquema de base de datos:

```bash
npm run db:push
npm run db:seed
```

## Cómo ejecutar

**Modo desarrollo:**

```bash
npm run dev
```

**Construir para producción:**

```bash
npm run build
```

**Iniciar en producción:**

```bash
npm start
```

**Otros comandos útiles:**

```bash
npm run lint           # ESLint
npm run db:generate    # Generar migraciones Drizzle
npm run db:migrate     # Aplicar migraciones
npm run db:studio      # Abrir Drizzle Studio
```

## Demo en vivo

[https://noti-seven-peach.vercel.app/](https://noti-seven-peach.vercel.app/)
