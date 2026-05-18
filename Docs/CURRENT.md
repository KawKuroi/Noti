# CURRENT — Noti

> Este archivo cambia frecuentemente. Refleja el estado real del proyecto hoy.
> Actualízalo al empezar y terminar cada sesión de trabajo.

## Fase activa

**Próximo:** Fase 9 — Categoría Notas (historial de archivos individuales)
**Estado general:** Fases 0–8 completadas.

## Tarea inmediata (antes de Fase 9)

Hay un bug de timezone: cuando se crea un evento con fecha y hora específica, la hora que aparece en la UI no coincide con la que se ingresó. Hay una desincronización entre la hora local del usuario y la que se guarda/muestra.

**Archivos probablemente involucrados:**
- `src/lib/utils/date.utils.ts`
- `src/lib/actions/reminder.actions.ts`
- `src/app/(dashboard)/inicio/page.tsx`
- `src/types/reminder.types.ts`

## Pendientes manuales bloqueantes

- [ ] Aplicar migración `src/db/migrations/0003_lanzamientos.sql` en el SQL Editor de Supabase (requerida para que Fase 8 funcione correctamente en producción)

## Contexto de la Fase 9

Una vez resuelto el bug de timezone, la Fase 9 introduce:
- `due_date` y `notify_at` se vuelven nullable en el schema (notas sin fecha son válidas)
- Nueva categoría `notes` en DB y en constants
- Ruta `/notes` con grid de tarjetas + ruta `/notes/[id]` para vista detalle/editor
- Toggle "Recordarme" opcional dentro del editor de nota
- Las notas aparecen en búsqueda global (Ctrl+K) pero NO en el dashboard de próximos

## Deuda técnica conocida

- Pomodoro sigue en el codebase — se elimina en Fase 15 (baja prioridad ahora)
- La migración `0003_lanzamientos.sql` requiere aplicación manual en Supabase
- Telemetría del chat de lanzamientos pendiente (Fase 10)
