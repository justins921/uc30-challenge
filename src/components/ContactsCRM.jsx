import { useState, useEffect, useMemo } from 'react';
import { calculateFollowUpDate, validatePhone } from '../utils/storage';

export const CONTACT_GROUPS = [
  { value: 'target', label: 'Target Contacts', color: '#e94560', desc: 'Deal sources — property owners, sellers, listing agents tied to specific properties' },
  { value: 'arsenal', label: 'Arsenal Contacts', color: '#f0a500', desc: 'Ecosystem relationships — property managers, lenders, contractors, investors, wholesalers' },
  { value: 'cold_follow_up', label: 'Cold Follow Ups', color: '#9b7fd4', desc: 'Not interested now — check back later. One property tied to each contact.' },
];

const ARSENAL_TYPES = [
  { value: 'realtor', label: 'Realtor' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'property_manager', label: 'Property Manager' },
  { value: 'lender', label: 'Lender' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'investor', label: 'Investor' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'attorney', label: 'Attorney' },
  { value: 'inspector', label: 'Inspector' },
  { value: 'appraiser', label: 'Appraiser' },
  { value: 'title_company', label: 'Title Company' },
  { value: 'insurance', label: 'Insurance Agent' },
  { value: 'other', label: 'Other' },
];

const ARSENAL_TYPE_LABELS = Object.fromEntries(ARSENAL_TYPES.map(t => [t.value, t.label]));

const STATUS_LABELS = {
  new: { label: 'New', color: '#888' },
  active: { label: 'Active', color: '#48c78e' },
  target_property: { label: 'Active', color: '#48c78e' },
  under_contract: { label: 'Under Contract', color: '#6b8afd' },
  closed: { label: 'Closed', color: '#d4a843' },
  dead: { label: 'Dead', color: '#666' },
};

const INTERVAL_LABELS = {
  '1_day': '1 Day', '2_days': '2 Days', '3_days': '3 Days', '1_week': '1 Week', '2_weeks': '2 Weeks',
  '1_month': '1 Month', '3_months': '3 Months', '6_months': '6 Months', 'never': 'Never',
};

const FOLLOW_UP_OPTIONS = [
  { value: '1_day', label: '1 Day' }, { value: '3_days', label: '3 Days' },
  { value: '1_week', label: '1 Week' }, { value: '2_weeks', label: '2 Weeks' },
  { value: '1_month', label: '1 Month' }, { value: '6_months', label: '6 Months' },
  { value: 'never', label: 'Never' },
];

const DEAD_FOLLOW_UP_OPTIONS = [
  { value: 'dead_1_month', label: '1 Month' },
  { value: 'dead_3_months', label: '3 Months' },
  { value: 'dead_6_months', label: '6 Months' },
];

const COLD_FOLLOW_UP_OPTIONS = [
  { value: '1_month', label: '1 Month' },
  { value: '3_months', label: '3 Months' },
  { value: '6_months', label: '6 Months' },
];

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

function sortByFollowUp(a, b) {
  const aOverdue = isOverdue(a.follow_up_date) ? 0 : 1;
  const bOverdue = isOverdue(b.follow_up_date) ? 0 : 1;
  if (aOverdue !== bOverdue) return aOverdue - bOverdue;
  if (a.follow_up_date && b.follow_up_date) return new Date(a.follow_up_date) - new Date(b.follow_up_date);
  if (a.follow_up_date) return -1;
  if (b.follow_up_date) return 1;
  return new Date(b.created_at || 0) - new Date(a.created_at || 0);
}

