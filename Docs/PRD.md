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
   - Lanzamientos (películas, series, videojuegos, música y libros agendados vía chat IA o manualmente, en un hub unificado)
   - Notas (archivos individuales tipo Google Keep con recordatorio opcional, evolucionables a baúl multimedia)
   - Estudio (sesiones de lectura y aprendizaje)
   - Horario de clases (recurrencia semanal)
   - Cumpleaños (recurrencia anual)
   - Tareas/pendientes (fecha límite, con auto-eliminación configurable)
   - Eventos personales (fecha y hora específica)

5. **Notificaciones push** — Web Push API con VAPID, funciona en Android y Windows; acciones desde la notificación (Ver, Posponer, Completar); múltiples dispositivos por usuario

6. **Resumen diario** — Push notification matutina configurable con los recordatorios del día; el usuario elige la hora desde Settings

7. **Chat IA para lanzamientos** — Asistente conversacional con Groq Llama 3.3 70B Versatile que consulta TMDB (películas/series), RAWG (videojuegos), MusicBrainz (álbumes) y Google Books (libros). Fallback manual si la fuente no tiene la fecha. Anti-alucinación: nunca inventa fechas. Refinado para reconocer aliases comunes y formas numéricas alternativas (GTA 6 / Grand Theft Auto VI)

8. **Asistente IA general** — Input de lenguaje natural accesible desde cualquier vista del dashboard para crear cualquier tipo de recordatorio: "cumpleaños de María el 20 de junio", "clase de inglés los martes a las 7pm", "cita médica el viernes a las 3pm". Soporta entrada por audio (dictado con transcripción Whisper)

9. **Búsqueda global** — Modal Ctrl+K con búsqueda por título y descripción, badge de categoría y fecha relativa en los resultados

10. **Vista de calendario** — Visualización mensual/semanal de todos los recordatorios

11. **Vista calendario con filtros** — Vistas mes y semana sincronizadas, filtro multi-select por categoría para ver solo el subconjunto que interesa

12. **PWA instalable** — Instalable desde Chrome en Android y Windows; shortcuts en el icono instalado (Nuevo, Pomodoro, Calendario); `window-controls-overlay` en Windows

13. **Background Sync** — El Service Worker guarda mutaciones fallidas en IndexedDB y las reintenta automáticamente al recuperar la conexión

14. **Perfil de usuario** — Zona horaria, anticipación de notificación, sonido del pomodoro, resumen diario

15. **Seguridad** — RLS en todas las tablas de Supabase; rate limiting en todas las API routes

16. **Notas como historial de archivos** — Cada nota es un archivo individual (estilo Google Keep / Apple Notes) con su propio título, cuerpo y fecha opcional. Vista de grid con tarjetas; cada nota se abre en su propia vista detalle para leer o editar. Evolucionable a baúl multimedia con imágenes, audio, documentos y video

17. **Entrada por audio en el asistente IA** — Botón de micrófono que graba con el navegador, transcribe con Groq Whisper Large v3 Turbo y rellena el input para que el usuario revise antes de enviar

18. **Auto-eliminación de tareas completadas** — Configuración opcional en `/settings` para borrar tareas marcadas como completadas tras 7, 30 o 90 días. Cron diario en Vercel; preserva el historial si se elige "Nunca"

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
- Timer Pomodoro — incluido en versiones previas, retirado en Fase 15 por alejarse del objetivo del producto (gestión de recordatorios)

## Success criteria

- La app se puede instalar como PWA en Android y Windows
- Las notificaciones push llegan correctamente en ambas plataformas
- Un usuario puede crear recordatorios en todas las categorías (incluyendo notas y los 5 tipos de lanzamiento), por lenguaje natural escrito o dictado por audio
- El chat IA encuentra fechas exactas de lanzamientos (cine, TV, juegos, música, libros) y las agenda al calendario; al menos 8 de cada 10 consultas reales resuelven correctamente
- La búsqueda global encuentra recordatorios en menos de 300ms
- El resumen diario llega como push notification a la hora configurada
- El Service Worker reintenta operaciones fallidas al volver la conexión
- El usuario puede activar la auto-eliminación de tareas completadas (7/30/90 días) y verificarlo en el cron diario
- El calendario muestra mes y semana correctamente y permite filtrar por categoría
- Al menos 5 usuarios externos pueden registrarse y usar la app
- Lighthouse PWA score > 90
- El proyecto funciona completamente en tier gratuito

## Decisiones de producto

- **Minimalista:** UI blanca, limpia, con poco color. El color se usa solo para diferenciar categorías
- **Español primero:** Toda la UI en español. Inglés en iteración futura con i18n
- **PWA-first:** No hay app nativa. La PWA se instala desde Chrome con shortcuts en el icono
- **Supabase como backend:** Auth, DB y cron en un solo servicio
- **Sin onboarding largo:** Login directo, dashboard vacío con CTA para crear primer recordatorio
- **IA como atajo, no como sustituto:** El asistente IA es un input adicional junto al formulario manual, no lo reemplaza. A partir de la Fase 12 vive como acceso opcional fuera de la lista de recordatorios para no dominar el dashboard
- **Notificaciones configurables:** El usuario elige cuánto antes quiere ser notificado (5min, 15min, 30min, 1h, 1 día)
- **Categorías fijas:** No se pueden crear categorías custom (iteración futura)
- **Anti-alucinación en lanzamientos:** El chat IA solo reporta fechas devueltas por TMDB, RAWG, MusicBrainz o Google Books. Si no encuentra, pregunta al usuario. Nunca inventa fechas
- **Lanzamientos se notifican a las 06:00 hora local del día del lanzamiento** por defecto, en lugar de la anticipación habitual de minutos antes
- **Lanzamientos divididos por tipo:** Cada tipo (película, serie, videojuego, álbum, libro) tiene UI y prompts de IA específicos, agrupados en un hub unificado para no saturar el sidebar
- **Notas como archivos individuales:** Cada nota se trata como un documento independiente con su propia vista detalle, no como entradas en un único documento concatenado
- **Auto-eliminación opt-in:** La auto-eliminación de tareas completadas está desactivada por defecto. El usuario decide explícitamente si quiere ese comportamiento y a qué intervalo
