import { useState, useEffect, useRef } from 'react';

const TAB_ICONS = {
  timeline: '📋',
  calculator: '🧮',
  analyzer: '🔍',
  leaderboard: '🏆',
  crm: '👥',
  community: '💬',
  buybox: '🎯',
  submissions: '📝',
  stats: '📊',
  support: '🛟',
  profile: '👤',
  pipeline: '⚡',
};

export default function Header({ user, currentTab, onTabChange, tabs, onLogout, isAdmin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [menuOpen]);

  const currentLabel = tabs.find(t => t.id === currentTab)?.label || 'Menu';

  return (
    <header style={{
      padding: '14px 20px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'sticky',
      top: 0,
      background: 'rgba(10,10,15,0.95)',
      backdropFilter: 'blur(20px)',
      zIndex: 100,
    }}>
      <div ref={menuRef} style={{
        maxWidth: 1100, margin: '0 auto',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: '#e94560' }}>UC30</span>
            <span style={{ color: '#444', fontSize: 14 }}>|</span>
            {isAdmin ? (
              <span style={{
                color: '#e94560', fontSize: 12, fontWeight: 600,
                background: 'rgba(233,69,96,0.1)', padding: '4px 10px', borderRadius: 6,
              }}>
                ADMIN
              </span>
            ) : (
              <span style={{ color: '#888', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                {user.firstName}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#666' }}>{currentLabel}</span>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: menuOpen ? 'rgba(233,69,96,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${menuOpen ? 'rgba(233,69,96,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: menuOpen ? '#e94560' : '#ccc',
                width: 40, height: 40, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div style={{
            paddingTop: 14, marginTop: 14,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 6,
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { onTabChange(tab.id); setMenuOpen(false); }}
                style={{
                  background: currentTab === tab.id ? 'rgba(233,69,96,0.12)' : 'rgba(255,255,255,0.03)',
                  color: currentTab === tab.id ? '#e94560' : '#999',
                  border: `1px solid ${currentTab === tab.id ? 'rgba(233,69,96,0.25)' : 'rgba(255,255,255,0.06)'}`,
                  padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                  textAlign: 'left', width: '100%',
                  display: 'flex', alignItems: 'center', gap: 10,
                  fontSize: 13, transition: 'all 0.15s',
                  position: 'relative',
                }}
              >
                <span style={{ fontSize: 16 }}>{TAB_ICONS[tab.id] || '•'}</span>
                <span>{tab.label}</span>
                {tab.hasNotification && (
                  <span style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 7, height: 7, borderRadius: '50%', background: '#e94560',
                  }} />
                )}
              </button>
            ))}
            <button
              onClick={() => { onLogout(); setMenuOpen(false); }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                color: '#666',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                textAlign: 'left', width: '100%',
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 13,
              }}
            >
              <span style={{ fontSize: 16 }}>🚪</span>
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
