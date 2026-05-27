import { useState } from 'react';

const TOTAL_STEPS = 10;

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
          {step === 3 && <GetClearStep onNext={goNext} onBack={goBack} onSave={onComplete} existing={user?.getClear} />}
          {step === 4 && <BuyBoxStep onNext={goNext} onBack={goBack} onSave={onComplete} existingBuyBox={user?.buyBox} />}
          {step === 5 && <CapitalConfirmationStep onNext={goNext} onBack={goBack} onSave={onComplete} existingCapital={user?.capitalConfirmation} />}
          {step === 6 && <OfferCommitmentStep onNext={goNext} onBack={goBack} onSave={onComplete} existingCommitment={user?.offerCommitment} />}
          {step === 7 && <StakesDeclarationStep onNext={goNext} onBack={goBack} onSave={onComplete} existingStakes={user?.stakesDeclaration} />}
          {step === 8 && <TheirWhyStep onNext={goNext} onBack={goBack} onSave={onComplete} existingWhy={user?.theirWhy} />}
          {step === 9 && <NotificationPrefsStep onNext={goNext} onBack={goBack} onSave={onComplete} existingPrefs={user?.notificationPreferences} />}
          {step === 10 && <CommitmentStep user={user} onBack={goBack} onSave={onComplete} />}
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

// ── Step 3: Get Clear ─────────────────────────────────────
const KEY_INDICATORS = ['Cash Flow', 'Appreciation', 'Equity', 'Tax Benefits', 'All of the Above'];
const FINANCING_OPTIONS = ['DSCR', 'Seller Finance', 'Conventional', 'Hard Money', 'Cash', 'Other'];

