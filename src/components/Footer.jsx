export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '24px 20px',
      marginTop: 48,
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ fontSize: 13, color: '#555' }}>
          © {year} UC30. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <a
            href="/terms"
            style={{ fontSize: 13, color: '#555', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#888'}
            onMouseLeave={e => e.currentTarget.style.color = '#555'}
          >
            Terms & Conditions
          </a>
          <a
            href="/privacy"
            style={{ fontSize: 13, color: '#555', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#888'}
            onMouseLeave={e => e.currentTarget.style.color = '#555'}
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
