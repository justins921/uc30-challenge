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
          {step === 2 && <MarketResearchStep onNext={goNext} onBack={goBack} onSave={onComplete} />}
          {step === 3 && <BuyBoxStep onNext={goNext} onBack={goBack} onSave={onComplete} existingBuyBox={user?.buyBox} />}
          {step === 4 && <CapitalConfirmationStep onNext={goNext} onBack={goBack} onSave={onComplete} existingCapital={user?.capitalConfirmation} />}
          {step === 5 && <OfferCommitmentStep onNext={goNext} onBack={goBack} onSave={onComplete} existingCommitment={user?.offerCommitment} />}
          {step >= 6 && step <= 8 && <PlaceholderStep step={step} onNext={goNext} onBack={goBack} />}
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

// ── Step 2: Market Research Confirmation ───────────────────
function MarketResearchStep({ onNext, onBack, onSave }) {
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    if (!confirmed) return;
    setSaving(true);
    await onSave({
      marketResearchConfirmed: true,
      marketResearchConfirmedAt: new Date().toISOString(),
    });
    setSaving(false);
    onNext();
  };

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>
        Confirm Your Market Research
      </h1>

      <p style={{ color: '#999', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
        Before Day 1, you should know the basics of your target market — median home
        prices, average days on market, and average rent if you're buying rentals. This
        ensures you're ready to analyze properties and submit offers from the start.
      </p>

      <div style={{
        padding: '20px 24px', borderRadius: 12, marginBottom: 28,
        background: 'rgba(240,165,0,0.04)', border: '1px solid rgba(240,165,0,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>💡</span>
          <div>
            <p style={{ color: '#f0a500', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Not sure where to start?
            </p>
            <p style={{ color: '#888', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
              Check Zillow, Redfin, or Realtor.com for your target area. Look at median list
              price, average days on market, and price-to-rent ratios. 30 minutes of research
              now saves you days of guessing later.
            </p>
          </div>
        </div>
      </div>

      <label
        onClick={() => setConfirmed(!confirmed)}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          padding: '18px 20px', borderRadius: 12, cursor: 'pointer',
          background: confirmed ? 'rgba(72,199,142,0.06)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${confirmed ? 'rgba(72,199,142,0.2)' : 'rgba(255,255,255,0.08)'}`,
          transition: 'all 0.2s',
          userSelect: 'none',
        }}
      >
        <div style={{
          width: 24, height: 24, borderRadius: 7, flexShrink: 0, marginTop: 1,
          background: confirmed ? '#48c78e' : 'rgba(255,255,255,0.06)',
          border: confirmed ? '2px solid #48c78e' : '2px solid rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}>
          {confirmed && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
        <div>
          <div style={{
            fontSize: 15, fontWeight: 600, lineHeight: 1.5,
            color: confirmed ? '#48c78e' : '#ccc',
            transition: 'color 0.2s',
          }}>
            I have researched my target market and understand current pricing, days on
            market, and rental rates in my area.
          </div>
        </div>
      </label>

      <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
        <button className="btn-secondary" onClick={onBack} style={{ padding: '14px 24px' }}>
          Back
        </button>
        <button
          className="btn-primary"
          style={{
            flex: 1, padding: '14px 24px',
            opacity: confirmed ? 1 : 0.4,
            pointerEvents: confirmed ? 'auto' : 'none',
          }}
          onClick={handleNext}
          disabled={!confirmed || saving}
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Buy Box Setup ─────────────────────────────────
const PROPERTY_TYPES = ['SFR', 'Duplex', 'Triplex/4-Plex', 'Small Multifamily (5-20 units)', 'Apartments (20+)', 'Commercial', 'Storage', 'Land'];
const STRATEGIES = ['Buy & Hold', 'BRRRR', 'Flip', 'Wholesale', 'Seller Finance', 'Short-Term Rental', 'Section 8'];
const CONDITIONS = ['Turnkey', 'Light Rehab', 'Heavy Rehab', 'Any'];
const FINANCING_TYPES = ['Conventional', 'DSCR', 'Hard Money', 'Seller Finance', 'Cash', 'JV/Partnership', 'Other'];

function formatCurrency(val) {
  if (!val && val !== 0) return '';
  return Number(val).toLocaleString('en-US');
}

function parseCurrency(str) {
  const num = parseInt(str.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? '' : num;
}

function BuyBoxStep({ onNext, onBack, onSave, existingBuyBox }) {
  const bb = existingBuyBox || {};
  const [markets, setMarkets] = useState(bb.markets || []);
  const [marketInput, setMarketInput] = useState('');
  const [propertyTypes, setPropertyTypes] = useState(bb.propertyTypes || []);
  const [priceMin, setPriceMin] = useState(bb.priceMin || '');
  const [priceMax, setPriceMax] = useState(bb.priceMax || '');
  const [downPayment, setDownPayment] = useState(bb.downPayment || '');
  const [strategies, setStrategies] = useState(bb.strategies || []);
  const [conditionTolerance, setConditionTolerance] = useState(bb.conditionTolerance || '');
  const [financingTypes, setFinancingTypes] = useState(bb.financingTypes || []);
  const [saving, setSaving] = useState(false);

  const addMarket = () => {
    const trimmed = marketInput.trim();
    if (trimmed && !markets.includes(trimmed)) {
      setMarkets([...markets, trimmed]);
      setMarketInput('');
    }
  };

  const removeMarket = (m) => setMarkets(markets.filter(x => x !== m));

  const toggleChip = (list, setList, val) => {
    setList(list.includes(val) ? list.filter(x => x !== val) : [...list, val]);
  };

  const canProceed = markets.length > 0 && propertyTypes.length > 0;

  const handleNext = async () => {
    if (!canProceed) return;
    setSaving(true);
    await onSave({
      buyBox: {
        markets,
        propertyTypes,
        priceMin: priceMin || null,
        priceMax: priceMax || null,
        downPayment: downPayment || null,
        strategies,
        conditionTolerance: conditionTolerance || null,
        financingTypes,
      },
    });
    setSaving(false);
    onNext();
  };

  const chipStyle = (selected, color) => ({
    padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: selected ? 600 : 400,
    cursor: 'pointer', userSelect: 'none', transition: 'all 0.15s',
    fontFamily: "'DM Sans', sans-serif", border: 'none',
    background: selected ? `rgba(${color}, 0.15)` : 'rgba(255,255,255,0.04)',
    color: selected ? `rgb(${color})` : '#888',
    outline: selected ? `1px solid rgba(${color}, 0.3)` : '1px solid rgba(255,255,255,0.08)',
  });

  const sectionGap = { marginBottom: 28 };
  const labelStyle = { fontSize: 13, color: '#aaa', fontWeight: 600, display: 'block', marginBottom: 8 };

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
        Define Your Buy Box
      </h1>
      <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
        Set your investment criteria so you're ready to act on Day 1. Keep it focused — you can always refine later.
      </p>

      {/* 1. Location */}
      <div style={sectionGap}>
        <label style={labelStyle}>
          Target Market(s) <span style={{ color: '#e94560' }}>*</span>
        </label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            value={marketInput}
            onChange={e => setMarketInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMarket(); } }}
            placeholder="e.g. Phoenix, AZ"
            style={{
              flex: 1, fontSize: 14, padding: '10px 14px', borderRadius: 8,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#eee', fontFamily: "'DM Sans', sans-serif",
            }}
          />
          <button
            onClick={addMarket}
            disabled={!marketInput.trim()}
            style={{
              padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: marketInput.trim() ? 'rgba(233,69,96,0.12)' : 'rgba(255,255,255,0.04)',
              color: marketInput.trim() ? '#e94560' : '#555',
              border: marketInput.trim() ? '1px solid rgba(233,69,96,0.25)' : '1px solid rgba(255,255,255,0.08)',
              cursor: marketInput.trim() ? 'pointer' : 'default',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Add
          </button>
        </div>
        {markets.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {markets.map(m => (
              <span key={m} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 10px 5px 12px', borderRadius: 6, fontSize: 13,
                background: 'rgba(233,69,96,0.1)', color: '#e94560', fontWeight: 500,
              }}>
                {m}
                <button
                  onClick={() => removeMarket(m)}
                  style={{
                    background: 'none', border: 'none', color: '#e94560', cursor: 'pointer',
                    fontSize: 16, padding: 0, lineHeight: 1, fontFamily: "'DM Sans', sans-serif",
                    opacity: 0.6,
                  }}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. Property Type */}
      <div style={sectionGap}>
        <label style={labelStyle}>
          Property Type(s) <span style={{ color: '#e94560' }}>*</span>
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PROPERTY_TYPES.map(pt => (
            <button key={pt} onClick={() => toggleChip(propertyTypes, setPropertyTypes, pt)}
              style={chipStyle(propertyTypes.includes(pt), '233,69,96')}>
              {pt}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Deal Size */}
      <div style={sectionGap}>
        <label style={labelStyle}>Purchase Price Range</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Min ($)</span>
            <input
              value={priceMin ? formatCurrency(priceMin) : ''}
              onChange={e => setPriceMin(parseCurrency(e.target.value))}
              placeholder="100,000"
              inputMode="numeric"
              style={{
                width: '100%', fontSize: 14, padding: '10px 14px', borderRadius: 8,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#eee', fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Max ($)</span>
            <input
              value={priceMax ? formatCurrency(priceMax) : ''}
              onChange={e => setPriceMax(parseCurrency(e.target.value))}
              placeholder="300,000"
              inputMode="numeric"
              style={{
                width: '100%', fontSize: 14, padding: '10px 14px', borderRadius: 8,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#eee', fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>
        </div>
        <label style={labelStyle}>Down Payment / Cash Available</label>
        <input
          value={downPayment ? formatCurrency(downPayment) : ''}
          onChange={e => setDownPayment(parseCurrency(e.target.value))}
          placeholder="50,000"
          inputMode="numeric"
          style={{
            width: '100%', fontSize: 14, padding: '10px 14px', borderRadius: 8,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#eee', fontFamily: "'DM Sans', sans-serif",
          }}
        />
      </div>

      {/* 4. Strategy */}
      <div style={sectionGap}>
        <label style={labelStyle}>Investment Strategy</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {STRATEGIES.map(s => (
            <button key={s} onClick={() => toggleChip(strategies, setStrategies, s)}
              style={chipStyle(strategies.includes(s), '240,165,0')}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Condition Tolerance */}
      <div style={sectionGap}>
        <label style={labelStyle}>Condition Tolerance</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CONDITIONS.map(c => (
            <button key={c} onClick={() => setConditionTolerance(conditionTolerance === c ? '' : c)}
              style={chipStyle(conditionTolerance === c, '83,52,131')}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Financing */}
      <div style={sectionGap}>
        <label style={labelStyle}>Financing Method(s)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {FINANCING_TYPES.map(f => (
            <button key={f} onClick={() => toggleChip(financingTypes, setFinancingTypes, f)}
              style={chipStyle(financingTypes.includes(f), '72,199,142')}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* PDF download card */}
      <a
        href="/buy-box-worksheet.html"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px 20px', borderRadius: 12, marginBottom: 32,
          background: 'linear-gradient(135deg, rgba(83,52,131,0.08), rgba(83,52,131,0.03))',
          border: '1px solid rgba(83,52,131,0.2)',
          textDecoration: 'none', transition: 'all 0.2s',
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: 'rgba(83,52,131,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>
          📄
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#c9a0ff', marginBottom: 2 }}>
            Full Buy Box Worksheet
          </div>
          <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>
            Want to go deeper? Download the comprehensive 40+ field worksheet to dial in every detail.
          </div>
        </div>
      </a>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-secondary" onClick={onBack} style={{ padding: '14px 24px' }}>
          Back
        </button>
        <button
          className="btn-primary"
          style={{
            flex: 1, padding: '14px 24px',
            opacity: canProceed ? 1 : 0.4,
            pointerEvents: canProceed ? 'auto' : 'none',
          }}
          onClick={handleNext}
          disabled={!canProceed || saving}
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>

      {!canProceed && (markets.length === 0 || propertyTypes.length === 0) && (
        <p style={{ fontSize: 12, color: '#e94560', textAlign: 'center', marginTop: 10 }}>
          Add at least one market and select at least one property type to continue.
        </p>
      )}
    </div>
  );
}

// ── Step 4: Access to Capital Confirmation ───────────────
const CAPITAL_OPTIONS = [
  { key: 'cash', label: 'I have cash available' },
  { key: 'hard_money_lender', label: 'I have a hard money lender identified' },
  { key: 'conventional', label: 'I have conventional pre-approval' },
  { key: 'dscr', label: 'I have a DSCR lender identified' },
  { key: 'jv_partner', label: 'I have a JV partner / private money source' },
  { key: 'seller_finance', label: "I'm pursuing seller financing (no lender needed)" },
  { key: 'working_on_it', label: "I'm still working on this" },
];

function CapitalConfirmationStep({ onNext, onBack, onSave, existingCapital }) {
  const [selected, setSelected] = useState(existingCapital?.type || '');
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    if (!selected) return;
    setSaving(true);
    await onSave({
      capitalConfirmation: {
        type: selected,
        confirmedAt: new Date().toISOString(),
      },
    });
    setSaving(false);
    onNext();
  };

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>
        Confirm Your Access to Capital
      </h1>

      <p style={{ color: '#999', fontSize: 15, lineHeight: 1.8, marginBottom: 28 }}>
        UC30 is an execution sprint. To get a property under contract in 30 days, you need
        to be able to actually close. Select the financing option that best describes your situation.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {CAPITAL_OPTIONS.map(({ key, label }) => {
          const isSelected = selected === key;
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '16px 20px', borderRadius: 12, fontSize: 15,
                fontWeight: isSelected ? 600 : 400,
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer', transition: 'all 0.15s',
                background: isSelected ? 'rgba(72,199,142,0.08)' : 'rgba(255,255,255,0.03)',
                color: isSelected ? '#48c78e' : '#bbb',
                border: isSelected ? '1px solid rgba(72,199,142,0.25)' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  border: isSelected ? '2px solid #48c78e' : '2px solid rgba(255,255,255,0.15)',
                  background: isSelected ? '#48c78e' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {isSelected && (
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', background: '#fff',
                    }} />
                  )}
                </div>
                <span>{label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {selected === 'working_on_it' && (
        <div style={{
          padding: '16px 20px', borderRadius: 12, marginBottom: 24,
          background: 'rgba(240,165,0,0.06)', border: '1px solid rgba(240,165,0,0.18)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⚠️</span>
            <p style={{ color: '#f0a500', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              We strongly recommend having financing in place before Day 1. UC30 moves
              fast — you don't want to find the right deal and not be able to close.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-secondary" onClick={onBack} style={{ padding: '14px 24px' }}>
          Back
        </button>
        <button
          className="btn-primary"
          style={{
            flex: 1, padding: '14px 24px',
            opacity: selected ? 1 : 0.4,
            pointerEvents: selected ? 'auto' : 'none',
          }}
          onClick={handleNext}
          disabled={!selected || saving}
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

// ── Step 5: Offer Commitment ─────────────────────────────
const OFFER_BENCHMARKS = [
  { value: 30, label: '30 offers', tier: 'Minimum Operator', color: '255,255,255' },
  { value: 45, label: '45 offers', tier: 'Strong Operator', color: '72,199,142' },
  { value: 60, label: '60+ offers', tier: 'Elite Operator', color: '240,165,0' },
];

function OfferCommitmentStep({ onNext, onBack, onSave, existingCommitment }) {
  const [count, setCount] = useState(existingCommitment || '');
  const [saving, setSaving] = useState(false);

  const numericCount = typeof count === 'number' ? count : parseInt(count, 10);
  const isValid = !isNaN(numericCount) && numericCount >= 30;
  const activeBenchmark = OFFER_BENCHMARKS.find(b => b.value === numericCount);

  const handleInput = (val) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setCount(cleaned === '' ? '' : parseInt(cleaned, 10));
  };

  const handleNext = async () => {
    if (!isValid) return;
    setSaving(true);
    await onSave({
      offerCommitment: numericCount,
      offerCommitmentSetAt: new Date().toISOString(),
    });
    setSaving(false);
    onNext();
  };

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>
        Set Your Offer Commitment
      </h1>

      <p style={{ color: '#999', fontSize: 15, lineHeight: 1.8, marginBottom: 28 }}>
        UC30 operators submit a minimum of 30 offers over 30 days. But top operators go
        way beyond that. How many offers are you committing to?
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {OFFER_BENCHMARKS.map(({ value, label, tier, color }) => {
          const isSelected = numericCount === value;
          const isGold = color === '240,165,0';
          return (
            <button
              key={value}
              onClick={() => setCount(value)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '18px 20px', borderRadius: 12,
                cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: "'DM Sans', sans-serif",
                background: isSelected
                  ? `rgba(${color}, ${isGold ? 0.08 : 0.06})`
                  : 'rgba(255,255,255,0.03)',
                border: isSelected
                  ? `1px solid rgba(${color}, ${isGold ? 0.35 : 0.2})`
                  : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontSize: 16, fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? `rgb(${color})` : '#ccc',
                  transition: 'color 0.15s',
                }}>
                  {label}
                </div>
                <div style={{
                  fontSize: 13, marginTop: 2,
                  color: isSelected ? `rgba(${color}, 0.7)` : '#666',
                  fontWeight: isGold && isSelected ? 600 : 400,
                }}>
                  {tier}
                </div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                border: isSelected ? `2px solid rgb(${color})` : '2px solid rgba(255,255,255,0.15)',
                background: isSelected ? `rgb(${color})` : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {isSelected && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: isGold ? '#1a1a2e' : '#fff' }} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <label style={{ fontSize: 13, color: '#777', fontWeight: 500 }}>
          Or enter a custom number
        </label>
      </div>
      <input
        type="text"
        inputMode="numeric"
        value={count === '' ? '' : count}
        onChange={e => handleInput(e.target.value)}
        placeholder="30"
        style={{
          display: 'block', width: 140, margin: '0 auto 8px',
          textAlign: 'center', fontSize: 36, fontWeight: 700,
          padding: '12px 16px', borderRadius: 12,
          background: 'rgba(255,255,255,0.04)',
          border: isValid
            ? '1px solid rgba(72,199,142,0.25)'
            : count !== '' && !isValid
              ? '1px solid rgba(233,69,96,0.3)'
              : '1px solid rgba(255,255,255,0.1)',
          color: '#eee', fontFamily: "'DM Sans', sans-serif",
        }}
      />

      {count !== '' && !isValid && (
        <p style={{ textAlign: 'center', fontSize: 12, color: '#e94560', marginBottom: 4 }}>
          Minimum commitment is 30 offers.
        </p>
      )}

      <p style={{
        textAlign: 'center', fontSize: 13, color: '#666', lineHeight: 1.6,
        marginBottom: 32, marginTop: 12,
      }}>
        The more offers you put in, the faster you'll get a property under contract.
      </p>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-secondary" onClick={onBack} style={{ padding: '14px 24px' }}>
          Back
        </button>
        <button
          className="btn-primary"
          style={{
            flex: 1, padding: '14px 24px',
            opacity: isValid ? 1 : 0.4,
            pointerEvents: isValid ? 'auto' : 'none',
          }}
          onClick={handleNext}
          disabled={!isValid || saving}
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

// ── Placeholder for steps 6–9 (built in later updates) ─────
function PlaceholderStep({ step, onNext, onBack, isFinal }) {
  const labels = {
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
