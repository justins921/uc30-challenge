-- ══════════════════════════════════════════════════════════════
-- UC30 CRM Overhaul Migration
-- Adds arsenal_type, lead generator / owner fields on target
-- properties, and source_contact_id for lead tracking.
-- Safe to re-run — uses IF NOT EXISTS everywhere.
-- ══════════════════════════════════════════════════════════════

-- Arsenal contact type (realtor, wholesaler, property_manager, etc.)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS arsenal_type TEXT;

-- Target property dual-role: Lead Generator (who brought the deal)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS lead_generator_name TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS lead_generator_phone TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS lead_generator_email TEXT;

-- Target property dual-role: Owner / Seller
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS owner_phone TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS owner_email TEXT;

-- Link target properties back to the Arsenal contact that generated them
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS source_contact_id TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_arsenal_type ON contacts (participant_id, arsenal_type);
CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts (source_contact_id);
