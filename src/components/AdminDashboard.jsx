import { useState } from 'react';
import Header from './Header';

const ADMIN_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'participants', label: 'Participants' },
  { id: 'social', label: 'Social Proof' },
];

export default function AdminDashboard({ user, participants, onRemove, onReactivate, onLogout }) {
  const [tab, setTab] = useState('overview');

  const nonAdmin = participants.filter(p => !p.isAdmin);
  const active = nonAdmin.filter(p => p.isActive);
  const removed = nonAdmin.filter(p => !p.isActive);

  const totalAnalyzed = nonAdmin.reduce((s, p) => s + (p.metrics?.propertiesAnalyzed || 0), 0);
  const totalOffers = nonAdmin.reduce((s, p) => s + (p.metrics?.offersSubmitted || 0), 0);
  const totalAgents = nonAdmin.reduce((s, p) => s + (p.metrics?.agentsContacted || 0), 0);

  const dayDistribution = {};
  active.forEach(p => {
    const d = p.currentDay;
    dayDistribution[d] = (dayDistribution[d] || 0) + 1;
  });

  const retentionRate = nonAdmin.length > 0 ? Math.round((active.length / nonAdmin.length) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        user={user}
        currentTab={tab}
        onTabChange={setTab}
        tabs={ADMIN_TABS}
        onLogout={onLogout}
        isAdmin
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <h1 className="fade-up" style={{ fontSize: 28, fontWeight: 700, marginBottom: 32 }}>
          Challenge Control Center
        </h1>

        {/* Top Stats */}
        <div className="fade-up-delay-1" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12, marginBottom: 32,
        }}>
          <AdminStat label="Total Enrolled" value={nonAdmin.length} color="#888" />
          <AdminStat label="Active Now" value={active.length} color="#48c78e" />
          <AdminStat label="Removed" value={removed.length} color="#e94560" />
          <AdminStat label="Properties Analyzed" value={totalAnalyzed} color="#533483" />
          <AdminStat label="Offers Submitted" value={totalOffers} color="#e94560" />
          <AdminStat label="Agents Contacted" value={totalAgents} color="#0f3460" />
        </div>

        {/* Tab Content */}
        {tab === 'overview' && (
          <OverviewTab
            active={active}
            nonAdmin={nonAdmin}
            dayDistribution={dayDistribution}
            retentionRate={retentionRate}
          />
        )}
        {tab === 'participants' && (
          <ParticipantsTab
            nonAdmin={nonAdmin}
            onRemove={onRemove}
            onReactivate={onReactivate}
          />
        )}
        {tab === 'social' && (
          <SocialProofTab
            active={active}
            nonAdmin={nonAdmin}
            totalOffers={totalOffers}
            totalAnalyzed={totalAnalyzed}
            totalAgents={totalAgents}
            retentionRate={retentionRate}
            dayDistribution={dayDistribution}
          />
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function AdminStat({ label, value, color }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 16 }}>
      <div className="mono" style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 10, color: '#666', marginTop: 4, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

function OverviewTab({ active, nonAdmin, dayDistribution, retentionRate }) {
  const maxCount = Math.max(...Object.values(dayDistribution), 1);

  return (
    <div className="fade-up">
      {/* Day Distribution Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Active Participants by Day</h3>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 160 }}>
          {Array.from({ length: 30 }, (_, i) => {
            const count = dayDistribution[i + 1] || 0;
            return (
              <div key={i} style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4,
              }}>
                <div className="mono" style={{ fontSize: 9, color: '#888' }}>
                  {count || ''}
                </div>
                <div style={{
                  width: '100%', borderRadius: '4px 4px 0 0',
                  height: `${count > 0 ? Math.max((count / maxCount) * 120, 8) : 4}px`,
                  background: count > 0
                    ? 'linear-gradient(180deg, #e94560, #c81d4e)'
                    : 'rgba(255,255,255,0.04)',
                  transition: 'height 0.3s',
                }} />
                <div className="mono" style={{ fontSize: 8, color: '#555' }}>{i + 1}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Retention */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Retention Rate</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div className="mono" style={{ fontSize: 48, fontWeight: 700, color: '#48c78e' }}>
            {retentionRate}%
          </div>
          <div style={{ color: '#888', fontSize: 14, lineHeight: 1.6 }}>
            {active.length} of {nonAdmin.length} participants still active
          </div>
        </div>
      </div>
    </div>
  );
}

function ParticipantsTab({ nonAdmin, onRemove, onReactivate }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? nonAdmin
    : filter === 'active' ? nonAdmin.filter(p => p.isActive)
    : nonAdmin.filter(p => !p.isActive);

  return (
    <div className="fade-up">
      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'active', 'removed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? 'rgba(233,69,96,0.15)' : 'rgba(255,255,255,0.04)',
              color: filter === f ? '#e94560' : '#888',
              border: filter === f ? '1px solid rgba(233,69,96,0.3)' : '1px solid rgba(255,255,255,0.06)',
              padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500, textTransform: 'capitalize',
            }}
          >
            {f} ({f === 'all' ? nonAdmin.length : f === 'active' ? nonAdmin.filter(p => p.isActive).length : nonAdmin.filter(p => !p.isActive).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <p style={{ color: '#666' }}>No participants to show.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(p => (
            <div key={p.id} className="card" style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: p.isActive ? 'rgba(72,199,142,0.15)' : 'rgba(233,69,96,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0,
              }}>
                {p.isActive ? '🟢' : '🔴'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.email}</div>
              </div>
              <div style={{ textAlign: 'center', minWidth: 50 }}>
                <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: '#e94560' }}>
                  {p.currentDay > 30 ? '✓' : p.currentDay}
                </div>
                <div style={{ fontSize: 10, color: '#555' }}>Day</div>
              </div>
              <div style={{ textAlign: 'center', minWidth: 50 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#533483' }}>
                  {p.metrics?.propertiesAnalyzed || 0}
                </div>
                <div style={{ fontSize: 10, color: '#555' }}>Analyzed</div>
              </div>
              <div style={{ textAlign: 'center', minWidth: 50 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e94560' }}>
                  {p.metrics?.offersSubmitted || 0}
                </div>
                <div style={{ fontSize: 10, color: '#555' }}>Offers</div>
              </div>
              <div>
                {p.isActive ? (
                  <button className="btn-danger" onClick={() => onRemove(p.id)}>Remove</button>
                ) : (
                  <button className="btn-success" onClick={() => onReactivate(p.id)}>Reactivate</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SocialProofTab({ active, nonAdmin, totalOffers, totalAnalyzed, totalAgents, retentionRate, dayDistribution }) {
  return (
    <div className="fade-up">
      {/* Social Cards */}
      <div className="card" style={{
        padding: 32, marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(233,69,96,0.08), rgba(83,52,131,0.08))',
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>📣 Social Proof Dashboard</h3>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          Copy-ready stats for social media and marketing.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <SocialCard icon="🔥" stat={`${active.length} participants`} text="are currently active in the 30-Day First Deal Challenge" />
          <SocialCard icon="📝" stat={`${totalOffers} offers`} text="have been submitted by our challenge participants" />
          <SocialCard icon="📊" stat={`${totalAnalyzed} properties`} text="have been analyzed through the challenge so far" />
          <SocialCard icon="💪" stat={`${retentionRate}% retention`} text="of enrolled participants are still crushing it daily" />
        </div>
      </div>

      {/* Copyable Summary */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Today's Activity Summary</h3>
        <div className="mono" style={{
          fontSize: 13, color: '#bbb', lineHeight: 2,
          background: 'rgba(0,0,0,0.3)', padding: 20, borderRadius: 10,
        }}>
          <div>📅 Active Participants: <span style={{ color: '#48c78e' }}>{active.length}</span></div>
          <div>📊 Total Properties Analyzed: <span style={{ color: '#533483' }}>{totalAnalyzed}</span></div>
          <div>📝 Total Offers Submitted: <span style={{ color: '#e94560' }}>{totalOffers}</span></div>
          <div>🤝 Total Agents Contacted: <span style={{ color: '#0f3460' }}>{totalAgents}</span></div>
          <div>📈 Retention Rate: <span style={{ color: '#48c78e' }}>{retentionRate}%</span></div>
          <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
            {Object.entries(dayDistribution)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([day, count]) => (
                <div key={day}>
                  {'  '}Day {day}: <span style={{ color: '#e94560' }}>{count}</span> participant{count !== 1 ? 's' : ''}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialCard({ icon, stat, text }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: '#e94560', marginBottom: 4 }}>
        {stat}
      </div>
      <div style={{ fontSize: 13, color: '#888' }}>{text}</div>
    </div>
  );
}
