import { useState, useMemo } from 'react';

const num = v => parseFloat(v) || 0;
const fmtD = v => `${v < 0 ? '-' : ''}$${Math.abs(Math.round(v)).toLocaleString()}`;
const fmtP = v => `${v.toFixed(2)}%`;
const fmtInput = v => {
  if (!v && v !== 0) return '';
  const s = String(v);
  const parts = s.split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.length > 1 ? `${intPart}.${parts[1]}` : intPart;
};

function calculate(inp) {
  const pp = num(inp.purchase_price);
  const rentReady = num(inp.costs_to_make_rent_ready) * (inp.rent_ready_negative ? -1 : 1);
  const ccPct = num(inp.closing_costs);
  const dpPct = num(inp.down_payment);
  const rate = num(inp.interest_rate);
  const years = num(inp.years_to_payoff) || 30;
  const rents = num(inp.rents);
  const utilIncome = num(inp.utilities_income);
  const vacPct = num(inp.vacancy);
  const maintPct = num(inp.maintenance);
  const mgmtPct = num(inp.management);
  const yearlyUtil = num(inp.yearly_utilities);
  const addlExp = num(inp.additional_expenses);
  const ins = num(inp.insurance);
  const taxes = num(inp.taxes);

  const dpTotal = Math.round(0.01 * dpPct * pp);
  const ccTotal = 0.01 * ccPct * (pp - dpTotal);
  const loanAmt = pp - dpTotal;
  const totalCapital = rentReady + ccTotal + dpTotal;

  const gpi = 12 * (rents + utilIncome);
  const vacLoss = gpi * (-0.01 * vacPct);
  const egi = gpi + vacLoss;

  const maintTotal = -egi * 0.01 * maintPct;
  const mgmtTotal = -egi * 0.01 * mgmtPct;
  const expTotal = maintTotal + mgmtTotal - yearlyUtil - addlExp - ins - taxes;
  const noi = egi + expTotal;

  let payment = 0;
  if (loanAmt > 0 && years > 0) {
    if (rate > 0) {
      const r = 0.01 * rate / 12;
      payment = loanAmt * r / (1 - Math.pow(1 + r, -12 * years));
    } else {
      payment = loanAmt / (12 * years);
    }
  }

  const debtService = -12 * payment;
  const cashFlow = noi + debtService;
  const coc = totalCapital > 0 ? (cashFlow / totalCapital) * 100 : 0;
  const capRate = pp > 0 ? (noi / pp) * 100 : 0;
  const dscr = payment > 0 ? (noi / 12) / payment : 0;

  let bal = loanAmt;
  if (rate > 0 && loanAmt > 0) {
    const r = 0.01 * rate / 12;
    for (let i = 0; i < 12; i++) bal -= (payment - bal * r);
  } else if (loanAmt > 0 && years > 0) {
    bal -= 12 * (loanAmt / (12 * years));
  }
  const princPaydown = loanAmt - bal;
  const totalRoi = totalCapital > 0 ? ((cashFlow + princPaydown) / totalCapital) * 100 : 0;

  return {
    pp, dpTotal, ccTotal, loanAmt, totalCapital, rentReady,
    gpi, vacLoss, egi, maintTotal, mgmtTotal, expTotal,
    noi, payment, debtService, cashFlow, coc, capRate, dscr,
    princPaydown, totalRoi, monthlyCF: cashFlow / 12,
    rate, years, dpPct, ccPct,
  };
}

function solveForRate(inp, targetCoC) {
  const r = calculate(inp);
  if (r.totalCapital <= 0 || r.loanAmt <= 0) return null;
  const targetPmt = (r.noi - (targetCoC / 100) * r.totalCapital) / 12;
  if (targetPmt <= 0) return { value: 0, key: 'interest_rate' };
  let lo = 0, hi = 30;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const rm = 0.01 * mid / 12;
    const pmt = rm > 0
      ? r.loanAmt * rm / (1 - Math.pow(1 + rm, -12 * r.years))
      : r.loanAmt / (12 * r.years);
    if (pmt > targetPmt) hi = mid; else lo = mid;
    if (hi - lo < 0.001) break;
  }
  const result = (lo + hi) / 2;
  return result < 29.9 ? { value: Math.round(result * 100) / 100, key: 'interest_rate' } : null;
}

