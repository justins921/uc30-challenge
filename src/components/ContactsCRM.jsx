import { useState, useEffect, useMemo } from 'react';

const CONTACT_TYPES = [
  { value: 'agent', label: 'Agent' },
  { value: 'property_manager', label: 'Property Manager' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'investor', label: 'Investor' },
  { value: 'direct_seller', label: 'Direct Seller' },
  { value: 'other', label: 'Other' },
];

const TYPE_COLORS = {
  agent: '#e94560',
  property_manager: '#533483',
  wholesaler: '#f0a500',
  investor: '#48c78e',
  direct_seller: '#0f3460',
  other: '#888',
};

export default function ContactsCRM({ user, getContacts, getFollowUpsByContact }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedFollowUps, setExpandedFollowUps] = useState({});
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // recent, name, followups

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

  // Load follow-ups when expanding a contact
  const handleExpand = async (contactId) => {
    if (expandedId === contactId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(contactId);
    if (!expandedFollowUps[contactId] && getFollowUpsByContact) {
      const fups = await Promise.resolve(getFollowUpsByContact(contactId));
      setExpandedFollowUps(prev => ({ ...prev, [contactId]: fups || [] }));
    }
  };

  // Filter & sort
  const filtered = useMemo(() => {
    let result = contacts;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
      );
    }
    if (typeFilter !== 'all') {
      result = result.filter(c => c.contact_type === typeFilter);
    }
    if (sortBy === 'name') {
      result = [...result].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'recent') {
      result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return result;
  }, [contacts, search, typeFilter, sortBy]);

  // Stats
  const totalContacts = contacts.length;
  const typeCounts = {};
  contacts.forEach(c => { typeCounts[c.contact_type] = (typeCounts[c.contact_type] || 0) + 1; });

  return (
    <div className="fade-up">
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Contacts</h2>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>
        Your deal sources and interaction history. All contacts added from your daily submissions.
      </p>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 0 100px', textAlign: 'center', padding: '16px 12px' }}>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#e94560' }}>{totalContacts}</div>
          <div style={{ fontSize: 11, color: '#888' }}>Total Contacts</div>
        </div>
        {CONTACT_TYPES.slice(0, 4).map(t => (
          <div key={t.value} className="card" style={{ flex: '1 0 80px', textAlign: 'center', padding: '16px 12px' }}>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: TYPE_COLORS[t.value] }}>{typeCounts[t.value] || 0}</div>
            <div style={{ fontSize: 10, color: '#888' }}>{t.label}s</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <input placeholder="Search contacts..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: '1 0 200px', fontSize: 13, padding: '8px 12px' }} />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ fontSize: 12, padding: '8px 10px' }}>
          <option value="all">All Types</option>
          {CONTACT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ fontSize: 12, padding: '8px 10px' }}>
          <option value="recent">Most Recent</option>
          <option value="name">By Name</option>
        </select>
      </div>

      {/* Contact List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Loading contacts...</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🤝</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#888', marginBottom: 4 }}>
            {contacts.length === 0 ? 'No contacts yet' : 'No matching contacts'}
          </div>
          <div style={{ fontSize: 13, color: '#555' }}>
            {contacts.length === 0
              ? 'Add deal sources from your daily submission page to build your CRM.'
              : 'Try adjusting your search or filters.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(contact => {
            const isExpanded = expandedId === contact.id;
            const fups = expandedFollowUps[contact.id] || [];
            const typeLabel = CONTACT_TYPES.find(t => t.value === contact.contact_type)?.label || contact.contact_type;
            const typeColor = TYPE_COLORS[contact.contact_type] || '#888';

            return (
              <div key={contact.id} className="card" style={{
                padding: 0, cursor: 'pointer', transition: 'border-color 0.2s',
                borderColor: isExpanded ? `${typeColor}40` : undefined,
              }}>
                {/* Contact Row */}
                <div onClick={() => handleExpand(contact.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: `${typeColor}20`, border: `1px solid ${typeColor}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: typeColor,
                  }}>
                    {contact.name?.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#ddd' }}>{contact.name}</span>
                      <span style={{
                        fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700,
                        background: `${typeColor}15`, color: typeColor,
                      }}>{typeLabel}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 2, display: 'flex', gap: 12 }}>
                      {contact.phone && <span>📞 {contact.phone}</span>}
                      {contact.email && <span>✉ {contact.email}</span>}
                      <span>Day {contact.day_added}</span>
                    </div>
                  </div>

                  {/* Expand indicator */}
                  <span style={{ color: '#555', fontSize: 14, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'none' }}>›</span>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={{ padding: '0 18px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    {contact.notes && (
                      <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>
                        <span style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Initial notes:</span>
                        {contact.notes}
                      </div>
                    )}

                    {/* Follow-up History */}
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 8 }}>
                        Follow-Up History ({fups.length})
                      </div>
                      {fups.length === 0 ? (
                        <div style={{ fontSize: 12, color: '#555', fontStyle: 'italic' }}>No follow-ups recorded yet.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {fups.map((f, i) => (
                            <div key={f.id || i} style={{
                              padding: '8px 12px', borderLeft: `3px solid ${typeColor}`,
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
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
