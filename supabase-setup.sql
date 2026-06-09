-- UC30 Challenge - Supabase Database Setup
-- Run this in your Supabase SQL Editor (supabase.com > your project > SQL Editor)

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  name TEXT,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  current_day INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  is_approved BOOLEAN DEFAULT FALSE,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  completed_days JSONB DEFAULT '[]'::jsonb,
  submissions JSONB DEFAULT '[]'::jsonb,
  metrics JSONB DEFAULT '{"propertiesAnalyzed": 0, "offersSubmitted": 0, "agentsContacted": 0}'::jsonb,
  has_paid BOOLEAN DEFAULT FALSE,
  access_expires_at TIMESTAMPTZ,
  removed_at TIMESTAMPTZ,
  reactivated_at TIMESTAMPTZ,
  profile_picture TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all participants (needed for admin dashboard)
-- In production, you'd restrict this to authenticated users
CREATE POLICY "Allow public read" ON participants
  FOR SELECT USING (true);

-- Allow anyone to insert (registration)
CREATE POLICY "Allow public insert" ON participants
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update (submissions, admin actions)
CREATE POLICY "Allow public update" ON participants
  FOR UPDATE USING (true);

-- Allow anyone to delete (admin can permanently remove users)
CREATE POLICY "Allow public delete" ON participants
  FOR DELETE USING (true);

-- If you already have the participants table, run these to add new columns:
-- ALTER TABLE participants ADD COLUMN IF NOT EXISTS has_paid BOOLEAN DEFAULT FALSE;
-- ALTER TABLE participants ADD COLUMN IF NOT EXISTS first_name TEXT NOT NULL DEFAULT '';
-- ALTER TABLE participants ADD COLUMN IF NOT EXISTS last_name TEXT NOT NULL DEFAULT '';
-- UPDATE participants SET first_name = split_part(name, ' ', 1), last_name = substr(name, length(split_part(name, ' ', 1)) + 2) WHERE first_name = '' AND name IS NOT NULL;
-- ALTER TABLE participants ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMPTZ;
-- ALTER TABLE participants ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
-- UPDATE participants SET is_approved = TRUE WHERE is_admin = TRUE;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants (email);

-- Create index for active participant queries
CREATE INDEX IF NOT EXISTS idx_participants_active ON participants (is_active);

-- Settings table for cohort configuration
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read settings" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert settings" ON settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update settings" ON settings
  FOR UPDATE USING (true);
