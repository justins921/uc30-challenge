import { useState, useEffect } from 'react';
import Header from './Header';
import ProgressBanner from './ProgressBanner';
import TimelineView from './TimelineView';
import DayView from './DayView';
import SubmissionsView from './SubmissionsView';
import StatsView from './StatsView';
import Leaderboard from './Leaderboard';
import UserProfile, { UserSupport } from './UserProfile';
import { getGettingStartedContent, getWeekNumber as getChallengeWeekNumber, getWeeklyOfferTarget, getWeekDayRange } from '../data/challengeDays';
import { calculateUCPoints } from '../data/ucPoints';
import { COMPLIANCE_METRICS, DEFAULT_DAILY_MINIMUMS as COMP_DAILY_DEFAULTS, DEFAULT_WEEKLY_MINIMUMS, DEFAULT_ENFORCEMENT, checkWeeklyCompliance, getWeekNumber, getWeekRange, getWeekDayCount, calculateAtRisk, getTimeUntilDeadline } from '../data/compliance';
import CommunityBoard from './CommunityBoard';
import ContactsCRM from './ContactsCRM';
import MyBuyBox from './MyBuyBox';
import PracticeDay from './PracticeDay';
import Footer from './Footer';
import RentalCalculator from './RentalCalculator';

const TABS = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'calculator', label: 'Calculator' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'crm', label: 'Contacts' },
  { id: 'community', label: 'Community' },
  { id: 'buybox', label: 'My Buy Box' },
  { id: 'submissions', label: 'My Submissions' },
  { id: 'stats', label: 'Operator Stats' },
  { id: 'support', label: 'Support' },
  { id: 'profile', label: 'Profile' },
];

