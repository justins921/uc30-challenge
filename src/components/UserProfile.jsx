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

export default function UserProfile({ user, onUpdateProfile, onChangePassword, onBack, skoolLink }) {
  // Profile state
  const [email, setEmail] = useState(user.email);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [profileMsg, setProfileMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Social media handles (array of {platform, handle})
  const [socialHandles, setSocialHandles] = useState(() => {
    const entries = Object.entries(user.socialHandles || {}).filter(([, v]) => v);
    if (entries.length > 0) return entries.map(([platform, handle]) => ({ platform, handle }));
    return [{ platform: 'instagram', handle: '' }];
  });
  const [socialMsg, setSocialMsg] = useState(null);
  const [savingSocial, setSavingSocial] = useState(false);

  // Password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState(null);
  const [savingPw, setSavingPw] = useState(false);

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

  const handleSaveSocial = async () => {
    setSavingSocial(true);
    setSocialMsg(null);
    const obj = {};
    socialHandles.forEach(h => { if (h.handle.trim()) obj[h.platform] = h.handle.trim(); });
    const result = await onUpdateProfile({ socialHandles: obj });
    if (result?.error) {
      setSocialMsg({ type: 'error', text: result.error });
    } else {
      setSocialMsg({ type: 'success', text: 'Social media handles updated!' });
    }
    setSavingSocial(false);
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

      {/* Social Media Handles */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Social Media</h3>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 1.5 }}>
          Add your social media handles so admins can verify your daily posts.
        </p>
        <ProfileSocialHandles handles={socialHandles} onChange={setSocialHandles} />
        {socialMsg && <Msg type={socialMsg.type} text={socialMsg.text} />}
        <button
          className="btn-primary"
          style={{ padding: '10px 24px' }}
          onClick={handleSaveSocial}
          disabled={savingSocial}
        >
          {savingSocial ? 'Saving...' : 'Save Social Handles'}
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

      {/* CDS Collective / Skool Bonus */}
      {skoolLink && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(83,52,131,0.2), rgba(233,69,96,0.2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>
              +
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>CDS Collective</h3>
              <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
                Bonus community access for UC30 Operators
              </p>
            </div>
          </div>
          <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 16 }}>
            As a UC30 Operator, you have bonus access to the CDS Collective community on Skool.
            Connect with other operators, share wins, and level up together.
          </p>
          <a
            href={skoolLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block', padding: '10px 24px', borderRadius: 10,
              background: 'rgba(83,52,131,0.15)', border: '1px solid rgba(83,52,131,0.3)',
              color: '#c9a0ff', textDecoration: 'none', fontSize: 14, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Join CDS Collective
          </a>
        </div>
      )}

    </div>
  );
}

