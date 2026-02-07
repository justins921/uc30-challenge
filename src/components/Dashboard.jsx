import { useState } from 'react';
import Header from './Header';
import ProgressBanner from './ProgressBanner';
import TimelineView from './TimelineView';
import DayView from './DayView';
import SubmissionsView from './SubmissionsView';
import StatsView from './StatsView';

const TABS = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'submissions', label: 'My Submissions' },
  { id: 'stats', label: 'My Stats' },
];

export default function Dashboard({ user, onLogout, onSubmit, onReactivate }) {
  const [tab, setTab] = useState('timeline');
  const [selectedDay, setSelectedDay] = useState(null);

  // Removed state
  if (!user.isActive) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 20,
      }}>
        <div className="card fade-up" style={{ maxWidth: 500, textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏸️</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Challenge Paused</h2>
          <p style={{ color: '#888', lineHeight: 1.7, marginBottom: 24 }}>
            You missed a daily submission and were removed from this run.
            You can rejoin a future run within your one-year access window.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={onReactivate}>
              Rejoin Challenge (Reset)
            </button>
            <button className="btn-secondary" onClick={onLogout}>Log Out</button>
          </div>
        </div>
      </div>
    );
  }

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSelectedDay(null);
  };

  const handleSelectDay = (day) => {
    setSelectedDay(day);
    setTab('day');
  };

  const handleBackToTimeline = () => {
    setSelectedDay(null);
    setTab('timeline');
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        user={user}
        currentTab={tab === 'day' ? 'timeline' : tab}
        onTabChange={handleTabChange}
        tabs={TABS}
        onLogout={onLogout}
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        <ProgressBanner user={user} />

        {/* Quick Stats */}
        <div className="fade-up-delay-1 stats-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32,
        }}>
          <QuickStat icon="📊" value={user.metrics.propertiesAnalyzed} label="Properties Analyzed" />
          <QuickStat icon="📝" value={user.metrics.offersSubmitted} label="Offers Submitted" />
          <QuickStat icon="🤝" value={user.metrics.agentsContacted} label="Agents Contacted" />
        </div>

        {/* Tab Content */}
        {tab === 'timeline' && (
          <TimelineView user={user} onSelectDay={handleSelectDay} />
        )}
        {tab === 'day' && selectedDay && (
          <DayView
            day={selectedDay}
            user={user}
            onSubmit={onSubmit}
            onBack={handleBackToTimeline}
          />
        )}
        {tab === 'submissions' && <SubmissionsView user={user} />}
        {tab === 'stats' && <StatsView user={user} />}
      </div>
    </div>
  );
}

function QuickStat({ icon, value, label }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 20 }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div className="mono" style={{ fontSize: 32, fontWeight: 700, color: '#e94560' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{label}</div>
    </div>
  );
}
