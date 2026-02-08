import { useState, useEffect } from 'react';
import Header from './Header';
import ProgressBanner from './ProgressBanner';
import ShareableStreakCard from './ShareableStreakCard';
import TimelineView from './TimelineView';
import DayView from './DayView';
import SubmissionsView from './SubmissionsView';
import StatsView from './StatsView';

const TABS = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'submissions', label: 'My Submissions' },
  { id: 'stats', label: 'My Stats' },
];

function getEasternDate() {
  // Get the current date in Eastern timezone
  const eastern = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
  return new Date(eastern);
}

function getCalendarDay(cohortStartDate) {
  if (!cohortStartDate) return null;
  // Days start at midnight Eastern
  const nowEastern = getEasternDate();
  const start = new Date(cohortStartDate + 'T00:00:00');
  const nowDay = new Date(nowEastern.getFullYear(), nowEastern.getMonth(), nowEastern.getDate());
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const diffMs = nowDay - startDay;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

function getNextMidnightEastern() {
  // Calculate the real Date object for the next midnight Eastern
  const nowEastern = getEasternDate();
  const tomorrowEastern = new Date(nowEastern.getFullYear(), nowEastern.getMonth(), nowEastern.getDate() + 1);
  // Difference in ms between "now in Eastern" and "tomorrow midnight Eastern"
  const msUntilMidnightEastern = tomorrowEastern - nowEastern;
  // Apply that offset to real Date.now()
  return new Date(Date.now() + msUntilMidnightEastern);
}

function getPacificDeadline() {
  // Get today's date in Pacific timezone, then set to 11:59 PM
  const pacific = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  const nowPacific = new Date(pacific);
  const deadlinePacific = new Date(nowPacific.getFullYear(), nowPacific.getMonth(), nowPacific.getDate(), 23, 59, 0);
  const msUntilDeadline = deadlinePacific - nowPacific;
  return new Date(Date.now() + msUntilDeadline);
}

function getTimeLeft(targetDate) {
  const now = new Date();
  const diff = targetDate - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

export default function Dashboard({ user, onLogout, onSubmit, cohortStartDate, nextCohortDate, contentOverrides, liveCalls, customPhases }) {
  const [tab, setTab] = useState('timeline');
  const [selectedDay, setSelectedDay] = useState(null);

  const calendarDay = getCalendarDay(cohortStartDate);

  // Removed/paused state
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
          </p>
          {nextCohortDate ? (
            <NextCohortCountdown nextCohortDate={nextCohortDate} />
          ) : (
            <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
              Contact your administrator for information about the next cohort.
            </p>
          )}
          <button className="btn-secondary" onClick={onLogout}>Log Out</button>
        </div>
      </div>
    );
  }

  // Cohort hasn't started yet
  if (cohortStartDate && calendarDay < 1) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Header
          user={user}
          currentTab="timeline"
          onTabChange={() => {}}
          tabs={TABS}
          onLogout={onLogout}
        />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 24px' }}>
          <CohortCountdown cohortStartDate={cohortStartDate} />
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

  // Determine if user has already completed today's task (cohort mode)
  const userCompletedToday = cohortStartDate && calendarDay !== null && calendarDay >= 1
    && user.currentDay > calendarDay;

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
        <ProgressBanner user={user} cohortStartDate={cohortStartDate} calendarDay={calendarDay} />

        {/* Shareable streak card for Instagram */}
        <ShareableStreakCard user={user} calendarDay={calendarDay} />

        {/* Countdown banner if user completed today's task */}
        {userCompletedToday && (
          <NextDayCountdown calendarDay={calendarDay} />
        )}

        {/* Upcoming Live Call */}
        <UpcomingCallBanner calls={liveCalls} />

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
          <TimelineView user={user} onSelectDay={handleSelectDay} calendarDay={calendarDay} contentOverrides={contentOverrides} customPhases={customPhases} />
        )}
        {tab === 'day' && selectedDay && (
          <DayView
            day={selectedDay}
            user={user}
            onSubmit={onSubmit}
            onBack={handleBackToTimeline}
            contentOverrides={contentOverrides}
            customPhases={customPhases}
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

// ── Upcoming Live Call Banner ────────────────────────────────
function UpcomingCallBanner({ calls }) {
  const upcoming = (calls || [])
    .filter(c => new Date(c.dateTime) > new Date())
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  if (upcoming.length === 0) return null;

  const next = upcoming[0];
  const callDate = new Date(next.dateTime);
  const formatted = callDate.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  });

  return (
    <div className="fade-up-delay-1" style={{
      background: 'rgba(83,52,131,0.12)', border: '1px solid rgba(83,52,131,0.25)',
      borderRadius: 12, padding: '14px 20px', marginBottom: 20,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>📹</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#c9a0ff' }}>{next.title}</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{formatted}</div>
        </div>
      </div>
      <a
        href={next.link}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: 'rgba(83,52,131,0.3)', color: '#c9a0ff', border: '1px solid rgba(83,52,131,0.4)',
          padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Join Call
      </a>
    </div>
  );
}

// ── Countdown: Cohort hasn't started ────────────────────────
function CohortCountdown({ cohortStartDate }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const update = () => {
      // Calculate time until cohort start date at midnight Eastern
      const nowEastern = getEasternDate();
      const start = new Date(cohortStartDate + 'T00:00:00');
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const msUntilStart = startDay - nowEastern;
      const target = new Date(Date.now() + msUntilStart);
      setTimeLeft(getTimeLeft(target));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [cohortStartDate]);

  const formatDate = new Date(cohortStartDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="fade-up" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🚀</div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        Your Cohort is Starting Soon
      </h1>
      <p style={{ color: '#888', fontSize: 15, marginBottom: 32 }}>
        The 30-Day First Deal Challenge begins on
      </p>
      <div style={{ fontSize: 18, fontWeight: 600, color: '#e94560', marginBottom: 32 }}>
        {formatDate}
      </div>

      {timeLeft && (
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32,
          flexWrap: 'wrap',
        }}>
          <CountdownUnit value={timeLeft.days} label="Days" />
          <CountdownUnit value={timeLeft.hours} label="Hours" />
          <CountdownUnit value={timeLeft.minutes} label="Minutes" />
          <CountdownUnit value={timeLeft.seconds} label="Seconds" />
        </div>
      )}

      <div className="card" style={{ padding: 24, textAlign: 'left', maxWidth: 400, margin: '0 auto' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>While you wait:</h3>
        <ul style={{ color: '#888', fontSize: 14, lineHeight: 2, listStyle: 'none', padding: 0 }}>
          <li>✅ Review the challenge overview</li>
          <li>✅ Set up your deal-finding tools</li>
          <li>✅ Research your target market</li>
          <li>✅ Get ready to take action on Day 1</li>
        </ul>
      </div>
    </div>
  );
}

// ── Countdown: Next day unlock ──────────────────────────────
function NextDayCountdown({ calendarDay }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [deadlineLeft, setDeadlineLeft] = useState(null);

  useEffect(() => {
    const update = () => {
      // Next day unlocks at midnight Eastern
      setTimeLeft(getTimeLeft(getNextMidnightEastern()));
      // Today's submission deadline is 11:59 PM Pacific
      setDeadlineLeft(getTimeLeft(getPacificDeadline()));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [calendarDay]);

  const isPost30 = calendarDay > 30;

  return (
    <div className="fade-up" style={{
      marginBottom: 24, padding: '20px 24px',
      background: isPost30
        ? 'linear-gradient(135deg, rgba(240,165,0,0.08), rgba(240,165,0,0.02))'
        : 'linear-gradient(135deg, rgba(72,199,142,0.08), rgba(72,199,142,0.02))',
      border: `1px solid ${isPost30 ? 'rgba(240,165,0,0.15)' : 'rgba(72,199,142,0.15)'}`,
      borderRadius: 16, textAlign: 'center',
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: isPost30 ? '#f0a500' : '#48c78e', marginBottom: 8 }}>
        {isPost30 ? 'Today\'s Task Complete!' : `Day ${calendarDay} Complete!`}
      </div>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>
        {isPost30 ? 'Next daily task available at midnight ET' : `Day ${calendarDay + 1} unlocks at midnight ET`}
      </div>
      {timeLeft && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <MiniCountdown value={timeLeft.hours} label="hr" />
          <MiniCountdown value={timeLeft.minutes} label="min" />
          <MiniCountdown value={timeLeft.seconds} label="sec" />
        </div>
      )}
      {deadlineLeft && !isPost30 && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
          Submission deadline: 11:59 PM PT ({deadlineLeft.hours}h {deadlineLeft.minutes}m remaining)
        </div>
      )}
    </div>
  );
}

function CountdownUnit({ value, label }) {
  return (
    <div className="card" style={{ padding: '20px 24px', textAlign: 'center', minWidth: 80 }}>
      <div className="mono" style={{ fontSize: 36, fontWeight: 700, color: '#e94560' }}>
        {String(value).padStart(2, '0')}
      </div>
      <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function MiniCountdown({ value, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: '#48c78e' }}>
        {String(value).padStart(2, '0')}
      </span>
      <span style={{ fontSize: 11, color: '#666', marginLeft: 2 }}>{label}</span>
    </div>
  );
}

// ── Countdown: Next cohort for removed users ────────────────
function NextCohortCountdown({ nextCohortDate }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const update = () => {
      const nowEastern = getEasternDate();
      const start = new Date(nextCohortDate + 'T00:00:00');
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const msUntilStart = startDay - nowEastern;
      const target = new Date(Date.now() + msUntilStart);
      setTimeLeft(getTimeLeft(target));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [nextCohortDate]);

  const formatDate = new Date(nextCohortDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        padding: '24px 20px', borderRadius: 16,
        background: 'linear-gradient(135deg, rgba(233,69,96,0.06), rgba(240,165,0,0.06))',
        border: '1px solid rgba(240,165,0,0.15)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#f0a500', marginBottom: 8 }}>
          Next Cohort Starts
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
          {formatDate}
        </div>

        {timeLeft ? (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            {timeLeft.days > 0 && (
              <div style={{ textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#f0a500' }}>
                  {String(timeLeft.days).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 10, color: '#666' }}>Days</div>
              </div>
            )}
            <div style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#f0a500' }}>
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div style={{ fontSize: 10, color: '#666' }}>Hours</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#f0a500' }}>
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div style={{ fontSize: 10, color: '#666' }}>Min</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#f0a500' }}>
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div style={{ fontSize: 10, color: '#666' }}>Sec</div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 15, fontWeight: 600, color: '#48c78e' }}>
            The next cohort is starting now!
          </div>
        )}
      </div>
    </div>
  );
}
