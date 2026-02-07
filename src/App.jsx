import { useState, useEffect } from 'react';
import { useAppState } from './hooks/useAppState';
import LandingPage from './components/LandingPage';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const {
    user,
    participants,
    currentView,
    loading,
    cohortStartDate,
    login,
    register,
    resetPassword,
    logout,
    submitDay,
    removeParticipant,
    reactivateParticipant,
    setCohortStartDate,
    navigate,
  } = useAppState();

  // Check for Stripe success redirect
  const [authMode, setAuthMode] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('paid') === 'true' || params.get('success') === 'true') {
      setAuthMode('register');
      // Clean URL without reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0a0f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="mono" style={{
            fontSize: 48, fontWeight: 700, color: '#e94560',
            animation: 'pulse 1.5s infinite',
          }}>
            UC30
          </div>
          <div style={{ color: '#666', marginTop: 12, fontSize: 14 }}>Loading challenge...</div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (currentView === 'login' || !user) {
    // If user clicked "Log In" or "Register" from landing, or arrived from Stripe redirect
    if (authMode) {
      return (
        <LoginScreen
          onLogin={login}
          onRegister={register}
          onResetPassword={resetPassword}
          initialMode={authMode}
          onBackToLanding={() => setAuthMode(null)}
        />
      );
    }

    // Default: show landing page
    return (
      <LandingPage
        onGoToLogin={(mode) => setAuthMode(mode || 'login')}
      />
    );
  }

  if (currentView === 'admin' && user.isAdmin) {
    return (
      <AdminDashboard
        user={user}
        participants={participants}
        onRemove={removeParticipant}
        onReactivate={reactivateParticipant}
        onLogout={logout}
        cohortStartDate={cohortStartDate}
        onSetCohortStartDate={setCohortStartDate}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      onLogout={logout}
      onSubmit={submitDay}
      onReactivate={() => reactivateParticipant(user.id)}
      cohortStartDate={cohortStartDate}
    />
  );
}
