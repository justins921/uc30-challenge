import { useState } from 'react';
import Header from './Header';
import { CHALLENGE_DAYS, getPhases, DEFAULT_PHASES, getDayContent } from '../data/challengeDays';
import { AttachmentLink } from './DayView';
import { LANDING_DEFAULTS } from './LandingPage';

const ADMIN_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'participants', label: 'Participants' },
  { id: 'submissions', label: 'Submissions' },
  { id: 'content', label: 'Content' },
  { id: 'landing', label: 'Landing Page' },
  { id: 'social', label: 'Social Proof' },
];

export default function AdminDashboard({ user, participants, onRemove, onDelete, onReactivate, onToggleAdmin, onResetPassword, onLogout, cohortStartDate, nextCohortDate, onSetCohortStartDate, onSetNextCohortDate, contentOverrides, onSetContentOverrides, liveCalls, onSetLiveCalls, customPhases, onSetPhases, landingContent, onSetLandingContent }) {
  const phases = getPhases(customPhases);
  const [tab, setTab] = useState('overview');
  const [selectedParticipant, setSelectedParticipant] = useState(null);

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

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSelectedParticipant(null);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        user={user}
        currentTab={tab}
        onTabChange={handleTabChange}
        tabs={ADMIN_TABS}
        onLogout={onLogout}
        isAdmin
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <h1 className="fade-up" style={{ fontSize: 28, fontWeight: 700, marginBottom: 32 }}>
          Challenge Control Center
        </h1>

        {/* Cohort Settings */}
        <CohortSettings
          cohortStartDate={cohortStartDate}
          nextCohortDate={nextCohortDate}
          onSetCohortStartDate={onSetCohortStartDate}
          onSetNextCohortDate={onSetNextCohortDate}
        />

        {/* Live Calls */}
        <LiveCallsManager calls={liveCalls || []} onSave={onSetLiveCalls} />

        {/* Top Stats */}
        <div className="fade-up-delay-1 admin-stats-grid" style={{
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
        {tab === 'participants' && !selectedParticipant && (
          <ParticipantsTab
            nonAdmin={nonAdmin}
            onRemove={onRemove}
            onDelete={onDelete}
            onReactivate={onReactivate}
            onToggleAdmin={onToggleAdmin}
            onResetPassword={onResetPassword}
            onSelect={setSelectedParticipant}
          />
        )}
        {tab === 'participants' && selectedParticipant && (
          <ParticipantDetail
            participant={selectedParticipant}
            onBack={() => setSelectedParticipant(null)}
            onRemove={onRemove}
            onDelete={onDelete}
            onReactivate={onReactivate}
            onToggleAdmin={onToggleAdmin}
            onResetPassword={onResetPassword}
          />
        )}
        {tab === 'submissions' && (
          <SubmissionsTab nonAdmin={nonAdmin} />
        )}
        {tab === 'content' && (
          <ContentTab
            contentOverrides={contentOverrides}
            onSetContentOverrides={onSetContentOverrides}
            phases={phases}
            onSetPhases={onSetPhases}
          />
        )}
        {tab === 'landing' && (
          <LandingPageEditor
            landingContent={landingContent}
            onSave={onSetLandingContent}
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

// ── Cohort Settings ─────────────────────────────────────────
function CohortSettings({ cohortStartDate, nextCohortDate, onSetCohortStartDate, onSetNextCohortDate }) {
  const [editing, setEditing] = useState(false);
  const [dateValue, setDateValue] = useState(cohortStartDate || '');
  const [editingNext, setEditingNext] = useState(false);
  const [nextDateValue, setNextDateValue] = useState(nextCohortDate || '');

  const handleSave = () => {
    if (dateValue) {
      onSetCohortStartDate(dateValue);
    }
    setEditing(false);
  };

  const handleClear = () => {
    onSetCohortStartDate(null);
    setDateValue('');
    setEditing(false);
  };

  const handleSaveNext = () => {
    if (nextDateValue) {
      onSetNextCohortDate(nextDateValue);
    }
    setEditingNext(false);
  };

  const handleClearNext = () => {
    onSetNextCohortDate(null);
    setNextDateValue('');
    setEditingNext(false);
  };

  const formatDate = (d) => {
    if (!d) return null;
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const getStatus = () => {
    if (!cohortStartDate) return null;
    const eastern = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    const nowEastern = new Date(eastern);
    const start = new Date(cohortStartDate + 'T00:00:00');
    const nowDay = new Date(nowEastern.getFullYear(), nowEastern.getMonth(), nowEastern.getDate());
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const diffDays = Math.floor((nowDay - startDay) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: `Starts in ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`, color: '#e94560' };
    if (diffDays < 30) return { text: `Day ${diffDays + 1} of 30`, color: '#48c78e' };
    return { text: 'Completed', color: '#888' };
  };

  const status = getStatus();

  return (
    <div className="card fade-up" style={{ marginBottom: 24, padding: '20px 24px' }}>
      {/* Current Cohort Start Date */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>📅</span>
          <div>
            <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              Cohort Start Date
            </div>
            {cohortStartDate && !editing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{formatDate(cohortStartDate)}</span>
                {status && (
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: status.color,
                    background: `${status.color}15`, padding: '3px 10px', borderRadius: 6,
                  }}>
                    {status.text}
                  </span>
                )}
              </div>
            ) : !editing ? (
              <span style={{ fontSize: 14, color: '#555' }}>No start date set — participants can progress freely</span>
            ) : null}
          </div>
        </div>

        {!editing ? (
          <button
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: 13 }}
            onClick={() => { setDateValue(cohortStartDate || ''); setEditing(true); }}
          >
            {cohortStartDate ? 'Change' : 'Set Date'}
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <input
              type="date"
              value={dateValue}
              onChange={e => setDateValue(e.target.value)}
              style={{ padding: '8px 12px', fontSize: 14, width: 'auto', minWidth: 160 }}
            />
            <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={handleSave}>
              Save
            </button>
            {cohortStartDate && (
              <button className="btn-danger" style={{ padding: '8px 14px' }} onClick={handleClear}>
                Clear
              </button>
            )}
            <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Next Cohort Date */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 16, paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>🔜</span>
          <div>
            <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              Next Cohort Date
            </div>
            {nextCohortDate && !editingNext ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{formatDate(nextCohortDate)}</span>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: '#f0a500',
                  background: 'rgba(240,165,0,0.1)', padding: '3px 10px', borderRadius: 6,
                }}>
                  Shown to removed users
                </span>
              </div>
            ) : !editingNext ? (
              <span style={{ fontSize: 14, color: '#555' }}>Not set — removed users won't see a next cohort date</span>
            ) : null}
          </div>
        </div>

        {!editingNext ? (
          <button
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: 13 }}
            onClick={() => { setNextDateValue(nextCohortDate || ''); setEditingNext(true); }}
          >
            {nextCohortDate ? 'Change' : 'Set Date'}
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <input
              type="date"
              value={nextDateValue}
              onChange={e => setNextDateValue(e.target.value)}
              style={{ padding: '8px 12px', fontSize: 14, width: 'auto', minWidth: 160 }}
            />
            <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={handleSaveNext}>
              Save
            </button>
            {nextCohortDate && (
              <button className="btn-danger" style={{ padding: '8px 14px' }} onClick={handleClearNext}>
                Clear
              </button>
            )}
            <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => setEditingNext(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Live Calls Manager ─────────────────────────────────────
function LiveCallsManager({ calls, onSave }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [link, setLink] = useState('');

  const handleAdd = () => {
    if (!dateTime || !link.trim()) return;
    const newCall = {
      id: `call_${Date.now()}`,
      title: title.trim() || 'Weekly Live Call',
      dateTime,
      link: link.trim(),
    };
    onSave([...calls, newCall]);
    setTitle('');
    setDateTime('');
    setLink('');
    setAdding(false);
  };

  const handleRemove = (id) => {
    onSave(calls.filter(c => c.id !== id));
  };

  const upcoming = calls
    .filter(c => new Date(c.dateTime) > new Date())
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  const past = calls
    .filter(c => new Date(c.dateTime) <= new Date())
    .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

  const formatCallDate = (dt) => {
    const d = new Date(dt);
    return d.toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    });
  };

  return (
    <div className="card fade-up" style={{ marginBottom: 24, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: upcoming.length > 0 || adding ? 16 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>📹</span>
          <div>
            <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              Live Calls
            </div>
            <span style={{ fontSize: 14, color: '#888' }}>
              {upcoming.length > 0 ? `${upcoming.length} upcoming` : 'No upcoming calls'}
            </span>
          </div>
        </div>
        {!adding && (
          <button
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: 13 }}
            onClick={() => setAdding(true)}
          >
            Add Call
          </button>
        )}
      </div>

      {adding && (
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16, marginBottom: 16,
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label style={{ fontSize: 12 }}>Title (optional)</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Weekly Live Call"
                style={{ fontSize: 13 }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: 12 }}>Date & Time</label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={e => setDateTime(e.target.value)}
                style={{ fontSize: 13 }}
              />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12 }}>Meeting Link</label>
            <input
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="https://zoom.us/j/... or Google Meet link"
              style={{ fontSize: 13 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={handleAdd}>
              Save Call
            </button>
            <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => setAdding(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {upcoming.map(call => (
        <div key={call.id} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{call.title}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{formatCallDate(call.dateTime)}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <a href={call.link} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: '#e94560', textDecoration: 'none' }}>
              Link
            </a>
            <button
              onClick={() => handleRemove(call.id)}
              style={{
                background: 'rgba(233,69,96,0.1)', color: '#e94560', border: 'none',
                padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      {past.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Past</div>
          {past.slice(0, 3).map(call => (
            <div key={call.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 0', opacity: 0.5,
            }}>
              <div>
                <span style={{ fontSize: 13 }}>{call.title}</span>
                <span style={{ fontSize: 11, color: '#666', marginLeft: 8 }}>{formatCallDate(call.dateTime)}</span>
              </div>
              <button
                onClick={() => handleRemove(call.id)}
                style={{
                  background: 'none', color: '#666', border: 'none',
                  fontSize: 11, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
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
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Active Participants by Day</h3>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 160, overflowX: 'auto' }}>
          {Array.from({ length: 30 }, (_, i) => {
            const count = dayDistribution[i + 1] || 0;
            return (
              <div key={i} style={{
                flex: '1 0 auto', minWidth: 16, display: 'flex', flexDirection: 'column',
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

function ParticipantsTab({ nonAdmin, onRemove, onDelete, onReactivate, onToggleAdmin, onResetPassword, onSelect }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? nonAdmin
    : filter === 'active' ? nonAdmin.filter(p => p.isActive)
    : nonAdmin.filter(p => !p.isActive);

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
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
            <div
              key={p.id}
              className="card"
              style={{ padding: '16px', cursor: 'pointer' }}
              onClick={() => onSelect(p)}
            >
              {/* Top row: status + name + arrow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: p.isActive ? 'rgba(72,199,142,0.15)' : 'rgba(233,69,96,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0,
                }}>
                  {p.isActive ? '🟢' : '🔴'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{p.firstName} {p.lastName}</span>
                    {p.reactivatedAt && (
                      <span style={{
                        fontSize: 10, fontWeight: 600, color: '#f0a500',
                        background: 'rgba(240,165,0,0.1)', padding: '2px 8px',
                        borderRadius: 4, flexShrink: 0,
                      }}>Reactivated</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.email}</div>
                </div>
                <div style={{ color: '#444', fontSize: 18, flexShrink: 0 }}>›</div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <MiniStat label="Day" value={p.currentDay > 30 ? '✓' : p.currentDay} color="#e94560" />
                <MiniStat label="Analyzed" value={p.metrics?.propertiesAnalyzed || 0} color="#533483" />
                <MiniStat label="Offers" value={p.metrics?.offersSubmitted || 0} color="#e94560" />
                <MiniStat label="Submissions" value={p.submissions?.length || 0} color="#888" />
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                  <button
                    style={{
                      background: 'rgba(59,130,246,0.08)', color: '#3b82f6',
                      border: '1px solid rgba(59,130,246,0.2)', padding: '6px 12px',
                      borderRadius: 8, fontSize: 12, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                    }}
                    onClick={() => {
                      const newPw = prompt(`Enter new password for ${p.firstName} ${p.lastName}:`);
                      if (newPw && newPw.length >= 6) {
                        onResetPassword(p.id, newPw);
                      } else if (newPw) {
                        alert('Password must be at least 6 characters.');
                      }
                    }}
                  >
                    Reset Password
                  </button>
                  <button
                    style={{
                      background: 'rgba(83,52,131,0.08)', color: '#9b59b6',
                      border: '1px solid rgba(83,52,131,0.2)', padding: '6px 12px',
                      borderRadius: 8, fontSize: 12, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                    }}
                    onClick={() => {
                      if (confirm(`Make ${p.firstName} ${p.lastName} an admin? They will have full admin access.`)) {
                        onToggleAdmin(p.id, true);
                      }
                    }}
                  >
                    Make Admin
                  </button>
                  {p.isActive ? (
                    <button className="btn-danger" onClick={() => onRemove(p.id)}>Remove</button>
                  ) : (
                    <button className="btn-success" onClick={() => onReactivate(p.id)}>Reactivate</button>
                  )}
                  <button
                    style={{
                      background: 'rgba(255,0,0,0.08)', color: '#ff4444',
                      border: '1px solid rgba(255,0,0,0.2)', padding: '6px 12px',
                      borderRadius: 8, fontSize: 12, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                    }}
                    onClick={() => {
                      if (confirm(`Permanently delete ${p.firstName} ${p.lastName} (${p.email})? This cannot be undone.`)) {
                        onDelete(p.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Participant Detail View (with all submissions) ──────────
function ParticipantDetail({ participant, onBack, onRemove, onDelete, onReactivate, onToggleAdmin, onResetPassword }) {
  const p = participant;

  return (
    <div className="scale-in">
      <button
        className="btn-secondary"
        onClick={onBack}
        style={{ marginBottom: 24, padding: '8px 20px', fontSize: 13 }}
      >
        ← Back to Participants
      </button>

      {/* Participant Header */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: p.isActive ? 'rgba(72,199,142,0.15)' : 'rgba(233,69,96,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}>
              {p.isActive ? '🟢' : '🔴'}
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>{p.firstName} {p.lastName}</h2>
              <div style={{ fontSize: 13, color: '#666' }}>{p.email}</div>
              <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                Joined: {new Date(p.startDate).toLocaleDateString()}
                {p.removedAt && <> · Removed: {new Date(p.removedAt).toLocaleDateString()}</>}
                {p.reactivatedAt && <> · Reactivated: {new Date(p.reactivatedAt).toLocaleDateString()}</>}
              </div>
              {p.reactivatedAt && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6,
                  fontSize: 12, fontWeight: 600, color: '#f0a500',
                  background: 'rgba(240,165,0,0.1)', border: '1px solid rgba(240,165,0,0.2)',
                  padding: '4px 12px', borderRadius: 6,
                }}>
                  🔄 Reactivated on {new Date(p.reactivatedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              style={{
                background: 'rgba(59,130,246,0.08)', color: '#3b82f6',
                border: '1px solid rgba(59,130,246,0.2)', padding: '8px 16px',
                borderRadius: 8, fontSize: 13, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              }}
              onClick={() => {
                const newPw = prompt(`Enter new password for ${p.firstName} ${p.lastName}:`);
                if (newPw && newPw.length >= 6) {
                  onResetPassword(p.id, newPw);
                } else if (newPw) {
                  alert('Password must be at least 6 characters.');
                }
              }}
            >
              Reset Password
            </button>
            <button
              style={{
                background: 'rgba(83,52,131,0.08)', color: '#9b59b6',
                border: '1px solid rgba(83,52,131,0.2)', padding: '8px 16px',
                borderRadius: 8, fontSize: 13, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              }}
              onClick={() => {
                if (confirm(`Make ${p.firstName} ${p.lastName} an admin? They will have full admin access.`)) {
                  onToggleAdmin(p.id, true);
                  onBack();
                }
              }}
            >
              Make Admin
            </button>
            {p.isActive ? (
              <button className="btn-danger" onClick={() => onRemove(p.id)}>Remove from Challenge</button>
            ) : (
              <button className="btn-success" onClick={() => onReactivate(p.id)}>Reactivate</button>
            )}
            <button
              style={{
                background: 'rgba(255,0,0,0.08)', color: '#ff4444',
                border: '1px solid rgba(255,0,0,0.2)', padding: '8px 16px',
                borderRadius: 8, fontSize: 13, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              }}
              onClick={() => {
                if (confirm(`Permanently delete ${p.firstName} ${p.lastName} (${p.email})? This cannot be undone.`)) {
                  onDelete(p.id);
                  onBack();
                }
              }}
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="card" style={{ textAlign: 'center', padding: 16 }}>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#e94560' }}>
            {p.currentDay > 30 ? '✓' : p.currentDay}
          </div>
          <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>Current Day</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 16 }}>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#533483' }}>
            {p.metrics?.propertiesAnalyzed || 0}
          </div>
          <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>Properties Analyzed</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 16 }}>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#e94560' }}>
            {p.metrics?.offersSubmitted || 0}
          </div>
          <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>Offers Submitted</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 16 }}>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#0f3460' }}>
            {p.metrics?.agentsContacted || 0}
          </div>
          <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>Agents Contacted</div>
        </div>
      </div>

      {/* Activity Map */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Activity Map</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 6 }}>
          {Array.from({ length: 30 }, (_, i) => {
            const isComplete = p.completedDays?.includes(i + 1);
            const isCurrent = i + 1 === p.currentDay;
            return (
              <div
                key={i}
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

      {/* Submissions */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          All Submissions ({p.submissions?.length || 0})
        </h3>

        {(!p.submissions || p.submissions.length === 0) ? (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
            <p style={{ color: '#666', fontSize: 14 }}>No submissions yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {p.submissions.slice().reverse().map((sub, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  padding: '14px 16px', background: 'rgba(255,255,255,0.02)',
                  borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div className="mono" style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(72,199,142,0.1)', border: '1px solid rgba(72,199,142,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: '#48c78e', flexShrink: 0,
                }}>
                  {sub.day}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 8 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600 }}>{sub.title}</h4>
                    <span style={{ fontSize: 11, color: '#555' }}>
                      {new Date(sub.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ color: '#999', fontSize: 13, lineHeight: 1.6, wordBreak: 'break-word' }}>
                    {sub.proof}
                  </p>
                  {sub.fileName && (
                    <AttachmentLink fileName={sub.fileName} fileData={sub.fileData} />
                  )}
                </div>
                <div style={{
                  fontSize: 10, color: '#48c78e', background: 'rgba(72,199,142,0.1)',
                  padding: '3px 8px', borderRadius: 5, fontWeight: 600, flexShrink: 0,
                }}>
                  {sub.status === 'completed' ? 'Verified' : sub.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── All Submissions Tab ─────────────────────────────────────
function SubmissionsTab({ nonAdmin }) {
  const [selectedDay, setSelectedDay] = useState(0);

  const allSubmissions = [];
  nonAdmin.forEach(p => {
    (p.submissions || []).forEach(sub => {
      allSubmissions.push({
        ...sub,
        participantName: `${p.firstName} ${p.lastName}`,
        participantEmail: p.email,
        participantId: p.id,
      });
    });
  });

  allSubmissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const filtered = selectedDay > 0
    ? allSubmissions.filter(s => s.day === selectedDay)
    : allSubmissions;

  const dayCounts = {};
  allSubmissions.forEach(s => {
    dayCounts[s.day] = (dayCounts[s.day] || 0) + 1;
  });

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <label style={{ margin: 0, fontSize: 13, color: '#888', textTransform: 'none', letterSpacing: 0 }}>
            Filter by day:
          </label>
          <select
            value={selectedDay}
            onChange={e => setSelectedDay(Number(e.target.value))}
            style={{ width: 'auto', padding: '8px 12px', fontSize: 14, minWidth: 180 }}
          >
            <option value={0}>All Days ({allSubmissions.length})</option>
            {Array.from({ length: 30 }, (_, i) => {
              const dayNum = i + 1;
              const count = dayCounts[dayNum] || 0;
              const dayData = CHALLENGE_DAYS[i];
              return (
                <option key={dayNum} value={dayNum}>
                  Day {dayNum}: {dayData.title} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p style={{ color: '#666' }}>
            {selectedDay > 0
              ? `No submissions for Day ${selectedDay} yet.`
              : 'No submissions from any participants yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((sub, i) => (
            <div
              key={`${sub.participantId}-${sub.day}-${i}`}
              className="card"
              style={{ padding: '16px' }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div className="mono" style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'rgba(72,199,142,0.1)', border: '1px solid rgba(72,199,142,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700, color: '#48c78e', flexShrink: 0,
                }}>
                  {sub.day}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{sub.participantName}</span>
                    <span style={{ fontSize: 12, color: '#555' }}>{sub.participantEmail}</span>
                    <span style={{ fontSize: 11, color: '#444', marginLeft: 'auto', flexShrink: 0 }}>
                      {new Date(sub.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#e94560', fontWeight: 600, marginBottom: 4 }}>
                    {sub.title}
                  </div>
                  <p style={{ color: '#999', fontSize: 13, lineHeight: 1.6, wordBreak: 'break-word' }}>
                    {sub.proof}
                  </p>
                  {sub.fileName && (
                    <AttachmentLink fileName={sub.fileName} fileData={sub.fileData} />
                  )}
                </div>
                <div style={{
                  fontSize: 10, color: '#48c78e', background: 'rgba(72,199,142,0.1)',
                  padding: '3px 8px', borderRadius: 5, fontWeight: 600, flexShrink: 0,
                }}>
                  {sub.status === 'completed' ? 'Verified' : sub.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Content Management Tab ──────────────────────────────────
function ContentTab({ contentOverrides, onSetContentOverrides, phases, onSetPhases }) {
  const [editingDay, setEditingDay] = useState(null);
  const [editingPhases, setEditingPhases] = useState(false);

  if (editingDay) {
    return (
      <DayEditor
        dayNum={editingDay}
        contentOverrides={contentOverrides}
        onSave={(dayNum, overrides) => {
          const updated = { ...contentOverrides, [dayNum]: overrides };
          onSetContentOverrides(updated);
          setEditingDay(null);
        }}
        onBack={() => setEditingDay(null)}
      />
    );
  }

  if (editingPhases) {
    return (
      <PhaseEditor
        phases={phases}
        onSave={(updated) => {
          onSetPhases(updated);
          setEditingPhases(false);
        }}
        onBack={() => setEditingPhases(false)}
      />
    );
  }

  return (
    <div className="fade-up">
      <div className="card" style={{ marginBottom: 20, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ color: '#888', fontSize: 13, margin: 0 }}>
          Edit the text, videos, and resources for each day. Changes are saved to the database and visible to all users.
        </p>
        <button
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: 12, whiteSpace: 'nowrap', marginLeft: 16 }}
          onClick={() => setEditingPhases(true)}
        >
          Edit Phases
        </button>
      </div>
      {phases.map(phase => (
        <div key={phase.label} style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: phase.color }} />
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{phase.label}</h3>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {phase.days.map(d => {
              const dayData = getDayContent(d, contentOverrides);
              const hasOverrides = !!contentOverrides[d];
              return (
                <div
                  key={d}
                  className="card"
                  style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
                  onClick={() => setEditingDay(d)}
                >
                  <div className="mono" style={{
                    width: 36, height: 36, borderRadius: 8, background: `${phase.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: phase.color, flexShrink: 0,
                  }}>
                    {d}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{dayData.title}</div>
                    <div style={{ fontSize: 12, color: '#555', display: 'flex', gap: 10 }}>
                      {dayData.videoUrl && <span style={{ color: '#48c78e' }}>Video set</span>}
                      {dayData.downloads?.length > 0 && <span style={{ color: '#533483' }}>{dayData.downloads.length} resource{dayData.downloads.length !== 1 ? 's' : ''}</span>}
                      {dayData.transcript && <span style={{ color: '#666' }}>Transcript</span>}
                    </div>
                  </div>
                  {hasOverrides && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: '#48c78e',
                      background: 'rgba(72,199,142,0.1)', padding: '3px 8px', borderRadius: 4,
                    }}>Customized</span>
                  )}
                  <div style={{ color: '#444', fontSize: 18, flexShrink: 0 }}>›</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Phase Editor ──────────────────────────────────────────
const PHASE_COLORS = ['#e94560', '#0f3460', '#533483', '#48c78e', '#f0a500', '#888'];

function PhaseEditor({ phases, onSave, onBack }) {
  const [draft, setDraft] = useState(phases.map(p => ({ ...p, days: [...p.days] })));

  const updatePhase = (idx, field, value) => {
    const updated = [...draft];
    updated[idx] = { ...updated[idx], [field]: value };
    setDraft(updated);
  };

  const addPhase = () => {
    // Find days not assigned to any phase
    const assigned = new Set(draft.flatMap(p => p.days));
    const unassigned = [];
    for (let d = 1; d <= 30; d++) {
      if (!assigned.has(d)) unassigned.push(d);
    }
    setDraft([...draft, { label: '', days: unassigned, color: PHASE_COLORS[draft.length % PHASE_COLORS.length] }]);
  };

  const removePhase = (idx) => {
    setDraft(draft.filter((_, i) => i !== idx));
  };

  const parseDays = (str) => {
    // Parse "1-5, 8, 10-12" format
    const days = [];
    for (const part of str.split(',')) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [a, b] = trimmed.split('-').map(Number);
        if (a && b) for (let d = a; d <= b; d++) days.push(d);
      } else {
        const n = Number(trimmed);
        if (n) days.push(n);
      }
    }
    return days.filter(d => d >= 1 && d <= 30);
  };

  const formatDays = (days) => {
    if (days.length === 0) return '';
    const sorted = [...days].sort((a, b) => a - b);
    const ranges = [];
    let start = sorted[0], end = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end + 1) {
        end = sorted[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = end = sorted[i];
      }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    return ranges.join(', ');
  };

  const handleSave = () => {
    const valid = draft.filter(p => p.label.trim() && p.days.length > 0);
    if (valid.length === 0) return;
    onSave(valid.map(p => ({ label: p.label.trim(), days: p.days, color: p.color })));
  };

  const handleReset = () => {
    onSave(null); // null = use defaults
    onBack();
  };

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: 13 }} onClick={onBack}>
          ← Back
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Edit Phases</h2>
      </div>

      <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <p style={{ color: '#888', fontSize: 13, margin: 0 }}>
          Define the sections of your challenge and which days belong to each. Use ranges like "1-5" or individual days like "1, 3, 7".
        </p>
      </div>

      {draft.map((phase, idx) => (
        <div key={idx} className="card" style={{ padding: 20, marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label style={{ fontSize: 12 }}>Phase Name</label>
              <input
                value={phase.label}
                onChange={e => updatePhase(idx, 'label', e.target.value)}
                placeholder="e.g. Foundation"
                style={{ fontSize: 14 }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label style={{ fontSize: 12 }}>Days</label>
              <input
                value={formatDays(phase.days)}
                onChange={e => updatePhase(idx, 'days', parseDays(e.target.value))}
                placeholder="e.g. 1-5 or 1, 2, 3"
                style={{ fontSize: 14 }}
              />
            </div>
            <div style={{ minWidth: 100 }}>
              <label style={{ fontSize: 12 }}>Color</label>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {PHASE_COLORS.map(c => (
                  <div
                    key={c}
                    onClick={() => updatePhase(idx, 'color', c)}
                    style={{
                      width: 24, height: 24, borderRadius: 6, background: c, cursor: 'pointer',
                      border: phase.color === c ? '2px solid white' : '2px solid transparent',
                    }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={() => removePhase(idx)}
              style={{
                background: 'rgba(233,69,96,0.1)', color: '#e94560', border: 'none',
                padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", marginTop: 22,
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
        <button className="btn-secondary" style={{ padding: '10px 20px', fontSize: 13 }} onClick={addPhase}>
          + Add Phase
        </button>
        <button className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }} onClick={handleSave}>
          Save Phases
        </button>
        <button
          onClick={handleReset}
          style={{
            background: 'rgba(255,255,255,0.04)', color: '#888', border: '1px solid rgba(255,255,255,0.1)',
            padding: '10px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}

function DayEditor({ dayNum, contentOverrides, onSave, onBack }) {
  const defaults = CHALLENGE_DAYS[dayNum - 1];
  const existing = contentOverrides[dayNum] || {};

  const [title, setTitle] = useState(existing.title || defaults.title);
  const [taskDescription, setTaskDescription] = useState(existing.taskDescription || defaults.taskDescription);
  const [videoUrl, setVideoUrl] = useState(existing.videoUrl || defaults.videoUrl || '');
  const [transcript, setTranscript] = useState(existing.transcript || defaults.transcript || '');
  const [downloads, setDownloads] = useState(existing.downloads || defaults.downloads || []);
  const [newDlName, setNewDlName] = useState('');
  const [newDlUrl, setNewDlUrl] = useState('');

  const handleSave = () => {
    const overrides = {};
    if (title !== defaults.title) overrides.title = title;
    if (taskDescription !== defaults.taskDescription) overrides.taskDescription = taskDescription;
    if (videoUrl !== (defaults.videoUrl || '')) overrides.videoUrl = videoUrl || null;
    if (transcript !== (defaults.transcript || '')) overrides.transcript = transcript || null;
    if (JSON.stringify(downloads) !== JSON.stringify(defaults.downloads || [])) overrides.downloads = downloads;
    onSave(dayNum, Object.keys(overrides).length > 0 ? overrides : undefined);
  };

  const handleReset = () => {
    const updated = { ...contentOverrides };
    delete updated[dayNum];
    onSave(dayNum, undefined);
  };

  const addDownloadLink = () => {
    if (!newDlName.trim()) return;
    setDownloads([...downloads, { name: newDlName.trim(), url: newDlUrl.trim() || '#' }]);
    setNewDlName('');
    setNewDlUrl('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be under 10 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setDownloads([...downloads, { name: file.name, url: reader.result }]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeDownload = (idx) => {
    setDownloads(downloads.filter((_, i) => i !== idx));
  };

  const inputStyle = { width: '100%', marginBottom: 0, fontSize: 14 };
  const labelStyle = { fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 };

  return (
    <div className="scale-in">
      <button className="btn-secondary" onClick={onBack} style={{ marginBottom: 24, padding: '8px 20px', fontSize: 13 }}>
        ← Back to Content
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div className="mono" style={{ fontSize: 14, color: '#e94560', fontWeight: 700 }}>DAY {dayNum}</div>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Edit Day Content</h2>
      </div>

      {/* Title */}
      <div className="card" style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Day Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
      </div>

      {/* Task Description */}
      <div className="card" style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Task Description</label>
        <textarea
          value={taskDescription}
          onChange={e => setTaskDescription(e.target.value)}
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* Video URL */}
      <div className="card" style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Video Embed URL</label>
        <input
          value={videoUrl}
          onChange={e => setVideoUrl(e.target.value)}
          placeholder="https://www.youtube.com/embed/... or https://player.vimeo.com/video/..."
          style={inputStyle}
        />
        <p style={{ fontSize: 11, color: '#555', marginTop: 8, marginBottom: 0 }}>
          Use the embed URL from YouTube or Vimeo (not the regular watch URL).
        </p>
        {videoUrl && (
          <div style={{ marginTop: 12, aspectRatio: '16/9', maxHeight: 200, borderRadius: 8, overflow: 'hidden' }}>
            <iframe src={videoUrl} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
          </div>
        )}
      </div>

      {/* Transcript */}
      <div className="card" style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Video Transcript</label>
        <textarea
          value={transcript}
          onChange={e => setTranscript(e.target.value)}
          rows={4}
          placeholder="Paste the video transcript here..."
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* Downloads / Resources */}
      <div className="card" style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Resources & Downloads</label>
        {downloads.length > 0 && (
          <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {downloads.map((dl, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{ fontSize: 14 }}>📎</span>
                <span style={{ flex: 1, fontSize: 13, color: '#ccc' }}>{dl.name}</span>
                {dl.url && !dl.url.startsWith('data:') && (
                  <span style={{ fontSize: 11, color: '#555', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dl.url}</span>
                )}
                {dl.url && dl.url.startsWith('data:') && (
                  <span style={{ fontSize: 11, color: '#533483' }}>Uploaded file</span>
                )}
                <button
                  onClick={() => removeDownload(i)}
                  style={{
                    background: 'none', border: 'none', color: '#e94560',
                    cursor: 'pointer', fontSize: 16, padding: '0 4px',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <input
            value={newDlName}
            onChange={e => setNewDlName(e.target.value)}
            placeholder="Resource name"
            style={{ flex: 1, minWidth: 120, marginBottom: 0, fontSize: 13, padding: '8px 12px' }}
          />
          <input
            value={newDlUrl}
            onChange={e => setNewDlUrl(e.target.value)}
            placeholder="URL (optional)"
            style={{ flex: 1, minWidth: 120, marginBottom: 0, fontSize: 13, padding: '8px 12px' }}
          />
          <button className="btn-secondary" onClick={addDownloadLink} style={{ padding: '8px 14px', fontSize: 13 }}>
            + Add Link
          </button>
        </div>
        <label style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px',
          background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)',
          borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#888',
        }}>
          📤 Upload File
          <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
        </label>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={handleSave} style={{ padding: '12px 28px' }}>
          Save Changes
        </button>
        {contentOverrides[dayNum] && (
          <button className="btn-secondary" onClick={handleReset} style={{ padding: '12px 20px' }}>
            Reset to Default
          </button>
        )}
        <button className="btn-secondary" onClick={onBack} style={{ padding: '12px 20px' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Landing Page Editor ─────────────────────────────────────
function LandingPageEditor({ landingContent, onSave }) {
  const merged = { ...LANDING_DEFAULTS, ...landingContent };
  const [draft, setDraft] = useState({
    badge: merged.badge,
    headline: merged.headline,
    headlineAccent: merged.headlineAccent,
    headlineSuffix: merged.headlineSuffix,
    subtext: merged.subtext,
    ctaButton: merged.ctaButton,
    finalHeadline: merged.finalHeadline,
    finalSubtext: merged.finalSubtext,
    stats: merged.stats.map(s => ({ ...s })),
    steps: merged.steps.map(s => ({ ...s })),
    features: merged.features.map(f => ({ ...f })),
    phases: merged.phases.map(p => ({ ...p, items: [...p.items] })),
  });
  const [saved, setSaved] = useState(false);

  const update = (field, value) => setDraft(d => ({ ...d, [field]: value }));

  const updateStat = (idx, field, value) => {
    const stats = [...draft.stats];
    stats[idx] = { ...stats[idx], [field]: value };
    setDraft(d => ({ ...d, stats }));
  };

  const updateStep = (idx, field, value) => {
    const steps = [...draft.steps];
    steps[idx] = { ...steps[idx], [field]: value };
    setDraft(d => ({ ...d, steps }));
  };

  const updateFeature = (idx, field, value) => {
    const features = [...draft.features];
    features[idx] = { ...features[idx], [field]: value };
    setDraft(d => ({ ...d, features }));
  };

  const updatePhase = (idx, field, value) => {
    const phases = [...draft.phases];
    phases[idx] = { ...phases[idx], [field]: value };
    setDraft(d => ({ ...d, phases }));
  };

  const updatePhaseItem = (phaseIdx, itemIdx, value) => {
    const phases = [...draft.phases];
    const items = [...phases[phaseIdx].items];
    items[itemIdx] = value;
    phases[phaseIdx] = { ...phases[phaseIdx], items };
    setDraft(d => ({ ...d, phases }));
  };

  const addPhaseItem = (phaseIdx) => {
    const phases = [...draft.phases];
    phases[phaseIdx] = { ...phases[phaseIdx], items: [...phases[phaseIdx].items, ''] };
    setDraft(d => ({ ...d, phases }));
  };

  const removePhaseItem = (phaseIdx, itemIdx) => {
    const phases = [...draft.phases];
    phases[phaseIdx] = { ...phases[phaseIdx], items: phases[phaseIdx].items.filter((_, i) => i !== itemIdx) };
    setDraft(d => ({ ...d, phases }));
  };

  const handleSave = () => {
    // Only save fields that differ from defaults
    const overrides = {};
    for (const key of ['badge', 'headline', 'headlineAccent', 'headlineSuffix', 'subtext', 'ctaButton', 'finalHeadline', 'finalSubtext']) {
      if (draft[key] !== LANDING_DEFAULTS[key]) overrides[key] = draft[key];
    }
    if (JSON.stringify(draft.stats) !== JSON.stringify(LANDING_DEFAULTS.stats)) overrides.stats = draft.stats;
    if (JSON.stringify(draft.steps) !== JSON.stringify(LANDING_DEFAULTS.steps)) overrides.steps = draft.steps;
    if (JSON.stringify(draft.features) !== JSON.stringify(LANDING_DEFAULTS.features)) overrides.features = draft.features;
    if (JSON.stringify(draft.phases) !== JSON.stringify(LANDING_DEFAULTS.phases)) overrides.phases = draft.phases;

    onSave(Object.keys(overrides).length > 0 ? overrides : null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setDraft({
      badge: LANDING_DEFAULTS.badge,
      headline: LANDING_DEFAULTS.headline,
      headlineAccent: LANDING_DEFAULTS.headlineAccent,
      headlineSuffix: LANDING_DEFAULTS.headlineSuffix,
      subtext: LANDING_DEFAULTS.subtext,
      ctaButton: LANDING_DEFAULTS.ctaButton,
      finalHeadline: LANDING_DEFAULTS.finalHeadline,
      finalSubtext: LANDING_DEFAULTS.finalSubtext,
      stats: LANDING_DEFAULTS.stats.map(s => ({ ...s })),
      steps: LANDING_DEFAULTS.steps.map(s => ({ ...s })),
      features: LANDING_DEFAULTS.features.map(f => ({ ...f })),
      phases: LANDING_DEFAULTS.phases.map(p => ({ ...p, items: [...p.items] })),
    });
    onSave(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const labelStyle = { fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 };
  const inputStyle = { width: '100%', marginBottom: 0, fontSize: 14 };

  return (
    <div className="fade-up">
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <p style={{ color: '#888', fontSize: 13, margin: 0 }}>
          Customize the public landing page text, stats, and sections. Changes are live immediately after saving.
        </p>
      </div>

      {/* Hero Section */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Hero Section</h3>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Badge Text</label>
            <input value={draft.badge} onChange={e => update('badge', e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label style={labelStyle}>Headline</label>
              <input value={draft.headline} onChange={e => update('headline', e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label style={labelStyle}>Headline Accent (colored)</label>
              <input value={draft.headlineAccent} onChange={e => update('headlineAccent', e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label style={labelStyle}>Headline Suffix</label>
              <input value={draft.headlineSuffix} onChange={e => update('headlineSuffix', e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Subtext</label>
            <textarea value={draft.subtext} onChange={e => update('subtext', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div>
            <label style={labelStyle}>CTA Button Text</label>
            <input value={draft.ctaButton} onChange={e => update('ctaButton', e.target.value)} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Social Proof Stats</h3>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {draft.stats.map((stat, i) => (
            <div key={i} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <div style={{ flex: '0 0 60px' }}>
                  <label style={{ ...labelStyle, marginBottom: 4 }}>Value</label>
                  <input value={stat.value} onChange={e => updateStat(i, 'value', e.target.value)} style={{ ...inputStyle, fontSize: 13 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, marginBottom: 4 }}>Label</label>
                  <input value={stat.label} onChange={e => updateStat(i, 'label', e.target.value)} style={{ ...inputStyle, fontSize: 13 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Steps */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>How It Works Steps</h3>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {draft.steps.map((step, i) => (
            <div key={i} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div className="mono" style={{ fontSize: 14, color: 'rgba(233,69,96,0.4)', fontWeight: 700 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, marginBottom: 4 }}>Title</label>
                  <input value={step.title} onChange={e => updateStep(i, 'title', e.target.value)} style={{ ...inputStyle, fontSize: 13 }} />
                </div>
              </div>
              <label style={{ ...labelStyle, marginBottom: 4 }}>Description</label>
              <textarea value={step.description} onChange={e => updateStep(i, 'description', e.target.value)} rows={2} style={{ ...inputStyle, fontSize: 13, resize: 'vertical' }} />
            </div>
          ))}
        </div>
      </div>

      {/* What's Included Features */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>What's Included</h3>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {draft.features.map((feat, i) => (
            <div key={i} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                <div style={{ flex: '0 0 60px' }}>
                  <label style={{ ...labelStyle, marginBottom: 4 }}>Icon</label>
                  <input value={feat.icon} onChange={e => updateFeature(i, 'icon', e.target.value)} style={{ ...inputStyle, fontSize: 13, textAlign: 'center' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, marginBottom: 4 }}>Title</label>
                  <input value={feat.title} onChange={e => updateFeature(i, 'title', e.target.value)} style={{ ...inputStyle, fontSize: 13 }} />
                </div>
              </div>
              <label style={{ ...labelStyle, marginBottom: 4 }}>Description</label>
              <textarea value={feat.text} onChange={e => updateFeature(i, 'text', e.target.value)} rows={2} style={{ ...inputStyle, fontSize: 13, resize: 'vertical' }} />
            </div>
          ))}
        </div>
      </div>

      {/* 30-Day Journey Phases */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>30-Day Journey Phases</h3>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {draft.phases.map((phase, pi) => (
            <div key={pi} className="card" style={{ padding: 20, borderLeftWidth: 3, borderLeftColor: phase.color }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <div style={{ flex: 1, minWidth: 150 }}>
                  <label style={{ ...labelStyle, marginBottom: 4 }}>Phase Title</label>
                  <input value={phase.phase} onChange={e => updatePhase(pi, 'phase', e.target.value)} style={{ ...inputStyle, fontSize: 13 }} />
                </div>
                <div style={{ flex: '0 0 120px' }}>
                  <label style={{ ...labelStyle, marginBottom: 4 }}>Days Label</label>
                  <input value={phase.days} onChange={e => updatePhase(pi, 'days', e.target.value)} style={{ ...inputStyle, fontSize: 13 }} />
                </div>
                <div style={{ flex: '0 0 80px' }}>
                  <label style={{ ...labelStyle, marginBottom: 4 }}>Color</label>
                  <input type="color" value={phase.color} onChange={e => updatePhase(pi, 'color', e.target.value)} style={{ width: '100%', height: 36, padding: 2, cursor: 'pointer' }} />
                </div>
              </div>
              <label style={{ ...labelStyle, marginBottom: 4 }}>Items</label>
              {phase.items.map((item, ii) => (
                <div key={ii} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ color: '#555', fontSize: 12 }}>→</span>
                  <input value={item} onChange={e => updatePhaseItem(pi, ii, e.target.value)} style={{ ...inputStyle, fontSize: 13 }} />
                  <button
                    onClick={() => removePhaseItem(pi, ii)}
                    style={{ background: 'none', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: 16, padding: '0 4px', flexShrink: 0 }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => addPhaseItem(pi)}
                style={{
                  background: 'rgba(255,255,255,0.04)', color: '#888', border: '1px dashed rgba(255,255,255,0.1)',
                  padding: '4px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", marginTop: 4,
                }}
              >
                + Add Item
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Final CTA Section</h3>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Headline</label>
            <input value={draft.finalHeadline} onChange={e => update('finalHeadline', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Subtext</label>
            <textarea value={draft.finalSubtext} onChange={e => update('finalSubtext', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
        </div>
      </div>

      {/* Save / Reset */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
        <button className="btn-primary" style={{ padding: '12px 28px' }} onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Landing Page'}
        </button>
        <button
          onClick={handleReset}
          style={{
            background: 'rgba(255,255,255,0.04)', color: '#888', border: '1px solid rgba(255,255,255,0.1)',
            padding: '12px 20px', borderRadius: 8, fontSize: 14, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}

function SocialProofTab({ active, nonAdmin, totalOffers, totalAnalyzed, totalAgents, retentionRate, dayDistribution }) {
  return (
    <div className="fade-up">
      <div className="card" style={{
        padding: 32, marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(233,69,96,0.08), rgba(83,52,131,0.08))',
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>📣 Social Proof Dashboard</h3>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          Copy-ready stats for social media and marketing.
        </p>
        <div className="social-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <SocialCard icon="🔥" stat={`${active.length} participants`} text="are currently active in the 30-Day First Deal Challenge" />
          <SocialCard icon="📝" stat={`${totalOffers} offers`} text="have been submitted by our challenge participants" />
          <SocialCard icon="📊" stat={`${totalAnalyzed} properties`} text="have been analyzed through the challenge so far" />
          <SocialCard icon="💪" stat={`${retentionRate}% retention`} text="of enrolled participants are still crushing it daily" />
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Today's Activity Summary</h3>
        <div className="mono" style={{
          fontSize: 13, color: '#bbb', lineHeight: 2,
          background: 'rgba(0,0,0,0.3)', padding: 20, borderRadius: 10,
          overflowX: 'auto',
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
      <div className="mono" style={{ fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 700, color: '#e94560', marginBottom: 4 }}>
        {stat}
      </div>
      <div style={{ fontSize: 13, color: '#888' }}>{text}</div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 8, padding: '6px 12px', textAlign: 'center', minWidth: 60,
    }}>
      <div className="mono" style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 9, color: '#555', marginTop: 1 }}>{label}</div>
    </div>
  );
}
