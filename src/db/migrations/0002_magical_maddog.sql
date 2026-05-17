ALTER TABLE "profiles" ADD COLUMN "daily_summary" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "summary_hour" text DEFAULT '07:00' NOT NULL;