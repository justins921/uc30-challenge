import { useState, useMemo } from 'react';

const SURVEY_CATEGORIES = [
  {
    title: 'Analysis & Buy Box',
    color: '#48c78e',
    questions: [
      { id: 'analysis_confidence', text: 'How confident are you in your ability to analyze a rental property accurately?' },
      { id: 'market_rents', text: 'How confident are you in determining realistic market rents?' },
      { id: 'estimating_expenses', text: 'How confident are you in estimating expenses conservatively?' },
      { id: 'buy_box_clarity', text: 'How clearly defined is your buy box and investment criteria?' },
      { id: 'max_price', text: 'How confident are you in knowing the MAXIMUM price you would pay for a property?' },
    ],
  },
  {
    title: 'Deal Flow & Relationships',
    color: '#f0a500',
    questions: [
      { id: 'deal_flow', text: 'How confident are you in your ability to consistently generate deal flow?' },
      { id: 'arsenal_relationships', text: 'How strong are your current relationships with Arsenal Contacts? (realtors, wholesalers, property managers, lenders, investors, etc.)' },
      { id: 'explain_buy_box', text: 'How confident are you in explaining your buy box and investment goals to Arsenal Contacts?' },
      { id: 'follow_up_consistency', text: 'How confident are you in following up consistently and professionally?' },
      { id: 'tracking_discipline', text: 'How organized and disciplined are you in tracking leads and conversations?' },
    ],
  },
  {
    title: 'Negotiation & Communication',
    color: '#c9a0ff',
    questions: [
      { id: 'negotiation', text: 'How confident are you in negotiating purchase price and terms?' },
      { id: 'professional_comm', text: 'How confident are you in communicating professionally with sellers and agents?' },
      { id: 'direct_conversations', text: 'How comfortable are you having direct conversations with property owners?' },
      { id: 'seller_motivation', text: 'How well do you feel you uncover seller motivation and pain points?' },
      { id: 'win_win_offers', text: 'How confident are you in structuring offers that create win-win solutions?' },
    ],
  },
  {
    title: 'Execution & Momentum',
    color: '#e94560',
    questions: [
      { id: 'action_speed', text: 'How quickly are you taking action when opportunities appear?' },
      { id: 'no_paralysis', text: 'How much are you struggling with hesitation or analysis paralysis? (1 = struggling heavily, 10 = almost no hesitation)' },
      { id: 'discipline', text: 'How disciplined are you at sticking to your criteria and avoiding emotional decisions?' },
      { id: 'consistency', text: 'How consistent have you been with property analysis, offers, follow-up, and outreach?' },
      { id: 'contract_confidence', text: 'How confident are you TODAY that you can get a property under contract?' },
    ],
  },
];

const REFLECTION_QUESTIONS = [
  { id: 'most_improved', text: 'What area have you improved the MOST in so far?' },
  { id: 'needs_improvement', text: 'What area still needs the MOST improvement?' },
  { id: 'biggest_breakthroughs', text: 'What has created the biggest breakthroughs for you?' },
  { id: 'roadblocks', text: 'What excuses, fears, or roadblocks are still holding you back?' },
  { id: 'next_7_days', text: 'What specific actions will you focus on improving over the next 7 days?' },
];

const CHECKPOINT_LABELS = {
  pre_training: 'Baseline',
  week_1: 'Week 1',
  week_2: 'Week 2',
  week_3: 'Week 3',
  week_4: 'Week 4',
};

export { SURVEY_CATEGORIES, REFLECTION_QUESTIONS, CHECKPOINT_LABELS };

