import { useState, useEffect, useMemo, useRef } from 'react';

function checkAnswer(input, userValue) {
  if (input.type === 'multiple_choice') {
    return parseInt(userValue) === input.correctAnswer;
  }
  if (input.type === 'number') {
    const num = parseFloat(userValue);
    if (isNaN(num)) return false;
    return Math.abs(num - input.correctAnswer) <= (input.tolerance || 0);
  }
  return (userValue || '').trim().toLowerCase() === String(input.correctAnswer).trim().toLowerCase();
}

export default function QuizSection({ quiz, participantId, dayNumber, existingAttempts, onAttempt, onQuizComplete }) {
  const containerRef = useRef(null);
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
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else {
      onQuizComplete();
    }
  };

  if (scenarios.length === 0) return null;

  return (
    <div ref={containerRef} className="card" style={{ marginBottom: 24 }}>
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
  const inputs = useMemo(() => {
    if (scenario.inputs) return scenario.inputs;
    if (scenario.questions) {
      return scenario.questions.map(q => ({
        id: q.id,
        label: q.text,
        type: q.type || 'multiple_choice',
        options: q.options,
        correctAnswer: q.correctAnswer,
        tolerance: q.tolerance,
        unit: q.unit,
        explanation: q.explanationOnFail || q.explanation,
      }));
    }
    if (scenario.options) {
      return [{
        id: scenario.id,
        label: scenario.question,
        type: 'multiple_choice',
        options: scenario.options.map(o => o.text),
        correctAnswer: scenario.options.findIndex(o => o.id === scenario.correctId),
        explanation: scenario.explanation,
      }];
    }
    return [];
  }, [scenario]);

  const maxAttempts = scenario.maxAttempts || 3;
  const [attemptCount, setAttemptCount] = useState(status?.attemptCount || 0);
  const [answers, setAnswers] = useState(() => {
    const initial = {};
    inputs.forEach(input => { initial[input.id] = ''; });
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

    inputs.forEach(input => {
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
        inputs.forEach(input => {
          if (!inputResults[input.id]) cleared[input.id] = '';
        });
        setAnswers(cleared);
        setResults(null);
      }, 2000);
    }
  };

  const allAnswered = inputs.every(i =>
    i.type === 'multiple_choice' ? answers[i.id] !== '' : answers[i.id]?.trim()
  );

  // ── Passed state ──
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
              <p style={{ fontSize: 14, color: '#bbb', lineHeight: 1.7, marginTop: 8, whiteSpace: 'pre-line' }}>
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

  // ── Exhausted state ──
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

          {inputs.map(input => (
            <div key={input.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <span style={{ fontSize: 13, color: '#aaa' }}>{input.label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#48c78e' }}>
                {input.type === 'multiple_choice'
                  ? input.options[input.correctAnswer]
                  : input.rangeLabel || `${input.unit === '$' ? '$' : ''}${input.correctAnswer}${input.unit === '%' ? '%' : ''}`
                }
              </span>
            </div>
          ))}

          {scenario.cheatSheets && scenario.cheatSheets.map((sheet, si) => (
            <CheatSheet key={si} sheet={sheet} style={{ marginTop: 12 }} />
          ))}

          {scenario.explanationOnFail && !scenario.cheatSheets && (
            <p style={{ fontSize: 14, color: '#bbb', lineHeight: 1.7, marginTop: 14, marginBottom: 0, whiteSpace: 'pre-line' }}>
              {scenario.explanationOnFail}
            </p>
          )}

          {scenario.explanationImage && (
            <img src={scenario.explanationImage} alt="Explanation"
              style={{ display: 'block', width: '100%', borderRadius: 8, marginTop: 12, border: '1px solid rgba(255,255,255,0.08)' }} />
          )}
        </div>

        <button className="btn-primary" onClick={onComplete} style={{ width: '100%' }}>
          Continue
        </button>
      </div>
    );
  }

  // ── Active state ──
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

      {scenario.propertyListing && (
        <PropertyListingCard listing={scenario.propertyListing} />
      )}

      {scenario.contentSections && (
        <ContentSections sections={scenario.contentSections} />
      )}

      {scenario.image && !scenario.propertyListing && (
        <img src={scenario.image} alt={scenario.title}
          style={{ display: 'block', width: '100%', borderRadius: 10, marginBottom: 16, border: '1px solid rgba(255,255,255,0.08)' }} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
        {inputs.map(input => {
          const isCorrect = results?.[input.id] === true;
          const isWrong = results?.[input.id] === false;

          if (input.type === 'multiple_choice') {
            return (
              <MultipleChoiceInput
                key={input.id}
                input={input}
                selected={answers[input.id]}
                onSelect={(idx) => setAnswer(input.id, String(idx))}
                isCorrect={isCorrect}
                isWrong={isWrong}
                submitted={!!results}
              />
            );
          }

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
                  type="text"
                  inputMode={input.type === 'number' ? 'decimal' : 'text'}
                  value={answers[input.id]}
                  onChange={e => setAnswer(input.id, e.target.value)}
                  disabled={isCorrect}
                  style={{
                    flex: 1, fontSize: 16, padding: '12px 14px', borderRadius: 8,
                    background: isCorrect ? 'rgba(72,199,142,0.06)' : isWrong ? 'rgba(233,69,96,0.06)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isCorrect ? 'rgba(72,199,142,0.3)' : isWrong ? 'rgba(233,69,96,0.3)' : 'rgba(255,255,255,0.1)'}`,
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
      {results && !passed && !exhausted && Object.values(results).some(r => !r) && (
        <p style={{ fontSize: 12, color: '#e94560', marginBottom: 12 }}>
          {Object.values(results).filter(r => !r).length} incorrect — try again (Attempt {attemptCount} of {maxAttempts})
        </p>
      )}

      <button
        className="btn-primary"
        onClick={handleCheck}
        disabled={saving || !allAnswered}
        style={{ width: '100%', opacity: allAnswered ? 1 : 0.4 }}
      >
        {saving ? 'Checking...' : 'Check Answer'}
      </button>
    </div>
  );
}

// ── Multiple Choice Input ──

function MultipleChoiceInput({ input, selected, onSelect, isCorrect, isWrong, submitted }) {
  return (
    <div>
      <label style={{ fontSize: 13, color: '#aaa', fontWeight: 600, display: 'block', marginBottom: 8, whiteSpace: 'pre-line' }}>
        {input.label}
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {input.options.map((opt, oi) => {
          const isSelected = String(oi) === selected;
          const showCorrect = submitted && oi === input.correctAnswer;
          const showWrong = submitted && isSelected && oi !== input.correctAnswer;
          return (
            <button
              key={oi}
              onClick={() => { if (!submitted) onSelect(oi); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 8, cursor: submitted ? 'default' : 'pointer',
                fontSize: 14, textAlign: 'left', fontFamily: "'DM Sans', sans-serif",
                background: showCorrect ? 'rgba(72,199,142,0.1)' : showWrong ? 'rgba(233,69,96,0.08)' : isSelected ? 'rgba(240,165,0,0.1)' : 'rgba(255,255,255,0.03)',
                border: showCorrect ? '1px solid rgba(72,199,142,0.4)' : showWrong ? '1px solid rgba(233,69,96,0.3)' : isSelected ? '1px solid rgba(240,165,0,0.4)' : '1px solid rgba(255,255,255,0.08)',
                color: showCorrect ? '#48c78e' : showWrong ? '#e94560' : isSelected ? '#f0a500' : '#bbb',
                transition: 'all 0.15s',
              }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                background: showCorrect ? 'rgba(72,199,142,0.2)' : showWrong ? 'rgba(233,69,96,0.15)' : isSelected ? 'rgba(240,165,0,0.2)' : 'rgba(255,255,255,0.06)',
                color: showCorrect ? '#48c78e' : showWrong ? '#e94560' : isSelected ? '#f0a500' : '#666',
              }}>
                {showCorrect ? '✓' : showWrong ? '✗' : String.fromCharCode(65 + oi)}
              </span>
              <span style={{ fontWeight: isSelected || showCorrect ? 600 : 400 }}>{opt}</span>
            </button>
          );
        })}
      </div>
      {submitted && input.explanation && (
        <div style={{
          marginTop: 8, padding: '10px 14px', borderRadius: 8,
          background: 'rgba(72,199,142,0.04)', borderLeft: '3px solid rgba(72,199,142,0.3)',
        }}>
          <div style={{ fontSize: 12, color: '#48c78e', fontWeight: 700, marginBottom: 4 }}>Why?</div>
          <div style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>{input.explanation}</div>
        </div>
      )}
    </div>
  );
}

// ── Content Sections (case study data) ──

function ContentSections({ sections }) {
  return (
    <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {sections.map((section, si) => (
        <div key={si}>
          {section.heading && (
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ddd', marginBottom: 8 }}>
              {section.heading}
            </div>
          )}

          {section.type === 'table' && (
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{
                display: 'grid', gridTemplateColumns: section.columns.map(() => '1fr').join(' '),
                background: 'rgba(255,255,255,0.06)', padding: '8px 12px', gap: 8,
              }}>
                {section.columns.map((col, ci) => (
                  <div key={ci} style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase' }}>{col}</div>
                ))}
              </div>
              {section.rows.map((row, ri) => (
                <div key={ri} style={{
                  display: 'grid', gridTemplateColumns: section.columns.map(() => '1fr').join(' '),
                  padding: '8px 12px', gap: 8,
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  background: ri % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                }}>
                  {row.map((cell, ci) => (
                    <div key={ci} style={{ fontSize: 13, color: ci === 0 ? '#ddd' : '#bbb' }}>{cell}</div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {section.type === 'quotes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {section.items.map((item, qi) => (
                <div key={qi} style={{
                  padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid rgba(83,52,131,0.4)',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#c9a0ff', marginBottom: 4 }}>{item.source}</div>
                  <div style={{ fontSize: 13, color: '#bbb', lineHeight: 1.6, fontStyle: 'italic' }}>{item.text}</div>
                </div>
              ))}
            </div>
          )}

          {section.type === 'bullets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {section.items.map((item, bi) => (
                <div key={bi} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#bbb', lineHeight: 1.6 }}>
                  <span style={{ color: '#666', flexShrink: 0 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}

          {section.type === 'text' && (
            <p style={{ fontSize: 13, color: '#bbb', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
              {section.content}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Property Listing Card ──

function PropertyListingCard({ listing }) {
  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden', marginBottom: 20,
      border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)',
    }}>
      <div style={{
        padding: '20px 18px 16px',
        background: 'linear-gradient(135deg, rgba(83,52,131,0.15) 0%, rgba(233,69,96,0.08) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#c9a0ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              Practice Property
            </div>
            <h4 style={{ fontSize: 17, fontWeight: 700, color: '#eee', margin: '0 0 8px' }}>{listing.title}</h4>
            {listing.badges && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {listing.badges.map((b, i) => (
                  <span key={i} style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                    background: 'rgba(255,255,255,0.06)', color: '#aaa', border: '1px solid rgba(255,255,255,0.08)',
                  }}>{b}</span>
                ))}
              </div>
            )}
          </div>
          {listing.price && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#48c78e' }}>{listing.price}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Asking Price</div>
            </div>
          )}
        </div>
      </div>

      {listing.highlights && (
        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(${listing.highlights.length}, 1fr)`,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {listing.highlights.map((h, i) => (
            <div key={i} style={{
              padding: '12px 14px', textAlign: 'center',
              borderRight: i < listing.highlights.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{h.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#eee' }}>{h.value}</div>
              <div style={{ fontSize: 10, color: '#888', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h.label}</div>
            </div>
          ))}
        </div>
      )}

      {listing.sections && listing.sections.map((section, si) => (
        <div key={si}>
          <div style={{
            padding: '8px 14px',
            background: si === 0 ? 'rgba(83,52,131,0.08)' : si === 1 ? 'rgba(72,199,142,0.06)' : 'rgba(233,69,96,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            borderTop: si > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
              color: si === 0 ? '#c9a0ff' : si === 1 ? '#48c78e' : '#e94560',
            }}>{section.heading}</div>
          </div>
          {section.rows.map((row, ri) => (
            <div key={ri} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 14px',
              borderBottom: ri < section.rows.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
            }}>
              <span style={{ fontSize: 13, color: '#999' }}>{row.label}</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#eee' }}>{row.value}</span>
                {row.detail && <div style={{ fontSize: 11, color: '#666', marginTop: 1 }}>{row.detail}</div>}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Cheat Sheet ──

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
