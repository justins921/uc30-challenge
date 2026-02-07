// ── Storage Layer ────────────────────────────────────────────────────
// Currently uses localStorage. When you add a backend (Firebase, Supabase, etc.),
// replace these functions — the rest of the app won't need to change.

const STORAGE_KEYS = {
  USER: 'uc30_current_user',
  PARTICIPANTS: 'uc30_participants',
};

export const storage = {
  // ── User ───────────────────────────────────────────────
  getUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch { /* silent */ }
  },

  // ── Participants ───────────────────────────────────────
  getParticipants() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setParticipants(participants) {
    try {
      localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
    } catch { /* silent */ }
  },

  // ── Helpers ────────────────────────────────────────────
  updateParticipant(id, updates) {
    const participants = this.getParticipants();
    const updated = participants.map(p =>
      p.id === id ? { ...p, ...updates } : p
    );
    this.setParticipants(updated);
    return updated.find(p => p.id === id);
  },

  addParticipant(participant) {
    const participants = this.getParticipants();
    participants.push(participant);
    this.setParticipants(participants);
    return participant;
  },

  clearAll() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.PARTICIPANTS);
  },
};

// ── Create new user object ─────────────────────────────────────────
export function createNewUser(name, email) {
  return {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    email: email.toLowerCase(),
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
