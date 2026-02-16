import { CHALLENGE_DAYS } from '../data/challengeDays';
import { INDICATOR_KEYS, INDICATOR_LABELS, INDICATOR_SHORT_LABELS, INDICATOR_COLORS, UC_POINT_VALUES, calculateUCPoints } from '../data/ucPoints';
import ShareableStreakCard from './ShareableStreakCard';

export default function StatsView({ user }) {
  const completionRate = user.completedDays.length > 0
    ? Math.round((user.completedDays.length / Math.max(user.currentDay - 1, 1)) * 100)
    : 0;

  const ucPoints = user.ucPoints || calculateUCPoints(user.metrics);

  return (
    <div className="fade-up">
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Operator Stats</h2>

      {/* UC Points Hero */}
      <div className="card" style={{
        textAlign: 'center', padding: 32, marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(240,165,0,0.08), rgba(240,165,0,0.02))',
        border: '1px solid rgba(240,165,0,0.2)',
      }}>
        <div style={{ fontSize: 12, color: '#f0a500', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
          Total UC Points
        </div>
        <div className="mono" style={{ fontSize: 56, fontWeight: 700, color: '#f0a500' }}>
          {ucPoints.toLocaleString()}
        </div>
      </div>

      {/* Shareable streak card with share button */}
      <ShareableStreakCard user={user} />

      {/* Big Numbers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}>
        <BigStat value={user.completedDays.length} label="Days Completed" color="#e94560" />
        <BigStat value={`${completionRate}%`} label="Completion Rate" color="#48c78e" />
      </div>

      {/* 6 Indicators Grid */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>UC30 Indicators</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {INDICATOR_KEYS.map(key => (
            <div key={key} style={{
              padding: 16, borderRadius: 10,
              background: `${INDICATOR_COLORS[key]}08`,
              border: `1px solid ${INDICATOR_COLORS[key]}20`,
            }}>
              <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: INDICATOR_COLORS[key] }}>
                {user.metrics[key] || 0}
              </div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                {INDICATOR_LABELS[key]}
              </div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                {(user.metrics[key] || 0) * UC_POINT_VALUES[key]} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 30-Day Activity Heatmap */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>30-Day Activity Map</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 6 }}>
          {CHALLENGE_DAYS.map((d, i) => {
            const isComplete = user.completedDays.includes(i + 1);
            const isCurrent = i + 1 === user.currentDay;
            return (
              <div
                key={i}
                title={`Day ${i + 1}: ${d.title}`}
                style={{
                  aspectRatio: '1', borderRadius: 6,
                  background: isComplete ? '#48c78e' : isCurrent ? '#e94560' : 'rgba(255,255,255,0.04)',
                  border: isCurrent ? '2px solid #e94560' : '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontFamily: "'Space Mono', monospace", fontWeight: 600,
                  color: isComplete || isCurrent ? 'white' : '#444',
                }}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Cumulative Progress</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {INDICATOR_KEYS.map(key => (
            <MiniBar
              key={key}
              label={INDICATOR_SHORT_LABELS[key]}
              value={user.metrics[key] || 0}
              max={Math.max(50, user.metrics[key] || 0)}
              color={INDICATOR_COLORS[key]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BigStat({ value, label, color }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 28 }}>
      <div className="mono" style={{ fontSize: 42, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ flex: '1 0 60px', textAlign: 'center', minWidth: 60 }}>
      <div style={{
        height: 120, background: 'rgba(255,255,255,0.03)', borderRadius: 8,
        position: 'relative', overflow: 'hidden', marginBottom: 8,
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: `${pct}%`, background: color,
          borderRadius: '0 0 8px 8px', transition: 'height 0.6s ease',
        }} />
        <div className="mono" style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700,
        }}>
          {value}
        </div>
      </div>
      <div style={{ fontSize: 10, color: '#666' }}>{label}</div>
    </div>
  );
}
