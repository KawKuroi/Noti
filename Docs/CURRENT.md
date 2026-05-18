# CURRENT — Noti

> Este archivo cambia frecuentemente. Refleja el estado real del proyecto hoy.
> Actualízalo al empezar y terminar cada sesión de trabajo.

## Fase activa

**Activo:** Fase 10 — Refinar búsqueda y modelo IA para lanzamientos
**Estado general:** Fases 0–9 completadas. Fase 10 implementada, pendiente pruebas manuales.

## Pendientes manuales bloqueantes

- [ ] Aplicar migración `src/db/migrations/0003_lanzamientos.sql` en el SQL Editor de Supabase (requerida para que Fase 8 funcione correctamente en producción)
- [ ] `getCategorias` usa `unstable_cache({ revalidate: false })` — tras el deploy, limpiar caché en Vercel o hacer redeploy para que la categoría `notes` aparezca en el sidebar

## Pendientes manuales de Fase 10

- [ ] Validar al menos 8 de las 10 consultas de prueba del ROADMAP
- [ ] Evaluar modelos alternativos en Groq (benchmark 10 consultas): `qwen/qwen3-32b` o `moonshotai/kimi-k2-instruct-0905`

## Deuda técnica conocida

- Pomodoro sigue en el codebase — se elimina en Fase 15 (baja prioridad ahora)
- La migración `0003_lanzamientos.sql` requiere aplicación manual en Supabase
