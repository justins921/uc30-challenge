-- ═══════════════════════════════════════════════════════════════════
-- UC30 Capital & Strategy Finder + Confidence Survey Migration
-- Run this in the Supabase SQL Editor.
--
-- Adds two JSONB columns to participants so the Capital & Strategy Finder
-- results and the Confidence Survey assessments persist and sync across
-- devices (instead of living only in the browser).
--
-- Safe to run multiple times — uses IF NOT EXISTS.
-- ═══════════════════════════════════════════════════════════════════

-- Stores the Capital & Strategy Finder answers + computed snapshot
-- Shape: { answers: { CASH, LIVE_IN, INCOME, CREDIT, EQUITY, PARTNER, RESERVES, RENO }, computedAt }
ALTER TABLE participants ADD COLUMN IF NOT EXISTS capital_strategy JSONB;

-- Stores the array of Confidence Survey assessments (baseline + weekly checkpoints)
-- Shape: [ { checkpoint, submitted_at, ratings, reflections }, ... ]
ALTER TABLE participants ADD COLUMN IF NOT EXISTS confidence_surveys JSONB DEFAULT '[]'::jsonb;
