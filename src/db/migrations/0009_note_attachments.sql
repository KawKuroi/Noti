-- Migración 0009: tabla de adjuntos para cuadernos de notas
-- Soporta imágenes, audios, documentos y videos (Fases 22.A–22.D)
-- Aplicar manualmente en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS note_attachments (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  cuaderno_id   UUID         NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
  tipo          TEXT         NOT NULL CHECK (tipo IN ('imagen', 'audio', 'documento', 'video')),
  url           TEXT         NOT NULL,
  nombre_archivo TEXT        NOT NULL,
  mime          TEXT         NOT NULL,
  tamano        INTEGER      NOT NULL,
  creado_en     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_note_attachments_cuaderno
  ON note_attachments(cuaderno_id);

ALTER TABLE note_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios ven sus adjuntos"
  ON note_attachments
  FOR ALL
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
