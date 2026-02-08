-- UC30 Challenge - Supabase Auth Migration
-- Run this in your Supabase SQL Editor AFTER supabase-setup.sql
--
-- Prerequisites:
-- 1. Supabase Auth is enabled (default for new projects)
-- 2. Email provider is enabled in Auth > Providers
-- 3. Set your Site URL in Auth > URL Configuration to your app's URL
-- 4. Add your app URL to "Redirect URLs" in Auth > URL Configuration
--
-- This migration:
-- 1. Adds auth_id column to link participants with Supabase Auth users
-- 2. Replaces wide-open RLS policies with proper auth-based ones
-- 3. Creates an is_admin() helper function for RLS

-- ─────────────────────────────────────────────────────────────────
-- 1. Add auth_id column to participants
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE participants ADD COLUMN IF NOT EXISTS auth_id UUID;
CREATE UNIQUE INDEX IF NOT EXISTS idx_participants_auth_id ON participants (auth_id);

-- Allow password column to be NULL (Supabase Auth handles passwords now)
ALTER TABLE participants ALTER COLUMN password DROP NOT NULL;

-- ─────────────────────────────────────────────────────────────────
-- 2. Helper function: check if current user is an admin
--    Uses SECURITY DEFINER to bypass RLS for the check itself.
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.participants
    WHERE auth_id = auth.uid() AND is_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────
-- 3. Replace participants RLS policies
-- ─────────────────────────────────────────────────────────────────

-- Drop old wide-open policies
DROP POLICY IF EXISTS "Allow public read" ON participants;
DROP POLICY IF EXISTS "Allow public insert" ON participants;
DROP POLICY IF EXISTS "Allow public update" ON participants;
DROP POLICY IF EXISTS "Allow public delete" ON participants;

-- Users can read their own data; admins can read everyone.
-- Also allows matching by email for account linking (e.g. email user signs in via Google).
DROP POLICY IF EXISTS "Users read own or admin reads all" ON participants;
CREATE POLICY "Users read own or admin reads all" ON participants
  FOR SELECT USING (
    auth_id = auth.uid()
    OR public.is_admin()
    OR lower(email) = lower(auth.jwt() ->> 'email')
  );

-- Authenticated users can insert a row (session may not link auth_id immediately after signUp)
CREATE POLICY "Authenticated users can insert" ON participants
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Users can update their own data; admins can update anyone.
-- Also allows email-based matching for account linking.
DROP POLICY IF EXISTS "Users update own or admin updates all" ON participants;
CREATE POLICY "Users update own or admin updates all" ON participants
  FOR UPDATE USING (
    auth_id = auth.uid()
    OR public.is_admin()
    OR lower(email) = lower(auth.jwt() ->> 'email')
  );

-- Only admins can delete participants
CREATE POLICY "Admins can delete" ON participants
  FOR DELETE USING (
    public.is_admin()
  );

-- ─────────────────────────────────────────────────────────────────
-- 4. Replace settings RLS policies
-- ─────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Allow public read settings" ON settings;
DROP POLICY IF EXISTS "Allow public insert settings" ON settings;
DROP POLICY IF EXISTS "Allow public update settings" ON settings;

-- Anyone can read settings (landing page needs this before auth)
CREATE POLICY "Anyone can read settings" ON settings
  FOR SELECT USING (true);

-- Admins can write any setting; authenticated users can write support_tickets
CREATE POLICY "Admins or ticket writers can insert" ON settings
  FOR INSERT WITH CHECK (
    public.is_admin() OR (key = 'support_tickets' AND auth.uid() IS NOT NULL)
  );

CREATE POLICY "Admins or ticket writers can update" ON settings
  FOR UPDATE USING (
    public.is_admin() OR (key = 'support_tickets' AND auth.uid() IS NOT NULL)
  );

-- ─────────────────────────────────────────────────────────────────
-- 5. Notes for the admin
-- ─────────────────────────────────────────────────────────────────
--
-- IMPORTANT: After running this migration:
--
-- a) In the Supabase Dashboard → Auth → URL Configuration:
--    - Set "Site URL" to your app's URL (e.g., https://uc30.yourdomain.com)
--    - Add your app URL to "Redirect URLs" (e.g., https://uc30.yourdomain.com/*)
--
-- b) Existing users will be migrated automatically:
--    - When they log in with their current password, the app creates
--      a Supabase Auth account and links it to their participant row.
--    - Future logins use Supabase Auth (bcrypt, JWT sessions).
--
-- c) The first admin must register with admin@uc30.com (hardcoded check).
--    Additional admins are promoted via the Admin Dashboard.
--
-- d) The `password` column in participants is kept for legacy migration
--    but is no longer used for new registrations. It can be dropped
--    once all users have been migrated:
--    -- ALTER TABLE participants DROP COLUMN password;
