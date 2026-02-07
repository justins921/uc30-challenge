import { useAppState } from './hooks/useAppState';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const {
    user,
    participants,
    currentView,
    loading,
    login,
    register,
    logout,
    submitDay,
    removeParticipant,
    reactivateParticipant,
  } = useAppState();

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

  if (currentView === 'login' || !user) {
    return <LoginScreen onLogin={login} onRegister={register} />;
  }

  if (currentView === 'admin' && user.isAdmin) {
    return (
      <AdminDashboard
        user={user}
        participants={participants}
        onRemove={removeParticipant}
        onReactivate={reactivateParticipant}
        onLogout={logout}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      onLogout={logout}
      onSubmit={submitDay}
      onReactivate={() => reactivateParticipant(user.id)}
    />
  );
}