export default function ContactsCRM({ user, getContacts, getFollowUpsByContact, onUpdateContact, onAddContact, onAddFollowUp, onPropertyUnderContract }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedFollowUps, setExpandedFollowUps] = useState({});
  const [search, setSearch] = useState('');
  const [collapsedSections, setCollapsedSections] = useState({});
  const [activeTab, setActiveTab] = useState('arsenal');

  // Add contact form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formZip, setFormZip] = useState('');
  const [formPropertyDetails, setFormPropertyDetails] = useState('');
  const [formFollowUp, setFormFollowUp] = useState('');
  const [formAlsoProperty, setFormAlsoProperty] = useState(false);
  const [formAlsoArsenal, setFormAlsoArsenal] = useState(false);
  const [formArsenalFollowUp, setFormArsenalFollowUp] = useState('');
  const [formArsenalType, setFormArsenalType] = useState('');
  const [formLeadSrcName, setFormLeadSrcName] = useState('');
  const [formLeadSrcPhone, setFormLeadSrcPhone] = useState('');
  const [formLeadSrcEmail, setFormLeadSrcEmail] = useState('');
  const [formLeadSrcType, setFormLeadSrcType] = useState('');
  const [formOwnerName, setFormOwnerName] = useState('');
  const [formOwnerPhone, setFormOwnerPhone] = useState('');
  const [formOwnerEmail, setFormOwnerEmail] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [formPhoneError, setFormPhoneError] = useState('');
  const [formLeadSrcPhoneError, setFormLeadSrcPhoneError] = useState('');
  const [formOwnerPhoneError, setFormOwnerPhoneError] = useState('');

  const resetForm = () => {
    setFormName(''); setFormPhone(''); setFormEmail(''); setFormNotes('');
    setFormStreet(''); setFormCity(''); setFormState(''); setFormZip('');
    setFormPropertyDetails(''); setFormFollowUp(''); setFormArsenalFollowUp('');
    setFormAlsoProperty(false); setFormAlsoArsenal(false);
    setFormArsenalType(''); setFormPhoneError(''); setFormLeadSrcPhoneError(''); setFormOwnerPhoneError(''); setShowAddForm(false);
    setFormLeadSrcName(''); setFormLeadSrcPhone(''); setFormLeadSrcEmail('');
    setFormLeadSrcType(''); setFormOwnerName(''); setFormOwnerPhone(''); setFormOwnerEmail('');
  };

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

  const onContactUpdated = (id, updates) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const onContactAdded = (newContact) => {
    setContacts(prev => [newContact, ...prev]);
  };

  const onFollowUpLogged = (contactId, followUp) => {
    setExpandedFollowUps(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), followUp],
    }));
  };

  const handleAddFromCRM = async () => {
    const isArsenal = activeTab === 'arsenal';
    const isColdFollowUp = activeTab === 'cold_follow_ups';
    const isTargetProp = !isArsenal && !isColdFollowUp;

    if (isTargetProp) {
      if (!(formLeadSrcName.trim() || formOwnerName.trim()) || !formFollowUp) return;
    } else {
      if (!formName.trim() || !formFollowUp) return;
    }
    if (isArsenal && !formNotes.trim()) return;

    if (isArsenal || isColdFollowUp) {
      const phoneCheck = validatePhone(formPhone, { required: true });
      if (!phoneCheck.valid) { setFormPhoneError(phoneCheck.error); return; }
      setFormPhoneError('');
    }
    if (isTargetProp) {
      const leadPhoneCheck = validatePhone(formLeadSrcPhone);
      if (!leadPhoneCheck.valid) { setFormLeadSrcPhoneError(leadPhoneCheck.error); return; }
      setFormLeadSrcPhoneError('');
      const ownerPhoneCheck = validatePhone(formOwnerPhone);
      if (!ownerPhoneCheck.valid) { setFormOwnerPhoneError(ownerPhoneCheck.error); return; }
      setFormOwnerPhoneError('');
    }
    const formattedPhone = isTargetProp ? null : validatePhone(formPhone, { required: true }).formatted;

    setFormSaving(true);
    const now = new Date().toISOString();

    if (isColdFollowUp) {
      const propAddr = [formStreet.trim(), formCity.trim(), formState.trim(), formZip.trim()].filter(Boolean).join(', ');
      const result = await onAddContact({
        name: formName.trim(), phone: formattedPhone, email: null,
        contact_group: 'cold_follow_up', property: propAddr || null, notes: formNotes.trim() || null,
        pipeline_status: 'new',
        follow_up_interval: formFollowUp,
        follow_up_date: calculateFollowUpDate(formFollowUp),
        last_contact_date: now,
      });
      if (result?.success && result.contact) setContacts(prev => [result.contact, ...prev]);
    } else if (isArsenal) {
      const result = await onAddContact({
        name: formName.trim(),
        phone: formattedPhone,
        email: formEmail.trim() || null,
        contact_group: 'arsenal',
        property: null,
        notes: formNotes.trim(),
        arsenal_type: formArsenalType || null,
        pipeline_status: 'new',
        follow_up_interval: formFollowUp,
        follow_up_date: calculateFollowUpDate(formFollowUp),
        last_contact_date: now,
      });
      if (result?.success && result.contact) {
        setContacts(prev => [result.contact, ...prev]);
        if (formAlsoProperty && formStreet.trim()) {
          const propAddr = [formStreet.trim(), formCity.trim(), formState.trim(), formZip.trim()].filter(Boolean).join(', ');
          const propResult = await onAddContact({
            name: formName.trim(), phone: formattedPhone, email: formEmail.trim() || null,
            contact_group: 'target', property: propAddr, notes: formPropertyDetails.trim() || null,
            pipeline_status: 'active',
            follow_up_interval: formArsenalFollowUp || '1_week',
            follow_up_date: calculateFollowUpDate(formArsenalFollowUp || '1_week'),
            last_contact_date: now, source_contact_id: result.contact.id,
          });
          if (propResult?.success && propResult.contact) setContacts(prev => [propResult.contact, ...prev]);
        }
      }
    } else {
      const propAddr = [formStreet.trim(), formCity.trim(), formState.trim(), formZip.trim()].filter(Boolean).join(', ');
      const isDead = formFollowUp?.startsWith('dead_');
      const actualInterval = isDead ? formFollowUp.replace('dead_', '') : formFollowUp;
      const primaryName = formLeadSrcName.trim() || formOwnerName.trim();
      const formattedLeadSrcPhone = validatePhone(formLeadSrcPhone).formatted;
      const formattedOwnerPhone = validatePhone(formOwnerPhone).formatted;
      const primaryPhone = formattedLeadSrcPhone || formattedOwnerPhone || null;
      const primaryEmail = formLeadSrcEmail.trim() || formOwnerEmail.trim() || null;
      const result = await onAddContact({
        name: primaryName, phone: primaryPhone, email: primaryEmail,
        contact_group: 'target', property: propAddr || null, notes: formNotes.trim() || null,
        pipeline_status: isDead ? 'dead' : 'active',
        follow_up_interval: actualInterval,
        follow_up_date: calculateFollowUpDate(actualInterval),
        last_contact_date: now,
        lead_source_name: formLeadSrcName.trim() || null,
        lead_source_phone: formattedLeadSrcPhone,
        lead_source_email: formLeadSrcEmail.trim() || null,
        lead_source_type: formLeadSrcType || null,
        owner_name: formOwnerName.trim() || null,
        owner_phone: formattedOwnerPhone,
        owner_email: formOwnerEmail.trim() || null,
      });
      if (result?.success && result.contact) {
        setContacts(prev => [result.contact, ...prev]);
      }
    }
    setFormSaving(false);
    resetForm();
  };

  const filtered = useMemo(() => {
    if (!search) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(c =>
      c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q) || c.property?.toLowerCase().includes(q)
    );
  }, [contacts, search]);

  const arsenalContacts = useMemo(() =>
    filtered.filter(c => c.contact_group === 'arsenal').sort(sortByFollowUp), [filtered]);
  const targetProperties = useMemo(() =>
    filtered.filter(c => c.contact_group === 'target').sort(sortByFollowUp), [filtered]);

  const activeTargets = targetProperties.filter(c => !c.pipeline_status || c.pipeline_status === 'new' || c.pipeline_status === 'active' || c.pipeline_status === 'target_property');
  const underContract = targetProperties.filter(c => c.pipeline_status === 'under_contract');
  const closedDeals = targetProperties.filter(c => c.pipeline_status === 'closed');
  const deadTargets = targetProperties.filter(c => c.pipeline_status === 'dead');

  const coldFollowUps = useMemo(() =>
    filtered.filter(c => c.contact_group === 'cold_follow_up').sort(sortByFollowUp), [filtered]);

  const overdueCount = useMemo(() =>
    contacts.filter(c => c.contact_group !== 'cold_follow_up' && c.pipeline_status !== 'dead' && isOverdue(c.follow_up_date)).length, [contacts]);

  const coldFollowUpOverdueCount = useMemo(() =>
    contacts.filter(c => c.contact_group === 'cold_follow_up' && isOverdue(c.follow_up_date)).length, [contacts]);

  const linkedPropertyCount = (arsenalId) =>
    contacts.filter(c => c.contact_group === 'target' && c.source_contact_id === arsenalId).length;

  const tabColor = activeTab === 'arsenal' ? '#f0a500' : activeTab === 'cold_follow_ups' ? '#9b7fd4' : '#e94560';

  return (
    <div className="fade-up">
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Contact Pipeline</h2>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>Your arsenal network and active target properties.</p>

      {/* Pipeline Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 0 70px', textAlign: 'center', padding: '14px 10px' }}>
          <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: '#ccc' }}>{contacts.length}</div>
          <div style={{ fontSize: 10, color: '#888' }}>Total</div>
        </div>
        <div className="card" style={{ flex: '1 0 70px', textAlign: 'center', padding: '14px 10px' }}>
          <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: '#f0a500' }}>{contacts.filter(c => c.contact_group === 'arsenal').length}</div>
          <div style={{ fontSize: 10, color: '#888' }}>Arsenal</div>
        </div>
        <div className="card" style={{ flex: '1 0 70px', textAlign: 'center', padding: '14px 10px' }}>
          <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: '#e94560' }}>{contacts.filter(c => c.contact_group === 'target' && c.pipeline_status !== 'dead').length}</div>
          <div style={{ fontSize: 10, color: '#888' }}>Properties</div>
        </div>
        {overdueCount > 0 && (
          <div className="card" style={{ flex: '1 0 70px', textAlign: 'center', padding: '14px 10px', borderColor: 'rgba(233,69,96,0.3)' }}>
            <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: '#e94560' }}>{overdueCount}</div>
            <div style={{ fontSize: 10, color: '#e94560' }}>Overdue</div>
          </div>
        )}
      </div>

      {/* Search */}
      <input placeholder="Search contacts & properties..." value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', fontSize: 13, padding: '8px 12px', marginBottom: 20 }} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { id: 'arsenal', label: 'Arsenal Contacts', color: '#f0a500', count: arsenalContacts.length },
          { id: 'targets', label: 'Target Properties', color: '#e94560', count: targetProperties.length },
          { id: 'cold_follow_ups', label: 'Cold Follow Ups', color: '#9b7fd4', count: coldFollowUps.length, badge: coldFollowUpOverdueCount },
        ].map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); resetForm(); }} style={{
            flex: 1, padding: '12px 12px', borderRadius: 10, fontSize: 12, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", border: 'none', fontWeight: 600,
            background: activeTab === tab.id ? `${tab.color}15` : 'rgba(255,255,255,0.03)',
            color: activeTab === tab.id ? tab.color : '#888',
            outline: activeTab === tab.id ? `1px solid ${tab.color}30` : '1px solid rgba(255,255,255,0.06)',
            position: 'relative',
          }}>
            {tab.label} ({tab.count})
            {tab.badge > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16,
                borderRadius: 8, background: '#e94560', color: '#fff', fontSize: 9,
                fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px',
              }}>{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Add Contact Button */}
      {onAddContact && (
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => showAddForm ? resetForm() : setShowAddForm(true)} style={{
            width: '100%', padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", border: 'none',
            background: showAddForm ? `${tabColor}30` : `${tabColor}15`, color: tabColor,
          }}>
            {showAddForm ? '✕ Close Form' : activeTab === 'arsenal' ? '+ Add Arsenal Contact' : activeTab === 'cold_follow_ups' ? '+ Add Cold Follow Up' : '+ Add Target Property'}
          </button>
        </div>
      )}

      {/* Inline Add Form */}
      {showAddForm && <AddContactForm
        activeTab={activeTab} tabColor={tabColor}
        formName={formName} setFormName={setFormName}
        formPhone={formPhone} setFormPhone={setFormPhone}
        formEmail={formEmail} setFormEmail={setFormEmail}
        formNotes={formNotes} setFormNotes={setFormNotes}
        formStreet={formStreet} setFormStreet={setFormStreet}
        formCity={formCity} setFormCity={setFormCity}
        formState={formState} setFormState={setFormState}
        formZip={formZip} setFormZip={setFormZip}
        formPropertyDetails={formPropertyDetails} setFormPropertyDetails={setFormPropertyDetails}
        formFollowUp={formFollowUp} setFormFollowUp={setFormFollowUp}
        formAlsoProperty={formAlsoProperty} setFormAlsoProperty={setFormAlsoProperty}
        formAlsoArsenal={formAlsoArsenal} setFormAlsoArsenal={setFormAlsoArsenal}
        formArsenalFollowUp={formArsenalFollowUp} setFormArsenalFollowUp={setFormArsenalFollowUp}
        formArsenalType={formArsenalType} setFormArsenalType={setFormArsenalType}
        formLeadSrcName={formLeadSrcName} setFormLeadSrcName={setFormLeadSrcName}
        formLeadSrcPhone={formLeadSrcPhone} setFormLeadSrcPhone={setFormLeadSrcPhone}
        formLeadSrcEmail={formLeadSrcEmail} setFormLeadSrcEmail={setFormLeadSrcEmail}
        formLeadSrcType={formLeadSrcType} setFormLeadSrcType={setFormLeadSrcType}
        formOwnerName={formOwnerName} setFormOwnerName={setFormOwnerName}
        formOwnerPhone={formOwnerPhone} setFormOwnerPhone={setFormOwnerPhone}
        formOwnerEmail={formOwnerEmail} setFormOwnerEmail={setFormOwnerEmail}
        formSaving={formSaving}
        formPhoneError={formPhoneError} setFormPhoneError={setFormPhoneError}
        formLeadSrcPhoneError={formLeadSrcPhoneError} setFormLeadSrcPhoneError={setFormLeadSrcPhoneError}
        formOwnerPhoneError={formOwnerPhoneError} setFormOwnerPhoneError={setFormOwnerPhoneError}
        onSave={handleAddFromCRM} onCancel={resetForm}
      />}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Loading contacts...</div>
      ) : activeTab === 'arsenal' ? (
        arsenalContacts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 13, color: '#666' }}>No arsenal contacts yet. Use the button above to add one.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {arsenalContacts.map(contact => (
              <ArsenalCard key={contact.id} contact={contact}
                linkedProperties={linkedPropertyCount(contact.id)}
                isExpanded={expandedId === contact.id}
                followUps={expandedFollowUps[contact.id] || []}
                onExpand={() => handleExpand(contact.id)}
                onUpdateContact={onUpdateContact}
                onContactUpdated={onContactUpdated}
                onAddContact={onAddContact}
                onContactAdded={onContactAdded}
                onAddFollowUp={onAddFollowUp}
                onFollowUpLogged={onFollowUpLogged}
                user={user}
                allContacts={contacts}
              />
            ))}
          </div>
        )
      ) : activeTab === 'cold_follow_ups' ? (
        coldFollowUps.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>No cold follow ups yet.</div>
            <div style={{ fontSize: 12, color: '#555' }}>For contacts who said "not interested right now" — add them here with a future follow-up date and check back when the time comes.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {coldFollowUps.map(contact => (
              <ColdFollowUpCard key={contact.id} contact={contact}
                isExpanded={expandedId === contact.id}
                followUps={expandedFollowUps[contact.id] || []}
                onExpand={() => handleExpand(contact.id)}
                onUpdateContact={onUpdateContact}
                onContactUpdated={onContactUpdated}
                onAddContact={onAddContact}
                onContactAdded={onContactAdded}
                onAddFollowUp={onAddFollowUp}
                onFollowUpLogged={onFollowUpLogged}
                user={user}
                setContacts={setContacts}
              />
            ))}
          </div>
        )
      ) : (
        targetProperties.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 13, color: '#666' }}>No target properties yet. Use the button above to add one.</div>
          </div>
        ) : (
          <>
            {[
              { label: 'Active', items: activeTargets, color: '#48c78e', key: 'active' },
              { label: 'Under Contract', items: underContract, color: '#6b8afd', key: 'under_contract' },
              { label: 'Closed', items: closedDeals, color: '#d4a843', key: 'closed' },
              { label: 'Dead', items: deadTargets, color: '#666', key: 'dead' },
            ].filter(s => s.items.length > 0).map(section => (
              <div key={section.key} style={{ marginBottom: 24 }}>
                <div onClick={() => toggleSection(section.key)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginBottom: collapsedSections[section.key] ? 0 : 10,
                  cursor: 'pointer', userSelect: 'none',
                }}>
                  <span style={{ fontSize: 14, color: '#555', transition: 'transform 0.2s', transform: collapsedSections[section.key] ? 'none' : 'rotate(90deg)' }}>›</span>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: section.color }}>{section.label}</h3>
                  <span className="mono" style={{ fontSize: 12, color: '#555' }}>({section.items.length})</span>
                  <div style={{ flex: 1, height: 1, background: `${section.color}20` }} />
                </div>
                {!collapsedSections[section.key] && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {section.items.map(contact => (
                      <TargetPropertyCard key={contact.id} contact={contact}
                        isExpanded={expandedId === contact.id}
                        followUps={expandedFollowUps[contact.id] || []}
                        onExpand={() => handleExpand(contact.id)}
                        onUpdateContact={onUpdateContact}
                        onContactUpdated={onContactUpdated}
                        onAddContact={onAddContact}
                        onContactAdded={onContactAdded}
                        onAddFollowUp={onAddFollowUp}
                        onFollowUpLogged={onFollowUpLogged}
                        onPropertyUnderContract={onPropertyUnderContract}
                        user={user}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )
      )}
    </div>
  );
}

