import { useState } from 'react';
import NativeRentalCalculator from './NativeRentalCalculator';

const PRACTICE_METRICS = [
  { id: 'training_completed', label: 'Training Completed', type: 'boolean', icon: '📚', tip: 'Mark this done after watching the daily training video. Must be completed before you can submit.' },
  { id: 'properties_analyzed', label: 'Properties Analyzed', type: 'count', icon: '🔍', tip: 'Properties reviewed with full analysis — asking price, taxes, insurance, financing, vacancy, expenses, CapEx, PM costs.' },
  { id: 'arsenal_contacts', label: 'Arsenal Contacts', type: 'count', icon: '🤝', tip: 'Ecosystem outreach — property managers, lenders, contractors, agents, wholesalers, fellow investors.' },
  { id: 'target_contacts', label: 'Target Contacts', type: 'count', icon: '🎯', tip: 'Direct outreach to a specific property owner, seller, or listing agent about a specific property.' },
  { id: 'follow_ups', label: 'Follow-Ups', type: 'count', icon: '📞', tip: 'Second or subsequent outreach to anyone already in your pipeline.' },
  { id: 'offers_submitted', label: 'Offers Submitted', type: 'count', icon: '📝', tip: 'Formal written offers, LOIs, or counteroffers delivered on specific properties.' },
];

const PROPERTY_DATA = {
  purchasePrice: '$250,000',
  downPaymentPct: '25%',
  downPaymentAmt: '$62,500',
  yearsToPayoff: '30',
  interestRate: '6%',
  costsToMakeRentReady: '$0',
  closingCostsPct: '2%',
  closingCostsAmt: '$3,750',
  rents: '$2,600/mo',
  otherIncome: '$0',
  vacancyRate: '6%',
  maintenance: '12%',
  management: '8%',
  utilities: '$0',
  additionalExpenses: '$0',
  insurance: '$1,000/yr',
  taxes: '$2,000/yr',
};

const QUIZ_QUESTIONS = [
  {
    id: 'coc_return',
    question: 'What is the Cash on Cash Return?',
    options: ['8.52%', '10.52%', '12.18%', '6.97%'],
    correctIndex: 1,
  },
  {
    id: 'cap_rate',
    question: 'What is the Cap Rate?',
    options: ['10.52%', '6.97%', '8.18%', '12.00%'],
    correctIndex: 2,
  },
  {
    id: 'yearly_cash_flow',
    question: 'What is the Yearly Cash Flow?',
    options: ['$8,180.00', '$5,200.00', '$10,520.00', '$6,972.51'],
    correctIndex: 3,
  },
  {
    id: 'worth_purchasing',
    question: 'Is this property worth purchasing if your desired Cash on Cash return is 12%?',
    options: ['Yes', 'No'],
    correctIndex: 1,
  },
];

const CHEAT_SHEET_INPUT = [
  { label: 'Purchase Price', value: '$250,000' },
  { label: 'Down Payment', value: '25% ($62,500)' },
  { label: 'Years to Payoff', value: '30' },
  { label: 'Interest Rate', value: '6%' },
  { label: 'Costs to Make Rent Ready', value: '$0' },
  { label: 'Closing Costs', value: '2% ($3,750)' },
  { label: 'Rents', value: '$2,600/mo' },
  { label: 'Other Income', value: '$0/mo' },
  { label: 'Vacancy Rate', value: '6%' },
  { label: 'Maintenance', value: '12%' },
  { label: 'Management', value: '8%' },
  { label: 'Utilities', value: '$0/mo' },
  { label: 'Additional Expenses', value: '$0/mo' },
  { label: 'Insurance', value: '$1,000/yr' },
  { label: 'Taxes', value: '$2,000/yr' },
];

const CHEAT_SHEET_RETURNS = [
  { label: 'Cash on Cash Return', value: '10.52%', highlight: true },
  { label: 'Cap Rate', value: '8.18%', highlight: true },
  { label: 'Monthly Cash Flow', value: '$581.04' },
  { label: 'Yearly Cash Flow', value: '$6,972.51', highlight: true },
  { label: 'Monthly Income', value: '$2,600.00' },
  { label: 'Monthly Expenses', value: '$2,018.96' },
  { label: 'Total Capital Required', value: '$66,250' },
  { label: 'NOI (Net Operating Income)', value: '$20,432.00' },
];

