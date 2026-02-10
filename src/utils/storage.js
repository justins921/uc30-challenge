// ── Storage Layer ────────────────────────────────────────────────────
// Uses Supabase SDK for persistent, multi-user data storage with
// Row Level Security backed by Supabase Auth (JWT sessions).
// Falls back to localStorage if Supabase is not configured.
//
// To set up Supabase:
// 1. Create a free account at supabase.com
// 2. Create a new project
// 3. Run the SQL in supabase-setup.sql (base schema)
// 4. Run the SQL in supabase-auth-migration.sql (auth + RLS)
// 5. Copy your project URL and anon key into .env

import { supabase } from './supabaseClient';

const USE_SUPABASE = !!supabase;

// ── Supabase Storage Implementation (SDK) ───────────────────────
const supabaseStorage = {
  // Session is managed by the SDK — getUser looks up participant by auth_id
  async getUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('auth_id', session.user.id)
        .maybeSingle();

      if (error) { console.error('getUser error:', error); return null; }
      return data ? fromDbRow(data) : null;
    } catch {
      return null;
    }
  },

  setUser() {
    // No-op: session persistence is handled by the Supabase SDK.
  },

  async getParticipants() {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) { console.error('getParticipants error:', error); return []; }
    return data ? data.map(fromDbRow) : [];
  },

  async setParticipants() {
    // Not used with Supabase — individual updates instead
  },

  async addParticipant(participant) {
    const row = toDbRow(participant);
    let { data, error } = await supabase
      .from('participants')
      .insert(row)
      .select()
      .single();

    // If insert fails (e.g. unknown column), retry with minimal columns
    if (error) {
      console.error('addParticipant attempt 1 failed:', error.message);
      const minimalRow = {
        id: row.id,
        auth_id: row.auth_id,
        name: row.name,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        is_admin: row.is_admin,
        current_day: row.current_day,
        is_active: row.is_active,
        has_paid: row.has_paid,
        completed_days: row.completed_days,
        submissions: row.submissions,
        metrics: row.metrics,
      };
      const retry = await supabase
        .from('participants')
        .insert(minimalRow)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('addParticipant error:', error);
      return { __error: error.message || 'Database insert failed' };
    }
    return data ? fromDbRow(data) : null;
  },

  async updateParticipant(id, updates) {
    const row = toDbUpdateRow(updates);
    if (Object.keys(row).length === 0) return null;

    const { data, error } = await supabase
      .from('participants')
      .update(row)
      .eq('id', id)
      .select()
      .single();

    if (error) { console.error('updateParticipant error:', error); return null; }
    return data ? fromDbRow(data) : null;
  },

  async deleteParticipant(id) {
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', id);

    if (error) { console.error('deleteParticipant error:', error); return false; }
    return true;
  },

  async findByEmail(email) {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) { console.error('findByEmail error:', error); return null; }
    return data ? fromDbRow(data) : null;
  },

  // ── Settings helpers ────────────────────────────────────────

  async _getSetting(key) {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) { console.error(`getSetting(${key}) error:`, error); return null; }
    return data?.value ?? null;
  },

  async _setSetting(key, value) {
    // Also persist to localStorage as backup
    try { localStorage.setItem(`uc30_${key}`, JSON.stringify(value)); } catch {}

    const body = { value, updated_at: new Date().toISOString() };

    // Try upsert
    const { error } = await supabase
      .from('settings')
      .upsert({ key, ...body }, { onConflict: 'key' });

    if (error) console.error(`setSetting(${key}) error:`, error);
  },

  async getCohortSettings() {
    const val = await this._getSetting('cohort_settings');
    if (val) { try { localStorage.setItem('uc30_cohort_settings', JSON.stringify(val)); } catch {} }
    return val || (() => { try { return JSON.parse(localStorage.getItem('uc30_cohort_settings')); } catch { return null; } })();
  },
  async setCohortSettings(settings) { await this._setSetting('cohort_settings', settings); },

  async getContentOverrides() {
    const val = await this._getSetting('content_overrides');
    if (val) { try { localStorage.setItem('uc30_content_overrides', JSON.stringify(val)); } catch {} }
    return val || (() => { try { return JSON.parse(localStorage.getItem('uc30_content_overrides')) || {}; } catch { return {}; } })();
  },
  async setContentOverrides(overrides) { await this._setSetting('content_overrides', overrides); },

  async getLiveCalls() {
    const val = await this._getSetting('live_calls');
    if (val) { try { localStorage.setItem('uc30_live_calls', JSON.stringify(val)); } catch {} }
    return val || (() => { try { return JSON.parse(localStorage.getItem('uc30_live_calls')) || []; } catch { return []; } })();
  },
  async setLiveCalls(calls) { await this._setSetting('live_calls', calls); },

  async getPhases() {
    const val = await this._getSetting('phases');
    if (val) { try { localStorage.setItem('uc30_phases', JSON.stringify(val)); } catch {} }
    return val || (() => { try { return JSON.parse(localStorage.getItem('uc30_phases')); } catch { return null; } })();
  },
  async setPhases(phases) { await this._setSetting('phases', phases); },

  async getLandingContent() {
    const val = await this._getSetting('landing_content');
    if (val) { try { localStorage.setItem('uc30_landing_content', JSON.stringify(val)); } catch {} }
    return val || (() => { try { return JSON.parse(localStorage.getItem('uc30_landing_content')); } catch { return null; } })();
  },
  async setLandingContent(content) { await this._setSetting('landing_content', content); },

  async getCohortStats() {
    try {
      const { data, error } = await supabase.rpc('get_cohort_stats');
      if (!error && data) return data;
    } catch {}
    // Fallback: read from settings if RPC not available
    const val = await this._getSetting('cohort_stats');
    return val || { active: 0, total: 0 };
  },
  async setCohortStats(stats) { await this._setSetting('cohort_stats', stats); },

  async getSupportTickets() {
    const val = await this._getSetting('support_tickets');
    if (val) { try { localStorage.setItem('uc30_support_tickets', JSON.stringify(val)); } catch {} }
    return val || (() => { try { return JSON.parse(localStorage.getItem('uc30_support_tickets')) || []; } catch { return []; } })();
  },
  async setSupportTickets(tickets) { await this._setSetting('support_tickets', tickets); },

  async getCommunityPosts() {
    const val = await this._getSetting('community_posts');
    if (val) { try { localStorage.setItem('uc30_community_posts', JSON.stringify(val)); } catch {} }
    return val || (() => { try { return JSON.parse(localStorage.getItem('uc30_community_posts')) || []; } catch { return []; } })();
  },
  async setCommunityPosts(posts) { await this._setSetting('community_posts', posts); },
};

