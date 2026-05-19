# CURRENT — Noti

> Este archivo cambia frecuentemente. Refleja el estado real del proyecto hoy.
> Actualízalo al empezar y terminar cada sesión de trabajo.

## Fase activa

**Activo:** Fase 14 (Bugfixes críticos + refactor de categorías). Bloquea al resto del plan porque cambia categorías y modelo de datos.
**Estado general:** Fases 0–13 completadas. La nueva ola priorizada va de Fase 14 a Fase 19 (ver `ROADMAP.md`).

## Pendientes manuales bloqueantes

- [ ] Aplicar migración `src/db/migrations/0003_lanzamientos.sql` en el SQL Editor de Supabase (requerida para que Fase 8 funcione correctamente en producción)
- [ ] Aplicar migración `src/db/migrations/0007_fusion_classes_study.sql` cuando se implemente la Fase 14
- [ ] `getCategorias` usa `unstable_cache({ revalidate: false })` — tras el deploy, limpiar caché en Vercel o hacer redeploy para que los cambios de categorías de la Fase 14 se reflejen en el sidebar

## Pruebas manuales pendientes para validar la nueva ola

- [ ] **Fase 14 — Recurrencia**: Crear una clase recurrente "Clase de inglés los lunes 14:00". Abrir el calendario y verificar que el dialog del día lunes muestra UNA sola entrada (no 400).
- [ ] **Fase 14 — Notas**: Crear nota desde el formulario manual con título "Probar" y cuerpo "test". Confirmar que aparece en `/notes` y se puede abrir.
- [ ] **Fase 14 — Fusión**: Recordatorios viejos con categoría `classes` aparecen ahora bajo `study` en el sidebar. La categoría `classes` no aparece en filtros, formulario ni asistente.
- [ ] **Fase 14 — Rename**: Donde decía "Tareas" ahora dice "Pendientes" (sidebar, filtros, formulario, asistente).
- [ ] **Fase 14 — Recurrentes sin checkbox**: Una clase semanal y un cumpleaños anual no muestran checkbox en su card; sí muestran botones editar/eliminar.
- [ ] **Fase 15 — Sidebar**: Grupo "Herramientas" agrupa Calendario + Notas. Icono de lupa en sidebar abre Ctrl+K. Footer muestra nombre del usuario + engranaje. Cerrar sesión vive en `/settings`.
- [ ] **Fase 16 — Lanzamientos**: Pestaña "Todos" en `/lanzamientos`. Cards diferenciadas por color (negro/azul/verde/rojo/morado). Formulario manual pide artista/autor/descripción. Las portadas se ven en el palette IA pero la card guardada no muestra portada.
- [ ] **Fase 17 — Inicio**: Saludo dinámico, input IA grande, próximos recordatorios, mini-calendario lateral y chips de categorías visibles al entrar a `/inicio`.
- [ ] **Fase 18 — IA fechas**: "Lanzamiento de GTA 6 nov 19" → la card de candidatos muestra fecha 19 noviembre. La card de edición permite cambiar cualquier campo antes de confirmar.
- [ ] **Fase 19 — Landing**: Botón "Ver en GitHub" en hero y link en footer abren el repo en nueva pestaña.

## Deuda técnica conocida

- La columna `sound_enabled` en `profiles` queda huérfana tras eliminar Pomodoro — housekeeping futuro
- La columna `image_url` en `reminders` queda huérfana tras la Fase 16 (decisión: portadas no persistentes) — housekeeping futuro
- La migración `0003_lanzamientos.sql` requiere aplicación manual en Supabase
- `/api/ai/recordatorio` ya no lo invoca el cliente. Mantener por compatibilidad; eliminarlo en una iteración futura tras confirmar que nada lo usa.
