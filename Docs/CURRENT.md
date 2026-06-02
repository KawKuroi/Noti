# CURRENT — Noti

> Refleja el estado real del proyecto hoy. El historial detallado de fases completadas vive en `git log` y en `Docs/ROADMAP.md` (one-liner por fase).
> Actualizar al empezar y al terminar cada sesion.

## Fase activa

**En progreso:** Fase 24 (Zona de peligro — soft delete cuenta + recordatorios) y Fase 25 (Instalacion PWA nativa) en paralelo.
**Estado:** Fases 0-23 completadas. Fase 24.1 (BD) hecho; resto pendiente. Fase 25 planificada el 2026-06-02, todo pendiente.

El detalle de sub-fases de 24 y 25 vive en `Docs/ROADMAP.md`.

## Fase 25 — notas de implementacion

Auditoria previa: el Service Worker y el manifest ya cubren ~70% del trabajo. Falta: iconos PNG maskables, hook `use-pwa-install`, banner `<InstallPrompt />`, seccion en `/settings`, i18n namespace `Instalacion`, y ajustar `showNotification` en el SW (SVG → PNG para que Windows lo renderice en el centro de notificaciones).

## Archivos clave de la implementacion en curso

Fase 24 (Zona de peligro):
- `src/db/schema.ts` — `eliminadoEn` en `perfiles` y `recordatorios`; tabla `tokensRecuperacion`
- `src/db/migrations/0010_soft_delete_cuenta.sql` — requiere aplicacion manual en Supabase
- `src/types/user.types.ts` — `eliminadoEn` en interfaz `Perfil`
- `src/lib/actions/user.actions.ts` — `softDeleteCuenta`, `softDeleteRecordatorios`
- `src/lib/services/email-templates.ts` — HTML de correos de recuperacion
- `src/app/api/auth/recuperar/route.ts` — endpoint de recuperacion
- `src/app/api/cron/limpiar-eliminados/route.ts` — cron de borrado definitivo a los 30 dias
- `src/components/features/settings/boton-borrar-cuenta.tsx`
- `src/components/features/settings/boton-borrar-recordatorios.tsx`
- `src/app/(dashboard)/settings/page.tsx` — seccion "Zona de peligro"
- `vercel.json` — cron `limpiar-eliminados`

## Pendientes manuales bloqueantes

- [ ] Aplicar `src/db/migrations/0003_lanzamientos.sql` en el SQL Editor de Supabase (Fase 8 en produccion).
- [ ] Aplicar `src/db/migrations/0006_auto_delete_tasks.sql` en el SQL Editor de Supabase (Fase 20 en produccion).
- [ ] Aplicar `src/db/migrations/0008_note_entries.sql` en el SQL Editor de Supabase (Fase 22.0 en produccion).
- [ ] Aplicar `src/db/migrations/0009_note_attachments.sql` en el SQL Editor de Supabase (Fase 22 en produccion).
- [ ] Aplicar `src/db/migrations/0010_soft_delete_cuenta.sql` en el SQL Editor de Supabase (Fase 24 en curso).
- [ ] Agregar `BLOB_READ_WRITE_TOKEN` en Vercel → Settings → Environment Variables (obtenida en Vercel → Storage → Blob).
- [ ] Tras deploy de Fase 14, invalidar el cache de `getCategorias` (usa `unstable_cache({ revalidate: false })`) con redeploy o flush.

## Pruebas manuales pendientes

- [ ] Fase 18 — "Lanzamiento de GTA 6 nov 19" muestra fecha 19 noviembre en la card de candidatos y permite editar todos los campos antes de confirmar.
- [ ] Fase 19 — Boton "Ver en GitHub" en hero del landing y link en footer abren el repo en nueva pestana.

## Deuda tecnica conocida

- Columna `sound_enabled` en `profiles` quedo huerfana tras retirar Pomodoro (Fase 13). Housekeeping futuro.
- Columna `image_url` en `reminders` quedo huerfana tras Fase 16 (portadas no persistentes). Housekeeping futuro.
- `/api/ai/recordatorio` ya no lo invoca el cliente. Mantener por compatibilidad; eliminar tras confirmar que nada lo usa.
