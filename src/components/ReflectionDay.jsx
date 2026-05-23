import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { getWeekNumber } from '../data/challengeDays';

const STORAGE_KEY = 'uc30_reflection';

function loadReflection(userId, weekNum) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return all[`${userId}_w${weekNum}`] || {};
  } catch { return {}; }
}

function saveReflection(userId, weekNum, data) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    all[`${userId}_w${weekNum}`] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

export default function ReflectionDay({ day, user, onMarkTrainingComplete }) {
  const weekNum = getWeekNumber(day);
  const [answers, setAnswers] = useState(() => loadReflection(user?.id, weekNum));
  const [currentSection, setCurrentSection] = useState(0);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  useEffect(() => {
    if (user?.id) saveReflection(user.id, weekNum, answers);
  }, [answers, user?.id, weekNum]);

  const set = (key, val) => setAnswers(prev => ({ ...prev, [key]: val }));

  const SECTIONS = [
    {
      id: 'intro',
      title: 'Why This Day Matters',
      content: `Most people start excited, motivated, and optimistic. But after a few days, fear, overwhelm, distractions, lack of confidence, or inconsistency begin to take over.

Success in real estate rarely comes from motivation alone. It comes from consistency, self-awareness, adaptation, and relentless execution.

Today is about resetting, reorganizing, recommitting, and building a strategy around YOUR strengths.

No contacts are required today. This is your day to reflect, plan, and sharpen your edge.`,
    },
    {
      id: 'recommit',
      title: 'Recommit To Your Goals',
      content: `Before moving into the next phase of UC30, take time to reconnect with WHY you started, what you actually want, and what success looks like for you.

Without strong reasons, people quit when things become difficult.`,
      questions: [
        { id: 'why_freedom', label: 'Why do I want financial freedom?' },
        { id: 'why_rental', label: 'Why do I want rental properties?' },
        { id: 'what_change', label: 'What am I trying to change about my life?' },
        { id: 'what_success', label: 'What would success actually look like?' },
        { id: 'what_if_never', label: 'What happens if I never take action?' },
        { id: 'what_if_do', label: 'What will life look like if I achieve my goals? (Be detailed — describe every part of what your life will look like)' },
      ],
    },
    {
      id: 'buybox',
      title: 'Revisit Your Buy Box',
      content: `Your buy box should evolve as your knowledge improves, your confidence grows, and you better understand your market.

Now is the time to review your target locations, property types, price ranges, financing strategy, cash flow goals, risk tolerance, and investment criteria.

Do NOT chase every deal. Many beginners waste time because they chase EVERYTHING. Focused investors become experts in a smaller target, recognize opportunities faster, analyze deals quicker, and negotiate with more confidence. Clarity creates speed.`,
      questions: [
        { id: 'right_price', label: 'Am I targeting the right price range?' },
        { id: 'right_type', label: 'Am I analyzing the correct property type?' },
        { id: 'too_competitive', label: 'Am I trying to compete in markets that are too competitive?' },
        { id: 'know_area', label: 'Do I understand my target area well enough?' },
        { id: 'box_broad', label: 'Is my buy box too broad or too narrow? What adjustments should I make?' },
        { id: 'fit_goals', label: 'Am I focusing on properties that actually fit my goals?' },
      ],
    },
    {
      id: 'strengths',
      title: 'Identify YOUR Competitive Advantage',
      content: `One of the biggest mistakes investors make is copying other people instead of leveraging their own strengths.

Your edge may come from personality, skills, relationships, career experience, social media, persistence, communication, networking, construction knowledge, sales ability, marketing, or local market expertise.

The goal is NOT to become someone else. The goal is to figure out what advantages YOU already have.`,
      questions: [
        { id: 'strengths_list', label: 'Write down all of your strengths that have carryover to real estate investing', multiline: true },
      ],
      checkboxes: [
        { id: 'str_people', label: 'I\'m naturally good with people' },
        { id: 'str_analytical', label: 'I\'m analytical' },
        { id: 'str_organized', label: 'I\'m organized' },
        { id: 'str_creative', label: 'I\'m creative' },
        { id: 'str_persistent', label: 'I\'m persistent' },
        { id: 'str_strangers', label: 'I\'m comfortable talking to strangers' },
        { id: 'str_sales', label: 'I\'m good at sales' },
        { id: 'str_relationships', label: 'I\'m good at building relationships' },
        { id: 'str_construction', label: 'I understand construction' },
        { id: 'str_finance', label: 'I understand finance' },
        { id: 'str_local', label: 'I have local market knowledge' },
        { id: 'str_network', label: 'I already know investors, lenders, contractors, or agents' },
      ],
    },
    {
      id: 'dealflow',
      title: 'Choose The BEST Deal Flow Strategy For YOU',
      content: `Different investors thrive using different methods. The BEST strategy is usually the one you will actually execute consistently.`,
      strategies: [
        {
          name: 'Relationship-Based',
          desc: 'Best for outgoing, social, relationship-oriented, or strong communicators.',
          examples: 'Networking, realtor relationships, investor meetups, referrals, property managers, local connections.',
        },
        {
          name: 'Marketing-Based',
          desc: 'Best for persistent, organized, and willing to scale outreach.',
          examples: 'Direct mail, texting, cold calling, social media, online ads, driving for dollars.',
        },
        {
          name: 'Analysis-Based',
          desc: 'Best for highly analytical, detail-oriented, and disciplined.',
          examples: 'MLS analysis, Zillow searching, expired listings, rental analysis, finding mispriced deals.',
        },
        {
          name: 'Content & Personal Brand-Based',
          desc: 'Best for those who enjoy creating content, networking publicly, or building authority online.',
          examples: 'Instagram, YouTube, TikTok, Facebook groups, local real estate content.',
        },
      ],
      questions: [
        { id: 'primary_strategy', label: 'Which strategy best fits your strengths? Why?' },
      ],
    },
    {
      id: 'crazy',
      title: 'Pick Something CRAZY That Gives You An Edge',
      content: `Average effort creates average results. Ask yourself: "What can I do that most people are NOT willing to do?"

Examples: analyzing 20 deals per day, calling 10 sellers daily, attending every investor meetup, posting content daily, driving neighborhoods every morning, building relationships with every property manager in town, creating handwritten letters, or becoming the local expert in one specific neighborhood.

The goal is to create unfair momentum.`,
      questions: [
        { id: 'crazy_edge', label: 'Write down what would give you an unfair advantage and massive momentum. Commit to something here!', multiline: true },
      ],
    },
    {
      id: 'roadblocks',
      title: 'Identify Your Roadblocks & Create Solutions',
      content: `Everyone has excuses, fears, limitations, or obstacles. Ignoring them does NOT solve them. Identify them honestly.

Mental Roadblocks: fear of failure, fear of rejection, fear of talking to sellers, analysis paralysis, lack of confidence, perfectionism, procrastination, or inconsistency.

Physical/External Roadblocks: lack of time, lack of money, lack of knowledge, lack of relationships, bad schedule, family obligations, poor organization, or lack of systems.

Do NOT stop at identifying problems. Create solutions.`,
      roadblockInputs: true,
      questions: [
        { id: 'roadblock_1', label: 'Roadblock #1' },
        { id: 'solution_1', label: 'Solution for Roadblock #1' },
        { id: 'roadblock_2', label: 'Roadblock #2' },
        { id: 'solution_2', label: 'Solution for Roadblock #2' },
        { id: 'roadblock_3', label: 'Roadblock #3' },
        { id: 'solution_3', label: 'Solution for Roadblock #3' },
      ],
    },
    {
      id: 'weekly_review',
      title: 'Weekly Reset',
      content: `Successful investors constantly review, adapt, and improve. Every week ask yourself these questions and answer honestly.`,
      questions: [
        { id: 'what_worked', label: 'What worked this week?' },
        { id: 'what_didnt', label: 'What didn\'t work?' },
        { id: 'opportunities', label: 'What created opportunities?' },
        { id: 'wasted_time', label: 'Where did I waste time?' },
        { id: 'double_down', label: 'What should I double down on?' },
        { id: 'eliminate', label: 'What should I eliminate?' },
      ],
    },
    {
      id: 'self_grade',
      title: 'Grade Yourself',
      content: `Be honest with yourself. This isn't about being perfect — it's about awareness and accountability.`,
      grading: true,
    },
    {
      id: 'recommit_final',
      title: 'Recommit To Execution',
      content: `Knowledge means NOTHING without action. You do NOT need perfect timing, perfect confidence, or perfect conditions. You need consistency, discipline, and action. Momentum compounds.

Most people quit right before momentum starts building. Stay consistent long enough to learn, adapt, improve, and create opportunities.

Your future portfolio will likely come from consistency, relationships, discipline, and volume — far more than one "perfect" deal.`,
      isFinal: true,
    },
  ];

  const isWeekOne = weekNum === 1;
  const filteredSections = isWeekOne
    ? SECTIONS
    : SECTIONS.filter(s => s.id !== 'buybox' && s.id !== 'strengths' && s.id !== 'dealflow');

  const allQuestionsAnswered = filteredSections.every(section => {
    if (!section.questions) return true;
    return section.questions.every(q => answers[q.id]?.trim());
  });

  const effortGrade = answers.effort_grade || 0;
  const difficultyGrade = answers.difficulty_grade || 0;
  const gradingDone = effortGrade > 0 && difficultyGrade > 0;

  const canComplete = allQuestionsAnswered && gradingDone;

  function generateReflectionPDF() {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    const margin = 20;
    const textW = w - margin * 2;
    let y = 20;

    const dark = [18, 18, 24];
    const white = [238, 238, 238];
    const accent = [233, 69, 96];
    const muted = [136, 136, 136];
    const green = [72, 199, 142];

    const newPage = () => {
      doc.addPage();
      doc.setFillColor(...dark);
      doc.rect(0, 0, w, h, 'F');
      y = 20;
    };

    doc.setFillColor(...dark);
    doc.rect(0, 0, w, h, 'F');

    const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Operator';
    doc.setTextColor(...white);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(name.toUpperCase(), w / 2, y, { align: 'center' });
    y += 10;

    doc.setTextColor(...accent);
    doc.setFontSize(14);
    doc.text(`WEEK ${weekNum} REFLECTION`, w / 2, y, { align: 'center' });
    y += 4;

    doc.setDrawColor(...accent);
    doc.setLineWidth(0.5);
    doc.line(margin, y, w - margin, y);
    y += 12;

    filteredSections.forEach(section => {
      if (!section.questions && !section.grading) return;

      if (y > 250) newPage();

      doc.setTextColor(...green);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(section.title.toUpperCase(), margin, y);
      y += 8;

      if (section.checkboxes) {
        const checked = section.checkboxes.filter(cb => answers[cb.id]);
        if (checked.length > 0) {
          doc.setTextColor(...muted);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text('Strengths identified:', margin, y);
          y += 5;
          doc.setTextColor(...white);
          checked.forEach(cb => {
            if (y > 275) newPage();
            doc.text(`  - ${cb.label}`, margin, y);
            y += 4.5;
          });
          y += 3;
        }
      }

      if (section.questions) {
        section.questions.forEach(q => {
          if (y > 260) newPage();
          doc.setTextColor(...muted);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text(q.label, margin, y);
          y += 5;

          doc.setTextColor(...white);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const answer = answers[q.id] || '(not answered)';
          const lines = doc.splitTextToSize(answer, textW);
          lines.forEach(line => {
            if (y > 275) newPage();
            doc.text(line, margin, y);
            y += 5;
          });
          y += 4;
        });
      }

      if (section.grading) {
        doc.setTextColor(...muted);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('How hard did I work this week?', margin, y);
        y += 5;
        doc.setTextColor(...white);
        doc.setFontSize(12);
        doc.text(`${effortGrade} / 10`, margin, y);
        y += 8;

        doc.setTextColor(...muted);
        doc.setFontSize(9);
        doc.text('How difficult was this week?', margin, y);
        y += 5;
        doc.setTextColor(...white);
        doc.setFontSize(12);
        doc.text(`${difficultyGrade} / 10`, margin, y);
        y += 8;
      }

      y += 4;
    });

    doc.setDrawColor(60, 60, 70);
    doc.setLineWidth(0.3);
    doc.line(margin, h - 15, w - margin, h - 15);
    doc.setTextColor(...muted);
    doc.setFontSize(8);
    doc.text(`Generated via UC30 | Week ${weekNum} Reflection`, w / 2, h - 10, { align: 'center' });

    doc.save(`${name.replace(/\s+/g, '_')}_Week${weekNum}_Reflection.pdf`);
    setPdfGenerated(true);
  }

  const cardStyle = {
    marginBottom: 16, padding: '24px 20px', borderRadius: 14,
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
  };

  const inputStyle = {
    width: '100%', fontSize: 14, padding: '12px 14px', borderRadius: 10,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#eee', fontFamily: "'DM Sans', sans-serif", resize: 'vertical',
  };

  return (
    <div>
      {/* Reflection Day Header */}
      <div style={{
        marginBottom: 24, padding: '24px 20px', borderRadius: 14,
        background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(233,69,96,0.06))',
        border: '1px solid rgba(168,85,247,0.15)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 11, color: '#a855f7', fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>
          WEEK {weekNum} REST DAY
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#ddd', marginBottom: 6 }}>
          Reorganize & Recommit
        </div>
        <div style={{ fontSize: 13, color: '#888' }}>
          No contacts required today. Focus on reflection, planning, and sharpening your edge.
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: '#888' }}>Section {Math.min(currentSection + 1, filteredSections.length)} of {filteredSections.length}</span>
          <span style={{ fontSize: 11, color: canComplete ? '#48c78e' : '#888', fontWeight: 600 }}>
            {canComplete ? 'All sections complete' : 'Complete all sections to finish'}
          </span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2, background: '#a855f7',
            width: `${Math.round(((currentSection + 1) / filteredSections.length) * 100)}%`,
            transition: 'width 0.3s',
          }} />
        </div>
      </div>

      {/* Sections */}
      {filteredSections.map((section, idx) => {
        const isActive = idx <= currentSection;
        if (!isActive) return (
          <div key={section.id} style={{
            ...cardStyle, opacity: 0.4, cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.04)',
          }} onClick={() => setCurrentSection(idx)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#555',
              }}>{idx + 1}</div>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#666' }}>{section.title}</span>
            </div>
          </div>
        );

        const sectionComplete = section.questions
          ? section.questions.every(q => answers[q.id]?.trim())
          : section.grading
          ? gradingDone
          : true;

        return (
          <div key={section.id} style={{
            ...cardStyle,
            border: idx === currentSection ? '1px solid rgba(168,85,247,0.2)' : cardStyle.border,
          }}>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: sectionComplete ? 'rgba(72,199,142,0.15)' : 'rgba(168,85,247,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: sectionComplete ? '#48c78e' : '#a855f7',
              }}>{sectionComplete ? '✓' : idx + 1}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#ddd', flex: 1 }}>{section.title}</h3>
            </div>

            {/* Content text */}
            {section.content && (
              <p style={{ color: '#bbb', lineHeight: 1.8, fontSize: 14, whiteSpace: 'pre-line', marginBottom: section.questions || section.grading || section.strategies || section.checkboxes ? 20 : 0 }}>
                {section.content}
              </p>
            )}

            {/* Strategy cards */}
            {section.strategies && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 16 }}>
                {section.strategies.map(s => (
                  <div key={s.name} style={{
                    padding: '14px 16px', borderRadius: 10,
                    background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.1)',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#a855f7', marginBottom: 4 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>{s.desc}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>{s.examples}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Strength checkboxes */}
            {section.checkboxes && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#a855f7', fontWeight: 600, marginBottom: 8 }}>Select all that apply:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 6 }}>
                  {section.checkboxes.map(cb => (
                    <label key={cb.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                      background: answers[cb.id] ? 'rgba(72,199,142,0.06)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${answers[cb.id] ? 'rgba(72,199,142,0.15)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                      <input type="checkbox" checked={!!answers[cb.id]}
                        onChange={e => set(cb.id, e.target.checked)}
                        style={{ accentColor: '#48c78e' }} />
                      <span style={{ fontSize: 13, color: answers[cb.id] ? '#48c78e' : '#aaa' }}>{cb.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Questions */}
            {section.questions && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {section.questions.map(q => (
                  <div key={q.id}>
                    <label style={{ fontSize: 13, color: '#ccc', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      {q.label}
                    </label>
                    {q.multiline ? (
                      <textarea
                        value={answers[q.id] || ''}
                        onChange={e => set(q.id, e.target.value)}
                        rows={4}
                        placeholder="Type your answer here..."
                        style={inputStyle}
                      />
                    ) : section.roadblockInputs && q.id.startsWith('solution') ? (
                      <textarea
                        value={answers[q.id] || ''}
                        onChange={e => set(q.id, e.target.value)}
                        rows={2}
                        placeholder="What's your plan to overcome this?"
                        style={{ ...inputStyle, borderColor: 'rgba(72,199,142,0.15)' }}
                      />
                    ) : (
                      <textarea
                        value={answers[q.id] || ''}
                        onChange={e => set(q.id, e.target.value)}
                        rows={section.roadblockInputs ? 2 : 3}
                        placeholder="Type your answer here..."
                        style={inputStyle}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Grading section */}
            {section.grading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <GradeSlider
                  label="How hard did I work this week?"
                  sublabel="1 = barely tried, 10 = gave everything I had"
                  value={effortGrade}
                  onChange={v => set('effort_grade', v)}
                  color="#a855f7"
                />
                <GradeSlider
                  label="How difficult was this week?"
                  sublabel="1 = easy, 10 = extremely challenging"
                  value={difficultyGrade}
                  onChange={v => set('difficulty_grade', v)}
                  color="#f0a500"
                />
              </div>
            )}

            {/* Continue button */}
            {idx === currentSection && idx < filteredSections.length - 1 && (
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={() => setCurrentSection(prev => Math.min(prev + 1, filteredSections.length - 1))}
                  style={{
                    padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    border: 'none', background: 'rgba(168,85,247,0.15)', color: '#a855f7',
                  }}>
                  Continue to Next Section
                </button>
              </div>
            )}

            {/* Final section — PDF + complete */}
            {section.isFinal && (
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  onClick={generateReflectionPDF}
                  disabled={!canComplete}
                  style={{
                    padding: '14px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                    cursor: canComplete ? 'pointer' : 'default', fontFamily: "'DM Sans', sans-serif",
                    border: 'none',
                    background: canComplete ? 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(233,69,96,0.15))' : 'rgba(255,255,255,0.04)',
                    color: canComplete ? '#a855f7' : '#555',
                    opacity: canComplete ? 1 : 0.5,
                  }}>
                  {pdfGenerated ? '✓ Download Reflection PDF Again' : 'Download Week ' + weekNum + ' Reflection PDF'}
                </button>

                {canComplete && (
                  <button
                    onClick={() => {
                      if (!pdfGenerated) generateReflectionPDF();
                      if (onMarkTrainingComplete) onMarkTrainingComplete();
                    }}
                    style={{
                      padding: '14px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                      border: 'none', background: 'rgba(72,199,142,0.15)', color: '#48c78e',
                    }}>
                    ✓ Mark Reflection Complete
                  </button>
                )}

                {!canComplete && (
                  <div style={{ fontSize: 12, color: '#e94560', textAlign: 'center' }}>
                    Complete all reflection sections and self-grading above to finish
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function GradeSlider({ label, sublabel, value, onChange, color }) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#ccc', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 11, color: '#666', marginBottom: 10 }}>{sublabel}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
          <button key={n} onClick={() => onChange(n)}
            style={{
              width: 40, height: 40, borderRadius: 10, fontSize: 16, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              border: 'none',
              background: n <= value ? `${color}25` : 'rgba(255,255,255,0.04)',
              color: n <= value ? color : '#555',
              outline: n === value ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.06)',
            }}>
            {n}
          </button>
        ))}
      </div>
      {value > 0 && (
        <div style={{ fontSize: 13, fontWeight: 700, color, marginTop: 8 }}>
          {value}/10
        </div>
      )}
    </div>
  );
}
