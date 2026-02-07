import { useState } from 'react';

export default function LoginScreen({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email');
    if (!password) return setError('Please enter your password');
    setError('');
    const result = onLogin(email.trim(), password);
    if (result?.error) setError(result.error);
  };

  const handleRegister = () => {
    if (!name.trim()) return setError('Please enter your name');
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirmPassword) return setError('Passwords do not match');
    setError('');
    const result = onRegister(name.trim(), email.trim(), password);
    if (result?.error) setError(result.error);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      mode === 'login' ? handleLogin() : handleRegister();
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(233,69,96,0.08) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-10%', width: 500, height: 500,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(83,52,131,0.08) 0%, transparent 70%)',
      }} />

      <div className="fade-up" style={{ maxWidth: 460, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div className="mono" style={{ fontSize: 64, fontWeight: 700, color: '#e94560', lineHeight: 1, marginBottom: 8 }}>
          UC30
        </div>
        <div style={{ fontSize: 13, color: '#666', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>
          30-Day First Deal Challenge
        </div>
        <div style={{ width: 40, height: 2, background: '#e94560', margin: '0 auto 32px' }} />

        {/* Mode Toggle */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.04)',
          borderRadius: 12, padding: 4, marginBottom: 24,
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <button
            onClick={() => switchMode('login')}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
              background: mode === 'login' ? 'rgba(233,69,96,0.15)' : 'transparent',
              color: mode === 'login' ? '#e94560' : '#666',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
            }}
          >
            Log In
          </button>
          <button
            onClick={() => switchMode('register')}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
              background: mode === 'register' ? 'rgba(233,69,96,0.15)' : 'transparent',
              color: mode === 'register' ? '#e94560' : '#666',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
            }}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <div className="card" style={{ padding: 36, textAlign: 'left' }}>
          {mode === 'register' && (
            <div style={{ marginBottom: 20 }}>
              <label>Full Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                onKeyDown={handleKeyDown}
              />
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div style={{ marginBottom: mode === 'register' ? 20 : 24 }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
              onKeyDown={handleKeyDown}
            />
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: 24 }}>
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                onKeyDown={handleKeyDown}
              />
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.2)',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#e94560', marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button
            className="btn-primary"
            style={{ width: '100%' }}
            onClick={mode === 'login' ? handleLogin : handleRegister}
          >
            {mode === 'login' ? 'Log In \u2192' : 'Create Account \u2192'}
          </button>

          <div style={{ marginTop: 16, fontSize: 13, color: '#555', textAlign: 'center' }}>
            {mode === 'login' ? (
              <>Don't have an account? <span onClick={() => switchMode('register')} style={{ color: '#e94560', cursor: 'pointer' }}>Register</span></>
            ) : (
              <>Already have an account? <span onClick={() => switchMode('login')} style={{ color: '#e94560', cursor: 'pointer' }}>Log in</span></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
