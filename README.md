<div align="center">

  <h1>Noti</h1>

  <p>PWA minimalista y apps nativas (Windows/Android) para recordatorios con notificaciones push reales, asistente IA por lenguaje natural, chat de lanzamientos y busqueda global.</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js_16-000000?style=flat&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat&logo=drizzle&logoColor=black" alt="Drizzle ORM" />
    <img src="https://img.shields.io/badge/Vercel_AI_SDK_v6-000000?style=flat&logo=vercel&logoColor=white" alt="Vercel AI SDK" />
    <img src="https://img.shields.io/badge/Groq-F55036?style=flat&logo=groq&logoColor=white" alt="Groq" />
    <img src="https://img.shields.io/badge/Tauri_v2-24C8DB?style=flat&logo=tauri&logoColor=white" alt="Tauri v2" />
    <img src="https://img.shields.io/badge/Vitest-6E9F18?style=flat&logo=vitest&logoColor=white" alt="Vitest" />
    <img src="https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white" alt="Vercel" />
  </p>
</div>

---

## Caracteristicas

### Recordatorios
- 10 categorias: Peliculas, Series, Videojuegos, Musica, Libros, Estudio, Cumpleanos, Pendientes, Eventos y Notas
- Crear, editar, eliminar y completar recordatorios
- Recurrencia automatica — cumpleanos anuales y sesiones semanales de Estudio
- Infinite scroll con ordenamiento por fecha proxima, lejana, creacion o pendientes
- Optimistic updates con `useOptimistic` para respuesta inmediata en la UI
- Vista de calendario mensual y semanal (timeline tipo Google Calendar, scroll a 07:00)

### Asistente IA
- Crear cualquier recordatorio por lenguaje natural: *"recuerdame llamar al medico el jueves a las 3pm"*
- Deteccion automatica de duplicados antes de crear un recordatorio
- Sugerencias automaticas de categoria segun palabras clave
- Entrada por audio via Whisper Large v3 Turbo (Groq)
- Chat dedicado para agendar lanzamientos consultando TMDB, RAWG, MusicBrainz y Google Books
- Anti-alucinacion: solo reporta fechas devueltas por fuentes verificadas, nunca las inventa

### Notas
- Cuadernos tipo chat con historial de entradas de texto
- Adjuntos multimedia: imagenes, audios, documentos (PDF/DOCX/TXT) y videos
- Almacenamiento en Vercel Blob

### Notificaciones push
- Notificaciones push reales en Android y Windows via Web Push API + VAPID
- Acciones desde la notificacion: "Ver", "Posponer 15min", "Completar"
- Resumen diario configurable: push matutino con los recordatorios del dia
- Multiples dispositivos por usuario con gestion desde Settings
- Countdown de cumpleanos: notificacion a 3 dias y 1 dia antes
- Reprogramacion automatica de recordatorios recurrentes al enviar la notificacion
- Scheduler local en apps Tauri: las notificaciones disparan a la hora exacta con la app cerrada, sin depender de cron-job.org

### Apps nativas (Windows y Android)
- Wrapper Tauri v2 que carga la web de produccion en un webview — sin reescritura de UI
- Windows: bandeja del sistema, cierra sin cerrar la app, timers JS + notificacion nativa
- Android: AlarmManager via tauri-plugin-notification con Doze activo — dispara a la hora exacta
- Distribuidas sin tiendas: `.msi` / `.exe` (Windows) y `.apk` self-signed (Android) en GitHub Releases
- Descarga directa desde la landing y desde la seccion Descargas en Settings

### Busqueda y navegacion
- Busqueda global con Ctrl+K — full-text search con `to_tsvector` / `websearch_to_tsquery` en PostgreSQL
- Cache SWR en los resultados de busqueda para respuesta instantanea
- Atajos de acceso rapido desde el icono PWA instalado (Nuevo recordatorio, Calendario)

### Landing page publica
- Hero, seccion de caracteristicas, mockups del producto, listado de categorias, demo del asistente y FAQ
- Formulario de sugerencias integrado que envia correo via Resend
- Diseno con design tokens CSS y dark mode sincronizado con la app