// ── Database row conversion ──────────────────────────────────────
function toDbRow(user) {
  const row = {
    id: user.id,
    auth_id: user.authId || null,
    name: `${user.firstName} ${user.lastName}`.trim(),
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    password: user.password || null,
    is_admin: user.isAdmin,
    current_day: user.currentDay,
    is_active: user.isActive,
    has_paid: user.hasPaid,
    start_date: user.startDate,
    completed_days: user.completedDays,
    submissions: user.submissions,
    metrics: user.metrics,
    removed_at: user.removedAt,
    access_expires_at: user.accessExpiresAt || null,
  };
  // Only include profile_picture if it has a value (column may not exist yet)
  if (user.profilePicture) row.profile_picture = user.profilePicture;
  if (user.socialHandles && Object.keys(user.socialHandles).length > 0) row.social_handles = user.socialHandles;
  if (user.gettingStartedCompleted) row.getting_started_completed = true;
  if (user.communityBanned) row.community_banned = true;
  if (user.communityWarnings?.length > 0) row.community_warnings = user.communityWarnings;
  return row;
}

function toDbUpdateRow(updates) {
  const row = {};
  if (updates.authId !== undefined) row.auth_id = updates.authId;
  if (updates.email !== undefined) row.email = updates.email;
  if (updates.firstName !== undefined) row.first_name = updates.firstName;
  if (updates.lastName !== undefined) row.last_name = updates.lastName;
  if (updates.currentDay !== undefined) row.current_day = updates.currentDay;
  if (updates.isActive !== undefined) row.is_active = updates.isActive;
  if (updates.isAdmin !== undefined) row.is_admin = updates.isAdmin;
  if (updates.completedDays !== undefined) row.completed_days = updates.completedDays;
  if (updates.submissions !== undefined) row.submissions = updates.submissions;
  if (updates.metrics !== undefined) row.metrics = updates.metrics;
  if (updates.removedAt !== undefined) row.removed_at = updates.removedAt;
  if (updates.reactivatedAt !== undefined) row.reactivated_at = updates.reactivatedAt;
  if (updates.password !== undefined) row.password = updates.password;
  if (updates.hasPaid !== undefined) row.has_paid = updates.hasPaid;
  if (updates.accessExpiresAt !== undefined) row.access_expires_at = updates.accessExpiresAt;
  if (updates.profilePicture !== undefined) row.profile_picture = updates.profilePicture;
  if (updates.socialHandles !== undefined) row.social_handles = updates.socialHandles;
  if (updates.gettingStartedCompleted !== undefined) row.getting_started_completed = updates.gettingStartedCompleted;
  if (updates.communityBanned !== undefined) row.community_banned = updates.communityBanned;
  if (updates.communityWarnings !== undefined) row.community_warnings = updates.communityWarnings;
  return row;
}

