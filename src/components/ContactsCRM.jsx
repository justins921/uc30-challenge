import { useState, useEffect, useMemo } from 'react';

const CONTACT_GROUPS = [
  { value: 'target', label: 'Target Contacts', color: '#e94560', desc: 'Deal sources — property owners, sellers, listing agents tied to specific properties' },
  { value: 'arsenal', label: 'Arsenal Contacts', color: '#f0a500', desc: 'Ecosystem relationships — property managers, lenders, contractors, investors, wholesalers' },
];

export { CONTACT_GROUPS };

const PIPELINE_SECTIONS = [
  { key: 'arsenal', label: 'Arsenal', color: '#f0a500', icon: '⚡', match: c => c.contact_group === 'arsenal' },
  { key: 'target_property', label: 'Target Properties', color: '#e94560', icon: '🎯', match: c => c.contact_group === 'target' && (!c.pipeline_status || c.pipeline_status === 'new' || c.pipeline_status === 'target_property' || c.pipeline_status === 'active' || c.pipeline_status === 'under_contract' || c.pipeline_status === 'closed') },
  { key: 'dead', label: 'Dead', color: '#666', icon: '💀', match: c => c.pipeline_status === 'dead' },
];

const STATUS_LABELS = {
  new: { label: 'New', color: '#888' },
  target_property: { label: 'Target Property', color: '#e94560' },
  active: { label: 'Active', color: '#48c78e' },
  under_contract: { label: 'Under Contract', color: '#6b8afd' },
  closed: { label: 'Closed', color: '#d4a843' },
  dead: { label: 'Dead', color: '#666' },
};

const INTERVAL_LABELS = {
  '2_days': '2 Days',
  '1_week': '1 Week',
  '2_weeks': '2 Weeks',
  '1_month': '1 Month',
  '3_months': '3 Months',
  '6_months': '6 Months',
  'never': 'Never',
};

function isOverdue(followUpDate) {
  if (!followUpDate) return false;
  return new Date(followUpDate) < new Date();
}

function formatFollowUpDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = d - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `${diffDays}d`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}w`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ContactsCRM({ user, getContacts, getFollowUpsByContact, onUpdateContact }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedFollowUps, setExpandedFollowUps] = useState({});
  const [search, setSearch] = useState('');
  const [collapsedSections, setCollapsedSections] = useState({});

  useEffect(() => {
    if (getContacts && user?.id) {
      setLoading(true);
      Promise.resolve(getContacts(user.id)).then(data => {
        setContacts(data || []);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [getContacts, user?.id]);

  const handleExpand = async (contactId) => {
    if (expandedId === contactId) { setExpandedId(null); return; }
    setExpandedId(contactId);
    if (!expandedFollowUps[contactId] && getFollowUpsByContact) {
      const fups = await Promise.resolve(getFollowUpsByContact(contactId));
      setExpandedFollowUps(prev => ({ ...prev, [contactId]: fups || [] }));
    }
  };

  const toggleSection = (key) => {
    setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filtered = useMemo(() => {
    if (!search) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.property?.toLowerCase().includes(q)
    );
  }, [contacts, search]);

  const overdueCount = useMemo(() =>
    contacts.filter(c => c.pipeline_status !== 'dead' && isOverdue(c.follow_up_date)).length
  , [contacts]);

  const sectionData = useMemo(() => {
    return PIPELINE_SECTIONS.map(section => ({
      ...section,
      contacts: filtered.filter(section.match).sort((a, b) => {
        const aOverdue = isOverdue(a.follow_up_date) ? 0 : 1;
        const bOverdue = isOverdue(b.follow_up_date) ? 0 : 1;
        if (aOverdue !== bOverdue) return aOverdue - bOverdue;
        if (a.follow_up_date && b.follow_up_date) return new Date(a.follow_up_date) - new Date(b.follow_up_date);
        if (a.follow_up_date) return -1;
        if (b.follow_up_date) return 1;
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }),
    }));
  }, [filtered]);

  return (
    <div className="fade-up">
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Contact Pipeline</h2>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>
        Your contact lifecycle — arsenal network, active targets, and closed/dead contacts.
      </p>

      {/* Pipeline Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 0 70px', textAlign: 'center', padding: '14px 10px' }}>
          <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: '#ccc' }}>{contacts.length}</div>
          <div style={{ fontSize: 10, color: '#888' }}>Total</div>
        </div>
        {PIPELINE_SECTIONS.map(s => {
          const count = contacts.filter(s.match).length;
          return (
            <div key={s.key} className="card" style={{ flex: '1 0 70px', textAlign: 'center', padding: '14px 10px' }}>
              <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{count}</div>
              <div style={{ fontSize: 10, color: '#888' }}>{s.label}</div>
            </div>
          );
        })}
        {overdueCount > 0 && (
          <div className="card" style={{ flex: '1 0 70px', textAlign: 'center', padding: '14px 10px', borderColor: 'rgba(233,69,96,0.3)' }}>
            <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: '#e94560' }}>{overdueCount}</div>
            <div style={{ fontSize: 10, color: '#e94560' }}>Overdue</div>
          </div>
        )}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input placeholder="Search contacts..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', fontSize: 13, padding: '8px 12px' }} />
      </div>

      {/* Pipeline Sections */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Loading contacts...</div>
      ) : contacts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🤝</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#888', marginBottom: 4 }}>No contacts yet</div>
          <div style={{ fontSize: 13, color: '#555' }}>
            Add contacts from your daily submission page to build your pipeline.
          </div>
        </div>
      ) : (
        sectionData.map(section => (
          <PipelineSection
            key={section.key}
            section={section}
            collapsed={collapsedSections[section.key]}
            onToggle={() => toggleSection(section.key)}
            expandedId={expandedId}
            expandedFollowUps={expandedFollowUps}
            onExpand={handleExpand}
            onUpdateContact={onUpdateContact}
            onContactUpdated={(id, updates) => setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))}
          />
        ))
      )}
    </div>
  );
}

function PipelineSection({ section, collapsed, onToggle, expandedId, expandedFollowUps, onExpand, onUpdateContact, onContactUpdated }) {
  if (section.contacts.length === 0) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: collapsed ? 0 : 10,
          cursor: 'pointer', userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 14, color: '#555', transition: 'transform 0.2s', transform: collapsed ? 'none' : 'rotate(90deg)' }}>›</span>
        <span style={{ fontSize: 16 }}>{section.icon}</span>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: section.color }}>{section.label}</h3>
        <span className="mono" style={{ fontSize: 12, color: '#555' }}>({section.contacts.length})</span>
        <div style={{ flex: 1, height: 1, background: `${section.color}20` }} />
      </div>

      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {section.contacts.map(contact => (
            <ContactCard
              key={contact.id}
              contact={contact}
              sectionColor={section.color}
              isExpanded={expandedId === contact.id}
              followUps={expandedFollowUps[contact.id] || []}
              onExpand={() => onExpand(contact.id)}
              onUpdateContact={onUpdateContact}
              onContactUpdated={onContactUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ContactCard({ contact, sectionColor, isExpanded, followUps, onExpand, onUpdateContact, onContactUpdated }) {
  const overdue = isOverdue(contact.follow_up_date);
  const followUpText = formatFollowUpDate(contact.follow_up_date);
  const statusInfo = STATUS_LABELS[contact.pipeline_status] || STATUS_LABELS.new;
  const isTarget = contact.contact_group === 'target';
  const isDead = contact.pipeline_status === 'dead';
  const color = isDead ? '#666' : sectionColor;

  return (
    <div className="card" style={{
      padding: 0, transition: 'border-color 0.2s',
      borderColor: overdue ? 'rgba(233,69,96,0.3)' : isExpanded ? `${color}40` : undefined,
    }}>
      <div onClick={onExpand} style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', cursor: 'pointer',
      }}>
        {/* Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: `${color}20`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color,
        }}>
          {contact.name?.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: isDead ? '#777' : '#ddd' }}>{contact.name}</span>
            {isTarget && contact.pipeline_status && contact.pipeline_status !== 'new' && (
              <span style={{
                fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700,
                background: `${statusInfo.color}15`, color: statusInfo.color,
              }}>{statusInfo.label}</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 2, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {contact.property && <span style={{ color: '#e94560' }}>📍 {contact.property}</span>}
            {contact.phone && <span>📞 {contact.phone}</span>}
            {contact.email && <span>✉ {contact.email}</span>}
            {contact.day_added && <span>Day {contact.day_added}</span>}
          </div>
        </div>

        {/* Follow-up badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {followUpText && (
            <span style={{
              fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 700,
              fontFamily: "'DM Mono', monospace",
              background: overdue ? 'rgba(233,69,96,0.15)' : 'rgba(72,199,142,0.1)',
              color: overdue ? '#e94560' : '#48c78e',
              border: `1px solid ${overdue ? 'rgba(233,69,96,0.3)' : 'rgba(72,199,142,0.2)'}`,
            }}>
              {overdue ? '⚠ ' : '📅 '}{followUpText}
            </span>
          )}
          <span style={{ color: '#555', fontSize: 14, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'none' }}>›</span>
        </div>
      </div>

      {isExpanded && (
        <ExpandedDetail
          contact={contact}
          followUps={followUps}
          color={color}
          onUpdateContact={onUpdateContact}
          onContactUpdated={onContactUpdated}
        />
      )}
    </div>
  );
}

function ExpandedDetail({ contact, followUps, color, onUpdateContact, onContactUpdated }) {
  const statusInfo = STATUS_LABELS[contact.pipeline_status] || STATUS_LABELS.new;

  return (
    <div style={{ padding: '0 18px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      {/* Contact Details */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
        <DetailItem label="Group" value={contact.contact_group === 'arsenal' ? 'Arsenal' : 'Target'} />
        <DetailItem label="Status" value={statusInfo.label} color={statusInfo.color} />
        {contact.follow_up_interval && (
          <DetailItem label="Follow-Up Interval" value={INTERVAL_LABELS[contact.follow_up_interval] || contact.follow_up_interval} />
        )}
        {contact.follow_up_date && (
          <DetailItem
            label="Next Follow-Up"
            value={new Date(contact.follow_up_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            color={isOverdue(contact.follow_up_date) ? '#e94560' : '#48c78e'}
          />
        )}
        {contact.last_contact_date && (
          <DetailItem
            label="Last Contact"
            value={new Date(contact.last_contact_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          />
        )}
      </div>

      {contact.notes && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>
          <span style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Notes:</span>
          {contact.notes}
        </div>
      )}

      {/* Follow-Up History */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 8 }}>
          Follow-Up History ({followUps.length})
        </div>
        {followUps.length === 0 ? (
          <div style={{ fontSize: 12, color: '#555', fontStyle: 'italic' }}>No follow-ups recorded yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {followUps.map((f, i) => (
              <div key={f.id || i} style={{
                padding: '8px 12px', borderLeft: `3px solid ${color}`,
                background: 'rgba(255,255,255,0.02)', borderRadius: '0 8px 8px 0',
                fontSize: 13, color: '#bbb',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#48c78e', fontWeight: 600 }}>Day {f.day_number}</span>
                  <span style={{ fontSize: 11, color: '#555' }}>
                    {f.created_at && new Date(f.created_at).toLocaleDateString()}
                  </span>
                </div>
                {f.notes}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({ label, value, color: itemColor }) {
  return (
    <div style={{ minWidth: 80 }}>
      <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: itemColor || '#aaa' }}>{value}</div>
    </div>
  );
}
