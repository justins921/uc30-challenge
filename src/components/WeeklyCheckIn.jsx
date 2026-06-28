import { useState, useMemo } from 'react';

// 30-second weekly pulse — the qualitative stuff the dashboard can't see.
// Shown at the end of each week (days 7, 14, 21, 28).

const C = { red: '#e94560', green: '#48c78e', gold: '#f0a500', purple: '#c9a0ff' };

const OFFERS_LANDING = ['Getting good responses', 'Some traction', 'Mostly silence', "Haven't really connected yet"];

const HARDEST = [
  'Finding deals',
  'Knowing if a deal is good',
  'Getting agents / lenders to respond',
  'Getting sellers to engage',
  'Getting responses to offers',
  'Negotiating',
  'Staying consistent / motivated',
  'Honestly, feeling good',
];
const STOPPING = 'Thinking about stopping';

const WINS = ['Found an exciting prospect', 'A callback', 'A real seller conversation', 'An offer countered', 'Under contract!'];

// Focus tip matched to what they said was hardest (first selection wins).
const FOCUS_TIPS = {
  'Finding deals': 'Pick ONE deal-flow lane (Module 5) and hit it hard this week — a motivated mailing list, driving for dollars, or working agents. Consistency in one lane beats dabbling in five.',
  'Knowing if a deal is good': 'Run 10 listings through the CDS calculator at list price this week. Reps build instinct — you\'ll start seeing good vs. bad fast, and you\'ll know your number cold.',
  'Getting agents / lenders to respond': 'Lead with your buy box and your strengths — you have a one-page PDF. Agents respond to a clear, serious buyer who makes their job easy.',
  'Getting sellers to engage': 'Focus on motivation, not the property (Module 9). Lead with their problem and how you solve it — speed, certainty, simplicity — before you talk price.',
  'Getting responses to offers': 'Volume is the unlock. Most offers get a no or silence — that\'s normal and protected by your contingencies. Send more, and follow up on the ones that went quiet.',
  'Negotiating': 'Decide your max price and walk-away point BEFORE the conversation (Module 8). The discipline to hold your number is the whole game.',
  'Staying consistent / motivated': 'Protect your daily time like an appointment you can\'t miss, and reread your why. Momentum compounds — don\'t break the chain.',
  'Honestly, feeling good': 'You\'re in a great spot — keep the volume high. This is the week to push toward elite activity and stack offers while you\'ve got momentum.',
  [STOPPING]: 'Before anything else — let us help. You\'ve come too far to quit on a hard week. Tap "yes" below and someone will reach out; one good conversation changes everything.',
};

