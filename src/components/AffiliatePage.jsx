import { useState } from 'react';

export default function AffiliatePage() {
  const [hoveredLink, setHoveredLink] = useState(null);

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background effects */}
      <div style={{
        position: 'fixed', top: '-20%', right: '-10%', width: 700, height: 700,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(233,69,96,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Nav */}
      <nav style={{
        padding: '20px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', maxWidth: 1200, margin: '0 auto',
        position: 'relative', zIndex: 1,
      }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: '#e94560' }}>UC30</div>
        </a>
        <a
          href="/"
          className="btn-secondary"
          style={{ padding: '8px 20px', fontSize: 13, textDecoration: 'none' }}
        >
          Back to Home
        </a>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: 720, margin: '0 auto', padding: '48px 24px 0',
        textAlign: 'center', position: 'relative', zIndex: 1,
      }}>
        <div style={{
          display: 'inline-block', padding: '6px 16px', borderRadius: 20,
          background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.2)',
          fontSize: 13, color: '#e94560', fontWeight: 600, marginBottom: 24,
        }}>
          Affiliate Program
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, lineHeight: 1.15,
          marginBottom: 16,
        }}>
          Earn <span style={{ color: '#e94560' }}>15% Commission</span> on Every Referral
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)', color: '#888', lineHeight: 1.7,
          maxWidth: 540, margin: '0 auto 48px',
        }}>
          Know someone who's ready to close their first real estate deal? Refer them to the UC30 Challenge and earn $149.55 for every signup.
        </p>
      </section>

      {/* How It Works */}
      <section style={{
        maxWidth: 800, margin: '0 auto', padding: '0 24px 64px',
        position: 'relative', zIndex: 1,
      }}>
        <h2 style={{
          fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 700,
          textAlign: 'center', marginBottom: 36,
        }}>
          How It Works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[
            { num: '01', title: 'Sign Up as an Affiliate', desc: 'Create your free affiliate account through our Tolt portal. Takes less than a minute.' },
            { num: '02', title: 'Share Your Link', desc: 'Get your unique referral link and share it with your audience, friends, or community.' },
            { num: '03', title: 'Earn Commission', desc: 'When someone signs up for the UC30 Challenge through your link, you earn 15% ($149.55).' },
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
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
              <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Commission Details */}
      <section style={{
        maxWidth: 560, margin: '0 auto', padding: '0 24px 64px',
        textAlign: 'center', position: 'relative', zIndex: 1,
      }}>
        <div className="card" style={{
          padding: 'clamp(28px, 5vw, 44px)',
          background: 'linear-gradient(135deg, rgba(233,69,96,0.06), rgba(83,52,131,0.06))',
          borderColor: 'rgba(233,69,96,0.15)',
        }}>
          <div className="mono" style={{ fontSize: 'clamp(40px, 7vw, 56px)', fontWeight: 800, color: '#e94560', lineHeight: 1 }}>
            $149.55
          </div>
          <p style={{ fontSize: 15, color: '#888', marginTop: 8, marginBottom: 24 }}>
            per referral (15% of $997)
          </p>

          <div style={{
            textAlign: 'left', maxWidth: 360, margin: '0 auto 28px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {[
              'No cap on earnings',
              'Real-time tracking dashboard',
              'Monthly payouts via Stripe',
              'Cookie-based attribution (30 days)',
              'Free to join — no fees or commitments',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#ccc' }}>
                <span style={{ color: '#48c78e', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>&#10003;</span>
                {item}
              </div>
            ))}
          </div>

          <a
            href="https://tolt.io"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{
              padding: '16px 40px', fontSize: 17, fontWeight: 700,
              display: 'inline-block', textDecoration: 'none',
            }}
          >
            Join the Affiliate Program
          </a>
          <p style={{ fontSize: 12, color: '#555', marginTop: 14 }}>
            Powered by Tolt — you'll create your affiliate account there
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{
        maxWidth: 600, margin: '0 auto', padding: '0 24px 80px',
        position: 'relative', zIndex: 1,
      }}>
        <h2 style={{
          fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 700,
          textAlign: 'center', marginBottom: 36,
        }}>
          Affiliate FAQ
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { q: 'How do I get paid?', a: 'Commissions are tracked automatically through Tolt and paid out monthly via Stripe. You\'ll set up your payout details in your Tolt dashboard.' },
            { q: 'How long does the cookie last?', a: 'Tolt uses a 30-day cookie. If someone clicks your link and signs up within 30 days, you get credited.' },
            { q: 'Can I promote UC30 on social media?', a: 'Absolutely. Share your link on social media, in emails, on your blog, or anywhere your audience is. Just be transparent that it\'s an affiliate link.' },
            { q: 'Is there a minimum payout?', a: 'Payout terms are managed through Tolt. Check your affiliate dashboard for specific thresholds and schedule.' },
          ].map((faq, i) => (
            <div key={i} className="card" style={{ padding: '20px 24px' }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{faq.q}</h4>
              <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px',
        textAlign: 'center', fontSize: 13, color: '#444',
      }}>
        <div>UC30 — 30-Day First Deal Challenge</div>
        <a
          href="/"
          style={{
            color: hoveredLink === 'home' ? '#888' : '#444',
            textDecoration: 'none', fontSize: 12, marginTop: 8, display: 'inline-block',
          }}
          onMouseEnter={() => setHoveredLink('home')}
          onMouseLeave={() => setHoveredLink(null)}
        >
          Back to Home
        </a>
      </footer>
    </div>
  );
}
