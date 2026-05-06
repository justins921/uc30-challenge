import { useState, useEffect, useMemo } from 'react';

const CONTACT_GROUPS = [
  { value: 'target', label: 'Target Contacts', color: '#e94560', desc: 'Deal sources — agents, wholesalers, property managers, sellers' },
  { value: 'arsenal', label: 'Arsenal Contacts', color: '#f0a500', desc: 'Broader network — investors, mentors, peers, meetup contacts' },
  { value: 'team', label: 'My Team', color: '#48c78e', desc: 'Service providers — lenders, attorneys, inspectors, contractors' },
];

export { CONTACT_GROUPS };

const GROUP_COLORS = { target: '#e94560', arsenal: '#f0a500', team: '#48c78e' };

export default function ContactsCRM({ user, getContacts, getFollowUpsByContact }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedFollowUps, setExpandedFollowUps] = useState({});
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

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
    if (groupFilter !== 'all') {
      result = result.filter(c => c.contact_group === groupFilter);
    }
    if (sortBy === 'name') {
      result = [...result].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'recent') {
      result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return result;
  }, [contacts, search, groupFilter, sortBy]);

  const groupCounts = {};
  contacts.forEach(c => { groupCounts[c.contact_group || 'target'] = (groupCounts[c.contact_group || 'target'] || 0) + 1; });

  return (
    <div className="fade-up">
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Contacts</h2>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>
        Your deal sources, network, and service providers. All contacts added from your daily submissions.
      </p>

      {/* Group Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 0 80px', textAlign: 'center', padding: '14px 10px' }}>
          <div className="mono" style={{ fontSize: 26, fontWeight: 700, color: '#e94560' }}>{contacts.length}</div>
          <div style={{ fontSize: 10, color: '#888' }}>Total</div>
        </div>
        {CONTACT_GROUPS.map(g => (
          <div key={g.value} className="card" style={{
            flex: '1 0 80px', textAlign: 'center', padding: '14px 10px', cursor: 'pointer',
            borderColor: groupFilter === g.value ? `${g.color}40` : undefined,
          }} onClick={() => setGroupFilter(groupFilter === g.value ? 'all' : g.value)}>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: g.color }}>{groupCounts[g.value] || 0}</div>
            <div style={{ fontSize: 10, color: '#888' }}>{g.label.replace(' Contacts', '').replace('My ', '')}</div>
          </div>
        ))}
      </div>

      {/* Search & Sort */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <input placeholder="Search contacts..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: '1 0 200px', fontSize: 13, padding: '8px 12px' }} />
        <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)}
          style={{ fontSize: 12, padding: '8px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#ccc' }}>
          <option value="all">All Groups</option>
          {CONTACT_GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ fontSize: 12, padding: '8px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#ccc' }}>
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
              ? 'Add contacts from your daily submission page to build your CRM.'
              : 'Try adjusting your search or filters.'}
          </div>
        </div>
      ) : groupFilter !== 'all' ? (
        <ContactList contacts={filtered} expandedId={expandedId} expandedFollowUps={expandedFollowUps} onExpand={handleExpand} />
      ) : (
        CONTACT_GROUPS.map(g => {
          const groupContacts = filtered.filter(c => (c.contact_group || 'target') === g.value);
          if (groupContacts.length === 0) return null;
          return (
            <div key={g.value} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: g.color }} />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#ccc' }}>{g.label}</h3>
                <span style={{ fontSize: 11, color: '#555' }}>({groupContacts.length})</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              </div>
              <ContactList contacts={groupContacts} expandedId={expandedId} expandedFollowUps={expandedFollowUps} onExpand={handleExpand} />
            </div>
          );
        })
      )}
    </div>
  );
}

function ContactList({ contacts, expandedId, expandedFollowUps, onExpand }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {contacts.map(contact => {
        const isExpanded = expandedId === contact.id;
        const fups = expandedFollowUps[contact.id] || [];
        const group = CONTACT_GROUPS.find(g => g.value === contact.contact_group) || CONTACT_GROUPS[0];
        const color = group.color;

        return (
          <div key={contact.id} className="card" style={{
            padding: 0, cursor: 'pointer', transition: 'border-color 0.2s',
            borderColor: isExpanded ? `${color}40` : undefined,
          }}>
            <div onClick={() => onExpand(contact.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: `${color}20`, border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color,
              }}>
                {contact.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#ddd' }}>{contact.name}</span>
                  <span style={{
                    fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700,
                    background: `${color}15`, color,
                  }}>{group.label.replace(' Contacts', '').replace('My ', '')}</span>
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 2, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {contact.phone && <span>📞 {contact.phone}</span>}
                  {contact.email && <span>✉ {contact.email}</span>}
                  {contact.day_added && <span>Day {contact.day_added}</span>}
                </div>
              </div>
              <span style={{ color: '#555', fontSize: 14, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'none' }}>›</span>
            </div>

            {isExpanded && (
              <div style={{ padding: '0 18px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                {contact.notes && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>
                    <span style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Notes:</span>
                    {contact.notes}
                  </div>
                )}

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
            )}
          </div>
        );
      })}
    </div>
  );
}
