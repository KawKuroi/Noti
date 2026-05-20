ALTER TABLE profiles ADD COLUMN auto_delete_completed_tasks_days integer;
ALTER TABLE reminders ADD COLUMN completed_at timestamp with time zone;
CREATE INDEX idx_reminders_completed_at ON reminders (completed_at) WHERE is_completed = true;
