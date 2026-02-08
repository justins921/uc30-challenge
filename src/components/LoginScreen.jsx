import { useState } from 'react';

export default function LoginScreen({ onLogin, onRegister, onLoginWithGoogle, onLoginWithApple, onRequestReset, onConfirmReset, initialMode, passwordRecovery, onBackToLanding }) {
  const [mode, setMode] = useState(initialMode || 'login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetSent, setResetSent] = useState(false);

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
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email');
    setError('');
    const result = await onRequestReset(email.trim());
    if (result?.error) {
      setError(result.error);
    } else {
      setResetSent(true);
      setSuccess('Check your email for a password reset link.');
    }
  };

  // Called when user lands on the app after clicking the Supabase reset link
  const handleConfirmReset = async () => {
    if (password.length < 6) return setError('New password must be at least 6 characters');
    if (password !== confirmPassword) return setError('Passwords do not match');
    setError('');
    const result = await onConfirmReset(password);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess('Password updated! You can now log in.');
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
    setResetSent(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (passwordRecovery) handleConfirmReset();
      else if (mode === 'login') handleLogin();
      else if (mode === 'register') handleRegister();
      else if (mode === 'reset' && !resetSent) handleRequestReset();
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

        {/* Password Recovery mode (user clicked reset link from email) */}
        {passwordRecovery ? (
          <div className="card" style={{ padding: 36, textAlign: 'left' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Set New Password</h3>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
              Enter your new password below.
            </p>
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

            {error && <ErrorMsg text={error} />}
            {success && <SuccessMsg text={success} />}

            <button className="btn-primary" style={{ width: '100%' }} onClick={handleConfirmReset}>
              Update Password
            </button>
          </div>
        ) : (
          <>
            {/* Mode Toggle (hidden during reset) */}
            {mode !== 'reset' && (
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
            )}

            {/* Form */}
            <div className="card" style={{ padding: 36, textAlign: 'left' }}>
              {mode === 'reset' ? (
                <>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Reset Password</h3>
                  <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
                    {resetSent
                      ? 'A password reset link has been sent to your email. Click the link to set a new password.'
                      : 'Enter your email and we\'ll send you a reset link.'}
                  </p>
                  {!resetSent && (
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

              {error && <ErrorMsg text={error} />}
              {success && <SuccessMsg text={success} />}

              {mode === 'reset' ? (
                !resetSent && (
                  <button className="btn-primary" style={{ width: '100%' }} onClick={handleRequestReset}>
                    Send Reset Link
                  </button>
                )
              ) : (
                <button
                  className="btn-primary"
                  style={{ width: '100%' }}
                  onClick={mode === 'login' ? handleLogin : handleRegister}
                >
                  {mode === 'login' ? 'Log In \u2192' : 'Create Account \u2192'}
                </button>
              )}

              {/* Social login buttons (shown on login and register, not reset) */}
              {mode !== 'reset' && (onLoginWithGoogle || onLoginWithApple) && (
                <>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    margin: '20px 0 16px',
                  }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                    <span style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>or</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                  </div>

                  {onLoginWithGoogle && (
                    <button
                      onClick={onLoginWithGoogle}
                      style={{
                        width: '100%', padding: '11px 0', borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(255,255,255,0.04)',
                        color: '#ccc', fontSize: 14, fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 10,
                        fontFamily: "'DM Sans', sans-serif",
                        transition: 'all 0.2s',
                        marginBottom: 10,
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18">
                        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
                        <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                      </svg>
                      Continue with Google
                    </button>
                  )}

                  {onLoginWithApple && (
                    <button
                      onClick={onLoginWithApple}
                      style={{
                        width: '100%', padding: '11px 0', borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(255,255,255,0.04)',
                        color: '#ccc', fontSize: 14, fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 10,
                        fontFamily: "'DM Sans', sans-serif",
                        transition: 'all 0.2s',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="#fff">
                        <path d="M13.71 4.66c-.76.9-2 1.6-3.21 1.49-.15-1.22.45-2.52 1.15-3.32.76-.88 2.1-1.53 3.18-1.57.13 1.26-.37 2.51-1.12 3.4zm1.1 1.74c-1.78-.1-3.29 1.01-4.14 1.01-.85 0-2.14-.96-3.54-.93-1.82.03-3.51 1.06-4.44 2.7-1.9 3.28-.49 8.15 1.35 10.82.9 1.32 1.98 2.78 3.4 2.73 1.36-.06 1.87-.88 3.51-.88 1.64 0 2.1.88 3.53.85 1.47-.03 2.4-1.33 3.3-2.66.68-.98 1.18-1.97 1.44-2.53-3.22-1.25-3.75-5.9-.56-7.68-.93-1.16-2.3-1.83-3.54-1.83-.2 0-.21.01-.31.04z"/>
                      </svg>
                      Continue with Apple
                    </button>
                  )}
                </>
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
          </>
        )}
      </div>
    </div>
  );
}

function ErrorMsg({ text }) {
  return (
    <div style={{
      background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.2)',
      borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#e94560', marginBottom: 16,
    }}>
      {text}
    </div>
  );
}

function SuccessMsg({ text }) {
  return (
    <div style={{
      background: 'rgba(72,199,142,0.1)', border: '1px solid rgba(72,199,142,0.2)',
      borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#48c78e', marginBottom: 16,
    }}>
      {text}
    </div>
  );
}
