import { useState, useCallback, useEffect } from 'react';
import { storage, createNewUser, isSupabaseEnabled } from '../utils/storage';
import { CHALLENGE_DAYS, POST_30_TASK } from '../data/challengeDays';
import { hashPassword } from '../utils/crypto';
import { subscribeUser, tagSignUp, tagDayStarted, tagChallengeCompleted, tagRemovedFromCohort, sendPasswordResetCode, isKitEnabled } from '../utils/kit';

export function useAppState() {
  const [user, setUser] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentView, setCurrentView] = useState('login');
  const [loading, setLoading] = useState(true);
  const [cohortStartDate, setCohortStartDateState] = useState(null);
  const [nextCohortDate, setNextCohortDateState] = useState(null);
  const [contentOverrides, setContentOverridesState] = useState({});
  const [liveCalls, setLiveCallsState] = useState([]);
  const [customPhases, setCustomPhasesState] = useState(null);
  const [landingContent, setLandingContentState] = useState(null);
  const [supportTickets, setSupportTicketsState] = useState([]);

  // Persist helper (localStorage only — Supabase persists per-operation)
  const persist = useCallback((newUser, newParticipants) => {
    storage.setUser(newUser);
    if (!isSupabaseEnabled) {
      storage.setParticipants(newParticipants);
    }
  }, []);

  // ── Auto-removal for missed days ──────────────────────
  // Checks all active participants and removes anyone who missed their Pacific deadline.
  // Runs on load and every 5 minutes.
  const autoRemoveMissed = useCallback(async (currentParticipants, startDate) => {
    if (!startDate) return; // No cohort mode — no auto-removal

    // Get current date in Pacific time (deadline timezone)
    const pacific = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    const nowPacific = new Date(pacific);
    const nowPacificDay = new Date(nowPacific.getFullYear(), nowPacific.getMonth(), nowPacific.getDate());

    const start = new Date(startDate + 'T00:00:00');
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());

    // Pacific calendar day: which challenge day is it based on Pacific time?
    const pacificDayNum = Math.floor((nowPacificDay - startDay) / (1000 * 60 * 60 * 24)) + 1;

    // If cohort hasn't started yet, no removals
    if (pacificDayNum < 2) return; // Need at least Day 2 for Day 1's deadline to have passed

    const removals = [];
    for (const p of currentParticipants) {
      // Skip admins, already-removed users, and users who finished the challenge
      if (p.isAdmin || !p.isActive || p.currentDay > 30) continue;

      // If user's currentDay is behind the Pacific calendar day, they missed a deadline
      // e.g., Pacific is Day 3, user is still on Day 1 → missed Day 1 and Day 2 deadlines
      if (p.currentDay < pacificDayNum) {
        removals.push(p);
      }
    }

    for (const p of removals) {
      const updates = { isActive: false, removedAt: new Date().toISOString() };
      if (isSupabaseEnabled) {
        await storage.updateParticipant(p.id, updates);
      }
      // Tag in Kit
      tagRemovedFromCohort(p.email).catch(() => {});
    }

    if (removals.length > 0 && isSupabaseEnabled) {
      const fresh = await storage.getParticipants();
      setParticipants(fresh || []);
      // If current user was removed, update their state
      const currentUser = user;
      if (currentUser && removals.find(r => r.id === currentUser.id)) {
        const updatedUser = { ...currentUser, isActive: false, removedAt: new Date().toISOString() };
        setUser(updatedUser);
        storage.setUser(updatedUser);
      }
    } else if (removals.length > 0) {
      // localStorage mode
      const updatedParticipants = currentParticipants.map(p => {
        const removed = removals.find(r => r.id === p.id);
        return removed ? { ...p, isActive: false, removedAt: new Date().toISOString() } : p;
      });
      setParticipants(updatedParticipants);
      persist(user, updatedParticipants);
    }
  }, [user, persist]);

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
        if (cohortSettings?.nextCohortDate) {
          setNextCohortDateState(cohortSettings.nextCohortDate);
        }

        const overrides = await Promise.resolve(storage.getContentOverrides());
        if (overrides) setContentOverridesState(overrides);

        const calls = await Promise.resolve(storage.getLiveCalls());
        if (calls) setLiveCallsState(calls);

        const phases = await Promise.resolve(storage.getPhases());
        if (phases) setCustomPhasesState(phases);

        const landing = await Promise.resolve(storage.getLandingContent());
        if (landing) setLandingContentState(landing);

        const tickets = await Promise.resolve(storage.getSupportTickets());
        if (tickets) setSupportTicketsState(tickets);

        const storedUser = await Promise.resolve(storage.getUser());
        if (storedUser) {
          // Refresh from participants list
          const fresh = (storedParticipants || []).find(p => p.id === storedUser.id);
          const currentUser = fresh || storedUser;
          setUser(currentUser);
          setCurrentView(currentUser.isAdmin ? 'admin' : 'dashboard');
        }

        // Auto-remove participants who missed their deadline
        if (cohortSettings?.startDate && storedParticipants?.length > 0) {
          autoRemoveMissed(storedParticipants, cohortSettings.startDate);
        }
      } catch (err) {
        console.error('Failed to load state:', err);
      }
      setLoading(false);
    })();
  }, []);

  // Periodic auto-removal check (every 5 minutes)
  useEffect(() => {
    if (!cohortStartDate || participants.length === 0) return;
    const interval = setInterval(() => {
      autoRemoveMissed(participants, cohortStartDate);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [cohortStartDate, participants, autoRemoveMissed]);

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

    // Check hashed password first, then fall back to legacy plaintext
    const hashed = await hashPassword(email, password);
    if (existing.password !== hashed && existing.password !== password) {
      return { error: 'Incorrect password.' };
    }

    // Upgrade legacy plaintext password to hashed
    if (existing.password === password && existing.password !== hashed) {
      if (isSupabaseEnabled) {
        await storage.updateParticipant(existing.id, { password: hashed });
      } else {
        const updatedParticipants = participants.map(p =>
          p.id === existing.id ? { ...p, password: hashed } : p
        );
        setParticipants(updatedParticipants);
        storage.setParticipants(updatedParticipants);
      }
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

  const register = useCallback(async (firstName, lastName, email, password) => {
    let existing;
    if (isSupabaseEnabled) {
      existing = await storage.findByEmail(email);
    } else {
      existing = participants.find(p => p.email === email.toLowerCase());
    }

    if (existing) {
      return { error: 'An account with that email already exists. Please log in.' };
    }

    const hashed = await hashPassword(email, password);
    const newUser = createNewUser(firstName, lastName, email, hashed);

    // Set 1-year access from cohort start if a cohort is active
    if (cohortStartDate) {
      const expiresAt = new Date(cohortStartDate + 'T00:00:00');
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      newUser.accessExpiresAt = expiresAt.toISOString();
    }

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

    // Subscribe to Kit email list and tag sign up (fire and forget)
    subscribeUser(email, firstName).then(() => {
      tagSignUp(email).catch(() => {});
    }).catch(() => {});

    return { success: true };
  }, [participants, persist, cohortStartDate]);

  // Admin-only password reset (no self-service to prevent email guessing attacks)
  const adminResetPassword = useCallback(async (participantId, newPassword) => {
    if (!user?.isAdmin) return { error: 'Only admins can reset passwords.' };

    const target = participants.find(p => p.id === participantId);
    if (!target) return { error: 'Participant not found.' };

    const hashed = await hashPassword(target.email, newPassword);
    if (isSupabaseEnabled) {
      await storage.updateParticipant(participantId, { password: hashed });
    } else {
      const updatedParticipants = participants.map(p =>
        p.id === participantId ? { ...p, password: hashed } : p
      );
      setParticipants(updatedParticipants);
      storage.setParticipants(updatedParticipants);
    }

    return { success: true };
  }, [participants, user]);

  // ── Email-Based Password Reset ─────────────────────────
  const requestPasswordReset = useCallback(async (email) => {
    let target;
    if (isSupabaseEnabled) {
      target = await storage.findByEmail(email);
    } else {
      target = participants.find(p => p.email === email.toLowerCase());
    }
    if (!target) return { error: 'No account found with that email.' };

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    if (isSupabaseEnabled) {
      await storage.updateParticipant(target.id, { resetCode: code, resetCodeExpiresAt: expiresAt });
    } else {
      const updatedParticipants = participants.map(p =>
        p.id === target.id ? { ...p, resetCode: code, resetCodeExpiresAt: expiresAt } : p
      );
      setParticipants(updatedParticipants);
      storage.setParticipants(updatedParticipants);
    }

    // Try to send via Kit email
    if (isKitEnabled) {
      await sendPasswordResetCode(email.toLowerCase(), code).catch(() => {});
    }

    return { success: true, kitEnabled: isKitEnabled };
  }, [participants]);

  const confirmPasswordReset = useCallback(async (email, code, newPassword) => {
    let target;
    if (isSupabaseEnabled) {
      target = await storage.findByEmail(email);
    } else {
      target = participants.find(p => p.email === email.toLowerCase());
    }
    if (!target) return { error: 'No account found with that email.' };

    if (!target.resetCode || target.resetCode !== code) {
      return { error: 'Invalid reset code.' };
    }

    if (new Date(target.resetCodeExpiresAt) < new Date()) {
      return { error: 'Reset code has expired. Please request a new one.' };
    }

    const hashed = await hashPassword(email, newPassword);
    const updates = { password: hashed, resetCode: null, resetCodeExpiresAt: null };

    if (isSupabaseEnabled) {
      await storage.updateParticipant(target.id, updates);
    } else {
      const updatedParticipants = participants.map(p =>
        p.id === target.id ? { ...p, ...updates } : p
      );
      setParticipants(updatedParticipants);
      storage.setParticipants(updatedParticipants);
    }

    return { success: true };
  }, [participants]);

  // ── User Profile Updates ───────────────────────────────
  const updateProfile = useCallback(async (updates) => {
    if (!user) return { error: 'Not logged in.' };

    const allowedUpdates = {};
    if (updates.email !== undefined) {
      const newEmail = updates.email.toLowerCase().trim();
      if (!newEmail.includes('@')) return { error: 'Invalid email address.' };
      // Check for duplicate
      let existing;
      if (isSupabaseEnabled) {
        existing = await storage.findByEmail(newEmail);
      } else {
        existing = participants.find(p => p.email === newEmail);
      }
      if (existing && existing.id !== user.id) {
        return { error: 'That email is already in use.' };
      }
      allowedUpdates.email = newEmail;
      // Re-hash password with new email salt
      // User would need to provide password for this, so skip re-hashing for now
    }
    if (updates.profilePicture !== undefined) {
      allowedUpdates.profilePicture = updates.profilePicture;
    }
    if (updates.firstName !== undefined) {
      allowedUpdates.firstName = updates.firstName.trim();
    }
    if (updates.lastName !== undefined) {
      allowedUpdates.lastName = updates.lastName.trim();
    }

    if (Object.keys(allowedUpdates).length === 0) return { error: 'No changes.' };

    const updatedUser = { ...user, ...allowedUpdates };
    if (isSupabaseEnabled) {
      await storage.updateParticipant(user.id, allowedUpdates);
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
    return { success: true };
  }, [user, participants, persist]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!user) return { error: 'Not logged in.' };
    // Verify current password
    const currentHashed = await hashPassword(user.email, currentPassword);
    if (user.password !== currentHashed && user.password !== currentPassword) {
      return { error: 'Current password is incorrect.' };
    }
    const newHashed = await hashPassword(user.email, newPassword);
    if (isSupabaseEnabled) {
      await storage.updateParticipant(user.id, { password: newHashed });
    } else {
      const updatedParticipants = participants.map(p =>
        p.id === user.id ? { ...p, password: newHashed } : p
      );
      setParticipants(updatedParticipants);
      storage.setParticipants(updatedParticipants);
    }
    const updatedUser = { ...user, password: newHashed };
    setUser(updatedUser);
    storage.setUser(updatedUser);
    return { success: true };
  }, [user, participants]);

  // ── Support Tickets ────────────────────────────────────
  const submitSupportTicket = useCallback(async (subject, message, attachment) => {
    if (!user) return { error: 'Not logged in.' };
    const firstMessage = {
      id: `msg_${Date.now()}`,
      from: 'user',
      name: `${user.firstName} ${user.lastName}`.trim(),
      text: message,
      attachment: attachment || null,
      createdAt: new Date().toISOString(),
    };
    const ticket = {
      id: `ticket_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      participantId: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim(),
      subject,
      message,
      status: 'open',
      createdAt: new Date().toISOString(),
      adminResponse: null,
      respondedAt: null,
      messages: [firstMessage],
    };
    const updated = [...supportTickets, ticket];
    setSupportTicketsState(updated);
    await Promise.resolve(storage.setSupportTickets(updated));
    return { success: true };
  }, [user, supportTickets]);

  const replyToTicket = useCallback(async (ticketId, text, attachment) => {
    if (!user) return { error: 'Not logged in.' };
    const isAdmin = user.isAdmin;
    const msg = {
      id: `msg_${Date.now()}`,
      from: isAdmin ? 'admin' : 'user',
      name: isAdmin ? 'Admin' : `${user.firstName} ${user.lastName}`.trim(),
      text,
      attachment: attachment || null,
      createdAt: new Date().toISOString(),
    };
    const updated = supportTickets.map(t => {
      if (t.id !== ticketId) return t;
      const messages = [...(t.messages || []), msg];
      const updates = { messages };
      // Also update legacy fields for admin responses
      if (isAdmin) {
        updates.adminResponse = text;
        updates.respondedAt = msg.createdAt;
        updates.status = 'responded';
      } else {
        // User reply reopens if it was responded/closed
        if (t.status === 'responded' || t.status === 'closed') {
          updates.status = 'open';
        }
      }
      return { ...t, ...updates };
    });
    setSupportTicketsState(updated);
    await Promise.resolve(storage.setSupportTickets(updated));
    return { success: true };
  }, [user, supportTickets]);

  const updateSupportTicket = useCallback(async (ticketId, updates) => {
    const updated = supportTickets.map(t =>
      t.id === ticketId ? { ...t, ...updates } : t
    );
    setSupportTicketsState(updated);
    await Promise.resolve(storage.setSupportTickets(updated));
    return { success: true };
  }, [supportTickets]);

  const logout = useCallback(() => {
    setUser(null);
    setCurrentView('login');
    storage.setUser(null);
  }, []);

  // ── Submissions ──────────────────────────────────────
  const submitDay = useCallback(async (dayNum, proof) => {
    if (!user) return;

    const isPost30 = dayNum > 30;
    const dayData = isPost30 ? POST_30_TASK : CHALLENGE_DAYS[dayNum - 1];
    const submission = {
      day: dayNum,
      title: isPost30 ? `${dayData.title} (Day ${dayNum})` : dayData.title,
      timestamp: new Date().toISOString(),
      proof: proof.text || 'File uploaded',
      fileName: proof.fileName || null,
      fileData: proof.fileData || null,
      status: 'completed',
    };

    const updatedMetrics = { ...user.metrics };
    if (isPost30 && dayData.multiMetrics) {
      // Post-30 generic task has multiple metrics
      for (const m of dayData.multiMetrics) {
        updatedMetrics[m.key] = (updatedMetrics[m.key] || 0) + m.count;
      }
    } else if (dayData.metrics) {
      updatedMetrics[dayData.metrics.key] =
        (updatedMetrics[dayData.metrics.key] || 0) + dayData.metrics.count;
    }

    const updates = {
      currentDay: dayNum + 1,
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

    // Tag in Kit (fire and forget)
    if (dayNum < 30) {
      tagDayStarted(user.email, dayNum + 1).catch(() => {});
    }
    // Challenge completed on day 30 only if user has submitted at least one offer
    if (dayNum === 30 && (updatedMetrics.offersSubmitted || 0) > 0) {
      tagChallengeCompleted(user.email).catch(() => {});
    }
  }, [user, participants, persist]);

  // ── Admin Actions ────────────────────────────────────
  const removeParticipant = useCallback(async (participantId) => {
    const updates = { isActive: false, removedAt: new Date().toISOString() };

    // Find the participant's email for Kit tagging
    const removed = participants.find(p => p.id === participantId);

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

    // Tag removed user in Kit (fire and forget)
    if (removed?.email) {
      tagRemovedFromCohort(removed.email).catch(() => {});
    }
  }, [participants, user, persist]);

  const deleteParticipant = useCallback(async (participantId) => {
    if (isSupabaseEnabled) {
      await storage.deleteParticipant(participantId);
      const allParticipants = await storage.getParticipants();
      setParticipants(allParticipants || []);
    } else {
      const updatedParticipants = participants.filter(p => p.id !== participantId);
      setParticipants(updatedParticipants);
      persist(user, updatedParticipants);
    }
  }, [participants, user, persist]);

  const reactivateParticipant = useCallback(async (participantId) => {
    // Calculate current calendar day so reactivated user isn't immediately auto-removed
    let calDay = 1;
    if (cohortStartDate) {
      const pacific = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
      const nowPacific = new Date(pacific);
      const nowPacificDay = new Date(nowPacific.getFullYear(), nowPacific.getMonth(), nowPacific.getDate());
      const start = new Date(cohortStartDate + 'T00:00:00');
      const startDateDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const computed = Math.floor((nowPacificDay - startDateDay) / (1000 * 60 * 60 * 24)) + 1;
      if (computed >= 1) calDay = computed;
    }

    // Preserve existing progress — use whichever currentDay is further along
    const existing = participants.find(p => p.id === participantId);
    const currentDay = existing
      ? Math.max(existing.currentDay || 1, calDay)
      : calDay;

    const updates = {
      isActive: true,
      removedAt: null,
      reactivatedAt: new Date().toISOString(),
      currentDay,
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
  }, [participants, user, persist, cohortStartDate]);

  const setCohortStartDate = useCallback(async (date) => {
    const current = await Promise.resolve(storage.getCohortSettings()) || {};
    const settings = { ...current, startDate: date };
    await Promise.resolve(storage.setCohortSettings(settings));
    setCohortStartDateState(date);

    // Stamp 1-year access expiration for active participants who don't have one yet
    if (date) {
      const expiresAt = new Date(date + 'T00:00:00');
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      const expiresIso = expiresAt.toISOString();

      const currentParticipants = await Promise.resolve(storage.getParticipants()) || [];
      for (const p of currentParticipants) {
        if (p.isActive && !p.isAdmin && !p.accessExpiresAt) {
          if (isSupabaseEnabled) {
            await storage.updateParticipant(p.id, { accessExpiresAt: expiresIso });
          }
        }
      }
      if (isSupabaseEnabled) {
        const fresh = await storage.getParticipants();
        setParticipants(fresh || []);
      }
    }
  }, []);

  const setNextCohortDate = useCallback(async (date) => {
    const current = await Promise.resolve(storage.getCohortSettings()) || {};
    const settings = { ...current, nextCohortDate: date };
    await Promise.resolve(storage.setCohortSettings(settings));
    setNextCohortDateState(date);
  }, []);

  const toggleAdmin = useCallback(async (participantId, makeAdmin) => {
    if (isSupabaseEnabled) {
      await storage.updateParticipant(participantId, { isAdmin: makeAdmin });
      const allParticipants = await storage.getParticipants();
      setParticipants(allParticipants || []);
    } else {
      const updatedParticipants = participants.map(p =>
        p.id === participantId ? { ...p, isAdmin: makeAdmin } : p
      );
      setParticipants(updatedParticipants);
      persist(user, updatedParticipants);
    }
  }, [participants, user, persist]);

  const setContentOverrides = useCallback(async (overrides) => {
    await Promise.resolve(storage.setContentOverrides(overrides));
    setContentOverridesState(overrides);
  }, []);

  const setLiveCalls = useCallback(async (calls) => {
    await Promise.resolve(storage.setLiveCalls(calls));
    setLiveCallsState(calls);
  }, []);

  const setPhases = useCallback(async (phases) => {
    await Promise.resolve(storage.setPhases(phases));
    setCustomPhasesState(phases);
  }, []);

  const setLandingContent = useCallback(async (content) => {
    await Promise.resolve(storage.setLandingContent(content));
    setLandingContentState(content);
  }, []);

  return {
    user,
    participants,
    currentView,
    loading,
    cohortStartDate,
    nextCohortDate,
    contentOverrides,
    navigate: setCurrentView,
    login,
    register,
    adminResetPassword,
    requestPasswordReset,
    confirmPasswordReset,
    updateProfile,
    changePassword,
    logout,
    submitDay,
    removeParticipant,
    deleteParticipant,
    reactivateParticipant,
    toggleAdmin,
    refreshParticipants,
    setCohortStartDate,
    setNextCohortDate,
    setContentOverrides,
    liveCalls,
    setLiveCalls,
    customPhases,
    setPhases,
    landingContent,
    setLandingContent,
    supportTickets,
    submitSupportTicket,
    replyToTicket,
    updateSupportTicket,
  };
}