export default function WeeklyCheckIn({ week, day, existing, onSave, onAlert, saving }) {
  const all = existing || [];
  const alreadyDone = useMemo(() => all.find(a => a.week === week), [all, week]);

  const [offersLanding, setOffersLanding] = useState('');
  const [hardest, setHardest] = useState([]);
  const [stopping, setStopping] = useState(false);
  const [hardestNote, setHardestNote] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [momentum, setMomentum] = useState(0);
  const [wins, setWins] = useState([]);
  const [winsNote, setWinsNote] = useState('');
  const [wantReachOut, setWantReachOut] = useState(null);
  const [reachOutHow, setReachOutHow] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [savedRecord, setSavedRecord] = useState(null);

  const toggle = (list, setList, val) => setList(list.includes(val) ? list.filter(x => x !== val) : [...list, val]);

  const canSubmit = !!offersLanding && confidence >= 1 && momentum >= 1 && wantReachOut !== null;

  const focusTip = useMemo(() => {
    if (stopping) return FOCUS_TIPS[STOPPING];
    const first = hardest[0];
    return FOCUS_TIPS[first] || 'Keep the volume up and stay consistent — analyze, reach out, make offers, follow up. That rhythm is what turns into a deal.';
  }, [stopping, hardest]);

  const handleSubmit = async () => {
    if (!canSubmit || saving) return;
    const record = {
      week, day,
      offersLanding,
      hardest, thinkingOfStopping: stopping,
      hardestNote: hardestNote.trim(),
      confidence, momentum,
      wins, winsNote: winsNote.trim(),
      wantReachOut: wantReachOut === true,
      reachOutHow: reachOutHow.trim(),
      submitted_at: new Date().toISOString(),
    };
    const updated = [...all.filter(a => a.week !== week), record];
    if (onSave) await onSave({ weekly_checkins: updated });
    // Notify admins if at-risk or help requested
    if ((stopping || wantReachOut === true) && onAlert) {
      try { await onAlert({ stopping, wantHelp: wantReachOut === true, reachOutHow: reachOutHow.trim(), week, hardest, hardestNote: hardestNote.trim() }); } catch { /* ignore */ }
    }
    setSavedRecord(record);
    setSubmitted(true);
  };

  // ── Completed view ──
  if (alreadyDone || submitted) {
    const rec = savedRecord || alreadyDone;
    const tip = (() => {
      if (rec?.thinkingOfStopping) return FOCUS_TIPS[STOPPING];
      return FOCUS_TIPS[rec?.hardest?.[0]] || 'Keep the volume up and stay consistent — that rhythm is what turns into a deal.';
    })();
    return (
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(72,199,142,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✓</div>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Weekly Check-In — done</h3>
        </div>
        <p style={{ fontSize: 13.5, color: '#999', lineHeight: 1.7, marginBottom: 14 }}>
          Thanks for being real — that's what lets us actually help. Based on what you shared, here's one thing to focus on next week:
        </p>
        <div style={{
          padding: '16px 18px', borderRadius: 12,
          background: 'rgba(233,69,96,0.06)', border: '1px solid rgba(233,69,96,0.25)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.red, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>
            Your focus this week
          </div>
          <p style={{ fontSize: 14.5, color: '#fff', lineHeight: 1.7, margin: 0 }}>{tip}</p>
        </div>
        {(rec?.thinkingOfStopping || rec?.wantReachOut) && (
          <p style={{ fontSize: 13, color: C.green, fontWeight: 600, marginTop: 12 }}>
            ✓ We got your note — someone from the team will reach out.
          </p>
        )}
        <p style={{ fontSize: 13, color: '#777', marginTop: 14, marginBottom: 0 }}>
          Now get back to it. You're doing the thing most people only talk about.
        </p>
      </div>
    );
  }

  // ── Form ──
  const sectionStyle = { marginBottom: 22 };
  const qTitle = { fontSize: 15, fontWeight: 700, color: '#eee', marginBottom: 4 };
  const hint = { fontSize: 12, color: '#777', lineHeight: 1.5, marginBottom: 10 };
  const openStyle = {
    width: '100%', fontSize: 14, padding: '10px 12px', borderRadius: 8,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#eee', fontFamily: "'DM Sans', sans-serif", resize: 'vertical', lineHeight: 1.5,
  };
  const chip = (selected, color, alert) => ({
    padding: '9px 14px', borderRadius: 8, fontSize: 13, fontWeight: selected ? 600 : 500,
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", border: 'none', transition: 'all 0.12s',
    background: selected ? `${color}25` : alert ? 'rgba(233,69,96,0.06)' : 'rgba(255,255,255,0.04)',
    color: selected ? color : alert ? '#e94560' : '#999',
    outline: selected ? `1px solid ${color}55` : alert ? '1px solid rgba(233,69,96,0.3)' : '1px solid rgba(255,255,255,0.06)',
  });
  const scale = (value, setValue, lowLabel, highLabel, color) => (
    <div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3, 4, 5].map(n => {
          const sel = value === n;
          return (
            <button key={n} onClick={() => setValue(n)} style={{
              flex: 1, padding: '12px 0', borderRadius: 8, fontSize: 15, fontWeight: 700,
              cursor: 'pointer', border: 'none', fontFamily: "'DM Sans', sans-serif",
              background: sel ? `${color}25` : 'rgba(255,255,255,0.04)',
              color: sel ? color : '#666', outline: sel ? `2px solid ${color}55` : 'none',
            }}>{n}</button>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 11, color: '#666' }}>{lowLabel}</span>
        <span style={{ fontSize: 11, color: '#666' }}>{highLabel}</span>
      </div>
    </div>
  );

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.red, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Weekly Check-In
        </span>
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>30 seconds — the stuff your dashboard can't see</h3>
      <p style={{ fontSize: 13.5, color: '#999', lineHeight: 1.7, marginBottom: 22 }}>
        You've done the work this week — we can see that. What we can't see is how it actually <em>felt</em> and what you're really running into. Be honest; it's how we know who to help and how.
      </p>

      {/* Q1 */}
      <div style={sectionStyle}>
        <div style={qTitle}>How are your offers and outreach actually landing?</div>
        <div style={hint}>Not how many — we track that. How are people responding?</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {OFFERS_LANDING.map(o => (
            <button key={o} onClick={() => setOffersLanding(o)} style={chip(offersLanding === o, C.gold)}>{o}</button>
          ))}
        </div>
      </div>

      {/* Q2 */}
      <div style={sectionStyle}>
        <div style={qTitle}>Which part feels hardest right now?</div>
        <div style={hint}>Select all that apply — this tells us exactly what help to send you.</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {HARDEST.map(o => (
            <button key={o} onClick={() => toggle(hardest, setHardest, o)} style={chip(hardest.includes(o), C.purple)}>{o}</button>
          ))}
          <button onClick={() => setStopping(v => !v)} style={chip(stopping, C.red, true)}>
            {stopping ? '⚑ ' : ''}{STOPPING}
          </button>
        </div>
      </div>

      {/* Q3 */}
      <div style={sectionStyle}>
        <div style={qTitle}>What's making that hard?</div>
        <div style={hint}>One sentence about what you just picked — specifics help us help you.</div>
        <textarea rows={2} value={hardestNote} onChange={e => setHardestNote(e.target.value)}
          placeholder="Type what's tripping you up..." style={openStyle} />
      </div>

      {/* Q4 */}
      <div style={sectionStyle}>
        <div style={qTitle}>How confident are you feeling?</div>
        <div style={hint}>"I know what I'm doing."</div>
        {scale(confidence, setConfidence, 'not yet', 'very', C.green)}
      </div>

      {/* Q5 */}
      <div style={sectionStyle}>
        <div style={qTitle}>How's your momentum?</div>
        <div style={hint}>"I'm keeping up and want to keep going."</div>
        {scale(momentum, setMomentum, 'running low', 'full steam', C.gold)}
      </div>

      {/* Q6 */}
      <div style={sectionStyle}>
        <div style={qTitle}>Any real wins this week?</div>
        <div style={hint}>The stuff that actually moves a deal forward — tap any that happened.</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {WINS.map(o => (
            <button key={o} onClick={() => toggle(wins, setWins, o)} style={chip(wins.includes(o), C.green)}>{o}</button>
          ))}
        </div>
        <textarea rows={2} value={winsNote} onChange={e => setWinsNote(e.target.value)}
          placeholder="Anything else you're proud of (optional)..." style={openStyle} />
      </div>

      {/* Q7 */}
      <div style={sectionStyle}>
        <div style={qTitle}>Want someone to reach out?</div>
        <div style={hint}>No pressure — just tap yes if a little help would make next week better.</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: wantReachOut ? 10 : 0 }}>
          <button onClick={() => setWantReachOut(true)} style={chip(wantReachOut === true, C.green)}>Yes</button>
          <button onClick={() => setWantReachOut(false)} style={chip(wantReachOut === false, C.purple)}>No</button>
        </div>
        {wantReachOut === true && (
          <input value={reachOutHow} onChange={e => setReachOutHow(e.target.value)}
            placeholder="Best way to reach you (text, email, call)..." style={{ ...openStyle, resize: 'none' }} />
        )}
      </div>

      <button className="btn-primary" disabled={!canSubmit || saving} onClick={handleSubmit}
        style={{ width: '100%', opacity: canSubmit && !saving ? 1 : 0.4 }}>
        {saving ? 'Sending…' : 'Submit check-in'}
      </button>
      {!canSubmit && (
        <p style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 8 }}>
          Answer the offers, confidence, momentum, and reach-out questions to submit.
        </p>
      )}
    </div>
  );
}
