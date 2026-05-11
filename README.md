<div align="center">
  <!-- TODO: añadir screenshot del proyecto en funcionamiento -->

  <h1>Noti</h1>

  <p>Una PWA minimalista que unifica todos tus recordatorios — películas, clases, cumpleaños, tareas — en un solo lugar, con notificaciones push reales en Android y Windows, sin instalar nada desde una tienda de apps.</p>

  <p>
    ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
    ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
    ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
    ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
    ![Drizzle](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat&logo=drizzle&logoColor=black)
    ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)
  </p>
</div>

---

## Capturas de pantalla

<!-- TODO: añadir screenshot del proyecto en funcionamiento -->

## Características

- Autenticación completa con Google OAuth y email/contraseña via Supabase Auth
- 6 categorías de recordatorios: películas, estudio, clases, cumpleaños, tareas y eventos personales
- Notificaciones push reales en Android y Windows sin depender de apps de mensajería
- Integración automática de estrenos de cine via TMDB API (región Colombia)
- Timer pomodoro integrado con los recordatorios de estudio
- Vista de calendario mensual y semanal con todos los recordatorios
- Instalable como PWA directamente desde Chrome, sin pasar por una tienda de apps

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js >= 18.17](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- Una cuenta en [Supabase](https://supabase.com) (plan gratuito)
- Una cuenta en [TMDB](https://www.themoviedb.org/) para obtener la API key

## Instalación

```bash
git clone https://github.com/tu-usuario/noti.git
cd noti
pnpm install
```

## Cómo ejecutar

**Modo desarrollo:**

```bash
pnpm dev
```

**Construir para producción:**

```bash
pnpm build
```

**Iniciar en producción:**

```bash
pnpm start
```
