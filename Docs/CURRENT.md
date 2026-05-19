# CURRENT — Noti

> Este archivo cambia frecuentemente. Refleja el estado real del proyecto hoy.
> Actualízalo al empezar y terminar cada sesión de trabajo.

## Fase activa

**Activo:** Próxima — Fase 14 (auto-eliminación de tareas completadas) o Fase 15 (audio en asistente).
**Estado general:** Fases 0–13 completadas. La Fase 13 eliminó Pomodoro del producto (sidebar, manifest, settings, landing, componentes, hooks, utils, API route).

## Pendientes manuales bloqueantes

- [ ] Aplicar migración `src/db/migrations/0003_lanzamientos.sql` en el SQL Editor de Supabase (requerida para que Fase 8 funcione correctamente en producción)
- [ ] `getCategorias` usa `unstable_cache({ revalidate: false })` — tras el deploy, limpiar caché en Vercel o hacer redeploy para que la categoría `notes` aparezca en el sidebar

## Pruebas manuales pendientes para validar el refactor

- [ ] "Lanzamiento de GTA 6" → palette muestra 3-5 candidatos de RAWG; GTA VI aparece y permite editar fecha si está marcado como tentativa.
- [ ] "Nuevo álbum de The Weeknd" → candidatos de MusicBrainz (próximos álbumes del artista).
- [ ] "Cuándo sale el nuevo Zelda" → candidatos de RAWG con fechas futuras de la franquicia.
- [ ] "Cumpleaños de Marta el 21 de junio" → card de extracción con `categoriaSlug=birthdays`, recurrencia `yearly:21-06`. Enter crea sin tocar APIs.
- [ ] "Halo 47" → palette muestra "No encontré candidatos".
- [ ] "asdf" → palette muestra mensaje de aclaración.
- [ ] `Ctrl+I` abre/cierra el palette desde cualquier ruta del dashboard.
- [ ] Persistencia: query + extracción + candidatos sobreviven a navegación entre pestañas y F5 (sessionStorage). Botón "Limpiar" los borra.
- [ ] Navegación con teclado: ↑/↓ selecciona candidato, Enter agrega.

## Deuda técnica conocida

- La columna `sound_enabled` en `profiles` queda huérfana tras eliminar Pomodoro — housekeeping futuro
- La migración `0003_lanzamientos.sql` requiere aplicación manual en Supabase
- `/api/ai/recordatorio` ya no lo invoca el cliente. Mantener por compatibilidad; eliminarlo en una iteración futura tras confirmar que nada lo usa.