/* ═══ Add Contact Form ═══ */
function AddContactForm({ activeTab, tabColor, formName, setFormName, formPhone, setFormPhone, formEmail, setFormEmail, formNotes, setFormNotes, formStreet, setFormStreet, formCity, setFormCity, formState, setFormState, formZip, setFormZip, formPropertyDetails, setFormPropertyDetails, formFollowUp, setFormFollowUp, formAlsoProperty, setFormAlsoProperty, formAlsoArsenal, setFormAlsoArsenal, formArsenalFollowUp, setFormArsenalFollowUp, formArsenalType, setFormArsenalType, formLeadSrcName, setFormLeadSrcName, formLeadSrcPhone, setFormLeadSrcPhone, formLeadSrcEmail, setFormLeadSrcEmail, formLeadSrcType, setFormLeadSrcType, formOwnerName, setFormOwnerName, formOwnerPhone, setFormOwnerPhone, formOwnerEmail, setFormOwnerEmail, formSaving, formPhoneError, setFormPhoneError, formLeadSrcPhoneError, setFormLeadSrcPhoneError, formOwnerPhoneError, setFormOwnerPhoneError, onSave, onCancel }) {
  const isArsenal = activeTab === 'arsenal';
  const isColdFollowUp = activeTab === 'cold_follow_ups';
  const isTargetProp = !isArsenal && !isColdFollowUp;
  const hasLeadOrOwner = formLeadSrcName?.trim() || formOwnerName?.trim();
  const canSave = isTargetProp
    ? hasLeadOrOwner && formFollowUp
    : formName.trim() && formFollowUp && (isArsenal ? formNotes.trim() : true);

  return (
    <div className="card" style={{ padding: 20, marginBottom: 20, borderColor: `${tabColor}30` }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: tabColor, marginBottom: 16 }}>
        {isArsenal ? 'New Arsenal Contact' : isColdFollowUp ? 'New Cold Follow Up' : 'New Target Property'}
      </div>

      {/* Arsenal + Cold Follow Up: single contact */}
      {!isTargetProp && (
        <>
          <input placeholder="Name *" value={formName} onChange={e => setFormName(e.target.value)}
            style={{ width: '100%', fontSize: 13, padding: '10px 12px', marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: formPhoneError ? 4 : 10 }}>
            <input type="tel" placeholder="Phone # (required)" value={formPhone}
              onChange={e => { setFormPhone(e.target.value); if (setFormPhoneError) setFormPhoneError(''); }}
              style={{ flex: 1, fontSize: 13, padding: '10px 12px', borderColor: formPhoneError ? 'rgba(233,69,96,0.5)' : undefined }} />
            <input placeholder="Email" value={formEmail} onChange={e => setFormEmail(e.target.value)}
              style={{ flex: 1, fontSize: 13, padding: '10px 12px' }} />
          </div>
          {formPhoneError && <div style={{ fontSize: 11, color: '#e94560', marginBottom: 10 }}>{formPhoneError}</div>}
        </>
      )}

      {/* Arsenal Type dropdown */}
      {isArsenal && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Contact Type</div>
          <select value={formArsenalType} onChange={e => setFormArsenalType(e.target.value)}
            style={{ width: '100%', fontSize: 13, padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#ddd', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
            <option value="">Select type...</option>
            {ARSENAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      )}

      {/* Target Property: Lead Source + Owner dual sections replace single contact */}
      {isTargetProp && (
        <>
          <div style={{ padding: '12px 14px', marginBottom: 10, background: 'rgba(240,165,0,0.04)', borderRadius: 8, border: '1px solid rgba(240,165,0,0.1)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f0a500', marginBottom: 8 }}>Lead Source</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: formLeadSrcPhoneError ? 4 : 6 }}>
              <input placeholder="Name" value={formLeadSrcName} onChange={e => setFormLeadSrcName(e.target.value)}
                style={{ flex: '1 1 140px', fontSize: 12, padding: '8px 10px' }} />
              <input type="tel" placeholder="Phone" value={formLeadSrcPhone}
                onChange={e => { setFormLeadSrcPhone(e.target.value); if (setFormLeadSrcPhoneError) setFormLeadSrcPhoneError(''); }}
                style={{ flex: '1 1 110px', fontSize: 12, padding: '8px 10px', borderColor: formLeadSrcPhoneError ? 'rgba(233,69,96,0.5)' : undefined }} />
              <input placeholder="Email" value={formLeadSrcEmail} onChange={e => setFormLeadSrcEmail(e.target.value)}
                style={{ flex: '1 1 140px', fontSize: 12, padding: '8px 10px' }} />
            </div>
            {formLeadSrcPhoneError && <div style={{ fontSize: 11, color: '#e94560', marginBottom: 6 }}>{formLeadSrcPhoneError}</div>}
            <select value={formLeadSrcType} onChange={e => setFormLeadSrcType(e.target.value)}
              style={{ width: '100%', fontSize: 12, padding: '8px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#ddd', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
              <option value="">Source type...</option>
              {ARSENAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div style={{ padding: '12px 14px', marginBottom: 10, background: 'rgba(107,138,253,0.04)', borderRadius: 8, border: '1px solid rgba(107,138,253,0.1)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6b8afd', marginBottom: 8 }}>Owner / Seller</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: formOwnerPhoneError ? 4 : 0 }}>
              <input placeholder="Name" value={formOwnerName} onChange={e => setFormOwnerName(e.target.value)}
                style={{ flex: '1 1 140px', fontSize: 12, padding: '8px 10px' }} />
              <input type="tel" placeholder="Phone" value={formOwnerPhone}
                onChange={e => { setFormOwnerPhone(e.target.value); if (setFormOwnerPhoneError) setFormOwnerPhoneError(''); }}
                style={{ flex: '1 1 110px', fontSize: 12, padding: '8px 10px', borderColor: formOwnerPhoneError ? 'rgba(233,69,96,0.5)' : undefined }} />
              <input placeholder="Email" value={formOwnerEmail} onChange={e => setFormOwnerEmail(e.target.value)}
                style={{ flex: '1 1 140px', fontSize: 12, padding: '8px 10px' }} />
            </div>
            {formOwnerPhoneError && <div style={{ fontSize: 11, color: '#e94560', marginBottom: 4 }}>{formOwnerPhoneError}</div>}
          </div>
          <div style={{ fontSize: 10, color: '#555', marginBottom: 10, fontStyle: 'italic' }}>Fill out at least one — Lead Source or Owner</div>
        </>
      )}

      {/* Property address for target properties and cold follow-ups */}
      {(isTargetProp || isColdFollowUp) && (
        <>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Property Address</div>
          <input placeholder="Street" value={formStreet} onChange={e => setFormStreet(e.target.value)}
            style={{ width: '100%', fontSize: 13, padding: '10px 12px', marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input placeholder="City" value={formCity} onChange={e => setFormCity(e.target.value)} style={{ flex: 2, fontSize: 13, padding: '10px 12px' }} />
            <input placeholder="State" value={formState} onChange={e => setFormState(e.target.value)} style={{ flex: 1, fontSize: 13, padding: '10px 12px' }} />
            <input placeholder="Zip" value={formZip} onChange={e => setFormZip(e.target.value)} style={{ flex: 1, fontSize: 13, padding: '10px 12px' }} />
          </div>
        </>
      )}

      <textarea placeholder={isArsenal ? "Notes (required) — how you know them, what they do..." : "Notes"}
        value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={2}
        style={{ width: '100%', fontSize: 13, padding: '10px 12px', marginBottom: 10, resize: 'vertical' }} />

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Follow-Up Schedule *</div>
        {isColdFollowUp ? (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {COLD_FOLLOW_UP_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setFormFollowUp(opt.value)} style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", border: 'none',
                background: formFollowUp === opt.value ? 'rgba(155,127,212,0.2)' : 'rgba(255,255,255,0.05)',
                color: formFollowUp === opt.value ? '#9b7fd4' : '#888',
              }}>{opt.label}</button>
            ))}
          </div>
        ) : !isArsenal ? (
          <>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>Active Lead</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {FOLLOW_UP_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setFormFollowUp(opt.value)} style={{
                  padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", border: 'none',
                  background: formFollowUp === opt.value ? 'rgba(233,69,96,0.2)' : 'rgba(255,255,255,0.05)',
                  color: formFollowUp === opt.value ? '#e94560' : '#888',
                }}>{opt.label}</button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>Dead Lead (long-term follow-up)</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DEAD_FOLLOW_UP_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setFormFollowUp(opt.value)} style={{
                  padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", border: 'none',
                  background: formFollowUp === opt.value ? 'rgba(102,102,102,0.3)' : 'rgba(255,255,255,0.05)',
                  color: formFollowUp === opt.value ? '#aaa' : '#888',
                }}>{opt.label}</button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FOLLOW_UP_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setFormFollowUp(opt.value)} style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", border: 'none',
                background: formFollowUp === opt.value ? 'rgba(240,165,0,0.2)' : 'rgba(255,255,255,0.05)',
                color: formFollowUp === opt.value ? '#f0a500' : '#888',
              }}>{opt.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* Arsenal: "Did they mention a property?" */}
      {isArsenal && (
        <div style={{ marginBottom: 12 }}>
          <button onClick={() => setFormAlsoProperty(!formAlsoProperty)} style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: formAlsoProperty ? 'rgba(233,69,96,0.08)' : 'rgba(255,255,255,0.03)',
            color: formAlsoProperty ? '#e94560' : '#666', fontSize: 12, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <span>{formAlsoProperty ? '▾' : '▸'}</span> Did they mention a property?
          </button>
          {formAlsoProperty && (
            <div style={{ padding: '12px 14px', background: 'rgba(233,69,96,0.04)', borderRadius: '0 0 8px 8px', marginTop: -2 }}>
              <input placeholder="Street" value={formStreet} onChange={e => setFormStreet(e.target.value)}
                style={{ width: '100%', fontSize: 12, padding: '8px 10px', marginBottom: 6 }} />
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <input placeholder="City" value={formCity} onChange={e => setFormCity(e.target.value)} style={{ flex: 2, fontSize: 12, padding: '8px 10px' }} />
                <input placeholder="State" value={formState} onChange={e => setFormState(e.target.value)} style={{ flex: 1, fontSize: 12, padding: '8px 10px' }} />
                <input placeholder="Zip" value={formZip} onChange={e => setFormZip(e.target.value)} style={{ flex: 1, fontSize: 12, padding: '8px 10px' }} />
              </div>
              <textarea placeholder="Property details / notes" value={formPropertyDetails}
                onChange={e => setFormPropertyDetails(e.target.value)} rows={2}
                style={{ width: '100%', fontSize: 12, padding: '8px 10px', marginBottom: 6, resize: 'vertical' }} />
              <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Property follow-up schedule</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {FOLLOW_UP_OPTIONS.filter(o => o.value !== 'never').map(opt => (
                  <button key={opt.value} onClick={() => setFormArsenalFollowUp(opt.value)} style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 10, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", border: 'none',
                    background: formArsenalFollowUp === opt.value ? 'rgba(233,69,96,0.2)' : 'rgba(255,255,255,0.05)',
                    color: formArsenalFollowUp === opt.value ? '#e94560' : '#888',
                  }}>{opt.label}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{
          padding: '10px 18px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif", border: '1px solid rgba(255,255,255,0.1)',
          background: 'transparent', color: '#888',
        }}>Cancel</button>
        <button onClick={onSave} disabled={!canSave || formSaving} style={{
          padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif", border: 'none',
          background: tabColor, color: '#000', opacity: (!canSave || formSaving) ? 0.4 : 1,
        }}>{formSaving ? 'Saving...' : isArsenal ? 'Add Arsenal Contact' : isColdFollowUp ? 'Add Cold Follow Up' : 'Add Target Property'}</button>
      </div>
    </div>
  );
}

/* ═══ Arsenal Card ═══ */
function ArsenalCard({ contact, linkedProperties, isExpanded, followUps, onExpand, onUpdateContact, onContactUpdated, onAddContact, onContactAdded, onAddFollowUp, onFollowUpLogged, user, allContacts }) {
  const overdue = isOverdue(contact.follow_up_date);
  const followUpText = formatFollowUpDate(contact.follow_up_date);
  const typeLabel = contact.arsenal_type ? ARSENAL_TYPE_LABELS[contact.arsenal_type] || contact.arsenal_type : null;

  return (
    <div className="card" style={{
      padding: 0, transition: 'border-color 0.2s',
      borderColor: overdue ? 'rgba(233,69,96,0.3)' : isExpanded ? 'rgba(240,165,0,0.3)' : undefined,
    }}>
      <div onClick={onExpand} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', cursor: 'pointer' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: '#f0a500',
        }}>{contact.name?.charAt(0).toUpperCase()}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#ddd' }}>{contact.name}</span>
            {typeLabel && (
              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700, background: 'rgba(240,165,0,0.1)', color: '#f0a500' }}>
                {typeLabel}
              </span>
            )}
            {linkedProperties > 0 && (
              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700, background: 'rgba(233,69,96,0.1)', color: '#e94560' }}>
                {linkedProperties} {linkedProperties === 1 ? 'property' : 'properties'}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 2, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {contact.phone && <span>{contact.phone}</span>}
            {contact.email && <span>{contact.email}</span>}
            {contact.day_added != null && <span>Day {contact.day_added}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {followUpText && (
            <span style={{
              fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 700,
              fontFamily: "'DM Mono', monospace",
              background: overdue ? 'rgba(233,69,96,0.15)' : 'rgba(72,199,142,0.1)',
              color: overdue ? '#e94560' : '#48c78e',
              border: `1px solid ${overdue ? 'rgba(233,69,96,0.3)' : 'rgba(72,199,142,0.2)'}`,
            }}>{overdue ? '! ' : ''}{followUpText}</span>
          )}
          <span style={{ color: '#555', fontSize: 14, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'none' }}>›</span>
        </div>
      </div>
      {isExpanded && <ExpandedDetail contact={contact} followUps={followUps} color="#f0a500"
        onUpdateContact={onUpdateContact} onContactUpdated={onContactUpdated}
        onAddContact={onAddContact} onContactAdded={onContactAdded} onAddFollowUp={onAddFollowUp}
        onFollowUpLogged={onFollowUpLogged} user={user} allContacts={allContacts} />}
    </div>
  );
}

