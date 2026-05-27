import { useState, useMemo } from 'react';

const INPUT_STYLE = {
  width: '100%', fontSize: 13, padding: '9px 12px', borderRadius: 8,
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#eee', fontFamily: "'DM Sans', sans-serif",
};

const LABEL_STYLE = { fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 4 };

function fmt(n) {
  if (n === null || n === undefined || isNaN(n)) return '$0';
  return '$' + Math.round(n).toLocaleString();
}

function fmtPct(n) {
  if (n === null || n === undefined || isNaN(n)) return '0%';
  return n.toFixed(1) + '%';
}

function calcMortgage(principal, annualRate, years) {
  if (!principal || principal <= 0 || !annualRate || annualRate <= 0 || !years) return 0;
  const r = annualRate / 100 / 12;
  const n = years * 12;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export default function RentalCalculator({ targetProperties, onSaveAnalysis, onUploadAnalysis, day, metrics, onIncrementProperties }) {
  const [purchasePrice, setPurchasePrice] = useState('');
  const [arv, setArv] = useState('');
  const [downPct, setDownPct] = useState('20');
  const [interestRate, setInterestRate] = useState('7');
  const [loanTerm, setLoanTerm] = useState('30');
  const [closingCosts, setClosingCosts] = useState('');
  const [rehabBudget, setRehabBudget] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [otherIncome, setOtherIncome] = useState('');
  const [propertyTax, setPropertyTax] = useState('');
  const [insurance, setInsurance] = useState('');
  const [hoa, setHoa] = useState('');
  const [vacancyPct, setVacancyPct] = useState('5');
  const [mgmtPct, setMgmtPct] = useState('10');
  const [capexPct, setCapexPct] = useState('5');
  const [otherExpenses, setOtherExpenses] = useState('');

  const [savePropertyId, setSavePropertyId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const p = (v) => { const x = parseFloat(v); return isNaN(x) ? 0 : x; };

  const calc = useMemo(() => {
    const pp = p(purchasePrice);
    const dp = p(downPct) / 100;
    const downAmount = pp * dp;
    const loanAmount = pp - downAmount;
    const monthlyMortgage = calcMortgage(loanAmount, p(interestRate), p(loanTerm));

    const rent = p(monthlyRent);
    const other = p(otherIncome);
    const grossIncome = rent + other;

    const vacancy = grossIncome * (p(vacancyPct) / 100);
    const effectiveIncome = grossIncome - vacancy;

    const tax = p(propertyTax);
    const ins = p(insurance);
    const hoaAmt = p(hoa);
    const mgmt = effectiveIncome * (p(mgmtPct) / 100);
    const capex = effectiveIncome * (p(capexPct) / 100);
    const otherExp = p(otherExpenses);

    const totalOpex = tax + ins + hoaAmt + mgmt + capex + otherExp + vacancy;
    const noi = (grossIncome * 12) - (totalOpex * 12);
    const totalMonthlyExpenses = totalOpex + monthlyMortgage;
    const monthlyCashFlow = effectiveIncome - mgmt - capex - tax - ins - hoaAmt - otherExp - monthlyMortgage;
    const annualCashFlow = monthlyCashFlow * 12;

    const totalCashInvested = downAmount + p(closingCosts) + p(rehabBudget);
    const cashOnCash = totalCashInvested > 0 ? (annualCashFlow / totalCashInvested) * 100 : 0;
    const capRate = pp > 0 ? (noi / pp) * 100 : 0;
    const onePercent = pp > 0 ? (rent / pp) * 100 : 0;
    const dscr = monthlyMortgage > 0 ? (effectiveIncome - mgmt - capex - tax - ins - hoaAmt - otherExp) / monthlyMortgage : 0;

    return {
      downAmount, loanAmount, monthlyMortgage, grossIncome, vacancy,
      effectiveIncome, totalOpex, noi, totalMonthlyExpenses,
      monthlyCashFlow, annualCashFlow, totalCashInvested,
      cashOnCash, capRate, onePercent, dscr, mgmt, capex,
    };
  }, [purchasePrice, downPct, interestRate, loanTerm, closingCosts, rehabBudget,
      monthlyRent, otherIncome, propertyTax, insurance, hoa, vacancyPct, mgmtPct, capexPct, otherExpenses]);

  const isPositiveCashFlow = calc.monthlyCashFlow > 0;
  const meetsOnePercent = calc.onePercent >= 1;

  const buildSummary = () => {
    const lines = [
      `RENTAL PROPERTY ANALYSIS — Day ${day}`,
      `${'─'.repeat(40)}`,
      `Purchase Price: ${fmt(p(purchasePrice))}`,
      arv ? `After Repair Value: ${fmt(p(arv))}` : null,
      `Down Payment: ${downPct}% (${fmt(calc.downAmount)})`,
      `Loan: ${fmt(calc.loanAmount)} @ ${interestRate}% / ${loanTerm}yr`,
      closingCosts ? `Closing Costs: ${fmt(p(closingCosts))}` : null,
      rehabBudget ? `Rehab Budget: ${fmt(p(rehabBudget))}` : null,
      `Total Cash Invested: ${fmt(calc.totalCashInvested)}`,
      '',
      `Monthly Rent: ${fmt(p(monthlyRent))}`,
      otherIncome ? `Other Income: ${fmt(p(otherIncome))}` : null,
      `Vacancy (${vacancyPct}%): -${fmt(calc.vacancy)}`,
      '',
      `MONTHLY EXPENSES`,
      `  Mortgage (P&I): ${fmt(calc.monthlyMortgage)}`,
      `  Property Tax: ${fmt(p(propertyTax))}`,
      `  Insurance: ${fmt(p(insurance))}`,
      hoa ? `  HOA: ${fmt(p(hoa))}` : null,
      `  Management (${mgmtPct}%): ${fmt(calc.mgmt)}`,
      `  CapEx/Repairs (${capexPct}%): ${fmt(calc.capex)}`,
      otherExpenses ? `  Other: ${fmt(p(otherExpenses))}` : null,
      '',
      `${'─'.repeat(40)}`,
      `Monthly Cash Flow: ${fmt(calc.monthlyCashFlow)}`,
      `Annual Cash Flow: ${fmt(calc.annualCashFlow)}`,
      `Cash on Cash Return: ${fmtPct(calc.cashOnCash)}`,
      `Cap Rate: ${fmtPct(calc.capRate)}`,
      `1% Rule: ${fmtPct(calc.onePercent)}`,
      `DSCR: ${calc.dscr.toFixed(2)}`,
    ];
    return lines.filter(Boolean).join('\n');
  };

  const handleSave = async () => {
    if (!savePropertyId) return;
    setSaving(true);
    const summary = buildSummary();
    await onSaveAnalysis(savePropertyId, summary);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setPurchasePrice(''); setArv(''); setDownPct('20'); setInterestRate('7');
    setLoanTerm('30'); setClosingCosts(''); setRehabBudget('');
    setMonthlyRent(''); setOtherIncome(''); setPropertyTax('');
    setInsurance(''); setHoa(''); setVacancyPct('5'); setMgmtPct('10');
    setCapexPct('5'); setOtherExpenses(''); setSavePropertyId(''); setSaved(false);
  };

  const cashFlowColor = calc.monthlyCashFlow >= 0 ? '#48c78e' : '#e94560';

  return (
    <div>
      {/* Results Dashboard — always visible at top */}
      <div style={{
        padding: '16px 18px', marginBottom: 16, borderRadius: 10,
        background: isPositiveCashFlow
          ? 'linear-gradient(135deg, rgba(72,199,142,0.08), rgba(72,199,142,0.02))'
          : 'linear-gradient(135deg, rgba(233,69,96,0.08), rgba(233,69,96,0.02))',
        border: `1px solid ${isPositiveCashFlow ? 'rgba(72,199,142,0.2)' : 'rgba(233,69,96,0.2)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            Monthly Cash Flow
          </div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: cashFlowColor }}>
            {fmt(calc.monthlyCashFlow)}<span style={{ fontSize: 14, color: '#666' }}>/mo</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Annual', value: fmt(calc.annualCashFlow), color: cashFlowColor },
            { label: 'CoC Return', value: fmtPct(calc.cashOnCash), color: calc.cashOnCash >= 8 ? '#48c78e' : calc.cashOnCash >= 5 ? '#f0a500' : '#e94560' },
            { label: 'Cap Rate', value: fmtPct(calc.capRate), color: calc.capRate >= 6 ? '#48c78e' : calc.capRate >= 4 ? '#f0a500' : '#888' },
            { label: '1% Rule', value: fmtPct(calc.onePercent), color: meetsOnePercent ? '#48c78e' : '#f0a500' },
          ].map(m => (
            <div key={m.label} style={{ textAlign: 'center', padding: '8px 4px', borderRadius: 8, background: 'rgba(0,0,0,0.15)' }}>
              <div style={{ fontSize: 10, color: '#666', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{m.label}</div>
              <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {/* Purchase & Financing */}
        <div style={{
          padding: '14px', borderRadius: 10,
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e94560', marginBottom: 12 }}>Purchase & Financing</div>

          <div style={LABEL_STYLE}>Purchase Price</div>
          <input type="text" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="250000" style={{ ...INPUT_STYLE, marginBottom: 8 }} />

          <div style={LABEL_STYLE}>After Repair Value</div>
          <input type="text" value={arv} onChange={e => setArv(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="Optional" style={{ ...INPUT_STYLE, marginBottom: 8 }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
            <div>
              <div style={LABEL_STYLE}>Down Payment %</div>
              <input type="text" value={downPct} onChange={e => setDownPct(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="20" style={INPUT_STYLE} />
            </div>
            <div>
              <div style={LABEL_STYLE}>Interest Rate %</div>
              <input type="text" value={interestRate} onChange={e => setInterestRate(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="7.0" style={INPUT_STYLE} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
            <div>
              <div style={LABEL_STYLE}>Loan Term (yrs)</div>
              <input type="text" value={loanTerm} onChange={e => setLoanTerm(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="30" style={INPUT_STYLE} />
            </div>
            <div>
              <div style={LABEL_STYLE}>Closing Costs</div>
              <input type="text" value={closingCosts} onChange={e => setClosingCosts(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="5000" style={INPUT_STYLE} />
            </div>
          </div>

          <div style={LABEL_STYLE}>Rehab Budget</div>
          <input type="text" value={rehabBudget} onChange={e => setRehabBudget(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="0" style={INPUT_STYLE} />

          <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.15)', fontSize: 11, color: '#888' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span>Down Payment:</span><span style={{ color: '#ccc' }}>{fmt(calc.downAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span>Loan Amount:</span><span style={{ color: '#ccc' }}>{fmt(calc.loanAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span>Monthly P&I:</span><span style={{ color: '#ccc' }}>{fmt(calc.monthlyMortgage)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Cash In:</span><span style={{ color: '#e94560', fontWeight: 600 }}>{fmt(calc.totalCashInvested)}</span>
            </div>
          </div>
        </div>

        {/* Income & Expenses */}
        <div style={{
          padding: '14px', borderRadius: 10,
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#48c78e', marginBottom: 12 }}>Income & Expenses</div>

          <div style={LABEL_STYLE}>Monthly Rent</div>
          <input type="text" value={monthlyRent} onChange={e => setMonthlyRent(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="2000" style={{ ...INPUT_STYLE, marginBottom: 8 }} />

          <div style={LABEL_STYLE}>Other Monthly Income</div>
          <input type="text" value={otherIncome} onChange={e => setOtherIncome(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="0" style={{ ...INPUT_STYLE, marginBottom: 8 }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
            <div>
              <div style={LABEL_STYLE}>Property Tax /mo</div>
              <input type="text" value={propertyTax} onChange={e => setPropertyTax(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="200" style={INPUT_STYLE} />
            </div>
            <div>
              <div style={LABEL_STYLE}>Insurance /mo</div>
              <input type="text" value={insurance} onChange={e => setInsurance(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="100" style={INPUT_STYLE} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
            <div>
              <div style={LABEL_STYLE}>HOA /mo</div>
              <input type="text" value={hoa} onChange={e => setHoa(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="0" style={INPUT_STYLE} />
            </div>
            <div>
              <div style={LABEL_STYLE}>Other Expenses /mo</div>
              <input type="text" value={otherExpenses} onChange={e => setOtherExpenses(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="0" style={INPUT_STYLE} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 8 }}>
            <div>
              <div style={LABEL_STYLE}>Vacancy %</div>
              <input type="text" value={vacancyPct} onChange={e => setVacancyPct(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="5" style={INPUT_STYLE} />
            </div>
            <div>
              <div style={LABEL_STYLE}>Mgmt %</div>
              <input type="text" value={mgmtPct} onChange={e => setMgmtPct(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="10" style={INPUT_STYLE} />
            </div>
            <div>
              <div style={LABEL_STYLE}>CapEx %</div>
              <input type="text" value={capexPct} onChange={e => setCapexPct(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="5" style={INPUT_STYLE} />
            </div>
          </div>

          <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.15)', fontSize: 11, color: '#888' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span>Gross Income:</span><span style={{ color: '#ccc' }}>{fmt(calc.grossIncome)}/mo</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span>Vacancy:</span><span style={{ color: '#e94560' }}>-{fmt(calc.vacancy)}/mo</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span>Operating Expenses:</span><span style={{ color: '#e94560' }}>-{fmt(calc.totalOpex)}/mo</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span>NOI (annual):</span><span style={{ color: '#ccc' }}>{fmt(calc.noi)}/yr</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>DSCR:</span><span style={{ color: calc.dscr >= 1.25 ? '#48c78e' : calc.dscr >= 1 ? '#f0a500' : '#e94560', fontWeight: 600 }}>{calc.dscr.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deal Verdict */}
      {p(purchasePrice) > 0 && p(monthlyRent) > 0 && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 16,
          background: isPositiveCashFlow && meetsOnePercent
            ? 'rgba(72,199,142,0.06)' : isPositiveCashFlow
            ? 'rgba(240,165,0,0.06)' : 'rgba(233,69,96,0.06)',
          border: `1px solid ${isPositiveCashFlow && meetsOnePercent
            ? 'rgba(72,199,142,0.2)' : isPositiveCashFlow
            ? 'rgba(240,165,0,0.2)' : 'rgba(233,69,96,0.2)'}`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: isPositiveCashFlow && meetsOnePercent ? '#48c78e' : isPositiveCashFlow ? '#f0a500' : '#e94560' }}>
            {isPositiveCashFlow && meetsOnePercent ? 'Strong Deal' : isPositiveCashFlow ? 'Marginal Deal' : 'Negative Cash Flow'}
          </div>
          <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>
            {isPositiveCashFlow
              ? `This property cash flows ${fmt(calc.monthlyCashFlow)}/mo with a ${fmtPct(calc.cashOnCash)} cash-on-cash return.`
              : `This property loses ${fmt(Math.abs(calc.monthlyCashFlow))}/mo. Consider negotiating price or finding higher rent.`}
            {!meetsOnePercent && isPositiveCashFlow && ` Doesn't meet the 1% rule (${fmtPct(calc.onePercent)} vs 1% target).`}
            {calc.dscr > 0 && calc.dscr < 1.25 && ` DSCR of ${calc.dscr.toFixed(2)} may not qualify for financing (1.25 typically required).`}
          </div>
        </div>
      )}

      {/* Save to Property + Reset */}
      <div style={{
        padding: '14px 16px', borderRadius: 10,
        background: 'rgba(233,69,96,0.04)', border: '1px solid rgba(233,69,96,0.15)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e94560', marginBottom: 10 }}>
          Save Analysis to a Property
        </div>
        <select value={savePropertyId} onChange={e => setSavePropertyId(e.target.value)}
          style={{ ...INPUT_STYLE, marginBottom: 10, color: '#ccc' }}>
          <option value="">Select target property...</option>
          {(targetProperties || []).map(c => (
            <option key={c.id} value={c.id}>
              {c.name}{c.property ? ` — ${c.property.split('|')[0]}` : ''}
            </option>
          ))}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            disabled={!savePropertyId || !p(purchasePrice) || saving}
            onClick={handleSave}
            style={{
              padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: savePropertyId && p(purchasePrice) ? 'pointer' : 'default',
              fontFamily: "'DM Sans', sans-serif", border: 'none',
              background: savePropertyId && p(purchasePrice) ? 'rgba(233,69,96,0.2)' : 'rgba(255,255,255,0.06)',
              color: savePropertyId && p(purchasePrice) ? '#e94560' : '#555',
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Analysis'}
          </button>
          <button onClick={handleReset}
            style={{
              padding: '9px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#666',
            }}>
            Reset
          </button>
          {saved && (
            <span style={{ fontSize: 12, color: '#48c78e', fontWeight: 600 }}>
              Saved! Properties analyzed +1
            </span>
          )}
        </div>
      </div>

      {/* Upload from CDS App */}
      <UploadAnalysis
        targetProperties={targetProperties}
        onUploadAnalysis={onUploadAnalysis}
        onSaveAnalysis={onSaveAnalysis}
        day={day}
      />
    </div>
  );
}

function UploadAnalysis({ targetProperties, onUploadAnalysis, onSaveAnalysis, day }) {
  const [open, setOpen] = useState(false);
  const [propertyId, setPropertyId] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState('');

  const MAX_SIZE = 10 * 1024 * 1024;

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_SIZE) {
      setError('File must be under 10MB');
      setFile(null);
      return;
    }
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(f.type)) {
      setError('Upload a PDF or image (PNG, JPG, WebP)');
      setFile(null);
      return;
    }
    setError('');
    setFile(f);
  };

  const handleUpload = async () => {
    if (!propertyId || !file) return;
    setUploading(true);
    setError('');
    try {
      if (onUploadAnalysis) {
        const result = await onUploadAnalysis(propertyId, file, day);
        if (!result) { setError('Upload failed — try again'); setUploading(false); return; }
      }
      const contact = (targetProperties || []).find(c => c.id === propertyId);
      const label = file.name;
      await onSaveAnalysis(propertyId, `[Uploaded from CDS Rental Calculator App]\nFile: ${label}\nDate: ${new Date().toLocaleDateString()}\nDay: ${day}`);
      setUploaded(true);
      setFile(null);
      setPropertyId('');
      setTimeout(() => setUploaded(false), 3000);
    } catch (err) {
      setError('Upload failed — try again');
    }
    setUploading(false);
  };

  return (
    <div style={{
      marginTop: 12, borderRadius: 10,
      border: '1px solid rgba(240,165,0,0.2)', overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(240,165,0,0.06)', border: 'none',
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>📄</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f0a500' }}>Upload from CDS App</div>
            <div style={{ fontSize: 11, color: '#888' }}>Import a PDF or screenshot from the CDS Rental Calculator app</div>
          </div>
        </div>
        <span style={{ fontSize: 12, color: '#888', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </button>

      {open && (
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 12, lineHeight: 1.6 }}>
            Ran the analysis on the CDS Rental Calculator app? Export the one-page PDF or take a screenshot and upload it here to attach to a target property.
          </div>

          <select value={propertyId} onChange={e => setPropertyId(e.target.value)}
            style={{
              width: '100%', fontSize: 13, padding: '9px 12px', borderRadius: 8, marginBottom: 10,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#ccc', fontFamily: "'DM Sans', sans-serif",
            }}>
            <option value="">Select target property...</option>
            {(targetProperties || []).map(c => (
              <option key={c.id} value={c.id}>
                {c.name}{c.property ? ` — ${c.property.split('|')[0]}` : ''}
              </option>
            ))}
          </select>

          <label style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px 16px', borderRadius: 8, marginBottom: 10, cursor: 'pointer',
            border: '2px dashed rgba(240,165,0,0.3)', background: 'rgba(240,165,0,0.04)',
            fontSize: 13, color: file ? '#f0a500' : '#888', fontWeight: 600,
            transition: 'border-color 0.2s',
          }}>
            <input type="file" accept=".pdf,image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              style={{ display: 'none' }} />
            {file ? `${file.name} (${(file.size / 1024).toFixed(0)} KB)` : 'Choose PDF or Image...'}
          </label>

          {error && (
            <div style={{ fontSize: 12, color: '#e94560', marginBottom: 10 }}>{error}</div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              disabled={!propertyId || !file || uploading}
              onClick={handleUpload}
              style={{
                padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: propertyId && file ? 'pointer' : 'default',
                fontFamily: "'DM Sans', sans-serif", border: 'none',
                background: propertyId && file ? 'rgba(240,165,0,0.2)' : 'rgba(255,255,255,0.06)',
                color: propertyId && file ? '#f0a500' : '#555',
                opacity: uploading ? 0.5 : 1,
              }}
            >
              {uploading ? 'Uploading...' : 'Upload & Save'}
            </button>
            {uploaded && (
              <span style={{ fontSize: 12, color: '#48c78e', fontWeight: 600 }}>
                Uploaded & saved!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
