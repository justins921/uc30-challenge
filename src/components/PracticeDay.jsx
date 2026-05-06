import { useState } from 'react';

const PRACTICE_METRICS = [
  { id: 'training_completed', label: 'Training Completed', type: 'boolean', icon: '🎓', tip: 'Mark this done after watching the daily training video.' },
  { id: 'properties_analyzed', label: 'Properties Analyzed', type: 'count', icon: '🏠', tip: 'Enter how many properties you reviewed and ran numbers on today.' },
  { id: 'arsenal_contacts', label: 'Arsenal Contacts', type: 'count', icon: '🤝', tip: 'Network contacts — other investors, mentors, meetup connections.' },
  { id: 'target_contacts', label: 'Target Contacts', type: 'count', icon: '🎯', tip: 'Deal source contacts — agents, wholesalers, property managers, sellers.' },
  { id: 'follow_ups', label: 'Follow-Ups', type: 'count', icon: '📞', tip: 'Select an existing contact and log what happened in the follow-up.' },
  { id: 'offers_submitted', label: 'Offers Submitted', type: 'count', icon: '📝', tip: 'Enter how many offers you submitted today.' },
  { id: 'properties_under_contract', label: 'Properties Under Contract', type: 'count', icon: '🔑', tip: 'Properties you have under contract.' },
];

const PRACTICE_QUIZ = {
  required: true,
  scenarios: [{
    id: 'practice_q1',
    title: 'Quick Practice Question',
    description: 'A property has an ARV (After Repair Value) of $200,000 and needs $30,000 in repairs. If you want to buy at 70% of ARV minus repairs, what should your maximum offer be?',
    maxAttempts: 3,
    explanationOnFail: 'The formula is: (ARV × 70%) − Repairs = ($200,000 × 0.70) − $30,000 = $140,000 − $30,000 = $110,000',
    inputs: [{ id: 'practice_offer', label: 'Maximum Offer Price', type: 'number', correctAnswer: 110000, tolerance: 1000, unit: '$' }],
  }],
};

