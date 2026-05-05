import { useState, useEffect } from 'react';
import Header from './Header';
import ProgressBanner from './ProgressBanner';
import TimelineView from './TimelineView';
import DayView from './DayView';
import SubmissionsView from './SubmissionsView';
import StatsView from './StatsView';
import Leaderboard from './Leaderboard';
import UserProfile, { UserSupport } from './UserProfile';
import { getGettingStartedContent } from '../data/challengeDays';
import { calculateUCPoints } from '../data/ucPoints';
import { COMPLIANCE_METRICS, DEFAULT_DAILY_MINIMUMS as COMP_DAILY_DEFAULTS, DEFAULT_WEEKLY_MINIMUMS, DEFAULT_ENFORCEMENT, checkWeeklyCompliance, getWeekNumber, getWeekRange, getWeekDayCount, calculateAtRisk, getTimeUntilDeadline } from '../data/compliance';
import CommunityBoard from './CommunityBoard';
import ContactsCRM from './ContactsCRM';
import Footer from './Footer';

const TABS = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'crm', label: 'Contacts' },
  { id: 'community', label: 'Community' },
  { id: 'submissions', label: 'My Submissions' },
  { id: 'stats', label: 'Operator Stats' },
  { id: 'support', label: 'Support' },
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

export default function Dashboard({ user, onLogout, onSubmit, cohortStartDate, nextCohortDate, contentOverrides, liveCalls, customPhases, onUpdateProfile, onChangePassword, onSubmitTicket, onReplyToTicket, onUpdateTicket, supportTickets, cohortStats, onCompleteGettingStarted, communityPosts, onCreateCommunityPost, onCommentOnPost, onDeleteCommunityPost, onDeleteCommunityComment, onPinCommunityPost, onDismissCommunityWarning, participants, dailyMinimumsOverrides, skoolLink, onAddContact, onAddFollowUp, onUploadFile, getContacts, getFollowUps, getFollowUpsByContact, getUploadUrl, contacts, complianceSettings, getDailySubmission, getQuizAttempts, addQuizAttempt }) {
  const [tab, setTab] = useState('timeline');
  const [selectedDay, setSelectedDay] = useState(null);
  const [existingDailySubmission, setExistingDailySubmission] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState([]);

  const calendarDay = getCalendarDay(cohortStartDate);

  useEffect(() => {
    if (!getDailySubmission || !user?.id || !calendarDay || calendarDay < 1) return;
    (async () => {
      const sub = await getDailySubmission(user.id, calendarDay);
      setExistingDailySubmission(sub || null);
    })();
  }, [calendarDay, user?.id, user?.currentDay]);

  useEffect(() => {
    if (!getQuizAttempts || !user?.id || !selectedDay) { setQuizAttempts([]); return; }
    (async () => {
      const attempts = await getQuizAttempts(user.id, selectedDay);
      setQuizAttempts(attempts || []);
    })();
  }, [selectedDay, user?.id]);

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
          {/* Motivation Reminder */}
          {(user.stakesDeclaration || user.theirWhy) && (
            <div style={{
              padding: '16px 20px', borderRadius: 12, marginBottom: 24,
              background: 'rgba(233,69,96,0.04)', border: '1px solid rgba(233,69,96,0.12)',
              textAlign: 'left',
            }}>
              <div style={{ fontSize: 12, color: '#e94560', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                You wrote this during activation
              </div>
              {user.stakesDeclaration && (
                <p style={{ fontSize: 14, color: '#ccc', lineHeight: 1.7, margin: '0 0 10px', fontStyle: 'italic' }}>
                  "{user.stakesDeclaration}"
                </p>
              )}
              {user.theirWhy && (
                <p style={{ fontSize: 14, color: '#48c78e', lineHeight: 1.7, margin: '0 0 10px', fontStyle: 'italic' }}>
                  "{user.theirWhy}"
                </p>
              )}
              <p style={{ fontSize: 13, color: '#888', marginTop: 4, marginBottom: 0 }}>
                Come back stronger in the next cohort.
              </p>
            </div>
          )}
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

  // Community notification: show dot when there are posts/comments newer than last visit
  const [communityLastSeen, setCommunityLastSeen] = useState(() => {
    try { return localStorage.getItem('uc30_community_last_seen') || ''; } catch { return ''; }
  });

  const hasCommunityNotification = cohortActive && (communityPosts || []).some(p => {
    if (p.isDeleted) return false;
    if (p.createdAt > communityLastSeen) return true;
    return (p.comments || []).some(c => !c.isDeleted && c.createdAt > communityLastSeen);
  });

  // Support notification: show dot when any of user's tickets has an admin response newer than last seen
  const [supportLastSeen, setSupportLastSeen] = useState(() => {
    try { return localStorage.getItem('uc30_support_last_seen') || ''; } catch { return ''; }
  });

  const hasSupportNotification = (supportTickets || [])
    .filter(t => t.participantId === user.id)
    .some(t => {
      const msgs = t.messages || [];
      return msgs.some(m => m.from === 'admin' && m.createdAt > supportLastSeen);
    });

  const handleTabChange = (newTab) => {
    if (newTab === 'community') {
      const now = new Date().toISOString();
      setCommunityLastSeen(now);
      try { localStorage.setItem('uc30_community_last_seen', now); } catch {}
    }
    if (newTab === 'support') {
      const now = new Date().toISOString();
      setSupportLastSeen(now);
      try { localStorage.setItem('uc30_support_last_seen', now); } catch {}
    }
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
        tabs={(cohortActive ? TABS : TABS.filter(t => t.id !== 'community')).map(t => {
          if (t.id === 'community' && hasCommunityNotification && tab !== 'community') return { ...t, hasNotification: true };
          if (t.id === 'support' && hasSupportNotification && tab !== 'support') return { ...t, hasNotification: true };
          return t;
        })}
        onLogout={onLogout}
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        {/* UC Points Score */}
        {(tab === 'timeline' || tab === 'day') && (
          <UCPointsBanner ucPoints={user.ucPoints || calculateUCPoints(user.metrics)} />
        )}

        {cohortActive && cohortStats && cohortStats.total > 0 && (
          <CohortStatsBanner active={cohortStats.active} total={cohortStats.total} />
        )}
        {cohortActive && (tab === 'timeline' || tab === 'day') && (
          <ProgressBanner user={user} cohortStartDate={cohortStartDate} calendarDay={calendarDay} />
        )}

        {/* Motivation nudge when user hasn't submitted today */}
        {cohortActive && !userCompletedToday && (user.stakesDeclaration || user.theirWhy) && (tab === 'timeline' || tab === 'day') && (
          <div className="fade-up" style={{
            padding: '12px 18px', borderRadius: 12, marginBottom: 16,
            background: 'linear-gradient(135deg, rgba(233,69,96,0.04), rgba(72,199,142,0.04))',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>*</span>
            <p style={{ fontSize: 13, color: '#999', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
              "{user.theirWhy || user.stakesDeclaration}"
            </p>
          </div>
        )}

        {/* Compliance Cards */}
        {cohortActive && (tab === 'timeline' || tab === 'day') && complianceSettings && (
          <ComplianceCards
            calendarDay={calendarDay}
            existingDailySubmission={existingDailySubmission}
            complianceSettings={complianceSettings}
            user={user}
          />
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
            dailyMinimumsOverrides={dailyMinimumsOverrides}
            onAddContact={onAddContact}
            onAddFollowUp={onAddFollowUp}
            onUploadFile={onUploadFile}
            contacts={contacts}
            getUploadUrl={getUploadUrl}
            complianceSettings={complianceSettings}
            existingDailySubmission={existingDailySubmission}
            quizAttempts={quizAttempts}
            onQuizAttempt={async (attempt) => {
              await addQuizAttempt(attempt);
              const updated = await getQuizAttempts(user.id, selectedDay);
              setQuizAttempts(updated || []);
            }}
          />
        )}
        {tab === 'community' && (
          <CommunityBoard
            user={user}
            posts={communityPosts}
            cohortStartDate={cohortStartDate}
            onCreatePost={onCreateCommunityPost}
            onComment={onCommentOnPost}
            onDeletePost={onDeleteCommunityPost}
            onDeleteComment={onDeleteCommunityComment}
            onPin={onPinCommunityPost}
            onDismissWarning={onDismissCommunityWarning}
          />
        )}
        {tab === 'leaderboard' && (
          <Leaderboard participants={participants || []} currentUserId={user.id} />
        )}
        {tab === 'crm' && (
          <ContactsCRM
            user={user}
            getContacts={getContacts}
            getFollowUpsByContact={getFollowUpsByContact}
          />
        )}
        {tab === 'submissions' && <SubmissionsView user={user} />}
        {tab === 'stats' && <StatsView user={user} />}
        {tab === 'support' && (
          <UserSupport
            user={user}
            onSubmitTicket={onSubmitTicket}
            onReplyToTicket={onReplyToTicket}
            onUpdateTicket={onUpdateTicket}
            supportTickets={supportTickets}
          />
        )}
        {tab === 'profile' && (
          <UserProfile
            user={user}
            onUpdateProfile={onUpdateProfile}
            onChangePassword={onChangePassword}
            onBack={() => handleTabChange('timeline')}
            skoolLink={skoolLink}
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
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>You're activated. Use this time to:</h3>
        <ul style={{ color: '#888', fontSize: 14, lineHeight: 2, listStyle: 'none', padding: 0 }}>
          <li>✅ Complete the Getting Started section</li>
          <li>✅ Set up your deal-finding tools</li>
          <li>✅ Research properties in your target area</li>
          <li>✅ Get ready to submit offers on Day 1</li>
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
        You are 1 of <strong style={{ color: '#e94560' }}>{active}</strong> participants still active
      </span>
    </div>
  );
}

// ── UC Points Banner ─────────────────────────────────────
function UCPointsBanner({ ucPoints }) {
  return (
    <div className="fade-up" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px', marginBottom: 16,
      background: 'linear-gradient(135deg, rgba(240,165,0,0.08), rgba(240,165,0,0.02))',
      border: '1px solid rgba(240,165,0,0.15)',
      borderRadius: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 12, color: '#f0a500', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>
          UC Points
        </div>
      </div>
      <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#f0a500' }}>
        {ucPoints.toLocaleString()}
      </div>
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

// ── Buy Box Constants ────────────────────────────────────
const PROPERTY_TYPES = ['SFR', 'Multifamily', 'Commercial', 'Land', 'Mixed-Use'];
const STRATEGIES = ['Flip', 'BRRRR', 'Buy & Hold Rental', 'Wholesale', 'Subject-To', 'Seller Finance'];

// ── Getting Started Section ──────────────────────────────
function GettingStartedSection({ user, onComplete, contentOverrides }) {
  const content = getGettingStartedContent(contentOverrides);
  const [handles, setHandles] = useState(() => socialHandlesToArray(user.socialHandles));
  const [proofText, setProofText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // Buy Box state
  const existingBuyBox = user.buyBox || {};
  const [markets, setMarkets] = useState(() => (existingBuyBox.markets || []).join(', '));
  const [propertyTypes, setPropertyTypes] = useState(() => existingBuyBox.propertyTypes || []);
  const [priceMin, setPriceMin] = useState(() => existingBuyBox.priceMin ? String(existingBuyBox.priceMin) : '');
  const [priceMax, setPriceMax] = useState(() => existingBuyBox.priceMax ? String(existingBuyBox.priceMax) : '');
  const [strategy, setStrategy] = useState(() => existingBuyBox.strategy || '');
  const [targetReturns, setTargetReturns] = useState(() => existingBuyBox.targetReturns || '');

  // Activation state (offer commitment, stakes, commitment)
  const [offerCommitment, setOfferCommitment] = useState(() => user.offerCommitment ? String(user.offerCommitment) : '');
  const [stakesDeclaration, setStakesDeclaration] = useState(() => user.stakesDeclaration || '');
  const [committed, setCommitted] = useState(false);

  const togglePropertyType = (pt) => {
    setPropertyTypes(prev =>
      prev.includes(pt) ? prev.filter(t => t !== pt) : [...prev, pt]
    );
  };

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
  const hasValidOffer = offerCommitment && parseInt(offerCommitment) > 0;

  const handleComplete = async () => {
    if (!hasValidHandle || !markets.trim() || !hasValidOffer || !stakesDeclaration.trim() || !committed) return;
    setSaving(true);
    const socialHandles = socialHandlesToObject(handles);
    const proof = (proofText.trim() || fileName) ? { text: proofText, fileName, fileData } : null;
    const buyBox = {
      markets: markets.split(',').map(m => m.trim()).filter(Boolean),
      propertyTypes,
      priceMin: parseInt(priceMin) || 0,
      priceMax: parseInt(priceMax) || 0,
      strategy,
      targetReturns: targetReturns.trim() || null,
    };
    const activationData = {
      offerCommitment: parseInt(offerCommitment) || 0,
      stakesDeclaration: stakesDeclaration.trim(),
      commitmentDeclaredAt: new Date().toISOString(),
    };
    await onComplete(socialHandles, proof, buyBox, activationData);
    setDone(true);
    setSaving(false);
  };

  if (done) {
    return (
      <div className="card scale-in" style={{ padding: 32, textAlign: 'center', marginBottom: 24, borderColor: 'rgba(72,199,142,0.3)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#48c78e' }}>You're Activated!</h3>
        <p style={{ color: '#888', fontSize: 14, marginTop: 8 }}>You're all set. Day 1 is now unlocked.</p>
      </div>
    );
  }

  // Validation summary
  const missingFields = [];
  if (!markets.trim()) missingFields.push('target market(s)');
  if (!hasValidHandle) missingFields.push('at least one social media handle');
  if (!hasValidOffer) missingFields.push('offer target');
  if (!stakesDeclaration.trim()) missingFields.push('stakes declaration');
  if (!committed) missingFields.push('commitment confirmation');

  return (
    <div className="fade-up" style={{ marginBottom: 24 }}>
      {/* Welcome Header */}
      <div className="card" style={{ textAlign: 'center', padding: '36px 28px', marginBottom: 20 }}>
        <div className="mono" style={{ fontSize: 36, fontWeight: 700, color: '#e94560', marginBottom: 12 }}>
          UC30
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10, lineHeight: 1.3 }}>
          Welcome, {user.firstName || 'Operator'}.
        </h1>
        <p style={{ color: '#aaa', fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
          You've made the decision. Now let's make sure you're ready to execute.
        </p>
        <p style={{ color: '#666', fontSize: 13, lineHeight: 1.6 }}>
          Complete everything below to activate your challenge and unlock Day 1.
        </p>
      </div>

      {/* Section Header */}
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

      {/* Buy Box Setup */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: 'rgba(233,69,96,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>🎯</div>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Define Your Buy Box</h3>
        </div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
          Set your investment criteria so you're ready to act on Day 1. You can update this later.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Target Markets */}
          <div>
            <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 6, fontWeight: 600 }}>
              Target Market(s) <span style={{ color: '#e94560' }}>*</span>
            </label>
            <input
              value={markets}
              onChange={e => setMarkets(e.target.value)}
              placeholder="e.g. Austin TX, San Antonio TX, Dallas TX"
              style={{ width: '100%', fontSize: 14, padding: '12px 14px' }}
            />
            <p style={{ fontSize: 11, color: '#555', marginTop: 4 }}>
              Separate multiple markets with commas
            </p>
          </div>

          {/* Property Types */}
          <div>
            <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 6, fontWeight: 600 }}>
              Property Type(s)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PROPERTY_TYPES.map(pt => {
                const selected = propertyTypes.includes(pt);
                return (
                  <button
                    key={pt}
                    onClick={() => togglePropertyType(pt)}
                    style={{
                      padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                      background: selected ? 'rgba(233,69,96,0.15)' : 'rgba(255,255,255,0.04)',
                      color: selected ? '#e94560' : '#888',
                      border: selected ? '1px solid rgba(233,69,96,0.3)' : '1px solid rgba(255,255,255,0.08)',
                      fontFamily: "'DM Sans', sans-serif", fontWeight: selected ? 600 : 400,
                      transition: 'all 0.2s',
                    }}
                  >
                    {selected && '+ '}{pt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                Min Price ($)
              </label>
              <input
                type="number"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
                placeholder="50,000"
                style={{ width: '100%', fontSize: 14, padding: '12px 14px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                Max Price ($)
              </label>
              <input
                type="number"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                placeholder="300,000"
                style={{ width: '100%', fontSize: 14, padding: '12px 14px' }}
              />
            </div>
          </div>

          {/* Strategy */}
          <div>
            <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 6, fontWeight: 600 }}>
              Strategy
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {STRATEGIES.map(s => (
                <button
                  key={s}
                  onClick={() => setStrategy(s)}
                  style={{
                    padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                    background: strategy === s ? 'rgba(83,52,131,0.15)' : 'rgba(255,255,255,0.04)',
                    color: strategy === s ? '#c9a0ff' : '#888',
                    border: strategy === s ? '1px solid rgba(83,52,131,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    fontFamily: "'DM Sans', sans-serif", fontWeight: strategy === s ? 600 : 400,
                    transition: 'all 0.2s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Target Returns */}
          <div>
            <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 6, fontWeight: 600 }}>
              Target Returns / Cash Flow Goals <span style={{ color: '#555', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              value={targetReturns}
              onChange={e => setTargetReturns(e.target.value)}
              placeholder="e.g. $500/mo cash flow, 20% ROI, $30k profit per flip"
              style={{ width: '100%', fontSize: 14, padding: '12px 14px' }}
            />
          </div>
        </div>
      </div>

      {/* Offer Target */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: 'rgba(240,165,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>📊</div>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Set Your Offer Target</h3>
        </div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
          How many offers will you commit to submitting during your 30-day sprint?
        </p>

        <div style={{
          padding: 16, borderRadius: 12,
          background: 'rgba(240,165,0,0.04)', border: '1px solid rgba(240,165,0,0.15)',
          marginBottom: 20,
        }}>
          <p style={{ color: '#f0a500', fontSize: 13, fontWeight: 600, margin: 0 }}>
            Top operators commit to 50+ offers in 30 days. The more you submit, the higher your chances of closing.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <input
            type="number"
            min="1"
            value={offerCommitment}
            onChange={e => setOfferCommitment(e.target.value)}
            placeholder="50"
            style={{
              width: 120, fontSize: 32, fontWeight: 700, textAlign: 'center',
              padding: '12px 16px', borderRadius: 12,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
            }}
          />
          <span style={{ fontSize: 16, color: '#888', fontWeight: 600 }}>offers in 30 days</span>
        </div>

        {hasValidOffer && (
          <p style={{ fontSize: 13, color: '#666', marginTop: 12, marginBottom: 0 }}>
            That's roughly <strong style={{ color: '#ccc' }}>
              {Math.ceil(parseInt(offerCommitment) / 30)} offers per day
            </strong>. You've got this.
          </p>
        )}
      </div>

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

      {/* Stakes Declaration */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: 'rgba(233,69,96,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>🔥</div>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Declare Your Stakes</h3>
        </div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>
          What will it cost you if you DON'T complete UC30?
        </p>
        <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6, marginBottom: 16 }}>
          Write out what you lose by not following through.
          We'll show this back to you on tough days as a reminder of why you started.
        </p>
        <textarea
          value={stakesDeclaration}
          onChange={e => setStakesDeclaration(e.target.value)}
          placeholder={"What happens if you quit? What stays the same? What opportunity do you lose?\n\nExample: \"If I don't finish UC30, I'll waste another year talking about real estate instead of doing it. My family won't see me step up. I'll still be stuck wondering 'what if' while other operators are closing deals.\""}
          rows={5}
          style={{
            width: '100%', padding: '14px 16px', fontSize: 14, borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
            color: '#eee', resize: 'vertical', fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.7, boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Commitment Confirmation */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: 'rgba(72,199,142,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>✊</div>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Confirm Your Commitment</h3>
        </div>

        <div style={{
          padding: 16, borderRadius: 12,
          background: 'rgba(233,69,96,0.04)', border: '1px solid rgba(233,69,96,0.15)',
          marginBottom: 20,
        }}>
          <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.8, margin: 0, fontStyle: 'italic' }}>
            "I commit to completing all daily standards for 30 consecutive days.
            I understand that if I fall behind, I will restart with the next cohort.
            I am ready to execute."
          </p>
        </div>

        <label
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px 18px',
            background: committed ? 'rgba(72,199,142,0.06)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${committed ? 'rgba(72,199,142,0.2)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 12, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <input
            type="checkbox"
            checked={committed}
            onChange={e => setCommitted(e.target.checked)}
            style={{ marginTop: 3, accentColor: '#48c78e', width: 20, height: 20, cursor: 'pointer' }}
          />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: committed ? '#48c78e' : '#ccc' }}>
              I Commit
            </div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
              I'm ready to execute for 30 consecutive days
            </div>
          </div>
        </label>
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
        style={{ width: '100%', padding: '14px 24px', fontSize: 16, opacity: missingFields.length > 0 ? 0.5 : 1 }}
        onClick={handleComplete}
        disabled={saving || missingFields.length > 0}
      >
        {saving ? 'Activating...' : 'Activate & Start UC30'}
      </button>
      {missingFields.length > 0 && (
        <p style={{ fontSize: 12, color: '#e94560', textAlign: 'center', marginTop: 8 }}>
          Complete the following to continue: {missingFields.join(', ')}
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

// ── Compliance Cards (Participant Dashboard) ───────────────
function ComplianceCards({ calendarDay, existingDailySubmission, complianceSettings, user }) {
  const dailyMins = { ...COMP_DAILY_DEFAULTS, ...complianceSettings?.dailyMinimums };
  const weeklyMins = { ...DEFAULT_WEEKLY_MINIMUMS, ...complianceSettings?.weeklyMinimums };
  const enforcement = { ...DEFAULT_ENFORCEMENT, ...complianceSettings?.enforcement };

  const currentDay = Math.max(1, Math.min(calendarDay || 1, 30));
  const currentWeek = getWeekNumber(currentDay);
  const { start: weekStart } = getWeekRange(currentWeek);
  const dayInWeek = currentDay - weekStart + 1;
  const totalDaysInWeek = getWeekDayCount(currentWeek);

  const [deadlineMs, setDeadlineMs] = useState(() => getTimeUntilDeadline(enforcement));

  useEffect(() => {
    const timer = setInterval(() => setDeadlineMs(getTimeUntilDeadline(enforcement)), 1000);
    return () => clearInterval(timer);
  }, [enforcement.timezone, enforcement.daily_deadline_hour]);

  const hours = Math.floor(deadlineMs / (1000 * 60 * 60));
  const minutes = Math.floor((deadlineMs % (1000 * 60 * 60)) / (1000 * 60));
  const deadlineUrgent = hours < 2;

  const todaySubmitted = !!existingDailySubmission;
  const todayMet = existingDailySubmission?.met_daily_minimum ?? null;

  return (
    <div className="fade-up" style={{ marginBottom: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {/* Daily Status */}
        <div style={{
          padding: '14px 18px', borderRadius: 12,
          background: todaySubmitted
            ? (todayMet ? 'rgba(72,199,142,0.06)' : 'rgba(233,69,96,0.06)')
            : 'rgba(255,255,255,0.03)',
          border: `1px solid ${todaySubmitted ? (todayMet ? 'rgba(72,199,142,0.15)' : 'rgba(233,69,96,0.15)') : 'rgba(255,255,255,0.08)'}`,
        }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            Day {currentDay} Status
          </div>
          {todaySubmitted ? (
            <div style={{ fontSize: 14, fontWeight: 600, color: todayMet ? '#48c78e' : '#e94560' }}>
              {todayMet ? 'Submitted & Met Minimums' : 'Submitted — Below Minimums'}
            </div>
          ) : (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, color: deadlineUrgent ? '#e94560' : '#f0a500' }}>
                Not Yet Submitted
              </div>
              <div style={{ fontSize: 12, color: deadlineUrgent ? '#e94560' : '#888', marginTop: 4 }}>
                {hours}h {minutes}m until deadline
              </div>
            </>
          )}
        </div>

        {/* Weekly Progress */}
        <div style={{
          padding: '14px 18px', borderRadius: 12,
          background: 'rgba(83,52,131,0.06)',
          border: '1px solid rgba(83,52,131,0.15)',
        }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            Week {currentWeek} Progress
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#c9a0ff' }}>
            Day {dayInWeek} of {totalDaysInWeek}
          </div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
            {totalDaysInWeek - dayInWeek} day{totalDaysInWeek - dayInWeek !== 1 ? 's' : ''} remaining this week
          </div>
        </div>
      </div>
    </div>
  );
}
