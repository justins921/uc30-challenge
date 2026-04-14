import { useState, useMemo, useEffect } from 'react';
import { CHALLENGE_DAYS, CATEGORY_COLORS, getCategoryColors, getPhases, getDayContent, getDayDataForNum, getDailyMinimums, checkOfferBuffer } from '../data/challengeDays';
import { INDICATOR_LABELS, INDICATOR_COLORS, UC_POINT_VALUES, calculateDayPoints } from '../data/ucPoints';

const CONTACT_TYPES = [
  { value: 'agent', label: 'Agent' },
  { value: 'property_manager', label: 'Property Manager' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'investor', label: 'Investor' },
  { value: 'direct_seller', label: 'Direct Seller' },
  { value: 'other', label: 'Other' },
];

export default function DayView({ day, user, onSubmit, onBack, contentOverrides, customPhases, dailyMinimumsOverrides, onAddContact, onAddFollowUp, onUploadFile, contacts: initialContacts, getUploadUrl }) {
  // ── State ─────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState('properties');
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [offersCount, setOffersCount] = useState(0);
  const [proofText, setProofText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // New contacts added this session
  const [newContacts, setNewContacts] = useState([]);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', contact_type: 'agent', notes: '' });
  const [showContactForm, setShowContactForm] = useState(false);

  // Follow-ups added this session
  const [followUps, setFollowUps] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');

  // Social media screenshots (optional)
  const [socialMediaFiles, setSocialMediaFiles] = useState([]);

  // Screenshot uploads for properties & offers
  const [propertyFiles, setPropertyFiles] = useState([]);
  const [offerFiles, setOfferFiles] = useState([]);

  // All contacts (initial + newly added)
  const allContacts = useMemo(() => {
    const existing = initialContacts || [];
    return [...newContacts, ...existing];
  }, [initialContacts, newContacts]);

  // ── Day Data ──────────────────────────────────────────────
  const isPost30 = day > 30;
  const dayData = isPost30 ? getDayDataForNum(day) : getDayContent(day, contentOverrides);
  const isComplete = user.completedDays.includes(day);
  const isCurrentOrPast = day <= user.currentDay;
  const existingSubmission = user.submissions.find(s => s.day === day);
  const dayColors = customPhases ? getCategoryColors(getPhases(customPhases)) : null;
  const cat = isPost30
    ? { accent: '#f0a500', label: 'Operator Mode' }
    : (dayColors && dayColors[day]) || CATEGORY_COLORS[dayData.category] || { accent: '#888', label: '' };

  const minimums = getDailyMinimums(day, dailyMinimumsOverrides || {});
  const followUpMin = minimums.followUps || 0;
  const dealSourceMin = minimums.dealSourcesActivated || 0;
  const propertiesMin = minimums.propertiesAnalyzed || 5;

  // Cumulative offer tracking
  const cumulativeOffers = (user.metrics?.offersSubmitted || 0) + offersCount;
  const offerStatus = !isPost30 && day <= 30 ? checkOfferBuffer(day, cumulativeOffers) : null;

  // ── Standards Check ───────────────────────────────────────
  const standardsMet = useMemo(() => {
    if (propertiesCount < propertiesMin) return false;
    if (newContacts.length < dealSourceMin) return false;
    if (followUps.length < followUpMin && allContacts.length > 0) return false;
    // Day 1 exception: no contacts to follow up with yet
    if (followUps.length < followUpMin && allContacts.length === 0 && followUpMin > 0 && day > 1) return false;
    return true;
  }, [propertiesCount, newContacts, followUps, dealSourceMin, followUpMin, propertiesMin, allContacts, day]);

  // Calculate UC Points preview
  const previewPoints = useMemo(() => {
    const metrics = {
      propertiesAnalyzed: propertiesCount,
      offersSubmitted: offersCount,
      dealSourcesActivated: newContacts.length,
      followUps: followUps.length,
      socialMediaPosts: socialMediaFiles.length,
    };
    return calculateDayPoints(metrics);
  }, [propertiesCount, offersCount, newContacts, followUps, socialMediaFiles]);

  // ── Handlers ──────────────────────────────────────────────
  const handleAddContact = async () => {
    if (!contactForm.name.trim()) return;
    const contact = {
      name: contactForm.name.trim(),
      phone: contactForm.phone.trim() || null,
      email: contactForm.email.trim() || null,
      contact_type: contactForm.contact_type,
      notes: contactForm.notes.trim() || null,
      day_added: day,
    };
    if (onAddContact) {
      const result = await onAddContact(contact);
      if (result?.success && result.contact) {
        setNewContacts(prev => [result.contact, ...prev]);
      }
    } else {
      // Fallback: add locally
      setNewContacts(prev => [{ id: `temp_${Date.now()}`, ...contact, created_at: new Date().toISOString() }, ...prev]);
    }
    setContactForm({ name: '', phone: '', email: '', contact_type: 'agent', notes: '' });
    setShowContactForm(false);
  };

  const handleAddFollowUp = async () => {
    if (!selectedContactId || !followUpNote.trim()) return;
    const contact = allContacts.find(c => c.id === selectedContactId);
    const followUp = {
      contact_id: selectedContactId,
      notes: followUpNote.trim(),
      day_number: day,
    };
    if (onAddFollowUp) {
      await onAddFollowUp(followUp);
    }
    setFollowUps(prev => [...prev, { ...followUp, contactName: contact?.name || 'Contact', created_at: new Date().toISOString() }]);
    setFollowUpNote('');
    setSelectedContactId('');
  };

  const handleFileAdd = (files, setter) => {
    const validFiles = Array.from(files).filter(f => f.size <= 5 * 1024 * 1024);
    if (validFiles.length < files.length) {
      alert('Some files were skipped (max 5 MB each).');
    }
    setter(prev => [...prev, ...validFiles]);
  };

  const handleSubmit = async () => {
    // Upload files if handler exists
    if (onUploadFile) {
      for (const f of propertyFiles) await onUploadFile(day, 'propertiesAnalyzed', f);
      for (const f of offerFiles) await onUploadFile(day, 'offersSubmitted', f);
      for (const f of socialMediaFiles) await onUploadFile(day, 'socialMedia', f);
    }

    const dayMetrics = {
      propertiesAnalyzed: propertiesCount,
      offersSubmitted: offersCount,
      dealSourcesActivated: newContacts.length,
      followUps: followUps.length,
      socialMediaPosts: socialMediaFiles.length,
    };

    onSubmit(day, {
      text: proofText || `Logged: ${propertiesCount} properties, ${offersCount} offers, ${newContacts.length} contacts, ${followUps.length} follow-ups`,
      dayMetrics,
      socialMediaPosted: socialMediaFiles.length > 0,
    });
    setSubmitted(true);
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="scale-in" style={{ maxWidth: 720, margin: '0 auto' }}>
      <button className="btn-secondary" onClick={onBack} style={{ marginBottom: 24, padding: '8px 20px', fontSize: 13 }}>
        ← Back to Timeline
      </button>

      {/* Day Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span className="mono" style={{ fontSize: 11, color: cat.accent, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
            {cat.label}
          </span>
          <span style={{ color: '#333' }}>•</span>
          <span className="mono" style={{ fontSize: 11, color: '#555' }}>{isPost30 ? `DAY ${day}` : `DAY ${day}/30`}</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, marginBottom: 4 }}>
          {dayData.title}
        </h1>
        {isComplete && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(72,199,142,0.1)', border: '1px solid rgba(72,199,142,0.2)',
            padding: '6px 14px', borderRadius: 8, fontSize: 13, color: '#48c78e', marginTop: 8,
          }}>
            ✓ Completed
          </div>
        )}
      </div>

      {/* ═══ CUMULATIVE OFFER TRACKER (most prominent) ═══ */}
      {offerStatus && !isComplete && !submitted && (
        <div className="card" style={{
          marginBottom: 24, padding: '20px 24px',
          background: offerStatus.status === 'red' ? 'rgba(233,69,96,0.08)' :
            offerStatus.status === 'yellow' ? 'rgba(240,165,0,0.08)' : 'rgba(72,199,142,0.08)',
          border: `2px solid ${offerStatus.status === 'red' ? 'rgba(233,69,96,0.3)' :
            offerStatus.status === 'yellow' ? 'rgba(240,165,0,0.3)' : 'rgba(72,199,142,0.3)'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Offer Tracker</div>
            <div style={{
              fontSize: 12, padding: '4px 10px', borderRadius: 6, fontWeight: 700,
              background: offerStatus.status === 'red' ? 'rgba(233,69,96,0.2)' :
                offerStatus.status === 'yellow' ? 'rgba(240,165,0,0.2)' : 'rgba(72,199,142,0.2)',
              color: offerStatus.status === 'red' ? '#e94560' :
                offerStatus.status === 'yellow' ? '#f0a500' : '#48c78e',
            }}>
              {offerStatus.status === 'red' ? 'DANGER ZONE' : offerStatus.status === 'yellow' ? 'WARNING' : 'ON TRACK'}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginBottom: 16 }}>
            <div>
              <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{offerStatus.target}</div>
              <div style={{ fontSize: 11, color: '#888' }}>Target</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: offerStatus.status === 'green' ? '#48c78e' : offerStatus.status === 'yellow' ? '#f0a500' : '#e94560' }}>
                {offerStatus.current}
              </div>
              <div style={{ fontSize: 11, color: '#888' }}>Your Total</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: offerStatus.buffer <= 0 ? '#e94560' : offerStatus.buffer <= 1 ? '#f0a500' : '#48c78e' }}>
                {Math.max(0, offerStatus.buffer)}
              </div>
              <div style={{ fontSize: 11, color: '#888' }}>Buffer Left</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4, transition: 'width 0.3s',
              width: `${Math.min(100, (offerStatus.current / offerStatus.target) * 100)}%`,
              background: offerStatus.status === 'red' ? '#e94560' : offerStatus.status === 'yellow' ? '#f0a500' : '#48c78e',
            }} />
          </div>
          {offerStatus.behind > 0 && (
            <div style={{ fontSize: 12, color: offerStatus.status === 'red' ? '#e94560' : '#f0a500', marginTop: 8, textAlign: 'center' }}>
              {offerStatus.behind} offers behind target — {offerStatus.status === 'red' ? 'removal imminent!' : 'catch up soon'}
            </div>
          )}
        </div>
      )}

      {/* Video Player */}
      {!isPost30 && <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
        {dayData.videoUrl ? (
          <div style={{ aspectRatio: '16/9', position: 'relative' }}>
            <iframe
              src={dayData.videoUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; encrypted-media; gyroscope"
              allowFullScreen
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <div style={{
              display: 'none', position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12,
            }}>
              <div style={{ fontSize: 14, color: '#e94560', fontWeight: 600 }}>Video failed to load</div>
              <button
                className="btn-secondary"
                style={{ padding: '8px 20px', fontSize: 13 }}
                onClick={() => {
                  const iframe = document.querySelector(`iframe[src="${dayData.videoUrl}"]`);
                  if (iframe) { iframe.style.display = ''; iframe.nextSibling.style.display = 'none'; iframe.src = dayData.videoUrl; }
                }}
              >
                Retry
              </button>
              <a href={dayData.videoUrl} target="_blank" rel="noopener" style={{ color: '#888', fontSize: 12, textDecoration: 'underline' }}>
                Open video directly
              </a>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            aspectRatio: '16/9', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column', gap: 12,
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(233,69,96,0.2)', border: '2px solid rgba(233,69,96,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            }}>&#9654;</div>
            <div style={{ fontSize: 13, color: '#888' }}>Day {day} Instructional Video</div>
          </div>
        )}
      </div>}

      {/* Downloads */}
      {dayData.downloads && dayData.downloads.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>📥</span>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Resources</h3>
          </div>
          {dayData.downloads.map((dl, i) => (
            <a key={i} href={dl.url} target="_blank" rel="noopener"
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, color: '#e94560', textDecoration: 'none', fontSize: 14, marginBottom: i < dayData.downloads.length - 1 ? 8 : 0 }}>
              📎 {dl.name}
            </a>
          ))}
        </div>
      )}

      {/* Task Description */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(233,69,96,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📋</div>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Today's Standards</h3>
        </div>
        <p style={{ color: '#bbb', lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-line' }}>{dayData.taskDescription}</p>
      </div>

      {/* Stakes Reminder */}
      {!isComplete && !existingSubmission && !submitted && user.stakesDeclaration && isCurrentOrPast && (
        <div style={{
          marginBottom: 24, padding: '16px 20px', borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(233,69,96,0.04), rgba(240,165,0,0.04))',
          border: '1px solid rgba(233,69,96,0.1)',
        }}>
          <div style={{ fontSize: 12, color: '#e94560', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Remember why you started
          </div>
          <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
            "{user.stakesDeclaration}"
          </p>
        </div>
      )}

      {/* ═══ SUBMISSION AREA ═══ */}
      {isComplete || existingSubmission ? (
        <SubmissionComplete submission={existingSubmission} />
      ) : submitted ? (
        <SubmissionSuccess day={day} points={previewPoints} />
      ) : isCurrentOrPast && !isComplete ? (
        <>
          {/* Section Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { id: 'properties', label: 'Properties', icon: '🏠', count: propertiesCount, min: propertiesMin },
              { id: 'offers', label: 'Offers', icon: '📝', count: offersCount, min: null },
              { id: 'contacts', label: 'Deal Sources', icon: '🤝', count: newContacts.length, min: dealSourceMin },
              { id: 'followups', label: 'Follow-Ups', icon: '📞', count: followUps.length, min: followUpMin },
              { id: 'social', label: 'Social', icon: '📱', count: socialMediaFiles.length, min: null, bonus: true },
            ].map(t => {
              const active = activeSection === t.id;
              const met = t.min !== null ? t.count >= t.min : true;
              return (
                <button key={t.id} onClick={() => setActiveSection(t.id)} style={{
                  padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  border: `1px solid ${active ? cat.accent + '40' : 'rgba(255,255,255,0.08)'}`,
                  background: active ? cat.accent + '15' : 'rgba(255,255,255,0.03)',
                  color: active ? '#fff' : '#888', cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                  {t.count > 0 && (
                    <span style={{
                      fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700,
                      background: t.bonus ? 'rgba(255,107,157,0.15)' : met ? 'rgba(72,199,142,0.15)' : 'rgba(233,69,96,0.15)',
                      color: t.bonus ? '#ff6b9d' : met ? '#48c78e' : '#e94560',
                    }}>
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Properties Analyzed Section ── */}
          {activeSection === 'properties' && (
            <div className="card" style={{ marginBottom: 24 }}>
              <SectionHeader icon="🏠" title="Properties Analyzed" color="#533483" />
              <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
                How many properties did you analyze today? (Minimum: {propertiesMin})
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <input type="number" min="0" value={propertiesCount}
                  onChange={e => setPropertiesCount(Math.max(0, parseInt(e.target.value) || 0))}
                  style={{ width: 80, textAlign: 'center', fontSize: 20, fontWeight: 700, padding: '8px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
                <StatusBadge met={propertiesCount >= propertiesMin} label={propertiesCount >= propertiesMin ? 'Met' : `Need ${propertiesMin - propertiesCount} more`} />
              </div>
              <FileUploadArea files={propertyFiles} onAdd={(files) => handleFileAdd(files, setPropertyFiles)}
                onRemove={(i) => setPropertyFiles(prev => prev.filter((_, idx) => idx !== i))}
                label="Upload property analysis screenshots" />
            </div>
          )}

          {/* ── Offers Submitted Section ── */}
          {activeSection === 'offers' && (
            <div className="card" style={{ marginBottom: 24 }}>
              <SectionHeader icon="📝" title="Offers Submitted" color="#e94560" />
              <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
                How many offers did you submit today? Track your cumulative progress above.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <input type="number" min="0" value={offersCount}
                  onChange={e => setOffersCount(Math.max(0, parseInt(e.target.value) || 0))}
                  style={{ width: 80, textAlign: 'center', fontSize: 20, fontWeight: 700, padding: '8px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
                <div style={{ fontSize: 13, color: '#888' }}>
                  Today's offers (+{offersCount * UC_POINT_VALUES.offersSubmitted} UC pts)
                </div>
              </div>
              <FileUploadArea files={offerFiles} onAdd={(files) => handleFileAdd(files, setOfferFiles)}
                onRemove={(i) => setOfferFiles(prev => prev.filter((_, idx) => idx !== i))}
                label="Upload calculator screenshots (inputs + returns)" />
            </div>
          )}

          {/* ── Deal Sources Activated (Add Contact) ── */}
          {activeSection === 'contacts' && (
            <div className="card" style={{ marginBottom: 24 }}>
              <SectionHeader icon="🤝" title="Deal Sources Activated" color="#0f3460" />
              <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
                Add new contacts you activated today. (Minimum: {dealSourceMin})
              </p>

              {/* Contacts added this session */}
              {newContacts.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Added today ({newContacts.length}):</div>
                  {newContacts.map((c, i) => (
                    <div key={c.id || i} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                      background: 'rgba(72,199,142,0.04)', border: '1px solid rgba(72,199,142,0.1)',
                      borderRadius: 8, marginBottom: 6, fontSize: 13,
                    }}>
                      <span style={{ color: '#48c78e' }}>✓</span>
                      <span style={{ color: '#ddd', fontWeight: 600 }}>{c.name}</span>
                      <span style={{ fontSize: 11, color: '#666', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
                        {CONTACT_TYPES.find(t => t.value === c.contact_type)?.label || c.contact_type}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <StatusBadge met={newContacts.length >= dealSourceMin}
                label={newContacts.length >= dealSourceMin ? `${newContacts.length} contacts added` : `Need ${dealSourceMin - newContacts.length} more`} />

              {/* Add Contact Form */}
              {showContactForm ? (
                <div style={{ marginTop: 16, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#ddd' }}>New Contact</div>
                  <input placeholder="Name (required)" value={contactForm.name}
                    onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                    style={{ marginBottom: 8, fontSize: 14 }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <input placeholder="Phone (optional)" value={contactForm.phone}
                      onChange={e => setContactForm(p => ({ ...p, phone: e.target.value }))} style={{ fontSize: 13 }} />
                    <input placeholder="Email (optional)" value={contactForm.email}
                      onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))} style={{ fontSize: 13 }} />
                  </div>
                  <select value={contactForm.contact_type}
                    onChange={e => setContactForm(p => ({ ...p, contact_type: e.target.value }))}
                    style={{ marginBottom: 8, fontSize: 13, padding: '8px 10px', width: '100%' }}>
                    {CONTACT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <textarea placeholder="Notes about the interaction..." value={contactForm.notes}
                    onChange={e => setContactForm(p => ({ ...p, notes: e.target.value }))}
                    style={{ marginBottom: 12, fontSize: 13, minHeight: 60 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-primary" onClick={handleAddContact} disabled={!contactForm.name.trim()}
                      style={{ flex: 1, padding: '10px', fontSize: 13, opacity: contactForm.name.trim() ? 1 : 0.5 }}>
                      Save Contact
                    </button>
                    <button className="btn-secondary" onClick={() => setShowContactForm(false)}
                      style={{ padding: '10px 16px', fontSize: 13 }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowContactForm(true)} style={{
                  marginTop: 12, width: '100%', padding: '12px', fontSize: 14, fontWeight: 600,
                  background: 'rgba(15,52,96,0.1)', border: '1px dashed rgba(15,52,96,0.3)',
                  borderRadius: 10, color: '#5ba3e6', cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  + Add New Contact
                </button>
              )}
            </div>
          )}

          {/* ── Follow-Ups Section ── */}
          {activeSection === 'followups' && (
            <div className="card" style={{ marginBottom: 24 }}>
              <SectionHeader icon="📞" title="Follow-Ups" color="#48c78e" />
              <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
                {allContacts.length === 0 && day === 1
                  ? 'No contacts to follow up with yet — add deal sources first!'
                  : `Select a contact and log your follow-up. (Minimum: ${followUpMin})`
                }
              </p>

              {/* Follow-ups logged this session */}
              {followUps.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Logged today ({followUps.length}):</div>
                  {followUps.map((f, i) => (
                    <div key={i} style={{
                      padding: '8px 12px', background: 'rgba(72,199,142,0.04)',
                      border: '1px solid rgba(72,199,142,0.1)', borderRadius: 8, marginBottom: 6, fontSize: 13,
                    }}>
                      <span style={{ color: '#48c78e', marginRight: 8 }}>✓</span>
                      <span style={{ fontWeight: 600, color: '#ddd' }}>{f.contactName}</span>
                      <span style={{ color: '#888', marginLeft: 8 }}>— {f.notes}</span>
                    </div>
                  ))}
                </div>
              )}

              <StatusBadge met={followUps.length >= followUpMin || (allContacts.length === 0 && day === 1)}
                label={followUps.length >= followUpMin ? `${followUps.length} follow-ups logged` : `Need ${followUpMin - followUps.length} more`} />

              {/* Follow-up form */}
              {allContacts.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <select value={selectedContactId}
                    onChange={e => setSelectedContactId(e.target.value)}
                    style={{ marginBottom: 8, fontSize: 13, padding: '8px 10px', width: '100%' }}>
                    <option value="">Select a contact...</option>
                    {allContacts.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({CONTACT_TYPES.find(t => t.value === c.contact_type)?.label || c.contact_type})</option>
                    ))}
                  </select>
                  {selectedContactId && (
                    <>
                      <textarea placeholder="What did you discuss? Next steps?" value={followUpNote}
                        onChange={e => setFollowUpNote(e.target.value)}
                        style={{ marginBottom: 8, fontSize: 13, minHeight: 60 }} />
                      <button className="btn-primary" onClick={handleAddFollowUp}
                        disabled={!followUpNote.trim()}
                        style={{ width: '100%', padding: '10px', fontSize: 13, opacity: followUpNote.trim() ? 1 : 0.5 }}>
                        Log Follow-Up
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Social Media (Optional — Bonus UC Points) ── */}
          {activeSection === 'social' && (
            <div className="card" style={{
              marginBottom: 24,
              background: 'linear-gradient(135deg, rgba(255,107,157,0.04), rgba(255,107,157,0.01))',
              border: '1px solid rgba(255,107,157,0.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <SectionHeader icon="📱" title="Social Media" color="#ff6b9d" />
                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: 'rgba(255,107,157,0.1)', color: '#ff6b9d', fontWeight: 700 }}>
                  BONUS
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
                Optional — Upload screenshots of your social media posts for +{UC_POINT_VALUES.socialMediaPosts} UC Points each. No limit!
              </p>
              {socialMediaFiles.length > 0 && (
                <div style={{ marginBottom: 12, fontSize: 14, fontWeight: 700, color: '#ff6b9d' }}>
                  {socialMediaFiles.length} post{socialMediaFiles.length > 1 ? 's' : ''} (+{socialMediaFiles.length * UC_POINT_VALUES.socialMediaPosts} UC Points)
                </div>
              )}
              <FileUploadArea files={socialMediaFiles} onAdd={(files) => handleFileAdd(files, setSocialMediaFiles)}
                onRemove={(i) => setSocialMediaFiles(prev => prev.filter((_, idx) => idx !== i))}
                label="Upload social media screenshots" accent="#ff6b9d" />
            </div>
          )}

          {/* ── UC Points Preview ── */}
          {previewPoints > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 20px', marginBottom: 16,
              background: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.15)', borderRadius: 10,
            }}>
              <span style={{ fontSize: 13, color: '#888' }}>Today's UC Points:</span>
              <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: '#f0a500' }}>+{previewPoints}</span>
            </div>
          )}

          {/* ── Proof Text + Submit ── */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(233,69,96,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📤</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Daily Check-In</h3>
            </div>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>
              Summarize your day or add any additional notes. Deadline:{' '}
              <span style={{ color: '#e94560', fontWeight: 600 }}>11:59 PM Pacific</span>
            </p>
            <textarea value={proofText} onChange={e => setProofText(e.target.value)}
              placeholder="Describe your day's work, paste links, or summarize results..."
              style={{ marginBottom: 16 }} />
            <button className="btn-primary" onClick={handleSubmit}
              disabled={!standardsMet}
              style={{ width: '100%', opacity: standardsMet ? 1 : 0.5 }}>
              Submit Day {day} {previewPoints > 0 ? `(+${previewPoints} UC Points)` : ''} ✓
            </button>
            {!standardsMet && (
              <p style={{ fontSize: 12, color: '#e94560', textAlign: 'center', marginTop: 8 }}>
                Meet all daily standards: {propertiesCount < propertiesMin && `${propertiesMin} properties`}
                {propertiesCount < propertiesMin && (newContacts.length < dealSourceMin || followUps.length < followUpMin) && ', '}
                {newContacts.length < dealSourceMin && `${dealSourceMin} deal source${dealSourceMin > 1 ? 's' : ''}`}
                {newContacts.length < dealSourceMin && followUps.length < followUpMin && ', '}
                {followUps.length < followUpMin && allContacts.length > 0 && `${followUpMin} follow-up${followUpMin > 1 ? 's' : ''}`}
              </p>
            )}
          </div>
        </>
      ) : null}

      {/* Deadline Reminder */}
      {!isComplete && isCurrentOrPast && !submitted && (
        <div style={{
          marginTop: 20, padding: '14px 20px',
          background: isPost30 ? 'rgba(240,165,0,0.06)' : 'rgba(233,69,96,0.06)',
          border: `1px solid ${isPost30 ? 'rgba(240,165,0,0.1)' : 'rgba(233,69,96,0.1)'}`,
          borderRadius: 12, fontSize: 13,
          color: isPost30 ? '#f0a500' : '#e94560', textAlign: 'center',
        }}>
          {isPost30
            ? 'Submit today to keep your streak alive!'
            : 'Submit before 11:59 PM Pacific or you will be removed from this run'}
        </div>
      )}
    </div>
  );
}

// ── Helper Components ───────────────────────────────────────

function SectionHeader({ icon, title, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, background: `${color}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
      }}>{icon}</div>
      <h3 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h3>
    </div>
  );
}

function StatusBadge({ met, label }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
      background: met ? 'rgba(72,199,142,0.08)' : 'rgba(233,69,96,0.08)',
      border: `1px solid ${met ? 'rgba(72,199,142,0.2)' : 'rgba(233,69,96,0.2)'}`,
      color: met ? '#48c78e' : '#e94560',
    }}>
      {met ? '✓' : '○'} {label}
    </div>
  );
}

