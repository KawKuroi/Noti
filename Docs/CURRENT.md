# CURRENT — Noti

> Refleja el estado real del proyecto hoy. El historial detallado de fases completadas vive en `git log` y en `Docs/ROADMAP.md` (one-liner por fase).
> Actualizar al empezar y al terminar cada sesion.

## Fase activa

**En progreso:** Fase 25 (Instalacion PWA nativa).
**Estado:** Fases 0-24 completadas. Fase 25 planificada, todo pendiente.

El detalle de sub-fases de 25 vive en `Docs/ROADMAP.md`.

## Fase 25 — notas de implementacion

Sub-fases completadas en esta sesion:
- 25.1 PNGs generados: icon-192.png, icon-512.png, icon-maskable-512.png, icon-180.png (via sharp-cli desde icon-512.svg)
- 25.2 Hook `src/hooks/use-pwa-install.ts` creado
- 25.3 Componente `src/components/features/install-prompt.tsx` creado (3 ramas: nativo / iOS 16.4+ / iOS antiguo)
- 25.4 Seccion "Aplicacion" en `/settings` con `formulario-instalacion.tsx`
- 25.5 Namespace `Instalacion` en `messages/es.json` y `messages/en.json`; SW ajustado (SVG → PNG en icon/badge)
- manifest.json y layout.tsx actualizados con PNGs

Pendiente manual:
- Tomar screenshots reales (wide 1280x720, mobile 750x1334) y colocarlas en `public/screenshots/`, luego poblar `screenshots[]` en manifest.json
- Verificacion Lighthouse PWA (sub-fase 25.6): debe pasar a "Installable"

## Pendientes manuales bloqueantes

- [ ] Agregar `BLOB_READ_WRITE_TOKEN` en Vercel → Settings → Environment Variables (obtenida en Vercel → Storage → Blob).

## Pruebas manuales pendientes

- [ ] Fase 18 — "Lanzamiento de GTA 6 nov 19" muestra fecha 19 noviembre en la card de candidatos y permite editar todos los campos antes de confirmar.
- [ ] Fase 19 — Boton "Ver en GitHub" en hero del landing y link en footer abren el repo en nueva pestana.

## Deuda tecnica conocida

- Columna `sound_enabled` en `profiles` quedo huerfana tras retirar Pomodoro (Fase 13). Housekeeping futuro.
- Columna `image_url` en `reminders` quedo huerfana tras Fase 16 (portadas no persistentes). Housekeeping futuro.
- `/api/ai/recordatorio` ya no lo invoca el cliente. Mantener por compatibilidad; eliminar tras confirmar que nada lo usa.