export function UserSupport({ user, onSubmitTicket, onReplyToTicket, onUpdateTicket, supportTickets }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [ticketAttachment, setTicketAttachment] = useState(null);
  const [ticketMsg, setTicketMsg] = useState(null);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const ticketFileRef = useRef(null);

  const handleAttachFile = async (file) => {
    if (!file) return null;
    if (file.size > 2 * 1024 * 1024) {
      setTicketMsg({ type: 'error', text: 'File must be under 2 MB.' });
      return null;
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result });
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmitTicket = async () => {
    setTicketMsg(null);
    if (!subject.trim()) return setTicketMsg({ type: 'error', text: 'Please enter a subject.' });
    if (!message.trim()) return setTicketMsg({ type: 'error', text: 'Please describe your issue.' });
    setSubmittingTicket(true);
    let att = null;
    if (ticketAttachment) {
      att = await handleAttachFile(ticketAttachment);
    }
    const result = await onSubmitTicket(subject.trim(), message.trim(), att);
    if (result?.error) {
      setTicketMsg({ type: 'error', text: result.error });
    } else {
      setTicketMsg({ type: 'success', text: 'Support request submitted! An admin will review it shortly.' });
      setSubject('');
      setMessage('');
      setTicketAttachment(null);
      if (ticketFileRef.current) ticketFileRef.current.value = '';
    }
    setSubmittingTicket(false);
  };

  return (
    <div className="fade-up" style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Support</h2>

      {/* Previous Tickets */}
      <MyTickets
        tickets={supportTickets}
        userId={user.id}
        onReplyToTicket={onReplyToTicket}
        onUpdateTicket={onUpdateTicket}
        onAttachFile={handleAttachFile}
      />

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
        <div style={{ marginBottom: 16 }}>
          <label>Attachment (optional, max 2 MB)</label>
          <input
            ref={ticketFileRef}
            type="file"
            onChange={e => setTicketAttachment(e.target.files?.[0] || null)}
            style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}
          />
          {ticketAttachment && (
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
              Selected: {ticketAttachment.name}
            </div>
          )}
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

function MyTickets({ tickets, userId, onReplyToTicket, onUpdateTicket, onAttachFile }) {
  const myTickets = (tickets || [])
    .filter(t => t.participantId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (myTickets.length === 0) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {myTickets.map(ticket => (
          <TicketThread
            key={ticket.id}
            ticket={ticket}
            onReply={onReplyToTicket}
            onClose={onUpdateTicket}
            onAttachFile={onAttachFile}
          />
        ))}
      </div>
    </div>
  );
}

function TicketThread({ ticket, onReply, onClose, onAttachFile }) {
  const [replyText, setReplyText] = useState('');
  const [replyFile, setReplyFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState(ticket.status !== 'closed');
  const replyFileRef = useRef(null);

  const statusStyles = {
    open: { bg: 'rgba(233,69,96,0.1)', border: 'rgba(233,69,96,0.2)', color: '#e94560', label: 'Awaiting Response' },
    responded: { bg: 'rgba(72,199,142,0.1)', border: 'rgba(72,199,142,0.2)', color: '#48c78e', label: 'Responded' },
    closed: { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', color: '#666', label: 'Closed' },
  };
  const s = statusStyles[ticket.status] || statusStyles.open;

  // Build messages list with backward compat
  const messages = ticket.messages && ticket.messages.length > 0
    ? ticket.messages
    : [
        { id: 'orig', from: 'user', text: ticket.message, createdAt: ticket.createdAt },
        ...(ticket.adminResponse ? [{
          id: 'admin_resp', from: 'admin', name: 'Admin', text: ticket.adminResponse, createdAt: ticket.respondedAt || ticket.createdAt,
        }] : []),
      ];

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    let att = null;
    if (replyFile) {
      att = await onAttachFile(replyFile);
    }
    await onReply(ticket.id, replyText.trim(), att);
    setReplyText('');
    setReplyFile(null);
    if (replyFileRef.current) replyFileRef.current.value = '';
    setSending(false);
  };

  const handleClose = async () => {
    await onClose(ticket.id, { status: 'closed' });
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header - clickable */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '16px 20px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              background: s.bg, border: `1px solid ${s.border}`, color: s.color,
              fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              {s.label}
            </span>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{ticket.subject}</span>
          </div>
          <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>
            {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {messages.length > 1 && <span> &middot; {messages.length} messages</span>}
          </div>
        </div>
        <div style={{ color: '#444', fontSize: 18, flexShrink: 0, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
          ›
        </div>
      </div>

      {/* Expanded thread */}
      {expanded && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Messages */}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((msg, i) => {
              const isAdmin = msg.from === 'admin';
              return (
                <div key={msg.id || i} style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: isAdmin ? 'flex-start' : 'flex-end',
                }}>
                  <div style={{ fontSize: 10, color: '#555', marginBottom: 3, fontWeight: 600 }}>
                    {isAdmin ? (msg.name || 'Admin') : 'You'}
                    <span style={{ fontWeight: 400, marginLeft: 6 }}>
                      {new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' '}
                      {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{
                    background: isAdmin ? 'rgba(72,199,142,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isAdmin ? 'rgba(72,199,142,0.12)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 10, padding: '10px 14px', fontSize: 13,
                    color: '#ccc', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                    maxWidth: '85%',
                  }}>
                    {msg.text}
                    {msg.attachment && (
                      <div style={{ marginTop: 8 }}>
                        {msg.attachment.type?.startsWith('image/') ? (
                          <img
                            src={msg.attachment.data}
                            alt={msg.attachment.name}
                            style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6 }}
                          />
                        ) : (
                          <a
                            href={msg.attachment.data}
                            download={msg.attachment.name}
                            style={{ color: '#e94560', fontSize: 12, textDecoration: 'underline' }}
                          >
                            {msg.attachment.name}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply form or close button */}
          {ticket.status !== 'closed' ? (
            <div style={{ marginTop: 16 }}>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                style={{
                  width: '100%', padding: '10px 14px', fontSize: 13, borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                  color: '#eee', resize: 'vertical', fontFamily: "'DM Sans', sans-serif",
                  marginBottom: 8, boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <input
                  ref={replyFileRef}
                  type="file"
                  onChange={e => setReplyFile(e.target.files?.[0] || null)}
                  style={{ fontSize: 12, color: '#888', flex: 1, minWidth: 120 }}
                />
                <button
                  className="btn-primary"
                  style={{ padding: '8px 18px', fontSize: 13 }}
                  onClick={handleSendReply}
                  disabled={sending || !replyText.trim()}
                >
                  {sending ? 'Sending...' : 'Reply'}
                </button>
                <button
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: 13 }}
                  onClick={handleClose}
                >
                  Close Ticket
                </button>
              </div>
              {replyFile && (
                <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                  Attached: {replyFile.name}
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginTop: 12, fontSize: 12, color: '#555', fontStyle: 'italic' }}>
              This ticket has been closed.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const SOCIAL_PLATFORMS = [
  { value: 'instagram', label: 'Instagram', placeholder: '@yourusername' },
  { value: 'tiktok', label: 'TikTok', placeholder: '@yourusername' },
  { value: 'twitter', label: 'X (Twitter)', placeholder: '@yourusername' },
  { value: 'facebook', label: 'Facebook', placeholder: 'Profile URL or name' },
  { value: 'youtube', label: 'YouTube', placeholder: 'Channel URL or name' },
];

function ProfileSocialHandles({ handles, onChange }) {
  const usedPlatforms = handles.map(h => h.platform);
  const availablePlatforms = SOCIAL_PLATFORMS.filter(p => !usedPlatforms.includes(p.value));

  const updateHandle = (index, field, value) => {
    onChange(handles.map((h, i) => i === index ? { ...h, [field]: value } : h));
  };

  const addHandle = () => {
    if (availablePlatforms.length === 0) return;
    onChange([...handles, { platform: availablePlatforms[0].value, handle: '' }]);
  };

  const removeHandle = (index) => {
    onChange(handles.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
      {handles.map((h, i) => {
        const platformInfo = SOCIAL_PLATFORMS.find(p => p.value === h.platform);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              value={h.platform}
              onChange={e => updateHandle(i, 'platform', e.target.value)}
              style={{ width: 140, fontSize: 13, padding: '8px 10px' }}
            >
              {SOCIAL_PLATFORMS
                .filter(p => p.value === h.platform || !usedPlatforms.includes(p.value))
                .map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
            </select>
            <input
              value={h.handle}
              onChange={e => updateHandle(i, 'handle', e.target.value)}
              placeholder={platformInfo?.placeholder || '@yourusername'}
              style={{ flex: 1 }}
            />
            {handles.length > 1 && (
              <button
                onClick={() => removeHandle(i)}
                style={{
                  background: 'none', border: 'none', color: '#e94560',
                  cursor: 'pointer', fontSize: 18, padding: '0 6px',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >×</button>
            )}
          </div>
        );
      })}
      {availablePlatforms.length > 0 && (
        <button
          onClick={addHandle}
          style={{
            alignSelf: 'flex-start', background: 'rgba(255,255,255,0.06)',
            border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 8,
            padding: '8px 16px', cursor: 'pointer', fontSize: 13, color: '#888',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          + Add another platform
        </button>
      )}
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
