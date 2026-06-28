// Shared Buy Box options, summary builder, and PDF generator.
// Used by both the course tool (BuyBoxStep) and the dashboard tool (MyBuyBox)
// so they stay perfectly in sync.
import jsPDF from 'jspdf';

// ── Option libraries ──
export const BUYER_STRENGTHS = [
  'Cash buyer — can close fast, no financing contingency',
  'Pre-approved / pre-qualified financing',
  'Proof of funds available on request',
  'Can close as-is — no repair requests',
  'Flexible closing date to fit the seller',
  'Comfortable with tenant-occupied or problem properties',
  'Strong earnest money deposit',
  'Can offer creative terms (seller financing, etc.)',
  'Local buyer who knows the area',
  'Prepared first-time buyer, ready to move',
  'Experienced / repeat investor',
];

export const TIME_TO_CLOSE_OPTIONS = [
  '7 days (cash)',
  '14 days',
  '21 days',
  '30 days',
  '30–45 days',
  "Flexible / seller's timeline",
];

// reveal: 'date' | 'text' | null — fields that reveal an extra input when selected
export const URGENCY_OPTIONS = [
  { label: 'Actively making offers now', reveal: null },
  { label: '1031 exchange — must close by', reveal: 'date', summaryPrefix: '1031 deadline' },
  { label: 'Capital allocated now, must deploy by', reveal: 'text', summaryPrefix: 'must deploy by' },
  { label: 'Aiming to close before year-end (tax planning)', reveal: null },
  { label: 'Financing / rate window expiring soon', reveal: null },
  { label: 'Ready to move on the right deal this week', reveal: null },
];

export const DEAL_BREAKERS = [
  'Flood zone / high flood risk',
  'Foundation or major structural issues',
  'Environmental hazards (mold, asbestos, meth, oil tanks)',
  'Wildfire high-risk zone',
  'HOA properties',
  'Age-restricted (55+) communities',
  'Mobile / manufactured homes',
  'Full gut rehabs (beyond my appetite)',
  'High-crime areas / specific neighborhoods to avoid',
  'Busy roads / commercial-adjacent',
  'Septic or well (want city water/sewer)',
  'Old electrical/plumbing (knob-and-tube, galvanized, poly)',
  'Existing problem tenants',
  'Short-term-rental-restricted areas',
];

export const DEFAULT_DOWN_PAYMENT_PCT = 25;

// ── Helpers ──
export function fmtUSD(val) {
  if (val === '' || val === null || val === undefined || isNaN(Number(val))) return null;
  return '$' + Number(val).toLocaleString('en-US');
}

export function computeBuyingPower(cashAvailable, downPaymentPercent) {
  const cash = Number(cashAvailable);
  const pct = Number(downPaymentPercent);
  if (!cash || !pct) return null;
  return Math.round(cash / (pct / 100));
}

function priceRange(min, max) {
  const lo = fmtUSD(min);
  const hi = fmtUSD(max);
  if (lo && hi) return `${lo}–${hi}`;
  if (lo) return `${lo}+`;
  if (hi) return `up to ${hi}`;
  return null;
}

function rangeText(min, max, sep = '–') {
  if (min && max) return `${min}${sep}${max}`;
  if (min) return `${min}+`;
  if (max) return `up to ${max}`;
  return null;
}

// Short phrase for the first urgency item (with its revealed detail, if any)
function urgencySummary(ip) {
  const list = ip.urgency || [];
  if (!list.length) return null;
  const first = list[0];
  const opt = URGENCY_OPTIONS.find(o => o.label === first);
  const detail = (ip.urgencyDetails || {})[first];
  if (opt && opt.summaryPrefix && detail) return `${opt.summaryPrefix} ${detail}`;
  if (opt && opt.reveal === null) return first;
  // custom write-in or option without detail
  return detail ? `${first} ${detail}` : first;
}

// One-line summary an agent can read in ~3 seconds.
export function buildBuyBoxSummary(user, bb) {
  const ip = bb.investorProfile || {};
  const ret = bb.returnRequirements || {};
  const name = ip.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Investor';
  const strategy = bb.strategies?.[0];
  const markets = bb.markets?.length ? bb.markets.join(' + ') : null;
  const ptypes = bb.propertyTypes?.length ? bb.propertyTypes.join('/') : null;
  const price = priceRange(bb.priceMin, bb.priceMax);
  const strengths = ip.strengths?.length ? ip.strengths.slice(0, 2).join(', ') : null;
  const ttc = ip.timeToClose ? `can close in ${ip.timeToClose}` : null;
  const coc = ret.minCashOnCash ? `needs ${ret.minCashOnCash}% cash-on-cash` : null;
  const urgency = urgencySummary(ip);

  return [
    name,
    strategy ? `${strategy} investor` : null,
    markets,
    ptypes,
    price,
    strengths,
    ttc,
    coc,
    urgency,
  ].filter(Boolean).join(' · ');
}