function FileUploadArea({ files, onAdd, onRemove, label, accent = '#888' }) {
  return (
    <div>
      {files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {files.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6, fontSize: 12, color: '#ccc',
            }}>
              📎 {f.name}
              <button onClick={() => onRemove(i)} style={{
                background: 'none', border: 'none', color: '#e94560', cursor: 'pointer',
                fontSize: 14, padding: '0 2px', fontFamily: "'DM Sans', sans-serif",
              }}>×</button>
            </div>
          ))}
        </div>
      )}
      <label style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '14px 18px', background: 'rgba(255,255,255,0.03)',
        border: `1px dashed ${accent}30`, borderRadius: 10,
        cursor: 'pointer', fontSize: 13, color: '#888',
      }}>
        📎 {label}
        <input type="file" multiple accept="image/*" style={{ display: 'none' }}
          onChange={e => { if (e.target.files.length) onAdd(e.target.files); e.target.value = ''; }} />
      </label>
    </div>
  );
}

function SubmissionComplete({ submission }) {
  return (
    <div className="card" style={{ borderColor: 'rgba(72,199,142,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: '#48c78e',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'white',
        }}>✓</div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#48c78e' }}>Submitted & Verified</h3>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Your submission:</div>
        <p style={{ color: '#bbb', fontSize: 14 }}>{submission?.proof}</p>
        {submission?.fileName && <AttachmentLink fileName={submission.fileName} fileData={submission.fileData} />}
        {submission?.dayMetrics && (
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(submission.dayMetrics).map(([key, val]) => {
              if (!val || !INDICATOR_LABELS[key]) return null;
              return (
                <span key={key} style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 6,
                  background: `${INDICATOR_COLORS[key] || '#888'}15`, color: INDICATOR_COLORS[key] || '#888',
                  fontWeight: 600,
                }}>
                  +{val} {INDICATOR_LABELS[key]}
                </span>
              );
            })}
          </div>
        )}
        <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
          {submission && new Date(submission.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function SubmissionSuccess({ day, points }) {
  return (
    <div className="card scale-in" style={{ borderColor: 'rgba(72,199,142,0.3)', textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: '#48c78e', marginBottom: 8 }}>
        Submission Received!
      </h3>
      {points > 0 && (
        <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#f0a500', marginBottom: 12 }}>
          +{points} UC Points
        </div>
      )}
      <p style={{ color: '#888', fontSize: 14 }}>
        Day {day} is now complete. {day > 30
          ? 'Streak extended! Come back tomorrow to keep it going.'
          : day < 30 ? `You've unlocked Day ${day + 1}.` : 'Sprint complete! Welcome to Operator Mode.'}
      </p>
    </div>
  );
}

export function AttachmentLink({ fileName, fileData }) {
  if (!fileName) return null;
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(fileName);
  if (!fileData) {
    return <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>📎 {fileName}</div>;
  }
  return (
    <div style={{ marginTop: 8 }}>
      <a href={fileData} target="_blank" rel="noopener noreferrer" download={!isImage ? fileName : undefined}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#e94560',
          textDecoration: 'none', padding: '6px 12px', background: 'rgba(233,69,96,0.08)',
          border: '1px solid rgba(233,69,96,0.15)', borderRadius: 8, cursor: 'pointer',
        }}>
        📎 {fileName} <span style={{ fontSize: 11, color: '#888' }}>↗ Open</span>
      </a>
      {isImage && (
        <img src={fileData} alt={fileName} style={{
          display: 'block', marginTop: 8, maxWidth: '100%', maxHeight: 300,
          borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
        }} />
      )}
    </div>
  );
}
