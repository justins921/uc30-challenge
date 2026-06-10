import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { SYSTEMS, SYSTEM_CATEGORIES, CONDITIONS, CONDITION_LABEL, suggestQuantity } from '../lib/systems';
import { summarizeCapex, formatCurrency, URGENCY_LABEL, URGENCY_ORDER, currentYear } from '../lib/capex';
import { buildSeedChecklistRows, STATUS_LABEL, CHECKLIST_STATUSES, DEFAULT_CHECKLIST } from '../lib/checklist';
import { exportElementToPdf } from '../lib/pdf';
import { canAddProperty } from '../lib/entitlements';

const PROPERTY_TYPES = {
  sfr: 'Single Family',
  small_multi: 'Small Multi (2-4)',
  large_multi: 'Large Multi (5+)',
  commercial: 'Commercial',
};

const URGENCY_COLORS = {
  immediate: '#e94560',
  '1-3': '#f0a500',
  '4-7': '#3b82f6',
  '8+': '#48c78e',
};

const inputStyle = {
  width: '100%', padding: '10px 12px', fontSize: 14, borderRadius: 8,
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
  color: '#eee', fontFamily: "'DM Sans', sans-serif", outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = { fontSize: 12, color: '#888', fontWeight: 500, display: 'block', marginBottom: 4 };

const SUB_TABS = [
  { id: 'checklist', label: 'Checklist' },
  { id: 'inspection', label: 'Inspection' },
  { id: 'report', label: 'Report' },
];

// ── Main Component ──────────────────────────────────────────────
export default function DealAnalyzer({ user }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const authId = user?.authId;

  const loadProperties = useCallback(async () => {
    if (!supabase || !authId) { setLoading(false); return; }
    const { data } = await supabase
      .from('da_properties')
      .select('*')
      .eq('archived', false)
      .order('created_at', { ascending: false });
    setProperties(data || []);
    setLoading(false);
  }, [authId]);

  useEffect(() => { loadProperties(); }, [loadProperties]);

  const createProperty = async (form) => {
    if (!supabase || !authId) return;
    const { data: authData } = await supabase.auth.getSession();
    const userId = authData?.session?.user?.id;
    if (!userId) return;

    const { data: prop, error } = await supabase
      .from('da_properties')
      .insert({
        user_id: userId,
        name: form.name,
        address: form.address || null,
        property_type: form.property_type,
        square_footage: parseInt(form.square_footage) || null,
        unit_count: parseInt(form.unit_count) || null,
        year_built: parseInt(form.year_built) || null,
      })
      .select()
      .single();

    if (error || !prop) { console.error('Create property error:', error); return; }

    const checklistRows = buildSeedChecklistRows(prop.id);
    await supabase.from('da_checklist_items').insert(checklistRows);

    const systemRows = SYSTEMS.map(s => ({
      property_id: prop.id,
      system_key: s.key,
      included: false,
      condition: 'good',
      quantity: suggestQuantity(s, prop),
    }));
    await supabase.from('da_inspection_systems').insert(systemRows);

    await loadProperties();
    setSelectedProperty(prop);
    setShowNewForm(false);
  };

  const archiveProperty = async (id) => {
    if (!supabase) return;
    await supabase.from('da_properties').update({ archived: true }).eq('id', id);
    setSelectedProperty(null);
    loadProperties();
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 48, color: '#666' }}>Loading properties...</div>;
  }

  if (selectedProperty) {
    return (
      <PropertyDetail
        property={selectedProperty}
        onBack={() => { setSelectedProperty(null); loadProperties(); }}
        onArchive={() => archiveProperty(selectedProperty.id)}
      />
    );
  }

  if (showNewForm) {
    return (
      <NewPropertyForm
        onSubmit={createProperty}
        onCancel={() => setShowNewForm(false)}
      />
    );
  }

  return (
    <PropertyList
      properties={properties}
      onSelect={setSelectedProperty}
      onNew={() => setShowNewForm(true)}
      canAdd={canAddProperty(user, properties.length)}
    />
  );
}

