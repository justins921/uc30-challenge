import { useState, useEffect, useCallback, useMemo } from 'react';
import QuizSection from './QuizSection';
import NativeRentalCalculator from './NativeRentalCalculator';
import { GetClearStep, BuyBoxStep, CapitalConfirmationStep } from './ActivationPhase';
import ContactsCRM from './ContactsCRM';
import ConfidenceSurvey from './ConfidenceSurvey';
import ReflectionDay from './ReflectionDay';

const MODULE_DAY_OFFSET = -100;

function renderInline(text) {
  if (!text) return [text];
  const parts = [];
  let key = 0;
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let match;
  let lastIndex = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      parts.push(<strong key={key++}>{match[1]}</strong>);
    } else {
      parts.push(<em key={key++}>{match[2]}</em>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

function renderMarkdown(text) {
  if (!text) return text;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const isLast = i === lines.length - 1;
    if (line.startsWith('- ')) {
      return (
        <div key={i} style={{ display: 'flex', gap: 8, marginLeft: 8, marginBottom: 2 }}>
          <span style={{ color: '#e94560', flexShrink: 0 }}>&bull;</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      );
    }
    if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)[1];
      return (
        <div key={i} style={{ display: 'flex', gap: 8, marginLeft: 8, marginBottom: 2 }}>
          <span style={{ color: '#e94560', flexShrink: 0, fontWeight: 600, minWidth: 16 }}>{num}.</span>
          <span>{renderInline(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
    }
    return <span key={i}>{renderInline(line)}{!isLast ? <br /> : null}</span>;
  });
}

export default function TrainingPhase({
  user,
  modules,
  onCompleteModule,
  onCompleteAll,
  addQuizAttempt,
  getQuizAttempts,
  onSaveExit,
  getContacts,
  getFollowUpsByContact,
  onUpdateContact,
  onAddContact,
  onAddFollowUp,
  onSaveConfidenceSurvey,
}) {
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [activePrincipleIndex, setActivePrincipleIndex] = useState(null);
  const [showKeyTerms, setShowKeyTerms] = useState(false);
  const [showTermsPanel, setShowTermsPanel] = useState(false);
  const [moduleAttempts, setModuleAttempts] = useState([]);
  const [calcOpen, setCalcOpen] = useState(false);
  const [componentOpen, setComponentOpen] = useState(false);
  const [showCRM, setShowCRM] = useState(false);
  const [surveysSaving, setSurveysSaving] = useState(false);

  const completed = user.trainingCompletedModules || [];
  const visibleModules = modules.filter(m => !m.hidden && !m.comingSoon);
  const allModules = modules.filter(m => !m.hidden);
  const allComplete = visibleModules.length > 0 && visibleModules.every(m => completed.includes(m.id));

  const activeModule = allModules.find(m => m.id === activeModuleId);
  const activeModuleIndex = allModules.findIndex(m => m.id === activeModuleId);
  const dayNumber = activeModule ? MODULE_DAY_OFFSET - allModules.indexOf(activeModule) : 0;

  const isModuleUnlocked = (moduleId) => {
    if (user?.isAdmin) return true;
    if (completed.includes(moduleId)) return true;
    const idx = visibleModules.findIndex(m => m.id === moduleId);
    if (idx === 0) return true;
    return completed.includes(visibleModules[idx - 1]?.id);
  };

  useEffect(() => {
    if (!activeModule || !getQuizAttempts || !user?.id) return;
    Promise.resolve(getQuizAttempts(user.id, dayNumber)).then(a => {
      setModuleAttempts(a || []);
    });
  }, [activeModuleId, user?.id]);

  const handleQuizAttempt = useCallback(async (attempt) => {
    const result = await addQuizAttempt({ ...attempt, dayNumber });
    if (result) setModuleAttempts(prev => [...prev, result]);
    return result;
  }, [addQuizAttempt, dayNumber]);

  const isPrincipleComplete = useCallback((principle) => {
    const isScenarioDone = (scenarioId, maxAttempts) => {
      const attempts = moduleAttempts.filter(a => a.scenario_id === scenarioId);
      return attempts.some(a => a.correct) || attempts.length >= (maxAttempts || 5);
    };
    if (principle?.scenarios?.length) {
      return principle.scenarios.every(s => isScenarioDone(s.id, s.maxAttempts));
    }
    if (!principle?.questions?.length) return true;
    return isScenarioDone(principle.id, 5);
  }, [moduleAttempts]);

  const isPrincipleUnlocked = useCallback((principleIndex) => {
    if (user?.isAdmin) return true;
    if (activeModule && completed.includes(activeModule.id)) return true;
    if (!activeModule?.principles) return false;
    if (principleIndex === 0) return true;
    const prev = activeModule.principles[principleIndex - 1];
    return isPrincipleComplete(prev);
  }, [activeModule, isPrincipleComplete, user?.isAdmin, completed]);

  const allPrinciplesDone = useMemo(() => {
    if (!activeModule?.principles?.length) return false;
    return activeModule.principles.every(p => isPrincipleComplete(p));
  }, [activeModule, isPrincipleComplete]);

  const handlePrincipleQuizComplete = useCallback(() => {
    // Quiz passed — component will re-render and show Next button
  }, []);

  const handleCompleteModule = () => {
    if (activeModule && !completed.includes(activeModule.id)) {
      onCompleteModule(activeModule.id);
    }
  };

  const openModule = (moduleId) => {
    setActiveModuleId(moduleId);
    setActivePrincipleIndex(0);
    setShowKeyTerms(false);
  };

  const backToModuleList = () => {
    setActiveModuleId(null);
    setActivePrincipleIndex(null);
    setShowKeyTerms(false);
    window.scrollTo(0, 0);
  };

  const goToPrinciple = (idx) => {
    setActivePrincipleIndex(idx);
    setShowKeyTerms(false);
    setShowTermsPanel(false);
    setCalcOpen(false);
    setComponentOpen(false);
    window.scrollTo(0, 0);
  };

  const goToKeyTerms = () => {
    setShowKeyTerms(true);
    setActivePrincipleIndex(null);
    window.scrollTo(0, 0);
  };

  // ── Principle View ──
  if (activeModule && activePrincipleIndex !== null && !showKeyTerms) {
    const principles = activeModule.principles || [];
    const principle = principles[activePrincipleIndex];
    if (!principle) {
      backToModuleList();
      return null;
    }

    const principleComplete = isPrincipleComplete(principle);
    const isLastPrinciple = activePrincipleIndex === principles.length - 1;
    const hasQuestions = (principle.questions?.length > 0) || (principle.scenarios?.length > 0);

    const principleQuiz = hasQuestions ? {
      scenarios: principle.scenarios || [{
        id: principle.id,
        title: 'Quick Check',
        maxAttempts: 5,
        inputs: principle.questions.map(q => ({
          id: q.id,
          label: q.text,
          type: q.type || 'multiple_choice',
          options: q.options,
          correctAnswer: q.correctAnswer,
        })),
      }],
    } : null;

    const scenarioIds = principle.scenarios
      ? principle.scenarios.map(s => s.id)
      : [principle.id];
    const principleAttempts = moduleAttempts.filter(a => scenarioIds.includes(a.scenario_id));

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          position: 'sticky', top: 32, zIndex: 50,
          background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)',
          padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <button onClick={backToModuleList} style={{
                background: 'none', border: 'none', color: '#e94560', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, padding: 0, fontFamily: "'DM Sans', sans-serif",
              }}>
                &larr; All Modules
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {activeModule.keyTerms?.length > 0 && (
                  <button onClick={() => setShowTermsPanel(p => !p)} style={{
                    background: showTermsPanel ? 'rgba(240,165,0,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${showTermsPanel ? 'rgba(240,165,0,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    color: showTermsPanel ? '#f0a500' : '#888', cursor: 'pointer',
                    fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    Key Terms
                  </button>
                )}
                <span style={{ fontSize: 11, color: '#666', fontWeight: 600, letterSpacing: 1 }}>
                  {activePrincipleIndex + 1} / {principles.length}
                </span>
              </div>
            </div>
            <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: 'linear-gradient(90deg, #e94560, #c81d4e)',
                width: `${((activePrincipleIndex + 1) / principles.length) * 100}%`,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>

        </div>

        {showTermsPanel && activeModule.keyTerms?.length > 0 && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 250,
            background: 'rgba(5,5,10,0.97)', backdropFilter: 'blur(12px)',
            overflowY: 'auto', padding: '24px 20px',
          }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#f0a500', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                    Reference
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Key Terms</h2>
                </div>
                <button onClick={() => setShowTermsPanel(false)} style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#eee', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  padding: '8px 20px', borderRadius: 8, fontFamily: "'DM Sans', sans-serif",
                }}>
                  Close
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeModule.keyTerms.map((kt, i) => (
                  <div key={i} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f0a500', marginBottom: 4 }}>{kt.term}</div>
                    <div style={{ fontSize: 14, color: '#bbb', lineHeight: 1.7 }}>{kt.definition}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ flex: 1, maxWidth: 720, margin: '0 auto', padding: '24px 20px', width: '100%' }}>
          <div style={{ marginBottom: 6, fontSize: 11, color: '#e94560', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
            Principle {activePrincipleIndex + 1}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, lineHeight: 1.3 }}>{principle.title}</h2>

          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ color: '#ccc', lineHeight: 1.8, fontSize: 15 }}>
              {renderMarkdown(principle.content)}
            </div>
          </div>

          {principle.showCalculator && (
            <div style={{
              marginBottom: 24, borderRadius: 12, overflow: 'hidden',
              border: `1px solid ${calcOpen ? 'rgba(233,69,96,0.25)' : 'rgba(255,255,255,0.08)'}`,
              background: calcOpen ? 'rgba(233,69,96,0.02)' : 'rgba(255,255,255,0.02)',
            }}>
              <button
                onClick={() => setCalcOpen(!calcOpen)}
                style={{
                  width: '100%', padding: '14px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: calcOpen ? 'rgba(233,69,96,0.15)' : 'rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>&#128200;</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: calcOpen ? '#e94560' : '#ccc' }}>
                      CDS Rental Calculator
                    </div>
                    <div style={{ fontSize: 11, color: '#666' }}>
                      {calcOpen ? 'Tap to collapse' : 'Tap to open the calculator'}
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: 12, color: '#888', transition: 'transform 0.2s',
                  transform: calcOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>&#9660;</span>
              </button>
              {calcOpen && (
                <div style={{ padding: '0 16px 16px' }}>
                  <NativeRentalCalculator />
                </div>
              )}
            </div>
          )}

          {principle.showComponent && (() => {
            const COMPONENT_MAP = {
              capitalConfirmation: { Component: CapitalConfirmationStep, label: 'Confirm Access to Capital', icon: '💰', color: '#48c78e', props: { existingCapital: user.capitalConfirmation || {} } },
              getClear: { Component: GetClearStep, label: 'Get Clear', icon: '🎯', color: '#e94560', props: { existing: user.getClear || {}, buyBoxData: user.buyBox || null } },
              buyBox: { Component: BuyBoxStep, label: 'Define Your Buy Box', icon: '📦', color: '#c9a0ff', props: { existingBuyBox: user.buyBox || {} } },
            };
            const cfg = COMPONENT_MAP[principle.showComponent];
            if (!cfg) return null;
            const { Component, label, icon, color } = cfg;
            const noop = () => {};
            const noopAsync = async () => {};
            return (
              <div style={{
                marginBottom: 24, borderRadius: 12, overflow: 'hidden',
                border: `1px solid ${componentOpen ? `${color}40` : 'rgba(255,255,255,0.08)'}`,
                background: componentOpen ? `${color}08` : 'rgba(255,255,255,0.02)',
              }}>
                <button
                  onClick={() => setComponentOpen(!componentOpen)}
                  style={{
                    width: '100%', padding: '14px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: componentOpen ? `${color}22` : 'rgba(255,255,255,0.04)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16,
                    }}>{icon}</div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: componentOpen ? color : '#ccc' }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 11, color: '#666' }}>
                        {componentOpen ? 'Tap to collapse' : 'Tap to open'}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 12, color: '#888', transition: 'transform 0.2s',
                    transform: componentOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>&#9660;</span>
                </button>
                {componentOpen && (
                  <div style={{ padding: '0 16px 16px' }}>
                    <Component onNext={noop} onBack={noop} onSave={noopAsync} embedded {...cfg.props} />
                  </div>
                )}
              </div>
            );
          })()}

          {hasQuestions && !principleComplete && (
            <QuizSection
              quiz={principleQuiz}
              participantId={user.id}
              dayNumber={dayNumber}
              existingAttempts={principleAttempts}
              onAttempt={handleQuizAttempt}
              onQuizComplete={handlePrincipleQuizComplete}
            />
          )}

          {hasQuestions && principleComplete && (
            <div style={{
              padding: '16px 20px', borderRadius: 12, marginBottom: 24,
              background: 'rgba(72,199,142,0.08)', border: '1px solid rgba(72,199,142,0.2)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 18, color: '#48c78e' }}>&#10003;</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#48c78e' }}>Principle complete</span>
            </div>
          )}

          {principleComplete && !isLastPrinciple && (
            <button className="btn-primary" style={{ width: '100%', padding: '16px 24px', fontSize: 16 }}
              onClick={() => goToPrinciple(activePrincipleIndex + 1)}>
              Next Principle &rarr;
            </button>
          )}

          {principleComplete && isLastPrinciple && activeModule.keyTerms?.length > 0 && (
            <button className="btn-primary" style={{ width: '100%', padding: '16px 24px', fontSize: 16 }}
              onClick={goToKeyTerms}>
              Continue to Key Terms &rarr;
            </button>
          )}

          {principleComplete && isLastPrinciple && (!activeModule.keyTerms?.length) && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              {activeModule.completionMessage && (
                <p style={{ color: '#888', fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
                  {activeModule.completionMessage}
                </p>
              )}
              <button className="btn-primary" style={{ padding: '16px 40px', fontSize: 16 }}
                onClick={() => { handleCompleteModule(); backToModuleList(); }}>
                Complete Module &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Principle nav dots */}
        <div style={{
          position: 'sticky', bottom: 0, zIndex: 50,
          background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)',
          padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', gap: 4 }}>
            {principles.map((p, i) => {
              const done = isPrincipleComplete(p);
              const unlocked = isPrincipleUnlocked(i);
              const active = i === activePrincipleIndex;
              return (
                <div key={p.id}
                  onClick={() => unlocked ? goToPrinciple(i) : null}
                  style={{
                    flex: 1, height: 4, borderRadius: 2, cursor: unlocked ? 'pointer' : 'default',
                    background: done ? '#48c78e'
                      : active ? '#e94560'
                      : unlocked ? 'rgba(233,69,96,0.3)'
                      : 'rgba(255,255,255,0.06)',
                    transition: 'background 0.3s',
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Key Terms View ──
  if (activeModule && showKeyTerms) {
    const isComplete = completed.includes(activeModule.id);

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          position: 'sticky', top: 32, zIndex: 50,
          background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)',
          padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={backToModuleList} style={{
                background: 'none', border: 'none', color: '#e94560', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, padding: 0, fontFamily: "'DM Sans', sans-serif",
              }}>
                &larr; All Modules
              </button>
              <span style={{ fontSize: 11, color: '#666', fontWeight: 600, letterSpacing: 1 }}>
                Module {activeModule.moduleNumber} &middot; Key Terms
              </span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, maxWidth: 720, margin: '0 auto', padding: '24px 20px', width: '100%' }}>
          <div style={{ marginBottom: 6, fontSize: 11, color: '#f0a500', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
            Reference
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Key Terms</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
            {(activeModule.keyTerms || []).map((kt, i) => (
              <div key={i} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e94560', marginBottom: 6 }}>{kt.term}</div>
                <div style={{ fontSize: 14, color: '#bbb', lineHeight: 1.7 }}>{kt.definition}</div>
              </div>
            ))}
          </div>

          {activeModule.completionMessage && (
            <div className="card" style={{
              marginBottom: 24, padding: '20px 24px', textAlign: 'center',
              background: 'rgba(72,199,142,0.06)', border: '1px solid rgba(72,199,142,0.15)',
            }}>
              <p style={{ color: '#aaa', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                {activeModule.completionMessage}
              </p>
            </div>
          )}

          {!isComplete && allPrinciplesDone && (
            <button className="btn-primary" style={{ width: '100%', padding: '16px 24px', fontSize: 16 }}
              onClick={() => { handleCompleteModule(); backToModuleList(); }}>
              Complete Module &rarr;
            </button>
          )}

          {isComplete && (
            <div style={{
              padding: '20px 24px', borderRadius: 12, textAlign: 'center',
              background: 'rgba(72,199,142,0.08)', border: '1px solid rgba(72,199,142,0.2)',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>&#10003;</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#48c78e', marginBottom: 12 }}>Module Complete</div>
              <button className="btn-secondary" style={{ padding: '12px 28px', fontSize: 14 }}
                onClick={backToModuleList}>
                Back to Modules
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Module List View ──
  const completedCount = visibleModules.filter(m => completed.includes(m.id)).length;
  const progress = visibleModules.length > 0 ? Math.round((completedCount / visibleModules.length) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        position: 'sticky', top: 32, zIndex: 50,
        background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)',
        padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h1 className="mono" style={{ fontSize: 22, fontWeight: 700, color: '#e94560', margin: 0 }}>UC30 Foundations</h1>
            {onSaveExit && (
              <button onClick={onSaveExit} className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}>
                Save & Exit
              </button>
            )}
          </div>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>
            Complete all training modules before starting the 30-day sprint.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: allComplete ? '#48c78e' : 'linear-gradient(90deg, #e94560, #c81d4e)',
                width: `${progress}%`, transition: 'width 0.3s ease',
              }} />
            </div>
            <span style={{ fontSize: 12, color: '#666', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {completedCount} / {visibleModules.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 20px 0', width: '100%' }}>
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 0 }}>
          {[
            { id: 'training', label: 'Training' },
            { id: 'crm', label: 'Contacts' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setShowCRM(t.id === 'crm')}
              style={{
                padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                border: 'none', borderBottom: `2px solid ${(t.id === 'crm') === showCRM ? '#e94560' : 'transparent'}`,
                background: 'transparent',
                color: (t.id === 'crm') === showCRM ? '#e94560' : '#666',
                fontFamily: "'DM Sans', sans-serif", transition: 'color 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {showCRM ? (
        <div style={{ flex: 1, maxWidth: 900, margin: '0 auto', padding: '24px 20px', width: '100%' }}>
          <ContactsCRM
            user={user}
            getContacts={getContacts}
            getFollowUpsByContact={getFollowUpsByContact}
            onUpdateContact={onUpdateContact}
            onAddContact={onAddContact}
            onAddFollowUp={onAddFollowUp}
          />
        </div>
      ) : (
      <div style={{ flex: 1, maxWidth: 720, margin: '0 auto', padding: '24px 20px', width: '100%' }}>
        {allModules.map((mod, idx) => {
          const done = completed.includes(mod.id);
          const unlocked = !mod.comingSoon && isModuleUnlocked(mod.id);
          const isCurrent = !done && unlocked && !mod.comingSoon;
          const principleCount = mod.principles?.length || 0;

          return (
            <div key={mod.id} onClick={() => unlocked && !mod.comingSoon ? openModule(mod.id) : null} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
              borderRadius: 12, marginBottom: 8, cursor: unlocked && !mod.comingSoon ? 'pointer' : 'default',
              background: isCurrent ? 'rgba(233,69,96,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isCurrent ? 'rgba(233,69,96,0.2)' : done ? 'rgba(72,199,142,0.15)' : 'rgba(255,255,255,0.04)'}`,
              opacity: unlocked || done ? 1 : 0.4,
              transition: 'all 0.15s ease',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 700,
                background: done ? 'rgba(72,199,142,0.15)' : isCurrent ? 'rgba(233,69,96,0.12)' : 'rgba(255,255,255,0.04)',
                color: done ? '#48c78e' : isCurrent ? '#e94560' : '#555',
              }}>
                {done ? '✓' : (unlocked && !mod.comingSoon) ? mod.moduleNumber : '🔒'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15, fontWeight: 600, marginBottom: 2,
                  color: done ? '#48c78e' : (unlocked && !mod.comingSoon) ? '#eee' : '#555',
                }}>
                  {mod.title}
                </div>
                <div style={{
                  fontSize: 12, color: done ? 'rgba(72,199,142,0.6)' : unlocked ? '#666' : '#444',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {mod.comingSoon ? 'Coming soon' : mod.description}
                  {principleCount > 0 && (
                    <span style={{ marginLeft: 8, color: '#555' }}>
                      &middot; {principleCount} principles
                    </span>
                  )}
                </div>
              </div>
              {done && <span style={{ fontSize: 11, color: '#48c78e', fontWeight: 600 }}>COMPLETE</span>}
              {isCurrent && <span style={{ fontSize: 11, color: '#e94560', fontWeight: 600 }}>START &rarr;</span>}
              {mod.comingSoon && !done && <span style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>SOON</span>}
            </div>
          );
        })}

        {allComplete && (() => {
          const baselineDone = (user.confidence_surveys || []).some(s => s.checkpoint === 'pre_training');
          return (
            <div style={{ marginTop: 24 }}>
              <div style={{
                padding: '28px 24px', borderRadius: 16, textAlign: 'center',
                background: 'rgba(72,199,142,0.06)', border: '1px solid rgba(72,199,142,0.2)',
                marginBottom: 24,
              }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>&#127942;</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#48c78e', marginBottom: 8 }}>
                  Training Complete!
                </div>
                <p style={{ color: '#888', fontSize: 14, marginBottom: 0, lineHeight: 1.6 }}>
                  You've completed all training modules. Before starting the 30-day sprint, complete the assessments below to establish your baseline.
                </p>
              </div>

              {/* Option A: Confidence Survey (1-10 ratings) */}
              {onSaveConfidenceSurvey && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: '#f0a500', marginBottom: 8,
                    textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>
                    Option A — Confidence Assessment
                  </div>
                  <ConfidenceSurvey
                    checkpoint="pre_training"
                    existingSurveys={user.confidence_surveys || []}
                    saving={surveysSaving}
                    onSave={async (data) => {
                      setSurveysSaving(true);
                      try { await onSaveConfidenceSurvey(data); }
                      finally { setSurveysSaving(false); }
                    }}
                  />
                </div>
              )}

              {/* Option B: Reflection Day (journaling / goal-setting) */}
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: '#c9a0ff', marginBottom: 8,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  Option B — Reflection & Goal-Setting
                </div>
                <ReflectionDay day={0} user={user} />
              </div>

              <div style={{ textAlign: 'center' }}>
                <button className="btn-primary" style={{ padding: '16px 40px', fontSize: 16 }}
                  onClick={onCompleteAll}>
                  Start the 30-Day Sprint &rarr;
                </button>
              </div>
            </div>
          );
        })()}
      </div>
      )}
    </div>
  );
}
