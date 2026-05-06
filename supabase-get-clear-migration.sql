-- ═══════════════════════════════════════════════════════════════════
-- UC30 Get Clear Migration
-- Run this in Supabase SQL Editor.
-- Adds get_clear JSONB column to participants table.
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE participants ADD COLUMN IF NOT EXISTS get_clear JSONB;
