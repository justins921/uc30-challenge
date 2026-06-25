export const TRAINING_MODULES = [
  {
    id: 'mod1',
    moduleNumber: 1,
    title: 'Return Metrics & How Investors Profit',
    description: 'Understand the four ways real estate pays you and the core metrics that separate great deals from risky ones.',
    principles: [
      {
        id: 'mod1_p1',
        title: 'You profit four ways, not one',
        content: 'Most people think real estate only pays through cash flow. It pays four ways at once: **cash flow, appreciation, principal paydown, and tax benefits.** The best deals provide all four. The trap is buying for only one — especially appreciation.',
        questions: [
          {
            id: 'mod1_p1_q1',
            text: 'What are the four ways real estate pays you?',
            type: 'multiple_choice',
            options: [
              'Cash flow, financing, credit, appreciation',
              'Cash flow, appreciation, principal paydown, tax benefits',
              'Appreciation, management, reserves, vacancy',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod1_p2',
        title: 'Cash flow is what’s left after everything',
        content: 'Cash flow is the money remaining after **all** expenses — mortgage, taxes, insurance, maintenance, vacancy, management, and reserves. Example: $2,000 rent − $1,500 expenses = $500/month, or $6,000/year. It pays you today, builds reserves, lowers risk, and helps you buy more property. If a number leaves out reserves, it isn’t real cash flow.',
        questions: [
          {
            id: 'mod1_p2_q1',
            text: 'Cash flow is:',
            type: 'multiple_choice',
            options: [
              'The rise in a property’s value over time',
              'The money left after all expenses, debt, and reserves',
              'The return on the cash you invested',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod1_p3',
        title: 'Cash-on-cash measures how hard your money works',
        content: 'Cash-on-cash return = **annual cash flow ÷ cash invested.** Invest $100,000, earn $10,000/yr → 10%. When you use financing, this is usually your primary tool for comparing deals, because it shows how fast your money comes back — which is how fast you build reserves, reinvest, and scale.',
        questions: [
          {
            id: 'mod1_p3_q1',
            text: 'You invest $100,000 and the property produces $10,000/yr. Cash-on-cash is:',
            type: 'multiple_choice',
            options: ['5%', '10%', '20%'],
            correctAnswer: 1,
          },
          {
            id: 'mod1_p3_q2',
            text: 'Cash-on-cash mainly tells you:',
            type: 'multiple_choice',
            options: [
              'How hard your invested money is working',
              'How much the property will appreciate',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod1_p4',
        title: 'Cap rate measures the property, before financing',
        content: 'Cap rate = **NOI ÷ purchase price.** It shows how the property performs *before* any loan, which lets you compare properties and markets on equal footing. Cap rate is about the *property*; cash-on-cash is about *your money* after financing.',
        questions: [
          {
            id: 'mod1_p4_q1',
            text: 'A property has $20,000 NOI and costs $250,000. Cap rate is:',
            type: 'multiple_choice',
            options: ['6%', '8%', '10%'],
            correctAnswer: 1,
          },
          {
            id: 'mod1_p4_q2',
            text: 'The biggest difference between cap rate and cash-on-cash:',
            type: 'multiple_choice',
            options: [
              'They measure the same thing',
              'Cap rate is performance before financing; cash-on-cash is your return on invested cash after financing',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod1_p5',
        title: 'DSCR measures whether the income covers the debt',
        content: 'Debt Service Coverage Ratio = **NOI ÷ annual debt payments.** It tells you (and your lender) whether the property’s income comfortably covers its loan. A DSCR of 1.0 means income exactly equals the payment; lenders typically want **1.2 or higher** for a margin of safety. A stronger DSCR means easier approvals, better terms, and lower risk.',
        questions: [
          {
            id: 'mod1_p5_q1',
            text: 'DSCR compares:',
            type: 'multiple_choice',
            options: [
              'Purchase price to rent',
              'Net operating income to annual debt payments',
              'Down payment to loan amount',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod1_p5_q2',
            text: 'Most lenders like to see a DSCR of at least:',
            type: 'multiple_choice',
            options: ['0.8', '1.0', '1.2'],
            correctAnswer: 2,
          },
        ],
      },
      {
        id: 'mod1_p6',
        title: 'Tenants build your equity; appreciation is a bonus',
        content: 'Every payment chips down your loan balance — **principal paydown** your tenants effectively fund. Example: a $150,000 balance paid down to $146,000 in a year is $4,000 of equity built for you. **Appreciation** grows wealth too (a $200,000 property worth $206,000 a year later gained $6,000), but it’s never a reason to buy. Never purchase a property *because* you think it’ll go up.',
        questions: [
          {
            id: 'mod1_p6_q1',
            text: 'Principal paydown is:',
            type: 'multiple_choice',
            options: [
              'Yearly appreciation',
              'Loan-balance reduction over time that builds your equity',
              'Cash flow after expenses',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod1_p6_q2',
            text: 'The correct way to treat appreciation:',
            type: 'multiple_choice',
            options: [
              'The main reason to buy',
              'A bonus on top of a deal that already works',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod1_p7',
        title: 'Tax benefits are bigger than most people think',
        content: 'The government hands investors real advantages — **depreciation** (deductions even while the property gains value), **cost segregation** (accelerated depreciation for larger, earlier deductions), and ordinary **expense deductions.** These aren’t a rounding error; they can rival cash flow. Example: a $10,000 cash-flow year plus $8,000 in tax savings is really an $18,000 year. Most investors ignore this return source entirely.',
        questions: [
          {
            id: 'mod1_p7_q1',
            text: 'Depreciation lets you:',
            type: 'multiple_choice',
            options: [
              'Only deduct when the property loses value',
              'Claim deductions even as the property appreciates',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod1_p7_q2',
            text: 'Cost segregation is used to:',
            type: 'multiple_choice',
            options: [
              'Slow down depreciation',
              'Accelerate depreciation for larger, earlier deductions',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod1_p8',
        title: 'A high cash-on-cash return can hide danger',
        content: 'High cash-on-cash does **not** mean low risk. Compare:\n\n• **Property A:** 1% down, seller financing, 35% cash-on-cash\n• **Property B:** 25% down, conventional financing, 12% cash-on-cash\n\nMost beginners grab Property A. That can be a mistake — A may carry thin reserves, a balloon, refinance risk, high leverage, and razor-thin cash flow. A huge return often comes attached to a fragile structure.',
        questions: [
          {
            id: 'mod1_p8_q1',
            text: 'A property shows a 35% cash-on-cash return on 1% down with a balloon and almost no reserves. The right takeaway:',
            type: 'multiple_choice',
            options: [
              'Buy immediately — the return is huge',
              'The high return may be masking serious risk',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod1_p9',
        title: 'Risk-adjusted returns: same number, different danger',
        content: 'Two deals can show the **identical** return and carry completely different risk:\n\n• **Property A:** 12% cash-on-cash, 25% down, fixed financing, strong reserves, long-term loan\n• **Property B:** 12% cash-on-cash, 3% down, balloon payment, minimal reserves, short-term debt\n\nThe returns match. The risk does not. Great investors evaluate return **and** financing, reserves, and downside protection together. Wealthy investors ask “Will it survive? Will I sleep at night?” — not just “What’s the return?”',
        questions: [
          {
            id: 'mod1_p9_q1',
            text: 'Two properties both return 12%. What decides which is better?',
            type: 'multiple_choice',
            options: [
              'Whichever has the bigger loan',
              'Risk, reserves, financing structure, and downside protection',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod1_p10',
        title: 'Run every deal through the hierarchy, in order',
        content: 'Evaluate in this sequence, and stop if it fails an early level:\n\n1. **Survival** — can it withstand vacancy, repairs, a soft market? If not, STOP.\n2. **Cash flow** — is it positive?\n3. **Cash-on-cash** — does it hit your minimum return?\n4. **Total return** — cash flow + appreciation + paydown + tax benefits\n5. **Scalability** — can you repeat it?\n\nSurvival comes first. A deal that can’t survive stress isn’t a deal, no matter how good the projected return looks.',
        questions: [
          {
            id: 'mod1_p10_q1',
            text: 'What do you evaluate FIRST?',
            type: 'multiple_choice',
            options: [
              'Appreciation potential',
              'Whether it survives vacancies, repairs, and market shifts',
              'Tax benefits',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod1_p10_q2',
            text: 'The hierarchy, in order, is:',
            type: 'multiple_choice',
            options: [
              'Cash flow → survival → scalability → return',
              'Survival → cash flow → cash-on-cash → total return → scalability',
            ],
            correctAnswer: 1,
          },
        ],
      },
    ],
    keyTerms: [
      { term: 'Net Operating Income (NOI)', definition: 'A property’s income after operating expenses but BEFORE the mortgage payment. Rent (minus vacancy) minus costs like taxes, insurance, maintenance, and management — but not the loan. It’s the property’s profit before financing.' },
      { term: 'Operating expenses', definition: 'The ongoing costs of running the property — taxes, insurance, maintenance, management, utilities you pay. Does NOT include the mortgage.' },
      { term: 'Reserves', definition: 'Cash set aside to cover surprises — vacancies, repairs, a slow market. Reserves are what let a property survive bad months. Smart investors keep them no matter what.' },
      { term: 'Vacancy', definition: 'Income lost when a unit sits empty. Estimated as a percentage of rent so your analysis stays realistic instead of assuming 100% occupancy.' },
      { term: 'Down payment', definition: 'The cash you put in up front. The rest of the purchase price is borrowed.' },
      { term: 'Equity', definition: 'The portion of the property you actually own — its value minus what you still owe. Grows as you pay down the loan and as the property appreciates.' },
      { term: 'Leverage', definition: 'Using borrowed money to control a property worth far more than your cash invested. More leverage (less of your own money down) can boost returns — and increase risk.' },
      { term: 'Amortization', definition: 'The schedule over which a loan is paid off, often 30 years. Longer amortization means lower monthly payments.' },
      { term: 'Fixed-rate financing', definition: 'A loan whose interest rate never changes, so your payment stays the same for the life of the loan.' },
      { term: 'Conventional financing', definition: 'A traditional bank mortgage — usually fixed-rate with a long payoff, requiring income verification and a down payment.' },
      { term: 'Seller financing', definition: 'When the seller acts as the bank. Instead of getting all cash at closing, they let you pay over time, with negotiable price, interest rate, and terms.' },
      { term: 'Balloon payment', definition: 'A loan whose regular payments do NOT pay it off. After a set period (say 5 years), the entire remaining balance comes due at once — you must refinance, sell, or pay it off. Lower payments now, big risk later.' },
      { term: 'Refinance (refi)', definition: 'Replacing your current loan with a new one — often to get a better rate, pull cash out of your equity, or pay off a balloon before it’s due.' },
      { term: 'Depreciation', definition: 'A tax deduction based on the assumption that buildings wear out over time — which you can claim even while the property is rising in value.' },
      { term: 'Cost segregation', definition: 'A strategy that accelerates depreciation, creating larger deductions earlier and bigger near-term tax savings.' },
    ],
    completionMessage: 'Module 1 complete. You now know the four profit sources; the four core metrics (cash flow, cash-on-cash, cap rate, DSCR); why a high return can hide risk; how to weigh risk-adjusted returns; the exact order to judge any deal; and the key terms behind all of it. Next: turning these metrics into an accurate analysis of a real property.',
  },
  {
    id: 'mod2',
    moduleNumber: 2,
    title: 'Analyzing a Property',
    description: 'Learn how to run the numbers on any deal and know within minutes whether it’s worth pursuing.',
    principles: [],
    keyTerms: [],
    completionMessage: '',
    comingSoon: true,
  },
  {
    id: 'mod3',
    moduleNumber: 3,
    title: 'Your Buy Box & Your Edge',
    description: 'Define exactly what you’re looking for so you can move fast when the right deal appears.',
    principles: [],
    keyTerms: [],
    completionMessage: '',
    comingSoon: true,
  },
  {
    id: 'mod4',
    moduleNumber: 4,
    title: 'Financing & Becoming Bankable',
    description: 'Understand your financing options and what lenders actually look for.',
    principles: [],
    keyTerms: [],
    completionMessage: '',
    comingSoon: true,
  },
  {
    id: 'mod5',
    moduleNumber: 5,
    title: 'Deal Flow & Your Team',
    description: 'Build the pipeline and relationships that bring deals to you.',
    principles: [],
    keyTerms: [],
    completionMessage: '',
    comingSoon: true,
  },
  {
    id: 'mod6',
    moduleNumber: 6,
    title: 'Offers, Contracts & Protecting Yourself',
    description: 'Write offers that get accepted and contracts that protect you.',
    principles: [],
    keyTerms: [],
    completionMessage: '',
    comingSoon: true,
  },
  {
    id: 'mod7',
    moduleNumber: 7,
    title: 'Creative Deal Structure',
    description: 'Structure deals creatively when traditional financing doesn’t fit.',
    principles: [],
    keyTerms: [],
    completionMessage: '',
    comingSoon: true,
  },
  {
    id: 'mod8',
    moduleNumber: 8,
    title: 'Negotiation & Influence',
    description: 'Negotiate from a position of knowledge and build rapport that closes deals.',
    principles: [],
    keyTerms: [],
    completionMessage: '',
    comingSoon: true,
  },
  {
    id: 'mod9',
    moduleNumber: 9,
    title: 'Seller Problems & Motivation',
    description: 'Identify what sellers actually need and structure wins for both sides.',
    principles: [],
    keyTerms: [],
    completionMessage: '',
    comingSoon: true,
  },
  {
    id: 'mod10',
    moduleNumber: 10,
    title: 'Seeing Hidden Value',
    description: 'Spot the value others miss — the skill that makes great investors.',
    principles: [],
    keyTerms: [],
    completionMessage: '',
    comingSoon: true,
  },
];

export function getResolvedTrainingModules(trainingConfig = {}) {
  const { moduleOrder, moduleOverrides = {} } = trainingConfig;
  let modules = [...TRAINING_MODULES];

  modules = modules.map(mod => {
    const override = moduleOverrides[mod.id];
    if (!override) return mod;
    return {
      ...mod,
      ...(override.title !== undefined ? { title: override.title } : {}),
      ...(override.description !== undefined ? { description: override.description } : {}),
      ...(override.hidden !== undefined ? { hidden: override.hidden } : {}),
    };
  });

  if (moduleOrder && Array.isArray(moduleOrder) && moduleOrder.length > 0) {
    const byId = {};
    for (const m of modules) byId[m.id] = m;
    const ordered = moduleOrder.map(id => byId[id]).filter(Boolean);
    const remaining = modules.filter(m => !moduleOrder.includes(m.id));
    modules = [...ordered, ...remaining];
  }

  return modules;
}
