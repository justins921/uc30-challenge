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
        title: 'Cash flow is what\'s left after everything',
        content: 'Cash flow is the money remaining after **all** expenses — mortgage, taxes, insurance, maintenance, vacancy, management, and reserves. Example: $2,000 rent − $1,500 expenses = $500/month, or $6,000/year. It pays you today, builds reserves, lowers risk, and helps you buy more property. If a number leaves out reserves, it isn\'t real cash flow.',
        questions: [
          {
            id: 'mod1_p2_q1',
            text: 'Cash flow is:',
            type: 'multiple_choice',
            options: [
              'The rise in a property\'s value over time',
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
        content: 'Debt Service Coverage Ratio = **NOI ÷ annual debt payments.** It tells you (and your lender) whether the property\'s income comfortably covers its loan. A DSCR of 1.0 means income exactly equals the payment; lenders typically want **1.2 or higher** for a margin of safety. A stronger DSCR means easier approvals, better terms, and lower risk.',
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
        content: 'Every payment chips down your loan balance — **principal paydown** your tenants effectively fund. Example: a $150,000 balance paid down to $146,000 in a year is $4,000 of equity built for you. **Appreciation** grows wealth too (a $200,000 property worth $206,000 a year later gained $6,000), but it\'s never a reason to buy. Never purchase a property *because* you think it\'ll go up.',
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
        content: 'The government hands investors real advantages — **depreciation** (deductions even while the property gains value), **cost segregation** (accelerated depreciation for larger, earlier deductions), and ordinary **expense deductions.** These aren\'t a rounding error; they can rival cash flow. Example: if a property produces $10,000 in cash flow and $8,000 in tax savings, your total annual benefit is $18,000. Most investors ignore this return source entirely.',
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
        content: 'Two deals can show the **identical** return and carry completely different risk:\n\n• **Property A:** 12% cash-on-cash, 25% down, fixed financing, strong reserves, long-term loan\n• **Property B:** 12% cash-on-cash, 3% down, balloon payment, minimal reserves, short-term debt\n\nThe returns match. The risk does not. Great investors evaluate return **and** financing, reserves, and downside protection together. Wealthy investors ask "Will it survive? Will I sleep at night?" — not just "What\'s the return?"',
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
        content: 'Evaluate in this sequence, and stop if it fails an early level:\n\n1. **Survival** — can it withstand vacancy, repairs, a soft market? If not, STOP.\n2. **Cash flow** — is it positive?\n3. **Cash-on-cash** — does it hit your minimum return?\n4. **Total return** — cash flow + appreciation + paydown + tax benefits\n5. **Scalability** — can you repeat it?\n\nSurvival comes first. A deal that can\'t survive stress isn\'t a deal, no matter how good the projected return looks.',
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
      { term: 'Net Operating Income (NOI)', definition: 'A property\'s income after operating expenses but BEFORE the mortgage payment. Rent (minus vacancy) minus costs like taxes, insurance, maintenance, and management — but not the loan. It\'s the property\'s profit before financing.' },
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
      { term: 'Refinance (refi)', definition: 'Replacing your current loan with a new one — often to get a better rate, pull cash out of your equity, or pay off a balloon before it\'s due.' },
      { term: 'Depreciation', definition: 'A tax deduction based on the assumption that buildings wear out over time — which you can claim even while the property is rising in value.' },
      { term: 'Cost segregation', definition: 'A strategy that accelerates depreciation, creating larger deductions earlier and bigger near-term tax savings.' },
    ],
    completionMessage: 'Module 1 complete. You now know the four profit sources; the four core metrics (cash flow, cash-on-cash, cap rate, DSCR); why a high return can hide risk; how to weigh risk-adjusted returns; and the exact order to judge any deal. Next: turning these metrics into an accurate analysis of a real property.',
  },
  {
    id: 'mod2',
    moduleNumber: 2,
    title: 'Analyzing a Property',
    description: 'Turning a listing into a decision — gather the numbers, plug them in, and know your price.',
    principles: [
      {
        id: 'mod2_p1',
        title: 'Analysis exists to produce a decision, not a number',
        content: 'The point of analysis isn\'t to admire metrics. It\'s to answer one question: is this a buy, and at what price? The process is simple: **gather the right information, plug in the numbers, evaluate the result, then adjust the purchase price until the deal becomes a buy.** Every property has a price that makes it work — your job is to find it. The more deals you run, the faster and more natural it becomes.',
        questions: [
          {
            id: 'mod2_p1_q1',
            text: 'The real goal of analyzing a property is to:',
            type: 'multiple_choice',
            options: [
              'Collect as many metrics as possible',
              'Decide whether it\'s a buy and at what price',
              'Prove the property is perfect',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod2_p2',
        title: 'Two numbers make or break every deal',
        content: 'Investors lose on analysis in exactly two ways: **they estimate rents too high, and they estimate expenses too low.** Get those two right — conservatively — and everything downstream is reliable. Get either wrong and every result the calculator gives you is wrong too. Most of this module is about nailing those two numbers.',
        questions: [
          {
            id: 'mod2_p2_q1',
            text: 'The two most common analysis mistakes are:',
            type: 'multiple_choice',
            options: [
              'Wrong interest rate and wrong loan term',
              'Overestimating rent and underestimating expenses',
              'Wrong purchase price and wrong closing costs',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod2_p3',
        title: 'The CDS Rental Calculator — field by field',
        showCalculator: true,
        content: 'Fill it top to bottom. Some fields are dollars, some are percentages — the calculator marks which. Here\'s what each one means, a starter range where it helps, and how to verify it.\n\n**Property Details**\n- **Purchase Price ($):** the price you\'re analyzing. This is also the lever you\'ll adjust at the end to find your max price.\n- **Costs To Make Rent Ready ($):** every up-front dollar to get it rentable — repairs, renovations, and the vacancy/holding costs while you do the work.\n- **Down Payment (%):** the percent you put down. Range: conventional investment loans are typically 20–25%. Verify: ask your lender what they\'ll actually require.\n- **Closing Costs (%):** lender, title, and escrow fees. Range: 2–5% of price. Verify: your lender and title company will give you a real estimate.\n- **Years To Payoff:** the loan\'s amortization (default 30). Longer term = lower payment = stronger cash flow.\n- **Interest Rate (%):** get a real quote from a lender, not a guess. Even half a point changes the whole deal.\n\n**Monthly Income**\n- **Rents ($):** total monthly rent across all units. This is the single most important number — verify it (Principle 6).\n- **Other Income ($):** laundry, storage, pet rent, parking, etc. Enter $0 if none.\n- **Vacancy (%):** expected empty time. Range: 5–8% in a typical market. Use a higher number in soft or seasonal markets.\n\n**Yearly Expenses**\n- **Maintenance (%):** repairs and capital reserves (CapEx) as a percent of rent. Range: 8–15% — newer properties at the low end, older properties higher.\n- **Management (%):** Range: 8–10% of rent. Include it even if you\'ll self-manage — your time has value.\n- **Yearly Utilities ($):** owner-paid utilities only. Enter $0 if tenants pay.\n- **Additional Expenses ($):** HOA dues, landscaping, snow removal, trash, etc.\n- **Insurance ($/yr):** get a real quote from an insurance agent. Never guess this one.\n- **Taxes ($/yr):** pull the exact figure from the county — and ask whether taxes reassess (often higher) after a sale.\n\nThen press **Run Numbers.**',
        questions: [],
      },
      {
        id: 'mod2_p4',
        title: 'Reading your results',
        showCalculator: true,
        content: 'The results screen answers "is this a buy?" Here\'s what each output means and how it connects to the metrics from Module 1:\n\n- **Total Capital Required:** all the cash to get in — down payment + closing costs + costs to make rent ready. This is the "cash invested" your returns are measured against.\n- **Net Operating Income (NOI):** income after operating expenses but before the mortgage.\n- **Debt Service:** your total annual mortgage payments.\n- **Cashflow:** NOI minus debt service — the money left each year. Your primary survival number.\n- **Cash on Cash Return:** cashflow ÷ total capital required. How hard your invested cash is working.\n- **Cap Rate:** NOI ÷ purchase price — the property\'s return before financing.\n- **Principal Paydown:** the equity built this year as your tenants pay down the loan.\n- **Total Return on Investment:** cashflow + principal paydown, shown in dollars and as a percent of your cash invested.',
        questions: [],
      },
      {
        id: 'mod2_p5',
        title: 'Worked example — 104 12th St',
        showCalculator: true,
        content: 'Read straight off the results screen:\n\n- Purchase Price **$350,000**, Total Capital Required **$92,750**\n- NOI **$30,142** → Cap Rate = 30,142 ÷ 350,000 = **8.61%**\n- Debt Service **$19,395.09** → Cashflow = 30,142 − 19,395.09 = **$10,746.91**\n- Cash on Cash = 10,746.91 ÷ 92,750 = **11.59%**\n- Add Principal Paydown **$3,075.96** → Total Return = 10,746.91 + 3,075.96 = **$13,822.87**\n- Total Return % = 13,822.87 ÷ 92,750 = **14.90%**\n\nNotice the story the numbers tell: this deal cash-flows (survives), returns 11.59% on your cash, and once you add the equity your tenants build, your real return is **14.90%.** That\'s how you *read* an analysis — not one number, but the whole picture, in order.',
        questions: [
          {
            id: 'mod2_p5_q1',
            text: 'Cashflow on the results screen is:',
            type: 'multiple_choice',
            options: [
              'NOI ÷ purchase price',
              'NOI minus debt service',
              'Down payment plus closing costs',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod2_p5_q2',
            text: 'Total Capital Required is made up of:',
            type: 'multiple_choice',
            options: [
              'Down payment + closing costs + costs to make rent ready',
              'Purchase price minus the loan',
              'NOI minus expenses',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod2_p6',
        title: 'Never guess rent; verify it from multiple sources',
        content: 'Your rent estimate drives every result. The biggest beginner mistake is assuming rent is higher than the market truly supports — which makes a bad deal look good. Verify market rent using several sources, in roughly this priority:\n\n1. **Recently leased comparable properties (best source).** Find units that actually rented in the last 30–90 days — similar beds, baths, square footage, condition, and location. Note how fast they rented; a unit leased in 3 days is a stronger comp than one that sat 60 days.\n2. **Call local property managers.** Ask: What would this realistically rent for? How fast? What upgrades raise rent? What tenant class? What are current vacancy rates? Which utilities are tenant-paid?\n3. **Check active rental listings** (Zillow, Apartments.com, Facebook Marketplace, Rent.com, Craigslist). Watch days on market and price drops — don\'t blindly trust asking rents.\n4. **Call active listings** to gauge real demand. If you\'re comfortable, call as a prospective tenant to learn how negotiable pricing is and whether concessions are offered.\n5. **Use your own nearby rentals**, or lean on a local investor or mentor who knows the market.\n6. **AI & software** (ChatGPT, Claude, Rentometer, Zillow Rent Zestimate) — helpful for a starting range, but never your only source.\n7. **Be conservative.** Use rents you\'re confident you can actually achieve, and stress-test a lower number to be sure the deal still works.',
        questions: [
          {
            id: 'mod2_p6_q1',
            text: 'The strongest source of market rent is:',
            type: 'multiple_choice',
            options: [
              'The seller\'s asking rent',
              'Recently leased comparable units from the last 30–90 days',
              'A single online estimate',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod2_p6_q2',
            text: 'The safer way to estimate rent is to:',
            type: 'multiple_choice',
            options: [
              'Use the best-case number to make the deal work',
              'Use a conservative, achievable number and stress-test lower',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod2_p7',
        title: 'Estimate expenses conservatively, and verify the big ones exactly',
        content: 'The second way investors lose is underestimating expenses. Two rules of thumb: **the older the property, the higher your expenses; the lower the tenant quality, the higher your expenses.** Even if a property is newer or you expect great management, don\'t underwrite below realistic ranges — that\'s not optimism, it\'s bad analysis. Lean on professionals who aren\'t paid when you buy (property managers, contractors, insurance agents). And verify the two that swing hardest:\n\n- **Taxes:** get the exact county figure, and check whether they reassess after a sale — they often jump.\n- **Insurance:** get a real quote before you trust any number.\n\nRemember: tenant-paid utilities dramatically improve your expenses, and high-turnover properties cost far more than they look on paper. Verify everything before you submit an offer or remove contingencies.',
        questions: [
          {
            id: 'mod2_p7_q1',
            text: 'Which expenses should you verify with exact, real numbers rather than estimates?',
            type: 'multiple_choice',
            options: [
              'Maintenance and management',
              'Property taxes and insurance',
              'Vacancy and utilities',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod2_p7_q2',
            text: 'Compared to a newer building, an older property should generally be underwritten with:',
            type: 'multiple_choice',
            options: [
              'Lower expenses',
              'Higher maintenance and CapEx',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod2_p8',
        title: 'Estimating repairs (Costs To Make Rent Ready)',
        content: 'You are not trying to become a contractor. You\'re trying to get close enough to make an offer — the due-diligence period exists to verify the details later. Don\'t let repair uncertainty freeze you. When unsure, **estimate high**; a deal that still works on conservative repair numbers is a safe deal.\n\n**The three rehab categories (per square foot)**\n- **Cosmetic — $5–$20/sq ft:** paint, flooring, fixtures, landscaping, appliances, cleaning, minor repairs.\n- **Moderate — $20–$50/sq ft:** kitchens, baths, windows, HVAC replacement, partial plumbing/electrical.\n- **Heavy — $50–$100+/sq ft:** full gut, major plumbing/electrical, foundation, fire damage, structural.\n\n**Big-ticket cheat sheet**\n- **Roof:** ~$8,000–$40,000+ depending on size.\n- **HVAC:** furnace $4,000–$10,000; AC $4,000–$10,000; full system $8,000–$20,000+.\n- **Plumbing:** minor $500–$5,000; major repipe $5,000–$25,000+.\n- **Electrical:** panel upgrade $2,000–$5,000; full rewire $8,000–$30,000+.\n- **Foundation:** minor $2,000–$10,000; major $10,000–$100,000+.\n- **Kitchens:** budget $5,000–$15,000; mid $15,000–$30,000; high-end $30,000+.\n- **Bathrooms:** budget $3,000–$10,000; mid $10,000–$20,000; high-end $20,000+.\n\n**Multifamily shortcut (per unit)**\nLight turn $3,000–$7,500 · Moderate turn $7,500–$15,000 · Heavy turn $15,000–$30,000+.\n\n**The fastest accurate method — call a contractor.** Before you offer, call a roofer, HVAC tech, electrician, plumber, or general contractor and ask for a ballpark from photos and details.\n\n**What goes in "Costs To Make Rent Ready":** physical repairs/renovations, **plus** vacancy costs (lost rent while you work), **plus** holding costs (mortgage, taxes, insurance during the project). Most beginners forget the last two and overstate their returns.',
        questions: [
          {
            id: 'mod2_p8_q1',
            text: 'A cosmetic rehab typically runs about:',
            type: 'multiple_choice',
            options: [
              '$5–$20 per square foot',
              '$50–$100 per square foot',
            ],
            correctAnswer: 0,
          },
          {
            id: 'mod2_p8_q2',
            text: 'When you\'re unsure of a repair number, you should:',
            type: 'multiple_choice',
            options: [
              'Estimate low so the deal works',
              'Estimate high — a deal that survives conservative numbers is safer',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod2_p8_q3',
            text: '"Costs To Make Rent Ready" should include:',
            type: 'multiple_choice',
            options: [
              'Only the physical repair costs',
              'Repairs plus vacancy and holding costs during the work',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod2_p9',
        title: 'Find your max price by reverse-engineering the return',
        showCalculator: true,
        content: 'Once your inputs are solid, your last move is to adjust the **purchase price** until the cash-on-cash return hits your minimum requirement. That price is your **maximum acceptable price** — the most you can pay and still get the return you require. You\'re not trying to hit a return exactly to the decimal; you just need the property to meet or exceed your minimum. This is the skill that lets you make confident offers fast: you already know your number.\n\nAnd remember the UC30 rule: you do **not** need perfect numbers to make an offer. You need numbers that are reasonable, conservative, and good enough to move forward. Due diligence verifies your assumptions — it isn\'t a reason to wait for certainty. The investor who gets close enough and acts beats the one who waits.',
        questions: [
          {
            id: 'mod2_p9_q1',
            text: 'Your maximum acceptable price is:',
            type: 'multiple_choice',
            options: [
              'The seller\'s asking price',
              'The highest price you can pay and still hit your minimum return',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod2_p9_q2',
            text: 'To make an offer, your analysis needs to be:',
            type: 'multiple_choice',
            options: [
              'Perfect and fully verified',
              'Reasonable, conservative, and good enough — DD verifies the rest',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod2_p10',
        title: 'Practice — Run the numbers yourself',
        showCalculator: true,
        content: 'Time to apply everything you\'ve learned. Use the CDS Rental Calculator to analyze each property below and answer the questions.',
        scenarios: [
          {
            id: 'mod2_p10_prop1',
            title: 'Property 1 — Turn-key 4-plex',
            maxAttempts: 5,
            propertyListing: {
              title: 'Turn-key 4-plex',
              price: '$600,000',
              badges: ['4 Units', 'Turn-key', '$0 Rent-Ready'],
              highlights: [
                { icon: '🏠', value: '4', label: 'Units' },
                { icon: '💰', value: '$1,500', label: 'Per Unit/mo' },
                { icon: '🔑', value: 'Turn-key', label: 'Condition' },
              ],
              sections: [
                {
                  heading: 'Financing',
                  rows: [
                    { label: 'Down Payment', value: '25%' },
                    { label: 'Closing Costs', value: '2%' },
                    { label: 'Loan Term', value: '30 years' },
                    { label: 'Interest Rate', value: '6.5%' },
                  ],
                },
                {
                  heading: 'Income',
                  rows: [
                    { label: 'Monthly Rent', value: '$6,000', detail: '4 units × $1,500' },
                    { label: 'Vacancy', value: '6%' },
                  ],
                },
                {
                  heading: 'Expenses',
                  rows: [
                    { label: 'Maintenance + CapEx', value: '12%' },
                    { label: 'Management', value: '8%' },
                    { label: 'Insurance', value: '$1,000/yr' },
                    { label: 'Taxes', value: '$4,000/yr' },
                    { label: 'Utilities / Additional', value: '$0' },
                  ],
                },
              ],
            },
            inputs: [
              {
                id: 'mod2_p10_q1',
                label: 'What is the cash-on-cash return?',
                type: 'number',
                correctAnswer: 9.44,
                tolerance: 0.15,
                unit: '%',
              },
            ],
          },
          {
            id: 'mod2_p10_prop2',
            title: 'Property 2 — Same 4-plex, Higher Rate',
            description: 'Same property and inputs as Property 1, but with a higher interest rate.',
            maxAttempts: 5,
            propertyListing: {
              title: 'Turn-key 4-plex — Higher Rate',
              price: '$600,000',
              badges: ['4 Units', 'Turn-key', '7.5% Interest'],
              highlights: [
                { icon: '🏠', value: '4', label: 'Units' },
                { icon: '💰', value: '$1,500', label: 'Per Unit/mo' },
                { icon: '📈', value: '7.5%', label: 'Interest' },
              ],
              sections: [
                {
                  heading: 'Financing',
                  rows: [
                    { label: 'Down Payment', value: '25%' },
                    { label: 'Closing Costs', value: '2%' },
                    { label: 'Loan Term', value: '30 years' },
                    { label: 'Interest Rate', value: '7.5%' },
                  ],
                },
                {
                  heading: 'Income',
                  rows: [
                    { label: 'Monthly Rent', value: '$6,000', detail: '4 units × $1,500' },
                    { label: 'Vacancy', value: '6%' },
                  ],
                },
                {
                  heading: 'Expenses',
                  rows: [
                    { label: 'Maintenance + CapEx', value: '12%' },
                    { label: 'Management', value: '8%' },
                    { label: 'Insurance', value: '$1,000/yr' },
                    { label: 'Taxes', value: '$4,000/yr' },
                    { label: 'Utilities / Additional', value: '$0' },
                  ],
                },
              ],
            },
            inputs: [
              {
                id: 'mod2_p10_q2',
                label: 'What is the approximate cash-on-cash return at 7.5%?',
                type: 'multiple_choice',
                options: ['10.29%', '5.27%', '6.74%', '8.30%'],
                correctAnswer: 1,
              },
              {
                id: 'mod2_p10_q3',
                label: 'What interest rate would make the cash-on-cash return above 10%?',
                type: 'multiple_choice',
                options: ['6%', '6.5%', '5.5%', '5.25%'],
                correctAnswer: 3,
              },
            ],
          },
          {
            id: 'mod2_p10_prop3',
            title: 'Property 3 — Find the Price',
            description: 'Use the Seller Finance Solver to find the purchase price that hits each target return.',
            maxAttempts: 5,
            propertyListing: {
              title: '4-Unit — Find Your Price',
              badges: ['4 Units', '$1,500/unit', 'Tenant-paid Utilities'],
              highlights: [
                { icon: '🏠', value: '4', label: 'Units' },
                { icon: '💰', value: '$1,500', label: 'Per Unit/mo' },
                { icon: '🔍', value: '???', label: 'Price' },
              ],
              sections: [
                {
                  heading: 'Financing',
                  rows: [
                    { label: 'Down Payment', value: '25%' },
                    { label: 'Closing Costs', value: '2%' },
                    { label: 'Loan Term', value: '30 years' },
                    { label: 'Interest Rate', value: '6.5%' },
                  ],
                },
                {
                  heading: 'Income',
                  rows: [
                    { label: 'Monthly Rent', value: '$6,000', detail: '4 units × $1,500' },
                    { label: 'Vacancy', value: '6%' },
                  ],
                },
                {
                  heading: 'Expenses',
                  rows: [
                    { label: 'Maintenance', value: '12%' },
                    { label: 'Management', value: '8%' },
                    { label: 'Additional Expenses', value: '$1,000/yr' },
                    { label: 'Insurance', value: '$2,500/yr' },
                    { label: 'Taxes', value: '$6,000/yr' },
                    { label: 'Utilities', value: 'Tenant-paid ($0)' },
                    { label: 'Costs to Make Rent Ready', value: '$0' },
                  ],
                },
              ],
            },
            inputs: [
              {
                id: 'mod2_p10_q4',
                label: 'What purchase price produces a 10.00% cash-on-cash return?',
                type: 'number',
                correctAnswer: 535385,
                tolerance: 200,
                unit: '$',
              },
              {
                id: 'mod2_p10_q5',
                label: 'What purchase price yields a 12.00% cash-on-cash return?',
                type: 'number',
                correctAnswer: 503350,
                tolerance: 200,
                unit: '$',
              },
            ],
          },
        ],
      },
    ],
    keyTerms: [
      { term: 'Total Capital Required (cash to close)', definition: 'All the cash to get into the deal — down payment + closing costs + costs to make rent ready. Your returns are measured against this.' },
      { term: 'Costs To Make Rent Ready', definition: 'Every up-front cost to get a property rentable — repairs, renovations, and the vacancy/holding costs while the work happens.' },
      { term: 'Debt Service', definition: 'Your total mortgage payments over a year (principal + interest).' },
      { term: 'Market rent', definition: 'What a unit can actually rent for today, proven by recently leased comparable units — not the asking rent or a hopeful guess.' },
      { term: 'Comparable / "comp"', definition: 'A similar nearby property used to estimate rent or value — matched on beds, baths, size, condition, and location.' },
      { term: 'Days on market', definition: 'How long a listing has sat. Long days often signal weak demand or an overpriced unit.' },
      { term: 'CapEx (capital expenditures)', definition: 'Big-ticket replacements like roofs, HVAC, and water heaters. In the calculator, fold CapEx into the Maintenance %.' },
      { term: 'Tenant class', definition: 'The general quality/profile of tenants a property attracts; affects turnover, damage, and expenses.' },
      { term: 'Reassessment', definition: 'When the county re-values a property (often after a sale), which can raise property taxes above what the prior owner paid.' },
      { term: 'Turn / unit turn', definition: 'The cost and work to get a unit ready for the next tenant after one moves out.' },
      { term: 'Holding (carrying) costs', definition: 'The mortgage, taxes, and insurance you pay while a property sits vacant or under renovation.' },
      { term: 'Rent-ready', definition: 'Condition in which a unit is clean, repaired, and ready to lease immediately.' },
    ],
    completionMessage: 'Module 2 complete. You can now fill the CDS Rental Calculator field by field, read every result and what it means, verify rent and expenses the right way, estimate repairs fast enough to act, and reverse-engineer your maximum price. Next: defining your Buy Box and your edge — so you know exactly what you\'re analyzing for.',
  },
  {
    id: 'mod3',
    moduleNumber: 3,
    title: 'Your Game Plan',
    description: 'Done-for-you setup — you\'ll select and input, not write essays. Build the plan that runs your entire 30 days.',
    principles: [
      {
        id: 'mod3_p1',
        title: 'Your money & how you\'ll fund deals',
        showComponent: 'capitalConfirmation',
        content: 'This is where you build the plan that runs your entire 30 days. You won\'t fill blank pages — you\'ll move through three quick steps, in order, and everything saves into your plan automatically.\n\nWe go in this exact order, because each step decides what\'s even possible in the next:\n1. **Your money & how you\'ll fund deals** — what you have, and what it unlocks\n2. **Your goal** — how many properties, at what return, with what down payment\n3. **Your buy box** — exactly what you\'ll buy\n\nMoney first. How much cash you have and how you can finance decides which strategies are realistic — and that shapes everything else.\n\nBefore goals, before markets, get honest about the real cash you can put into a deal — not your emergency fund, not what you wish you had. This one number quietly decides your price range, your strategy, and your market.\n\n**What your cash actually buys.** With a normal investment loan you\'ll need roughly **25% down + 3–5% closing + any rent-ready repairs** — about 28–30%+ of the price in cash. A quick anchor: your max price ≈ your investable cash ÷ 0.30. So **$50,000 buys around a $165,000 property**, $30,000 buys around $100,000, and $100,000 buys around $330,000. Keep your reserves separate — that money isn\'t investable; it\'s what keeps a deal alive through a vacancy or repair.\n\n**Your money decides your strategy menu.** This is the part most beginners miss — how much cash and credit you have opens (or closes) different paths:\n- **Solid cash + good credit →** the simple route: a **Conventional** or **DSCR** loan with **Buy & Hold.** Put ~25% down and own it.\n- **Some cash, want to stretch it →** **BRRRR** (buy, rehab, rent, then refinance to pull your cash back out and repeat), or **house-hacking** (live in a 2–4 unit and put as little as 3.5–5% down).\n- **Little cash →** **Seller Financing** (negotiate a low or no down payment directly with the seller), a **JV / Partnership** (a partner brings the money, you bring the deal and the work), or **Hard Money** short-term that you refinance out of.\n- **No funding lined up yet →** that\'s fine for today, but getting a pre-approval or a lending relationship is your #1 job this week (Module 4 walks you through it).\n\nThe takeaway: you do **not** need a pile of cash to start — but you do need to know which path is yours, because you can\'t make offers you can\'t fund.\n\nUse the tool below to **Confirm Access to Capital.** Pick the one funding path that\'s true for you *today.* If you select "Still working on it," you\'ll see a warning — that\'s not discouragement, it\'s direction. Getting funded comes before going deep into deals; the fastest way to burn a relationship with a realtor or seller is an offer you can\'t close.',
        questions: [
          {
            id: 'mod3_p1_q1',
            text: 'Roughly how much cash do you need for a $200,000 rental with normal financing?',
            type: 'multiple_choice',
            options: [
              'About $10,000',
              'About $60,000',
              'The full $200,000',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod3_p1_q2',
            text: 'You have very little cash. Which paths are realistic?',
            type: 'multiple_choice',
            options: [
              'Only all-cash purchases',
              'Seller financing, a JV partner, house-hacking, or BRRRR',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod3_p2',
        title: 'Set your goal (properties, return, down payment)',
        showComponent: 'getClear',
        content: 'Now that you know what you can fund, turn your dream into a number you can plan around.\n\nUse the **Get Clear** tool below to work through each piece:\n\n- **Define Your Destination.** One line: where you\'re going and why (e.g., "$8,000/month so I can leave my W-2").\n- **Key Indicator.** Pick what you\'re optimizing: **Cash Flow, Appreciation, Equity, or Tax Benefits** — the four ways real estate pays you (Module 1). For UC30 and a first deal, choose **Cash Flow.**\n- **Where Am I Now / Where I Want To Be / Gap.** Honest today, clear target, and the gap between — the gap is the work.\n- **Time Frame.** A realistic number of years or months.\n- **Financial Plan Calculator.** Fill in the mad-libs: how much yearly cash flow you want, and the tool maps **how many properties per year**, at what value, what **% down**, and what **return** it takes to get there. Green fields auto-calculate. The simple idea behind it: **yearly cash flow ÷ your target return ≈ the equity you need working** (so $100,000 of cash flow at a 10% return needs about $1,000,000 of equity working).\n- **Why Is This Goal Important.** A sentence or two on *why.* This is the one thing worth putting into words — it\'s the fuel for the hard days.\n\nBe realistic: if the capital you\'d need is far beyond your means on your timeline, **extend the timeline, lower the near-term goal, or earn higher returns through better deals.** And remember — your next 30 days isn\'t the whole plan. It\'s **one deal.**\n\nComplete your plan and note your **target price per property**, your **down payment %**, and your **return** — these flow straight into your buy box.',
        questions: [
          {
            id: 'mod3_p2_q1',
            text: 'For UC30 and a first deal, optimize for:',
            type: 'multiple_choice',
            options: [
              'Appreciation',
              'Cash Flow',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod3_p2_q2',
            text: 'You want $50,000/year at a 10% return. Roughly how much equity must be working?',
            type: 'multiple_choice',
            options: [
              'About $50,000',
              'About $500,000',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod3_p3',
        title: 'Find your buy box (now it\'s clear)',
        showComponent: 'buyBox',
        content: 'Here\'s the payoff of doing money and goal first: your buy box almost fills itself in. Your **price range** comes from your cash, your **strategy and financing** from Step 1, and your **target** from your goal. The only real decision left is *where* — so let\'s settle that, then build.\n\n**Which market? (the part that stalls everyone)**\nDecide it with two lenses — **finance** and **ease** — and one test.\n\n**The ease case for local.** Your home market is the default: you know it, can drive it, see properties, self-manage, and build relationships face-to-face. For a first deal that\'s a real edge — *if the numbers work.*\n\n**The finance reality.** Local only wins if the math works. Many expensive markets — much of the coasts, metros like California, Seattle, Denver, NYC — can\'t cash flow, because prices are too high for rents to cover costs.\n\n**The test.** Pull a typical local property into the CDS Rental Calculator (Module 2). With your cash and a normal loan, does it hit your minimum cash-on-cash?\n- **Yes →** invest local — math *and* ease.\n- **No →** go out-of-area. For a cash-flow goal, that\'s normal and it works.\n\n**Picking an out-of-area market — finance filters:** affordability vs. your cash · rent near **1% of price** is strong (0.7%+ workable; pricey metros sit at 0.3–0.5%) · landlord-friendly laws · job and population growth · sane insurance and taxes. **Ease filters:** can you build a remote team led by a **property manager** (the linchpin) · can you visit once or twice · do you have an anchor · and **go deep in ONE market.** The model: **invest where the math works, operate through a team.** For UC30, **choose cash flow over appreciation.**\n\nUse the **Define Your Buy Box** tool below. Here\'s how to choose each field:\n- **Target Markets / Zip Codes** — your market from above.\n- **Property Types** — **beginner pick: SFR through 4-Plex.** (Small MF, Apartments, Commercial, Storage, Land are advanced.)\n- **Year Built / Bedrooms / Bathrooms** — a floor like 1980+ avoids the oldest systems; pick the rentable sweet spot (often ~3 bed / 2 bath).\n- **Condition Tolerance** — **beginner pick: Turnkey or Light Rehab.**\n- **Purchase Price Range + Down Payment** — straight from Step 1 (cash ÷ 0.30 ≈ your max).\n- **Strategy** — the path you chose in Step 1: *Buy & Hold* (default), *BRRRR, Seller Finance, STR, Section 8, Subto/Wrap.*\n- **Financing** — your funding path from Step 1: *Conventional, DSCR, Hard Money, Seller Finance, Cash, JV, Other.*\n- **Return Requirements** — set your **Minimum Cash-on-Cash** (e.g., 8%) as your primary filter; it\'s the number you reverse-engineer your max price against (Module 2). Add min Cap Rate, min Cash Flow/unit, or min IRR if you want.\n- **Additional Notes** — anything specific to you.\n\nFinish the Buy Box and **download your Buy Box PDF** — your hunting filter for the next 30 days.',
        questions: [
          {
            id: 'mod3_p3_q1',
            text: 'Why is the buy box easier to build last?',
            type: 'multiple_choice',
            options: [
              'It\'s not — it should come first',
              'Your money and goal already decide your price range, strategy, financing, and target',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod3_p3_q2',
            text: 'Your local market won\'t cash flow even with your full down payment. The realistic move is:',
            type: 'multiple_choice',
            options: [
              'Buy local anyway and hope it appreciates',
              'Invest in an affordable out-of-area market where the math works, run by a team',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod3_p4',
        title: 'Your plan is set',
        content: 'You now have your game plan captured: your **money and funding path**, your **goal** in real numbers, and your **buy box** (+ PDF) — exactly what you\'re hunting.\n\nOne habit for the 30 days: a **weekly reset.** Each week ask — what worked, what didn\'t, where did I waste time, what should I double down on, what should I cut. Knowledge means nothing without action; you don\'t need perfect conditions, you need consistency, because momentum compounds — and most people quit right before it builds.\n\n**Module 3 complete.** Money settled, goal set, buy box built. Next: financing — getting bankable and building your lending team before you need it.',
        questions: [],
      },
    ],
    keyTerms: [
      { term: 'Investable cash', definition: 'The real money you can deploy into deals while keeping reserves safe — not your emergency fund.' },
      { term: 'LTV (Loan-to-Value)', definition: 'The loan as a percent of value; 75% LTV means 25% down.' },
      { term: 'House-hacking', definition: 'Living in one unit of a 2–4 unit property (or a room) so you can buy with a low owner-occupant down payment while tenants help cover the mortgage.' },
      { term: 'BRRRR', definition: 'Buy, Rehab, Rent, Refinance, Repeat — recycle your cash into the next deal.' },
      { term: 'DSCR loan', definition: 'Financing based on the property\'s income covering its debt, rather than your personal income.' },
      { term: 'Hard money', definition: 'Fast, short-term, asset-based financing — higher cost, used for quick or heavy-rehab deals.' },
      { term: 'JV / Partnership', definition: 'A joint venture — one side brings capital, the other brings the deal and work.' },
      { term: 'Seller financing', definition: 'The seller acts as the bank, letting you pay over time with negotiable price, rate, and terms.' },
      { term: 'Conventional pre-approval', definition: 'A lender\'s confirmation of what you qualify to borrow on a standard mortgage.' },
      { term: '1% rule / price-to-rent', definition: 'A quick screen — monthly rent near 1% of price signals strong cash flow.' },
      { term: 'Turnkey', definition: 'A property already renovated and rent-ready.' },
      { term: 'STR (Short-Term Rental)', definition: 'Nightly/weekly rentals like Airbnb.' },
      { term: 'Section 8', definition: 'A federal program where the government pays part of a qualifying tenant\'s rent.' },
      { term: 'Subto / Wrap', definition: 'Advanced creative structures that take over or "wrap" a seller\'s existing mortgage. Not for beginners.' },
      { term: 'IRR (Internal Rate of Return)', definition: 'One annualized percentage blending cash flow, appreciation, and timing.' },
      { term: 'Appreciation vs. cash-flow market', definition: 'Expensive markets betting on price growth vs. affordable markets that pay steady monthly cash flow.' },
      { term: 'Out-of-area (remote) investing', definition: 'Buying away from where you live, run through a local team led by a property manager.' },
    ],
    completionMessage: 'Module 3 complete. Money settled, goal set, buy box built. Next: financing — getting bankable and building your lending team before you need it.',
  },
  {
    id: 'mod4',
    moduleNumber: 4,
    title: 'Financing & Becoming Bankable',
    description: 'The engine behind every deal — loan types, bankability, reserves, leverage, and matching the loan to your strategy.',
    principles: [
      {
        id: 'mod4_p1',
        title: 'Financing is the engine; line it up before the deal',
        content: 'The investor who already has financing ready moves fast and wins. The one who\'s "still working on it" loses deals to someone who isn\'t. Financing isn\'t paperwork you scramble for after you find a property — it\'s the engine you build *first*, so that when a good deal shows up you can move in hours, not weeks. Get your money ready before you go hunting.',
        questions: [
          {
            id: 'mod4_p1_q1',
            text: 'When should you line up your financing?',
            type: 'multiple_choice',
            options: [
              'After you\'ve found a deal and gone under contract',
              'Before you start hunting, so you can move fast when a deal appears',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod4_p2',
        title: 'Know the main loan types and what each is for',
        content: 'You don\'t need to master every loan — you need to know which tool fits which job:\n- **Conventional** — a standard bank mortgage (Fannie/Freddie). Best rates and long fixed terms, but needs solid credit, documented income, and usually **20–25% down** on a rental. There\'s a limit to how many you can hold.\n- **DSCR loan** — qualifies on the **property\'s income covering its debt**, not your personal income. Great once you own a few, or if you\'re self-employed. Slightly higher rate, fewer hoops.\n- **FHA / owner-occupant** — low down payment (as little as **3.5%**) if you\'ll *live in it*, including one unit of a 2–4 unit. The cheapest way for a beginner to get in (house-hacking).\n- **Hard money** — fast, short-term, asset-based financing with high rates and points. Used to **buy and rehab** quickly (BRRRR/flips), then you refinance out of it.\n- **Portfolio / local bank / commercial** — loans the lender keeps in-house, with flexible terms. Common for **5+ unit** properties or once you\'ve maxed out conventional loans.\n- **Seller financing** — the **seller acts as the bank**, letting you pay over time with negotiable price, rate, and terms. Powerful when a seller owns the property free-and-clear.',
        questions: [
          {
            id: 'mod4_p2_q1',
            text: 'You want to qualify based on the property\'s income rather than your W-2. Which loan fits?',
            type: 'multiple_choice',
            options: [
              'FHA',
              'DSCR',
              'Hard money',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod4_p2_q2',
            text: 'The cheapest way for a beginner to get in, if they\'ll live in one unit, is:',
            type: 'multiple_choice',
            options: [
              'Hard money',
              'An FHA / owner-occupant loan',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod4_p3',
        title: 'Become "bankable": make lenders want to say yes',
        content: '"Bankable" means a lender looks at you and easily approves you. Five things drive it:\n- **Credit score** — higher score, better rate and approval odds.\n- **Debt-to-income (DTI)** — your monthly debt payments vs. income; lower is better.\n- **Cash reserves** — money in the bank after closing (lenders want to see you can weather a rough patch).\n- **Documented income** — clean, provable income (tax returns, W-2s, or strong property numbers for DSCR).\n- **A clean paper trail** — organized statements, no surprise large deposits, no chaos.\n\nWork on these *before* you apply: pay down consumer debt, protect your credit, keep reserves, and keep clean records. Bankability buys you better rates, more approvals, and faster closings.',
        questions: [
          {
            id: 'mod4_p3_q1',
            text: '"Bankable" basically means:',
            type: 'multiple_choice',
            options: [
              'You have the most expensive property',
              'Lenders can easily approve you — good credit, low DTI, reserves, clean docs',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod4_p3_q2',
            text: 'Lowering your debt-to-income ratio makes you:',
            type: 'multiple_choice',
            options: [
              'Less likely to qualify',
              'More likely to qualify, at better terms',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod4_p4',
        title: 'Don\'t forget reserves and seasoning',
        content: 'Two things beginners overlook and lenders care about:\n- **Reserves** — lenders often want to see several months of mortgage payments sitting in the bank *after* you close. Showing up with exactly enough to close (and nothing left) is a red flag.\n- **Seasoning** — some lenders want funds or ownership to have been in place for a certain period (often a few months) before they\'ll lend on or refinance a property. It prevents last-minute shuffled money.\n\nPlan for both: keep reserves separate and untouched, and don\'t expect to refinance the day after you buy.',
        questions: [
          {
            id: 'mod4_p4_q1',
            text: '"Reserves" in a lender\'s eyes are:',
            type: 'multiple_choice',
            options: [
              'The down payment itself',
              'Money left in the bank after closing, to cover future payments',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod4_p5',
        title: 'Build your lending team before you need it',
        content: 'Don\'t wait until you have a deal to go meet lenders. Line up your bench now:\n- A **conventional mortgage lender or broker** for standard purchases.\n- A **DSCR or portfolio lender** for when you scale past conventional or want property-based qualifying.\n- Optionally a **hard-money lender** for BRRRR or fast/rehab deals.\n\nGet **pre-approved** so you know your numbers and can make offers with confidence. Lending is a relationship business — a lender who knows you and trusts you will move faster and bend further. The time to build those relationships is *before* the clock is ticking on a deal.',
        questions: [
          {
            id: 'mod4_p5_q1',
            text: 'The best time to meet lenders and get pre-approved is:',
            type: 'multiple_choice',
            options: [
              'After you\'re already under contract',
              'Before you start making offers',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod4_p6',
        title: 'Leverage is a tool, not a trophy',
        content: 'Leverage (borrowed money) multiplies your returns — and your risk. Bigger leverage with thin reserves is how investors get wiped out in a bad year. Watch the danger signs:\n- **Balloon payments** — the entire remaining balance comes due on a set date; you must refinance, sell, or pay it off, even if the market is bad that day.\n- **Adjustable-rate (ARM)** loans — the rate can jump later and spike your payment.\n- **Over-leverage** — borrowing so much that one vacancy or repair sinks the deal.\n- **Short terms** — less time before the loan must be dealt with.\n\nBorrow so the deal survives a *bad* year, not just a good one. This is the risk-adjusted-return thinking from Module 1, applied to your financing.',
        questions: [
          {
            id: 'mod4_p6_q1',
            text: 'A balloon payment means:',
            type: 'multiple_choice',
            options: [
              'Your payment slowly shrinks over time',
              'The whole remaining balance comes due on a set date',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod4_p6_q2',
            text: 'The right way to use leverage is to:',
            type: 'multiple_choice',
            options: [
              'Borrow as much as possible to maximize return',
              'Borrow so the deal still survives a bad year',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod4_p7',
        title: 'Match the loan to the strategy',
        content: 'The "best" loan depends entirely on the play you chose in Module 3:\n- **Buy & Hold →** conventional or DSCR (long, fixed, stable).\n- **BRRRR →** hard money to buy and rehab, then refinance into a DSCR or conventional loan.\n- **House-hack →** FHA / owner-occupant (lowest down payment).\n- **Low cash →** seller financing or a JV partner.\n\nPick the loan that fits the strategy and the property — not just whatever\'s familiar.',
        questions: [
          {
            id: 'mod4_p7_q1',
            text: 'For a BRRRR deal, the usual financing path is:',
            type: 'multiple_choice',
            options: [
              'Conventional from start to finish',
              'Hard money to buy/rehab, then refinance into a longer-term loan',
            ],
            correctAnswer: 1,
          },
        ],
      },
    ],
    keyTerms: [
      { term: 'Conventional loan', definition: 'A standard bank mortgage (Fannie/Freddie) with the best rates and long fixed terms; needs good credit, documented income, and a sizable down payment.' },
      { term: 'FHA / owner-occupant loan', definition: 'A low-down-payment loan available when you live in the property (including one unit of a 2–4 unit).' },
      { term: 'Portfolio loan', definition: 'A loan a bank keeps in-house rather than selling, allowing more flexible terms — common past conventional limits.' },
      { term: 'Commercial loan', definition: 'Financing for larger (typically 5+ unit) or commercial properties, underwritten mainly on the property\'s income.' },
      { term: 'Debt-to-income (DTI)', definition: 'Your monthly debt payments divided by your monthly income; lower is better for qualifying.' },
      { term: 'Credit score', definition: 'A number summarizing your creditworthiness; higher means better rates and easier approvals.' },
      { term: 'Reserves (lending sense)', definition: 'Cash a lender wants to see remaining in your account after closing, as a safety cushion.' },
      { term: 'Seasoning', definition: 'A required period that funds or ownership must be in place before a lender will lend or refinance.' },
      { term: 'Points', definition: 'An upfront fee on a loan, each point equal to 1% of the loan amount (common with hard money).' },
      { term: 'ARM (adjustable-rate mortgage)', definition: 'A loan whose interest rate can change over time, so the payment can rise.' },
      { term: 'Bankable', definition: 'Being the kind of borrower lenders readily approve — strong credit, low DTI, solid reserves, clean documentation.' },
    ],
    completionMessage: 'Module 4 complete. You know the main loan types, what makes you bankable, the reserves and seasoning lenders look for, who to line up before you need them, how to use leverage safely, and how to match the loan to your strategy. Next: deal flow and building the team that brings you deals.',
  },
  {
    id: 'mod5',
    moduleNumber: 5,
    title: 'Deal Flow & Your Team',
    description: 'Get deals coming to you, and a team that brings them. Learn where deals come from, how to build the relationships that produce them, and how to become the buyer everyone brings deals to first.',
    principles: [
      {
        id: 'mod5_p1',
        title: 'Deal flow is a system, not luck',
        content: 'The investor who sees the most deals wins. You\'re not hunting for one perfect property — you\'re building a *stream*, and the great deals surface from volume. Most beginners analyze two or three listings and wonder why nothing works; serious investors keep dozens flowing. Your real edge isn\'t a secret deal, it\'s the system that puts more deals in front of you than anyone else.',
        questions: [
          {
            id: 'mod5_p1_q1',
            text: 'The real key to finding great deals is:',
            type: 'multiple_choice',
            options: [
              'Getting lucky on one perfect listing',
              'Building a system that produces steady deal flow, so the good ones surface',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod5_p2',
        title: 'Know the two sources: on-market and off-market',
        content: 'Every deal comes from one of two places:\n- **On-market** — properties publicly listed for sale (the MLS, Zillow, Realtor.com, LoopNet). Easy to find and access, but you\'re competing with everyone else looking at the same listings.\n- **Off-market** — properties *not* publicly listed, reached by going straight to owners (direct mail, driving for dollars, calling/texting, wholesalers, expired and for-sale-by-owner listings, networking). Harder to find, but far less competition and usually better prices.\n\nStart **on-market** for speed — you can make offers this week. Build **off-market** over time for your real edge, where deals are cheaper because fewer people see them.',
        questions: [
          {
            id: 'mod5_p2_q1',
            text: 'Compared to on-market deals, off-market deals are usually:',
            type: 'multiple_choice',
            options: [
              'Easier to find but more competitive',
              'Harder to find but less competitive, with better pricing',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod5_p3',
        title: 'The fastest on-market lane: an investor-friendly agent',
        content: 'For a beginner, the single most valuable relationship is an **investor-friendly agent** — one who invests themselves or works with investors regularly. A good one will set you up with **MLS alerts** that email you new listings matching your buy box automatically, run comps, write your offers, and know which sellers are motivated. That\'s deal flow on autopilot.\n\nHow to find one: ask local investors for referrals, and look for an agent who *owns rentals* or specializes in investors — not one who only sells primary homes. Tell them your exact buy box (Module 3) so the deals they send actually fit.',
        questions: [
          {
            id: 'mod5_p3_q1',
            text: 'The most valuable on-market relationship for a beginner is:',
            type: 'multiple_choice',
            options: [
              'An investor-friendly agent who sends buy-box-matched MLS alerts',
              'A listing agent who only sells primary residences',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod5_p4',
        title: 'The off-market lanes (pick one or two, go deep)',
        content: 'Off-market is where the cheaper deals live. You don\'t need all of these — pick the one or two that fit the deal-flow strategy you chose in Module 3, and work them consistently:\n- **Direct mail** — letters/postcards to owners who fit your criteria (out-of-state owners, long-time owners, distressed).\n- **Driving for dollars** — spotting neglected properties in person and contacting the owners.\n- **Cold calling / texting** — reaching owners directly from a targeted list.\n- **Wholesalers** — people who lock up off-market deals and assign them to buyers; get on their buyer lists.\n- **FSBO & expired listings** — owners selling without an agent, or whose listing didn\'t sell; often more motivated.\n- **Networking & referrals** — other investors, property managers, and contractors who hear about deals first.\n\nDepth beats dabbling. One channel worked daily produces more than five touched occasionally.',
        questions: [
          {
            id: 'mod5_p4_q1',
            text: 'The smarter approach to off-market channels is to:',
            type: 'multiple_choice',
            options: [
              'Try all of them lightly at once',
              'Pick one or two that fit your strengths and work them consistently',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod5_p5',
        title: 'Arsenal contacts and target properties',
        content: 'Your whole deal-flow system comes down to two things — and your CRM tracks both:\n\n**Arsenal contacts** are anyone who can feed you deals. You build the relationship, stay top of mind, and make sure they know your buy box, so when a deal comes up, they think of you and bring it to you. Agents, property managers, lenders, contractors, wholesalers, other investors — anyone positioned to send you a deal belongs in your Arsenal. This is the engine: the bigger your Arsenal, the more deals flow in.\n\n**Target properties** are any properties you\'re actively pursuing. They come from your Arsenal contacts or your own hunting. In your CRM you log the property and its **owner\'s information**, and you note **how it reached you** — whether the Arsenal contact who brought it is the *owner* of the property, or just the person who passed you the lead.\n\nWhen a target property isn\'t a yes right now, it moves to **cold follow-ups** — the seller said "not now, maybe later," or the lead went quiet. You park it and circle back later, because today\'s "no" is often a future "yes." A target property you stop following is deal flow you threw away.\n\nSo the whole game is simple: **grow your Arsenal, let it feed you target properties, and never let a cold one fall off your follow-up list.**',
        questions: [
          {
            id: 'mod5_p5_q1',
            text: 'An Arsenal contact is:',
            type: 'multiple_choice',
            options: [
              'Any property you\'re pursuing',
              'Anyone who can feed you deals, who knows your buy box and stays in touch',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod5_p5_q2',
            text: 'A target property is:',
            type: 'multiple_choice',
            options: [
              'A property you\'re actively pursuing, logged with its owner info and how it reached you',
              'The agent who sent you the deal',
            ],
            correctAnswer: 0,
          },
          {
            id: 'mod5_p5_q3',
            text: 'A "cold follow-up" is:',
            type: 'multiple_choice',
            options: [
              'A deal you\'ve already closed',
              'A target property that\'s a "not now / maybe later," parked to revisit',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod5_p6',
        title: 'Build your team before you need it (and turn them into Arsenal)',
        content: 'You can\'t move fast on a deal if you\'re scrambling to find people after it appears. Line up your core team now:\n- **Investor-friendly agent** (Principle 3)\n- **Lender(s)** (Module 4)\n- **Property manager** — especially critical for out-of-area; the PM is the linchpin that makes a distant market manageable.\n- **Contractor** — for repair bids and rehab.\n- **Title company / closing attorney** — to close cleanly.\n- **Insurance agent** — for real quotes during analysis.\n\nMeet them *before* you have a deal so that when one shows up, you can act in hours, not weeks. And here\'s the bonus most people miss: every one of these people can double as an **Arsenal contact.** Agents, property managers, contractors, and lenders all hear about deals before the public does. Let each of them know your investing goals and your buy box, and they won\'t just help you close — they\'ll start bringing you potential deals too. Your team isn\'t only how you close; it\'s part of how you *source.*',
        questions: [
          {
            id: 'mod5_p6_q1',
            text: 'For out-of-area investing, the linchpin team member is:',
            type: 'multiple_choice',
            options: [
              'A great property manager',
              'A second real estate agent',
            ],
            correctAnswer: 0,
          },
          {
            id: 'mod5_p6_q2',
            text: 'Beyond helping you close, your team members can also:',
            type: 'multiple_choice',
            options: [
              'Become Arsenal contacts who bring you deals if they know your goals and buy box',
              'Only ever help with the one deal you hired them for',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod5_p7',
        title: 'Become the go-to buyer (turn deal flow inbound)',
        content: 'The highest level of deal flow is when deals come to *you* first. That happens when agents, wholesalers, and property managers know you\'re **serious, decisive, and you close.** Be the buyer everyone wants to work with:\n- Respond fast and know your buy box cold.\n- Make clean offers and don\'t back out without a real reason ("retrade").\n- Close when you say you will.\n- Be easy and pleasant to deal with.\n\nDo this a few times and word spreads. Your reputation flips deal flow from *outbound* (you chasing) to *inbound* (deals finding you) — which is the whole goal.',
        questions: [
          {
            id: 'mod5_p7_q1',
            text: 'You become the "go-to buyer" by being:',
            type: 'multiple_choice',
            options: [
              'The one who offers the most on every property',
              'Serious, decisive, easy to work with, and someone who actually closes',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod5_p8',
        title: 'Consistency is the whole game',
        content: 'Deal flow compounds. A little every day — a handful of analyses, a few new Arsenal contacts added, a round of cold follow-ups — beats occasional bursts of effort. The stream doesn\'t turn on the first day you work it; it builds. Most people quit right before it does. Show up daily, keep filling the top of the funnel, and the deals become inevitable.',
        questions: [
          {
            id: 'mod5_p8_q1',
            text: 'The best way to build deal flow is:',
            type: 'multiple_choice',
            options: [
              'A massive one-time push, then waiting',
              'A little consistent effort every day, because deal flow compounds',
            ],
            correctAnswer: 1,
          },
        ],
      },
    ],
    keyTerms: [
      { term: 'On-market', definition: 'Properties publicly listed for sale (MLS, Zillow, LoopNet). Easy to access, more competition.' },
      { term: 'Off-market', definition: 'Properties not publicly listed, reached by going directly to owners. Less competition, often better prices.' },
      { term: 'Investor-friendly agent', definition: 'A real estate agent who invests themselves or specializes in investors — sends buy-box-matched listings, runs comps, and writes offers.' },
      { term: 'Wholesaler', definition: 'Someone who puts an off-market property under contract and assigns that contract to a buyer for a fee; a source of off-market deals.' },
      { term: 'Arsenal contact', definition: 'Anyone who can feed you deals. You build the relationship, keep them aware of your buy box, and stay top of mind so they bring deals to you.' },
      { term: 'Target property', definition: 'Any property you\'re actively pursuing, logged in your CRM with the owner\'s information and how it reached you.' },
      { term: 'Cold follow-up', definition: 'A target property that\'s a "not now / maybe later," or a lead that went quiet — parked to revisit later instead of being lost.' },
      { term: 'FSBO (For Sale By Owner)', definition: 'A property the owner is selling without an agent — often a more motivated, negotiable seller.' },
      { term: 'Pocket listing', definition: 'A property quietly for sale that an agent hasn\'t broadly published — accessible through relationships.' },
      { term: 'Referral network', definition: 'The web of people (investors, PMs, contractors) who hear about deals early and send them your way.' },
    ],
    completionMessage: 'Module 5 complete. You know the two sources of deals, the fastest on-market lane, the off-market channels, how your Arsenal contacts feed you target properties (and how cold follow-ups keep the rest alive), who belongs on your team, and how to become the buyer deals come to first. Next: turning that deal flow into offers — and protecting yourself in the contract.',
  },
  {
    id: 'mod6',
    moduleNumber: 6,
    title: 'Offers, Contracts & Protecting Yourself',
    description: 'Turn a property into a deal — without ever getting trapped. Learn what an offer actually is, the terms that make it up, the contingencies that protect you, and how to write one.',
    principles: [
      {
        id: 'mod6_p1',
        title: 'The answer is always no unless you ask',
        content: 'Here\'s the hardest truth in this whole program: most deals are lost because **no offer was ever made.** You miss 100% of the offers you don\'t submit. Analysis, deal flow, a perfect buy box — none of it produces a single deal until an offer goes out. Making offers *is* the job. The investors who win aren\'t the ones with the best spreadsheets; they\'re the ones who actually ask.',
        questions: [
          {
            id: 'mod6_p1_q1',
            text: 'The single biggest reason beginners don\'t get deals is:',
            type: 'multiple_choice',
            options: [
              'They can\'t find any properties',
              'They analyze endlessly but never actually submit an offer',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod6_p2',
        title: 'An offer is NOT a commitment to buy',
        content: 'This is the unlock that makes everything else safe. A written offer with proper contingencies is **not** a promise to purchase — it\'s a starting point that you can walk away from, cleanly and with your deposit back, if the deal doesn\'t check out. That means you can make offers on many properties without being locked into any of them. The fear that stops most people ("what if they say yes and I\'m stuck?") is based on a misunderstanding. **Offer ≠ obligation.** Your contingencies (Principle 4) are the exits. Once you truly understand this, volume stops being scary and becomes your advantage.',
        questions: [
          {
            id: 'mod6_p2_q1',
            text: 'A written offer with proper contingencies means:',
            type: 'multiple_choice',
            options: [
              'You\'re legally forced to buy if they accept',
              'You have a deal you can still walk away from if it doesn\'t check out',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod6_p2_q2',
            text: 'Why does understanding "offer ≠ obligation" matter?',
            type: 'multiple_choice',
            options: [
              'It lets you safely make far more offers',
              'It removes the need for due diligence',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod6_p3',
        title: 'An offer is a package of terms, not just a price',
        content: 'Beginners think an offer is one number. It\'s actually a bundle of levers, and price is only one of them:\n- **Price** — what you\'ll pay.\n- **Earnest money** — your good-faith deposit (Principle 5).\n- **Closing date / timeline** — how fast you\'ll close.\n- **Contingencies** — your inspection, financing, and appraisal off-ramps.\n- **Financing terms** — how you\'re paying (loan type, or seller terms).\n- **Possession & what\'s included** — when you take over, and what conveys.\n\nThis matters because you can win deals on **terms** even when you can\'t move on **price.** A fast, clean close, a flexible possession date, or a larger deposit can make your offer the one a seller takes — without overpaying. Think in the whole package, not just the number.',
        questions: [
          {
            id: 'mod6_p3_q1',
            text: 'Beyond price, an offer also includes:',
            type: 'multiple_choice',
            options: [
              'Only the closing date',
              'Earnest money, timeline, contingencies, financing, and possession',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod6_p3_q2',
            text: 'You can often win a deal without raising your price by:',
            type: 'multiple_choice',
            options: [
              'Offering better terms — a faster close, flexibility, or a stronger deposit',
              'Removing all your contingencies',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod6_p4',
        title: 'Contingencies are your safety net',
        content: 'A contingency is a condition that must be met or you can cancel and get your earnest money back. They are exactly what makes "offer ≠ obligation" true. The common ones:\n- **Inspection / due-diligence contingency** — lets you verify the property\'s condition (and your numbers) and walk if it\'s not what you thought.\n- **Financing contingency** — lets you exit if your loan falls through.\n- **Appraisal contingency** — protects you if the property appraises below your price.\n\nEach one is an off-ramp that protects your deposit. As a beginner, **don\'t waive them lightly** — waiving contingencies to win a hot deal is how people get trapped in a bad one. Your safety lives in these clauses.',
        questions: [
          {
            id: 'mod6_p4_q1',
            text: 'A contingency is:',
            type: 'multiple_choice',
            options: [
              'A penalty you pay the seller',
              'A condition that lets you cancel and recover your earnest money if it isn\'t met',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod6_p4_q2',
            text: 'As a beginner, you should treat waiving contingencies as:',
            type: 'multiple_choice',
            options: [
              'A normal way to win deals',
              'Risky — it removes the protections that let you walk safely',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod6_p5',
        title: 'Earnest money: skin in the game, not money lost',
        content: 'Earnest money (an "EMD," earnest money deposit) is a good-faith deposit you put up to show the seller you\'re serious. Key facts a beginner needs:\n- It\'s **held by a neutral third party** (a title company or escrow), not handed to the seller.\n- It\'s **refundable** if you cancel *within* your contingencies — you get it back.\n- It\'s **at risk** only if you walk for a reason your contract doesn\'t allow.\n- A **larger deposit** makes your offer look stronger — but puts more on the line, so size it to your risk.\n\nSo earnest money isn\'t money you\'re throwing away. Used correctly, it strengthens your offer while staying protected by your contingencies.',
        questions: [
          {
            id: 'mod6_p5_q1',
            text: 'Earnest money is:',
            type: 'multiple_choice',
            options: [
              'A non-refundable fee paid directly to the seller',
              'A good-faith deposit held in escrow, refundable within your contingencies',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod6_p5_q2',
            text: 'A larger earnest money deposit:',
            type: 'multiple_choice',
            options: [
              'Makes your offer stronger but puts more at risk',
              'Is always required to be non-refundable',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod6_p6',
        title: 'Due diligence is where you verify everything',
        content: 'Getting an offer accepted doesn\'t mean you\'re locked in — it starts your **due-diligence period.** This is the window (before your contingencies expire) where you confirm the deal is real: inspect the property, verify the rents, get true repair bids, and lock your financing. This is exactly where the conservative estimates you made in Module 2 get checked against reality.\n\nIf everything holds up — close. If it doesn\'t — you have two honest moves: **renegotiate** the price/terms based on what you found, or **walk** within your contingencies and recover your deposit. Due diligence is your protection, not a formality to rush.',
        questions: [
          {
            id: 'mod6_p6_q1',
            text: 'The due-diligence period is when you:',
            type: 'multiple_choice',
            options: [
              'Are already legally committed with no way out',
              'Verify the property, the rents, the repairs, and your financing before you\'re locked in',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod6_p6_q2',
            text: 'If due diligence reveals the deal is worse than you thought, you can:',
            type: 'multiple_choice',
            options: [
              'Only proceed at the agreed price',
              'Renegotiate, or walk within your contingencies and recover your deposit',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod6_p7',
        title: 'Writing the offer: on-market vs FSBO',
        content: 'How you actually paper the offer depends on the deal:\n- **On-market (listed with an agent):** your investor-friendly agent writes the offer on your state\'s standard purchase forms. This is the easy path — the forms already include the standard contingencies, and your agent guides the terms.\n- **For-sale-by-owner / off-market (no agent on the other side):** there\'s no agent writing it up, so you bring in a **title company or a real estate attorney** to prepare and review the contract. Do **not** freelance a purchase agreement from a template you found online and hope it holds — get a professional to paper it correctly.\n\nEither way, the contract should clearly state price, earnest money, contingencies, closing date, and what\'s included.',
        questions: [
          {
            id: 'mod6_p7_q1',
            text: 'On a for-sale-by-owner deal with no agent involved, you should:',
            type: 'multiple_choice',
            options: [
              'Write your own contract from an online template and sign it',
              'Use a title company or real estate attorney to prepare and review the contract',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod6_p8',
        title: 'Protect yourself: use the professionals, always',
        content: 'A few habits keep you safe on every deal, and they matter more the more creative the deal gets:\n- **Close through a title company or attorney.** They confirm the seller actually owns the property (clear title) and that the transfer is done right.\n- **Get everything in writing.** Verbal agreements aren\'t deals. If it\'s not in the contract, it doesn\'t exist.\n- **Never let excitement skip steps.** The deal that "has to close today or you lose it" is the one to slow down on.\n- **Use licensed professionals in your state** for legal, tax, and financial questions.\n\nProtecting yourself isn\'t the boring part of investing — it\'s what lets you make offers boldly, because you know your downside is covered.',
        questions: [
          {
            id: 'mod6_p8_q1',
            text: 'The right way to close, especially on a FSBO or creative deal, is:',
            type: 'multiple_choice',
            options: [
              'Hand the money directly to the seller and get the keys',
              'Close through a title company or attorney who confirms clear title',
            ],
            correctAnswer: 1,
          },
        ],
      },
    ],
    keyTerms: [
      { term: 'Offer / purchase agreement', definition: 'The written contract proposing your price and terms to buy a property. With proper contingencies, it\'s a starting point you can still exit — not an automatic obligation to buy.' },
      { term: 'Earnest money (EMD)', definition: 'A good-faith deposit, held by a neutral third party (title/escrow), that shows you\'re serious. Refundable if you cancel within your contingencies.' },
      { term: 'Contingency', definition: 'A condition in the contract that must be met or you can cancel and recover your earnest money — your safety net and your exit.' },
      { term: 'Inspection / due-diligence contingency', definition: 'Lets you verify the property\'s condition and your numbers, and walk if it doesn\'t hold up.' },
      { term: 'Financing contingency', definition: 'Lets you exit if your loan falls through.' },
      { term: 'Appraisal contingency', definition: 'Protects you if the property appraises below your offer price.' },
      { term: 'Due-diligence period', definition: 'The window after acceptance, before contingencies expire, when you verify everything before you\'re fully committed.' },
      { term: 'Closing date', definition: 'The agreed date the sale is finalized and ownership transfers.' },
      { term: 'Possession', definition: 'When you actually take control of the property (not always the same as closing).' },
      { term: 'Title company / escrow', definition: 'The neutral party that holds the deposit, confirms clear title, and handles the closing.' },
      { term: 'Clear title', definition: 'Confirmation that the seller truly owns the property and can sell it free of undisclosed claims or liens.' },
      { term: 'Addendum', definition: 'An add-on document that changes or adds terms to the contract.' },
    ],
    completionMessage: 'Module 6 complete. You know that making offers is the job, that an offer with contingencies is never a trap, that an offer is a package of terms you can flex, how earnest money and due diligence protect you, and how to paper a deal correctly on-market or FSBO. Next: creative deal structure — the tools to make a deal work when a standard offer won\'t.',
  },
  {
    id: 'mod7',
    moduleNumber: 7,
    title: 'Creative Deal Structure',
    description: 'Make a deal work when a standard offer can\'t — by changing how it\'s paid, not just what you pay.',
    principles: [
      {
        id: 'mod7_p1',
        title: 'Creative structure changes the terms, not just the price',
        content: 'When price alone can\'t make a deal work, you change *how* it\'s paid. Every financed purchase has four levers you can negotiate:\n- **Price** — what you pay.\n- **Down payment** — how much cash you put in up front.\n- **Interest rate** — the cost of the financing.\n- **Term / length** — how long you have to pay it off.\n\nMove any one of these and the whole deal changes. A high price with a low rate and little down can cash-flow better than a low price with bank financing. Creative investors stop fighting over price alone and start trading across all four levers.',
        questions: [
          {
            id: 'mod7_p1_q1',
            text: 'Creative structure mostly works by:',
            type: 'multiple_choice',
            options: [
              'Always paying the lowest possible price',
              'Adjusting how the deal is paid — price, down, rate, and term — not just the price',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod7_p2',
        title: 'Seller financing: the seller becomes the bank',
        content: 'The most common creative tool is **seller financing** — instead of getting a bank loan, the *seller* lets you pay them over time. You agree on the price, down payment, interest rate, and term, and you pay the seller directly (documented with a promissory note). Why it\'s powerful:\n- **No bank qualification** — the seller decides, not an underwriter.\n- **Flexible terms** — rate, down, and length are all negotiable.\n- **Faster, cleaner close** — no lender timeline.\n- **Often better terms** than a bank would give.\n\nIt tends to work when the seller **owns the property free-and-clear (or close to it)**, doesn\'t need all the cash today, and would rather have steady monthly income (and possibly spread out their taxes) than a lump sum.',
        questions: [
          {
            id: 'mod7_p2_q1',
            text: 'In seller financing:',
            type: 'multiple_choice',
            options: [
              'A bank lends you the money as usual',
              'The seller acts as the bank and you pay them over time',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod7_p2_q2',
            text: 'Seller financing tends to work best when the seller:',
            type: 'multiple_choice',
            options: [
              'Owns free-and-clear and prefers income over a lump sum',
              'Owes more than the property is worth',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod7_p3',
        title: 'The four levers, and the art of trading them',
        content: 'This is the core skill of creative structure. Each lever does something specific:\n- **Price** — sellers often care about this *most* (it\'s emotional and public). You can often give here if you win elsewhere.\n- **Down payment** — a lower down keeps more of your cash for reserves and the next deal.\n- **Interest rate** — a lower rate means a lower payment, which means stronger cash flow.\n- **Term** — a longer term lowers the payment; a shorter term (or a balloon) raises it.\n\nThe art: **give the seller the one thing they care about most, and win on the rest.** If a seller is fixated on full asking price, agree to it — *in exchange* for a low interest rate, a small down payment, and a long term. You "lose" on price and win on the three levers that actually drive your cash flow. That\'s how a full-price offer can still be a great deal.',
        questions: [
          {
            id: 'mod7_p3_q1',
            text: 'The smartest way to use the four levers is to:',
            type: 'multiple_choice',
            options: [
              'Win on every lever at once',
              'Give the seller what they care about most and win on the others',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod7_p3_q2',
            text: 'Agreeing to full price can still be a great deal if you get:',
            type: 'multiple_choice',
            options: [
              'A low rate, low down payment, and long term',
              'A balloon due in six months',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod7_p4',
        title: 'Balloons: lower payments now, but you need an exit',
        content: 'A **balloon** is a loan where the regular payments are small, but after a set period (say 5 years) the *entire remaining balance comes due at once.* You then have to refinance, sell, or pay it off. Balloons can make a deal cash-flow beautifully in the early years — but they carry a hard deadline.\n\nThe rule for beginners: **never agree to a balloon you don\'t have a realistic plan to handle.** Before you accept one, know your exit — will you refinance into a bank loan, sell, or have the cash? If you can\'t answer that, the balloon is a trap, not a tool. Longer balloons (or no balloon) are safer; short balloons are where people get burned.',
        questions: [
          {
            id: 'mod7_p4_q1',
            text: 'A balloon payment means:',
            type: 'multiple_choice',
            options: [
              'The loan is fully paid off by the regular payments',
              'A large remaining balance comes due all at once after a set period',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod7_p4_q2',
            text: 'Before accepting a balloon, you must:',
            type: 'multiple_choice',
            options: [
              'Have a realistic exit — refinance, sell, or pay it off',
              'Nothing; balloons handle themselves',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod7_p5',
        title: 'Match the structure to the seller\'s real motivation',
        content: 'Every creative deal works because it solves the *seller\'s* actual problem. Your job is to find what they really want, then structure to it:\n- Wants **maximum price** — give price, take your win on the terms.\n- Wants **monthly income** — seller financing with interest gives them a steady check.\n- Wants a **fast, clean exit** — a quick, certain close can beat a higher messy offer.\n- Wants to **defer taxes** — spreading payments over time (an installment sale) may help them (their tax advisor confirms).\n\nYou can\'t structure well until you know the motivation — which is exactly what the next module is about. Listen first, structure second.',
        questions: [
          {
            id: 'mod7_p5_q1',
            text: 'The starting point for any creative structure is:',
            type: 'multiple_choice',
            options: [
              'The structure you personally prefer',
              'What the seller actually wants and needs',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod7_p6',
        title: 'The multiple-offer method',
        content: 'Instead of a single take-it-or-leave-it offer, present the seller **two or three structured options** at once. For example:\n- **Option A:** a lower all-cash price, fast close.\n- **Option B:** a higher price with seller financing.\n- **Option C:** full asking price with specific terms (low rate, low down, long term).\n\nThis does three things: it shifts the conversation from "yes or no" to "**which one**," it lets the seller feel in control, and it reveals what they actually value by which option they lean toward. It\'s especially powerful on for-sale-by-owner and off-market deals, where you\'re talking to the seller directly. Give them a menu, not an ultimatum.',
        questions: [
          {
            id: 'mod7_p6_q1',
            text: 'The multiple-offer method works because it:',
            type: 'multiple_choice',
            options: [
              'Forces the seller into one yes-or-no decision',
              'Turns the question into "which option," giving the seller control and revealing what they value',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod7_p7',
        title: 'Advanced structures (handle with extreme care)',
        content: 'Some creative tools are powerful but carry serious legal, tax, and ethical risk. These are **not** beginner moves and should never be done solo:\n- **Subject-to** — taking over the seller\'s existing mortgage payments while the loan stays in *their* name. Carries "due-on-sale" risk and real trust/ethical stakes.\n- **Wraps** — a new seller-financed note "wrapped" around the seller\'s existing loan.\n- **Lease-options** — leasing with the right to buy later.\n\nThese can work, but only with a **real estate attorney**, full written documentation, and a seller who *completely* understands what they\'re agreeing to. If you\'re not yet experienced, treat this principle as "know these exist," not "go do these." There is no shame in passing on a structure you don\'t fully understand — that\'s good investing, not timidity.',
        questions: [
          {
            id: 'mod7_p7_q1',
            text: 'The right approach to subject-to, wraps, and lease-options as a beginner is:',
            type: 'multiple_choice',
            options: [
              'Try them on your first deal to save money',
              'Know they exist, and only use them later with an attorney and a fully informed seller',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod7_p8',
        title: 'Paper it right, and make sure everyone understands',
        content: 'Creative deals live or die on documentation and clarity:\n- **Always paper it through a title company and/or real estate attorney.** Never freelance a creative contract.\n- **Get the full structure in writing** — price, down, rate, term, balloon (if any), and what happens if either side defaults.\n- **Make sure the seller fully understands the terms**, especially with seller financing. A confused seller is a future dispute.\n- **Use licensed professionals** for the legal and tax pieces in your state.\n\nDone right, creative structure is one of the most powerful tools in real estate. Done carelessly, it\'s the fastest way into a mess. The professionals are what keep it on the right side of that line.',
        questions: [
          {
            id: 'mod7_p8_q1',
            text: 'Every creative deal should be:',
            type: 'multiple_choice',
            options: [
              'Sketched on a napkin and trusted to a handshake',
              'Papered through a title company or attorney, in writing, with a seller who fully understands it',
            ],
            correctAnswer: 1,
          },
        ],
      },
    ],
    keyTerms: [
      { term: 'Creative financing', definition: 'Any structure that funds a purchase outside a standard bank loan — most often seller financing.' },
      { term: 'Promissory note', definition: 'The written promise to repay, spelling out the amount, interest rate, payment schedule, and term in a seller-financed deal.' },
      { term: 'Free-and-clear', definition: 'A property with no mortgage against it; the owner owns it outright (which makes seller financing easy).' },
      { term: 'Installment sale', definition: 'A sale where the seller receives payments over time rather than all at once, which can spread out their taxes (their tax advisor confirms).' },
      { term: 'Multiple-offer method', definition: 'Presenting a seller two or three structured options at once, turning a yes/no into a "which one."' },
      { term: 'Subject-to', definition: 'An advanced structure where you take over the seller\'s existing mortgage payments while the loan stays in their name. Attorney-only.' },
      { term: 'Wrap (wraparound)', definition: 'An advanced structure where a new seller-financed note wraps around the seller\'s existing loan. Attorney-only.' },
      { term: 'Lease-option', definition: 'Leasing a property with the contractual right to buy it later at agreed terms.' },
      { term: 'Due-on-sale clause', definition: 'A clause in many mortgages letting the lender demand full payoff if the property is sold or transferred — the key risk behind subject-to.' },
      { term: 'Default', definition: 'Failing to meet the terms of a loan or contract (such as missing payments); your documents should spell out what happens if either side defaults.' },
    ],
    completionMessage: 'Module 7 complete. You now know the four levers, how seller financing works and when, how to trade levers to win on terms, how to handle balloons safely, how to match structure to seller motivation, the multiple-offer method, and which advanced tools to leave to the professionals for now. Next: negotiation and influence.',
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
      ...(override.principles !== undefined ? { principles: override.principles } : {}),
      ...(override.keyTerms !== undefined ? { keyTerms: override.keyTerms } : {}),
      ...(override.completionMessage !== undefined ? { completionMessage: override.completionMessage } : {}),
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
