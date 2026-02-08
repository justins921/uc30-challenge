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
    nextCohortDate,
    login,
    register,
    resetPassword,
    logout,
    submitDay,
    removeParticipant,
    deleteParticipant,
    reactivateParticipant,
    toggleAdmin,
    setCohortStartDate,
    setNextCohortDate,
    contentOverrides,
    setContentOverrides,
    liveCalls,
    setLiveCalls,
    customPhases,
    setPhases,
    landingContent,
    setLandingContent,
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
        landingContent={landingContent}
      />
    );
  }

  // Check if non-admin user's access has expired
  const accessExpired = !user.isAdmin && user.accessExpiresAt && new Date(user.accessExpiresAt) < new Date();
  if (accessExpired) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 20,
      }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: 48, fontWeight: 700, color: '#e94560', marginBottom: 16 }}>
            UC30
          </div>
          <div className="card" style={{ padding: 36 }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Access Expired</div>
            <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
              Your 1-year access to the UC30 Challenge has ended. If you'd like to rejoin,
              please contact us to purchase a new pass.
            </p>
            <button className="btn-secondary" onClick={logout}>Log Out</button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'admin' && user.isAdmin) {
    return (
      <AdminDashboard
        user={user}
        participants={participants}
        onRemove={removeParticipant}
        onDelete={deleteParticipant}
        onReactivate={reactivateParticipant}
        onToggleAdmin={toggleAdmin}
        onLogout={logout}
        cohortStartDate={cohortStartDate}
        nextCohortDate={nextCohortDate}
        onSetCohortStartDate={setCohortStartDate}
        onSetNextCohortDate={setNextCohortDate}
        contentOverrides={contentOverrides}
        onSetContentOverrides={setContentOverrides}
        liveCalls={liveCalls}
        onSetLiveCalls={setLiveCalls}
        customPhases={customPhases}
        onSetPhases={setPhases}
        landingContent={landingContent}
        onSetLandingContent={setLandingContent}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      onLogout={logout}
      onSubmit={submitDay}
      cohortStartDate={cohortStartDate}
      nextCohortDate={nextCohortDate}
      contentOverrides={contentOverrides}
      liveCalls={liveCalls}
      customPhases={customPhases}
    />
  );
}
