import { useState } from 'react';
import { subscribeUser, tagByName } from '../utils/kit';

const QUESTIONS = [
  {
    id: 'liquid_cash',
    question: 'How much liquid cash (savings, checking, money market) do you have available for investing?',
    options: [
      { label: 'Less than $10,000', value: 0 },
      { label: '$10,000 – $30,000', value: 1 },
      { label: '$30,000 – $75,000', value: 2 },
      { label: '$75,000 – $150,000', value: 3 },
      { label: '$150,000+', value: 4 },
    ],
  },
  {
    id: 'additional_capital',
    question: 'Do you have access to additional capital? (401k, home equity, private lending, business partners)',
    options: [
      { label: 'No additional capital access', value: 0 },
      { label: 'Possible but unconfirmed', value: 1 },
      { label: 'Yes, confirmed access to additional funds', value: 2 },
    ],
  },
  {
    id: 'credit_score',
    question: 'What is your approximate credit score?',
    options: [
      { label: 'Below 580', value: 0 },
      { label: '580 – 639', value: 1 },
      { label: '640 – 699', value: 2 },
      { label: '700 – 749', value: 3 },
      { label: '750+', value: 4 },
    ],
  },
  {
    id: 'income_stability',
    question: 'How stable is your current income?',
    options: [
      { label: 'Currently between jobs or unstable income', value: 0 },
      { label: 'Freelance / variable income', value: 1 },
      { label: 'Stable W-2 or consistent self-employment (2+ years)', value: 2 },
    ],
  },
  {
    id: 'pre_approval',
    question: 'Have you spoken to a lender or obtained a pre-approval for investment property financing?',
    options: [
      { label: 'No', value: 0 },
      { label: 'I\'ve researched but haven\'t contacted a lender', value: 1 },
      { label: 'Yes — I have a pre-approval or active lender relationship', value: 2 },
    ],
  },
  {
    id: 'time_commitment',
    question: 'Can you commit 1–2 hours per day for 30 consecutive days?',
    options: [
      { label: 'Probably not', value: 0 },
      { label: 'Most days, but I\'ll have gaps', value: 1 },
      { label: 'Yes — I can commit every day', value: 2 },
    ],
  },
  {
    id: 'market_knowledge',
    question: 'How familiar are you with the real estate investing market you plan to target?',
    options: [
      { label: 'I haven\'t chosen a market yet', value: 0 },
      { label: 'I\'ve done some research on one or two markets', value: 1 },
      { label: 'I know my market — rents, prices, neighborhoods', value: 2 },
    ],
  },
  {
    id: 'deal_experience',
    question: 'Have you ever made an offer on an investment property?',
    options: [
      { label: 'Never', value: 0 },
      { label: 'I\'ve made 1–2 offers but haven\'t closed', value: 1 },
      { label: 'I\'ve closed at least one investment property', value: 2 },
    ],
  },
];

