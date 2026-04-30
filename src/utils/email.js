// Transactional email utility — sends emails via the send-email Edge Function (Resend)
//
// Used alongside Kit (ConvertKit) which handles marketing sequences.
// This handles real-time transactional emails: day completion, removal, reactivation, etc.

const SUPABASE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_FUNCTION_URL || '';

const DASHBOARD_URL = typeof window !== 'undefined' ? window.location.origin : 'https://uc30-challenge.vercel.app';

/**
 * Send a transactional email via the send-email Edge Function.
 * Fire-and-forget — errors are logged, never thrown.
 */
export async function sendTransactionalEmail(template, to, data = {}) {
  if (!SUPABASE_FUNCTION_URL) {
    console.warn('VITE_SUPABASE_FUNCTION_URL not set — skipping transactional email');
    return;
  }

  try {
    const res = await fetch(`${SUPABASE_FUNCTION_URL}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        template,
        data: { dashboardUrl: DASHBOARD_URL, ...data },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`Transactional email error (${template}):`, err.error || res.status);
    }
  } catch (err) {
    console.error(`Failed to send transactional email (${template}):`, err);
  }
}

// ── Convenience wrappers ─────────────────────────────

export function emailWelcome(email, firstName) {
  return sendTransactionalEmail('welcome', email, { firstName, email });
}

export function emailDayCompleted(email, firstName, dayNum) {
  return sendTransactionalEmail('day-completed', email, { firstName, email, dayNum });
}

export function emailChallengeCompleted(email, firstName) {
  return sendTransactionalEmail('challenge-completed', email, { firstName, email });
}

export function emailRemovedFromCohort(email, firstName) {
  return sendTransactionalEmail('removed-from-cohort', email, { firstName, email });
}

export function emailReactivated(email, firstName, currentDay, cohortAttempt) {
  return sendTransactionalEmail('reactivated', email, { firstName, email, currentDay, cohortAttempt });
}
