-- ═══════════════════════════════════════════════════════════════════
-- UC30 Contact Groups Migration
-- Run this in Supabase SQL Editor AFTER the CRM migration.
-- Adds contact_group column and migrates from contact_type.
-- ═══════════════════════════════════════════════════════════════════

-- Add contact_group column
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS contact_group TEXT NOT NULL DEFAULT 'target';

-- Migrate existing contact_type values to contact_group
UPDATE contacts SET contact_group = CASE
  WHEN contact_type IN ('agent', 'property_manager', 'wholesaler', 'direct_seller') THEN 'target'
  WHEN contact_type IN ('investor') THEN 'arsenal'
  WHEN contact_type IN ('other') THEN 'target'
  ELSE 'target'
END
WHERE contact_group = 'target';

-- Add index for group-based queries
CREATE INDEX IF NOT EXISTS idx_contacts_group ON contacts (participant_id, contact_group);