// ── Property List ───────────────────────────────────────────────
function PropertyList({ properties, onSelect, onNew, canAdd }) {
  const [summaries, setSummaries] = useState({});

  useEffect(() => {
    if (!supabase || properties.length === 0) return;
    (async () => {
      const ids = properties.map(p => p.id);
      const { data: systems } = await supabase
        .from('da_inspection_systems')
        .select('*')
        .in('property_id', ids);
      const { data: checklists } = await supabase
        .from('da_checklist_items')
        .select('property_id, status')
        .in('property_id', ids);

      const byProp = {};
      for (const p of properties) {
        const propSystems = (systems || []).filter(s => s.property_id === p.id);
        const propChecklist = (checklists || []).filter(c => c.property_id === p.id);
        const capex = summarizeCapex(propSystems);
        const checklistTotal = propChecklist.length;
        const checklistDone = propChecklist.filter(c => c.status === 'collected' || c.status === 'na').length;
        byProp[p.id] = { capex, checklistTotal, checklistDone };
      }
      setSummaries(byProp);
    })();
  }, [properties]);

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Deal Analyzer</h2>
          <p style={{ fontSize: 13, color: '#666', margin: 0 }}>{properties.length} active {properties.length === 1 ? 'property' : 'properties'}</p>
        </div>
        <button
          onClick={onNew}
          disabled={!canAdd}
          style={{
            padding: '10px 20px', fontSize: 13, fontWeight: 600, borderRadius: 8,
            background: canAdd ? '#e94560' : 'rgba(255,255,255,0.06)',
            color: canAdd ? '#fff' : '#555', border: 'none', cursor: canAdd ? 'pointer' : 'default',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          + New Property
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏘️</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Properties Yet</h3>
          <p style={{ color: '#666', fontSize: 13, marginBottom: 20 }}>
            Add a property to start tracking due diligence, inspecting systems, and projecting CapEx.
          </p>
          <button
            onClick={onNew}
            style={{
              padding: '10px 24px', fontSize: 14, fontWeight: 600, borderRadius: 8,
              background: '#e94560', color: '#fff', border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Add Your First Property
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {properties.map(p => {
            const s = summaries[p.id];
            return (
              <div
                key={p.id}
                className="card"
                style={{ padding: 16, cursor: 'pointer' }}
                onClick={() => onSelect(p)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{p.name}</div>
                    {p.address && <div style={{ fontSize: 12, color: '#666' }}>{p.address}</div>}
                  </div>
                  <div style={{ color: '#444', fontSize: 18 }}>›</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <MiniTag label={PROPERTY_TYPES[p.property_type] || p.property_type} />
                  {p.square_footage && <MiniTag label={`${p.square_footage.toLocaleString()} sqft`} />}
                  {p.year_built && <MiniTag label={`Built ${p.year_built}`} />}
                  {s && (
                    <>
                      <MiniTag
                        label={`Checklist ${s.checklistDone}/${s.checklistTotal}`}
                        color={s.checklistDone === s.checklistTotal ? '#48c78e' : '#888'}
                      />
                      {s.capex.total > 0 && (
                        <MiniTag
                          label={`CapEx ${formatCurrency(s.capex.total, { compact: true })}`}
                          color={s.capex.byUrgency.immediate > 0 ? '#e94560' : '#f0a500'}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MiniTag({ label, color = '#888' }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, color,
      background: `${color}15`, padding: '3px 8px', borderRadius: 4,
    }}>
      {label}
    </span>
  );
}

// ── New Property Form ───────────────────────────────────────────
function NewPropertyForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: '', address: '', property_type: 'sfr',
    square_footage: '', unit_count: '1', year_built: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    await onSubmit(form);
    setSaving(false);
  };

  return (
    <div className="fade-up">
      <button className="btn-secondary" onClick={onCancel} style={{ marginBottom: 20, padding: '8px 20px', fontSize: 13 }}>
        ← Back
      </button>
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>New Property</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Property Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. 123 Main St Duplex"
              required
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Address</label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="Full address"
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>Property Type</label>
              <select
                value={form.property_type}
                onChange={e => setForm(f => ({ ...f, property_type: e.target.value }))}
                style={{ ...inputStyle, appearance: 'auto' }}
              >
                {Object.entries(PROPERTY_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Year Built</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.year_built}
                onChange={e => setForm(f => ({ ...f, year_built: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                placeholder="1995"
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Square Footage</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.square_footage}
                onChange={e => setForm(f => ({ ...f, square_footage: e.target.value.replace(/\D/g, '') }))}
                placeholder="1,500"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Unit Count</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.unit_count}
                onChange={e => setForm(f => ({ ...f, unit_count: e.target.value.replace(/\D/g, '') }))}
                placeholder="1"
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              style={{
                flex: 1, padding: '12px 20px', fontSize: 14, fontWeight: 600, borderRadius: 8,
                background: '#e94560', color: '#fff', border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Creating...' : 'Create Property'}
            </button>
            <button type="button" className="btn-secondary" onClick={onCancel} style={{ padding: '12px 20px' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Property Detail (Checklist / Inspection / Report tabs) ──────
function PropertyDetail({ property, onBack, onArchive }) {
  const [subTab, setSubTab] = useState('checklist');
  const p = property;

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <button className="btn-secondary" onClick={onBack} style={{ padding: '8px 16px', fontSize: 13 }}>
          ← Properties
        </button>
        <button
          onClick={() => { if (confirm(`Archive "${p.name}"? You can't undo this.`)) onArchive(); }}
          style={{
            padding: '6px 14px', fontSize: 11, fontWeight: 600, borderRadius: 6,
            background: 'rgba(255,0,0,0.06)', border: '1px solid rgba(255,0,0,0.15)',
            color: '#ff4444', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Archive
        </button>
      </div>

      {/* Property info */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
        {p.address && <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>{p.address}</div>}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <MiniTag label={PROPERTY_TYPES[p.property_type] || p.property_type} />
          {p.square_footage && <MiniTag label={`${p.square_footage.toLocaleString()} sqft`} />}
          {p.unit_count && <MiniTag label={`${p.unit_count} unit${p.unit_count > 1 ? 's' : ''}`} />}
          {p.year_built && <MiniTag label={`Built ${p.year_built}`} />}
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            style={{
              flex: 1, padding: '10px 0', fontSize: 13, fontWeight: 600, borderRadius: 8,
              background: subTab === t.id ? 'rgba(233,69,96,0.12)' : 'rgba(255,255,255,0.03)',
              color: subTab === t.id ? '#e94560' : '#888',
              border: subTab === t.id ? '1px solid rgba(233,69,96,0.25)' : '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'checklist' && <ChecklistView propertyId={p.id} />}
      {subTab === 'inspection' && <InspectionView property={p} />}
      {subTab === 'report' && <ReportView property={p} />}
    </div>
  );
}

// ── Checklist View ──────────────────────────────────────────────
function ChecklistView({ propertyId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef(null);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data } = await supabase
        .from('da_checklist_items')
        .select('*')
        .eq('property_id', propertyId)
        .order('id');
      setItems(data || []);
      setLoading(false);
    })();
  }, [propertyId]);

  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      supabase?.from('da_checklist_items').update({ [field]: value }).eq('id', id).then();
    }, 600);
  };

  if (loading) return <div style={{ color: '#666', textAlign: 'center', padding: 32 }}>Loading checklist...</div>;

  const sections = [...new Set(items.map(i => i.section))];
  const total = items.length;
  const done = items.filter(i => i.status === 'collected' || i.status === 'na').length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div>
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
    </div>
  );
}

function ChecklistItem({ item, onUpdate }) {
  const [showNotes, setShowNotes] = useState(false);
  const statusColors = {
    not_started: '#555', in_progress: '#f0a500', collected: '#48c78e', na: '#666',
  };

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
            ...inputStyle, fontSize: 12, marginTop: 8, resize: 'vertical',
            minHeight: 48,
          }}
        />
      )}
    </div>
  );
}

// ── Inspection View ─────────────────────────────────────────────
function InspectionView({ property }) {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCat, setExpandedCat] = useState(null);
  const saveTimer = useRef({});

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data } = await supabase
        .from('da_inspection_systems')
        .select('*')
        .eq('property_id', property.id);
      setSystems(data || []);
      setLoading(false);
    })();
  }, [property.id]);

  const updateSystem = (id, field, value) => {
    setSystems(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    if (saveTimer.current[id]) clearTimeout(saveTimer.current[id]);
    saveTimer.current[id] = setTimeout(() => {
      supabase?.from('da_inspection_systems').update({ [field]: value }).eq('id', id).then();
    }, 600);
  };

  const toggleIncluded = (id) => {
    const sys = systems.find(s => s.id === id);
    if (!sys) return;
    const newVal = !sys.included;
    const updates = { included: newVal };
    if (newVal && !sys.year_installed && property.year_built) {
      updates.year_installed = property.year_built;
    }
    setSystems(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    supabase?.from('da_inspection_systems').update(updates).eq('id', id).then();
  };

  const summary = useMemo(() => summarizeCapex(systems), [systems]);

  if (loading) return <div style={{ color: '#666', textAlign: 'center', padding: 32 }}>Loading inspection...</div>;

  return (
    <div>
      {/* CapEx Summary */}
      {summary.includedCount > 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{formatCurrency(summary.total, { compact: summary.total > 99999 })}</div>
              <div style={{ fontSize: 10, color: '#666', letterSpacing: 0.5 }}>TOTAL CAPEX</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: summary.byUrgency.immediate > 0 ? '#e94560' : '#666' }}>
                {formatCurrency(summary.byUrgency.immediate, { compact: true })}
              </div>
              <div style={{ fontSize: 10, color: '#666', letterSpacing: 0.5 }}>IMMEDIATE</div>
            </div>
          </div>
          {summary.total > 0 && (
            <>
              <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 8, background: 'rgba(255,255,255,0.04)' }}>
                {['immediate', '1-3', '4-7', '8+'].map(b => {
                  const pct = (summary.byUrgency[b] / summary.total) * 100;
                  if (pct === 0) return null;
                  return <div key={b} style={{ width: `${pct}%`, background: URGENCY_COLORS[b], minWidth: pct > 0 ? 4 : 0 }} />;
                })}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                {['immediate', '1-3', '4-7', '8+'].map(b => (
                  <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: URGENCY_COLORS[b] }} />
                    <span style={{ fontSize: 10, color: '#888' }}>{URGENCY_LABEL[b]}: {formatCurrency(summary.byUrgency[b], { compact: true })}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Systems by Category */}
      {SYSTEM_CATEGORIES.map(cat => {
        const catSystems = SYSTEMS.filter(s => s.category === cat);
        const isExpanded = expandedCat === cat;
        const catRows = catSystems.map(s => systems.find(r => r.system_key === s.key)).filter(Boolean);
        const catIncluded = catRows.filter(r => r.included).length;

        return (
          <div key={cat} style={{ marginBottom: 8 }}>
            <button
              onClick={() => setExpandedCat(isExpanded ? null : cat)}
              style={{
                width: '100%', padding: '10px 12px', fontSize: 13, fontWeight: 600,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: isExpanded ? '8px 8px 0 0' : 8, color: '#ccc', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", textAlign: 'left',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <span>{cat}</span>
              <span style={{ fontSize: 11, color: '#666' }}>{catIncluded}/{catSystems.length} {isExpanded ? '▾' : '▸'}</span>
            </button>

            {isExpanded && (
              <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '4px 0' }}>
                {catSystems.map(sys => {
                  const row = systems.find(r => r.system_key === sys.key);
                  if (!row) return null;
                  return (
                    <div key={sys.key} style={{ padding: '8px 12px', background: row.included ? 'rgba(233,69,96,0.03)' : 'transparent' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: row.included ? 8 : 0 }}>
                        <button
                          onClick={() => toggleIncluded(row.id)}
                          style={{
                            width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                            border: `1px solid ${row.included ? '#e94560' : 'rgba(255,255,255,0.15)'}`,
                            background: row.included ? '#e94560' : 'transparent',
                            color: '#fff', fontSize: 12, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          {row.included ? '✓' : ''}
                        </button>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: row.included ? '#eee' : '#888' }}>{sys.name}</div>
                          <div style={{ fontSize: 10, color: '#555' }}>{formatCurrency(sys.cost)}/{sys.unitLabel} | {sys.usefulLife} yr life</div>
                        </div>
                      </div>
                      {row.included && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, paddingLeft: 28 }}>
                          <div>
                            <label style={{ fontSize: 10, color: '#666', display: 'block', marginBottom: 2 }}>Year Installed</label>
                            <input
                              type="text" inputMode="numeric" maxLength={4}
                              value={row.year_installed || ''}
                              onChange={e => updateSystem(row.id, 'year_installed', parseInt(e.target.value) || null)}
                              placeholder={String(currentYear() - Math.round(sys.usefulLife / 2))}
                              style={{ ...inputStyle, fontSize: 12, padding: '6px 8px' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: 10, color: '#666', display: 'block', marginBottom: 2 }}>Condition</label>
                            <select
                              value={row.condition || 'good'}
                              onChange={e => updateSystem(row.id, 'condition', e.target.value)}
                              style={{ ...inputStyle, fontSize: 12, padding: '6px 8px', appearance: 'auto' }}
                            >
                              {CONDITIONS.map(c => <option key={c} value={c}>{CONDITION_LABEL[c]}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: 10, color: '#666', display: 'block', marginBottom: 2 }}>Qty ({sys.unitLabel})</label>
                            <input
                              type="text" inputMode="numeric"
                              value={row.quantity || ''}
                              onChange={e => updateSystem(row.id, 'quantity', parseFloat(e.target.value) || null)}
                              placeholder="0"
                              style={{ ...inputStyle, fontSize: 12, padding: '6px 8px' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Report View ─────────────────────────────────────────────────
function ReportView({ property }) {
  const [systems, setSystems] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const [sysRes, clRes] = await Promise.all([
        supabase.from('da_inspection_systems').select('*').eq('property_id', property.id),
        supabase.from('da_checklist_items').select('*').eq('property_id', property.id).order('id'),
      ]);
      setSystems(sysRes.data || []);
      setChecklist(clRes.data || []);
      setLoading(false);
    })();
  }, [property.id]);

  const summary = useMemo(() => summarizeCapex(systems), [systems]);

  const handleExport = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      await exportElementToPdf(reportRef.current, `${property.name.replace(/\s+/g, '_')}_report.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    }
    setExporting(false);
  };

  if (loading) return <div style={{ color: '#666', textAlign: 'center', padding: 32 }}>Loading report...</div>;

  const checklistSections = [...new Set(checklist.map(i => i.section))];
  const totalItems = checklist.length;
  const doneItems = checklist.filter(i => i.status === 'collected' || i.status === 'na').length;
  const criticalMissing = checklist.filter(i => i.critical && i.status === 'not_started');

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={handleExport}
          disabled={exporting}
          style={{
            flex: 1, padding: '10px 16px', fontSize: 13, fontWeight: 600, borderRadius: 8,
            background: '#e94560', color: '#fff', border: 'none', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", opacity: exporting ? 0.6 : 1,
          }}
        >
          {exporting ? 'Generating PDF...' : 'Export PDF'}
        </button>
      </div>

      {/* Printable report */}
      <div
        ref={reportRef}
        style={{
          background: '#fff', color: '#111', borderRadius: 12, padding: 32,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#111' }}>Deal Analysis Report</h1>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>{property.name}{property.address ? ` — ${property.address}` : ''}</div>

        {/* Property Details */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Type', value: PROPERTY_TYPES[property.property_type] },
            { label: 'Sq Ft', value: property.square_footage?.toLocaleString() || '—' },
            { label: 'Units', value: property.unit_count || '—' },
            { label: 'Year Built', value: property.year_built || '—' },
          ].map(d => (
            <div key={d.label} style={{ padding: '8px 16px', background: '#f5f5f5', borderRadius: 6 }}>
              <div style={{ fontSize: 10, color: '#999', fontWeight: 600, letterSpacing: 0.5 }}>{d.label}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>{d.value}</div>
            </div>
          ))}
        </div>

        {/* Checklist Summary */}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 12, borderBottom: '2px solid #e94560', paddingBottom: 6 }}>
          Due Diligence — {doneItems}/{totalItems} Complete
        </h2>
        {criticalMissing.length > 0 && (
          <div style={{ padding: 12, background: '#fff3f3', borderRadius: 6, marginBottom: 12, border: '1px solid #fdd' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#e94560', marginBottom: 4 }}>CRITICAL ITEMS MISSING</div>
            {criticalMissing.map(i => (
              <div key={i.id} style={{ fontSize: 12, color: '#c33' }}>• {i.label}</div>
            ))}
          </div>
        )}
        {checklistSections.map(section => {
          const items = checklist.filter(i => i.section === section);
          return (
            <div key={section} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: 0.5, marginBottom: 4 }}>{section.toUpperCase()}</div>
              {items.map(i => (
                <div key={i.id} style={{ fontSize: 12, padding: '3px 0', display: 'flex', alignItems: 'center', gap: 6, color: '#333' }}>
                  <span style={{ color: i.status === 'collected' ? '#28a745' : i.status === 'na' ? '#999' : i.status === 'in_progress' ? '#f0a500' : '#ccc' }}>
                    {i.status === 'collected' ? '✓' : i.status === 'na' ? '—' : i.status === 'in_progress' ? '◐' : '○'}
                  </span>
                  {i.label}
                  {i.notes && <span style={{ fontSize: 11, color: '#999', fontStyle: 'italic' }}> ({i.notes})</span>}
                </div>
              ))}
            </div>
          );
        })}

        {/* CapEx Summary */}
        {summary.includedCount > 0 && (
          <>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 12, marginTop: 24, borderBottom: '2px solid #e94560', paddingBottom: 6 }}>
              CapEx Projection — {formatCurrency(summary.total)}
            </h2>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              {['immediate', '1-3', '4-7', '8+'].map(b => (
                <div key={b} style={{ padding: '8px 14px', background: '#f5f5f5', borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: '#999', fontWeight: 600 }}>{URGENCY_LABEL[b]}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: URGENCY_COLORS[b] }}>{formatCurrency(summary.byUrgency[b])}</div>
                </div>
              ))}
            </div>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>
                  <th style={{ padding: '6px 8px', color: '#888', fontWeight: 600 }}>System</th>
                  <th style={{ padding: '6px 8px', color: '#888', fontWeight: 600 }}>Age</th>
                  <th style={{ padding: '6px 8px', color: '#888', fontWeight: 600 }}>Remaining</th>
                  <th style={{ padding: '6px 8px', color: '#888', fontWeight: 600, textAlign: 'right' }}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {summary.systems.map(s => (
                  <tr key={s.system_key} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '6px 8px', color: '#333' }}>{s.name}</td>
                    <td style={{ padding: '6px 8px', color: '#666' }}>{s.age != null ? `${s.age} yrs` : '—'}</td>
                    <td style={{ padding: '6px 8px', color: s.urgency ? URGENCY_COLORS[s.urgency] : '#666', fontWeight: 600 }}>
                      {s.remainingLife != null ? `${s.remainingLife} yrs` : '—'}
                    </td>
                    <td style={{ padding: '6px 8px', color: '#333', textAlign: 'right', fontWeight: 600 }}>
                      {formatCurrency(s.replacementCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div style={{ marginTop: 24, fontSize: 10, color: '#bbb', textAlign: 'center' }}>
          Generated by UC30 Deal Analyzer — {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