function GetClearStep({ onNext, onBack, onSave, existing }) {
  const gc = existing || {};
  const fp = gc.financialPlan || {};
  const [destination, setDestination] = useState(gc.destination || '');
  const [keyIndicator, setKeyIndicator] = useState(gc.keyIndicator || '');
  const [whereAmINow, setWhereAmINow] = useState(gc.whereAmINow || '');
  const [whereIWantToBe, setWhereIWantToBe] = useState(gc.whereIWantToBe || '');
  const [gap, setGap] = useState(gc.gap || '');
  const [timeFrameValue, setTimeFrameValue] = useState(gc.timeFrame?.value || '');
  const [timeFrameUnit, setTimeFrameUnit] = useState(gc.timeFrame?.unit || 'years');

  const [yearlyCashFlow, setYearlyCashFlow] = useState(fp.yearlyCashFlow || '');
  const [yearlyInvestment, setYearlyInvestment] = useState(fp.yearlyInvestment || '');
  const [returnPercent, setReturnPercent] = useState(fp.returnPercent || '');
  const [timePeriod, setTimePeriod] = useState(fp.timePeriod || '');
  const [propertiesPerYear, setPropertiesPerYear] = useState(fp.propertiesPerYear || '');
  const [propertyType, setPropertyType] = useState(fp.propertyType || 'properties');
  const [propertyValue, setPropertyValue] = useState(fp.propertyValue || '');
  const [downPaymentPercent, setDownPaymentPercent] = useState(fp.downPaymentPercent || '');
  const [downPaymentSource, setDownPaymentSource] = useState(fp.downPaymentSource || '');
  const [financingPercent, setFinancingPercent] = useState(fp.financingPercent || '');
  const [financingType, setFinancingType] = useState(fp.financingType || '');
  const [calcFields, setCalcFields] = useState(new Set());

  const [whyImportant, setWhyImportant] = useState(gc.whyImportant || '');
  const [saving, setSaving] = useState(false);

  const numOrNull = (v) => { const n = parseFloat(v); return isNaN(n) ? null : n; };

  const handleFieldChange = (field, rawValue) => {
    const isText = field === 'downPaymentSource';
    const value = isText ? rawValue : rawValue.replace(/[^\d.]/g, '');

    const v = {
      yearlyCashFlow, yearlyInvestment, returnPercent, timePeriod,
      propertiesPerYear, propertyValue, downPaymentPercent, financingPercent,
    };
    v[field] = value;

    const pos = (k) => { const x = parseFloat(v[k]); return isNaN(x) || x <= 0 ? null : x; };
    const num = (k) => { const x = parseFloat(v[k]); return isNaN(x) ? null : x; };

    const updates = {};
    const calced = new Set();
    const cf = pos('yearlyCashFlow');

    const p1 = ['yearlyCashFlow', 'returnPercent', 'timePeriod', 'yearlyInvestment'];
    if (p1.includes(field) && cf) {
      if (field !== 'yearlyInvestment' && pos('returnPercent') && pos('timePeriod')) {
        updates.yearlyInvestment = String(Math.round(cf / (pos('returnPercent') / 100) / pos('timePeriod')));
        calced.add('yearlyInvestment');
      } else if (field !== 'returnPercent' && pos('yearlyInvestment') && pos('timePeriod')) {
        const r = cf / pos('yearlyInvestment') / pos('timePeriod') * 100;
        if (r > 0) { updates.returnPercent = String(Math.round(r * 10) / 10); calced.add('returnPercent'); }
      } else if (field !== 'timePeriod' && pos('yearlyInvestment') && pos('returnPercent')) {
        const t = cf / (pos('returnPercent') / 100) / pos('yearlyInvestment');
        if (t > 0) { updates.timePeriod = String(Math.round(t)); calced.add('timePeriod'); }
      }
    }

    const yi = updates.yearlyInvestment ? parseFloat(updates.yearlyInvestment) : pos('yearlyInvestment');
    if (yi) {
      if (field === 'propertiesPerYear' && pos('propertiesPerYear')) {
        updates.propertyValue = String(Math.round(yi / pos('propertiesPerYear')));
        calced.add('propertyValue');
      } else if (field === 'propertyValue' && pos('propertyValue')) {
        const ppy = Math.round(yi / pos('propertyValue') * 10) / 10;
        if (ppy > 0) { updates.propertiesPerYear = String(ppy); calced.add('propertiesPerYear'); }
      } else if (p1.includes(field) && calced.has('yearlyInvestment')) {
        if (pos('propertyValue')) {
          const ppy = Math.round(yi / pos('propertyValue') * 10) / 10;
          if (ppy > 0) { updates.propertiesPerYear = String(ppy); calced.add('propertiesPerYear'); }
        } else if (pos('propertiesPerYear')) {
          updates.propertyValue = String(Math.round(yi / pos('propertiesPerYear')));
          calced.add('propertyValue');
        }
      }
    }

    if (field === 'downPaymentPercent' && num('downPaymentPercent') != null) {
      updates.financingPercent = String(100 - num('downPaymentPercent'));
      calced.add('financingPercent');
    } else if (field === 'financingPercent' && num('financingPercent') != null) {
      updates.downPaymentPercent = String(100 - num('financingPercent'));
      calced.add('downPaymentPercent');
    }

    const setters = {
      yearlyCashFlow: setYearlyCashFlow, yearlyInvestment: setYearlyInvestment,
      returnPercent: setReturnPercent, timePeriod: setTimePeriod,
      propertiesPerYear: setPropertiesPerYear, propertyValue: setPropertyValue,
      downPaymentPercent: setDownPaymentPercent, financingPercent: setFinancingPercent,
      downPaymentSource: setDownPaymentSource,
    };
    setters[field](value);
    Object.entries(updates).forEach(([key, val]) => { if (key !== field) setters[key](val); });
    setCalcFields(calced);
  };

  const canProceed = destination.trim() && whyImportant.trim();

  const handleNext = async () => {
    if (!canProceed) return;
    setSaving(true);
    await onSave({
      getClear: {
        destination: destination.trim(),
        keyIndicator: keyIndicator || null,
        whereAmINow: whereAmINow.trim() || null,
        whereIWantToBe: whereIWantToBe.trim() || null,
        gap: gap.trim() || null,
        timeFrame: timeFrameValue ? { value: parseInt(timeFrameValue), unit: timeFrameUnit } : null,
        financialPlan: {
          yearlyCashFlow: numOrNull(yearlyCashFlow),
          yearlyInvestment: numOrNull(yearlyInvestment),
          returnPercent: numOrNull(returnPercent),
          timePeriod: numOrNull(timePeriod),
          propertiesPerYear: numOrNull(propertiesPerYear),
          propertyType,
          propertyValue: numOrNull(propertyValue),
          downPaymentPercent: numOrNull(downPaymentPercent),
          downPaymentSource: downPaymentSource.trim() || null,
          financingPercent: numOrNull(financingPercent),
          financingType: financingType || null,
        },
        whyImportant: whyImportant.trim(),
      },
    });
    setSaving(false);
    onNext();
  };

  const inputStyle = {
    fontSize: 14, padding: '10px 14px', borderRadius: 8,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#eee', fontFamily: "'DM Sans', sans-serif", width: '100%',
  };
  const inlineInput = (value, fieldName, placeholder, opts = {}) => {
    const isCalced = calcFields.has(fieldName);
    return (
      <input
        value={value}
        onChange={e => handleFieldChange(fieldName, e.target.value)}
        placeholder={placeholder}
        inputMode={opts.inputMode || 'text'}
        style={{
          display: 'inline-block', width: opts.width || 100, fontSize: 16, fontWeight: 600,
          padding: '6px 10px', borderRadius: 6, textAlign: 'center',
          background: isCalced ? 'rgba(72,199,142,0.08)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${isCalced ? 'rgba(72,199,142,0.25)' : 'rgba(255,255,255,0.12)'}`,
          color: isCalced ? '#48c78e' : '#eee', fontFamily: "'DM Sans', sans-serif",
          verticalAlign: 'middle',
        }}
      />
    );
  };

  const sectionGap = { marginBottom: 36 };
  const labelStyle = { fontSize: 13, color: '#aaa', fontWeight: 600, display: 'block', marginBottom: 8 };
  const chipStyle = (selected) => ({
    padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: selected ? 600 : 400,
    cursor: 'pointer', userSelect: 'none', transition: 'all 0.15s',
    fontFamily: "'DM Sans', sans-serif", border: 'none',
    background: selected ? 'rgba(233,69,96,0.15)' : 'rgba(255,255,255,0.04)',
    color: selected ? '#e94560' : '#888',
    outline: selected ? '1px solid rgba(233,69,96,0.3)' : '1px solid rgba(255,255,255,0.08)',
  });

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Get Clear</h1>
      <p style={{ color: '#888', fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
        Begin with the end in mind.
      </p>

      {/* ── Section 1: Define Your Destination ── */}
      <div style={sectionGap}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(233,69,96,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎯</div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Define Your Destination</h2>
        </div>

        <label style={labelStyle}>
          What do you want real estate to do for you? <span style={{ color: '#e94560' }}>*</span>
        </label>
        <textarea
          value={destination}
          onChange={e => setDestination(e.target.value)}
          rows={4}
          placeholder="Financial freedom, replace my W-2 income, build generational wealth..."
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* ── Section 2: Quantify The Goal ── */}
      <div style={sectionGap}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(240,165,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📊</div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Quantify The Goal</h2>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>What is the key indicator?</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {KEY_INDICATORS.map(ki => (
              <button key={ki} onClick={() => setKeyIndicator(keyIndicator === ki ? '' : ki)}
                style={chipStyle(keyIndicator === ki)}>
                {ki}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Where am I now?</label>
          <input value={whereAmINow} onChange={e => setWhereAmINow(e.target.value)}
            placeholder="e.g. $0 in real estate, $50k saved"
            style={inputStyle} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Where do I want to be?</label>
          <input value={whereIWantToBe} onChange={e => setWhereIWantToBe(e.target.value)}
            placeholder="e.g. $5,000/mo in passive cash flow"
            style={inputStyle} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>What is the gap?</label>
          <input value={gap} onChange={e => setGap(e.target.value)}
            placeholder="e.g. $5,000/mo"
            style={inputStyle} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>What is the time frame to close the gap?</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input value={timeFrameValue} onChange={e => setTimeFrameValue(e.target.value.replace(/\D/g, ''))}
              placeholder="5" inputMode="numeric"
              style={{ ...inputStyle, width: 80, textAlign: 'center' }} />
            <select value={timeFrameUnit} onChange={e => setTimeFrameUnit(e.target.value)}
              style={{ fontSize: 14, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc' }}>
              <option value="years">years</option>
              <option value="months">months</option>
            </select>
          </div>
        </div>

        {/* Mad-libs financial plan */}
        <div style={{
          padding: '24px 20px', borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(233,69,96,0.04), rgba(240,165,0,0.04))',
          border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 8,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f0a500', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            My Financial Plan
          </div>

          <p style={{ fontSize: 15, color: '#ccc', lineHeight: 2.6, margin: 0 }}>
            I will have ${inlineInput(yearlyCashFlow, 'yearlyCashFlow', '60,000', { inputMode: 'numeric' })} in yearly cash flow.
            This will require ${inlineInput(yearlyInvestment, 'yearlyInvestment', '150,000', { inputMode: 'numeric' })} to be invested yearly
            at a {inlineInput(returnPercent, 'returnPercent', '8', { width: 60, inputMode: 'decimal' })}% return
            over a {inlineInput(timePeriod, 'timePeriod', '5', { width: 50, inputMode: 'numeric' })} year time period.
          </p>

          <p style={{ fontSize: 15, color: '#ccc', lineHeight: 2.6, margin: '16px 0 0' }}>
            I will do this by purchasing {inlineInput(propertiesPerYear, 'propertiesPerYear', '3', { width: 50, inputMode: 'numeric' })}{' '}
            <select value={propertyType} onChange={e => setPropertyType(e.target.value)}
              style={{ fontSize: 14, fontWeight: 600, padding: '6px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#eee', verticalAlign: 'middle' }}>
              <option value="properties">properties</option>
              <option value="units">units</option>
            </select>{' '}
            per year with a value of ${inlineInput(propertyValue, 'propertyValue', '200,000', { inputMode: 'numeric' })} using{' '}
            {inlineInput(downPaymentPercent, 'downPaymentPercent', '20', { width: 50, inputMode: 'decimal' })}% as a down payment
            from {inlineInput(downPaymentSource, 'downPaymentSource', 'personal savings', { width: 140 })} and financing{' '}
            {inlineInput(financingPercent, 'financingPercent', '80', { width: 50, inputMode: 'decimal' })}% using{' '}
            <select value={financingType} onChange={e => setFinancingType(e.target.value)}
              style={{ fontSize: 14, fontWeight: 600, padding: '6px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#eee', verticalAlign: 'middle' }}>
              <option value="">Select...</option>
              {FINANCING_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>.
          </p>

          {calcFields.size > 0 && (
            <p style={{ fontSize: 11, color: '#48c78e', marginTop: 12, marginBottom: 0 }}>
              Green values were auto-calculated. You can override them.
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '12px 0 36px' }} />

      {/* ── Section 3: Why Is This Goal Important ── */}
      <div style={sectionGap}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(72,199,142,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>💡</div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Why Is This Goal Important To Me?</h2>
        </div>

        <label style={labelStyle}>
          Why does this financial destination matter to you? <span style={{ color: '#e94560' }}>*</span>
        </label>
        <textarea
          value={whyImportant}
          onChange={e => setWhyImportant(e.target.value)}
          rows={4}
          placeholder="Because I want my kids to see that there's a better way..."
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

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

      {!canProceed && (
        <p style={{ fontSize: 12, color: '#e94560', textAlign: 'center', marginTop: 10 }}>
          {!destination.trim() ? 'Define your destination' : 'Explain why this goal matters'} to continue.
        </p>
      )}
    </div>
  );
}

// ── Step 4: Buy Box Setup ─────────────────────────────────
const PROPERTY_TYPES = ['SFR', 'Duplex', 'Triplex/4-Plex', 'Small Multifamily (5-20 units)', 'Apartments (20+)', 'Commercial', 'Storage', 'Land'];
const STRATEGIES = ['Buy & Hold', 'BRRRR', 'Seller Finance', 'Short-Term Rental', 'Section 8', 'Subto/Wrap'];
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
  const bbReturn = bb.returnRequirements || {};
  const [markets, setMarkets] = useState(bb.markets || []);
  const [marketInput, setMarketInput] = useState('');
  const [zipCodes, setZipCodes] = useState(bb.zipCodes || []);
  const [zipInput, setZipInput] = useState('');
  const [propertyTypes, setPropertyTypes] = useState(bb.propertyTypes || []);
  const [yearBuiltMin, setYearBuiltMin] = useState(bb.yearBuiltMin || '');
  const [yearBuiltMax, setYearBuiltMax] = useState(bb.yearBuiltMax || '');
  const [bedroomsMin, setBedroomsMin] = useState(bb.bedroomsMin || '');
  const [bedroomsMax, setBedroomsMax] = useState(bb.bedroomsMax || '');
  const [bathroomsMin, setBathroomsMin] = useState(bb.bathroomsMin || '');
  const [bathroomsMax, setBathroomsMax] = useState(bb.bathroomsMax || '');
  const [conditionTolerance, setConditionTolerance] = useState(bb.conditionTolerance || '');
  const [priceMin, setPriceMin] = useState(bb.priceMin || '');
  const [priceMax, setPriceMax] = useState(bb.priceMax || '');
  const [downPayment, setDownPayment] = useState(bb.downPayment || '');
  const [strategies, setStrategies] = useState(bb.strategies || []);
  const [financingTypes, setFinancingTypes] = useState(bb.financingTypes || []);
  const [minCashOnCash, setMinCashOnCash] = useState(bbReturn.minCashOnCash || '');
  const [minCapRate, setMinCapRate] = useState(bbReturn.minCapRate || '');
  const [minCashFlowPerUnit, setMinCashFlowPerUnit] = useState(bbReturn.minCashFlowPerUnit || '');
  const [minIRR, setMinIRR] = useState(bbReturn.minIRR || '');
  const [additionalNotes, setAdditionalNotes] = useState(bb.additionalNotes || '');
  const [saving, setSaving] = useState(false);

  const addMarket = () => {
    const trimmed = marketInput.trim();
    if (trimmed && !markets.includes(trimmed)) {
      setMarkets([...markets, trimmed]);
      setMarketInput('');
    }
  };

  const removeMarket = (m) => setMarkets(markets.filter(x => x !== m));

  const addZip = () => {
    const trimmed = zipInput.trim();
    if (trimmed && !zipCodes.includes(trimmed)) {
      setZipCodes([...zipCodes, trimmed]);
      setZipInput('');
    }
  };

  const removeZip = (z) => setZipCodes(zipCodes.filter(x => x !== z));

  const toggleChip = (list, setList, val) => {
    setList(list.includes(val) ? list.filter(x => x !== val) : [...list, val]);
  };

  const hasReturnReq = !!(
    (minCashOnCash && parseFloat(minCashOnCash) > 0) ||
    (minCapRate && parseFloat(minCapRate) > 0) ||
    (minCashFlowPerUnit && parseFloat(minCashFlowPerUnit) > 0) ||
    (minIRR && parseFloat(minIRR) > 0)
  );

  const canProceed = markets.length > 0 && propertyTypes.length > 0 && hasReturnReq;

  const handleNext = async () => {
    if (!canProceed) return;
    setSaving(true);
    await onSave({
      buyBox: {
        markets,
        zipCodes,
        propertyTypes,
        yearBuiltMin: yearBuiltMin ? parseInt(yearBuiltMin) : null,
        yearBuiltMax: yearBuiltMax ? parseInt(yearBuiltMax) : null,
        bedroomsMin: bedroomsMin ? parseInt(bedroomsMin) : null,
        bedroomsMax: bedroomsMax ? parseInt(bedroomsMax) : null,
        bathroomsMin: bathroomsMin ? parseInt(bathroomsMin) : null,
        bathroomsMax: bathroomsMax ? parseInt(bathroomsMax) : null,
        conditionTolerance: conditionTolerance || null,
        priceMin: priceMin || null,
        priceMax: priceMax || null,
        downPayment: downPayment || null,
        strategies,
        financingTypes,
        returnRequirements: {
          minCashOnCash: minCashOnCash ? parseFloat(minCashOnCash) : null,
          minCapRate: minCapRate ? parseFloat(minCapRate) : null,
          minCashFlowPerUnit: minCashFlowPerUnit ? parseFloat(minCashFlowPerUnit) : null,
          minIRR: minIRR ? parseFloat(minIRR) : null,
        },
        additionalNotes: additionalNotes.trim() || '',
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
  const inputStyle = {
    width: '100%', fontSize: 14, padding: '10px 14px', borderRadius: 8,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#eee', fontFamily: "'DM Sans', sans-serif",
  };
  const tagChip = (text, onRemove, color = '233,69,96') => (
    <span key={text} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 10px 5px 12px', borderRadius: 6, fontSize: 13,
      background: `rgba(${color}, 0.1)`, color: `rgb(${color})`, fontWeight: 500,
    }}>
      {text}
      <button onClick={onRemove} style={{
        background: 'none', border: 'none', color: `rgb(${color})`, cursor: 'pointer',
        fontSize: 16, padding: 0, lineHeight: 1, fontFamily: "'DM Sans', sans-serif", opacity: 0.6,
      }}>&times;</button>
    </span>
  );

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
        Define Your Buy Box
      </h1>
      <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
        Set your investment criteria so you're ready to act on Day 1. Keep it focused — you can always refine later.
      </p>

      {/* 1. Target Market(s) */}
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
            style={{ ...inputStyle, flex: 1, width: 'auto' }}
          />
          <button onClick={addMarket} disabled={!marketInput.trim()} style={{
            padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: marketInput.trim() ? 'rgba(233,69,96,0.12)' : 'rgba(255,255,255,0.04)',
            color: marketInput.trim() ? '#e94560' : '#555',
            border: marketInput.trim() ? '1px solid rgba(233,69,96,0.25)' : '1px solid rgba(255,255,255,0.08)',
            cursor: marketInput.trim() ? 'pointer' : 'default', fontFamily: "'DM Sans', sans-serif",
          }}>Add</button>
        </div>
        {markets.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {markets.map(m => tagChip(m, () => removeMarket(m)))}
          </div>
        )}

        <label style={{ ...labelStyle, marginTop: 6, fontSize: 12, color: '#777' }}>
          Specific Zip Codes (optional)
        </label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            value={zipInput}
            onChange={e => setZipInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addZip(); } }}
            placeholder="e.g. 85001"
            inputMode="numeric"
            style={{ ...inputStyle, flex: 1, width: 'auto' }}
          />
          <button onClick={addZip} disabled={!zipInput.trim()} style={{
            padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: zipInput.trim() ? 'rgba(83,52,131,0.12)' : 'rgba(255,255,255,0.04)',
            color: zipInput.trim() ? '#c9a0ff' : '#555',
            border: zipInput.trim() ? '1px solid rgba(83,52,131,0.25)' : '1px solid rgba(255,255,255,0.08)',
            cursor: zipInput.trim() ? 'pointer' : 'default', fontFamily: "'DM Sans', sans-serif",
          }}>Add</button>
        </div>
        {zipCodes.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {zipCodes.map(z => tagChip(z, () => removeZip(z), '83,52,131'))}
          </div>
        )}
      </div>

      {/* 2. Property Type */}
      <div style={sectionGap}>
        <label style={labelStyle}>
          Property Type(s) <span style={{ color: '#e94560' }}>*</span>
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {PROPERTY_TYPES.map(pt => (
            <button key={pt} onClick={() => toggleChip(propertyTypes, setPropertyTypes, pt)}
              style={chipStyle(propertyTypes.includes(pt), '233,69,96')}>
              {pt}
            </button>
          ))}
        </div>

        <label style={{ ...labelStyle, fontSize: 12, color: '#777' }}>Year Built Range (optional)</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Min</span>
            <input value={yearBuiltMin} onChange={e => setYearBuiltMin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="1980" inputMode="numeric" style={inputStyle} />
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Max</span>
            <input value={yearBuiltMax} onChange={e => setYearBuiltMax(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="2020" inputMode="numeric" style={inputStyle} />
          </div>
        </div>

        <label style={{ ...labelStyle, fontSize: 12, color: '#777' }}>Bedrooms</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Min</span>
            <input value={bedroomsMin} onChange={e => setBedroomsMin(e.target.value.replace(/\D/g, ''))}
              placeholder="2" inputMode="numeric" style={inputStyle} />
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Max</span>
            <input value={bedroomsMax} onChange={e => setBedroomsMax(e.target.value.replace(/\D/g, ''))}
              placeholder="4" inputMode="numeric" style={inputStyle} />
          </div>
        </div>

        <label style={{ ...labelStyle, fontSize: 12, color: '#777' }}>Bathrooms</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <span style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Min</span>
            <input value={bathroomsMin} onChange={e => setBathroomsMin(e.target.value.replace(/[^\d.]/g, ''))}
              placeholder="1" inputMode="decimal" style={inputStyle} />
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Max</span>
            <input value={bathroomsMax} onChange={e => setBathroomsMax(e.target.value.replace(/[^\d.]/g, ''))}
              placeholder="3" inputMode="decimal" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* 3. Condition Tolerance */}
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

      {/* 4. Deal Size */}
      <div style={sectionGap}>
        <label style={labelStyle}>Purchase Price Range</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Min ($)</span>
            <input value={priceMin ? formatCurrency(priceMin) : ''} onChange={e => setPriceMin(parseCurrency(e.target.value))}
              placeholder="100,000" inputMode="numeric" style={inputStyle} />
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Max ($)</span>
            <input value={priceMax ? formatCurrency(priceMax) : ''} onChange={e => setPriceMax(parseCurrency(e.target.value))}
              placeholder="300,000" inputMode="numeric" style={inputStyle} />
          </div>
        </div>
        <label style={labelStyle}>Down Payment / Cash Available</label>
        <input value={downPayment ? formatCurrency(downPayment) : ''} onChange={e => setDownPayment(parseCurrency(e.target.value))}
          placeholder="50,000" inputMode="numeric" style={inputStyle} />
      </div>

      {/* 5. Investment Strategy */}
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

      {/* 7. Return Requirements */}
      <div style={sectionGap}>
        <label style={labelStyle}>
          Return Requirements <span style={{ color: '#e94560' }}>*</span>
        </label>
        <p style={{ fontSize: 12, color: hasReturnReq ? '#666' : '#f0a500', marginBottom: 14, marginTop: -2 }}>
          Fill out at least one.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <span style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Minimum Cash-on-Cash Return</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input value={minCashOnCash} onChange={e => setMinCashOnCash(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="8" inputMode="decimal" style={{ ...inputStyle, flex: 1 }} />
              <span style={{ fontSize: 16, color: '#666', fontWeight: 600 }}>%</span>
            </div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Minimum Cap Rate</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input value={minCapRate} onChange={e => setMinCapRate(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="6" inputMode="decimal" style={{ ...inputStyle, flex: 1 }} />
              <span style={{ fontSize: 16, color: '#666', fontWeight: 600 }}>%</span>
            </div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Minimum Cash Flow Per Unit ($/mo)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, color: '#666', fontWeight: 600 }}>$</span>
              <input value={minCashFlowPerUnit} onChange={e => setMinCashFlowPerUnit(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="200" inputMode="decimal" style={{ ...inputStyle, flex: 1 }} />
              <span style={{ fontSize: 12, color: '#555' }}>/mo</span>
            </div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Minimum IRR</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input value={minIRR} onChange={e => setMinIRR(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="15" inputMode="decimal" style={{ ...inputStyle, flex: 1 }} />
              <span style={{ fontSize: 16, color: '#666', fontWeight: 600 }}>%</span>
            </div>
          </div>
        </div>
        {!hasReturnReq && (
          <p style={{ fontSize: 12, color: '#e94560', marginTop: 10, marginBottom: 0 }}>
            Please fill out at least one return requirement.
          </p>
        )}
      </div>

      {/* 8. Additional Notes */}
      <div style={sectionGap}>
        <label style={labelStyle}>Additional Notes</label>
        <p style={{ fontSize: 12, color: '#666', marginBottom: 10, marginTop: -2, lineHeight: 1.6 }}>
          The more specific your buy box is, the more clear you will be when it's time to pull the trigger. Add any additional details to clarify the exact property you're looking for.
        </p>
        <textarea
          value={additionalNotes}
          onChange={e => setAdditionalNotes(e.target.value)}
          rows={4}
          placeholder="Looking for properties near good school districts, prefer corner lots, no HOA..."
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* 9. PDF download card */}
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

      {!canProceed && (
        <p style={{ fontSize: 12, color: '#e94560', textAlign: 'center', marginTop: 10 }}>
          {markets.length === 0 ? 'Add at least one market' : propertyTypes.length === 0 ? 'Select at least one property type' : 'Fill out at least one return requirement'} to continue.
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

// ── Step 6: Declare Your Stakes ──────────────────────────
function StakesDeclarationStep({ onNext, onBack, onSave, existingStakes }) {
  const [text, setText] = useState(existingStakes || '');
  const [saving, setSaving] = useState(false);

  const isValid = text.trim().length >= 20;

  const handleNext = async () => {
    if (!isValid) return;
    setSaving(true);
    await onSave({
      stakesDeclaration: text.trim(),
      stakesDeclarationSetAt: new Date().toISOString(),
    });
    setSaving(false);
    onNext();
  };

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>
        Declare Your Stakes
      </h1>

      <p style={{ color: '#999', fontSize: 15, lineHeight: 1.8, marginBottom: 28 }}>
        What will it cost you — financially, personally, professionally — if you don't
        complete UC30 and don't get a deal under contract?
      </p>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={6}
        style={{
          width: '100%', fontSize: 15, lineHeight: 1.8,
          padding: '16px 18px', borderRadius: 12, resize: 'vertical',
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${text.length > 0 && !isValid ? 'rgba(233,69,96,0.2)' : 'rgba(255,255,255,0.08)'}`,
          color: '#e8e6e3', fontFamily: "'DM Sans', sans-serif",
          minHeight: 160,
        }}
        placeholder="Write honestly — this comes back to you on the tough days..."
      />

      {text.length > 0 && !isValid && (
        <p style={{ fontSize: 12, color: '#e94560', marginTop: 6, marginBottom: 0 }}>
          Keep going — write at least a couple sentences.
        </p>
      )}

      <div style={{
        marginTop: 20, marginBottom: 32, padding: '16px 18px',
        borderRadius: 10, background: 'rgba(255,255,255,0.02)',
        borderLeft: '3px solid rgba(255,255,255,0.06)',
      }}>
        <p style={{ fontSize: 12, color: '#555', marginBottom: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Others have written things like:
        </p>
        {[
          'Another year of paying rent instead of building equity…',
          "My family won't see me take the leap…",
          "I'll still be stuck in my W-2 a year from now…",
        ].map((hint, i) => (
          <p key={i} style={{
            fontSize: 13, color: '#444', fontStyle: 'italic', lineHeight: 1.7,
            margin: 0, padding: '3px 0',
          }}>
            "{hint}"
          </p>
        ))}
      </div>

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

// ── Step 7: Their Why ────────────────────────────────────
function TheirWhyStep({ onNext, onBack, onSave, existingWhy }) {
  const [text, setText] = useState(existingWhy || '');
  const [saving, setSaving] = useState(false);

  const isValid = text.trim().length >= 20;

  const handleNext = async () => {
    if (!isValid) return;
    setSaving(true);
    await onSave({
      theirWhy: text.trim(),
      theirWhySetAt: new Date().toISOString(),
    });
    setSaving(false);
    onNext();
  };

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12, color: '#48c78e' }}>
        What Does This Mean For Your Life?
      </h1>

      <p style={{ color: '#999', fontSize: 15, lineHeight: 1.8, marginBottom: 28 }}>
        What does getting your first deal under contract mean for your life?
      </p>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={6}
        style={{
          width: '100%', fontSize: 15, lineHeight: 1.8,
          padding: '16px 18px', borderRadius: 12, resize: 'vertical',
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${text.length > 0 && !isValid ? 'rgba(72,199,142,0.2)' : 'rgba(255,255,255,0.08)'}`,
          color: '#e8e6e3', fontFamily: "'DM Sans', sans-serif",
          minHeight: 160,
        }}
        placeholder="Write from the heart — this is your fuel for the next 30 days..."
      />

      {text.length > 0 && !isValid && (
        <p style={{ fontSize: 12, color: '#48c78e', marginTop: 6, marginBottom: 0 }}>
          Keep going — write at least a couple sentences.
        </p>
      )}

      <div style={{
        marginTop: 20, marginBottom: 32, padding: '16px 18px',
        borderRadius: 10, background: 'rgba(72,199,142,0.02)',
        borderLeft: '3px solid rgba(72,199,142,0.12)',
      }}>
        <p style={{ fontSize: 12, color: '#555', marginBottom: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Others have written things like:
        </p>
        {[
          'Financial freedom for my family…',
          'Proving to myself I can do this…',
          'Building generational wealth…',
        ].map((hint, i) => (
          <p key={i} style={{
            fontSize: 13, color: '#444', fontStyle: 'italic', lineHeight: 1.7,
            margin: 0, padding: '3px 0',
          }}>
            "{hint}"
          </p>
        ))}
      </div>

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

// ── Step 8: Daily Notification Preferences ───────────────
const TIME_PRESETS = [
  { label: 'Morning', time: '08:00', display: '8 AM' },
  { label: 'Afternoon', time: '12:00', display: '12 PM' },
  { label: 'Evening', time: '18:00', display: '6 PM' },
  { label: 'Night', time: '21:00', display: '9 PM' },
];

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);

function NotificationPrefsStep({ onNext, onBack, onSave, existingPrefs }) {
  const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [selectedTime, setSelectedTime] = useState(existingPrefs?.dailyReminderTime || '18:00');
  const [isCustom, setIsCustom] = useState(() => {
    const saved = existingPrefs?.dailyReminderTime;
    return saved ? !TIME_PRESETS.some(p => p.time === saved) : false;
  });
  const [customHour, setCustomHour] = useState(() => {
    const h = parseInt((existingPrefs?.dailyReminderTime || '18:00').split(':')[0], 10);
    return h === 0 ? 12 : h > 12 ? h - 12 : h;
  });
  const [customPeriod, setCustomPeriod] = useState(() => {
    const h = parseInt((existingPrefs?.dailyReminderTime || '18:00').split(':')[0], 10);
    return h >= 12 ? 'PM' : 'AM';
  });
  const [timezone, setTimezone] = useState(existingPrefs?.timezone || detectedTz);
  const [showTzPicker, setShowTzPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const toTimeString = (hour, period) => {
    let h = hour;
    if (period === 'AM' && h === 12) h = 0;
    if (period === 'PM' && h !== 12) h += 12;
    return `${String(h).padStart(2, '0')}:00`;
  };

  const selectPreset = (time) => {
    setSelectedTime(time);
    setIsCustom(false);
    const h = parseInt(time.split(':')[0], 10);
    setCustomHour(h === 0 ? 12 : h > 12 ? h - 12 : h);
    setCustomPeriod(h >= 12 ? 'PM' : 'AM');
  };

  const enableCustom = () => {
    setIsCustom(true);
    setSelectedTime(toTimeString(customHour, customPeriod));
  };

  const updateCustom = (hour, period) => {
    setCustomHour(hour);
    setCustomPeriod(period);
    setSelectedTime(toTimeString(hour, period));
    setIsCustom(true);
  };

  const handleNext = async () => {
    setSaving(true);
    await onSave({
      notificationPreferences: {
        dailyReminderTime: selectedTime,
        timezone,
        enabled: true,
      },
    });
    setSaving(false);
    onNext();
  };

  const activePreset = TIME_PRESETS.find(p => p.time === selectedTime);
  const selectStyle = {
    fontSize: 16, fontWeight: 600, padding: '10px 14px', borderRadius: 8,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    color: '#eee', fontFamily: "'DM Sans', sans-serif",
    appearance: 'none', WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
    paddingRight: 32, cursor: 'pointer',
  };

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>
        Set Your Daily Reminder
      </h1>

      <p style={{ color: '#999', fontSize: 15, lineHeight: 1.8, marginBottom: 28 }}>
        When do you want to be reminded to complete your daily standards? Pick a time
        that works with your schedule.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {TIME_PRESETS.map(({ label, time, display }) => {
          const isActive = !isCustom && selectedTime === time;
          return (
            <button
              key={time}
              onClick={() => selectPreset(time)}
              style={{
                padding: '16px 14px', borderRadius: 12, cursor: 'pointer',
                textAlign: 'center', transition: 'all 0.15s',
                fontFamily: "'DM Sans', sans-serif",
                background: isActive ? 'rgba(72,199,142,0.08)' : 'rgba(255,255,255,0.03)',
                border: isActive ? '1px solid rgba(72,199,142,0.25)' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{
                fontSize: 18, fontWeight: 700,
                color: isActive ? '#48c78e' : '#ccc',
                transition: 'color 0.15s',
              }}>
                {display}
              </div>
              <div style={{
                fontSize: 12, marginTop: 2,
                color: isActive ? 'rgba(72,199,142,0.7)' : '#666',
              }}>
                {label}
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={enableCustom}
        style={{
          display: 'block', width: '100%', padding: '14px', borderRadius: 12,
          textAlign: 'center', cursor: 'pointer', marginBottom: 20,
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
          transition: 'all 0.15s',
          background: isCustom ? 'rgba(72,199,142,0.08)' : 'rgba(255,255,255,0.03)',
          border: isCustom ? '1px solid rgba(72,199,142,0.25)' : '1px solid rgba(255,255,255,0.08)',
          color: isCustom ? '#48c78e' : '#888',
        }}
      >
        Custom Time
      </button>

      {isCustom && (
        <div style={{
          display: 'flex', gap: 10, justifyContent: 'center',
          marginBottom: 20, alignItems: 'center',
        }}>
          <select
            value={customHour}
            onChange={e => updateCustom(Number(e.target.value), customPeriod)}
            style={selectStyle}
          >
            {HOURS.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          <span style={{ fontSize: 20, color: '#555', fontWeight: 700 }}>:</span>
          <span style={{ fontSize: 16, color: '#888', fontWeight: 600 }}>00</span>
          <select
            value={customPeriod}
            onChange={e => updateCustom(customHour, e.target.value)}
            style={selectStyle}
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      )}

      <div style={{
        padding: '14px 18px', borderRadius: 10, marginBottom: 8,
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <span style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 2 }}>Timezone</span>
          <span style={{ fontSize: 14, color: '#bbb', fontWeight: 500 }}>
            {timezone.replace(/_/g, ' ')}
          </span>
        </div>
        <button
          onClick={() => setShowTzPicker(!showTzPicker)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: '#48c78e', fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", padding: '4px 8px',
          }}
        >
          {showTzPicker ? 'Done' : 'Change'}
        </button>
      </div>

      {showTzPicker && (
        <select
          value={timezone}
          onChange={e => { setTimezone(e.target.value); setShowTzPicker(false); }}
          style={{
            width: '100%', fontSize: 14, padding: '10px 14px', borderRadius: 8,
            marginBottom: 8, background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#eee', fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {[
            'America/New_York', 'America/Chicago', 'America/Denver',
            'America/Los_Angeles', 'America/Phoenix', 'America/Anchorage',
            'Pacific/Honolulu', 'America/Puerto_Rico',
          ].map(tz => (
            <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
          ))}
        </select>
      )}

      <p style={{ fontSize: 13, color: '#555', marginTop: 12, marginBottom: 32 }}>
        You can change this anytime in your settings.
      </p>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-secondary" onClick={onBack} style={{ padding: '14px 24px' }}>
          Back
        </button>
        <button
          className="btn-primary"
          style={{ flex: 1, padding: '14px 24px' }}
          onClick={handleNext}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

// ── Step 9: Commitment Confirmation & Completion ─────────
const CAPITAL_LABELS = {
  cash: 'Cash available',
  hard_money_lender: 'Hard money lender',
  conventional: 'Conventional pre-approval',
  dscr: 'DSCR lender',
  jv_partner: 'JV partner / private money',
  seller_finance: 'Seller financing',
  working_on_it: 'Still working on this',
};

function CommitmentStep({ user, onBack, onSave }) {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const gc = user?.getClear || {};
  const bb = user?.buyBox || {};
  const cap = user?.capitalConfirmation;
  const notifPrefs = user?.notificationPreferences;

  const formatTime = (t) => {
    if (!t) return '';
    const h = parseInt(t.split(':')[0], 10);
    if (h === 0) return '12:00 AM';
    if (h === 12) return '12:00 PM';
    return h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`;
  };

  const handleCommit = async () => {
    setSaving(true);
    await onSave({
      activationCompleted: true,
      activationCompletedAt: new Date().toISOString(),
      commitmentDeclaredAt: new Date().toISOString(),
    });
    setSaving(false);
    setDone(true);
  };

  if (done) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 24px',
          background: 'rgba(72,199,142,0.15)', border: '2px solid rgba(72,199,142,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#48c78e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, color: '#48c78e' }}>
          You're Activated.
        </h1>
        <p style={{ color: '#999', fontSize: 15, lineHeight: 1.8, maxWidth: 400, margin: '0 auto 32px' }}>
          Your operator profile is locked in. When your cohort begins, you'll hit the ground running.
        </p>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 32 }}>
          Loading your dashboard...
        </p>
      </div>
    );
  }

  const summaryRow = (label, value) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <span style={{ fontSize: 13, color: '#777', flexShrink: 0, marginRight: 12 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#ddd', fontWeight: 500, textAlign: 'right' }}>{value || '—'}</span>
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        You're Ready, {user?.firstName || 'Operator'}.
      </h1>
      <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
        Review your setup below. If anything needs changing, use the Back button.
      </p>

      {/* Summary */}
      <div style={{
        padding: '20px 22px', borderRadius: 14, marginBottom: 24,
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {summaryRow('Goal', gc.destination ? (gc.destination.length > 60 ? gc.destination.slice(0, 60) + '...' : gc.destination) : '')}
        {summaryRow('Key Indicator', gc.keyIndicator || '')}
        {summaryRow('Market', (bb.markets || []).join(', '))}
        {summaryRow('Property Types', (bb.propertyTypes || []).join(', '))}
        {summaryRow('Price Range',
          bb.priceMin || bb.priceMax
            ? `$${bb.priceMin ? Number(bb.priceMin).toLocaleString() : '—'} – $${bb.priceMax ? Number(bb.priceMax).toLocaleString() : '—'}`
            : ''
        )}
        {summaryRow('Strategy', (bb.strategies || []).join(', '))}
        {summaryRow('Capital', cap ? CAPITAL_LABELS[cap.type] || cap.type : '')}
        {summaryRow('Offer Commitment', user?.offerCommitment ? `${user.offerCommitment} offers` : '')}
        {summaryRow('Daily Reminder',
          notifPrefs
            ? `${formatTime(notifPrefs.dailyReminderTime)} (${(notifPrefs.timezone || '').replace(/_/g, ' ')})`
            : ''
        )}
      </div>

      {/* Commitment Statement */}
      <div style={{
        padding: '20px 22px', borderRadius: 14, marginBottom: 32,
        background: 'rgba(233,69,96,0.03)', border: '1px solid rgba(233,69,96,0.1)',
      }}>
        <p style={{
          fontSize: 15, color: '#ccc', lineHeight: 1.8, margin: 0, fontStyle: 'italic',
        }}>
          "I commit to completing all daily standards for 30 consecutive days. I understand
          that if I fall behind, I will restart with the next cohort."
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-secondary" onClick={onBack} style={{ padding: '16px 24px' }}>
          Back
        </button>
        <button
          className="btn-primary"
          style={{
            flex: 1, padding: '18px 24px', fontSize: 18, fontWeight: 700,
            letterSpacing: 0.3,
            background: 'linear-gradient(135deg, #e94560, #c81d4e)',
          }}
          onClick={handleCommit}
          disabled={saving}
        >
          {saving ? 'Activating...' : 'I Commit'}
        </button>
      </div>
    </div>
  );
}
