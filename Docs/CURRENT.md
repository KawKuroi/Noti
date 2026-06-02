# CURRENT — Noti

> Refleja el estado real del proyecto hoy. El historial detallado de fases completadas vive en `git log` y en `Docs/ROADMAP.md` (one-liner por fase).
> Actualizar al empezar y al terminar cada sesion.

## Fase activa

**En progreso:** Fase 25 (Instalacion PWA nativa).
**Estado:** Fases 0-24 completadas. Fase 25 planificada, todo pendiente.

El detalle de sub-fases de 25 vive en `Docs/ROADMAP.md`.

## Fase 25 — notas de implementacion

Auditoria previa: el Service Worker y el manifest ya cubren ~70% del trabajo. Falta: iconos PNG maskables, hook `use-pwa-install`, banner `<InstallPrompt />`, seccion en `/settings`, i18n namespace `Instalacion`, y ajustar `showNotification` en el SW (SVG → PNG para que Windows lo renderice en el centro de notificaciones).

## Pendientes manuales bloqueantes

- [ ] Agregar `BLOB_READ_WRITE_TOKEN` en Vercel → Settings → Environment Variables (obtenida en Vercel → Storage → Blob).

## Pruebas manuales pendientes

- [ ] Fase 18 — "Lanzamiento de GTA 6 nov 19" muestra fecha 19 noviembre en la card de candidatos y permite editar todos los campos antes de confirmar.
- [ ] Fase 19 — Boton "Ver en GitHub" en hero del landing y link en footer abren el repo en nueva pestana.

## Deuda tecnica conocida

- Columna `sound_enabled` en `profiles` quedo huerfana tras retirar Pomodoro (Fase 13). Housekeeping futuro.
- Columna `image_url` en `reminders` quedo huerfana tras Fase 16 (portadas no persistentes). Housekeeping futuro.
- `/api/ai/recordatorio` ya no lo invoca el cliente. Mantener por compatibilidad; eliminar tras confirmar que nada lo usa.