/* ═══ Target Property Card ═══ */
function TargetPropertyCard({ contact, isExpanded, followUps, onExpand, onUpdateContact, onContactUpdated, onAddContact, onContactAdded, onAddFollowUp, onFollowUpLogged, onPropertyUnderContract, user }) {
  const overdue = isOverdue(contact.follow_up_date);
  const followUpText = formatFollowUpDate(contact.follow_up_date);
  const statusInfo = STATUS_LABELS[contact.pipeline_status] || STATUS_LABELS.active;
  const isDead = contact.pipeline_status === 'dead';
  const color = isDead ? '#666' : '#e94560';

  return (
    <div className="card" style={{
      padding: 0, transition: 'border-color 0.2s',
      borderColor: overdue && !isDead ? 'rgba(233,69,96,0.3)' : isExpanded ? `${color}40` : undefined,
    }}>
      <div onClick={onExpand} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', cursor: 'pointer' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: `${color}15`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color,
        }}>📍</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {contact.property && (
            <div style={{ fontSize: 14, fontWeight: 600, color: isDead ? '#666' : '#e94560', marginBottom: 2 }}>
              {contact.property}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: isDead ? '#555' : '#aaa' }}>{contact.name}</span>
            {contact.pipeline_status && contact.pipeline_status !== 'new' && (
              <span style={{
                fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700,
                background: `${statusInfo.color}15`, color: statusInfo.color,
              }}>{statusInfo.label}</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: '#555', marginTop: 2, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {contact.phone && <span>📞 {contact.phone}</span>}
            {contact.day_added != null && <span>Day {contact.day_added}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {followUpText && (
            <span style={{
              fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 700,
              fontFamily: "'DM Mono', monospace",
              background: overdue && !isDead ? 'rgba(233,69,96,0.15)' : 'rgba(72,199,142,0.1)',
              color: overdue && !isDead ? '#e94560' : '#48c78e',
              border: `1px solid ${overdue && !isDead ? 'rgba(233,69,96,0.3)' : 'rgba(72,199,142,0.2)'}`,
            }}>{overdue && !isDead ? '⚠ ' : '📅 '}{followUpText}</span>
          )}
          <span style={{ color: '#555', fontSize: 14, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'none' }}>›</span>
        </div>
      </div>
      {isExpanded && <ExpandedDetail contact={contact} followUps={followUps} color={color}
        onUpdateContact={onUpdateContact} onContactUpdated={onContactUpdated}
        onAddContact={onAddContact} onContactAdded={onContactAdded} onAddFollowUp={onAddFollowUp}
        onFollowUpLogged={onFollowUpLogged} onPropertyUnderContract={onPropertyUnderContract} user={user} />}
    </div>
  );
}

/* ═══ Cold Follow Up Card ═══ */
function ColdFollowUpCard({ contact, isExpanded, followUps, onExpand, onUpdateContact, onContactUpdated, onAddContact, onContactAdded, onAddFollowUp, onFollowUpLogged, user, setContacts }) {
  const overdue = isOverdue(contact.follow_up_date);
  const followUpText = formatFollowUpDate(contact.follow_up_date);
  const color = '#9b7fd4';

  const [converting, setConverting] = useState(false);
  const [celebration, setCelebration] = useState(null);

  const handleConvertToTarget = async () => {
    setConverting(true);
    const now = new Date().toISOString();
    try {
      const result = await onAddContact({
        name: contact.name,
        phone: contact.phone || null,
        email: contact.email || null,
        contact_group: 'target',
        property: contact.property || null,
        notes: contact.notes ? `[Converted from Cold Follow Up] ${contact.notes}` : '[Converted from Cold Follow Up]',
        pipeline_status: 'active',
        follow_up_interval: '1_week',
        follow_up_date: calculateFollowUpDate('1_week'),
        last_contact_date: now,
      });
      if (result?.success && result.contact) {
        if (onContactAdded) onContactAdded(result.contact);
        const removeUpdates = { pipeline_status: 'dead', follow_up_interval: 'never', follow_up_date: null };
        await onUpdateContact(contact.id, removeUpdates);
        onContactUpdated(contact.id, removeUpdates);
        setContacts(prev => prev.filter(c => c.id !== contact.id));
        setCelebration('converted');
        setTimeout(() => setCelebration(null), 3000);
      }
    } catch (e) { console.error('Failed to convert:', e); }
    setConverting(false);
  };

  return (
    <div className="card" style={{
      padding: 0, transition: 'border-color 0.2s',
      borderColor: overdue ? 'rgba(233,69,96,0.3)' : isExpanded ? 'rgba(155,127,212,0.3)' : undefined,
    }}>
      {celebration && (
        <div style={{
          padding: '16px 20px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(233,69,96,0.15), rgba(155,127,212,0.1))',
          border: '1px solid rgba(233,69,96,0.3)',
          borderRadius: '12px 12px 0 0',
          animation: 'celebrationPulse 0.6s ease-in-out',
        }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>🎯🔥</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#e94560', marginBottom: 4 }}>Converted to Target!</div>
          <div style={{ fontSize: 13, color: '#aaa' }}>This contact is now an active target property — go get it!</div>
          <style>{`
            @keyframes celebrationPulse {
              0% { transform: scale(0.9); opacity: 0; }
              50% { transform: scale(1.03); }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
      <div onClick={onExpand} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', cursor: 'pointer' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(155,127,212,0.15)', border: '1px solid rgba(155,127,212,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: '#9b7fd4',
        }}>{contact.name?.charAt(0).toUpperCase()}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#ddd' }}>{contact.name}</div>
          {contact.property && (
            <div style={{ fontSize: 12, color: '#9b7fd4', marginTop: 2 }}>📍 {contact.property}</div>
          )}
          <div style={{ fontSize: 11, color: '#555', marginTop: 2, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {contact.phone && <span>📞 {contact.phone}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {followUpText && (
            <span style={{
              fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 700,
              fontFamily: "'DM Mono', monospace",
              background: overdue ? 'rgba(233,69,96,0.15)' : 'rgba(155,127,212,0.1)',
              color: overdue ? '#e94560' : '#9b7fd4',
              border: `1px solid ${overdue ? 'rgba(233,69,96,0.3)' : 'rgba(155,127,212,0.2)'}`,
            }}>{overdue ? '! ' : '📅 '}{followUpText}</span>
          )}
          <span style={{ color: '#555', fontSize: 14, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'none' }}>›</span>
        </div>
      </div>
      {isExpanded && (
        <div style={{ padding: '0 18px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, marginBottom: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button onClick={handleConvertToTarget} disabled={converting}
              style={{
                padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", border: 'none',
                background: 'rgba(233,69,96,0.2)', color: '#e94560',
                opacity: converting ? 0.5 : 1,
              }}>
              {converting ? 'Converting...' : 'Convert to Target Property'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 4 }}>
            {contact.follow_up_interval && (
              <DetailItem label="Follow-Up Interval" value={INTERVAL_LABELS[contact.follow_up_interval] || contact.follow_up_interval} />
            )}
            {contact.follow_up_date && (
              <DetailItem label="Next Follow-Up"
                value={new Date(contact.follow_up_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                color={isOverdue(contact.follow_up_date) ? '#e94560' : '#9b7fd4'} />
            )}
            {contact.last_contact_date && (
              <DetailItem label="Last Contact"
                value={new Date(contact.last_contact_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
            )}
          </div>

          {contact.notes && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>
              <span style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Notes:</span>
              {contact.notes}
            </div>
          )}

          <FollowUpHistory
            contact={contact} followUps={followUps} color={color}
            onAddFollowUp={onAddFollowUp} onFollowUpLogged={onFollowUpLogged}
            onUpdateContact={onUpdateContact} onContactUpdated={onContactUpdated} user={user}
          />
        </div>
      )}
    </div>
  );
}

/* ═══ Follow-Up History (shared) ═══ */
function FollowUpHistory({ contact, followUps, color, onAddFollowUp, onFollowUpLogged, onUpdateContact, onContactUpdated, user }) {
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [followUpInterval, setFollowUpInterval] = useState(contact.follow_up_interval || '1_month');
  const [followUpSaving, setFollowUpSaving] = useState(false);

  const inputStyle = {
    width: '100%', fontSize: 13, padding: '7px 10px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6, color: '#ddd', fontFamily: "'DM Sans', sans-serif",
  };

  const pillBtn = (isActive) => ({
    padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", border: '1px solid',
    background: isActive ? `${color}20` : 'rgba(255,255,255,0.03)',
    color: isActive ? color : '#666',
    borderColor: isActive ? `${color}40` : 'rgba(255,255,255,0.08)',
  });

  const actionBtn = (bg, fg) => ({
    padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", border: 'none', background: bg, color: fg,
  });

  const handleLogFollowUp = async () => {
    if (!followUpNotes.trim() || !followUpInterval) return;
    setFollowUpSaving(true);
    const now = new Date().toISOString();
    const contactUpdates = {
      follow_up_interval: followUpInterval,
      follow_up_date: calculateFollowUpDate(followUpInterval),
      last_contact_date: now,
    };
    try {
      const result = await onAddFollowUp({
        contact_id: contact.id, participant_id: user?.id,
        day_number: contact.day_added || 0, notes: followUpNotes.trim(),
      }, contactUpdates);
      if (result?.success && result.followUp) onFollowUpLogged(contact.id, result.followUp);
      onContactUpdated(contact.id, contactUpdates);
      setFollowUpNotes(''); setShowFollowUpForm(false);
    } catch (e) { console.error('Failed to log follow-up:', e); }
    setFollowUpSaving(false);
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#888' }}>Follow-Up History ({followUps.length})</div>
        {!showFollowUpForm && onAddFollowUp && (
          <button onClick={() => setShowFollowUpForm(true)} style={actionBtn('rgba(72,199,142,0.12)', '#48c78e')}>
            Log Follow-Up
          </button>
        )}
      </div>
      {followUps.length === 0 && !showFollowUpForm ? (
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
                <span style={{ fontSize: 11, color: '#555' }}>{f.created_at && new Date(f.created_at).toLocaleDateString()}</span>
              </div>
              {f.notes}
            </div>
          ))}
        </div>
      )}

      {showFollowUpForm && (
        <div style={{ marginTop: 10, padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(72,199,142,0.15)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#48c78e', marginBottom: 8 }}>Log Follow-Up</div>
          <textarea value={followUpNotes} onChange={e => setFollowUpNotes(e.target.value)}
            rows={3} placeholder="What did you discuss? Any updates..."
            style={{ ...inputStyle, resize: 'vertical', marginBottom: 8 }} />
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Next Follow-Up Interval</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.entries(INTERVAL_LABELS).map(([key, label]) => (
                <button key={key} onClick={() => setFollowUpInterval(key)} style={pillBtn(followUpInterval === key)}>{label}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => { setShowFollowUpForm(false); setFollowUpNotes(''); }}
              style={actionBtn('rgba(255,255,255,0.06)', '#888')}>Cancel</button>
            <button onClick={handleLogFollowUp} disabled={followUpSaving || !followUpNotes.trim()}
              style={actionBtn('rgba(72,199,142,0.2)', '#48c78e')}>
              {followUpSaving ? 'Saving...' : 'Save Follow-Up'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══ Expanded Detail (Editable) ═══ */
function ExpandedDetail({ contact, followUps, color, onUpdateContact, onContactUpdated, onAddContact, onContactAdded, onAddFollowUp, onFollowUpLogged, onPropertyUnderContract, user, allContacts }) {
  const statusInfo = STATUS_LABELS[contact.pipeline_status] || STATUS_LABELS.new;
  const isTarget = contact.contact_group === 'target';
  const isArsenal = contact.contact_group === 'arsenal';

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState(contact.name || '');
  const [editPhone, setEditPhone] = useState(contact.phone || '');
  const [editEmail, setEditEmail] = useState(contact.email || '');
  const [editNotes, setEditNotes] = useState(contact.notes || '');
  const [editProperty, setEditProperty] = useState(contact.property || '');
  const [editStatus, setEditStatus] = useState(contact.pipeline_status || 'new');
  const [editInterval, setEditInterval] = useState(contact.follow_up_interval || 'never');
  const [editArsenalType, setEditArsenalType] = useState(contact.arsenal_type || '');
  const [editLeadSrcName, setEditLeadSrcName] = useState(contact.lead_source_name || '');
  const [editLeadSrcPhone, setEditLeadSrcPhone] = useState(contact.lead_source_phone || '');
  const [editLeadSrcEmail, setEditLeadSrcEmail] = useState(contact.lead_source_email || '');
  const [editLeadSrcType, setEditLeadSrcType] = useState(contact.lead_source_type || '');
  const [editOwnerName, setEditOwnerName] = useState(contact.owner_name || '');
  const [editOwnerPhone, setEditOwnerPhone] = useState(contact.owner_phone || '');
  const [editOwnerEmail, setEditOwnerEmail] = useState(contact.owner_email || '');
  const [phoneError, setPhoneError] = useState('');
  const [leadSrcPhoneError, setLeadSrcPhoneError] = useState('');
  const [ownerPhoneError, setOwnerPhoneError] = useState('');

  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [followUpInterval, setFollowUpInterval] = useState(contact.follow_up_interval || '1_week');
  const [followUpSaving, setFollowUpSaving] = useState(false);

  const [leadSrcArsenalAdded, setLeadSrcArsenalAdded] = useState(false);
  const [ownerArsenalAdded, setOwnerArsenalAdded] = useState(false);
  const [celebration, setCelebration] = useState(null);

  // "Add Target Property" from Arsenal
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);
  const [propStreet, setPropStreet] = useState('');
  const [propCity, setPropCity] = useState('');
  const [propState, setPropState] = useState('');
  const [propZip, setPropZip] = useState('');
  const [propNotes, setPropNotes] = useState('');
  const [propFollowUp, setPropFollowUp] = useState('1_week');
  const [propSaving, setPropSaving] = useState(false);

  const startEdit = () => {
    setEditName(contact.name || ''); setEditPhone(contact.phone || '');
    setEditEmail(contact.email || ''); setEditNotes(contact.notes || '');
    setEditProperty(contact.property || '');
    setEditStatus(contact.pipeline_status || 'new');
    setEditInterval(contact.follow_up_interval || 'never');
    setEditArsenalType(contact.arsenal_type || '');
    setEditLeadSrcName(contact.lead_source_name || '');
    setEditLeadSrcPhone(contact.lead_source_phone || '');
    setEditLeadSrcEmail(contact.lead_source_email || '');
    setEditLeadSrcType(contact.lead_source_type || '');
    setEditOwnerName(contact.owner_name || '');
    setEditOwnerPhone(contact.owner_phone || '');
    setEditOwnerEmail(contact.owner_email || '');
    setEditing(true);
  };

  const saveEdit = async () => {
    const phoneCheck = validatePhone(editPhone, { required: true });
    if (!phoneCheck.valid) { setPhoneError(phoneCheck.error); return; }
    setPhoneError('');
    if (isTarget) {
      const leadPhoneCheck = validatePhone(editLeadSrcPhone);
      if (!leadPhoneCheck.valid) { setLeadSrcPhoneError(leadPhoneCheck.error); return; }
      setLeadSrcPhoneError('');
      const ownerPhoneCheck = validatePhone(editOwnerPhone);
      if (!ownerPhoneCheck.valid) { setOwnerPhoneError(ownerPhoneCheck.error); return; }
      setOwnerPhoneError('');
    }
    setSaving(true);
    const updates = {
      name: editName.trim(), phone: phoneCheck.formatted,
      email: editEmail.trim() || null, notes: editNotes.trim() || null,
      follow_up_interval: editInterval,
      follow_up_date: calculateFollowUpDate(editInterval),
    };
    if (isTarget) {
      updates.property = editProperty.trim() || null;
      updates.pipeline_status = editStatus;
      updates.lead_source_name = editLeadSrcName.trim() || null;
      updates.lead_source_phone = validatePhone(editLeadSrcPhone).formatted;
      updates.lead_source_email = editLeadSrcEmail.trim() || null;
      updates.lead_source_type = editLeadSrcType || null;
      updates.owner_name = editOwnerName.trim() || null;
      updates.owner_phone = validatePhone(editOwnerPhone).formatted;
      updates.owner_email = editOwnerEmail.trim() || null;
    }
    if (isArsenal) {
      updates.arsenal_type = editArsenalType || null;
    }
    const oldStatus = contact.pipeline_status;
    try {
      await onUpdateContact(contact.id, updates);
      onContactUpdated(contact.id, updates);
      setEditing(false);
      if (isTarget && oldStatus !== editStatus && (editStatus === 'under_contract' || editStatus === 'closed')) {
        setCelebration(editStatus);
        setTimeout(() => setCelebration(null), 4000);
        if (editStatus === 'under_contract' && onPropertyUnderContract) {
          onPropertyUnderContract({ ...contact, ...updates });
        }
      }
    } catch (e) { console.error('Failed to save:', e); }
    setSaving(false);
  };

  const handleAddRoleToArsenal = async (role) => {
    const isLeadSrc = role === 'lead_source';
    const name = isLeadSrc ? contact.lead_source_name : contact.owner_name;
    const phone = isLeadSrc ? contact.lead_source_phone : contact.owner_phone;
    const email = isLeadSrc ? contact.lead_source_email : contact.owner_email;
    if (!name) return;
    const setSaved = isLeadSrc ? setLeadSrcArsenalAdded : setOwnerArsenalAdded;
    try {
      const result = await onAddContact({
        name, phone: phone || null, email: email || null,
        contact_group: 'arsenal', pipeline_status: 'new',
        arsenal_type: isLeadSrc ? (contact.lead_source_type || null) : null,
        notes: `${isLeadSrc ? 'Lead Source' : 'Owner/Seller'} from property: ${contact.property || 'N/A'}`,
        follow_up_interval: '1_week',
        follow_up_date: calculateFollowUpDate('1_week'),
        last_contact_date: new Date().toISOString(),
      });
      if (result?.success) {
        setSaved(true);
        if (result.contact && onContactAdded) onContactAdded(result.contact);
      }
    } catch (e) { console.error('Failed to add to arsenal:', e); }
  };

  const handleAddTargetProperty = async () => {
    if (!propStreet.trim()) return;
    setPropSaving(true);
    const propAddr = [propStreet.trim(), propCity.trim(), propState.trim(), propZip.trim()].filter(Boolean).join(', ');
    try {
      const result = await onAddContact({
        name: contact.name, phone: contact.phone || null, email: contact.email || null,
        contact_group: 'target', property: propAddr,
        notes: propNotes.trim() || null, pipeline_status: 'active',
        follow_up_interval: propFollowUp,
        follow_up_date: calculateFollowUpDate(propFollowUp),
        last_contact_date: new Date().toISOString(),
        source_contact_id: contact.id,
        lead_source_name: contact.name,
        lead_source_phone: contact.phone || null,
        lead_source_email: contact.email || null,
        lead_source_type: contact.arsenal_type || null,
      });
      if (result?.success && result.contact && onContactAdded) onContactAdded(result.contact);
      setShowAddPropertyForm(false);
      setPropStreet(''); setPropCity(''); setPropState(''); setPropZip('');
      setPropNotes(''); setPropFollowUp('1_week');
    } catch (e) { console.error('Failed to add target property:', e); }
    setPropSaving(false);
  };

  const handleLogFollowUp = async () => {
    if (!followUpNotes.trim() || !followUpInterval) return;
    setFollowUpSaving(true);
    const now = new Date().toISOString();
    const contactUpdates = {
      follow_up_interval: followUpInterval,
      follow_up_date: calculateFollowUpDate(followUpInterval),
      last_contact_date: now,
    };
    try {
      const result = await onAddFollowUp({
        contact_id: contact.id, participant_id: user?.id,
        day_number: contact.day_added || 0, notes: followUpNotes.trim(),
      }, contactUpdates);
      if (result?.success && result.followUp) onFollowUpLogged(contact.id, result.followUp);
      onContactUpdated(contact.id, contactUpdates);
      setFollowUpNotes(''); setShowFollowUpForm(false);
    } catch (e) { console.error('Failed to log follow-up:', e); }
    setFollowUpSaving(false);
  };

  const inputStyle = {
    width: '100%', fontSize: 13, padding: '7px 10px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6, color: '#ddd', fontFamily: "'DM Sans', sans-serif",
  };

  const pillBtn = (isActive) => ({
    padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", border: '1px solid',
    background: isActive ? `${color}20` : 'rgba(255,255,255,0.03)',
    color: isActive ? color : '#666',
    borderColor: isActive ? `${color}40` : 'rgba(255,255,255,0.08)',
  });

  const actionBtn = (bg, fg) => ({
    padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", border: 'none', background: bg, color: fg,
  });

  return (
    <div style={{ padding: '0 18px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      {celebration && (
        <div style={{
          marginTop: 10, padding: '16px 20px', borderRadius: 10, textAlign: 'center',
          background: celebration === 'closed'
            ? 'linear-gradient(135deg, rgba(212,168,67,0.15), rgba(240,165,0,0.1))'
            : 'linear-gradient(135deg, rgba(107,138,253,0.15), rgba(72,199,142,0.1))',
          border: `1px solid ${celebration === 'closed' ? 'rgba(212,168,67,0.3)' : 'rgba(107,138,253,0.3)'}`,
          animation: 'celebrationPulse 0.6s ease-in-out',
        }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>{celebration === 'closed' ? '🎉🏠💰' : '🎉📋✨'}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: celebration === 'closed' ? '#d4a843' : '#6b8afd', marginBottom: 4 }}>
            {celebration === 'closed' ? 'Deal Closed!' : 'Under Contract!'}
          </div>
          <div style={{ fontSize: 13, color: '#aaa' }}>
            {celebration === 'closed' ? 'Congratulations on closing the deal!' : 'Congratulations — keep pushing to close!'}
          </div>
          <style>{`
            @keyframes celebrationPulse {
              0% { transform: scale(0.9); opacity: 0; }
              50% { transform: scale(1.03); }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10, marginBottom: 4, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        {!editing && <button onClick={startEdit} style={actionBtn('rgba(255,255,255,0.06)', '#aaa')}>Edit</button>}
        {isArsenal && onAddContact && !editing && (
          <button onClick={() => setShowAddPropertyForm(!showAddPropertyForm)}
            style={actionBtn('rgba(233,69,96,0.15)', '#e94560')}>
            {showAddPropertyForm ? 'Cancel' : '+ Target Property'}
          </button>
        )}
      </div>

      {/* Add Target Property form (Arsenal expanded view) */}
      {isArsenal && showAddPropertyForm && (
        <div style={{ padding: '14px 16px', marginBottom: 8, background: 'rgba(233,69,96,0.04)', borderRadius: 10, border: '1px solid rgba(233,69,96,0.15)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e94560', marginBottom: 10 }}>Add Target Property from {contact.name}</div>
          <input placeholder="Street *" value={propStreet} onChange={e => setPropStreet(e.target.value)}
            style={{ ...inputStyle, marginBottom: 6 }} />
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input placeholder="City" value={propCity} onChange={e => setPropCity(e.target.value)} style={{ ...inputStyle, flex: 2 }} />
            <input placeholder="State" value={propState} onChange={e => setPropState(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            <input placeholder="Zip" value={propZip} onChange={e => setPropZip(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          </div>
          <textarea placeholder="Property notes..." value={propNotes} onChange={e => setPropNotes(e.target.value)}
            rows={2} style={{ ...inputStyle, resize: 'vertical', marginBottom: 8 }} />
          <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Follow-up schedule</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
            {FOLLOW_UP_OPTIONS.filter(o => o.value !== 'never').map(opt => (
              <button key={opt.value} onClick={() => setPropFollowUp(opt.value)} style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 10, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", border: 'none',
                background: propFollowUp === opt.value ? 'rgba(233,69,96,0.2)' : 'rgba(255,255,255,0.05)',
                color: propFollowUp === opt.value ? '#e94560' : '#888',
              }}>{opt.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowAddPropertyForm(false)} style={actionBtn('rgba(255,255,255,0.06)', '#888')}>Cancel</button>
            <button onClick={handleAddTargetProperty} disabled={propSaving || !propStreet.trim()}
              style={actionBtn('rgba(233,69,96,0.2)', '#e94560')}>{propSaving ? 'Adding...' : 'Add Property'}</button>
          </div>
        </div>
      )}

      {/* Linked properties from this arsenal contact */}
      {isArsenal && allContacts && (() => {
        const linked = allContacts.filter(c => c.contact_group === 'target' && c.source_contact_id === contact.id);
        if (linked.length === 0) return null;
        return (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Linked Properties</div>
            {linked.map(p => (
              <div key={p.id} style={{ fontSize: 12, color: '#e94560', padding: '4px 0' }}>
                {p.property || 'No address'} — <span style={{ color: (STATUS_LABELS[p.pipeline_status] || STATUS_LABELS.active).color }}>{(STATUS_LABELS[p.pipeline_status] || STATUS_LABELS.active).label}</span>
              </div>
            ))}
          </div>
        );
      })()}

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 180px' }}>
              <label style={{ fontSize: 11, color: '#666', marginBottom: 3, display: 'block' }}>Name</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: '1 1 140px' }}>
              <label style={{ fontSize: 11, color: '#666', marginBottom: 3, display: 'block' }}>Phone</label>
              <input type="tel" value={editPhone} onChange={e => { setEditPhone(e.target.value); setPhoneError(''); }}
                placeholder="Phone # (required)"
                style={{ ...inputStyle, borderColor: phoneError ? 'rgba(233,69,96,0.5)' : undefined }} />
              {phoneError && <div style={{ fontSize: 11, color: '#e94560', marginTop: 3 }}>{phoneError}</div>}
            </div>
            <div style={{ flex: '1 1 180px' }}>
              <label style={{ fontSize: 11, color: '#666', marginBottom: 3, display: 'block' }}>Email</label>
              <input value={editEmail} onChange={e => setEditEmail(e.target.value)} style={inputStyle} />
            </div>
          </div>

          {/* Arsenal type dropdown */}
          {isArsenal && (
            <div style={{ flex: '1 1 180px' }}>
              <label style={{ fontSize: 11, color: '#666', marginBottom: 3, display: 'block' }}>Contact Type</label>
              <select value={editArsenalType} onChange={e => setEditArsenalType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select type...</option>
                {ARSENAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          )}

          {isTarget && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ fontSize: 11, color: '#666', marginBottom: 3, display: 'block' }}>Property Address</label>
                <input value={editProperty} onChange={e => setEditProperty(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={{ fontSize: 11, color: '#666', marginBottom: 3, display: 'block' }}>Pipeline Status</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {Object.entries(STATUS_LABELS).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Lead Source fields (target properties only) */}
          {isTarget && (
            <div style={{ padding: '10px 14px', background: 'rgba(240,165,0,0.04)', borderRadius: 8, border: '1px solid rgba(240,165,0,0.1)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f0a500', marginBottom: 8 }}>Lead Source *</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: leadSrcPhoneError ? 4 : 8 }}>
                <div style={{ flex: '1 1 150px' }}>
                  <label style={{ fontSize: 10, color: '#666', marginBottom: 2, display: 'block' }}>Name</label>
                  <input value={editLeadSrcName} onChange={e => setEditLeadSrcName(e.target.value)} placeholder="Who brought the deal?" style={inputStyle} />
                </div>
                <div style={{ flex: '1 1 120px' }}>
                  <label style={{ fontSize: 10, color: '#666', marginBottom: 2, display: 'block' }}>Phone</label>
                  <input type="tel" value={editLeadSrcPhone}
                    onChange={e => { setEditLeadSrcPhone(e.target.value); setLeadSrcPhoneError(''); }}
                    style={{ ...inputStyle, borderColor: leadSrcPhoneError ? 'rgba(233,69,96,0.5)' : undefined }} />
                </div>
                <div style={{ flex: '1 1 150px' }}>
                  <label style={{ fontSize: 10, color: '#666', marginBottom: 2, display: 'block' }}>Email</label>
                  <input value={editLeadSrcEmail} onChange={e => setEditLeadSrcEmail(e.target.value)} style={inputStyle} />
                </div>
              </div>
              {leadSrcPhoneError && <div style={{ fontSize: 11, color: '#e94560', marginBottom: 8 }}>{leadSrcPhoneError}</div>}
              <div style={{ flex: '1 1 150px' }}>
                <label style={{ fontSize: 10, color: '#666', marginBottom: 2, display: 'block' }}>Source Type</label>
                <select value={editLeadSrcType} onChange={e => setEditLeadSrcType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select type...</option>
                  {ARSENAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Owner / Seller fields (target properties only) */}
          {isTarget && (
            <div style={{ padding: '10px 14px', background: 'rgba(107,138,253,0.04)', borderRadius: 8, border: '1px solid rgba(107,138,253,0.1)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6b8afd', marginBottom: 8 }}>Owner / Seller</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: ownerPhoneError ? 4 : 0 }}>
                <div style={{ flex: '1 1 150px' }}>
                  <label style={{ fontSize: 10, color: '#666', marginBottom: 2, display: 'block' }}>Name</label>
                  <input value={editOwnerName} onChange={e => setEditOwnerName(e.target.value)} placeholder="Property owner" style={inputStyle} />
                </div>
                <div style={{ flex: '1 1 120px' }}>
                  <label style={{ fontSize: 10, color: '#666', marginBottom: 2, display: 'block' }}>Phone</label>
                  <input type="tel" value={editOwnerPhone}
                    onChange={e => { setEditOwnerPhone(e.target.value); setOwnerPhoneError(''); }}
                    style={{ ...inputStyle, borderColor: ownerPhoneError ? 'rgba(233,69,96,0.5)' : undefined }} />
                </div>
                <div style={{ flex: '1 1 150px' }}>
                  <label style={{ fontSize: 10, color: '#666', marginBottom: 2, display: 'block' }}>Email</label>
                  <input value={editOwnerEmail} onChange={e => setEditOwnerEmail(e.target.value)} style={inputStyle} />
                </div>
              </div>
              {ownerPhoneError && <div style={{ fontSize: 11, color: '#e94560', marginBottom: 4 }}>{ownerPhoneError}</div>}
            </div>
          )}

          <div>
            <label style={{ fontSize: 11, color: '#666', marginBottom: 3, display: 'block' }}>Follow-Up Interval</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.entries(INTERVAL_LABELS).map(([key, label]) => (
                <button key={key} onClick={() => setEditInterval(key)} style={pillBtn(editInterval === key)}>{label}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#666', marginBottom: 3, display: 'block' }}>Notes</label>
            <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3}
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setEditing(false)} style={actionBtn('rgba(255,255,255,0.06)', '#888')}>Cancel</button>
            <button onClick={saveEdit} disabled={saving || !editName.trim()}
              style={actionBtn(`${color}30`, color)}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
            <DetailItem label="Type" value={isArsenal ? (ARSENAL_TYPE_LABELS[contact.arsenal_type] || 'Arsenal') : 'Target Property'} />
            {isTarget && <DetailItem label="Status" value={statusInfo.label} color={statusInfo.color} />}
            {contact.follow_up_interval && (
              <DetailItem label="Follow-Up Interval" value={INTERVAL_LABELS[contact.follow_up_interval] || contact.follow_up_interval} />
            )}
            {contact.follow_up_date && (
              <DetailItem label="Next Follow-Up"
                value={new Date(contact.follow_up_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                color={isOverdue(contact.follow_up_date) ? '#e94560' : '#48c78e'} />
            )}
            {contact.last_contact_date && (
              <DetailItem label="Last Contact"
                value={new Date(contact.last_contact_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
            )}
          </div>

          {/* Lead Source read-only display */}
          {isTarget && contact.lead_source_name && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(240,165,0,0.04)', borderRadius: 8, border: '1px solid rgba(240,165,0,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: '#f0a500', fontWeight: 700 }}>LEAD SOURCE</span>
                    {contact.lead_source_type && (
                      <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'rgba(240,165,0,0.1)', color: '#f0a500', fontWeight: 600 }}>
                        {ARSENAL_TYPE_LABELS[contact.lead_source_type] || contact.lead_source_type}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: '#ddd', marginTop: 2 }}>
                    {contact.lead_source_name}
                    {contact.lead_source_phone && <span style={{ color: '#666', marginLeft: 10 }}>{contact.lead_source_phone}</span>}
                    {contact.lead_source_email && <span style={{ color: '#666', marginLeft: 10 }}>{contact.lead_source_email}</span>}
                  </div>
                </div>
                {onAddContact && !leadSrcArsenalAdded && (
                  <button onClick={() => handleAddRoleToArsenal('lead_source')} style={actionBtn('rgba(240,165,0,0.12)', '#f0a500')}>
                    Add as Arsenal
                  </button>
                )}
                {leadSrcArsenalAdded && <span style={{ fontSize: 11, color: '#48c78e' }}>Added</span>}
              </div>
            </div>
          )}

          {/* Owner read-only display */}
          {isTarget && contact.owner_name && (
            <div style={{ marginTop: 6, padding: '8px 12px', background: 'rgba(107,138,253,0.04)', borderRadius: 8, border: '1px solid rgba(107,138,253,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                <div>
                  <span style={{ fontSize: 10, color: '#6b8afd', fontWeight: 700 }}>OWNER / SELLER</span>
                  <div style={{ fontSize: 13, color: '#ddd', marginTop: 2 }}>
                    {contact.owner_name}
                    {contact.owner_phone && <span style={{ color: '#666', marginLeft: 10 }}>{contact.owner_phone}</span>}
                    {contact.owner_email && <span style={{ color: '#666', marginLeft: 10 }}>{contact.owner_email}</span>}
                  </div>
                </div>
                {onAddContact && !ownerArsenalAdded && (
                  <button onClick={() => handleAddRoleToArsenal('owner')} style={actionBtn('rgba(107,138,253,0.12)', '#6b8afd')}>
                    Add as Arsenal
                  </button>
                )}
                {ownerArsenalAdded && <span style={{ fontSize: 11, color: '#48c78e' }}>Added</span>}
              </div>
            </div>
          )}

          {contact.notes && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>
              <span style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Notes:</span>
              {contact.notes}
            </div>
          )}
        </>
      )}

      {/* Follow-Up History */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#888' }}>Follow-Up History ({followUps.length})</div>
          {!showFollowUpForm && onAddFollowUp && (
            <button onClick={() => setShowFollowUpForm(true)} style={actionBtn('rgba(72,199,142,0.12)', '#48c78e')}>
              Log Follow-Up
            </button>
          )}
        </div>
        {followUps.length === 0 && !showFollowUpForm ? (
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
                  <span style={{ fontSize: 11, color: '#555' }}>{f.created_at && new Date(f.created_at).toLocaleDateString()}</span>
                </div>
                {f.notes}
              </div>
            ))}
          </div>
        )}

        {showFollowUpForm && (
          <div style={{ marginTop: 10, padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(72,199,142,0.15)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#48c78e', marginBottom: 8 }}>Log Follow-Up</div>
            <textarea value={followUpNotes} onChange={e => setFollowUpNotes(e.target.value)}
              rows={3} placeholder="What did you discuss? Any updates..."
              style={{ ...inputStyle, resize: 'vertical', marginBottom: 8 }} />
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Next Follow-Up Interval</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Object.entries(INTERVAL_LABELS).map(([key, label]) => (
                  <button key={key} onClick={() => setFollowUpInterval(key)} style={pillBtn(followUpInterval === key)}>{label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowFollowUpForm(false); setFollowUpNotes(''); }}
                style={actionBtn('rgba(255,255,255,0.06)', '#888')}>Cancel</button>
              <button onClick={handleLogFollowUp} disabled={followUpSaving || !followUpNotes.trim()}
                style={actionBtn('rgba(72,199,142,0.2)', '#48c78e')}>
                {followUpSaving ? 'Saving...' : 'Save Follow-Up'}
              </button>
            </div>
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
