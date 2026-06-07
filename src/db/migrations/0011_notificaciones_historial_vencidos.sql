-- Historial de notificaciones (centro de notificaciones tipo campana)
-- Guarda el titulo/cuerpo enviados para que el historial sobreviva al borrado del recordatorio.
ALTER TABLE notification_log ADD COLUMN title text;
ALTER TABLE notification_log ADD COLUMN body text;
ALTER TABLE notification_log ADD COLUMN read_at timestamp with time zone;
CREATE INDEX idx_notification_log_user_sent ON notification_log (user_id, sent_at DESC);

-- Autoeliminacion de recordatorios vencidos (no recurrentes con fecha fija pasada).
-- Regla separada de auto_delete_completed_tasks_days. Null = nunca.
ALTER TABLE profiles ADD COLUMN auto_delete_overdue_days integer;
