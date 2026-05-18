## Qué es este proyecto
PWA minimalista de recordatorios con notificaciones push reales, categorías fijas, asistente IA por lenguaje natural y chat para agendar lanzamientos (cine, TV, juegos, música, libros). Español primero. Tier gratuito always.

## Archivos de contexto — cuándo leer cada uno

Lee `context/CURRENT.md` → SIEMPRE, en cada tarea. Tiene la tarea activa y bugs conocidos.
Lee `context/PROJECT.md` → SIEMPRE, en cada tarea. Tiene el stack y las convenciones de código.
Lee `context/PRD.md` → cuando la tarea involucra features, categorías, UX o decisiones de producto.
Lee `context/ARCHITECTURE.md` → cuando la tarea toca rutas de API, DB, servicios, flujos de datos o estructura de carpetas.
Lee `context/ROADMAP.md` → cuando la tarea involucra planificación, fases o priorización.
Lee `context/DECISIONS.md` → cuando evalúas cambiar algo que ya fue decidido o necesitas contexto de por qué algo está hecho así.

## Lo que NUNCA debes hacer

- Inventar fechas de lanzamiento si la API no devuelve ninguna — siempre `pedirFechaManual`
- Crear categorías dinámicas — las categorías son fijas (ver `constants.ts`)
- Usar `any` en TypeScript
- Saltarte RLS — toda query lleva `eq(reminders.userId, userId)`
- Proponer integración con Google Calendar, email, Slack o WhatsApp (out of scope)
- Agregar dependencias de pago — todo debe funcionar en tier gratuito
- No utilices emojis en el código o documentación.
- Genera todo el código en **español** (comentarios, documentación, commit messages).

## Regla: cambios de tipos con impacto global

Antes de modificar cualquier interfaz, tipo o schema que otros archivos consuman
(ej: volver un campo nullable, cambiar un tipo, renombrar una propiedad), debes:

1. Buscar todos los consumidores:
   grep -r "NombreDeLaInterfaz\|nombreDelCampo" src/ --include="*.ts" --include="*.tsx" -l

2. Listar los archivos encontrados en tu plan antes de escribir código.

3. Incluir las correcciones de todos esos archivos en el mismo PR/commit,
   no en un paso posterior.