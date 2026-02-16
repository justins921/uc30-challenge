import { useState } from 'react';

export default function ActivationPhase({ user, onComplete, skoolLink }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 2: Offer Commitment
  const [offerCommitment, setOfferCommitment] = useState('');

  // Step 3: Stakes Declaration
  const [stakesDeclaration, setStakesDeclaration] = useState('');

  // Step 4: Commitment Confirmation
  const [committed, setCommitted] = useState(false);

  const totalSteps = 5;

  const handleComplete = async () => {
    setSaving(true);
    await onComplete({
      offerCommitment: parseInt(offerCommitment) || 0,
      stakesDeclaration: stakesDeclaration.trim(),
      commitmentDeclaredAt: new Date().toISOString(),
      activationCompleted: true,
      activationCompletedAt: new Date().toISOString(),
      onboardingCompleted: true,
    });
    setSaving(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 20,
    }}>
      <div style={{ maxWidth: 560, width: '100%' }}>
        {/* Progress indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 32 }}>
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => (
            <div key={s} style={{
              width: s === step ? 24 : 10,
              height: 10,
              borderRadius: 5,
              background: s <= step ? '#e94560' : 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 12, color: '#555', fontWeight: 600, letterSpacing: 1 }}>
            STEP {step} OF {totalSteps}
          </span>
        </div>

        {/* ── Step 1: Welcome ── */}
        {step === 1 && (
          <div className="card fade-up" style={{ textAlign: 'center', padding: 48 }}>
            <div className="mono" style={{ fontSize: 48, fontWeight: 700, color: '#e94560', marginBottom: 20 }}>
              UC30
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>
              Welcome, {user.firstName}.
            </h1>
            <p style={{ color: '#aaa', fontSize: 15, lineHeight: 1.8, marginBottom: 12 }}>
              You've made the decision. Now let's make sure you're ready to execute.
            </p>
            <p style={{ color: '#777', fontSize: 14, lineHeight: 1.7, marginBottom: 36 }}>
              Over the next 30 days, you'll analyze properties, submit real offers, activate deal sources,
              and build the habits of a professional operator. Every day has a standard. Every day has a deadline.
              Miss a day, and you restart with the next cohort.
            </p>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 36 }}>
              Let's get you activated before Day 1 begins.
            </p>
            <button
              className="btn-primary"
              style={{ padding: '16px 48px', fontSize: 16 }}
              onClick={() => setStep(2)}
            >
              Begin Activation
            </button>
          </div>
        )}

        {/* ── Step 2: Offer Commitment ── */}
        {step === 2 && (
          <div className="card fade-up" style={{ padding: 36 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Set Your Offer Target
            </h2>
            <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
              How many offers will you commit to submitting during your 30-day sprint?
            </p>

            <div style={{
              padding: 20, borderRadius: 12,
              background: 'rgba(240,165,0,0.04)', border: '1px solid rgba(240,165,0,0.15)',
              marginBottom: 24,
            }}>
              <p style={{ color: '#f0a500', fontSize: 13, fontWeight: 600, margin: 0 }}>
                Top operators commit to 50+ offers in 30 days. The more you submit, the higher your chances of closing.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
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
              <span style={{ fontSize: 18, color: '#888', fontWeight: 600 }}>offers in 30 days</span>
            </div>

            {offerCommitment && parseInt(offerCommitment) > 0 && (
              <p style={{ fontSize: 13, color: '#666', marginTop: 12 }}>
                That's roughly <strong style={{ color: '#ccc' }}>
                  {Math.ceil(parseInt(offerCommitment) / 30)} offers per day
                </strong>. You've got this.
              </p>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button className="btn-secondary" onClick={() => setStep(1)} style={{ padding: '14px 24px' }}>
                Back
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1, padding: '14px 24px', opacity: offerCommitment && parseInt(offerCommitment) > 0 ? 1 : 0.5 }}
                onClick={() => offerCommitment && parseInt(offerCommitment) > 0 && setStep(3)}
                disabled={!offerCommitment || parseInt(offerCommitment) <= 0}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Stakes Declaration ── */}
        {step === 3 && (
          <div className="card fade-up" style={{ padding: 36 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Declare Your Stakes
            </h2>
            <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
              What will it cost you if you DON'T complete UC30?
            </p>
            <p style={{ color: '#666', fontSize: 13, lineHeight: 1.6, marginBottom: 28 }}>
              This is a psychological exercise. Write out what you lose by not following through.
              We'll show this back to you on tough days as a reminder of why you started.
            </p>

            <textarea
              value={stakesDeclaration}
              onChange={e => setStakesDeclaration(e.target.value)}
              placeholder="What happens if you quit? What stays the same? What opportunity do you lose?&#10;&#10;Example: &quot;If I don't finish UC30, I'll waste another year talking about real estate instead of doing it. My family won't see me step up. I'll still be stuck wondering 'what if' while other operators are closing deals.&quot;"
              rows={6}
              style={{
                width: '100%', padding: '14px 16px', fontSize: 14, borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                color: '#eee', resize: 'vertical', fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.7, boxSizing: 'border-box',
              }}
            />

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button className="btn-secondary" onClick={() => setStep(2)} style={{ padding: '14px 24px' }}>
                Back
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1, padding: '14px 24px', opacity: stakesDeclaration.trim() ? 1 : 0.5 }}
                onClick={() => stakesDeclaration.trim() && setStep(4)}
                disabled={!stakesDeclaration.trim()}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Commitment Confirmation ── */}
        {step === 4 && (
          <div className="card fade-up" style={{ padding: 36 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Confirm Your Commitment
            </h2>
            <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
              Review your commitment and lock it in.
            </p>

            {/* Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              <SummaryRow label="Offer Commitment" value={`${offerCommitment} offers in 30 days`} />
              {stakesDeclaration.trim() && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <span style={{ fontSize: 13, color: '#666', fontWeight: 600, display: 'block', marginBottom: 6 }}>Your Stakes</span>
                  <span style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>
                    {stakesDeclaration.length > 150 ? stakesDeclaration.slice(0, 150) + '...' : stakesDeclaration}
                  </span>
                </div>
              )}
            </div>

            {/* Commitment Statement */}
            <div style={{
              padding: 20, borderRadius: 12,
              background: 'rgba(233,69,96,0.04)', border: '1px solid rgba(233,69,96,0.15)',
              marginBottom: 24,
            }}>
              <p style={{ color: '#ccc', fontSize: 15, lineHeight: 1.8, margin: 0, fontStyle: 'italic' }}>
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
                borderRadius: 12, cursor: 'pointer', marginBottom: 24,
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

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-secondary" onClick={() => setStep(3)} style={{ padding: '14px 24px' }}>
                Back
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1, padding: '14px 24px', opacity: committed ? 1 : 0.5 }}
                onClick={() => committed && setStep(5)}
                disabled={!committed}
              >
                Lock It In
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Community Access (Optional Bonus) ── */}
        {step === 5 && (
          <div className="card fade-up" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
              background: 'linear-gradient(135deg, rgba(233,69,96,0.2), rgba(83,52,131,0.2))',
              border: '2px solid rgba(233,69,96,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36,
            }}>
              +
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              You're Activated
            </h2>
            <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
              Your UC30 Operator Hub is ready.
            </p>
            <p style={{ color: '#666', fontSize: 13, lineHeight: 1.6, marginBottom: 32 }}>
              As a bonus, you also have access to the CDS Collective community on Skool.
              This is optional — everything you need is inside UC30.
            </p>

            {skoolLink && (
              <a
                href={skoolLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block', padding: '12px 28px', borderRadius: 10,
                  background: 'rgba(83,52,131,0.15)', border: '1px solid rgba(83,52,131,0.3)',
                  color: '#c9a0ff', textDecoration: 'none', fontSize: 14, fontWeight: 600,
                  marginBottom: 32, fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.2s',
                }}
              >
                Join CDS Collective on Skool
              </a>
            )}

            <div>
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '16px 24px', fontSize: 16 }}
                onClick={handleComplete}
                disabled={saving}
              >
                {saving ? 'Activating...' : 'Enter Your Command Center'}
              </button>
            </div>

            <button
              onClick={handleComplete}
              disabled={saving}
              style={{
                background: 'none', border: 'none', color: '#555', cursor: 'pointer',
                fontSize: 13, marginTop: 16, fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Skip community — go straight to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 14px', borderRadius: 8,
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <span style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#ccc', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );
}
