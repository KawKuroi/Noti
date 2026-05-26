<div align="center">

  <h1>Noti</h1>

  <p>PWA minimalista para centralizar todos tus recordatorios con notificaciones push reales, asistente IA por lenguaje natural y busqueda global.</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js_15-000000?style=flat&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat&logo=drizzle&logoColor=black" alt="Drizzle ORM" />
    <img src="https://img.shields.io/badge/Vercel_AI_SDK_v6-000000?style=flat&logo=vercel&logoColor=white" alt="Vercel AI SDK" />
    <img src="https://img.shields.io/badge/Groq-F55036?style=flat&logo=groq&logoColor=white" alt="Groq" />
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
- Rate limiting en todas las API routes
- Row Level Security (RLS) en todas las tablas de Supabase
- Tests E2E con Playwright (flujo sin autenticacion + test opcional con credenciales)
- 100% en tier gratuito: Supabase + Vercel + Groq

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
npm run db:generate     # Generar migraciones Drizzle
npm run db:push         # Aplicar migraciones
npm run db:studio       # Abrir Drizzle Studio (UI visual de la BD)
npm run test:e2e        # Tests E2E con Playwright
```

## Demo en vivo

[https://noti-seven-peach.vercel.app/](https://noti-seven-peach.vercel.app/)
