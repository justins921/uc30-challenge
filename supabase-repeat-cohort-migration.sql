-- Repeat Cohort Logic migration
-- Adds training bypass, cohort history, and UC Graduate tracking fields

ALTER TABLE participants ADD COLUMN IF NOT EXISTS training_completed_days JSONB DEFAULT '[]'::jsonb;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS cohort_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS uc_graduate_count INTEGER DEFAULT 0;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS properties_under_contract INTEGER DEFAULT 0;
