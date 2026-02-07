import { useState } from 'react';

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return setError('Please enter your name');
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email');
    setError('');
    onLogin(name.trim(), email.trim());
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(233,69,96,0.08) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-10%', width: 500, height: 500,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(83,52,131,0.08) 0%, transparent 70%)',
      }} />

      <div className="fade-up" style={{ maxWidth: 460, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div className="mono" style={{ fontSize: 64, fontWeight: 700, color: '#e94560', lineHeight: 1, marginBottom: 8 }}>
          UC30
        </div>
        <div style={{ fontSize: 13, color: '#666', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>
          30-Day First Deal Challenge
        </div>
        <div style={{ width: 40, height: 2, background: '#e94560', margin: '0 auto 40px' }} />

        {/* Form */}
        <div className="card" style={{ padding: 36, textAlign: 'left' }}>
          <div style={{ marginBottom: 20 }}>
            <label>Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.2)',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#e94560', marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button className="btn-primary" style={{ width: '100%' }} onClick={handleSubmit}>
            Enter Challenge →
          </button>

          <div style={{ marginTop: 16, fontSize: 12, color: '#555', textAlign: 'center' }}>
            Admin access: <span style={{ color: '#e94560' }}>admin@uc30.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
