import { useState } from 'react';
import { subscribeUser, tagByName } from '../utils/kit';

// Pre-launch waitlist capture — used by both landing pages (A/B test).
// Subscribes to Kit and tags "UC30 Waitlist".
export default function WaitlistModal({ onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!email.includes('@') || !email.includes('.')) { setError('Please enter a valid email.'); return; }
    setSubmitting(true); setError('');
    try {
      await subscribeUser(email, name.trim());
      await tagByName(email, 'UC30 Waitlist');
    } catch { /* ignore network errors — still confirm */ }
    setSubmitting(false);
    setDone(true);
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} className="card" style={{ maxWidth: 440, width: '100%', padding: 32, position: 'relative' }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 16, background: 'none', border: 'none',
          color: '#888', fontSize: 22, cursor: 'pointer', lineHeight: 1, fontFamily: "'DM Sans', sans-serif",
        }}>&times;</button>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>&#127881;</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>You're on the list!</h3>
            <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.7, marginBottom: 22 }}>
              You'll be the first to know when the next UC30 cohort opens — with founding-member early-bird pricing. Keep an eye on your inbox.
            </p>
            <button className="btn-primary" onClick={onClose} style={{ padding: '12px 32px' }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#e94560', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
              Founding Cohort
            </div>
            <h3 style={{ fontSize: 23, fontWeight: 800, marginBottom: 8, lineHeight: 1.25 }}>Join the UC30 Waitlist</h3>
            <p style={{ fontSize: 14, color: '#999', lineHeight: 1.7, marginBottom: 20 }}>
              Be first in line for the next cohort — and lock in early-bird pricing before doors open. No payment today.
            </p>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="First name (optional)"
                style={{ fontSize: 15, padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#eee', fontFamily: "'DM Sans', sans-serif" }} />
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="your@email.com" required
                style={{ fontSize: 15, padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#eee', fontFamily: "'DM Sans', sans-serif" }} />
              <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '14px', fontSize: 16, fontWeight: 700, marginTop: 4 }}>
                {submitting ? 'Joining…' : 'Join the Waitlist'}
              </button>
            </form>
            {error && <div style={{ fontSize: 12, color: '#e94560', marginTop: 8 }}>{error}</div>}
            <p style={{ fontSize: 11, color: '#666', marginTop: 12, textAlign: 'center' }}>
              We'll only email you about UC30. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
