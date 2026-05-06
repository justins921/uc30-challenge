// Compliance checking engine for the UC30 daily/weekly enforcement system
//
// This module is pure logic — no side effects, no storage calls.
// Used by both the submission flow and the login-time enforcement check.

// ── Metric definitions ───────────────────────────────────────────

export const COMPLIANCE_METRICS = [
  { id: 'training_completed', label: 'Training Completed', type: 'boolean', icon: '📚' },
  { id: 'properties_analyzed', label: 'Properties Analyzed', type: 'count', icon: '🔍' },
  { id: 'arsenal_contacts', label: 'Arsenal Contacts', type: 'count', icon: '🤝' },
  { id: 'target_contacts', label: 'Target Contacts', type: 'count', icon: '🎯' },
  { id: 'follow_ups', label: 'Follow-Ups', type: 'count', icon: '📞' },
  { id: 'offers_submitted', label: 'Offers Submitted', type: 'count', icon: '📝' },
];

export const METRIC_IDS = COMPLIANCE_METRICS.map(m => m.id);

// ── Default settings (used when DB settings are missing) ────────

export const DEFAULT_DAILY_MINIMUMS = {
  training_completed: true,
  properties_analyzed: 1,
  arsenal_contacts: 1,
  target_contacts: 1,
  follow_ups: 1,
  offers_submitted: 0,
};

export const DEFAULT_WEEKLY_MINIMUMS = {
  training_completed: 7,
  properties_analyzed: 5,
  arsenal_contacts: 3,
  target_contacts: 5,
  follow_ups: 5,
  offers_submitted: 1,
};

export const DEFAULT_ENFORCEMENT = {
  timezone: 'America/Los_Angeles',
  daily_deadline_hour: 23,
  weekly_deadline_day: 0, // Sunday
  enabled: true,
};

// ── Daily compliance check ──────────────────────────────────────

/**
 * Check if a submission meets all daily minimums.
 * Returns { met: boolean, failures: [{ metric, required, actual }] }
 */
export function checkDailyCompliance(submission, dailyMinimums) {
  const mins = { ...DEFAULT_DAILY_MINIMUMS, ...dailyMinimums };
  const failures = [];

  for (const metric of COMPLIANCE_METRICS) {
    const key = metric.id;
    const required = mins[key];
    const actual = submission[key];

    if (metric.type === 'boolean') {
      if (required && !actual) {
        failures.push({ metric: key, label: metric.label, required: 'Yes', actual: 'No' });
      }
    } else {
      if (typeof required === 'number' && required > 0 && (actual || 0) < required) {
        failures.push({ metric: key, label: metric.label, required, actual: actual || 0 });
      }
    }
  }

  return { met: failures.length === 0, failures };
}

// ── Weekly compliance check ─────────────────────────────────────

/**
 * Check if a participant's weekly totals meet weekly minimums.
 * submissions: array of submission objects for the week
 * Returns { met: boolean, totals: {}, failures: [{ metric, required, actual }] }
 */
export function checkWeeklyCompliance(submissions, weeklyMinimums) {
  const mins = { ...DEFAULT_WEEKLY_MINIMUMS, ...weeklyMinimums };
  const totals = {};
  const failures = [];

  for (const metric of COMPLIANCE_METRICS) {
    const key = metric.id;
    if (metric.type === 'boolean') {
      totals[key] = submissions.filter(s => s[key]).length;
    } else {
      totals[key] = submissions.reduce((sum, s) => sum + (s[key] || 0), 0);
    }
  }

  for (const metric of COMPLIANCE_METRICS) {
    const key = metric.id;
    const required = mins[key];
    const actual = totals[key];

    if (typeof required === 'number' && required > 0 && actual < required) {
      failures.push({ metric: key, label: metric.label, required, actual });
    }
  }

  return { met: failures.length === 0, totals, failures };
}

