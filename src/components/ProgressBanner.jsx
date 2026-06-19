import { CHALLENGE_DAYS, POST_30_TASK, getStreak } from '../data/challengeDays';

export default function ProgressBanner({ user, cohortStartDate, calendarDay }) {
  const completedCount = user.completedDays.length;
  const challengeComplete = user.completedDays.includes(30);
  const inContinuation = challengeComplete && user.currentDay > 30;
  const streak = getStreak(user.completedDays);

  // During 30-day challenge
  const progress = Math.min((completedCount / 30) * 100, 100);
  const currentDayData = inContinuation
    ? POST_30_TASK
    : CHALLENGE_DAYS[Math.min(user.currentDay - 1, 29)];

  // In cohort mode, show which cohort day we're on
  const cohortDayLabel = cohortStartDate && calendarDay !== null && calendarDay >= 1 && !inContinuation
    ? `Cohort Day ${Math.min(calendarDay, 30)}`
    : null;

  return (
    <div className="fade-up" style={{ marginBottom: 32 }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        marginBottom: 16, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          {inContinuation ? (
            <>
              <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 700, marginBottom: 4 }}>
                Operator Mode — Day {user.currentDay}
              </h1>
              <p style={{ color: '#f0a500', fontSize: 15 }}>
                Keep the streak alive! Execute daily.
              </p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 700, marginBottom: 4 }}>
                Day {user.currentDay} of 30
              </h1>
              <p style={{ color: '#888', fontSize: 15 }}>
                {currentDayData?.title}
              </p>
              {cohortDayLabel && (
                <p style={{ color: '#555', fontSize: 13, marginTop: 4 }}>
                  {cohortDayLabel} of 30
                </p>
              )}
            </>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          {inContinuation ? (
            <>
              <div className="mono" style={{ fontSize: 36, fontWeight: 700, color: '#f0a500' }}>
                {streak}
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>Day Streak</div>
            </>
          ) : (
            <>
              <div className="mono" style={{ fontSize: 36, fontWeight: 700, color: '#e94560' }}>
                {completedCount}<span style={{ fontSize: 18, color: '#555' }}>/30</span>
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>Days Completed</div>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 6, background: 'rgba(255,255,255,0.06)',
        borderRadius: 3, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: inContinuation ? '100%' : `${progress}%`,
          background: inContinuation
            ? 'linear-gradient(90deg, #f0a500, #e94560)'
            : 'linear-gradient(90deg, #e94560, #c81d4e)',
          borderRadius: 3, transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  );
}
