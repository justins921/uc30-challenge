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
    description: 'Structure deals creatively when traditional financing doesn\'t fit.',
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
