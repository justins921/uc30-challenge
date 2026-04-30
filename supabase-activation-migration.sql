-- ══════════════════════════════════════════════════════════════
-- UC30 Activation Phase & Guarantee Tracking Migration
-- Run this in Supabase SQL Editor after supabase-auth-migration.sql
-- ══════════════════════════════════════════════════════════════

-- Activation Phase fields
ALTER TABLE participants ADD COLUMN IF NOT EXISTS buy_box JSONB;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS market_research_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS market_research_confirmed_at TIMESTAMPTZ;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS capital_confirmation JSONB;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS offer_commitment INTEGER;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS offer_commitment_set_at TIMESTAMPTZ;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS stakes_declaration TEXT;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS stakes_declaration_set_at TIMESTAMPTZ;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS their_why TEXT;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS their_why_set_at TIMESTAMPTZ;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS notification_preferences JSONB;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS activation_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS activation_completed_at TIMESTAMPTZ;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS commitment_declared_at TIMESTAMPTZ;

-- Money-back guarantee tracking
ALTER TABLE participants ADD COLUMN IF NOT EXISTS cohort_attempt INTEGER DEFAULT 1;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS refund_eligible BOOLEAN DEFAULT TRUE;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS first_cohort_completed BOOLEAN DEFAULT FALSE;
