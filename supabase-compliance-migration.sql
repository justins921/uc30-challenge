-- UC30 Challenge — Daily Compliance System
-- Run this in your Supabase SQL Editor.
-- Safe to re-run — uses IF NOT EXISTS everywhere.

-- ─────────────────────────────────────────────────────────────────
-- 1. daily_submissions table — one row per user per challenge day
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  auth_id UUID,
  challenge_day INTEGER NOT NULL,
  submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- The 7 metrics
  training_completed BOOLEAN DEFAULT FALSE,
  properties_analyzed INTEGER DEFAULT 0,
  arsenal_contacts INTEGER DEFAULT 0,
  target_contacts INTEGER DEFAULT 0,
  follow_ups INTEGER DEFAULT 0,
  offers_submitted INTEGER DEFAULT 0,
  properties_under_contract INTEGER DEFAULT 0,

  -- Compliance result (computed at submission time)
  met_daily_minimum BOOLEAN DEFAULT FALSE,

  -- Proof/notes
  proof_text TEXT,

  -- Upsert key: one submission per user per challenge day
  UNIQUE(participant_id, challenge_day)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_submissions_participant
  ON daily_submissions (participant_id);
CREATE INDEX IF NOT EXISTS idx_daily_submissions_auth_id
  ON daily_submissions (auth_id);
CREATE INDEX IF NOT EXISTS idx_daily_submissions_day
  ON daily_submissions (challenge_day);
CREATE INDEX IF NOT EXISTS idx_daily_submissions_date
  ON daily_submissions (submission_date);

-- Enable RLS
ALTER TABLE daily_submissions ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own submissions
DROP POLICY IF EXISTS "Users manage own submissions" ON daily_submissions;
CREATE POLICY "Users manage own submissions" ON daily_submissions
  FOR ALL USING (
    auth_id = auth.uid() OR public.is_admin()
  );

-- Admins can read all submissions
DROP POLICY IF EXISTS "Admins read all submissions" ON daily_submissions;
CREATE POLICY "Admins read all submissions" ON daily_submissions
  FOR SELECT USING (public.is_admin());

-- Allow insert for authenticated users (their own)
DROP POLICY IF EXISTS "Users insert own submissions" ON daily_submissions;
CREATE POLICY "Users insert own submissions" ON daily_submissions
  FOR INSERT WITH CHECK (auth_id = auth.uid());

-- Allow update for authenticated users (their own, before deadline)
DROP POLICY IF EXISTS "Users update own submissions" ON daily_submissions;
CREATE POLICY "Users update own submissions" ON daily_submissions
  FOR UPDATE USING (auth_id = auth.uid());


-- ─────────────────────────────────────────────────────────────────
-- 2. removal_log table — tracks all removals and reactivations
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS removal_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  auth_id UUID,
  reason TEXT NOT NULL,  -- 'missed_deadline', 'failed_daily_minimum', 'failed_weekly_minimum', 'manual'
  details TEXT,          -- human-readable explanation
  challenge_day INTEGER,
  week_number INTEGER,
  removed_at TIMESTAMPTZ DEFAULT NOW(),
  reactivated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_removal_log_participant
  ON removal_log (participant_id);

ALTER TABLE removal_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own removal log" ON removal_log;
CREATE POLICY "Users read own removal log" ON removal_log
  FOR SELECT USING (auth_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "System insert removal log" ON removal_log;
CREATE POLICY "System insert removal log" ON removal_log
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage removal log" ON removal_log;
CREATE POLICY "Admin manage removal log" ON removal_log
  FOR ALL USING (public.is_admin());


-- ─────────────────────────────────────────────────────────────────
-- 3. Seed default compliance settings into the existing settings table
--    Using the existing key-value pattern.
-- ─────────────────────────────────────────────────────────────────
INSERT INTO settings (key, value) VALUES
  ('compliance_daily_minimums', '{
    "training_completed": true,
    "properties_analyzed": 1,
    "arsenal_contacts": 1,
    "target_contacts": 1,
    "follow_ups": 1,
    "offers_submitted": 0,
    "properties_under_contract": 0
  }'::jsonb),
  ('compliance_weekly_minimums', '{
    "training_completed": 7,
    "properties_analyzed": 5,
    "arsenal_contacts": 3,
    "target_contacts": 5,
    "follow_ups": 5,
    "offers_submitted": 1,
    "properties_under_contract": 0
  }'::jsonb),
  ('compliance_enforcement', '{
    "timezone": "America/Los_Angeles",
    "daily_deadline_hour": 23,
    "weekly_deadline_day": 0,
    "enabled": true
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;
