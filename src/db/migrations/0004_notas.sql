-- Fase 9: Categoria Notas
-- Agregar categoria notes e inutilizar restriccion NOT NULL en due_date y notify_at

INSERT INTO categories (slug, name, icon, color)
VALUES ('notes', 'Notas', 'StickyNote', '#6366F1')
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE reminders ALTER COLUMN due_date DROP NOT NULL;
ALTER TABLE reminders ALTER COLUMN notify_at DROP NOT NULL;
