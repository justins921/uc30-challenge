import { useState, useMemo } from 'react';

// 10 self-assessment statements, ranked 1–10 each (out of 100 total).
// Taken at three checkpoints so the user can watch their own progress.
export const READINESS_STATEMENTS = [
  { id: 'clarity', label: 'Clarity', text: "I know exactly what I'm looking for — my market, my buy box, and my numbers." },
  { id: 'analysis', label: 'Analysis', text: "I can analyze a property on my own and confidently tell whether it's a good deal." },
  { id: 'financing', label: 'Financing', text: "I understand how I'll fund a deal and what I can realistically afford." },
  { id: 'deal_flow', label: 'Deal flow', text: "I know how to consistently find potential deals, on and off the market." },
  { id: 'outreach', label: 'Outreach', text: "I'm comfortable reaching out to agents, lenders, and sellers." },
  { id: 'motivation', label: 'Motivation', text: "I can spot a motivated seller and a problem I could solve." },
  { id: 'offers', label: 'Offers', text: "I'm comfortable making offers — even when I expect to hear no." },
  { id: 'negotiation', label: 'Negotiation', text: "I feel confident negotiating price and terms to protect my returns." },
  { id: 'action', label: 'Action', text: "I take consistent action instead of waiting until I feel ready." },
  { id: 'belief', label: 'Belief', text: "I believe I can do this — that I *will* get a property under contract." },
];

export const READINESS_CHECKPOINTS = ['baseline', 'post_training', 'final'];
export const READINESS_LABELS = {
  baseline: 'Before You Begin',
  post_training: 'After Training',
  final: 'After 30 Days',
};

const CHECKPOINT_INTRO = {
  baseline: "You're about to begin. Rank yourself honestly right now — this is your starting line.",
  post_training: "You've finished the training. Rank yourself again and see how far the knowledge moved you — before Day 1 even begins.",
  final: "30 days of real action are behind you. Rank yourself one last time and see the full journey.",
};

