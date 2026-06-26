import { useState } from 'react';

const TOTAL_STEPS = 6;

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
          {step === 2 && <StakesDeclarationStep onNext={goNext} onBack={goBack} onSave={onComplete} existingStakes={user?.stakesDeclaration} />}
          {step === 3 && <TheirWhyStep onNext={goNext} onBack={goBack} onSave={onComplete} existingWhy={user?.theirWhy} />}
          {step === 4 && <DreamLifeStep onNext={goNext} onBack={goBack} onSave={onComplete} existingDreamLife={user?.dreamLife} />}
          {step === 5 && <NotificationPrefsStep onNext={goNext} onBack={goBack} onSave={onComplete} existingPrefs={user?.notificationPreferences} />}
          {step === 6 && <TrainingIntroStep user={user} onBack={goBack} onSave={onComplete} />}
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
        You've made the decision. Now let's lock in your commitment before you start training.
      </p>

      <p style={{
        color: '#666', fontSize: 14, lineHeight: 1.7, maxWidth: 440,
        margin: '0 auto 40px',
      }}>
        Over the next few minutes, you'll define what's at stake, why this matters,
        and set yourself up for the training that will prepare you for UC30.
      </p>

      <div style={{
        padding: '20px 24px', borderRadius: 14,
        background: 'rgba(233,69,96,0.04)', border: '1px solid rgba(233,69,96,0.1)',
        maxWidth: 400, margin: '0 auto 40px', textAlign: 'left',
      }}>
        {[
          'Declare your stakes',
          'Define your why',
          'Describe your dream life',
          'Set your daily reminder',
          'Commit and begin training',
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '7px 0',
            borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.03)' : 'none',
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
        Let's Go
      </button>
    </div>
  );
}

// ── Deferred Steps (used post-training) ──────────────────
// GetClearStep, BuyBoxStep, CapitalConfirmationStep, OfferCommitmentStep
// are kept here for use after training modules are completed.

