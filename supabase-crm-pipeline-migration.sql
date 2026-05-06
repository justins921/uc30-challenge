-- CRM Pipeline Flow migration
-- Adds follow-up scheduling and pipeline status to contacts

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMPTZ;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS follow_up_interval TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS pipeline_status TEXT DEFAULT 'new';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS reclassified_at TIMESTAMPTZ;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_contacts_follow_up ON contacts (participant_id, follow_up_date);
CREATE INDEX IF NOT EXISTS idx_contacts_pipeline ON contacts (participant_id, pipeline_status);