function renderText(text) {
  // light *italic* support
  const parts = [];
  const regex = /\*(.+?)\*/g;
  let last = 0, m, key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<em key={key++}>{m[1]}</em>);
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default function ReadinessAssessment({ checkpoint, existing, onSave, onDone, saving, embedded }) {
  const [scores, setScores] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const all = existing || [];
  const alreadyDone = useMemo(() => all.find(a => a.checkpoint === checkpoint), [all, checkpoint]);

  const total = READINESS_STATEMENTS.reduce((sum, s) => sum + (scores[s.id] || 0), 0);
  const allRanked = READINESS_STATEMENTS.every(s => scores[s.id] >= 1);

  const handleSubmit = async () => {
    if (!allRanked || saving) return;
    const record = { checkpoint, total, scores: { ...scores }, submitted_at: new Date().toISOString() };
    const updated = [...all.filter(a => a.checkpoint !== checkpoint), record];
    if (onSave) await onSave({ readiness_assessments: updated });
    setSubmitted(true);
  };

  // ── Completed view (with journey when prior checkpoints exist) ──
  if (alreadyDone || submitted) {
    const current = submitted
      ? { checkpoint, total, scores }
      : alreadyDone;
    return (
      <div className={embedded ? '' : 'card'} style={embedded ? {} : { marginBottom: 24 }}>
        <ResultsView current={current} all={submitted ? [...all.filter(a => a.checkpoint !== checkpoint), current] : all} />
        {onDone && (
          <button className="btn-primary" onClick={onDone} style={{ width: '100%', marginTop: 16 }}>
            Continue
          </button>
        )}
      </div>
    );
  }

  // ── Ranking view ──
  return (
    <div className={embedded ? '' : 'card'} style={embedded ? {} : { marginBottom: 24 }}>
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#e94560', letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Readiness Self-Assessment · {READINESS_LABELS[checkpoint]}
        </span>
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Rank yourself, honestly — 1 to 10</h3>
      <p style={{ fontSize: 13.5, color: '#999', lineHeight: 1.7, marginBottom: 8 }}>
        {CHECKPOINT_INTRO[checkpoint]} There are no wrong answers — an honest low score early is exactly what makes the climb satisfying. We save every score; at Day 30 you'll see the full journey side by side.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 18 }}>
        {READINESS_STATEMENTS.map((s, i) => (
          <div key={s.id}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: '#666', fontWeight: 700, minWidth: 18 }}>{i + 1}.</span>
              <span style={{
                fontSize: 11, fontWeight: 700, color: '#e94560', textTransform: 'uppercase',
                letterSpacing: 0.5, background: 'rgba(233,69,96,0.1)', padding: '2px 7px', borderRadius: 5,
              }}>{s.label}</span>
            </div>
            <p style={{ fontSize: 14, color: '#ccc', lineHeight: 1.5, margin: '0 0 8px 26px' }}>{renderText(s.text)}</p>
            <div style={{ display: 'flex', gap: 4, marginLeft: 26 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
                const sel = scores[s.id] === n;
                return (
                  <button
                    key={n}
                    onClick={() => setScores(prev => ({ ...prev, [s.id]: n }))}
                    style={{
                      flex: 1, minWidth: 0, padding: '8px 0', borderRadius: 6, fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', border: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.12s',
                      background: sel ? 'rgba(233,69,96,0.25)' : 'rgba(255,255,255,0.04)',
                      color: sel ? '#e94560' : '#666',
                      outline: sel ? '2px solid rgba(233,69,96,0.5)' : 'none',
                    }}
                  >{n}</button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Live total */}
      <div style={{
        marginTop: 22, padding: '16px 18px', borderRadius: 12,
        background: 'rgba(233,69,96,0.05)', border: '1px solid rgba(233,69,96,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 13, color: '#bbb' }}>
          Your total <span style={{ color: '#666' }}>(out of 100)</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: allRanked ? '#e94560' : '#555' }}>
          {total}<span style={{ fontSize: 14, color: '#666' }}> / 100</span>
        </div>
      </div>
      <p style={{ fontSize: 12, color: '#777', lineHeight: 1.6, marginTop: 10 }}>
        Whatever it is right now, it's a checkpoint, not a verdict. Most people start lower than they'd like, climb as the training sinks in, and climb again through 30 days of real action.
      </p>

      <button
        className="btn-primary"
        disabled={!allRanked || saving}
        onClick={handleSubmit}
        style={{ width: '100%', marginTop: 14, opacity: allRanked && !saving ? 1 : 0.4 }}
      >
        {saving ? 'Saving…' : `Lock in my ${READINESS_LABELS[checkpoint]} score`}
      </button>
      {!allRanked && (
        <p style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 8 }}>
          Rank all 10 statements to continue.
        </p>
      )}
    </div>
  );
}

function ResultsView({ current, all }) {
  const ordered = READINESS_CHECKPOINTS
    .map(cp => all.find(a => a.checkpoint === cp))
    .filter(Boolean);
  const hasJourney = ordered.length >= 2;
  const first = ordered[0];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(72,199,142,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✓</div>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Readiness — {READINESS_LABELS[current.checkpoint]}</h3>
      </div>

      <div style={{
        padding: '20px', borderRadius: 12, marginBottom: 16, textAlign: 'center',
        background: 'rgba(233,69,96,0.05)', border: '1px solid rgba(233,69,96,0.2)',
      }}>
        <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Your Score</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: '#e94560' }}>
          {current.total}<span style={{ fontSize: 18, color: '#666' }}> / 100</span>
        </div>
        {hasJourney && first.checkpoint !== current.checkpoint && (
          <div style={{ fontSize: 13, color: current.total - first.total >= 0 ? '#48c78e' : '#888', marginTop: 6, fontWeight: 600 }}>
            {current.total - first.total >= 0 ? '+' : ''}{current.total - first.total} since {READINESS_LABELS[first.checkpoint]}
          </div>
        )}
      </div>

      {/* Journey: totals across checkpoints */}
      {hasJourney && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Your Journey
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 90 }}>
            {ordered.map((a, i) => {
              const pct = Math.max((a.total / 100) * 100, 6);
              const isLast = i === ordered.length - 1;
              return (
                <div key={a.checkpoint} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isLast ? '#e94560' : '#bbb', marginBottom: 4 }}>{a.total}</div>
                  <div style={{
                    height: `${pct}%`, borderRadius: '5px 5px 0 0',
                    background: isLast ? 'rgba(233,69,96,0.5)' : 'rgba(255,255,255,0.12)',
                  }} />
                  <div style={{ fontSize: 10, color: '#666', marginTop: 5 }}>{READINESS_LABELS[a.checkpoint]}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Per-statement breakdown for the final checkpoint */}
      {hasJourney && current.checkpoint === 'final' && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Statement by statement
          </div>
          {READINESS_STATEMENTS.map(s => {
            const start = first.scores?.[s.id] || 0;
            const end = current.scores?.[s.id] || 0;
            const diff = end - start;
            return (
              <div key={s.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 0', borderTop: '1px solid rgba(255,255,255,0.04)',
              }}>
                <span style={{ fontSize: 13, color: '#aaa' }}>{s.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#666' }}>{start} → {end}</span>
                  {diff !== 0 && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: diff > 0 ? '#48c78e' : '#e94560' }}>
                      {diff > 0 ? '+' : ''}{diff}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
