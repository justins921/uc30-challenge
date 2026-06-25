import { useState, useEffect, useCallback, useMemo } from 'react';
import QuizSection from './QuizSection';

const MODULE_DAY_OFFSET = -100;

function renderMarkdown(text) {
  if (!text) return text;
  return text.split('\n').map((line, i) => {
    const parts = [];
    let remaining = line;
    let key = 0;
    const regex = /\*\*(.+?)\*\*/g;
    let match;
    let lastIndex = 0;
    while ((match = regex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        parts.push(remaining.slice(lastIndex, match.index));
      }
      parts.push(<strong key={key++}>{match[1]}</strong>);
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < remaining.length) {
      parts.push(remaining.slice(lastIndex));
    }
    return <span key={i}>{parts}{i < text.split('\n').length - 1 ? <br /> : null}</span>;
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
}) {
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [activePrincipleIndex, setActivePrincipleIndex] = useState(null);
  const [showKeyTerms, setShowKeyTerms] = useState(false);
  const [moduleAttempts, setModuleAttempts] = useState([]);

  const completed = user.trainingCompletedModules || [];
  const visibleModules = modules.filter(m => !m.hidden && !m.comingSoon);
  const allModules = modules.filter(m => !m.hidden);
  const allComplete = visibleModules.length > 0 && visibleModules.every(m => completed.includes(m.id));

  const activeModule = allModules.find(m => m.id === activeModuleId);
  const activeModuleIndex = allModules.findIndex(m => m.id === activeModuleId);
  const dayNumber = activeModule ? MODULE_DAY_OFFSET - allModules.indexOf(activeModule) : 0;

  const isModuleUnlocked = (moduleId) => {
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
    if (!principle?.questions?.length) return true;
    return principle.questions.every(q =>
      moduleAttempts.some(a => a.scenario_id === principle.id && a.correct)
    );
  }, [moduleAttempts]);

  const isPrincipleUnlocked = useCallback((principleIndex) => {
    if (!activeModule?.principles) return false;
    if (principleIndex === 0) return true;
    const prev = activeModule.principles[principleIndex - 1];
    return isPrincipleComplete(prev);
  }, [activeModule, isPrincipleComplete]);

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
    const hasQuestions = principle.questions?.length > 0;

    const principleQuiz = hasQuestions ? {
      scenarios: [{
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

    const principleAttempts = moduleAttempts.filter(a => a.scenario_id === principle.id);

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
              <span style={{ fontSize: 11, color: '#666', fontWeight: 600, letterSpacing: 1 }}>
                Module {activeModule.moduleNumber} of {allModules.length} &middot; Principle {activePrincipleIndex + 1} of {principles.length}
              </span>
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

        {allComplete && (
          <div style={{
            marginTop: 24, padding: '28px 24px', borderRadius: 16, textAlign: 'center',
            background: 'rgba(72,199,142,0.06)', border: '1px solid rgba(72,199,142,0.2)',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>&#127942;</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#48c78e', marginBottom: 8 }}>
              Training Complete!
            </div>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              You've completed all training modules. Time to put it into action.
            </p>
            <button className="btn-primary" style={{ padding: '16px 40px', fontSize: 16 }}
              onClick={onCompleteAll}>
              Start the 30-Day Sprint &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
