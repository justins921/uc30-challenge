-- ══════════════════════════════════════════════════════════════
-- UC30 Quiz System Migration
-- Run this in Supabase SQL Editor after previous migrations
-- ══════════════════════════════════════════════════════════════

-- Quiz attempt tracking
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id TEXT PRIMARY KEY,
  participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  scenario_id TEXT NOT NULL,
  attempt_number INTEGER NOT NULL,
  answers JSONB NOT NULL,
  correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own quiz_attempts" ON quiz_attempts
  FOR SELECT USING (
    participant_id IN (
      SELECT id FROM participants WHERE auth_id = auth.uid()
    )
    OR public.is_admin()
  );

CREATE POLICY "Users insert own quiz_attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (
    participant_id IN (
      SELECT id FROM participants WHERE auth_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_participant_day
  ON quiz_attempts (participant_id, day_number);