// ── Week boundaries ─────────────────────────────────────────────
// Weeks are defined as every 7 challenge days: 1-7, 8-14, 15-21, 22-28, 29-30

/**
 * Get the week number (1-indexed) for a challenge day.
 */
export function getWeekNumber(challengeDay) {
  return Math.ceil(challengeDay / 7);
}

/**
 * Get the range of challenge days for a given week number.
 * Returns { start, end } (inclusive).
 */
export function getWeekRange(weekNumber) {
  const start = (weekNumber - 1) * 7 + 1;
  const end = Math.min(weekNumber * 7, 30);
  return { start, end };
}

/**
 * Get the total number of days in a week (handles the partial last week: days 29-30).
 */
export function getWeekDayCount(weekNumber) {
  const { start, end } = getWeekRange(weekNumber);
  return end - start + 1;
}

// ── At-risk calculation ─────────────────────────────────────────

/**
 * Calculate whether a participant is "at risk" of failing weekly minimums.
 * currentDayInWeek: which day of the week they're on (1-7)
 * weekSubmissions: submissions so far this week
 * weeklyMinimums: the weekly minimum settings
 *
 * Returns { atRisk: boolean, risks: [{ metric, needed, remainingDays, neededPerDay }] }
 */
export function calculateAtRisk(currentDayInWeek, totalDaysInWeek, weekSubmissions, weeklyMinimums) {
  const mins = { ...DEFAULT_WEEKLY_MINIMUMS, ...weeklyMinimums };
  const { totals } = checkWeeklyCompliance(weekSubmissions, mins);
  const remainingDays = totalDaysInWeek - currentDayInWeek;
  const risks = [];

  if (remainingDays <= 0) return { atRisk: false, risks };

  for (const metric of COMPLIANCE_METRICS) {
    const key = metric.id;
    const required = mins[key];
    const current = totals[key] || 0;
    const remaining = required - current;

    if (remaining > 0) {
      const neededPerDay = remaining / remainingDays;
      const dailyMin = DEFAULT_DAILY_MINIMUMS[key];
      const effectiveDaily = typeof dailyMin === 'boolean' ? 1 : (dailyMin || 0);

      if (neededPerDay > effectiveDaily) {
        risks.push({
          metric: key,
          label: metric.label,
          needed: remaining,
          remainingDays,
          neededPerDay: Math.ceil(neededPerDay),
        });
      }
    }
  }

  return { atRisk: risks.length > 0, risks };
}

// ── Deadline utilities ──────────────────────────────────────────

/**
 * Get the current time in the enforcement timezone.
 */
export function getNowInTimezone(timezone) {
  const tz = timezone || DEFAULT_ENFORCEMENT.timezone;
  const str = new Date().toLocaleString('en-US', { timeZone: tz });
  return new Date(str);
}

/**
 * Get today's deadline as a Date in the enforcement timezone.
 * deadlineHour: 0-23 (23 = 11 PM, 0 = midnight)
 */
export function getTodayDeadline(enforcement) {
  const cfg = { ...DEFAULT_ENFORCEMENT, ...enforcement };
  const now = getNowInTimezone(cfg.timezone);
  const deadline = new Date(now);
  deadline.setHours(cfg.daily_deadline_hour, 59, 59, 999);
  return deadline;
}

/**
 * Get milliseconds until the daily deadline.
 */
export function getTimeUntilDeadline(enforcement) {
  const cfg = { ...DEFAULT_ENFORCEMENT, ...enforcement };
  const now = getNowInTimezone(cfg.timezone);
  const deadline = getTodayDeadline(cfg);
  return Math.max(0, deadline.getTime() - now.getTime());
}

/**
 * Check if the deadline for a given challenge day has passed.
 * cohortStartDate: YYYY-MM-DD string
 * challengeDay: 1-30
 */
