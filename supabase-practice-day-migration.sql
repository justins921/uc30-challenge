-- Practice Day Migration
-- Adds practice_day_completed tracking columns to participants table

ALTER TABLE participants
ADD COLUMN IF NOT EXISTS practice_day_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS practice_day_completed_at TIMESTAMPTZ;
