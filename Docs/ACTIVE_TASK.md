# Tarea activa

## Solicitud original (usuario, 2026-05-21)

> Fase 23 en orden — segundo item: Optimistic updates en completar/eliminar

## 1. Contexto y Archivos Afectados

React 19 provee `useOptimistic` para mostrar el estado optimista mientras una
transicion esta pendiente, y revertirlo automaticamente si falla.

- Completar: el checkbox y el tachado de la tarjeta deben responder de inmediato
  al click, sin esperar al servidor. Si falla, revierte visualmente.
- Eliminar: la tarjeta debe desaparecer del DOM de inmediato al confirmar, sin
  esperar al servidor. Si falla, reaparece.

Toda la logica vive en `TarjetaRecordatorio`. El estado `cargando` se reemplaza
por el flag `pending` de `useTransition`, que deshabilita botones mientras la
transicion esta en curso.

Archivos directamente involucrados (1):
- `src/components/features/reminders/tarjeta-recordatorio.tsx` — agregar useOptimistic + useTransition; eliminar estado cargando; actualizar manejarCompletar y confirmarEliminar

## 3. Reporte de Pruebas

**Estado:** [APROBADO]

- **Cumplimiento funcional:** `useOptimistic` para `estaCompletado` (toggle inmediato del checkbox y tachado); `useOptimistic` para `eliminado` (early return null antes del JSX); `useTransition` reemplaza el estado `cargando`; `confirmarEliminar` y `manejarCompletar` envueltos en `startTransition`; `etiquetaAutoDelete` usa `estaCompletado` optimista; botones usan `disabled={pending}`.
- **Español absoluto:** `estaCompletado`, `actualizarCompletado`, `eliminado`, `marcarEliminado`, `pending`, `startTransition` — identificadores en español o neutros.
- **Seguridad:** sin secretos; sin `any`.
- **TSC:** cero errores.
- **Linter:** cero warnings.
- **Nota UI:** `.tsx` bajo `src/components/features/reminders/` — requiere validación visual en navegador.

## 2. Plan de Accion Detallado

### Bloque 1 - Optimistic updates en TarjetaRecordatorio

- [x] **Paso 1: `src/components/features/reminders/tarjeta-recordatorio.tsx`** Reemplazar `useState(false)` de cargando por `useTransition()`. Agregar `useOptimistic(recordatorio.estaCompletado, ...)` para estado optimista del completado. Agregar `useOptimistic(false, ...)` para estado optimista de eliminado. Agregar early return `if (eliminado) return null` antes del JSX. Actualizar `manejarCompletar` para envolver en `startTransition` y llamar `actualizarCompletado(!recordatorio.estaCompletado)` antes del await. Actualizar `confirmarEliminar` para envolver en `startTransition` y llamar `marcarEliminado(true)` antes del await. Reemplazar todas las referencias a `recordatorio.estaCompletado` en el JSX por `estaCompletado` (el valor optimista). Reemplazar `disabled={cargando}` por `disabled={pending}`.