function fromDbRow(row) {
  const nameParts = (row.name || '').split(' ');
  return {
    id: row.id,
    authId: row.auth_id || null,
    firstName: row.first_name || nameParts[0] || '',
    lastName: row.last_name || nameParts.slice(1).join(' ') || '',
    email: row.email,
    password: row.password,
    isAdmin: row.is_admin,
    currentDay: row.current_day,
    isActive: row.is_active,
    hasPaid: row.has_paid || false,
    startDate: row.start_date,
    completedDays: row.completed_days || [],
    submissions: row.submissions || [],
    metrics: row.metrics || { propertiesAnalyzed: 0, offersSubmitted: 0, agentsContacted: 0 },
    removedAt: row.removed_at,
    reactivatedAt: row.reactivated_at || null,
    accessExpiresAt: row.access_expires_at || null,
    profilePicture: row.profile_picture || null,
    socialHandles: row.social_handles || {},
    gettingStartedCompleted: row.getting_started_completed || false,
    communityBanned: row.community_banned || false,
    communityWarnings: row.community_warnings || [],
  };
}

// ── LocalStorage Fallback ────────────────────────────────────────
const STORAGE_KEYS = {
  USER: 'uc30_current_user',
  PARTICIPANTS: 'uc30_participants',
};

const localStorageFallback = {
  getUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },
  setUser(user) {
    try {
      if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEYS.USER);
    } catch {}
  },
  getParticipants() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },
  setParticipants(participants) {
    try {
      localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
    } catch {}
  },
  updateParticipant(id, updates) {
    const participants = this.getParticipants();
    const updated = participants.map(p => p.id === id ? { ...p, ...updates } : p);
    this.setParticipants(updated);
    return updated.find(p => p.id === id);
  },
  addParticipant(participant) {
    const participants = this.getParticipants();
    participants.push(participant);
    this.setParticipants(participants);
    return participant;
  },
  deleteParticipant(id) {
    const participants = this.getParticipants();
    const filtered = participants.filter(p => p.id !== id);
    this.setParticipants(filtered);
    return true;
  },
  findByEmail(email) {
    return this.getParticipants().find(p => p.email === email.toLowerCase()) || null;
  },
  getCohortSettings() {
    try { return JSON.parse(localStorage.getItem('uc30_cohort_settings')); } catch { return null; }
  },
  setCohortSettings(settings) {
    try { localStorage.setItem('uc30_cohort_settings', JSON.stringify(settings)); } catch {}
  },
  getContentOverrides() {
    try { return JSON.parse(localStorage.getItem('uc30_content_overrides')) || {}; } catch { return {}; }
  },
  setContentOverrides(overrides) {
    try { localStorage.setItem('uc30_content_overrides', JSON.stringify(overrides)); } catch {}
  },
  getLiveCalls() {
    try { return JSON.parse(localStorage.getItem('uc30_live_calls')) || []; } catch { return []; }
  },
  setLiveCalls(calls) {
    try { localStorage.setItem('uc30_live_calls', JSON.stringify(calls)); } catch {}
  },
  getPhases() {
    try { return JSON.parse(localStorage.getItem('uc30_phases')); } catch { return null; }
  },
  setPhases(phases) {
    try { localStorage.setItem('uc30_phases', JSON.stringify(phases)); } catch {}
  },
  getLandingContent() {
    try { return JSON.parse(localStorage.getItem('uc30_landing_content')); } catch { return null; }
  },
  setLandingContent(content) {
    try { localStorage.setItem('uc30_landing_content', JSON.stringify(content)); } catch {}
  },
  getCohortStats() {
    const participants = this.getParticipants();
    const nonAdmin = participants.filter(p => !p.isAdmin);
    return { active: nonAdmin.filter(p => p.isActive).length, total: nonAdmin.length };
  },
  getSupportTickets() {
    try { return JSON.parse(localStorage.getItem('uc30_support_tickets')) || []; } catch { return []; }
  },
  setSupportTickets(tickets) {
    try { localStorage.setItem('uc30_support_tickets', JSON.stringify(tickets)); } catch {}
  },
  getCommunityPosts() {
    try { return JSON.parse(localStorage.getItem('uc30_community_posts')) || []; } catch { return []; }
  },
  setCommunityPosts(posts) {
    try { localStorage.setItem('uc30_community_posts', JSON.stringify(posts)); } catch {}
  },
};

// ── Export the right storage based on config ─────────────────────
export const storage = USE_SUPABASE ? supabaseStorage : localStorageFallback;
export const isSupabaseEnabled = USE_SUPABASE;

// ── Create new user object ───────────────────────────────────────
export function createNewUser(firstName, lastName, email, authId) {
  return {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    authId: authId || null,
    firstName,
    lastName,
    email: email.toLowerCase(),
    password: null,
    isAdmin: email.toLowerCase() === 'admin@uc30.com',
    currentDay: 1,
    isActive: true,
    hasPaid: false,
    startDate: new Date().toISOString(),
    completedDays: [],
    submissions: [],
    metrics: {
      propertiesAnalyzed: 0,
      offersSubmitted: 0,
      agentsContacted: 0,
    },
    removedAt: null,
    accessExpiresAt: null,
    profilePicture: null,
    socialHandles: {},
    gettingStartedCompleted: false,
    communityBanned: false,
    communityWarnings: [],
  };
}
