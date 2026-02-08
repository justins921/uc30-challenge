import { CHALLENGE_DAYS } from '../data/challengeDays';

export default function ShareableStreakCard({ user, calendarDay }) {
  const streak = user.completedDays.length;
  const isCompleted = user.currentDay > 30;
  const progress = Math.round((streak / 30) * 100);
  const todayTitle = !isCompleted
    ? CHALLENGE_DAYS[Math.min(user.currentDay - 1, 29)]?.title
    : 'Challenge Complete!';

  // Dynamic streak label
  const streakFire = streak >= 20 ? '🔥🔥🔥' : streak >= 10 ? '🔥🔥' : streak >= 1 ? '🔥' : '';

  return (
    <div className="fade-up-delay-1" style={{ marginBottom: 24 }}>
      {/* The shareable card itself */}
      <div style={{
        background: 'linear-gradient(160deg, #12121a 0%, #0f0f18 40%, #1a0f1f 100%)',
        border: '1px solid rgba(233, 69, 96, 0.15)',
        borderRadius: 20,
        padding: '28px 24px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative glow */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 160, height: 160,
          background: 'radial-gradient(circle, rgba(233,69,96,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: -40,
          width: 120, height: 120,
          background: 'radial-gradient(circle, rgba(83,52,131,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Header: UC30 branding + day */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: 20, position: 'relative',
        }}>
          <div>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#e94560',
              textTransform: 'uppercase', marginBottom: 4,
            }}>
              UC30 Challenge
            </div>
            <div style={{ fontSize: 13, color: '#666' }}>
              {user.firstName}'s Progress
            </div>
          </div>
          <div style={{
            background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.2)',
            borderRadius: 10, padding: '6px 12px', fontSize: 12, fontWeight: 600,
            color: '#e94560',
          }}>
            {isCompleted ? 'Complete!' : `Day ${streak} of 30`}
          </div>
        </div>

        {/* Big Streak Number */}
        <div style={{ textAlign: 'center', marginBottom: 20, position: 'relative' }}>
          <div style={{ fontSize: 16, marginBottom: 4 }}>
            {streakFire}
          </div>
          <div className="mono" style={{
            fontSize: 72, fontWeight: 700, lineHeight: 1,
            background: 'linear-gradient(135deg, #e94560, #ff6b81)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {streak}
          </div>
          <div style={{
            fontSize: 14, fontWeight: 600, color: '#888', marginTop: 4,
            letterSpacing: 0.5,
          }}>
            {streak === 1 ? 'Day Streak' : 'Day Streak'}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 20, position: 'relative' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 6,
          }}>
            <div style={{ fontSize: 12, color: '#555' }}>{todayTitle}</div>
            <div className="mono" style={{ fontSize: 12, color: '#e94560', fontWeight: 600 }}>
              {progress}%
            </div>
          </div>
          <div style={{
            height: 6, background: 'rgba(255,255,255,0.06)',
            borderRadius: 3, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'linear-gradient(90deg, #e94560, #ff6b81)',
              borderRadius: 3, transition: 'width 0.8s ease',
            }} />
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
          marginBottom: 16, position: 'relative',
        }}>
          <StatBox
            value={user.metrics.propertiesAnalyzed}
            label="Properties Analyzed"
            color="#533483"
          />
          <StatBox
            value={user.metrics.offersSubmitted}
            label="Offers Submitted"
            color="#e94560"
          />
          <StatBox
            value={user.metrics.agentsContacted}
            label="Agents Contacted"
            color="#0f3460"
          />
        </div>

        {/* 30-day mini grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 3,
          marginBottom: 16, position: 'relative',
        }}>
          {Array.from({ length: 30 }, (_, i) => {
            const dayNum = i + 1;
            const done = user.completedDays.includes(dayNum);
            const isCurrent = dayNum === user.currentDay;
            return (
              <div
                key={i}
                style={{
                  aspectRatio: '1', borderRadius: 3,
                  background: done ? '#48c78e' : isCurrent ? 'rgba(233,69,96,0.5)' : 'rgba(255,255,255,0.04)',
                  border: isCurrent ? '1px solid #e94560' : 'none',
                }}
              />
            );
          })}
        </div>

        {/* Footer branding */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12,
          position: 'relative',
        }}>
          <div style={{ fontSize: 11, color: '#444', letterSpacing: 0.5 }}>
            30-Day First Deal Challenge
          </div>
          <div style={{
            fontSize: 10, color: '#333', fontFamily: "'Space Mono', monospace",
          }}>
            #UC30Challenge
          </div>
        </div>
      </div>

      {/* Share prompt (below the card, not part of screenshot) */}
      <div style={{
        textAlign: 'center', marginTop: 10, padding: '0 8px',
      }}>
        <div style={{ fontSize: 13, color: '#555' }}>
          Screenshot & share your progress on Instagram
        </div>
      </div>
    </div>
  );
}

function StatBox({ value, label, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 12, padding: '12px 8px', textAlign: 'center',
    }}>
      <div className="mono" style={{
        fontSize: 24, fontWeight: 700, color, lineHeight: 1, marginBottom: 4,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: '#555', lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}
