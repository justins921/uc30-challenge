import { useState, useEffect } from 'react';
import Header from './Header';
import ProgressBanner from './ProgressBanner';
import TimelineView from './TimelineView';
import DayView from './DayView';
import SubmissionsView from './SubmissionsView';
import StatsView from './StatsView';
import UserProfile from './UserProfile';
import { getGettingStartedContent } from '../data/challengeDays';
import Footer from './Footer';

const TABS = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'submissions', label: 'My Submissions' },
  { id: 'stats', label: 'My Stats' },
  { id: 'profile', label: 'Profile' },
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

export default function Dashboard({ user, onLogout, onSubmit, cohortStartDate, nextCohortDate, contentOverrides, liveCalls, customPhases, onUpdateProfile, onChangePassword, onSubmitTicket, onReplyToTicket, onUpdateTicket, supportTickets, cohortStats, onCompleteGettingStarted }) {
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

  const cohortActive = cohortStartDate && calendarDay !== null && calendarDay >= 1;

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
        {cohortActive && cohortStats && cohortStats.total > 0 && (
          <CohortStatsBanner active={cohortStats.active} total={cohortStats.total} />
        )}
        {cohortActive && (
          <ProgressBanner user={user} cohortStartDate={cohortStartDate} calendarDay={calendarDay} />
        )}

        {/* Cohort countdown when pre-cohort */}
        {cohortStartDate && !cohortActive && (tab === 'timeline' || tab === 'day') && (
          <CohortCountdown cohortStartDate={cohortStartDate} />
        )}

        {/* Countdown + Live Call — only on Timeline/Day views when cohort is active */}
        {cohortActive && (tab === 'timeline' || tab === 'day') && (
          <>
            {userCompletedToday && (
              <NextDayCountdown calendarDay={calendarDay} />
            )}
            <UpcomingCallBanner calls={liveCalls} />
          </>
        )}

        {/* Tab Content */}
        {tab === 'timeline' && (
          <TimelineView user={user} onSelectDay={handleSelectDay} calendarDay={calendarDay} contentOverrides={contentOverrides} customPhases={customPhases} cohortStartDate={cohortStartDate} />
        )}
        {tab === 'day' && selectedDay === 'getting_started' && (
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <button className="btn-secondary" onClick={handleBackToTimeline} style={{ marginBottom: 24, padding: '8px 20px', fontSize: 13 }}>
              ← Back to Timeline
            </button>
            <GettingStartedSection user={user} onComplete={async (...args) => { await onCompleteGettingStarted(...args); handleBackToTimeline(); }} contentOverrides={contentOverrides} />
          </div>
        )}
        {tab === 'day' && selectedDay && selectedDay !== 'getting_started' && (
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
        {tab === 'profile' && (
          <UserProfile
            user={user}
            onUpdateProfile={onUpdateProfile}
            onChangePassword={onChangePassword}
            onSubmitTicket={onSubmitTicket}
            onReplyToTicket={onReplyToTicket}
            onUpdateTicket={onUpdateTicket}
            supportTickets={supportTickets}
            onBack={() => handleTabChange('timeline')}
          />
        )}
      </div>
      <Footer />
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

// ── Active Participant Counter ────────────────────────────
function CohortStatsBanner({ active, total }) {
  return (
    <div className="fade-up" style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 20px', marginBottom: 16,
      background: 'rgba(233,69,96,0.06)', border: '1px solid rgba(233,69,96,0.12)',
      borderRadius: 12,
    }}>
      <div style={{
        width: 10, height: 10, borderRadius: '50%', background: '#48c78e',
        boxShadow: '0 0 6px rgba(72,199,142,0.5)',
      }} />
      <span style={{ fontSize: 14, color: '#ccc' }}>
        <strong style={{ color: '#e94560' }}>{active}</strong> of{' '}
        <strong>{total}</strong> participants still active
      </span>
    </div>
  );
}

// ── Social Platforms Config ───────────────────────────────
const SOCIAL_PLATFORMS = [
  { value: 'instagram', label: 'Instagram', placeholder: '@yourusername' },
  { value: 'tiktok', label: 'TikTok', placeholder: '@yourusername' },
  { value: 'twitter', label: 'X (Twitter)', placeholder: '@yourusername' },
  { value: 'facebook', label: 'Facebook', placeholder: 'Profile URL or name' },
  { value: 'youtube', label: 'YouTube', placeholder: 'Channel URL or name' },
];

function SocialHandlesInput({ handles, onChange }) {
  const usedPlatforms = handles.map(h => h.platform);
  const availablePlatforms = SOCIAL_PLATFORMS.filter(p => !usedPlatforms.includes(p.value));

  const updateHandle = (index, field, value) => {
    const updated = handles.map((h, i) => i === index ? { ...h, [field]: value } : h);
    onChange(updated);
  };

  const addHandle = () => {
    if (availablePlatforms.length === 0) return;
    onChange([...handles, { platform: availablePlatforms[0].value, handle: '' }]);
  };

  const removeHandle = (index) => {
    onChange(handles.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {handles.map((h, i) => {
        const platformInfo = SOCIAL_PLATFORMS.find(p => p.value === h.platform);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              value={h.platform}
              onChange={e => updateHandle(i, 'platform', e.target.value)}
              style={{ width: 140, fontSize: 13, padding: '8px 10px' }}
            >
              {SOCIAL_PLATFORMS
                .filter(p => p.value === h.platform || !usedPlatforms.includes(p.value))
                .map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
            </select>
            <input
              value={h.handle}
              onChange={e => updateHandle(i, 'handle', e.target.value)}
              placeholder={platformInfo?.placeholder || '@yourusername'}
              style={{ flex: 1 }}
            />
            {handles.length > 1 && (
              <button
                onClick={() => removeHandle(i)}
                style={{
                  background: 'none', border: 'none', color: '#e94560',
                  cursor: 'pointer', fontSize: 18, padding: '0 6px',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >×</button>
            )}
          </div>
        );
      })}
      {availablePlatforms.length > 0 && (
        <button
          onClick={addHandle}
          style={{
            alignSelf: 'flex-start', background: 'rgba(255,255,255,0.06)',
            border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 8,
            padding: '8px 16px', cursor: 'pointer', fontSize: 13, color: '#888',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          + Add another platform
        </button>
      )}
    </div>
  );
}

// Convert stored socialHandles object → array for SocialHandlesInput
function socialHandlesToArray(obj) {
  const entries = Object.entries(obj || {}).filter(([, v]) => v);
  if (entries.length > 0) return entries.map(([platform, handle]) => ({ platform, handle }));
  return [{ platform: 'instagram', handle: '' }];
}

// Convert array → object for storage
function socialHandlesToObject(arr) {
  const obj = {};
  arr.forEach(h => { if (h.handle.trim()) obj[h.platform] = h.handle.trim(); });
  return obj;
}

// ── Getting Started Section ──────────────────────────────
function GettingStartedSection({ user, onComplete, contentOverrides }) {
  const content = getGettingStartedContent(contentOverrides);
  const [handles, setHandles] = useState(() => socialHandlesToArray(user.socialHandles));
  const [proofText, setProofText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('File must be under 10 MB.'); return; }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setFileData(reader.result);
    reader.readAsDataURL(file);
  };

  const hasValidHandle = handles.some(h => h.handle.trim().length > 0);

  const handleComplete = async () => {
    if (!hasValidHandle) return;
    setSaving(true);
    const socialHandles = socialHandlesToObject(handles);
    const proof = (proofText.trim() || fileName) ? { text: proofText, fileName, fileData } : null;
    await onComplete(socialHandles, proof);
    setDone(true);
    setSaving(false);
  };

  if (done) {
    return (
      <div className="card scale-in" style={{ padding: 32, textAlign: 'center', marginBottom: 24, borderColor: 'rgba(72,199,142,0.3)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#48c78e' }}>Getting Started Complete!</h3>
        <p style={{ color: '#888', fontSize: 14, marginTop: 8 }}>You're all set. Day 1 is now unlocked.</p>
      </div>
    );
  }

  return (
    <div className="fade-up" style={{ marginBottom: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: 'rgba(233,69,96,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>🚀</div>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>{content.title}</h3>
          <div style={{ fontSize: 12, color: '#e94560', fontWeight: 600 }}>Required before Day 1</div>
        </div>
      </div>

      {/* Video */}
      <div className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
        {content.videoUrl ? (
          <div style={{ aspectRatio: '16/9' }}>
            <iframe
              src={content.videoUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; encrypted-media; gyroscope"
              allowFullScreen
            />
          </div>
        ) : (
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            aspectRatio: '16/9', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column', gap: 12,
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(233,69,96,0.2)', border: '2px solid rgba(233,69,96,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            }}>▶</div>
            <div style={{ fontSize: 13, color: '#888' }}>Getting Started Video</div>
            <div style={{ fontSize: 11, color: '#555' }}>Admin: Add video URL in Content tab</div>
          </div>
        )}
      </div>

      {/* Downloads */}
      {content.downloads && content.downloads.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>📥</span>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Resources</h3>
          </div>
          {content.downloads.map((dl, i) => (
            <a
              key={i}
              href={dl.url}
              target="_blank"
              rel="noopener"
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                color: '#e94560', textDecoration: 'none', fontSize: 14,
                marginBottom: i < content.downloads.length - 1 ? 8 : 0,
              }}
            >
              📎 {dl.name}
            </a>
          ))}
        </div>
      )}

      {/* Task Description */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: 'rgba(233,69,96,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>📋</div>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>What to Do</h3>
        </div>
        <p style={{ color: '#bbb', lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-line' }}>{content.taskDescription}</p>
      </div>

      {/* Transcript */}
      {content.transcript && (
        <details className="card" style={{ marginBottom: 20, cursor: 'pointer' }}>
          <summary style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>
            📝 Video Transcript
          </summary>
          <div style={{ color: '#888', fontSize: 14, lineHeight: 1.8, marginTop: 12 }}>
            {content.transcript}
          </div>
        </details>
      )}

      {/* Social Media Handles */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: 'rgba(83,52,131,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>📱</div>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Your Social Media</h3>
        </div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
          Add at least one handle. You can update these later in your Profile.
        </p>
        <SocialHandlesInput handles={handles} onChange={setHandles} />
      </div>

      {/* Proof Submission (optional) */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: 'rgba(233,69,96,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>📤</div>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Submit Your Proof</h3>
        </div>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>
          Optionally describe what you did or upload a screenshot.
        </p>
        <textarea
          value={proofText}
          onChange={e => setProofText(e.target.value)}
          placeholder="Describe what you did, paste links, or leave blank..."
          style={{ marginBottom: 12 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
            background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.15)',
            borderRadius: 10, cursor: 'pointer', fontSize: 14, color: '#888',
          }}>
            📎 {fileName || 'Attach File'}
            <input type="file" style={{ display: 'none' }} onChange={handleFileSelect} />
          </label>
          {fileName && <span style={{ fontSize: 13, color: '#48c78e' }}>✓ {fileName}</span>}
        </div>
      </div>

      {/* Submit */}
      <button
        className="btn-primary"
        style={{ width: '100%', padding: '14px 24px', fontSize: 16 }}
        onClick={handleComplete}
        disabled={saving || !hasValidHandle}
      >
        {saving ? 'Saving...' : 'Complete Getting Started →'}
      </button>
      {!hasValidHandle && (
        <p style={{ fontSize: 12, color: '#e94560', textAlign: 'center', marginTop: 8 }}>
          Enter at least one social media handle to continue
        </p>
      )}
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
