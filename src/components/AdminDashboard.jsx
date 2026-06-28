import { useState, useEffect } from 'react';
import Header from './Header';
import { CHALLENGE_DAYS, getPhases, DEFAULT_PHASES, getDayContent, getPreDayContent, GETTING_STARTED_DEFAULT, getGettingStartedContent, DAILY_MINIMUMS, getWeekNumber as getChallengeWeek, getWeeklyOfferTarget, getCohortStartDate } from '../data/challengeDays';
import { INDICATOR_KEYS, INDICATOR_LABELS, INDICATOR_SHORT_LABELS, INDICATOR_COLORS, UC_POINT_VALUES, calculateUCPoints } from '../data/ucPoints';
import DayView, { AttachmentLink } from './DayView';
import { LANDING_DEFAULTS } from './LandingPage';
import Footer from './Footer';
import { COMPLIANCE_METRICS, DEFAULT_DAILY_MINIMUMS as COMP_DAILY_DEFAULTS, DEFAULT_WEEKLY_MINIMUMS, DEFAULT_ENFORCEMENT, checkWeeklyCompliance, getWeekNumber, getWeekRange, getWeekDayCount, calculateAtRisk, getNowInTimezone } from '../data/compliance';
import { TRAINING_MODULES, getResolvedTrainingModules } from '../data/trainingModules';
import { GetClearStep, BuyBoxStep, CapitalConfirmationStep, OfferCommitmentStep, NotificationPrefsStep } from './ActivationPhase';
import CapitalStrategyFinder from './CapitalStrategyFinder';
import ReadinessAssessment from './ReadinessAssessment';
import WeeklyCheckIn from './WeeklyCheckIn';

function getSocialUrl(platform, handle) {
  const clean = handle.replace(/^@/, '').trim();
  if (!clean) return null;
  switch (platform) {
    case 'instagram': return `https://instagram.com/${clean}`;
    case 'tiktok': return `https://tiktok.com/@${clean}`;
    case 'twitter': return `https://x.com/${clean}`;
    case 'facebook': return `https://facebook.com/${clean}`;
    case 'youtube': return `https://youtube.com/@${clean}`;
    default: return null;
  }
}

const PLATFORM_LABELS = { instagram: 'IG', tiktok: 'TikTok', twitter: '𝕏', facebook: 'FB', youtube: 'YT' };

function SocialHandleLinks({ socialHandles }) {
  if (!socialHandles || Object.keys(socialHandles).length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
      {Object.entries(socialHandles).map(([platform, handle]) => {
        if (!handle) return null;
        const url = getSocialUrl(platform, handle);
        const label = PLATFORM_LABELS[platform] || platform;
        return url ? (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 11, padding: '3px 8px', borderRadius: 5,
              background: 'rgba(233,69,96,0.08)', border: '1px solid rgba(233,69,96,0.2)',
              color: '#e94560', textDecoration: 'none', fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {label}: {handle}
          </a>
        ) : (
          <span key={platform} style={{ fontSize: 11, color: '#888' }}>
            {label}: {handle}
          </span>
        );
      })}
    </div>
  );
}

const ADMIN_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'participants', label: 'Participants' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'submissions', label: 'Submissions' },
  { id: 'community', label: 'Community' },
  { id: 'training-content', label: 'Training Content' },
  { id: 'support', label: 'Support' },
  { id: 'social', label: 'Social Proof' },
];

