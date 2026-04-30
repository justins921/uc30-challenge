import { useState, useMemo, useEffect } from 'react';
import { CHALLENGE_DAYS, CATEGORY_COLORS, getCategoryColors, getPhases, getDayContent, getDayDataForNum } from '../data/challengeDays';
import { COMPLIANCE_METRICS, checkDailyCompliance, getTimeUntilDeadline, DEFAULT_DAILY_MINIMUMS, DEFAULT_ENFORCEMENT } from '../data/compliance';

export default function DayView({
  day, user, onSubmit, onBack, contentOverrides, customPhases,
  complianceSettings, existingDailySubmission,
  onAddContact, onAddFollowUp, onUploadFile, contacts: initialContacts, getUploadUrl,
}) {
  const [submitted, setSubmitted] = useState(false);

  // ── Metric state (the 7 compliance metrics) ──────────────────
  const [metrics, setMetrics] = useState({
    training_completed: existingDailySubmission?.training_completed || false,
    properties_analyzed: existingDailySubmission?.properties_analyzed || 0,
    arsenal_contacts: existingDailySubmission?.arsenal_contacts || 0,
    target_contacts: existingDailySubmission?.target_contacts || 0,
    follow_ups: existingDailySubmission?.follow_ups || 0,
    offers_submitted: existingDailySubmission?.offers_submitted || 0,
    properties_under_contract: existingDailySubmission?.properties_under_contract || 0,
  });
  const [proofText, setProofText] = useState(existingDailySubmission?.proof_text || '');

  // ── Day Data ──────────────────────────────────────────────────
  const isPost30 = day > 30;
  const dayData = isPost30 ? getDayDataForNum(day) : getDayContent(day, contentOverrides);
  const isComplete = user.completedDays.includes(day);
  const isCurrentOrPast = day <= user.currentDay;
  const existingSubmission = user.submissions.find(s => s.day === day);
  const dayColors = customPhases ? getCategoryColors(getPhases(customPhases)) : null;
  const cat = isPost30
    ? { accent: '#f0a500', label: 'Operator Mode' }
    : (dayColors && dayColors[day]) || CATEGORY_COLORS[dayData.category] || { accent: '#888', label: '' };

  // ── Compliance settings ───────────────────────────────────────
  const dailyMins = { ...DEFAULT_DAILY_MINIMUMS, ...complianceSettings?.dailyMinimums };
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

  const canSubmit = !isComplete && !submitted && isCurrentOrPast;
  const isUpdate = !!existingDailySubmission;

  // ── Handlers ──────────────────────────────────────────────────
  const setMetric = (key, value) => {
    setMetrics(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSubmit(day, {
      text: proofText || buildProofSummary(metrics),
      dayMetrics: metrics,
      complianceMetrics: metrics,
      metDailyMinimum: compliance.met,
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

      {/* Video Player */}
      {!isPost30 && <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
        {dayData.videoUrl ? (
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
            }}>&#9654;</div>
            <div style={{ fontSize: 13, color: '#888' }}>Day {day} Instructional Video</div>
          </div>
        )}
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

      {/* Task Description */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(233,69,96,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📋</div>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Today's Standards</h3>
        </div>
        <p style={{ color: '#bbb', lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-line' }}>{dayData.taskDescription}</p>
      </div>

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
      ) : canSubmit ? (
        <>
          {/* ── 7-Metric Entry Form ── */}
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

                return (
                  <div key={metric.id} style={{
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
                          padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                          border: value ? '1px solid rgba(72,199,142,0.3)' : '1px solid rgba(255,255,255,0.1)',
                          background: value ? 'rgba(72,199,142,0.15)' : 'rgba(255,255,255,0.04)',
                          color: value ? '#48c78e' : '#888',
                        }}
                      >
                        {value ? '✓ Done' : 'Mark Done'}
                      </button>
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
                );
              })}
            </div>
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

            {/* Compliance status summary */}
            {!compliance.met && compliance.failures.length > 0 && (
              <div style={{
                padding: '12px 16px', borderRadius: 8, marginBottom: 16,
                background: 'rgba(233,69,96,0.06)', border: '1px solid rgba(233,69,96,0.15)',
              }}>
                <div style={{ fontSize: 12, color: '#e94560', fontWeight: 700, marginBottom: 6 }}>Below daily minimums:</div>
                {compliance.failures.map(f => (
                  <div key={f.metric} style={{ fontSize: 12, color: '#e94560', marginBottom: 2 }}>
                    • {f.label}: {f.actual} / {f.required}
                  </div>
                ))}
              </div>
            )}

            <button className="btn-primary" onClick={handleSubmit}
              style={{ width: '100%', opacity: compliance.met ? 1 : 0.7 }}>
              {isUpdate ? 'Update' : 'Submit'} Day {day} {compliance.met ? '✓' : '(below minimums)'}
            </button>

            {!compliance.met && (
              <p style={{ fontSize: 12, color: '#f0a500', textAlign: 'center', marginTop: 8 }}>
                You can still submit, but failing to meet daily minimums may result in removal.
              </p>
            )}
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

// ── Helpers ───────────────────────────────────────────────────────

function buildProofSummary(metrics) {
  const parts = [];
  if (metrics.training_completed) parts.push('Training complete');
  if (metrics.properties_analyzed) parts.push(`${metrics.properties_analyzed} properties analyzed`);
  if (metrics.arsenal_contacts) parts.push(`${metrics.arsenal_contacts} arsenal contacts`);
  if (metrics.target_contacts) parts.push(`${metrics.target_contacts} target contacts`);
  if (metrics.follow_ups) parts.push(`${metrics.follow_ups} follow-ups`);
  if (metrics.offers_submitted) parts.push(`${metrics.offers_submitted} offers submitted`);
  if (metrics.properties_under_contract) parts.push(`${metrics.properties_under_contract} under contract`);
  return parts.join(', ') || 'Daily submission';
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
