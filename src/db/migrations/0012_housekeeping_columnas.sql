-- Migracion 0012 (manual — aplicar en el SQL Editor de Supabase)
-- Housekeeping de columnas huerfanas detectadas en la revision de junio 2026:
--   - profiles.sound_enabled: quedo sin uso al retirar Pomodoro (Fase 13)
--   - reminders.image_url: quedo sin uso desde Fase 16 (portadas no persistentes)
-- Ambas ya no existen en src/db/schema.ts; este DROP alinea la BD real.

ALTER TABLE profiles DROP COLUMN IF EXISTS sound_enabled;
ALTER TABLE reminders DROP COLUMN IF EXISTS image_url;
