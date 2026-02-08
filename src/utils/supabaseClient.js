// ── Supabase Client ─────────────────────────────────────────────
// Single SDK instance used by storage.js and useAppState.js.
// If env vars are missing, supabase will be null and the app
// falls back to localStorage (dev mode).

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
