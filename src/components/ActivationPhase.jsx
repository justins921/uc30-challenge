import { useState } from 'react';

const TOTAL_STEPS = 9;

export default function ActivationPhase({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [stepKey, setStepKey] = useState(0);

  const goNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(s => s + 1);
      setStepKey(k => k + 1);
      window.scrollTo(0, 0);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(s => s - 1);
      setStepKey(k => k + 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {step > 1 && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(10,10,15,0.92)', backdropFilter: 'blur(12px)',
          padding: '14px 20px 12px',
        }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 8,
            }}>
              <span style={{ fontSize: 11, color: '#666', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                Step {step} of {TOTAL_STEPS}
              </span>
              <span style={{ fontSize: 11, color: '#555' }}>
                {Math.round((step / TOTAL_STEPS) * 100)}%
              </span>
            </div>
            <div style={{
              height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: 'linear-gradient(90deg, #e94560, #c81d4e)',
                width: `${(step / TOTAL_STEPS) * 100}%`,
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        </div>
      )}

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px',
      }}>
        <div key={stepKey} className="fade-up" style={{ width: '100%', maxWidth: 560 }}>
          {step === 1 && <WelcomeStep firstName={user?.firstName} onBegin={goNext} />}
          {step >= 2 && step <= 8 && <PlaceholderStep step={step} onNext={goNext} onBack={goBack} />}
          {step === 9 && <PlaceholderStep step={step} onNext={() => {}} onBack={goBack} isFinal />}
        </div>
      </div>
    </div>
  );
}

// ── Step 1: Welcome ────────────────────────────────────────
function WelcomeStep({ firstName, onBegin }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="mono" style={{
        fontSize: 48, fontWeight: 700, color: '#e94560', marginBottom: 32,
        letterSpacing: 2,
      }}>
        UC30
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>
        Welcome, {firstName || 'Operator'}.
      </h1>

      <p style={{
        color: '#999', fontSize: 16, lineHeight: 1.8, maxWidth: 460,
        margin: '0 auto 12px',
      }}>
        You've made the decision. Now let's make sure you're ready to execute.
      </p>

      <p style={{
        color: '#666', fontSize: 14, lineHeight: 1.7, maxWidth: 440,
        margin: '0 auto 40px',
      }}>
        Over the next few minutes, we'll build your operator profile — your target market,
        your buy box, your financing plan, your commitment level. When you're done, you'll
        be locked and loaded for Day 1.
      </p>

      <div style={{
        padding: '20px 24px', borderRadius: 14,
        background: 'rgba(233,69,96,0.04)', border: '1px solid rgba(233,69,96,0.1)',
        maxWidth: 400, margin: '0 auto 40px', textAlign: 'left',
      }}>
        {[
          'Confirm your market research',
          'Define your buy box',
          'Verify access to capital',
          'Set your offer commitment',
          'Declare your stakes',
          'Define your why',
          'Set daily reminders',
          'Commit and activate',
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '7px 0',
            borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.03)' : 'none',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0,
              background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, color: '#e94560', fontWeight: 700,
            }}>
              {i + 1}
            </div>
            <span style={{ fontSize: 13, color: '#aaa' }}>{item}</span>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={onBegin} style={{
        padding: '16px 48px', fontSize: 17, letterSpacing: 0.3,
      }}>
        Begin Activation
      </button>
    </div>
  );
}

// ── Placeholder for steps 2–9 (built in later updates) ─────
function PlaceholderStep({ step, onNext, onBack, isFinal }) {
  const labels = {
    2: 'Market Research Confirmation',
    3: 'Buy Box Setup',
    4: 'Access to Capital',
    5: 'Offer Commitment',
    6: 'Declare Your Stakes',
    7: 'Your Why',
    8: 'Daily Notification Preferences',
    9: 'Commitment & Completion',
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
        Step {step}: {labels[step]}
      </h2>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 32 }}>
        This step will be built in a later update.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="btn-secondary" onClick={onBack} style={{ padding: '12px 28px' }}>
          Back
        </button>
        {!isFinal && (
          <button className="btn-primary" onClick={onNext} style={{ padding: '12px 28px' }}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}
