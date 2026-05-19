# CURRENT — Noti

> Este archivo cambia frecuentemente. Refleja el estado real del proyecto hoy.
> Actualízalo al empezar y terminar cada sesión de trabajo.

## Fase activa

**Activo:** Fase 11 — Calendario - bugfix vista semana y filtro por categoria
**Estado general:** Fases 0–10 completadas (Fase 10 pdte pruebas manuales). Comenzando Fase 11.

## Pendientes manuales bloqueantes

- [ ] Aplicar migración `src/db/migrations/0003_lanzamientos.sql` en el SQL Editor de Supabase (requerida para que Fase 8 funcione correctamente en producción)
- [ ] `getCategorias` usa `unstable_cache({ revalidate: false })` — tras el deploy, limpiar caché en Vercel o hacer redeploy para que la categoría `notes` aparezca en el sidebar

## Tareas de Fase 11

**Objetivo:** corregir el bug de navegacion en vista semana (no trae los recordatorios correctos) y permitir filtrar el calendario por categoria. Arreglar error grafico en fechas de la semana (ej: semana del 17-17 de mayo en lugar de 11-17 de mayo) al navegar de mes a semana.

- [ ] Cambiar query param de `/calendar` de `?mes=YYYY-MM` a `?fecha=YYYY-MM-DD` para que vista semana fetchee el rango correcto
- [ ] Actualizar `src/app/(dashboard)/calendar/page.tsx` para parsear `fecha`; mantener fallback con `mes`
- [ ] Actualizar `vista-calendario.tsx` (`navegar`, `irAHoy`, `cambiarVista`) para construir el nuevo param
- [ ] Nuevo componente `src/components/features/calendar/filtro-calendario.tsx` (pills multi-select por categoria)
- [ ] Estado de filtro en `VistaCalendario`; filtrar `recordatorios` antes de pasar a `VistaMes` / `VistaSemana`

**Done when:** Navegar entre semanas trae los recordatorios reales de cada semana. Puedo activar/desactivar categorias en el filtro y los dots (mes) o bloques (semana) responden.

## Deuda técnica conocida

- Pomodoro sigue en el codebase — se elimina en Fase 15 (baja prioridad ahora)
- La migración `0003_lanzamientos.sql` requiere aplicación manual en Supabase
