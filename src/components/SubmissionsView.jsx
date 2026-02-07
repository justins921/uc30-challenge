import { AttachmentLink } from './DayView';

export default function SubmissionsView({ user }) {
  if (user.submissions.length === 0) {
    return (
      <div className="fade-up" style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No Submissions Yet</h3>
        <p style={{ color: '#666', fontSize: 14 }}>Complete your first day to see your submissions here.</p>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>My Submissions</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {user.submissions.slice().reverse().map((sub, i) => (
          <div key={i} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            {/* Day number badge */}
            <div className="mono" style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(72,199,142,0.1)', border: '1px solid rgba(72,199,142,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#48c78e', flexShrink: 0,
            }}>
              {sub.day}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 4, flexWrap: 'wrap', gap: 8,
              }}>
                <h4 style={{ fontSize: 15, fontWeight: 600 }}>{sub.title}</h4>
                <span style={{ fontSize: 11, color: '#555' }}>
                  {new Date(sub.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6, wordBreak: 'break-word' }}>
                {sub.proof}
              </p>
              {sub.fileName && (
                <AttachmentLink fileName={sub.fileName} fileData={sub.fileData} />
              )}
            </div>

            {/* Status badge */}
            <div style={{
              fontSize: 11, color: '#48c78e', background: 'rgba(72,199,142,0.1)',
              padding: '4px 10px', borderRadius: 6, fontWeight: 600, flexShrink: 0,
            }}>
              Verified
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
