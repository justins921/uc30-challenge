import { useState, useMemo } from 'react';
import { getStreak } from '../data/challengeDays';

const RANK_STYLES = {
  1: { bg: 'rgba(240,165,0,0.1)', border: 'rgba(240,165,0,0.3)', color: '#f0a500', badge: '🥇' },
  2: { bg: 'rgba(192,192,192,0.08)', border: 'rgba(192,192,192,0.25)', color: '#c0c0c0', badge: '🥈' },
  3: { bg: 'rgba(205,127,50,0.08)', border: 'rgba(205,127,50,0.25)', color: '#cd7f32', badge: '🥉' },
};

export default function Leaderboard({ participants, currentUserId }) {
  const [filter, setFilter] = useState('all-time');

  const ranked = useMemo(() => {
    const eligible = (participants || [])
      .filter(p => !p.isAdmin && p.isActive)
      .map(p => ({
        ...p,
        displayName: `${p.firstName} ${p.lastName ? p.lastName.charAt(0) + '.' : ''}`,
        streak: getStreak(p.completedDays),
      }))
      .sort((a, b) => (b.ucPoints || 0) - (a.ucPoints || 0));

    return eligible.map((p, i) => ({ ...p, rank: i + 1 }));
  }, [participants]);

  const filters = [
    { id: 'all-time', label: 'All-Time' },
  ];

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Leaderboard</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                background: filter === f.id ? 'rgba(240,165,0,0.15)' : 'rgba(255,255,255,0.04)',
                color: filter === f.id ? '#f0a500' : '#888',
                border: filter === f.id ? '1px solid rgba(240,165,0,0.3)' : '1px solid rgba(255,255,255,0.06)',
                padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {ranked.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: '#666' }}>
          No Operators ranked yet. Start logging activity to appear on the leaderboard.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ranked.map(p => {
            const isCurrentUser = p.id === currentUserId;
            const rankStyle = RANK_STYLES[p.rank];
            return (
              <div
                key={p.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                  borderRadius: 12,
                  background: isCurrentUser
                    ? 'rgba(233,69,96,0.06)'
                    : (rankStyle?.bg || 'rgba(255,255,255,0.02)'),
                  border: `1px solid ${isCurrentUser
                    ? 'rgba(233,69,96,0.2)'
                    : (rankStyle?.border || 'rgba(255,255,255,0.06)')}`,
                }}
              >
                {/* Rank */}
                <div className="mono" style={{
                  width: 36, height: 36, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: rankStyle ? 20 : 14,
                  fontWeight: 700,
                  color: rankStyle?.color || '#666',
                  background: rankStyle ? `${rankStyle.color}15` : 'rgba(255,255,255,0.04)',
                  flexShrink: 0,
                }}>
                  {rankStyle ? rankStyle.badge : `#${p.rank}`}
                </div>

                {/* Name + streak */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 600,
                    color: isCurrentUser ? '#e94560' : '#ddd',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {p.displayName}
                    {isCurrentUser && (
                      <span style={{
                        fontSize: 10, marginLeft: 8, padding: '2px 6px', borderRadius: 4,
                        background: 'rgba(233,69,96,0.15)', color: '#e94560',
                      }}>You</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                    Day {p.currentDay > 32 ? p.currentDay : `${p.currentDay}/32`}
                    {p.streak > 0 && <span style={{ marginLeft: 8, color: '#48c78e' }}>🔥 {p.streak} streak</span>}
                  </div>
                </div>

                {/* UC Points */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="mono" style={{
                    fontSize: 18, fontWeight: 700,
                    color: rankStyle?.color || '#f0a500',
                  }}>
                    {(p.ucPoints || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 10, color: '#666' }}>UC Points</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
