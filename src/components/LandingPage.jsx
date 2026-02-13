const STRIPE_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK || '';

const DEFAULTS = {
  badge: '30-Day Challenge',
  headline: 'Close Your First',
  headlineAccent: ' Real Estate Deal',
  headlineSuffix: ' in 30 Days',
  subtext: 'A structured, daily action plan that takes you from zero to your first deal. Video lessons, daily tasks, accountability, and a community pushing you forward.',
  ctaButton: 'Join the Challenge →',
  stats: [
    { value: '30', label: 'Daily Lessons' },
    { value: '1', label: 'Clear Goal' },
    { value: '24/7', label: 'Community Access' },
    { value: '100%', label: 'Action-Based' },
  ],
  steps: [
    { title: 'Sign Up & Pay', description: 'Secure your spot in the next cohort. Once payment is confirmed, you\'ll get immediate access to your dashboard.' },
    { title: 'Follow the Daily Plan', description: 'Each day unlocks a new video lesson and action task. Watch, learn, then go execute. No fluff, just action.' },
    { title: 'Submit Your Proof', description: 'Complete each day\'s task and submit your proof before midnight. Miss a day and you\'re out — that\'s the accountability.' },
    { title: 'Close Your Deal', description: 'By day 30, you\'ll have analyzed properties, contacted agents, submitted offers, and be on your way to closing.' },
  ],
  features: [
    { icon: '🎬', title: '30 Video Lessons', text: 'Daily instructional videos walking you through every step of finding and closing your first deal.' },
    { icon: '📋', title: 'Daily Action Tasks', text: 'No theory paralysis. Every day has one clear task you must complete to stay in the challenge.' },
    { icon: '📊', title: 'Progress Dashboard', text: 'Track your properties analyzed, offers submitted, and agents contacted in real-time.' },
    { icon: '⏰', title: 'Accountability System', text: 'Daily deadlines with automatic removal. Skin in the game keeps you moving.' },
    { icon: '📥', title: 'Templates & Resources', text: 'Scripts, spreadsheets, and templates you can use immediately in your deal-finding process.' },
    { icon: '🔄', title: '1-Year Re-run Access', text: 'Life happens. If you fall off, you can rejoin a future cohort within your one-year access window.' },
  ],
  phases: [
    { color: '#e94560', phase: 'Phase 1: Foundation', days: 'Days 1–10', items: ['Set up your deal-finding systems', 'Learn to analyze properties', 'Build your criteria and target markets'] },
    { color: '#533483', phase: 'Phase 2: Execution', days: 'Days 11–20', items: ['Start contacting agents and sellers', 'Submit your first offers', 'Negotiate and follow up systematically'] },
    { color: '#0f3460', phase: 'Phase 3: Closing', days: 'Days 21–30', items: ['Advanced deal structuring', 'Due diligence and inspections', 'Close your first deal'] },
  ],
  finalHeadline: 'Ready to Get Your First Deal?',
  finalSubtext: 'Stop watching from the sidelines. Join the next cohort and take action every single day for 30 days.',
};

export { DEFAULTS as LANDING_DEFAULTS };

