import { useState, useMemo, useEffect } from 'react';
import { CHALLENGE_DAYS, CATEGORY_COLORS, getCategoryColors, getPhases, getDayContent, getDayDataForNum, DAILY_MINIMUMS, VETERAN_DAILY_MINIMUMS, getWeekNumber, getWeeklyOfferTarget, getWeekDayRange } from '../data/challengeDays';
import { COMPLIANCE_METRICS, checkDailyCompliance, getTimeUntilDeadline, DEFAULT_DAILY_MINIMUMS, DEFAULT_ENFORCEMENT } from '../data/compliance';
import QuizSection from './QuizSection';
import { CONTACT_GROUPS } from './ContactsCRM';
import ReflectionDay from './ReflectionDay';
import RentalCalculator from './RentalCalculator';
import { calculateFollowUpDate, validatePhone } from '../utils/storage';

const GROUP_COLORS = { target: '#e94560', arsenal: '#f0a500' };


export default function DayView({
  day, user, onSubmit, onBack, contentOverrides, customPhases,
  complianceSettings, existingDailySubmission,
  onAddContact, onAddFollowUp, onUpdateContact, onUploadFile, contacts: initialContacts, getUploadUrl,
  quizAttempts, onQuizAttempt, isPreview,
}) {
  const [submitted, setSubmitted] = useState(false);

  // ── Training bypass for repeat users ─────────────────────────
  const trainingAlreadyDone = (user.trainingCompletedDays || []).includes(day);
  const [trainingExpanded, setTrainingExpanded] = useState(!trainingAlreadyDone);

  // ── Reflection Day (Days 7, 14, 21, 28 — always Sundays) ────
  const weekNum = getWeekNumber(day);

  // ── Metric state (the 6 compliance metrics) ──────────────────
  const [metrics, setMetrics] = useState({
    training_completed: existingDailySubmission?.training_completed || trainingAlreadyDone || false,
    properties_analyzed: existingDailySubmission?.properties_analyzed || 0,
    arsenal_contacts: existingDailySubmission?.arsenal_contacts || 0,
    target_contacts: existingDailySubmission?.target_contacts || 0,
    follow_ups: existingDailySubmission?.follow_ups || 0,
    offers_submitted: existingDailySubmission?.offers_submitted || 0,
  });
  const [proofText, setProofText] = useState(existingDailySubmission?.proof_text || '');
  const [showPostSubmit, setShowPostSubmit] = useState(false);
  const [postSubmitSaving, setPostSubmitSaving] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [calcSaved, setCalcSaved] = useState(false);

  // ── Day Data ──────────────────────────────────────────────────
  const isPost30 = day > 30;
  const dayData = isPost30 ? getDayDataForNum(day) : getDayContent(day, contentOverrides);
  const isReflectionDay = dayData?.isReflectionDay === true;
  const isComplete = isPreview ? false : user.completedDays.includes(day);
  const isCurrentOrPast = isPreview ? true : day <= user.currentDay;
  const existingSubmission = user.submissions.find(s => s.day === day);
  const dayColors = customPhases ? getCategoryColors(getPhases(customPhases)) : null;
  const cat = isPost30
    ? { accent: '#f0a500', label: 'Operator Mode' }
    : (dayColors && dayColors[day]) || CATEGORY_COLORS[dayData.category] || { accent: '#888', label: '' };

  // ── Compliance settings (per-day minimums from challengeDays.js) ──
  const isVeteran = (user.cohortAttempt || 1) >= 2;
  const baseMinimumsTable = isVeteran ? VETERAN_DAILY_MINIMUMS : DAILY_MINIMUMS;
  const perDayMins = (!isPost30 && baseMinimumsTable[day]) || DEFAULT_DAILY_MINIMUMS;
  const dailyMins = { ...complianceSettings?.dailyMinimums, ...perDayMins };
  const enforcement = { ...DEFAULT_ENFORCEMENT, ...complianceSettings?.enforcement };

  // ── Deadline countdown ────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(getTimeUntilDeadline(enforcement));
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilDeadline(enforcement));
    }, 1000);
    return () => clearInterval(interval);
  }, [enforcement.timezone, enforcement.daily_deadline_hour]);

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  const deadlineUrgent = hours < 2;

  // ── Standards check ───────────────────────────────────────────
  const compliance = useMemo(() => {
    return checkDailyCompliance(metrics, dailyMins);
  }, [metrics, dailyMins]);

  const canSubmit = isPreview || (!isComplete && !submitted && isCurrentOrPast);
  const isUpdate = !!existingDailySubmission;

  // ── Contact & Follow-up state ────────────────────────────────
  const [contactList, setContactList] = useState(initialContacts || []);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [inlineContactFor, setInlineContactFor] = useState(null); // 'arsenal' | 'target' | null
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactGroup, setContactGroup] = useState('target');
  const [contactProperty, setContactProperty] = useState('');
  const [contactNotes, setContactNotes] = useState('');
  const [contactSaving, setContactSaving] = useState(false);
  const [duplicateContact, setDuplicateContact] = useState(null);
  const [contactFollowUpInterval, setContactFollowUpInterval] = useState('');
  const [targetOutcome, setTargetOutcome] = useState('');
  const [followUpContactId, setFollowUpContactId] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [followUpSaving, setFollowUpSaving] = useState(false);
  const [followUpInterval, setFollowUpInterval] = useState('');
  const [followUpReclassify, setFollowUpReclassify] = useState('');
  const [inlineFollowUpId, setInlineFollowUpId] = useState(null);
  const [inlineFollowUpNotes, setInlineFollowUpNotes] = useState('');
  const [inlineFollowUpInterval, setInlineFollowUpInterval] = useState('');
  const [inlineFollowUpSaving, setInlineFollowUpSaving] = useState(false);
  const [completedFollowUps, setCompletedFollowUps] = useState([]);

  // ── Offers & Under Contract state ────────────────────────────
  const [offersSubmitted, setOffersSubmitted] = useState([]);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerContactId, setOfferContactId] = useState('');
  const [offerPurchasePrice, setOfferPurchasePrice] = useState('');
  const [offerNotes, setOfferNotes] = useState('');
  const [underContract, setUnderContract] = useState([]);
  const [showUnderContractForm, setShowUnderContractForm] = useState(false);
  const [underContractContactId, setUnderContractContactId] = useState('');
  const [showContractCelebration, setShowContractCelebration] = useState(false);

  useEffect(() => {
    if (initialContacts) setContactList(initialContacts);
  }, [initialContacts]);

  const [contactPhoneError, setContactPhoneError] = useState('');

  const resetContactForm = () => {
    setContactName(''); setContactPhone(''); setContactEmail('');
    setContactGroup('target'); setContactProperty(''); setContactNotes('');
    setContactFollowUpInterval(''); setTargetOutcome('');
    setDuplicateContact(null); setShowContactForm(false);
    setContactPhoneError('');
  };

  const handleAddContact = async (force) => {
    if (!contactName.trim()) return;
    if (!contactFollowUpInterval) return;
    if (contactGroup === 'target' && !targetOutcome) return;
    const phoneCheck = validatePhone(contactPhone, { required: true });
    if (!phoneCheck.valid) { setContactPhoneError(phoneCheck.error); return; }
    setContactPhoneError('');
    if (!force) {
      const dup = contactList.find(c => c.name?.toLowerCase() === contactName.trim().toLowerCase());
      if (dup) { setDuplicateContact(dup); return; }
    }
    setContactSaving(true);
    setDuplicateContact(null);

    const now = new Date().toISOString();
    let finalGroup = contactGroup;
    let pipelineStatus = 'new';
    const createArsenalToo = targetOutcome === 'both' || targetOutcome === 'dead_arsenal';
    if (contactGroup === 'target') {
      if (targetOutcome === 'target_property' || targetOutcome === 'both') pipelineStatus = 'target_property';
      else if (targetOutcome === 'dead' || targetOutcome === 'dead_arsenal') pipelineStatus = 'dead';
      else if (targetOutcome === 'arsenal') { finalGroup = 'arsenal'; pipelineStatus = 'new'; }
    }

    const result = await onAddContact({
      name: contactName.trim(),
      phone: phoneCheck.formatted,
      email: contactEmail.trim() || null,
      contact_group: finalGroup,
      property: contactGroup === 'target' ? (contactProperty.trim() || null) : null,
      notes: contactNotes.trim() || null,
      day_added: day,
      pipeline_status: pipelineStatus,
      follow_up_interval: contactFollowUpInterval,
      follow_up_date: calculateFollowUpDate(contactFollowUpInterval),
      last_contact_date: now,
    });
    if (result?.success && result.contact) {
      setContactList(prev => [result.contact, ...prev]);
    }

    if (createArsenalToo && result?.success) {
      const arsenalResult = await onAddContact({
        name: contactName.trim(),
        phone: phoneCheck.formatted,
        email: contactEmail.trim() || null,
        contact_group: 'arsenal',
        property: null,
        notes: contactNotes.trim() ? `[From target contact] ${contactNotes.trim()}` : '[From target contact]',
        day_added: day,
        pipeline_status: 'new',
        follow_up_interval: contactFollowUpInterval,
        follow_up_date: calculateFollowUpDate(contactFollowUpInterval),
        last_contact_date: now,
      });
      if (arsenalResult?.success && arsenalResult.contact) {
        setContactList(prev => [arsenalResult.contact, ...prev]);
      }
    }

    setContactSaving(false);
    resetContactForm();
  };

  const handleGoToFollowUp = (contact) => {
    resetContactForm();
    setFollowUpContactId(contact.id);
    setFollowUpInterval('');
    setFollowUpReclassify('');
    setShowFollowUpForm(true);
  };

  const handleAddFollowUp = async () => {
    if (!followUpContactId || !followUpNotes.trim() || !followUpInterval) return;
    setFollowUpSaving(true);
    const now = new Date().toISOString();
    const contactUpdates = {
      follow_up_interval: followUpInterval,
      follow_up_date: calculateFollowUpDate(followUpInterval),
      last_contact_date: now,
    };
    if (followUpReclassify && followUpReclassify !== 'keep') {
      contactUpdates.pipeline_status = followUpReclassify;
      contactUpdates.reclassified_at = now;
      if (followUpReclassify === 'dead') {
        contactUpdates.follow_up_interval = followUpInterval;
        contactUpdates.follow_up_date = calculateFollowUpDate(followUpInterval);
      }
    }
    await onAddFollowUp({
      contact_id: followUpContactId,
      notes: followUpNotes.trim(),
      day_number: day,
    }, contactUpdates);
    setContactList(prev => prev.map(c => c.id === followUpContactId ? { ...c, ...contactUpdates } : c));
    setFollowUpSaving(false);
    setFollowUpContactId(''); setFollowUpNotes(''); setFollowUpInterval(''); setFollowUpReclassify('');
    setShowFollowUpForm(false);
  };

  const groupedContacts = useMemo(() => {
    const groups = { target: [], arsenal: [] };
    (contactList || []).forEach(c => {
      const g = c.contact_group || 'target';
      if (groups[g]) groups[g].push(c);
      else groups.target.push(c);
    });
    return groups;
  }, [contactList]);

  // ── Quiz gate ────────────────────────────────────────────────
  const hasRequiredQuiz = !isPost30 && dayData.quiz?.required && dayData.quiz.scenarios?.length > 0;
  const quizAlreadyPassed = hasRequiredQuiz && (quizAttempts || []).length > 0 &&
    dayData.quiz.scenarios.every(s => (quizAttempts || []).some(a => a.scenario_id === s.id && a.correct));
  const quizBypassForVeteran = hasRequiredQuiz && (user.cohortAttempt || 1) >= 2 && trainingAlreadyDone;
  const [quizPassed, setQuizPassed] = useState(quizAlreadyPassed || quizBypassForVeteran || isComplete);

  // ── Handlers ──────────────────────────────────────────────────
  const setMetric = (key, value) => {
    setMetrics(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const newOffers = metrics.offers_submitted || 0;
    const prevOffers = existingDailySubmission?.offers_submitted || 0;
    const offerDelta = newOffers - prevOffers;
    onSubmit(day, {
      text: proofText || buildProofSummary(metrics),
      dayMetrics: metrics,
      complianceMetrics: metrics,
      metDailyMinimum: compliance.met,
      lifetimeOffersDelta: offerDelta > 0 ? offerDelta : 0,
    });
    setSubmitted(true);
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="scale-in" style={{ maxWidth: 720, margin: '0 auto' }}>
      <button className="btn-secondary" onClick={onBack} style={{ marginBottom: 24, padding: '8px 20px', fontSize: 13 }}>
        ← Back to Timeline
      </button>

      {/* Day Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span className="mono" style={{ fontSize: 11, color: cat.accent, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
            {cat.label}
          </span>
          <span style={{ color: '#333' }}>•</span>
          <span className="mono" style={{ fontSize: 11, color: '#555' }}>{isPost30 ? `DAY ${day}` : `DAY ${day}/30`}</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, marginBottom: 4 }}>
          {dayData.title}
        </h1>
        {dayData.caption && (
          <p style={{ fontSize: 14, color: '#888', marginTop: 4, marginBottom: 0 }}>
            {dayData.caption}
          </p>
        )}
        {isComplete && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(72,199,142,0.1)', border: '1px solid rgba(72,199,142,0.2)',
            padding: '6px 14px', borderRadius: 8, fontSize: 13, color: '#48c78e', marginTop: 8,
          }}>
            ✓ Completed
          </div>
        )}
      </div>

      {/* Deadline Countdown (shown when submission area is visible) */}
      {canSubmit && timeLeft > 0 && (
        <div className="card" style={{
          marginBottom: 24, padding: '16px 20px', textAlign: 'center',
          background: deadlineUrgent ? 'rgba(233,69,96,0.08)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${deadlineUrgent ? 'rgba(233,69,96,0.3)' : 'rgba(255,255,255,0.06)'}`,
        }}>
          <div style={{ fontSize: 12, color: deadlineUrgent ? '#e94560' : '#888', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            {deadlineUrgent ? 'Deadline approaching' : 'Time remaining to submit'}
          </div>
          <div className="mono" style={{ fontSize: 32, fontWeight: 700, color: deadlineUrgent ? '#e94560' : '#fff' }}>
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
            Deadline: {enforcement.daily_deadline_hour === 23 ? '11:59 PM' : `${enforcement.daily_deadline_hour}:59`} {enforcement.timezone === 'America/Los_Angeles' ? 'Pacific' : enforcement.timezone}
          </div>
        </div>
      )}

      {/* Video Player — only show when a video URL exists */}
      {!isPost30 && dayData.videoUrl && <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
        <div style={{ aspectRatio: '16/9', position: 'relative' }}>
          <iframe
            src={dayData.videoUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; encrypted-media; gyroscope"
            allowFullScreen
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <div style={{
            display: 'none', position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12,
          }}>
            <div style={{ fontSize: 14, color: '#e94560', fontWeight: 600 }}>Video failed to load</div>
            <button
              className="btn-secondary"
              style={{ padding: '8px 20px', fontSize: 13 }}
              onClick={() => {
                const iframe = document.querySelector(`iframe[src="${dayData.videoUrl}"]`);
                if (iframe) { iframe.style.display = ''; iframe.nextSibling.style.display = 'none'; iframe.src = dayData.videoUrl; }
              }}
            >
              Retry
            </button>
            <a href={dayData.videoUrl} target="_blank" rel="noopener" style={{ color: '#888', fontSize: 12, textDecoration: 'underline' }}>
              Open video directly
            </a>
          </div>
        </div>
      </div>}

      {/* Downloads */}
      {dayData.downloads && dayData.downloads.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>📥</span>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Resources</h3>
          </div>
          {dayData.downloads.map((dl, i) => (
            <a key={i} href={dl.url} target="_blank" rel="noopener"
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, color: '#e94560', textDecoration: 'none', fontSize: 14, marginBottom: i < dayData.downloads.length - 1 ? 8 : 0 }}>
              📎 {dl.name}
            </a>
          ))}
        </div>
      )}

      {/* Veteran Minimums Badge */}
      {isVeteran && !isPost30 && (
        <div style={{
          marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
          background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', color: '#a855f7',
        }}>
          VETERAN MINIMUMS — Cohort #{user.cohortAttempt || 2}
        </div>
      )}

      {/* Reflection Day */}
      {isReflectionDay && (
        <ReflectionDay
          day={day}
          user={user}
          onMarkTrainingComplete={() => setMetric('training_completed', true)}
        />
      )}

      {/* Training Content (standard days) */}
      {!isReflectionDay && dayData.trainingContent && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: trainingExpanded ? 12 : 0, cursor: trainingAlreadyDone ? 'pointer' : 'default' }}
            onClick={trainingAlreadyDone ? () => setTrainingExpanded(!trainingExpanded) : undefined}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(83,52,131,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📚</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, flex: 1 }}>Training Content</h3>
            {trainingAlreadyDone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: 'rgba(72,199,142,0.1)', color: '#48c78e', fontWeight: 700 }}>
                  PREVIOUSLY COMPLETED
                </span>
                <span style={{ fontSize: 14, color: '#666', transform: trainingExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
              </div>
            )}
          </div>
          {trainingExpanded && (
            <p style={{ color: '#bbb', lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-line' }}>{dayData.trainingContent}</p>
          )}
        </div>
      )}

      {/* Task Description */}
      {dayData.taskDescription && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(233,69,96,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📋</div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Today's Standards</h3>
          </div>
          <p style={{ color: '#bbb', lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-line' }}>{dayData.taskDescription}</p>
        </div>
      )}

      {/* Quiz Section */}
      {hasRequiredQuiz && canSubmit && !quizPassed && (
        <>
          {quizBypassForVeteran ? null : (
            <QuizSection
              quiz={dayData.quiz}
              participantId={user.id}
              dayNumber={day}
              existingAttempts={quizAttempts || []}
              onAttempt={onQuizAttempt}
              onQuizComplete={() => setQuizPassed(true)}
            />
          )}
        </>
      )}

      {/* Quiz bypass notice for veterans */}
      {hasRequiredQuiz && canSubmit && quizBypassForVeteran && quizPassed && (
        <div style={{
          padding: '14px 20px', borderRadius: 12, marginBottom: 24,
          background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.15)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 16 }}>✓</span>
          <span style={{ fontSize: 13, color: '#a855f7', fontWeight: 600 }}>
            Quiz bypassed — you passed this in a previous cohort
          </span>
        </div>
      )}

      {/* Locked submission notice */}
      {hasRequiredQuiz && canSubmit && !quizPassed && !quizBypassForVeteran && (
        <div style={{
          padding: '20px', borderRadius: 12, marginBottom: 24,
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center', opacity: 0.6,
        }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>🔒</div>
          <p style={{ fontSize: 14, color: '#888', margin: 0 }}>
            Complete the check-for-understanding above to unlock your daily submissions.
          </p>
        </div>
      )}

      {/* Motivation Reminder */}
      {canSubmit && (user.stakesDeclaration || user.theirWhy) && (
        <div style={{
          marginBottom: 24, padding: '16px 20px', borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(233,69,96,0.04), rgba(72,199,142,0.04))',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {user.theirWhy && (
            <div style={{ marginBottom: user.stakesDeclaration ? 14 : 0 }}>
              <div style={{ fontSize: 11, color: '#48c78e', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Your why
              </div>
              <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
                "{user.theirWhy}"
              </p>
            </div>
          )}
          {user.stakesDeclaration && (
            <div>
              <div style={{ fontSize: 11, color: '#e94560', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                What's at stake
              </div>
              <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
                "{user.stakesDeclaration}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══ SUBMISSION AREA ═══ */}
      {isComplete && existingSubmission ? (
        <SubmissionComplete submission={existingSubmission} />
      ) : submitted ? (
        <SubmissionSuccess day={day} isUpdate={isUpdate} />
      ) : null}

      {/* ═══ DUE FOLLOW-UPS (always visible on completed/submitted days) ═══ */}
      {(submitted || (isComplete && existingSubmission)) && (
        <div style={{ marginTop: 24 }}>
          <DueFollowUps
            contacts={contactList}
            onFollowUp={(contact) => {
              setFollowUpContactId(contact.id);
              setFollowUpInterval('');
              setFollowUpReclassify('');
              setFollowUpNotes('');
              setShowFollowUpForm(true);
              setShowPostSubmit(true);
            }}
            onSnooze={async (contact, days) => {
              const newDate = new Date();
              newDate.setDate(newDate.getDate() + days);
              const updates = { follow_up_date: newDate.toISOString() };
              if (onUpdateContact) await onUpdateContact(contact.id, updates);
              setContactList(prev => prev.map(c => c.id === contact.id ? { ...c, ...updates } : c));
            }}
            onMarkDead={async (contact, interval) => {
              const now = new Date().toISOString();
              const updates = {
                pipeline_status: 'dead', reclassified_at: now,
                follow_up_interval: interval,
                follow_up_date: calculateFollowUpDate(interval),
              };
              if (onUpdateContact) await onUpdateContact(contact.id, updates);
              setContactList(prev => prev.map(c => c.id === contact.id ? { ...c, ...updates } : c));
            }}
          />
        </div>
      )}

      {/* ═══ POST-SUBMISSION ACTIVITIES ═══ */}
      {(submitted || (isComplete && existingSubmission)) && (
        <div style={{ marginTop: 16 }}>
          {!showPostSubmit ? (
            <button
              onClick={() => setShowPostSubmit(true)}
              className="btn-secondary"
              style={{
                width: '100%', padding: '14px 20px', fontSize: 14, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                border: '1px solid rgba(240,165,0,0.2)', background: 'rgba(240,165,0,0.04)',
                color: '#f0a500', borderRadius: 12, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              + Add More Activities
            </button>
          ) : (
            <>
              {/* ── Metric Adjustments ── */}
              <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(240,165,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📊</div>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>Add More Activities</h3>
                  </div>
                  <button
                    onClick={() => setShowPostSubmit(false)}
                    style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 12,
                      border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)',
                      color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Collapse
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Arsenal Contacts */}
                  <div>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18 }}>🤝</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#ddd' }}>Arsenal Contacts</div>
                          <div style={{ fontSize: 11, color: '#f0a500', fontWeight: 600 }}>Current: {metrics.arsenal_contacts || 0}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {(metrics.arsenal_contacts || 0) > 0 && (
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#f0a500', minWidth: 24, textAlign: 'center' }}>{metrics.arsenal_contacts}</span>
                        )}
                        <button
                          onClick={() => setInlineContactFor(prev => prev === 'arsenal' ? null : 'arsenal')}
                          style={{
                            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                            border: '1px solid rgba(240,165,0,0.4)',
                            background: inlineContactFor === 'arsenal' ? 'rgba(240,165,0,0.2)' : 'rgba(240,165,0,0.1)',
                            color: '#f0a500',
                          }}
                        >+ Add</button>
                      </div>
                    </div>
                    <InlineAddContact
                      group="arsenal"
                      isOpen={inlineContactFor === 'arsenal'}
                      onToggle={(g) => setInlineContactFor(prev => prev === g ? null : g)}
                      onAddContact={onAddContact}
                      contactList={contactList}
                      setContactList={setContactList}
                      onAutoIncrement={() => setMetric('arsenal_contacts', (metrics.arsenal_contacts || 0) + 1)}
                      calculateFollowUpDate={calculateFollowUpDate}
                      day={day}
                    />
                  </div>

                  {/* Target Contacts */}
                  <div>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18 }}>🎯</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#ddd' }}>Target Contacts</div>
                          <div style={{ fontSize: 11, color: '#e94560', fontWeight: 600 }}>Current: {metrics.target_contacts || 0}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {(metrics.target_contacts || 0) > 0 && (
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#e94560', minWidth: 24, textAlign: 'center' }}>{metrics.target_contacts}</span>
                        )}
                        <button
                          onClick={() => setInlineContactFor(prev => prev === 'target' ? null : 'target')}
                          style={{
                            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                            border: '1px solid rgba(233,69,96,0.4)',
                            background: inlineContactFor === 'target' ? 'rgba(233,69,96,0.2)' : 'rgba(233,69,96,0.1)',
                            color: '#e94560',
                          }}
                        >+ Add</button>
                      </div>
                    </div>
                    <InlineAddContact
                      group="target"
                      isOpen={inlineContactFor === 'target'}
                      onToggle={(g) => setInlineContactFor(prev => prev === g ? null : g)}
                      onAddContact={onAddContact}
                      contactList={contactList}
                      setContactList={setContactList}
                      onAutoIncrement={() => setMetric('target_contacts', (metrics.target_contacts || 0) + 1)}
                      calculateFollowUpDate={calculateFollowUpDate}
                      day={day}
                    />
                  </div>

                  {/* Properties Analyzed */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>🏠</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#ddd' }}>Properties Analyzed</div>
                        <div style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>Current: {metrics.properties_analyzed || 0}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        onClick={() => setMetric('properties_analyzed', Math.max(0, (metrics.properties_analyzed || 0) - 1))}
                        style={{
                          width: 32, height: 32, borderRadius: 6, fontSize: 18, fontWeight: 700,
                          border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                          color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >-</button>
                      <div className="mono" style={{
                        width: 56, textAlign: 'center', fontSize: 18, fontWeight: 700,
                        padding: '6px', color: '#fff',
                      }}>
                        {metrics.properties_analyzed || 0}
                      </div>
                      <button
                        onClick={() => setMetric('properties_analyzed', (metrics.properties_analyzed || 0) + 1)}
                        style={{
                          width: 32, height: 32, borderRadius: 6, fontSize: 18, fontWeight: 700,
                          border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                          color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >+</button>
                    </div>
                  </div>

                  {/* CDS Rental Calculator */}
                  {(() => {
                    const targetProps = (contactList || []).filter(c => c.contact_group === 'target' && c.pipeline_status !== 'dead');
                    return (
                      <div style={{
                        borderRadius: 10,
                        border: '1px solid rgba(233,69,96,0.2)',
                        overflow: 'hidden',
                      }}>
                        <button
                          onClick={() => { setCalcOpen(!calcOpen); setCalcSaved(false); }}
                          style={{
                            width: '100%', padding: '12px 16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: 'rgba(233,69,96,0.06)', border: 'none',
                            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 18 }}>📊</span>
                            <div style={{ textAlign: 'left' }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#e94560' }}>CDS Rental Calculator</div>
                              <div style={{ fontSize: 11, color: '#888' }}>Analyze a property</div>
                            </div>
                          </div>
                          <span style={{ fontSize: 12, color: '#888', transition: 'transform 0.2s', transform: calcOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                        </button>
                        {calcOpen && (
                          <div style={{ padding: '14px 16px' }}>
                            <RentalCalculator
                              targetProperties={targetProps}
                              day={day}
                              metrics={metrics}
                              onSaveAnalysis={async (propertyId, summary) => {
                                const contact = targetProps.find(c => c.id === propertyId);
                                const existing = contact?.analysis_notes || [];
                                const entry = {
                                  id: `analysis_${Date.now()}`,
                                  text: summary,
                                  date: new Date().toISOString(),
                                  day,
                                };
                                await onUpdateContact(propertyId, {
                                  analysis_notes: [...existing, entry],
                                });
                                setMetric('properties_analyzed', (metrics.properties_analyzed || 0) + 1);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Offers Submitted */}
                  {(() => {
                    const targetProperties = (contactList || []).filter(c => c.contact_group === 'target' && c.pipeline_status !== 'dead');
                    return (
                      <div>
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 16px', borderRadius: 10,
                          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 18 }}>📝</span>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#ddd' }}>Offers Submitted</div>
                              <div style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>
                                {offersSubmitted.length > 0 ? `${offersSubmitted.length} offer${offersSubmitted.length !== 1 ? 's' : ''} today` : `Current: ${metrics.offers_submitted || 0}`}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowOfferForm(!showOfferForm)}
                            style={{
                              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                              border: '1px solid rgba(233,69,96,0.4)',
                              background: showOfferForm ? 'rgba(233,69,96,0.2)' : 'rgba(233,69,96,0.1)',
                              color: '#e94560',
                            }}
                          >+ Add Offer</button>
                        </div>

                        {showOfferForm && (
                          <div style={{
                            marginTop: 8, padding: 14, borderRadius: 10,
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(233,69,96,0.15)',
                          }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#e94560', marginBottom: 10 }}>New Offer</div>
                            <select value={offerContactId} onChange={e => setOfferContactId(e.target.value)}
                              style={{
                                width: '100%', fontSize: 13, padding: '10px 12px', marginBottom: 10, borderRadius: 8,
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc',
                              }}>
                              <option value="">Select target property...</option>
                              {targetProperties.map(c => (
                                <option key={c.id} value={c.id}>{c.name}{c.property ? ` — ${c.property}` : ''}</option>
                              ))}
                            </select>
                            <input type="text" value={offerPurchasePrice} onChange={e => setOfferPurchasePrice(e.target.value)}
                              placeholder="Purchase price (e.g. $250,000)"
                              style={{
                                width: '100%', fontSize: 13, padding: '10px 12px', marginBottom: 10, borderRadius: 8,
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#eee',
                              }} />
                            <textarea value={offerNotes} onChange={e => setOfferNotes(e.target.value)}
                              placeholder="Notes / contingencies..." rows={2}
                              style={{
                                width: '100%', fontSize: 13, padding: '8px 12px', marginBottom: 10, resize: 'vertical',
                                borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#eee',
                              }} />
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button disabled={!offerContactId}
                                onClick={() => {
                                  const contact = targetProperties.find(c => c.id === offerContactId);
                                  setOffersSubmitted(prev => [...prev, {
                                    contactId: offerContactId, contactName: contact?.name || '',
                                    property: contact?.property || '', purchasePrice: offerPurchasePrice,
                                    notes: offerNotes, timestamp: new Date().toISOString(),
                                  }]);
                                  setMetric('offers_submitted', (metrics.offers_submitted || 0) + 1);
                                  setOfferContactId(''); setOfferPurchasePrice(''); setOfferNotes('');
                                  setShowOfferForm(false);
                                }}
                                style={{
                                  flex: 1, padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                                  cursor: offerContactId ? 'pointer' : 'default', fontFamily: "'DM Sans', sans-serif",
                                  border: 'none',
                                  background: offerContactId ? 'rgba(233,69,96,0.2)' : 'rgba(255,255,255,0.04)',
                                  color: offerContactId ? '#e94560' : '#555', opacity: offerContactId ? 1 : 0.4,
                                }}>Submit Offer</button>
                              <button onClick={() => setShowOfferForm(false)}
                                style={{
                                  padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                                  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#888',
                                }}>Cancel</button>
                            </div>
                          </div>
                        )}

                        {offersSubmitted.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            {offersSubmitted.map((offer, i) => (
                              <div key={i} style={{
                                padding: '10px 14px', borderRadius: 8, marginBottom: 4,
                                background: 'rgba(233,69,96,0.04)', border: '1px solid rgba(233,69,96,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              }}>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: '#ddd' }}>
                                    {offer.contactName}{offer.property ? ` — ${offer.property}` : ''}
                                  </div>
                                  {offer.purchasePrice && <div style={{ fontSize: 12, color: '#e94560', marginTop: 2 }}>{offer.purchasePrice}</div>}
                                  {offer.notes && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{offer.notes}</div>}
                                </div>
                                <div style={{ fontSize: 11, color: '#555' }}>
                                  {new Date(offer.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Weekly Offer Tracker (post-submit) */}
                  <div style={{ marginTop: 16, marginBottom: 16 }}>
                    <WeeklyOfferTracker
                      day={day}
                      user={user}
                      currentOffers={metrics.offers_submitted || 0}
                      existingOffers={existingDailySubmission?.offers_submitted || 0}
                    />
                  </div>

                  {/* Properties Under Contract (post-submit) */}
                  {(() => {
                    const targetProperties = (contactList || []).filter(c => c.contact_group === 'target' && c.pipeline_status !== 'dead');
                    return (
                      <div>
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 16px', borderRadius: 10,
                          background: 'rgba(72,199,142,0.04)', border: '1px solid rgba(72,199,142,0.12)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 18 }}>🏆</span>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#ddd' }}>Properties Under Contract</div>
                              <div style={{ fontSize: 11, color: '#48c78e', fontWeight: 600 }}>
                                {underContract.length > 0 ? `${underContract.length} propert${underContract.length !== 1 ? 'ies' : 'y'}` : 'None yet'}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowUnderContractForm(!showUnderContractForm)}
                            style={{
                              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                              border: '1px solid rgba(72,199,142,0.4)',
                              background: showUnderContractForm ? 'rgba(72,199,142,0.2)' : 'rgba(72,199,142,0.1)',
                              color: '#48c78e',
                            }}
                          >+ Add</button>
                        </div>

                        {showUnderContractForm && (
                          <div style={{
                            marginTop: 8, padding: 14, borderRadius: 10,
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(72,199,142,0.15)',
                          }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#48c78e', marginBottom: 10 }}>Add Property Under Contract</div>
                            <select value={underContractContactId} onChange={e => setUnderContractContactId(e.target.value)}
                              style={{
                                width: '100%', fontSize: 13, padding: '10px 12px', marginBottom: 10, borderRadius: 8,
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc',
                              }}>
                              <option value="">Select target property...</option>
                              {targetProperties.map(c => (
                                <option key={c.id} value={c.id}>{c.name}{c.property ? ` — ${c.property}` : ''}</option>
                              ))}
                            </select>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button disabled={!underContractContactId}
                                onClick={() => {
                                  const contact = targetProperties.find(c => c.id === underContractContactId);
                                  setUnderContract(prev => [...prev, {
                                    contactId: underContractContactId, contactName: contact?.name || '',
                                    property: contact?.property || '', timestamp: new Date().toISOString(),
                                  }]);
                                  setUnderContractContactId(''); setShowUnderContractForm(false);
                                  setShowContractCelebration(true);
                                  setTimeout(() => setShowContractCelebration(false), 4000);
                                }}
                                style={{
                                  flex: 1, padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                                  cursor: underContractContactId ? 'pointer' : 'default', fontFamily: "'DM Sans', sans-serif",
                                  border: 'none',
                                  background: underContractContactId ? 'rgba(72,199,142,0.2)' : 'rgba(255,255,255,0.04)',
                                  color: underContractContactId ? '#48c78e' : '#555', opacity: underContractContactId ? 1 : 0.4,
                                }}>Confirm Under Contract</button>
                              <button onClick={() => setShowUnderContractForm(false)}
                                style={{
                                  padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                                  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#888',
                                }}>Cancel</button>
                            </div>
                          </div>
                        )}

                        {showContractCelebration && (
                          <div style={{
                            marginTop: 8, padding: '20px', borderRadius: 12, textAlign: 'center',
                            background: 'linear-gradient(135deg, rgba(72,199,142,0.15), rgba(240,165,0,0.1))',
                            border: '1px solid rgba(72,199,142,0.3)',
                            animation: 'celebrationPulse 0.6s ease-in-out',
                          }}>
                            <div style={{ fontSize: 36, marginBottom: 8 }}>🎉🏆🎉</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#48c78e', marginBottom: 4 }}>Congratulations!</div>
                            <div style={{ fontSize: 14, color: '#aaa' }}>Property under contract! Keep pushing!</div>
                          </div>
                        )}

                        {underContract.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            {underContract.map((uc, i) => (
                              <div key={i} style={{
                                padding: '10px 14px', borderRadius: 8, marginBottom: 4,
                                background: 'rgba(72,199,142,0.04)', border: '1px solid rgba(72,199,142,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#ddd' }}>
                                  {uc.contactName}{uc.property ? ` — ${uc.property}` : ''}
                                </div>
                                <span style={{
                                  fontSize: 10, padding: '3px 8px', borderRadius: 4,
                                  background: 'rgba(72,199,142,0.15)', color: '#48c78e', fontWeight: 700,
                                }}>UNDER CONTRACT</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Inline Contact Form (reuses existing state) */}
                {showContactForm && (
                  <div style={{ marginTop: 16, padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>New Contact</div>

                    <input value={contactName} onChange={e => setContactName(e.target.value)}
                      placeholder="Name *" style={{ width: '100%', fontSize: 14, padding: '10px 14px', marginBottom: 10,
                      borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#eee' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: contactPhoneError ? 4 : 10 }}>
                      <input type="tel" value={contactPhone} onChange={e => { setContactPhone(e.target.value); setContactPhoneError(''); }}
                        placeholder="Phone # (required)" style={{ fontSize: 13, padding: '8px 12px', borderRadius: 8,
                        background: 'rgba(255,255,255,0.04)', border: contactPhoneError ? '1px solid rgba(233,69,96,0.5)' : '1px solid rgba(255,255,255,0.1)', color: '#eee' }} />
                      <input value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                        placeholder="Email" style={{ fontSize: 13, padding: '8px 12px', borderRadius: 8,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#eee' }} />
                    </div>
                    {contactPhoneError && <div style={{ fontSize: 11, color: '#e94560', marginBottom: 10 }}>{contactPhoneError}</div>}

                    <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 6 }}>Group</div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                      {CONTACT_GROUPS.map(g => (
                        <button key={g.value} onClick={() => { setContactGroup(g.value); setTargetOutcome(''); setContactFollowUpInterval(''); }} style={{
                          padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: contactGroup === g.value ? 600 : 400,
                          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", border: 'none',
                          background: contactGroup === g.value ? `${g.color}20` : 'rgba(255,255,255,0.04)',
                          color: contactGroup === g.value ? g.color : '#888',
                          outline: contactGroup === g.value ? `1px solid ${g.color}40` : '1px solid rgba(255,255,255,0.08)',
                        }}>
                          {g.label}
                        </button>
                      ))}
                    </div>

                    {contactGroup === 'target' && (
                      <AddressFields value={contactProperty} onChange={setContactProperty} borderColor="rgba(233,69,96,0.15)" />
                    )}

                    <textarea value={contactNotes} onChange={e => setContactNotes(e.target.value)}
                      placeholder="Notes about this contact..." rows={2}
                      style={{ width: '100%', fontSize: 13, padding: '8px 12px', marginBottom: 12, resize: 'vertical',
                      borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#eee' }} />

                    {contactGroup === 'target' && (
                        <OutcomeSelector targetOutcome={targetOutcome} setTargetOutcome={setTargetOutcome} setFollowUpInterval={setContactFollowUpInterval} />
                    )}

                    {(contactGroup === 'arsenal' || targetOutcome) && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, color: '#48c78e', fontWeight: 600, marginBottom: 6 }}>Schedule Follow-Up *</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {(targetOutcome === 'dead' || targetOutcome === 'dead_arsenal'
                            ? [{ value: '1_month', label: '1 Month' }, { value: '3_months', label: '3 Months' }, { value: '6_months', label: '6 Months' }, { value: 'never', label: 'Never' }]
                            : [{ value: '2_days', label: '2 Days' }, { value: '1_week', label: '1 Week' }, { value: '2_weeks', label: '2 Weeks' }]
                          ).map(opt => (
                            <button key={opt.value} onClick={() => setContactFollowUpInterval(opt.value)}
                              style={{
                                padding: '7px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                                fontFamily: "'DM Sans', sans-serif", border: 'none',
                                background: contactFollowUpInterval === opt.value ? 'rgba(72,199,142,0.15)' : 'rgba(255,255,255,0.04)',
                                color: contactFollowUpInterval === opt.value ? '#48c78e' : '#888',
                                outline: contactFollowUpInterval === opt.value ? '1px solid rgba(72,199,142,0.3)' : '1px solid rgba(255,255,255,0.06)',
                                fontWeight: contactFollowUpInterval === opt.value ? 600 : 400,
                              }}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {duplicateContact && (
                      <div style={{
                        padding: '12px 14px', borderRadius: 8, marginBottom: 12,
                        background: 'rgba(240,165,0,0.06)', border: '1px solid rgba(240,165,0,0.2)',
                      }}>
                        <div style={{ fontSize: 13, color: '#f0a500', fontWeight: 600, marginBottom: 8 }}>
                          You already have a contact named "{duplicateContact.name}".
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn-primary" onClick={() => handleGoToFollowUp(duplicateContact)}
                            style={{ padding: '8px 16px', fontSize: 12 }}>
                            Go to Follow-Up
                          </button>
                          <button className="btn-secondary" onClick={() => handleAddContact(true)}
                            style={{ padding: '8px 16px', fontSize: 12 }}>
                            Add Anyway
                          </button>
                        </div>
                      </div>
                    )}

                    {(() => {
                      const canAdd = contactName.trim() && contactFollowUpInterval
                        && (contactGroup === 'arsenal' || (targetOutcome && (contactGroup !== 'target' || contactProperty.trim())));
                      return (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn-primary" onClick={() => handleAddContact(false)}
                            disabled={!canAdd || contactSaving}
                            style={{ padding: '10px 20px', fontSize: 13, opacity: canAdd ? 1 : 0.4 }}>
                            {contactSaving ? 'Saving...' : 'Add Contact'}
                          </button>
                          <button className="btn-secondary" onClick={resetContactForm}
                            style={{ padding: '10px 16px', fontSize: 13 }}>
                            Cancel
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Save Updates Button */}
                <button
                  className="btn-primary"
                  disabled={postSubmitSaving}
                  onClick={async () => {
                    setPostSubmitSaving(true);
                    const newOffers = metrics.offers_submitted || 0;
                    const prevOffers = existingDailySubmission?.offers_submitted || 0;
                    const offerDelta = newOffers - prevOffers;
                    await onSubmit(day, {
                      text: proofText || buildProofSummary(metrics),
                      dayMetrics: metrics,
                      complianceMetrics: metrics,
                      metDailyMinimum: compliance.met,
                      lifetimeOffersDelta: offerDelta > 0 ? offerDelta : 0,
                    });
                    setPostSubmitSaving(false);
                    setShowPostSubmit(false);
                  }}
                  style={{
                    width: '100%', marginTop: 16, padding: '14px 20px', fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {postSubmitSaving ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ PRE-SUBMISSION FORM ═══ */}
      {!submitted && !(isComplete && existingSubmission) && canSubmit && (!hasRequiredQuiz || quizPassed) ? (
        <>
          {/* ── 6-Metric Entry Form ── */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(233,69,96,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📊</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Daily Activity Log</h3>
              {isUpdate && (
                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: 'rgba(240,165,0,0.1)', color: '#f0a500', fontWeight: 700 }}>
                  UPDATING
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {COMPLIANCE_METRICS.map(metric => {
                const required = dailyMins[metric.id];
                const value = metrics[metric.id];
                const isBool = metric.type === 'boolean';
                const met = isBool
                  ? (!required || value)
                  : (typeof required !== 'number' || required <= 0 || (value || 0) >= required);
                const isRequired = isBool ? !!required : (typeof required === 'number' && required > 0);

                const isContactMetric = metric.id === 'arsenal_contacts' || metric.id === 'target_contacts';
                const isOfferMetric = metric.id === 'offers_submitted';
                const isFollowUpMetric = metric.id === 'follow_ups';
                const contactMetricGroup = metric.id === 'arsenal_contacts' ? 'arsenal' : 'target';
                const contactColor = metric.id === 'arsenal_contacts' ? '#f0a500' : '#e94560';

                // Skip offers_submitted and follow_ups — rendered as custom sections below
                if (isOfferMetric || isFollowUpMetric) return null;

                return (
                  <div key={metric.id}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderRadius: 10,
                      background: met ? 'rgba(72,199,142,0.04)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${met ? 'rgba(72,199,142,0.15)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                        <span style={{ fontSize: 18 }}>{metric.icon}</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#ddd' }}>{metric.label}</div>
                          {isRequired && (
                            <div style={{ fontSize: 11, color: met ? '#48c78e' : '#e94560', fontWeight: 600 }}>
                              {isBool ? 'Required' : `Min: ${required}`}
                              {met && ' ✓'}
                            </div>
                          )}
                          {!isRequired && (
                            <div style={{ fontSize: 11, color: '#555' }}>Optional</div>
                          )}
                        </div>
                      </div>

                      {isBool ? (
                        <button
                          onClick={() => setMetric(metric.id, !value)}
                          style={{
                            padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700,
                            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                            border: value ? '1px solid rgba(72,199,142,0.3)' : '1px solid rgba(255,255,255,0.1)',
                            background: value ? 'rgba(72,199,142,0.15)' : 'rgba(255,255,255,0.04)',
                            color: value ? '#48c78e' : '#888',
                          }}
                        >
                          {value ? '✓ Done' : 'Mark Done'}
                        </button>
                      ) : isContactMetric ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {(value || 0) > 0 && (
                            <span style={{
                              fontSize: 14, fontWeight: 700, color: contactColor,
                              minWidth: 24, textAlign: 'center',
                            }}>{value}</span>
                          )}
                          <button
                            onClick={() => setInlineContactFor(prev => prev === contactMetricGroup ? null : contactMetricGroup)}
                            style={{
                              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                              border: `1px solid ${contactColor}40`,
                              background: inlineContactFor === contactMetricGroup ? `${contactColor}20` : `${contactColor}10`,
                              color: contactColor,
                            }}
                          >
                            + Add
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            onClick={() => setMetric(metric.id, Math.max(0, (value || 0) - 1))}
                            style={{
                              width: 32, height: 32, borderRadius: 6, fontSize: 18, fontWeight: 700,
                              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                              color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >-</button>
                          <input
                            type="number"
                            min="0"
                            value={value || 0}
                            onChange={e => setMetric(metric.id, Math.max(0, parseInt(e.target.value) || 0))}
                            style={{
                              width: 56, textAlign: 'center', fontSize: 18, fontWeight: 700,
                              padding: '6px', borderRadius: 6,
                              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                              color: '#fff',
                            }}
                          />
                          <button
                            onClick={() => setMetric(metric.id, (value || 0) + 1)}
                            style={{
                              width: 32, height: 32, borderRadius: 6, fontSize: 18, fontWeight: 700,
                              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                              color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >+</button>
                        </div>
                      )}
                    </div>
                    {isContactMetric && (
                      <InlineAddContact
                        group={contactMetricGroup}
                        isOpen={inlineContactFor === contactMetricGroup}
                        onToggle={(g) => setInlineContactFor(prev => prev === g ? null : g)}
                        onAddContact={onAddContact}
                        contactList={contactList}
                        setContactList={setContactList}
                        onAutoIncrement={() => setMetric(metric.id, (metrics[metric.id] || 0) + 1)}
                        calculateFollowUpDate={calculateFollowUpDate}
                        day={day}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* CDS Rental Calculator — Pre-Submission */}
            {(() => {
              const targetProps = (contactList || []).filter(c => c.contact_group === 'target' && c.pipeline_status !== 'dead');
              return (
                <div style={{ marginTop: 16, borderRadius: 10, border: '1px solid rgba(233,69,96,0.2)', overflow: 'hidden' }}>
                  <button
                    onClick={() => { setCalcOpen(!calcOpen); setCalcSaved(false); }}
                    style={{
                      width: '100%', padding: '12px 16px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'rgba(233,69,96,0.06)', border: 'none',
                      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>📊</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#e94560' }}>CDS Rental Calculator</div>
                        <div style={{ fontSize: 11, color: '#888' }}>Analyze a property & save to your pipeline</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: '#888', transition: 'transform 0.2s', transform: calcOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                  </button>
                  {calcOpen && (
                    <div style={{ padding: '14px 16px' }}>
                      <RentalCalculator
                        targetProperties={targetProps}
                        day={day}
                        metrics={metrics}
                        onSaveAnalysis={async (propertyId, summary) => {
                          const contact = targetProps.find(c => c.id === propertyId);
                          const existing = contact?.analysis_notes || [];
                          const entry = {
                            id: `analysis_${Date.now()}`,
                            text: summary,
                            date: new Date().toISOString(),
                            day,
                          };
                          await onUpdateContact(propertyId, {
                            analysis_notes: [...existing, entry],
                          });
                          setMetric('properties_analyzed', (metrics.properties_analyzed || 0) + 1);
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Follow-Ups Section */}
            {(() => {
              const now = new Date();
              const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
              const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const dueContacts = (contactList || [])
                .filter(c => {
                  if (!c.follow_up_date || c.follow_up_interval === 'never') return false;
                  if (completedFollowUps.includes(c.id)) return false;
                  return new Date(c.follow_up_date) <= todayEnd;
                })
                .sort((a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date));
              const overdueCount = dueContacts.filter(c => new Date(c.follow_up_date) < todayStart).length;
              const followUpCount = metrics.follow_ups || 0;
              const followUpMin = dailyMins.follow_ups || 0;
              const followUpMet = followUpMin <= 0 || followUpCount >= followUpMin;

              return (
                <div style={{ marginTop: 16 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 10,
                    background: followUpMet ? 'rgba(72,199,142,0.04)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${followUpMet ? 'rgba(72,199,142,0.15)' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>📞</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#ddd' }}>Follow-Ups</div>
                        <div style={{ fontSize: 11, color: followUpMet ? '#48c78e' : dueContacts.length > 0 ? '#e94560' : '#888', fontWeight: 600 }}>
                          {followUpCount > 0 ? `${followUpCount} completed today` : dueContacts.length > 0 ? `${dueContacts.length} due${overdueCount > 0 ? ` (${overdueCount} overdue)` : ''}` : 'No follow-ups due'}
                          {followUpMin > 0 && ` · Min: ${followUpMin}`}
                          {followUpMet && followUpMin > 0 && ' ✓'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {dueContacts.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      {dueContacts.map(contact => {
                        const isOverdue = new Date(contact.follow_up_date) < todayStart;
                        const diffDays = Math.floor((now - new Date(contact.follow_up_date)) / (1000 * 60 * 60 * 24));
                        const accentColor = isOverdue ? '#e94560' : '#f0a500';
                        const groupColor = contact.contact_group === 'arsenal' ? '#f0a500' : contact.pipeline_status === 'dead' ? '#666' : '#e94560';
                        const groupLabel = contact.contact_group === 'arsenal' ? 'Arsenal' : contact.pipeline_status === 'dead' ? 'Dead' : 'Target';
                        const isExpanded = inlineFollowUpId === contact.id;
                        const isDead = contact.pipeline_status === 'dead';

                        return (
                          <div key={contact.id} style={{
                            marginBottom: 6, padding: '12px 16px', borderRadius: 10,
                            background: isOverdue ? 'rgba(233,69,96,0.04)' : 'rgba(240,165,0,0.03)',
                            border: `1px solid ${accentColor}25`,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                background: `${groupColor}20`, border: `1px solid ${groupColor}30`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 13, fontWeight: 700, color: groupColor,
                              }}>
                                {contact.name?.charAt(0).toUpperCase()}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: 14, fontWeight: 600, color: '#ddd' }}>{contact.name}</span>
                                  <span style={{
                                    fontSize: 9, padding: '1px 5px', borderRadius: 3, fontWeight: 700,
                                    background: `${groupColor}15`, color: groupColor,
                                  }}>{groupLabel}</span>
                                  <span style={{
                                    fontSize: 9, padding: '1px 5px', borderRadius: 3, fontWeight: 700,
                                    background: `${accentColor}15`, color: accentColor,
                                  }}>{isOverdue ? `${diffDays}d overdue` : 'Due today'}</span>
                                </div>
                                {contact.property && <div style={{ fontSize: 12, color: '#e94560', marginTop: 1 }}>{contact.property}</div>}
                                {contact.phone && <div style={{ fontSize: 11, color: '#666', marginTop: 1 }}>📞 {contact.phone}</div>}
                                {contact.analysis_notes?.length > 0 && (
                                  <div style={{ fontSize: 10, color: '#e94560', marginTop: 2 }}>
                                    📊 {contact.analysis_notes.length} analysis{contact.analysis_notes.length !== 1 ? 'es' : ''}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  if (isExpanded) { setInlineFollowUpId(null); setInlineFollowUpNotes(''); setInlineFollowUpInterval(''); }
                                  else { setInlineFollowUpId(contact.id); setInlineFollowUpNotes(''); setInlineFollowUpInterval(''); }
                                }}
                                style={{
                                  padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                                  border: 'none', background: isExpanded ? 'rgba(72,199,142,0.2)' : 'rgba(72,199,142,0.1)',
                                  color: '#48c78e', flexShrink: 0,
                                }}>
                                {isExpanded ? 'Cancel' : '✓ Follow Up'}
                              </button>
                            </div>

                            {isExpanded && (
                              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <textarea
                                  value={inlineFollowUpNotes}
                                  onChange={e => setInlineFollowUpNotes(e.target.value)}
                                  placeholder="What happened in this follow-up?"
                                  rows={2}
                                  style={{
                                    width: '100%', fontSize: 13, padding: '8px 12px', marginBottom: 8, resize: 'vertical',
                                    borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#eee',
                                  }}
                                />
                                <div style={{ fontSize: 11, color: '#48c78e', fontWeight: 600, marginBottom: 4 }}>Next Follow-Up</div>
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                                  {(isDead
                                    ? [{ value: '1_month', label: '1 Mo' }, { value: '3_months', label: '3 Mo' }, { value: '6_months', label: '6 Mo' }, { value: 'never', label: 'Never' }]
                                    : [{ value: '2_days', label: '2 Days' }, { value: '1_week', label: '1 Wk' }, { value: '2_weeks', label: '2 Wk' }]
                                  ).map(opt => (
                                    <button key={opt.value} onClick={() => setInlineFollowUpInterval(opt.value)}
                                      style={{
                                        padding: '5px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                                        fontFamily: "'DM Sans', sans-serif", border: 'none',
                                        background: inlineFollowUpInterval === opt.value ? 'rgba(72,199,142,0.15)' : 'rgba(255,255,255,0.04)',
                                        color: inlineFollowUpInterval === opt.value ? '#48c78e' : '#888',
                                        outline: inlineFollowUpInterval === opt.value ? '1px solid rgba(72,199,142,0.3)' : '1px solid rgba(255,255,255,0.06)',
                                        fontWeight: inlineFollowUpInterval === opt.value ? 600 : 400,
                                      }}>
                                      {opt.label}
                                    </button>
                                  ))}
                                </div>
                                <button
                                  disabled={!inlineFollowUpNotes.trim() || !inlineFollowUpInterval || inlineFollowUpSaving}
                                  onClick={async () => {
                                    setInlineFollowUpSaving(true);
                                    const nowISO = new Date().toISOString();
                                    const contactUpdates = {
                                      follow_up_interval: inlineFollowUpInterval,
                                      follow_up_date: calculateFollowUpDate(inlineFollowUpInterval),
                                      last_contact_date: nowISO,
                                    };
                                    await onAddFollowUp({
                                      contact_id: contact.id,
                                      notes: inlineFollowUpNotes.trim(),
                                      day_number: day,
                                    }, contactUpdates);
                                    setContactList(prev => prev.map(c => c.id === contact.id ? { ...c, ...contactUpdates } : c));
                                    setCompletedFollowUps(prev => [...prev, contact.id]);
                                    setMetric('follow_ups', (metrics.follow_ups || 0) + 1);
                                    setInlineFollowUpId(null);
                                    setInlineFollowUpNotes('');
                                    setInlineFollowUpInterval('');
                                    setInlineFollowUpSaving(false);
                                  }}
                                  style={{
                                    padding: '8px 20px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                    cursor: inlineFollowUpNotes.trim() && inlineFollowUpInterval ? 'pointer' : 'default',
                                    fontFamily: "'DM Sans', sans-serif", border: 'none',
                                    background: inlineFollowUpNotes.trim() && inlineFollowUpInterval ? 'rgba(72,199,142,0.15)' : 'rgba(255,255,255,0.04)',
                                    color: inlineFollowUpNotes.trim() && inlineFollowUpInterval ? '#48c78e' : '#555',
                                    opacity: inlineFollowUpNotes.trim() && inlineFollowUpInterval ? 1 : 0.5,
                                  }}>
                                  {inlineFollowUpSaving ? 'Saving...' : '✓ Mark Complete'}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {dueContacts.length === 0 && followUpCount === 0 && (
                    <div style={{ marginTop: 6, padding: '8px 16px', borderRadius: 8, background: 'rgba(72,199,142,0.03)', textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: '#48c78e' }}>No follow-ups due today</div>
                    </div>
                  )}

                  {completedFollowUps.length > 0 && (
                    <div style={{ marginTop: 6, padding: '8px 16px', borderRadius: 8, background: 'rgba(72,199,142,0.04)' }}>
                      <div style={{ fontSize: 12, color: '#48c78e', fontWeight: 600 }}>
                        ✓ {completedFollowUps.length} follow-up{completedFollowUps.length !== 1 ? 's' : ''} completed today
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Offers Submitted Section */}
            {(() => {
              const targetProperties = (contactList || []).filter(c => c.contact_group === 'target' && c.pipeline_status !== 'dead');
              return (
                <div style={{ marginTop: 16 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>📝</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#ddd' }}>Offers Submitted</div>
                        <div style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>
                          {offersSubmitted.length > 0 ? `${offersSubmitted.length} offer${offersSubmitted.length !== 1 ? 's' : ''} today` : 'No offers yet'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowOfferForm(!showOfferForm)}
                      style={{
                        padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                        border: '1px solid rgba(233,69,96,0.4)',
                        background: showOfferForm ? 'rgba(233,69,96,0.2)' : 'rgba(233,69,96,0.1)',
                        color: '#e94560',
                      }}
                    >+ Add Offer</button>
                  </div>

                  {showOfferForm && (
                    <div style={{
                      marginTop: 8, padding: 14, borderRadius: 10,
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(233,69,96,0.15)',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e94560', marginBottom: 10 }}>New Offer</div>

                      <select value={offerContactId} onChange={e => setOfferContactId(e.target.value)}
                        style={{
                          width: '100%', fontSize: 13, padding: '10px 12px', marginBottom: 10, borderRadius: 8,
                          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc',
                        }}>
                        <option value="">Select target property...</option>
                        {targetProperties.map(c => (
                          <option key={c.id} value={c.id}>{c.name}{c.property ? ` — ${c.property}` : ''}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={offerPurchasePrice}
                        onChange={e => setOfferPurchasePrice(e.target.value)}
                        placeholder="Purchase price (e.g. $250,000)"
                        style={{
                          width: '100%', fontSize: 13, padding: '10px 12px', marginBottom: 10, borderRadius: 8,
                          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#eee',
                        }}
                      />

                      <textarea
                        value={offerNotes}
                        onChange={e => setOfferNotes(e.target.value)}
                        placeholder="Notes / contingencies..."
                        rows={2}
                        style={{
                          width: '100%', fontSize: 13, padding: '8px 12px', marginBottom: 10, resize: 'vertical',
                          borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#eee',
                        }}
                      />

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          disabled={!offerContactId}
                          onClick={() => {
                            const contact = targetProperties.find(c => c.id === offerContactId);
                            setOffersSubmitted(prev => [...prev, {
                              contactId: offerContactId,
                              contactName: contact?.name || '',
                              property: contact?.property || '',
                              purchasePrice: offerPurchasePrice,
                              notes: offerNotes,
                              timestamp: new Date().toISOString(),
                            }]);
                            setMetric('offers_submitted', (metrics.offers_submitted || 0) + 1);
                            setOfferContactId(''); setOfferPurchasePrice(''); setOfferNotes('');
                            setShowOfferForm(false);
                          }}
                          style={{
                            flex: 1, padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                            cursor: offerContactId ? 'pointer' : 'default', fontFamily: "'DM Sans', sans-serif",
                            border: 'none',
                            background: offerContactId ? 'rgba(233,69,96,0.2)' : 'rgba(255,255,255,0.04)',
                            color: offerContactId ? '#e94560' : '#555',
                            opacity: offerContactId ? 1 : 0.4,
                          }}
                        >
                          Submit Offer
                        </button>
                        <button onClick={() => setShowOfferForm(false)}
                          style={{
                            padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                            border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#888',
                          }}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {offersSubmitted.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      {offersSubmitted.map((offer, i) => (
                        <div key={i} style={{
                          padding: '10px 14px', borderRadius: 8, marginBottom: 4,
                          background: 'rgba(233,69,96,0.04)', border: '1px solid rgba(233,69,96,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#ddd' }}>
                              {offer.contactName}{offer.property ? ` — ${offer.property}` : ''}
                            </div>
                            {offer.purchasePrice && (
                              <div style={{ fontSize: 12, color: '#e94560', marginTop: 2 }}>{offer.purchasePrice}</div>
                            )}
                            {offer.notes && (
                              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{offer.notes}</div>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: '#555' }}>
                            {new Date(offer.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Weekly Offer Tracker */}
            <div style={{ marginTop: 16 }}>
              <WeeklyOfferTracker
                day={day}
                user={user}
                currentOffers={metrics.offers_submitted || 0}
                existingOffers={existingDailySubmission?.offers_submitted || 0}
              />
            </div>

            {/* Properties Under Contract */}
            {(() => {
              const targetProperties = (contactList || []).filter(c => c.contact_group === 'target' && c.pipeline_status !== 'dead');
              return (
                <div style={{ marginTop: 16 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 10,
                    background: 'rgba(72,199,142,0.04)', border: '1px solid rgba(72,199,142,0.12)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>🏆</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#ddd' }}>Properties Under Contract</div>
                        <div style={{ fontSize: 11, color: '#48c78e', fontWeight: 600 }}>
                          {underContract.length > 0 ? `${underContract.length} propert${underContract.length !== 1 ? 'ies' : 'y'}` : 'None yet'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowUnderContractForm(!showUnderContractForm)}
                      style={{
                        padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                        border: '1px solid rgba(72,199,142,0.4)',
                        background: showUnderContractForm ? 'rgba(72,199,142,0.2)' : 'rgba(72,199,142,0.1)',
                        color: '#48c78e',
                      }}
                    >+ Add</button>
                  </div>

                  {showUnderContractForm && (
                    <div style={{
                      marginTop: 8, padding: 14, borderRadius: 10,
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(72,199,142,0.15)',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#48c78e', marginBottom: 10 }}>Add Property Under Contract</div>

                      <select value={underContractContactId} onChange={e => setUnderContractContactId(e.target.value)}
                        style={{
                          width: '100%', fontSize: 13, padding: '10px 12px', marginBottom: 10, borderRadius: 8,
                          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc',
                        }}>
                        <option value="">Select target property...</option>
                        {targetProperties.map(c => (
                          <option key={c.id} value={c.id}>{c.name}{c.property ? ` — ${c.property}` : ''}</option>
                        ))}
                      </select>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          disabled={!underContractContactId}
                          onClick={() => {
                            const contact = targetProperties.find(c => c.id === underContractContactId);
                            setUnderContract(prev => [...prev, {
                              contactId: underContractContactId,
                              contactName: contact?.name || '',
                              property: contact?.property || '',
                              timestamp: new Date().toISOString(),
                            }]);
                            setUnderContractContactId('');
                            setShowUnderContractForm(false);
                            setShowContractCelebration(true);
                            setTimeout(() => setShowContractCelebration(false), 4000);
                          }}
                          style={{
                            flex: 1, padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                            cursor: underContractContactId ? 'pointer' : 'default', fontFamily: "'DM Sans', sans-serif",
                            border: 'none',
                            background: underContractContactId ? 'rgba(72,199,142,0.2)' : 'rgba(255,255,255,0.04)',
                            color: underContractContactId ? '#48c78e' : '#555',
                            opacity: underContractContactId ? 1 : 0.4,
                          }}
                        >
                          Confirm Under Contract
                        </button>
                        <button onClick={() => setShowUnderContractForm(false)}
                          style={{
                            padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                            border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#888',
                          }}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {showContractCelebration && (
                    <div style={{
                      marginTop: 8, padding: '20px', borderRadius: 12, textAlign: 'center',
                      background: 'linear-gradient(135deg, rgba(72,199,142,0.15), rgba(240,165,0,0.1))',
                      border: '1px solid rgba(72,199,142,0.3)',
                      animation: 'celebrationPulse 0.6s ease-in-out',
                    }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>🎉🏆🎉</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#48c78e', marginBottom: 4 }}>
                        Congratulations!
                      </div>
                      <div style={{ fontSize: 14, color: '#aaa' }}>
                        Property under contract! Keep pushing!
                      </div>
                      <style>{`
                        @keyframes celebrationPulse {
                          0% { transform: scale(0.9); opacity: 0; }
                          50% { transform: scale(1.03); }
                          100% { transform: scale(1); opacity: 1; }
                        }
                      `}</style>
                    </div>
                  )}

                  {underContract.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      {underContract.map((uc, i) => (
                        <div key={i} style={{
                          padding: '10px 14px', borderRadius: 8, marginBottom: 4,
                          background: 'rgba(72,199,142,0.04)', border: '1px solid rgba(72,199,142,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#ddd' }}>
                              {uc.contactName}{uc.property ? ` — ${uc.property}` : ''}
                            </div>
                          </div>
                          <span style={{
                            fontSize: 10, padding: '3px 8px', borderRadius: 4,
                            background: 'rgba(72,199,142,0.15)', color: '#48c78e', fontWeight: 700,
                          }}>UNDER CONTRACT</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* ── Add Contact / Follow-Up ── */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(72,199,142,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤝</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Contacts & Follow-Ups</h3>
            </div>

            {!showContactForm && !showFollowUpForm && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn-secondary" onClick={() => setShowContactForm(true)}
                  style={{ flex: 1, padding: '10px 16px', fontSize: 13, minWidth: 140 }}>
                  + New Contact
                </button>
                <button className="btn-secondary" onClick={() => { setShowFollowUpForm(true); setFollowUpInterval(''); setFollowUpReclassify(''); }}
                  disabled={contactList.length === 0}
                  style={{ flex: 1, padding: '10px 16px', fontSize: 13, minWidth: 140, opacity: contactList.length === 0 ? 0.4 : 1 }}>
                  + Log Follow-Up
                </button>
              </div>
            )}

            {/* ── New Contact Form ── */}
            {showContactForm && (
              <div style={{ padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>New Contact</div>

                <input value={contactName} onChange={e => setContactName(e.target.value)}
                  placeholder="Name *" style={{ width: '100%', fontSize: 14, padding: '10px 14px', marginBottom: 10,
                  borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#eee' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: contactPhoneError ? 4 : 10 }}>
                  <input type="tel" value={contactPhone} onChange={e => { setContactPhone(e.target.value); setContactPhoneError(''); }}
                    placeholder="Phone # (required)" style={{ fontSize: 13, padding: '8px 12px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.04)', border: contactPhoneError ? '1px solid rgba(233,69,96,0.5)' : '1px solid rgba(255,255,255,0.1)', color: '#eee' }} />
                  <input value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                    placeholder="Email" style={{ fontSize: 13, padding: '8px 12px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#eee' }} />
                </div>
                {contactPhoneError && <div style={{ fontSize: 11, color: '#e94560', marginBottom: 10 }}>{contactPhoneError}</div>}

                <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 6 }}>Group</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                  {CONTACT_GROUPS.map(g => (
                    <button key={g.value} onClick={() => { setContactGroup(g.value); setTargetOutcome(''); setContactFollowUpInterval(''); }} style={{
                      padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: contactGroup === g.value ? 600 : 400,
                      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", border: 'none',
                      background: contactGroup === g.value ? `${g.color}20` : 'rgba(255,255,255,0.04)',
                      color: contactGroup === g.value ? g.color : '#888',
                      outline: contactGroup === g.value ? `1px solid ${g.color}40` : '1px solid rgba(255,255,255,0.08)',
                    }}>
                      {g.label}
                    </button>
                  ))}
                </div>

                {contactGroup === 'target' && (
                  <AddressFields value={contactProperty} onChange={setContactProperty} borderColor="rgba(233,69,96,0.15)" />
                )}

                <textarea value={contactNotes} onChange={e => setContactNotes(e.target.value)}
                  placeholder="Notes about this contact..." rows={2}
                  style={{ width: '100%', fontSize: 13, padding: '8px 12px', marginBottom: 12, resize: 'vertical',
                  borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#eee' }} />

                {/* Target Contact — Outcome Classification */}
                {contactGroup === 'target' && (
                    <OutcomeSelector targetOutcome={targetOutcome} setTargetOutcome={setTargetOutcome} setFollowUpInterval={setContactFollowUpInterval} />
                )}

                {/* Follow-Up Interval (mandatory) */}
                {(contactGroup === 'arsenal' || targetOutcome) && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: '#48c78e', fontWeight: 600, marginBottom: 6 }}>Schedule Follow-Up *</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(targetOutcome === 'dead' || targetOutcome === 'dead_arsenal'
                        ? [{ value: '1_month', label: '1 Month' }, { value: '3_months', label: '3 Months' }, { value: '6_months', label: '6 Months' }, { value: 'never', label: 'Never' }]
                        : [{ value: '2_days', label: '2 Days' }, { value: '1_week', label: '1 Week' }, { value: '2_weeks', label: '2 Weeks' }]
                      ).map(opt => (
                        <button key={opt.value} onClick={() => setContactFollowUpInterval(opt.value)}
                          style={{
                            padding: '7px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif", border: 'none',
                            background: contactFollowUpInterval === opt.value ? 'rgba(72,199,142,0.15)' : 'rgba(255,255,255,0.04)',
                            color: contactFollowUpInterval === opt.value ? '#48c78e' : '#888',
                            outline: contactFollowUpInterval === opt.value ? '1px solid rgba(72,199,142,0.3)' : '1px solid rgba(255,255,255,0.06)',
                            fontWeight: contactFollowUpInterval === opt.value ? 600 : 400,
                          }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {duplicateContact && (
                  <div style={{
                    padding: '12px 14px', borderRadius: 8, marginBottom: 12,
                    background: 'rgba(240,165,0,0.06)', border: '1px solid rgba(240,165,0,0.2)',
                  }}>
                    <div style={{ fontSize: 13, color: '#f0a500', fontWeight: 600, marginBottom: 8 }}>
                      You already have a contact named "{duplicateContact.name}".
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-primary" onClick={() => handleGoToFollowUp(duplicateContact)}
                        style={{ padding: '8px 16px', fontSize: 12 }}>
                        Go to Follow-Up
                      </button>
                      <button className="btn-secondary" onClick={() => handleAddContact(true)}
                        style={{ padding: '8px 16px', fontSize: 12 }}>
                        Add Anyway
                      </button>
                    </div>
                  </div>
                )}

                {(() => {
                  const canAdd = contactName.trim() && contactFollowUpInterval
                    && (contactGroup === 'arsenal' || (targetOutcome && (contactGroup !== 'target' || contactProperty.trim())));
                  return (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-primary" onClick={() => handleAddContact(false)}
                        disabled={!canAdd || contactSaving}
                        style={{ padding: '10px 20px', fontSize: 13, opacity: canAdd ? 1 : 0.4 }}>
                        {contactSaving ? 'Saving...' : 'Add Contact'}
                      </button>
                      <button className="btn-secondary" onClick={resetContactForm}
                        style={{ padding: '10px 16px', fontSize: 13 }}>
                        Cancel
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── Follow-Up Form ── */}
            {showFollowUpForm && (
              <div style={{ padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Log Follow-Up</div>

                <select value={followUpContactId} onChange={e => { setFollowUpContactId(e.target.value); setFollowUpInterval(''); setFollowUpReclassify(''); }}
                  style={{ width: '100%', fontSize: 13, padding: '10px 12px', marginBottom: 10, borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc' }}>
                  <option value="">Select a contact...</option>
                  {(() => {
                    const arsenal = (contactList || []).filter(c => c.contact_group === 'arsenal');
                    const targetProps = (contactList || []).filter(c => c.contact_group === 'target' && c.pipeline_status !== 'dead');
                    const dead = (contactList || []).filter(c => c.pipeline_status === 'dead');
                    return (
                      <>
                        {arsenal.length > 0 && <optgroup label="── Arsenal Contacts ──">
                          {arsenal.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </optgroup>}
                        {targetProps.length > 0 && <optgroup label="── Target Properties ──">
                          {targetProps.map(c => <option key={c.id} value={c.id}>{c.name}{c.property ? ` — ${c.property}` : ''}</option>)}
                        </optgroup>}
                        {dead.length > 0 && <optgroup label="── Dead Contacts ──">
                          {dead.map(c => <option key={c.id} value={c.id}>{c.name}{c.property ? ` — ${c.property}` : ''}</option>)}
                        </optgroup>}
                      </>
                    );
                  })()}
                </select>

                <textarea value={followUpNotes} onChange={e => setFollowUpNotes(e.target.value)}
                  placeholder="What happened in this follow-up?" rows={3}
                  style={{ width: '100%', fontSize: 13, padding: '8px 12px', marginBottom: 12, resize: 'vertical',
                  borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#eee' }} />

                {/* Next follow-up schedule (mandatory) */}
                {followUpContactId && (() => {
                  const selContact = (contactList || []).find(c => c.id === followUpContactId);
                  const isDead = selContact?.pipeline_status === 'dead';
                  const isTargetProp = selContact?.contact_group === 'target' && selContact?.pipeline_status !== 'dead';
                  const intervals = isDead
                    ? [{ value: '1_month', label: '1 Month' }, { value: '3_months', label: '3 Months' }, { value: '6_months', label: '6 Months' }, { value: 'never', label: 'Never' }]
                    : [{ value: '2_days', label: '2 Days' }, { value: '1_week', label: '1 Week' }, { value: '2_weeks', label: '2 Weeks' }];
                  return (
                    <>
                      <div style={{ fontSize: 12, color: '#48c78e', fontWeight: 600, marginBottom: 6 }}>Next Follow-Up *</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                        {intervals.map(opt => (
                          <button key={opt.value} onClick={() => setFollowUpInterval(opt.value)}
                            style={{
                              padding: '7px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                              fontFamily: "'DM Sans', sans-serif", border: 'none',
                              background: followUpInterval === opt.value ? 'rgba(72,199,142,0.15)' : 'rgba(255,255,255,0.04)',
                              color: followUpInterval === opt.value ? '#48c78e' : '#888',
                              outline: followUpInterval === opt.value ? '1px solid rgba(72,199,142,0.3)' : '1px solid rgba(255,255,255,0.06)',
                              fontWeight: followUpInterval === opt.value ? 600 : 400,
                            }}>
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {/* Reclassify option for target properties */}
                      {isTargetProp && (
                        <>
                          <div style={{ fontSize: 12, color: '#c9a0ff', fontWeight: 600, marginBottom: 6 }}>Update Status</div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                            {[
                              { value: 'keep', label: 'Still Active', color: '#888' },
                              { value: 'under_contract', label: 'Under Contract', color: '#f0a500' },
                              { value: 'closed', label: 'Deal Closed', color: '#48c78e' },
                              { value: 'dead', label: 'Gone Dead', color: '#e94560' },
                            ].map(opt => (
                              <button key={opt.value} onClick={() => setFollowUpReclassify(opt.value)}
                                style={{
                                  padding: '7px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                                  fontFamily: "'DM Sans', sans-serif", border: 'none',
                                  background: followUpReclassify === opt.value ? `${opt.color}15` : 'rgba(255,255,255,0.04)',
                                  color: followUpReclassify === opt.value ? opt.color : '#888',
                                  outline: followUpReclassify === opt.value ? `1px solid ${opt.color}40` : '1px solid rgba(255,255,255,0.06)',
                                  fontWeight: followUpReclassify === opt.value ? 600 : 400,
                                }}>
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-primary" onClick={handleAddFollowUp}
                    disabled={!followUpContactId || !followUpNotes.trim() || !followUpInterval || followUpSaving}
                    style={{ padding: '10px 20px', fontSize: 13, opacity: followUpContactId && followUpNotes.trim() && followUpInterval ? 1 : 0.4 }}>
                    {followUpSaving ? 'Saving...' : 'Log Follow-Up'}
                  </button>
                  <button className="btn-secondary" onClick={() => setShowFollowUpForm(false)}
                    style={{ padding: '10px 16px', fontSize: 13 }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Proof Text + Submit ── */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(233,69,96,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📤</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Daily Check-In</h3>
            </div>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>
              Summarize your day or add any additional notes.
            </p>
            <textarea value={proofText} onChange={e => setProofText(e.target.value)}
              placeholder="Describe your day's work, paste links, or summarize results..."
              style={{ marginBottom: 16 }} />

            {/* Training gate */}
            {!metrics.training_completed && (
              <div style={{
                padding: '12px 16px', borderRadius: 8, marginBottom: 16, textAlign: 'center',
                background: 'rgba(240,165,0,0.06)', border: '1px solid rgba(240,165,0,0.15)',
              }}>
                <div style={{ fontSize: 13, color: '#f0a500', fontWeight: 600 }}>
                  Complete today's training to unlock your daily submission.
                </div>
              </div>
            )}

            {/* Compliance status summary — blocks submission */}
            {!compliance.met && compliance.failures.length > 0 && (
              <div style={{
                padding: '12px 16px', borderRadius: 8, marginBottom: 16,
                background: 'rgba(233,69,96,0.06)', border: '1px solid rgba(233,69,96,0.15)',
              }}>
                <div style={{ fontSize: 12, color: '#e94560', fontWeight: 700, marginBottom: 6 }}>
                  Submission blocked — meet all daily minimums:
                </div>
                {compliance.failures.map(f => (
                  <div key={f.metric} style={{ fontSize: 12, color: '#e94560', marginBottom: 2 }}>
                    • {f.label}: {f.actual} / {f.required}
                  </div>
                ))}
              </div>
            )}

            <button className="btn-primary" onClick={handleSubmit}
              disabled={!compliance.met}
              style={{ width: '100%', opacity: compliance.met ? 1 : 0.4 }}>
              {isUpdate ? 'Update' : 'Submit'} Day {day} {compliance.met ? '✓' : ''}
            </button>
          </div>
        </>
      ) : null}

      {/* Deadline Reminder */}
      {canSubmit && (
        <div style={{
          marginTop: 20, padding: '14px 20px',
          background: isPost30 ? 'rgba(240,165,0,0.06)' : 'rgba(233,69,96,0.06)',
          border: `1px solid ${isPost30 ? 'rgba(240,165,0,0.1)' : 'rgba(233,69,96,0.1)'}`,
          borderRadius: 12, fontSize: 13,
          color: isPost30 ? '#f0a500' : '#e94560', textAlign: 'center',
        }}>
          {isPost30
            ? 'Submit today to keep your streak alive!'
            : 'Submit before the daily deadline or you will be removed from this run'}
        </div>
      )}
    </div>
  );
}

// ── Inline Add Contact ───────────────────────────────────────────

function InlineAddContact({ group, isOpen, onToggle, onAddContact, contactList, setContactList, onAutoIncrement, calculateFollowUpDate, day }) {
  const color = group === 'arsenal' ? '#f0a500' : '#e94560';
  const label = group === 'arsenal' ? 'Arsenal Contact' : 'Target Contact';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [property, setProperty] = useState('');
  const [notes, setNotes] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [targetOutcome, setTargetOutcome] = useState('');
  const [saving, setSaving] = useState(false);
  const [justAdded, setJustAdded] = useState(null);
  const [phoneError, setPhoneError] = useState('');

  const resetForm = () => {
    setName(''); setPhone(''); setEmail(''); setProperty('');
    setNotes(''); setFollowUp(''); setTargetOutcome(''); setJustAdded(null);
    setPhoneError('');
  };

  const canSave = name.trim() && followUp
    && (group === 'arsenal' || targetOutcome);

  const handleSave = async () => {
    if (!canSave) return;
    const phoneCheck = validatePhone(phone, { required: true });
    if (!phoneCheck.valid) { setPhoneError(phoneCheck.error); return; }
    setPhoneError('');
    setSaving(true);

    let finalGroup = group;
    let pipelineStatus = 'new';
    const createArsenalToo = targetOutcome === 'both' || targetOutcome === 'dead_arsenal';
    if (group === 'target') {
      if (targetOutcome === 'target_property' || targetOutcome === 'both') pipelineStatus = 'target_property';
      else if (targetOutcome === 'dead' || targetOutcome === 'dead_arsenal') pipelineStatus = 'dead';
      else if (targetOutcome === 'arsenal') { finalGroup = 'arsenal'; pipelineStatus = 'new'; }
    }

    const now = new Date().toISOString();
    const result = await onAddContact({
      name: name.trim(),
      phone: phoneCheck.formatted,
      email: email.trim() || null,
      contact_group: finalGroup,
      property: group === 'target' ? (property.trim() || null) : null,
      notes: notes.trim() || null,
      day_added: day,
      pipeline_status: pipelineStatus,
      follow_up_interval: followUp,
      follow_up_date: calculateFollowUpDate(followUp),
      last_contact_date: now,
    });

    if (result?.success && result.contact) {
      setContactList(prev => [result.contact, ...prev]);
      onAutoIncrement();

      if (createArsenalToo) {
        const arsenalResult = await onAddContact({
          name: name.trim(),
          phone: phoneCheck.formatted,
          email: email.trim() || null,
          contact_group: 'arsenal',
          property: null,
          notes: notes.trim() ? `[From target contact] ${notes.trim()}` : '[From target contact]',
          day_added: day,
          pipeline_status: 'new',
          follow_up_interval: followUp,
          follow_up_date: calculateFollowUpDate(followUp),
          last_contact_date: now,
        });
        if (arsenalResult?.success && arsenalResult.contact) {
          setContactList(prev => [arsenalResult.contact, ...prev]);
        }
      }

      setJustAdded(name.trim());
      setName(''); setPhone(''); setEmail(''); setProperty('');
      setNotes(''); setFollowUp(''); setTargetOutcome('');
    }
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      marginTop: 8, marginLeft: 0, padding: 14, borderRadius: 10,
      background: 'rgba(255,255,255,0.02)', border: `1px solid ${color}25`,
    }}>
      {justAdded && (
        <div style={{
          padding: '8px 12px', borderRadius: 8, marginBottom: 10, fontSize: 12, fontWeight: 600,
          background: 'rgba(72,199,142,0.08)', border: '1px solid rgba(72,199,142,0.2)', color: '#48c78e',
        }}>
          ✓ Added "{justAdded}" — add another or tap Done
        </div>
      )}

      <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 10 }}>
        New {label}
      </div>

      <input value={name} onChange={e => setName(e.target.value)}
        placeholder="Name *"
        style={{
          width: '100%', fontSize: 14, padding: '10px 12px', marginBottom: 8, borderRadius: 8,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#eee',
        }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: phoneError ? 4 : 8 }}>
        <input type="tel" value={phone} onChange={e => { setPhone(e.target.value); setPhoneError(''); }} placeholder="Phone # (required)"
          style={{ fontSize: 13, padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.04)',
            border: phoneError ? '1px solid rgba(233,69,96,0.5)' : '1px solid rgba(255,255,255,0.1)', color: '#eee' }} />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
          style={{ fontSize: 13, padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#eee' }} />
      </div>
      {phoneError && <div style={{ fontSize: 11, color: '#e94560', marginBottom: 8 }}>{phoneError}</div>}

      {group === 'target' && (
        <AddressFields value={property} onChange={setProperty} borderColor={`${color}20`} />
      )}

      <textarea value={notes} onChange={e => setNotes(e.target.value)}
        placeholder="Notes..." rows={2}
        style={{
          width: '100%', fontSize: 13, padding: '8px 10px', marginBottom: 10, resize: 'vertical',
          borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#eee',
        }} />

      {group === 'target' && (
        <OutcomeSelector targetOutcome={targetOutcome} setTargetOutcome={setTargetOutcome} setFollowUpInterval={setFollowUp} compact />
      )}

      {(group === 'arsenal' || targetOutcome) && <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 5 }}>Follow-up Interval *</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(targetOutcome === 'dead' || targetOutcome === 'dead_arsenal'
            ? [{ value: '1_month', label: '1 Month' }, { value: '3_months', label: '3 Months' }, { value: '6_months', label: '6 Months' }, { value: 'never', label: 'Never' }]
            : targetOutcome === 'target_property' || targetOutcome === 'both'
            ? [{ value: '3_days', label: '3 Days' }, { value: '1_week', label: '1 Week' }, { value: '2_weeks', label: '2 Weeks' }]
            : [{ value: '3_days', label: '3 Days' }, { value: '1_week', label: '1 Week' }, { value: '2_weeks', label: '2 Weeks' }, { value: '1_month', label: '1 Month' }, { value: '3_months', label: '3 Months' }]
          ).map(opt => (
            <button key={opt.value} onClick={() => setFollowUp(opt.value)} style={{
              padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: followUp === opt.value ? 600 : 400,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", border: 'none',
              background: followUp === opt.value ? 'rgba(72,199,142,0.15)' : 'rgba(255,255,255,0.04)',
              color: followUp === opt.value ? '#48c78e' : '#888',
              outline: followUp === opt.value ? '1px solid rgba(72,199,142,0.3)' : '1px solid rgba(255,255,255,0.08)',
            }}>{opt.label}</button>
          ))}
        </div>
      </div>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => { resetForm(); onToggle(group); }}
          style={{
            padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#888',
          }}>Done</button>
        <button onClick={handleSave} disabled={!canSave || saving}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            cursor: canSave ? 'pointer' : 'default', fontFamily: "'DM Sans', sans-serif",
            border: 'none', background: canSave ? `${color}20` : 'rgba(255,255,255,0.04)',
            color: canSave ? color : '#555', opacity: saving ? 0.6 : 1,
          }}>
          {saving ? 'Saving...' : `Add ${label}`}
        </button>
      </div>
    </div>
  );
}

// ── Outcome Selector ────────────────────────────────────────────

function AddressFields({ value, onChange, borderColor = 'rgba(255,255,255,0.1)' }) {
  const parts = (value || '').split('|');
  const [street, city, state, zip] = [parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || ''];
  const update = (idx, val) => {
    const p = [...parts];
    while (p.length < 4) p.push('');
    p[idx] = val;
    onChange(p.join('|'));
  };
  const fStyle = { fontSize: 13, padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${borderColor}`, color: '#eee' };
  return (
    <div style={{ marginBottom: 10 }}>
      <input value={street} onChange={e => update(0, e.target.value)} placeholder="Street *" style={{ ...fStyle, width: '100%', marginBottom: 6 }} />
      <div style={{ display: 'flex', gap: 6 }}>
        <input value={city} onChange={e => update(1, e.target.value)} placeholder="City" style={{ ...fStyle, flex: 2 }} />
        <input value={state} onChange={e => update(2, e.target.value)} placeholder="State" style={{ ...fStyle, flex: 1 }} />
        <input value={zip} onChange={e => update(3, e.target.value)} placeholder="Zip" style={{ ...fStyle, flex: 1 }} />
      </div>
    </div>
  );
}

function OutcomeSelector({ targetOutcome, setTargetOutcome, setFollowUpInterval, compact }) {
  const sz = compact ? 11 : 12;
  const pad = compact ? '5px 12px' : '8px 14px';
  const rad = compact ? 6 : 8;

  const propertyOutcome = (targetOutcome === 'target_property' || targetOutcome === 'both') ? 'target_property'
    : (targetOutcome === 'dead' || targetOutcome === 'dead_arsenal') ? 'dead' : '';
  const alsoArsenal = targetOutcome === 'both' || targetOutcome === 'arsenal' || targetOutcome === 'dead_arsenal';

  const handlePropertyOutcome = (value) => {
    if (value === propertyOutcome) {
      setTargetOutcome(alsoArsenal ? 'arsenal' : '');
    } else if (value === 'target_property') {
      setTargetOutcome(alsoArsenal ? 'both' : 'target_property');
    } else {
      setTargetOutcome(alsoArsenal ? 'dead_arsenal' : 'dead');
    }
    setFollowUpInterval('');
  };

  const handleArsenalToggle = () => {
    if (alsoArsenal) {
      setTargetOutcome(propertyOutcome || '');
    } else {
      if (propertyOutcome === 'target_property') setTargetOutcome('both');
      else if (propertyOutcome === 'dead') setTargetOutcome('dead_arsenal');
      else setTargetOutcome('arsenal');
    }
    setFollowUpInterval('');
  };

  const btnStyle = (active, color) => ({
    padding: pad, borderRadius: rad, fontSize: sz, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", border: 'none', textAlign: 'left',
    background: active ? `${color}15` : 'rgba(255,255,255,0.04)',
    color: active ? color : '#888',
    outline: active ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.06)',
    fontWeight: active ? 600 : 400,
  });

  return (
    <div style={{ marginBottom: compact ? 10 : 12 }}>
      <div style={{ fontSize: sz, color: '#e94560', fontWeight: 600, marginBottom: compact ? 5 : 6 }}>Property Outcome *</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        <button onClick={() => handlePropertyOutcome('target_property')} style={btnStyle(propertyOutcome === 'target_property', '#e94560')}>
          {compact ? 'Target Property' : <><div style={{ fontWeight: 600 }}>Target Property</div><div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>They're interested</div></>}
        </button>
        <button onClick={() => handlePropertyOutcome('dead')} style={btnStyle(propertyOutcome === 'dead', '#666')}>
          {compact ? 'Dead' : <><div style={{ fontWeight: 600 }}>Dead Contact</div><div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>Not interested</div></>}
        </button>
      </div>
      <button onClick={handleArsenalToggle} style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
        padding: compact ? '6px 12px' : '8px 14px', borderRadius: rad, cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif", border: 'none', fontSize: sz,
        background: alsoArsenal ? 'rgba(240,165,0,0.1)' : 'rgba(255,255,255,0.04)',
        color: alsoArsenal ? '#f0a500' : '#888',
        outline: alsoArsenal ? '1px solid rgba(240,165,0,0.3)' : '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: 4, flexShrink: 0,
          border: alsoArsenal ? '2px solid #f0a500' : '2px solid rgba(255,255,255,0.2)',
          background: alsoArsenal ? '#f0a500' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: '#000', fontWeight: 700,
        }}>{alsoArsenal ? '✓' : ''}</div>
        <div>
          <span style={{ fontWeight: 600 }}>Also add to Arsenal Contacts</span>
          {!compact && <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 6 }}>— keep building the relationship beyond this deal</span>}
        </div>
      </button>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────

function WeeklyOfferTracker({ day, user, currentOffers, existingOffers }) {
  const weekNum = getWeekNumber(day);
  const target = getWeeklyOfferTarget(day);
  const { start, end } = getWeekDayRange(weekNum);
  const daysLeftInWeek = Math.max(0, end - day);

  let weeklyOffers = 0;
  (user.submissions || []).forEach(s => {
    if (s.day >= start && s.day <= end && s.day !== day) {
      weeklyOffers += s.dayMetrics?.offers_submitted || 0;
    }
  });
  weeklyOffers += currentOffers;

  const pct = target > 0 ? Math.min(100, Math.round((weeklyOffers / target) * 100)) : 100;
  const daysElapsed = day - start + 1;
  const totalDays = end - start + 1;
  const expectedPct = Math.round((daysElapsed / totalDays) * 100);
  const status = pct >= expectedPct ? 'green' : pct >= expectedPct * 0.5 ? 'amber' : 'red';
  const statusColor = status === 'green' ? '#48c78e' : status === 'amber' ? '#f0a500' : '#e94560';

  if (target <= 0) return null;

  return (
    <div className="card" style={{
      marginBottom: 24, padding: '18px 20px',
      background: `rgba(${status === 'green' ? '72,199,142' : status === 'amber' ? '240,165,0' : '233,69,96'},0.04)`,
      border: `1px solid rgba(${status === 'green' ? '72,199,142' : status === 'amber' ? '240,165,0' : '233,69,96'},0.15)`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            Week {weekNum} Offer Target
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: statusColor }}>
            {weeklyOffers} <span style={{ fontSize: 14, fontWeight: 400, color: '#888' }}>/ {target} minimum</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#888' }}>Days left this week</div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: '#ccc' }}>{daysLeftInWeek}</div>
        </div>
      </div>
      <div style={{
        height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 4, background: statusColor,
          width: `${pct}%`, transition: 'width 0.3s',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 11, color: '#666' }}>{pct}% of weekly target</span>
        {weeklyOffers < target && daysLeftInWeek > 0 && (
          <span style={{ fontSize: 11, color: statusColor, fontWeight: 600 }}>
            Need {target - weeklyOffers} more in {daysLeftInWeek} day{daysLeftInWeek !== 1 ? 's' : ''}
          </span>
        )}
        {weeklyOffers >= target && (
          <span style={{ fontSize: 11, color: '#48c78e', fontWeight: 600 }}>Target met!</span>
        )}
      </div>
    </div>
  );
}

function buildProofSummary(metrics) {
  const parts = [];
  if (metrics.training_completed) parts.push('Training complete');
  if (metrics.properties_analyzed) parts.push(`${metrics.properties_analyzed} properties analyzed`);
  if (metrics.arsenal_contacts) parts.push(`${metrics.arsenal_contacts} arsenal contacts`);
  if (metrics.target_contacts) parts.push(`${metrics.target_contacts} target contacts`);
  if (metrics.follow_ups) parts.push(`${metrics.follow_ups} follow-ups`);
  if (metrics.offers_submitted) parts.push(`${metrics.offers_submitted} offers submitted`);
  return parts.join(', ') || 'Daily submission';
}

function DueFollowUps({ contacts, onFollowUp, onSnooze, onMarkDead }) {
  const [snoozeOpenId, setSnoozeOpenId] = useState(null);
  const [markDeadId, setMarkDeadId] = useState(null);

  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const dueContacts = (contacts || [])
    .filter(c => {
      if (!c.follow_up_date || c.follow_up_interval === 'never') return false;
      return new Date(c.follow_up_date) <= todayEnd;
    })
    .sort((a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date));

  if (dueContacts.length === 0) {
    return (
      <div style={{
        marginBottom: 24, padding: '16px 20px', borderRadius: 12,
        background: 'rgba(72,199,142,0.04)', border: '1px solid rgba(72,199,142,0.12)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 13, color: '#48c78e', fontWeight: 600 }}>
          No follow-ups due today. Keep building your pipeline!
        </div>
      </div>
    );
  }

  const overdue = dueContacts.filter(c => new Date(c.follow_up_date) < new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  const dueToday = dueContacts.filter(c => new Date(c.follow_up_date) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()));

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: overdue.length > 0 ? 'rgba(233,69,96,0.15)' : 'rgba(240,165,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📋</div>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Today's Follow-Ups</h3>
        <span className="mono" style={{ fontSize: 12, color: overdue.length > 0 ? '#e94560' : '#f0a500', fontWeight: 700 }}>
          ({dueContacts.length})
        </span>
      </div>

      {overdue.length > 0 && overdue.map(c => (
        <DueFollowUpCard key={c.id} contact={c} type="overdue" now={now}
          onFollowUp={onFollowUp} onSnooze={onSnooze} onMarkDead={onMarkDead}
          snoozeOpen={snoozeOpenId === c.id} markDeadOpen={markDeadId === c.id}
          onToggleSnooze={() => setSnoozeOpenId(snoozeOpenId === c.id ? null : c.id)}
          onToggleMarkDead={() => setMarkDeadId(markDeadId === c.id ? null : c.id)}
        />
      ))}

      {dueToday.length > 0 && dueToday.map(c => (
        <DueFollowUpCard key={c.id} contact={c} type="today" now={now}
          onFollowUp={onFollowUp} onSnooze={onSnooze} onMarkDead={onMarkDead}
          snoozeOpen={snoozeOpenId === c.id} markDeadOpen={markDeadId === c.id}
          onToggleSnooze={() => setSnoozeOpenId(snoozeOpenId === c.id ? null : c.id)}
          onToggleMarkDead={() => setMarkDeadId(markDeadId === c.id ? null : c.id)}
        />
      ))}
    </div>
  );
}

function DueFollowUpCard({ contact, type, now, onFollowUp, onSnooze, onMarkDead, snoozeOpen, markDeadOpen, onToggleSnooze, onToggleMarkDead }) {
  const isOverdue = type === 'overdue';
  const diffDays = Math.floor((now - new Date(contact.follow_up_date)) / (1000 * 60 * 60 * 24));
  const isTarget = contact.contact_group === 'target' && contact.pipeline_status !== 'dead';
  const groupLabel = contact.contact_group === 'arsenal' ? 'Arsenal' : contact.pipeline_status === 'dead' ? 'Dead' : 'Target Property';
  const groupColor = contact.contact_group === 'arsenal' ? '#f0a500' : contact.pipeline_status === 'dead' ? '#666' : '#e94560';

  const accentColor = isOverdue ? '#e94560' : '#f0a500';

  return (
    <div className="card" style={{
      marginBottom: 8, padding: '14px 18px',
      borderColor: `${accentColor}30`,
      background: isOverdue ? 'rgba(233,69,96,0.04)' : 'rgba(240,165,0,0.03)',
    }}>
      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '3px 10px', borderRadius: 6, marginBottom: 10,
        background: `${accentColor}15`, fontSize: 11, fontWeight: 700, color: accentColor,
      }}>
        {isOverdue ? `OVERDUE — ${diffDays} day${diffDays !== 1 ? 's' : ''}` : 'DUE TODAY'}
      </div>

      {/* Contact info */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: `${groupColor}20`, border: `1px solid ${groupColor}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: groupColor,
        }}>
          {contact.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#ddd' }}>{contact.name}</span>
            <span style={{
              fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700,
              background: `${groupColor}15`, color: groupColor,
            }}>{groupLabel}</span>
          </div>
          {contact.property && (
            <div style={{ fontSize: 13, color: '#e94560', marginTop: 2 }}>📍 {contact.property}</div>
          )}
          <div style={{ fontSize: 12, color: '#666', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {contact.phone && <span>📞 {contact.phone}</span>}
            {contact.email && <span>✉ {contact.email}</span>}
          </div>
          {contact.last_contact_date && (
            <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>
              Last contact: {new Date(contact.last_contact_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
          {contact.analysis_notes?.length > 0 && (
            <div style={{ marginTop: 6, fontSize: 11, color: '#e94560', fontWeight: 600 }}>
              📊 {contact.analysis_notes.length} analysis{contact.analysis_notes.length !== 1 ? 'es' : ''} saved
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <button onClick={() => onFollowUp(contact)} style={{
          padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          border: 'none', background: 'rgba(72,199,142,0.15)', color: '#48c78e',
        }}>
          Follow Up
        </button>
        <div style={{ position: 'relative' }}>
          <button onClick={onToggleSnooze} style={{
            padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            border: 'none', background: 'rgba(255,255,255,0.06)', color: '#888',
          }}>
            Snooze ▾
          </button>
          {snoozeOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 10,
              background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
              overflow: 'hidden', minWidth: 120, boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}>
              {[{ days: 1, label: '+1 day' }, { days: 3, label: '+3 days' }, { days: 7, label: '+1 week' }].map(opt => (
                <button key={opt.days} onClick={() => { onSnooze(contact, opt.days); onToggleSnooze(); }}
                  style={{
                    display: 'block', width: '100%', padding: '8px 14px', fontSize: 12,
                    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: 'transparent', color: '#ccc', textAlign: 'left',
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {isTarget && (
          <div style={{ position: 'relative' }}>
            <button onClick={onToggleMarkDead} style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              border: 'none', background: 'rgba(255,255,255,0.04)', color: '#666',
            }}>
              Mark Dead
            </button>
            {markDeadOpen && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 10,
                background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                overflow: 'hidden', minWidth: 140, boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}>
                <div style={{ padding: '6px 14px', fontSize: 10, color: '#666', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  Set long-term follow-up:
                </div>
                {[
                  { value: '1_month', label: '1 Month' },
                  { value: '3_months', label: '3 Months' },
                  { value: '6_months', label: '6 Months' },
                  { value: 'never', label: 'Never' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => { onMarkDead(contact, opt.value); onToggleMarkDead(); }}
                    style={{
                      display: 'block', width: '100%', padding: '8px 14px', fontSize: 12,
                      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                      border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: 'transparent', color: '#ccc', textAlign: 'left',
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SubmissionComplete({ submission }) {
  return (
    <div className="card" style={{ borderColor: 'rgba(72,199,142,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: '#48c78e',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'white',
        }}>✓</div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#48c78e' }}>Submitted & Verified</h3>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Your submission:</div>
        <p style={{ color: '#bbb', fontSize: 14 }}>{submission?.proof}</p>
        {submission?.dayMetrics && (
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(submission.dayMetrics).map(([key, val]) => {
              if (!val) return null;
              const metric = COMPLIANCE_METRICS.find(m => m.id === key);
              const label = metric?.label || key;
              return (
                <span key={key} style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 6,
                  background: 'rgba(72,199,142,0.1)', color: '#48c78e', fontWeight: 600,
                }}>
                  {typeof val === 'boolean' ? `${label} ✓` : `+${val} ${label}`}
                </span>
              );
            })}
          </div>
        )}
        <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
          {submission && new Date(submission.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function SubmissionSuccess({ day, isUpdate }) {
  return (
    <div className="card scale-in" style={{ borderColor: 'rgba(72,199,142,0.3)', textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: '#48c78e', marginBottom: 8 }}>
        {isUpdate ? 'Submission Updated!' : 'Submission Received!'}
      </h3>
      <p style={{ color: '#888', fontSize: 14 }}>
        Day {day} is now complete. {day > 30
          ? 'Streak extended! Come back tomorrow to keep it going.'
          : day < 30 ? `You've unlocked Day ${day + 1}.` : 'Sprint complete! Welcome to Operator Mode.'}
      </p>
    </div>
  );
}

export { SubmissionComplete };

export function AttachmentLink({ fileName, fileData }) {
  if (!fileName) return null;
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(fileName);
  if (!fileData) {
    return <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>📎 {fileName}</div>;
  }
  return (
    <div style={{ marginTop: 8 }}>
      <a href={fileData} target="_blank" rel="noopener noreferrer" download={!isImage ? fileName : undefined}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#e94560',
          textDecoration: 'none', padding: '6px 12px', background: 'rgba(233,69,96,0.08)',
          border: '1px solid rgba(233,69,96,0.15)', borderRadius: 8, cursor: 'pointer',
        }}>
        📎 {fileName} <span style={{ fontSize: 11, color: '#888' }}>↗ Open</span>
      </a>
      {isImage && (
        <img src={fileData} alt={fileName} style={{
          display: 'block', marginTop: 8, maxWidth: '100%', maxHeight: 300,
          borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
        }} />
      )}
    </div>
  );
}