### PWA y segundo plano
- Instalable directamente desde Chrome — sin tienda de apps
- Service Worker con Background Sync: las mutaciones fallidas se reintentan al volver la conexion
- `window-controls-overlay` para mejor integracion en Windows
- PWA Widget API con Adaptive Cards v1.5 para mostrar proximos recordatorios

### Tecnico
- Autenticacion con Google OAuth y email/contrasena via Supabase Auth
- Dark mode con next-themes y tokens CSS semanticos
- Internacionalizacion ES/EN con next-intl (cookie-based, namespaces Sidebar/Comun/Settings)
- Rate limiting con Upstash Redis via `@upstash/ratelimit` en todas las API routes (fallback en memoria en dev)
- Row Level Security (RLS) en todas las tablas de Supabase
- 223 unit tests con Vitest (logica pura, mocks de DB/Redis/web-push) y tests E2E con Playwright
- CI en GitHub Actions: lint + unit tests + build en cada push/PR a main (Node 24)
- Watchdog cron: /settings muestra aviso si el cron lleva mas de 10 min sin ejecutarse
- Soft delete de cuenta: zona de peligro en Settings con recuperacion por 30 dias
- Stack actualizado: Next.js 16, Tailwind CSS 4, Zod 4, date-fns 4, eslint 9 flat config
- 100% en tier gratuito: Supabase + Vercel + Groq + Upstash

## Prerequisitos

- [Node.js >= 18.17](https://nodejs.org/)
- Cuenta en [Supabase](https://supabase.com) (plan gratuito)
- API key de [TMDB](https://www.themoviedb.org/settings/api) para peliculas y series
- API key de [RAWG](https://rawg.io/apidocs) para videojuegos
- API key de [Groq](https://console.groq.com) para Llama 3.3 70B / Whisper Large v3 Turbo (free tier sin tarjeta)

## Instalacion

```bash
git clone https://github.com/KawKuroi/Noti.git
cd Noti
npm install
```

## Configuracion

```bash
cp .env.example .env.local
```

| Variable | Descripcion | Requerida |
|---|---|---|
| `DATABASE_URL` | Conexion a Postgres de Supabase (Transaction Pooler para Vercel) | Si |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Si |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anonima de Supabase | Si |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de rol de servicio (privada) | Si |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Clave publica VAPID para Web Push | Si |
| `VAPID_PRIVATE_KEY` | Clave privada VAPID (privada) | Si |
| `VAPID_EMAIL` | Email de contacto VAPID (formato `mailto:`) | Si |
| `TMDB_API_KEY` | API key de TMDB | Si |
| `RAWG_API_KEY` | API key de RAWG | Si |
| `GROQ_API_KEY` | API key de Groq (console.groq.com, free tier) | Si |
| `CRON_SECRET` | Token para proteger los endpoints de cron | Si |
| `NEXT_PUBLIC_APP_URL` | URL publica de la app (sin barra final) | Si |
| `BLOB_READ_WRITE_TOKEN` | Token de Vercel Blob para adjuntos en Notas | Si (Fase 22+) |
| `UPSTASH_REDIS_REST_URL` | URL de Upstash Redis para rate limiting | Si (Fase 26+) |
| `UPSTASH_REDIS_REST_TOKEN` | Token de Upstash Redis | Si (Fase 26+) |
| `RESEND_API_KEY` | API key de Resend para el formulario de sugerencias (resend.com, free tier) | Si |
| `CONTACT_DESTINATION_EMAIL` | Email destinatario del formulario de sugerencias de la landing | Si |

> MusicBrainz y Google Books no requieren API key.

Aplica el esquema de base de datos:

```bash
npm run db:push
npm run db:seed
```

## Como ejecutar

```bash
# Desarrollo
npm run dev

# Produccion
npm run build
npm start
```

**Otros comandos:**

```bash
npm run lint            # ESLint
npm run test            # Unit tests con Vitest (una pasada)
npm run test:watch      # Unit tests en modo watch (desarrollo)
npm run test:e2e        # Tests E2E con Playwright
npm run db:generate     # Generar migraciones Drizzle
npm run db:push         # Aplicar migraciones
npm run db:studio       # Abrir Drizzle Studio (UI visual de la BD)
```

## Demo en vivo

[https://noti-seven-peach.vercel.app/](https://noti-seven-peach.vercel.app/)
