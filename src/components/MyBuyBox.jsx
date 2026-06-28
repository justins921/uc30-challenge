import { useState } from 'react';
import {
  BUYER_STRENGTHS, TIME_TO_CLOSE_OPTIONS, URGENCY_OPTIONS, DEAL_BREAKERS,
  buildBuyBoxSummary, generateBuyBoxPDF,
} from '../utils/buyBox';

function fmt$(val) {
  if (!val && val !== 0) return null;
  return '$' + Number(val).toLocaleString('en-US');
}

function range(min, max, sep = '–') {
  if (min && max) return `${min}${sep}${max}`;
  if (min) return `${min}+`;
  if (max) return `up to ${max}`;
  return null;
}

function Section({ title, children }) {
  if (!children) return null;
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase',
        letterSpacing: 1, marginBottom: 8, paddingBottom: 6,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Value({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0' }}>
      <span style={{ fontSize: 13, color: '#888' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#eee' }}>{value}</span>
    </div>
  );
}

function ChipList({ items, color = '#e94560' }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
      {items.map(item => (
        <span key={item} style={{
          padding: '5px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500,
          background: `${color}15`, color, border: `1px solid ${color}30`,
        }}>
          {item}
        </span>
      ))}
    </div>
  );
}

const PROPERTY_TYPES = ['Single Family', 'Multi-Family (2-4)', 'Multi-Family (5+)', 'Condo/Townhouse', 'Mobile Home', 'Land'];
const STRATEGIES = ['Buy & Hold', 'BRRRR', 'Fix & Flip', 'Wholesale', 'Short-Term Rental', 'Section 8', 'Seller Finance', 'Subject-To'];
const FINANCING = ['Conventional', 'FHA', 'VA', 'DSCR', 'Hard Money', 'Private Money', 'Seller Financing', 'Cash', 'Portfolio Loan'];
const CONDITIONS = ['Turn-key only', 'Light rehab', 'Moderate rehab', 'Heavy rehab / gut'];

function parseCurrency(str) {
  const num = parseInt(String(str).replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? '' : num;
}

function EditableChipList({ items, setItems, options, color = '#e94560', allowCustom = false, customPlaceholder = 'Add custom...' }) {
  const [customInput, setCustomInput] = useState('');
  const toggle = (val) => setItems(items.includes(val) ? items.filter(x => x !== val) : [...items, val]);
  const addCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !items.includes(trimmed)) {
      setItems([...items, trimmed]);
      setCustomInput('');
    }
  };
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {options.map(opt => (
          <button key={opt} onClick={() => toggle(opt)} style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", border: 'none',
            background: items.includes(opt) ? `${color}25` : 'rgba(255,255,255,0.04)',
            color: items.includes(opt) ? color : '#888',
          }}>{opt}</button>
        ))}
      </div>
      {allowCustom && (
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <input placeholder={customPlaceholder} value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
            style={{ flex: 1, fontSize: 12, padding: '8px 10px' }} />
          <button onClick={addCustom} style={{
            padding: '8px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", border: 'none',
            background: `${color}15`, color,
          }}>Add</button>
        </div>
      )}
      {items.filter(i => !options.includes(i)).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
          {items.filter(i => !options.includes(i)).map(i => (
            <span key={i} onClick={() => toggle(i)} style={{
              padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
              background: `${color}25`, color, fontWeight: 600,
            }}>{i} ✕</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyBuyBox({ user, onUpdateUser }) {
  const bb = user?.buyBox || {};
  const ret = bb.returnRequirements || {};
  const isEmpty = !bb.markets?.length && !bb.propertyTypes?.length;

  const [editing, setEditing] = useState(isEmpty && !!onUpdateUser);
  const [saving, setSaving] = useState(false);

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
  const [strategies, setStrategies] = useState(bb.strategies || []);
  const [financingTypes, setFinancingTypes] = useState(bb.financingTypes || []);
  const [minCashOnCash, setMinCashOnCash] = useState(ret.minCashOnCash || '');
  const [minCapRate, setMinCapRate] = useState(ret.minCapRate || '');
  const [minCashFlowPerUnit, setMinCashFlowPerUnit] = useState(ret.minCashFlowPerUnit || '');
  const [dealBreakers, setDealBreakers] = useState(bb.dealBreakers || []);
  const [additionalNotes, setAdditionalNotes] = useState(bb.additionalNotes || '');
  // Investor Profile
  const ip0 = bb.investorProfile || {};
  const [fullName, setFullName] = useState(ip0.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '');
  const [phone, setPhone] = useState(ip0.phone || '');
  const [email, setEmail] = useState(ip0.email || user?.email || '');
  const [strengths, setStrengths] = useState(ip0.strengths || []);
  const [timeToClose, setTimeToClose] = useState(ip0.timeToClose || '');
  const [urgency, setUrgency] = useState(ip0.urgency || []);
  const [urgencyDetails, setUrgencyDetails] = useState(ip0.urgencyDetails || {});

  const addMarket = () => {
    const trimmed = marketInput.trim();
    if (trimmed && !markets.includes(trimmed)) { setMarkets([...markets, trimmed]); setMarketInput(''); }
  };
  const addZip = () => {
    const trimmed = zipInput.trim();
    if (trimmed && !zipCodes.includes(trimmed)) { setZipCodes([...zipCodes, trimmed]); setZipInput(''); }
  };

  const resetToSaved = () => {
    const s = user?.buyBox || {};
    const r = s.returnRequirements || {};
    const ipS = s.investorProfile || {};
    setMarkets(s.markets || []); setZipCodes(s.zipCodes || []);
    setPropertyTypes(s.propertyTypes || []);
    setYearBuiltMin(s.yearBuiltMin || ''); setYearBuiltMax(s.yearBuiltMax || '');
    setBedroomsMin(s.bedroomsMin || ''); setBedroomsMax(s.bedroomsMax || '');
    setBathroomsMin(s.bathroomsMin || ''); setBathroomsMax(s.bathroomsMax || '');
    setConditionTolerance(s.conditionTolerance || '');
    setPriceMin(s.priceMin || ''); setPriceMax(s.priceMax || '');
    setStrategies(s.strategies || []); setFinancingTypes(s.financingTypes || []);
    setMinCashOnCash(r.minCashOnCash || ''); setMinCapRate(r.minCapRate || '');
    setMinCashFlowPerUnit(r.minCashFlowPerUnit || '');
    setDealBreakers(s.dealBreakers || []);
    setAdditionalNotes(s.additionalNotes || '');
    setFullName(ipS.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '');
    setPhone(ipS.phone || ''); setEmail(ipS.email || user?.email || '');
    setStrengths(ipS.strengths || []); setTimeToClose(ipS.timeToClose || '');
    setUrgency(ipS.urgency || []); setUrgencyDetails(ipS.urgencyDetails || {});
    setEditing(false);
  };

  const handleSave = async () => {
    if (!onUpdateUser) return;
    setSaving(true);
    await onUpdateUser({
      buyBox: {
        investorProfile: {
          fullName: fullName.trim(), phone: phone.trim(), email: email.trim(),
          strengths, timeToClose: timeToClose || null, urgency, urgencyDetails,
        },
        markets, zipCodes, propertyTypes,
        yearBuiltMin: yearBuiltMin ? parseInt(yearBuiltMin) : null,
        yearBuiltMax: yearBuiltMax ? parseInt(yearBuiltMax) : null,
        bedroomsMin: bedroomsMin ? parseInt(bedroomsMin) : null,
        bedroomsMax: bedroomsMax ? parseInt(bedroomsMax) : null,
        bathroomsMin: bathroomsMin ? parseInt(bathroomsMin) : null,
        bathroomsMax: bathroomsMax ? parseInt(bathroomsMax) : null,
        conditionTolerance: conditionTolerance || null,
        priceMin: priceMin || null, priceMax: priceMax || null,
        strategies, financingTypes,
        returnRequirements: {
          minCashOnCash: minCashOnCash ? parseFloat(minCashOnCash) : null,
          minCapRate: minCapRate ? parseFloat(minCapRate) : null,
          minCashFlowPerUnit: minCashFlowPerUnit ? parseFloat(minCashFlowPerUnit) : null,
        },
        dealBreakers,
        additionalNotes: additionalNotes || null,
      },
    });
    setSaving(false);
    setEditing(false);
  };

  if (isEmpty && !editing) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Buy Box Yet</h3>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 16 }}>
          Complete the activation phase to set up your buy box, or create one now.
        </p>
        {onUpdateUser && (
          <button className="btn-primary" onClick={() => setEditing(true)} style={{ padding: '10px 24px', fontSize: 13 }}>
            Create Buy Box
          </button>
        )}
      </div>
    );
  }

  if (editing) {
    return (
      <div className="fade-up">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Edit Buy Box</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={resetToSaved} style={{
              padding: '10px 20px', fontSize: 13, borderRadius: 8, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent', color: '#888',
            }}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}
              style={{ padding: '10px 20px', fontSize: 13, opacity: saving ? 0.5 : 1 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <Section title="Investor Profile *">
            <p style={{ fontSize: 12, color: '#666', marginTop: -2, marginBottom: 10, lineHeight: 1.6 }}>
              Leads your Buy Box PDF — makes you look credible so agents and wholesalers bring you deals.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              <div style={{ flex: '1 0 100%' }}>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Full Name *</div>
                <input placeholder="Jordan Lee" value={fullName} onChange={e => setFullName(e.target.value)}
                  style={{ width: '100%', fontSize: 13, padding: '8px 10px' }} />
              </div>
              <div style={{ flex: '1 0 140px' }}>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Phone *</div>
                <input placeholder="(555) 123-4567" value={phone} onChange={e => setPhone(e.target.value)}
                  style={{ width: '100%', fontSize: 13, padding: '8px 10px' }} />
              </div>
              <div style={{ flex: '1 0 140px' }}>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Email *</div>
                <input placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', fontSize: 13, padding: '8px 10px' }} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Buyer Strengths</div>
            <EditableChipList items={strengths} setItems={setStrengths} options={BUYER_STRENGTHS} color="#48c78e" allowCustom customPlaceholder="+ Add your own strength" />
            <div style={{ fontSize: 11, color: '#666', margin: '12px 0 4px' }}>Time to Close</div>
            <select value={timeToClose} onChange={e => setTimeToClose(e.target.value)}
              style={{ width: '100%', fontSize: 13, padding: '8px 10px', cursor: 'pointer' }}>
              <option value="">Select…</option>
              {TIME_TO_CLOSE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <div style={{ fontSize: 11, color: '#666', margin: '12px 0 4px' }}>Urgency / Deadline</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {URGENCY_OPTIONS.map(o => {
                const sel = urgency.includes(o.label);
                return (
                  <div key={o.label}>
                    <button onClick={() => setUrgency(sel ? urgency.filter(x => x !== o.label) : [...urgency, o.label])} style={{
                      width: '100%', textAlign: 'left', padding: '7px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif", border: 'none',
                      background: sel ? 'rgba(240,165,0,0.2)' : 'rgba(255,255,255,0.04)', color: sel ? '#f0a500' : '#888',
                    }}>{o.label}{o.reveal ? ' …' : ''}</button>
                    {sel && o.reveal && (
                      <input type={o.reveal === 'date' ? 'date' : 'text'} value={urgencyDetails[o.label] || ''}
                        onChange={e => setUrgencyDetails({ ...urgencyDetails, [o.label]: e.target.value })}
                        placeholder={o.reveal === 'text' ? 'e.g. end of Q3, 60 days…' : ''}
                        style={{ width: '100%', fontSize: 13, padding: '8px 10px', marginTop: 4 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="Target Markets *">
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <input placeholder="Add a market (city, county, etc.)" value={marketInput}
                onChange={e => setMarketInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addMarket()}
                style={{ flex: 1, fontSize: 13, padding: '10px 12px' }} />
              <button onClick={addMarket} style={{
                padding: '10px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", border: 'none',
                background: 'rgba(233,69,96,0.15)', color: '#e94560',
              }}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {markets.map(m => (
                <span key={m} onClick={() => setMarkets(markets.filter(x => x !== m))} style={{
                  padding: '5px 12px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
                  background: 'rgba(233,69,96,0.15)', color: '#e94560', fontWeight: 500,
                }}>{m} ✕</span>
              ))}
            </div>
          </Section>

          <Section title="Zip Codes">
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <input placeholder="Add zip code" value={zipInput}
                onChange={e => setZipInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addZip()}
                style={{ flex: 1, fontSize: 13, padding: '10px 12px' }} />
              <button onClick={addZip} style={{
                padding: '10px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", border: 'none',
                background: 'rgba(131,52,131,0.15)', color: '#9b59b6',
              }}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {zipCodes.map(z => (
                <span key={z} onClick={() => setZipCodes(zipCodes.filter(x => x !== z))} style={{
                  padding: '5px 12px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
                  background: 'rgba(131,52,131,0.15)', color: '#9b59b6', fontWeight: 500,
                }}>{z} ✕</span>
              ))}
            </div>
          </Section>

          <Section title="Property Types *">
            <EditableChipList items={propertyTypes} setItems={setPropertyTypes} options={PROPERTY_TYPES} />
          </Section>

          <Section title="Property Details">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
              <div style={{ flex: '1 0 140px' }}>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Year Built Range</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input placeholder="Min" value={yearBuiltMin} onChange={e => setYearBuiltMin(e.target.value)}
                    style={{ width: 80, fontSize: 13, padding: '8px 10px' }} />
                  <span style={{ color: '#555' }}>–</span>
                  <input placeholder="Max" value={yearBuiltMax} onChange={e => setYearBuiltMax(e.target.value)}
                    style={{ width: 80, fontSize: 13, padding: '8px 10px' }} />
                </div>
              </div>
              <div style={{ flex: '1 0 140px' }}>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Bedrooms</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input placeholder="Min" value={bedroomsMin} onChange={e => setBedroomsMin(e.target.value)}
                    style={{ width: 60, fontSize: 13, padding: '8px 10px' }} />
                  <span style={{ color: '#555' }}>–</span>
                  <input placeholder="Max" value={bedroomsMax} onChange={e => setBedroomsMax(e.target.value)}
                    style={{ width: 60, fontSize: 13, padding: '8px 10px' }} />
                </div>
              </div>
              <div style={{ flex: '1 0 140px' }}>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Bathrooms</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input placeholder="Min" value={bathroomsMin} onChange={e => setBathroomsMin(e.target.value)}
                    style={{ width: 60, fontSize: 13, padding: '8px 10px' }} />
                  <span style={{ color: '#555' }}>–</span>
                  <input placeholder="Max" value={bathroomsMax} onChange={e => setBathroomsMax(e.target.value)}
                    style={{ width: 60, fontSize: 13, padding: '8px 10px' }} />
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Condition Tolerance</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {CONDITIONS.map(c => (
                  <button key={c} onClick={() => setConditionTolerance(conditionTolerance === c ? '' : c)} style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", border: 'none',
                    background: conditionTolerance === c ? 'rgba(240,165,0,0.2)' : 'rgba(255,255,255,0.04)',
                    color: conditionTolerance === c ? '#f0a500' : '#888',
                  }}>{c}</button>
                ))}
              </div>
            </div>
          </Section>

          <Section title="Target Purchase Price">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ flex: '1 0 120px' }}>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Price Min</div>
                <input placeholder="$0" value={priceMin ? fmt$(priceMin) : ''}
                  onChange={e => setPriceMin(parseCurrency(e.target.value))}
                  style={{ width: '100%', fontSize: 13, padding: '8px 10px' }} />
              </div>
              <div style={{ flex: '1 0 120px' }}>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Price Max</div>
                <input placeholder="$0" value={priceMax ? fmt$(priceMax) : ''}
                  onChange={e => setPriceMax(parseCurrency(e.target.value))}
                  style={{ width: '100%', fontSize: 13, padding: '8px 10px' }} />
              </div>
            </div>
          </Section>

          <Section title="Investment Strategy">
            <EditableChipList items={strategies} setItems={setStrategies} options={STRATEGIES} color="#f0a500" />
          </Section>

          <Section title="Financing">
            <EditableChipList items={financingTypes} setItems={setFinancingTypes} options={FINANCING} color="#48c78e" />
          </Section>

          <Section title="Return Requirements *">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ flex: '1 0 120px' }}>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Min Cash-on-Cash %</div>
                <input type="number" placeholder="0" value={minCashOnCash} onChange={e => setMinCashOnCash(e.target.value)}
                  style={{ width: '100%', fontSize: 13, padding: '8px 10px' }} />
              </div>
              <div style={{ flex: '1 0 120px' }}>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Min Cap Rate %</div>
                <input type="number" placeholder="0" value={minCapRate} onChange={e => setMinCapRate(e.target.value)}
                  style={{ width: '100%', fontSize: 13, padding: '8px 10px' }} />
              </div>
              <div style={{ flex: '1 0 120px' }}>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Min Cash Flow/Unit $/mo</div>
                <input type="number" placeholder="0" value={minCashFlowPerUnit} onChange={e => setMinCashFlowPerUnit(e.target.value)}
                  style={{ width: '100%', fontSize: 13, padding: '8px 10px' }} />
              </div>
            </div>
          </Section>

          <Section title="Deal-Breakers / Areas to Avoid">
            <p style={{ fontSize: 12, color: '#666', marginTop: -2, marginBottom: 8, lineHeight: 1.6 }}>
              One of the most useful fields for whoever sources your deals — it saves everyone time.
            </p>
            <EditableChipList items={dealBreakers} setItems={setDealBreakers} options={DEAL_BREAKERS} color="#e94560" allowCustom customPlaceholder="+ Add your own (streets, zips, etc.)" />
          </Section>

          <Section title="Additional Notes">
            <textarea placeholder="Any other criteria or notes..." value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)} rows={3}
              style={{ width: '100%', fontSize: 13, padding: '10px 12px', resize: 'vertical' }} />
          </Section>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={resetToSaved} style={{
            padding: '12px 24px', fontSize: 13, borderRadius: 8, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: '#888',
          }}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}
            style={{ padding: '12px 24px', fontSize: 13, opacity: saving ? 0.5 : 1 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>My Buy Box</h2>
          <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
            {user.firstName} {user.lastName}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {onUpdateUser && (
            <button onClick={() => setEditing(true)} style={{
              padding: '10px 20px', fontSize: 13, borderRadius: 8, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)', color: '#ccc', fontWeight: 600,
            }}>Edit</button>
          )}
          <button
            className="btn-primary"
            onClick={() => generateBuyBoxPDF(user, bb)}
            style={{ padding: '10px 20px', fontSize: 13 }}
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* One-line summary (what an agent reads first) */}
      <div className="card" style={{
        marginBottom: 16, borderColor: 'rgba(240,165,0,0.3)',
        background: 'linear-gradient(135deg, rgba(240,165,0,0.06), rgba(240,165,0,0.02))',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#f0a500', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
          Quick Summary
        </div>
        <p style={{ fontSize: 14, color: '#eee', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
          {buildBuyBoxSummary(user, bb)}
        </p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        {(() => {
          const ipv = bb.investorProfile || {};
          const hasIp = ipv.phone || ipv.email || ipv.strengths?.length || ipv.timeToClose || ipv.urgency?.length;
          if (!hasIp) return null;
          return (
            <Section title="Investor Profile">
              {(ipv.phone || ipv.email) && (
                <Value label="Contact" value={[ipv.phone, ipv.email].filter(Boolean).join('  ·  ')} />
              )}
              {ipv.timeToClose && <Value label="Time to Close" value={ipv.timeToClose} />}
              {ipv.strengths?.length > 0 && <ChipList items={ipv.strengths} color="#48c78e" />}
              {ipv.urgency?.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <ChipList items={ipv.urgency.map(u => {
                    const d = (ipv.urgencyDetails || {})[u];
                    return d ? `${u} ${d}` : u;
                  })} color="#f0a500" />
                </div>
              )}
            </Section>
          );
        })()}

        <Section title="Target Market">
          <ChipList items={bb.markets} />
          {bb.zipCodes?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 12, color: '#666' }}>Zip Codes: </span>
              <span style={{ fontSize: 13, color: '#ccc' }}>{bb.zipCodes.join(', ')}</span>
            </div>
          )}
        </Section>

        <Section title="Property Type">
          <ChipList items={bb.propertyTypes} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 10 }}>
            {range(bb.yearBuiltMin, bb.yearBuiltMax) && (
              <Value label="Year Built" value={range(bb.yearBuiltMin, bb.yearBuiltMax)} />
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 4 }}>
            {range(bb.bedroomsMin, bb.bedroomsMax) && <Value label="Bedrooms" value={range(bb.bedroomsMin, bb.bedroomsMax)} />}
            {range(bb.bathroomsMin, bb.bathroomsMax) && <Value label="Bathrooms" value={range(bb.bathroomsMin, bb.bathroomsMax)} />}
          </div>
          {bb.conditionTolerance && <Value label="Condition" value={bb.conditionTolerance} />}
        </Section>

        <Section title="Target Purchase Price">
          {(bb.priceMin || bb.priceMax) && (
            <Value label="Price Range" value={`${fmt$(bb.priceMin) || '?'} – ${fmt$(bb.priceMax) || '?'}`} />
          )}
        </Section>

        <Section title="Investment Strategy">
          <ChipList items={bb.strategies} color="#f0a500" />
        </Section>

        <Section title="Financing">
          <ChipList items={bb.financingTypes} color="#48c78e" />
        </Section>

        <Section title="Return Requirements">
          {ret.minCashOnCash && <Value label="Min Cash-on-Cash" value={`${ret.minCashOnCash}%`} />}
          {ret.minCapRate && <Value label="Min Cap Rate" value={`${ret.minCapRate}%`} />}
          {ret.minCashFlowPerUnit && <Value label="Min Cash Flow/Unit" value={`$${ret.minCashFlowPerUnit}/mo`} />}
        </Section>

        {bb.dealBreakers?.length > 0 && (
          <Section title="Deal-Breakers / Areas to Avoid">
            <ChipList items={bb.dealBreakers} color="#e94560" />
          </Section>
        )}

        {bb.additionalNotes && (
          <Section title="Additional Notes">
            <p style={{ fontSize: 14, color: '#ccc', lineHeight: 1.7, whiteSpace: 'pre-line', margin: 0 }}>
              {bb.additionalNotes}
            </p>
          </Section>
        )}
      </div>
    </div>
  );
}