export default function LandingPage({ onGoToLogin, landingContent }) {
  // Merge custom content over defaults
  const c = { ...DEFAULTS, ...landingContent };

  const handleGetStarted = () => {
    if (STRIPE_LINK) {
      window.location.href = STRIPE_LINK;
    } else {
      onGoToLogin('register');
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background effects */}
      <div style={{
        position: 'fixed', top: '-30%', right: '-15%', width: 800, height: 800,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(233,69,96,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-30%', left: '-15%', width: 700, height: 700,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(83,52,131,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Nav */}
      <nav style={{
        padding: '20px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', maxWidth: 1200, margin: '0 auto',
        position: 'relative', zIndex: 1,
      }}>
        <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#e94560' }}>UC30</div>
        <button
          className="btn-secondary"
          style={{ padding: '8px 20px', fontSize: 13 }}
          onClick={() => onGoToLogin('login')}
        >
          Log In
        </button>
      </nav>

      {/* Hero */}
      <section className="fade-up" style={{
        maxWidth: 800, margin: '0 auto', padding: '60px 24px 80px',
        textAlign: 'center', position: 'relative', zIndex: 1,
      }}>
        <div style={{
          display: 'inline-block', padding: '6px 16px', borderRadius: 20,
          background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.2)',
          fontSize: 13, color: '#e94560', fontWeight: 600, marginBottom: 24,
        }}>
          {c.badge}
        </div>
        <h1 style={{
          fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 700, lineHeight: 1.15,
          marginBottom: 20,
        }}>
          {c.headline}
          <span style={{ color: '#e94560' }}>{c.headlineAccent}</span>{c.headlineSuffix}
        </h1>
        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 20px)', color: '#888', lineHeight: 1.7,
          maxWidth: 600, margin: '0 auto 40px',
        }}>
          {c.subtext}
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ padding: '16px 40px', fontSize: 17 }} onClick={handleGetStarted}>
            {c.ctaButton}
          </button>
          <button
            className="btn-secondary"
            style={{ padding: '16px 32px', fontSize: 15 }}
            onClick={() => onGoToLogin('login')}
          >
            Already a Member? Log In
          </button>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="fade-up-delay-1" style={{
        maxWidth: 900, margin: '0 auto', padding: '0 24px 80px',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap',
          padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {c.stats.map((s, i) => (
            <ProofStat key={i} value={s.value} label={s.label} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="fade-up-delay-2" style={{
        maxWidth: 1000, margin: '0 auto', padding: '0 24px 80px',
        position: 'relative', zIndex: 1,
      }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, textAlign: 'center', marginBottom: 48 }}>
          How It Works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
          {c.steps.map((step, i) => (
            <StepCard key={i} number={String(i + 1).padStart(2, '0')} title={step.title} description={step.description} />
          ))}
        </div>
      </section>

      {/* What You Get */}
      <section style={{
        maxWidth: 1000, margin: '0 auto', padding: '0 24px 80px',
        position: 'relative', zIndex: 1,
      }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, textAlign: 'center', marginBottom: 48 }}>
          What's Included
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {c.features.map((f, i) => (
            <FeatureCard key={i} icon={f.icon} title={f.title} text={f.text} />
          ))}
        </div>
      </section>

      {/* The Phases */}
      <section style={{
        maxWidth: 800, margin: '0 auto', padding: '0 24px 80px',
        position: 'relative', zIndex: 1,
      }}>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, textAlign: 'center', marginBottom: 48 }}>
          Your 30-Day Journey
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {c.phases.map((p, i) => (
            <PhaseCard key={i} color={p.color} phase={p.phase} days={p.days} items={p.items} />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        maxWidth: 700, margin: '0 auto', padding: '0 24px 100px',
        textAlign: 'center', position: 'relative', zIndex: 1,
      }}>
        <div className="card" style={{
          padding: 'clamp(32px, 6vw, 56px)',
          background: 'linear-gradient(135deg, rgba(233,69,96,0.08), rgba(83,52,131,0.08))',
          borderColor: 'rgba(233,69,96,0.15)',
        }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700, marginBottom: 12 }}>
            {c.finalHeadline}
          </h2>
          <p style={{ color: '#888', fontSize: 16, marginBottom: 32, lineHeight: 1.7 }}>
            {c.finalSubtext}
          </p>
          <button className="btn-primary" style={{ padding: '16px 48px', fontSize: 17 }} onClick={handleGetStarted}>
            {c.ctaButton}
          </button>
          <p style={{ color: '#555', fontSize: 12, marginTop: 16 }}>
            One-time investment &middot; 1-year access
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px',
        textAlign: 'center', fontSize: 13, color: '#444',
      }}>
        UC30 — 30-Day First Deal Challenge
      </footer>
    </div>
  );
}

function ProofStat({ value, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: '#e94560' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function StepCard({ number, title, description }) {
  return (
    <div className="card" style={{ padding: 28 }}>
      <div className="mono" style={{
        fontSize: 32, fontWeight: 700, color: 'rgba(233,69,96,0.2)', marginBottom: 12,
      }}>
        {number}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
      <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7 }}>{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="card" style={{ padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: 'rgba(233,69,96,0.08)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: 22,
      }}>
        {icon}
      </div>
      <div>
        <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{title}</h4>
        <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6 }}>{text}</p>
      </div>
    </div>
  );
}

function PhaseCard({ color, phase, days, items }) {
  return (
    <div className="card" style={{ padding: 28, borderLeftWidth: 3, borderLeftColor: color }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>{phase}</h3>
        <span className="mono" style={{ fontSize: 12, color, fontWeight: 600 }}>{days}</span>
      </div>
      <ul style={{ color: '#888', fontSize: 14, lineHeight: 2, listStyle: 'none', padding: 0 }}>
        {items.map((item, i) => (
          <li key={i}>→ {item}</li>
        ))}
      </ul>
    </div>
  );
}
