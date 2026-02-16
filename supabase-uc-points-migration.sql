-- UC Points System Migration
-- Run this in Supabase SQL Editor after supabase-auth-migration.sql

-- Add uc_points column for fast leaderboard queries
ALTER TABLE participants ADD COLUMN IF NOT EXISTS uc_points INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_participants_uc_points ON participants (uc_points DESC);

-- Add onboarding fields
ALTER TABLE participants ADD COLUMN IF NOT EXISTS buy_box JSONB;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS commitment_declared_at TIMESTAMPTZ;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