// ── Get Clear ─────────────────────────────────────
function GetClearStep({ onNext, onBack, onSave, existing, embedded, buyBoxData }) {
  const gc = existing || {};
  const fp = gc.financialPlan || {};
  const bbReturn = (buyBoxData || {}).returnRequirements || {};

  const [destination, setDestination] = useState(gc.destination || '');

  const [yearlyInvestment, setYearlyInvestment] = useState(fp.yearlyInvestment || '');
  const [returnPercent, setReturnPercent] = useState(fp.returnPercent || bbReturn.minCashOnCash || '');
  const [yearlyCashFlow, setYearlyCashFlow] = useState(fp.yearlyCashFlow || '');

  const [whyImportant, setWhyImportant] = useState(gc.whyImportant || '');
  const [saving, setSaving] = useState(false);

  const numOrNull = (v) => { const n = parseFloat(v); return isNaN(n) ? null : n; };

  const computedTimePeriod = (() => {
    const cf = parseFloat(yearlyCashFlow);
    const inv = parseFloat(yearlyInvestment);
    const ret = parseFloat(returnPercent);
    if (!cf || !inv || !ret || inv <= 0 || ret <= 0) return null;
    const years = (cf / inv) / (ret / 100);
    return Math.round(years * 10) / 10;
  })();

  const fmtDollars = (v) => {
    const n = parseFloat(v);
    if (isNaN(n)) return '—';
    return '$' + n.toLocaleString('en-US');
  };

  const canProceed = destination.trim() && whyImportant.trim();

  const handleNext = async () => {
    if (!canProceed) return;
    setSaving(true);
    await onSave({
      getClear: {
        destination: destination.trim(),
        financialPlan: {
          yearlyCashFlow: numOrNull(yearlyCashFlow),
          yearlyInvestment: numOrNull(yearlyInvestment),
          returnPercent: numOrNull(returnPercent),
          timePeriod: computedTimePeriod,
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

  const sectionGap = { marginBottom: 36 };
  const labelStyle = { fontSize: 13, color: '#aaa', fontWeight: 600, display: 'block', marginBottom: 8 };

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

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>How much can I invest yearly?</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: 14, fontWeight: 600 }}>$</span>
            <input
              value={yearlyInvestment}
              onChange={e => setYearlyInvestment(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="150,000"
              inputMode="numeric"
              style={{ ...inputStyle, paddingLeft: 28 }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>What is my minimum desired cash-on-cash return?</label>
          <div style={{ position: 'relative' }}>
            <input
              value={returnPercent}
              onChange={e => setReturnPercent(e.target.value.replace(/[^\d.]/g, ''))}
              placeholder="8"
              inputMode="decimal"
              style={{ ...inputStyle, paddingRight: 28 }}
            />
            <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: 14, fontWeight: 600 }}>%</span>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>How much new cash flow do I want from real estate?</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: 14, fontWeight: 600 }}>$</span>
            <input
              value={yearlyCashFlow}
              onChange={e => setYearlyCashFlow(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="60,000"
              inputMode="numeric"
              style={{ ...inputStyle, paddingLeft: 28 }}
            />
            <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: 13 }}>/year</span>
          </div>
        </div>

        {/* Read-only summary */}
        <div style={{
          padding: '24px 20px', borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(233,69,96,0.04), rgba(240,165,0,0.04))',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f0a500', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            My Financial Plan
          </div>

          <p style={{ fontSize: 15, color: '#ccc', lineHeight: 2.4, margin: 0 }}>
            I want to have{' '}
            <span style={{ fontWeight: 700, color: '#eee' }}>{fmtDollars(yearlyCashFlow)}</span>{' '}
            in yearly cash flow. This will require{' '}
            <span style={{ fontWeight: 700, color: '#eee' }}>{fmtDollars(yearlyInvestment)}</span>{' '}
            to be invested yearly at a{' '}
            <span style={{ fontWeight: 700, color: '#eee' }}>{returnPercent || '—'}%</span>{' '}
            return. This will require a{' '}
            <span style={{ fontWeight: 700, color: computedTimePeriod ? '#48c78e' : '#eee' }}>
              {computedTimePeriod != null ? computedTimePeriod : '—'}
            </span>{' '}
            year time period.
          </p>
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
      {!embedded && (
        <>
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
        </>
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

function BuyBoxStep({ onNext, onBack, onSave, existingBuyBox, embedded }) {
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
      {!embedded && (
        <>
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
        </>
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

function CapitalConfirmationStep({ onNext, onBack, onSave, existingCapital, embedded }) {
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

      {!embedded && (
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
      )}
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

// ── My Dream Life ────────────────────────────────────────
function DreamLifeStep({ onNext, onBack, onSave, existingDreamLife }) {
  const [text, setText] = useState(existingDreamLife || '');
  const [saving, setSaving] = useState(false);

  const isValid = text.trim().length >= 20;

  const handleNext = async () => {
    if (!isValid) return;
    setSaving(true);
    await onSave({
      dreamLife: text.trim(),
      dreamLifeSetAt: new Date().toISOString(),
    });
    setSaving(false);
    onNext();
  };

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12, color: '#f0a500' }}>
        My Dream Life
      </h1>

      <p style={{ color: '#999', fontSize: 15, lineHeight: 1.8, marginBottom: 28 }}>
        Describe in detail the life you want — provided by cash flow from passive income.
      </p>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={8}
        style={{
          width: '100%', fontSize: 15, lineHeight: 1.8,
          padding: '16px 18px', borderRadius: 12, resize: 'vertical',
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${text.length > 0 && !isValid ? 'rgba(240,165,0,0.2)' : 'rgba(255,255,255,0.08)'}`,
          color: '#e8e6e3', fontFamily: "'DM Sans', sans-serif",
          minHeight: 200,
        }}
        placeholder="Where do you live? What does your morning look like? How does your family benefit? What does financial freedom feel like day to day?"
      />

      {text.length > 0 && !isValid && (
        <p style={{ fontSize: 12, color: '#f0a500', marginTop: 6, marginBottom: 0 }}>
          Keep going — paint the full picture.
        </p>
      )}

      <div style={{
        marginTop: 20, marginBottom: 32, padding: '16px 18px',
        borderRadius: 10, background: 'rgba(240,165,0,0.02)',
        borderLeft: '3px solid rgba(240,165,0,0.12)',
      }}>
        <p style={{ fontSize: 12, color: '#555', marginBottom: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Think about:
        </p>
        {[
          'Waking up with no alarm, knowing your properties are generating income...',
          'Taking your family on vacation without worrying about the cost...',
          'Having the freedom to choose how you spend every single day...',
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

// ── Daily Notification Preferences ───────────────
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
        Each day you will be required to complete training and tasks that are going to help
        you get a property under contract in the next 30 days. Pick the time that you want
        to be reminded to complete your daily standards.
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

// ── Training Intro & Commitment ──────────────────────────
function TrainingIntroStep({ user, onBack, onSave }) {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

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
          Let's Start Training.
        </h1>
        <p style={{ color: '#999', fontSize: 15, lineHeight: 1.8, maxWidth: 400, margin: '0 auto 32px' }}>
          Your commitment is locked in. Loading your training modules...
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 16 }}>
        Time to Start Training!
      </h1>

      <p style={{ color: '#999', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
        There is basic information that you need to know in order to complete your daily tasks.
        All of this information is provided in the next 10 modules. Each module has key principles
        and follow-up questions to ensure clarity. These modules were created to give you all the
        information you need to feel completely comfortable analyzing properties, connecting with
        necessary contacts, putting in offers, and getting properties under contract!
      </p>

      <div style={{
        padding: '20px 24px', borderRadius: 14, marginBottom: 20,
        background: 'rgba(233,69,96,0.03)', border: '1px solid rgba(233,69,96,0.1)',
      }}>
        {[
          'Return Metrics & How Investors Profit',
          'Analyzing a Property',
          'Your Buy Box & Your Edge',
          'Financing & Becoming Bankable',
          'Deal Flow & Your Team',
          'Offers, Contracts & Protecting Yourself',
          'Creative Deal Structure',
          'Negotiation & Influence',
          'Seller Problems & Motivation',
          'Seeing Hidden Value',
        ].map((title, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '9px 0',
            borderBottom: i < 9 ? '1px solid rgba(255,255,255,0.03)' : 'none',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6, flexShrink: 0,
              background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: '#e94560', fontWeight: 700,
            }}>
              {i + 1}
            </div>
            <span style={{ fontSize: 14, color: '#bbb' }}>{title}</span>
          </div>
        ))}
      </div>

      <div style={{
        padding: '16px 20px', borderRadius: 12, marginBottom: 24,
        background: 'rgba(240,165,0,0.04)', border: '1px solid rgba(240,165,0,0.12)',
      }}>
        <ul style={{ color: '#bbb', fontSize: 13, lineHeight: 2, margin: 0, paddingLeft: 18 }}>
          <li>Each module should take 30 minutes or less</li>
          <li>Key principles with follow-up questions after each one</li>
          <li>Complete at your own pace — about an hour a day for 5 days, or all at once</li>
          <li>You must finish all modules before Day 1 of UC30</li>
        </ul>
      </div>

      <p style={{
        color: '#ccc', fontSize: 16, lineHeight: 1.8, marginBottom: 32,
        fontWeight: 600, textAlign: 'center',
      }}>
        Commit now to finish all the modules before the first day of UC30!
        Each module should take 30 minutes or less.
      </p>

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

// CAPITAL_LABELS kept for post-training steps
const CAPITAL_LABELS = {
  cash: 'Cash available',
  hard_money_lender: 'Hard money lender',
  conventional: 'Conventional pre-approval',
  dscr: 'DSCR lender',
  jv_partner: 'JV partner / private money',
  seller_finance: 'Seller financing',
  working_on_it: 'Still working on this',
};

export { GetClearStep, BuyBoxStep, CapitalConfirmationStep, OfferCommitmentStep };
