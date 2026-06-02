-- Zona de peligro: soft delete de cuentas y recordatorios con ventana de recuperacion de 30 dias

ALTER TABLE profiles ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE reminders ADD COLUMN deleted_at TIMESTAMPTZ;

CREATE TABLE recovery_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('cuenta', 'recordatorios')),
  token TEXT NOT NULL UNIQUE,
  metadatos JSONB,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recovery_tokens_token ON recovery_tokens(token);
CREATE INDEX idx_recovery_tokens_user_id ON recovery_tokens(user_id);