export default function ConfidenceSurvey({ checkpoint, onSave, existingSurveys, saving }) {
  const [ratings, setRatings] = useState({});
  const [reflections, setReflections] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const alreadyCompleted = useMemo(() => {
    return (existingSurveys || []).some(s => s.checkpoint === checkpoint);
  }, [existingSurveys, checkpoint]);

  const previousSurvey = useMemo(() => {
    const checkpoints = ['pre_training', 'week_1', 'week_2', 'week_3', 'week_4'];
    const currentIdx = checkpoints.indexOf(checkpoint);
    if (currentIdx <= 0) return null;
    const sorted = (existingSurveys || [])
      .filter(s => checkpoints.indexOf(s.checkpoint) < currentIdx)
      .sort((a, b) => checkpoints.indexOf(b.checkpoint) - checkpoints.indexOf(a.checkpoint));
    return sorted[0] || null;
  }, [existingSurveys, checkpoint]);

  const allQuestions = SURVEY_CATEGORIES.flatMap(c => c.questions);
  const allRated = allQuestions.every(q => ratings[q.id] >= 1);
  const allReflected = checkpoint === 'pre_training' || REFLECTION_QUESTIONS.every(q => (reflections[q.id] || '').trim());

  const categoryAverages = useMemo(() => {
    const avgs = {};
    SURVEY_CATEGORIES.forEach(cat => {
      const vals = cat.questions.map(q => ratings[q.id]).filter(v => v >= 1);
      avgs[cat.title] = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    });
    return avgs;
  }, [ratings]);

  const overallAverage = useMemo(() => {
    const vals = Object.values(ratings).filter(v => v >= 1);
    return vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  }, [ratings]);

  const handleSubmit = async () => {
    if (!allRated || !allReflected) return;
    const surveyData = {
      checkpoint,
      submitted_at: new Date().toISOString(),
      ratings: { ...ratings },
      reflections: checkpoint !== 'pre_training' ? { ...reflections } : {},
    };
    await onSave(surveyData);
    setSubmitted(true);
  };

  if (alreadyCompleted || submitted) {
    const completedData = submitted
      ? { checkpoint, ratings, reflections }
      : (existingSurveys || []).find(s => s.checkpoint === checkpoint);

    return (
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(72,199,142,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✓</div>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Progress Assessment — {CHECKPOINT_LABELS[checkpoint]}</h3>
        </div>

        {completedData && (
          <SurveyResults
            current={completedData}
            previous={previousSurvey}
            checkpoint={checkpoint}
          />
        )}
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(233,69,96,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📊</div>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>UC30 Progress & Accountability Assessment</h3>
      </div>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 20, marginTop: 4 }}>
        Rate yourself 1–10 on each area. Be honest — this tracks your growth over the entire challenge.
      </p>

      {SURVEY_CATEGORIES.map(cat => (
        <div key={cat.title} style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
            padding: '8px 12px', borderRadius: 8,
            background: `${cat.color}08`, borderLeft: `3px solid ${cat.color}40`,
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: cat.color }}>{cat.title}</span>
            {categoryAverages[cat.title] > 0 && (
              <span style={{ fontSize: 12, color: '#666', marginLeft: 'auto' }}>
                Avg: {categoryAverages[cat.title].toFixed(1)}
              </span>
            )}
          </div>

          {cat.questions.map((q, qi) => (
            <RatingQuestion
              key={q.id}
              question={q}
              number={(SURVEY_CATEGORIES.slice(0, SURVEY_CATEGORIES.indexOf(cat)).flatMap(c => c.questions).length) + qi + 1}
              value={ratings[q.id]}
              onChange={(val) => setRatings(prev => ({ ...prev, [q.id]: val }))}
              previousValue={previousSurvey?.ratings?.[q.id]}
              color={cat.color}
            />
          ))}
        </div>
      ))}

      {checkpoint !== 'pre_training' && (
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
            padding: '8px 12px', borderRadius: 8,
            background: 'rgba(240,165,0,0.04)', borderLeft: '3px solid rgba(240,165,0,0.3)',
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#f0a500' }}>Reflection Questions</span>
          </div>

          {REFLECTION_QUESTIONS.map((q, i) => (
            <div key={q.id} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: '#bbb', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                {i + 1}. {q.text}
              </label>
              <textarea
                value={reflections[q.id] || ''}
                onChange={e => setReflections(prev => ({ ...prev, [q.id]: e.target.value }))}
                rows={3}
                style={{
                  width: '100%', fontSize: 14, padding: '10px 12px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#eee', resize: 'vertical', fontFamily: "'DM Sans', sans-serif",
                  lineHeight: 1.6,
                }}
                placeholder="Be specific and honest..."
              />
            </div>
          ))}
        </div>
      )}

      {allRated && (
        <div style={{
          padding: '14px 16px', borderRadius: 10, marginBottom: 16,
          background: 'rgba(72,199,142,0.04)', border: '1px solid rgba(72,199,142,0.15)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#48c78e', marginBottom: 8 }}>Your Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {SURVEY_CATEGORIES.map(cat => (
              <div key={cat.title} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#888' }}>{cat.title}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: cat.color }}>{categoryAverages[cat.title].toFixed(1)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#ccc' }}>Overall Average</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{overallAverage.toFixed(1)}</span>
          </div>
        </div>
      )}

      <button
        className="btn-primary"
        disabled={!allRated || !allReflected || saving}
        onClick={handleSubmit}
        style={{ width: '100%', opacity: allRated && allReflected ? 1 : 0.4 }}
      >
        {saving ? 'Saving...' : checkpoint === 'pre_training' ? 'Submit Baseline Assessment' : 'Submit Assessment'}
      </button>

      {!allRated && (
        <p style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 8 }}>
          Rate all 20 questions to continue
        </p>
      )}
    </div>
  );
}