function solveForPrice(inp, targetCoC) {
  const r = calculate(inp);
  const C = targetCoC / 100;
  const dpF = 0.01 * r.dpPct;
  const ccF = 0.01 * r.ccPct;
  const K = dpF + ccF * (1 - dpF);
  const Lf = 1 - dpF;
  let pmtF = 0;
  if (r.rate > 0 && r.years > 0) {
    const rm = 0.01 * r.rate / 12;
    pmtF = Lf * rm / (1 - Math.pow(1 + rm, -12 * r.years));
  } else if (r.years > 0) {
    pmtF = Lf / (12 * r.years);
  }
  const denom = C * K + 12 * pmtF;
  if (denom <= 0) return null;
  const pp = (r.noi - C * r.rentReady) / denom;
  return pp > 0 ? { value: Math.round(pp), key: 'purchase_price' } : null;
}

function solveForTerm(inp, targetCoC) {
  const r = calculate(inp);
  if (r.loanAmt <= 0) return null;
  const targetPmt = (r.noi - (targetCoC / 100) * r.totalCapital) / 12;
  if (targetPmt <= 0) return null;
  if (r.rate <= 0) {
    const yrs = r.loanAmt / (12 * targetPmt);
    return yrs > 0 && yrs <= 100 ? { value: Math.round(yrs * 10) / 10, key: 'years_to_payoff' } : null;
  }
  const rm = 0.01 * r.rate / 12;
  const ratio = r.loanAmt * rm / targetPmt;
  if (ratio >= 1) return null;
  const yrs = (-Math.log(1 - ratio) / Math.log(1 + rm)) / 12;
  return yrs > 0 && yrs <= 100 ? { value: Math.round(yrs * 10) / 10, key: 'years_to_payoff' } : null;
}

function buildAmortization(loanAmt, rate, years, payment) {
  if (loanAmt <= 0 || years <= 0 || payment <= 0) return [];
  const sched = [];
  let bal = loanAmt;
  const rm = rate > 0 ? 0.01 * rate / 12 : 0;
  for (let y = 1; y <= Math.min(Math.ceil(years), 40); y++) {
    let yInt = 0, yPrinc = 0;
    for (let m = 0; m < 12; m++) {
      if (bal <= 0.01) break;
      const interest = bal * rm;
      const principal = Math.min(payment - interest, bal);
      yInt += interest;
      yPrinc += principal;
      bal = Math.max(0, bal - principal);
    }
    sched.push({ year: y, payment: yInt + yPrinc, interest: yInt, principal: yPrinc, balance: bal });
    if (bal <= 0.01) break;
  }
  return sched;
}

const FIELD_SECTIONS = [
  {
    title: 'PROPERTY & ACQUISITION',
    fields: [
      { key: 'purchase_price', label: 'Purchase Price', prefix: '$' },
      { key: 'costs_to_make_rent_ready', label: 'Costs to Make Rent Ready', prefix: '$', hasNegToggle: true },
      { key: 'closing_costs', label: 'Closing Costs', suffix: '%' },
    ],
  },
  {
    title: 'FINANCING',
    fields: [
      { key: 'down_payment', label: 'Down Payment', suffix: '%' },
      { key: 'interest_rate', label: 'Interest Rate', suffix: '%' },
      { key: 'years_to_payoff', label: 'Years to Payoff', suffix: 'yrs' },
    ],
  },
  {
    title: 'INCOME',
    fields: [
      { key: 'rents', label: 'Monthly Rents', prefix: '$' },
      { key: 'utilities_income', label: 'Monthly Utilities Income', prefix: '$' },
    ],
  },
  {
    title: 'EXPENSES',
    fields: [
      { key: 'vacancy', label: 'Vacancy', suffix: '%' },
      { key: 'maintenance', label: 'Maintenance', suffix: '%' },
      { key: 'management', label: 'Management', suffix: '%' },
      { key: 'yearly_utilities', label: 'Yearly Utilities', prefix: '$' },
      { key: 'additional_expenses', label: 'Additional Expenses', prefix: '$' },
      { key: 'insurance', label: 'Annual Insurance', prefix: '$' },
      { key: 'taxes', label: 'Annual Property Taxes', prefix: '$' },
    ],
  },
];

const SOLVER_OPTIONS = [
  { key: 'interest_rate', label: 'Interest Rate' },
  { key: 'purchase_price', label: 'Purchase Price' },
  { key: 'years_to_payoff', label: 'Loan Term' },
];

const inputBase = {
  width: '100%', padding: '10px 12px', fontSize: 15, borderRadius: 8,
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
  color: '#eee', fontFamily: "'DM Sans', sans-serif", outline: 'none',
  boxSizing: 'border-box',
};

