import { getPhases, getDayContent, getGettingStartedContent, POST_30_TASK, getStreak } from '../data/challengeDays';

export default function TimelineView({ user, onSelectDay, calendarDay, contentOverrides, customPhases, cohortStartDate }) {
  const phases = getPhases(customPhases);
  const challengeComplete = user.completedDays.includes(30);
  const inContinuation = challengeComplete && user.currentDay > 30;
  const gsContent = getGettingStartedContent(contentOverrides);

  // Days 1+ are locked if cohort hasn't started yet (or no date set)
  const cohortActive = cohortStartDate && calendarDay !== null && calendarDay >= 1;

  return (
    <div className="fade-up-delay-2">
      {/* Getting Started Phase */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#e94560' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>Getting Started</h3>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 10,
        }}>
          <div
            onClick={() => !user.gettingStartedCompleted && onSelectDay('getting_started')}
            className="card"
            style={{
              cursor: user.gettingStartedCompleted ? 'default' : 'pointer',
              opacity: 1,
              borderColor: user.gettingStartedCompleted
                ? 'rgba(72,199,142,0.3)'
                : '#e94560',
              position: 'relative',
              padding: '16px 16px 14px',
              overflow: 'hidden',
            }}
          >
            {user.gettingStartedCompleted && (
              <div style={{
                position: 'absolute', top: 12, right: 12, width: 22, height: 22,
                borderRadius: '50%', background: '#48c78e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: 'white',
              }}>✓</div>
            )}
            {!user.gettingStartedCompleted && (
              <div style={{
                position: 'absolute', top: 12, right: 12, width: 10, height: 10,
                borderRadius: '50%', background: '#e94560', animation: 'pulse 2s infinite',
              }} />
            )}
            <div className="mono" style={{
              fontSize: 11, color: '#e94560', fontWeight: 700,
              letterSpacing: 1, marginBottom: 6,
            }}>
              INTRO
            </div>
            <div style={{
              fontSize: 13, fontWeight: 500, lineHeight: 1.4,
              color: user.gettingStartedCompleted ? '#48c78e' : '#ccc',
            }}>
              {gsContent.title}
            </div>
          </div>
        </div>
      </div>

      {phases.map((phase) => (
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
              const dayData = getDayContent(d, contentOverrides);
              const isComplete = user.completedDays.includes(d);
              const isCurrent = d === user.currentDay;

              // Lock all days if cohort hasn't started or Getting Started not done
              let isLocked;
              if (!cohortActive || !user.gettingStartedCompleted) {
                isLocked = true;
              } else if (calendarDay !== null) {
                const isAccessible = isComplete || (isCurrent && d <= calendarDay);
                isLocked = !isAccessible;
              } else {
                isLocked = d > user.currentDay;
              }

              return (
                <div
                  key={d}
                  onClick={() => !isLocked && onSelectDay(d)}
                  className="card"
                  style={{
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    opacity: isLocked ? 0.7 : 1,
                    borderColor: isCurrent && !isLocked
                      ? '#e94560'
                      : isComplete
                      ? 'rgba(72,199,142,0.3)'
                      : 'rgba(255,255,255,0.06)',
                    position: 'relative',
                    padding: '16px 16px 14px',
                    overflow: 'hidden',
                  }}
                >
                  {isComplete && (
                    <div style={{
                      position: 'absolute', top: 12, right: 12, width: 22, height: 22,
                      borderRadius: '50%', background: '#48c78e',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: 'white',
                    }}>✓</div>
                  )}

                  {isCurrent && !isLocked && (
                    <div style={{
                      position: 'absolute', top: 12, right: 12, width: 10, height: 10,
                      borderRadius: '50%', background: '#e94560', animation: 'pulse 2s infinite',
                    }} />
                  )}

                  {isLocked && !isComplete && (
                    <div style={{
                      position: 'absolute', top: 12, right: 12,
                      fontSize: 12, color: '#555',
                    }}>🔒</div>
                  )}

                  <div className="mono" style={{
                    fontSize: 11, color: isLocked ? '#333' : phase.color, fontWeight: 700,
                    letterSpacing: 1, marginBottom: 6,
                  }}>
                    DAY {d}
                  </div>
                  <div style={{
                    fontSize: 13, fontWeight: 500, lineHeight: 1.4,
                    color: isComplete ? '#48c78e' : isLocked ? 'transparent' : '#ccc',
                    background: isLocked ? 'linear-gradient(90deg, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%)' : 'none',
                    backgroundSize: isLocked ? '200% 100%' : 'auto',
                    borderRadius: isLocked ? 4 : 0,
                    userSelect: isLocked ? 'none' : 'auto',
                    WebkitBackgroundClip: isLocked ? 'text' : 'unset',
                    backgroundClip: isLocked ? 'text' : 'unset',
                  }}>
                    {isLocked ? '██████████████' : dayData.title}
                  </div>
                  {!isLocked && dayData.caption && (
                    <div style={{ fontSize: 11, color: '#666', lineHeight: 1.3, marginTop: 4 }}>
                      {dayData.caption}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Post-30 Continuation Section */}
      {inContinuation && (
        <ContinuationSection
          user={user}
          calendarDay={calendarDay}
          onSelectDay={onSelectDay}
        />
      )}
    </div>
  );
}

function ContinuationSection({ user, calendarDay, onSelectDay }) {
  const streak = getStreak(user.completedDays);
  const todayDay = calendarDay || user.currentDay;
  const todayComplete = user.completedDays.includes(todayDay);

  return (
    <div style={{ marginBottom: 36 }}>
      {/* Phase header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 12, height: 12, borderRadius: 3, background: '#f0a500' }} />
        <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>Beyond Day 30</h3>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        <div className="mono" style={{ fontSize: 12, color: '#f0a500', fontWeight: 600 }}>
          {streak} day streak
        </div>
      </div>

      {/* Continuation banner */}
      <div
        className="card"
        style={{
          borderColor: todayComplete ? 'rgba(72,199,142,0.3)' : 'rgba(240,165,0,0.3)',
          padding: '20px 24px', cursor: 'pointer', marginBottom: 12,
          background: todayComplete
            ? 'rgba(72,199,142,0.04)'
            : 'linear-gradient(135deg, rgba(240,165,0,0.06), rgba(233,69,96,0.03))',
        }}
        onClick={() => !todayComplete && onSelectDay(todayDay)}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div className="mono" style={{
              fontSize: 11, color: '#f0a500', fontWeight: 700,
              letterSpacing: 1, marginBottom: 6,
            }}>
              DAY {todayDay} {todayComplete ? '' : '— TODAY'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
              {POST_30_TASK.title}
            </div>
            <div style={{ fontSize: 13, color: '#888' }}>
              {todayComplete
                ? 'Completed! Come back tomorrow to keep your streak going.'
                : 'Complete your daily tasks to extend your streak'}
            </div>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            {todayComplete ? (
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: '#48c78e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: 'white',
              }}>✓</div>
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(240,165,0,0.15)', border: '2px solid rgba(240,165,0,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, animation: 'pulse 2s infinite',
              }}>→</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent continuation history (last 7 days) */}
      {user.completedDays.filter(d => d > 30).length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          {user.completedDays.filter(d => d > 30).slice(-7).map(d => (
            <div
              key={d}
              onClick={() => onSelectDay(d)}
              className="card"
              style={{
                padding: '8px 12px', cursor: 'pointer', borderColor: 'rgba(72,199,142,0.2)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#48c78e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: 'white' }}>✓</div>
              <span className="mono" style={{ fontSize: 11, color: '#888' }}>Day {d}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
