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
        title: 'Why we build everything around cash flow',
        content: 'Real estate pays you four ways (Module 1): **cash flow, appreciation, equity paydown, and tax benefits.** We deliberately build your whole plan around just one of them — **cash flow** — and we measure it with one metric: **cash-on-cash return.** Here\'s why that\'s the right choice.\n\n**Financing is the engine, and it makes real estate the optimal investment — when done correctly.** Using the bank\'s money (leverage) means you control a large asset with a small amount of your own cash. That multiplies what your cash earns. **Cash-on-cash return** measures exactly this: the yearly cash flow you collect against the actual cash you put into the deal. It\'s the truest scorecard of how hard *your* money is working.\n\n**Cash-on-cash is the best metric — with two conditions.** It\'s the right north star *as long as*:\n- You keep **reasonable equity** in the deal — you\'re not so over-leveraged that a small dip wipes you out.\n- You keep **reasonable reserves** — cash set aside for vacancies, repairs, and surprises.\n\nStrip those away and a high cash-on-cash number is a mirage hiding real risk. Equity and reserves are what make the metric honest.\n\n**Why cash flow first?** Because cash flow is what you can actually live on — it\'s what "retire on passive income" is made of, and it\'s what carries you through a down market. So we build your cash flow up first. Once it\'s solid, the other three ways real estate pays you — appreciation, equity paydown, and tax benefits — become **happy bonuses.** Real money you\'re glad to have, but never the thing you were depending on. That\'s a position of strength.',
        questions: [
          {
            id: 'mod3_p2_q1',
            text: 'Why do we measure deals by cash-on-cash return?',
            type: 'multiple_choice',
            options: [
              'Because appreciation is guaranteed every year',
              'Because it shows how hard your invested cash is working — as long as you keep reasonable equity and reserves',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod3_p2_q2',
            text: 'In this approach, appreciation and tax benefits are treated as:',
            type: 'multiple_choice',
            options: [
              'Happy bonuses on top of solid cash flow',
              'The main reason to buy',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod3_p2b',
        title: 'Your standard: never below 8% cash-on-cash',
        content: 'Some investors buy property that only **breaks even** on cash flow — it pays them nothing month to month, and they\'re betting entirely on appreciation. That\'s not investing, it\'s speculation, and it leaves you with no cushion when something goes wrong.\n\nIn UC30 we hold a firm standard: **a minimum 8% cash-on-cash return.** That floor does two things at once:\n- It **protects you** — the deal pays you from day one instead of relying on a future you can\'t control.\n- It **forces margin** — enough room in the numbers to actually keep reserves.\n\nBelow 8%, a deal is usually too thin to be safe. This isn\'t a number we pulled from the air — it\'s the line where a deal pays you *and* leaves a cushion. Your minimum cash-on-cash becomes a hard filter in your buy box: if a property can\'t clear it, it\'s not your deal.',
        questions: [
          {
            id: 'mod3_p2b_q1',
            text: 'We set a minimum cash-on-cash return of 8% because:',
            type: 'multiple_choice',
            options: [
              'It pays you from day one and leaves room for reserves',
              'Break-even properties are the safest way to start',
            ],
            correctAnswer: 0,
          },
          {
            id: 'mod3_p2b_q2',
            text: 'Buying a cash-flow break-even property is closest to:',
            type: 'multiple_choice',
            options: [
              'A protected, conservative play',
              'Speculation — you\'re betting on appreciation with no cushion',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod3_p2c',
        title: 'How aggressive should your target be?',
        content: 'Two decisions set the return you can realistically hit. Make both on purpose.\n\n**First, decide your market.** A market sets the baseline of what\'s even possible — some areas cash-flow easily, others barely cash-flow at all. You can invest where the math works locally, or operate in a different market through a team (Module 5). Either way, pick where you\'ll operate *before* you lock your number, because the market caps what\'s realistic.\n\n**Second, decide how aggressive a cash-on-cash return you\'ll chase.** This is the part most people get wrong, so understand it clearly: a **higher** cash-on-cash return almost always comes from one of two things —\n- **A higher-risk property.** The numbers look better because there\'s more that can go wrong — a rough area, heavy deferred maintenance, a tougher tenant base. More reward, but real downside you have to be able to survive.\n- **A more motivated seller.** Same quality of property, better numbers, because you found someone who needs to sell and will take less or offer better terms. The catch: motivated sellers are harder to find. It takes more time and more deal flow (Module 5) to reach them.\n\nSo when you set your target, you\'re really choosing **how you\'ll earn the extra return: by taking on more risk, or by doing more work to find better deals.** UC30\'s bias is clear — **chase motivated sellers, not risky assets.** The work is more controllable than the risk. A target you can hit by digging up motivated sellers is durable; a target you can only hit by buying dangerous properties will eventually hurt you.\n\nSo set a number that is **high enough to matter** (at least 8%) but **grounded in your market and the time you can realistically put into finding deals.** If your plan only works at a return your market can\'t safely produce, that\'s not a signal to go buy risk — it\'s a signal to either commit harder to deal flow or adjust the goal.',
        questions: [
          {
            id: 'mod3_p2c_q1',
            text: 'A higher cash-on-cash return usually comes from:',
            type: 'multiple_choice',
            options: [
              'Either a higher-risk property or a more motivated seller',
              'The bank lowering your rate for free',
            ],
            correctAnswer: 0,
          },
          {
            id: 'mod3_p2c_q2',
            text: 'UC30\'s preferred way to earn a higher return is to:',
            type: 'multiple_choice',
            options: [
              'Buy riskier properties for the bigger numbers',
              'Do the work to find more motivated sellers',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod3_p2d',
        title: 'Set your plan with the Get Clear tool',
        showComponent: 'getClear',
        content: 'Now make it concrete and let the tool do the math.\n\nUse the **Get Clear** tool below. You give it a few inputs and it tells you how long your plan will take:\n- **Define your destination** — one line on what you want real estate to do for you and why (e.g., "$8,000/month so I can leave my W-2").\n- **How much you can invest per year.**\n- **Your minimum cash-on-cash return** — your standard from the previous principle (at least 8%).\n- **The new yearly cash flow you want.**\n\nThe tool calculates your **timeline** automatically. The logic underneath is simple: **your target yearly cash flow ÷ your return ≈ the equity you need working.** So $100,000 of cash flow at a 10% return needs about **$1,000,000 of equity working.** Divide that by what you can invest each year, and you get your time horizon.\n\n**Worked example (straight from the tool):** want **$100,000/year** in cash flow, can invest **$100,000/year**, target a **10%** return → you need about **$1,000,000** working → roughly a **10-year** timeline.\n\n**Then be realistic.** If the timeline is longer than you\'d like, you have three honest levers:\n- **Extend the timeline.**\n- **Lower the near-term cash-flow goal.**\n- **Earn higher returns by finding better deals** — more motivated sellers, not riskier property.\n\nAnd remember: your next 30 days isn\'t the whole plan. **It\'s one deal.** The plan just tells you which deal to go get.\n\n**Your commitment:** write down the **market** you\'ll work in and your **minimum cash-on-cash return** (at least 8%). Those two decisions flow straight into your buy box — your return becomes the hard filter every property has to pass. That\'s how a goal becomes a plan you can actually hold yourself to.',
        questions: [
          {
            id: 'mod3_p2d_q1',
            text: 'The Get Clear tool turns your inputs into:',
            type: 'multiple_choice',
            options: [
              'A timeline showing how long your plan will take',
              'A list of specific properties to buy',
            ],
            correctAnswer: 0,
          },
          {
            id: 'mod3_p2d_q2',
            text: 'If the capital you\'d need is beyond your means on your timeline, the right moves are:',
            type: 'multiple_choice',
            options: [
              'Buy riskier properties to force a higher return',
              'Extend the timeline, lower the near-term goal, or find better deals',
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
      { term: 'Cash-on-cash return', definition: 'The yearly cash flow a property produces divided by the actual cash you invested — the core metric we optimize.' },
      { term: 'Leverage', definition: 'Using borrowed money (financing) so a small amount of your cash controls a larger asset, multiplying your return when done correctly.' },
      { term: 'Reserves', definition: 'Cash set aside for vacancies, repairs, and surprises — what keeps a high cash-on-cash number honest and safe.' },
      { term: 'Cash-flow break-even', definition: 'A property that produces no monthly cash flow, leaving you reliant on appreciation and with no cushion.' },
      { term: 'Speculation', definition: 'Buying mainly on the bet that the value will rise, rather than on the income the property produces today.' },
      { term: 'Motivated seller', definition: 'An owner with a real reason to sell who will accept a lower price or better terms — the lower-risk path to a higher return.' },
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
        id: 'mod4_p3a',
        title: 'Coordinate your taxes with your financing',
        content: 'One of the smartest conversations an investor can have is a three-way conversation between you, your accountant, and your lender. Here\'s the trap many investors fall into: they work hard every year to make their taxable income look as *low* as possible to save on taxes — then they go to qualify for a loan, and the lender sees that low income and won\'t approve them. They saved a little on taxes and lost the ability to buy.\n\nThe goal isn\'t to minimize taxes. The goal is to maximize long-term wealth. Before you make aggressive tax moves, ask the question that ties it together: *"How will this affect my ability to get financing?"* Your accountant and your lender should be working from the same plan, not pulling in opposite directions.',
        questions: [
          {
            id: 'mod4_p3a_q1',
            text: 'An investor aggressively minimizes their taxable income every year, then can\'t qualify for a loan. The lesson is:',
            type: 'multiple_choice',
            options: [
              'Lenders don\'t look at tax returns',
              'Tax strategy and financing strategy have to be planned together',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod4_p3a_q2',
            text: 'The real goal behind coordinating taxes and financing is to:',
            type: 'multiple_choice',
            options: [
              'Pay the least tax possible every year',
              'Maximize long-term wealth, not just minimize this year\'s taxes',
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
        id: 'mod4_p5a',
        title: 'Protect your pre-approval until you close',
        content: 'Getting pre-approved is not the finish line — it\'s a status you have to *protect* all the way to closing. Lenders re-check your finances before funding, and a single move can blow up an approved loan. Once you\'re pre-approved, until the deal closes, avoid:\n- Opening new credit cards or lines of credit\n- Financing a car or taking on any new debt\n- Making large, unexplained deposits into your accounts\n- Changing jobs unnecessarily\n\nWhat feels like a small, normal financial decision can quietly disqualify you right before closing. The rule is simple: once you\'re pre-approved, keep your financial picture boring and stable until the keys are in your hand.',
        questions: [
          {
            id: 'mod4_p5a_q1',
            text: 'After you\'re pre-approved, which action is most likely to create a financing problem?',
            type: 'multiple_choice',
            options: [
              'Keeping your savings where they are',
              'Financing a new vehicle before closing',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod4_p5a_q2',
            text: 'The right approach between pre-approval and closing is to:',
            type: 'multiple_choice',
            options: [
              'Keep your finances stable and avoid new debt or big unexplained deposits',
              'Use your approval as a green light to make other big purchases',
            ],
            correctAnswer: 0,
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
      {
        id: 'mod4_p8',
        title: 'The 10-loan scaling strategy',
        content: 'Here\'s a powerful tool most beginners don\'t know about: many lenders allow a single investor to hold up to **10 financed conventional loans** at once. Conventional financing is usually the cheapest, longest-term money available — so those 10 slots are one of the best wealth-building runways a small investor has.\n\nIt gets stronger if you\'re married. In many cases each spouse can qualify for their own set of financed conventional loans — meaning a couple can potentially access close to **20** between them. That\'s a large portfolio built on the cheapest financing available, before you ever need to move into DSCR, portfolio, or commercial loans.\n\nGuidelines change and vary by lender, so always confirm the current limits with your lender. But knowing this runway exists should shape how you sequence your financing: use your conventional slots strategically while they\'re available, rather than burning them on the wrong properties.',
        questions: [
          {
            id: 'mod4_p8_q1',
            text: 'Roughly how many financed conventional loans can many lenders allow one investor to hold?',
            type: 'multiple_choice',
            options: [
              'Up to 10',
              'Only 1',
            ],
            correctAnswer: 0,
          },
          {
            id: 'mod4_p8_q2',
            text: 'Why are conventional loan "slots" worth using strategically?',
            type: 'multiple_choice',
            options: [
              'They\'re usually the cheapest, longest-term financing available',
              'They\'re the only loans that exist',
            ],
            correctAnswer: 0,
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
      { term: 'The 10-loan strategy', definition: 'The ability for one investor to hold up to ~10 financed conventional loans at once (potentially ~20 for a married couple), a key runway for scaling on the cheapest financing available.' },
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
        id: 'mod6_p2a',
        title: 'Know your three numbers: Ideal, Target, and Maximum',
        content: 'Before you ever submit an offer, you should know three specific numbers. Getting clear on these is what lets you negotiate calmly instead of emotionally.\n- **Ideal price** — the price you\'d *love* to get it at. If they accepted, you\'d be thrilled. This is often where you start.\n- **Target price** — the price you realistically think the deal will land at. This is usually where negotiations settle.\n- **Maximum price** — the highest price you can pay and still hit your required return. This is your walk-away line.\n\nThe most important rule about these numbers: **you decide your maximum before negotiations begin, never during them.** Never raise your max because you\'re excited, because there\'s another buyer, or because you\'ve fallen for the property. The numbers drive the decision, not your emotions. Knowing all three means you always know exactly where you\'re starting, where you\'re aiming, and where you walk away.',
        questions: [
          {
            id: 'mod6_p2a_q1',
            text: 'The three numbers you should know before submitting an offer are:',
            type: 'multiple_choice',
            options: [
              'List price, tax value, and market value',
              'Ideal price, target price, and maximum price',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod6_p2a_q2',
            text: 'When should you determine your maximum price?',
            type: 'multiple_choice',
            options: [
              'Before negotiations begin, based on your numbers',
              'During negotiations, based on how you feel',
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
      { term: 'Ideal / Target / Maximum price', definition: 'The three numbers to set before any offer — the price you\'d love (ideal), the price you expect to land (target), and your walk-away ceiling (maximum), set in advance and never crossed.' },
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
        id: 'mod7_p4a',
        title: 'Always analyze a creative deal as if you put 20% down',
        content: 'Creative financing can produce eye-popping returns — 1% down with a low rate can show a massive cash-on-cash number. But that number can hide real danger. So no matter how little you\'re actually putting down, run the deal a second way: **analyze it as if you put at least 20% down.**\n\nWhy? Because the 20%-down version shows you the *true* strength of the property underneath the financing. If the deal still looks solid at 20% down, you have a fundamentally good property and the creative terms are a bonus. If it only works because of the low down payment, you\'ve found a property that\'s being propped up by leverage — and leverage cuts both ways. Creative financing should improve a good deal, not disguise a bad one.',
        questions: [
          {
            id: 'mod7_p4a_q1',
            text: 'Why analyze a low-down-payment creative deal as if you put 20% down?',
            type: 'multiple_choice',
            options: [
              'To raise the purchase price',
              'To see the property\'s true strength underneath the financing',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod7_p4a_q2',
            text: 'If a deal only works because of a tiny down payment, that\'s a sign:',
            type: 'multiple_choice',
            options: [
              'The property may be weak and propped up by leverage',
              'You should always buy it',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod7_p4b',
        title: 'Reserves matter more than down payment (the Reserve Principle)',
        content: 'Most beginners assume a bigger down payment automatically means a safer deal. Not always. What actually keeps you safe when something goes wrong is **reserves** — cash set aside for vacancies, repairs, and surprises.\n\nConsider two deals:\n- **Property A:** 5% down, but $50,000 in reserves\n- **Property B:** 25% down, but only $2,000 in reserves\n\nProperty A is often the *safer* deal, because when a furnace dies or a unit sits empty, it has the cash to survive — and Property B doesn\'t. A large down payment that drains your reserves can leave you more exposed, not less. This is why a low down payment can be powerful *when paired with strong reserves and disciplined analysis*: you keep your cash working and available. Judge a deal\'s safety by its reserves and cash flow, not by the size of the down payment alone.',
        questions: [
          {
            id: 'mod7_p4b_q1',
            text: 'Which is often the safer position?',
            type: 'multiple_choice',
            options: [
              '25% down with almost no reserves',
              '5% down with strong reserves',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod7_p4b_q2',
            text: 'The Reserve Principle says risk is determined more by:',
            type: 'multiple_choice',
            options: [
              'The size of your down payment',
              'The reserves and cash flow that let you survive problems',
            ],
            correctAnswer: 1,
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
      { term: 'The Reserve Principle', definition: 'The idea that a deal\'s safety is determined more by reserves (cash kept for vacancies, repairs, and surprises) than by the size of the down payment.' },
    ],
    completionMessage: 'Module 7 complete. You now know the four levers, how seller financing works and when, how to trade levers to win on terms, how to handle balloons safely, how to match structure to seller motivation, the multiple-offer method, and which advanced tools to leave to the professionals for now. Next: negotiation and influence.',
  },
  {
    id: 'mod8',
    moduleNumber: 8,
    title: 'Negotiation & Influence',
    description: 'Win the deal in the conversation — calmly, and without overpaying. Presence, rapport, discovery, anchoring, concessions, and negotiating through your agent.',
    principles: [
      {
        id: 'mod8_p1',
        title: 'Negotiation is discovery, not domination',
        content: 'The goal isn\'t to "beat" the seller — it\'s to **understand what they actually want** so you can build a deal that works for both of you. Treat it as a fight and you create resistance and lose deals you could have made. Treat it as discovery — uncovering the seller\'s real situation and goals — and you find the structure that gets them what they need and gets you your numbers. The person who asks the best questions and listens hardest wins far more than the one with the cleverest pitch.',
        questions: [
          {
            id: 'mod8_p1_q1',
            text: 'The real goal of a negotiation is to:',
            type: 'multiple_choice',
            options: [
              'Win by making the other side lose',
              'Understand what the seller wants so you can build a deal that works for both',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod8_p2',
        title: 'Know your numbers cold before you start',
        content: 'You decide your limits in the calm *before* the conversation, never in the heat of it. Walking in, you already know:\n- **Your maximum price** — the absolute top dollar you can pay and still hit your standard (your minimum cash-on-cash from Module 3).\n- **Multiple options** — not just one path. A lower cash price, or a higher price with great seller-finance terms (your Seller-Finance Solver from Module 7 gives you these exact numbers). Options mean you can flex without ever exceeding your true max.\n- **Your walk-away point** — the line where you politely leave.\n\nHere\'s why this is non-negotiable: **negotiation is emotional, and emotion makes people overpay.** If you walk in without a hard max, the moment you fall in love with a property or start to feel competitive, you\'ll talk yourself past your number — and buy a deal that doesn\'t cash flow. So set your max and walk-away in advance, ideally in writing, and treat them as fixed. No matter what happens in the room — pressure, a counter, your own excitement — **you do not go above the max you set.** The discipline to hold your number is what separates investors who make money from those who overpay and wonder why.',
        questions: [
          {
            id: 'mod8_p2_q1',
            text: 'Before a negotiation, you should already know:',
            type: 'multiple_choice',
            options: [
              'Your maximum price, your options, and your walk-away point — decided in advance',
              'Nothing — you\'ll feel out your limit based on how it goes',
            ],
            correctAnswer: 0,
          },
          {
            id: 'mod8_p2_q2',
            text: 'The main reason to set your max before you start is:',
            type: 'multiple_choice',
            options: [
              'Negotiation is emotional, and emotion makes people overpay',
              'Sellers respect buyers who decide quickly',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod8_p3',
        title: 'Whoever cares least has the most power',
        content: 'Your single biggest source of leverage is being **genuinely willing to walk away.** When you *need* a specific deal, the other side feels it and it costs you. When you have steady deal flow (Module 5), no single property is precious — so you negotiate from calm instead of desperation. Desperation is the most expensive thing you can bring to a table: it makes you raise your price, drop your terms, and ignore red flags. The more deals you have coming, the better you negotiate every one of them, because you truly don\'t need any single one. Walk-away power isn\'t a bluff — it\'s a real position you build by having options.',
        questions: [
          {
            id: 'mod8_p3_q1',
            text: 'Your biggest source of negotiating leverage is:',
            type: 'multiple_choice',
            options: [
              'Being genuinely willing to walk away',
              'Being the most enthusiastic person in the room',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod8_p4',
        title: 'Create your "office" and use your presence',
        content: 'Wherever you meet a seller, treat it as **your office** — you set the tone, the pace, and the calm. Trust is what actually gets deals done, and you build it less with words than with how you carry yourself. The specific, learnable moves:\n- **Stand or sit *beside* them, not across from them.** Being shoulder-to-shoulder — walking the property together, looking at your analysis side by side — feels collaborative, like you\'re on the same team solving a problem. Sitting directly across a table feels like opposition, a standoff. Get beside them whenever you can.\n- **Smile — genuinely and often.** A real smile lowers defenses and tells the seller you\'re safe to deal with.\n- **Use planned eye-contact breaks.** Constant, unbroken eye contact feels like pressure or a stare-down. Make warm eye contact, then deliberately break it — glance at the property, the paperwork, the view — and come back. That natural rhythm feels comfortable, not confrontational.\n- **Return with a positive nod.** When you come back to their eyes, add a small, affirming nod. It signals warmth and agreement and quietly invites them to keep talking.\n- **Slow. Way. Down.** This is the big one. Slow your speech and your movements far more than feels natural — more than you think you need to. The people who build the most trust are slow, calm talkers. Speed reads as nervousness or a hustle; slowness reads as confidence and honesty. The moment you feel the urge to rush is exactly the moment to slow down more.',
        questions: [
          {
            id: 'mod8_p4_q1',
            text: 'To build trust with your presence, you should:',
            type: 'multiple_choice',
            options: [
              'Sit directly across from the seller and hold constant eye contact to project confidence',
              'Get beside them, smile, use eye-contact breaks with positive nods, and slow way down',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod8_p5',
        title: 'Speak with calm authority: the down-pitch',
        content: '*How* you say things carries as much weight as what you say, and the key habit is the **down-pitch** — letting your tone fall at the end of your sentences instead of rising. A downward inflection sounds certain and settled, like a statement of fact. An upward inflection at the end — the way a question sounds — makes even true statements sound unsure, as if you\'re asking for approval. Confident people end their sentences *down.*\n\nPractice landing your offers and key points with a calm, falling tone: *"Based on the numbers, this is what makes sense for me."* — said as a period, not a question mark. Paired with slowing down (Principle 4), the down-pitch makes you sound like someone who knows their numbers and isn\'t desperate. That is exactly who a seller wants to deal with — and exactly who holds the leverage.',
        questions: [
          {
            id: 'mod8_p5_q1',
            text: 'Letting your tone fall at the end of a sentence (a "down-pitch") makes you sound:',
            type: 'multiple_choice',
            options: [
              'Certain and confident',
              'Unsure, like you\'re asking permission',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod8_p6',
        title: 'Build rapport and talk the property up',
        content: 'Here\'s the counterintuitive truth: you do **not** lower a price by trashing the property. Picking it apart insults the owner — who usually has pride in it — and hardens their resistance. Do the opposite. Build rapport, find genuine things to like, and **talk the property up** — then make your interest clearly conditional on the numbers:\n\n*"Honestly, this is a great property — I\'d love to buy it. The only thing that matters to me is whether the numbers work as an investment."*\n\nThis does two powerful things at once. First, it makes the seller *want* to sell to you — people sell to buyers they like, who appreciate what they\'ve built. Second, it frames the whole negotiation around **your numbers**, not the property\'s flaws. The constraint is never "your house isn\'t worth it" (an attack they\'ll fight) — it\'s "the math has to work for me" (a problem they can help you solve). You stay warm, and the numbers stay firm.',
        questions: [
          {
            id: 'mod8_p6_q1',
            text: 'The better way to set up a price negotiation is to:',
            type: 'multiple_choice',
            options: [
              'Point out everything wrong with the property to justify a low number',
              'Talk the property up and make your interest conditional on the numbers working',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod8_p7',
        title: 'Build yourself up as the buyer they want',
        content: 'A seller isn\'t only choosing a price — they\'re choosing a **buyer they can trust to actually close.** A higher offer that might collapse is worth less than a slightly lower offer that\'s certain. So make yourself the obvious, safe choice by establishing your credibility early:\n- You have a **relationship with a good title company** — you close cleanly and professionally.\n- You\'re **pre-approved and your financing is lined up** (Module 4) — the money is real, not hopeful.\n- You can **close quickly** and on their timeline.\n\nWhen a seller believes you\'ll truly close — fast and without drama — they\'ll often take *less* from you than from a bigger offer that feels risky. Certainty has real value. This is the in-person version of becoming the go-to buyer (Module 5): you\'re not just making an offer, you\'re presenting yourself as the easiest, safest way for them to be done.',
        questions: [
          {
            id: 'mod8_p7_q1',
            text: 'Beyond price, a seller is also choosing:',
            type: 'multiple_choice',
            options: [
              'A buyer they trust to actually close — so prove your certainty (title company, pre-approval, fast close)',
              'Only the highest number; nothing else matters',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod8_p8',
        title: 'Listen more than you talk, and use silence',
        content: 'Most beginners over-explain — they pitch, justify, and fill every silence, and talk themselves right out of deals. Flip the ratio: aim to **listen about 70% and talk 30%.** Ask a question, then *stop* and let the seller answer fully. And treat **silence as a tool, not an awkward gap to rescue.** After you make an offer or ask a real question, say nothing. Let them fill the space — they\'ll often tell you exactly what they need, or talk themselves toward your number. The discipline to stay quiet is one of the most powerful and underused skills in negotiation.',
        questions: [
          {
            id: 'mod8_p8_q1',
            text: 'In a negotiation you should generally:',
            type: 'multiple_choice',
            options: [
              'Do most of the talking to make your case',
              'Listen more than you talk, and let silence work after you ask or offer',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod8_p9',
        title: 'Find the real motivation (it\'s rarely just price)',
        content: 'Sellers are moved by far more than the number — **timing, certainty, convenience, relief from a problem, pride, and feeling treated fairly.** Someone in a hurry may take less for a fast, certain close. Someone tired of being a landlord may value being *done* over the last dollar. You can\'t know until you ask:\n- "What\'s got you thinking about selling?"\n- "What would the ideal timeline look like for you?"\n- "When this is all done, what matters most to you about how it goes?"\n\nTheir answers tell you how to win **without overpaying** — by solving the problem they actually have. (The next module goes deep on seller motivation; here, just build the habit of digging for it.)',
        questions: [
          {
            id: 'mod8_p9_q1',
            text: 'Most sellers are motivated by:',
            type: 'multiple_choice',
            options: [
              'Only the highest possible price',
              'A mix of price, timing, certainty, convenience, and relief from a problem',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod8_p10',
        title: 'Anchor with a reason, and show your work',
        content: 'Where you start is your **anchor** — and it should give you room to move (Principle 11). But a low number thrown out naked feels like an insult and kills trust. The fix: anchor with a reason, and **come prepared to prove it.** Walk in with your analysis and your comparable sales ready to show — printed or on your screen. When you can walk a seller through real comps and your actual numbers, your offer stops feeling like an attack and starts feeling like fair, objective reality:\n\n*"Here\'s what comparable places have sold for, here\'s the work this one needs, and here\'s the number the math supports — let me show you."*\n\nPreparation *is* persuasion. A seller will argue with an opinion; it\'s much harder to argue with comparable sales sitting right in front of them. Never anchor without being ready to justify it.',
        questions: [
          {
            id: 'mod8_p10_q1',
            text: 'The most persuasive way to present your anchor is to:',
            type: 'multiple_choice',
            options: [
              'State a low number and hope they accept',
              'Come prepared and show the real comps and analysis that justify it',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod8_p11',
        title: 'Start with room, and make every concession hurt',
        content: 'Two disciplines work together, and this is the heart of the craft.\n\n**First, open with room to move.** Your initial offer should sit *below* your maximum, so you have somewhere to go. You must be able to walk away — but you also need an opening you can bend. If you open at your absolute max, you have nothing left to give and the seller never gets the feeling of winning.\n\n**Second, make every concession feel painful.** When you move toward your bottom dollar, never do it quickly or easily. Each step should look like it costs you something real — pause, show reluctance, make them feel they earned it:\n\n*"That\'s really pushing it for me... okay — if you can [do X], I can try to make that work."*\n\nWhen you give ground that *appears* to hurt, the seller feels like they won — even though you never went above the number you already knew you could pay. A concession given easily feels worthless and invites them to push for more; a concession that visibly costs you feels like a victory and settles them.\n\nThe iron rule under both: **you do not get emotional, and you do not exceed your max.** All the movement happens inside the range you set in advance (Principle 2). You\'re not improvising your limit — you\'re performing the journey to a number you already decided you could live with.',
        questions: [
          {
            id: 'mod8_p11_q1',
            text: 'Your opening offer should be:',
            type: 'multiple_choice',
            options: [
              'Your absolute maximum, to show good faith',
              'Below your max, so you have real room to move',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod8_p11_q2',
            text: 'When you concede toward your bottom dollar, you should:',
            type: 'multiple_choice',
            options: [
              'Do it quickly and easily so you seem generous',
              'Make it look and feel costly, so the seller feels they earned the win',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod8_p12',
        title: 'Make it win-win and easy to say yes',
        content: 'The deals that close are the ones where the seller gets what *they* care about most while you get your numbers. Once you\'ve found their motivation (Principle 9), structure to it — price for one seller, speed for another, certainty or terms for the next. Your best tool here is the **multiple-offer method** from Module 7: instead of one take-it-or-leave-it number, give the seller **two or three structured options** and let them choose. It turns "yes or no" into "which one," makes them feel in control, and reveals which thing they truly value. People say yes far more easily to a choice they made themselves than to an ultimatum.',
        questions: [
          {
            id: 'mod8_p12_q1',
            text: 'An effective way to make it easy for a seller to say yes is to:',
            type: 'multiple_choice',
            options: [
              'Give one firm take-it-or-leave-it number',
              'Offer two or three structured options and let them choose',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod8_p13',
        title: 'Create honest urgency',
        content: 'A deal with no reason to act now tends to drift — and drift kills deals. Give the seller **real** reasons the timing favors moving now:\n- **Seasons / timing.** "If we close before winter, you avoid another season of vacancy and upkeep." Seasonal and market timing can be genuine motivators.\n- **Financing windows.** "I\'ve got financing locked at this rate, but that window closes soon." A real rate lock or loan timeline creates a legitimate deadline.\n- **Limited availability.** Your capital and attention are finite — you\'re looking at a few properties and will move first on whichever comes together.\n\nKeep it honest — real reasons, not manufactured pressure. Genuine urgency moves a "maybe later" into a "let\'s do it," which is often the difference between a deal and a cold follow-up (Module 5).',
        questions: [
          {
            id: 'mod8_p13_q1',
            text: 'A good way to create urgency is to:',
            type: 'multiple_choice',
            options: [
              'Use a real deadline — seasonal timing, a financing/rate window, or limited availability',
              'Invent fake pressure to rush the seller',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod8_p14',
        title: 'Handle objections by understanding, not arguing',
        content: 'When a seller pushes back — "that\'s too low," "I need to think about it," "I was hoping for more" — your instinct may be to argue or defend. Don\'t. **Get curious instead.** Behind almost every objection is an unmet need or a fear. Surface it:\n\n*"Totally fair — help me understand what\'s behind that for you."*\n\nOnce you understand the real concern, you can address *it*, and the objection usually dissolves on its own. You never argue your way into a deal; you understand your way into one. Arguing makes a seller defend their position harder; curiosity invites them to move.',
        questions: [
          {
            id: 'mod8_p14_q1',
            text: 'When a seller objects, the best first move is to:',
            type: 'multiple_choice',
            options: [
              'Argue your case harder',
              'Get curious and understand the real need or fear behind it',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod8_p15',
        title: 'Never negotiate against yourself, and get it in writing',
        content: 'Two disciplines protect you at the finish:\n- **Never negotiate against yourself.** Make your offer, then *wait.* Don\'t lower your own number before they\'ve countered, and don\'t keep sweetening the deal into silence because you\'re nervous. If they go quiet, let them.\n- **Get it in writing immediately.** The moment you reach agreement, paper it (Module 6). A verbal "yes" is not a deal — memories drift and minds change. Lock the terms in a contract while the agreement is fresh.\n\nCalm, patient, prepared, and documented beats eager and verbal every single time.',
        questions: [
          {
            id: 'mod8_p15_q1',
            text: '"Never negotiate against yourself" means:',
            type: 'multiple_choice',
            options: [
              'Make your offer and wait — don\'t lower it before they counter',
              'Always offer a bit less than you\'re willing to pay',
            ],
            correctAnswer: 0,
          },
          {
            id: 'mod8_p15_q2',
            text: 'The moment you reach a verbal agreement, you should:',
            type: 'multiple_choice',
            options: [
              'Trust the handshake and handle paperwork eventually',
              'Get it in writing right away — a verbal yes isn\'t a deal',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod8_p16',
        title: 'Most of your early offers go through an agent',
        content: 'A quick channel reality check. Everything in the presence and positioning principles — your presence, positioning, eye contact, slowing down, the down-pitch — is for when you\'re **face-to-face with a seller.** That\'s your FSBO and off-market deals (Module 5). But you were told to start **on-market for speed**, and on-market you never meet the seller: your buyer\'s agent talks to the listing agent, who talks to the seller. On those deals, **your agent becomes your negotiator.** Every principle still applies — discovery, walk-away power, motivation, anchoring with proof, room to move, painful concessions, win-win options, urgency — but it\'s executed *through* your agent. Which makes your choice of agent one of the most important negotiating decisions you\'ll make.',
        questions: [
          {
            id: 'mod8_p16_q1',
            text: 'On an on-market deal, who actually negotiates with the seller?',
            type: 'multiple_choice',
            options: [
              'You, face to face',
              'Your agent, through the listing agent — so your agent\'s skill is your negotiating power',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod8_p17',
        title: 'Pick an agent who can sell, not just fill out forms',
        content: 'Module 5 told you to find an investor-friendly agent. Now add the negotiation lens: you need one who is also a genuine **salesperson** — someone who can **soften a low offer and justify it**, not just relay a number. This matters enormously. A weak agent presents your offer as "my buyer offered X" and lets it sound like an insult. A strong agent **frames** it — walks the listing agent through your comps and analysis, explains the repairs, builds you up as a serious, qualified buyer who closes — and makes a low-but-fair offer land as reasonable. The right agent:\n- **Understands real estate investing and can analyze a property**, so they can defend your numbers with credibility.\n- **Knows how to justify a lower offer** with comps and condition, so it never reads as a careless lowball.\n- **Builds you up as a buyer** — pre-approved, title company ready, fast and certain close.\n- **Understands your strengths and your strategy**, so they represent you the way you\'d represent yourself.\n\nOn most of your early deals, your agent\'s selling ability *is* your negotiating ability. Choosing a smooth, investor-savvy negotiator over a passive form-filler can be worth more than any single tactic in this module.',
        questions: [
          {
            id: 'mod8_p17_q1',
            text: 'The most valuable trait in an agent who negotiates for you is:',
            type: 'multiple_choice',
            options: [
              'They submit offers quickly and quietly',
              'They can sell — softening and justifying your offer with comps so it lands as fair',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod8_p18',
        title: 'Coach your agent on your strategy (but hold your true max)',
        content: 'A great agent still isn\'t a mind reader. Brief them like a teammate before every offer, and hand them the ammunition to fight for you:\n- Your **comps and analysis**, so they can justify the offer.\n- Your **menu of options** (Module 7), so they can present a choice, not an ultimatum.\n- Your **buyer credibility** to broadcast — pre-approved, title company, fast close.\n- Your **urgency angle**, and the fact that you\'re willing to walk.\n\nTell them the number, the reasoning, and exactly how you want it positioned. But here\'s the nuance most investors get wrong: **be careful how much of your true maximum you reveal — even to your own agent.** Their commission rises with the purchase price, so they\'re quietly incentivized to nudge you up "to get the deal done." Give them your offer, your room to move, and your willingness to walk — and keep your actual ceiling to yourself. Your max is yours alone.',
        questions: [
          {
            id: 'mod8_p18_q1',
            text: 'You should coach your agent before an offer by giving them:',
            type: 'multiple_choice',
            options: [
              'Your comps, your option menu, your buyer credibility, and your urgency angle',
              'Nothing — let them figure out how to present it',
            ],
            correctAnswer: 0,
          },
          {
            id: 'mod8_p18_q2',
            text: 'How much of your true maximum price should you tell your own agent?',
            type: 'multiple_choice',
            options: [
              'All of it, so they can negotiate freely',
              'Keep your true ceiling to yourself — their commission rises with the price',
            ],
            correctAnswer: 1,
          },
        ],
      },
    ],
    keyTerms: [
      { term: 'Your max (top dollar)', definition: 'The highest price you can pay and still hit your minimum cash-on-cash standard — decided before the negotiation and never exceeded.' },
      { term: 'Walk-away point', definition: 'The line where you politely leave; the source of your leverage, made real by deal flow.' },
      { term: 'Anchor', definition: 'The first number put on the table, which frames the whole negotiation — most effective when prepared and backed by comps and analysis.' },
      { term: 'Down-pitch', definition: 'Letting your tone fall at the end of a sentence so it lands as a confident statement rather than an unsure question.' },
      { term: 'Positioning', definition: 'Placing yourself beside the seller rather than across from them, so the conversation feels collaborative instead of confrontational.' },
      { term: 'Concession', definition: 'Ground you give in a negotiation — given slowly and made to look costly, so the seller feels they earned a win, and never past your max.' },
      { term: 'Objection', definition: 'A seller\'s pushback, usually a signal of an unmet need or fear to understand rather than an argument to win.' },
      { term: 'Win-win', definition: 'A deal structured so the seller gets what they care about most while you still hit your numbers.' },
      { term: 'Urgency', definition: 'An honest, real reason for the seller to act now — seasonal timing, a financing window, or limited availability.' },
      { term: 'Rapport', definition: 'Genuine trust and ease between you and the seller, which makes every other move work better.' },
      { term: 'Buyer\'s agent / listing agent', definition: 'On an on-market deal, your buyer\'s agent negotiates with the seller\'s listing agent — so your agent carries your strategy to the other side, and their selling skill becomes your negotiating power.' },
    ],
    completionMessage: 'Module 8 complete. You now have the full negotiation toolkit: decide your max and options before you start and never let emotion push you past them; build trust with your presence; build rapport by talking the property up while keeping the numbers firm; position yourself as the buyer they can trust to close; listen more than you talk; find the real motivation; anchor with prepared proof; open with room and make every concession hurt; build win-win options and honest urgency; handle objections with curiosity; lock the deal in writing; and choose an agent who can truly sell while keeping your true max to yourself. Next: going deep on seller problems and motivation.',
  },
  {
    id: 'mod9',
    moduleNumber: 9,
    title: 'Seller Problems & Motivation',
    description: 'The best deals come from solving a seller\'s problem — learn what creates motivation, how to find and gauge it, and how to turn it into a deal that genuinely helps everyone.',
    principles: [
      {
        id: 'mod9_p1',
        title: 'Problems create deals, not properties',
        content: 'This is the single most important shift in this whole module:\n\nNew investors ask, *"What property can I buy?"*\nGreat investors ask, *"What problem can I solve?"*\n\nHere\'s why that changes everything. If there were no problems — no stress, no urgency, no motivation — most sellers would simply keep their property. **The deal exists because of the problem.** And the bigger the problem, the bigger the opportunity often becomes. A **motivated seller** is one whose reason to sell outweighs getting top dollar — they need speed, relief, certainty, or a problem solved. That motivation is what makes a below-market price or great terms possible. With no motivation, there\'s no discount. So stop hunting for cheap houses and start hunting for problems you can solve.',
        questions: [
          {
            id: 'mod9_p1_q1',
            text: 'Great investors primarily ask:',
            type: 'multiple_choice',
            options: [
              '"What property can I buy?"',
              '"What problem can I solve?"',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod9_p1_q2',
            text: 'Why is motivation the key to a great price?',
            type: 'multiple_choice',
            options: [
              'Without a real reason to sell, there\'s no discount',
              'Motivated sellers always own the nicest properties',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod9_p2',
        title: 'The problems that create motivation',
        content: 'Motivation comes from a situation where being *done* is worth more than the last dollar. The common ones:\n- **Financial distress** — behind on payments, facing foreclosure, liens or debt piling up.\n- **Life events** — divorce, a death and an inherited property, a job relocation, health changes, aging out of ownership.\n- **Tired landlords** — burned out by bad tenants, deferred maintenance, or managing from a distance.\n- **Vacant or distressed property** — sitting empty and costing money every month, or with code/repair problems the owner can\'t face.\n- **Time pressure** — needs to move now, carrying two mortgages, a deadline of some kind.\n- **Inherited / out-of-state owners** — heirs who don\'t want the property and just want it handled.\n\nIn every one of these, the seller\'s real need isn\'t "maximum price" — it\'s relief, speed, or simplicity. That\'s the opening.',
        questions: [
          {
            id: 'mod9_p2_q1',
            text: 'What do the common motivated-seller situations have in common?',
            type: 'multiple_choice',
            options: [
              'The property is always in terrible condition',
              'Being done — relief, speed, or simplicity — matters to the seller more than the last dollar',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod9_p3',
        title: 'Motivation is about the seller, not the property',
        content: 'This reframes how you hunt. A beautiful, well-kept property can have a highly motivated seller (a clean divorce, a fast relocation). An ugly, run-down property can have a completely unmotivated one (an owner happy to wait). **Don\'t judge the deal by the house — judge it by the seller\'s reason and timeline.** Beginners drive past nice homes assuming there\'s no deal there, and chase ugly ones with no motivated seller attached. Train yourself to look past the property and ask: *what\'s the seller\'s situation?* That\'s where the deal lives.',
        questions: [
          {
            id: 'mod9_p3_q1',
            text: 'Whether a deal exists depends most on:',
            type: 'multiple_choice',
            options: [
              'How run-down the property looks',
              'The seller\'s situation and motivation',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod9_p4',
        title: 'How to find motivated sellers',
        content: 'Motivated sellers rarely sit on-market at full price waiting for you — you go find them, mostly through the off-market lanes from Module 5. Aim your chosen lane at situations *likely* to contain motivation:\n- **Direct mail** to lists that skew motivated — absentee/out-of-state owners, pre-foreclosure, probate, tired landlords, long-time high-equity owners.\n- **Driving for dollars** — visibly distressed or neglected properties.\n- **Networking** — agents, attorneys, and property managers who hear about divorces, deaths, and burned-out owners before anyone else.\n- **FSBO & expired listings** — owners already signaling they want out.\n\nPick one or two lanes (Module 5) and work them consistently. The point isn\'t volume for its own sake — it\'s getting in front of enough situations that real motivation surfaces.',
        questions: [
          {
            id: 'mod9_p4_q1',
            text: 'The best place to find motivated sellers is usually:',
            type: 'multiple_choice',
            options: [
              'On-market listings at full asking price',
              'Off-market lanes aimed at likely-motivated situations (absentee, pre-foreclosure, tired landlords, probate)',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod9_p5',
        title: 'Read motivation off the listing',
        content: 'You can spot likely motivation before a single conversation, just by reading a listing closely. Most sellers never write "I\'m motivated" — they leave clues:\n- **Long days on market** — a property listed 7 days has plenty of attention; one sitting 180+ days often has a frustrated, tired seller.\n- **Multiple price reductions** — every reduction tells a story. The seller has already shown they\'re willing to move; repeated cuts often signal growing frustration.\n- **Vacant property** — vacancy costs the owner every month in payments, utilities, and insurance, which creates pressure.\n- **Needs work or poor marketing** — dark photos, few photos, a weak description, or missing rent numbers scare off retail buyers and leave the property overlooked.\n\nThat last one is the key question to train yourself on: **is the property bad, or is the marketing bad?** Investors constantly skip good properties because they were presented poorly. None of these clues *guarantee* a deal — they give you a reason to investigate and reach out while other buyers scroll past.',
        questions: [
          {
            id: 'mod9_p5_q1',
            text: 'A property listed for 200+ days with multiple price reductions is worth a closer look because:',
            type: 'multiple_choice',
            options: [
              'Long market time and price cuts often signal a frustrated, more flexible seller',
              'It\'s guaranteed to be a great deal',
            ],
            correctAnswer: 0,
          },
          {
            id: 'mod9_p5_q2',
            text: 'When a listing has terrible photos and a weak description, you should ask:',
            type: 'multiple_choice',
            options: [
              'Is the property actually bad, or is just the marketing bad?',
              'Nothing — bad photos always mean a bad property',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod9_p6',
        title: 'Recognize the signs of motivation',
        content: 'Once you\'re talking to a seller, read the level of motivation. Use discovery questions — *why are you selling, what\'s your ideal timeline, what matters most about how this goes* — and listen for the signals:\n- **Urgency** — "I need to be out by..." or any real deadline.\n- **Flexibility** — openness on price, or willingness to consider terms.\n- **A problem mentioned** — divorce, a job, tenants, an inherited house, money pressure.\n- **Emotional relief language** — wanting to just be *done* with it.\n- **Neglect** — deferred maintenance or a vacant property they\'ve stopped caring for.\n\nThe more of these you hear, the more motivated the seller — and the more room there is to build a deal that helps them and works for you. No signals? It\'s likely a low-motivation seller; note it and follow up later (Principle 11).',
        questions: [
          {
            id: 'mod9_p6_q1',
            text: 'A strong sign of a motivated seller is:',
            type: 'multiple_choice',
            options: [
              'They mention a real deadline or a problem and just want to be done',
              'They have unlimited time and no reason to sell',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod9_p7',
        title: 'Motivation has levels: the Seller Motivation Pyramid',
        content: 'Not all motivation is equal. Picture four levels, from shallow to deep:\n- **Level 1 — Interested:** "I might sell someday."\n- **Level 2 — Considering:** "I\'m thinking about selling."\n- **Level 3 — Motivated:** "I want to sell."\n- **Level 4 — Problem-Solving:** "I need a solution."\n\nThe deeper you go, the better the opportunity. **Most great deals happen at Level 4**, where the seller has a real problem they need solved — not just a vague interest. Two things move a seller down the pyramid: **time** (the problem deepens) and the **severity** of the problem itself. So as you talk to sellers, gauge two things at once: *what level are they at,* and *how serious is the problem?* A serious problem at Level 4 is where the best deals live. A mild interest at Level 1 is a follow-up, not a deal yet — so you invest your time accordingly.',
        questions: [
          {
            id: 'mod9_p7_q1',
            text: 'Where do most great deals happen on the Seller Motivation Pyramid?',
            type: 'multiple_choice',
            options: [
              'Level 1 — "I might sell someday"',
              'Level 4 — "I need a solution"',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod9_p7_q2',
            text: 'Beyond what level a seller is at, you should also gauge:',
            type: 'multiple_choice',
            options: [
              'How serious their problem is',
              'How nice the property looks',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod9_p8',
        title: 'Solve the problem, don\'t exploit it',
        content: 'This is the mindset that both wins more deals *and* keeps you on the right side of the line: **you are there to solve a real problem, not to prey on someone\'s desperation.** A seller in a tough spot can feel which one you are within minutes. When you genuinely help — a fast, certain close for someone facing foreclosure; taking a headache property off a worn-out landlord; a fair, simple deal for grieving heirs — you create a true win. You\'ll close more, because people deal with someone they trust. And you build the reputation (the go-to buyer, Module 5) that brings the *next* deals to you.\n\nPredatory investors who squeeze desperate people get a short-term win and a long-term bad name that follows them. Help first, structure second. The best investors are problem-solvers people are *glad* they called.',
        questions: [
          {
            id: 'mod9_p8_q1',
            text: 'The right mindset with a distressed seller is:',
            type: 'multiple_choice',
            options: [
              'Press their desperation for the lowest possible price',
              'Solve their real problem honestly — it wins more deals and builds your reputation',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod9_p9',
        title: 'Build a win-win (and keep it a win for you)',
        content: 'The best deals are never one-sided. Before you ever talk price, run two quick checks.\n\nFirst, the **Win-Win Framework.** Literally fill in two boxes:\n- **Seller wins by:** ___\n- **Buyer wins by:** ___\n\nIf both boxes are strong, you likely have a great deal. If one side is weak, keep working the structure until both are strong — or walk away.\n\nSecond, the **Problem-Solver questions.** Run these *before* discussing price:\n- What problem are they trying to solve?\n- How serious is that problem?\n- What would their ideal solution look like?\n- Can I create a structure that solves it?\n- **Does that structure still fit my criteria?**\n\nNotice that last question. A win-win still has to be a win for *you* — it must fit your buy box and hit your returns. Solving the seller\'s problem at the cost of your own criteria isn\'t a win-win; it\'s a bad deal wrapped in a good story. The goal is a structure where the seller gets what they truly need and you still get a deal you\'d happily own.',
        questions: [
          {
            id: 'mod9_p9_q1',
            text: 'In the Win-Win Framework, you have a strong deal when:',
            type: 'multiple_choice',
            options: [
              'Only the seller wins',
              'Both "seller wins by" and "buyer wins by" are strong',
            ],
            correctAnswer: 1,
          },
          {
            id: 'mod9_p9_q2',
            text: 'The final Problem-Solver question — "does it still fit my criteria?" — exists because:',
            type: 'multiple_choice',
            options: [
              'A win-win still has to be a win for you',
              'Your criteria stop mattering once the seller is happy',
            ],
            correctAnswer: 0,
          },
        ],
      },
      {
        id: 'mod9_p10',
        title: 'Match your solution to their problem',
        content: 'Once you know the problem and you\'ve confirmed it can be a win for both sides, structure the deal to solve it — this is exactly where your creative tools from Module 7 come in:\n- **Needs cash fast / foreclosure** → a fast, certain cash close that stops the bleeding.\n- **Wants top price, not in a hurry** → full price with seller financing at great terms (Module 7) — they get their number, you get cash flow.\n- **Tired landlord** → buy it as-is, take on the tenants and repairs, close quickly so they\'re simply done.\n- **Inherited / out-of-state** → handle everything and make it effortless; convenience is the thing they value.\n\nThe motivation tells you which structure to lead with — and which option to put first in your multiple-offer menu (Module 8). You\'re not selling a price; you\'re offering the solution to *their* specific problem.',
        questions: [
          {
            id: 'mod9_p10_q1',
            text: 'After you understand a seller\'s problem, you should:',
            type: 'multiple_choice',
            options: [
              'Offer everyone the same single cash price',
              'Structure the deal — cash, terms, as-is, convenience — to solve their specific problem',
            ],
            correctAnswer: 1,
          },
        ],
      },
      {
        id: 'mod9_p11',
        title: 'Follow up, because motivation grows over time',
        content: 'A seller who\'s a "no" today can become motivated in three months, when the problem deepens — the missed payments pile up, the bad tenant trashes the unit, the inherited house keeps draining money from out of state. Remember the Pyramid (Principle 7): time moves sellers *down* toward the problem-solving level. This is why **cold follow-ups** (Module 5) are where so many of the best deals actually come from. Stay in touch kindly and consistently, and be the first person they call when their motivation finally tips. Most investors contact a seller once and quit; the ones who patiently follow up catch the deal the moment it ripens. A "not now" is rarely a "never" — it\'s a "follow up later."',
        questions: [
          {
            id: 'mod9_p11_q1',
            text: 'Why does follow-up matter so much with sellers?',
            type: 'multiple_choice',
            options: [
              'Sellers never change their minds, so it\'s just persistence for its own sake',
              'Motivation grows as problems deepen, so a "no" today often becomes a deal later',
            ],
            correctAnswer: 1,
          },
        ],
      },
    ],
    keyTerms: [
      { term: 'Motivation', definition: 'A seller\'s real reason to sell that outweighs getting top dollar — the engine of every below-market deal.' },
      { term: 'Seller Motivation Pyramid', definition: 'The four levels of motivation — Interested, Considering, Motivated, Problem-Solving — with the best deals at the Problem-Solving level.' },
      { term: 'Win-Win Framework', definition: 'A quick test where you fill in "seller wins by ___" and "buyer wins by ___"; a strong deal has both.' },
      { term: 'Problem-Solver questions', definition: 'The five questions to run before discussing price — what problem, how serious, ideal solution, can I structure it, and does it still fit my criteria.' },
      { term: 'Days on market', definition: 'How long a property has been listed; long days on market can signal a frustrated, more flexible seller.' },
      { term: 'Pre-foreclosure', definition: 'The period after an owner falls behind on payments but before the lender completes foreclosure — a common source of motivation.' },
      { term: 'Foreclosure', definition: 'The legal process by which a lender repossesses a property after the owner fails to pay; its threat creates urgency.' },
      { term: 'Probate', definition: 'The legal process of settling a deceased person\'s estate, which often includes property the heirs want to sell.' },
      { term: 'Absentee / out-of-state owner', definition: 'An owner who doesn\'t live near the property — often more open to selling for convenience.' },
      { term: 'Distressed property', definition: 'A property that\'s neglected, vacant, or costing the owner money — frequently attached to a motivated seller.' },
      { term: 'Tired landlord', definition: 'An owner worn out by tenants, maintenance, or distance, who often values being done over the last dollar.' },
      { term: 'As-is purchase', definition: 'Buying a property in its current condition, with the buyer taking on the repairs — a convenience many motivated sellers will trade price for.' },
    ],
    completionMessage: 'Module 9 complete. You now understand the core shift — solve problems, don\'t chase properties — and that motivation, not the property, is the source of every great deal. You know the situations that create motivation, how to find it, how to read it off a listing and in conversation, how to gauge its depth with the Seller Motivation Pyramid, how to solve a seller\'s problem honestly instead of exploiting it, how to build a true win-win that still fits your criteria, how to match your structure to their specific need, and why patient follow-up catches the deals everyone else quits on. Next: seeing the hidden value in a property — how to spot upside others walk right past.',
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
