import { useState } from 'react';
import NativeRentalCalculator from './NativeRentalCalculator';
import CapExCalculator from './CapExCalculator';
import DueDiligenceChecklist from './DueDiligenceChecklist';
import CapitalStrategyFinder from './CapitalStrategyFinder';
import { subscribeUser, tagFreeToolAccess, tagByName } from '../utils/kit';

// Human-readable lead segment for each best-fit path (used to tag leads in Kit)
const BEST_FIT_SEGMENT = {
  house_hack: 'House Hacking',
  partnership: 'Partnership',
  no_money: 'No Money / Creative',
  dscr: 'DSCR Investor',
  commercial: 'Commercial / Scaling',
  default: 'Buy & Hold',
};

const TOOLS = [
  {
    id: 'capital-strategy-finder',
    title: 'Capital & Strategy Finder',
    description: "Answer 8 quick questions and get a personalized snapshot of the financing you can likely use and the strategies open to you — with your single best-fit first move. Works for any situation, even no money or low credit.",
    icon: '🧭',
    component: CapitalStrategyFinder,
    leadGen: true,
    gate: {
      headline: 'Get your personalized Capital & Strategy plan',
      subcopy: "Enter your email and we'll unlock your results — the financing you can likely use, the strategies open to you, and your best-fit first move.",
      button: 'Get My Results',
    },
  },
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
  {
    id: 'due-diligence-checklist',
    title: 'Due Diligence Checklist',
    description: 'Track every document you need before closing. 27 items across financials, leases, legal, insurance, and management — with critical items flagged so nothing falls through the cracks.',
    icon: '📋',
    component: DueDiligenceChecklist,
    passUser: true,
  },
];

const STORAGE_KEY = 'uc30_tool_unlocked';

function getUnlockedTools() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function markToolUnlocked(toolId, email) {
  try {
    const unlocked = getUnlockedTools();
    unlocked[toolId] = { email, at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
  } catch {}
}

function EmailGate({ tool, onUnlock }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await subscribeUser(email, '');
      await tagFreeToolAccess(email, tool.title);
    } catch {}
    markToolUnlocked(tool.id, email);
    onUnlock();
  };

  return (
    <div style={{
      maxWidth: 460, margin: '0 auto', padding: '60px 20px', textAlign: 'center',
    }}>
      <div style={{
        fontSize: 56, marginBottom: 20,
      }}>
        {tool.icon}
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
        {tool.title}
      </h2>
      <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
        {tool.description}
      </p>
      <div style={{
        padding: 28, borderRadius: 14,
        background: 'rgba(233,69,96,0.04)', border: '1px solid rgba(233,69,96,0.15)',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
          {tool.gate?.headline || 'Enter your email to access this tool'}
        </div>
        <p style={{ color: '#777', fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
          {tool.gate?.subcopy || "Free to use. We'll also send you real estate investing resources."}
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, maxWidth: 400, margin: '0 auto' }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            required
            disabled={submitting}
            style={{
              flex: 1, padding: '12px 14px', fontSize: 14, borderRadius: 8,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#eee', fontFamily: "'DM Sans', sans-serif", outline: 'none',
              opacity: submitting ? 0.6 : 1,
            }}
          />
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '12px 24px', fontSize: 14, fontWeight: 600, borderRadius: 8,
              background: '#e94560', color: '#fff', border: 'none', cursor: submitting ? 'wait' : 'pointer',
              fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Unlocking...' : (tool.gate?.button || 'Unlock Tool')}
          </button>
        </form>
        {error && (
          <div style={{ marginTop: 10, fontSize: 12, color: '#e94560' }}>{error}</div>
        )}
      </div>
    </div>
  );
}

export default function FreeToolsPage({ user }) {
  const [activeTool, setActiveTool] = useState(null);
  const [unlockedTools, setUnlockedTools] = useState(getUnlockedTools);

  const path = window.location.pathname.replace(/\/+$/, '');
  const directTool = TOOLS.find(t => path === `/tools/${t.id}`);
  const tool = directTool || activeTool;

  if (tool) {
    const isUnlocked = !!unlockedTools[tool.id];

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

        {!isUnlocked ? (
          <EmailGate
            tool={tool}
            onUnlock={() => setUnlockedTools(getUnlockedTools())}
          />
        ) : (
          <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 20px 60px' }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{tool.title}</h1>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
              {tool.description}
            </p>

            <tool.component
              {...(tool.passUser ? { user } : {})}
              {...(tool.leadGen ? {
                onResult: (bestFit) => {
                  const email = unlockedTools[tool.id]?.email;
                  if (email) {
                    try { tagByName(email, `UC30 Lead - ${BEST_FIT_SEGMENT[bestFit.kind] || 'Investor'}`); } catch {}
                  }
                },
              } : {})}
            />

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
        )}
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
          <div style={{ fontSize: 12, color: '#444', marginTop: 4 }}>Seller Finance Modeler and more</div>
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
