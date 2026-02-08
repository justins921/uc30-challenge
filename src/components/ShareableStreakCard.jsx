import { CHALLENGE_DAYS, POST_30_TASK, getStreak } from '../data/challengeDays';

export default function ShareableStreakCard({ user, calendarDay }) {
  const totalCompleted = user.completedDays.length;
  const streak = getStreak(user.completedDays);
  const challengeComplete = user.completedDays.includes(30);
  const inContinuation = challengeComplete && user.currentDay > 30;
  const challengeProgress = Math.min(Math.round((Math.min(totalCompleted, 30) / 30) * 100), 100);

  const todayTitle = inContinuation
    ? POST_30_TASK.title
    : CHALLENGE_DAYS[Math.min(user.currentDay - 1, 29)]?.title;

  // Dynamic streak label
  const streakFire = streak >= 20 ? '🔥🔥🔥' : streak >= 10 ? '🔥🔥' : streak >= 1 ? '🔥' : '';

  // Colors shift to gold in continuation mode
  const accentColor = inContinuation ? '#f0a500' : '#e94560';
  const accentGradient = inContinuation
    ? 'linear-gradient(135deg, #f0a500, #ffcc00)'
    : 'linear-gradient(135deg, #e94560, #ff6b81)';

  return (
    <div className="fade-up-delay-1" style={{ marginBottom: 24 }}>
      {/* The shareable card itself */}
      <div style={{
        background: inContinuation
          ? 'linear-gradient(160deg, #12121a 0%, #0f0f18 40%, #1a150f 100%)'
          : 'linear-gradient(160deg, #12121a 0%, #0f0f18 40%, #1a0f1f 100%)',
        border: `1px solid ${inContinuation ? 'rgba(240,165,0,0.15)' : 'rgba(233,69,96,0.15)'}`,
        borderRadius: 20,
        padding: '28px 24px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative glow */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 160, height: 160,
          background: inContinuation
            ? 'radial-gradient(circle, rgba(240,165,0,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(233,69,96,0.12) 0%, transparent 70%)',
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
              fontSize: 11, fontWeight: 700, letterSpacing: 2, color: accentColor,
              textTransform: 'uppercase', marginBottom: 4,
            }}>
              UC30 Challenge
            </div>
            <div style={{ fontSize: 13, color: '#666' }}>
              {user.firstName}'s Progress
            </div>
          </div>
          <div style={{
            background: `${accentColor}18`, border: `1px solid ${accentColor}33`,
            borderRadius: 10, padding: '6px 12px', fontSize: 12, fontWeight: 600,
            color: accentColor,
          }}>
            {inContinuation
              ? `Day ${totalCompleted}`
              : challengeComplete ? 'Complete!' : `Day ${totalCompleted} of 30`}
          </div>
        </div>

        {/* Big Streak Number */}
        <div style={{ textAlign: 'center', marginBottom: 20, position: 'relative' }}>
          <div style={{ fontSize: 16, marginBottom: 4 }}>
            {streakFire}
          </div>
          <div className="mono" style={{
            fontSize: 72, fontWeight: 700, lineHeight: 1,
            background: accentGradient,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {streak}
          </div>
          <div style={{
            fontSize: 14, fontWeight: 600, color: '#888', marginTop: 4,
            letterSpacing: 0.5,
          }}>
            Day Streak
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 20, position: 'relative' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 6,
          }}>
            <div style={{ fontSize: 12, color: '#555' }}>{todayTitle}</div>
            {inContinuation ? (
              <div className="mono" style={{ fontSize: 12, color: '#f0a500', fontWeight: 600 }}>
                +{totalCompleted - 30} beyond
              </div>
            ) : (
              <div className="mono" style={{ fontSize: 12, color: '#e94560', fontWeight: 600 }}>
                {challengeProgress}%
              </div>
            )}
          </div>
          <div style={{
            height: 6, background: 'rgba(255,255,255,0.06)',
            borderRadius: 3, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: inContinuation ? '100%' : `${challengeProgress}%`,
              background: inContinuation
                ? 'linear-gradient(90deg, #f0a500, #e94560)'
                : 'linear-gradient(90deg, #e94560, #ff6b81)',
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
            color={accentColor}
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

        {/* Continuation streak indicator (only shown post-30) */}
        {inContinuation && totalCompleted > 30 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16,
            position: 'relative',
          }}>
            <div style={{ fontSize: 10, color: '#555', whiteSpace: 'nowrap' }}>Beyond:</div>
            <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {Array.from({ length: Math.min(totalCompleted - 30, 30) }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width: 8, height: 8, borderRadius: 2,
                    background: '#f0a500',
                  }}
                />
              ))}
              {totalCompleted - 30 > 30 && (
                <div style={{ fontSize: 10, color: '#f0a500', marginLeft: 4 }}>
                  +{totalCompleted - 60}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer branding */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12,
          position: 'relative',
        }}>
          <div style={{ fontSize: 11, color: '#444', letterSpacing: 0.5 }}>
            {inContinuation ? 'UC30 — Still Going!' : '30-Day First Deal Challenge'}
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