// ── PDF (leads with the one-line summary) ──
export function generateBuyBoxPDF(user, bb) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const margin = 20;
  const textW = w - margin * 2;
  let y = 20;

  const dark = [18, 18, 24];
  const white = [238, 238, 238];
  const accent = [233, 69, 96];
  const gold = [240, 165, 0];
  const muted = [136, 136, 136];
  const sectionColor = [160, 160, 160];

  const ip = bb.investorProfile || {};
  const ret = bb.returnRequirements || {};
  const bp = bb.buyingPower || {};
  const name = ip.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Investor';

  const paintBg = () => { doc.setFillColor(...dark); doc.rect(0, 0, w, h, 'F'); };
  paintBg();

  // Header
  doc.setTextColor(...white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(name.toUpperCase(), w / 2, y, { align: 'center' });
  y += 9;
  doc.setTextColor(...accent);
  doc.setFontSize(13);
  doc.text('MY BUY BOX', w / 2, y, { align: 'center' });
  y += 4;
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.5);
  doc.line(margin, y, w - margin, y);
  y += 10;

  // (1) One-line summary — highlighted box
  const summary = buildBuyBoxSummary(user, bb);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...white);
  const summaryLines = doc.splitTextToSize(summary, textW - 8);
  const boxH = summaryLines.length * 5.2 + 8;
  doc.setFillColor(34, 34, 42);
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, textW, boxH, 2, 2, 'FD');
  let sy = y + 6;
  summaryLines.forEach(l => { doc.text(l, margin + 4, sy); sy += 5.2; });
  y += boxH + 10;

  const addSection = (title, lines, color = sectionColor) => {
    const filtered = lines.filter(Boolean);
    if (filtered.length === 0) return;
    if (y > h - 30) { doc.addPage(); paintBg(); y = 20; }
    doc.setTextColor(...color);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin, y);
    y += 6;
    doc.setTextColor(...white);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    filtered.forEach(line => {
      if (y > h - 20) { doc.addPage(); paintBg(); y = 20; }
      doc.splitTextToSize(line, textW).forEach(l => { doc.text(l, margin, y); y += 5.5; });
    });
    y += 6;
  };

  // (2) Investor Profile + contact
  addSection('Investor Profile', [
    [ip.phone ? `Phone: ${ip.phone}` : null, ip.email ? `Email: ${ip.email}` : null].filter(Boolean).join('   '),
    ip.strengths?.length ? `Strengths: ${ip.strengths.join(' · ')}` : null,
    ip.timeToClose ? `Time to close: ${ip.timeToClose}` : null,
    ip.urgency?.length ? `Urgency: ${ip.urgency.map(u => {
      const d = (ip.urgencyDetails || {})[u];
      return d ? `${u} ${d}` : u;
    }).join(' · ')}` : null,
  ], accent);

  // (3) Buying Power + price range
  const power = computeBuyingPower(bp.cashAvailable, bp.downPaymentPercent ?? DEFAULT_DOWN_PAYMENT_PCT);
  addSection('Buying Power', [
    power ? `Estimated Buying Power: up to ~${fmtUSD(power)} (based on ${fmtUSD(bp.cashAvailable)} down at ${bp.downPaymentPercent ?? DEFAULT_DOWN_PAYMENT_PCT}%)` : null,
    priceRange(bb.priceMin, bb.priceMax) ? `Target Purchase Price: ${priceRange(bb.priceMin, bb.priceMax)}` : null,
    power ? 'Estimate only — before closing costs and reserves; final amount depends on lender qualification.' : null,
  ], gold);

  // (4) Location / property / financial criteria
  addSection('Target Market', [
    bb.markets?.length ? bb.markets.join(' | ') : null,
    bb.zipCodes?.length ? `Zip Codes: ${bb.zipCodes.join(', ')}` : null,
  ]);
  addSection('Property Criteria', [
    bb.propertyTypes?.length ? `Types: ${bb.propertyTypes.join(', ')}` : null,
    rangeText(bb.yearBuiltMin, bb.yearBuiltMax) ? `Year Built: ${rangeText(bb.yearBuiltMin, bb.yearBuiltMax)}` : null,
    rangeText(bb.bedroomsMin, bb.bedroomsMax) ? `Bedrooms: ${rangeText(bb.bedroomsMin, bb.bedroomsMax)}` : null,
    rangeText(bb.bathroomsMin, bb.bathroomsMax) ? `Bathrooms: ${rangeText(bb.bathroomsMin, bb.bathroomsMax)}` : null,
    bb.conditionTolerance ? `Condition: ${bb.conditionTolerance}` : null,
  ]);
  addSection('Strategy & Financing', [
    bb.strategies?.length ? `Strategy: ${bb.strategies.join(', ')}` : null,
    bb.financingTypes?.length ? `Financing: ${bb.financingTypes.join(', ')}` : null,
  ]);
  addSection('Return Requirements', [
    ret.minCashOnCash ? `Min Cash-on-Cash: ${ret.minCashOnCash}%` : null,
    ret.minCapRate ? `Min Cap Rate: ${ret.minCapRate}%` : null,
    ret.minCashFlowPerUnit ? `Min Cash Flow/Unit: $${ret.minCashFlowPerUnit}/mo` : null,
  ]);

  // (5) Deal-Breakers
  addSection('Deal-Breakers / Areas to Avoid', [
    bb.dealBreakers?.length ? bb.dealBreakers.join(' · ') : null,
  ], accent);

  if (bb.additionalNotes) addSection('Additional Notes', [bb.additionalNotes]);

  // Footer
  doc.setDrawColor(60, 60, 70);
  doc.setLineWidth(0.3);
  doc.line(margin, h - 15, w - margin, h - 15);
  doc.setTextColor(...muted);
  doc.setFontSize(8);
  doc.text('Generated via UC30 | uc30.com', w / 2, h - 10, { align: 'center' });

  doc.save(`${name.replace(/\s+/g, '_')}_Buy_Box.pdf`);
}