const PIPELINE_TABS = [
  { id: 'pipeline', label: 'Daily Activity' },
  { id: 'calculator', label: 'Calculator' },
  { id: 'crm', label: 'Contacts' },
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

export default function Dashboard({ user, onLogout, onSubmit, cohortStartDate, nextCohortDate, contentOverrides, liveCalls, customPhases, onUpdateProfile, onChangePassword, onSubmitTicket, onReplyToTicket, onUpdateTicket, supportTickets, cohortStats, onCompleteGettingStarted, communityPosts, onCreateCommunityPost, onCommentOnPost, onDeleteCommunityPost, onDeleteCommunityComment, onPinCommunityPost, onDismissCommunityWarning, participants, dailyMinimumsOverrides, skoolLink, onAddContact, onUpdateContact, onAddFollowUp, onUploadFile, getContacts, getFollowUps, getFollowUpsByContact, getUploadUrl, contacts, complianceSettings, getDailySubmission, getQuizAttempts, addQuizAttempt, practiceDaySettings, onCompletePracticeDay, onSubmitPipelineDay, onActivateNextCohort, onUpdateUser, onSaveConfidenceSurvey, onGraduateViaContract }) {
  const [tab, setTab] = useState(user.pipelineMode && !user.isActive ? 'pipeline' : 'timeline');
  const [selectedDay, setSelectedDay] = useState(null);
  const [existingDailySubmission, setExistingDailySubmission] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [showPracticeDay, setShowPracticeDay] = useState(false);
  const [graduationModal, setGraduationModal] = useState(null);

  const handlePropertyUnderContract = async (contact) => {
    const propertyName = contact.property || contact.name || 'Property';
    if (onGraduateViaContract) {
      await onGraduateViaContract(propertyName);
    }
    setGraduationModal({
      propertyName,
      contactName: contact.name,
      isFirstGraduation: (user.ucGraduateCount || 0) === 0,
      daysCompleted: (user.completedDays || []).length,
      offersSubmitted: user.metrics?.offersSubmitted || 0,
      propertiesAnalyzed: user.metrics?.propertiesAnalyzed || 0,
    });
  };

  const calendarDay = getCalendarDay(cohortStartDate);

  useEffect(() => {
    if (!getDailySubmission || !user?.id || !calendarDay || calendarDay < 1) return;
    (async () => {
      const sub = await getDailySubmission(user.id, calendarDay);
      setExistingDailySubmission(sub || null);
    })();
  }, [calendarDay, user?.id, user?.currentDay]);

  useEffect(() => {
    if (!getQuizAttempts || !user?.id || selectedDay === null || selectedDay === undefined) { setQuizAttempts([]); return; }
    (async () => {
      const attempts = await getQuizAttempts(user.id, selectedDay);
      setQuizAttempts(attempts || []);
    })();
  }, [selectedDay, user?.id]);

  // Removed/paused state — non-pipeline (legacy: no continued access)
  if (!user.isActive && !user.pipelineMode) {
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

  const isPipelineMode = !user.isActive && user.pipelineMode;
  const cohortActive = !isPipelineMode && cohortStartDate && calendarDay !== null && calendarDay >= 1;

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
      {graduationModal && (
        <UnderContractGraduationModal
          data={graduationModal}
          onContinueLearning={() => setGraduationModal(null)}
          onClose={() => setGraduationModal(null)}
        />
      )}
      <Header
        user={user}
        currentTab={tab === 'day' ? 'timeline' : tab}
        onTabChange={handleTabChange}
        tabs={(isPipelineMode ? PIPELINE_TABS : cohortActive ? TABS : TABS.filter(t => t.id !== 'community')).map(t => {
          if (t.id === 'community' && hasCommunityNotification && tab !== 'community') return { ...t, hasNotification: true };
          if (t.id === 'support' && hasSupportNotification && tab !== 'support') return { ...t, hasNotification: true };
          return t;
        })}
        onLogout={onLogout}
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        {/* Practice Day */}
        {showPracticeDay && (
          <PracticeDay
            user={user}
            practiceDaySettings={practiceDaySettings}
            onComplete={async () => {
              if (onCompletePracticeDay) {
                await onCompletePracticeDay({
                  practiceDayCompleted: true,
                  practiceDayCompletedAt: new Date().toISOString(),
                });
              }
            }}
            onBack={() => setShowPracticeDay(false)}
          />
        )}

        {/* Pipeline Mode Banner */}
        {isPipelineMode && tab === 'pipeline' && (
          <PipelineModeBanner
            user={user}
            nextCohortDate={nextCohortDate}
            contacts={contacts}
            onActivateNextCohort={onActivateNextCohort}
          />
        )}

        {/* Pipeline Mode Follow-Up Badge */}
        {isPipelineMode && tab === 'pipeline' && (
          <FollowUpBadge contacts={contacts} onGoToDay={() => {}} />
        )}

        {/* UC Points Score */}
        {!showPracticeDay && (tab === 'timeline' || tab === 'day' || tab === 'pipeline') && (
          <UCPointsBanner ucPoints={user.ucPoints || calculateUCPoints(user.metrics)} />
        )}

        {/* Under Contract Achievement */}
        {!showPracticeDay && user.graduatedViaContract && (tab === 'timeline' || tab === 'stats' || tab === 'pipeline') && (
          <div className="fade-up" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', marginBottom: 16,
            background: 'linear-gradient(135deg, rgba(107,138,253,0.08), rgba(72,199,142,0.06))',
            border: '1px solid rgba(107,138,253,0.2)',
            borderRadius: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🏠</span>
              <div>
                <div style={{ fontSize: 12, color: '#6b8afd', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700 }}>
                  Property Under Contract
                </div>
                <div style={{ fontSize: 11, color: '#888' }}>
                  {user.graduatedViaContractProperty || 'Deal secured'}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: '#48c78e', fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: 'rgba(72,199,142,0.1)', border: '1px solid rgba(72,199,142,0.2)' }}>
              LOCKED IN
            </div>
          </div>
        )}

        {/* UC Graduate Badge */}
        {!showPracticeDay && (user.ucGraduateCount || 0) > 0 && (tab === 'timeline' || tab === 'stats' || tab === 'pipeline') && (
          <div className="fade-up" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', marginBottom: 16,
            background: 'linear-gradient(135deg, rgba(240,165,0,0.08), rgba(168,85,247,0.06))',
            border: '1px solid rgba(240,165,0,0.2)',
            borderRadius: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🎓</span>
              <div>
                <div style={{ fontSize: 12, color: '#f0a500', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700 }}>
                  UC Graduate
                </div>
                <div style={{ fontSize: 11, color: '#888' }}>
                  {user.ucGraduateCount} cohort{user.ucGraduateCount !== 1 ? 's' : ''} completed
                </div>
              </div>
            </div>
            <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#f0a500' }}>
              x{user.ucGraduateCount}
            </div>
          </div>
        )}

        {/* Veteran Minimums Indicator */}
        {!showPracticeDay && (user.cohortAttempt || 1) >= 2 && cohortActive && (tab === 'timeline' || tab === 'day') && (
          <div className="fade-up" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 16px', marginBottom: 16,
            background: 'rgba(168,85,247,0.06)',
            border: '1px solid rgba(168,85,247,0.15)',
            borderRadius: 10, fontSize: 12, color: '#a855f7', fontWeight: 600,
          }}>
            <span style={{ fontSize: 14 }}>⚡</span>
            Veteran Minimums Active — No ramp-up period, sustained standards from Day 1
          </div>
        )}

        {/* Lifetime Offers Counter */}
        {!showPracticeDay && (user.lifetimeOffersSubmitted || 0) > 0 && (
          <div className="fade-up" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', marginBottom: 16,
            background: 'linear-gradient(135deg, rgba(233,69,96,0.06), rgba(233,69,96,0.02))',
            border: '1px solid rgba(233,69,96,0.12)',
            borderRadius: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>📝</span>
              <div style={{ fontSize: 12, color: '#e94560', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>
                Offers to Contract
              </div>
            </div>
            <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#e94560' }}>
              {(user.lifetimeOffersSubmitted || 0).toLocaleString()}
            </div>
          </div>
        )}

        {!showPracticeDay && cohortActive && cohortStats && cohortStats.total > 0 && (
          <CohortStatsBanner active={cohortStats.active} total={cohortStats.total} />
        )}
        {!showPracticeDay && cohortActive && (tab === 'timeline' || tab === 'day') && (
          <ProgressBanner user={user} cohortStartDate={cohortStartDate} calendarDay={calendarDay} />
        )}

        {/* Motivation nudge when user hasn't submitted today */}
        {!showPracticeDay && cohortActive && !userCompletedToday && (user.stakesDeclaration || user.theirWhy) && (tab === 'timeline' || tab === 'day') && (
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

        {/* Follow-Up Reminder Badge */}
        {!showPracticeDay && cohortActive && (tab === 'timeline' || tab === 'day') && (
          <FollowUpBadge contacts={contacts} onGoToDay={() => {
            if (calendarDay && calendarDay >= 1) handleSelectDay(Math.min(calendarDay, user.currentDay));
          }} />
        )}

        {/* Compliance Cards */}
        {!showPracticeDay && cohortActive && (tab === 'timeline' || tab === 'day') && complianceSettings && (
          <ComplianceCards
            calendarDay={calendarDay}
            existingDailySubmission={existingDailySubmission}
            complianceSettings={complianceSettings}
            user={user}
          />
        )}

        {/* Cohort countdown when pre-cohort (not in pipeline mode) */}
        {!showPracticeDay && !isPipelineMode && cohortStartDate && !cohortActive && (tab === 'timeline' || tab === 'day') && (
          <CohortCountdown cohortStartDate={cohortStartDate} user={user} onLaunchPracticeDay={() => setShowPracticeDay(true)} />
        )}

        {/* Countdown + Live Call — only on Timeline/Day views when cohort is active */}
        {!showPracticeDay && cohortActive && (tab === 'timeline' || tab === 'day') && (
          <>
            {userCompletedToday && (
              <NextDayCountdown calendarDay={calendarDay} />
            )}
            <UpcomingCallBanner calls={liveCalls} />
          </>
        )}

        {/* Pipeline Mode: Daily Activity */}
        {!showPracticeDay && tab === 'pipeline' && isPipelineMode && (
          <PipelineDailyActivity
            user={user}
            onSubmitPipelineDay={onSubmitPipelineDay}
            onAddContact={onAddContact}
            onAddFollowUp={onAddFollowUp}
            onUpdateContact={onUpdateContact}
            contacts={contacts}
          />
        )}

        {/* Tab Content */}
        {!showPracticeDay && tab === 'timeline' && !isPipelineMode && (
          <TimelineView user={user} onSelectDay={handleSelectDay} calendarDay={calendarDay} contentOverrides={contentOverrides} customPhases={customPhases} cohortStartDate={cohortStartDate} onLaunchPracticeDay={() => setShowPracticeDay(true)} />
        )}
        {!showPracticeDay && tab === 'day' && selectedDay === 'getting_started' && (
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <button className="btn-secondary" onClick={handleBackToTimeline} style={{ marginBottom: 24, padding: '8px 20px', fontSize: 13 }}>
              ← Back to Timeline
            </button>
            <GettingStartedSection user={user} onComplete={async (...args) => { await onCompleteGettingStarted(...args); handleBackToTimeline(); }} contentOverrides={contentOverrides} />
          </div>
        )}
        {!showPracticeDay && tab === 'day' && selectedDay !== null && selectedDay !== undefined && selectedDay !== 'getting_started' && (
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
            onUpdateContact={onUpdateContact}
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
            onSaveConfidenceSurvey={onSaveConfidenceSurvey}
          />
        )}
        {!showPracticeDay && tab === 'community' && (
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
        {!showPracticeDay && tab === 'leaderboard' && (
          <Leaderboard participants={participants || []} currentUserId={user.id} />
        )}
        {!showPracticeDay && tab === 'crm' && (
          <ContactsCRM
            user={user}
            getContacts={getContacts}
            getFollowUpsByContact={getFollowUpsByContact}
            onUpdateContact={onUpdateContact}
            onAddContact={onAddContact}
            onAddFollowUp={onAddFollowUp}
            onPropertyUnderContract={handlePropertyUnderContract}
          />
        )}
        {!showPracticeDay && tab === 'calculator' && (
          <CalculatorTab
            contacts={contacts}
            onUpdateContact={onUpdateContact}
            onUploadFile={onUploadFile}
            userId={user.id}
          />
        )}
        {!showPracticeDay && tab === 'buybox' && <MyBuyBox user={user} onUpdateUser={onUpdateUser} />}
        {!showPracticeDay && tab === 'submissions' && <SubmissionsView user={user} onEditDay={(day) => handleSelectDay(day)} />}
        {!showPracticeDay && tab === 'stats' && <StatsView user={user} />}
        {!showPracticeDay && tab === 'support' && (
          <UserSupport
            user={user}
            onSubmitTicket={onSubmitTicket}
            onReplyToTicket={onReplyToTicket}
            onUpdateTicket={onUpdateTicket}
            supportTickets={supportTickets}
          />
        )}
        {!showPracticeDay && tab === 'profile' && (
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
function CohortCountdown({ cohortStartDate, user, onLaunchPracticeDay }) {
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

      <div className="card" style={{ padding: 24, textAlign: 'left', maxWidth: 400, margin: '0 auto', marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>You're activated. Complete all pre-work to unlock Day 1:</h3>
        <ul style={{ color: '#888', fontSize: 14, lineHeight: 2, listStyle: 'none', padding: 0 }}>
          <li>{user?.gettingStartedCompleted ? '✅' : '⬜'} Getting Started — social handles</li>
          <li>{user?.completedDays?.includes(-3) ? '✅' : '⬜'} Your Foundation</li>
          <li>{user?.completedDays?.includes(-2) ? '✅' : '⬜'} Your Market and Buy Box</li>
          <li>{user?.completedDays?.includes(-1) ? '✅' : '⬜'} Your Team and Tools</li>
          <li>{user?.completedDays?.includes(0) || user?.preTrainingComplete ? '✅' : '⬜'} Return Metrics 101</li>
          <li>{user?.practiceDayCompleted ? '✅' : '⬜'} Practice Run</li>
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
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#48c78e' }}>You're Activated!</h3>
        <p style={{ color: '#888', fontSize: 14, marginTop: 8 }}>You're all set. Day 1 is now unlocked.</p>
      </div>
    );
  }

  // Validation summary
  const missingFields = [];
  if (!hasValidHandle) missingFields.push('at least one social media handle');

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
        style={{ width: '100%', padding: '14px 24px', fontSize: 16, opacity: missingFields.length > 0 ? 0.5 : 1 }}
        onClick={handleComplete}
        disabled={saving || missingFields.length > 0}
      >
        {saving ? 'Saving...' : "I'm Ready \u2014 Let's Go"}
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
  const enforcement = { ...DEFAULT_ENFORCEMENT, ...complianceSettings?.enforcement };

  const currentDay = Math.max(1, Math.min(calendarDay || 1, 30));
  const currentWeek = getChallengeWeekNumber(currentDay);
  const { start: weekStart, end: weekEnd } = getWeekDayRange(currentWeek);
  const dayInWeek = currentDay - weekStart + 1;
  const totalDaysInWeek = weekEnd - weekStart + 1;
  const weeklyTarget = getWeeklyOfferTarget(currentDay);

  let weeklyOffers = 0;
  (user.submissions || []).forEach(s => {
    if (s.day >= weekStart && s.day <= weekEnd) {
      weeklyOffers += s.dayMetrics?.offers_submitted || 0;
    }
  });

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

  const offerPct = weeklyTarget > 0 ? Math.min(100, Math.round((weeklyOffers / weeklyTarget) * 100)) : 100;
  const offerColor = weeklyOffers >= weeklyTarget ? '#48c78e' : offerPct >= 50 ? '#f0a500' : '#e94560';

  return (
    <div className="fade-up" style={{ marginBottom: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
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

        {/* Weekly Offers */}
        {weeklyTarget > 0 && (
          <div style={{
            padding: '14px 18px', borderRadius: 12,
            background: `rgba(${weeklyOffers >= weeklyTarget ? '72,199,142' : '240,165,0'},0.06)`,
            border: `1px solid rgba(${weeklyOffers >= weeklyTarget ? '72,199,142' : '240,165,0'},0.15)`,
          }}>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              Week {currentWeek} Offers
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: offerColor }}>
              {weeklyOffers} / {weeklyTarget} minimum
            </div>
            <div style={{
              marginTop: 6, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
            }}>
              <div style={{ height: '100%', borderRadius: 2, background: offerColor, width: `${offerPct}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FollowUpBadge({ contacts, onGoToDay }) {
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const due = (contacts || []).filter(c => {
    if (!c.follow_up_date || c.follow_up_interval === 'never') return false;
    return new Date(c.follow_up_date) <= todayEnd;
  });

  if (due.length === 0) return null;

  const overdueCount = due.filter(c => new Date(c.follow_up_date) < todayStart).length;
  const dueTodayCount = due.length - overdueCount;
  const hasOverdue = overdueCount > 0;

  return (
    <div className="fade-up" onClick={onGoToDay} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 20px', marginBottom: 16, cursor: 'pointer',
      background: hasOverdue ? 'rgba(233,69,96,0.06)' : 'rgba(240,165,0,0.06)',
      border: `1px solid ${hasOverdue ? 'rgba(233,69,96,0.15)' : 'rgba(240,165,0,0.15)'}`,
      borderRadius: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 16 }}>📋</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: hasOverdue ? '#e94560' : '#f0a500' }}>
            {hasOverdue
              ? `${overdueCount} overdue follow-up${overdueCount !== 1 ? 's' : ''}${dueTodayCount > 0 ? `, ${dueTodayCount} due today` : ''}`
              : `${dueTodayCount} follow-up${dueTodayCount !== 1 ? 's' : ''} due today`}
          </div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
            Tap to view your daily page
          </div>
        </div>
      </div>
      <div style={{
        minWidth: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hasOverdue ? 'rgba(233,69,96,0.2)' : 'rgba(240,165,0,0.2)',
        color: hasOverdue ? '#e94560' : '#f0a500', fontSize: 14, fontWeight: 700,
        fontFamily: "'DM Mono', monospace",
      }}>
        {due.length}
      </div>
    </div>
  );
}

function PipelineModeBanner({ user, nextCohortDate, contacts, onActivateNextCohort }) {
  const [activating, setActivating] = useState(false);
  const cohortNum = (user.cohortAttempt || 1) + 1;
  const contactCount = (contacts || []).length;
  const totalProps = user.metrics?.propertiesAnalyzed || 0;
  const totalOffers = user.lifetimeOffersSubmitted || 0;
  const streak = user.pipelineModeStreak || 0;

  const canActivate = nextCohortDate && (() => {
    const nowEastern = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const start = new Date(nextCohortDate + 'T00:00:00');
    return nowEastern >= start;
  })();

  const handleActivate = async () => {
    setActivating(true);
    await onActivateNextCohort();
    setActivating(false);
  };

  return (
    <div className="fade-up" style={{ marginBottom: 20 }}>
      {/* Pipeline Mode header */}
      <div style={{
        padding: '20px 24px', borderRadius: 14, marginBottom: 16,
        background: 'linear-gradient(135deg, rgba(107,138,253,0.08), rgba(83,52,131,0.06))',
        border: '1px solid rgba(107,138,253,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 6, fontWeight: 700,
            background: 'rgba(107,138,253,0.15)', color: '#6b8afd',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>Pipeline Mode</span>
          <span style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 6, fontWeight: 600,
            background: 'rgba(201,160,255,0.1)', color: '#c9a0ff',
          }}>Preparing for Cohort {cohortNum}</span>
        </div>
        <p style={{ fontSize: 14, color: '#bbb', lineHeight: 1.7, margin: 0 }}>
          Keep building your contacts and pipeline — you'll have a head start when your next cohort begins{nextCohortDate ? ` on ${new Date(nextCohortDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}` : ''}.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 16 }}>
        {streak > 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '12px 8px' }}>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: '#6b8afd' }}>{streak}</div>
            <div style={{ fontSize: 10, color: '#888' }}>Day Streak</div>
          </div>
        )}
        <div className="card" style={{ textAlign: 'center', padding: '12px 8px' }}>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: '#c9a0ff' }}>{contactCount}</div>
          <div style={{ fontSize: 10, color: '#888' }}>Contacts</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '12px 8px' }}>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: '#48c78e' }}>{totalProps}</div>
          <div style={{ fontSize: 10, color: '#888' }}>Properties</div>
        </div>
        {totalOffers > 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '12px 8px' }}>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: '#e94560' }}>{totalOffers}</div>
            <div style={{ fontSize: 10, color: '#888' }}>Offers</div>
          </div>
        )}
      </div>

      {/* Next cohort activation */}
      {canActivate ? (
        <div style={{
          padding: '20px 24px', borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(72,199,142,0.08), rgba(72,199,142,0.03))',
          border: '1px solid rgba(72,199,142,0.2)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#48c78e', marginBottom: 8 }}>
            Your next cohort starts today!
          </div>
          <p style={{ fontSize: 13, color: '#aaa', marginBottom: 16, lineHeight: 1.6 }}>
            You've built up {contactCount} contact{contactCount !== 1 ? 's' : ''} and analyzed {totalProps} properties. Time to put it all to work.
          </p>
          <button className="btn-primary" onClick={handleActivate} disabled={activating}
            style={{ padding: '12px 32px', fontSize: 15 }}>
            {activating ? 'Activating...' : 'Activate & Start Cohort'}
          </button>
        </div>
      ) : nextCohortDate ? (
        <NextCohortCountdown nextCohortDate={nextCohortDate} />
      ) : null}
    </div>
  );
}

function PipelineDailyActivity({ user, onSubmitPipelineDay, onAddContact, onAddFollowUp, onUpdateContact, contacts }) {
  const [metrics, setMetrics] = useState({
    properties_analyzed: 0,
    arsenal_contacts: 0,
    target_contacts: 0,
    follow_ups: 0,
    offers_submitted: 0,
  });
  const [submitted, setSubmitted] = useState(false);

  const setMetric = (key, value) => setMetrics(prev => ({ ...prev, [key]: value }));

  const hasActivity = Object.values(metrics).some(v => v > 0);

  const handleSubmit = async () => {
    if (!hasActivity) return;
    await onSubmitPipelineDay(metrics);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="card scale-in" style={{ borderColor: 'rgba(107,138,253,0.3)', textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔄</div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#6b8afd', marginBottom: 8 }}>Activity Logged!</h3>
        <p style={{ color: '#888', fontSize: 14 }}>
          Pipeline streak: {(user.pipelineModeStreak || 0) + 1} day{(user.pipelineModeStreak || 0) + 1 !== 1 ? 's' : ''}. Keep building momentum.
        </p>
      </div>
    );
  }

  const PIPELINE_METRICS = [
    { id: 'properties_analyzed', label: 'Properties Analyzed', icon: '🏠' },
    { id: 'arsenal_contacts', label: 'Arsenal Contacts', icon: '⚡' },
    { id: 'target_contacts', label: 'Target Contacts', icon: '🎯' },
    { id: 'follow_ups', label: 'Follow-Ups', icon: '📞' },
    { id: 'offers_submitted', label: 'Offers Submitted', icon: '📝' },
  ];

  return (
    <div className="fade-up" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(107,138,253,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📊</div>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Daily Activity</h3>
          <span style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 700,
            background: 'rgba(107,138,253,0.1)', color: '#6b8afd',
          }}>NO MINIMUMS</span>
        </div>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
          Log your activity to build your streak and stats. No minimums — do as much or as little as you want.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PIPELINE_METRICS.map(metric => {
            const value = metrics[metric.id];
            return (
              <div key={metric.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderRadius: 10,
                background: value > 0 ? 'rgba(107,138,253,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${value > 0 ? 'rgba(107,138,253,0.15)' : 'rgba(255,255,255,0.06)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{metric.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#ddd' }}>{metric.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => setMetric(metric.id, Math.max(0, (value || 0) - 1))}
                    style={{
                      width: 32, height: 32, borderRadius: 6, fontSize: 18, fontWeight: 700,
                      border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                      color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>-</button>
                  <input type="number" min="0" value={value || 0}
                    onChange={e => setMetric(metric.id, Math.max(0, parseInt(e.target.value) || 0))}
                    style={{
                      width: 56, textAlign: 'center', fontSize: 18, fontWeight: 700, padding: '6px', borderRadius: 6,
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                    }} />
                  <button onClick={() => setMetric(metric.id, (value || 0) + 1)}
                    style={{
                      width: 32, height: 32, borderRadius: 6, fontSize: 18, fontWeight: 700,
                      border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                      color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>+</button>
                </div>
              </div>
            );
          })}
        </div>

        <button className="btn-primary" onClick={handleSubmit} disabled={!hasActivity}
          style={{ width: '100%', marginTop: 20, opacity: hasActivity ? 1 : 0.4 }}>
          Log Activity
        </button>
      </div>
    </div>
  );
}

function CalculatorTab({ contacts, onUpdateContact, onUploadFile, userId }) {
  const targetProps = (contacts || []).filter(c => c.contact_group === 'target' && c.pipeline_status !== 'dead');

  return (
    <div className="fade-up-delay-2">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>CDS Rental Property Calculator</h2>
        <p style={{ fontSize: 13, color: '#888', margin: 0, lineHeight: 1.5 }}>
          Analyze any property and use the Seller Finance Solver to structure deals that hit your target return.
        </p>
      </div>
      <div className="card" style={{ padding: '16px 18px' }}>
        <RentalCalculator
          targetProperties={targetProps}
          day={null}
          onSaveAnalysis={async (propertyId, summary) => {
            const contact = targetProps.find(c => c.id === propertyId);
            const existing = contact?.analysis_notes || [];
            const entry = {
              id: `analysis_${Date.now()}`,
              text: summary,
              date: new Date().toISOString(),
              day: 'calculator',
            };
            await onUpdateContact(propertyId, {
              analysis_notes: [...existing, entry],
            });
          }}
          onUploadAnalysis={onUploadFile ? async (propertyId, file) => {
            return await onUploadFile(userId, 'calculator', 'analysis', file);
          } : null}
        />
      </div>
    </div>
  );
}

function UnderContractGraduationModal({ data, onContinueLearning, onClose }) {
  const { propertyName, contactName, isFirstGraduation, daysCompleted, offersSubmitted, propertiesAnalyzed } = data;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, animation: 'graduationFadeIn 0.4s ease-out',
    }}>
      <div style={{
        maxWidth: 520, width: '100%',
        background: 'linear-gradient(165deg, #111318, #0d0f13)',
        border: '1px solid rgba(107,138,253,0.3)',
        borderRadius: 20, padding: '40px 32px', textAlign: 'center',
        animation: 'graduationSlideUp 0.5s ease-out',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          background: 'radial-gradient(circle at 50% 0%, #6b8afd 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ fontSize: 56, marginBottom: 16, position: 'relative' }}>
          🎉🏠🎓
        </div>

        {isFirstGraduation ? (
          <>
            <div style={{
              fontSize: 28, fontWeight: 800, color: '#fff',
              marginBottom: 6, lineHeight: 1.2, position: 'relative',
            }}>
              You're a UC30 Graduate!
            </div>
            <div style={{
              fontSize: 14, color: '#6b8afd', fontWeight: 600,
              marginBottom: 20, position: 'relative',
            }}>
              Property Under Contract
            </div>
          </>
        ) : (
          <>
            <div style={{
              fontSize: 28, fontWeight: 800, color: '#fff',
              marginBottom: 6, lineHeight: 1.2, position: 'relative',
            }}>
              Another One Under Contract!
            </div>
            <div style={{
              fontSize: 14, color: '#6b8afd', fontWeight: 600,
              marginBottom: 20, position: 'relative',
            }}>
              Your momentum is compounding
            </div>
          </>
        )}

        <div style={{
          padding: '16px 20px', borderRadius: 12, marginBottom: 24,
          background: 'rgba(107,138,253,0.08)',
          border: '1px solid rgba(107,138,253,0.2)',
          position: 'relative',
        }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
            Property
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#6b8afd' }}>
            {propertyName}
          </div>
          {contactName && contactName !== propertyName && (
            <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
              {contactName}
            </div>
          )}
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
          marginBottom: 28, position: 'relative',
        }}>
          <div style={{
            padding: '12px 8px', borderRadius: 10,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: '#48c78e' }}>
              {daysCompleted}
            </div>
            <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Days Done
            </div>
          </div>
          <div style={{
            padding: '12px 8px', borderRadius: 10,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: '#e94560' }}>
              {offersSubmitted}
            </div>
            <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Offers Made
            </div>
          </div>
          <div style={{
            padding: '12px 8px', borderRadius: 10,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: '#f0a500' }}>
              {propertiesAnalyzed}
            </div>
            <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Analyzed
            </div>
          </div>
        </div>

        {isFirstGraduation && (
          <div style={{
            padding: '14px 18px', borderRadius: 10, marginBottom: 24,
            background: 'rgba(72,199,142,0.06)',
            border: '1px solid rgba(72,199,142,0.15)',
            fontSize: 13, color: '#aaa', lineHeight: 1.6, textAlign: 'left',
            position: 'relative',
          }}>
            <span style={{ color: '#48c78e', fontWeight: 700 }}>Congratulations!</span> Getting a property under contract
            means you've done what most people only talk about. You took action, made offers, negotiated, and
            closed the gap. You are now a UC30 Graduate.
          </div>
        )}

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 10,
          position: 'relative',
        }}>
          <button
            onClick={onContinueLearning}
            style={{
              padding: '14px 24px', borderRadius: 12, fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              background: 'linear-gradient(135deg, rgba(107,138,253,0.25), rgba(72,199,142,0.15))',
              border: '1px solid rgba(107,138,253,0.4)',
              color: '#fff', transition: 'all 0.2s',
            }}
          >
            Continue Learning & Get More Deals
          </button>

          <div style={{
            padding: '14px 18px', borderRadius: 12,
            background: 'rgba(240,165,0,0.06)',
            border: '1px solid rgba(240,165,0,0.15)',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f0a500', marginBottom: 4 }}>
              Due Diligence & Systems
            </div>
            <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5, marginBottom: 10 }}>
              Ready to close with confidence? Get access to our due diligence checklists, property management
              setup guides, and systems to take your deal from contract to cash flow.
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '8px 18px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                background: 'rgba(240,165,0,0.15)',
                border: '1px solid rgba(240,165,0,0.3)',
                color: '#f0a500',
              }}
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes graduationFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes graduationSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