function getResult(answers) {
  const cash = answers.liquid_cash ?? -1;
  const credit = answers.credit_score ?? -1;
  const income = answers.income_stability ?? -1;
  const time = answers.time_commitment ?? -1;
  const total = Object.values(answers).reduce((sum, v) => sum + v, 0);
  const max = 4 + 2 + 4 + 2 + 2 + 2 + 2 + 2; // 20

  // Hard blockers
  if (cash === 0 && (answers.additional_capital ?? 0) === 0) {
    return {
      tier: 'not_ready',
      title: 'Not Quite Ready',
      color: '#e94560',
      summary: 'You need capital to invest. Focus on building your savings or securing access to financing before joining a cohort.',
      actions: [
        'Save aggressively — aim for at least $10,000 in liquid reserves',
        'Explore FHA loans, house hacking, or partnership structures',
        'Talk to a lender about what you\'d need to qualify',
        'Consider seller-financed deals that require less upfront capital',
      ],
    };
  }

  if (time === 0) {
    return {
      tier: 'not_ready',
      title: 'Not Quite Ready',
      color: '#e94560',
      summary: 'UC30 requires daily commitment. If you can\'t dedicate 1–2 hours per day for 30 days, wait until your schedule allows it.',
      actions: [
        'Block 1–2 hours daily on your calendar before joining',
        'Clear major commitments that would interfere with the sprint',
        'Apply for the next cohort when you have a clear 30-day window',
      ],
    };
  }

  if (total >= 14) {
    return {
      tier: 'ready',
      title: 'You\'re Ready',
      color: '#48c78e',
      summary: 'You have the capital, credit, and commitment to make UC30 count. Apply now and let\'s get to work.',
      actions: [
        'Apply for the next UC30 cohort',
        'Get pre-approved with a lender if you haven\'t already',
        'Start researching your target market before Day 1',
      ],
    };
  }

  if (total >= 8) {
    return {
      tier: 'almost_ready',
      title: 'Almost Ready',
      color: '#f0a500',
      summary: 'You\'re close. A few things to shore up before you join, but you could be ready for the next cohort with some prep work.',
      actions: [
        cash <= 1 ? 'Build your cash reserves — aim for at least $30,000 in accessible capital' : null,
        credit <= 1 ? 'Work on improving your credit score — pay down balances and dispute errors' : null,
        income === 0 ? 'Stabilize your income situation before committing to a 30-day sprint' : null,
        (answers.pre_approval ?? 0) === 0 ? 'Talk to a lender about investment property financing' : null,
        (answers.market_knowledge ?? 0) === 0 ? 'Research 1–2 target markets — understand rents, prices, and neighborhoods' : null,
        'Apply for the next cohort and use the prep time to address these items',
      ].filter(Boolean),
    };
  }

  return {
    tier: 'not_ready',
    title: 'Not Quite Ready',
    color: '#e94560',
    summary: 'You have some groundwork to lay before UC30 will be effective. That\'s OK — better to prepare now than rush in unprepared.',
    actions: [
      cash <= 1 ? 'Build liquid capital — you need at least $10,000–$30,000 to start investing' : null,
      credit <= 1 ? 'Improve your credit score — this affects your financing options significantly' : null,
      income === 0 ? 'Get stable income first — investing from an unstable position creates bad decisions' : null,
      (answers.pre_approval ?? 0) === 0 ? 'Connect with a lender to understand your financing options' : null,
      time <= 0 ? 'Clear your schedule — UC30 requires daily commitment' : null,
      'Focus on these fundamentals and apply for a future cohort',
    ].filter(Boolean),
  };
}

const READINESS_UNLOCKED_KEY = 'uc30_readiness_unlocked';

function isReadinessUnlocked() {
  try { return localStorage.getItem(READINESS_UNLOCKED_KEY) === 'true'; } catch { return false; }
}

