-- ═══════════════════════════════════════════════════════════════════
-- UC30 Readiness Self-Assessment Migration
-- Run this in the Supabase SQL Editor.
--
-- Adds a JSONB column to participants so the Readiness Self-Assessment
-- (10 statements, scored /100) persists and syncs across devices.
-- Taken at three checkpoints: baseline (before modules), post_training
-- (before Day 1), and final (after Day 30).
--
-- Shape: [ { checkpoint, total, scores: {clarity, analysis, ...}, submitted_at }, ... ]
--
-- Safe to run multiple times — uses IF NOT EXISTS.
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE participants ADD COLUMN IF NOT EXISTS readiness_assessments JSONB DEFAULT '[]'::jsonb;
