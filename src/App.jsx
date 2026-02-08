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
      />
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
    />
  );
}