function RatingQuestion({ question, number, value, onChange, previousValue, color }) {
  const diff = value && previousValue ? value - previousValue : null;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: '#666', fontWeight: 700, minWidth: 20 }}>{number}.</span>
        <span style={{ fontSize: 13, color: '#bbb', lineHeight: 1.5 }}>{question.text}</span>
      </div>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
          const isSelected = value === n;
          return (
            <button
              key={n}
              onClick={() => onChange(n)}
              style={{
                flex: 1, minWidth: 0, padding: '8px 0', borderRadius: 6, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                fontFamily: "'DM Sans', sans-serif",
                background: isSelected ? `${color}30` : 'rgba(255,255,255,0.04)',
                color: isSelected ? color : '#666',
                outline: isSelected ? `2px solid ${color}60` : 'none',
              }}
            >
              {n}
            </button>
          );
        })}

        {diff !== null && diff !== 0 && (
          <span style={{
            fontSize: 11, fontWeight: 700, marginLeft: 4, flexShrink: 0,
            color: diff > 0 ? '#48c78e' : '#e94560',
          }}>
            {diff > 0 ? `+${diff}` : diff}
          </span>
        )}
      </div>

      {previousValue && (
        <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>
          Previous: {previousValue}/10
        </div>
      )}
    </div>
  );
}

