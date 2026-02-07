export default function Header({ user, currentTab, onTabChange, tabs, onLogout, isAdmin }) {
  return (
    <header style={{
      padding: '14px 24px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      background: 'rgba(10,10,15,0.95)',
      backdropFilter: 'blur(20px)',
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: '#e94560' }}>UC30</span>
        <span style={{ color: '#444', fontSize: 14 }}>|</span>
        {isAdmin ? (
          <span style={{
            color: '#e94560', fontSize: 13, fontWeight: 600,
            background: 'rgba(233,69,96,0.1)', padding: '4px 12px', borderRadius: 6,
          }}>
            ADMIN
          </span>
        ) : (
          <span style={{ color: '#888', fontSize: 14 }}>{user.name}</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              background: currentTab === tab.id ? 'rgba(233,69,96,0.15)' : 'transparent',
              color: currentTab === tab.id ? '#e94560' : '#888',
              border: currentTab === tab.id ? '1px solid rgba(233,69,96,0.3)' : '1px solid transparent',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
        <button
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: 13, marginLeft: 4 }}
          onClick={onLogout}
        >
          Log Out
        </button>
      </div>
    </header>
  );
}
