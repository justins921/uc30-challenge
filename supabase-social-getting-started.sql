-- UC30 Challenge - Social Media Handles & Getting Started Migration
-- Run this in your Supabase SQL Editor.
-- Safe to re-run — uses IF NOT EXISTS.

-- 1. Social media handles (JSONB: {instagram, tiktok, twitter, facebook, youtube})
ALTER TABLE participants ADD COLUMN IF NOT EXISTS social_handles JSONB DEFAULT '{}'::jsonb;

-- 2. Getting Started completion flag (must complete before Day 1)
ALTER TABLE participants ADD COLUMN IF NOT EXISTS getting_started_completed BOOLEAN DEFAULT FALSE;

-- 3. Function to get cohort stats (bypasses RLS so regular users can see counts)
CREATE OR REPLACE FUNCTION public.get_cohort_stats()
RETURNS JSON AS $$
  SELECT json_build_object(
    'active', (SELECT COUNT(*) FROM public.participants WHERE is_active = true AND is_admin = false),
    'total', (SELECT COUNT(*) FROM public.participants WHERE is_admin = false)
  );
$$ LANGUAGE sql SECURITY DEFINER;
