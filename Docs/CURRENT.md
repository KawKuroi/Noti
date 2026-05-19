# CURRENT — Noti

> Este archivo cambia frecuentemente. Refleja el estado real del proyecto hoy.
> Actualízalo al empezar y terminar cada sesión de trabajo.

## Fase activa

**Activo:** Próxima — Fase 13 (auto-eliminación de tareas, ya parcialmente implementada) o Fase 14 (audio en asistente).
**Estado general:** Fases 0–12 completadas. Refactor de IA de lanzamientos resuelto el bug de fechas inventadas y unificó el chat en una sola superficie global.

## Pendientes manuales bloqueantes

- [ ] Aplicar migración `src/db/migrations/0003_lanzamientos.sql` en el SQL Editor de Supabase (requerida para que Fase 8 funcione correctamente en producción)
- [ ] `getCategorias` usa `unstable_cache({ revalidate: false })` — tras el deploy, limpiar caché en Vercel o hacer redeploy para que la categoría `notes` aparezca en el sidebar

## Pruebas manuales pendientes para validar el refactor

- [ ] "Lanzamiento de GTA 6" devuelve resultado de RAWG con badge tentativa y permite editar fecha (no debe aparecer `${año+1}-12-31`).
- [ ] "Nuevo álbum de The Weeknd" invoca `buscarProximoLanzamiento` con tipo=album.
- [ ] "Cuándo sale el nuevo Zelda" invoca `buscarProximoLanzamiento` con tipo=game.
- [ ] "Cumpleaños de Marta el 21 de junio" crea recordatorio recurrente anual sin tocar APIs externas.
- [ ] Persistencia: abrir asistente en `/inicio`, navegar a `/calendar`, volver a abrir → historial intacto. Refrescar F5 → historial sobrevive (sessionStorage). Cerrar pestaña → historial se borra.
- [ ] `Ctrl+I` abre/cierra el bottom sheet desde cualquier ruta.

## Deuda técnica conocida

- Pomodoro sigue en el codebase — se elimina en Fase 15 (baja prioridad ahora)
- La migración `0003_lanzamientos.sql` requiere aplicación manual en Supabase
- `/api/ai/recordatorio` ya no lo invoca el cliente. Mantener por compatibilidad; eliminarlo en una iteración futura tras confirmar que nada lo usa.
