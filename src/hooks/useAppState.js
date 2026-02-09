import { useState, useCallback, useEffect } from 'react';
import { storage, createNewUser, isSupabaseEnabled } from '../utils/storage';
import { supabase } from '../utils/supabaseClient';
import { CHALLENGE_DAYS, POST_30_TASK } from '../data/challengeDays';
import { hashPassword } from '../utils/crypto';
import { subscribeUser, tagSignUp, tagDayStarted, tagChallengeCompleted, tagRemovedFromCohort } from '../utils/kit';

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
  const [communityPosts, setCommunityPostsState] = useState([]);
  // Password recovery mode (triggered by Supabase auth event)
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  // Auth error (shown on login screen after failed OAuth redirect)
  const [authError, setAuthError] = useState(null);

  // Persist helper (localStorage only — Supabase persists per-operation)
  const persist = useCallback((newUser, newParticipants) => {
    storage.setUser(newUser);
    if (!isSupabaseEnabled) {
      storage.setParticipants(newParticipants);
    }
  }, []);

  // ── Auto-removal for missed days ──────────────────────
  const autoRemoveMissed = useCallback(async (currentParticipants, startDate) => {
    if (!startDate) return;

    const pacific = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    const nowPacific = new Date(pacific);
    const nowPacificDay = new Date(nowPacific.getFullYear(), nowPacific.getMonth(), nowPacific.getDate());

    const start = new Date(startDate + 'T00:00:00');
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());

    const pacificDayNum = Math.floor((nowPacificDay - startDay) / (1000 * 60 * 60 * 24)) + 1;

    if (pacificDayNum < 2) return;

    const removals = [];
    for (const p of currentParticipants) {
      if (p.isAdmin || !p.isActive || p.currentDay > 30) continue;
      if (p.currentDay < pacificDayNum) {
        removals.push(p);
      }
    }

    for (const p of removals) {
      const updates = { isActive: false, removedAt: new Date().toISOString() };
      if (isSupabaseEnabled) {
        await storage.updateParticipant(p.id, updates);
      }
      tagRemovedFromCohort(p.email).catch(() => {});
    }

    if (removals.length > 0 && isSupabaseEnabled) {
      const fresh = await storage.getParticipants();
      setParticipants(fresh || []);
      const currentUser = user;
      if (currentUser && removals.find(r => r.id === currentUser.id)) {
        const updatedUser = { ...currentUser, isActive: false, removedAt: new Date().toISOString() };
        setUser(updatedUser);
        storage.setUser(updatedUser);
      }
    } else if (removals.length > 0) {
      const updatedParticipants = currentParticipants.map(p => {
        const removed = removals.find(r => r.id === p.id);
        return removed ? { ...p, isActive: false, removedAt: new Date().toISOString() } : p;
      });
      setParticipants(updatedParticipants);
      persist(user, updatedParticipants);
    }
  }, [user, persist]);

  // ── Load initial state + listen for Supabase auth events ──
  useEffect(() => {
    let authListener;
    let oauthHandled = false;

    // Detect if we're returning from an OAuth redirect (URL contains auth hash params)
    const isOAuthRedirect = window.location.hash?.includes('access_token')
      || window.location.hash?.includes('error_description')
      || new URLSearchParams(window.location.search).has('code');

    // Helper: ensure a participant row exists for an authenticated OAuth/social user.
    // Creates a new participant or links an existing one by email.
    const ensureParticipant = async (authUser) => {
      if (!authUser?.email) { console.warn('ensureParticipant: no email on auth user'); return null; }

      // Look up existing participant by email
      let participant = await storage.findByEmail(authUser.email);

      if (participant) {
        // Link to this auth user if not linked or linked to a different auth user
        if (participant.authId !== authUser.id) {
          console.log('ensureParticipant: linking existing participant to auth user', authUser.id);
          await storage.updateParticipant(participant.id, { authId: authUser.id });
          participant = { ...participant, authId: authUser.id };
        }
        return participant;
      }

      // No participant found — create one from OAuth metadata
      const meta = authUser.user_metadata || {};
      const fullName = meta.full_name || meta.name || '';
      const nameParts = fullName.split(' ');
      const firstName = meta.first_name || nameParts[0] || authUser.email?.split('@')[0] || 'User';
      const lastName = meta.last_name || nameParts.slice(1).join(' ') || '';

      console.log('ensureParticipant: creating new participant for', authUser.email);
      const newUser = createNewUser(firstName, lastName, authUser.email, authUser.id);
      const saved = await storage.addParticipant(newUser);
      if (saved && !saved.__error) {
        subscribeUser(authUser.email, firstName).then(() => {
          tagSignUp(authUser.email).catch(() => {});
        }).catch(() => {});
        return saved;
      }
      console.error('ensureParticipant: addParticipant failed', saved?.__error || 'returned null');
      return null;
    };

    // Helper: load all app settings (cohort, content, tickets, etc.)
    const loadSettings = async () => {
      const storedParticipants = await Promise.resolve(storage.getParticipants());
      setParticipants(storedParticipants || []);

      const cohortSettings = await Promise.resolve(storage.getCohortSettings());
      if (cohortSettings?.startDate) setCohortStartDateState(cohortSettings.startDate);
      if (cohortSettings?.nextCohortDate) setNextCohortDateState(cohortSettings.nextCohortDate);

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

      const posts = await Promise.resolve(storage.getCommunityPosts());
      if (posts) setCommunityPostsState(posts);

      return { storedParticipants, cohortSettings };
    };

    // Helper: handle a resolved OAuth/session user
    const handleAuthUser = async (authUser) => {
      if (oauthHandled) return;
      try {
        const participant = await ensureParticipant(authUser);
        if (participant) {
          oauthHandled = true;
          setUser(participant);
          setCurrentView(participant.isAdmin ? 'admin' : 'dashboard');
          const allParticipants = await storage.getParticipants();
          setParticipants(allParticipants || []);
        } else {
          setAuthError('Account setup failed after sign-in. Please try registering with email and password.');
        }
      } catch (err) {
        console.error('OAuth participant setup error:', err);
        setAuthError(`Sign-in error: ${err.message}`);
      }
      setLoading(false);
    };

    // Listen for Supabase auth events FIRST (before async init) to catch OAuth redirects
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setPasswordRecovery(true);
        }
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setCurrentView('login');
          setPasswordRecovery(false);
        }
        // Handle OAuth sign-in from redirect (INITIAL_SESSION for PKCE flow, SIGNED_IN as backup)
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && session?.user && !oauthHandled) {
          const authUser = session.user;
          const provider = authUser.app_metadata?.provider;
          if (provider && provider !== 'email') {
            await handleAuthUser(authUser);
          }
        }
      });
      authListener = data?.subscription;
    }

    (async () => {
      try {
        const { storedParticipants, cohortSettings } = await loadSettings();

        const storedUser = await Promise.resolve(storage.getUser());
        if (storedUser) {
          const fresh = (storedParticipants || []).find(p => p.id === storedUser.id);
          const currentUser = fresh || storedUser;
          setUser(currentUser);
          setCurrentView(currentUser.isAdmin ? 'admin' : 'dashboard');
        } else if (supabase) {
          // No participant found by auth_id — check if there's an active session
          // (e.g. returning from OAuth redirect, or existing user using a new provider)
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const provider = session.user.app_metadata?.provider;
            if (provider && provider !== 'email') {
              // OAuth user — ensureParticipant
              await handleAuthUser(session.user);
            } else {
              // Email user with session but no participant — incomplete registration
              setAuthError('Your account setup is incomplete. Please use Register to complete it.');
            }
          } else if (isOAuthRedirect) {
            // URL has OAuth params but no session yet — the onAuthStateChange
            // listener will handle it when the SDK finishes processing the redirect.
            // Keep loading=true so the user sees the loading screen, not the landing page.
            return; // don't set loading=false yet — the listener will do it
          }
        }

        if (cohortSettings?.startDate && storedParticipants?.length > 0) {
          autoRemoveMissed(storedParticipants, cohortSettings.startDate);
        }
      } catch (err) {
        console.error('Failed to load state:', err);
      }
      setLoading(false);
    })();

    // Safety timeout: if OAuth redirect takes too long (e.g. network issue),
    // stop loading after 10 seconds so the user isn't stuck on the loading screen.
    let safetyTimeout;
    if (isOAuthRedirect) {
      safetyTimeout = setTimeout(() => {
        setLoading(prev => {
          if (prev) {
            setAuthError('Sign-in is taking too long. Please try again.');
          }
          return false;
        });
      }, 10000);
    }

    return () => {
      authListener?.unsubscribe();
      if (safetyTimeout) clearTimeout(safetyTimeout);
    };
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

  // ── Auth (Supabase Auth with legacy migration) ──────────────────

  const login = useCallback(async (email, password) => {
    // --- Supabase Auth path ---
    if (isSupabaseEnabled && supabase) {
      // Try Supabase Auth first
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (!authError && authData?.user) {
        // Supabase Auth success — look up participant
        let participant = await storage.findByEmail(email);
        if (participant && participant.authId !== authData.user.id) {
          // Link/re-link participant to this auth user (covers legacy + provider switch)
          await storage.updateParticipant(participant.id, { authId: authData.user.id });
          participant = { ...participant, authId: authData.user.id };
        }
        if (!participant) {
          // Auth user exists but no participant row — likely orphaned from failed registration.
          // Tell user to register (register handles the "already registered" auth case).
          return { error: 'Your account setup is incomplete. Please use Register to complete it.' };
        }
        setUser(participant);
        setCurrentView(participant.isAdmin ? 'admin' : 'dashboard');
        const allParticipants = await storage.getParticipants();
        setParticipants(allParticipants || []);
        return { success: true };
      }

      // If Supabase Auth fails, try legacy migration path
      const existing = await storage.findByEmail(email);
      if (!existing) {
        return { error: 'No account found with that email. Please register first.' };
      }

      // Check legacy password (SHA-256 hash or plaintext)
      const hashed = await hashPassword(email, password);
      if (existing.password !== hashed && existing.password !== password) {
        return { error: 'Incorrect password.' };
      }

      // Legacy password matched — create Supabase Auth account for migration
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signUpError) {
        // If sign-up fails (e.g. email already in auth but wrong password),
        // still allow login via legacy for now
        console.warn('Legacy migration sign-up failed:', signUpError.message);
        setUser(existing);
        setCurrentView(existing.isAdmin ? 'admin' : 'dashboard');
        const allParticipants = await storage.getParticipants();
        setParticipants(allParticipants || []);
        return { success: true };
      }

      // Link the auth user to the participant
      if (signUpData?.user) {
        await storage.updateParticipant(existing.id, {
          authId: signUpData.user.id,
          password: null, // clear legacy password
        });
      }

      setUser({ ...existing, authId: signUpData?.user?.id || null });
      setCurrentView(existing.isAdmin ? 'admin' : 'dashboard');
      const allParticipants = await storage.getParticipants();
      setParticipants(allParticipants || []);
      return { success: true };
    }

    // --- localStorage fallback ---
    const existing = participants.find(p => p.email === email.toLowerCase());
    if (!existing) {
      return { error: 'No account found with that email. Please register first.' };
    }
    const hashed = await hashPassword(email, password);
    if (existing.password !== hashed && existing.password !== password) {
      return { error: 'Incorrect password.' };
    }
    // Upgrade legacy plaintext
    if (existing.password === password && existing.password !== hashed) {
      const updatedParticipants = participants.map(p =>
        p.id === existing.id ? { ...p, password: hashed } : p
      );
      setParticipants(updatedParticipants);
      storage.setParticipants(updatedParticipants);
    }
    setUser(existing);
    setCurrentView(existing.isAdmin ? 'admin' : 'dashboard');
    storage.setUser(existing);
    return { success: true };
  }, [participants]);

  const register = useCallback(async (firstName, lastName, email, password) => {
    // --- Supabase Auth path ---
    if (isSupabaseEnabled && supabase) {
      // Check for existing participant
      const existing = await storage.findByEmail(email);
      if (existing) {
        return { error: 'An account with that email already exists. Please log in.' };
      }

      // Create Supabase Auth user (handles bcrypt hashing)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
        },
      });

      let authUserId = authData?.user?.id;

      if (authError) {
        // If auth user already exists (orphaned from a previous failed registration),
        // try signing in and create the missing participant row
        const isAlreadyRegistered = authError.message?.toLowerCase().includes('already registered')
          || authError.message?.toLowerCase().includes('already been registered');
        if (isAlreadyRegistered) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });
          if (signInError) {
            return { error: 'An auth account exists but the password doesn\'t match. Try logging in or reset your password.' };
          }
          authUserId = signInData?.user?.id;
        } else {
          return { error: authError.message };
        }
      }

      // Create participant row linked to auth user
      const newUser = createNewUser(firstName, lastName, email, authUserId);

      if (cohortStartDate) {
        const expiresAt = new Date(cohortStartDate + 'T00:00:00');
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        newUser.accessExpiresAt = expiresAt.toISOString();
      }

      const saved = await storage.addParticipant(newUser);
      if (!saved) return { error: 'Failed to create account. Please try again.' };
      if (saved.__error) return { error: `Failed to create account: ${saved.__error}` };

      setUser(saved);
      setCurrentView(saved.isAdmin ? 'admin' : 'dashboard');
      const allParticipants = await storage.getParticipants();
      setParticipants(allParticipants || []);

      // Kit email (fire and forget)
      subscribeUser(email, firstName).then(() => {
        tagSignUp(email).catch(() => {});
      }).catch(() => {});

      return { success: true };
    }

    // --- localStorage fallback ---
    const existing = participants.find(p => p.email === email.toLowerCase());
    if (existing) {
      return { error: 'An account with that email already exists. Please log in.' };
    }
    const hashed = await hashPassword(email, password);
    const newUser = createNewUser(firstName, lastName, email, null);
    newUser.password = hashed;

    if (cohortStartDate) {
      const expiresAt = new Date(cohortStartDate + 'T00:00:00');
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      newUser.accessExpiresAt = expiresAt.toISOString();
    }

    const newParticipants = [...participants, newUser];
    setUser(newUser);
    setParticipants(newParticipants);
    setCurrentView(newUser.isAdmin ? 'admin' : 'dashboard');
    persist(newUser, newParticipants);

    subscribeUser(email, firstName).then(() => {
      tagSignUp(email).catch(() => {});
    }).catch(() => {});

    return { success: true };
  }, [participants, persist, cohortStartDate]);

  // ── OAuth Login (Google / Apple) ─────────────────────────────
  const loginWithOAuth = useCallback(async (provider) => {
    if (!isSupabaseEnabled || !supabase) {
      return { error: 'Social login requires Supabase to be configured.' };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) return { error: error.message };
    // The page will redirect to the OAuth provider — onAuthStateChange handles the return
    return { success: true };
  }, []);

  const loginWithGoogle = useCallback(() => loginWithOAuth('google'), [loginWithOAuth]);
  const loginWithApple = useCallback(() => loginWithOAuth('apple'), [loginWithOAuth]);

  // ── Password Reset (Supabase native email) ─────────────────
  const requestPasswordReset = useCallback(async (email) => {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}?recovery=true` },
      );
      if (error) return { error: error.message };
      return { success: true };
    }
    // localStorage: no real email sending — just note it
    const target = participants.find(p => p.email === email.toLowerCase());
    if (!target) return { error: 'No account found with that email.' };
    return { success: true, note: 'In dev mode, password reset emails are not sent.' };
  }, [participants]);

  // Called after user clicks the reset link and lands on the app
  const confirmPasswordReset = useCallback(async (newPassword) => {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error: error.message };
      setPasswordRecovery(false);
      return { success: true };
    }
    return { error: 'Password reset is only available with Supabase configured.' };
  }, []);

  // Admin-only password reset (no self-service)
  const adminResetPassword = useCallback(async (participantId, newPassword) => {
    if (!user?.isAdmin) return { error: 'Only admins can reset passwords.' };

    const target = participants.find(p => p.id === participantId);
    if (!target) return { error: 'Participant not found.' };

    // If Supabase Auth, use admin API (requires service_role key on server-side)
    // For now, just update the legacy password column as fallback
    if (isSupabaseEnabled) {
      const hashed = await hashPassword(target.email, newPassword);
      await storage.updateParticipant(participantId, { password: hashed });
    } else {
      const hashed = await hashPassword(target.email, newPassword);
      const updatedParticipants = participants.map(p =>
        p.id === participantId ? { ...p, password: hashed } : p
      );
      setParticipants(updatedParticipants);
      storage.setParticipants(updatedParticipants);
    }
    return { success: true };
  }, [participants, user]);

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
      // Also update Supabase Auth email
      if (supabase) {
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        if (error) return { error: error.message };
      }
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

    // Supabase Auth: update password directly (session already validates identity)
    if (isSupabaseEnabled && supabase) {
      // Verify current password by attempting sign-in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (verifyError) {
        return { error: 'Current password is incorrect.' };
      }
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) return { error: updateError.message };
      return { success: true };
    }

    // localStorage fallback
    const currentHashed = await hashPassword(user.email, currentPassword);
    if (user.password !== currentHashed && user.password !== currentPassword) {
      return { error: 'Current password is incorrect.' };
    }
    const newHashed = await hashPassword(user.email, newPassword);
    const updatedParticipants = participants.map(p =>
      p.id === user.id ? { ...p, password: newHashed } : p
    );
    setParticipants(updatedParticipants);
    storage.setParticipants(updatedParticipants);
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
      if (isAdmin) {
        updates.adminResponse = text;
        updates.respondedAt = msg.createdAt;
        updates.status = 'responded';
      } else {
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

  // ── Getting Started ──────────────────────────────────
  const completeGettingStarted = useCallback(async (socialHandles, proof) => {
    if (!user) return { error: 'Not logged in.' };
    const updates = { gettingStartedCompleted: true, socialHandles: socialHandles || {} };
    // Store proof as a Getting Started submission if provided
    if (proof && (proof.text || proof.fileName)) {
      const gsSubmission = {
        day: 'getting_started',
        title: 'Getting Started',
        timestamp: new Date().toISOString(),
        proof: proof.text || 'Completed',
        fileName: proof.fileName || null,
        fileData: proof.fileData || null,
        status: 'completed',
      };
      updates.submissions = [...(user.submissions || []), gsSubmission];
    }
    const updatedUser = { ...user, ...updates };
    if (isSupabaseEnabled) {
      await storage.updateParticipant(user.id, updates);
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

  // ── Admin: Verify social media post ────────────────
  const verifySubmissionSocial = useCallback(async (participantId, dayNum, verified) => {
    if (!user?.isAdmin) return { error: 'Only admins can verify.' };
    const target = participants.find(p => p.id === participantId);
    if (!target) return { error: 'Participant not found.' };
    const updatedSubmissions = (target.submissions || []).map(s =>
      s.day === dayNum ? { ...s, socialMediaVerified: verified } : s
    );
    if (isSupabaseEnabled) {
      await storage.updateParticipant(participantId, { submissions: updatedSubmissions });
      const allParticipants = await storage.getParticipants();
      setParticipants(allParticipants || []);
    } else {
      const updatedParticipants = participants.map(p =>
        p.id === participantId ? { ...p, submissions: updatedSubmissions } : p
      );
      setParticipants(updatedParticipants);
      persist(user, updatedParticipants);
    }
    return { success: true };
  }, [user, participants, persist]);

  const logout = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
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
      socialMediaPosted: proof.socialMediaPosted || false,
      socialMediaVerified: false,
      status: 'completed',
    };

    const updatedMetrics = { ...user.metrics };
    if (isPost30 && dayData.multiMetrics) {
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

    if (dayNum < 30) {
      tagDayStarted(user.email, dayNum + 1).catch(() => {});
    }
    if (dayNum === 30 && (updatedMetrics.offersSubmitted || 0) > 0) {
      tagChallengeCompleted(user.email).catch(() => {});
    }
  }, [user, participants, persist]);

  // ── Admin Actions ────────────────────────────────────
  const removeParticipant = useCallback(async (participantId) => {
    const updates = { isActive: false, removedAt: new Date().toISOString() };
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

  // ── Community Board ─────────────────────────────────────
  const createCommunityPost = useCallback(async (title, body, dayTag) => {
    if (!user) return { error: 'Not logged in.' };
    if (user.communityBanned) return { error: 'You have been banned from the community.' };
    const post = {
      id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      authorId: user.id,
      authorName: `${user.firstName} ${user.lastName}`.trim(),
      authorAvatar: user.profilePicture || null,
      cohortDate: cohortStartDate || null,
      dayTag: dayTag || null,
      title,
      body,
      createdAt: new Date().toISOString(),
      comments: [],
      isDeleted: false,
      isPinned: false,
    };
    const updated = [...communityPosts, post];
    setCommunityPostsState(updated);
    await Promise.resolve(storage.setCommunityPosts(updated));
    return { success: true, post };
  }, [user, communityPosts, cohortStartDate]);

  const commentOnPost = useCallback(async (postId, text) => {
    if (!user) return { error: 'Not logged in.' };
    if (user.communityBanned) return { error: 'You have been banned from the community.' };
    const comment = {
      id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      authorId: user.id,
      authorName: `${user.firstName} ${user.lastName}`.trim(),
      authorAvatar: user.profilePicture || null,
      text,
      createdAt: new Date().toISOString(),
      isDeleted: false,
    };
    const updated = communityPosts.map(p =>
      p.id === postId ? { ...p, comments: [...(p.comments || []), comment] } : p
    );
    setCommunityPostsState(updated);
    await Promise.resolve(storage.setCommunityPosts(updated));
    return { success: true };
  }, [user, communityPosts]);

  const deleteCommunityPost = useCallback(async (postId) => {
    if (!user?.isAdmin) return { error: 'Only admins can delete posts.' };
    const updated = communityPosts.map(p =>
      p.id === postId ? { ...p, isDeleted: true } : p
    );
    setCommunityPostsState(updated);
    await Promise.resolve(storage.setCommunityPosts(updated));
    return { success: true };
  }, [user, communityPosts]);

  const deleteCommunityComment = useCallback(async (postId, commentId) => {
    if (!user?.isAdmin) return { error: 'Only admins can delete comments.' };
    const updated = communityPosts.map(p => {
      if (p.id !== postId) return p;
      return { ...p, comments: (p.comments || []).map(c =>
        c.id === commentId ? { ...c, isDeleted: true } : c
      )};
    });
    setCommunityPostsState(updated);
    await Promise.resolve(storage.setCommunityPosts(updated));
    return { success: true };
  }, [user, communityPosts]);

  const pinCommunityPost = useCallback(async (postId, pinned) => {
    if (!user?.isAdmin) return { error: 'Only admins can pin posts.' };
    const updated = communityPosts.map(p =>
      p.id === postId ? { ...p, isPinned: pinned } : p
    );
    setCommunityPostsState(updated);
    await Promise.resolve(storage.setCommunityPosts(updated));
    return { success: true };
  }, [user, communityPosts]);

  const warnCommunityUser = useCallback(async (participantId, message) => {
    if (!user?.isAdmin) return { error: 'Only admins can warn users.' };
    const target = participants.find(p => p.id === participantId);
    if (!target) return { error: 'Participant not found.' };
    const warnings = [...(target.communityWarnings || []), { message, createdAt: new Date().toISOString(), dismissed: false }];
    const updates = { communityWarnings: warnings };
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
    return { success: true };
  }, [user, participants, persist]);

  const banCommunityUser = useCallback(async (participantId, banned) => {
    if (!user?.isAdmin) return { error: 'Only admins can ban users.' };
    const updates = { communityBanned: banned };
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
    return { success: true };
  }, [user, participants, persist]);

  const dismissCommunityWarning = useCallback(async (warningIndex) => {
    if (!user) return;
    const warnings = [...(user.communityWarnings || [])];
    if (warnings[warningIndex]) warnings[warningIndex] = { ...warnings[warningIndex], dismissed: true };
    const updates = { communityWarnings: warnings };
    const updatedUser = { ...user, ...updates };
    if (isSupabaseEnabled) {
      await storage.updateParticipant(user.id, updates);
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

  // Refresh community posts every 30 seconds
  useEffect(() => {
    if (!user || currentView === 'login') return;
    const interval = setInterval(async () => {
      const fresh = await Promise.resolve(storage.getCommunityPosts());
      if (fresh) setCommunityPostsState(fresh);
    }, 30000);
    return () => clearInterval(interval);
  }, [user, currentView]);

  return {
    user,
    participants,
    currentView,
    loading,
    cohortStartDate,
    nextCohortDate,
    contentOverrides,
    cohortStats: (() => {
      const na = participants.filter(p => !p.isAdmin);
      return { active: na.filter(p => p.isActive).length, total: na.length };
    })(),
    passwordRecovery,
    authError,
    navigate: setCurrentView,
    login,
    register,
    loginWithGoogle,
    loginWithApple,
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
    completeGettingStarted,
    verifySubmissionSocial,
    communityPosts,
    createCommunityPost,
    commentOnPost,
    deleteCommunityPost,
    deleteCommunityComment,
    pinCommunityPost,
    warnCommunityUser,
    banCommunityUser,
    dismissCommunityWarning,
  };
}
