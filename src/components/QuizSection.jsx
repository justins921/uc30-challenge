import { useState, useEffect, useMemo } from 'react';

function checkAnswer(input, userValue) {
  if (input.type === 'number') {
    const num = parseFloat(userValue);
    if (isNaN(num)) return false;
    return Math.abs(num - input.correctAnswer) <= (input.tolerance || 0);
  }
  return (userValue || '').trim().toLowerCase() === String(input.correctAnswer).trim().toLowerCase();
}

export default function QuizSection({ quiz, participantId, dayNumber, existingAttempts, onAttempt, onQuizComplete }) {
  const scenarios = quiz?.scenarios || [];

  const scenarioStatus = useMemo(() => {
    const status = {};
    for (const scenario of scenarios) {
      const attempts = (existingAttempts || []).filter(a => a.scenario_id === scenario.id);
      const passed = attempts.some(a => a.correct);
      const exhausted = !passed && attempts.length >= (scenario.maxAttempts || 3);
      status[scenario.id] = { passed, exhausted, attemptCount: attempts.length };
    }
    return status;
  }, [scenarios, existingAttempts]);

  const firstIncomplete = scenarios.findIndex(s => {
    const st = scenarioStatus[s.id];
    return !st?.passed && !st?.exhausted;
  });

  const allDone = scenarios.every(s => {
    const st = scenarioStatus[s.id];
    return st?.passed || st?.exhausted;
  });

  const [activeIndex, setActiveIndex] = useState(() => {
    if (allDone) return scenarios.length - 1;
    return firstIncomplete >= 0 ? firstIncomplete : 0;
  });

  useEffect(() => {
    if (allDone) onQuizComplete();
  }, [allDone]);

  const handleScenarioComplete = () => {
    if (activeIndex < scenarios.length - 1) {
      setActiveIndex(activeIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onQuizComplete();
    }
  };

  if (scenarios.length === 0) return null;

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: 'rgba(240,165,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
        }}>📝</div>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Check for Understanding</h3>
        <span style={{ fontSize: 12, color: '#888', marginLeft: 'auto' }}>
          Scenario {activeIndex + 1} of {scenarios.length}
        </span>
      </div>

      <ScenarioView
        key={scenarios[activeIndex].id}
        scenario={scenarios[activeIndex]}
        status={scenarioStatus[scenarios[activeIndex].id]}
        participantId={participantId}
        dayNumber={dayNumber}
        onAttempt={onAttempt}
        onComplete={handleScenarioComplete}
        existingAttempts={(existingAttempts || []).filter(a => a.scenario_id === scenarios[activeIndex].id)}
      />

      {scenarios.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
          {scenarios.map((s, i) => {
            const st = scenarioStatus[s.id];
            const isCurrent = i === activeIndex;
            return (
              <div key={s.id} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: st?.passed
                  ? '#48c78e'
                  : st?.exhausted
                    ? 'rgba(233,69,96,0.4)'
                    : isCurrent
                      ? 'rgba(240,165,0,0.5)'
                      : 'rgba(255,255,255,0.08)',
                transition: 'background 0.3s',
              }} />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ScenarioView({ scenario, status, participantId, dayNumber, onAttempt, onComplete, existingAttempts }) {
  const maxAttempts = scenario.maxAttempts || 3;
  const [attemptCount, setAttemptCount] = useState(status?.attemptCount || 0);
  const [answers, setAnswers] = useState(() => {
    const initial = {};
    scenario.inputs.forEach(input => { initial[input.id] = ''; });
    return initial;
  });
  const [results, setResults] = useState(null);
  const [passed, setPassed] = useState(status?.passed || false);
  const [exhausted, setExhausted] = useState(status?.exhausted || false);
  const [saving, setSaving] = useState(false);

  const setAnswer = (inputId, value) => {
    setAnswers(prev => ({ ...prev, [inputId]: value }));
  };

  const handleCheck = async () => {
    setSaving(true);
    const inputResults = {};
    let allCorrect = true;

    scenario.inputs.forEach(input => {
      const correct = checkAnswer(input, answers[input.id]);
      inputResults[input.id] = correct;
      if (!correct) allCorrect = false;
    });

    setResults(inputResults);
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);

    const attemptRecord = {
      id: `qa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      participantId,
      dayNumber,
      scenarioId: scenario.id,
      attemptNumber: newAttemptCount,
      answers: { ...answers },
      correct: allCorrect,
    };

    await onAttempt(attemptRecord);
    setSaving(false);

    if (allCorrect) {
      setPassed(true);
    } else if (newAttemptCount >= maxAttempts) {
      setExhausted(true);
    } else {
      setTimeout(() => {
        const cleared = { ...answers };
        scenario.inputs.forEach(input => {
          if (!inputResults[input.id]) cleared[input.id] = '';
        });
        setAnswers(cleared);
        setResults(null);
      }, 2000);
    }
  };

  if (passed) {
    return (
      <div>
        <div style={{
          padding: '24px 20px', borderRadius: 12, textAlign: 'center',
          background: 'rgba(72,199,142,0.06)', border: '1px solid rgba(72,199,142,0.2)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#48c78e', marginBottom: 4 }}>
            Correct!
          </div>
          <div style={{ fontSize: 13, color: '#888' }}>
            {scenario.title} — passed
          </div>
        </div>

        {scenario.showExplanationOnPass && (scenario.explanationOnFail || scenario.explanationImage || scenario.cheatSheets) && (
          <div style={{ marginTop: 16 }}>
            {scenario.cheatSheets && scenario.cheatSheets.map((sheet, si) => (
              <CheatSheet key={si} sheet={sheet} />
            ))}
            {scenario.explanationOnFail && !scenario.cheatSheets && (
              <p style={{ fontSize: 14, color: '#bbb', lineHeight: 1.7, marginTop: 8 }}>
                {scenario.explanationOnFail}
              </p>
            )}
            {scenario.explanationImage && (
              <img src={scenario.explanationImage} alt="Reference"
                style={{ display: 'block', width: '100%', borderRadius: 8, marginTop: 12, border: '1px solid rgba(255,255,255,0.08)' }} />
            )}
          </div>
        )}

        <button className="btn-primary" onClick={onComplete} style={{ width: '100%', marginTop: 16 }}>
          Continue
        </button>
      </div>
    );
  }

  if (exhausted) {
    return (
      <div>
        <div style={{
          padding: '20px', borderRadius: 12,
          background: 'rgba(233,69,96,0.04)', border: '1px solid rgba(233,69,96,0.12)',
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#e94560', marginBottom: 12 }}>
            Here's how to get it right:
          </div>

          {scenario.inputs.map(input => (
            <div key={input.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <span style={{ fontSize: 13, color: '#aaa' }}>{input.label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#48c78e' }}>
                {input.unit === '$' && '$'}{input.correctAnswer}{input.unit === '%' && '%'}
              </span>
            </div>
          ))}

          {scenario.cheatSheets && scenario.cheatSheets.map((sheet, si) => (
            <CheatSheet key={si} sheet={sheet} style={{ marginTop: 12 }} />
          ))}

          {scenario.explanationOnFail && !scenario.cheatSheets && (
            <p style={{ fontSize: 14, color: '#bbb', lineHeight: 1.7, marginTop: 14, marginBottom: 0 }}>
              {scenario.explanationOnFail}
            </p>
          )}

          {scenario.explanationImage && (
            <img
              src={scenario.explanationImage}
              alt="Explanation"
              style={{
                display: 'block', width: '100%', borderRadius: 8, marginTop: 12,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          )}
        </div>

        <button className="btn-primary" onClick={onComplete} style={{ width: '100%' }}>
          Continue
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
          {scenario.title}
        </h4>
        <p style={{ fontSize: 14, color: '#bbb', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
          {scenario.description}
        </p>
      </div>

      {scenario.image && (
        <img
          src={scenario.image}
          alt={scenario.title}
          style={{
            display: 'block', width: '100%', borderRadius: 10, marginBottom: 16,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
        {scenario.inputs.map(input => {
          const isCorrect = results?.[input.id] === true;
          const isWrong = results?.[input.id] === false;
          return (
            <div key={input.id}>
              <label style={{ fontSize: 13, color: '#aaa', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                {input.label}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {input.unit === '$' && (
                  <span style={{ fontSize: 16, color: '#666', fontWeight: 600 }}>$</span>
                )}
                <input
                  type={input.type === 'number' ? 'text' : 'text'}
                  inputMode={input.type === 'number' ? 'decimal' : 'text'}
                  value={answers[input.id]}
                  onChange={e => setAnswer(input.id, e.target.value)}
                  disabled={isCorrect}
                  style={{
                    flex: 1, fontSize: 16, padding: '12px 14px', borderRadius: 8,
                    background: isCorrect
                      ? 'rgba(72,199,142,0.06)'
                      : isWrong
                        ? 'rgba(233,69,96,0.06)'
                        : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${
                      isCorrect ? 'rgba(72,199,142,0.3)'
                        : isWrong ? 'rgba(233,69,96,0.3)'
                          : 'rgba(255,255,255,0.1)'
                    }`,
                    color: '#eee', fontFamily: "'DM Sans', sans-serif",
                  }}
                  placeholder={input.type === 'number' ? '0' : ''}
                />
                {input.unit === '%' && (
                  <span style={{ fontSize: 16, color: '#666', fontWeight: 600 }}>%</span>
                )}
                {isCorrect && <span style={{ color: '#48c78e', fontWeight: 700 }}>✓</span>}
                {isWrong && <span style={{ color: '#e94560', fontWeight: 700 }}>✗</span>}
              </div>
            </div>
          );
        })}
      </div>

      {attemptCount > 0 && !results && (
        <p style={{ fontSize: 12, color: '#f0a500', marginBottom: 12 }}>
          Attempt {attemptCount + 1} of {maxAttempts}
        </p>
      )}
      {results && !passed && !exhausted && (
        <p style={{ fontSize: 12, color: '#e94560', marginBottom: 12 }}>
          {Object.values(results).filter(r => !r).length} incorrect — try again (Attempt {attemptCount} of {maxAttempts})
        </p>
      )}

      <button
        className="btn-primary"
        onClick={handleCheck}
        disabled={saving || scenario.inputs.some(i => !answers[i.id]?.trim())}
        style={{
          width: '100%',
          opacity: scenario.inputs.some(i => !answers[i.id]?.trim()) ? 0.4 : 1,
        }}
      >
        {saving ? 'Checking...' : 'Check Answer'}
      </button>
    </div>
  );
}

function CheatSheet({ sheet, style }) {
  const borderColor = sheet.color === 'green' ? 'rgba(72,199,142,0.2)' : 'rgba(83,52,131,0.25)';
  const headerColor = sheet.color === 'green' ? '#48c78e' : '#c9a0ff';
  const headerBg = sheet.color === 'green' ? 'rgba(72,199,142,0.15)' : 'rgba(83,52,131,0.15)';
  const icon = sheet.color === 'green' ? '📈' : '📋';

  return (
    <div style={{
      borderRadius: 10, overflow: 'hidden', marginTop: 12,
      border: `1px solid ${borderColor}`, ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: headerBg }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: headerColor }}>{sheet.title}</span>
      </div>
      {sheet.rows.map((row, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '7px 14px',
          background: row.highlight ? 'rgba(72,199,142,0.04)' : i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
          borderBottom: i < sheet.rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
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
  );
}
