import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_CHECKLIST, CHECKLIST_STATUSES, STATUS_LABEL } from '../lib/checklist';
import { supabase } from '../utils/supabaseClient';
import { summarizeCapex, formatCurrency } from '../lib/capex';

const STORAGE_KEY = 'uc30_dd_checklist';

function buildLocalItems() {
  const items = [];
  let id = 1;
  for (const section of DEFAULT_CHECKLIST) {
    for (const item of section.items) {
      items.push({
        id: id++,
        section: section.section,
        label: item.label,
        status: 'not_started',
        notes: '',
        critical: !!item.critical,
      });
    }
  }
  return items;
}

function loadLocal() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length > 0) return saved;
  } catch {}
  return null;
}

function saveLocal(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
}

const statusColors = {
  not_started: '#555', in_progress: '#f0a500', collected: '#48c78e', na: '#666',
};

export default function DueDiligenceChecklist({ user }) {
  const [items, setItems] = useState(() => loadLocal() || buildLocalItems());
  const [propertyName, setPropertyName] = useState('');
  const [showCopyModal, setShowCopyModal] = useState(false);

  useEffect(() => { saveLocal(items); }, [items]);

  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const resetChecklist = () => {
    setItems(buildLocalItems());
    setPropertyName('');
  };

  const sections = [...new Set(items.map(i => i.section))];
  const total = items.length;
  const done = items.filter(i => i.status === 'collected' || i.status === 'na').length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const isLoggedIn = !!user?.authId;

  return (
    <div>
      {/* Property Name */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: '#888', fontWeight: 500, display: 'block', marginBottom: 4 }}>
          Property Name / Address
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={propertyName}
            onChange={e => setPropertyName(e.target.value)}
            placeholder="e.g. 123 Main St, Anytown USA"
            style={{
              flex: 1, padding: '10px 12px', fontSize: 14, borderRadius: 8,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#eee', fontFamily: "'DM Sans', sans-serif", outline: 'none',
            }}
          />
          {isLoggedIn && (
            <button
              onClick={() => setShowCopyModal(true)}
              style={{
                padding: '10px 14px', fontSize: 12, fontWeight: 600, borderRadius: 8,
                background: 'rgba(107,138,253,0.15)', border: '1px solid rgba(107,138,253,0.3)',
                color: '#6b8afd', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                whiteSpace: 'nowrap',
              }}
            >
              Copy from Deal Analyzer
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Due Diligence Progress</span>
          <span style={{ fontSize: 13, color: pct === 100 ? '#48c78e' : '#888' }}>{done}/{total} ({pct}%)</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
          <div style={{
            height: '100%', borderRadius: 3, width: `${pct}%`,
            background: pct === 100 ? '#48c78e' : '#e94560',
            transition: 'width 0.3s',
          }} />
        </div>
      </div>

      {pct === 100 && (
        <div className="card" style={{
          padding: 20, marginBottom: 16, textAlign: 'center',
          background: 'rgba(72,199,142,0.06)', borderColor: 'rgba(72,199,142,0.2)',
        }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#48c78e', marginBottom: 4 }}>
            Due Diligence Complete
          </div>
          <div style={{ fontSize: 13, color: '#888' }}>
            All items have been collected or marked N/A.
          </div>
        </div>
      )}

      {/* Sections */}
      {sections.map(section => {
        const sectionItems = items.filter(i => i.section === section);
        const sectionDone = sectionItems.filter(i => i.status === 'collected' || i.status === 'na').length;
        return (
          <div key={section} style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: '#e94560', letterSpacing: 1,
              marginBottom: 8, display: 'flex', justifyContent: 'space-between',
            }}>
              <span>{section.toUpperCase()}</span>
              <span style={{ color: '#666' }}>{sectionDone}/{sectionItems.length}</span>
            </div>
            {sectionItems.map(item => (
              <ChecklistItem key={item.id} item={item} onUpdate={updateItem} />
            ))}
          </div>
        );
      })}

      {/* Reset */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button
          onClick={resetChecklist}
          style={{
            padding: '8px 20px', fontSize: 12, borderRadius: 6, cursor: 'pointer',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#666', fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Reset Checklist
        </button>
      </div>

      {/* Copy from Deal Analyzer Modal */}
      {showCopyModal && (
        <CopyFromDealAnalyzerModal
          user={user}
          onSelect={(property, capexNote) => {
            if (property.address) setPropertyName(property.address);
            else if (property.name) setPropertyName(property.name);
            if (capexNote) {
              setItems(prev => prev.map(item =>
                item.label === 'Capital improvements history'
                  ? { ...item, notes: item.notes ? `${item.notes}\n\n${capexNote}` : capexNote }
                  : item
              ));
            }
            setShowCopyModal(false);
          }}
          onClose={() => setShowCopyModal(false)}
        />
      )}
    </div>
  );
}

function ChecklistItem({ item, onUpdate }) {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div style={{
      padding: '10px 12px', marginBottom: 4, borderRadius: 8,
      background: item.status === 'collected' ? 'rgba(72,199,142,0.04)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${item.critical && item.status === 'not_started' ? 'rgba(233,69,96,0.2)' : 'rgba(255,255,255,0.04)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: item.status === 'collected' ? '#48c78e' : '#ccc', display: 'flex', alignItems: 'center', gap: 6 }}>
            {item.label}
            {item.critical && <span style={{ fontSize: 9, color: '#e94560', fontWeight: 700 }}>CRITICAL</span>}
          </div>
        </div>
        <select
          value={item.status}
          onChange={e => onUpdate(item.id, 'status', e.target.value)}
          style={{
            fontSize: 11, padding: '4px 8px', borderRadius: 4,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: statusColors[item.status], fontWeight: 600, appearance: 'auto',
            fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
          }}
        >
          {CHECKLIST_STATUSES.map(s => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        <button
          onClick={() => setShowNotes(!showNotes)}
          style={{
            fontSize: 11, padding: '4px 8px', borderRadius: 4, cursor: 'pointer',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: item.notes ? '#f0a500' : '#555', fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {item.notes ? '📝' : '+'}
        </button>
      </div>
      {showNotes && (
        <textarea
          value={item.notes || ''}
          onChange={e => onUpdate(item.id, 'notes', e.target.value)}
          placeholder="Add notes..."
          rows={2}
          style={{
            width: '100%', padding: '8px 10px', fontSize: 12, marginTop: 8, resize: 'vertical',
            minHeight: 48, borderRadius: 6,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#ddd', fontFamily: "'DM Sans', sans-serif", outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      )}
    </div>
  );
}

function CopyFromDealAnalyzerModal({ user, onSelect, onClose }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [capexByProp, setCapexByProp] = useState({});

  const loadProperties = useCallback(async () => {
    if (!supabase || !user?.authId) { setLoading(false); return; }
    const { data: authData } = await supabase.auth.getSession();
    const userId = authData?.session?.user?.id;
    if (!userId) { setLoading(false); return; }

    const { data: props } = await supabase
      .from('da_properties')
      .select('*')
      .eq('archived', false)
      .order('created_at', { ascending: false });
    setProperties(props || []);

    if (props?.length) {
      const ids = props.map(p => p.id);
      const { data: systems } = await supabase
        .from('da_inspection_systems')
        .select('*')
        .in('property_id', ids);

      if (systems?.length) {
        const byProp = {};
        for (const s of systems) {
          if (!byProp[s.property_id]) byProp[s.property_id] = [];
          byProp[s.property_id].push(s);
        }
        const summaries = {};
        for (const [propId, rows] of Object.entries(byProp)) {
          const included = rows.filter(r => r.included);
          if (included.length > 0) {
            summaries[propId] = summarizeCapex(rows);
          }
        }
        setCapexByProp(summaries);
      }
    }
    setLoading(false);
  }, [user?.authId]);

  useEffect(() => { loadProperties(); }, [loadProperties]);

  const handleSelect = (property) => {
    const capex = capexByProp[property.id];
    let capexNote = '';
    if (capex && capex.includedCount > 0) {
      const lines = [`CapEx Summary (from Deal Analyzer)`, `Total: ${formatCurrency(capex.total)}`];
      if (capex.byUrgency.immediate > 0) lines.push(`Immediate: ${formatCurrency(capex.byUrgency.immediate)}`);
      if (capex.byUrgency['1-3'] > 0) lines.push(`1-3 years: ${formatCurrency(capex.byUrgency['1-3'])}`);
      if (capex.byUrgency['4-7'] > 0) lines.push(`4-7 years: ${formatCurrency(capex.byUrgency['4-7'])}`);
      if (capex.byUrgency['8+'] > 0) lines.push(`8+ years: ${formatCurrency(capex.byUrgency['8+'])}`);
      if (capex.topUrgent?.length) {
        lines.push('', 'Top urgent systems:');
        for (const s of capex.topUrgent) {
          lines.push(`  - ${s.name}: ${formatCurrency(s.replacementCost)} (${s.remainingLife}yr remaining)`);
        }
      }
      capexNote = lines.join('\n');
    }
    onSelect(property, capexNote);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#111118', borderRadius: 16, padding: 24,
          width: '100%', maxWidth: 480, maxHeight: '70vh', overflow: 'auto',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Copy from Deal Analyzer</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#666', fontSize: 20, cursor: 'pointer',
          }}>✕</button>
        </div>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
          Select a property to copy its address and CapEx data into your checklist.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#666' }}>Loading properties...</div>
        ) : properties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#666' }}>
            <div style={{ fontSize: 13, marginBottom: 8 }}>No properties in Deal Analyzer yet.</div>
            <div style={{ fontSize: 12, color: '#555' }}>Add a property in your Deal Analyzer first, then come back to copy it here.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {properties.map(prop => {
              const capex = capexByProp[prop.id];
              return (
                <button
                  key={prop.id}
                  onClick={() => handleSelect(prop)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    color: 'inherit', fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#ddd', marginBottom: 2 }}>
                    {prop.name}
                  </div>
                  {prop.address && (
                    <div style={{ fontSize: 12, color: '#888' }}>📍 {prop.address}</div>
                  )}
                  <div style={{ fontSize: 11, color: '#666', marginTop: 4, display: 'flex', gap: 12 }}>
                    {prop.unit_count && <span>{prop.unit_count} units</span>}
                    {prop.square_footage && <span>{prop.square_footage.toLocaleString()} sqft</span>}
                    {capex && <span style={{ color: '#f0a500' }}>CapEx: {formatCurrency(capex.total, { compact: true })}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
