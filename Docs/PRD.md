# PRD: Noti

## Problema

Las personas olvidan constantemente cosas importantes de su vida diaria — estrenos de películas, sesiones de estudio, horarios de clase, cumpleaños, tareas pendientes — porque las herramientas existentes como Google Calendar son genéricas, difíciles de categorizar y fáciles de ignorar. No existe una solución unificada que combine recordatorios manuales con fuentes automáticas (como estrenos de cine) y que entregue notificaciones push reales sin depender de apps de mensajería.

## Usuario objetivo

- **Persona 1 — Estudiante universitario:** Tiene horarios de clase variables, necesita gestionar tiempos de estudio con técnica pomodoro, quiere enterarse de estrenos de cine, y olvida cumpleaños frecuentemente. Usa el celular Android y un PC con Windows. No revisa Google Calendar.
- **Persona 2 — Profesional joven:** Tiene múltiples pendientes personales y laborales, quiere una app limpia y rápida que le recuerde todo sin ruido. Busca algo más personal que un calendario corporativo.
- **Persona 3 — Cualquier persona organizada:** Quiere centralizar todos sus recordatorios en un solo lugar con categorías claras y notificaciones que realmente lleguen.

## Propuesta de valor

Una PWA minimalista que unifica todos tus recordatorios en un solo lugar, con categorías visuales, notificaciones push reales en Android y Windows, y fuentes automáticas como estrenos de cine — sin instalar nada desde una tienda de apps.

## Features del MVP

1. **Autenticación** — Registro e inicio de sesión con Google OAuth y email + contraseña
2. **Dashboard principal** — Vista general de recordatorios próximos con filtros por categoría
3. **CRUD de recordatorios** — Crear, editar, eliminar y marcar como completado
4. **Sistema de categorías:**
   - 🎬 Lanzamientos (películas, series, videojuegos y álbumes, agendados vía chat IA)
   - 📚 Estudio/pomodoro (temporizador integrado)
   - 🏫 Horario de clases (recurrencia semanal)
   - 🎂 Cumpleaños (recurrencia anual)
   - ✅ Tareas/pendientes (fecha límite)
   - 📌 Eventos personales (fecha y hora específica)
5. **Notificaciones push** — Web Push API con VAPID, funciona en Android y Windows
6. **Chat IA para lanzamientos** — Asistente conversacional con Google Gemini 2.0 Flash que consulta TMDB (películas/series), RAWG (videojuegos) y MusicBrainz (álbumes) para encontrar la fecha exacta de un lanzamiento y agendarlo al calendario tras confirmación. Fallback manual si la fuente no tiene la fecha.
7. **Vista de calendario** — Visualización mensual/semanal de todos los recordatorios
8. **Instalación como PWA** — Instalable desde Chrome en Android y Windows
9. **Perfil de usuario** — Configuración de zona horaria, preferencias de notificación
10. **Responsive design** — Funciona igual de bien en móvil y escritorio

## Out of scope (MVP)

- Internacionalización (inglés se añade en fase 2)
- Compartir recordatorios entre usuarios
- Integración con Google Calendar como fuente
- App nativa (Flutter/React Native)
- Modo offline completo (solo lectura offline básica del Service Worker)
- Integraciones con Slack, WhatsApp o Telegram
- Sistema de hábitos o streaks
- Temas personalizables (solo light mode minimalista en MVP)

## Success criteria

- La app se puede instalar como PWA en Android y Windows
- Las notificaciones push llegan correctamente en ambas plataformas
- Un usuario puede crear recordatorios en las 6 categorías
- El chat IA encuentra fechas exactas de lanzamientos (peliculas, series, videojuegos y albumes) y las agenda al calendario
- El timer de pomodoro funciona correctamente
- Al menos 5 usuarios externos pueden registrarse y usar la app
- Lighthouse PWA score > 90
- El proyecto funciona completamente en tier gratuito

## Decisiones de producto

- **Minimalista:** UI blanca, limpia, con poco color. El color se usa solo para diferenciar categorías
- **Español primero:** Toda la UI en español. Inglés en fase 2 con i18n
- **PWA-first:** No hay app nativa. La PWA se instala desde Chrome
- **Supabase como backend:** Auth, DB, cron, y edge functions en un solo servicio
- **Sin onboarding largo:** Login directo, dashboard vacío con CTA para crear primer recordatorio
- **Notificaciones configurables:** El usuario elige cuánto antes quiere ser notificado (5min, 15min, 30min, 1h, 1 día)
- **Categorías fijas en MVP:** No se pueden crear categorías custom (fase 2)
- **TMDB + RAWG + MusicBrainz como fuentes verificadas:** El chat IA solo reporta fechas devueltas por estas fuentes. Si no encuentra, pregunta al usuario por la fecha (fallback manual). Nunca inventa fechas.
- **Lanzamientos se notifican a las 06:00 hora local del día del lanzamiento por defecto** (en lugar de la anticipación habitual de minutos antes).