export default function AdminDashboard({ user, participants, onRemove, onDelete, onReactivate, onApprove, onToggleAdmin, onResetPassword, onLogout, cohortStartDate, nextCohortDate, onSetCohortStartDate, onSetNextCohortDate, contentOverrides, onSetContentOverrides, liveCalls, onSetLiveCalls, customPhases, onSetPhases, landingContent, onSetLandingContent, landingVersion, onSetLandingVersion, supportTickets, onUpdateTicket, onReplyToTicket, onVerifySubmissionSocial, communityPosts, onDeleteCommunityPost, onDeleteCommunityComment, onPinCommunityPost, onWarnCommunityUser, onBanCommunityUser, onCreateCommunityPost, onCommentOnPost, onViewAsUser, dailyMinimumsOverrides, onSetDailyMinimums, skoolLink, onSetSkoolLink, practiceDaySettings, onSetPracticeDaySettings, getContactsForParticipant, getUploads, getUploadUrl, complianceSettings, onSetComplianceDailyMinimums, onSetComplianceWeeklyMinimums, onSetComplianceEnforcement, getAllDailySubmissions, getRemovalLog, onSwitchToParticipant, trainingConfig, onSetTrainingConfig }) {
  const phases = getPhases(customPhases);
  const [tab, setTab] = useState('overview');
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  const nonAdmin = participants.filter(p => !p.isAdmin);
  const active = nonAdmin.filter(p => p.isActive);
  const removed = nonAdmin.filter(p => !p.isActive);
  const pending = nonAdmin.filter(p => !p.approved);

  // Aggregate indicator totals
  const indicatorTotals = {};
  INDICATOR_KEYS.forEach(key => {
    indicatorTotals[key] = nonAdmin.reduce((s, p) => s + (p.metrics?.[key] || 0), 0);
  });
  const totalUCPoints = nonAdmin.reduce((s, p) => s + (p.ucPoints || calculateUCPoints(p.metrics || {})), 0);
  const avgUCPoints = active.length > 0 ? Math.round(totalUCPoints / active.length) : 0;

  const totalAnalyzed = indicatorTotals.propertiesAnalyzed;
  const totalOffers = indicatorTotals.offersSubmitted;

  const dayDistribution = {};
  active.forEach(p => {
    const d = p.currentDay;
    dayDistribution[d] = (dayDistribution[d] || 0) + 1;
  });

  const retentionRate = nonAdmin.length > 0 ? Math.round((active.length / nonAdmin.length) * 100) : 0;

  // Notification dots
  const hasOpenTickets = (supportTickets || []).some(t => t.status === 'open');
  const todayStr = new Date().toISOString().slice(0, 10);
  const hasCommunityActivity = (communityPosts || []).some(p => {
    if (p.isDeleted) return false;
    if (p.createdAt?.startsWith(todayStr)) return true;
    return (p.comments || []).some(c => !c.isDeleted && c.createdAt?.startsWith(todayStr));
  });

  const baseTabs = user?.isDeveloper
    ? [...ADMIN_TABS, { id: 'qa', label: 'QA Checklist' }, { id: 'revenue', label: 'Revenue' }]
    : ADMIN_TABS;

  const adminTabs = baseTabs.map(t => {
    if (t.id === 'support' && hasOpenTickets && tab !== 'support') return { ...t, hasNotification: true };
    if (t.id === 'community' && hasCommunityActivity && tab !== 'community') return { ...t, hasNotification: true };
    return t;
  });

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
        tabs={adminTabs}
        onLogout={onLogout}
        isAdmin
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>
            Challenge Control Center
          </h1>
          {onSwitchToParticipant && (
            <button onClick={onSwitchToParticipant} style={{
              padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", border: 'none',
              background: 'rgba(72,199,142,0.15)', color: '#48c78e',
            }}>My Course</button>
          )}
        </div>

        {/* Cohort Settings */}
        <CohortSettings
          cohortStartDate={cohortStartDate}
          nextCohortDate={nextCohortDate}
          onSetCohortStartDate={onSetCohortStartDate}
          onSetNextCohortDate={onSetNextCohortDate}
        />

        {/* Live Calls */}
        <LiveCallsManager calls={liveCalls || []} onSave={onSetLiveCalls} />

        {/* Skool Link Setting */}
        <SkoolLinkSetting skoolLink={skoolLink} onSave={onSetSkoolLink} />

        {/* Top Stats */}
        <div className="fade-up-delay-1 admin-stats-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12, marginBottom: 32,
        }}>
          <AdminStat label="Total Enrolled" value={nonAdmin.length} color="#888" />
          <AdminStat label="Active Now" value={active.length} color="#48c78e" />
          <AdminStat label="Pending" value={pending.length} color="#f0a500" />
          <AdminStat label="Removed" value={removed.length} color="#e94560" />
          <AdminStat label="Total UC Points" value={totalUCPoints.toLocaleString()} color="#f0a500" />
          <AdminStat label="Avg UC Points" value={avgUCPoints.toLocaleString()} color="#f0a500" />
          {INDICATOR_KEYS.map(key => (
            <AdminStat key={key} label={INDICATOR_SHORT_LABELS[key]} value={indicatorTotals[key]} color={INDICATOR_COLORS[key]} />
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'overview' && (
          <OverviewTab
            active={active}
            nonAdmin={nonAdmin}
            dayDistribution={dayDistribution}
            retentionRate={retentionRate}
            communityPosts={communityPosts || []}
            totalUCPoints={totalUCPoints}
            avgUCPoints={avgUCPoints}
          />
        )}
        {tab === 'participants' && !selectedParticipant && (
          <ParticipantsTab
            nonAdmin={nonAdmin}
            onRemove={onRemove}
            onDelete={onDelete}
            onReactivate={onReactivate}
            onApprove={onApprove}
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
            onApprove={onApprove}
            onToggleAdmin={onToggleAdmin}
            onResetPassword={onResetPassword}
            onVerifySubmissionSocial={onVerifySubmissionSocial}
            onWarnCommunityUser={onWarnCommunityUser}
            onBanCommunityUser={onBanCommunityUser}
            onViewAsUser={onViewAsUser}
            getContactsForParticipant={getContactsForParticipant}
            getUploads={getUploads}
            getUploadUrl={getUploadUrl}
          />
        )}
        {tab === 'compliance' && (
          <ComplianceTab
            complianceSettings={complianceSettings}
            onSetDailyMinimums={onSetComplianceDailyMinimums}
            onSetWeeklyMinimums={onSetComplianceWeeklyMinimums}
            onSetEnforcement={onSetComplianceEnforcement}
            getAllDailySubmissions={getAllDailySubmissions}
            getRemovalLog={getRemovalLog}
            participants={nonAdmin}
            cohortStartDate={cohortStartDate}
            onReactivate={onReactivate}
          />
        )}
        {tab === 'submissions' && (
          <SubmissionsTab nonAdmin={nonAdmin} onVerifySubmissionSocial={onVerifySubmissionSocial} />
        )}
        {tab === 'community' && (
          <AdminCommunityTab
            posts={communityPosts || []}
            participants={nonAdmin}
            onDeletePost={onDeleteCommunityPost}
            onDeleteComment={onDeleteCommunityComment}
            onPinPost={onPinCommunityPost}
            onWarnUser={onWarnCommunityUser}
            onBanUser={onBanCommunityUser}
            onCreatePost={onCreateCommunityPost}
            onComment={onCommentOnPost}
            user={user}
            cohortStartDate={cohortStartDate}
          />
        )}
        {tab === 'training-content' && (
          <TrainingContentTab
            trainingConfig={trainingConfig || {}}
            onSetTrainingConfig={onSetTrainingConfig}
            contentOverrides={contentOverrides}
            onSetContentOverrides={onSetContentOverrides}
            phases={phases}
            onSetPhases={onSetPhases}
            landingContent={landingContent}
            onSetLandingContent={onSetLandingContent}
            landingVersion={landingVersion}
            onSetLandingVersion={onSetLandingVersion}
            dailyMinimumsOverrides={dailyMinimumsOverrides || {}}
            onSetDailyMinimums={onSetDailyMinimums}
            practiceDaySettings={practiceDaySettings}
            onSetPracticeDaySettings={onSetPracticeDaySettings}
          />
        )}
        {tab === 'support' && (
          <SupportTab tickets={supportTickets || []} onUpdateTicket={onUpdateTicket} onReplyToTicket={onReplyToTicket} />
        )}
        {tab === 'social' && (
          <SocialProofTab
            active={active}
            nonAdmin={nonAdmin}
            totalOffers={totalOffers}
            totalAnalyzed={totalAnalyzed}
            indicatorTotals={indicatorTotals}
            retentionRate={retentionRate}
            dayDistribution={dayDistribution}
          />
        )}
        {tab === 'qa' && user?.isDeveloper && (
          <QAChecklistTab />
        )}
        {tab === 'revenue' && user?.isDeveloper && (
          <RevenueTab participants={participants} />
        )}
      </div>
      <Footer />
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

      {/* Suggested start dates (first Monday of each month's first full week) */}
      {editing && (
        <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(72,199,142,0.04)', border: '1px solid rgba(72,199,142,0.1)' }}>
          <div style={{ fontSize: 11, color: '#48c78e', fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
            Suggested Start Dates (First Monday)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(() => {
              const now = new Date();
              const suggestions = [];
              for (let i = 0; i < 6; i++) {
                const m = now.getMonth() + i;
                const y = now.getFullYear() + Math.floor(m / 12);
                const month = (m % 12) + 1;
                const date = getCohortStartDate(y, month);
                const label = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                suggestions.push({ date, label });
              }
              return suggestions.map(s => (
                <button key={s.date}
                  onClick={() => setDateValue(s.date)}
                  style={{
                    padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    border: dateValue === s.date ? '1px solid #48c78e' : '1px solid rgba(255,255,255,0.08)',
                    background: dateValue === s.date ? 'rgba(72,199,142,0.1)' : 'rgba(255,255,255,0.03)',
                    color: dateValue === s.date ? '#48c78e' : '#aaa',
                    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  }}>
                  {s.label}
                </button>
              ));
            })()}
          </div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 6 }}>
            Cohorts start on the first Monday of each month's first full week — guarantees 4 full Mon–Sun weeks.
          </div>
        </div>
      )}

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
// ── Skool Link Setting ──────────────────────────────────────
function SkoolLinkSetting({ skoolLink, onSave }) {
  const [editing, setEditing] = useState(false);
  const [linkValue, setLinkValue] = useState(skoolLink || '');

  const handleSave = () => {
    onSave(linkValue.trim() || null);
    setEditing(false);
  };

  return (
    <div className="card fade-up" style={{ marginBottom: 24, padding: '16px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>🔗</span>
          <div>
            <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              CDS Collective (Skool)
            </div>
            {!editing ? (
              <span style={{ fontSize: 14, color: skoolLink ? '#c9a0ff' : '#555' }}>
                {skoolLink || 'No Skool link set'}
              </span>
            ) : (
              <input
                type="url"
                value={linkValue}
                onChange={e => setLinkValue(e.target.value)}
                placeholder="https://www.skool.com/cds-collective"
                style={{ width: 340, maxWidth: '100%', fontSize: 13, padding: '8px 12px' }}
              />
            )}
          </div>
        </div>
        {!editing ? (
          <button
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: 13 }}
            onClick={() => { setLinkValue(skoolLink || ''); setEditing(true); }}
          >
            {skoolLink ? 'Edit' : 'Set Link'}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={handleSave}>
              Save
            </button>
            <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

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

function StatusBadge({ label, color }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
      background: `${color}15`, border: `1px solid ${color}30`, color,
    }}>
      {label}
    </span>
  );
}

// ── Admin Community Moderation Tab ────────────────────────
function AdminCommunityTab({ posts, participants, onDeletePost, onDeleteComment, onPinPost, onWarnUser, onBanUser, onCreatePost, onComment, user, cohortStartDate }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const [warnTarget, setWarnTarget] = useState(null);
  const [warnMessage, setWarnMessage] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'reported' | 'deleted'
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [adminComment, setAdminComment] = useState('');

  const sorted = [...(posts || [])].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const filtered = filter === 'deleted'
    ? sorted.filter(p => p.isDeleted)
    : filter === 'active'
    ? sorted.filter(p => !p.isDeleted)
    : sorted;

  const getAuthor = (authorId) => participants.find(p => p.id === authorId);

  function timeAgo(dateStr) {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  // Detail view for a single post
  if (selectedPost) {
    const post = posts.find(p => p.id === selectedPost) || {};
    const author = getAuthor(post.authorId);
    const comments = (post.comments || []);
    return (
      <div className="fade-up">
        <button
          className="btn-secondary"
          onClick={() => setSelectedPost(null)}
          style={{ marginBottom: 16, padding: '8px 16px', fontSize: 13 }}
        >
          ← Back to Posts
        </button>

        <div className="card" style={{
          padding: 20, marginBottom: 16,
          borderLeft: post.isPinned ? '3px solid #e94560' : undefined,
          opacity: post.isDeleted ? 0.5 : 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            {post.isPinned && <span style={{ fontSize: 10, fontWeight: 700, color: '#e94560', background: 'rgba(233,69,96,0.1)', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>Pinned</span>}
            {post.isDeleted && <span style={{ fontSize: 10, fontWeight: 700, color: '#ff5050', background: 'rgba(255,80,80,0.1)', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>Deleted</span>}
            <span style={{ fontWeight: 600, fontSize: 14 }}>{post.authorName}</span>
            <span style={{ fontSize: 11, color: '#555' }}>{post.createdAt ? timeAgo(post.createdAt) : ''}</span>
            {post.dayTag != null && (
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(72,199,142,0.1)', color: '#48c78e', fontWeight: 600 }}>
                {post.dayTag === 'getting_started' ? 'Getting Started' : `Day ${post.dayTag}`}
              </span>
            )}
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{post.title}</h3>
          {post.body && <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{post.body}</p>}

          {/* Admin actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
            {!post.isDeleted && (
              <>
                <button
                  onClick={() => onPinPost(post.id, !post.isPinned)}
                  style={{ fontSize: 11, padding: '4px 10px', borderRadius: 5, cursor: 'pointer', border: '1px solid rgba(233,69,96,0.2)', background: 'rgba(233,69,96,0.06)', color: '#e94560', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
                >
                  {post.isPinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  onClick={() => { if (confirm('Delete this post?')) { onDeletePost(post.id); setSelectedPost(null); } }}
                  style={{ fontSize: 11, padding: '4px 10px', borderRadius: 5, cursor: 'pointer', border: '1px solid rgba(255,80,80,0.2)', background: 'rgba(255,80,80,0.06)', color: '#ff5050', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
                >
                  Delete Post
                </button>
              </>
            )}
            {author && (
              <>
                <button
                  onClick={() => { setWarnTarget(post.authorId); setWarnMessage(''); }}
                  style={{ fontSize: 11, padding: '4px 10px', borderRadius: 5, cursor: 'pointer', border: '1px solid rgba(240,165,0,0.2)', background: 'rgba(240,165,0,0.06)', color: '#f0a500', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
                >
                  Warn Author
                </button>
                <button
                  onClick={() => { if (confirm(`${author.communityBanned ? 'Unban' : 'Ban'} ${post.authorName} from community?`)) onBanUser(post.authorId, !author.communityBanned); }}
                  style={{ fontSize: 11, padding: '4px 10px', borderRadius: 5, cursor: 'pointer', border: `1px solid ${author.communityBanned ? 'rgba(72,199,142,0.2)' : 'rgba(255,80,80,0.2)'}`, background: author.communityBanned ? 'rgba(72,199,142,0.06)' : 'rgba(255,80,80,0.06)', color: author.communityBanned ? '#48c78e' : '#ff5050', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
                >
                  {author.communityBanned ? 'Unban Author' : 'Ban Author'}
                </button>
              </>
            )}
          </div>
          {warnTarget === post.authorId && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'flex-end' }}>
              <input type="text" placeholder="Warning message..." value={warnMessage} onChange={e => setWarnMessage(e.target.value)} style={{ flex: 1, fontSize: 13, padding: '8px 12px' }} />
              <button className="btn-primary" disabled={!warnMessage.trim()} onClick={async () => { await onWarnUser(post.authorId, warnMessage.trim()); setWarnTarget(null); setWarnMessage(''); }} style={{ padding: '8px 14px', fontSize: 12, opacity: !warnMessage.trim() ? 0.5 : 1 }}>Send</button>
              <button className="btn-secondary" onClick={() => setWarnTarget(null)} style={{ padding: '8px 14px', fontSize: 12 }}>Cancel</button>
            </div>
          )}
        </div>

        {/* Admin reply */}
        {!post.isDeleted && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'flex-end' }}>
            <input
              type="text"
              placeholder="Reply as admin..."
              value={adminComment}
              onChange={e => setAdminComment(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && adminComment.trim()) {
                  onComment(post.id, adminComment.trim());
                  setAdminComment('');
                }
              }}
              style={{ flex: 1, fontSize: 13, padding: '8px 12px' }}
            />
            <button
              className="btn-primary"
              disabled={!adminComment.trim()}
              onClick={() => {
                onComment(post.id, adminComment.trim());
                setAdminComment('');
              }}
              style={{ padding: '8px 16px', fontSize: 12, opacity: !adminComment.trim() ? 0.5 : 1 }}
            >
              Reply
            </button>
          </div>
        )}

        {/* Comments */}
        <h4 style={{ fontSize: 13, color: '#888', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Comments ({comments.length})
        </h4>
        {comments.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <p style={{ color: '#666', fontSize: 13 }}>No comments on this post.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {comments.map(c => (
              <div key={c.id} className="card" style={{ padding: '10px 14px', opacity: c.isDeleted ? 0.5 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 12 }}>{c.isDeleted ? '' : c.authorName}</span>
                  <span style={{ fontSize: 10, color: '#555' }}>{c.createdAt ? timeAgo(c.createdAt) : ''}</span>
                  {c.isDeleted && <span style={{ fontSize: 10, color: '#ff5050', fontStyle: 'italic' }}>[Deleted]</span>}
                </div>
                <p style={{ fontSize: 13, color: c.isDeleted ? '#555' : '#ccc', lineHeight: 1.5, fontStyle: c.isDeleted ? 'italic' : 'normal' }}>
                  {c.isDeleted ? '[Removed by moderator]' : c.text}
                </p>
                {!c.isDeleted && (
                  <button
                    onClick={() => onDeleteComment(post.id, c.id)}
                    style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, cursor: 'pointer', border: '1px solid rgba(255,80,80,0.2)', background: 'transparent', color: '#ff5050', fontWeight: 600, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Delete Comment
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="fade-up">
      {/* Admin New Post */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <button
          onClick={() => setShowNewPost(!showNewPost)}
          className="btn-primary"
          style={{ padding: '8px 18px', fontSize: 13 }}
        >
          {showNewPost ? 'Cancel' : '+ New Post as Admin'}
        </button>
      </div>
      {showNewPost && (
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Post title..."
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            style={{ width: '100%', fontSize: 14, padding: '10px 12px', marginBottom: 10, boxSizing: 'border-box' }}
          />
          <textarea
            placeholder="Post body (optional)..."
            value={newBody}
            onChange={e => setNewBody(e.target.value)}
            rows={4}
            style={{ width: '100%', fontSize: 13, padding: '10px 12px', resize: 'vertical', marginBottom: 10, boxSizing: 'border-box' }}
          />
          <button
            className="btn-primary"
            disabled={!newTitle.trim()}
            onClick={async () => {
              await onCreatePost(newTitle.trim(), newBody.trim(), null, cohortStartDate);
              setNewTitle('');
              setNewBody('');
              setShowNewPost(false);
            }}
            style={{ padding: '8px 20px', fontSize: 13, opacity: !newTitle.trim() ? 0.5 : 1 }}
          >
            Post
          </button>
        </div>
      )}

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { value: 'all', label: `All (${sorted.length})` },
          { value: 'active', label: `Active (${sorted.filter(p => !p.isDeleted).length})` },
          { value: 'deleted', label: `Deleted (${sorted.filter(p => p.isDeleted).length})` },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              fontSize: 12, padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
              border: `1px solid ${filter === f.value ? 'rgba(233,69,96,0.4)' : 'rgba(255,255,255,0.08)'}`,
              background: filter === f.value ? 'rgba(233,69,96,0.1)' : 'transparent',
              color: filter === f.value ? '#e94560' : '#888',
              fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Banned users summary */}
      {participants.filter(p => p.communityBanned).length > 0 && (
        <div className="card" style={{ padding: '10px 16px', marginBottom: 16, background: 'rgba(255,80,80,0.04)', border: '1px solid rgba(255,80,80,0.15)' }}>
          <span style={{ fontSize: 12, color: '#ff5050', fontWeight: 600 }}>
            {participants.filter(p => p.communityBanned).length} banned user{participants.filter(p => p.communityBanned).length !== 1 ? 's' : ''}:
          </span>
          <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>
            {participants.filter(p => p.communityBanned).map(p => `${p.firstName} ${p.lastName}`).join(', ')}
          </span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
          <p style={{ color: '#666' }}>No community posts yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(post => {
            const commentCount = (post.comments || []).filter(c => !c.isDeleted).length;
            const author = getAuthor(post.authorId);
            return (
              <div
                key={post.id}
                className="card"
                onClick={() => setSelectedPost(post.id)}
                style={{
                  padding: '14px 18px', cursor: 'pointer',
                  borderLeft: post.isPinned ? '3px solid #e94560' : undefined,
                  opacity: post.isDeleted ? 0.5 : 1,
                  transition: 'border-color 0.15s',
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(233,69,96,0.3)'}
                onMouseOut={e => e.currentTarget.style.borderColor = ''}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  {post.isPinned && <span style={{ fontSize: 9, fontWeight: 700, color: '#e94560', background: 'rgba(233,69,96,0.1)', padding: '1px 5px', borderRadius: 3, textTransform: 'uppercase' }}>Pinned</span>}
                  {post.isDeleted && <span style={{ fontSize: 9, fontWeight: 700, color: '#ff5050', background: 'rgba(255,80,80,0.1)', padding: '1px 5px', borderRadius: 3, textTransform: 'uppercase' }}>Deleted</span>}
                  {author?.communityBanned && <span style={{ fontSize: 9, fontWeight: 700, color: '#ff5050', background: 'rgba(255,80,80,0.1)', padding: '1px 5px', borderRadius: 3, textTransform: 'uppercase' }}>Banned</span>}
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{post.authorName}</span>
                  <span style={{ fontSize: 11, color: '#555' }}>{post.createdAt ? timeAgo(post.createdAt) : ''}</span>
                  {post.dayTag != null && (
                    <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 3, background: 'rgba(72,199,142,0.1)', color: '#48c78e', fontWeight: 600 }}>
                      {post.dayTag === 'getting_started' ? 'GS' : `Day ${post.dayTag}`}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: '#666', marginLeft: 'auto' }}>
                    {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{post.title}</div>
                {post.body && (
                  <p style={{ color: '#888', fontSize: 12, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.body}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OverviewTab({ active, nonAdmin, dayDistribution, retentionRate, communityPosts, totalUCPoints, avgUCPoints }) {
  const maxCount = Math.max(...Object.values(dayDistribution), 1);

  // Community stats
  const livePosts = communityPosts.filter(p => !p.isDeleted);
  const totalComments = livePosts.reduce((s, p) => s + (p.comments || []).filter(c => !c.isDeleted).length, 0);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayPosts = livePosts.filter(p => p.createdAt?.startsWith(todayStr)).length;
  const todayComments = livePosts.reduce((s, p) =>
    s + (p.comments || []).filter(c => !c.isDeleted && c.createdAt?.startsWith(todayStr)).length, 0
  );

  // Leaderboard: Top 5 by UC Points
  const topOperators = [...nonAdmin]
    .filter(p => p.isActive)
    .map(p => ({ ...p, ucPts: p.ucPoints || calculateUCPoints(p.metrics || {}) }))
    .sort((a, b) => b.ucPts - a.ucPts)
    .slice(0, 5);

  return (
    <div className="fade-up">
      {/* UC Points Overview */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>UC Points Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          <div style={{ textAlign: 'center', padding: 16, borderRadius: 10, background: 'rgba(240,165,0,0.06)', border: '1px solid rgba(240,165,0,0.15)' }}>
            <div className="mono" style={{ fontSize: 32, fontWeight: 700, color: '#f0a500' }}>{totalUCPoints.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Total UC Points</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, borderRadius: 10, background: 'rgba(240,165,0,0.04)' }}>
            <div className="mono" style={{ fontSize: 32, fontWeight: 700, color: '#f0a500' }}>{avgUCPoints.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Avg per Operator</div>
          </div>
        </div>
      </div>

      {/* Top 5 Leaderboard */}
      {topOperators.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Top Operators by UC Points</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topOperators.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10,
                background: i === 0 ? 'rgba(240,165,0,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${i === 0 ? 'rgba(240,165,0,0.2)' : 'rgba(255,255,255,0.06)'}`,
              }}>
                <div className="mono" style={{
                  width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: i < 3 ? 16 : 12, fontWeight: 700,
                  color: i === 0 ? '#f0a500' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#666',
                  background: i < 3 ? `${i === 0 ? '#f0a500' : i === 1 ? '#c0c0c0' : '#cd7f32'}15` : 'rgba(255,255,255,0.04)',
                }}>
                  {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{p.firstName} {p.lastName}</div>
                  <div style={{ fontSize: 11, color: '#666' }}>{p.email}</div>
                </div>
                <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: '#f0a500' }}>
                  {p.ucPts.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community Engagement */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Community Engagement</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12 }}>
          <div style={{ textAlign: 'center', padding: 12, borderRadius: 10, background: 'rgba(233,69,96,0.06)' }}>
            <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#e94560' }}>{todayPosts}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Posts Today</div>
          </div>
          <div style={{ textAlign: 'center', padding: 12, borderRadius: 10, background: 'rgba(83,52,131,0.06)' }}>
            <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#533483' }}>{todayComments}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Comments Today</div>
          </div>
          <div style={{ textAlign: 'center', padding: 12, borderRadius: 10, background: 'rgba(72,199,142,0.06)' }}>
            <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#48c78e' }}>{livePosts.length}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Total Posts</div>
          </div>
          <div style={{ textAlign: 'center', padding: 12, borderRadius: 10, background: 'rgba(240,165,0,0.06)' }}>
            <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#f0a500' }}>{totalComments}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Total Comments</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Active Operators by Day</h3>
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
            {active.length} of {nonAdmin.length} Operators still active
          </div>
        </div>
      </div>
    </div>
  );
}

function ParticipantsTab({ nonAdmin, onRemove, onDelete, onReactivate, onApprove, onToggleAdmin, onResetPassword, onSelect }) {
  const [filter, setFilter] = useState('all');
  const pendingCount = nonAdmin.filter(p => !p.approved).length;
  const filtered = filter === 'all' ? nonAdmin
    : filter === 'active' ? nonAdmin.filter(p => p.isActive)
    : filter === 'pending' ? nonAdmin.filter(p => !p.approved)
    : filter === 'removed' ? nonAdmin.filter(p => !p.isActive)
    : filter === 'refund' ? nonAdmin.filter(p => p.refundEligible !== false)
    : nonAdmin;

  const refundCount = nonAdmin.filter(p => p.refundEligible !== false).length;

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'active', 'pending', 'removed', 'refund'].map(f => {
          const labels = { all: 'All', active: 'Active', pending: 'Pending', removed: 'Removed', refund: 'Refund Eligible' };
          const counts = {
            all: nonAdmin.length,
            active: nonAdmin.filter(p => p.isActive).length,
            pending: pendingCount,
            removed: nonAdmin.filter(p => !p.isActive).length,
            refund: refundCount,
          };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? 'rgba(233,69,96,0.15)' : 'rgba(255,255,255,0.04)',
                color: filter === f ? '#e94560' : '#888',
                border: filter === f ? '1px solid rgba(233,69,96,0.3)' : '1px solid rgba(255,255,255,0.06)',
                padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              }}
            >
              {labels[f]} ({counts[f]})
            </button>
          );
        })}
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
                  background: !p.approved ? 'rgba(240,165,0,0.15)' : p.isActive ? 'rgba(72,199,142,0.15)' : 'rgba(233,69,96,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0,
                }}>
                  {!p.approved ? '🟡' : p.isActive ? '🟢' : '🔴'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{p.firstName} {p.lastName}</span>
                    {!p.approved && (
                      <span style={{
                        fontSize: 10, fontWeight: 600, color: '#f0a500',
                        background: 'rgba(240,165,0,0.1)', padding: '2px 8px',
                        borderRadius: 4, flexShrink: 0,
                      }}>Pending</span>
                    )}
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
                <MiniStat label="UC Pts" value={p.ucPoints || calculateUCPoints(p.metrics || {})} color="#f0a500" />
                <MiniStat label="Offers" value={p.metrics?.offersSubmitted || 0} color="#e94560" />
                <MiniStat label="Subs" value={p.submissions?.length || 0} color="#888" />
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
                  {!p.approved && (
                    <button
                      style={{
                        background: 'rgba(72,199,142,0.12)', color: '#48c78e',
                        border: '1px solid rgba(72,199,142,0.3)', padding: '6px 12px',
                        borderRadius: 8, fontSize: 12, cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                      }}
                      onClick={() => onApprove(p.id)}
                    >
                      Approve
                    </button>
                  )}
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
function ParticipantDetail({ participant, onBack, onRemove, onDelete, onReactivate, onApprove, onToggleAdmin, onResetPassword, onVerifySubmissionSocial, onWarnCommunityUser, onBanCommunityUser, onViewAsUser, getContactsForParticipant, getUploads, getUploadUrl }) {
  const [showWarnInput, setShowWarnInput] = useState(false);
  const [warnMessage, setWarnMessage] = useState('');
  const [crmContacts, setCrmContacts] = useState(null);
  const [loadingCrm, setLoadingCrm] = useState(false);
  const [crmExpanded, setCrmExpanded] = useState(false);
  const p = participant;

  // Offer tracking (weekly)
  const currentDay = p.currentDay || 1;
  const weekNum = currentDay <= 30 ? getChallengeWeek(currentDay) : null;
  const weeklyTarget = weekNum ? getWeeklyOfferTarget(currentDay) : null;

  const handleLoadCrm = async () => {
    if (crmContacts !== null) { setCrmExpanded(!crmExpanded); return; }
    if (!getContactsForParticipant) return;
    setLoadingCrm(true);
    const contacts = await Promise.resolve(getContactsForParticipant(p.id));
    setCrmContacts(contacts || []);
    setCrmExpanded(true);
    setLoadingCrm(false);
  };

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
              background: !p.approved ? 'rgba(240,165,0,0.15)' : p.isActive ? 'rgba(72,199,142,0.15)' : 'rgba(233,69,96,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}>
              {!p.approved ? '🟡' : p.isActive ? '🟢' : '🔴'}
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
                background: 'rgba(240,165,0,0.08)', color: '#f0a500',
                border: '1px solid rgba(240,165,0,0.2)', padding: '8px 16px',
                borderRadius: 8, fontSize: 13, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
              }}
              onClick={() => onViewAsUser(p.id)}
            >
              View as User
            </button>
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
            {!p.approved && (
              <button
                style={{
                  background: 'rgba(72,199,142,0.12)', color: '#48c78e',
                  border: '1px solid rgba(72,199,142,0.3)', padding: '8px 16px',
                  borderRadius: 8, fontSize: 13, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                }}
                onClick={() => onApprove(p.id)}
              >
                Approve
              </button>
            )}
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

          {/* Community Moderation */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Community</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {p.communityBanned && (
                <span style={{ fontSize: 11, color: '#ff5050', fontWeight: 600 }}>Banned from community</span>
              )}
              <button
                style={{
                  background: p.communityBanned ? 'rgba(72,199,142,0.08)' : 'rgba(255,80,80,0.08)',
                  color: p.communityBanned ? '#48c78e' : '#ff5050',
                  border: `1px solid ${p.communityBanned ? 'rgba(72,199,142,0.2)' : 'rgba(255,80,80,0.2)'}`,
                  padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                }}
                onClick={() => {
                  const action = p.communityBanned ? 'unban' : 'ban';
                  if (confirm(`${action === 'ban' ? 'Ban' : 'Unban'} ${p.firstName} from the community?`)) {
                    onBanCommunityUser(p.id, !p.communityBanned);
                  }
                }}
              >
                {p.communityBanned ? 'Unban from Community' : 'Ban from Community'}
              </button>
              <button
                style={{
                  background: 'rgba(240,165,0,0.08)', color: '#f0a500',
                  border: '1px solid rgba(240,165,0,0.2)', padding: '6px 14px',
                  borderRadius: 8, fontSize: 12, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                }}
                onClick={() => setShowWarnInput(!showWarnInput)}
              >
                Warn User
              </button>
              {(p.communityWarnings || []).length > 0 && (
                <span style={{ fontSize: 11, color: '#f0a500' }}>
                  {p.communityWarnings.length} warning{p.communityWarnings.length !== 1 ? 's' : ''} issued
                </span>
              )}
            </div>
            {showWarnInput && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'flex-end' }}>
                <input
                  type="text"
                  placeholder="Warning message..."
                  value={warnMessage}
                  onChange={e => setWarnMessage(e.target.value)}
                  style={{ flex: 1, fontSize: 13, padding: '8px 12px' }}
                />
                <button
                  className="btn-primary"
                  disabled={!warnMessage.trim()}
                  onClick={async () => {
                    await onWarnCommunityUser(p.id, warnMessage.trim());
                    setWarnMessage('');
                    setShowWarnInput(false);
                  }}
                  style={{ padding: '8px 16px', fontSize: 12, opacity: !warnMessage.trim() ? 0.5 : 1 }}
                >
                  Send Warning
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guarantee & Activation Status */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Guarantee & Activation
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <StatusBadge
            label={`Cohort Attempt #${p.cohortAttempt || 1}`}
            color="#888"
          />
          {(p.cohortAttempt || 1) >= 2 && (
            <StatusBadge label="Veteran Minimums" color="#a855f7" />
          )}
          {(p.ucGraduateCount || 0) > 0 && (
            <StatusBadge label={`UC Graduate x${p.ucGraduateCount}`} color="#f0a500" />
          )}
          {p.pipelineMode && (
            <StatusBadge label="Pipeline Mode" color="#6366f1" />
          )}
          <StatusBadge
            label={p.refundEligible !== false ? 'Refund Eligible' : 'Not Refund Eligible'}
            color={p.refundEligible !== false ? '#48c78e' : '#e94560'}
          />
          <StatusBadge
            label={p.firstCohortCompleted ? 'First Cohort Completed' : 'First Cohort Incomplete'}
            color={p.firstCohortCompleted ? '#48c78e' : '#666'}
          />
          <StatusBadge
            label={p.activationCompleted ? 'Activated' : 'Not Activated'}
            color={p.activationCompleted ? '#48c78e' : '#f0a500'}
          />
          {p.offerCommitment && (
            <StatusBadge
              label={`${p.offerCommitment} offers committed`}
              color="#f0a500"
            />
          )}
          {(p.trainingCompletedDays || []).length > 0 && (
            <StatusBadge
              label={`${(p.trainingCompletedDays || []).length}/30 Training Days`}
              color="#48c78e"
            />
          )}
        </div>
        {p.stakesDeclaration && (
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(233,69,96,0.04)', border: '1px solid rgba(233,69,96,0.1)' }}>
            <div style={{ fontSize: 11, color: '#666', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Stakes Declaration</div>
            <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>"{p.stakesDeclaration}"</p>
          </div>
        )}
        {/* Cohort History */}
        {(p.cohortHistory || []).length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, color: '#666', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Cohort History</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(p.cohortHistory || []).map((h, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                  borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  fontSize: 12,
                }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 11,
                    background: h.result === 'completed' ? 'rgba(72,199,142,0.1)' : 'rgba(233,69,96,0.1)',
                    color: h.result === 'completed' ? '#48c78e' : '#e94560',
                  }}>
                    #{h.cohortAttempt}
                  </span>
                  <span style={{ color: h.result === 'completed' ? '#48c78e' : '#e94560', fontWeight: 600 }}>
                    {h.result === 'completed' ? 'Completed' : 'Failed'}
                  </span>
                  <span style={{ color: '#666' }}>
                    {h.daysCompleted || 0} days completed
                  </span>
                  <span style={{ color: '#555', marginLeft: 'auto', fontSize: 11 }}>
                    {h.completedAt ? new Date(h.completedAt).toLocaleDateString() : h.removedAt ? new Date(h.removedAt).toLocaleDateString() : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
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
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#f0a500' }}>
            {p.ucPoints || calculateUCPoints(p.metrics || {})}
          </div>
          <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>UC Points</div>
        </div>
        {INDICATOR_KEYS.map(key => (
          <div key={key} className="card" style={{ textAlign: 'center', padding: 16 }}>
            <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: INDICATOR_COLORS[key] }}>
              {p.metrics?.[key] || 0}
            </div>
            <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>{INDICATOR_SHORT_LABELS[key]}</div>
          </div>
        ))}
      </div>

      {/* Activity Map */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Activity Map</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
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

      {/* Offer Tracking (Weekly) */}
      {weeklyTarget && weeklyTarget > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Week {weekNum} Offer Tracking</h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{weeklyTarget}</div>
              <div style={{ fontSize: 11, color: '#888' }}>Weekly Target</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: '#f0a500' }}>
                {p.metrics?.offersSubmitted || 0}
              </div>
              <div style={{ fontSize: 11, color: '#888' }}>Total Offers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: '#c9a0ff' }}>
                {p.lifetimeOffersSubmitted || 0}
              </div>
              <div style={{ fontSize: 11, color: '#888' }}>Lifetime Offers</div>
            </div>
          </div>
        </div>
      )}

      {/* CRM Data */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>CRM Contacts</h3>
          <button onClick={handleLoadCrm} className="btn-secondary" style={{ padding: '6px 14px', fontSize: 12 }}>
            {loadingCrm ? 'Loading...' : crmExpanded ? 'Hide' : 'View Contacts'}
          </button>
        </div>
        {crmExpanded && crmContacts && (
          <div style={{ marginTop: 16 }}>
            {crmContacts.length === 0 ? (
              <div style={{ fontSize: 13, color: '#666', fontStyle: 'italic' }}>No contacts added yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{crmContacts.length} total contacts</div>
                {crmContacts.map(c => (
                  <div key={c.id} style={{
                    padding: '10px 14px', background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 13,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: '#ddd' }}>{c.name}</span>
                      <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: 'rgba(233,69,96,0.08)', color: '#e94560' }}>
                        {c.contact_type}
                      </span>
                      <span style={{ fontSize: 11, color: '#555' }}>Day {c.day_added}</span>
                    </div>
                    {c.phone && <div style={{ fontSize: 12, color: '#888' }}>📞 {c.phone}</div>}
                    {c.email && <div style={{ fontSize: 12, color: '#888' }}>✉ {c.email}</div>}
                    {c.notes && <div style={{ fontSize: 12, color: '#666', marginTop: 4, fontStyle: 'italic' }}>{c.notes}</div>}
                    {c.follow_ups && c.follow_ups.length > 0 && (
                      <div style={{ marginTop: 6, paddingLeft: 12, borderLeft: '2px solid rgba(72,199,142,0.2)' }}>
                        <div style={{ fontSize: 11, color: '#48c78e', marginBottom: 4 }}>{c.follow_ups.length} follow-up{c.follow_ups.length > 1 ? 's' : ''}</div>
                        {c.follow_ups.map((f, i) => (
                          <div key={f.id || i} style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>
                            Day {f.day_number}: {f.notes}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
                  {sub.socialMediaPosted && (
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => onVerifySubmissionSocial(p.id, sub.day, !sub.socialMediaVerified)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            fontSize: 12, padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
                            border: `1px solid ${sub.socialMediaVerified ? 'rgba(72,199,142,0.3)' : 'rgba(240,165,0,0.3)'}`,
                            background: sub.socialMediaVerified ? 'rgba(72,199,142,0.1)' : 'rgba(240,165,0,0.08)',
                            color: sub.socialMediaVerified ? '#48c78e' : '#f0a500',
                            fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                          }}
                        >
                          {sub.socialMediaVerified ? '✓ Social Verified' : '⏳ Verify Social Post'}
                        </button>
                        <SocialHandleLinks socialHandles={p.socialHandles} />
                      </div>
                    </div>
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
function SubmissionsTab({ nonAdmin, onVerifySubmissionSocial }) {
  const [selectedDay, setSelectedDay] = useState(0);

  const allSubmissions = [];
  nonAdmin.forEach(p => {
    (p.submissions || []).forEach(sub => {
      allSubmissions.push({
        ...sub,
        participantName: `${p.firstName} ${p.lastName}`,
        participantEmail: p.email,
        participantId: p.id,
        participantSocialHandles: p.socialHandles || {},
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
              return dayData ? (
                <option key={dayNum} value={dayNum}>
                  Day {dayNum}: {dayData.title} ({count})
                </option>
              ) : null;
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
                  {sub.socialMediaPosted && (
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => onVerifySubmissionSocial(sub.participantId, sub.day, !sub.socialMediaVerified)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            fontSize: 12, padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
                            border: `1px solid ${sub.socialMediaVerified ? 'rgba(72,199,142,0.3)' : 'rgba(240,165,0,0.3)'}`,
                            background: sub.socialMediaVerified ? 'rgba(72,199,142,0.1)' : 'rgba(240,165,0,0.08)',
                            color: sub.socialMediaVerified ? '#48c78e' : '#f0a500',
                            fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                          }}
                        >
                          {sub.socialMediaVerified ? '✓ Social Verified' : '⏳ Verify Social Post'}
                        </button>
                        <SocialHandleLinks socialHandles={sub.participantSocialHandles} />
                      </div>
                    </div>
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
// ── Daily Minimums Editor ──────────────────────────────────
const DAILY_MIN_KEYS = ['properties_analyzed', 'arsenal_contacts', 'target_contacts', 'follow_ups'];
const DAILY_MIN_LABELS = {
  properties_analyzed: 'Properties',
  arsenal_contacts: 'Arsenal',
  target_contacts: 'Target',
  follow_ups: 'Follow-Ups',
};

function DailyMinimumsEditor({ overrides, onSave, onBack }) {
  const [values, setValues] = useState(() => {
    const v = {};
    for (let d = 1; d <= 30; d++) {
      const defaults = DAILY_MINIMUMS[d] || {};
      const over = overrides[d] || {};
      v[d] = {};
      DAILY_MIN_KEYS.forEach(k => {
        v[d][k] = over[k] !== undefined ? over[k] : (defaults[k] || 0);
      });
    }
    return v;
  });

  const handleChange = (day, key, val) => {
    const num = Math.max(0, parseInt(val) || 0);
    setValues(prev => ({
      ...prev,
      [day]: { ...prev[day], [key]: num },
    }));
  };

  const handleSave = () => {
    const result = {};
    for (let d = 1; d <= 30; d++) {
      const defaults = DAILY_MINIMUMS[d] || {};
      const hasChange = DAILY_MIN_KEYS.some(k => (values[d][k] || 0) !== (defaults[k] || 0));
      if (hasChange) {
        result[d] = values[d];
      }
    }
    onSave(result);
  };

  return (
    <div className="scale-in">
      <button className="btn-secondary" onClick={onBack} style={{ marginBottom: 24, padding: '8px 20px', fontSize: 13 }}>
        ← Back to Content
      </button>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Daily Standards Editor</h2>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>
        Set the minimum required count for each indicator on each day of the sprint.
        Training is always required. Offers are tracked as weekly targets.
      </p>

      <div style={{ overflowX: 'auto', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '8px 6px', textAlign: 'left', color: '#888', fontWeight: 600 }}>Day</th>
              {DAILY_MIN_KEYS.map(k => (
                <th key={k} style={{ padding: '8px 6px', textAlign: 'center', color: '#ccc', fontWeight: 600 }}>
                  {DAILY_MIN_LABELS[k]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 30 }, (_, i) => {
              const d = i + 1;
              return (
                <tr key={d} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="mono" style={{ padding: '6px', fontWeight: 600, color: '#ccc' }}>{d}</td>
                  {DAILY_MIN_KEYS.map(k => (
                    <td key={k} style={{ padding: '4px 3px', textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        value={values[d]?.[k] ?? 0}
                        onChange={e => handleChange(d, k, e.target.value)}
                        style={{
                          width: 48, textAlign: 'center', fontSize: 12, padding: '4px',
                          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 4, color: '#fff',
                        }}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button className="btn-primary" onClick={handleSave} style={{ padding: '12px 32px' }}>
        Save Daily Standards
      </button>
    </div>
  );
}

function TrainingContentTab({ trainingConfig, onSetTrainingConfig, contentOverrides, onSetContentOverrides, phases, onSetPhases, landingContent, onSetLandingContent, landingVersion, onSetLandingVersion, dailyMinimumsOverrides, onSetDailyMinimums, practiceDaySettings, onSetPracticeDaySettings }) {
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrinciples, setEditPrinciples] = useState([]);
  const [editKeyTerms, setEditKeyTerms] = useState([]);
  const [editCompletionMessage, setEditCompletionMessage] = useState('');
  const [expandedPrinciple, setExpandedPrinciple] = useState(null);
  const [moduleSaving, setModuleSaving] = useState(false);
  const [moduleSaved, setModuleSaved] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [editingPhases, setEditingPhases] = useState(false);
  const [editingLanding, setEditingLanding] = useState(false);
  const [editingMinimums, setEditingMinimums] = useState(false);
  const [reorderingDays, setReorderingDays] = useState(false);
  const [previewingStep, setPreviewingStep] = useState(null);
  const [pdVideoUrl, setPdVideoUrl] = useState(practiceDaySettings?.practice_day_video || '');
  const [pdCalcUrl, setPdCalcUrl] = useState(practiceDaySettings?.rental_calculator_url || '');
  const [pdSaving, setPdSaving] = useState(false);
  const [pdSaved, setPdSaved] = useState(false);

  const modules = getResolvedTrainingModules(trainingConfig);
  const overrides = trainingConfig.moduleOverrides || {};
  const moduleOrder = trainingConfig.moduleOrder || modules.map(m => m.id);

  const moveModule = (idx, direction) => {
    const order = [...moduleOrder];
    if (order.length === 0) {
      modules.forEach(m => order.push(m.id));
    }
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= order.length) return;
    [order[idx], order[targetIdx]] = [order[targetIdx], order[idx]];
    onSetTrainingConfig({ ...trainingConfig, moduleOrder: order });
  };

  const toggleHidden = (moduleId) => {
    const current = overrides[moduleId] || {};
    const updated = {
      ...trainingConfig,
      moduleOverrides: {
        ...overrides,
        [moduleId]: { ...current, hidden: !current.hidden },
      },
    };
    onSetTrainingConfig(updated);
  };

  const startEditingModule = (mod) => {
    setEditingModuleId(mod.id);
    setEditTitle(mod.title);
    setEditDescription(mod.description || '');
    setEditPrinciples(JSON.parse(JSON.stringify(mod.principles || [])));
    setEditKeyTerms(JSON.parse(JSON.stringify(mod.keyTerms || [])));
    setEditCompletionMessage(mod.completionMessage || '');
    setExpandedPrinciple(null);
  };

  const saveModuleEdit = async () => {
    setModuleSaving(true);
    const current = overrides[editingModuleId] || {};
    const defaultMod = TRAINING_MODULES.find(m => m.id === editingModuleId);
    const overrideData = { ...current };
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    // Only store a field as an override if it actually differs from the code default.
    // Otherwise delete it so future code updates to that module flow through.
    const setOrClear = (key, val, def) => {
      if (def !== undefined && same(val, def)) delete overrideData[key];
      else overrideData[key] = val;
    };
    setOrClear('title', editTitle, defaultMod?.title);
    setOrClear('description', editDescription, defaultMod?.description ?? '');
    setOrClear('principles', editPrinciples, defaultMod?.principles);
    setOrClear('keyTerms', editKeyTerms, defaultMod?.keyTerms);
    setOrClear('completionMessage', editCompletionMessage, defaultMod?.completionMessage ?? '');
    const nextOverrides = { ...overrides };
    if (Object.keys(overrideData).length === 0) delete nextOverrides[editingModuleId];
    else nextOverrides[editingModuleId] = overrideData;
    await onSetTrainingConfig({ ...trainingConfig, moduleOverrides: nextOverrides });
    setModuleSaving(false);
    setModuleSaved(true);
    setTimeout(() => setModuleSaved(false), 3000);
  };

  // Clear a module's saved override so the live course uses the latest code version.
  const clearModuleOverride = async (moduleId) => {
    const nextOverrides = { ...overrides };
    delete nextOverrides[moduleId];
    await onSetTrainingConfig({ ...trainingConfig, moduleOverrides: nextOverrides });
    const defaultMod = TRAINING_MODULES.find(m => m.id === moduleId);
    if (defaultMod && editingModuleId === moduleId) {
      setEditTitle(defaultMod.title);
      setEditDescription(defaultMod.description || '');
      setEditPrinciples(JSON.parse(JSON.stringify(defaultMod.principles || [])));
      setEditKeyTerms(JSON.parse(JSON.stringify(defaultMod.keyTerms || [])));
      setEditCompletionMessage(defaultMod.completionMessage || '');
      setExpandedPrinciple(null);
    }
    setModuleSaved(true);
    setTimeout(() => setModuleSaved(false), 3000);
  };

  const PREVIEW_STEPS = {
    getClear: { component: GetClearStep, title: 'Get Clear', props: { existing: {}, buyBoxData: null } },
    buyBox: { component: BuyBoxStep, title: 'Define Your Buy Box', props: { existingBuyBox: {}, user: null } },
    capital: { component: CapitalConfirmationStep, title: 'Confirm Access to Capital', props: { existingCapital: {} } },
    capitalStrategy: { component: CapitalStrategyFinder, title: 'Capital & Strategy Finder', props: { existing: {}, userId: 'admin_preview' } },
    offerCommitment: { component: OfferCommitmentStep, title: 'Set Your Offer Commitment', props: { existingCommitment: null } },
    dailyReminder: { component: NotificationPrefsStep, title: 'Set Your Daily Reminder', props: { existingPrefs: null } },
    readiness: { component: ReadinessAssessment, title: 'Readiness Self-Assessment', props: { checkpoint: 'baseline', existing: [] } },
    weeklyCheckin: { component: WeeklyCheckIn, title: 'Weekly Check-In', props: { week: 'week_1', day: 7, existing: [] } },
  };

  if (previewingStep && PREVIEW_STEPS[previewingStep]) {
    const preview = PREVIEW_STEPS[previewingStep];
    const StepComponent = preview.component;
    const noop = () => {};
    const noopAsync = async () => {};
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => setPreviewingStep(null)} style={{
            background: 'none', border: 'none', color: '#e94560', cursor: 'pointer',
            fontSize: 14, fontWeight: 600, padding: 0, fontFamily: "'DM Sans', sans-serif",
          }}>&larr; Back to Training Content</button>
        </div>
        <div style={{
          padding: '4px 12px', borderRadius: 6, marginBottom: 20, display: 'inline-block',
          background: 'rgba(240,165,0,0.1)', border: '1px solid rgba(240,165,0,0.2)',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#f0a500', letterSpacing: 0.5 }}>
            ADMIN PREVIEW &mdash; {preview.title}
          </span>
        </div>
        <div style={{
          maxWidth: 560, margin: '0 auto', padding: '0 0 40px',
        }}>
          <StepComponent
            onNext={noop}
            onBack={noop}
            onSave={noopAsync}
            {...preview.props}
          />
        </div>
      </div>
    );
  }

  if (editingModuleId) {
    const inputStyle = {
      width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14,
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
      color: '#eee', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
    };
    const labelStyle = { fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 6 };

    const updatePrinciple = (idx, field, value) => {
      setEditPrinciples(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
    };
    const updateQuestion = (pIdx, qIdx, field, value) => {
      setEditPrinciples(prev => prev.map((p, i) => {
        if (i !== pIdx) return p;
        const qs = [...(p.questions || [])];
        qs[qIdx] = { ...qs[qIdx], [field]: value };
        return { ...p, questions: qs };
      }));
    };
    const updateOption = (pIdx, qIdx, oIdx, value) => {
      setEditPrinciples(prev => prev.map((p, i) => {
        if (i !== pIdx) return p;
        const qs = [...(p.questions || [])];
        const opts = [...(qs[qIdx].options || [])];
        opts[oIdx] = value;
        qs[qIdx] = { ...qs[qIdx], options: opts };
        return { ...p, questions: qs };
      }));
    };
    const addQuestion = (pIdx) => {
      setEditPrinciples(prev => prev.map((p, i) => {
        if (i !== pIdx) return p;
        const qs = [...(p.questions || [])];
        qs.push({ id: `${p.id}_q${qs.length + 1}`, text: '', type: 'multiple_choice', options: ['', ''], correctAnswer: 0 });
        return { ...p, questions: qs };
      }));
    };
    const removeQuestion = (pIdx, qIdx) => {
      setEditPrinciples(prev => prev.map((p, i) => {
        if (i !== pIdx) return p;
        return { ...p, questions: p.questions.filter((_, qi) => qi !== qIdx) };
      }));
    };
    const addOption = (pIdx, qIdx) => {
      setEditPrinciples(prev => prev.map((p, i) => {
        if (i !== pIdx) return p;
        const qs = [...(p.questions || [])];
        qs[qIdx] = { ...qs[qIdx], options: [...(qs[qIdx].options || []), ''] };
        return { ...p, questions: qs };
      }));
    };
    const removeOption = (pIdx, qIdx, oIdx) => {
      setEditPrinciples(prev => prev.map((p, i) => {
        if (i !== pIdx) return p;
        const qs = [...(p.questions || [])];
        const opts = qs[qIdx].options.filter((_, oi) => oi !== oIdx);
        const ca = qs[qIdx].correctAnswer >= oIdx && qs[qIdx].correctAnswer > 0 ? qs[qIdx].correctAnswer - 1 : qs[qIdx].correctAnswer;
        qs[qIdx] = { ...qs[qIdx], options: opts, correctAnswer: Math.min(ca, opts.length - 1) };
        return { ...p, questions: qs };
      }));
    };
    const updateKeyTerm = (idx, field, value) => {
      setEditKeyTerms(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
    };
    const addKeyTerm = () => {
      setEditKeyTerms(prev => [...prev, { term: '', definition: '' }]);
    };
    const removeKeyTerm = (idx) => {
      setEditKeyTerms(prev => prev.filter((_, i) => i !== idx));
    };

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => setEditingModuleId(null)} style={{
            background: 'none', border: 'none', color: '#e94560', cursor: 'pointer',
            fontSize: 14, fontWeight: 600, padding: 0, fontFamily: "'DM Sans', sans-serif",
          }}>&larr; Back</button>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Edit: {editTitle}</h3>
        </div>

        {/* Module Title & Description */}
        <div className="card" style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Module Title</label>
          <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ ...inputStyle, fontSize: 15, fontWeight: 600, marginBottom: 12 }} />
          <label style={labelStyle}>Description</label>
          <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        {/* Principles */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14, color: '#f0a500', fontWeight: 700, display: 'block', marginBottom: 12 }}>
            Principles ({editPrinciples.length})
          </label>
          {editPrinciples.map((principle, pIdx) => {
            const isExpanded = expandedPrinciple === pIdx;
            return (
              <div key={principle.id || pIdx} className="card" style={{ marginBottom: 8, padding: 0, overflow: 'hidden' }}>
                {/* Collapsed header */}
                <div
                  onClick={() => setExpandedPrinciple(isExpanded ? null : pIdx)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px',
                    cursor: 'pointer', background: isExpanded ? 'rgba(233,69,96,0.04)' : 'transparent',
                  }}
                >
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: '#e94560',
                    background: 'rgba(233,69,96,0.1)', padding: '3px 8px', borderRadius: 5, flexShrink: 0,
                  }}>P{pIdx + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#eee', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {principle.title || '(untitled)'}
                    </div>
                    <div style={{ fontSize: 11, color: '#666' }}>
                      {principle.questions?.length || 0} questions
                      {principle.showComponent && <span style={{ marginLeft: 6, color: '#c9a0ff' }}>&middot; {principle.showComponent}</span>}
                      {principle.showCalculator && <span style={{ marginLeft: 6, color: '#c9a0ff' }}>&middot; calculator</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: '#888', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>&#9660;</span>
                </div>

                {/* Expanded editor */}
                {isExpanded && (
                  <div style={{ padding: '0 18px 18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ paddingTop: 14 }}>
                      <label style={labelStyle}>Principle Title</label>
                      <input value={principle.title} onChange={e => updatePrinciple(pIdx, 'title', e.target.value)} style={{ ...inputStyle, fontWeight: 600, marginBottom: 12 }} />

                      <label style={labelStyle}>Content (supports **bold** and *italic*)</label>
                      <textarea
                        value={principle.content || ''}
                        onChange={e => updatePrinciple(pIdx, 'content', e.target.value)}
                        rows={10}
                        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7, fontSize: 13, marginBottom: 16 }}
                      />

                      {/* Questions */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <label style={{ ...labelStyle, marginBottom: 0, color: '#48c78e' }}>Quiz Questions ({principle.questions?.length || 0})</label>
                          <button onClick={() => addQuestion(pIdx)} style={{
                            fontSize: 11, padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
                            border: '1px solid rgba(72,199,142,0.3)', background: 'rgba(72,199,142,0.08)',
                            color: '#48c78e', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                          }}>+ Add Question</button>
                        </div>

                        {(principle.questions || []).map((q, qIdx) => (
                          <div key={q.id || qIdx} style={{
                            padding: 14, borderRadius: 10, marginBottom: 8,
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#f0a500' }}>Q{qIdx + 1}</span>
                              <button onClick={() => removeQuestion(pIdx, qIdx)} style={{
                                fontSize: 10, padding: '2px 8px', borderRadius: 4, cursor: 'pointer',
                                border: '1px solid rgba(233,69,96,0.2)', background: 'transparent',
                                color: '#e94560', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                              }}>Remove</button>
                            </div>
                            <input
                              value={q.text}
                              onChange={e => updateQuestion(pIdx, qIdx, 'text', e.target.value)}
                              placeholder="Question text..."
                              style={{ ...inputStyle, fontSize: 13, marginBottom: 8 }}
                            />
                            {(q.options || []).map((opt, oIdx) => (
                              <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <input
                                  type="radio"
                                  name={`correct_${pIdx}_${qIdx}`}
                                  checked={q.correctAnswer === oIdx}
                                  onChange={() => updateQuestion(pIdx, qIdx, 'correctAnswer', oIdx)}
                                  style={{ accentColor: '#48c78e', cursor: 'pointer' }}
                                />
                                <input
                                  value={opt}
                                  onChange={e => updateOption(pIdx, qIdx, oIdx, e.target.value)}
                                  placeholder={`Option ${oIdx + 1}...`}
                                  style={{ ...inputStyle, flex: 1, fontSize: 13, padding: '6px 10px',
                                    borderColor: q.correctAnswer === oIdx ? 'rgba(72,199,142,0.3)' : undefined,
                                    background: q.correctAnswer === oIdx ? 'rgba(72,199,142,0.04)' : undefined,
                                  }}
                                />
                                {(q.options || []).length > 2 && (
                                  <button onClick={() => removeOption(pIdx, qIdx, oIdx)} style={{
                                    fontSize: 10, padding: '2px 6px', borderRadius: 4, cursor: 'pointer',
                                    border: 'none', background: 'transparent', color: '#666', fontFamily: "'DM Sans', sans-serif",
                                  }}>&times;</button>
                                )}
                              </div>
                            ))}
                            <button onClick={() => addOption(pIdx, qIdx)} style={{
                              fontSize: 11, padding: '3px 10px', borderRadius: 5, cursor: 'pointer', marginTop: 4,
                              border: '1px solid rgba(255,255,255,0.08)', background: 'transparent',
                              color: '#888', fontFamily: "'DM Sans', sans-serif",
                            }}>+ Option</button>
                          </div>
                        ))}
                      </div>

                      {principle.scenarios?.length > 0 && (
                        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(240,165,0,0.04)', border: '1px solid rgba(240,165,0,0.12)', marginBottom: 12 }}>
                          <div style={{ fontSize: 12, color: '#f0a500', fontWeight: 600 }}>
                            {principle.scenarios.length} scenario{principle.scenarios.length !== 1 ? 's' : ''} (property listing quizzes — edit in code)
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Key Terms */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <label style={{ ...labelStyle, marginBottom: 0, color: '#c9a0ff' }}>Key Terms ({editKeyTerms.length})</label>
            <button onClick={addKeyTerm} style={{
              fontSize: 11, padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
              border: '1px solid rgba(201,160,255,0.3)', background: 'rgba(201,160,255,0.08)',
              color: '#c9a0ff', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            }}>+ Add Term</button>
          </div>
          {editKeyTerms.map((kt, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
              <input value={kt.term} onChange={e => updateKeyTerm(idx, 'term', e.target.value)}
                placeholder="Term" style={{ ...inputStyle, flex: '0 0 180px', fontSize: 13, padding: '6px 10px' }} />
              <input value={kt.definition} onChange={e => updateKeyTerm(idx, 'definition', e.target.value)}
                placeholder="Definition" style={{ ...inputStyle, flex: 1, fontSize: 13, padding: '6px 10px' }} />
              <button onClick={() => removeKeyTerm(idx)} style={{
                fontSize: 12, padding: '4px 8px', borderRadius: 4, cursor: 'pointer',
                border: 'none', background: 'transparent', color: '#666', fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
              }}>&times;</button>
            </div>
          ))}
        </div>

        {/* Completion Message */}
        <div className="card" style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Completion Message</label>
          <textarea value={editCompletionMessage} onChange={e => setEditCompletionMessage(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', fontSize: 13 }} />
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            className={moduleSaved ? undefined : 'btn-primary'}
            onClick={saveModuleEdit}
            disabled={moduleSaving}
            style={{
              padding: '12px 28px',
              ...(moduleSaved ? {
                background: 'rgba(72,199,142,0.15)', border: '1px solid rgba(72,199,142,0.3)',
                color: '#48c78e', borderRadius: 10, fontSize: 14, fontWeight: 700,
                cursor: 'default', fontFamily: "'DM Sans', sans-serif",
              } : {}),
            }}
          >
            {moduleSaving ? 'Saving...' : moduleSaved ? '✓ Saved' : 'Save Changes'}
          </button>
          <button className="btn-secondary" onClick={() => setEditingModuleId(null)} style={{ padding: '12px 28px' }}>
            {moduleSaved ? 'Done' : 'Cancel'}
          </button>
          {(() => {
            const o = overrides[editingModuleId];
            const hasContentOverride = o && Object.keys(o).some(k => k !== 'hidden');
            return hasContentOverride ? (
              <button
                onClick={() => {
                  if (window.confirm('Reset this module to the latest built-in version? This discards saved admin edits and shows the current code content in the course.')) {
                    clearModuleOverride(editingModuleId);
                  }
                }}
                style={{
                  marginLeft: 'auto', padding: '12px 20px', borderRadius: 10, cursor: 'pointer',
                  border: '1px solid rgba(240,165,0,0.3)', background: 'rgba(240,165,0,0.08)',
                  color: '#f0a500', fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Reset to Default
              </button>
            ) : null;
          })()}
        </div>

        {(() => {
          const o = overrides[editingModuleId];
          const hasContentOverride = o && Object.keys(o).some(k => k !== 'hidden');
          return hasContentOverride ? (
            <div style={{
              marginTop: 14, padding: '12px 16px', borderRadius: 10,
              background: 'rgba(240,165,0,0.05)', border: '1px solid rgba(240,165,0,0.2)',
              fontSize: 12, color: '#caa', lineHeight: 1.6,
            }}>
              <strong style={{ color: '#f0a500' }}>This module is using a saved admin override.</strong> The
              course shows this saved copy, not the latest built-in content. If new built-in updates aren't
              appearing in the course, click <strong>Reset to Default</strong> to discard the override.
            </div>
          ) : null;
        })()}
      </div>
    );
  }

  if (editingLanding) {
    return (
      <div className="scale-in">
        <button className="btn-secondary" onClick={() => setEditingLanding(false)} style={{ marginBottom: 24, padding: '8px 20px', fontSize: 13 }}>
          &larr; Back to Training Content
        </button>
        <LandingPageEditor landingContent={landingContent} onSave={onSetLandingContent} />
      </div>
    );
  }

  if (editingDay) {
    return (
      <DayEditor
        dayNum={editingDay}
        contentOverrides={contentOverrides}
        onSave={(dayNum, dayOverrides) => {
          const updated = { ...contentOverrides, [dayNum]: dayOverrides };
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

  if (editingMinimums) {
    return (
      <DailyMinimumsEditor
        overrides={dailyMinimumsOverrides || {}}
        onSave={(updated) => {
          onSetDailyMinimums(updated);
          setEditingMinimums(false);
        }}
        onBack={() => setEditingMinimums(false)}
      />
    );
  }

  if (reorderingDays) {
    return (
      <DayReorderEditor
        contentOverrides={contentOverrides}
        onSave={(dayOrder) => {
          const updated = { ...contentOverrides, _dayOrder: dayOrder };
          onSetContentOverrides(updated);
          setReorderingDays(false);
        }}
        onBack={() => setReorderingDays(false)}
      />
    );
  }

  const ACTIVATION_STEPS = [
    {
      num: 1, title: 'Welcome',
      desc: 'Overview of pre-training steps',
      color: '#e94560',
    },
    {
      num: 2, title: 'Declare Your Stakes',
      desc: 'What will it cost if you don\'t complete UC30?',
      saves: 'stakesDeclaration',
      color: '#e94560',
      type: 'textarea',
    },
    {
      num: 3, title: 'What Does This Mean For Your Life?',
      desc: 'What does getting your first deal mean for your life?',
      saves: 'theirWhy',
      color: '#48c78e',
      type: 'textarea',
    },
    {
      num: 4, title: 'My Dream Life',
      desc: 'Describe the life you want from passive income cash flow',
      saves: 'dreamLife',
      color: '#f0a500',
      type: 'textarea',
    },
    {
      num: 5, title: 'Set Your Daily Reminder',
      desc: 'Pick the time to be reminded to complete daily standards',
      saves: 'notificationPreferences',
      color: '#c9a0ff',
      type: 'time-picker',
    },
    {
      num: 6, title: 'Commit & Begin Training',
      desc: 'Preview all 10 modules, "I Commit" button',
      saves: 'activationCompleted',
      color: '#48c78e',
      type: 'commit',
    },
  ];

  return (
    <div className="fade-up">
      {/* ── Pre-Training Activation ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: '#f0a500' }} />
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>Pre-Training Activation</h3>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>
        <p style={{ fontSize: 13, color: '#888', margin: '0 0 14px', paddingLeft: 20 }}>
          6 steps &middot; Users complete before starting training modules
        </p>

        {ACTIVATION_STEPS.map((step) => (
          <div key={step.num} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            borderRadius: 10, marginBottom: 4,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${step.color}22`, color: step.color, fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>
              {step.num}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#eee', marginBottom: 2 }}>
                {step.title}
              </div>
              <div style={{ fontSize: 11, color: '#666' }}>
                {step.desc}
                {step.saves && (
                  <span style={{ marginLeft: 8, color: '#555' }}>
                    &middot; saves to <code style={{ fontSize: 10, color: '#888', background: 'rgba(255,255,255,0.04)', padding: '1px 5px', borderRadius: 3 }}>{step.saves}</code>
                  </span>
                )}
              </div>
            </div>
            <span style={{ fontSize: 10, color: '#555', fontWeight: 600, letterSpacing: 0.5 }}>
              {step.type === 'textarea' ? 'TEXT' : step.type === 'time-picker' ? 'PICKER' : step.type === 'commit' ? 'BUTTON' : 'INTRO'}
            </span>
          </div>
        ))}
      </div>

      {/* ── Post-Training Steps (Built, ready to wire) ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: '#c9a0ff' }} />
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>Post-Training Steps</h3>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
            background: 'rgba(240,165,0,0.12)', color: '#f0a500', letterSpacing: 0.5,
          }}>BUILT &middot; NOT YET WIRED</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>
        <p style={{ fontSize: 13, color: '#888', margin: '0 0 14px', paddingLeft: 20 }}>
          These interactive steps are fully built and ready to use as Module 3+ principles or post-training gates.
        </p>

        {[
          {
            title: 'Get Clear',
            color: '#e94560',
            icon: '🎯',
            saves: 'getClear',
            previewKey: 'getClear',
            features: [
              'Define Your Destination (text)',
              'Key Indicator selector (Cash Flow, Appreciation, Equity, Tax Benefits)',
              'Where Am I Now / Where I Want To Be / Gap',
              'Time Frame (years/months)',
              'Financial Plan Calculator — mad-libs style: "I will have $____ in yearly cash flow. This will require $____ invested yearly at ___% return over ___ years. I will purchase ___ properties per year worth $____ using ___% down from ___ and financing ___% using ___"',
              'Auto-calculates linked fields (green highlight)',
              'Why Is This Goal Important (text)',
            ],
          },
          {
            title: 'Define Your Buy Box',
            color: '#c9a0ff',
            icon: '📦',
            saves: 'buyBox',
            previewKey: 'buyBox',
            features: [
              'Target Markets (tag chips, add/remove)',
              'Specific Zip Codes (optional)',
              'Property Types: SFR, Duplex, Triplex/4-Plex, Small MF (5-20), Apartments (20+), Commercial, Storage, Land',
              'Year Built range, Bedrooms range, Bathrooms range',
              'Condition Tolerance: Turnkey, Light Rehab, Heavy Rehab, Any',
              'Purchase Price Range (min/max) + Down Payment',
              'Strategy: Buy & Hold, BRRRR, Seller Finance, STR, Section 8, Subto/Wrap',
              'Financing: Conventional, DSCR, Hard Money, Seller Finance, Cash, JV, Other',
              'Return Requirements: min CoC%, min Cap Rate%, min CF/unit, min IRR%',
              'Additional Notes (text)',
              'PDF Buy Box Worksheet download link',
            ],
          },
          {
            title: 'Capital & Strategy Finder',
            color: '#48c78e',
            icon: '🧭',
            saves: 'capitalStrategy',
            previewKey: 'capitalStrategy',
            features: [
              '8 tap-through questions (cash, live-in, income, credit, equity, partner, reserves, reno)',
              'Personalized results: financing you can likely use + strategies open to you',
              'Highlighted "best-fit path" recommendation',
              'Boosters (HELOC/cash-out, partnership) + "build this first" cautions',
              'Foundation-Building Path for the hardest profiles — never a dead end',
              'Lender disclaimer on results',
            ],
          },
          {
            title: 'Set Your Offer Commitment',
            color: '#f0a500',
            icon: '📝',
            saves: 'offerCommitment',
            previewKey: 'offerCommitment',
            features: [
              'Preset tiers: 30 (Minimum), 45 (Strong), 60+ (Elite)',
              'Custom number input (min 30)',
              'Visual tier selection with radio indicators',
            ],
          },
        ].map((step, i) => (
          <div key={i} style={{
            padding: '16px 18px', borderRadius: 10, marginBottom: 8,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${step.color}22`, fontSize: 16, flexShrink: 0,
              }}>
                {step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: step.color }}>{step.title}</div>
                <div style={{ fontSize: 11, color: '#666' }}>
                  saves to <code style={{ fontSize: 10, color: '#888', background: 'rgba(255,255,255,0.04)', padding: '1px 5px', borderRadius: 3 }}>{step.saves}</code>
                </div>
              </div>
              {step.previewKey && (
                <button
                  onClick={() => setPreviewingStep(step.previewKey)}
                  style={{
                    padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', border: `1px solid ${step.color}40`,
                    background: `${step.color}12`, color: step.color,
                    fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
                  }}
                >
                  Preview
                </button>
              )}
            </div>
            <div style={{ paddingLeft: 42 }}>
              {step.features.map((f, fi) => (
                <div key={fi} style={{
                  fontSize: 12, color: '#999', lineHeight: 1.6,
                  display: 'flex', gap: 8, paddingTop: 2, paddingBottom: 2,
                }}>
                  <span style={{ color: '#555', flexShrink: 0 }}>&bull;</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Pre-Sprint Training Modules ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: '#e94560' }} />
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>Pre-Sprint Training Modules</h3>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>
        <p style={{ fontSize: 13, color: '#888', margin: '0 0 14px', paddingLeft: 20 }}>
          {modules.filter(m => !m.hidden).length} active modules &middot; Users complete these before the 30-day sprint
        </p>

        {modules.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: '#666' }}>
            No training modules configured yet.
          </div>
        )}

        {modules.map((mod, idx) => (
          <div key={mod.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
            borderRadius: 10, marginBottom: 6,
            background: mod.hidden ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${mod.hidden ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)'}`,
            opacity: mod.hidden ? 0.4 : 1,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button onClick={() => moveModule(idx, -1)} disabled={idx === 0} style={{
                background: 'none', border: 'none', color: idx === 0 ? '#333' : '#888',
                cursor: idx === 0 ? 'default' : 'pointer', fontSize: 10, padding: '2px 4px',
              }}>&#9650;</button>
              <button onClick={() => moveModule(idx, 1)} disabled={idx === modules.length - 1} style={{
                background: 'none', border: 'none', color: idx === modules.length - 1 ? '#333' : '#888',
                cursor: idx === modules.length - 1 ? 'default' : 'pointer', fontSize: 10, padding: '2px 4px',
              }}>&#9660;</button>
            </div>

            <div style={{
              width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(233,69,96,0.1)', color: '#e94560', fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>
              {idx + 1}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: mod.hidden ? '#555' : '#eee', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                {mod.title}
                {(() => {
                  const o = overrides[mod.id];
                  const hasContentOverride = o && Object.keys(o).some(k => k !== 'hidden');
                  return hasContentOverride ? (
                    <span style={{
                      fontSize: 9, fontWeight: 700, color: '#f0a500', letterSpacing: 0.3,
                      background: 'rgba(240,165,0,0.12)', padding: '2px 7px', borderRadius: 4,
                      textTransform: 'uppercase', flexShrink: 0,
                    }}>Overrides code</span>
                  ) : null;
                })()}
              </div>
              <div style={{ fontSize: 11, color: '#666' }}>
                {mod.comingSoon ? 'Coming soon' : mod.description || 'No description'}
                {mod.principles?.length > 0 && (
                  <span style={{ marginLeft: 8, color: '#555' }}>
                    &middot; {mod.principles.length} principles &middot; {mod.principles.reduce((n, p) => n + (p.questions?.length || 0) + (p.scenarios?.reduce((sn, s) => sn + (s.inputs?.length || 0), 0) || 0), 0)} questions
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {(() => {
                const o = overrides[mod.id];
                const hasContentOverride = o && Object.keys(o).some(k => k !== 'hidden');
                return hasContentOverride ? (
                  <button onClick={() => {
                    if (window.confirm(`Reset "${mod.title}" to the latest built-in version? This discards saved admin edits for this module and shows the current code content in the course.`)) {
                      clearModuleOverride(mod.id);
                    }
                  }} style={{
                    fontSize: 11, padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
                    border: '1px solid rgba(240,165,0,0.3)', background: 'rgba(240,165,0,0.08)',
                    color: '#f0a500', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                  }}>Reset</button>
                ) : null;
              })()}
              <button onClick={() => startEditingModule(mod)} style={{
                fontSize: 11, padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                color: '#aaa', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              }}>Edit</button>
              <button onClick={() => toggleHidden(mod.id)} style={{
                fontSize: 11, padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
                border: `1px solid ${mod.hidden ? 'rgba(72,199,142,0.3)' : 'rgba(255,255,255,0.1)'}`,
                background: mod.hidden ? 'rgba(72,199,142,0.08)' : 'rgba(255,255,255,0.04)',
                color: mod.hidden ? '#48c78e' : '#888', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              }}>{mod.hidden ? 'Show' : 'Hide'}</button>
            </div>
          </div>
        ))}
      </div>

      {/* ── 30-Day Sprint Content ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: '#533483' }} />
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>30-Day Sprint</h3>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>

        <div className="card" style={{ marginBottom: 16, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: '#888', fontSize: 13, margin: 0, flex: 1, minWidth: 200 }}>
            Edit the text, videos, and resources for each day. Changes are saved to the database and visible to all Operators.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: 12, whiteSpace: 'nowrap' }}
              onClick={() => setReorderingDays(true)}
            >
              Reorder Days
            </button>
            <button
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: 12, whiteSpace: 'nowrap' }}
              onClick={() => setEditingPhases(true)}
            >
              Edit Phases
            </button>
          </div>
        </div>

        {/* Getting Started */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#aaa', margin: 0 }}>Getting Started</h4>
          </div>
          <div
            className="card"
            style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
            onClick={() => setEditingDay('getting_started')}
          >
            <div className="mono" style={{
              width: 36, height: 36, borderRadius: 8, background: 'rgba(233,69,96,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, flexShrink: 0,
            }}>
              GS
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                {getGettingStartedContent(contentOverrides).title}
              </div>
              <div style={{ fontSize: 12, color: '#555', display: 'flex', gap: 10 }}>
                {getGettingStartedContent(contentOverrides).videoUrl && <span style={{ color: '#48c78e' }}>Video set</span>}
                {getGettingStartedContent(contentOverrides).downloads?.length > 0 && (
                  <span style={{ color: '#533483' }}>
                    {getGettingStartedContent(contentOverrides).downloads.length} resource{getGettingStartedContent(contentOverrides).downloads.length !== 1 ? 's' : ''}
                  </span>
                )}
                {getGettingStartedContent(contentOverrides).transcript && <span style={{ color: '#666' }}>Transcript</span>}
              </div>
            </div>
            {contentOverrides['getting_started'] && (
              <span style={{
                fontSize: 10, fontWeight: 600, color: '#48c78e',
                background: 'rgba(72,199,142,0.1)', padding: '3px 8px', borderRadius: 4,
              }}>Customized</span>
            )}
            <div style={{ color: '#444', fontSize: 18, flexShrink: 0 }}>&rsaquo;</div>
          </div>
        </div>

        {phases.map(phase => (
          <div key={phase.label} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: phase.color }} />
              <h4 style={{ fontSize: 14, fontWeight: 600, color: '#aaa', margin: 0 }}>{phase.label}</h4>
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
                      <div style={{ fontSize: 12, color: '#555', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {dayData.videoUrl && <span style={{ color: '#48c78e' }}>Video set</span>}
                        {dayData.downloads?.length > 0 && <span style={{ color: '#533483' }}>{dayData.downloads.length} resource{dayData.downloads.length !== 1 ? 's' : ''}</span>}
                        {dayData.transcript && <span style={{ color: '#666' }}>Transcript</span>}
                        {dayData.quiz?.scenarios?.length > 0 && <span style={{ color: '#f0a500' }}>Quiz ({dayData.quiz.scenarios.length})</span>}
                      </div>
                    </div>
                    {hasOverrides && (
                      <span style={{
                        fontSize: 10, fontWeight: 600, color: '#48c78e',
                        background: 'rgba(72,199,142,0.1)', padding: '3px 8px', borderRadius: 4,
                      }}>Customized</span>
                    )}
                    <div style={{ color: '#444', fontSize: 18, flexShrink: 0 }}>&rsaquo;</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Settings ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: '#f0a500' }} />
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>Settings</h3>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Daily Minimums */}
        <div className="card" style={{
          marginBottom: 12, padding: '16px 20px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          background: 'rgba(240,165,0,0.04)', border: '1px solid rgba(240,165,0,0.15)',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f0a500' }}>Daily Standards (Minimums)</div>
            <p style={{ color: '#888', fontSize: 12, margin: '4px 0 0' }}>
              Configure the minimum indicator requirements for each day of the sprint.
            </p>
          </div>
          <button
            className="btn-secondary"
            style={{ padding: '8px 18px', fontSize: 12, color: '#f0a500', borderColor: 'rgba(240,165,0,0.3)' }}
            onClick={() => setEditingMinimums(true)}
          >
            Edit Daily Minimums
          </button>
        </div>

        {/* Practice Day Settings */}
        <div className="card" style={{
          marginBottom: 12, padding: '20px 24px',
          background: 'rgba(83,52,131,0.04)', border: '1px solid rgba(83,52,131,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#c9a0ff' }}>Practice Day Settings</div>
              <p style={{ color: '#888', fontSize: 12, margin: '2px 0 0' }}>
                Configure resources shown during the pre-Day-1 practice walkthrough.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#aaa', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Practice Day Video URL
              </label>
              <input
                value={pdVideoUrl}
                onChange={e => { setPdVideoUrl(e.target.value); setPdSaved(false); }}
                placeholder="https://www.youtube.com/embed/..."
                style={{ width: '100%', fontSize: 13, padding: '10px 14px' }}
              />
              <p style={{ fontSize: 11, color: '#555', marginTop: 4, marginBottom: 0 }}>
                Embed URL for the intro/training video shown during practice mode.
              </p>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#aaa', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Rental Calculator Download URL
              </label>
              <input
                value={pdCalcUrl}
                onChange={e => { setPdCalcUrl(e.target.value); setPdSaved(false); }}
                placeholder="https://drive.google.com/..."
                style={{ width: '100%', fontSize: 13, padding: '10px 14px' }}
              />
              <p style={{ fontSize: 11, color: '#555', marginTop: 4, marginBottom: 0 }}>
                Link to the CDS Rental Calculator spreadsheet or file.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                className="btn-secondary"
                style={{ padding: '8px 18px', fontSize: 12, color: '#c9a0ff', borderColor: 'rgba(83,52,131,0.3)' }}
                disabled={pdSaving}
                onClick={async () => {
                  setPdSaving(true);
                  await onSetPracticeDaySettings({
                    practice_day_video: pdVideoUrl.trim() || null,
                    rental_calculator_url: pdCalcUrl.trim() || null,
                  });
                  setPdSaving(false);
                  setPdSaved(true);
                }}
              >
                {pdSaving ? 'Saving...' : 'Save Practice Day Settings'}
              </button>
              {pdSaved && <span style={{ fontSize: 12, color: '#48c78e', fontWeight: 600 }}>Saved</span>}
            </div>
          </div>
        </div>

        {/* Landing Page */}
        <div className="card" style={{ padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Active Landing Page</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button
              onClick={() => onSetLandingVersion('v1')}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                background: landingVersion !== 'v2' ? 'rgba(233,69,96,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${landingVersion !== 'v2' ? 'rgba(233,69,96,0.3)' : 'rgba(255,255,255,0.06)'}`,
                color: landingVersion !== 'v2' ? '#e94560' : '#666',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
                transition: 'all 0.15s',
              }}
            >
              <div>V1 &mdash; Original</div>
              <div style={{ fontSize: 11, fontWeight: 400, marginTop: 4, opacity: 0.7 }}>Clean and simple</div>
            </button>
            <button
              onClick={() => onSetLandingVersion('v2')}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                background: landingVersion === 'v2' ? 'rgba(233,69,96,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${landingVersion === 'v2' ? 'rgba(233,69,96,0.3)' : 'rgba(255,255,255,0.06)'}`,
                color: landingVersion === 'v2' ? '#e94560' : '#666',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
                transition: 'all 0.15s',
              }}
            >
              <div>V2 &mdash; Marketing Optimized</div>
              <div style={{ fontSize: 11, fontWeight: 400, marginTop: 4, opacity: 0.7 }}>CRO, testimonials, FAQ</div>
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
            <a href="/?v=1" target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'underline' }}>Preview V1</a>
            <a href="/?v=2" target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'underline' }}>Preview V2</a>
          </div>
        </div>

        <div
          className="card"
          style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
          onClick={() => setEditingLanding(true)}
        >
          <div className="mono" style={{
            width: 36, height: 36, borderRadius: 8, background: 'rgba(83,52,131,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0,
          }}>
            LP
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Edit Landing Page Content</div>
            <div style={{ fontSize: 12, color: '#555' }}>
              Hero text, stats, features, and call-to-action sections
            </div>
          </div>
          {landingContent && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#48c78e',
              background: 'rgba(72,199,142,0.1)', padding: '3px 8px', borderRadius: 4,
            }}>Customized</span>
          )}
          <div style={{ color: '#444', fontSize: 18, flexShrink: 0 }}>&rsaquo;</div>
        </div>
      </div>
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
  const isGettingStarted = dayNum === 'getting_started';
  const defaults = isGettingStarted ? GETTING_STARTED_DEFAULT : CHALLENGE_DAYS[dayNum - 1];
  const existing = contentOverrides[dayNum] || {};

  const [title, setTitle] = useState(existing.title || defaults.title);
  const [caption, setCaption] = useState(existing.caption || defaults.caption || '');
  const [taskDescription, setTaskDescription] = useState(existing.taskDescription || defaults.taskDescription);
  const [trainingContent, setTrainingContent] = useState(existing.trainingContent || defaults.trainingContent || '');
  const [videoUrl, setVideoUrl] = useState(existing.videoUrl || defaults.videoUrl || '');
  const [transcript, setTranscript] = useState(existing.transcript || defaults.transcript || '');
  const [downloads, setDownloads] = useState(existing.downloads || defaults.downloads || []);
  const [newDlName, setNewDlName] = useState('');
  const [newDlUrl, setNewDlUrl] = useState('');

  const defaultQuiz = defaults.quiz || null;
  const existingQuiz = existing.quiz !== undefined ? existing.quiz : defaultQuiz;
  const [quizEnabled, setQuizEnabled] = useState(!!existingQuiz);
  const [quizRequired, setQuizRequired] = useState(existingQuiz?.required ?? true);
  const [quizScenarios, setQuizScenarios] = useState(existingQuiz?.scenarios || []);
  const [editingScenarioIdx, setEditingScenarioIdx] = useState(null);

  const handleSave = () => {
    const overrides = {};
    if (title !== defaults.title) overrides.title = title;
    if (caption !== (defaults.caption || '')) overrides.caption = caption;
    if (taskDescription !== defaults.taskDescription) overrides.taskDescription = taskDescription;
    if (trainingContent !== (defaults.trainingContent || '')) overrides.trainingContent = trainingContent;
    if (videoUrl !== (defaults.videoUrl || '')) overrides.videoUrl = videoUrl || null;
    if (transcript !== (defaults.transcript || '')) overrides.transcript = transcript || null;
    if (JSON.stringify(downloads) !== JSON.stringify(defaults.downloads || [])) overrides.downloads = downloads;
    if (!isGettingStarted) {
      if (quizEnabled && quizScenarios.length > 0) {
        overrides.quiz = { required: quizRequired, scenarios: quizScenarios };
      } else if (defaultQuiz && !quizEnabled) {
        overrides.quiz = null;
      }
    }
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
        <div className="mono" style={{ fontSize: 14, color: '#e94560', fontWeight: 700 }}>{isGettingStarted ? 'INTRO' : `DAY ${dayNum}`}</div>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>{isGettingStarted ? 'Edit Getting Started' : 'Edit Day Content'}</h2>
      </div>

      {/* Title */}
      <div className="card" style={{ marginBottom: 16 }}>
        <label style={labelStyle}>{isGettingStarted ? 'Section Title' : 'Day Title'}</label>
        <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
      </div>

      {/* Caption */}
      {!isGettingStarted && (
        <div className="card" style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Caption</label>
          <input
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Short subtitle shown on the timeline card"
            style={inputStyle}
          />
        </div>
      )}

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

      {/* Training Content */}
      {!isGettingStarted && (
        <div className="card" style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Training Content Description</label>
          <textarea
            value={trainingContent}
            onChange={e => setTrainingContent(e.target.value)}
            rows={3}
            placeholder="Describe what training topics are covered in this day's video..."
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>
      )}

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

      {/* Quiz Section (challenge days only) */}
      {!isGettingStarted && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: quizEnabled ? 16 : 0 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Quiz / Check for Understanding</label>
            <button
              onClick={() => setQuizEnabled(!quizEnabled)}
              style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: quizEnabled ? 'rgba(72,199,142,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${quizEnabled ? 'rgba(72,199,142,0.3)' : 'rgba(255,255,255,0.1)'}`,
                color: quizEnabled ? '#48c78e' : '#666',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {quizEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {quizEnabled && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: '#888' }}>
                  <input
                    type="checkbox"
                    checked={quizRequired}
                    onChange={e => setQuizRequired(e.target.checked)}
                    style={{ marginRight: 6 }}
                  />
                  Required (blocks day completion until passed)
                </label>
              </div>

              {editingScenarioIdx !== null ? (
                <ScenarioEditor
                  scenario={quizScenarios[editingScenarioIdx]}
                  onSave={(updated) => {
                    const newScenarios = [...quizScenarios];
                    newScenarios[editingScenarioIdx] = updated;
                    setQuizScenarios(newScenarios);
                    setEditingScenarioIdx(null);
                  }}
                  onCancel={() => setEditingScenarioIdx(null)}
                />
              ) : (
                <div>
                  {quizScenarios.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                      {quizScenarios.map((s, i) => (
                        <div key={s.id} style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                          background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                          <span style={{ fontSize: 13, color: '#f0a500', fontWeight: 700, width: 20 }}>{i + 1}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc' }}>{s.title || 'Untitled Scenario'}</div>
                            <div style={{ fontSize: 11, color: '#555' }}>
                              {s.inputs?.length || 0} input{(s.inputs?.length || 0) !== 1 ? 's' : ''} · {s.maxAttempts || 3} attempts
                            </div>
                          </div>
                          <button
                            onClick={() => setEditingScenarioIdx(i)}
                            style={{ background: 'none', border: 'none', color: '#f0a500', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setQuizScenarios(quizScenarios.filter((_, idx) => idx !== i))}
                            style={{ background: 'none', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      const newScenario = {
                        id: `scenario_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                        title: '',
                        description: '',
                        image: '',
                        maxAttempts: 3,
                        explanationOnFail: '',
                        explanationImage: '',
                        inputs: [{ id: `input_${Date.now()}`, label: '', type: 'number', correctAnswer: '', tolerance: 0, unit: '' }],
                      };
                      setQuizScenarios([...quizScenarios, newScenario]);
                      setEditingScenarioIdx(quizScenarios.length);
                    }}
                    style={{ padding: '8px 16px', fontSize: 12 }}
                  >
                    + Add Scenario
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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

// ── Scenario Editor ─────────────────────────────────────────
function ScenarioEditor({ scenario, onSave, onCancel }) {
  const [title, setTitle] = useState(scenario.title || '');
  const [description, setDescription] = useState(scenario.description || '');
  const [image, setImage] = useState(scenario.image || '');
  const [maxAttempts, setMaxAttempts] = useState(scenario.maxAttempts || 3);
  const [explanationOnFail, setExplanationOnFail] = useState(scenario.explanationOnFail || '');
  const [explanationImage, setExplanationImage] = useState(scenario.explanationImage || '');
  const [inputs, setInputs] = useState(scenario.inputs || []);

  const labelStyle = { fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 };

  const updateInput = (idx, field, value) => {
    const updated = [...inputs];
    updated[idx] = { ...updated[idx], [field]: value };
    setInputs(updated);
  };

  const addInput = () => {
    setInputs([...inputs, {
      id: `input_${Date.now()}_${Math.random().toString(36).slice(2, 4)}`,
      label: '', type: 'number', correctAnswer: '', tolerance: 0, unit: '',
    }]);
  };

  const removeInput = (idx) => {
    setInputs(inputs.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    onSave({
      ...scenario,
      title,
      description,
      image: image || undefined,
      maxAttempts,
      explanationOnFail: explanationOnFail || undefined,
      explanationImage: explanationImage || undefined,
      inputs: inputs.map(inp => ({
        ...inp,
        correctAnswer: inp.type === 'number' ? parseFloat(inp.correctAnswer) || 0 : inp.correctAnswer,
        tolerance: inp.type === 'number' ? (parseFloat(inp.tolerance) || 0) : undefined,
        unit: inp.unit || undefined,
      })),
    });
  };

  return (
    <div style={{ border: '1px solid rgba(240,165,0,0.2)', borderRadius: 10, padding: 16, background: 'rgba(240,165,0,0.02)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#f0a500' }}>Edit Scenario</h4>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Calculate ARV" style={{ width: '100%', fontSize: 14, marginBottom: 0 }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the scenario..." style={{ width: '100%', fontSize: 14, resize: 'vertical', marginBottom: 0 }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Scenario Image URL (optional)</label>
        <input value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." style={{ width: '100%', fontSize: 14, marginBottom: 0 }} />
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Max Attempts</label>
          <input type="number" value={maxAttempts} onChange={e => setMaxAttempts(parseInt(e.target.value) || 3)} min={1} max={10} style={{ width: '100%', fontSize: 14, marginBottom: 0 }} />
        </div>
      </div>

      {/* Answer Inputs */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Answer Inputs</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {inputs.map((inp, i) => (
            <div key={inp.id} style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <input
                  value={inp.label}
                  onChange={e => updateInput(i, 'label', e.target.value)}
                  placeholder="Label (e.g. After Repair Value)"
                  style={{ flex: 2, minWidth: 140, fontSize: 13, padding: '8px 10px', marginBottom: 0 }}
                />
                <select
                  value={inp.type}
                  onChange={e => updateInput(i, 'type', e.target.value)}
                  style={{ fontSize: 13, padding: '8px 10px', marginBottom: 0, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#ccc' }}
                >
                  <option value="number">Number</option>
                  <option value="text">Text</option>
                </select>
                <button onClick={() => removeInput(i)} style={{ background: 'none', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: 16, padding: '0 6px' }}>×</button>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  value={inp.correctAnswer}
                  onChange={e => updateInput(i, 'correctAnswer', e.target.value)}
                  placeholder="Correct answer"
                  style={{ flex: 1, minWidth: 100, fontSize: 13, padding: '8px 10px', marginBottom: 0 }}
                />
                {inp.type === 'number' && (
                  <input
                    value={inp.tolerance || ''}
                    onChange={e => updateInput(i, 'tolerance', e.target.value)}
                    placeholder="Tolerance (±)"
                    style={{ width: 100, fontSize: 13, padding: '8px 10px', marginBottom: 0 }}
                  />
                )}
                <select
                  value={inp.unit || ''}
                  onChange={e => updateInput(i, 'unit', e.target.value)}
                  style={{ fontSize: 13, padding: '8px 10px', marginBottom: 0, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#ccc' }}
                >
                  <option value="">No unit</option>
                  <option value="$">$ (dollar)</option>
                  <option value="%">% (percent)</option>
                </select>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addInput} className="btn-secondary" style={{ marginTop: 8, padding: '6px 14px', fontSize: 12 }}>+ Add Input</button>
      </div>

      {/* Explanation on fail */}
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Explanation on Fail (optional)</label>
        <textarea value={explanationOnFail} onChange={e => setExplanationOnFail(e.target.value)} rows={2} placeholder="Shown when all attempts are exhausted..." style={{ width: '100%', fontSize: 14, resize: 'vertical', marginBottom: 0 }} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Explanation Image URL (optional)</label>
        <input value={explanationImage} onChange={e => setExplanationImage(e.target.value)} placeholder="https://..." style={{ width: '100%', fontSize: 14, marginBottom: 0 }} />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-primary" onClick={handleSave} style={{ padding: '10px 24px', fontSize: 13 }}>Save Scenario</button>
        <button className="btn-secondary" onClick={onCancel} style={{ padding: '10px 18px', fontSize: 13 }}>Cancel</button>
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

function SocialProofTab({ active, nonAdmin, totalOffers, totalAnalyzed, indicatorTotals, retentionRate, dayDistribution }) {
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
          <SocialCard icon="🔥" stat={`${active.length} Operators`} text="are currently active in the UC30 Sprint" />
          <SocialCard icon="📝" stat={`${totalOffers} offers`} text="have been submitted by Operators" />
          <SocialCard icon="📊" stat={`${totalAnalyzed} properties`} text="have been analyzed through the sprint" />
          <SocialCard icon="💪" stat={`${retentionRate}% retention`} text="of enrolled Operators are still executing daily" />
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Activity Summary</h3>
        <div className="mono" style={{
          fontSize: 13, color: '#bbb', lineHeight: 2,
          background: 'rgba(0,0,0,0.3)', padding: 20, borderRadius: 10,
          overflowX: 'auto',
        }}>
          <div>📅 Active Operators: <span style={{ color: '#48c78e' }}>{active.length}</span></div>
          {INDICATOR_KEYS.map(key => (
            <div key={key}>📊 {INDICATOR_LABELS[key]}: <span style={{ color: INDICATOR_COLORS[key] }}>{indicatorTotals[key]}</span></div>
          ))}
          <div>📈 Retention Rate: <span style={{ color: '#48c78e' }}>{retentionRate}%</span></div>
          <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
            {Object.entries(dayDistribution)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([day, count]) => (
                <div key={day}>
                  {'  '}Day {day}: <span style={{ color: '#e94560' }}>{count}</span> Operator{count !== 1 ? 's' : ''}
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

// ── Support Tickets Tab ──────────────────────────────────
function SupportTab({ tickets, onUpdateTicket, onReplyToTicket }) {
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [responseText, setResponseText] = useState('');

  const filtered = filter === 'all' ? tickets
    : tickets.filter(t => t.status === filter);

  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const openCount = tickets.filter(t => t.status === 'open').length;

  const handleRespond = async (ticketId) => {
    if (!responseText.trim()) return;
    await onReplyToTicket(ticketId, responseText.trim());
    setResponseText('');
  };

  const handleClose = async (ticketId) => {
    await onUpdateTicket(ticketId, { status: 'closed' });
  };

  const handleReopen = async (ticketId) => {
    await onUpdateTicket(ticketId, { status: 'open' });
  };

  const statusColors = {
    open: { bg: 'rgba(233,69,96,0.1)', border: 'rgba(233,69,96,0.2)', color: '#e94560' },
    responded: { bg: 'rgba(72,199,142,0.1)', border: 'rgba(72,199,142,0.2)', color: '#48c78e' },
    closed: { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', color: '#666' },
  };

  return (
    <div className="fade-up">
      {/* Header with count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Support Requests</h3>
          {openCount > 0 && (
            <span style={{
              background: '#e94560', color: '#fff', fontSize: 11, fontWeight: 700,
              padding: '2px 8px', borderRadius: 10, minWidth: 20, textAlign: 'center',
            }}>
              {openCount}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'open', 'responded', 'closed'].map(f => (
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
              {f}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ color: '#666' }}>No support requests{filter !== 'all' ? ` with status "${filter}"` : ''}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sorted.map(ticket => {
            const sc = statusColors[ticket.status] || statusColors.open;
            const isExpanded = expandedId === ticket.id;

            // Build messages list with backward compat
            const messages = ticket.messages && ticket.messages.length > 0
              ? ticket.messages
              : [
                  { id: 'orig', from: 'user', name: ticket.name, text: ticket.message, createdAt: ticket.createdAt },
                  ...(ticket.adminResponse ? [{
                    id: 'admin_resp', from: 'admin', name: 'Admin', text: ticket.adminResponse, createdAt: ticket.respondedAt || ticket.createdAt,
                  }] : []),
                ];

            return (
              <div
                key={ticket.id}
                className="card"
                style={{ padding: 0, overflow: 'hidden' }}
              >
                {/* Ticket header */}
                <div
                  onClick={() => { setExpandedId(isExpanded ? null : ticket.id); setResponseText(''); }}
                  style={{
                    padding: '16px 20px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{
                        background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color,
                        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                        textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>
                        {ticket.status}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ticket.subject}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {ticket.name} ({ticket.email}) &middot; {new Date(ticket.createdAt).toLocaleDateString()}
                      {messages.length > 1 && <span> &middot; {messages.length} messages</span>}
                    </div>
                  </div>
                  <div style={{ color: '#444', fontSize: 18, flexShrink: 0, transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                    ›
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {/* Threaded messages */}
                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                      {messages.map((msg, i) => {
                        const isAdmin = msg.from === 'admin';
                        return (
                          <div key={msg.id || i}>
                            <div style={{ fontSize: 10, color: isAdmin ? '#48c78e' : '#888', fontWeight: 600, marginBottom: 3 }}>
                              {isAdmin ? (msg.name || 'Admin') : (msg.name || ticket.name || 'User')}
                              <span style={{ fontWeight: 400, color: '#555', marginLeft: 6 }}>
                                {new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {' '}
                                {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                              </span>
                            </div>
                            <div style={{
                              background: isAdmin ? 'rgba(72,199,142,0.06)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${isAdmin ? 'rgba(72,199,142,0.15)' : 'rgba(255,255,255,0.06)'}`,
                              borderRadius: 8, padding: '12px 16px', fontSize: 14, color: '#ccc', lineHeight: 1.6,
                              whiteSpace: 'pre-wrap',
                            }}>
                              {msg.text}
                              {msg.attachment && (
                                <div style={{ marginTop: 8 }}>
                                  {msg.attachment.type?.startsWith('image/') ? (
                                    <img
                                      src={msg.attachment.data}
                                      alt={msg.attachment.name}
                                      style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6 }}
                                    />
                                  ) : (
                                    <a
                                      href={msg.attachment.data}
                                      download={msg.attachment.name}
                                      style={{ color: '#e94560', fontSize: 12, textDecoration: 'underline' }}
                                    >
                                      {msg.attachment.name}
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Respond form (for open or responded tickets) */}
                    {ticket.status !== 'closed' && (
                      <div>
                        <textarea
                          value={responseText}
                          onChange={e => setResponseText(e.target.value)}
                          placeholder="Write your response..."
                          rows={3}
                          style={{
                            width: '100%', padding: '10px 14px', fontSize: 14, borderRadius: 8,
                            border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                            color: '#eee', resize: 'vertical', fontFamily: "'DM Sans', sans-serif",
                            marginBottom: 10, boxSizing: 'border-box',
                          }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="btn-primary"
                            style={{ padding: '8px 20px', fontSize: 13 }}
                            onClick={() => handleRespond(ticket.id)}
                            disabled={!responseText.trim()}
                          >
                            Send Response
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: '8px 16px', fontSize: 13 }}
                            onClick={() => handleClose(ticket.id)}
                          >
                            Close Ticket
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Reopen for closed tickets */}
                    {ticket.status === 'closed' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: '8px 16px', fontSize: 13 }}
                          onClick={() => handleReopen(ticket.id)}
                        >
                          Reopen Ticket
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── QA Checklist Tab ──────────────────────────────────
const QA_SECTIONS = [
  { title: '1. Critical Path — Auth', subsections: [
    { subtitle: 'Registration', items: [
      'Register new account with email & password',
      'Password under 6 chars is rejected',
      'Duplicate email is rejected',
      'After registration, lands on user dashboard',
    ]},
    { subtitle: 'Login', items: [
      'Log out, then log back in with same credentials',
      'Wrong password shows error message',
      'Non-existent email shows error message',
      'Page refresh keeps you logged in (session persists)',
    ]},
    { subtitle: 'Password Reset', items: [
      'Click "Forgot Password", enter email',
      'Reset email arrives (from Supabase, links to uc30.com)',
      'Click link, set new password successfully',
      'Log in with new password',
    ]},
    { subtitle: 'Admin Access', items: [
      'Register with admin@uc30.com — gets admin dashboard',
      'Non-admin user cannot access /admin',
    ]},
  ]},
  { title: '2. Landing Pages', items: [
    'uc30.com loads landing page',
    'uc30.com/v2 loads V2 landing page',
    'CTA buttons work (register or Stripe redirect)',
    '"Log In" button opens login form',
    'Responsive on mobile (check phone or devtools)',
    'Incognito window shows landing page, not dashboard',
  ]},
  { title: '3. User Dashboard', subsections: [
    { subtitle: 'Timeline', items: [
      'Getting Started card is visible and clickable',
      '30 day cards displayed with correct phases/colors',
      'Locked days cannot be opened',
      'Completed days show checkmark',
    ]},
    { subtitle: 'Day Submission', items: [
      'Open an unlocked day — video, description, tasks load',
      'Submit with text proof — succeeds',
      'Submit with file attachment (under 10MB) — succeeds',
      'File over 10MB shows error',
      '"I posted on social media" checkbox works',
      'Completed day shows checkmark on timeline',
    ]},
    { subtitle: 'Submissions Tab', items: [
      'Lists past submissions in reverse chronological order',
      'Each shows day number, proof text, date, attachment link',
      'Attachment is downloadable',
    ]},
    { subtitle: 'Stats Tab', items: [
      'Days completed count is correct',
      'Streak count is correct',
      'Completion rate percentage is correct',
      'Activity heatmap renders',
      'Streak card renders with fire emojis',
    ]},
    { subtitle: 'Streak Card Sharing', items: [
      'Share button works on mobile (Web Share API)',
      'Download/Copy works on desktop',
      'Downloaded image looks correct',
    ]},
  ]},
  { title: '4. Profile', items: [
    'Upload profile picture — resizes to square',
    'Edit first & last name — saves',
    'Edit email — saves, works on next login',
    'Add social media handles — saves',
    'Change password — requires old password, new one works',
  ]},
  { title: '5. Community', items: [
    'Create a new post (title + body)',
    'Post appears in feed',
    'Reply to a post — comment appears',
    'Notification dot shows for new activity',
    'Banned user sees error when posting',
    'Pinned posts appear at top',
  ]},
  { title: '6. Support Tickets', items: [
    'Create new ticket (subject + message)',
    'Ticket appears with "Open" status',
    'Reply to own ticket',
    'Attach file to ticket/reply',
    'Notification dot when admin responds',
    'Close ticket — can reopen by replying',
  ]},
  { title: '7. Admin — Overview', items: [
    'Participant counts correct (total, active, removed)',
    'Aggregate metrics display',
    'Notification dots for open tickets & community activity',
  ]},
  { title: '8. Admin — Participants', items: [
    'Search/filter participants works',
    'Remove a participant (sets inactive)',
    'Reactivate a removed participant',
    'Toggle admin status on/off',
    "Reset a user's password",
    '"View as" impersonation — yellow banner, can exit',
  ]},
  { title: '9. Admin — Submissions', items: [
    'Lists all submissions across all participants',
    'Can verify social media submissions',
    'Attachments viewable',
  ]},
  { title: '10. Admin — Community Moderation', items: [
    'Delete a post — disappears from feed',
    'Delete a comment',
    'Pin/unpin a post',
    'Warn a user — user sees warning banner',
    'Ban a user — user can no longer post',
  ]},
  { title: '11. Admin — Content', items: [
    'Edit landing page content — changes show on landing page',
    'Switch landing version V1/V2 — correct one loads',
    'Edit day content (video URL, description, resources)',
    'Set cohort start date',
    'Set next cohort date',
    'Add/edit/remove live calls',
  ]},
  { title: '12. Admin — Support', items: [
    'View all tickets from all users',
    'Reply to a ticket — user sees "Responded" status',
    'Close a ticket',
  ]},
  { title: '13. Auto-Removal & Edge Cases', items: [
    'User behind schedule gets auto-removed',
    'Removed user sees "Challenge Paused" + next cohort info',
    'Admin reactivates — user returns to correct day',
    'Expired access user sees expiration message + logout only',
    "RLS check: user A cannot see user B's data (check Network tab)",
  ]},
];

function QAChecklistTab() {
  const storageKey = 'uc30_qa_checklist';
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return {}; }
  });

  const toggle = (key) => {
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const reset = () => {
    setChecked({});
    localStorage.removeItem(storageKey);
  };

  let totalItems = 0;
  let checkedCount = 0;
  QA_SECTIONS.forEach(section => {
    const items = section.items || [];
    const subItems = (section.subsections || []).flatMap(s => s.items);
    totalItems += items.length + subItems.length;
    [...items, ...subItems].forEach((_, i) => {
      const key = section.title + (items.includes(_) ? '' : (section.subsections || []).find(s => s.items.includes(_))?.subtitle || '') + i;
    });
  });
  // Recount properly
  totalItems = 0;
  checkedCount = 0;
  QA_SECTIONS.forEach(section => {
    const allItems = [
      ...(section.items || []).map((item, i) => ({ item, key: `${section.title}::${i}` })),
      ...(section.subsections || []).flatMap(sub =>
        sub.items.map((item, i) => ({ item, key: `${section.title}::${sub.subtitle}::${i}` }))
      ),
    ];
    totalItems += allItems.length;
    allItems.forEach(({ key }) => { if (checked[key]) checkedCount++; });
  });

  const pct = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  const checkboxStyle = (isChecked) => ({
    width: 18, height: 18, borderRadius: 4, cursor: 'pointer', flexShrink: 0,
    border: isChecked ? '2px solid #48c78e' : '2px solid #555',
    background: isChecked ? '#48c78e' : 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 12, fontWeight: 700,
  });

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="card" style={{ padding: 24, marginBottom: 20, background: 'linear-gradient(135deg, rgba(72,199,142,0.08), rgba(83,52,131,0.08))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>QA Checklist</h3>
            <p style={{ color: '#888', fontSize: 13 }}>
              {checkedCount} of {totalItems} items checked ({pct}%)
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn"
              onClick={() => window.print()}
              style={{ padding: '8px 16px', fontSize: 13, background: 'rgba(255,255,255,0.06)', color: '#ccc', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Print
            </button>
            <button
              className="btn"
              onClick={reset}
              style={{ padding: '8px 16px', fontSize: 13, background: 'rgba(233,69,96,0.1)', color: '#e94560', border: '1px solid rgba(233,69,96,0.2)' }}
            >
              Reset All
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ marginTop: 12, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
          <div style={{ height: '100%', borderRadius: 3, background: pct === 100 ? '#48c78e' : '#e94560', width: `${pct}%`, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Sections */}
      {QA_SECTIONS.map(section => (
        <div key={section.title} className="card" style={{ padding: 20, marginBottom: 12 }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#e94560' }}>{section.title}</h4>

          {/* Direct items */}
          {(section.items || []).map((item, i) => {
            const key = `${section.title}::${i}`;
            return (
              <div key={key} onClick={() => toggle(key)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer' }}>
                <div style={checkboxStyle(checked[key])}>{checked[key] ? '✓' : ''}</div>
                <span style={{ fontSize: 13, color: checked[key] ? '#666' : '#ccc', textDecoration: checked[key] ? 'line-through' : 'none' }}>{item}</span>
              </div>
            );
          })}

          {/* Subsections */}
          {(section.subsections || []).map(sub => (
            <div key={sub.subtitle} style={{ marginTop: 10 }}>
              <h5 style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 4 }}>{sub.subtitle}</h5>
              {sub.items.map((item, i) => {
                const key = `${section.title}::${sub.subtitle}::${i}`;
                return (
                  <div key={key} onClick={() => toggle(key)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer' }}>
                    <div style={checkboxStyle(checked[key])}>{checked[key] ? '✓' : ''}</div>
                    <span style={{ fontSize: 13, color: checked[key] ? '#666' : '#ccc', textDecoration: checked[key] ? 'line-through' : 'none' }}>{item}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Revenue Tab (Developer Only) ──────────────────────────────────
const PRICE_PER_USER = 997;
const DEV_CUT_PCT = 10;

function RevenueTab({ participants }) {
  const nonAdmin = participants.filter(p => !p.isAdmin && !p.isDeveloper);
  const paying = nonAdmin.filter(p => p.hasPaid || p.isActive);
  const totalUsers = paying.length;

  const grossRevenue = totalUsers * PRICE_PER_USER;
  const devEarnings = Math.round(grossRevenue * DEV_CUT_PCT / 100);

  // Group signups by month
  const monthlyBreakdown = {};
  paying.forEach(p => {
    const month = (p.startDate || p.createdAt || '').slice(0, 7); // YYYY-MM
    if (!month) return;
    if (!monthlyBreakdown[month]) monthlyBreakdown[month] = { users: 0, revenue: 0, devCut: 0 };
    monthlyBreakdown[month].users += 1;
    monthlyBreakdown[month].revenue += PRICE_PER_USER;
    monthlyBreakdown[month].devCut += Math.round(PRICE_PER_USER * DEV_CUT_PCT / 100);
  });

  const sortedMonths = Object.entries(monthlyBreakdown).sort((a, b) => b[0].localeCompare(a[0]));

  const fmt = (n) => '$' + n.toLocaleString();

  const cardStyle = {
    padding: 24, textAlign: 'center',
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
  };

  const bigNum = (value, label, color) => (
    <div style={cardStyle}>
      <div className="mono" style={{ fontSize: 28, fontWeight: 800, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#888' }}>{label}</div>
    </div>
  );

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="card" style={{
        padding: 28, marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(72,199,142,0.1), rgba(83,52,131,0.1))',
      }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Revenue Dashboard</h3>
        <p style={{ color: '#888', fontSize: 13 }}>
          Developer earnings at {DEV_CUT_PCT}% of all revenue ({fmt(PRICE_PER_USER)}/user)
        </p>
      </div>

      {/* Top-level stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        {bigNum(totalUsers, 'Paying Users', '#48c78e')}
        {bigNum(fmt(grossRevenue), 'Gross Revenue', '#533483')}
        {bigNum(fmt(devEarnings), 'Your Earnings (10%)', '#48c78e')}
        {bigNum(fmt(grossRevenue - devEarnings), "Chandler's Revenue (90%)", '#e94560')}
      </div>

      {/* Per-user breakdown */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Per Sale Breakdown</h4>
        <p style={{ color: '#888', fontSize: 12, marginBottom: 16 }}>For each {fmt(PRICE_PER_USER)} sale</p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#ccc' }}>Sale Price</span>
              <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{fmt(PRICE_PER_USER)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#48c78e' }}>Your Cut ({DEV_CUT_PCT}%)</span>
              <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: '#48c78e' }}>{fmt(Math.round(PRICE_PER_USER * DEV_CUT_PCT / 100))}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
              <span style={{ fontSize: 13, color: '#e94560' }}>Chandler&apos;s Cut (90%)</span>
              <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: '#e94560' }}>{fmt(PRICE_PER_USER - Math.round(PRICE_PER_USER * DEV_CUT_PCT / 100))}</span>
            </div>
          </div>
          {/* Visual bar */}
          <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ height: 24, borderRadius: 6, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${DEV_CUT_PCT}%`, background: '#48c78e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#000' }}>
                {DEV_CUT_PCT}%
              </div>
              <div style={{ flex: 1, background: 'rgba(233,69,96,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#e94560' }}>
                {100 - DEV_CUT_PCT}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projections */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Earnings Projections</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#888', fontWeight: 600 }}>Users</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', color: '#888', fontWeight: 600 }}>Gross Revenue</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', color: '#48c78e', fontWeight: 600 }}>Your Earnings</th>
              </tr>
            </thead>
            <tbody>
              {[10, 25, 50, 100, 250, 500, 1000].map(n => (
                <tr key={n} style={{
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: n <= totalUsers ? 'rgba(72,199,142,0.05)' : 'transparent',
                }}>
                  <td style={{ padding: '8px 12px', color: n <= totalUsers ? '#48c78e' : '#ccc' }}>
                    {n} users {n <= totalUsers ? ' (reached)' : ''}
                  </td>
                  <td className="mono" style={{ padding: '8px 12px', textAlign: 'right', color: '#ccc' }}>{fmt(n * PRICE_PER_USER)}</td>
                  <td className="mono" style={{ padding: '8px 12px', textAlign: 'right', color: '#48c78e', fontWeight: 700 }}>{fmt(Math.round(n * PRICE_PER_USER * DEV_CUT_PCT / 100))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly breakdown */}
      {sortedMonths.length > 0 && (
        <div className="card" style={{ padding: 24 }}>
          <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Monthly Breakdown</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#888', fontWeight: 600 }}>Month</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', color: '#888', fontWeight: 600 }}>New Users</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', color: '#888', fontWeight: 600 }}>Revenue</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', color: '#48c78e', fontWeight: 600 }}>Your Cut</th>
              </tr>
            </thead>
            <tbody>
              {sortedMonths.map(([month, data]) => (
                <tr key={month} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '8px 12px', color: '#ccc' }}>{month}</td>
                  <td className="mono" style={{ padding: '8px 12px', textAlign: 'right', color: '#ccc' }}>{data.users}</td>
                  <td className="mono" style={{ padding: '8px 12px', textAlign: 'right', color: '#ccc' }}>{fmt(data.revenue)}</td>
                  <td className="mono" style={{ padding: '8px 12px', textAlign: 'right', color: '#48c78e', fontWeight: 700 }}>{fmt(data.devCut)}</td>
                </tr>
              ))}
              {/* Totals row */}
              <tr style={{ borderTop: '2px solid rgba(255,255,255,0.1)' }}>
                <td style={{ padding: '8px 12px', color: '#fff', fontWeight: 700 }}>Total</td>
                <td className="mono" style={{ padding: '8px 12px', textAlign: 'right', color: '#fff', fontWeight: 700 }}>{totalUsers}</td>
                <td className="mono" style={{ padding: '8px 12px', textAlign: 'right', color: '#fff', fontWeight: 700 }}>{fmt(grossRevenue)}</td>
                <td className="mono" style={{ padding: '8px 12px', textAlign: 'right', color: '#48c78e', fontWeight: 700 }}>{fmt(devEarnings)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Note about Stripe */}
      <div style={{ marginTop: 20, padding: 16, borderRadius: 8, background: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.2)', fontSize: 12, color: '#f0a500', lineHeight: 1.6 }}>
        <strong>Note:</strong> Revenue is currently estimated from participant count ({totalUsers} users x {fmt(PRICE_PER_USER)}).
        Once Stripe is integrated, this will pull actual payment data including renewals and refunds.
      </div>
    </div>
  );
}

// ── Compliance Tab ─────────────────────────────────────────
function ComplianceTab({ complianceSettings, onSetDailyMinimums, onSetWeeklyMinimums, onSetEnforcement, getAllDailySubmissions, getRemovalLog, participants, cohortStartDate, onReactivate }) {
  const [section, setSection] = useState('overview');
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [removalLog, setRemovalLog] = useState([]);
  const [loading, setLoading] = useState(true);

  const dailyMins = { ...COMP_DAILY_DEFAULTS, ...complianceSettings?.dailyMinimums };
  const weeklyMins = { ...DEFAULT_WEEKLY_MINIMUMS, ...complianceSettings?.weeklyMinimums };
  const enforcement = { ...DEFAULT_ENFORCEMENT, ...complianceSettings?.enforcement };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [subs, log] = await Promise.all([
        getAllDailySubmissions ? getAllDailySubmissions() : [],
        getRemovalLog ? getRemovalLog() : [],
      ]);
      setAllSubmissions(subs || []);
      setRemovalLog(log || []);
      setLoading(false);
    })();
  }, []);

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'settings', label: 'Settings' },
    { id: 'removals', label: 'Removal History' },
  ];

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: section === s.id ? 'rgba(233,69,96,0.15)' : 'rgba(255,255,255,0.04)',
              color: section === s.id ? '#e94560' : '#888',
              border: section === s.id ? '1px solid rgba(233,69,96,0.3)' : '1px solid rgba(255,255,255,0.08)',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === 'overview' && (
        <ComplianceOverview
          participants={participants}
          allSubmissions={allSubmissions}
          dailyMins={dailyMins}
          weeklyMins={weeklyMins}
          enforcement={enforcement}
          cohortStartDate={cohortStartDate}
          loading={loading}
        />
      )}
      {section === 'settings' && (
        <ComplianceSettings
          dailyMins={dailyMins}
          weeklyMins={weeklyMins}
          enforcement={enforcement}
          onSetDailyMinimums={onSetDailyMinimums}
          onSetWeeklyMinimums={onSetWeeklyMinimums}
          onSetEnforcement={onSetEnforcement}
        />
      )}
      {section === 'removals' && (
        <ComplianceRemovals
          removalLog={removalLog}
          participants={participants}
          onReactivate={onReactivate}
          loading={loading}
        />
      )}
    </div>
  );
}

// ── Compliance Overview ────────────────────────────────────
function ComplianceOverview({ participants, allSubmissions, dailyMins, weeklyMins, enforcement, cohortStartDate, loading }) {
  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading compliance data...</div>;
  }

  const active = participants.filter(p => p.isActive);

  const now = getNowInTimezone(enforcement.timezone);
  const start = cohortStartDate ? new Date(cohortStartDate + 'T00:00:00') : null;
  let calendarDay = 0;
  if (start) {
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    calendarDay = Math.floor((nowDay - startDay) / (1000 * 60 * 60 * 24)) + 1;
  }
  const currentDay = Math.max(1, Math.min(calendarDay, 30));
  const currentWeek = getWeekNumber(currentDay);
  const { start: weekStart } = getWeekRange(currentWeek);
  const dayInWeek = currentDay - weekStart + 1;
  const totalDaysInWeek = getWeekDayCount(currentWeek);

  const subsByParticipant = {};
  for (const s of allSubmissions) {
    if (!subsByParticipant[s.participant_id]) subsByParticipant[s.participant_id] = [];
    subsByParticipant[s.participant_id].push(s);
  }

  const rows = active.map(p => {
    const pSubs = subsByParticipant[p.id] || [];
    const todaySub = pSubs.find(s => s.challenge_day === currentDay);
    const weekSubs = pSubs.filter(s => s.challenge_day >= weekStart && s.challenge_day <= currentDay);
    const weekResult = checkWeeklyCompliance(weekSubs, weeklyMins);
    const atRiskResult = calculateAtRisk(dayInWeek, totalDaysInWeek, weekSubs, weeklyMins);

    return {
      participant: p,
      todaySubmitted: !!todaySub,
      todayMet: todaySub?.met_daily_minimum ?? null,
      weekTotals: weekResult.totals,
      weekMet: weekResult.met,
      atRisk: atRiskResult.atRisk,
      risks: atRiskResult.risks,
      totalSubmissions: pSubs.length,
    };
  });

  const submittedToday = rows.filter(r => r.todaySubmitted).length;
  const atRiskCount = rows.filter(r => r.atRisk).length;
  const failedDailyCount = rows.filter(r => r.todaySubmitted && r.todayMet === false).length;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Day</div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#e94560' }}>{currentDay}</div>
          <div style={{ fontSize: 11, color: '#666' }}>Week {currentWeek}</div>
        </div>
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Submitted Today</div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#48c78e' }}>{submittedToday}/{active.length}</div>
        </div>
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Failed Daily Min</div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: failedDailyCount > 0 ? '#e94560' : '#48c78e' }}>{failedDailyCount}</div>
        </div>
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>At Risk</div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: atRiskCount > 0 ? '#f0a500' : '#48c78e' }}>{atRiskCount}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ textAlign: 'left', padding: '10px 12px', color: '#888', fontWeight: 600 }}>Participant</th>
              <th style={{ textAlign: 'center', padding: '10px 8px', color: '#888', fontWeight: 600 }}>Today</th>
              {COMPLIANCE_METRICS.map(m => (
                <th key={m.id} style={{ textAlign: 'center', padding: '10px 6px', color: '#888', fontWeight: 600, fontSize: 11 }}>
                  {m.icon}
                </th>
              ))}
              <th style={{ textAlign: 'center', padding: '10px 8px', color: '#888', fontWeight: 600 }}>Week</th>
              <th style={{ textAlign: 'center', padding: '10px 8px', color: '#888', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.sort((a, b) => {
              if (a.atRisk && !b.atRisk) return -1;
              if (!a.atRisk && b.atRisk) return 1;
              if (!a.todaySubmitted && b.todaySubmitted) return -1;
              return 0;
            }).map(r => (
              <tr key={r.participant.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '10px 12px', color: '#ccc' }}>
                  {r.participant.firstName} {r.participant.lastName}
                </td>
                <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                  {r.todaySubmitted ? (
                    <span style={{ color: r.todayMet === false ? '#e94560' : '#48c78e', fontWeight: 600 }}>
                      {r.todayMet === false ? 'Below' : 'Met'}
                    </span>
                  ) : (
                    <span style={{ color: '#666' }}>--</span>
                  )}
                </td>
                {COMPLIANCE_METRICS.map(m => (
                  <td key={m.id} className="mono" style={{ textAlign: 'center', padding: '10px 6px', fontSize: 12, color: (r.weekTotals[m.id] || 0) >= weeklyMins[m.id] ? '#48c78e' : '#ccc' }}>
                    {r.weekTotals[m.id] || 0}
                  </td>
                ))}
                <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                  <span style={{ color: r.weekMet ? '#48c78e' : '#888', fontWeight: 600, fontSize: 12 }}>
                    {r.weekMet ? 'On Track' : 'Behind'}
                  </span>
                </td>
                <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                  {r.atRisk ? (
                    <span style={{
                      padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: 'rgba(240,165,0,0.15)', color: '#f0a500',
                    }}>
                      At Risk
                    </span>
                  ) : (
                    <span style={{ color: '#48c78e', fontSize: 11, fontWeight: 600 }}>OK</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={10 + COMPLIANCE_METRICS.length} style={{ padding: 24, textAlign: 'center', color: '#666' }}>
                  No active participants
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, fontSize: 11, color: '#555' }}>
        {COMPLIANCE_METRICS.map(m => (
          <span key={m.id} style={{ marginRight: 12 }}>{m.icon} {m.label}</span>
        ))}
      </div>
    </div>
  );
}

// ── Compliance Settings ────────────────────────────────────
function ComplianceSettings({ dailyMins, weeklyMins, enforcement, onSetDailyMinimums, onSetWeeklyMinimums, onSetEnforcement }) {
  const [daily, setDaily] = useState({ ...dailyMins });
  const [weekly, setWeekly] = useState({ ...weeklyMins });
  const [enf, setEnf] = useState({ ...enforcement });
  const [saved, setSaved] = useState(null);

  const handleSaveDaily = async () => {
    await onSetDailyMinimums(daily);
    setSaved('daily');
    setTimeout(() => setSaved(null), 2000);
  };

  const handleSaveWeekly = async () => {
    await onSetWeeklyMinimums(weekly);
    setSaved('weekly');
    setTimeout(() => setSaved(null), 2000);
  };

  const handleSaveEnforcement = async () => {
    await onSetEnforcement(enf);
    setSaved('enforcement');
    setTimeout(() => setSaved(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Daily Minimums */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Daily Minimums</h3>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
          Minimum values each participant must hit every day to remain in the challenge.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {COMPLIANCE_METRICS.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
              <span style={{ fontSize: 16 }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: '#aaa', marginBottom: 2 }}>{m.label}</div>
                {m.type === 'boolean' ? (
                  <select
                    value={daily[m.id] ? 'required' : 'optional'}
                    onChange={e => setDaily({ ...daily, [m.id]: e.target.value === 'required' })}
                    style={{ fontSize: 13, padding: '4px 8px', width: '100%' }}
                  >
                    <option value="required">Required</option>
                    <option value="optional">Optional</option>
                  </select>
                ) : (
                  <input
                    type="number"
                    min="0"
                    value={daily[m.id] ?? 0}
                    onChange={e => setDaily({ ...daily, [m.id]: parseInt(e.target.value) || 0 })}
                    style={{ fontSize: 13, padding: '4px 8px', width: '100%' }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={handleSaveDaily} style={{ marginTop: 16, padding: '8px 20px', fontSize: 13 }}>
          {saved === 'daily' ? 'Saved!' : 'Save Daily Minimums'}
        </button>
      </div>

      {/* Weekly Minimums */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Weekly Minimums</h3>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
          Total values each participant must accumulate per week (Days 1-7, 8-14, 15-21, 22-28, 29-30).
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {COMPLIANCE_METRICS.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
              <span style={{ fontSize: 16 }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: '#aaa', marginBottom: 2 }}>{m.label}</div>
                <input
                  type="number"
                  min="0"
                  value={weekly[m.id] ?? 0}
                  onChange={e => setWeekly({ ...weekly, [m.id]: parseInt(e.target.value) || 0 })}
                  style={{ fontSize: 13, padding: '4px 8px', width: '100%' }}
                />
              </div>
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={handleSaveWeekly} style={{ marginTop: 16, padding: '8px 20px', fontSize: 13 }}>
          {saved === 'weekly' ? 'Saved!' : 'Save Weekly Minimums'}
        </button>
      </div>

      {/* Enforcement Settings */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Enforcement</h3>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
          Controls when deadlines are enforced and whether automatic removal is active.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4, fontWeight: 600 }}>Enabled</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enf.enabled}
                onChange={e => setEnf({ ...enf, enabled: e.target.checked })}
                style={{ accentColor: '#48c78e', width: 18, height: 18 }}
              />
              <span style={{ fontSize: 13, color: enf.enabled ? '#48c78e' : '#888' }}>
                {enf.enabled ? 'Enforcement active — participants will be auto-removed' : 'Enforcement disabled — no auto-removal'}
              </span>
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4, fontWeight: 600 }}>Timezone</label>
              <select
                value={enf.timezone}
                onChange={e => setEnf({ ...enf, timezone: e.target.value })}
                style={{ fontSize: 13, padding: '8px 10px', width: '100%' }}
              >
                <option value="America/Los_Angeles">Pacific (PT)</option>
                <option value="America/Denver">Mountain (MT)</option>
                <option value="America/Chicago">Central (CT)</option>
                <option value="America/New_York">Eastern (ET)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#aaa', display: 'block', marginBottom: 4, fontWeight: 600 }}>Daily Deadline Hour</label>
              <select
                value={enf.daily_deadline_hour}
                onChange={e => setEnf({ ...enf, daily_deadline_hour: parseInt(e.target.value) })}
                style={{ fontSize: 13, padding: '8px 10px', width: '100%' }}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i === 0 ? '12:00 AM (Midnight)' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM (Noon)' : `${i - 12}:00 PM`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <button className="btn-primary" onClick={handleSaveEnforcement} style={{ marginTop: 16, padding: '8px 20px', fontSize: 13 }}>
          {saved === 'enforcement' ? 'Saved!' : 'Save Enforcement Settings'}
        </button>
      </div>
    </div>
  );
}

// ── Compliance Removal History ─────────────────────────────
function ComplianceRemovals({ removalLog, participants, onReactivate, loading }) {
  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading removal history...</div>;
  }

  const participantMap = {};
  for (const p of participants) participantMap[p.id] = p;

  const removed = participants.filter(p => !p.isActive);

  const REASON_LABELS = {
    missed_deadline: 'Missed Deadline',
    failed_daily_minimum: 'Failed Daily Minimum',
    failed_weekly_minimum: 'Failed Weekly Minimum',
  };

  return (
    <div>
      {removed.length > 0 && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Removed Participants</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {removed.map(p => {
              const logEntry = removalLog.find(r => r.participant_id === p.id);
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: 10,
                  background: 'rgba(233,69,96,0.04)', border: '1px solid rgba(233,69,96,0.12)',
                  flexWrap: 'wrap', gap: 8,
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#ccc' }}>
                      {p.firstName} {p.lastName}
                    </div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                      {p.email}
                    </div>
                    {logEntry && (
                      <div style={{ fontSize: 12, color: '#e94560', marginTop: 4 }}>
                        <span style={{
                          padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                          background: 'rgba(233,69,96,0.12)', marginRight: 6,
                        }}>
                          {REASON_LABELS[logEntry.reason] || logEntry.reason}
                        </span>
                        {logEntry.details}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onReactivate(p.id)}
                    style={{
                      padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                      background: 'rgba(72,199,142,0.12)', color: '#48c78e',
                      border: '1px solid rgba(72,199,142,0.25)', cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Reactivate
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Full Removal Log</h3>
        {removalLog.length === 0 ? (
          <p style={{ color: '#666', fontSize: 14, textAlign: 'center', padding: 20 }}>
            No removals recorded yet.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#888', fontWeight: 600 }}>Participant</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#888', fontWeight: 600 }}>Reason</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#888', fontWeight: 600 }}>Details</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', color: '#888', fontWeight: 600 }}>Day</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', color: '#888', fontWeight: 600 }}>Week</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#888', fontWeight: 600 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {removalLog.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).map((entry, i) => {
                const p = participantMap[entry.participant_id];
                return (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '8px 12px', color: '#ccc' }}>
                      {p ? `${p.firstName} ${p.lastName}` : entry.participant_id?.slice(0, 8)}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                        background: entry.reason === 'missed_deadline' ? 'rgba(233,69,96,0.12)' : entry.reason === 'failed_weekly_minimum' ? 'rgba(240,165,0,0.12)' : 'rgba(233,69,96,0.12)',
                        color: entry.reason === 'failed_weekly_minimum' ? '#f0a500' : '#e94560',
                      }}>
                        {REASON_LABELS[entry.reason] || entry.reason}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', color: '#888', fontSize: 12 }}>{entry.details}</td>
                    <td className="mono" style={{ textAlign: 'center', padding: '8px 12px', color: '#ccc' }}>{entry.challenge_day || '--'}</td>
                    <td className="mono" style={{ textAlign: 'center', padding: '8px 12px', color: '#ccc' }}>{entry.week_number || '--'}</td>
                    <td style={{ padding: '8px 12px', color: '#666', fontSize: 12 }}>
                      {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : '--'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Day Reorder Editor ──────────────────────────────────────────

const REFLECTION_DAYS = [7, 14, 21, 28];

function DayReorderEditor({ contentOverrides, onSave, onBack }) {
  const savedOrder = contentOverrides?._dayOrder;
  const [order, setOrder] = useState(() => {
    if (savedOrder && savedOrder.length === 30) return [...savedOrder];
    return Array.from({ length: 30 }, (_, i) => i + 1);
  });
  const [saving, setSaving] = useState(false);

  const isDefault = order.every((v, i) => v === i + 1);

  const moveDay = (slotIndex, direction) => {
    const targetIndex = slotIndex + direction;
    if (targetIndex < 0 || targetIndex >= 30) return;
    const slotDay = slotIndex + 1;
    const targetDay = targetIndex + 1;
    if (REFLECTION_DAYS.includes(slotDay) || REFLECTION_DAYS.includes(targetDay)) return;

    const newOrder = [...order];
    [newOrder[slotIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[slotIndex]];
    setOrder(newOrder);
  };

  const resetOrder = () => {
    setOrder(Array.from({ length: 30 }, (_, i) => i + 1));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(isDefault ? null : order);
    setSaving(false);
  };

  return (
    <div className="scale-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <button className="btn-secondary" onClick={onBack} style={{ padding: '8px 20px', fontSize: 13 }}>
          ← Back to Content
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          {!isDefault && (
            <button className="btn-secondary" onClick={resetOrder} style={{ padding: '8px 16px', fontSize: 12, color: '#e94560', borderColor: 'rgba(233,69,96,0.3)' }}>
              Reset to Default
            </button>
          )}
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '8px 20px', fontSize: 13, opacity: saving ? 0.5 : 1 }}
          >
            {saving ? 'Saving...' : 'Save Order'}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Reorder Days</h3>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
          Move days up or down to rearrange the 30-day schedule. Reflection days (7, 14, 21, 28) are pinned and cannot be moved.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {order.map((contentDay, slotIndex) => {
          const slotDay = slotIndex + 1;
          const isReflection = REFLECTION_DAYS.includes(slotDay);
          const isSwapped = contentDay !== slotDay;
          const dayData = getDayContent(contentDay, contentOverrides);
          const phase = DEFAULT_PHASES.find(p => p.days.includes(slotDay));

          return (
            <div
              key={slotIndex}
              className="card"
              style={{
                padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12,
                opacity: isReflection ? 0.6 : 1,
                borderColor: isSwapped ? 'rgba(240,165,0,0.3)' : undefined,
                background: isSwapped ? 'rgba(240,165,0,0.03)' : undefined,
              }}
            >
              <div className="mono" style={{
                width: 32, height: 32, borderRadius: 6,
                background: isReflection ? 'rgba(255,255,255,0.04)' : `${phase?.color || '#888'}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: phase?.color || '#888', flexShrink: 0,
              }}>
                {slotDay}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc' }}>
                  {dayData.title || `Day ${contentDay}`}
                  {isReflection && <span style={{ fontSize: 11, color: '#666', marginLeft: 8 }}>Pinned</span>}
                </div>
                {isSwapped && (
                  <div style={{ fontSize: 11, color: '#f0a500', marginTop: 2 }}>
                    Originally Day {contentDay}
                  </div>
                )}
              </div>

              {!isReflection && (
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={() => moveDay(slotIndex, -1)}
                    disabled={slotIndex === 0 || REFLECTION_DAYS.includes(slotDay - 1)}
                    style={{
                      width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
                      background: 'rgba(255,255,255,0.06)', color: '#aaa', fontSize: 14,
                      fontFamily: "'DM Sans', sans-serif",
                      opacity: (slotIndex === 0 || REFLECTION_DAYS.includes(slotDay - 1)) ? 0.3 : 1,
                    }}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveDay(slotIndex, 1)}
                    disabled={slotIndex === 29 || REFLECTION_DAYS.includes(slotDay + 1)}
                    style={{
                      width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
                      background: 'rgba(255,255,255,0.06)', color: '#aaa', fontSize: 14,
                      fontFamily: "'DM Sans', sans-serif",
                      opacity: (slotIndex === 29 || REFLECTION_DAYS.includes(slotDay + 1)) ? 0.3 : 1,
                    }}
                  >
                    ↓
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
