# Tarea activa

## Solicitud original (usuario, 2026-05-20)

> Ejecuta la Fase 20 del roadmap: auto-eliminacion de tareas completadas.

## 1. Contexto y Archivos Afectados

La Fase 20 introduce una columna nueva en `profiles` (`auto_delete_completed_tasks_days`) y otra en `reminders` (`completed_at`), un cron diario que limpia tareas vencidas, ajustes en settings y un indicador visual en las tarjetas de tareas completadas.

Archivos directamente involucrados:
- `src/db/migrations/0006_auto_delete_tasks.sql` — nueva migracion SQL (crear)
- `src/db/schema.ts` — agregar 2 columnas nuevas al schema de Drizzle
- `src/types/user.types.ts` — ampliar interfaz `Perfil` con el nuevo campo
- `src/types/reminder.types.ts` — agregar `completadoEn` a `Recordatorio`
- `src/lib/queries/user.queries.ts` — actualizar `mapearPerfil`
- `src/lib/queries/reminder.queries.ts` — actualizar `mapearRecordatorio` y el select explicito en `getRecordatoriosANotificar`
- `src/lib/actions/reminder.actions.ts` — `alternarCompletado` llena `completed_at` al completar y lo limpia al desmarcar
- `src/app/api/cron/limpiar-tareas/route.ts` — nuevo endpoint de cron (crear)
- `vercel.json` — agregar entrada de cron diario a las 03:00 UTC
- `src/lib/utils/constants.ts` — nueva constante `OPCIONES_AUTO_DELETE_TAREAS`
- `src/lib/actions/user.actions.ts` — nueva accion `actualizarAutoDeleteTareas`
- `src/components/features/settings/formulario-auto-delete-tareas.tsx` — nuevo componente de settings (crear)
- `src/app/(dashboard)/settings/page.tsx` — agregar seccion de pendientes con el formulario
- `src/components/features/reminders/tarjeta-recordatorio.tsx` — mostrar countdown ambar en tareas completadas
- `src/components/features/reminders/lista-recordatorios.tsx` — propagar prop opcional `diasAutoEliminar`
- `src/app/(dashboard)/[slug]/page.tsx` — cargar perfil en slug `tasks` y pasar la configuracion

## 2. Plan de Accion Detallado

### Bloque 1 - Capa de datos

- [x] **Paso 1: `src/db/migrations/0006_auto_delete_tasks.sql`** Crear archivo con tres sentencias SQL.
- [x] **Paso 2: `src/db/schema.ts`** Agregar `autoEliminarTareasCompletadasDias` a `perfiles` y `completadoEn` + indice a `recordatorios`.
- [x] **Paso 3: `src/types/user.types.ts`** Agregar `autoEliminarTareasCompletadasDias: number | null` a `Perfil`.
- [x] **Paso 4: `src/types/reminder.types.ts`** Agregar `completadoEn: Date | null` a `Recordatorio`.
- [x] **Paso 5: `src/lib/queries/user.queries.ts`** Actualizar `mapearPerfil`.
- [x] **Paso 6: `src/lib/queries/reminder.queries.ts`** Actualizar `mapearRecordatorio` y select de `getRecordatoriosANotificar`.

### Bloque 2 - Logica de negocio

- [x] **Paso 7: `src/lib/actions/reminder.actions.ts`** `alternarCompletado` llena/limpia `completadoEn`.
- [x] **Paso 8: `src/app/api/cron/limpiar-tareas/route.ts`** Nuevo cron con autenticacion y eliminacion por perfil.

### Bloque 3 - Configuracion y constants

- [x] **Paso 9: `vercel.json`** Cron diario a las 03:00 UTC.
- [x] **Paso 10: `src/lib/utils/constants.ts`** Constante `OPCIONES_AUTO_DELETE_TAREAS`.

### Bloque 4 - Settings UI

- [x] **Paso 11: `src/lib/actions/user.actions.ts`** Accion `actualizarAutoDeleteTareas`.
- [x] **Paso 12: `src/components/features/settings/formulario-auto-delete-tareas.tsx`** Nuevo componente cliente.
- [x] **Paso 13: `src/app/(dashboard)/settings/page.tsx`** Seccion "Tareas completadas" en settings.

### Bloque 5 - Indicador visual en tarjetas

- [x] **Paso 14: `src/components/features/reminders/tarjeta-recordatorio.tsx`** Countdown ambar en completadas.
- [x] **Paso 15: `src/components/features/reminders/lista-recordatorios.tsx`** Propagar `diasAutoEliminar`.
- [x] **Paso 16: `src/app/(dashboard)/[slug]/page.tsx`** Carga perfil en slug `tasks` y pasa config.

### Bloque 6 - Verificacion

- [x] **Paso 17: Validacion estatica** `npx tsc --noEmit` — cero errores. `next lint` — cero warnings.

## 3. Reporte de Pruebas

**Estado:** [APROBADO]

- **Cumplimiento funcional:** migracion SQL lista para aplicar en Supabase; schema Drizzle con las dos columnas nuevas; `alternarCompletado` graba `completed_at`; cron `limpiar-tareas` elimina tareas segun perfil; settings expone selector de auto-eliminacion; tarjeta muestra countdown ambar cuando quedan 3 dias o menos.
- **Espanol absoluto:** todos los identificadores nuevos en espanol (`autoEliminarTareasCompletadasDias`, `completadoEn`, `etiquetaAutoDelete`, `actualizarAutoDeleteTareas`, etc.).
- **Seguridad:** cron protegido con `CRON_SECRET`; grep de patrones sensibles en archivos nuevos — sin credenciales hardcodeadas. RLS mantenido: el cron opera internamente sobre `perfiles`; no expone datos de un usuario a otro.
- **TSC:** cero errores.
- **Linter:** cero warnings.
- **Nota UI:** `tarjeta-recordatorio.tsx`, `lista-recordatorios.tsx`, `settings/page.tsx` y `[slug]/page.tsx` modificados — requiere validacion visual en navegador.
