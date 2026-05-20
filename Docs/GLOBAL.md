# GLOBAL — Noti

Reglas globales del proyecto. Aplican a todo el código, documentación, prompts de IA y mensajes de commit. Cualquier agente o contribuidor debe respetarlas sin excepción.

## Idioma y estilo

- Español primero. Todo el código (variables, funciones, identificadores), comentarios y documentación se escriben en español.
- Los mensajes de commit usan Conventional Commits 1.0.0: subject, body y footers en español; solo los `type` (`feat`, `fix`, `refactor`, etc.) y `BREAKING CHANGE` permanecen en inglés por ser tokens del estándar.
- Prohibido el uso de emojis en código, comentarios, documentación o mensajes de salida.
- Tono directo, sin adornos. La prosa explica el porqué, no el qué.

## Stack obligatorio

- Next.js App Router con TypeScript estricto.
- Supabase como base de datos y proveedor de auth (Google OAuth y email + contraseña).
- Drizzle ORM como única capa de acceso a datos. Las queries de solo lectura viven en `src/lib/queries/`, las mutaciones en `src/lib/actions/` (Server Actions).
- Tailwind CSS + shadcn/ui para todos los componentes visuales.
- AI SDK (Vercel) para integraciones con LLMs. Modelo principal: Groq Llama 3.3 70B Versatile para chat, Whisper para transcripción.
- Web Push API con VAPID para notificaciones; no se permite integración con FCM, OneSignal ni servicios pagos.

## TypeScript

- `strict: true` siempre. Prohibido el uso de `any` en cualquier capa del código.
- Tipos derivados de Drizzle (`InferSelectModel`, `InferInsertModel`) o de Zod (`z.infer<typeof schema>`) antes que interfaces manuales.
- Validar siempre los inputs de Server Actions y route handlers con esquemas Zod en `src/lib/validations/`.

## Seguridad y base de datos

- Toda query a `reminders`, `push_subscriptions`, `note_attachments` u otra tabla con datos por usuario debe filtrar por `userId`: `eq(reminders.userId, userId)`. Saltarse RLS o asumir que la sesión basta es un bug.
- El `userId` se obtiene del cliente de Supabase (`createClient()` server-side). Nunca confiar en headers, cookies o query params para identificar al usuario.
- Las API keys (TMDB, RAWG, Groq, VAPID, etc.) viven exclusivamente en variables de entorno. Prohibido hardcodearlas o subirlas al repositorio.
- Prohibido pegar secretos (PATs, API keys, passwords) en chat, mensajes de commit o documentación. Solo `NEXT_PUBLIC_*` y la `anon key` pública pueden aparecer en archivos versionados.

## Categorías y dominio

- Las categorías son fijas: `lanzamientos`, `notas`, `estudio`, `cumpleanos`, `pendientes`, `eventos`. Definidas en `src/lib/utils/constants.ts`. Prohibido crear categorías dinámicas o pedirlas al usuario.
- El slug `classes` está retirado desde la Fase 14; cualquier dato heredado se mapea a `estudio`.
- Las fechas de lanzamiento (películas, series, juegos, música, libros) nunca se inventan. Si la API externa no devuelve fecha, el flujo debe invocar `pedirFechaManual` para que el usuario la indique. Anti-alucinación es regla dura.

## Restricciones de producto

- El tier gratuito de Noti es permanente. Prohibido introducir dependencias de pago, paywalls, suscripciones o features que requieran SaaS facturables.
- Fuera de alcance, no proponer ni implementar: Google Calendar, integraciones por email, Slack, WhatsApp, Telegram, ni ninguna app de mensajería.
- Los recordatorios de la categoría `pendientes` honran `auto_delete_completed_tasks_days` del perfil del usuario. La limpieza ocurre en el cron diario (`/api/cron/limpiar-tareas`).

## Convenciones de carpetas

- Componentes por dominio en `src/components/features/<dominio>/`. Primitivas shadcn en `src/components/ui/`.
- Servicios externos (TMDB, RAWG, MusicBrainz, Google Books, push) en `src/lib/services/`.
- Utilities transversales en `src/lib/utils/`. Cuando una util crece (ej: parseo de fechas naturales), se separa en su propio archivo.
- La fuente de verdad del modelo de datos es `src/db/schema.ts`. Migraciones SQL en `src/db/migrations/`, aplicadas con Drizzle o manualmente en Supabase.

## Cambios con impacto global

Antes de modificar una interfaz, tipo o schema que otros archivos consumen (volver un campo nullable, renombrar una propiedad, cambiar un tipo):

1. Buscar todos los consumidores con grep:
   ```
   grep -r "NombreDeLaInterfaz\|nombreDelCampo" src/ --include="*.ts" --include="*.tsx" -l
   ```
2. Listar los archivos afectados en el plan antes de escribir código.
3. Incluir las correcciones de todos esos archivos en el mismo commit, no en un paso posterior.

## Notificaciones y crons

- Notificaciones push vía Web Push API con VAPID. Los suscriptores se guardan en `push_subscriptions` (UNIQUE por `user_id, endpoint`).
- Tres crons activos: `check-reminders` cada minuto, `resumen-diario` cada hora (el handler decide si toca enviar según `summary_hour` del usuario), `limpiar-tareas` diario.
- Cada envío se registra en `notification_log` con `status` (`sent` o `failed`) para diagnóstico.

## Service Worker y PWA

- Mutaciones fallidas se persisten en IndexedDB y el Service Worker las reintenta vía Background Sync al recuperar conexión. Nuevos endpoints que muten estado deben tolerar reintentos idempotentes.
- La PWA debe seguir siendo instalable en Chrome (Android y Windows). Los shortcuts del manifest no se modifican sin razón explícita.
