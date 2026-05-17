# PRD: Noti

## Problema

Las personas olvidan constantemente cosas importantes de su vida diaria — estrenos de películas, sesiones de estudio, horarios de clase, cumpleaños, tareas pendientes — porque las herramientas existentes como Google Calendar son genéricas, difíciles de categorizar y fáciles de ignorar. No existe una solución unificada que combine recordatorios manuales con fuentes automáticas (como estrenos de cine) y que entregue notificaciones push reales sin depender de apps de mensajería.

## Usuario objetivo

- **Persona 1 — Estudiante universitario:** Tiene horarios de clase variables, necesita gestionar tiempos de estudio con técnica pomodoro, quiere enterarse de estrenos de cine, y olvida cumpleaños frecuentemente. Usa el celular Android y un PC con Windows. No revisa Google Calendar.
- **Persona 2 — Profesional joven:** Tiene múltiples pendientes personales y laborales, quiere una app limpia y rápida que le recuerde todo sin ruido. Busca algo más personal que un calendario corporativo.
- **Persona 3 — Cualquier persona organizada:** Quiere centralizar todos sus recordatorios en un solo lugar con categorías claras y notificaciones que realmente lleguen.

## Propuesta de valor

Una PWA minimalista que unifica todos tus recordatorios en un solo lugar, con categorías visuales, notificaciones push reales en Android y Windows, asistente IA por lenguaje natural y fuentes automáticas de lanzamientos — sin instalar nada desde una tienda de apps.

## Features implementadas

1. **Autenticación** — Registro e inicio de sesión con Google OAuth y email + contraseña

2. **Dashboard principal** — Vista de recordatorios próximos con filtros por categoría y búsqueda global (Ctrl+K)

3. **CRUD de recordatorios** — Crear, editar, eliminar y marcar como completado

4. **Sistema de categorías:**
   - Lanzamientos (películas, series, videojuegos y álbumes, agendados vía chat IA)
   - Estudio/pomodoro (temporizador integrado)
   - Horario de clases (recurrencia semanal)
   - Cumpleaños (recurrencia anual)
   - Tareas/pendientes (fecha límite)
   - Eventos personales (fecha y hora específica)

5. **Notificaciones push** — Web Push API con VAPID, funciona en Android y Windows; acciones desde la notificación (Ver, Posponer, Completar); múltiples dispositivos por usuario

6. **Resumen diario** — Push notification matutina configurable con los recordatorios del día; el usuario elige la hora desde Settings

7. **Chat IA para lanzamientos** — Asistente conversacional con Google Gemini 2.0 Flash que consulta TMDB (películas/series), RAWG (videojuegos) y MusicBrainz (álbumes). Fallback manual si la fuente no tiene la fecha. Anti-alucinación: nunca inventa fechas

8. **Asistente IA general** — Input de lenguaje natural en el dashboard para crear cualquier tipo de recordatorio: "cumpleaños de María el 20 de junio", "clase de inglés los martes a las 7pm", "cita médica el viernes a las 3pm"

9. **Búsqueda global** — Modal Ctrl+K con búsqueda por título y descripción, badge de categoría y fecha relativa en los resultados

10. **Vista de calendario** — Visualización mensual/semanal de todos los recordatorios

11. **Timer Pomodoro** — 25/5/15 min configurable, notificación push al terminar cada sesión, integración con recordatorios de estudio

12. **PWA instalable** — Instalable desde Chrome en Android y Windows; shortcuts en el icono instalado (Nuevo, Pomodoro, Calendario); `window-controls-overlay` en Windows

13. **Background Sync** — El Service Worker guarda mutaciones fallidas en IndexedDB y las reintenta automáticamente al recuperar la conexión

14. **Perfil de usuario** — Zona horaria, anticipación de notificación, sonido del pomodoro, resumen diario

15. **Seguridad** — RLS en todas las tablas de Supabase; rate limiting en todas las API routes

## Out of scope (actualmente)

- Internacionalización — inglés se añade en iteración futura
- Compartir recordatorios entre usuarios
- Integración con Google Calendar como fuente o destino
- App nativa (Flutter/React Native) — la PWA cubre los casos de uso
- Notificaciones por email — las push notifications cubren ambas plataformas
- Integraciones con Slack, WhatsApp o Telegram
- Sistema de hábitos o streaks
- Categorías personalizadas — fijas en MVP, extensibles en iteración futura
- Widget nativo en Android — requiere app nativa; el resumen diario push es el sustituto
- Tests E2E automatizados

## Success criteria

- La app se puede instalar como PWA en Android y Windows
- Las notificaciones push llegan correctamente en ambas plataformas
- Un usuario puede crear recordatorios en las 6 categorías, incluyendo por lenguaje natural
- El chat IA encuentra fechas exactas de lanzamientos y las agenda al calendario
- La búsqueda global encuentra recordatorios en menos de 300ms
- El resumen diario llega como push notification a la hora configurada
- El Service Worker reintenta operaciones fallidas al volver la conexión
- El timer Pomodoro funciona correctamente con notificación al terminar
- Al menos 5 usuarios externos pueden registrarse y usar la app
- Lighthouse PWA score > 90
- El proyecto funciona completamente en tier gratuito

## Decisiones de producto

- **Minimalista:** UI blanca, limpia, con poco color. El color se usa solo para diferenciar categorías
- **Español primero:** Toda la UI en español. Inglés en iteración futura con i18n
- **PWA-first:** No hay app nativa. La PWA se instala desde Chrome con shortcuts en el icono
- **Supabase como backend:** Auth, DB y cron en un solo servicio
- **Sin onboarding largo:** Login directo, dashboard vacío con CTA para crear primer recordatorio
- **IA como atajo, no como sustituto:** El asistente IA es un input adicional junto al formulario manual, no lo reemplaza
- **Notificaciones configurables:** El usuario elige cuánto antes quiere ser notificado (5min, 15min, 30min, 1h, 1 día)
- **Categorías fijas:** No se pueden crear categorías custom (iteración futura)
- **Anti-alucinación en lanzamientos:** El chat IA solo reporta fechas devueltas por TMDB, RAWG o MusicBrainz. Si no encuentra, pregunta al usuario. Nunca inventa fechas
- **Lanzamientos se notifican a las 06:00 hora local del día del lanzamiento** por defecto, en lugar de la anticipación habitual de minutos antes
