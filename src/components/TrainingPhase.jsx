import { useState, useEffect, useCallback } from 'react';
import QuizSection from './QuizSection';

const MODULE_DAY_OFFSET = -100;

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
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [quizPassed, setQuizPassed] = useState(false);

  const completed = user.trainingCompletedModules || [];
  const visibleModules = modules.filter(m => !m.hidden);
  const allComplete = visibleModules.length > 0 && visibleModules.every(m => completed.includes(m.id));

  const activeModule = visibleModules.find(m => m.id === activeModuleId);
  const activeIndex = visibleModules.findIndex(m => m.id === activeModuleId);
  const dayNumber = activeModule ? MODULE_DAY_OFFSET - visibleModules.indexOf(activeModule) : 0;

  const isUnlocked = (moduleId) => {
    const idx = visibleModules.findIndex(m => m.id === moduleId);
    if (idx === 0) return true;
    return completed.includes(visibleModules[idx - 1]?.id);
  };

  useEffect(() => {
    if (!activeModule || !getQuizAttempts || !user?.id) return;
    Promise.resolve(getQuizAttempts(user.id, dayNumber)).then(a => {
      setQuizAttempts(a || []);
      const scenarios = activeModule.quiz?.scenarios || [];
      const allPassed = scenarios.length > 0 && scenarios.every(s =>
        (a || []).some(att => att.scenario_id === s.id && att.correct)
      );
      setQuizPassed(allPassed || completed.includes(activeModule.id));
    });
  }, [activeModuleId, user?.id]);

  const handleQuizAttempt = useCallback(async (attempt) => {
    const result = await addQuizAttempt({ ...attempt, dayNumber });
    if (result) setQuizAttempts(prev => [...prev, result]);
    return result;
  }, [addQuizAttempt, dayNumber]);

  const handleQuizComplete = useCallback(() => {
    setQuizPassed(true);
    if (activeModule && !completed.includes(activeModule.id)) {
      onCompleteModule(activeModule.id);
    }
  }, [activeModule, completed, onCompleteModule]);

  const handleMarkComplete = () => {
    if (activeModule && !completed.includes(activeModule.id)) {
      onCompleteModule(activeModule.id);
    }
  };

  if (activeModule) {
    const hasQuiz = activeModule.quiz?.scenarios?.length > 0;
    const isComplete = completed.includes(activeModule.id);
    const canGoNext = activeIndex < visibleModules.length - 1;

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          position: 'sticky', top: 32, zIndex: 50,
          background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)',
          padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <button onClick={() => { setActiveModuleId(null); setQuizPassed(false); }} style={{
                background: 'none', border: 'none', color: '#e94560', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, padding: 0, fontFamily: "'DM Sans', sans-serif",
              }}>
                &larr; All Training
              </button>
              <span style={{ fontSize: 11, color: '#666', fontWeight: 600, letterSpacing: 1 }}>
                {activeIndex + 1} / {visibleModules.length}
              </span>
            </div>
            <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: 'linear-gradient(90deg, #e94560, #c81d4e)',
                width: `${((activeIndex + 1) / visibleModules.length) * 100}%`,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, maxWidth: 720, margin: '0 auto', padding: '24px 20px', width: '100%' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{activeModule.title}</h2>
          {activeModule.description && (
            <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>{activeModule.description}</p>
          )}

          <div className="card" style={{ marginBottom: 24 }}>
            <p style={{ color: '#ccc', lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-line' }}>
              {activeModule.content}
            </p>
          </div>

          {hasQuiz && !isComplete && (
            <QuizSection
              quiz={activeModule.quiz}
              participantId={user.id}
              dayNumber={dayNumber}
              existingAttempts={quizAttempts}
              onAttempt={handleQuizAttempt}
              onQuizComplete={handleQuizComplete}
            />
          )}

          {!hasQuiz && !isComplete && (
            <button className="btn-primary" style={{ width: '100%', padding: '16px 24px', fontSize: 16 }}
              onClick={handleMarkComplete}>
              Mark as Complete
            </button>
          )}

          {(isComplete || quizPassed) && (
            <div style={{
              padding: '20px 24px', borderRadius: 12, marginBottom: 24, textAlign: 'center',
              background: 'rgba(72,199,142,0.08)', border: '1px solid rgba(72,199,142,0.2)',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>&#10003;</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#48c78e', marginBottom: 12 }}>Module Complete</div>
              {canGoNext && (
                <button className="btn-primary" style={{ padding: '14px 32px', fontSize: 15 }}
                  onClick={() => {
                    const next = visibleModules[activeIndex + 1];
                    setActiveModuleId(next.id);
                    setQuizPassed(false);
                    window.scrollTo(0, 0);
                  }}>
                  Next Module &rarr;
                </button>
              )}
              {!canGoNext && allComplete && (
                <button className="btn-primary" style={{ padding: '14px 32px', fontSize: 15 }}
                  onClick={onCompleteAll}>
                  Start the 30-Day Sprint &rarr;
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Module list view
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
            <h1 className="mono" style={{ fontSize: 22, fontWeight: 700, color: '#e94560', margin: 0 }}>UC30 Training</h1>
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
        {visibleModules.map((mod, idx) => {
          const done = completed.includes(mod.id);
          const unlocked = isUnlocked(mod.id);
          const isCurrent = !done && unlocked;

          return (
            <div key={mod.id} onClick={() => unlocked ? setActiveModuleId(mod.id) : null} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
              borderRadius: 12, marginBottom: 8, cursor: unlocked ? 'pointer' : 'default',
              background: isCurrent ? 'rgba(233,69,96,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isCurrent ? 'rgba(233,69,96,0.2)' : done ? 'rgba(72,199,142,0.15)' : 'rgba(255,255,255,0.04)'}`,
              opacity: unlocked ? 1 : 0.4,
              transition: 'all 0.15s ease',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 700,
                background: done ? 'rgba(72,199,142,0.15)' : isCurrent ? 'rgba(233,69,96,0.12)' : 'rgba(255,255,255,0.04)',
                color: done ? '#48c78e' : isCurrent ? '#e94560' : '#555',
              }}>
                {done ? '✓' : unlocked ? idx + 1 : '🔒'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15, fontWeight: 600, marginBottom: 2,
                  color: done ? '#48c78e' : unlocked ? '#eee' : '#555',
                }}>
                  {mod.title}
                </div>
                {mod.description && (
                  <div style={{
                    fontSize: 12, color: done ? 'rgba(72,199,142,0.6)' : unlocked ? '#666' : '#444',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {mod.description}
                  </div>
                )}
              </div>
              {done && <span style={{ fontSize: 11, color: '#48c78e', fontWeight: 600 }}>COMPLETE</span>}
              {isCurrent && <span style={{ fontSize: 11, color: '#e94560', fontWeight: 600 }}>START &rarr;</span>}
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
