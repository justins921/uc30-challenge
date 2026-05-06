import jsPDF from 'jspdf';

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

function generatePDF(user, bb) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const margin = 20;
  const textW = w - margin * 2;
  let y = 20;

  const dark = [18, 18, 24];
  const white = [238, 238, 238];
  const accent = [233, 69, 96];
  const muted = [136, 136, 136];
  const sectionColor = [160, 160, 160];

  doc.setFillColor(...dark);
  doc.rect(0, 0, w, doc.internal.pageSize.getHeight(), 'F');

  doc.setTextColor(...white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Operator';
  doc.text(name.toUpperCase(), w / 2, y, { align: 'center' });
  y += 10;

  doc.setTextColor(...accent);
  doc.setFontSize(14);
  doc.text('MY BUY BOX', w / 2, y, { align: 'center' });
  y += 4;

  doc.setDrawColor(...accent);
  doc.setLineWidth(0.5);
  doc.line(margin, y, w - margin, y);
  y += 12;

  const addSection = (title, lines) => {
    const filtered = lines.filter(l => l);
    if (filtered.length === 0) return;
    if (y > 265) { doc.addPage(); y = 20; doc.setFillColor(...dark); doc.rect(0, 0, w, doc.internal.pageSize.getHeight(), 'F'); }

    doc.setTextColor(...sectionColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin, y);
    y += 6;

    doc.setTextColor(...white);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    filtered.forEach(line => {
      if (y > 275) { doc.addPage(); y = 20; doc.setFillColor(...dark); doc.rect(0, 0, w, doc.internal.pageSize.getHeight(), 'F'); }
      const split = doc.splitTextToSize(line, textW);
      split.forEach(l => {
        doc.text(l, margin, y);
        y += 5.5;
      });
    });
    y += 6;
  };

  const ret = bb.returnRequirements || {};

  addSection('Target Market', [
    bb.markets?.length > 0 ? bb.markets.join(' | ') : null,
    bb.zipCodes?.length > 0 ? `Zip Codes: ${bb.zipCodes.join(', ')}` : null,
  ]);

  addSection('Property Type', [
    bb.propertyTypes?.length > 0 ? bb.propertyTypes.join(', ') : null,
    range(bb.yearBuiltMin, bb.yearBuiltMax) ? `Year Built: ${range(bb.yearBuiltMin, bb.yearBuiltMax)}` : null,
    range(bb.bedroomsMin, bb.bedroomsMax) ? `Bedrooms: ${range(bb.bedroomsMin, bb.bedroomsMax)}` : null,
    range(bb.bathroomsMin, bb.bathroomsMax) ? `Bathrooms: ${range(bb.bathroomsMin, bb.bathroomsMax)}` : null,
    bb.conditionTolerance ? `Condition: ${bb.conditionTolerance}` : null,
  ]);

  addSection('Deal Size', [
    (bb.priceMin || bb.priceMax) ? `Price Range: ${fmt$(bb.priceMin) || '?'} – ${fmt$(bb.priceMax) || '?'}` : null,
    bb.downPayment ? `Down Payment Available: ${fmt$(bb.downPayment)}` : null,
  ]);

  addSection('Investment Strategy', [
    bb.strategies?.length > 0 ? bb.strategies.join(', ') : null,
  ]);

  addSection('Financing', [
    bb.financingTypes?.length > 0 ? bb.financingTypes.join(', ') : null,
  ]);

  addSection('Return Requirements', [
    ret.minCashOnCash ? `Min Cash-on-Cash: ${ret.minCashOnCash}%` : null,
    ret.minCapRate ? `Min Cap Rate: ${ret.minCapRate}%` : null,
    ret.minCashFlowPerUnit ? `Min Cash Flow/Unit: $${ret.minCashFlowPerUnit}/mo` : null,
    ret.minIRR ? `Min IRR: ${ret.minIRR}%` : null,
  ]);

  if (bb.additionalNotes) {
    addSection('Additional Notes', [bb.additionalNotes]);
  }

  doc.setDrawColor(60, 60, 70);
  doc.setLineWidth(0.3);
  doc.line(margin, doc.internal.pageSize.getHeight() - 15, w - margin, doc.internal.pageSize.getHeight() - 15);
  doc.setTextColor(...muted);
  doc.setFontSize(8);
  doc.text('Generated via UC30 | uc30.com', w / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

  doc.save(`${name.replace(/\s+/g, '_')}_Buy_Box.pdf`);
}

export default function MyBuyBox({ user }) {
  const bb = user?.buyBox || {};
  const ret = bb.returnRequirements || {};
  const isEmpty = !bb.markets?.length && !bb.propertyTypes?.length;

  if (isEmpty) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Buy Box Yet</h3>
        <p style={{ color: '#888', fontSize: 14 }}>
          Complete the activation phase to set up your buy box.
        </p>
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
        <button
          className="btn-primary"
          onClick={() => generatePDF(user, bb)}
          style={{ padding: '10px 20px', fontSize: 13 }}
        >
          Download PDF
        </button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
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

        <Section title="Deal Size">
          {(bb.priceMin || bb.priceMax) && (
            <Value label="Price Range" value={`${fmt$(bb.priceMin) || '?'} – ${fmt$(bb.priceMax) || '?'}`} />
          )}
          {bb.downPayment && <Value label="Down Payment Available" value={fmt$(bb.downPayment)} />}
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
          {ret.minIRR && <Value label="Min IRR" value={`${ret.minIRR}%`} />}
        </Section>

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