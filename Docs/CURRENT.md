# CURRENT — Noti

> Este archivo cambia frecuentemente. Refleja el estado real del proyecto hoy.
> Actualízalo al empezar y terminar cada sesión de trabajo.

## Fase activa

**Activo:** Fase 12 — Rediseño del asistente IA
**Estado general:** Fases 0–11 completadas. Arrancando Fase 12 (requiere prototipado y decisión UX).

## Pendientes manuales bloqueantes

- [ ] Aplicar migración `src/db/migrations/0003_lanzamientos.sql` en el SQL Editor de Supabase (requerida para que Fase 8 funcione correctamente en producción)
- [ ] `getCategorias` usa `unstable_cache({ revalidate: false })` — tras el deploy, limpiar caché en Vercel o hacer redeploy para que la categoría `notes` aparezca en el sidebar

## Tareas de Fase 12

**Objetivo:** sacar el asistente IA del flujo principal del dashboard para que sea opcional y no domine la lista de recordatorios. Esta fase **arranca con prototipos** para que el usuario elija el diseño final entre varias opciones.

### Opciones a prototipar
- **A)** FAB (Floating Action Button) con sparkles + bottom sheet
- **B)** Botón sparkles en el header + dialog centrado (atajo Ctrl+I)
- **C)** Ruta dedicada `/asistente` con chat full-page
- **D)** Híbrida: botón en header + ruta dedicada

### Implementación (tras elección)
- [ ] Prototipos rápidos de 2-3 opciones con dummy data
- [ ] Decisión del diseño final
- [ ] Extraer lógica reutilizable de `asistente-ia.tsx` a hook o componente headless
- [ ] Quitar `<AsistenteIA />` de `src/app/(dashboard)/inicio/page.tsx`
- [ ] Mover `asistente-ia.tsx` desde `reminders/` a `features/asistente/` para reflejar independencia
- [ ] Integrar botón de audio (Fase 14) en el nuevo contenedor
- [ ] Tooltip o tour breve para descubrimiento la primera vez

**Done when:** El dashboard de inicio se ve limpio (solo lista de recordatorios + filtros). Se puede invocar el asistente IA desde cualquier ruta con uno o dos clicks o atajo de teclado. Crear con IA funciona idéntico al actual.

## Deuda técnica conocida

- Pomodoro sigue en el codebase — se elimina en Fase 15 (baja prioridad ahora)
- La migración `0003_lanzamientos.sql` requiere aplicación manual en Supabase