export default function PracticeDay({ user, practiceDaySettings, onComplete, onBack }) {
  const [currentGuide, setCurrentGuide] = useState(0);
  const [metrics, setMetrics] = useState({
    training_completed: false, properties_analyzed: 0, arsenal_contacts: 0,
    target_contacts: 0, follow_ups: 0, offers_submitted: 0,
  });
  const [proofText, setProofText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Quiz state
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [showCheatSheets, setShowCheatSheets] = useState(false);

  const videoUrl = practiceDaySettings?.practice_day_video || null;
  const calculatorUrl = practiceDaySettings?.rental_calculator_url || null;

  const setMetric = (key, value) => setMetrics(prev => ({ ...prev, [key]: value }));

  const GUIDE_STEPS = [
    { id: 'video', title: 'Daily Training Video', icon: '🎬' },
    { id: 'quiz', title: 'Rental Property Analysis', icon: '📊' },
    { id: 'metrics', title: 'Daily Activity Log', icon: '📊' },
    { id: 'submit', title: 'Submit Your Day', icon: '📤' },
  ];

  const handleCheckQuiz = () => {
    const allCorrect = QUIZ_QUESTIONS.every(q => answers[q.id] === q.correctIndex);
    setQuizSubmitted(true);
    if (allCorrect) {
      setQuizPassed(true);
    } else {
      setShowCheatSheets(true);
    }
  };

  const handleRetryQuiz = () => {
    setAnswers({});
    setQuizSubmitted(false);
    setShowCheatSheets(false);
  };

  const allQuestionsAnswered = QUIZ_QUESTIONS.every(q => answers[q.id] !== undefined);

  const handlePracticeSubmit = async () => {
    setSubmitted(true);
    if (onComplete) await onComplete();
  };

  if (submitted) {
    return (
      <div className="fade-up" style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 24px',
            background: 'rgba(72,199,142,0.15)', border: '2px solid rgba(72,199,142,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
          }}>✓</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#48c78e', marginBottom: 12 }}>
            Nice work!
          </h1>
          <p style={{ color: '#888', fontSize: 15, lineHeight: 1.8, maxWidth: 400, margin: '0 auto 32px' }}>
            That's exactly how it works on a real day. You're ready for Day 1.
          </p>
          <p style={{ color: '#555', fontSize: 13, marginBottom: 24 }}>
            Nothing was saved — this was just practice.
          </p>
          <button className="btn-secondary" onClick={onBack} style={{ padding: '12px 28px', fontSize: 14 }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up" style={{ maxWidth: 640, margin: '0 auto' }}>
      <button className="btn-secondary" onClick={onBack} style={{ marginBottom: 20, padding: '8px 20px', fontSize: 13 }}>
        ← Back
      </button>

      {/* Practice Mode Banner */}
      <div style={{
        padding: '12px 20px', borderRadius: 10, marginBottom: 24, textAlign: 'center',
        background: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.25)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f0a500', letterSpacing: 1, textTransform: 'uppercase' }}>
          Practice Mode
        </div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
          This is a practice run. Nothing you submit here counts toward your sprint.
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28, justifyContent: 'center' }}>
        {GUIDE_STEPS.map((s, i) => (
          <button key={s.id} onClick={() => setCurrentGuide(i)} style={{
            width: i === currentGuide ? 28 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer',
            background: i < currentGuide ? '#48c78e' : i === currentGuide ? '#f0a500' : 'rgba(255,255,255,0.08)',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      {/* GUIDE STEP 1: VIDEO */}
      {currentGuide === 0 && (
        <div className="scale-in">
          <Tooltip text="Each day starts with a training video from Chandler. Watch it before doing anything else." />
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(233,69,96,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎬</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Daily Training Video</h3>
            </div>
            {videoUrl ? (
              <div style={{ aspectRatio: '16/9', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
                <iframe src={videoUrl} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
              </div>
            ) : (
              <div style={{
                aspectRatio: '16/9', borderRadius: 10, marginBottom: 12,
                background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
              }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>▶️</div>
                <div style={{ fontSize: 13, color: '#666' }}>Daily video will appear here</div>
              </div>
            )}
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, margin: 0 }}>
              On a real day, you'd watch the full training video before moving on to your daily activities.
            </p>
          </div>
          <button className="btn-primary" onClick={() => setCurrentGuide(1)} style={{ width: '100%', padding: '14px 24px' }}>
            Got it — Next
          </button>
        </div>
      )}

      {/* GUIDE STEP 2: RENTAL PROPERTY ANALYSIS QUIZ */}
      {currentGuide === 1 && (
        <div className="scale-in">
          <Tooltip text="Use the property data below and the CDS Rental Calculator to answer the quiz questions. This is how you'll analyze properties during your sprint." />

          {/* Property Data Card */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(83,52,131,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🏠</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Rental Property Analysis</h3>
            </div>

            <p style={{ fontSize: 13, color: '#bbb', lineHeight: 1.7, marginBottom: 16 }}>
              Review the property details below, then plug them into the{' '}
              {calculatorUrl ? (
                <a href={calculatorUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#c9a0ff', textDecoration: 'underline' }}>
                  CDS Rental Calculator
                </a>
              ) : (
                <span style={{ color: '#c9a0ff' }}>CDS Rental Calculator</span>
              )}{' '}
              to answer the questions that follow.
            </p>

            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              {/* Purchase & Financing Section */}
              <div style={{ padding: '10px 14px', background: 'rgba(83,52,131,0.12)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#c9a0ff', textTransform: 'uppercase', letterSpacing: 1 }}>Purchase & Financing</div>
              </div>
              <DataRow label="Purchase Price" value={PROPERTY_DATA.purchasePrice} />
              <DataRow label="Down Payment" value={`${PROPERTY_DATA.downPaymentPct} (${PROPERTY_DATA.downPaymentAmt})`} />
              <DataRow label="Years to Payoff" value={PROPERTY_DATA.yearsToPayoff} />
              <DataRow label="Interest Rate" value={PROPERTY_DATA.interestRate} />
              <DataRow label="Costs to Make Rent Ready" value={PROPERTY_DATA.costsToMakeRentReady} />
              <DataRow label="Closing Costs" value={`${PROPERTY_DATA.closingCostsPct} (${PROPERTY_DATA.closingCostsAmt})`} last />

              {/* Income Section */}
              <div style={{ padding: '10px 14px', background: 'rgba(72,199,142,0.08)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#48c78e', textTransform: 'uppercase', letterSpacing: 1 }}>Income</div>
              </div>
              <DataRow label="Rents" value={PROPERTY_DATA.rents} />
              <DataRow label="Other Income" value={PROPERTY_DATA.otherIncome} last />

              {/* Expenses Section */}
              <div style={{ padding: '10px 14px', background: 'rgba(233,69,96,0.08)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#e94560', textTransform: 'uppercase', letterSpacing: 1 }}>Expenses</div>
              </div>
              <DataRow label="Vacancy Rate" value={PROPERTY_DATA.vacancyRate} />
              <DataRow label="Maintenance" value={PROPERTY_DATA.maintenance} />
              <DataRow label="Management" value={PROPERTY_DATA.management} />
              <DataRow label="Utilities" value={PROPERTY_DATA.utilities} />
              <DataRow label="Additional Expenses" value={PROPERTY_DATA.additionalExpenses} />
              <DataRow label="Insurance" value={PROPERTY_DATA.insurance} />
              <DataRow label="Taxes" value={PROPERTY_DATA.taxes} last />
            </div>
          </div>

          {/* Built-in Rental Calculator */}
          <div className="card" style={{ marginBottom: 20, border: '1px solid rgba(83,52,131,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(83,52,131,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📊</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>CDS Rental Calculator</h3>
            </div>
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, marginBottom: 14 }}>
              Plug in the property data above and use the results to answer the quiz questions below.
            </p>
            <NativeRentalCalculator />
          </div>

          {/* Quiz Questions */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(240,165,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📝</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Answer the Questions Below</h3>
            </div>

            {quizPassed ? (
              <div style={{ padding: '24px', borderRadius: 12, textAlign: 'center', background: 'rgba(72,199,142,0.06)', border: '1px solid rgba(72,199,142,0.2)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#48c78e', marginBottom: 4 }}>All Correct!</div>
                <div style={{ fontSize: 13, color: '#888' }}>Great job analyzing this property.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {QUIZ_QUESTIONS.map((q, qi) => {
                  const selected = answers[q.id];
                  const isCorrect = quizSubmitted && selected === q.correctIndex;
                  const isWrong = quizSubmitted && selected !== undefined && selected !== q.correctIndex;
                  return (
                    <div key={q.id}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#ddd', marginBottom: 10 }}>
                        {qi + 1}. {q.question}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {q.options.map((opt, oi) => {
                          const isSelected = selected === oi;
                          const showCorrect = quizSubmitted && oi === q.correctIndex;
                          const showWrong = quizSubmitted && isSelected && oi !== q.correctIndex;
                          return (
                            <button
                              key={oi}
                              onClick={() => {
                                if (!quizSubmitted) setAnswers(prev => ({ ...prev, [q.id]: oi }));
                              }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 14px', borderRadius: 8, cursor: quizSubmitted ? 'default' : 'pointer',
                                fontSize: 14, textAlign: 'left',
                                fontFamily: "'DM Sans', sans-serif",
                                background: showCorrect
                                  ? 'rgba(72,199,142,0.1)'
                                  : showWrong
                                    ? 'rgba(233,69,96,0.08)'
                                    : isSelected
                                      ? 'rgba(240,165,0,0.1)'
                                      : 'rgba(255,255,255,0.03)',
                                border: showCorrect
                                  ? '1px solid rgba(72,199,142,0.4)'
                                  : showWrong
                                    ? '1px solid rgba(233,69,96,0.3)'
                                    : isSelected
                                      ? '1px solid rgba(240,165,0,0.4)'
                                      : '1px solid rgba(255,255,255,0.08)',
                                color: showCorrect ? '#48c78e' : showWrong ? '#e94560' : isSelected ? '#f0a500' : '#bbb',
                                transition: 'all 0.15s',
                              }}
                            >
                              <span style={{
                                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 700,
                                background: showCorrect
                                  ? 'rgba(72,199,142,0.2)'
                                  : showWrong
                                    ? 'rgba(233,69,96,0.15)'
                                    : isSelected
                                      ? 'rgba(240,165,0,0.2)'
                                      : 'rgba(255,255,255,0.06)',
                                color: showCorrect ? '#48c78e' : showWrong ? '#e94560' : isSelected ? '#f0a500' : '#666',
                              }}>
                                {showCorrect ? '✓' : showWrong ? '✗' : String.fromCharCode(65 + oi)}
                              </span>
                              <span style={{ fontWeight: isSelected || showCorrect ? 600 : 400 }}>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                      {isWrong && (
                        <div style={{ fontSize: 12, color: '#e94560', marginTop: 6, paddingLeft: 4 }}>
                          Incorrect — the correct answer is {q.options[q.correctIndex]}
                        </div>
                      )}
                      {isCorrect && (
                        <div style={{ fontSize: 12, color: '#48c78e', marginTop: 6, paddingLeft: 4 }}>
                          Correct!
                        </div>
                      )}
                    </div>
                  );
                })}

                {!quizSubmitted && (
                  <button
                    className="btn-primary"
                    onClick={handleCheckQuiz}
                    disabled={!allQuestionsAnswered}
                    style={{ width: '100%', padding: '14px', opacity: allQuestionsAnswered ? 1 : 0.4 }}
                  >
                    Check Answers
                  </button>
                )}

                {quizSubmitted && !quizPassed && (
                  <div style={{
                    padding: '16px', borderRadius: 12, marginTop: 4,
                    background: 'rgba(233,69,96,0.04)', border: '1px solid rgba(233,69,96,0.15)',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#e94560', marginBottom: 6 }}>
                      Not quite — review the cheat sheets below and try again.
                    </div>
                    <div style={{ fontSize: 12, color: '#888' }}>
                      Make sure you've entered all the property data correctly into the calculator.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cheat Sheets — shown on failure */}
          {showCheatSheets && !quizPassed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
              {/* Cheat Sheet 1: Calculator Input */}
              <div className="card" style={{ border: '1px solid rgba(83,52,131,0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(83,52,131,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>📋</div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#c9a0ff', margin: 0 }}>Cheat Sheet: Calculator Inputs</h4>
                </div>
                <p style={{ fontSize: 12, color: '#888', marginBottom: 12, lineHeight: 1.5 }}>
                  Make sure each field in the CDS Rental Calculator matches these values exactly:
                </p>
                <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {CHEAT_SHEET_INPUT.map((row, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 12px',
                      background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                      borderBottom: i < CHEAT_SHEET_INPUT.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}>
                      <span style={{ fontSize: 12, color: '#999' }}>{row.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#ddd', fontFamily: "'DM Mono', monospace" }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cheat Sheet 2: Returns Analysis */}
              <div className="card" style={{ border: '1px solid rgba(72,199,142,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(72,199,142,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>📈</div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#48c78e', margin: 0 }}>Cheat Sheet: Returns Analysis</h4>
                </div>
                <p style={{ fontSize: 12, color: '#888', marginBottom: 12, lineHeight: 1.5 }}>
                  If entered correctly, the calculator should show these results:
                </p>
                <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {CHEAT_SHEET_RETURNS.map((row, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 12px',
                      background: row.highlight ? 'rgba(72,199,142,0.04)' : i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                      borderBottom: i < CHEAT_SHEET_RETURNS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}>
                      <span style={{ fontSize: 12, color: row.highlight ? '#48c78e' : '#999' }}>{row.label}</span>
                      <span style={{
                        fontSize: 13, fontFamily: "'DM Mono', monospace",
                        fontWeight: row.highlight ? 700 : 600,
                        color: row.highlight ? '#48c78e' : '#ddd',
                      }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={handleRetryQuiz}
                style={{ width: '100%', padding: '14px 24px' }}
              >
                Try Again
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={() => setCurrentGuide(0)} style={{ padding: '14px 20px' }}>Back</button>
            <button className="btn-primary" onClick={() => setCurrentGuide(2)} style={{ flex: 1, padding: '14px 24px' }}>
              {quizPassed ? 'Next' : 'Skip for now'}
            </button>
          </div>
        </div>
      )}

      {/* GUIDE STEP 3: METRICS */}
      {currentGuide === 2 && (
        <div className="scale-in">
          <Tooltip text="This is where you log your daily activity. Each metric has a minimum requirement — meet them all to stay in the sprint." />
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(233,69,96,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📊</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Daily Activity Log</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PRACTICE_METRICS.map(metric => {
                const value = metrics[metric.id];
                const isBool = metric.type === 'boolean';
                const mins = { training_completed: true, properties_analyzed: 2, arsenal_contacts: 1, target_contacts: 3, follow_ups: 0, offers_submitted: 0 };
                const required = mins[metric.id];
                const met = isBool
                  ? (!required || value)
                  : (typeof required !== 'number' || required <= 0 || (value || 0) >= required);
                const isRequired = isBool ? !!required : (typeof required === 'number' && required > 0);
                const isContactMetric = metric.id === 'arsenal_contacts' || metric.id === 'target_contacts';
                const contactColor = metric.id === 'arsenal_contacts' ? '#f0a500' : '#e94560';

                return (
                  <div key={metric.id}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderRadius: 10,
                      background: met ? 'rgba(72,199,142,0.04)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${met ? 'rgba(72,199,142,0.15)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                        <span style={{ fontSize: 18 }}>{metric.icon}</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#ddd' }}>{metric.label}</div>
                          {isRequired && (
                            <div style={{ fontSize: 11, color: met ? '#48c78e' : '#e94560', fontWeight: 600 }}>
                              {isBool ? 'Required' : `Min: ${required}`}
                              {met && ' ✓'}
                            </div>
                          )}
                          {!isRequired && (
                            <div style={{ fontSize: 11, color: '#555' }}>Optional</div>
                          )}
                        </div>
                      </div>
                      {isBool ? (
                        <button onClick={() => setMetric(metric.id, !value)} style={{
                          padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700,
                          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                          border: value ? '1px solid rgba(72,199,142,0.3)' : '1px solid rgba(255,255,255,0.1)',
                          background: value ? 'rgba(72,199,142,0.15)' : 'rgba(255,255,255,0.04)',
                          color: value ? '#48c78e' : '#888',
                        }}>
                          {value ? '✓ Done' : 'Mark Done'}
                        </button>
                      ) : isContactMetric ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {(value || 0) > 0 && (
                            <span style={{ fontSize: 14, fontWeight: 700, color: contactColor, minWidth: 24, textAlign: 'center' }}>{value}</span>
                          )}
                          <button onClick={() => setMetric(metric.id, (value || 0) + 1)}
                            style={{
                              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                              border: `1px solid ${contactColor}40`,
                              background: `${contactColor}10`,
                              color: contactColor,
                            }}>+ Add</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button onClick={() => setMetric(metric.id, Math.max(0, (value || 0) - 1))}
                            style={{ width: 32, height: 32, borderRadius: 6, fontSize: 18, fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                          <input type="number" min="0" value={value || 0}
                            onChange={e => setMetric(metric.id, Math.max(0, parseInt(e.target.value) || 0))}
                            style={{ width: 56, textAlign: 'center', fontSize: 18, fontWeight: 700, padding: '6px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                          <button onClick={() => setMetric(metric.id, (value || 0) + 1)}
                            style={{ width: 32, height: 32, borderRadius: 6, fontSize: 18, fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#666', padding: '4px 16px 0', fontStyle: 'italic' }}>
                      {metric.tip}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Week 1 minimums note */}
            <div style={{
              marginTop: 16, padding: '10px 14px', borderRadius: 8,
              background: 'rgba(240,165,0,0.04)', border: '1px solid rgba(240,165,0,0.12)',
              fontSize: 12, color: '#888', lineHeight: 1.6,
            }}>
              These are Week 1 minimums. Requirements increase each week as you build momentum.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={() => setCurrentGuide(1)} style={{ padding: '14px 20px' }}>Back</button>
            <button className="btn-primary" onClick={() => setCurrentGuide(3)} style={{ flex: 1, padding: '14px 24px' }}>
              Next — Submit
            </button>
          </div>
        </div>
      )}

      {/* GUIDE STEP 4: SUBMIT */}
      {currentGuide === 3 && (
        <div className="scale-in">
          <Tooltip text="Once you've met all daily minimums, hit Submit to lock in your progress. You must submit before the deadline each day." />
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(233,69,96,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📤</div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Daily Check-In</h3>
            </div>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>
              Summarize your day or add any additional notes.
            </p>
            <textarea value={proofText} onChange={e => setProofText(e.target.value)}
              placeholder="Describe your day's work, paste links, or summarize results..."
              style={{ marginBottom: 16, width: '100%', fontSize: 14, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#eee', resize: 'vertical', minHeight: 80 }} />
          </div>

          {/* CRM pointer */}
          <div style={{
            padding: '14px 18px', borderRadius: 10, marginBottom: 24,
            background: 'rgba(72,199,142,0.04)', border: '1px solid rgba(72,199,142,0.12)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 20 }}>📇</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#48c78e', marginBottom: 2 }}>Your CRM</div>
              <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>
                Every contact you add as a Deal Source shows up in your CRM tab. Use it to track who you've talked to and when.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={() => setCurrentGuide(2)} style={{ padding: '14px 20px' }}>Back</button>
            <button onClick={handlePracticeSubmit} style={{
              flex: 1, padding: '14px 24px', borderRadius: 10, fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              background: 'transparent', color: '#f0a500',
              border: '2px solid rgba(240,165,0,0.4)',
              transition: 'all 0.15s',
            }}>
              Practice Submit
            </button>
          </div>
        </div>
      )}

      {/* Pre-Day 1 Resources (always visible below guide) */}
      <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Pre-Day 1 Resources</h3>

        {videoUrl && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>How to Analyze a Rental Property</div>
            <div style={{ aspectRatio: '16/9', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
              <iframe src={videoUrl} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
            </div>
          </div>
        )}

        {calculatorUrl && (
          <a href={calculatorUrl} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px 20px', borderRadius: 12, marginBottom: 16,
            background: 'linear-gradient(135deg, rgba(83,52,131,0.08), rgba(83,52,131,0.03))',
            border: '1px solid rgba(83,52,131,0.2)', textDecoration: 'none',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: 'rgba(83,52,131,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>📊</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#c9a0ff', marginBottom: 2 }}>
                Download the CDS Rental Calculator
              </div>
              <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>
                Get familiar with the calculator before Day 1. You'll use it to analyze every property during your sprint.
              </div>
            </div>
          </a>
        )}

        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7, margin: 0 }}>
          Before your sprint begins, we recommend watching the video above and running 2-3 practice analyses in the calculator. The more comfortable you are with the tool, the faster you'll move on Day 1.
        </p>
      </div>
    </div>
  );
}

function DataRow({ label, value, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 14px',
      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.04)',
    }}>
      <span style={{ fontSize: 13, color: '#999' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#eee', fontFamily: "'DM Mono', monospace" }}>{value}</span>
    </div>
  );
}

function Tooltip({ text }) {
  return (
    <div style={{
      padding: '12px 16px', borderRadius: 10, marginBottom: 16,
      background: 'rgba(83,52,131,0.08)', border: '1px solid rgba(83,52,131,0.2)',
      display: 'flex', alignItems: 'flex-start', gap: 10,
    }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>💡</span>
      <p style={{ fontSize: 13, color: '#c9a0ff', lineHeight: 1.6, margin: 0 }}>
        {text}
      </p>
    </div>
  );
}
