import { useState, useCallback, useEffect } from 'react';
import { storage, createNewUser } from '../utils/storage';
import { CHALLENGE_DAYS } from '../data/challengeDays';

export function useAppState() {
  const [user, setUser] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentView, setCurrentView] = useState('login');
  const [loading, setLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    const storedUser = storage.getUser();
    const storedParticipants = storage.getParticipants();
    setParticipants(storedParticipants);

    if (storedUser) {
      // Refresh user data from participants list (may have been updated by admin)
      const fresh = storedParticipants.find(p => p.id === storedUser.id);
      if (fresh) {
        setUser(fresh);
        setCurrentView(fresh.isAdmin ? 'admin' : 'dashboard');
      } else {
        setUser(storedUser);
        setCurrentView(storedUser.isAdmin ? 'admin' : 'dashboard');
      }
    }
    setLoading(false);
  }, []);

  // Persist whenever state changes
  const persist = useCallback((newUser, newParticipants) => {
    storage.setUser(newUser);
    storage.setParticipants(newParticipants);
  }, []);

  // ── Auth ─────────────────────────────────────────────
  const login = useCallback((name, email) => {
    const existing = participants.find(p => p.email === email.toLowerCase());
    if (existing) {
      setUser(existing);
      setCurrentView(existing.isAdmin ? 'admin' : 'dashboard');
      persist(existing, participants);
    } else {
      const newUser = createNewUser(name, email);
      const newParticipants = [...participants, newUser];
      setUser(newUser);
      setParticipants(newParticipants);
      setCurrentView(newUser.isAdmin ? 'admin' : 'dashboard');
      persist(newUser, newParticipants);
    }
  }, [participants, persist]);

  const logout = useCallback(() => {
    setUser(null);
    setCurrentView('login');
    storage.setUser(null);
  }, []);

  // ── Submissions ──────────────────────────────────────
  const submitDay = useCallback((dayNum, proof) => {
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

    const updatedUser = {
      ...user,
      currentDay: Math.min(dayNum + 1, 31),
      completedDays: [...user.completedDays, dayNum],
      submissions: [...user.submissions, submission],
      metrics: updatedMetrics,
    };

    const updatedParticipants = participants.map(p =>
      p.id === user.id ? updatedUser : p
    );

    setUser(updatedUser);
    setParticipants(updatedParticipants);
    persist(updatedUser, updatedParticipants);
  }, [user, participants, persist]);

  // ── Admin Actions ────────────────────────────────────
  const removeParticipant = useCallback((participantId) => {
    const updatedParticipants = participants.map(p =>
      p.id === participantId
        ? { ...p, isActive: false, removedAt: new Date().toISOString() }
        : p
    );
    setParticipants(updatedParticipants);
    persist(user, updatedParticipants);
  }, [participants, user, persist]);

  const reactivateParticipant = useCallback((participantId) => {
    const updatedParticipants = participants.map(p =>
      p.id === participantId
        ? {
            ...p,
            isActive: true,
            removedAt: null,
            currentDay: 1,
            completedDays: [],
            submissions: [],
            metrics: { propertiesAnalyzed: 0, offersSubmitted: 0, agentsContacted: 0 },
          }
        : p
    );

    setParticipants(updatedParticipants);

    // If reactivating self
    if (user?.id === participantId) {
      const reactivated = updatedParticipants.find(p => p.id === participantId);
      setUser(reactivated);
      persist(reactivated, updatedParticipants);
    } else {
      persist(user, updatedParticipants);
    }
  }, [participants, user, persist]);

  return {
    user,
    participants,
    currentView,
    loading,
    navigate: setCurrentView,
    login,
    logout,
    submitDay,
    removeParticipant,
    reactivateParticipant,
  };
}
