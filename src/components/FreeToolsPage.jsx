import { useState } from 'react';
import NativeRentalCalculator from './NativeRentalCalculator';
import CapExCalculator from './CapExCalculator';

const TOOLS = [
  {
    id: 'rental-calculator',
    title: 'Rental Property Analyzer',
    description: 'Analyze any rental property in seconds. Calculate cash flow, cash-on-cash return, cap rate, DSCR, and more. Includes a seller finance solver and full amortization schedule.',
    icon: '🏠',
    component: NativeRentalCalculator,
  },
  {
    id: 'capex-calculator',
    title: 'CapEx Projection Calculator',
    description: 'Estimate capital expenditure reserves for any property. Covers 24 building systems with remaining-life projections, replacement costs, and urgency prioritization.',
    icon: '🔧',
    component: CapExCalculator,
  },
];

export default function FreeToolsPage() {
  const [activeTool, setActiveTool] = useState(null);
  const [email, setEmail] = useState('');
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [copyBlocked, setCopyBlocked] = useState(false);

  const path = window.location.pathname.replace(/\/+$/, '');
  const directTool = TOOLS.find(t => path === `/tools/${t.id}`);

  if (directTool || activeTool) {
    const tool = directTool || activeTool;
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
        {/* Header */}
        <div style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a
              href="/tools"
              onClick={e => { e.preventDefault(); setActiveTool(null); window.history.pushState({}, '', '/tools'); }}
              className="mono"
              style={{ fontSize: 24, fontWeight: 700, color: '#e94560', textDecoration: 'none' }}
            >
              UC30
            </a>
            <span style={{ color: '#333', fontSize: 18 }}>|</span>
            <span style={{ color: '#888', fontSize: 14, fontWeight: 500 }}>Free Tools</span>
          </div>
          <a
            href="/"
            style={{
              fontSize: 12, fontWeight: 600, color: '#e94560',
              textDecoration: 'none', padding: '6px 14px',
              border: '1px solid rgba(233,69,96,0.3)', borderRadius: 6,
              background: 'rgba(233,69,96,0.06)',
            }}
          >
            Join the Challenge
          </a>
        </div>

        {/* Tool */}
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 20px 60px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{tool.title}</h1>
          <p style={{ color: '#666', fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
            {tool.description}
          </p>

          <tool.component />

          {/* Email gate for copy/save */}
          {!emailCaptured && (
            <div style={{
              marginTop: 32, padding: 24, borderRadius: 12,
              background: 'rgba(233,69,96,0.04)', border: '1px solid rgba(233,69,96,0.15)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                Want to save your analysis?
              </div>
              <p style={{ color: '#888', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
                Enter your email to unlock the ability to copy and download your results.
                We'll also send you free real estate investing resources.
              </p>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (email.includes('@') && email.includes('.')) {
                    setEmailCaptured(true);
                    try {
                      const leads = JSON.parse(localStorage.getItem('uc30_tool_leads') || '[]');
                      leads.push({ email, tool: tool.id, capturedAt: new Date().toISOString() });
                      localStorage.setItem('uc30_tool_leads', JSON.stringify(leads));
                    } catch {}
                  }
                }}
                style={{ display: 'flex', gap: 8, maxWidth: 400, margin: '0 auto' }}
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    flex: 1, padding: '10px 14px', fontSize: 14, borderRadius: 8,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#eee', fontFamily: "'DM Sans', sans-serif", outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px', fontSize: 14, fontWeight: 600, borderRadius: 8,
                    background: '#e94560', color: '#fff', border: 'none', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
                  }}
                >
                  Unlock
                </button>
              </form>
            </div>
          )}

          {emailCaptured && (
            <div style={{
              marginTop: 24, padding: 16, borderRadius: 10,
              background: 'rgba(72,199,142,0.06)', border: '1px solid rgba(72,199,142,0.15)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 13, color: '#48c78e', fontWeight: 600 }}>
                Results unlocked — use the copy button above to save your analysis.
              </div>
            </div>
          )}

          {/* CTA */}
          <div style={{
            marginTop: 40, padding: 28, borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(233,69,96,0.08) 0%, rgba(83,52,131,0.08) 100%)',
            border: '1px solid rgba(233,69,96,0.15)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              Ready to close your first deal?
            </div>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
              The UC30 Challenge gives you 30 days of structured training, daily tasks,
              and accountability to go from analyzing properties to closing deals.
            </p>
            <a
              href="/"
              style={{
                display: 'inline-block', padding: '12px 32px', fontSize: 15, fontWeight: 700,
                borderRadius: 8, background: '#e94560', color: '#fff', textDecoration: 'none',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Join the Challenge
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Tools index page
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href="/" className="mono" style={{ fontSize: 24, fontWeight: 700, color: '#e94560', textDecoration: 'none' }}>
          UC30
        </a>
        <a
          href="/"
          style={{
            fontSize: 12, fontWeight: 600, color: '#e94560',
            textDecoration: 'none', padding: '6px 14px',
            border: '1px solid rgba(233,69,96,0.3)', borderRadius: 6,
            background: 'rgba(233,69,96,0.06)',
          }}
        >
          Join the Challenge
        </a>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 20px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#e94560',
            background: 'rgba(233,69,96,0.08)', border: '1px solid rgba(233,69,96,0.2)',
            padding: '4px 12px', borderRadius: 20, letterSpacing: 1, marginBottom: 16,
          }}>
            FREE TOOLS
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
            Real Estate Investor Tools
          </h1>
          <p style={{ color: '#888', fontSize: 15, lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
            Free calculators and analysis tools to help you evaluate deals with confidence.
            Built by investors, for investors.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {TOOLS.map(tool => (
            <a
              key={tool.id}
              href={`/tools/${tool.id}`}
              onClick={e => { e.preventDefault(); setActiveTool(tool); window.history.pushState({}, '', `/tools/${tool.id}`); }}
              style={{
                display: 'block', padding: 24, borderRadius: 12, textDecoration: 'none', color: 'inherit',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                transition: 'border-color 0.2s, background 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(233,69,96,0.3)';
                e.currentTarget.style.background = 'rgba(233,69,96,0.03)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: 'rgba(233,69,96,0.08)', border: '1px solid rgba(233,69,96,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  flexShrink: 0,
                }}>
                  {tool.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{tool.title}</div>
                  <div style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>{tool.description}</div>
                </div>
                <div style={{ color: '#e94560', fontSize: 20, fontShrink: 0 }}>&#8250;</div>
              </div>
            </a>
          ))}
        </div>

        {/* More tools coming soon */}
        <div style={{
          marginTop: 24, padding: 20, borderRadius: 12, textAlign: 'center',
          border: '1px dashed rgba(255,255,255,0.08)',
        }}>
          <div style={{ fontSize: 14, color: '#555' }}>More tools coming soon</div>
          <div style={{ fontSize: 12, color: '#444', marginTop: 4 }}>Seller Finance Modeler, Due Diligence Checklist, and more</div>
        </div>

        {/* Bottom CTA */}
        <div style={{
          marginTop: 48, padding: 32, borderRadius: 12, textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(233,69,96,0.08) 0%, rgba(83,52,131,0.08) 100%)',
          border: '1px solid rgba(233,69,96,0.15)',
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            These tools are just the beginning.
          </div>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
            The UC30 Challenge gives you 30 days of structured training, daily accountability,
            and a community of investors all working to close their first deal.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block', padding: '14px 36px', fontSize: 16, fontWeight: 700,
              borderRadius: 8, background: '#e94560', color: '#fff', textDecoration: 'none',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Join the Challenge
          </a>
        </div>
      </div>
    </div>
  );
}
