import { useState } from 'react';

const PROPERTY_TYPES = ['SFR', 'Multifamily', 'Commercial', 'Land', 'Mixed-Use'];
const STRATEGIES = ['Flip', 'BRRRR', 'Buy & Hold Rental', 'Wholesale', 'Subject-To', 'Seller Finance'];

export default function OnboardingFlow({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [buyBox, setBuyBox] = useState({
    markets: '',
    propertyType: '',
    priceMin: '',
    priceMax: '',
    strategy: '',
  });
  const [committed, setCommitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleComplete = async () => {
    setSaving(true);
    await onComplete({
      buyBox: {
        markets: buyBox.markets.split(',').map(m => m.trim()).filter(Boolean),
        propertyType: buyBox.propertyType,
        priceMin: parseInt(buyBox.priceMin) || 0,
        priceMax: parseInt(buyBox.priceMax) || 0,
        strategy: buyBox.strategy,
      },
      commitmentDeclaredAt: new Date().toISOString(),
      onboardingCompleted: true,
    });
    setSaving(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 20,
    }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{
              width: 10, height: 10, borderRadius: '50%',
              background: s <= step ? '#e94560' : 'rgba(255,255,255,0.1)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="card fade-up" style={{ textAlign: 'center', padding: 40 }}>
            <div className="mono" style={{ fontSize: 48, fontWeight: 700, color: '#e94560', marginBottom: 16 }}>
              UC30
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              Welcome, Operator.
            </h1>
            <p style={{ color: '#888', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
              Let's set up your UC30 command center. You're about to join an elite execution system
              designed to get your first property under contract in 30 days.
            </p>
            <button className="btn-primary" style={{ padding: '14px 40px', fontSize: 16 }} onClick={() => setStep(2)}>
              Let's Go →
            </button>
          </div>
        )}

        {/* Step 2: Buy Box Setup */}
        {step === 2 && (
          <div className="card fade-up" style={{ padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Set Up Your Buy Box
            </h2>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>
              Define your target criteria. You can always update this later.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 6 }}>
                  Target Market(s)
                </label>
                <input
                  value={buyBox.markets}
                  onChange={e => setBuyBox(prev => ({ ...prev, markets: e.target.value }))}
                  placeholder="e.g. Austin TX, San Antonio TX"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 6 }}>
                  Property Type
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {PROPERTY_TYPES.map(pt => (
                    <button
                      key={pt}
                      onClick={() => setBuyBox(prev => ({ ...prev, propertyType: pt }))}
                      style={{
                        padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                        background: buyBox.propertyType === pt ? 'rgba(233,69,96,0.15)' : 'rgba(255,255,255,0.04)',
                        color: buyBox.propertyType === pt ? '#e94560' : '#888',
                        border: buyBox.propertyType === pt ? '1px solid rgba(233,69,96,0.3)' : '1px solid rgba(255,255,255,0.08)',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {pt}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 6 }}>
                    Min Price ($)
                  </label>
                  <input
                    type="number"
                    value={buyBox.priceMin}
                    onChange={e => setBuyBox(prev => ({ ...prev, priceMin: e.target.value }))}
                    placeholder="50000"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 6 }}>
                    Max Price ($)
                  </label>
                  <input
                    type="number"
                    value={buyBox.priceMax}
                    onChange={e => setBuyBox(prev => ({ ...prev, priceMax: e.target.value }))}
                    placeholder="300000"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 6 }}>
                  Strategy
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {STRATEGIES.map(s => (
                    <button
                      key={s}
                      onClick={() => setBuyBox(prev => ({ ...prev, strategy: s }))}
                      style={{
                        padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                        background: buyBox.strategy === s ? 'rgba(83,52,131,0.15)' : 'rgba(255,255,255,0.04)',
                        color: buyBox.strategy === s ? '#c9a0ff' : '#888',
                        border: buyBox.strategy === s ? '1px solid rgba(83,52,131,0.3)' : '1px solid rgba(255,255,255,0.08)',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button className="btn-secondary" onClick={() => setStep(1)} style={{ padding: '12px 20px' }}>
                ← Back
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1, padding: '12px 20px' }}
                onClick={() => setStep(3)}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Commitment Declaration */}
        {step === 3 && (
          <div className="card fade-up" style={{ padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Operator Commitment
            </h2>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>
              This sprint demands daily execution. Read and agree to the commitment below.
            </p>

            <div style={{
              padding: 20, borderRadius: 12,
              background: 'rgba(233,69,96,0.04)', border: '1px solid rgba(233,69,96,0.15)',
              marginBottom: 24,
            }}>
              <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                I commit to completing all daily standards for 30 consecutive days.
                I understand that if I fall behind, I will be removed from the current cohort
                and must restart with the next one. I am ready to execute.
              </p>
            </div>

            <label
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px',
                background: committed ? 'rgba(72,199,142,0.06)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${committed ? 'rgba(72,199,142,0.15)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 10, cursor: 'pointer', marginBottom: 20,
                transition: 'all 0.2s',
              }}
            >
              <input
                type="checkbox"
                checked={committed}
                onChange={e => setCommitted(e.target.checked)}
                style={{ marginTop: 2, accentColor: '#48c78e', width: 18, height: 18, cursor: 'pointer' }}
              />
              <div style={{ fontSize: 14, fontWeight: 600, color: committed ? '#48c78e' : '#ccc' }}>
                I Commit — Let's Execute
              </div>
            </label>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-secondary" onClick={() => setStep(2)} style={{ padding: '12px 20px' }}>
                ← Back
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1, padding: '12px 20px', opacity: committed ? 1 : 0.5 }}
                onClick={() => committed && setStep(4)}
                disabled={!committed}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: CDS Collective Unlock */}
        {step === 4 && (
          <div className="card fade-up" style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Your Operator Hub is Ready
            </h2>
            <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              Your execution system includes access to the CDS Collective — a community
              of operators executing alongside you.
            </p>

            <a
              href="https://www.skool.com/cds-collective"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block', padding: '12px 28px', borderRadius: 10,
                background: 'rgba(83,52,131,0.15)', border: '1px solid rgba(83,52,131,0.3)',
                color: '#c9a0ff', textDecoration: 'none', fontSize: 14, fontWeight: 600,
                marginBottom: 28, fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Join CDS Collective on Skool →
            </a>

            <div>
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '14px 24px', fontSize: 16 }}
                onClick={handleComplete}
                disabled={saving}
              >
                {saving ? 'Setting up...' : 'Enter Your Command Center →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
