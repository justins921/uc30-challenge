// ── Storage Layer ────────────────────────────────────────────────────
// Uses Supabase for persistent, multi-user data storage.
// Falls back to localStorage if Supabase is not configured.
//
// To set up Supabase:
// 1. Create a free account at supabase.com
// 2. Create a new project
// 3. Run the SQL in supabase-setup.sql (in project root)
// 4. Copy your project URL and anon key into .env

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const USE_SUPABASE = SUPABASE_URL && SUPABASE_KEY;

// ── Simple Supabase client (no SDK needed) ───────────────────────
async function supabaseRequest(table, method, options = {}) {
  const { filters = '', body = null, single = false } = options;
  const url = `${SUPABASE_URL}/rest/v1/${table}${filters}`;

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': method === 'POST' ? 'return=representation' : 'return=representation',
  };

  if (single) {
    headers['Accept'] = 'application/vnd.pgrst.object+json';
  }

  const fetchOptions = { method, headers };
  if (body) fetchOptions.body = JSON.stringify(body);

  try {
    const res = await fetch(url, fetchOptions);
    if (!res.ok) {
      const err = await res.text();
      console.error('Supabase error:', err);
      return null;
    }
    if (res.status === 204) return true;
    return await res.json();
  } catch (err) {
    console.error('Supabase request failed:', err);
    return null;
  }
}

// ── Supabase Storage Implementation ──────────────────────────────
const supabaseStorage = {
  async getUser() {
    // User session is kept in localStorage even with Supabase
    try {
      const data = localStorage.getItem('uc30_current_user_id');
      if (!data) return null;
      const userId = JSON.parse(data);
      const user = await supabaseRequest('participants', 'GET', {
        filters: `?id=eq.${userId}`,
        single: true,
      });
      return user ? fromDbRow(user) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    try {
      if (user) {
        localStorage.setItem('uc30_current_user_id', JSON.stringify(user.id));
      } else {
        localStorage.removeItem('uc30_current_user_id');
      }
    } catch {}
  },

  async getParticipants() {
    const data = await supabaseRequest('participants', 'GET', {
      filters: '?order=created_at.asc',
    });
    return data ? data.map(fromDbRow) : [];
  },

  async setParticipants() {
    // Not used with Supabase — individual updates instead
  },

  async addParticipant(participant) {
    const row = toDbRow(participant);
    const result = await supabaseRequest('participants', 'POST', { body: row });
    return result ? fromDbRow(result) : null;
  },

  async updateParticipant(id, updates) {
    const row = {};
    if (updates.currentDay !== undefined) row.current_day = updates.currentDay;
    if (updates.isActive !== undefined) row.is_active = updates.isActive;
    if (updates.completedDays !== undefined) row.completed_days = updates.completedDays;
    if (updates.submissions !== undefined) row.submissions = updates.submissions;
    if (updates.metrics !== undefined) row.metrics = updates.metrics;
    if (updates.removedAt !== undefined) row.removed_at = updates.removedAt;
    if (updates.reactivatedAt !== undefined) row.reactivated_at = updates.reactivatedAt;
    if (updates.password !== undefined) row.password = updates.password;

    const result = await supabaseRequest('participants', 'PATCH', {
      filters: `?id=eq.${id}`,
      body: row,
      single: true,
    });
    return result ? fromDbRow(result) : null;
  },

  async deleteParticipant(id) {
    const result = await supabaseRequest('participants', 'DELETE', {
      filters: `?id=eq.${id}`,
    });
    return result !== null;
  },

  async findByEmail(email) {
    const result = await supabaseRequest('participants', 'GET', {
      filters: `?email=eq.${encodeURIComponent(email.toLowerCase())}`,
      single: true,
    });
    return result ? fromDbRow(result) : null;
  },

  async getCohortSettings() {
    const result = await supabaseRequest('settings', 'GET', {
      filters: '?key=eq.cohort_settings',
      single: true,
    });
    if (result?.value) return result.value;
    try {
      const data = localStorage.getItem('uc30_cohort_settings');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },

  async setCohortSettings(settings) {
    localStorage.setItem('uc30_cohort_settings', JSON.stringify(settings));
    const body = { value: settings, updated_at: new Date().toISOString() };
    const result = await supabaseRequest('settings', 'PATCH', {
      filters: '?key=eq.cohort_settings',
      body,
    });
    if (!result || (Array.isArray(result) && result.length === 0)) {
      await supabaseRequest('settings', 'POST', {
        body: { key: 'cohort_settings', ...body },
      });
    }
  },
};

// ── Database row conversion ──────────────────────────────────────
function toDbRow(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    is_admin: user.isAdmin,
    current_day: user.currentDay,
    is_active: user.isActive,
    start_date: user.startDate,
    completed_days: user.completedDays,
    submissions: user.submissions,
    metrics: user.metrics,
    removed_at: user.removedAt,
  };
}

function fromDbRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    isAdmin: row.is_admin,
    currentDay: row.current_day,
    isActive: row.is_active,
    startDate: row.start_date,
    completedDays: row.completed_days || [],
    submissions: row.submissions || [],
    metrics: row.metrics || { propertiesAnalyzed: 0, offersSubmitted: 0, agentsContacted: 0 },
    removedAt: row.removed_at,
    reactivatedAt: row.reactivated_at || null,
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
    try {
      const data = localStorage.getItem('uc30_cohort_settings');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },
  setCohortSettings(settings) {
    try {
      localStorage.setItem('uc30_cohort_settings', JSON.stringify(settings));
    } catch {}
  },
};

// ── Export the right storage based on config ─────────────────────
export const storage = USE_SUPABASE ? supabaseStorage : localStorageFallback;
export const isSupabaseEnabled = USE_SUPABASE;

// ── Create new user object ───────────────────────────────────────
export function createNewUser(name, email, password) {
  return {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    email: email.toLowerCase(),
    password,
    isAdmin: email.toLowerCase() === 'admin@uc30.com',
    currentDay: 1,
    isActive: true,
    startDate: new Date().toISOString(),
    completedDays: [],
    submissions: [],
    metrics: {
      propertiesAnalyzed: 0,
      offersSubmitted: 0,
      agentsContacted: 0,
    },
    removedAt: null,
  };
}