export function hasDeadlinePassed(cohortStartDate, challengeDay, enforcement) {
  if (!cohortStartDate) return false;
  const cfg = { ...DEFAULT_ENFORCEMENT, ...enforcement };
  const now = getNowInTimezone(cfg.timezone);
  const start = new Date(cohortStartDate + 'T00:00:00');
  const dayDate = new Date(start);
  dayDate.setDate(dayDate.getDate() + challengeDay - 1);
  dayDate.setHours(cfg.daily_deadline_hour, 59, 59, 999);
  return now > dayDate;
}

/**
 * Check if the weekly deadline has passed for a given week.
 * Returns true if we're past the end of the last day in the week.
 */
export function hasWeeklyDeadlinePassed(cohortStartDate, weekNumber, enforcement) {
  const { end } = getWeekRange(weekNumber);
  return hasDeadlinePassed(cohortStartDate, end, enforcement);
}

// ── Login-time enforcement check ────────────────────────────────

/**
 * Run the full enforcement check on login.
 * Returns null if participant is compliant, or a removal reason object.
 *
 * Check order (per spec):
 * 1. Already removed? → handled by caller
 * 2. Missed yesterday's deadline with no submission? → remove
 * 3. Submitted yesterday but failed daily minimum? → remove
 * 4. Weekly deadline passed and missed weekly minimums? → remove
 * 5. Otherwise → compliant
 */
export function checkEnforcement({
  participant,
  cohortStartDate,
  dailySubmissions, // all submissions for this participant from daily_submissions table
  dailyMinimums,
  weeklyMinimums,
  enforcement,
}) {
  if (!cohortStartDate || !enforcement?.enabled) return null;

  const cfg = { ...DEFAULT_ENFORCEMENT, ...enforcement };
  const now = getNowInTimezone(cfg.timezone);
  const start = new Date(cohortStartDate + 'T00:00:00');
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const calendarDay = Math.floor((nowDay - startDay) / (1000 * 60 * 60 * 24)) + 1;

  if (calendarDay < 1) return null; // cohort hasn't started

  const submissionsByDay = {};
  for (const s of dailySubmissions) {
    submissionsByDay[s.challenge_day] = s;
  }

  // Check each past day that should have a submission
  const maxCheckDay = Math.min(calendarDay - 1, 30); // don't check today, only past days
  for (let d = 1; d <= maxCheckDay; d++) {
    if (!hasDeadlinePassed(cohortStartDate, d, cfg)) continue;

    const sub = submissionsByDay[d];

    // Check 2: Missed deadline with no submission
    if (!sub) {
      return {
        reason: 'missed_deadline',
        details: `No submission for Day ${d} by the deadline.`,
        challenge_day: d,
        week_number: getWeekNumber(d),
      };
    }

    // Check 3: Submitted but failed daily minimum
    if (sub.met_daily_minimum === false) {
      return {
        reason: 'failed_daily_minimum',
        details: `Day ${d} submission did not meet the daily minimums.`,
        challenge_day: d,
        week_number: getWeekNumber(d),
      };
    }
  }

  // Check 4: Weekly compliance for completed weeks
  const currentWeek = getWeekNumber(Math.min(calendarDay, 30));
  for (let w = 1; w < currentWeek; w++) {
    if (!hasWeeklyDeadlinePassed(cohortStartDate, w, cfg)) continue;

    const { start: wStart, end: wEnd } = getWeekRange(w);
    const weekSubs = [];
    for (let d = wStart; d <= wEnd; d++) {
      if (submissionsByDay[d]) weekSubs.push(submissionsByDay[d]);
    }

    const weekResult = checkWeeklyCompliance(weekSubs, weeklyMinimums);
    if (!weekResult.met) {
      const failedMetrics = weekResult.failures.map(f => f.label).join(', ');
      return {
        reason: 'failed_weekly_minimum',
        details: `Week ${w} (Days ${wStart}-${wEnd}) did not meet weekly minimums for: ${failedMetrics}.`,
        challenge_day: wEnd,
        week_number: w,
      };
    }
  }

  return null; // compliant
}
