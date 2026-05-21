-- Fase 22.0: Reestructuracion de notas — tabla de entradas por cuaderno

CREATE TABLE IF NOT EXISTS note_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cuaderno_id UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_note_entries_cuaderno ON note_entries(cuaderno_id);

ALTER TABLE note_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios ven sus entradas"
  ON note_entries FOR ALL
  USING (
    cuaderno_id IN (
      SELECT id FROM reminders WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    cuaderno_id IN (
      SELECT id FROM reminders WHERE user_id = auth.uid()
    )
  );

-- Migrar descripciones existentes como primera entrada de cada cuaderno
INSERT INTO note_entries (cuaderno_id, content, created_at, updated_at)
SELECT r.id, r.description, r.created_at, r.updated_at
FROM reminders r
JOIN categories c ON r.category_id = c.id
WHERE c.slug = 'notes'
  AND r.description IS NOT NULL
  AND r.description != '';
