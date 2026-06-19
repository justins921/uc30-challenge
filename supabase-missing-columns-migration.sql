-- UC30 Missing Columns Migration
-- Adds columns referenced by storage.js but not created by prior migrations.

ALTER TABLE participants ADD COLUMN IF NOT EXISTS is_developer BOOLEAN DEFAULT FALSE;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS social_handles JSONB;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS getting_started_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