function SurveyResults({ current, previous, checkpoint }) {
  const currentRatings = current.ratings || {};
  const prevRatings = previous?.ratings || {};

  const getCategoryAvg = (cat, r) => {
    const vals = cat.questions.map(q => r[q.id]).filter(v => v >= 1);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const overallCurrent = (() => {
    const vals = Object.values(currentRatings).filter(v => v >= 1);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  })();

  const overallPrev = (() => {
    if (!prevRatings || Object.keys(prevRatings).length === 0) return null;
    const vals = Object.values(prevRatings).filter(v => v >= 1);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  })();

  return (
    <div>
      <div style={{
        padding: '16px', borderRadius: 10, marginBottom: 16,
        background: 'rgba(72,199,142,0.04)', border: '1px solid rgba(72,199,142,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#48c78e' }}>Completed</span>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{overallCurrent.toFixed(1)}</span>
            <span style={{ fontSize: 12, color: '#666' }}>/10</span>
            {overallPrev !== null && (
              <span style={{
                fontSize: 12, fontWeight: 700, marginLeft: 8,
                color: overallCurrent - overallPrev > 0 ? '#48c78e' : overallCurrent - overallPrev < 0 ? '#e94560' : '#888',
              }}>
                {overallCurrent - overallPrev > 0 ? '+' : ''}{(overallCurrent - overallPrev).toFixed(1)} from {CHECKPOINT_LABELS[previous.checkpoint]}
              </span>
            )}
          </div>
        </div>

        {SURVEY_CATEGORIES.map(cat => {
          const avg = getCategoryAvg(cat, currentRatings);
          const prevAvg = Object.keys(prevRatings).length > 0 ? getCategoryAvg(cat, prevRatings) : null;
          const diff = prevAvg !== null ? avg - prevAvg : null;
          return (
            <div key={cat.title} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.04)',
            }}>
              <span style={{ fontSize: 13, color: '#aaa' }}>{cat.title}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: cat.color }}>{avg.toFixed(1)}</span>
                {diff !== null && diff !== 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: diff > 0 ? '#48c78e' : '#e94560' }}>
                    {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function GrowthReport({ surveys }) {
  if (!surveys || surveys.length < 2) return null;

  const checkpoints = ['pre_training', 'week_1', 'week_2', 'week_3', 'week_4'];
  const sorted = [...surveys].sort((a, b) => checkpoints.indexOf(a.checkpoint) - checkpoints.indexOf(b.checkpoint));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const getOverall = (s) => {
    const vals = Object.values(s.ratings || {}).filter(v => v >= 1);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const getCategoryAvg = (cat, r) => {
    const vals = cat.questions.map(q => r[q.id]).filter(v => v >= 1);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const firstOverall = getOverall(first);
  const lastOverall = getOverall(last);
  const totalGrowth = lastOverall - firstOverall;

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(72,199,142,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📈</div>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Your UC30 Growth</h3>
      </div>

      <div style={{
        padding: '20px', borderRadius: 12, marginBottom: 16, textAlign: 'center',
        background: totalGrowth > 0 ? 'rgba(72,199,142,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${totalGrowth > 0 ? 'rgba(72,199,142,0.2)' : 'rgba(255,255,255,0.08)'}`,
      }}>
        <div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
          Overall Confidence Growth
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: totalGrowth > 0 ? '#48c78e' : '#fff' }}>
          {totalGrowth > 0 ? '+' : ''}{totalGrowth.toFixed(1)}
        </div>
        <div style={{ fontSize: 14, color: '#aaa', marginTop: 4 }}>
          {firstOverall.toFixed(1)} → {lastOverall.toFixed(1)}
        </div>
        <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
          {CHECKPOINT_LABELS[first.checkpoint]} → {CHECKPOINT_LABELS[last.checkpoint]}
        </div>
      </div>

      {SURVEY_CATEGORIES.map(cat => {
        const firstAvg = getCategoryAvg(cat, first.ratings || {});
        const lastAvg = getCategoryAvg(cat, last.ratings || {});
        const diff = lastAvg - firstAvg;
        const pct = firstAvg > 0 ? Math.round((diff / firstAvg) * 100) : 0;
        return (
          <div key={cat.title} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc' }}>{cat.title}</div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                {firstAvg.toFixed(1)} → {lastAvg.toFixed(1)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: diff > 0 ? '#48c78e' : diff < 0 ? '#e94560' : '#888' }}>
                {diff > 0 ? '+' : ''}{diff.toFixed(1)}
              </div>
              {pct !== 0 && (
                <div style={{ fontSize: 11, color: diff > 0 ? '#48c78e' : '#e94560' }}>
                  {pct > 0 ? '+' : ''}{pct}%
                </div>
              )}
            </div>
          </div>
        );
      })}

      {sorted.length > 2 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Progress Over Time
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 80 }}>
            {sorted.map((s, i) => {
              const avg = getOverall(s);
              const heightPct = Math.max((avg / 10) * 100, 10);
              return (
                <div key={s.checkpoint} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#ccc', marginBottom: 4 }}>
                    {avg.toFixed(1)}
                  </div>
                  <div style={{
                    height: `${heightPct}%`, borderRadius: '4px 4px 0 0',
                    background: i === sorted.length - 1
                      ? 'rgba(72,199,142,0.4)'
                      : i === 0
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(240,165,0,0.2)',
                    transition: 'height 0.5s',
                  }} />
                  <div style={{ fontSize: 9, color: '#666', marginTop: 4 }}>
                    {CHECKPOINT_LABELS[s.checkpoint]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
