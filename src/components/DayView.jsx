import { useState } from 'react';
import { CHALLENGE_DAYS, CATEGORY_COLORS } from '../data/challengeDays';

export default function DayView({ day, user, onSubmit, onBack }) {
  const [proofText, setProofText] = useState('');
  const [fileName, setFileName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const dayData = CHALLENGE_DAYS[day - 1];
  const isComplete = user.completedDays.includes(day);
  const isCurrentOrPast = day <= user.currentDay;
  const existingSubmission = user.submissions.find(s => s.day === day);
  const cat = CATEGORY_COLORS[dayData.category];

  const handleFileSelect = (e) => {
    if (e.target.files[0]) setFileName(e.target.files[0].name);
  };

  const handleSubmit = () => {
    if (!proofText.trim() && !fileName) return;
    onSubmit(day, { text: proofText, fileName });
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
          <span className="mono" style={{ fontSize: 11, color: '#555' }}>DAY {day}/30</span>
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

      {/* Video Player */}
      <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
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
      </div>

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
        <p style={{ color: '#bbb', lineHeight: 1.8, fontSize: 15 }}>{dayData.taskDescription}</p>
        {dayData.metrics && (
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
          background: 'rgba(233,69,96,0.06)', border: '1px solid rgba(233,69,96,0.1)',
          borderRadius: 12, fontSize: 13, color: '#e94560', textAlign: 'center',
        }}>
          ⏰ Submit before 11:59 PM Pacific or you will be removed from this run
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
          <div style={{ marginTop: 8, fontSize: 13, color: '#888' }}>📎 {submission.fileName}</div>
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
        Day {day} is now complete. {day < 30 ? `You've unlocked Day ${day + 1}.` : 'You did it! 🎉'}
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
