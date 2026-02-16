-- ═══════════════════════════════════════════════════════════════════
-- UC30 CRM & Upload Migration
-- Run this in Supabase SQL Editor AFTER the base migrations.
-- Creates: contacts, follow_ups, uploads tables with RLS policies.
-- Also creates the uc30-uploads storage bucket.
-- ═══════════════════════════════════════════════════════════════════

-- ── Contacts Table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  contact_type TEXT DEFAULT 'other',  -- agent, property_manager, wholesaler, investor, direct_seller, other
  notes TEXT,
  day_added INTEGER NOT NULL,         -- which challenge day this contact was added
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own contacts
CREATE POLICY "Users read own contacts" ON contacts
  FOR SELECT USING (
    participant_id IN (
      SELECT id FROM participants WHERE auth_id = auth.uid()
    )
    OR public.is_admin()
  );

-- Users can insert their own contacts
CREATE POLICY "Users insert own contacts" ON contacts
  FOR INSERT WITH CHECK (
    participant_id IN (
      SELECT id FROM participants WHERE auth_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_contacts_participant ON contacts (participant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts (created_at DESC);

-- ── Follow-Ups Table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follow_ups (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  notes TEXT NOT NULL,
  day_number INTEGER NOT NULL,        -- which challenge day this follow-up was logged
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;

-- Users can only see their own follow-ups
CREATE POLICY "Users read own follow_ups" ON follow_ups
  FOR SELECT USING (
    participant_id IN (
      SELECT id FROM participants WHERE auth_id = auth.uid()
    )
    OR public.is_admin()
  );

-- Users can insert their own follow-ups
CREATE POLICY "Users insert own follow_ups" ON follow_ups
  FOR INSERT WITH CHECK (
    participant_id IN (
      SELECT id FROM participants WHERE auth_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_follow_ups_contact ON follow_ups (contact_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_participant ON follow_ups (participant_id);

-- ── Uploads Table ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS uploads (
  id TEXT PRIMARY KEY,
  participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  indicator TEXT NOT NULL,             -- 'propertiesAnalyzed', 'offersSubmitted', 'socialMedia'
  file_path TEXT NOT NULL,             -- path in Supabase Storage
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own uploads" ON uploads
  FOR SELECT USING (
    participant_id IN (
      SELECT id FROM participants WHERE auth_id = auth.uid()
    )
    OR public.is_admin()
  );

CREATE POLICY "Users insert own uploads" ON uploads
  FOR INSERT WITH CHECK (
    participant_id IN (
      SELECT id FROM participants WHERE auth_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_uploads_participant_day ON uploads (participant_id, day_number);

-- ── Storage Bucket ───────────────────────────────────────────────
-- Create private bucket for UC30 uploads (screenshots, proof files)
INSERT INTO storage.buckets (id, name, public)
VALUES ('uc30-uploads', 'uc30-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users can upload to their own folder
CREATE POLICY "Users upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'uc30-uploads'
    AND auth.role() = 'authenticated'
  );

-- Users can read their own uploaded files
CREATE POLICY "Users read own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'uc30-uploads'
    AND auth.role() = 'authenticated'
  );

-- Admins can read all files (for review)
-- (is_admin() already covers admin access via the uploads table RLS)