export default function PracticeDay({ user, practiceDaySettings, onComplete, onBack }) {
  const [currentGuide, setCurrentGuide] = useState(0);
  const [metrics, setMetrics] = useState({
    training_completed: false, properties_analyzed: 0, arsenal_contacts: 0,
    target_contacts: 0, follow_ups: 0, offers_submitted: 0, properties_under_contract: 0,
  });
  const [proofText, setProofText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizResult, setQuizResult] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [quizPassed, setQuizPassed] = useState(false);

  const videoUrl = practiceDaySettings?.practice_day_video || null;
  const calculatorUrl = practiceDaySettings?.rental_calculator_url || null;

  const setMetric = (key, value) => setMetrics(prev => ({ ...prev, [key]: value }));

  const GUIDE_STEPS = [
    { id: 'video', title: 'Daily Training Video', icon: '🎬' },
    { id: 'quiz', title: 'Check for Understanding', icon: '📝' },
    { id: 'metrics', title: 'Daily Activity Log', icon: '📊' },
    { id: 'submit', title: 'Submit Your Day', icon: '📤' },
  ];

  const handleCheckQuiz = () => {
    const num = parseFloat(quizAnswer.replace(/[^0-9.]/g, ''));
    const correct = !isNaN(num) && Math.abs(num - 110000) <= 1000;
    const newAttempts = quizAttempts + 1;
    setQuizAttempts(newAttempts);
    setQuizResult(correct ? 'correct' : 'wrong');
    if (correct) setQuizPassed(true);
    if (!correct && newAttempts < 3) {
      setTimeout(() => { setQuizResult(null); setQuizAnswer(''); }, 2000);
    }
  };

  const handlePracticeSubmit = async () => {
    setSubmitted(true);
    if (onComplete) await onComplete();
  };

  if (submitted) {
    return (
      <div className="fade-up" style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 24px',
            background: 'rgba(72,199,142,0.15)', border: '2px solid rgba(72,199,142,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
          }}>✓</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#48c78e', marginBottom: 12 }}>
            Nice work!
          </h1>
          <p style={{ color: '#888', fontSize: 15, lineHeight: 1.8, maxWidth: 400, margin: '0 auto 32px' }}>
            That's exactly how it works on a real day. You're ready for Day 1.
          </p>
          <p style={{ color: '#555', fontSize: 13, marginBottom: 24 }}>
            Nothing was saved — this was just practice.
          </p>
          <button className="btn-secondary" onClick={onBack} style={{ padding: '12px 28px', fontSize: 14 }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up" style={{ maxWidth: 640, margin: '0 auto' }}>
      <button className="btn-secondary" onClick={onBack} style={{ marginBottom: 20, padding: '8px 20px', fontSize: 13 }}>
        ← Back
      </button>

      {/* Practice Mode Banner */}
      <div style={{
        padding: '12px 20px', borderRadius: 10, marginBottom: 24, textAlign: 'center',
        background: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.25)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f0a500', letterSpacing: 1, textTransform: 'uppercase' }}>
          Practice Mode
        </div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
          This is a practice run. Nothing you submit here counts toward your sprint.
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28, justifyContent: 'center' }}>
        {GUIDE_STEPS.map((s, i) => (
          <button key={s.id} onClick={() => setCurrentGuide(i)} style={{
            width: i === currentGuide ? 28 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer',
            background: i < currentGuide ? '#48c78e' : i === currentGuide ? '#f0a500' : 'rgba(255,255,255,0.08)',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      {/* ═══ GUIDE STEP 1: VIDEO ═══ */}
      {currentGuide === 0 && (
        <div className="scale-in">
          <Tooltip text="Each day starts with a training video from Chandler. Watch it before doing anything else." />
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(233,69,96,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎬</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Daily Training Video</h3>
            </div>
            {videoUrl ? (
              <div style={{ aspectRatio: '16/9', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
                <iframe src={videoUrl} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
              </div>
            ) : (
              <div style={{
                aspectRatio: '16/9', borderRadius: 10, marginBottom: 12,
                background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
              }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>▶️</div>
                <div style={{ fontSize: 13, color: '#666' }}>Daily video will appear here</div>
              </div>
            )}
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, margin: 0 }}>
              On a real day, you'd watch the full training video before moving on to your daily activities.
            </p>
          </div>
          <button className="btn-primary" onClick={() => setCurrentGuide(1)} style={{ width: '100%', padding: '14px 24px' }}>
            Got it — Next
          </button>
        </div>
      )}

      {/* ═══ GUIDE STEP 2: QUIZ ═══ */}
      {currentGuide === 1 && (
        <div className="scale-in">
          <Tooltip text="After the video, you'll answer a few questions to make sure you understand the concept. You get 3 tries." />
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(240,165,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📝</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Check for Understanding</h3>
            </div>

            <p style={{ fontSize: 14, color: '#bbb', lineHeight: 1.7, marginBottom: 16 }}>
              {PRACTICE_QUIZ.scenarios[0].description}
            </p>

            {quizPassed ? (
              <div style={{ padding: '20px', borderRadius: 12, textAlign: 'center', background: 'rgba(72,199,142,0.06)', border: '1px solid rgba(72,199,142,0.2)' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>✓</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#48c78e' }}>Correct! $110,000</div>
              </div>
            ) : quizAttempts >= 3 ? (
              <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(233,69,96,0.04)', border: '1px solid rgba(233,69,96,0.12)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e94560', marginBottom: 8 }}>Here's how to get it right:</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ fontSize: 13, color: '#aaa' }}>Maximum Offer Price</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#48c78e' }}>$110,000</span>
                </div>
                <p style={{ fontSize: 13, color: '#bbb', lineHeight: 1.6, marginTop: 10, marginBottom: 0 }}>
                  {PRACTICE_QUIZ.scenarios[0].explanationOnFail}
                </p>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Maximum Offer Price
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 16, color: '#666', fontWeight: 600 }}>$</span>
                  <input value={quizAnswer} onChange={e => setQuizAnswer(e.target.value)}
                    placeholder="0" inputMode="numeric"
                    style={{
                      flex: 1, fontSize: 16, padding: '12px 14px', borderRadius: 8,
                      background: quizResult === 'wrong' ? 'rgba(233,69,96,0.06)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${quizResult === 'wrong' ? 'rgba(233,69,96,0.3)' : 'rgba(255,255,255,0.1)'}`,
                      color: '#eee', fontFamily: "'DM Sans', sans-serif",
                    }} />
                  {quizResult === 'wrong' && <span style={{ color: '#e94560', fontWeight: 700 }}>✗</span>}
                </div>
                {quizResult === 'wrong' && (
                  <p style={{ fontSize: 12, color: '#e94560', marginBottom: 12 }}>
                    Incorrect — try again (Attempt {quizAttempts} of 3)
                  </p>
                )}
                <button className="btn-primary" onClick={handleCheckQuiz}
                  disabled={!quizAnswer.trim()}
                  style={{ width: '100%', opacity: quizAnswer.trim() ? 1 : 0.4 }}>
                  Check Answer
                </button>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={() => setCurrentGuide(0)} style={{ padding: '14px 20px' }}>Back</button>
            <button className="btn-primary" onClick={() => setCurrentGuide(2)} style={{ flex: 1, padding: '14px 24px' }}>
              {quizPassed || quizAttempts >= 3 ? 'Next' : 'Skip for now'}
            </button>
          </div>
        </div>
      )}

      {/* ═══ GUIDE STEP 3: METRICS ═══ */}
      {currentGuide === 2 && (
        <div className="scale-in">
          <Tooltip text="This is where you log your daily activity. Each metric has a minimum requirement — meet them all to stay in the sprint." />
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(233,69,96,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📊</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Daily Activity Log</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PRACTICE_METRICS.map(metric => {
                const value = metrics[metric.id];
                const isBool = metric.type === 'boolean';
                return (
                  <div key={metric.id}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                        <span style={{ fontSize: 18 }}>{metric.icon}</span>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#ddd' }}>{metric.label}</div>
                      </div>
                      {isBool ? (
                        <button onClick={() => setMetric(metric.id, !value)} style={{
                          padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                          border: value ? '1px solid rgba(72,199,142,0.3)' : '1px solid rgba(255,255,255,0.1)',
                          background: value ? 'rgba(72,199,142,0.15)' : 'rgba(255,255,255,0.04)',
                          color: value ? '#48c78e' : '#888',
                        }}>
                          {value ? '✓ Done' : 'Mark Done'}
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button onClick={() => setMetric(metric.id, Math.max(0, (value || 0) - 1))}
                            style={{ width: 32, height: 32, borderRadius: 6, fontSize: 18, fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                          <input type="number" min="0" value={value || 0}
                            onChange={e => setMetric(metric.id, Math.max(0, parseInt(e.target.value) || 0))}
                            style={{ width: 56, textAlign: 'center', fontSize: 18, fontWeight: 700, padding: '6px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                          <button onClick={() => setMetric(metric.id, (value || 0) + 1)}
                            style={{ width: 32, height: 32, borderRadius: 6, fontSize: 18, fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#666', padding: '4px 16px 0', fontStyle: 'italic' }}>
                      {metric.tip}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={() => setCurrentGuide(1)} style={{ padding: '14px 20px' }}>Back</button>
            <button className="btn-primary" onClick={() => setCurrentGuide(3)} style={{ flex: 1, padding: '14px 24px' }}>
              Next — Submit
            </button>
          </div>
        </div>
      )}

      {/* ═══ GUIDE STEP 4: SUBMIT ═══ */}
      {currentGuide === 3 && (
        <div className="scale-in">
          <Tooltip text="Once you've met all daily minimums, hit Submit to lock in your progress. You must submit before the deadline each day." />
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(233,69,96,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📤</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Daily Check-In</h3>
            </div>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>
              Summarize your day or add any additional notes.
            </p>
            <textarea value={proofText} onChange={e => setProofText(e.target.value)}
              placeholder="Describe your day's work, paste links, or summarize results..."
              style={{ marginBottom: 16, width: '100%', fontSize: 14, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#eee', resize: 'vertical', minHeight: 80 }} />
          </div>

          {/* CRM pointer */}
          <div style={{
            padding: '14px 18px', borderRadius: 10, marginBottom: 24,
            background: 'rgba(72,199,142,0.04)', border: '1px solid rgba(72,199,142,0.12)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 20 }}>📇</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#48c78e', marginBottom: 2 }}>Your CRM</div>
              <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>
                Every contact you add as a Deal Source shows up in your CRM tab. Use it to track who you've talked to and when.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={() => setCurrentGuide(2)} style={{ padding: '14px 20px' }}>Back</button>
            <button onClick={handlePracticeSubmit} style={{
              flex: 1, padding: '14px 24px', borderRadius: 10, fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              background: 'transparent', color: '#f0a500',
              border: '2px solid rgba(240,165,0,0.4)',
              transition: 'all 0.15s',
            }}>
              Practice Submit
            </button>
          </div>
        </div>
      )}

      {/* ── Pre-Day 1 Resources (always visible below guide) ── */}
      <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Pre-Day 1 Resources</h3>

        {videoUrl && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>How to Analyze a Rental Property</div>
            <div style={{ aspectRatio: '16/9', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
              <iframe src={videoUrl} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
            </div>
          </div>
        )}

        {calculatorUrl && (
          <a href={calculatorUrl} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px 20px', borderRadius: 12, marginBottom: 16,
            background: 'linear-gradient(135deg, rgba(83,52,131,0.08), rgba(83,52,131,0.03))',
            border: '1px solid rgba(83,52,131,0.2)', textDecoration: 'none',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: 'rgba(83,52,131,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>📊</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#c9a0ff', marginBottom: 2 }}>
                Download the CDS Rental Calculator
              </div>
              <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>
                Get familiar with the calculator before Day 1. You'll use it to analyze every property during your sprint.
              </div>
            </div>
          </a>
        )}

        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7, margin: 0 }}>
          Before your sprint begins, we recommend watching the video above and running 2-3 practice analyses in the calculator. The more comfortable you are with the tool, the faster you'll move on Day 1.
        </p>
      </div>
    </div>
  );
}

function Tooltip({ text }) {
  return (
    <div style={{
      padding: '12px 16px', borderRadius: 10, marginBottom: 16,
      background: 'rgba(83,52,131,0.08)', border: '1px solid rgba(83,52,131,0.2)',
      display: 'flex', alignItems: 'flex-start', gap: 10,
    }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>💡</span>
      <p style={{ fontSize: 13, color: '#c9a0ff', lineHeight: 1.6, margin: 0 }}>
        {text}
      </p>
    </div>
  );
}
