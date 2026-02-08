import { useState } from 'react';
import { CHALLENGE_DAYS, CATEGORY_COLORS, getCategoryColors, getPhases, getDayContent, getDayDataForNum } from '../data/challengeDays';

export default function DayView({ day, user, onSubmit, onBack, contentOverrides, customPhases }) {
  const [proofText, setProofText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const isPost30 = day > 30;
  const dayData = isPost30 ? getDayDataForNum(day) : getDayContent(day, contentOverrides);
  const isComplete = user.completedDays.includes(day);
  const isCurrentOrPast = day <= user.currentDay;
  const existingSubmission = user.submissions.find(s => s.day === day);
  const dayColors = customPhases ? getCategoryColors(getPhases(customPhases)) : null;
  const cat = isPost30
    ? { accent: '#f0a500', label: 'Continuing' }
    : (dayColors && dayColors[day]) || CATEGORY_COLORS[dayData.category] || { accent: '#888', label: '' };

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

  const handleSubmit = () => {
    if (!proofText.trim() && !fileName) return;
    onSubmit(day, { text: proofText, fileName, fileData });
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
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Today's Task</h3>
        </div>
        <p style={{ color: '#bbb', lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-line' }}>{dayData.taskDescription}</p>
        {dayData.multiMetrics ? (
          <div style={{
            marginTop: 16, padding: '12px 16px', background: 'rgba(240,165,0,0.06)',
            borderRadius: 10, border: '1px solid rgba(240,165,0,0.1)',
          }}>
            <div style={{ fontSize: 13, color: '#f0a500', marginBottom: 4 }}>📈 Daily targets:</div>
            {dayData.multiMetrics.map((m, i) => (
              <div key={i} style={{ fontSize: 13, color: '#f0a500', marginLeft: 8 }}>
                <strong>+{m.count}</strong> {m.label}
              </div>
            ))}
          </div>
        ) : dayData.metrics && (
          <div style={{
            marginTop: 16, padding: '12px 16px', background: 'rgba(233,69,96,0.06)',
            borderRadius: 10, border: '1px solid rgba(233,69,96,0.1)',
          }}>
            <span style={{ fontSize: 13, color: '#e94560' }}>
              📈 This contributes: <strong>+{dayData.metrics.count} {dayData.metrics.label}</strong>
            </span>
          </div>
        )}
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
        <SubmissionSuccess day={day} />
      ) : isCurrentOrPast && !isComplete ? (
        <SubmissionForm
          day={day}
          proofText={proofText}
          setProofText={setProofText}
          fileName={fileName}
          onFileSelect={handleFileSelect}
          onSubmit={handleSubmit}
        />
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
        <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
          {submission && new Date(submission.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function SubmissionSuccess({ day }) {
  return (
    <div className="card scale-in" style={{ borderColor: 'rgba(72,199,142,0.3)', textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: '#48c78e', marginBottom: 8 }}>
        Submission Received!
      </h3>
      <p style={{ color: '#888', fontSize: 14 }}>
        Day {day} is now complete. {day > 30
          ? 'Streak extended! Come back tomorrow to keep it going.'
          : day < 30 ? `You've unlocked Day ${day + 1}.` : 'You did it! 🎉 Keep going to build your streak!'}
      </p>
    </div>
  );
}

function SubmissionForm({ day, proofText, setProofText, fileName, onFileSelect, onSubmit }) {
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
        placeholder="Describe your completed task, paste links, or summarize your results..."
        style={{ marginBottom: 12 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
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
      <button className="btn-primary" onClick={onSubmit} style={{ width: '100%' }}>
        Submit Day {day} ✓
      </button>
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
