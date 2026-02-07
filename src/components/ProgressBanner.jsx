import { CHALLENGE_DAYS } from '../data/challengeDays';

export default function ProgressBanner({ user, cohortStartDate, calendarDay }) {
  const completedCount = user.completedDays.length;
  const progress = (completedCount / 30) * 100;
  const isCompleted = user.currentDay > 30;
  const currentDayData = CHALLENGE_DAYS[Math.min(user.currentDay - 1, 29)];

  // In cohort mode, show which cohort day we're on
  const cohortDayLabel = cohortStartDate && calendarDay !== null && calendarDay >= 1 && calendarDay <= 30
    ? `Cohort Day ${calendarDay}`
    : null;

  return (
    <div className="fade-up" style={{ marginBottom: 32 }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        marginBottom: 16, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 700, marginBottom: 4 }}>
            {isCompleted ? '🎉 Challenge Complete!' : `Day ${user.currentDay} of 30`}
          </h1>
          <p style={{ color: '#888', fontSize: 15 }}>
            {isCompleted ? 'Congratulations on completing the 30-Day Challenge!' : currentDayData?.title}
          </p>
          {cohortDayLabel && !isCompleted && (
            <p style={{ color: '#555', fontSize: 13, marginTop: 4 }}>
              {cohortDayLabel} of 30
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: 36, fontWeight: 700, color: '#e94560' }}>
            {completedCount}<span style={{ fontSize: 18, color: '#555' }}>/30</span>
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Days Completed</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 6, background: 'rgba(255,255,255,0.06)',
        borderRadius: 3, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'linear-gradient(90deg, #e94560, #c81d4e)',
          borderRadius: 3, transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  );
}
