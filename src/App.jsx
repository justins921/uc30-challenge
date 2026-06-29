import { useState, useEffect } from 'react';
import { useAppState } from './hooks/useAppState';
import LandingPage from './components/LandingPage';
import LandingPageV2 from './components/LandingPageV2';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import OnboardingFlow from './components/OnboardingFlow';
import ActivationPhase from './components/ActivationPhase';
import TrainingPhase from './components/TrainingPhase';
import { getResolvedTrainingModules } from './data/trainingModules';
import AffiliatePage from './components/AffiliatePage';
import ReadinessQuestionnaire from './components/ReadinessQuestionnaire';
import FreeToolsPage from './components/FreeToolsPage';

const DEV_VERSION = 'v0.9.2-beta';

export default function App() {
  // DEV BANNER — remove this useEffect block before going live
  useEffect(() => {
    const banner = document.createElement('div');
    banner.id = 'uc30-dev-banner';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#1a1a2e;color:#e94560;text-align:center;padding:6px 12px;font-size:12px;font-weight:600;font-family:monospace;letter-spacing:0.5px;border-bottom:2px solid #e94560;pointer-events:none;';
    banner.textContent = `DEV BUILD — ${DEV_VERSION} — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    document.body.prepend(banner);
    document.body.style.paddingTop = '32px';
    return () => { banner.remove(); document.body.style.paddingTop = ''; };
  }, []);

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
    approveParticipant,
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
    completeTrainingModule,
    trainingConfig,
    setTrainingConfig,
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
  // Admin-only: jump straight to the day timeline, bypassing activation/training gates
  const [adminDaysPreview, setAdminDaysPreview] = useState(false);
  // Admin-only: set once an admin finishes (or clicks through) onboarding in participant mode,
  // so they advance into training instead of looping on the activation flow.
  const [adminPastActivation, setAdminPastActivation] = useState(false);
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

  // Readiness questionnaire — accessible to anyone, no auth required
  if (window.location.pathname.replace(/\/+$/, '') === '/readiness') {
    return (
      <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
        <ReadinessQuestionnaire onClose={() => { window.location.href = '/'; }} />
      </div>
    );
  }

  // Free tools — accessible to anyone, no auth required
  if (window.location.pathname.replace(/\/+$/, '').startsWith('/tools')) {
    return <FreeToolsPage user={user} />;
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

  // Pending approval gate — non-admin users must be approved before accessing the course
  if (!user.isAdmin && !user.approved) {
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
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#9203;</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Pending Approval</div>
            <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
              Your account has been created. An admin will review and approve your
              access shortly. You'll be able to start the challenge once approved.
            </p>
            <p style={{ color: '#666', fontSize: 13, lineHeight: 1.5, marginBottom: 24 }}>
              If you believe this is an error, please contact support.
            </p>
            <button className="btn-secondary" onClick={logout}>Log Out</button>
          </div>
        </div>
      </div>
    );
  }

  // Activation Phase gate — non-admins who haven't completed onboarding see it once.
  // Admins in participant mode always see the full onboarding flow (for review/editing),
  // unless they tap "Skip to Days" (adminDaysPreview) to jump to the day timeline.
  const showActivationGate = user.isAdmin
    ? (participantMode && !adminDaysPreview && !adminPastActivation)
    : (!user.activationCompleted);
  if (showActivationGate) {
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
            <button onClick={() => setAdminPastActivation(true)} style={{
              fontSize: 12, padding: '4px 14px', borderRadius: 6, cursor: 'pointer',
              border: '1px solid rgba(0,0,0,0.3)', background: 'rgba(0,0,0,0.2)',
              color: '#000', fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            }}>Skip to Training →</button>
            <button onClick={() => setAdminDaysPreview(true)} style={{
              fontSize: 12, padding: '4px 14px', borderRadius: 6, cursor: 'pointer',
              border: '1px solid rgba(0,0,0,0.3)', background: 'rgba(0,0,0,0.25)',
              color: '#000', fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            }}>Skip to Days →</button>
            <button onClick={() => { setParticipantMode(false); setAdminDaysPreview(false); setAdminPastActivation(false); }} style={{
              fontSize: 12, padding: '4px 14px', borderRadius: 6, cursor: 'pointer',
              border: '1px solid rgba(0,0,0,0.3)', background: 'rgba(0,0,0,0.15)',
              color: '#000', fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            }}>Back to Admin</button>
          </div>
        )}
        <ActivationPhase
          user={user}
          onComplete={async (data) => {
            const r = await completeActivation(data);
            if (user.isAdmin && participantMode && data?.activationCompleted) setAdminPastActivation(true);
            return r;
          }}
          onSaveExit={user.isAdmin && participantMode ? () => { setParticipantMode(false); setAdminPastActivation(false); } : undefined}
        />
      </>
    );
  }

  // Training Phase gate — after activation, before sprint
  const resolvedModules = getResolvedTrainingModules(trainingConfig);
  const activeModules = resolvedModules.filter(m => !m.hidden && !m.comingSoon);
  // Grandfather: once a real (non-admin) user is already in the sprint (has completed any
  // day), a newly-added training module must never pull them back into training. Admins are
  // NOT grandfathered, so in participant mode they can always walk the full flow (incl. the
  // Ready for Launch module) for review/editing.
  const hasSprintProgress = !user.isAdmin && (user.completedDays?.length || 0) > 0;
  const trainingComplete = activeModules.length === 0 || hasSprintProgress ||
    activeModules.every(m => (user.trainingCompletedModules || []).includes(m.id));

  if ((!user.isAdmin || participantMode) && !trainingComplete && !(user.isAdmin && adminDaysPreview)) {
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
            <button onClick={() => setAdminDaysPreview(true)} style={{
              fontSize: 12, padding: '4px 14px', borderRadius: 6, cursor: 'pointer',
              border: '1px solid rgba(0,0,0,0.3)', background: 'rgba(0,0,0,0.25)',
              color: '#000', fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            }}>Skip to Days →</button>
            <button onClick={() => { setParticipantMode(false); setAdminDaysPreview(false); setAdminPastActivation(false); }} style={{
              fontSize: 12, padding: '4px 14px', borderRadius: 6, cursor: 'pointer',
              border: '1px solid rgba(0,0,0,0.3)', background: 'rgba(0,0,0,0.15)',
              color: '#000', fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            }}>Back to Admin</button>
          </div>
        )}
        <TrainingPhase
          user={user}
          modules={resolvedModules}
          onCompleteModule={completeTrainingModule}
          onCompleteAll={() => completeActivation({ trainingCompletedModules: activeModules.map(m => m.id) })}
          addQuizAttempt={addQuizAttempt}
          getQuizAttempts={getQuizAttempts}
          onSaveExit={user.isAdmin && participantMode ? () => setParticipantMode(false) : undefined}
          getContacts={getContacts}
          getFollowUpsByContact={getFollowUpsByContact}
          onUpdateContact={updateContact}
          onAddContact={addContact}
          onAddFollowUp={addFollowUp}
          onSaveConfidenceSurvey={saveConfidenceSurvey}
          onSaveComponentData={completeActivation}
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
        onApprove={approveParticipant}
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
        trainingConfig={trainingConfig}
        onSetTrainingConfig={setTrainingConfig}
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
          {adminDaysPreview
            ? 'Admin Preview — Browsing all days (activation/training skipped)'
            : 'Participant Mode — Taking the course as a participant'}
        </span>
        <button onClick={() => { setParticipantMode(false); setAdminDaysPreview(false); setAdminPastActivation(false); }} style={{
          fontSize: 12, padding: '4px 14px', borderRadius: 6, cursor: 'pointer',
          border: '1px solid rgba(0,0,0,0.3)', background: 'rgba(0,0,0,0.15)',
          color: '#000', fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
        }}>Back to Admin</button>
      </div>
    )}
    <Dashboard
      user={user}
      onLogout={user.isAdmin && participantMode ? () => { setParticipantMode(false); setAdminDaysPreview(false); setAdminPastActivation(false); } : logout}
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
