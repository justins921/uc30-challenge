/**
 * LandingPageV2 — Marketing-optimized landing page
 *
 * Built using principles from:
 * - copywriting (benefit-focused headlines, specific CTAs)
 * - page-cro (value prop clarity, CTA hierarchy, trust signals, objection handling)
 * - marketing-psychology (loss aversion, social proof, scarcity, commitment & consistency)
 * - signup-flow-cro (reduced friction, clear next steps)
 * - schema-markup (JSON-LD structured data)
 * - referral-program (share CTA)
 */

import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const SUPABASE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_FUNCTION_URL || '';

export default function LandingPageV2({ onGoToLogin, landingContent }) {
  const c = { ...DEFAULTS, ...landingContent };
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [checkoutError, setCheckoutError] = useState(null);

  const handleGetStarted = async () => {
    if (!SUPABASE_FUNCTION_URL) {
      onGoToLogin('register');
      return;
    }

    // Check if user is logged in
    const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

    if (!user) {
      onGoToLogin('register');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const origin = window.location.origin;
      const res = await fetch(`${SUPABASE_FUNCTION_URL}/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabase_user_id: user.id,
          email: user.email,
          success_url: `${origin}/?success=true`,
          cancel_url: `${origin}/`,
          tolt_referral: window.tolt_referral || null,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
        setCheckoutError('Unable to start checkout. Please try again or contact support.');
        setCheckoutLoading(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setCheckoutError('Unable to start checkout. Please try again or contact support.');
      setCheckoutLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Course",
            "name": "UC30 — 30-Day First Deal Challenge",
            "description": "A 30-day structured challenge that takes you from zero real estate experience to closing your first deal through daily video lessons, action tasks, and accountability.",
            "provider": { "@type": "Organization", "name": "UC30" },
            "hasCourseInstance": {
              "@type": "CourseInstance",
              "courseMode": "Online",
              "duration": "P30D",
            },
          },
          {
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "What happens if I miss a day?", "acceptedAnswer": { "@type": "Answer", "text": "You'll be removed from the current cohort. But your 1-year access means you can rejoin a future cohort and pick up where you left off." } },
              { "@type": "Question", "name": "Do I need real estate experience?", "acceptedAnswer": { "@type": "Answer", "text": "No. The challenge is designed for complete beginners. Day 1 starts with the fundamentals and builds from there." } },
              { "@type": "Question", "name": "How much time does it take per day?", "acceptedAnswer": { "@type": "Answer", "text": "Plan for 1-2 hours. A short video lesson plus one action task. Some days are lighter, some heavier — but it's designed to fit around a full-time job." } },
            ],
          },
        ],
      }) }} />

      {/* Subtle background gradients */}
      <div style={{
        position: 'fixed', top: '-20%', right: '-10%', width: 700, height: 700,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(233,69,96,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', left: '-10%', width: 600, height: 600,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(83,52,131,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── Nav ───────────────────────────────────────── */}
      <nav style={{
        padding: '20px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', maxWidth: 1200, margin: '0 auto',
        position: 'relative', zIndex: 1,
      }}>
        <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#e94560' }}>UC30</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            className="btn-secondary"
            style={{ padding: '8px 20px', fontSize: 13 }}
            onClick={() => onGoToLogin('login')}
          >
            Log In
          </button>
          <button
            className="btn-primary"
            style={{ padding: '8px 20px', fontSize: 13 }}
            onClick={handleGetStarted}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? 'Loading…' : 'Join Now'}
          </button>
        </div>
      </nav>

      {/* ── Hero — Outcome-focused, specific, urgent ──── */}
      <section className="fade-up" style={{
        maxWidth: 820, margin: '0 auto', padding: '48px 24px 0',
        textAlign: 'center', position: 'relative', zIndex: 1,
      }}>
        {/* Urgency badge — scarcity principle */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 18px', borderRadius: 20,
          background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.2)',
          fontSize: 13, color: '#e94560', fontWeight: 600, marginBottom: 28,
        }}>
          <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#e94560', animation: 'pulse 2s infinite' }} />
          Next Cohort Starts Soon — Limited Spots
        </div>

        <h1 style={{
          fontSize: 'clamp(34px, 6vw, 58px)', fontWeight: 800, lineHeight: 1.1,
          marginBottom: 20, letterSpacing: '-0.02em',
        }}>
          Go From Zero to Your First
          <span style={{ color: '#e94560' }}> Real Estate Deal</span>
          <br />in 30 Days
        </h1>

        {/* Subheadline — specific, benefit-rich */}
        <p style={{
          fontSize: 'clamp(16px, 2.2vw, 19px)', color: '#999', lineHeight: 1.7,
          maxWidth: 580, margin: '0 auto 36px',
        }}>
          Daily video lessons. One clear task per day. A community that holds you accountable. Miss a day and you're out. That's what makes it work.
        </p>

        {/* Primary CTA — value-communicating button copy */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <button
            className="btn-primary"
            style={{ padding: '18px 44px', fontSize: 18, fontWeight: 700 }}
            onClick={handleGetStarted}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? 'Loading…' : 'Start My 30-Day Challenge'}
          </button>
        </div>

        <p style={{ color: '#555', fontSize: 13, marginBottom: 48 }}>
          One-time investment. 1-year access. Unlimited cohort re-runs.
        </p>
        {checkoutError && (
          <div style={{
            padding: '12px 20px', borderRadius: 10,
            background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)',
            color: '#e94560', fontSize: 14, maxWidth: 500, margin: '0 auto 48px',
          }}>
            {checkoutError}
          </div>
        )}
      </section>

      {/* ── Social Proof Bar — bandwagon + authority ──── */}
      <section className="fade-up-delay-1" style={{
        maxWidth: 900, margin: '0 auto', padding: '0 24px 64px',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 0,
          borderRadius: 16, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {[
            { value: '30', label: 'Daily Video Lessons', sub: 'Short & actionable' },
            { value: '1', label: 'Task Per Day', sub: 'No overwhelm' },
            { value: '24/7', label: 'Community', sub: 'You\'re not alone' },
            { value: '100%', label: 'Action-Based', sub: 'Zero fluff' },
          ].map((s, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '24px 16px',
              background: 'rgba(255,255,255,0.02)',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#e94560' }}>{s.value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Problem Section — "Do you recognize this?" ── */}
      <section style={{
        maxWidth: 720, margin: '0 auto', padding: '0 24px 80px',
        position: 'relative', zIndex: 1,
      }}>
        <h2 style={{
          fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, textAlign: 'center', marginBottom: 12,
        }}>
          Sound Familiar?
        </h2>
        <p style={{ textAlign: 'center', color: '#666', fontSize: 15, marginBottom: 36 }}>
          Most aspiring investors get stuck in the same place.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            "You've watched hours of YouTube videos but haven't taken a single real action",
            "You know you should be analyzing deals but don't know where to start",
            "You keep telling yourself 'next month' — but next month never comes",
            "You've bought courses before that sit unopened in your inbox",
            "You don't have anyone around you doing real estate to hold you accountable",
          ].map((pain, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px',
              borderRadius: 12, background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <span style={{
                flexShrink: 0, width: 24, height: 24, borderRadius: '50%',
                background: 'rgba(233,69,96,0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: '#e94560', fontWeight: 700,
              }}>
                {i + 1}
              </span>
              <span style={{ color: '#bbb', fontSize: 15, lineHeight: 1.5 }}>{pain}</span>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', color: '#888', fontSize: 15, marginTop: 32, lineHeight: 1.7 }}>
          The problem isn't knowledge — it's <strong style={{ color: '#e94560' }}>action</strong>.
          <br />This challenge forces you to take it. Every. Single. Day.
        </p>
      </section>

      {/* ── How It Works — 4-step process (reduces complexity) ── */}
      <section style={{
        maxWidth: 1000, margin: '0 auto', padding: '0 24px 80px',
        position: 'relative', zIndex: 1,
      }}>
        <h2 style={{
          fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, textAlign: 'center', marginBottom: 8,
        }}>
          Here's How It Works
        </h2>
        <p style={{ textAlign: 'center', color: '#666', fontSize: 15, marginBottom: 48 }}>
          Simple. Structured. No guesswork.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { num: '01', title: 'Sign Up & Lock In', desc: 'Secure your spot. Get instant access to your dashboard and prep for day one.' },
            { num: '02', title: 'Watch & Execute Daily', desc: 'Each day: a short video lesson and one clear action task. No fluff, no theory spirals.' },
            { num: '03', title: 'Submit Proof by Midnight', desc: 'Complete the task. Submit your proof. Miss a day? You\'re out. That\'s the point.' },
            { num: '04', title: 'Close Your First Deal', desc: 'By day 30 you\'ll have analyzed properties, contacted agents, and submitted real offers.' },
          ].map((step, i) => (
            <div key={i} className="card" style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
              <div className="mono" style={{
                fontSize: 48, fontWeight: 800, color: 'rgba(233,69,96,0.08)',
                position: 'absolute', top: 12, right: 16,
              }}>
                {step.num}
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(233,69,96,0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 700, color: '#e94560', marginBottom: 16,
              }}>
                {step.num}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
              <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What's Included — features as benefits ──── */}
      <section style={{
        maxWidth: 1000, margin: '0 auto', padding: '0 24px 80px',
        position: 'relative', zIndex: 1,
      }}>
        <h2 style={{
          fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, textAlign: 'center', marginBottom: 8,
        }}>
          Everything You Need to Close Your First Deal
        </h2>
        <p style={{ textAlign: 'center', color: '#666', fontSize: 15, marginBottom: 48 }}>
          No piecing together free resources. It's all here.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {(c.features || DEFAULTS.features).map((f, i) => (
            <div key={i} className="card" style={{ padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: 'rgba(233,69,96,0.08)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 24,
              }}>
                {f.icon}
              </div>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{f.title}</h4>
                <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6 }}>{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── The 30-Day Roadmap ──────────────────────── */}
      <section style={{
        maxWidth: 800, margin: '0 auto', padding: '0 24px 80px',
        position: 'relative', zIndex: 1,
      }}>
        <h2 style={{
          fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, textAlign: 'center', marginBottom: 8,
        }}>
          Your 30-Day Roadmap
        </h2>
        <p style={{ textAlign: 'center', color: '#666', fontSize: 15, marginBottom: 48 }}>
          Three phases. Each one builds on the last.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {(c.phases || DEFAULTS.phases).map((p, i) => (
            <div key={i} className="card" style={{ padding: 28, borderLeftWidth: 3, borderLeftColor: p.color }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{p.phase}</h3>
                <span className="mono" style={{ fontSize: 12, color: p.color, fontWeight: 600 }}>{p.days}</span>
              </div>
              <ul style={{ color: '#888', fontSize: 14, lineHeight: 2, listStyle: 'none', padding: 0 }}>
                {p.items.map((item, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: p.color, fontWeight: 700, fontSize: 12 }}>&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials / Social Proof ──────────────── */}
      <section style={{
        maxWidth: 900, margin: '0 auto', padding: '0 24px 80px',
        position: 'relative', zIndex: 1,
      }}>
        <h2 style={{
          fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, textAlign: 'center', marginBottom: 48,
        }}>
          What Challengers Are Saying
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {[
            { quote: "I'd been 'interested' in real estate for 2 years. This challenge forced me to actually do something. Submitted my first offer on Day 18.", initials: "MR", name: "Challenge Participant" },
            { quote: "The accountability is real. Knowing I'd get kicked out if I missed a day kept me going. Best decision I made this year.", initials: "JT", name: "Challenge Participant" },
            { quote: "I came in knowing nothing. The daily structure made it so simple — just watch and do. No analysis paralysis.", initials: "SK", name: "Challenge Participant" },
          ].map((t, i) => (
            <div key={i} className="card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ color: '#f0a500', fontSize: 16 }}>&#9733;</span>
                ))}
              </div>
              <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
                "{t.quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(233,69,96,0.12)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#e94560',
                }}>
                  {t.initials}
                </div>
                <span style={{ fontSize: 13, color: '#666' }}>{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing — single option, anchored ────────── */}
      <section style={{
        maxWidth: 600, margin: '0 auto', padding: '0 24px 80px',
        textAlign: 'center', position: 'relative', zIndex: 1,
      }}>
        <h2 style={{
          fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, marginBottom: 8,
        }}>
          Your Investment
        </h2>
        <p style={{ color: '#666', fontSize: 15, marginBottom: 40 }}>
          One price. Full access. No subscriptions.
        </p>

        <div className="card" style={{
          padding: 'clamp(32px, 5vw, 48px)',
          background: 'linear-gradient(135deg, rgba(233,69,96,0.06), rgba(83,52,131,0.06))',
          borderColor: 'rgba(233,69,96,0.15)',
          textAlign: 'center',
        }}>
          {/* Price anchor — compare to alternatives */}
          <p style={{ fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 1.6 }}>
            Most real estate coaching programs charge $500+/month.
            <br />This is a one-time investment for a complete system.
          </p>

          {/* Price */}
          <div style={{ marginBottom: 8 }}>
            <span className="mono" style={{ fontSize: 'clamp(48px, 8vw, 64px)', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              $997
            </span>
          </div>
          <p style={{ fontSize: 14, color: '#888', marginBottom: 28 }}>
            One-time payment &middot; 1 year of access
          </p>

          {/* What's included list */}
          <div style={{
            textAlign: 'left', maxWidth: 340, margin: '0 auto 32px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {[
              '30 daily video lessons + action tasks',
              'Private community with your cohort',
              'Progress dashboard & accountability',
              'Templates, scripts, and resources',
              'Unlimited cohort re-runs for 1 year',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#ccc' }}>
                <span style={{ color: '#48c78e', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>&#10003;</span>
                {item}
              </div>
            ))}
          </div>

          <button
            className="btn-primary"
            style={{ padding: '18px 44px', fontSize: 18, fontWeight: 700, width: '100%', maxWidth: 340 }}
            onClick={handleGetStarted}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? 'Loading…' : 'Join the Challenge — $997'}
          </button>

          {/* Daily cost reframe */}
          <p style={{ fontSize: 12, color: '#555', marginTop: 14 }}>
            That's less than $2.75/day for a year of access
          </p>
        </div>
      </section>

      {/* ── FAQ — Objection handling ────────────────── */}
      <section style={{
        maxWidth: 700, margin: '0 auto', padding: '0 24px 80px',
        position: 'relative', zIndex: 1,
      }}>
        <h2 style={{
          fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, textAlign: 'center', marginBottom: 48,
        }}>
          Common Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { q: "What if I miss a day?", a: "You'll be removed from the current cohort. That's the accountability. But your 1-year access means you can rejoin a future cohort and pick up where you left off." },
            { q: "Do I need real estate experience?", a: "None. Day 1 starts at absolute zero. The challenge is designed for beginners who are ready to stop thinking and start doing." },
            { q: "How much time does it take per day?", a: "Plan for 1-2 hours. A short video lesson plus one action task. Some days are lighter, some are heavier — but it's designed to fit around a full-time job." },
            { q: "What if I already know the basics?", a: "This challenge is about execution, not education. Even experienced investors benefit from the daily accountability and structured deal-finding system." },
            { q: "Can I redo the challenge?", a: "Yes. You have 1-year access. If you fall off or want to run through it again with a new cohort, you can rejoin anytime within your access window." },
            { q: "What kind of real estate deals?", a: "The challenge focuses on residential real estate — finding undervalued properties, analyzing deals, connecting with agents, and submitting offers. It works for rentals, flips, or wholesale." },
          ].map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>

      {/* ── Final CTA — Loss aversion + commitment ───── */}
      <section style={{
        maxWidth: 700, margin: '0 auto', padding: '0 24px 100px',
        textAlign: 'center', position: 'relative', zIndex: 1,
      }}>
        <div className="card" style={{
          padding: 'clamp(36px, 6vw, 60px)',
          background: 'linear-gradient(135deg, rgba(233,69,96,0.08), rgba(83,52,131,0.08))',
          borderColor: 'rgba(233,69,96,0.15)',
        }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, marginBottom: 12 }}>
            30 Days From Now, You'll Wish You Started Today
          </h2>
          <p style={{ color: '#888', fontSize: 16, marginBottom: 12, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 32px' }}>
            Every day you wait is another day someone else is closing the deal you should've found. The next cohort has limited spots.
          </p>
          <button
            className="btn-primary"
            style={{ padding: '18px 52px', fontSize: 18, fontWeight: 700, marginBottom: 12 }}
            onClick={handleGetStarted}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? 'Loading…' : 'Start My 30-Day Challenge'}
          </button>
          <p style={{ color: '#555', fontSize: 13 }}>
            One-time investment. 1-year access with unlimited re-runs.
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px',
        textAlign: 'center', fontSize: 13, color: '#444',
      }}>
        <div>UC30 — 30-Day First Deal Challenge</div>
        <a
          href="/affiliates"
          style={{ color: '#444', textDecoration: 'none', fontSize: 12, marginTop: 8, display: 'inline-block' }}
          onMouseEnter={e => e.currentTarget.style.color = '#888'}
          onMouseLeave={e => e.currentTarget.style.color = '#444'}
        >
          Affiliate Program
        </a>
      </footer>

      {/* Pulse animation for the urgency dot */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ── FAQ Accordion Item ──────────────────────────────

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="card"
      style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
      onClick={() => setOpen(!open)}
    >
      <div style={{
        padding: '18px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 16,
      }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{question}</span>
        <span style={{
          color: '#e94560', fontSize: 20, flexShrink: 0,
          transform: open ? 'rotate(45deg)' : 'none',
          transition: 'transform 0.2s',
        }}>
          +
        </span>
      </div>
      {open && (
        <div style={{
          padding: '0 24px 18px', color: '#888', fontSize: 14, lineHeight: 1.7,
          borderTop: '1px solid rgba(255,255,255,0.04)',
          paddingTop: 16,
        }}>
          {answer}
        </div>
      )}
    </div>
  );
}

// ── Default content (reuses structure from V1 for admin editability) ──
const DEFAULTS = {
  features: [
    { icon: '🎬', title: '30 Video Lessons', text: 'Daily instructional videos walking you through every step of finding and closing your first deal.' },
    { icon: '📋', title: 'Daily Action Tasks', text: 'No theory paralysis. Every day has one clear task you must complete to stay in the challenge.' },
    { icon: '📊', title: 'Operator Dashboard', text: 'Track 6 key indicators, earn UC Points, and compete on the global leaderboard.' },
    { icon: '⏰', title: 'Strict Accountability', text: 'Daily deadlines with automatic removal. No excuses, no extensions. That\'s what makes it work.' },
    { icon: '💬', title: 'Private Community', text: 'Connect with your cohort. Share wins, ask questions, and stay motivated with people on the same journey.' },
    { icon: '🔄', title: '1-Year Re-run Access', text: 'Life happens. If you fall off, rejoin a future cohort within your one-year access window. No extra cost.' },
  ],
  phases: [
    { color: '#e94560', phase: 'Phase 1: Foundation', days: 'Days 1–10', items: ['Set up your deal-finding systems', 'Learn to analyze properties like a pro', 'Build your criteria and target markets'] },
    { color: '#533483', phase: 'Phase 2: Execution', days: 'Days 11–20', items: ['Start contacting agents and sellers', 'Submit your first real offers', 'Negotiate and follow up systematically'] },
    { color: '#0f3460', phase: 'Phase 3: Closing', days: 'Days 21–30', items: ['Advanced deal structuring', 'Due diligence and inspections', 'Close your first deal'] },
  ],
};
