-- Pipeline Mode migration
-- Adds post-failure continued access fields to participants

ALTER TABLE participants ADD COLUMN IF NOT EXISTS pipeline_mode BOOLEAN DEFAULT FALSE;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS pipeline_mode_streak INTEGER DEFAULT 0;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS pipeline_mode_activated_at TIMESTAMPTZ;
