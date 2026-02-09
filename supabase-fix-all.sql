-- UC30 Challenge - COMPREHENSIVE FIX
-- Run this ONCE in your Supabase SQL Editor to fix all auth/RLS issues.
-- Safe to re-run — uses IF EXISTS / IF NOT EXISTS everywhere.

-- ─────────────────────────────────────────────────────────────────
-- 1. Fix table columns
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE participants ADD COLUMN IF NOT EXISTS auth_id UUID;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS first_name TEXT NOT NULL DEFAULT '';
ALTER TABLE participants ADD COLUMN IF NOT EXISTS last_name TEXT NOT NULL DEFAULT '';
ALTER TABLE participants ADD COLUMN IF NOT EXISTS has_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMPTZ;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS reactivated_at TIMESTAMPTZ;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Allow password to be NULL (Supabase Auth handles passwords now)
ALTER TABLE participants ALTER COLUMN password DROP NOT NULL;

-- Index for fast auth_id lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_participants_auth_id ON participants (auth_id);

-- ─────────────────────────────────────────────────────────────────
-- 2. Helper function: is_admin()
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.participants
    WHERE auth_id = auth.uid() AND is_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────
-- 3. Drop ALL old participant policies (every possible name)
-- ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow public read" ON participants;
DROP POLICY IF EXISTS "Allow public insert" ON participants;
DROP POLICY IF EXISTS "Allow public update" ON participants;
DROP POLICY IF EXISTS "Allow public delete" ON participants;
DROP POLICY IF EXISTS "Users read own or admin reads all" ON participants;
DROP POLICY IF EXISTS "Authenticated insert own row" ON participants;
DROP POLICY IF EXISTS "Authenticated users can insert" ON participants;
DROP POLICY IF EXISTS "Users update own or admin updates all" ON participants;
DROP POLICY IF EXISTS "Admins can delete" ON participants;

-- ─────────────────────────────────────────────────────────────────
-- 4. Create correct participant policies
-- ─────────────────────────────────────────────────────────────────

-- SELECT: own row (by auth_id OR email), or admin
CREATE POLICY "Users read own or admin reads all" ON participants
  FOR SELECT USING (
    auth_id = auth.uid()
    OR public.is_admin()
    OR lower(email) = lower(auth.jwt() ->> 'email')
  );

-- INSERT: any authenticated user
CREATE POLICY "Authenticated users can insert" ON participants
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- UPDATE: own row (by auth_id OR email), or admin
CREATE POLICY "Users update own or admin updates all" ON participants
  FOR UPDATE USING (
    auth_id = auth.uid()
    OR public.is_admin()
    OR lower(email) = lower(auth.jwt() ->> 'email')
  );

-- DELETE: admin only
CREATE POLICY "Admins can delete" ON participants
  FOR DELETE USING (
    public.is_admin()
  );

-- ─────────────────────────────────────────────────────────────────
-- 5. Drop ALL old settings policies and recreate
-- ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow public read settings" ON settings;
DROP POLICY IF EXISTS "Allow public insert settings" ON settings;
DROP POLICY IF EXISTS "Allow public update settings" ON settings;
DROP POLICY IF EXISTS "Anyone can read settings" ON settings;
DROP POLICY IF EXISTS "Admins or ticket writers can insert" ON settings;
DROP POLICY IF EXISTS "Admins or ticket writers can update" ON settings;

CREATE POLICY "Anyone can read settings" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Admins or ticket writers can insert" ON settings
  FOR INSERT WITH CHECK (
    public.is_admin() OR (key = 'support_tickets' AND auth.uid() IS NOT NULL)
  );

CREATE POLICY "Admins or ticket writers can update" ON settings
  FOR UPDATE USING (
    public.is_admin() OR (key = 'support_tickets' AND auth.uid() IS NOT NULL)
  );

-- ─────────────────────────────────────────────────────────────────
-- Done! Now go to Authentication > Users and delete any orphaned
-- test accounts, then try registering fresh.
-- ─────────────────────────────────────────────────────────────────
