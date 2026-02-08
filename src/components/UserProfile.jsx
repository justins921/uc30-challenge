import { useState, useRef } from 'react';

function resizeImage(file, maxSize = 150) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext('2d');
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, maxSize, maxSize);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function UserProfile({ user, onUpdateProfile, onChangePassword, onSubmitTicket, supportTickets, onBack }) {
  // Profile state
  const [email, setEmail] = useState(user.email);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [profileMsg, setProfileMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState(null);
  const [savingPw, setSavingPw] = useState(false);

  // Support state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [ticketMsg, setTicketMsg] = useState(null);
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const fileRef = useRef(null);

  const initials = `${(user.firstName || '?')[0]}${(user.lastName || '?')[0]}`.toUpperCase();

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg(null);
    const updates = {};
    if (email.trim() !== user.email) updates.email = email.trim();
    if (firstName.trim() !== user.firstName) updates.firstName = firstName.trim();
    if (lastName.trim() !== user.lastName) updates.lastName = lastName.trim();
    if (Object.keys(updates).length === 0) {
      setProfileMsg({ type: 'info', text: 'No changes to save.' });
      setSavingProfile(false);
      return;
    }
    const result = await onUpdateProfile(updates);
    if (result?.error) {
      setProfileMsg({ type: 'error', text: result.error });
    } else {
      setProfileMsg({ type: 'success', text: 'Profile updated!' });
    }
    setSavingProfile(false);
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileMsg({ type: 'error', text: 'Please select an image file.' });
      return;
    }
    try {
      const dataUrl = await resizeImage(file, 150);
      const result = await onUpdateProfile({ profilePicture: dataUrl });
      if (result?.error) {
        setProfileMsg({ type: 'error', text: result.error });
      } else {
        setProfileMsg({ type: 'success', text: 'Profile picture updated!' });
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Failed to process image.' });
    }
  };

  const handleChangePassword = async () => {
    setPwMsg(null);
    if (!currentPw) return setPwMsg({ type: 'error', text: 'Enter your current password.' });
    if (newPw.length < 6) return setPwMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
    if (newPw !== confirmPw) return setPwMsg({ type: 'error', text: 'Passwords do not match.' });
    setSavingPw(true);
    const result = await onChangePassword(currentPw, newPw);
    if (result?.error) {
      setPwMsg({ type: 'error', text: result.error });
    } else {
      setPwMsg({ type: 'success', text: 'Password changed!' });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    }
    setSavingPw(false);
  };

  const handleSubmitTicket = async () => {
    setTicketMsg(null);
    if (!subject.trim()) return setTicketMsg({ type: 'error', text: 'Please enter a subject.' });
    if (!message.trim()) return setTicketMsg({ type: 'error', text: 'Please describe your issue.' });
    setSubmittingTicket(true);
    const result = await onSubmitTicket(subject.trim(), message.trim());
    if (result?.error) {
      setTicketMsg({ type: 'error', text: result.error });
    } else {
      setTicketMsg({ type: 'success', text: 'Support request submitted! An admin will review it shortly.' });
      setSubject('');
      setMessage('');
    }
    setSubmittingTicket(false);
  };

  return (
    <div className="fade-up" style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', color: '#e94560', cursor: 'pointer',
          fontSize: 14, fontWeight: 600, padding: '8px 0', marginBottom: 16,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        &larr; Back to Dashboard
      </button>

      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Your Profile</h2>

      {/* Avatar + Name Header */}
      <div className="card" style={{ padding: 24, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', position: 'relative', overflow: 'hidden',
            background: user.profilePicture ? 'none' : 'linear-gradient(135deg, #e94560, #533483)',
            border: '2px solid rgba(233,69,96,0.3)',
          }}
        >
          {user.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{initials}</span>
          )}
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0}
          >
            <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>Edit</span>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handlePictureUpload}
        />
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{user.firstName} {user.lastName}</div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{user.email}</div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
            Click avatar to upload a new picture
          </div>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Edit Profile</h3>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label>First Name</label>
            <input value={firstName} onChange={e => setFirstName(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Last Name</label>
            <input value={lastName} onChange={e => setLastName(e.target.value)} />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        {profileMsg && (
          <Msg type={profileMsg.type} text={profileMsg.text} />
        )}
        <button
          className="btn-primary"
          style={{ padding: '10px 24px' }}
          onClick={handleSaveProfile}
          disabled={savingProfile}
        >
          {savingProfile ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Change Password */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Change Password</h3>
        <div style={{ marginBottom: 16 }}>
          <label>Current Password</label>
          <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Enter current password" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>New Password</label>
          <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="At least 6 characters" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Confirm New Password</label>
          <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Confirm new password" />
        </div>
        {pwMsg && (
          <Msg type={pwMsg.type} text={pwMsg.text} />
        )}
        <button
          className="btn-primary"
          style={{ padding: '10px 24px' }}
          onClick={handleChangePassword}
          disabled={savingPw}
        >
          {savingPw ? 'Updating...' : 'Update Password'}
        </button>
      </div>

      {/* Support Section */}
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Support</h3>

      {/* Previous Tickets */}
      <MyTickets tickets={supportTickets} userId={user.id} />

      {/* New Support Request */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>New Request</h3>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 1.5 }}>
          Submit a support request and an admin will get back to you.
        </p>
        <div style={{ marginBottom: 16 }}>
          <label>Subject</label>
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief description of your issue" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Describe your issue in detail..."
            rows={4}
            style={{
              width: '100%', padding: '10px 14px', fontSize: 14, borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
              color: '#eee', resize: 'vertical', fontFamily: "'DM Sans', sans-serif",
              boxSizing: 'border-box',
            }}
          />
        </div>
        {ticketMsg && (
          <Msg type={ticketMsg.type} text={ticketMsg.text} />
        )}
        <button
          className="btn-primary"
          style={{ padding: '10px 24px' }}
          onClick={handleSubmitTicket}
          disabled={submittingTicket}
        >
          {submittingTicket ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </div>
  );
}

function MyTickets({ tickets, userId }) {
  const myTickets = (tickets || [])
    .filter(t => t.participantId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (myTickets.length === 0) return null;

  const statusStyles = {
    open: { bg: 'rgba(233,69,96,0.1)', border: 'rgba(233,69,96,0.2)', color: '#e94560', label: 'Awaiting Response' },
    responded: { bg: 'rgba(72,199,142,0.1)', border: 'rgba(72,199,142,0.2)', color: '#48c78e', label: 'Responded' },
    closed: { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', color: '#666', label: 'Closed' },
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {myTickets.map(ticket => {
          const s = statusStyles[ticket.status] || statusStyles.open;
          return (
            <div key={ticket.id} className="card" style={{ padding: 20 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{ticket.subject}</div>
                <span style={{
                  background: s.bg, border: `1px solid ${s.border}`, color: s.color,
                  fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  {s.label}
                </span>
              </div>

              {/* Date */}
              <div style={{ fontSize: 11, color: '#555', marginBottom: 10 }}>
                Submitted {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>

              {/* User's message */}
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#aaa', lineHeight: 1.6,
                whiteSpace: 'pre-wrap', marginBottom: ticket.adminResponse ? 12 : 0,
              }}>
                {ticket.message}
              </div>

              {/* Admin response */}
              {ticket.adminResponse && (
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 11, color: '#48c78e', fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Admin Response
                    {ticket.respondedAt && (
                      <span style={{ fontWeight: 400, color: '#555' }}>
                        &middot; {new Date(ticket.respondedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <div style={{
                    background: 'rgba(72,199,142,0.06)', border: '1px solid rgba(72,199,142,0.12)',
                    borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ccc', lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {ticket.adminResponse}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Msg({ type, text }) {
  const colors = {
    error: { bg: 'rgba(233,69,96,0.1)', border: 'rgba(233,69,96,0.2)', color: '#e94560' },
    success: { bg: 'rgba(72,199,142,0.1)', border: 'rgba(72,199,142,0.2)', color: '#48c78e' },
    info: { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', color: '#888' },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8,
      padding: '10px 14px', fontSize: 13, color: c.color, marginBottom: 16,
    }}>
      {text}
    </div>
  );
}
