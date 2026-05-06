-- UC30 Indicator Refinement & CRM Tweaks Migration
-- Adds lifetime_offers_submitted, contact status/property fields,
-- and migrates team contacts to arsenal.

-- Lifetime offers counter (never resets)
ALTER TABLE participants ADD COLUMN IF NOT EXISTS lifetime_offers_submitted INTEGER DEFAULT 0;

-- Contact status for target contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';

-- Property/opportunity reference for target contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS property TEXT;

-- Migrate team contacts to arsenal (My Team group removed)
UPDATE contacts SET contact_group = 'arsenal' WHERE contact_group = 'team';
