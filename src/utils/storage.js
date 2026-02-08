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
    // Add 8-second timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    fetchOptions.signal = controller.signal;

    const res = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.text();
      console.error('Supabase error:', err);
      return null;
    }
    if (res.status === 204) return true;
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('Supabase request timed out:', table, method);
    } else {
      console.error('Supabase request failed:', err);
    }
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
    const result = await supabaseRequest('participants', 'POST', { body: row, single: true });
    return result ? fromDbRow(result) : null;
  },

  async updateParticipant(id, updates) {
    const row = {};
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
    if (updates.resetCode !== undefined) row.reset_code = updates.resetCode;
    if (updates.resetCodeExpiresAt !== undefined) row.reset_code_expires_at = updates.resetCodeExpiresAt;

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
    // Try Supabase first (don't use single: true to avoid 406 on empty result)
    const result = await supabaseRequest('settings', 'GET', {
      filters: '?key=eq.cohort_settings',
    });
    if (Array.isArray(result) && result.length > 0 && result[0].value) {
      // Also sync to localStorage as backup
      localStorage.setItem('uc30_cohort_settings', JSON.stringify(result[0].value));
      return result[0].value;
    }
    // Fallback to localStorage
    try {
      const data = localStorage.getItem('uc30_cohort_settings');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },

  async getContentOverrides() {
    const result = await supabaseRequest('settings', 'GET', {
      filters: '?key=eq.content_overrides',
    });
    if (Array.isArray(result) && result.length > 0 && result[0].value) {
      localStorage.setItem('uc30_content_overrides', JSON.stringify(result[0].value));
      return result[0].value;
    }
    try {
      const data = localStorage.getItem('uc30_content_overrides');
      return data ? JSON.parse(data) : {};
    } catch { return {}; }
  },

  async setContentOverrides(overrides) {
    localStorage.setItem('uc30_content_overrides', JSON.stringify(overrides));
    const body = { value: overrides, updated_at: new Date().toISOString() };
    const result = await supabaseRequest('settings', 'PATCH', {
      filters: '?key=eq.content_overrides',
      body,
    });
    if (!result || (Array.isArray(result) && result.length === 0)) {
      await supabaseRequest('settings', 'POST', {
        body: { key: 'content_overrides', ...body },
      });
    }
  },

  async getLiveCalls() {
    const result = await supabaseRequest('settings', 'GET', {
      filters: '?key=eq.live_calls',
    });
    if (Array.isArray(result) && result.length > 0 && result[0].value) {
      localStorage.setItem('uc30_live_calls', JSON.stringify(result[0].value));
      return result[0].value;
    }
    try {
      const data = localStorage.getItem('uc30_live_calls');
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  async setLiveCalls(calls) {
    localStorage.setItem('uc30_live_calls', JSON.stringify(calls));
    const body = { value: calls, updated_at: new Date().toISOString() };
    const result = await supabaseRequest('settings', 'PATCH', {
      filters: '?key=eq.live_calls',
      body,
    });
    if (!result || (Array.isArray(result) && result.length === 0)) {
      await supabaseRequest('settings', 'POST', {
        body: { key: 'live_calls', ...body },
      });
    }
  },

  async getPhases() {
    const result = await supabaseRequest('settings', 'GET', {
      filters: '?key=eq.phases',
    });
    if (Array.isArray(result) && result.length > 0 && result[0].value) {
      localStorage.setItem('uc30_phases', JSON.stringify(result[0].value));
      return result[0].value;
    }
    try {
      const data = localStorage.getItem('uc30_phases');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },

  async setPhases(phases) {
    localStorage.setItem('uc30_phases', JSON.stringify(phases));
    const body = { value: phases, updated_at: new Date().toISOString() };
    const result = await supabaseRequest('settings', 'PATCH', {
      filters: '?key=eq.phases',
      body,
    });
    if (!result || (Array.isArray(result) && result.length === 0)) {
      await supabaseRequest('settings', 'POST', {
        body: { key: 'phases', ...body },
      });
    }
  },

  async getLandingContent() {
    const result = await supabaseRequest('settings', 'GET', {
      filters: '?key=eq.landing_content',
    });
    if (Array.isArray(result) && result.length > 0 && result[0].value) {
      localStorage.setItem('uc30_landing_content', JSON.stringify(result[0].value));
      return result[0].value;
    }
    try {
      const data = localStorage.getItem('uc30_landing_content');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },

  async setLandingContent(content) {
    localStorage.setItem('uc30_landing_content', JSON.stringify(content));
    const body = { value: content, updated_at: new Date().toISOString() };
    const result = await supabaseRequest('settings', 'PATCH', {
      filters: '?key=eq.landing_content',
      body,
    });
    if (!result || (Array.isArray(result) && result.length === 0)) {
      await supabaseRequest('settings', 'POST', {
        body: { key: 'landing_content', ...body },
      });
    }
  },

  async getSupportTickets() {
    const result = await supabaseRequest('settings', 'GET', {
      filters: '?key=eq.support_tickets',
    });
    if (Array.isArray(result) && result.length > 0 && result[0].value) {
      localStorage.setItem('uc30_support_tickets', JSON.stringify(result[0].value));
      return result[0].value;
    }
    try {
      const data = localStorage.getItem('uc30_support_tickets');
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  async setSupportTickets(tickets) {
    localStorage.setItem('uc30_support_tickets', JSON.stringify(tickets));
    const body = { value: tickets, updated_at: new Date().toISOString() };
    const result = await supabaseRequest('settings', 'PATCH', {
      filters: '?key=eq.support_tickets',
      body,
    });
    if (!result || (Array.isArray(result) && result.length === 0)) {
      await supabaseRequest('settings', 'POST', {
        body: { key: 'support_tickets', ...body },
      });
    }
  },

  async setCohortSettings(settings) {
    // Always save to localStorage as backup
    localStorage.setItem('uc30_cohort_settings', JSON.stringify(settings));
    const body = { value: settings, updated_at: new Date().toISOString() };
    // Try PATCH first (update existing)
    const result = await supabaseRequest('settings', 'PATCH', {
      filters: '?key=eq.cohort_settings',
      body,
    });
    // If no row existed, PATCH returns empty array — create via POST
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
    name: `${user.firstName} ${user.lastName}`.trim(),
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    password: user.password,
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
    profile_picture: user.profilePicture || null,
  };
}

function fromDbRow(row) {
  // Support old rows that only have `name` (no first_name/last_name)
  const nameParts = (row.name || '').split(' ');
  return {
    id: row.id,
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
    resetCode: row.reset_code || null,
    resetCodeExpiresAt: row.reset_code_expires_at || null,
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
  getContentOverrides() {
    try {
      const data = localStorage.getItem('uc30_content_overrides');
      return data ? JSON.parse(data) : {};
    } catch { return {}; }
  },
  setContentOverrides(overrides) {
    try {
      localStorage.setItem('uc30_content_overrides', JSON.stringify(overrides));
    } catch {}
  },
  getLiveCalls() {
    try {
      const data = localStorage.getItem('uc30_live_calls');
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },
  setLiveCalls(calls) {
    try {
      localStorage.setItem('uc30_live_calls', JSON.stringify(calls));
    } catch {}
  },
  getPhases() {
    try {
      const data = localStorage.getItem('uc30_phases');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },
  setPhases(phases) {
    try {
      localStorage.setItem('uc30_phases', JSON.stringify(phases));
    } catch {}
  },
  getLandingContent() {
    try {
      const data = localStorage.getItem('uc30_landing_content');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },
  setLandingContent(content) {
    try {
      localStorage.setItem('uc30_landing_content', JSON.stringify(content));
    } catch {}
  },
  getSupportTickets() {
    try {
      const data = localStorage.getItem('uc30_support_tickets');
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },
  setSupportTickets(tickets) {
    try {
      localStorage.setItem('uc30_support_tickets', JSON.stringify(tickets));
    } catch {}
  },
};

// ── Export the right storage based on config ─────────────────────
export const storage = USE_SUPABASE ? supabaseStorage : localStorageFallback;
export const isSupabaseEnabled = USE_SUPABASE;

// ── Create new user object ───────────────────────────────────────
export function createNewUser(firstName, lastName, email, password) {
  return {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
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
  };
}
