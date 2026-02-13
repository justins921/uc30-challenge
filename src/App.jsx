import { useState, useEffect } from 'react';
import { useAppState } from './hooks/useAppState';
import LandingPage from './components/LandingPage';
import LandingPageV2 from './components/LandingPageV2';
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
    loginWithGoogle,
    loginWithApple,
    adminResetPassword,
    requestPasswordReset,
    confirmPasswordReset,
    updateProfile,
    changePassword,
    passwordRecovery,
    authError,
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
    supportTickets,
    submitSupportTicket,
    replyToTicket,
    updateSupportTicket,
    completeGettingStarted,
    verifySubmissionSocial,
    cohortStats,
    communityPosts,
    createCommunityPost,
    commentOnPost,
    deleteCommunityPost,
    deleteCommunityComment,
    pinCommunityPost,
    warnCommunityUser,
    banCommunityUser,
    dismissCommunityWarning,
    navigate,
  } = useAppState();

  // Check for Stripe success redirect
  const [authMode, setAuthMode] = useState(null);
  const [viewAsUser, setViewAsUser] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('paid') === 'true' || params.get('success') === 'true') {
      setAuthMode('register');
      window.history.replaceState({}, '', window.location.pathname);
    }
    // If returning from a password reset link, show login screen
    if (params.get('recovery') === 'true') {
      setAuthMode('login');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Show loading screen during initial load (prevents flash of landing page after OAuth redirect)
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 20,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: 48, fontWeight: 700, color: '#e94560' }}>UC30</div>
          <div style={{ color: '#666', marginTop: 8, fontSize: 13 }}>Loading...</div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (currentView === 'login' || !user) {
    // If user clicked "Log In"/"Register" from landing, arrived from Stripe redirect,
    // or returned from a failed OAuth redirect (authError)
    if (authMode || authError) {
      return (
        <LoginScreen
          onLogin={login}
          onRegister={register}
          // Google/Apple OAuth disabled for now — re-enable when ready
          // onLoginWithGoogle={loginWithGoogle}
          // onLoginWithApple={loginWithApple}
          onRequestReset={requestPasswordReset}
          onConfirmReset={confirmPasswordReset}
          initialMode={authMode || 'login'}
          passwordRecovery={passwordRecovery}
          onBackToLanding={() => setAuthMode(null)}
          authError={authError}
        />
      );
    }

    // Default: show landing page
    // Visit /v2 to preview the marketing-optimized V2 landing page
    const isV2 = window.location.pathname === '/v2'
      || new URLSearchParams(window.location.search).get('v') === '2';
    const LandingComponent = isV2 ? LandingPageV2 : LandingPage;
    return (
      <LandingComponent
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
    // Impersonation: show Dashboard as selected user
    if (viewAsUser) {
      const impersonated = participants.find(p => p.id === viewAsUser);
      if (impersonated) {
        return (
          <div>
            <div style={{
              position: 'sticky', top: 0, zIndex: 200,
              background: 'rgba(240,165,0,0.95)', padding: '8px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#000' }}>
                Viewing as: {impersonated.firstName} {impersonated.lastName} ({impersonated.email})
              </span>
              <button
                onClick={() => setViewAsUser(null)}
                style={{
                  fontSize: 12, padding: '4px 14px', borderRadius: 6, cursor: 'pointer',
                  border: '1px solid rgba(0,0,0,0.3)', background: 'rgba(0,0,0,0.15)',
                  color: '#000', fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Exit View
              </button>
            </div>
            <Dashboard
              user={impersonated}
              onLogout={() => setViewAsUser(null)}
              onSubmit={() => {}}
              cohortStartDate={cohortStartDate}
              nextCohortDate={nextCohortDate}
              contentOverrides={contentOverrides}
              liveCalls={liveCalls}
              customPhases={customPhases}
              onUpdateProfile={() => {}}
              onChangePassword={() => {}}
              onSubmitTicket={() => {}}
              onReplyToTicket={() => {}}
              onUpdateTicket={() => {}}
              supportTickets={supportTickets}
              cohortStats={cohortStats}
              onCompleteGettingStarted={() => {}}
              communityPosts={communityPosts}
              onCreateCommunityPost={() => {}}
              onCommentOnPost={() => {}}
              onDeleteCommunityPost={() => {}}
              onDeleteCommunityComment={() => {}}
              onPinCommunityPost={() => {}}
              onDismissCommunityWarning={() => {}}
            />
          </div>
        );
      }
    }

    return (
      <AdminDashboard
        user={user}
        participants={participants}
        onRemove={removeParticipant}
        onDelete={deleteParticipant}
        onReactivate={reactivateParticipant}
        onToggleAdmin={toggleAdmin}
        onResetPassword={adminResetPassword}
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
        supportTickets={supportTickets}
        onUpdateTicket={updateSupportTicket}
        onReplyToTicket={replyToTicket}
        onVerifySubmissionSocial={verifySubmissionSocial}
        communityPosts={communityPosts}
        onDeleteCommunityPost={deleteCommunityPost}
        onDeleteCommunityComment={deleteCommunityComment}
        onPinCommunityPost={pinCommunityPost}
        onWarnCommunityUser={warnCommunityUser}
        onBanCommunityUser={banCommunityUser}
        onCreateCommunityPost={createCommunityPost}
        onCommentOnPost={commentOnPost}
        onViewAsUser={setViewAsUser}
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
      onUpdateProfile={updateProfile}
      onChangePassword={changePassword}
      onSubmitTicket={submitSupportTicket}
      onReplyToTicket={replyToTicket}
      onUpdateTicket={updateSupportTicket}
      supportTickets={supportTickets}
      cohortStats={cohortStats}
      onCompleteGettingStarted={completeGettingStarted}
      communityPosts={communityPosts}
      onCreateCommunityPost={createCommunityPost}
      onCommentOnPost={commentOnPost}
      onDeleteCommunityPost={deleteCommunityPost}
      onDeleteCommunityComment={deleteCommunityComment}
      onPinCommunityPost={pinCommunityPost}
      onDismissCommunityWarning={dismissCommunityWarning}
    />
  );
}
