-- ═══════════════════════════════════════════════════════════════════
-- UC30 Weekly Check-In Migration
-- Run this in the Supabase SQL Editor.
--
-- Adds a JSONB column to participants for the end-of-week pulse check
-- (offers landing, hardest part, confidence, momentum, wins, and whether
-- they want someone to reach out). One record per week (week_1..week_4).
--
-- Shape: [ { week, day, offersLanding, hardest:[...], thinkingOfStopping,
--            hardestNote, confidence, momentum, wins:[...], winsNote,
--            wantReachOut, reachOutHow, submitted_at }, ... ]
--
-- Safe to run multiple times — uses IF NOT EXISTS.
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE participants ADD COLUMN IF NOT EXISTS weekly_checkins JSONB DEFAULT '[]'::jsonb;
