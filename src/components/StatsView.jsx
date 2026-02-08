import { CHALLENGE_DAYS } from '../data/challengeDays';
import ShareableStreakCard from './ShareableStreakCard';

export default function StatsView({ user }) {
  const completionRate = user.completedDays.length > 0
    ? Math.round((user.completedDays.length / Math.max(user.currentDay - 1, 1)) * 100)
    : 0;

  return (
    <div className="fade-up">
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>My Challenge Stats</h2>

      {/* Shareable streak card with share button */}
      <ShareableStreakCard user={user} />

      {/* Big Numbers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}>
        <BigStat value={user.completedDays.length} label="Days Completed" color="#e94560" />
        <BigStat value={`${completionRate}%`} label="Completion Rate" color="#48c78e" />
        <BigStat value={user.metrics.propertiesAnalyzed} label="Properties Analyzed" color="#533483" />
        <BigStat value={user.metrics.offersSubmitted} label="Offers Submitted" color="#0f3460" />
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
        <div style={{ display: 'flex', gap: 24 }}>
          <MiniBar label="Analyzed" value={user.metrics.propertiesAnalyzed} max={Math.max(50, user.metrics.propertiesAnalyzed)} color="#533483" />
          <MiniBar label="Offers" value={user.metrics.offersSubmitted} max={Math.max(40, user.metrics.offersSubmitted)} color="#e94560" />
          <MiniBar label="Agents" value={user.metrics.agentsContacted} max={Math.max(20, user.metrics.agentsContacted)} color="#0f3460" />
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
    <div style={{ flex: 1, textAlign: 'center' }}>
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
          fontSize: 18, fontWeight: 700,
        }}>
          {value}
        </div>
      </div>
      <div style={{ fontSize: 11, color: '#666' }}>{label}</div>
    </div>
  );
}
