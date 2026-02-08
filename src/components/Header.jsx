import { useState } from 'react';

export default function Header({ user, currentTab, onTabChange, tabs, onLogout, isAdmin }) {
  const [menuOpen, setMenuOpen] = useState(false);

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

        {/* Desktop nav */}
        <div className="desktop-nav" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                background: currentTab === tab.id ? 'rgba(233,69,96,0.15)' : 'transparent',
                color: currentTab === tab.id ? '#e94560' : '#888',
                border: currentTab === tab.id ? '1px solid rgba(233,69,96,0.3)' : '1px solid transparent',
                padding: '8px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500, transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
          <button
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: 13, marginLeft: 4 }}
            onClick={onLogout}
          >
            Log Out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none', background: 'none', border: 'none',
            color: '#888', fontSize: 24, cursor: 'pointer', padding: 4,
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-nav" style={{
          paddingTop: 12, marginTop: 12,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'none', flexDirection: 'column', gap: 6,
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { onTabChange(tab.id); setMenuOpen(false); }}
              style={{
                background: currentTab === tab.id ? 'rgba(233,69,96,0.15)' : 'rgba(255,255,255,0.04)',
                color: currentTab === tab.id ? '#e94560' : '#888',
                border: currentTab === tab.id ? '1px solid rgba(233,69,96,0.3)' : '1px solid rgba(255,255,255,0.06)',
                padding: '12px 16px', borderRadius: 10, fontSize: 14, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500, textAlign: 'left',
                width: '100%',
              }}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => { onLogout(); setMenuOpen(false); }}
            style={{
              background: 'rgba(255,255,255,0.04)', color: '#888',
              border: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px',
              borderRadius: 10, fontSize: 14, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", textAlign: 'left', width: '100%',
            }}
          >
            Log Out
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
