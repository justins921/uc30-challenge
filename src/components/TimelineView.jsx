import { CHALLENGE_DAYS, PHASES } from '../data/challengeDays';

export default function TimelineView({ user, onSelectDay }) {
  return (
    <div className="fade-up-delay-2">
      {PHASES.map((phase) => (
        <div key={phase.label} style={{ marginBottom: 36 }}>
          {/* Phase header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: phase.color }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>{phase.label}</h3>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Day cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 10,
          }}>
            {phase.days.map(d => {
              const dayData = CHALLENGE_DAYS[d - 1];
              const isComplete = user.completedDays.includes(d);
              const isCurrent = d === user.currentDay;
              const isLocked = d > user.currentDay;

              return (
                <div
                  key={d}
                  onClick={() => !isLocked && onSelectDay(d)}
                  className="card"
                  style={{
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    opacity: isLocked ? 0.4 : 1,
                    borderColor: isCurrent
                      ? '#e94560'
                      : isComplete
                      ? 'rgba(72,199,142,0.3)'
                      : 'rgba(255,255,255,0.06)',
                    position: 'relative',
                    padding: '16px 16px 14px',
                  }}
                >
                  {/* Completed badge */}
                  {isComplete && (
                    <div style={{
                      position: 'absolute', top: 12, right: 12, width: 22, height: 22,
                      borderRadius: '50%', background: '#48c78e',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: 'white',
                    }}>✓</div>
                  )}

                  {/* Current indicator */}
                  {isCurrent && (
                    <div style={{
                      position: 'absolute', top: 12, right: 12, width: 10, height: 10,
                      borderRadius: '50%', background: '#e94560', animation: 'pulse 2s infinite',
                    }} />
                  )}

                  <div className="mono" style={{
                    fontSize: 11, color: phase.color, fontWeight: 700,
                    letterSpacing: 1, marginBottom: 6,
                  }}>
                    DAY {d}
                  </div>
                  <div style={{
                    fontSize: 13, fontWeight: 500, lineHeight: 1.4,
                    color: isComplete ? '#48c78e' : '#ccc',
                  }}>
                    {dayData.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
