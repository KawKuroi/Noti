ALTER TABLE "reminders" ALTER COLUMN "due_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reminders" ALTER COLUMN "notify_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "sound_enabled";