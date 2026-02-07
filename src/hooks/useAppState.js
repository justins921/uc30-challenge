import { useState, useCallback, useEffect } from 'react';
import { storage, createNewUser, isSupabaseEnabled } from '../utils/storage';
import { CHALLENGE_DAYS } from '../data/challengeDays';

export function useAppState() {
  const [user, setUser] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentView, setCurrentView] = useState('login');
  const [loading, setLoading] = useState(true);
  const [cohortStartDate, setCohortStartDateState] = useState(null);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const storedParticipants = await Promise.resolve(storage.getParticipants());
        setParticipants(storedParticipants || []);

        const cohortSettings = await Promise.resolve(storage.getCohortSettings());
        if (cohortSettings?.startDate) {
          setCohortStartDateState(cohortSettings.startDate);
        }

        const storedUser = await Promise.resolve(storage.getUser());
        if (storedUser) {
          // Refresh from participants list
          const fresh = (storedParticipants || []).find(p => p.id === storedUser.id);
          const currentUser = fresh || storedUser;
          setUser(currentUser);
          setCurrentView(currentUser.isAdmin ? 'admin' : 'dashboard');
        }
      } catch (err) {
        console.error('Failed to load state:', err);
      }
      setLoading(false);
    })();
  }, []);

  // Persist helper (localStorage only — Supabase persists per-operation)
  const persist = useCallback((newUser, newParticipants) => {
    storage.setUser(newUser);
    if (!isSupabaseEnabled) {
      storage.setParticipants(newParticipants);
    }
  }, []);

  // Refresh participants from Supabase
  const refreshParticipants = useCallback(async () => {
    if (isSupabaseEnabled) {
      const fresh = await storage.getParticipants();
      if (fresh) setParticipants(fresh);
      return fresh || [];
    }
    return participants;
  }, [participants]);

  // ── Auth ─────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    let existing;
    if (isSupabaseEnabled) {
      existing = await storage.findByEmail(email);
    } else {
      existing = participants.find(p => p.email === email.toLowerCase());
    }

    if (!existing) {
      return { error: 'No account found with that email. Please register first.' };
    }
    if (existing.password !== password) {
      return { error: 'Incorrect password.' };
    }

    setUser(existing);
    setCurrentView(existing.isAdmin ? 'admin' : 'dashboard');
    storage.setUser(existing);

    if (isSupabaseEnabled) {
      const allParticipants = await storage.getParticipants();
      setParticipants(allParticipants || []);
    }

    return { success: true };
  }, [participants]);

  const register = useCallback(async (name, email, password) => {
    let existing;
    if (isSupabaseEnabled) {
      existing = await storage.findByEmail(email);
    } else {
      existing = participants.find(p => p.email === email.toLowerCase());
    }

    if (existing) {
      return { error: 'An account with that email already exists. Please log in.' };
    }

    const newUser = createNewUser(name, email, password);

    if (isSupabaseEnabled) {
      const saved = await storage.addParticipant(newUser);
      if (!saved) return { error: 'Failed to create account. Please try again.' };
      setUser(saved);
      storage.setUser(saved);
      const allParticipants = await storage.getParticipants();
      setParticipants(allParticipants || []);
      setCurrentView(saved.isAdmin ? 'admin' : 'dashboard');
    } else {
      const newParticipants = [...participants, newUser];
      setUser(newUser);
      setParticipants(newParticipants);
      setCurrentView(newUser.isAdmin ? 'admin' : 'dashboard');
      persist(newUser, newParticipants);
    }

    return { success: true };
  }, [participants, persist]);

  const resetPassword = useCallback(async (email, newPassword) => {
    let existing;
    if (isSupabaseEnabled) {
      existing = await storage.findByEmail(email);
    } else {
      existing = participants.find(p => p.email === email.toLowerCase());
    }

    if (!existing) {
      return { error: 'No account found with that email.' };
    }

    if (isSupabaseEnabled) {
      await storage.updateParticipant(existing.id, { password: newPassword });
    } else {
      const updatedParticipants = participants.map(p =>
        p.id === existing.id ? { ...p, password: newPassword } : p
      );
      setParticipants(updatedParticipants);
      storage.setParticipants(updatedParticipants);
    }

    return { success: true };
  }, [participants]);

  const logout = useCallback(() => {
    setUser(null);
    setCurrentView('login');
    storage.setUser(null);
  }, []);

  // ── Submissions ──────────────────────────────────────
  const submitDay = useCallback(async (dayNum, proof) => {
    if (!user) return;

    const dayData = CHALLENGE_DAYS[dayNum - 1];
    const submission = {
      day: dayNum,
      title: dayData.title,
      timestamp: new Date().toISOString(),
      proof: proof.text || 'File uploaded',
      fileName: proof.fileName || null,
      status: 'completed',
    };

    const updatedMetrics = { ...user.metrics };
    if (dayData.metrics) {
      updatedMetrics[dayData.metrics.key] =
        (updatedMetrics[dayData.metrics.key] || 0) + dayData.metrics.count;
    }

    const updates = {
      currentDay: Math.min(dayNum + 1, 31),
      completedDays: [...user.completedDays, dayNum],
      submissions: [...user.submissions, submission],
      metrics: updatedMetrics,
    };

    const updatedUser = { ...user, ...updates };

    if (isSupabaseEnabled) {
      await storage.updateParticipant(user.id, updates);
      const allParticipants = await storage.getParticipants();
      setParticipants(allParticipants || []);
    } else {
      const updatedParticipants = participants.map(p =>
        p.id === user.id ? updatedUser : p
      );
      setParticipants(updatedParticipants);
      persist(updatedUser, updatedParticipants);
    }

    setUser(updatedUser);
    storage.setUser(updatedUser);
  }, [user, participants, persist]);

  // ── Admin Actions ────────────────────────────────────
  const removeParticipant = useCallback(async (participantId) => {
    const updates = { isActive: false, removedAt: new Date().toISOString() };

    if (isSupabaseEnabled) {
      await storage.updateParticipant(participantId, updates);
      const allParticipants = await storage.getParticipants();
      setParticipants(allParticipants || []);
    } else {
      const updatedParticipants = participants.map(p =>
        p.id === participantId ? { ...p, ...updates } : p
      );
      setParticipants(updatedParticipants);
      persist(user, updatedParticipants);
    }
  }, [participants, user, persist]);

  const reactivateParticipant = useCallback(async (participantId) => {
    const updates = {
      isActive: true,
      removedAt: null,
      reactivatedAt: new Date().toISOString(),
      currentDay: 1,
      completedDays: [],
      submissions: [],
      metrics: { propertiesAnalyzed: 0, offersSubmitted: 0, agentsContacted: 0 },
    };

    if (isSupabaseEnabled) {
      const updated = await storage.updateParticipant(participantId, updates);
      const allParticipants = await storage.getParticipants();
      setParticipants(allParticipants || []);
      if (user?.id === participantId && updated) {
        setUser(updated);
        storage.setUser(updated);
      }
    } else {
      const updatedParticipants = participants.map(p =>
        p.id === participantId ? { ...p, ...updates } : p
      );
      setParticipants(updatedParticipants);
      if (user?.id === participantId) {
        const reactivated = updatedParticipants.find(p => p.id === participantId);
        setUser(reactivated);
        persist(reactivated, updatedParticipants);
      } else {
        persist(user, updatedParticipants);
      }
    }
  }, [participants, user, persist]);

  const setCohortStartDate = useCallback(async (date) => {
    const settings = { startDate: date };
    await Promise.resolve(storage.setCohortSettings(settings));
    setCohortStartDateState(date);
  }, []);

  return {
    user,
    participants,
    currentView,
    loading,
    cohortStartDate,
    navigate: setCurrentView,
    login,
    register,
    resetPassword,
    logout,
    submitDay,
    removeParticipant,
    reactivateParticipant,
    refreshParticipants,
    setCohortStartDate,
  };
}