export default function ReadinessQuestionnaire({ onClose }) {
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [emailUnlocked, setEmailUnlocked] = useState(isReadinessUnlocked);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  const allAnswered = QUESTIONS.every(q => answers[q.id] !== undefined);
  const result = allAnswered ? getResult(answers) : null;

  const handleSeeResults = () => {
    if (emailUnlocked) {
      setShowResult(true);
    } else {
      setShowEmailGate(true);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes('@') || !email.includes('.')) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailSubmitting(true);
    setEmailError('');
    try {
      await subscribeUser(email, '');
      await tagByName(email, 'UC30 - Real Estate Readiness');
    } catch {}
    try { localStorage.setItem(READINESS_UNLOCKED_KEY, 'true'); } catch {}
    setEmailUnlocked(true);
    setEmailSubmitting(false);
    setShowEmailGate(false);
    setShowResult(true);
  };

  return (
    <div className="fade-up" style={{ maxWidth: 600, margin: '0 auto' }}>
      {onClose && (
        <button className="btn-secondary" onClick={onClose} style={{ marginBottom: 20, padding: '8px 20px', fontSize: 13 }}>
          ← Back
        </button>
      )}

      <div className="card" style={{ textAlign: 'center', padding: '32px 24px', marginBottom: 24 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
          Am I Ready for Real Estate Investing?
        </h1>
        <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7, maxWidth: 440, margin: '0 auto' }}>
          Answer these questions honestly. This isn't a test — it's a tool to make sure you're set up to succeed, not just participate.
        </p>
      </div>

      {!showResult ? (
        <>
          {QUESTIONS.map((q, qi) => (
            <div key={q.id} className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#ddd', marginBottom: 12, lineHeight: 1.5 }}>
                {qi + 1}. {q.question}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {q.options.map((opt, oi) => {
                  const isSelected = answers[q.id] === opt.value;
                  return (
                    <button
                      key={oi}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.value }))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                        fontSize: 14, textAlign: 'left',
                        fontFamily: "'DM Sans', sans-serif",
                        background: isSelected ? 'rgba(233,69,96,0.1)' : 'rgba(255,255,255,0.03)',
                        border: isSelected ? '1px solid rgba(233,69,96,0.4)' : '1px solid rgba(255,255,255,0.08)',
                        color: isSelected ? '#e94560' : '#bbb',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                        background: isSelected ? 'rgba(233,69,96,0.2)' : 'rgba(255,255,255,0.06)',
                        color: isSelected ? '#e94560' : '#666',
                      }}>
                        {isSelected ? '●' : String.fromCharCode(65 + oi)}
                      </span>
                      <span style={{ fontWeight: isSelected ? 600 : 400 }}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            onClick={handleSeeResults}
            disabled={!allAnswered}
            className="btn-primary"
            style={{
              width: '100%', padding: '16px 24px', fontSize: 16,
              opacity: allAnswered ? 1 : 0.4, marginBottom: 40,
            }}
          >
            See My Results
          </button>
        </>
      ) : showEmailGate && !showResult ? (
        <div className="scale-in">
          <div className="card" style={{ padding: '36px 24px', textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Your results are ready
            </h2>
            <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6, marginBottom: 28, maxWidth: 380, margin: '0 auto 28px' }}>
              Enter your email to see your personalized readiness score, result tier, and action items.
            </p>
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', gap: 8, maxWidth: 400, margin: '0 auto' }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                required
                disabled={emailSubmitting}
                style={{
                  flex: 1, padding: '12px 14px', fontSize: 14, borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#eee', fontFamily: "'DM Sans', sans-serif", outline: 'none',
                  opacity: emailSubmitting ? 0.6 : 1,
                }}
              />
              <button
                type="submit"
                disabled={emailSubmitting}
                style={{
                  padding: '12px 24px', fontSize: 14, fontWeight: 600, borderRadius: 8,
                  background: '#e94560', color: '#fff', border: 'none',
                  cursor: emailSubmitting ? 'wait' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
                  opacity: emailSubmitting ? 0.7 : 1,
                }}
              >
                {emailSubmitting ? 'Loading...' : 'See Results'}
              </button>
            </form>
            {emailError && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#e94560' }}>{emailError}</div>
            )}
            <p style={{ color: '#555', fontSize: 11, marginTop: 16, lineHeight: 1.5 }}>
              We'll also send you free real estate investing resources. No spam.
            </p>
          </div>
          <button
            onClick={() => { setShowEmailGate(false); }}
            className="btn-secondary"
            style={{ padding: '10px 20px', fontSize: 13 }}
          >
            ← Back to questions
          </button>
        </div>
      ) : result && (
        <div className="scale-in">
          <div className="card" style={{
            padding: '32px 24px', textAlign: 'center', marginBottom: 20,
            border: `1px solid ${result.color}30`,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
              background: `${result.color}15`, border: `2px solid ${result.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            }}>
              {result.tier === 'ready' ? '✓' : result.tier === 'almost_ready' ? '↗' : '⏸'}
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: result.color, marginBottom: 8 }}>
              {result.title}
            </h2>
            <p style={{ color: '#aaa', fontSize: 15, lineHeight: 1.7, maxWidth: 440, margin: '0 auto' }}>
              {result.summary}
            </p>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${result.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📌</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                {result.tier === 'ready' ? 'Next Steps' : 'Action Items'}
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result.actions.map((action, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <span style={{ color: result.color, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ fontSize: 14, color: '#bbb', lineHeight: 1.6 }}>{action}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 40 }}>
            <button
              onClick={() => { setShowResult(false); setShowEmailGate(false); setAnswers({}); }}
              className="btn-secondary"
              style={{ padding: '14px 20px' }}
            >
              Retake
            </button>
            {onClose && (
              <button onClick={onClose} className="btn-primary" style={{ flex: 1, padding: '14px 24px' }}>
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
