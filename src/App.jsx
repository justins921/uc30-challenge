import { useState, useEffect } from 'react';
import { useAppState } from './hooks/useAppState';
import LandingPage from './components/LandingPage';
import LandingPageV2 from './components/LandingPageV2';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import OnboardingFlow from './components/OnboardingFlow';
import ActivationPhase from './components/ActivationPhase';
import AffiliatePage from './components/AffiliatePage';

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
    landingVersion,
    setLandingVersion,
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
    completeOnboarding,
    skoolLink,
    setSkoolLink,
    practiceDaySettings,
    setPracticeDaySettings,
    dailyMinimumsOverrides,
    setDailyMinimums,
    addContact,
    updateContact,
    getContacts,
    addFollowUp,
    getFollowUps,
    getFollowUpsByContact,
    uploadFile,
    getUploads,
    getUploadUrl,
    getContactsForParticipant,
    navigate,
    // Quiz system
    getQuizAttempts,
    addQuizAttempt,
    // Compliance system
    complianceSettings,
    removalReason,
    setRemovalReason,
    getDailySubmissions,
    getAllDailySubmissions,
    getDailySubmission,
    getRemovalLog,
    setComplianceDailyMinimums,
    setComplianceWeeklyMinimums,
    setComplianceEnforcement,
    completeActivation,
    submitPipelineDay,
    activateNextCohort,
    saveConfidenceSurvey,
    graduateViaContract,
  } = useAppState();

  // CRM contacts for current user (loaded on login)
  const [userContacts, setUserContacts] = useState([]);
  useEffect(() => {
    if (user && getContacts) {
      Promise.resolve(getContacts(user.id)).then(c => setUserContacts(c || []));
    }
  }, [user, getContacts]);

  // Refresh contacts when adding one
  const handleAddContact = async (contactData) => {
    const result = await addContact(contactData);
    if (result?.success) {
      // Refresh the contacts list
      const fresh = await Promise.resolve(getContacts(user.id));
      setUserContacts(fresh || []);
    }
    return result;
  };

  // Check for Stripe success redirect
  const [authMode, setAuthMode] = useState(null);
  const [viewAsUser, setViewAsUser] = useState(null);
  const [participantMode, setParticipantMode] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('paid') === 'true' || params.get('success') === 'true') {
      // If user is already logged in, show success message instead of register form
      if (user) {
        setPaymentSuccess(true);
      } else {
        setAuthMode('register');
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('payment_failed') === 'true') {
      setPaymentFailed(true);
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

  // Affiliate page — accessible to anyone, no auth required
  if (window.location.pathname.replace(/\/+$/, '') === '/affiliates') {
    return <AffiliatePage />;
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
    // Admin-selected version via setting, with URL override for previewing
    const path = window.location.pathname.replace(/\/+$/, '');
    const urlOverride = path === '/v2' || path === '/v1'
      || new URLSearchParams(window.location.search).get('v')
      || (window.location.hash === '#v2' || window.location.hash === '#v1');
    let useV2;
    if (path === '/v2' || new URLSearchParams(window.location.search).get('v') === '2' || window.location.hash === '#v2') {
      useV2 = true;
    } else if (path === '/v1' || new URLSearchParams(window.location.search).get('v') === '1' || window.location.hash === '#v1') {
      useV2 = false;
    } else {
      useV2 = landingVersion === 'v2';
    }
    const LandingComponent = useV2 ? LandingPageV2 : LandingPage;
    return (
      <LandingComponent
        onGoToLogin={(mode) => setAuthMode(mode || 'login')}
        landingContent={landingContent}
      />
    );
  }

  // Payment success screen (shown after Stripe checkout redirect for logged-in users)
  if (paymentSuccess) {
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
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#10003;</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Payment Received!</div>
            <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
              Welcome to the UC30 Challenge. Your 1-year access is now active.
            </p>
            <p style={{ color: '#666', fontSize: 13, lineHeight: 1.5, marginBottom: 24 }}>
              A confirmation email has been sent to your inbox from Stripe.
            </p>
            <button className="btn-primary" style={{ padding: '14px 40px', fontSize: 16 }}
              onClick={() => setPaymentSuccess(false)}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment failed notification (shown when user returns after failed payment or revoked access)
  if (paymentFailed) {
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
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: '#e94560' }}>Payment Issue</div>
            <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
              We were unable to process your payment. Please update your payment method
              or contact support at <strong>support@uc30.com</strong> for help.
            </p>
            <button className="btn-primary" style={{ padding: '14px 40px', fontSize: 16, marginBottom: 12 }}
              onClick={() => setPaymentFailed(false)}>
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
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

  // Show removal screen if enforcement check failed
  if (removalReason && !user.isAdmin) {
    const reasonLabels = {
      missed_deadline: 'Missed Daily Deadline',
      failed_daily_minimum: 'Did Not Meet Daily Minimums',
      failed_weekly_minimum: 'Did Not Meet Weekly Minimums',
      manual: 'Removed by Admin',
    };
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 20,
      }}>
        <div style={{ maxWidth: 520, textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: 48, fontWeight: 700, color: '#e94560', marginBottom: 16 }}>
            UC30
          </div>
          <div className="card" style={{ padding: 36 }}>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#e94560' }}>
              Removed from Cohort
            </div>
            <div style={{
              display: 'inline-block', padding: '6px 14px', borderRadius: 8, fontSize: 13,
              background: 'rgba(233,69,96,0.1)', color: '#e94560', fontWeight: 600, marginBottom: 16,
            }}>
              {reasonLabels[removalReason.reason] || removalReason.reason}
            </div>
            <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
              {removalReason.details}
            </p>
            <p style={{ color: '#666', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
              Your 1-year access is still active. You can rejoin a future cohort and
              pick up where you left off. The strict accountability is what makes
              this program work — when you're ready to commit again, we'll be here.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn-primary" style={{ padding: '12px 28px' }}
                onClick={() => setRemovalReason(null)}>
                Continue to Dashboard
              </button>
              <button className="btn-secondary" style={{ padding: '12px 28px' }} onClick={logout}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Activation Phase gate — non-admin users (or admins in participant mode) who haven't completed activation
  if ((!user.isAdmin || participantMode) && !user.activationCompleted) {
    return (
      <>
        {user.isAdmin && participantMode && (
          <div style={{
            position: 'sticky', top: 0, zIndex: 200,
            background: 'rgba(72,199,142,0.95)', padding: '8px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#000' }}>
              Participant Mode — Taking the course as a participant
            </span>
            <button onClick={() => setParticipantMode(false)} style={{
              fontSize: 12, padding: '4px 14px', borderRadius: 6, cursor: 'pointer',
              border: '1px solid rgba(0,0,0,0.3)', background: 'rgba(0,0,0,0.15)',
              color: '#000', fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            }}>Back to Admin</button>
          </div>
        )}
        <ActivationPhase
          user={user}
          onComplete={completeActivation}
          onSaveExit={user.isAdmin && participantMode ? () => setParticipantMode(false) : undefined}
        />
      </>
    );
  }

  if (currentView === 'admin' && user.isAdmin && !participantMode) {
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
              participants={participants}
              dailyMinimumsOverrides={dailyMinimumsOverrides}
              onAddContact={() => {}}
              onAddFollowUp={() => {}}
              onUploadFile={() => {}}
              getContacts={getContacts}
              getFollowUps={getFollowUps}
              getFollowUpsByContact={getFollowUpsByContact}
              getUploadUrl={getUploadUrl}
              contacts={[]}
              onGraduateViaContract={() => {}}
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
        landingVersion={landingVersion}
        onSetLandingVersion={setLandingVersion}
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
        dailyMinimumsOverrides={dailyMinimumsOverrides}
        onSetDailyMinimums={setDailyMinimums}
        skoolLink={skoolLink}
        onSetSkoolLink={setSkoolLink}
        practiceDaySettings={practiceDaySettings}
        onSetPracticeDaySettings={setPracticeDaySettings}
        getContactsForParticipant={getContactsForParticipant}
        getUploads={getUploads}
        getUploadUrl={getUploadUrl}
        complianceSettings={complianceSettings}
        onSetComplianceDailyMinimums={setComplianceDailyMinimums}
        onSetComplianceWeeklyMinimums={setComplianceWeeklyMinimums}
        onSetComplianceEnforcement={setComplianceEnforcement}
        getAllDailySubmissions={getAllDailySubmissions}
        getRemovalLog={getRemovalLog}
        onSwitchToParticipant={() => setParticipantMode(true)}
        onCompleteActivation={completeActivation}
      />
    );
  }

  return (
    <>
    {user.isAdmin && participantMode && (
      <div style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'rgba(72,199,142,0.95)', padding: '8px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#000' }}>
          Participant Mode — Taking the course as a participant
        </span>
        <button onClick={() => setParticipantMode(false)} style={{
          fontSize: 12, padding: '4px 14px', borderRadius: 6, cursor: 'pointer',
          border: '1px solid rgba(0,0,0,0.3)', background: 'rgba(0,0,0,0.15)',
          color: '#000', fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
        }}>Back to Admin</button>
      </div>
    )}
    <Dashboard
      user={user}
      onLogout={user.isAdmin && participantMode ? () => setParticipantMode(false) : logout}
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
      participants={participants}
      dailyMinimumsOverrides={dailyMinimumsOverrides}
      skoolLink={skoolLink}
      practiceDaySettings={practiceDaySettings}
      onCompletePracticeDay={completeActivation}
      onUpdateUser={completeActivation}
      onAddContact={handleAddContact}
      onUpdateContact={updateContact}
      onAddFollowUp={addFollowUp}
      onUploadFile={uploadFile}
      getContacts={getContacts}
      getFollowUps={getFollowUps}
      getFollowUpsByContact={getFollowUpsByContact}
      getUploadUrl={getUploadUrl}
      contacts={userContacts}
      complianceSettings={complianceSettings}
      getDailySubmission={getDailySubmission}
      getQuizAttempts={getQuizAttempts}
      addQuizAttempt={addQuizAttempt}
      onSubmitPipelineDay={submitPipelineDay}
      onActivateNextCohort={activateNextCohort}
      onSaveConfidenceSurvey={saveConfidenceSurvey}
      onGraduateViaContract={graduateViaContract}
    />
    </>
  );
}
