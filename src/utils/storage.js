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

// ── Follow-up date calculation ──────────────────────────────────────
export function validatePhone(phone, { required = false } = {}) {
  if (!phone || !phone.trim()) {
    if (required) return { valid: false, error: 'Phone number is required' };
    return { valid: true, formatted: null };
  }
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 11) {
    return { valid: false, error: 'Phone number must be 10 digits (or 11 with country code)' };
  }
  const formatted = digits.replace(/^1?(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3');
  return { valid: true, formatted };
}

export function calculateFollowUpDate(interval) {
  if (!interval || interval === 'never') return null;
  const d = new Date();
  switch (interval) {
    case '2_days': d.setDate(d.getDate() + 2); break;
    case '1_week': d.setDate(d.getDate() + 7); break;
    case '2_weeks': d.setDate(d.getDate() + 14); break;
    case '1_month': d.setMonth(d.getMonth() + 1); break;
    case '3_months': d.setMonth(d.getMonth() + 3); break;
    case '6_months': d.setMonth(d.getMonth() + 6); break;
    default: return null;
  }
  return d.toISOString();
}
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
        is_approved: row.is_approved,
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

    if (error) {
      console.error('updateParticipant error:', error);
      return { __error: error.message || 'Database update failed' };
    }
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

  async getLandingVersion() {
    const val = await this._getSetting('landing_version');
    return val || 'v1';
  },
  async setLandingVersion(version) { await this._setSetting('landing_version', version); },

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

  async getDailyMinimums() {
    const val = await this._getSetting('daily_minimums');
    if (val) { try { localStorage.setItem('uc30_daily_minimums', JSON.stringify(val)); } catch {} }
    return val || (() => { try { return JSON.parse(localStorage.getItem('uc30_daily_minimums')) || {}; } catch { return {}; } })();
  },
  async setDailyMinimums(minimums) { await this._setSetting('daily_minimums', minimums); },

  async getCommunityPosts() {
    const val = await this._getSetting('community_posts');
    if (val) { try { localStorage.setItem('uc30_community_posts', JSON.stringify(val)); } catch {} }
    return val || (() => { try { return JSON.parse(localStorage.getItem('uc30_community_posts')) || []; } catch { return []; } })();
  },
  async setCommunityPosts(posts) { await this._setSetting('community_posts', posts); },

  async getSkoolLink() {
    const val = await this._getSetting('skool_link');
    if (val) { try { localStorage.setItem('uc30_skool_link', JSON.stringify(val)); } catch {} }
    return val || (() => { try { return JSON.parse(localStorage.getItem('uc30_skool_link')); } catch { return null; } })();
  },
  async setSkoolLink(link) { await this._setSetting('skool_link', link); },

  async getPracticeDaySettings() {
    const val = await this._getSetting('practice_day_settings');
    if (val) { try { localStorage.setItem('uc30_practice_day_settings', JSON.stringify(val)); } catch {} }
    return val || (() => { try { return JSON.parse(localStorage.getItem('uc30_practice_day_settings')) || {}; } catch { return {}; } })();
  },
  async setPracticeDaySettings(settings) { await this._setSetting('practice_day_settings', settings); },

  // ── CRM: Contacts ────────────────────────────────────────────
  async addContact(contact) {
    const cleaned = Object.fromEntries(Object.entries(contact).filter(([, v]) => v != null));
    const { data, error } = await supabase
      .from('contacts')
      .insert(cleaned)
      .select()
      .single();
    if (error) { console.error('addContact error:', error); return null; }
    return data;
  },

  async getContacts(participantId) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('participant_id', participantId)
      .order('created_at', { ascending: false });
    if (error) { console.error('getContacts error:', error); return []; }
    return data || [];
  },

  async getContactWithFollowUps(contactId) {
    const { data: contact, error: cErr } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single();
    if (cErr) { console.error('getContactWithFollowUps error:', cErr); return null; }
    const { data: followUps, error: fErr } = await supabase
      .from('follow_ups')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: true });
    if (fErr) { console.error('getFollowUps error:', fErr); }
    return { ...contact, followUps: followUps || [] };
  },

  // Admin: get all contacts for any participant
  async getContactsForParticipant(participantId) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*, follow_ups(*)')
      .eq('participant_id', participantId)
      .order('created_at', { ascending: false });
    if (error) { console.error('getContactsForParticipant error:', error); return []; }
    return data || [];
  },

  async updateContact(contactId, updates) {
    const cleaned = Object.fromEntries(Object.entries(updates).filter(([, v]) => v != null));
    if (Object.keys(cleaned).length === 0) return null;
    const { data, error } = await supabase
      .from('contacts')
      .update(cleaned)
      .eq('id', contactId)
      .select()
      .single();
    if (error) { console.error('updateContact error:', error); return null; }
    return data;
  },

  // ── CRM: Follow-Ups ──────────────────────────────────────────
  async addFollowUp(followUp) {
    const { data, error } = await supabase
      .from('follow_ups')
      .insert(followUp)
      .select()
      .single();
    if (error) { console.error('addFollowUp error:', error); return null; }
    return data;
  },

  async getFollowUps(participantId, dayNumber) {
    let query = supabase
      .from('follow_ups')
      .select('*')
      .eq('participant_id', participantId)
      .order('created_at', { ascending: false });
    if (dayNumber !== undefined) {
      query = query.eq('day_number', dayNumber);
    }
    const { data, error } = await query;
    if (error) { console.error('getFollowUps error:', error); return []; }
    return data || [];
  },

  async getFollowUpsByContact(contactId) {
    const { data, error } = await supabase
      .from('follow_ups')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: true });
    if (error) { console.error('getFollowUpsByContact error:', error); return []; }
    return data || [];
  },

  // ── File Uploads (Supabase Storage) ───────────────────────────
  async uploadFile(participantId, dayNumber, indicator, file) {
    const ext = file.name.split('.').pop();
    const fileId = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const filePath = `${participantId}/day-${dayNumber}/${indicator}/${fileId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('uc30-uploads')
      .upload(filePath, file, { contentType: file.type });

    if (uploadError) { console.error('uploadFile error:', uploadError); return null; }

    // Record in uploads table
    const uploadRecord = {
      id: `upload_${fileId}`,
      participant_id: participantId,
      day_number: dayNumber,
      indicator,
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
    };

    const { data, error } = await supabase
      .from('uploads')
      .insert(uploadRecord)
      .select()
      .single();

    if (error) { console.error('upload record error:', error); }
    return data || uploadRecord;
  },

  async getUploads(participantId, dayNumber) {
    let query = supabase
      .from('uploads')
      .select('*')
      .eq('participant_id', participantId)
      .order('created_at', { ascending: true });
    if (dayNumber !== undefined) {
      query = query.eq('day_number', dayNumber);
    }
    const { data, error } = await query;
    if (error) { console.error('getUploads error:', error); return []; }
    return data || [];
  },

  async getUploadUrl(filePath) {
    const { data, error } = await supabase.storage
      .from('uc30-uploads')
      .createSignedUrl(filePath, 3600); // 1 hour
    if (error) { console.error('getUploadUrl error:', error); return null; }
    return data?.signedUrl || null;
  },

  // ── Daily Submissions (compliance system) ──────────────────────
  async upsertDailySubmission(submission) {
    const { data, error } = await supabase
      .from('daily_submissions')
      .upsert(submission, { onConflict: 'participant_id,challenge_day' })
      .select()
      .single();
    if (error) { console.error('upsertDailySubmission error:', error); return null; }
    return data;
  },

  async getDailySubmission(participantId, challengeDay) {
    const { data, error } = await supabase
      .from('daily_submissions')
      .select('*')
      .eq('participant_id', participantId)
      .eq('challenge_day', challengeDay)
      .maybeSingle();
    if (error) { console.error('getDailySubmission error:', error); return null; }
    return data;
  },

  async getDailySubmissions(participantId) {
    const { data, error } = await supabase
      .from('daily_submissions')
      .select('*')
      .eq('participant_id', participantId)
      .order('challenge_day', { ascending: true });
    if (error) { console.error('getDailySubmissions error:', error); return []; }
    return data || [];
  },

  async getAllDailySubmissions() {
    const { data, error } = await supabase
      .from('daily_submissions')
      .select('*')
      .order('challenge_day', { ascending: true });
    if (error) { console.error('getAllDailySubmissions error:', error); return []; }
    return data || [];
  },

  // ── Quiz Attempts ──────────────────────────────────────────────
  async addQuizAttempt(attempt) {
    const row = {
      id: attempt.id,
      participant_id: attempt.participantId,
      day_number: attempt.dayNumber,
      scenario_id: attempt.scenarioId,
      attempt_number: attempt.attemptNumber,
      answers: attempt.answers,
      correct: attempt.correct,
    };
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert(row)
      .select()
      .single();
    if (error) { console.error('addQuizAttempt error:', error); return null; }
    return data;
  },

  async getQuizAttempts(participantId, dayNumber) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('participant_id', participantId)
      .eq('day_number', dayNumber)
      .order('created_at', { ascending: true });
    if (error) { console.error('getQuizAttempts error:', error); return []; }
    return data || [];
  },

  async getQuizAttemptsByScenario(participantId, dayNumber, scenarioId) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('participant_id', participantId)
      .eq('day_number', dayNumber)
      .eq('scenario_id', scenarioId)
      .order('created_at', { ascending: true });
    if (error) { console.error('getQuizAttemptsByScenario error:', error); return []; }
    return data || [];
  },

  // ── Removal Log ─────────────────────────────────────────────────
  async addRemovalLog(entry) {
    const { data, error } = await supabase
      .from('removal_log')
      .insert(entry)
      .select()
      .single();
    if (error) { console.error('addRemovalLog error:', error); return null; }
    return data;
  },

  async getRemovalLog(participantId) {
    let query = supabase
      .from('removal_log')
      .select('*')
      .order('removed_at', { ascending: false });
    if (participantId) query = query.eq('participant_id', participantId);
    const { data, error } = await query;
    if (error) { console.error('getRemovalLog error:', error); return []; }
    return data || [];
  },

  // ── Compliance Settings ─────────────────────────────────────────
  async getComplianceSettings() {
    const daily = await this._getSetting('compliance_daily_minimums');
    const weekly = await this._getSetting('compliance_weekly_minimums');
    const enforcement = await this._getSetting('compliance_enforcement');
    return {
      dailyMinimums: daily || null,
      weeklyMinimums: weekly || null,
      enforcement: enforcement || null,
    };
  },

  async setComplianceDailyMinimums(minimums) {
    await this._setSetting('compliance_daily_minimums', minimums);
  },

  async setComplianceWeeklyMinimums(minimums) {
    await this._setSetting('compliance_weekly_minimums', minimums);
  },

  async setComplianceEnforcement(enforcement) {
    await this._setSetting('compliance_enforcement', enforcement);
  },
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
    is_developer: user.isDeveloper || false,
    current_day: user.currentDay,
    is_active: user.isActive,
    is_approved: user.approved || false,
    has_paid: user.hasPaid,
    start_date: user.startDate,
    completed_days: user.completedDays,
    submissions: user.submissions,
    metrics: user.metrics,
    removed_at: user.removedAt,
    access_expires_at: user.accessExpiresAt || null,
  };
  if (user.ucPoints !== undefined) row.uc_points = user.ucPoints;
  if (user.lifetimeOffersSubmitted !== undefined) row.lifetime_offers_submitted = user.lifetimeOffersSubmitted;
  // Only include profile_picture if it has a value (column may not exist yet)
  if (user.profilePicture) row.profile_picture = user.profilePicture;
  if (user.socialHandles && Object.keys(user.socialHandles).length > 0) row.social_handles = user.socialHandles;
  if (user.gettingStartedCompleted) row.getting_started_completed = true;
  if (user.getClear) row.get_clear = user.getClear;
  if (user.buyBox) row.buy_box = user.buyBox;
  if (user.commitmentDeclaredAt) row.commitment_declared_at = user.commitmentDeclaredAt;
  if (user.onboardingCompleted) row.onboarding_completed = true;
  if (user.communityBanned) row.community_banned = true;
  if (user.communityWarnings?.length > 0) row.community_warnings = user.communityWarnings;
  // Activation Phase fields
  if (user.marketResearchConfirmed) row.market_research_confirmed = true;
  if (user.marketResearchConfirmedAt) row.market_research_confirmed_at = user.marketResearchConfirmedAt;
  if (user.capitalConfirmation) row.capital_confirmation = user.capitalConfirmation;
  if (user.offerCommitment != null) row.offer_commitment = user.offerCommitment;
  if (user.offerCommitmentSetAt) row.offer_commitment_set_at = user.offerCommitmentSetAt;
  if (user.stakesDeclaration) row.stakes_declaration = user.stakesDeclaration;
  if (user.stakesDeclarationSetAt) row.stakes_declaration_set_at = user.stakesDeclarationSetAt;
  if (user.theirWhy) row.their_why = user.theirWhy;
  if (user.theirWhySetAt) row.their_why_set_at = user.theirWhySetAt;
  if (user.notificationPreferences) row.notification_preferences = user.notificationPreferences;
  if (user.activationCompleted) row.activation_completed = true;
  if (user.activationCompletedAt) row.activation_completed_at = user.activationCompletedAt;
  if (user.practiceDayCompleted) row.practice_day_completed = true;
  if (user.practiceDayCompletedAt) row.practice_day_completed_at = user.practiceDayCompletedAt;
  // Guarantee tracking
  if (user.cohortAttempt != null) row.cohort_attempt = user.cohortAttempt;
  if (user.refundEligible !== undefined) row.refund_eligible = user.refundEligible;
  if (user.firstCohortCompleted) row.first_cohort_completed = true;
  // Stripe payment tracking
  if (user.stripeCustomerId) row.stripe_customer_id = user.stripeCustomerId;
  if (user.stripeSubscriptionId) row.stripe_subscription_id = user.stripeSubscriptionId;
  // Pipeline Mode
  if (user.pipelineMode !== undefined) row.pipeline_mode = user.pipelineMode;
  if (user.pipelineModeStreak !== undefined) row.pipeline_mode_streak = user.pipelineModeStreak;
  if (user.pipelineModeActivatedAt) row.pipeline_mode_activated_at = user.pipelineModeActivatedAt;
  // Repeat Cohort / Graduate tracking
  if (user.trainingCompletedDays) row.training_completed_days = user.trainingCompletedDays;
  if (user.cohortHistory) row.cohort_history = user.cohortHistory;
  if (user.ucGraduateCount != null) row.uc_graduate_count = user.ucGraduateCount;
  if (user.propertiesUnderContract != null) row.properties_under_contract = user.propertiesUnderContract;
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
  if (updates.approved !== undefined) row.is_approved = updates.approved;
  if (updates.isAdmin !== undefined) row.is_admin = updates.isAdmin;
  if (updates.isDeveloper !== undefined) row.is_developer = updates.isDeveloper;
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
  if (updates.ucPoints !== undefined) row.uc_points = updates.ucPoints;
  if (updates.lifetimeOffersSubmitted !== undefined) row.lifetime_offers_submitted = updates.lifetimeOffersSubmitted;
  if (updates.getClear !== undefined) row.get_clear = updates.getClear;
  if (updates.buyBox !== undefined) row.buy_box = updates.buyBox;
  if (updates.commitmentDeclaredAt !== undefined) row.commitment_declared_at = updates.commitmentDeclaredAt;
  if (updates.onboardingCompleted !== undefined) row.onboarding_completed = updates.onboardingCompleted;
  if (updates.communityBanned !== undefined) row.community_banned = updates.communityBanned;
  if (updates.communityWarnings !== undefined) row.community_warnings = updates.communityWarnings;
  // Activation Phase fields
  if (updates.marketResearchConfirmed !== undefined) row.market_research_confirmed = updates.marketResearchConfirmed;
  if (updates.marketResearchConfirmedAt !== undefined) row.market_research_confirmed_at = updates.marketResearchConfirmedAt;
  if (updates.capitalConfirmation !== undefined) row.capital_confirmation = updates.capitalConfirmation;
  if (updates.offerCommitment !== undefined) row.offer_commitment = updates.offerCommitment;
  if (updates.offerCommitmentSetAt !== undefined) row.offer_commitment_set_at = updates.offerCommitmentSetAt;
  if (updates.stakesDeclaration !== undefined) row.stakes_declaration = updates.stakesDeclaration;
  if (updates.stakesDeclarationSetAt !== undefined) row.stakes_declaration_set_at = updates.stakesDeclarationSetAt;
  if (updates.theirWhy !== undefined) row.their_why = updates.theirWhy;
  if (updates.theirWhySetAt !== undefined) row.their_why_set_at = updates.theirWhySetAt;
  if (updates.notificationPreferences !== undefined) row.notification_preferences = updates.notificationPreferences;
  if (updates.activationCompleted !== undefined) row.activation_completed = updates.activationCompleted;
  if (updates.activationCompletedAt !== undefined) row.activation_completed_at = updates.activationCompletedAt;
  if (updates.practiceDayCompleted !== undefined) row.practice_day_completed = updates.practiceDayCompleted;
  if (updates.practiceDayCompletedAt !== undefined) row.practice_day_completed_at = updates.practiceDayCompletedAt;
  // Guarantee tracking
  if (updates.cohortAttempt !== undefined) row.cohort_attempt = updates.cohortAttempt;
  if (updates.refundEligible !== undefined) row.refund_eligible = updates.refundEligible;
  if (updates.firstCohortCompleted !== undefined) row.first_cohort_completed = updates.firstCohortCompleted;
  // Stripe payment tracking
  if (updates.stripeCustomerId !== undefined) row.stripe_customer_id = updates.stripeCustomerId;
  if (updates.stripeSubscriptionId !== undefined) row.stripe_subscription_id = updates.stripeSubscriptionId;
  // Pipeline Mode
  if (updates.pipelineMode !== undefined) row.pipeline_mode = updates.pipelineMode;
  if (updates.pipelineModeStreak !== undefined) row.pipeline_mode_streak = updates.pipelineModeStreak;
  if (updates.pipelineModeActivatedAt !== undefined) row.pipeline_mode_activated_at = updates.pipelineModeActivatedAt;
  // Repeat Cohort / Graduate tracking
  if (updates.trainingCompletedDays !== undefined) row.training_completed_days = updates.trainingCompletedDays;
  if (updates.cohortHistory !== undefined) row.cohort_history = updates.cohortHistory;
  if (updates.ucGraduateCount !== undefined) row.uc_graduate_count = updates.ucGraduateCount;
  if (updates.propertiesUnderContract !== undefined) row.properties_under_contract = updates.propertiesUnderContract;
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
    isDeveloper: row.is_developer || false,
    currentDay: row.current_day,
    isActive: row.is_active,
    approved: row.is_approved || false,
    hasPaid: row.has_paid || false,
    startDate: row.start_date,
    completedDays: row.completed_days || [],
    submissions: row.submissions || [],
    metrics: {
      trainingCompleted: 0, propertiesAnalyzed: 0, arsenalContacts: 0,
      targetContacts: 0, followUps: 0, offersSubmitted: 0,
      ...(row.metrics || {}),
    },
    lifetimeOffersSubmitted: row.lifetime_offers_submitted || 0,
    ucPoints: row.uc_points || 0,
    removedAt: row.removed_at,
    reactivatedAt: row.reactivated_at || null,
    accessExpiresAt: row.access_expires_at || null,
    profilePicture: row.profile_picture || null,
    socialHandles: row.social_handles || {},
    gettingStartedCompleted: row.getting_started_completed || false,
    getClear: row.get_clear || null,
    buyBox: row.buy_box || null,
    commitmentDeclaredAt: row.commitment_declared_at || null,
    onboardingCompleted: row.onboarding_completed || false,
    communityBanned: row.community_banned || false,
    communityWarnings: row.community_warnings || [],
    // Activation Phase fields
    marketResearchConfirmed: row.market_research_confirmed || false,
    marketResearchConfirmedAt: row.market_research_confirmed_at || null,
    capitalConfirmation: row.capital_confirmation || null,
    offerCommitment: row.offer_commitment || null,
    offerCommitmentSetAt: row.offer_commitment_set_at || null,
    stakesDeclaration: row.stakes_declaration || null,
    stakesDeclarationSetAt: row.stakes_declaration_set_at || null,
    theirWhy: row.their_why || null,
    theirWhySetAt: row.their_why_set_at || null,
    notificationPreferences: row.notification_preferences || null,
    activationCompleted: row.activation_completed || false,
    activationCompletedAt: row.activation_completed_at || null,
    practiceDayCompleted: row.practice_day_completed || false,
    practiceDayCompletedAt: row.practice_day_completed_at || null,
    // Guarantee tracking
    cohortAttempt: row.cohort_attempt || 1,
    refundEligible: row.refund_eligible !== false,
    firstCohortCompleted: row.first_cohort_completed || false,
    // Stripe payment tracking
    stripeCustomerId: row.stripe_customer_id || null,
    stripeSubscriptionId: row.stripe_subscription_id || null,
    // Pipeline Mode (post-failure continued access)
    pipelineMode: row.pipeline_mode || false,
    pipelineModeStreak: row.pipeline_mode_streak || 0,
    pipelineModeActivatedAt: row.pipeline_mode_activated_at || null,
    // Repeat Cohort / Graduate tracking
    trainingCompletedDays: row.training_completed_days || [],
    cohortHistory: row.cohort_history || [],
    ucGraduateCount: row.uc_graduate_count || 0,
    propertiesUnderContract: row.properties_under_contract || 0,
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
  getLandingVersion() {
    try { return localStorage.getItem('uc30_landing_version') || 'v1'; } catch { return 'v1'; }
  },
  setLandingVersion(version) {
    try { localStorage.setItem('uc30_landing_version', version); } catch {}
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
  getDailyMinimums() {
    try { return JSON.parse(localStorage.getItem('uc30_daily_minimums')) || {}; } catch { return {}; }
  },
  setDailyMinimums(minimums) {
    try { localStorage.setItem('uc30_daily_minimums', JSON.stringify(minimums)); } catch {}
  },
  getCommunityPosts() {
    try { return JSON.parse(localStorage.getItem('uc30_community_posts')) || []; } catch { return []; }
  },
  setCommunityPosts(posts) {
    try { localStorage.setItem('uc30_community_posts', JSON.stringify(posts)); } catch {}
  },
  getSkoolLink() {
    try { return JSON.parse(localStorage.getItem('uc30_skool_link')); } catch { return null; }
  },
  setSkoolLink(link) {
    try { localStorage.setItem('uc30_skool_link', JSON.stringify(link)); } catch {}
  },
  getPracticeDaySettings() {
    try { return JSON.parse(localStorage.getItem('uc30_practice_day_settings')) || {}; } catch { return {}; }
  },
  setPracticeDaySettings(settings) {
    try { localStorage.setItem('uc30_practice_day_settings', JSON.stringify(settings)); } catch {}
  },

  // ── CRM: Contacts (localStorage fallback) ─────────────────────
  addContact(contact) {
    try {
      const contacts = JSON.parse(localStorage.getItem('uc30_contacts') || '[]');
      contacts.push({ ...contact, created_at: new Date().toISOString() });
      localStorage.setItem('uc30_contacts', JSON.stringify(contacts));
      return contact;
    } catch { return null; }
  },
  getContacts(participantId) {
    try {
      const contacts = JSON.parse(localStorage.getItem('uc30_contacts') || '[]');
      return contacts
        .filter(c => c.participant_id === participantId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch { return []; }
  },
  getContactWithFollowUps(contactId) {
    try {
      const contacts = JSON.parse(localStorage.getItem('uc30_contacts') || '[]');
      const contact = contacts.find(c => c.id === contactId);
      if (!contact) return null;
      const followUps = JSON.parse(localStorage.getItem('uc30_follow_ups') || '[]');
      return { ...contact, followUps: followUps.filter(f => f.contact_id === contactId) };
    } catch { return null; }
  },
  getContactsForParticipant(participantId) {
    return this.getContacts(participantId);
  },
  updateContact(contactId, updates) {
    try {
      const contacts = JSON.parse(localStorage.getItem('uc30_contacts') || '[]');
      const idx = contacts.findIndex(c => c.id === contactId);
      if (idx === -1) return null;
      contacts[idx] = { ...contacts[idx], ...updates };
      localStorage.setItem('uc30_contacts', JSON.stringify(contacts));
      return contacts[idx];
    } catch { return null; }
  },

  // ── CRM: Follow-Ups (localStorage fallback) ───────────────────
  addFollowUp(followUp) {
    try {
      const followUps = JSON.parse(localStorage.getItem('uc30_follow_ups') || '[]');
      followUps.push({ ...followUp, created_at: new Date().toISOString() });
      localStorage.setItem('uc30_follow_ups', JSON.stringify(followUps));
      return followUp;
    } catch { return null; }
  },
  getFollowUps(participantId, dayNumber) {
    try {
      const followUps = JSON.parse(localStorage.getItem('uc30_follow_ups') || '[]');
      return followUps
        .filter(f => f.participant_id === participantId && (dayNumber === undefined || f.day_number === dayNumber))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch { return []; }
  },
  getFollowUpsByContact(contactId) {
    try {
      const followUps = JSON.parse(localStorage.getItem('uc30_follow_ups') || '[]');
      return followUps.filter(f => f.contact_id === contactId);
    } catch { return []; }
  },

  // ── File Uploads (localStorage fallback — stores base64) ───────
  uploadFile(participantId, dayNumber, indicator, file) {
    // In dev mode, store as base64 in localStorage (limited capacity)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const record = {
          id: `upload_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          participant_id: participantId,
          day_number: dayNumber,
          indicator,
          file_path: reader.result, // base64 data URL
          file_name: file.name,
          file_size: file.size,
          created_at: new Date().toISOString(),
        };
        try {
          const uploads = JSON.parse(localStorage.getItem('uc30_uploads') || '[]');
          uploads.push(record);
          localStorage.setItem('uc30_uploads', JSON.stringify(uploads));
        } catch {}
        resolve(record);
      };
      reader.readAsDataURL(file);
    });
  },
  getUploads(participantId, dayNumber) {
    try {
      const uploads = JSON.parse(localStorage.getItem('uc30_uploads') || '[]');
      return uploads.filter(u =>
        u.participant_id === participantId && (dayNumber === undefined || u.day_number === dayNumber)
      );
    } catch { return []; }
  },
  getUploadUrl(filePath) {
    // In localStorage mode, filePath IS the data URL
    return filePath;
  },

  // ── Daily Submissions (localStorage fallback) ──────────────────
  upsertDailySubmission(submission) {
    try {
      const subs = JSON.parse(localStorage.getItem('uc30_daily_submissions') || '[]');
      const idx = subs.findIndex(s => s.participant_id === submission.participant_id && s.challenge_day === submission.challenge_day);
      const record = { ...submission, id: submission.id || `ds_${Date.now()}`, updated_at: new Date().toISOString() };
      if (idx >= 0) { subs[idx] = { ...subs[idx], ...record }; } else { record.submitted_at = new Date().toISOString(); subs.push(record); }
      localStorage.setItem('uc30_daily_submissions', JSON.stringify(subs));
      return idx >= 0 ? subs[idx] : record;
    } catch { return null; }
  },
  getDailySubmission(participantId, challengeDay) {
    try {
      const subs = JSON.parse(localStorage.getItem('uc30_daily_submissions') || '[]');
      return subs.find(s => s.participant_id === participantId && s.challenge_day === challengeDay) || null;
    } catch { return null; }
  },
  getDailySubmissions(participantId) {
    try {
      const subs = JSON.parse(localStorage.getItem('uc30_daily_submissions') || '[]');
      return subs.filter(s => s.participant_id === participantId).sort((a, b) => a.challenge_day - b.challenge_day);
    } catch { return []; }
  },
  getAllDailySubmissions() {
    try { return JSON.parse(localStorage.getItem('uc30_daily_submissions') || '[]'); } catch { return []; }
  },

  // ── Quiz Attempts (localStorage fallback) ───────────────────────
  addQuizAttempt(attempt) {
    try {
      const attempts = JSON.parse(localStorage.getItem('uc30_quiz_attempts') || '[]');
      const record = {
        id: attempt.id,
        participant_id: attempt.participantId,
        day_number: attempt.dayNumber,
        scenario_id: attempt.scenarioId,
        attempt_number: attempt.attemptNumber,
        answers: attempt.answers,
        correct: attempt.correct,
        created_at: new Date().toISOString(),
      };
      attempts.push(record);
      localStorage.setItem('uc30_quiz_attempts', JSON.stringify(attempts));
      return record;
    } catch { return null; }
  },
  getQuizAttempts(participantId, dayNumber) {
    try {
      const attempts = JSON.parse(localStorage.getItem('uc30_quiz_attempts') || '[]');
      return attempts
        .filter(a => a.participant_id === participantId && a.day_number === dayNumber)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } catch { return []; }
  },
  getQuizAttemptsByScenario(participantId, dayNumber, scenarioId) {
    try {
      const attempts = JSON.parse(localStorage.getItem('uc30_quiz_attempts') || '[]');
      return attempts
        .filter(a => a.participant_id === participantId && a.day_number === dayNumber && a.scenario_id === scenarioId)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } catch { return []; }
  },

  addRemovalLog(entry) {
    try {
      const log = JSON.parse(localStorage.getItem('uc30_removal_log') || '[]');
      const record = { ...entry, id: `rl_${Date.now()}`, removed_at: new Date().toISOString() };
      log.push(record);
      localStorage.setItem('uc30_removal_log', JSON.stringify(log));
      return record;
    } catch { return null; }
  },
  getRemovalLog(participantId) {
    try {
      const log = JSON.parse(localStorage.getItem('uc30_removal_log') || '[]');
      if (participantId) return log.filter(e => e.participant_id === participantId);
      return log;
    } catch { return []; }
  },
  getComplianceSettings() {
    try {
      return {
        dailyMinimums: JSON.parse(localStorage.getItem('uc30_compliance_daily') || 'null'),
        weeklyMinimums: JSON.parse(localStorage.getItem('uc30_compliance_weekly') || 'null'),
        enforcement: JSON.parse(localStorage.getItem('uc30_compliance_enforcement') || 'null'),
      };
    } catch { return { dailyMinimums: null, weeklyMinimums: null, enforcement: null }; }
  },
  setComplianceDailyMinimums(minimums) {
    try { localStorage.setItem('uc30_compliance_daily', JSON.stringify(minimums)); } catch {}
  },
  setComplianceWeeklyMinimums(minimums) {
    try { localStorage.setItem('uc30_compliance_weekly', JSON.stringify(minimums)); } catch {}
  },
  setComplianceEnforcement(enforcement) {
    try { localStorage.setItem('uc30_compliance_enforcement', JSON.stringify(enforcement)); } catch {}
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
    isAdmin: email.toLowerCase() === 'admin@uc30.com' || email.toLowerCase() === 'dev@uc30.com',
    isDeveloper: email.toLowerCase() === 'dev@uc30.com' || email.toLowerCase() === 'justin.sobojinski@gmail.com',
    approved: email.toLowerCase() === 'admin@uc30.com' || email.toLowerCase() === 'dev@uc30.com' || email.toLowerCase() === 'justin.sobojinski@gmail.com',
    currentDay: 1,
    isActive: true,
    hasPaid: false,
    startDate: new Date().toISOString(),
    completedDays: [],
    submissions: [],
    metrics: {
      trainingCompleted: 0,
      propertiesAnalyzed: 0,
      arsenalContacts: 0,
      targetContacts: 0,
      followUps: 0,
      offersSubmitted: 0,
    },
    lifetimeOffersSubmitted: 0,
    ucPoints: 0,
    removedAt: null,
    accessExpiresAt: null,
    profilePicture: null,
    socialHandles: {},
    gettingStartedCompleted: false,
    getClear: null,
    buyBox: {
      markets: [],
      zipCodes: [],
      propertyTypes: [],
      yearBuiltMin: null,
      yearBuiltMax: null,
      bedroomsMin: null,
      bedroomsMax: null,
      bathroomsMin: null,
      bathroomsMax: null,
      priceMin: null,
      priceMax: null,
      downPayment: null,
      strategies: [],
      conditionTolerance: null,
      financingTypes: [],
      returnRequirements: {
        minCashOnCash: null,
        minCapRate: null,
        minCashFlowPerUnit: null,
        minIRR: null,
      },
      additionalNotes: '',
    },
    commitmentDeclaredAt: null,
    onboardingCompleted: false,
    communityBanned: false,
    communityWarnings: [],
    // Activation Phase
    marketResearchConfirmed: false,
    marketResearchConfirmedAt: null,
    capitalConfirmation: null,
    offerCommitment: null,
    offerCommitmentSetAt: null,
    stakesDeclaration: null,
    stakesDeclarationSetAt: null,
    theirWhy: null,
    theirWhySetAt: null,
    notificationPreferences: null,
    activationCompleted: false,
    activationCompletedAt: null,
    practiceDayCompleted: false,
    practiceDayCompletedAt: null,
    // Guarantee tracking
    cohortAttempt: 1,
    refundEligible: true,
    firstCohortCompleted: false,
    // Pipeline Mode (post-failure continued access)
    pipelineMode: false,
    pipelineModeStreak: 0,
    pipelineModeActivatedAt: null,
    // Repeat Cohort / Graduate tracking
    trainingCompletedDays: [],
    cohortHistory: [],
    ucGraduateCount: 0,
    propertiesUnderContract: 0,
  };
}
