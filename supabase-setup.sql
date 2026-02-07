-- UC30 Challenge - Supabase Database Setup
-- Run this in your Supabase SQL Editor (supabase.com > your project > SQL Editor)

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  current_day INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  completed_days JSONB DEFAULT '[]'::jsonb,
  submissions JSONB DEFAULT '[]'::jsonb,
  metrics JSONB DEFAULT '{"propertiesAnalyzed": 0, "offersSubmitted": 0, "agentsContacted": 0}'::jsonb,
  removed_at TIMESTAMPTZ,
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

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants (email);

-- Create index for active participant queries
CREATE INDEX IF NOT EXISTS idx_participants_active ON participants (is_active);
