import { useState, useMemo, useEffect, useRef } from 'react';

/*
 * Capital & Strategy Finder
 * An 8-question tap-through questionnaire that outputs a personalized snapshot of the
 * financing options and strategies a user can likely use, with a highlighted best-fit path.
 *
 * All logic is simple unlock rules over 8 stored variables. Every student-facing description
 * lives in the content tables below so copy can be tuned without touching logic.
 */

// ── Colors ──
const C = { red: '#e94560', green: '#48c78e', gold: '#f0a500', purple: '#c9a0ff' };

// ── The 8 Questions ──
const QUESTIONS = [
  {
    key: 'CASH',
    title: 'How much cash do you have available to invest right now?',
    options: [
      { value: 'under_10k', label: 'Under $10k' },
      { value: '10_25k', label: '$10k–$25k' },
      { value: '25_50k', label: '$25k–$50k' },
      { value: '50_100k', label: '$50k–$100k' },
      { value: '100_250k', label: '$100k–$250k' },
      { value: '250k_plus', label: '$250k+' },
    ],
  },
  {
    key: 'LIVE_IN',
    title: 'Would you be willing to live in the property for at least one year?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'maybe', label: 'Maybe / open to it' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    key: 'INCOME',
    title: 'How would you best describe your income?',
    options: [
      { value: 'w2', label: 'Steady W-2 / salaried, easy to document' },
      { value: 'self_employed', label: 'Self-employed / business owner — strong but harder to document' },
      { value: 'limited', label: 'Limited or hard-to-verify income' },
      { value: 'retired', label: 'Retired / fixed income' },
    ],
  },
  {
    key: 'CREDIT',
    title: "How's your credit?",
    options: [
      { value: 'excellent', label: 'Excellent (740+)' },
      { value: 'good', label: 'Good (680–739)' },
      { value: 'fair', label: 'Fair (620–679)' },
      { value: 'below_620', label: 'Below 620 / not sure' },
    ],
  },
  {
    key: 'EQUITY',
    title: 'Do you own a home or property with equity you could tap?',
    options: [
      { value: 'significant', label: 'Yes, significant equity' },
      { value: 'some', label: 'Yes, some equity' },
      { value: 'none', label: 'No / I rent' },
    ],
  },
  {
    key: 'PARTNER',
    title: 'Do you have access to a partner who could bring money and/or strong credit?',
    options: [
      { value: 'yes', label: 'Yes — money and/or credit' },
      { value: 'maybe', label: 'Maybe / not sure' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    key: 'RESERVES',
    title: 'After your down payment, how much could you keep in reserves?',
    options: [
      { value: 'none', label: 'Little to none' },
      { value: 'few_months', label: 'A few months of expenses' },
      { value: 'six_plus', label: '6+ months / strong cushion' },
    ],
  },
  {
    key: 'RENO',
    title: 'How much renovation work are you open to taking on?',
    help: 'Rough ranges — they match the Module 2 repair tiers and feed your "Cost To Make Rent Ready" in the analysis.',
    options: [
      { value: 'none', label: 'None — turnkey / rent-ready', gauge: '$0 in rehab' },
      { value: 'light', label: 'Light — cosmetic (paint, flooring, fixtures)', gauge: '~$5–$20 / sq ft, or ~$3,000–$7,500 / unit' },
      { value: 'medium', label: 'Medium — moderate (kitchens, baths, some systems)', gauge: '~$20–$50 / sq ft, or ~$7,500–$15,000 / unit' },
      { value: 'heavy', label: 'Heavy — full gut / major systems / structural', gauge: '~$50–$100+ / sq ft, or ~$15,000–$30,000+ / unit' },
    ],
  },
];

// ── Helper membership sets ──
const CASH_25K_PLUS = ['25_50k', '50_100k', '100_250k', '250k_plus'];
const CASH_50K_PLUS = ['50_100k', '100_250k', '250k_plus'];
const CASH_100K_PLUS = ['100_250k', '250k_plus'];
const CASH_LOW = ['under_10k', '10_25k'];
const CREDIT_GOOD_PLUS = ['excellent', 'good'];
const CREDIT_FAIR_PLUS = ['excellent', 'good', 'fair'];
const INCOME_DOCUMENTABLE = ['w2', 'self_employed', 'retired'];
const INCOME_SELF_LIMITED = ['self_employed', 'limited'];
const LIVE_YES_MAYBE = ['yes', 'maybe'];
const RESERVES_OK = ['few_months', 'six_plus'];
const RENO_MED_HEAVY = ['medium', 'heavy'];
const PARTNER_YES_MAYBE = ['yes', 'maybe'];
const EQUITY_ANY = ['significant', 'some'];
const CREDIT_WEAK = ['fair', 'below_620'];
const CASH_CREATIVE = ['under_10k', '10_25k', '25_50k']; // low-to-mid cash → creative finance fits
const CASH_NONE = 'under_10k';

const has = (arr, v) => arr.includes(v);

// ── Financing Options Library ──
// unlock(a) → boolean (the DISQUALIFIERS for each option live here); booster: shown under "Boosters".
// Highlighting ("Top fit") is driven by the best-fit path's financeIds, NOT per-option, so the
// recommended financing always stays coherent with the recommended strategy.
const FINANCING = [
  {
    id: 'fha',
    name: 'FHA loan (owner-occupant, ~3.5% down)',
    desc: "A government-backed loan for a home you'll live in. As little as 3.5% down and easier qualifying — perfect for a first house hack. You live in one part (up to a fourplex) for at least a year.",
    // Disqualified unless you'd live in the property.
    unlock: (a) => has(LIVE_YES_MAYBE, a.LIVE_IN),
    tag: (a) => (a.CREDIT === 'below_620' ? 'possible — FHA can go lower than other loans; verify with a lender' : null),
    note: () => 'Requires living there ~1 year.',
  },
  {
    id: 'oo_conv',
    name: 'Owner-occupied conventional (3–5% down)',
    desc: "A standard loan for a home you'll live in — often 3–5% down with solid credit, and cheaper long-term than FHA. Also works on a 2–4 unit you'll live in.",
    // Disqualified unless you'd live in AND have good+ credit.
    unlock: (a) => has(LIVE_YES_MAYBE, a.LIVE_IN) && has(CREDIT_GOOD_PLUS, a.CREDIT),
    note: () => 'Requires living there ~1 year.',
  },
  {
    id: 'conv_inv',
    name: 'Conventional investment loan (20–25% down)',
    desc: 'The standard rental-property loan — usually 20–25% down, 30-year fixed, the cheapest long-term money for a pure rental. Needs documentable income and good credit.',
    // Disqualified by low cash, weak credit, or hard-to-document income.
    unlock: (a) => has(CASH_25K_PLUS, a.CASH) && has(CREDIT_GOOD_PLUS, a.CREDIT) && has(INCOME_DOCUMENTABLE, a.INCOME),
  },
  {
    id: 'dscr',
    name: 'DSCR loan',
    desc: "Qualifies on the property's rental income, not your personal income — ideal if you're self-employed or scaling. Slightly higher rate, usually 20–25% down.",
    // Disqualified by low cash (still needs ~20–25% down) or weak credit.
    unlock: (a) => has(CASH_50K_PLUS, a.CASH) && has(CREDIT_GOOD_PLUS, a.CREDIT),
  },
  {
    id: 'commercial',
    name: 'Commercial loan (5+ units / apartments)',
    desc: "For 5+ unit apartment buildings and larger properties. Qualifies mainly on the building's income (NOI), not yours — so the property's performance is what matters. Typically 20–35% down, often with balloon terms.",
    // Disqualified without real capital and reserves.
    unlock: (a) => has(CASH_100K_PLUS, a.CASH) && has(RESERVES_OK, a.RESERVES),
  },
  {
    id: 'portfolio',
    name: 'Portfolio loan (local bank / credit union)',
    desc: 'Held by a local bank or credit union instead of being sold off — flexible, relationship-based, and often the best fit for self-employed or growing investors. Most want fair+ credit and some money down.',
    // Disqualified by sub-620 credit or very low cash.
    unlock: (a) => has(CREDIT_FAIR_PLUS, a.CREDIT) && !has(CASH_LOW, a.CASH),
  },
  {
    id: 'heloc',
    name: 'HELOC / cash-out refinance',
    desc: 'Turn equity in a home you already own into cash for a down payment. Combine it with any loan above to boost your buying power.',
    // Disqualified without equity to tap.
    unlock: (a) => has(EQUITY_ANY, a.EQUITY),
    booster: true,
  },
  {
    id: 'seller_fin',
    name: 'Seller financing (creative)',
    desc: 'The seller becomes the bank and you pay them over time — flexible down payment, rate, and terms. A powerful path when traditional financing is hard, or when you want creative terms. Always available with a motivated seller.',
    unlock: () => true,
  },
  {
    id: 'subto',
    name: 'Subject-to (creative, advanced)',
    desc: "You take over the seller's existing mortgage and make the payments, while the loan stays in their name. Often little to no money down. Powerful when you have little cash — but advanced; do it with guidance and a clear agreement.",
    // Surfaced for low-to-mid cash where creative finance does the heavy lifting.
    unlock: (a) => has(CASH_CREATIVE, a.CASH),
    note: () => 'Advanced — use proper paperwork and guidance.',
  },
  {
    id: 'wrap',
    name: 'Wraparound mortgage (creative, advanced)',
    desc: "You create a new loan that 'wraps' the seller's existing one: you pay the seller, and they keep paying their bank. Lets you buy with flexible, low-money-down terms. Advanced — best with experienced help.",
    unlock: (a) => has(CASH_CREATIVE, a.CASH),
    note: () => 'Advanced — use proper paperwork and guidance.',
  },
  {
    id: 'private',
    name: 'Private money (creative)',
    desc: 'Borrowing from an individual instead of a bank — fast and flexible, often used to fund a rehab before refinancing into a long-term loan.',
    // Most relevant when there is a rehab to fund or a partner/network to borrow from.
    unlock: (a) => has(RENO_MED_HEAVY, a.RENO) || has(PARTNER_YES_MAYBE, a.PARTNER),
  },
  {
    id: 'hard_money',
    name: 'Hard money (short-term rehab financing)',
    desc: 'Short-term, asset-based loans built for renovation projects. Fast and flexible but expensive — you refinance out once the work is done. Made for value-add / BRRRR.',
    // Disqualified when there is no real rehab (it is rehab financing).
    unlock: (a) => has(RENO_MED_HEAVY, a.RENO),
  },
  {
    id: 'partnership_cap',
    name: 'Partnership capital (creative)',
    desc: 'Team up with someone who brings money and/or credit while you bring the work. A great way to do your first deal when your own cash, credit, or income is the limiting factor.',
    // Disqualified without access to a partner.
    unlock: (a) => has(PARTNER_YES_MAYBE, a.PARTNER),
  },
];

// ── Strategy Library ──
const STRATEGIES = [
  {
    id: 'house_hack',
    name: 'House hacking',
    desc: 'Buy a 2–4 unit (or a house and rent the spare bedrooms), live in one part, and rent the rest. Lowest cash to start, best loan terms, and your tenants help pay your mortgage. The best first move for most beginners.',
    unlock: (a) => has(LIVE_YES_MAYBE, a.LIVE_IN),
  },
  {
    id: 'turnkey_sfh',
    name: 'Turnkey single-family buy-and-hold',
    desc: 'Buy a rent-ready single-family home and hold it for cash flow. Simple, passive, low-hassle — a clean way to own your first pure rental.',
    unlock: (a) => has(['none', 'light'], a.RENO) && (has(CASH_25K_PLUS, a.CASH) || has(LIVE_YES_MAYBE, a.LIVE_IN)),
  },
  {
    id: 'small_mf',
    name: 'Small multifamily (2–4 units)',
    desc: 'Buy a duplex, triplex, or fourplex for stronger cash flow than a single-family, while still using residential financing. A favorite for building real cash flow early.',
    unlock: (a) => has(LIVE_YES_MAYBE, a.LIVE_IN) || has(CASH_25K_PLUS, a.CASH),
  },
  {
    id: 'brrrr',
    name: 'Value-add / BRRRR',
    desc: 'Buy a property that needs work, renovate it to force up its value and rent, then refinance to pull your cash back out and repeat. Higher skill and more cash up front, but the fastest way to recycle your money. More advanced.',
    unlock: (a) => has(RENO_MED_HEAVY, a.RENO) && (has(RESERVES_OK, a.RESERVES) || has(PARTNER_YES_MAYBE, a.PARTNER)),
  },
  {
    id: 'commercial_mf',
    name: 'Commercial / 5+ unit apartments',
    desc: "Buy apartment buildings of 5+ units using commercial financing that qualifies on the building's income. Bigger deals, more cash flow, faster scaling — usually once you have more capital and reserves.",
    unlock: (a) => has(CASH_100K_PLUS, a.CASH) && has(RESERVES_OK, a.RESERVES),
  },
  {
    id: 'seller_fin_acq',
    name: 'Seller-financed / creative acquisition',
    desc: "Buy directly from a motivated seller who carries the financing — or take over their loan (subject-to / wrap). Lets you get creative on down payment and terms, often the path to a deal traditional financing can't touch. The main way to acquire with little or no money.",
    unlock: () => true,
  },
  {
    id: 'wholesale',
    name: 'Wholesaling / bird-dogging',
    desc: "Find great deals and hand them to investors who have the money — by assigning the contract (wholesaling) or simply referring the lead (bird-dogging) — and earn a fee. No money or credit required. It's the fastest way to make cash, learn the market, and build the network and capital for your own deals.",
    // Best path to start when cash/credit are the bottleneck.
    unlock: (a) => has(CASH_LOW, a.CASH) || a.INCOME === 'limited',
  },
  {
    id: 'partnership',
    name: 'Partnership',
    desc: 'Do the deal with a partner — they bring capital or credit, you bring the hustle (finding, analyzing, managing). The classic way to start when your own resources are the bottleneck.',
    unlock: (a) => has(PARTNER_YES_MAYBE, a.PARTNER),
  },
];

// Which non-booster financing options are actually unlocked for this profile
function unlockedFinancingIds(a) {
  return new Set(FINANCING.filter((f) => !f.booster && f.unlock(a)).map((f) => f.id));
}

// ── Best-Fit Path: first match wins ──
// Each path returns the recommended STRATEGY *and* the coherent FINANCING for that strategy
// (financeIds, in priority order). pick() guarantees we only recommend financing that's actually
// unlocked, falling back to seller financing (always available) so we never recommend something
// the person can't use — and we never pair, e.g., house hacking with seller financing.
function computeBestFit(a) {
  const unlocked = unlockedFinancingIds(a);
  const pick = (preferred) => {
    const avail = preferred.filter((id) => unlocked.has(id));
    return avail.length ? avail : ['seller_fin'];
  };
  const renoFlavor = has(RENO_MED_HEAVY, a.RENO) ? 'value-add' : 'turnkey';
  const lowMoney = has(CASH_LOW, a.CASH);

  // 1. House hacking — the lowest-cash, best-terms beginner move. Pair with owner-occupant loans ONLY.
  if (has(LIVE_YES_MAYBE, a.LIVE_IN)) {
    const fin = has(CREDIT_GOOD_PLUS, a.CREDIT) ? pick(['fha', 'oo_conv']) : pick(['fha']);
    const creditAside = has(CREDIT_WEAK, a.CREDIT)
      ? ' FHA is forgiving on credit, so it still works — and raising your score later opens cheaper conventional terms.'
      : '';
    return {
      kind: 'house_hack',
      title: 'Your best first move: House hacking',
      strategyId: 'house_hack',
      financeIds: fin,
      why: `Because you're open to living in the property for a year, you unlock the lowest-cash, best-terms way into real estate: an owner-occupant loan (FHA ~3.5% down, or conventional ~3–5% down) on a 2–4 unit. Live in one part, rent the rest, and your tenants help cover the mortgage.${lowMoney ? ' This is especially powerful for you — it keeps your required cash way down.' : ''}${creditAside}`,
    };
  }

  // 2. Low/no money + a potential partner → Partnership (your hustle, their capital/credit).
  if (lowMoney && has(PARTNER_YES_MAYBE, a.PARTNER)) {
    return {
      kind: 'partnership',
      title: 'Your best first move: Partner up',
      strategyId: 'partnership',
      financeIds: pick(['partnership_cap', 'seller_fin', 'conv_inv', 'dscr']),
      why: "Your own cash is the main bottleneck right now — but you have a potential partner. Team up: they bring the money and/or credit, you bring the hustle of finding, analyzing, and managing the deal. With a partner's capital and credit behind the deal, you can use normal financing and split the result. It's the classic way to get a first deal done.",
    };
  }

  // 3. Low/no money + no partner + won't live in → Start with little/no money (make cash + acquire creatively).
  if (lowMoney && a.PARTNER === 'no') {
    return {
      kind: 'no_money',
      title: 'Your best first move: Start with little or no money',
      strategyId: 'wholesale',
      financeIds: pick(['seller_fin', 'subto', 'wrap']),
      why: "You don't need money to start — you need a deal. Run two tracks at once: (1) make cash and learn the market now by wholesaling or bird-dogging — find great deals and hand them to investors who have the money, for a fee; and (2) acquire creatively from motivated sellers using seller financing or subject-to, which can need little to no money down. Use the income and network from track 1 to fund track 2. The plan at the bottom maps it out.",
    };
  }

  // 4. Self-employed / hard-to-document income, with capital + good credit → DSCR + small multifamily.
  if (has(INCOME_SELF_LIMITED, a.INCOME) && has(CASH_50K_PLUS, a.CASH) && has(CREDIT_GOOD_PLUS, a.CREDIT)) {
    return {
      kind: 'dscr',
      title: 'Your best first move: DSCR + small multifamily',
      strategyId: 'small_mf',
      financeIds: pick(['dscr', 'portfolio', 'conv_inv']),
      why: 'Your income is strong but harder to document the traditional way — so qualify on the property instead. A DSCR loan looks at the rental income, not your tax returns, and pairs perfectly with a 2–4 unit for real cash flow.',
    };
  }

  // 5. Strong capital + reserves → Commercial / larger multifamily.
  if (has(CASH_100K_PLUS, a.CASH) && has(RESERVES_OK, a.RESERVES)) {
    return {
      kind: 'commercial',
      title: 'Your best first move: Commercial / larger multifamily',
      strategyId: 'commercial_mf',
      financeIds: pick(['commercial', 'conv_inv', 'dscr']),
      why: "You have the capital and reserves to go bigger. Commercial loans on 5+ unit buildings qualify on the property's income, so you can scale cash flow faster. Prefer to start smaller? A 2–4 unit with a conventional or DSCR loan is a great on-ramp.",
    };
  }

  // 6. Default → Small multifamily buy-and-hold (financing matched to credit/income).
  const defFin = has(CREDIT_GOOD_PLUS, a.CREDIT) && has(INCOME_DOCUMENTABLE, a.INCOME)
    ? pick(['conv_inv', 'dscr', 'portfolio'])
    : pick(['dscr', 'portfolio', 'conv_inv', 'seller_fin']);
  return {
    kind: 'default',
    title: `Your best first move: Small multifamily buy-and-hold (${renoFlavor === 'value-add' ? 'value-add' : 'turnkey'})`,
    strategyId: 'small_mf',
    financeIds: defFin,
    why: `A 2–4 unit is the cleanest path to real cash flow with residential financing — usually ~20–25% down on an investment loan.${renoFlavor === 'value-add' ? " Since you're open to renovation, look for a value-add deal you can force appreciation on." : ' Target a turnkey property so you can start cash-flowing right away.'}`,
  };
}

export default function CapitalStrategyFinder({ onSave, existing, embedded, userId }) {
  const storageKey = userId ? `uc30_capital_strategy_${userId}` : null;

  const loadInitial = () => {
    if (existing?.answers && Object.keys(existing.answers).length === 8) return existing.answers;
    if (storageKey) {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
        if (saved?.answers) return saved.answers;
      } catch { /* ignore */ }
    }
    return {};
  };

  const [answers, setAnswers] = useState(loadInitial);
  const [step, setStep] = useState(() => {
    const a = loadInitial();
    return Object.keys(a).length === 8 ? 'results' : 0;
  });
  const [showMoreFinancing, setShowMoreFinancing] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const complete = answeredCount === 8;

  // Track whether the tool mounted already-complete (loaded from a prior save),
  // so we don't fire a redundant write on open — only persist on a genuine change.
  const mountedCompleteRef = useRef(complete);
  const savedSigRef = useRef(undefined);

  // Persist + bubble up whenever a complete set is reached (or changes)
  useEffect(() => {
    if (!complete) return;
    const sig = JSON.stringify(answers);
    // First pass for already-saved answers: mark as saved without re-writing
    if (mountedCompleteRef.current && savedSigRef.current === undefined) {
      savedSigRef.current = sig;
      return;
    }
    if (savedSigRef.current === sig) return;
    savedSigRef.current = sig;
    const payload = { answers, computedAt: new Date().toISOString() };
    if (storageKey) {
      try { localStorage.setItem(storageKey, JSON.stringify(payload)); } catch { /* ignore */ }
    }
    if (onSave) onSave({ capitalStrategy: payload });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete, JSON.stringify(answers)]);

  const selectOption = (qKey, value) => {
    setAnswers(prev => {
      const next = { ...prev, [qKey]: value };
      return next;
    });
    // Advance to next unanswered question (or results)
    if (typeof step === 'number') {
      if (step < QUESTIONS.length - 1) {
        setStep(step + 1);
      } else {
        setStep('results');
      }
    }
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setShowMoreFinancing(false);
    if (storageKey) {
      try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
    }
  };

  // ── Results computation ──
  const results = useMemo(() => {
    if (!complete) return null;
    const a = answers;
    const bestFit = computeBestFit(a);

    // Highlight + order financing by the recommended path's financeIds (keeps financing coherent
    // with the recommended strategy — e.g. house hacking leads with FHA, never seller financing).
    const recIndex = (id) => {
      const i = bestFit.financeIds.indexOf(id);
      return i === -1 ? 999 : i;
    };
    const financing = FINANCING.filter(f => !f.booster && f.unlock(a)).map(f => ({
      ...f,
      isHighlight: bestFit.financeIds.includes(f.id),
      tagText: f.tag ? f.tag(a) : null,
      noteText: f.note ? f.note(a) : null,
    }));
    financing.sort((x, y) => recIndex(x.id) - recIndex(y.id));

    const boosters = FINANCING.filter(f => f.booster && f.unlock(a));

    let strategies = STRATEGIES.filter(s => s.unlock(a)).map(s => ({ ...s }));
    strategies.sort((x, y) => {
      const xb = x.id === bestFit.strategyId ? 1 : 0;
      const yb = y.id === bestFit.strategyId ? 1 : 0;
      return yb - xb;
    });

    const showFoundation = bestFit.kind === 'no_money';

    // Is credit the ONE thing holding them back? (Everything else is ready.)
    const creditOnlyWeak = has(CREDIT_WEAK, a.CREDIT)
      && has(CASH_25K_PLUS, a.CASH)
      && a.INCOME !== 'limited'
      && has(RESERVES_OK, a.RESERVES);

    // ── "Build this first" cautions (shown at the bottom) ──
    const buildFirst = [];

    // Credit nudge — placed first when it's the only blocker (positive, specific framing).
    if (creditOnlyWeak) {
      buildFirst.push({
        title: 'You\'re close — raise your credit to unlock the best loans',
        text: a.CREDIT === 'below_620'
          ? 'Your cash, income, and reserves are in good shape — credit is the main thing holding you back. Getting into the 620s–680s opens portfolio and DSCR options, and 680+/740+ unlocks the cheapest conventional rates. Work on it in parallel and your options improve fast.'
          : 'You qualify for solid options today, but your credit is the one lever left. Pushing your score to 680+ (ideally 740+) drops your rate and opens the cheapest conventional and DSCR financing — a quick win worth chasing alongside your search.',
      });
    }

    // Reserves risk — keep at the bottom. When there's no cushion, advise against buying yet.
    if (a.RESERVES === 'none') {
      buildFirst.push({
        title: 'Build safe reserves before you buy',
        text: "This is the most important caution: never buy with no cushion. A single vacancy, repair, or surprise can sink a deal that has no reserves behind it — that's how beginners lose properties. Set aside a few months of expenses first. In the meantime you can still move forward without risking your own money — wholesale or bird-dog deals to investors who have cash, or partner with someone who brings the capital while you build your reserves.",
      });
    }

    // General credit caution (when weak but not the single blocker, and not already covered above).
    if (has(CREDIT_WEAK, a.CREDIT) && !creditOnlyWeak) {
      buildFirst.push({
        title: 'Strengthen your credit in parallel',
        text: 'Better credit unlocks better, cheaper financing and more options. Whatever path you start with, work on your score alongside it — it pays off on every future deal.',
      });
    }

    return {
      bestFit,
      financing,
      boosters,
      strategies,
      showFoundation,
      buildFirst,
      partnerUnlocked: has(PARTNER_YES_MAYBE, a.PARTNER),
    };
  }, [complete, JSON.stringify(answers)]);

  // ── RESULTS PAGE ──
  if (step === 'results' && results) {
    return (
      <ResultsPage
        results={results}
        answers={answers}
        onRestart={restart}
        showMoreFinancing={showMoreFinancing}
        setShowMoreFinancing={setShowMoreFinancing}
      />
    );
  }

  // ── QUESTION FLOW ──
  const qIndex = typeof step === 'number' ? step : 0;
  const q = QUESTIONS[qIndex];

  return (
    <div>
      {/* Progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.green, letterSpacing: 0.5 }}>
            CAPITAL &amp; STRATEGY FINDER
          </span>
          <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>{qIndex + 1} / {QUESTIONS.length}</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2, background: C.green,
            width: `${((qIndex) / QUESTIONS.length) * 100}%`, transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: q.help ? 8 : 20, lineHeight: 1.4 }}>
        {q.title}
      </h2>
      {q.help && (
        <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, marginBottom: 20 }}>{q.help}</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q.options.map(opt => {
          const isSelected = answers[q.key] === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => selectOption(q.key, opt.value)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '16px 18px', borderRadius: 12, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
                background: isSelected ? 'rgba(72,199,142,0.08)' : 'rgba(255,255,255,0.03)',
                border: isSelected ? '1px solid rgba(72,199,142,0.35)' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  border: isSelected ? '2px solid #48c78e' : '2px solid rgba(255,255,255,0.15)',
                  background: isSelected ? '#48c78e' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: isSelected ? 600 : 500, color: isSelected ? '#48c78e' : '#ddd' }}>
                    {opt.label}
                  </div>
                  {opt.gauge && (
                    <div style={{ fontSize: 12, color: '#777', marginTop: 3 }}>{opt.gauge}</div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Back link between questions */}
      {qIndex > 0 && (
        <button
          onClick={() => setStep(qIndex - 1)}
          style={{
            marginTop: 18, background: 'none', border: 'none', color: '#888',
            cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          ← Previous
        </button>
      )}
    </div>
  );
}

// ── Results Page ──
function ResultsPage({ results, answers, onRestart, showMoreFinancing, setShowMoreFinancing }) {
  const { bestFit, financing, boosters, strategies, showFoundation, buildFirst, partnerUnlocked } = results;

  const FINANCING_CAP = 5;
  const STRATEGY_CAP = 4;
  const visibleFinancing = showMoreFinancing ? financing : financing.slice(0, FINANCING_CAP);
  const hiddenCount = financing.length - FINANCING_CAP;
  const visibleStrategies = strategies.slice(0, STRATEGY_CAP);

  const sectionTitle = (text, color) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '24px 0 12px' }}>
      <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#eee', margin: 0 }}>{text}</h3>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.green, letterSpacing: 0.5 }}>
          YOUR RESULTS
        </span>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Your Capital &amp; Strategy Snapshot</h2>
      <p style={{ fontSize: 14, color: '#999', lineHeight: 1.6, marginBottom: 8 }}>
        Based on your answers, here are the financing options and strategies most likely to fit you.
      </p>

      {/* Best-Fit Path card */}
      <div style={{
        padding: '20px 22px', borderRadius: 14, marginTop: 16,
        background: 'linear-gradient(135deg, rgba(72,199,142,0.1), rgba(72,199,142,0.03))',
        border: '1px solid rgba(72,199,142,0.3)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.green, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
          ★ Best-Fit Path
        </div>
        <div style={{ fontSize: 19, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{bestFit.title}</div>
        <p style={{ fontSize: 14, color: '#cfe', lineHeight: 1.7, margin: 0 }}>{bestFit.why}</p>
      </div>

      {/* No-money starting plan — prominent, right under the best-fit card */}
      {showFoundation && (
        <div style={{ marginTop: 16 }}>
          <FoundationPath answers={answers} />
        </div>
      )}

      {/* Financing */}
      {sectionTitle('Financing you can likely use', C.gold)}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visibleFinancing.map(f => (
          <OptionCard
            key={f.id}
            name={f.name}
            desc={f.desc}
            highlight={f.isHighlight}
            tag={f.tagText}
            note={f.noteText}
            color={C.gold}
          />
        ))}
      </div>
      {!showMoreFinancing && hiddenCount > 0 && (
        <button
          onClick={() => setShowMoreFinancing(true)}
          style={{
            marginTop: 10, background: 'none', border: '1px dashed rgba(255,255,255,0.15)',
            color: '#aaa', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            padding: '10px 16px', borderRadius: 10, width: '100%',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          See {hiddenCount} more option{hiddenCount !== 1 ? 's' : ''}
        </button>
      )}

      {/* Strategies */}
      {sectionTitle('Strategies open to you', C.purple)}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visibleStrategies.map(s => (
          <OptionCard
            key={s.id}
            name={s.name}
            desc={s.desc}
            highlight={s.id === bestFit.strategyId}
            color={C.purple}
          />
        ))}
      </div>

      {/* Boosters */}
      {(boosters.length > 0 || partnerUnlocked) && (
        <>
          {sectionTitle('Boosters — ways to increase your buying power', C.red)}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {boosters.map(b => (
              <OptionCard key={b.id} name={b.name} desc={b.desc} color={C.red} />
            ))}
            {partnerUnlocked && (
              <OptionCard
                name="Partnership"
                desc="Bring in a partner with capital and/or credit while you bring the hustle — a direct way to increase what you can buy."
                color={C.red}
              />
            )}
          </div>
        </>
      )}

      {/* Build This First — cautions (reserves, credit) */}
      {buildFirst.length > 0 && (
        <>
          {sectionTitle('Build this first', C.gold)}
          {buildFirst.map((b, i) => (
            <div key={i} style={{
              padding: '14px 18px', borderRadius: 12, marginBottom: 10,
              background: 'rgba(240,165,0,0.05)', border: '1px solid rgba(240,165,0,0.2)',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.gold, marginBottom: 4 }}>{b.title}</div>
              <div style={{ fontSize: 13, color: '#bbb', lineHeight: 1.6 }}>{b.text}</div>
            </div>
          ))}
        </>
      )}

      {/* Disclaimer */}
      <div style={{
        marginTop: 24, padding: '14px 18px', borderRadius: 12,
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <p style={{ fontSize: 12, color: '#888', lineHeight: 1.7, margin: 0 }}>
          These are options to explore and confirm with a lender — not guarantees. Actual qualification
          depends on a full lender review of your specific situation. This is education, not financial
          or lending advice.
        </p>
      </div>

      {/* Retake */}
      <button
        onClick={onRestart}
        style={{
          marginTop: 16, background: 'none', border: '1px solid rgba(255,255,255,0.12)',
          color: '#aaa', cursor: 'pointer', fontSize: 13, fontWeight: 600,
          padding: '10px 18px', borderRadius: 10, fontFamily: "'DM Sans', sans-serif",
        }}
      >
        ↺ Retake the finder
      </button>
    </div>
  );
}

function OptionCard({ name, desc, highlight, tag, note, color }) {
  return (
    <div style={{
      padding: '14px 18px', borderRadius: 12,
      background: highlight ? `${color}0d` : 'rgba(255,255,255,0.02)',
      border: `1px solid ${highlight ? `${color}55` : 'rgba(255,255,255,0.07)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 14.5, fontWeight: 700, color: highlight ? color : '#eee' }}>{name}</span>
        {highlight && (
          <span style={{
            fontSize: 10, fontWeight: 700, color, letterSpacing: 0.5, textTransform: 'uppercase',
            background: `${color}1a`, padding: '2px 7px', borderRadius: 5,
          }}>Top fit</span>
        )}
      </div>
      <p style={{ fontSize: 13, color: '#bbb', lineHeight: 1.6, margin: 0 }}>{desc}</p>
      {tag && (
        <div style={{ fontSize: 12, color: C.gold, marginTop: 6, fontStyle: 'italic' }}>{tag}</div>
      )}
      {note && (
        <div style={{ fontSize: 12, color: '#777', marginTop: 6 }}>{note}</div>
      )}
    </div>
  );
}

function FoundationPath({ answers }) {
  // Action plan for the no-money profile: make cash + acquire creatively, in order of impact.
  const steps = [
    { title: 'Make money now: wholesale or bird-dog', text: 'You can earn cash in real estate before you ever own a property. Find great deals and hand them to investors who have the money — assign the contract (wholesaling) or just refer the lead (bird-dogging) — and collect a fee. It needs no money or credit, and it builds the skills, market knowledge, and network you\'ll use on your own deals.' },
    { title: 'Acquire creatively: seller financing, subject-to, wrap', text: 'Motivated sellers can carry the financing themselves, or let you take over their existing loan — often with little to no money down. These creative structures don\'t depend on a bank, so they\'re the main way to buy when cash and credit are tight.' },
    { title: 'Partner up', text: 'You may have said you don\'t have a partner yet — so go build one. Bring deals, hustle, and what you learn from wholesaling to someone with capital or credit. A partner is one of the fastest ways to do a first deal before your own resources are ready.' },
    { title: 'Build a savings runway', text: 'Set a target down-payment number and a date. Even a small automatic monthly amount — boosted by your wholesale income — compounds into your first down payment faster than you think.' },
  ];
  if (has(CREDIT_WEAK, answers.CREDIT)) {
    steps.push({ title: 'Repair / strengthen your credit', text: 'Better credit unlocks better, cheaper financing later. Start now and it improves in parallel with everything else.' });
  }
  if (answers.LIVE_IN === 'no') {
    steps.push({ title: 'Reconsider house hacking', text: 'If you could live in a 2–4 unit for one year, it\'s the lowest-cash entry that exists — as little as 3.5% down with an owner-occupant loan. Even being open to it changes what\'s possible.' });
  }

  return (
    <div style={{
      padding: '16px 18px', borderRadius: 12, marginBottom: 10,
      background: 'rgba(72,199,142,0.05)', border: '1px solid rgba(72,199,142,0.22)',
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.green, marginBottom: 6 }}>
        Your No-Money Starting Plan
      </div>
      <p style={{ fontSize: 13, color: '#bbb', lineHeight: 1.6, marginBottom: 12 }}>
        Little cash, no partner lined up, and not looking to live in a property — that's a starting line, not a
        stop sign. You don't need money to start; you need a deal and a little hustle. Here's the clearest path:
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 12 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(72,199,142,0.15)', color: C.green,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
            }}>{i + 1}</div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#ddd' }}>{s.title}</div>
              <div style={{ fontSize: 12.5, color: '#aaa', lineHeight: 1.6, marginTop: 2 }}>{s.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
