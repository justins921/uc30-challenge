import { useState, useMemo } from 'react';
import { CHALLENGE_DAYS, CATEGORY_COLORS, getCategoryColors, getPhases, getDayContent, getDayDataForNum, getDailyMinimums } from '../data/challengeDays';
import { INDICATOR_KEYS, INDICATOR_LABELS, INDICATOR_COLORS, UC_POINT_VALUES, DAILY_INDICATOR_KEYS, calculateDayPoints } from '../data/ucPoints';

export default function DayView({ day, user, onSubmit, onBack, contentOverrides, customPhases, dailyMinimumsOverrides }) {
  const [metricInputs, setMetricInputs] = useState(() => {
    const init = {};
    INDICATOR_KEYS.forEach(k => { init[k] = 0; });
    return init;
  });
  const [proofText, setProofText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState(null);
  const [socialMediaPosted, setSocialMediaPosted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isPost30 = day > 30;
  const dayData = isPost30 ? getDayDataForNum(day) : getDayContent(day, contentOverrides);
  const isComplete = user.completedDays.includes(day);
  const isCurrentOrPast = day <= user.currentDay;
  const existingSubmission = user.submissions.find(s => s.day === day);
  const dayColors = customPhases ? getCategoryColors(getPhases(customPhases)) : null;
  const cat = isPost30
    ? { accent: '#f0a500', label: 'Operator Mode' }
    : (dayColors && dayColors[day]) || CATEGORY_COLORS[dayData.category] || { accent: '#888', label: '' };

  const minimums = getDailyMinimums(day, dailyMinimumsOverrides || {});

  // Calculate UC Points for current inputs
  const previewPoints = useMemo(() => calculateDayPoints(metricInputs), [metricInputs]);

  // Check if all daily standards are met
  const standardsMet = useMemo(() => {
    return DAILY_INDICATOR_KEYS.every(k => (metricInputs[k] || 0) >= (minimums[k] || 0));
  }, [metricInputs, minimums]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be under 10 MB.');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setFileData(reader.result);
    reader.readAsDataURL(file);
  };

  const updateMetric = (key, value) => {
    const num = Math.max(0, parseInt(value) || 0);
    setMetricInputs(prev => ({ ...prev, [key]: num }));
  };

  const handleSubmit = () => {
    if (!proofText.trim() && !fileName) return;
    onSubmit(day, {
      text: proofText,
      fileName,
      fileData,
      socialMediaPosted,
      dayMetrics: metricInputs,
    });
    setSubmitted(true);
  };

  return (
    <div className="scale-in" style={{ maxWidth: 720, margin: '0 auto' }}>
      <button className="btn-secondary" onClick={onBack} style={{ marginBottom: 24, padding: '8px 20px', fontSize: 13 }}>
        ← Back to Timeline
      </button>

      {/* Day Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span className="mono" style={{
            fontSize: 11, color: cat.accent, fontWeight: 700,
            letterSpacing: 2, textTransform: 'uppercase',
          }}>
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

      {/* Video Player (not shown for post-30 continuation days) */}
      {!isPost30 && <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
        {dayData.videoUrl ? (
          <div style={{ aspectRatio: '16/9' }}>
            <iframe
              src={dayData.videoUrl}
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
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, cursor: 'pointer',
            }}>▶</div>
            <div style={{ fontSize: 13, color: '#888' }}>Day {day} Instructional Video</div>
            <div style={{ fontSize: 11, color: '#555' }}>Chandler: Add video URL to challengeDays.js</div>
          </div>
        )}
      </div>}

      {/* Downloads (if any) */}
      {dayData.downloads && dayData.downloads.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>📥</span>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Resources</h3>
          </div>
          {dayData.downloads.map((dl, i) => (
            <a
              key={i}
              href={dl.url}
              target="_blank"
              rel="noopener"
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                color: '#e94560', textDecoration: 'none', fontSize: 14,
                marginBottom: i < dayData.downloads.length - 1 ? 8 : 0,
              }}
            >
              📎 {dl.name}
            </a>
          ))}
        </div>
      )}

      {/* Task Description */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: 'rgba(233,69,96,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>📋</div>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Today's Standards</h3>
        </div>
        <p style={{ color: '#bbb', lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-line' }}>{dayData.taskDescription}</p>
      </div>

      {/* Transcript (if any) */}
      {dayData.transcript && (
        <details className="card" style={{ marginBottom: 24, cursor: 'pointer' }}>
          <summary style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>
            📝 Video Transcript
          </summary>
          <div style={{ color: '#888', fontSize: 14, lineHeight: 1.8, marginTop: 12 }}>
            {dayData.transcript}
          </div>
        </details>
      )}

      {/* Submission Area */}
      {isComplete || existingSubmission ? (
        <SubmissionComplete submission={existingSubmission} />
      ) : submitted ? (
        <SubmissionSuccess day={day} points={previewPoints} />
      ) : isCurrentOrPast && !isComplete ? (
        <>
          {/* 6-Indicator Inputs */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, background: 'rgba(240,165,0,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}>📊</div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Log Your Activity</h3>
              </div>
              {previewPoints > 0 && (
                <div style={{
                  background: 'rgba(240,165,0,0.1)', border: '1px solid rgba(240,165,0,0.2)',
                  padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 700, color: '#f0a500',
                }}>
                  +{previewPoints} UC Points
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {INDICATOR_KEYS.map(key => {
                const min = minimums[key] || 0;
                const val = metricInputs[key] || 0;
                const isMet = val >= min;
                const isRequired = min > 0;
                const pts = val * UC_POINT_VALUES[key];
                return (
                  <div key={key} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    background: isMet && isRequired ? 'rgba(72,199,142,0.04)' : (!isMet && isRequired ? 'rgba(233,69,96,0.04)' : 'rgba(255,255,255,0.02)'),
                    border: `1px solid ${isMet && isRequired ? 'rgba(72,199,142,0.15)' : (!isMet && isRequired ? 'rgba(233,69,96,0.15)' : 'rgba(255,255,255,0.06)')}`,
                    borderRadius: 10,
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: INDICATOR_COLORS[key], flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#ddd' }}>
                        {INDICATOR_LABELS[key]}
                      </div>
                      <div style={{ fontSize: 11, color: '#666' }}>
                        {min > 0 ? `Min: ${min}` : 'No minimum'} · {UC_POINT_VALUES[key]} pts each
                        {pts > 0 && <span style={{ color: '#f0a500', marginLeft: 6 }}>+{pts} pts</span>}
                      </div>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={val}
                      onChange={e => updateMetric(key, e.target.value)}
                      style={{
                        width: 64, textAlign: 'center', fontSize: 16, fontWeight: 700,
                        padding: '6px 8px', borderRadius: 8,
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                      }}
                    />
                    {isMet && isRequired && (
                      <span style={{ color: '#48c78e', fontSize: 16, flexShrink: 0 }}>✓</span>
                    )}
                  </div>
                );
              })}
            </div>

            {!standardsMet && (
              <div style={{
                marginTop: 12, padding: '10px 14px', borderRadius: 8,
                background: 'rgba(233,69,96,0.06)', border: '1px solid rgba(233,69,96,0.1)',
                fontSize: 12, color: '#e94560',
              }}>
                Meet all daily standards to complete this day
              </div>
            )}
          </div>

          {/* Proof + Submit */}
          <SubmissionForm
            day={day}
            proofText={proofText}
            setProofText={setProofText}
            fileName={fileName}
            onFileSelect={handleFileSelect}
            onSubmit={handleSubmit}
            socialMediaPosted={socialMediaPosted}
            setSocialMediaPosted={setSocialMediaPosted}
            standardsMet={standardsMet}
            previewPoints={previewPoints}
          />
        </>
      ) : null}

      {/* Deadline Reminder */}
      {!isComplete && isCurrentOrPast && !submitted && (
        <div style={{
          marginTop: 20, padding: '14px 20px',
          background: isPost30 ? 'rgba(240,165,0,0.06)' : 'rgba(233,69,96,0.06)',
          border: `1px solid ${isPost30 ? 'rgba(240,165,0,0.1)' : 'rgba(233,69,96,0.1)'}`,
          borderRadius: 12, fontSize: 13,
          color: isPost30 ? '#f0a500' : '#e94560', textAlign: 'center',
        }}>
          {isPost30
            ? '🔥 Submit today to keep your streak alive!'
            : '⏰ Submit before 11:59 PM Pacific or you will be removed from this run'}
        </div>
      )}
    </div>
  );
}

function SubmissionComplete({ submission }) {
  return (
    <div className="card" style={{ borderColor: 'rgba(72,199,142,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: '#48c78e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, color: 'white',
        }}>✓</div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#48c78e' }}>Submitted & Verified</h3>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Your submission:</div>
        <p style={{ color: '#bbb', fontSize: 14 }}>{submission?.proof}</p>
        {submission?.fileName && (
          <AttachmentLink fileName={submission.fileName} fileData={submission.fileData} />
        )}
        {submission?.dayMetrics && (
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {INDICATOR_KEYS.map(key => {
              const val = submission.dayMetrics[key];
              if (!val) return null;
              return (
                <span key={key} style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 6,
                  background: `${INDICATOR_COLORS[key]}15`, color: INDICATOR_COLORS[key],
                  fontWeight: 600,
                }}>
                  +{val} {INDICATOR_LABELS[key]}
                </span>
              );
            })}
          </div>
        )}
        {submission?.socialMediaPosted && (
          <div style={{
            marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, padding: '4px 10px', borderRadius: 6,
            background: submission.socialMediaVerified
              ? 'rgba(72,199,142,0.1)' : 'rgba(240,165,0,0.08)',
            border: `1px solid ${submission.socialMediaVerified
              ? 'rgba(72,199,142,0.2)' : 'rgba(240,165,0,0.15)'}`,
            color: submission.socialMediaVerified ? '#48c78e' : '#f0a500',
          }}>
            {submission.socialMediaVerified ? '✓ Social post verified' : '⏳ Social post pending verification'}
          </div>
        )}
        <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
          {submission && new Date(submission.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function SubmissionSuccess({ day, points }) {
  return (
    <div className="card scale-in" style={{ borderColor: 'rgba(72,199,142,0.3)', textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: '#48c78e', marginBottom: 8 }}>
        Submission Received!
      </h3>
      {points > 0 && (
        <div className="mono" style={{
          fontSize: 28, fontWeight: 700, color: '#f0a500', marginBottom: 12,
        }}>
          +{points} UC Points
        </div>
      )}
      <p style={{ color: '#888', fontSize: 14 }}>
        Day {day} is now complete. {day > 30
          ? 'Streak extended! Come back tomorrow to keep it going.'
          : day < 30 ? `You've unlocked Day ${day + 1}.` : 'Sprint complete! Welcome to Operator Mode.'}
      </p>
    </div>
  );
}

function SubmissionForm({ day, proofText, setProofText, fileName, onFileSelect, onSubmit, socialMediaPosted, setSocialMediaPosted, standardsMet, previewPoints }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: 'rgba(233,69,96,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
        }}>📤</div>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Submit Your Proof</h3>
      </div>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>
        Describe what you did and upload any proof. Deadline:{' '}
        <span style={{ color: '#e94560', fontWeight: 600 }}>11:59 PM Pacific</span>
      </p>
      <textarea
        value={proofText}
        onChange={e => setProofText(e.target.value)}
        placeholder="Describe your completed standards, paste links, or summarize your results..."
        style={{ marginBottom: 12 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <label style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
          background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.15)',
          borderRadius: 10, cursor: 'pointer', fontSize: 14, color: '#888',
        }}>
          📎 {fileName || 'Attach File'}
          <input type="file" style={{ display: 'none' }} onChange={onFileSelect} />
        </label>
        {fileName && <span style={{ fontSize: 13, color: '#48c78e' }}>✓ {fileName}</span>}
      </div>

      {/* Social Media Posting Checkbox */}
      <label
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px',
          background: socialMediaPosted ? 'rgba(72,199,142,0.06)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${socialMediaPosted ? 'rgba(72,199,142,0.15)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 10, cursor: 'pointer', marginBottom: 20,
          transition: 'all 0.2s',
        }}
      >
        <input
          type="checkbox"
          checked={socialMediaPosted}
          onChange={e => setSocialMediaPosted(e.target.checked)}
          style={{ marginTop: 2, accentColor: '#48c78e', width: 16, height: 16, cursor: 'pointer' }}
        />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: socialMediaPosted ? '#48c78e' : '#ccc' }}>
            I posted about today's standards on social media
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
            Share your progress to stay accountable and inspire other Operators
          </div>
        </div>
      </label>

      <button
        className="btn-primary"
        onClick={onSubmit}
        disabled={!standardsMet || (!proofText.trim() && !fileName)}
        style={{ width: '100%', opacity: (!standardsMet || (!proofText.trim() && !fileName)) ? 0.5 : 1 }}
      >
        Submit Day {day} {previewPoints > 0 ? `(+${previewPoints} UC Points)` : ''} ✓
      </button>
      {!standardsMet && (
        <p style={{ fontSize: 12, color: '#e94560', textAlign: 'center', marginTop: 8 }}>
          Meet all daily standards above before submitting
        </p>
      )}
    </div>
  );
}

export function AttachmentLink({ fileName, fileData }) {
  if (!fileName) return null;

  const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(fileName);

  if (!fileData) {
    return <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>📎 {fileName}</div>;
  }

  return (
    <div style={{ marginTop: 8 }}>
      <a
        href={fileData}
        target="_blank"
        rel="noopener noreferrer"
        download={!isImage ? fileName : undefined}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: '#e94560', textDecoration: 'none',
          padding: '6px 12px', background: 'rgba(233,69,96,0.08)',
          border: '1px solid rgba(233,69,96,0.15)', borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        📎 {fileName} <span style={{ fontSize: 11, color: '#888' }}>↗ Open</span>
      </a>
      {isImage && (
        <img
          src={fileData}
          alt={fileName}
          style={{
            display: 'block', marginTop: 8, maxWidth: '100%', maxHeight: 300,
            borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
          }}
        />
      )}
    </div>
  );
}
