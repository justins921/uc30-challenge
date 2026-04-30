-- ══════════════════════════════════════════════════════════════
-- UC30 Pre-Launch Fixes Migration
-- Run this in Supabase SQL Editor AFTER all previous migrations.
-- Safe to re-run — uses IF NOT EXISTS / IF EXISTS everywhere.
-- ══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 1. Missing participant columns (community moderation)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE participants ADD COLUMN IF NOT EXISTS community_banned BOOLEAN DEFAULT false;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS community_warnings JSONB DEFAULT '[]'::jsonb;

-- ─────────────────────────────────────────────────────────────
-- 2. Stripe payment tracking columns
-- ─────────────────────────────────────────────────────────────
ALTER TABLE participants ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS idx_participants_stripe_customer
  ON participants (stripe_customer_id);

-- ─────────────────────────────────────────────────────────────
-- 3. Missing UPDATE/DELETE RLS policies for contacts
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users update own contacts" ON contacts;
CREATE POLICY "Users update own contacts" ON contacts
  FOR UPDATE USING (
    participant_id IN (
      SELECT id FROM participants WHERE auth_id = auth.uid()
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Users delete own contacts" ON contacts;
CREATE POLICY "Users delete own contacts" ON contacts
  FOR DELETE USING (
    participant_id IN (
      SELECT id FROM participants WHERE auth_id = auth.uid()
    )
    OR public.is_admin()
  );

-- ─────────────────────────────────────────────────────────────
-- 4. Missing UPDATE/DELETE RLS policies for follow_ups
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users update own follow_ups" ON follow_ups;
CREATE POLICY "Users update own follow_ups" ON follow_ups
  FOR UPDATE USING (
    participant_id IN (
      SELECT id FROM participants WHERE auth_id = auth.uid()
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Users delete own follow_ups" ON follow_ups;
CREATE POLICY "Users delete own follow_ups" ON follow_ups
  FOR DELETE USING (
    participant_id IN (
      SELECT id FROM participants WHERE auth_id = auth.uid()
    )
    OR public.is_admin()
  );

-- ─────────────────────────────────────────────────────────────
-- 5. Missing UPDATE/DELETE RLS policies for uploads
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users delete own uploads" ON uploads;
CREATE POLICY "Users delete own uploads" ON uploads
  FOR DELETE USING (
    participant_id IN (
      SELECT id FROM participants WHERE auth_id = auth.uid()
    )
    OR public.is_admin()
  );

-- ─────────────────────────────────────────────────────────────
-- 6. Storage object delete policy
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users delete own files" ON storage.objects;
CREATE POLICY "Users delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'uc30-uploads'
    AND auth.role() = 'authenticated'
  );