const adornStyle = {
  fontSize: 14, color: '#888', padding: '10px 8px', background: 'rgba(255,255,255,0.04)',
  borderRadius: 0, display: 'flex', alignItems: 'center', flexShrink: 0,
  fontWeight: 600,
};

const DEFAULT_INPUTS = {
  purchase_price: '', costs_to_make_rent_ready: '', rent_ready_negative: false,
  closing_costs: '', down_payment: '', interest_rate: '', years_to_payoff: '30',
  rents: '', utilities_income: '', vacancy: '', maintenance: '', management: '',
  yearly_utilities: '', additional_expenses: '', insurance: '', taxes: '',
};

export default function NativeRentalCalculator() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  // Results stay hidden behind a "Get My Results" CTA until the core inputs
  // (purchase price + rent) are filled in — mirrors the Capital & Strategy Finder.
  const [showResults, setShowResults] = useState(false);
  const [solverOn, setSolverOn] = useState(false);
  const [solveFor, setSolveFor] = useState('interest_rate');
  const [targetCoC, setTargetCoC] = useState('');
  const [showAmort, setShowAmort] = useState(false);
  const [copied, setCopied] = useState(false);

  const update = (key, val) => {
    setInputs(prev => ({ ...prev, [key]: val.replace(/,/g, '').replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1') }));
  };

  const pctHint = (key) => {
    if (r.pp <= 0) return null;
    const hints = {
      closing_costs: r.ccTotal,
      down_payment: r.dpTotal,
      vacancy: Math.abs(r.vacLoss),
      maintenance: Math.abs(r.maintTotal),
      management: Math.abs(r.mgmtTotal),
    };
    return hints[key] != null ? fmtD(hints[key]) : null;
  };

  const solvedValue = useMemo(() => {
    if (!solverOn || !targetCoC) return null;
    const t = parseFloat(targetCoC);
    if (isNaN(t)) return null;
    if (solveFor === 'interest_rate') return solveForRate(inputs, t);
    if (solveFor === 'purchase_price') return solveForPrice(inputs, t);
    if (solveFor === 'years_to_payoff') return solveForTerm(inputs, t);
    return null;
  }, [inputs, solverOn, solveFor, targetCoC]);

  const effectiveInputs = useMemo(() => {
    if (!solvedValue) return inputs;
    return { ...inputs, [solveFor]: String(solvedValue.value) };
  }, [inputs, solvedValue, solveFor]);

  const r = useMemo(() => calculate(effectiveInputs), [effectiveInputs]);
  const amort = useMemo(() => buildAmortization(r.loanAmt, r.rate, r.years, r.payment), [r.loanAmt, r.rate, r.years, r.payment]);

  const applySolved = () => {
    if (!solvedValue) return;
    setInputs(prev => ({ ...prev, [solveFor]: String(solvedValue.value) }));
    setSolverOn(false);
  };

  const copyResults = () => {
    const text = [
      'CDS Rental Property Analysis',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `Purchase Price: ${fmtD(r.pp)}`,
      `Down Payment: ${fmtD(r.dpTotal)} (${r.dpPct}%)`,
      `Closing Costs: ${fmtD(r.ccTotal)}`,
      `Costs to Make Rent Ready: ${fmtD(r.rentReady)}`,
      `Total Capital Required: ${fmtD(r.totalCapital)}`,
      `Loan Amount: ${fmtD(r.loanAmt)}`,
      `Interest Rate: ${r.rate}%`,
      `Term: ${r.years} years`,
      `Monthly Payment: ${fmtD(r.payment)}`,
      '',
      `Gross Potential Income: ${fmtD(r.gpi)}`,
      `Effective Gross Income: ${fmtD(r.egi)}`,
      `Total Expenses: ${fmtD(r.expTotal)}`,
      `Net Operating Income: ${fmtD(r.noi)}`,
      '',
      `Annual Cash Flow: ${fmtD(r.cashFlow)}`,
      `Monthly Cash Flow: ${fmtD(r.monthlyCF)}`,
      '',
      `Cash on Cash Return: ${fmtP(r.coc)}`,
      `Cap Rate: ${fmtP(r.capRate)}`,
      `DSCR: ${r.dscr.toFixed(2)}`,
      `Year 1 Principal Paydown: ${fmtD(r.princPaydown)}`,
      `Total Return: ${fmtP(r.totalRoi)}`,
    ].join('\n');
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasData = r.pp > 0;
  // Core inputs required before the user can pull results.
  const inputsReady = num(inputs.purchase_price) > 0 && num(inputs.rents) > 0;
  const resultsVisible = hasData && showResults;

  const fieldValue = (key) => {
    if (solverOn && solvedValue && key === solveFor) return String(solvedValue.value);
    return inputs[key];
  };

  const isSolving = (key) => solverOn && solvedValue && key === solveFor;

  return (
    <div>
      {/* Quick Summary */}
      {resultsVisible && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Monthly CF', value: fmtD(r.monthlyCF), color: r.monthlyCF >= 0 ? '#48c78e' : '#e94560' },
            { label: 'Cash on Cash', value: fmtP(r.coc), color: r.coc >= 0 ? '#48c78e' : '#e94560' },
            { label: 'Cap Rate', value: fmtP(r.capRate), color: '#ccc' },
          ].map(m => (
            <div key={m.label} style={{
              flex: 1, textAlign: 'center', padding: '14px 6px', borderRadius: 10,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 10, color: '#666', marginTop: 4, letterSpacing: 0.5 }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Input Sections */}
      {FIELD_SECTIONS.map(section => (
        <div key={section.title}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: '#e94560', letterSpacing: 1,
            marginBottom: 10, marginTop: 20,
          }}>
            {section.title}
          </div>
          {section.fields.map(f => {
            const solving = isSolving(f.key);
            const hint = f.suffix === '%' ? pctHint(f.key) : null;
            const rawVal = fieldValue(f.key);
            const displayVal = f.prefix === '$' ? fmtInput(rawVal) : rawVal;
            return (
              <div key={f.key} style={{ marginBottom: 8 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 4,
                }}>
                  <label style={{ fontSize: 12, color: solving ? '#48c78e' : '#888', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {f.label}
                    {solving && <span style={{
                      fontSize: 9, fontWeight: 700, color: '#48c78e',
                      background: 'rgba(72,199,142,0.12)', padding: '2px 6px', borderRadius: 4,
                      letterSpacing: 0.5,
                    }}>AUTO</span>}
                    {hint && <span style={{
                      fontSize: 11, color: '#6b8afd', fontWeight: 600,
                      fontFamily: "'DM Mono', monospace",
                    }}>{hint}</span>}
                  </label>
                  {f.hasNegToggle && (
                    <button
                      onClick={() => setInputs(prev => ({ ...prev, rent_ready_negative: !prev.rent_ready_negative }))}
                      style={{
                        fontSize: 10, color: inputs.rent_ready_negative ? '#e94560' : '#48c78e',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 4, padding: '2px 8px', cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {inputs.rent_ready_negative ? 'Credit (−)' : 'Cost (+)'}
                    </button>
                  )}
                </div>
                <div style={{
                  display: 'flex', borderRadius: 8, overflow: 'hidden',
                  border: `1px solid ${solving ? 'rgba(72,199,142,0.3)' : 'rgba(255,255,255,0.1)'}`,
                }}>
                  {f.prefix && <div style={adornStyle}>{f.prefix}</div>}
                  <input
                    type="text"
                    inputMode="decimal"
                    value={displayVal}
                    onChange={e => !solving && update(f.key, e.target.value)}
                    disabled={solving}
                    placeholder="0"
                    style={{
                      ...inputBase,
                      border: 'none', borderRadius: 0,
                      background: solving ? 'rgba(72,199,142,0.06)' : 'rgba(255,255,255,0.04)',
                      color: solving ? '#48c78e' : '#eee',
                      fontWeight: solving ? 700 : 400,
                    }}
                  />
                  {f.suffix && <div style={adornStyle}>{f.suffix}</div>}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Get My Results CTA — enabled only once the core inputs are filled */}
      {!resultsVisible && (
        <button
          onClick={() => setShowResults(true)}
          disabled={!inputsReady}
          style={{
            width: '100%', marginTop: 28, padding: '15px 24px', borderRadius: 10,
            fontSize: 15, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            border: 'none', cursor: inputsReady ? 'pointer' : 'not-allowed',
            background: inputsReady ? '#e94560' : 'rgba(255,255,255,0.05)',
            color: inputsReady ? '#fff' : '#666',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          {inputsReady ? 'Get My Results →' : 'Enter purchase price & rent to continue'}
        </button>
      )}

      {/* Results */}
      {resultsVisible && (
        <div style={{ marginTop: 24 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: '#e94560', letterSpacing: 1, marginBottom: 12,
          }}>
            RESULTS
          </div>
          <div style={{
            borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>
            {[
              { label: 'Purchase Price', value: fmtD(r.pp) },
              { label: 'Down Payment', value: fmtD(r.dpTotal), sub: `${r.dpPct}%` },
              { label: 'Closing Costs', value: fmtD(r.ccTotal) },
              { label: 'Costs to Make Rent Ready', value: fmtD(r.rentReady) },
              { label: 'Total Capital Required', value: fmtD(r.totalCapital), bold: true },
              { label: 'Loan Amount', value: fmtD(r.loanAmt) },
              { label: 'Monthly Payment', value: fmtD(r.payment) },
              { divider: true },
              { label: 'Gross Potential Income', value: fmtD(r.gpi) },
              { label: 'Vacancy Loss', value: fmtD(r.vacLoss) },
              { label: 'Effective Gross Income', value: fmtD(r.egi) },
              { label: 'Maintenance', value: fmtD(r.maintTotal) },
              { label: 'Management', value: fmtD(r.mgmtTotal) },
              { label: 'Total Expenses', value: fmtD(r.expTotal) },
              { label: 'Net Operating Income', value: fmtD(r.noi), bold: true },
              { divider: true },
              { label: 'Annual Debt Service', value: fmtD(r.debtService) },
              { label: 'Annual Cash Flow', value: fmtD(r.cashFlow), color: r.cashFlow >= 0 ? '#48c78e' : '#e94560', bold: true },
              { label: 'Monthly Cash Flow', value: fmtD(r.monthlyCF), color: r.monthlyCF >= 0 ? '#48c78e' : '#e94560' },
              { divider: true },
              { label: 'Cash on Cash Return', value: fmtP(r.coc), color: r.coc >= 0 ? '#48c78e' : '#e94560', bold: true },
              { label: 'Cap Rate', value: fmtP(r.capRate) },
              { label: 'DSCR', value: r.dscr.toFixed(2) },
              { label: 'Year 1 Principal Paydown', value: fmtD(r.princPaydown) },
              { label: 'Total Return on Investment', value: fmtP(r.totalRoi), color: r.totalRoi >= 0 ? '#48c78e' : '#e94560' },
            ].map((row, i) => {
              if (row.divider) return (
                <div key={i} style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
              );
              return (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 14px', fontSize: 13,
                  background: row.bold ? 'rgba(255,255,255,0.02)' : 'transparent',
                }}>
                  <span style={{ color: '#999', fontWeight: row.bold ? 600 : 400 }}>{row.label}</span>
                  <span style={{
                    color: row.color || '#eee',
                    fontWeight: row.bold ? 700 : 500,
                    fontFamily: "'DM Mono', monospace",
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {row.value}
                    {row.sub && <span style={{ fontSize: 11, color: '#666' }}>({row.sub})</span>}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={copyResults} style={{
              flex: 1, padding: '10px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: copied ? 'rgba(72,199,142,0.15)' : 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)', color: copied ? '#48c78e' : '#888',
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>
              {copied ? 'Copied!' : 'Copy Results'}
            </button>
            <button onClick={() => { setInputs(DEFAULT_INPUTS); setSolverOn(false); setTargetCoC(''); setShowResults(false); }} style={{
              padding: '10px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Seller Finance Solver */}
      <div style={{
        marginTop: 24, borderRadius: 12, overflow: 'hidden',
        border: `1px solid ${solverOn ? 'rgba(201,160,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
        background: solverOn ? 'rgba(201,160,255,0.03)' : 'rgba(255,255,255,0.02)',
      }}>
          <button
            onClick={() => setSolverOn(!solverOn)}
            style={{
              width: '100%', padding: '14px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: solverOn ? 'rgba(201,160,255,0.15)' : 'rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>⚡</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: solverOn ? '#c9a0ff' : '#ccc' }}>
                  Seller Finance Solver
                </div>
                <div style={{ fontSize: 11, color: '#666' }}>
                  Auto-adjust terms to hit your target return
                </div>
              </div>
            </div>
            <div style={{
              width: 40, height: 22, borderRadius: 11, padding: 2,
              background: solverOn ? '#c9a0ff' : 'rgba(255,255,255,0.1)',
              transition: 'background 0.2s', display: 'flex',
              justifyContent: solverOn ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 9,
                background: solverOn ? '#fff' : '#666',
                transition: 'background 0.2s',
              }} />
            </div>
          </button>

          {solverOn && (
            <div style={{ padding: '0 16px 16px' }}>
              {!hasData ? (
                <div style={{
                  padding: '14px 16px', borderRadius: 10,
                  background: 'rgba(201,160,255,0.06)', border: '1px solid rgba(201,160,255,0.15)',
                  fontSize: 13, color: '#888', lineHeight: 1.6,
                }}>
                  Enter property data above first. Once you have a purchase price, rents, and financing details, the solver will auto-calculate deal structures that hit your target return.
                </div>
              ) : (<>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: '#c9a0ff', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Target Cash on Cash Return
                </label>
                <div style={{
                  display: 'flex', borderRadius: 8, overflow: 'hidden',
                  border: '1px solid rgba(201,160,255,0.3)',
                }}>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={targetCoC}
                    onChange={e => setTargetCoC(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'))}
                    placeholder="e.g. 10"
                    style={{
                      ...inputBase, border: 'none', borderRadius: 0,
                      background: 'rgba(201,160,255,0.06)', color: '#c9a0ff', fontWeight: 600,
                    }}
                  />
                  <div style={{ ...adornStyle, color: '#c9a0ff' }}>%</div>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Solve for
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {SOLVER_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setSolveFor(opt.key)}
                      style={{
                        flex: 1, padding: '8px 6px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                        background: solveFor === opt.key ? 'rgba(201,160,255,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${solveFor === opt.key ? 'rgba(201,160,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                        color: solveFor === opt.key ? '#c9a0ff' : '#888',
                        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {targetCoC && (
                <div style={{
                  padding: '14px 16px', borderRadius: 10,
                  background: solvedValue ? 'rgba(72,199,142,0.06)' : 'rgba(233,69,96,0.06)',
                  border: `1px solid ${solvedValue ? 'rgba(72,199,142,0.2)' : 'rgba(233,69,96,0.2)'}`,
                }}>
                  {solvedValue ? (
                    <>
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>
                        To achieve <span style={{ color: '#c9a0ff', fontWeight: 700 }}>{targetCoC}% CoC</span>:
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#48c78e', marginBottom: 4 }}>
                        {solveFor === 'purchase_price' && fmtD(solvedValue.value)}
                        {solveFor === 'interest_rate' && `${solvedValue.value}%`}
                        {solveFor === 'years_to_payoff' && `${solvedValue.value} years`}
                      </div>
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
                        {SOLVER_OPTIONS.find(o => o.key === solveFor)?.label}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={applySolved} style={{
                          padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                          background: 'rgba(72,199,142,0.15)', border: '1px solid rgba(72,199,142,0.3)',
                          color: '#48c78e', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                        }}>
                          Lock Value & Close
                        </button>
                      </div>
                      <div style={{ fontSize: 11, color: '#666', marginTop: 10, lineHeight: 1.5 }}>
                        The {SOLVER_OPTIONS.find(o => o.key === solveFor)?.label.toLowerCase()} input above is auto-adjusting in real time.
                        Change any other input and watch it recalculate.
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 13, color: '#e94560' }}>
                      No solution found — the target CoC may not be achievable with current inputs.
                      Try adjusting other values or changing which variable to solve for.
                    </div>
                  )}
                </div>
              )}
              </>)}
            </div>
          )}
        </div>

      {/* Amortization Schedule */}
      {hasData && r.payment > 0 && (
        <div style={{ marginTop: 24 }}>
          <button
            onClick={() => setShowAmort(!showAmort)}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: '#ccc' }}>Amortization Schedule</span>
            <span style={{
              fontSize: 12, color: '#888', transition: 'transform 0.2s',
              transform: showAmort ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>▼</span>
          </button>
          {showAmort && (
            <div style={{ overflowX: 'auto', marginTop: 8, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {['Year', 'Payment', 'Interest', 'Principal', 'Balance'].map(h => (
                      <th key={h} style={{
                        padding: '8px 10px', textAlign: 'right', color: '#888', fontWeight: 600,
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {amort.map(row => (
                    <tr key={row.year} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '6px 10px', textAlign: 'right', color: '#888' }}>{row.year}</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', color: '#ccc' }}>{fmtD(row.payment)}</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', color: '#e94560' }}>{fmtD(row.interest)}</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', color: '#48c78e' }}>{fmtD(row.principal)}</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', color: '#ccc' }}>{fmtD(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
