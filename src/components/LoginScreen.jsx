import { useState } from 'react';

export default function LoginScreen({ onLogin, onRegister, onRequestReset, onConfirmReset, initialMode }) {
  const [mode, setMode] = useState(initialMode || 'login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset flow state
  const [resetStep, setResetStep] = useState(1); // 1 = enter email, 2 = enter code + new pw
  const [resetCode, setResetCode] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email');
    if (!password) return setError('Please enter your password');
    setError('');
    const result = await onLogin(email.trim(), password);
    if (result?.error) setError(result.error);
  };

  const handleRegister = async () => {
    if (!firstName.trim()) return setError('Please enter your first name');
    if (!lastName.trim()) return setError('Please enter your last name');
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirmPassword) return setError('Passwords do not match');
    setError('');
    const result = await onRegister(firstName.trim(), lastName.trim(), email.trim(), password);
    if (result?.error) setError(result.error);
  };

  const handleRequestReset = async () => {
    const emailToReset = resetEmail || email;
    if (!emailToReset.trim() || !emailToReset.includes('@')) return setError('Please enter a valid email');
    setError('');
    const result = await onRequestReset(emailToReset.trim());
    if (result?.error) {
      setError(result.error);
    } else {
      setResetEmail(emailToReset.trim());
      setResetStep(2);
      if (result?.kitEnabled) {
        setSuccess('Check your email for a 6-digit reset code.');
      } else {
        setSuccess('A reset code has been generated. Contact your administrator for the code, or check your email.');
      }
    }
  };

  const handleConfirmReset = async () => {
    if (!resetCode.trim()) return setError('Please enter the reset code');
    if (password.length < 6) return setError('New password must be at least 6 characters');
    if (password !== confirmPassword) return setError('Passwords do not match');
    setError('');
    const result = await onConfirmReset(resetEmail, resetCode.trim(), password);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess('Password reset! You can now log in.');
      setResetStep(1);
      setResetCode('');
      setResetEmail('');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => switchMode('login'), 1500);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setResetStep(1);
    setResetCode('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (mode === 'login') handleLogin();
      else if (mode === 'register') handleRegister();
      else if (mode === 'reset' && resetStep === 1) handleRequestReset();
      else if (mode === 'reset' && resetStep === 2) handleConfirmReset();
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
          {mode === 'reset' ? (
            <>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Reset Password</h3>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
                {resetStep === 1
                  ? 'Enter your email and we\'ll send you a reset code.'
                  : 'Enter the 6-digit code and your new password.'}
              </p>

              {resetStep === 1 && (
                <div style={{ marginBottom: 20 }}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={resetEmail || email}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="you@email.com"
                    onKeyDown={handleKeyDown}
                  />
                </div>
              )}

              {resetStep === 2 && (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <label>Reset Code</label>
                    <input
                      value={resetCode}
                      onChange={e => setResetCode(e.target.value)}
                      placeholder="6-digit code"
                      maxLength={6}
                      onKeyDown={handleKeyDown}
                      style={{ letterSpacing: 4, fontSize: 18, textAlign: 'center' }}
                    />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label>New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {mode === 'register' && (
                <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                  <div style={{ flex: 1 }}>
                    <label>First Name</label>
                    <input
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="First"
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Last Name</label>
                    <input
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Last"
                      onKeyDown={handleKeyDown}
                    />
                  </div>
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

              <div style={{ marginBottom: mode === 'register' ? 20 : 4 }}>
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                  onKeyDown={handleKeyDown}
                />
              </div>

              {mode === 'login' && (
                <div style={{ marginBottom: 20, textAlign: 'right' }}>
                  <span
                    onClick={() => switchMode('reset')}
                    style={{ fontSize: 12, color: '#e94560', cursor: 'pointer' }}
                  >
                    Forgot password?
                  </span>
                </div>
              )}

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
            </>
          )}

          {error && (
            <div style={{
              background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.2)',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#e94560', marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: 'rgba(72,199,142,0.1)', border: '1px solid rgba(72,199,142,0.2)',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#48c78e', marginBottom: 16,
            }}>
              {success}
            </div>
          )}

          {mode === 'reset' ? (
            <button
              className="btn-primary"
              style={{ width: '100%' }}
              onClick={resetStep === 1 ? handleRequestReset : handleConfirmReset}
            >
              {resetStep === 1 ? 'Send Reset Code' : 'Reset Password'}
            </button>
          ) : (
            <button
              className="btn-primary"
              style={{ width: '100%' }}
              onClick={mode === 'login' ? handleLogin : handleRegister}
            >
              {mode === 'login' ? 'Log In \u2192' : 'Create Account \u2192'}
            </button>
          )}

          <div style={{ marginTop: 16, fontSize: 13, color: '#555', textAlign: 'center' }}>
            {mode === 'login' ? (
              <>Don't have an account? <span onClick={() => switchMode('register')} style={{ color: '#e94560', cursor: 'pointer' }}>Register</span></>
            ) : mode === 'register' ? (
              <>Already have an account? <span onClick={() => switchMode('login')} style={{ color: '#e94560', cursor: 'pointer' }}>Log in</span></>
            ) : (
              <span onClick={() => switchMode('login')} style={{ color: '#e94560', cursor: 'pointer' }}>Back to Log In</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
