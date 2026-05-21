// ── Pre-Launch Days (before Day 1) ───────────────────────────────
export const PRE_DAYS = [
  {
    day: -3,
    title: "Your Foundation",
    caption: "Define your why, understand active vs passive income, and reverse engineer your financial goals.",
    taskDescription: "",
    trainingContent: "Your Why + Active vs Passive Income + Reverse Engineer Your Financial Goals",
    category: "prelaunch",
    weekNumber: 0,
    weekTitle: "PRE-LAUNCH",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: -2,
    title: "Your Market and Buy Box",
    caption: "Lock in your target market, define your buy box, and research market rents.",
    taskDescription: "",
    trainingContent: "How to Select Your Market + Market Research + Define Your Buy Box",
    category: "prelaunch",
    weekNumber: 0,
    weekTitle: "PRE-LAUNCH",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: -1,
    title: "Your Team and Tools",
    caption: "Build your team, confirm financing, declare your stakes, and run a practice submission.",
    taskDescription: "",
    trainingContent: "Build Your Team + Financing Overview + How UC30 Works",
    category: "prelaunch",
    weekNumber: 0,
    weekTitle: "PRE-LAUNCH",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
];

// ── 30-Day Sprint Content ────────────────────────────────────────
// Each day has: title, caption, taskDescription, category, weekNumber, weekTitle, proofType
// Chandler: Replace video URLs, transcripts, and downloadable resources per day

export const CHALLENGE_DAYS = [
  // ── Week 1: Build the Foundation (Days 1-7) ──
  {
    day: 1,
    title: "Analysis",
    caption: "",
    taskDescription: "",
    trainingContent: `Now that you've seen the proper way to analyze a rental property, you'll be given three practice properties to analyze. After each analysis, answer the questions provided.

You can cheat your way through this, but if you don't truly understand how to analyze a property, you'll be in trouble when it's time to do it for real.

Once you've analyzed the three practice properties, it's time to start analyzing real deals. This can feel overwhelming at first, but the process is simple: gather the correct information, plug in the numbers, and evaluate the deal. Then adjust the purchase price to determine what price would make the property worth buying.

The more you do this, the easier and more natural it becomes.

After that, it's time to connect with your first Arsenal Contact and your first Target Contact.

Arsenal Contacts are people you build relationships with so they bring you deals in the future. Target Contacts are tied to properties you are actively pursuing right now. Often, Target Contacts eventually become Arsenal Contacts because they may have future opportunities as well.

Your goal is to continuously grow your pipeline by:

• Adding more Arsenal Contacts
• Finding more Target Properties
• Staying top of mind with all contacts
• Turning Target Properties into properties under contract

For Day 1, your Arsenal Contact should be a realtor.

If possible, connect with a realtor you already know and trust. Explain your buy box and your real estate investing goals. Make sure they understand that if they bring you a property that meets your criteria, you are ready to buy.

Next, hop on sites like Realtor.com or Zillow and search for properties that could fit your buy box at the right price. Analyze those properties, then reach out to the listing agents.

Use these conversations as an opportunity to build relationships and create more Arsenal Contacts while also showing interest in the property as a Target Property. Build rapport with the realtor so they become invested in helping you.

Explain that if you can make the numbers work, you are a serious buyer. Let them know that if the seller is willing to help structure a deal that fits your criteria, you're ready to move forward. Also explain that even if this particular property doesn't work out, you would love future off-market or pocket listing opportunities that match your buy box.

Before calling, make sure you've already analyzed the property so you understand the numbers and can ask intelligent questions about:

• Current rents
• Market rents
• Renovations needed
• Expenses
• Vacancy
• Deferred maintenance
• Any other information needed to properly evaluate the deal

You are not going to do these calls perfectly at first, so don't get overwhelmed. The more calls you make, the more you learn, and the better you get. The more humble, confident, and professional you are with agents, the more invested they'll become in helping you reach your goals.

Some agents may ask you to sign an agreement to work exclusively with them. In most cases, you should only do this for a specific property they brought to you.

You want agents motivated to bring you new deals. You do not want to limit your ability to have multiple agents actively searching for opportunities that fit your criteria.

The more agents who understand your buy box and believe you are a serious buyer, the more likely you are to receive great opportunities. If you consistently stay top of mind and agents trust that you will actually perform when the right deal appears, your chances of finding strong deals increase dramatically.

This is why it is critical to know exactly what you're looking for and to be ready to act when someone brings it to you.

If you don't feel confident or decisive about your criteria yet, go back and fine-tune your buy box until you do. You know exactly what you're looking for, you will find it!`,
    category: "foundation",
    weekNumber: 1,
    weekTitle: "BUILD THE FOUNDATION",
    proofType: "screenshot",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: {
      required: true,
      scenarios: [
        {
          id: 'day1_property1',
          title: 'Property 1 Analysis',
          description: `Analyze the property below. Plug the information into the CDS Rental Calculator and determine the Cash on Cash Return.`,
          propertyListing: {
            title: '4-Unit Multifamily — Turn Key',
            price: '$600,000',
            badges: ['Multifamily', '4 Units', 'Turn Key'],
            highlights: [
              { icon: '🏠', label: 'Units', value: '4' },
              { icon: '💰', label: 'Rent', value: '$6,000/mo' },
              { icon: '📍', label: 'Condition', value: 'Turn Key' },
            ],
            sections: [
              {
                heading: 'Purchase & Financing',
                rows: [
                  { label: 'Purchase Price', value: '$600,000' },
                  { label: 'Costs to Make Rent Ready', value: '$0' },
                  { label: 'Down Payment', value: '25%' },
                  { label: 'Closing Costs', value: '2%' },
                  { label: 'Years to Payoff', value: '30' },
                  { label: 'Interest Rate', value: '6.5%' },
                ],
              },
              {
                heading: 'Income',
                rows: [
                  { label: 'Rents', value: '$6,000/mo', detail: '4 units x $1,500' },
                  { label: 'Other Income', value: '$0' },
                ],
              },
              {
                heading: 'Expenses',
                rows: [
                  { label: 'Vacancy Rate', value: '6%' },
                  { label: 'Maintenance & CapEx', value: '12%' },
                  { label: 'Management', value: '8%' },
                  { label: 'Utilities', value: '$0' },
                  { label: 'Additional Expenses', value: '$0' },
                  { label: 'Insurance', value: '$1,000/yr' },
                  { label: 'Taxes', value: '$4,000/yr' },
                ],
              },
            ],
          },
          maxAttempts: 3,
          showExplanationOnPass: true,
          explanationOnFail: 'Make sure you entered all the property data correctly into the CDS Rental Calculator. Double-check each field against the values above.',
          cheatSheets: [
            {
              title: 'Calculator Inputs',
              color: 'purple',
              rows: [
                { label: 'Purchase Price', value: '$600,000' },
                { label: 'Costs to Make Rent Ready', value: '$0' },
                { label: 'Down Payment', value: '25% ($150,000)' },
                { label: 'Closing Costs', value: '2% ($9,000)' },
                { label: 'Years to Payoff', value: '30' },
                { label: 'Interest Rate', value: '6.5%' },
                { label: 'Rents', value: '$6,000/mo' },
                { label: 'Other Income', value: '$0' },
                { label: 'Vacancy', value: '6% (-$360)' },
                { label: 'Maintenance', value: '12% (-$8,121.60)' },
                { label: 'Management', value: '8% (-$5,414.40)' },
                { label: 'Utilities', value: '$0' },
                { label: 'Additional Expenses', value: '$0' },
                { label: 'Insurance', value: '$1,000/yr' },
                { label: 'Taxes', value: '$4,000/yr' },
              ],
            },
            {
              title: 'Returns Analysis',
              color: 'green',
              rows: [
                { label: 'Purchase Price', value: '$600,000' },
                { label: 'Total Capital Required', value: '$159,000.00' },
                { label: 'Net Operating Income', value: '$49,144.00' },
                { label: 'Debt Service', value: '$34,131.67' },
                { label: 'Cash on Cash Return', value: '9.44%', highlight: true },
                { label: 'Cap Rate', value: '8.19%', highlight: true },
                { label: 'Cashflow', value: '$15,012.33', highlight: true },
                { label: 'Principal Paydown', value: '$5,029.76' },
                { label: 'Total Return on Investment', value: '$20,042.09 (12.61%)' },
              ],
            },
          ],
          inputs: [
            {
              id: 'coc_return',
              label: 'Cash on Cash Return',
              type: 'number',
              correctAnswer: 9.44,
              tolerance: 0.05,
              unit: '%',
            },
          ],
        },
      ],
    },
  },
  {
    day: 2,
    title: "Analysis & Connection",
    caption: "Inaccurate Income & Inaccurate Expenses",
    taskDescription: "",
    trainingContent: `Understanding Market Rents

Your rent estimate is one of the MOST important numbers when analyzing a deal.

If your rent estimate is wrong: your cash flow will be wrong, your returns will be wrong, and your investment decision may be wrong.

The biggest mistake new investors make is assuming rents are higher than the market actually supports. When this happens, the deal is bad from the start. Nothing makes up for bad analysis.

As you follow the steps below, you will learn how to determine what a property can ACTUALLY rent for. To do this properly, you MUST verify market rents using multiple sources and ALWAYS stay conservative.

How To Understand Market Rents

1. Recently Leased Comparable Properties (BEST SOURCE)
Find properties that ACTUALLY rented recently. Use properties with similar bedrooms, bathrooms, square footage, condition, and location. Focus on properties leased within the last 30–90 days. Pay attention to how quickly the property rented — a property rented in 3 days is a much stronger comp than one sitting for 60 days.

2. Call Local Property Managers
Ask property managers what they believe the property would realistically rent for today. Good property managers understand current demand, tenant expectations, vacancy trends, and pricing pressure. Ask multiple managers so you can compare answers.

Questions To Ask:
• What would this realistically rent for?
• How fast would it rent?
• What upgrades would increase rent?
• What tenant class would this attract?
• What are current vacancy rates in this area?
• What utilities are typically tenant-paid vs owner-paid?

3. Check Active Rental Listings
Use Zillow, Apartments.com, Facebook Marketplace, Rent.com, and Craigslist. Compare similar properties in the same area. DO NOT blindly trust asking rents. Pay attention to days on market, price drops, property condition, utilities included, parking, amenities, and updates/renovations. If listings sit for a long time, the market may not support that rent.

4. Call Current Rental Listings
Call landlords or leasing agents directly. Ask how much interest they are getting, how quickly rentals are moving, and whether they have recently lowered pricing. This gives real-time market feedback.

5. Compare Nearby Rentals You Already Own (or Lean on a Local Investor/Mentor)
If you already own rentals nearby, use your own data. You can also lean on experienced local investors or mentors.

6. Use AI & Software Tools
Tools like ChatGPT, Claude, Rentometer, Zillow Rent Zestimate, and property management software can provide helpful insight. However, these should NEVER be your only source of information.

7. Be Conservative
Never use unrealistic "best-case" rent numbers. Use rent numbers you are confident you can ACTUALLY achieve. Conservative underwriting protects you during market slowdowns.

Quick Rules To Remember:
• Never guess rents
• Use multiple data sources
• Compare similar properties only
• Talk to real people in the market
• Use conservative numbers
• Verify rents BEFORE submitting offers
• DO NOT buy a property unless you are confident in your rent analysis

Understanding Expenses

Real estate investors usually lose on analysis in TWO ways:
#1. They estimate rents too high.
#2. They estimate expenses too low.

The older the property is, the higher your expenses will usually be. The lower the quality of the tenant base, the higher your expenses will usually be.

Even if the property is newer, you believe management will be excellent, or you believe repairs will be minimal — DO NOT underwrite below realistic operating ranges. That is not good analysis — it is simply aggressive assumptions.

Tips For Analyzing Expenses:

1. Analyze Conservatively — If the deal still works using conservative numbers, it is probably a strong deal.

2. Research The Property Thoroughly — Study the age of the property, deferred maintenance, tenant quality, location, crime, utility setup, and historical performance.

3. Lean On Professionals — Talk to professionals who are NOT financially incentivized by you buying the property: property managers, contractors, insurance agents, or local operators.

4. Use AI & Software For Insight — Tools like ChatGPT, Claude, calculators, and property analysis software can help identify realistic ranges and potential blind spots.

5. Conservative Analysis Creates Safer Deals — It is ALWAYS better for actual expenses to come in lower than expected.

Typical Expense Ranges:

Vacancy: Conservative 5–8% | Typical 3–5% | Aggressive 1–3%
Maintenance + Repairs: Conservative 5–10% | Typical 4–8% | Aggressive 2–4%
CapEx Reserve: Conservative 5–10% | Typical 4–8% | Aggressive 2–4%
Property Management: Conservative 8–12% | Typical 6–10% | Aggressive 2–5%
Property Taxes: ONLY USE ACTUAL NUMBERS
Insurance: ONLY USE ACTUAL NUMBERS
Total Operating Expenses (Excl. Debt): Conservative 35–45% | Typical 30–40% | Aggressive 25–30%

ALWAYS get exact property tax numbers and real insurance quotes before purchasing. Older properties generally require higher maintenance and CapEx reserves. Verify ALL numbers before submitting offers or removing contingencies.

Reminder: Conservative analysis creates safer deals. Aggressive analysis increases the risk of making bad investments.

Today's Suggested Arsenal Contact

Connect with a local property manager to see if they know of any available deals or off-market opportunities.

During the conversation: explain your real estate investing goals, let them know you are actively looking to purchase rental properties, and tell them you will likely need property management services in the future.

This is also a great opportunity to evaluate their expertise. Ask them what they believe a property you are analyzing today would realistically rent for, how quickly they believe it would rent, and what tenant class they believe the property would attract.

Building strong relationships with quality property managers can help you find deals, better understand local market conditions, improve your analysis, and build a stronger investing team.`,
    category: "foundation",
    weekNumber: 1,
    weekTitle: "BUILD THE FOUNDATION",
    proofType: "screenshot",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: {
      required: true,
      scenarios: [
        {
          id: 'day2_market_rent_sfh',
          title: 'Scenario #1 — 3 Bed / 2 Bath Single Family Rental',
          description: `Below is a real-world market rent analysis exercise. Use the information provided from recently leased comps, property manager feedback, active listings, calls to listings, and AI/software estimates.

Your job is to determine the MOST realistic and conservative market rent. Choose the BEST answer based on the information provided.`,
          propertyListing: {
            title: '3 Bed / 2 Bath Single Family Rental',
            badges: ['Single Family', '3/2', '1,520 SF', 'Idaho Falls, ID'],
            highlights: [
              { icon: '🛏️', label: 'Beds/Bath', value: '3/2' },
              { icon: '📐', label: 'Sq Ft', value: '1,520' },
              { icon: '🏗️', label: 'Built', value: '1998' },
            ],
            sections: [
              {
                heading: 'Property Details',
                rows: [
                  { label: 'Recently updated flooring and paint', value: '' },
                  { label: '2-car garage', value: '' },
                  { label: 'Clean B-class neighborhood', value: '' },
                  { label: 'Tenant pays all utilities', value: '' },
                ],
              },
            ],
          },
          contentSections: [
            {
              heading: 'The seller believes this property will rent for $2,450/month. Your job is to determine what the REALISTIC market rent likely is.',
              type: 'text',
              content: '',
            },
            {
              heading: '1. Recently Leased Comparable Properties',
              type: 'table',
              columns: ['Property', 'Details', 'Leased Rent', 'Days on Market'],
              rows: [
                ['Comp #1', '3/2 — 1,480 SF — Similar updates', '$2,050', '6 Days'],
                ['Comp #2', '3/2 — 1,560 SF — Slightly nicer kitchen', '$2,150', '12 Days'],
                ['Comp #3', '3/2 — 1,500 SF — Similar condition', '$2,095', '8 Days'],
                ['Comp #4', '3/2 — 1,620 SF — Slightly older finishes', '$1,995', '15 Days'],
              ],
            },
            {
              heading: '2. Property Manager Feedback',
              type: 'quotes',
              items: [
                { source: 'Property Manager #1', text: '"I believe this would rent around $2,050–$2,100 pretty quickly."' },
                { source: 'Property Manager #2', text: '"The market has softened slightly over the last 60 days. I would probably list at $2,150 but expect to land closer to $2,050–$2,100."' },
                { source: 'Property Manager #3', text: '"If the property presents very clean, I think $2,100 is realistic. Above that may increase vacancy time."' },
              ],
            },
            {
              heading: '3. Active Rental Listings',
              type: 'bullets',
              items: [
                'Similar 3/2 home listed at $2,250 has been active for 41 days.',
                'Similar updated home listed at $2,095 rented in 5 days.',
                'Another nearby home reduced pricing from $2,250 to $2,125 after sitting for 28 days.',
              ],
            },
            {
              heading: '4. Calls To Active Listings',
              type: 'bullets',
              items: [
                'Leasing agent #1 stated they have had "very little activity" above $2,200.',
                'Leasing agent #2 stated demand is strongest between $2,000–$2,100.',
                'One landlord offered one month free parking and reduced deposit requirements to attract tenants at higher pricing.',
              ],
            },
            {
              heading: '5. AI & Software Estimates',
              type: 'bullets',
              items: [
                'Zillow Rent Zestimate: $2,180',
                'Rentometer Estimate: $2,070',
                'ChatGPT Estimate Based On Market Data: $2,050–$2,125',
              ],
            },
          ],
          maxAttempts: 3,
          explanationOnFail: `Why $2,100/month?

• Recently leased comps consistently support ~$2,050–$2,150.
• Property managers repeatedly supported ~$2,050–$2,100.
• Active listings above $2,200 are sitting longer.
• Real-time calls show weakening demand above $2,200.
• Conservative analysis points toward ~$2,100 as the safest realistic rent estimate.`,
          inputs: [
            {
              id: 'market_rent_sfh',
              label: 'What is the MOST realistic and conservative market rent estimate?',
              type: 'multiple_choice',
              options: ['$2,450/month', '$2,275/month', '$2,100/month', '$1,850/month'],
              correctAnswer: 2,
            },
          ],
        },
        {
          id: 'day2_market_rent_4plex',
          title: 'Scenario #2 — 4-Unit Apartment Complex',
          description: `Below is a real-world market rent analysis exercise for a small multifamily property. Use the information provided to determine the MOST realistic market rent for EACH unit.`,
          propertyListing: {
            title: '4-Unit Apartment Complex',
            badges: ['Multifamily', '4 Units', '2 Bed / 1 Bath Each', 'Idaho Falls, ID'],
            highlights: [
              { icon: '🏠', label: 'Units', value: '4' },
              { icon: '🛏️', label: 'Each Unit', value: '2/1' },
              { icon: '📐', label: 'Approx SF', value: '850' },
            ],
            sections: [
              {
                heading: 'Property Details',
                rows: [
                  { label: 'Built', value: '1985' },
                  { label: 'Condition', value: 'Clean, slightly dated interiors' },
                  { label: 'Amenities', value: 'Shared laundry room' },
                  { label: 'Tenant pays', value: 'Electricity' },
                  { label: 'Owner pays', value: 'Water/sewer/trash' },
                ],
              },
              {
                heading: 'Current Rent Roll',
                rows: [
                  { label: 'Unit 1', value: '$1,050/mo' },
                  { label: 'Unit 2', value: '$1,075/mo' },
                  { label: 'Unit 3', value: '$1,050/mo' },
                  { label: 'Unit 4', value: '$1,100/mo' },
                ],
              },
            ],
          },
          contentSections: [
            {
              heading: 'All four tenants are currently month-to-month. The seller claims the rents are "already at market." Your job is to determine whether the units are actually rented at market rates.',
              type: 'text',
              content: '',
            },
            {
              heading: '1. Recently Leased Comparable Properties',
              type: 'table',
              columns: ['Property', 'Details', 'Leased Rent', 'Days on Market'],
              rows: [
                ['Comp #1', '2/1 — 840 SF — Similar condition', '$1,325', '5 Days'],
                ['Comp #2', '2/1 — 860 SF — Slightly nicer flooring', '$1,375', '8 Days'],
                ['Comp #3', '2/1 — 850 SF — Similar finishes', '$1,350', '4 Days'],
                ['Comp #4', '2/1 — 870 SF — Similar location', '$1,300', '9 Days'],
              ],
            },
            {
              heading: '2. Property Manager Feedback',
              type: 'quotes',
              items: [
                { source: 'Property Manager #1', text: '"Those current rents are definitely below market. I think these units would lease around $1,325–$1,375 today."' },
                { source: 'Property Manager #2', text: '"Even with slightly dated interiors, demand for 2-bedroom units is very strong right now."' },
                { source: 'Property Manager #3', text: '"I would likely list these around $1,350 and expect them to rent quickly."' },
              ],
            },
            {
              heading: '3. Active Rental Listings',
              type: 'bullets',
              items: [
                'Similar nearby 2-bedroom unit listed at $1,350 rented in 6 days.',
                'Another nearby unit listed at $1,395 received multiple applications in under one week.',
                'Older competing unit listed at $1,250 rented within 3 days.',
              ],
            },
            {
              heading: '4. Calls To Active Listings',
              type: 'bullets',
              items: [
                'Leasing agent #1 stated they currently have "extremely high demand" for 2-bedroom units.',
                'Leasing agent #2 stated they raised pricing twice in the last 12 months.',
                'One landlord stated they currently have waiting lists for similar units.',
              ],
            },
            {
              heading: '5. AI & Software Estimates',
              type: 'bullets',
              items: [
                'Zillow Rent Zestimate: $1,365',
                'Rentometer Estimate: $1,340',
                'ChatGPT Estimate Based On Market Data: $1,325–$1,375',
              ],
            },
          ],
          maxAttempts: 3,
          explanationOnFail: `Why $1,325–$1,375 per unit?

• Recently leased comparable properties consistently support rents around $1,300–$1,375.
• Property managers repeatedly confirmed the units are under-rented.
• Active listings and leasing calls show very strong demand for 2-bedroom units.
• AI/software estimates aligned closely with the comparable market data.
• The current month-to-month tenants appear to be approximately $250–$300 below true market rent.`,
          inputs: [
            {
              id: 'market_rent_4plex',
              label: 'What is the MOST realistic market rent for EACH unit?',
              type: 'multiple_choice',
              options: ['$1,050–$1,100 per unit', '$1,150–$1,200 per unit', '$1,325–$1,375 per unit', '$1,500+ per unit'],
              correctAnswer: 2,
            },
          ],
        },
        {
          id: 'day2_top5',
          title: 'Market Rent & Expense Analysis Questions',
          description: 'Answer all 5 questions correctly to continue.',
          maxAttempts: 3,
          explanationOnFail: `Review the correct answers:

1. Estimating rents too high is the biggest mistake — it makes every other number wrong.
2. Recently leased comparable properties are the best indicator of true market rent.
3. A listing sitting 45 days with price drops means the market does not support that rent.
4. Always use conservative expense assumptions and verify with actual numbers.
5. Conservative analysis helps avoid bad deals — aggressive analysis increases risk.`,
          inputs: [
            {
              id: 'top5_q1',
              label: '1. What is the BIGGEST mistake new real estate investors make when analyzing rental properties?',
              type: 'multiple_choice',
              options: ['Overestimating maintenance costs', 'Underestimating purchase price', 'Estimating rents too high', 'Using too much cash down'],
              correctAnswer: 2,
            },
            {
              id: 'top5_q2',
              label: '2. Which source is generally considered the BEST indicator of true market rent?',
              type: 'multiple_choice',
              options: ['Zillow Rent Zestimate', 'What the seller says the property should rent for', 'Recently leased comparable properties', 'Active listings currently on the market'],
              correctAnswer: 2,
            },
            {
              id: 'top5_q3',
              label: '3. A comparable rental property has been listed for 45 days at $2,400/month with multiple price drops. What is the MOST likely conclusion?',
              type: 'multiple_choice',
              options: ['The property is probably underpriced', 'The market likely does not support that rent', 'The property manager is doing a great job', 'You should use $2,400 as your market rent estimate'],
              correctAnswer: 1,
            },
            {
              id: 'top5_q4',
              label: '4. Which of the following is the BEST approach when analyzing expenses?',
              type: 'multiple_choice',
              options: ['Use the lowest expense estimates possible to improve returns', 'Ignore CapEx if the property looks clean', 'Use conservative expense assumptions and verify actual numbers', 'Estimate taxes and insurance using online averages only'],
              correctAnswer: 2,
            },
            {
              id: 'top5_q5',
              label: '5. Which statement BEST describes strong real estate underwriting?',
              type: 'multiple_choice',
              options: ['Aggressive analysis creates better deals', 'Conservative analysis helps avoid bad deals', 'Higher projected rents always mean higher returns', 'If current rents are low, they should always be used as market rent'],
              correctAnswer: 1,
            },
          ],
        },
      ],
    },
  },
  {
    day: 3,
    title: "Financing & Offers",
    caption: "Getting Pre-Approved & Submitting Your First Offer",
    taskDescription: "",
    trainingContent: `Why Financing Matters

Many investors spend months analyzing deals but never take action because they are not pre-approved, do not understand financing, or are not ready to submit offers when opportunities appear.

Great deals move FAST.

If you are not financially prepared, you do not understand loan terms, or you cannot confidently submit offers, you will lose opportunities to investors who ARE ready.

The goal of today is to understand financing, build your investing team, become pre-approved, and confidently submit your first offer.

What Is A Pre-Approval?

A pre-approval is a lender reviewing your income, debt, credit, assets, and financial situation to determine how much they may lend you, what loan terms you qualify for, and what your estimated payment could look like.

A strong pre-approval makes sellers and realtors take you seriously.

Why Getting Pre-Approved Is Important

1. You Learn Your REAL Buying Power

Many investors guess what they can afford. A lender helps determine realistic loan amounts, down payment requirements, cash reserves, and estimated monthly payments.

2. You Can Move Quickly On Deals

Good deals often move fast. If you are already pre-approved, you can submit offers quickly, compete more effectively, and avoid delays.

3. Realtors Take You More Seriously

Most good realtors do not want to spend weeks showing properties to buyers who cannot qualify. A pre-approval shows you are serious, financially prepared, and ready to buy.

Types Of Financing To Understand

Conventional Loans — Most common financing type. Usually requires 15–25% down for investment properties, good credit, stable income, and cash reserves. Often best for long-term rentals, duplexes, fourplexes, and stabilized properties.

DSCR Loans (Debt Service Coverage Ratio) — Loans based primarily on property cash flow instead of personal income. Helpful for self-employed investors, scaling portfolios, and investors with strong cash-flowing properties.

Seller Finance — The seller acts as the bank. Can help with lower down payments, flexible terms, lower closing costs, and easier qualification.

Local Banks & Credit Unions — Sometimes provide more flexible underwriting, portfolio loans, and local market understanding. Especially valuable for small multifamily, value-add deals, and investors building relationships.

What Lenders Usually Look At

• Credit Score — Higher credit scores usually improve approval odds, interest rates, and loan options.
• Debt-To-Income Ratio (DTI) — Lenders compare your monthly debts vs. your monthly income. Too much debt can reduce borrowing ability.
• Cash Reserves — Many lenders want to see extra cash after closing, emergency reserves, and liquidity.
• Income Stability — Lenders usually prefer stable employment, consistent income, and clean tax returns.

Documents You Will Usually Need: driver's license, pay stubs, tax returns, bank statements, business returns (if self-employed), entity documents (sometimes), and rental property information (if already investing).

Understanding Loan Terms

Do NOT focus ONLY on purchase price or monthly payment. You must understand interest rate, loan length, down payment, closing costs, reserves, and total cash needed. A bad loan can destroy a good deal.

Selecting The RIGHT Realtor

Not all realtors are good investor realtors. Many agents specialize in retail home buyers, emotional purchases, or luxury sales. That does NOT mean they understand investing.

You want a realtor who understands cash flow, understands investment analysis, works with investors regularly, understands rental demand, understands off-market opportunities, and can move FAST.

Signs Of A Strong Investor Realtor:

1. They Understand Investment Numbers — They should understand cash flow, cap rates, returns, rent analysis, and operating expenses. If they cannot discuss investment numbers confidently, that is a red flag.

2. They Know Investors In The Market — Good investor agents often know landlords, wholesalers, property managers, contractors, and off-market sellers.

3. They Respond Quickly — Speed matters in real estate. Slow communication loses deals.

4. They Push Data, Not Emotion — Bad agents say "This house feels amazing." Good investor agents say "Here are the numbers."

Questions To Ask Realtors:
• Have you worked with investors before?
• Do you own investment property personally?
• What investors are active in this market?
• What areas have strongest rental demand?
• What areas should investors avoid?
• What property types move quickly?
• Do you know of off-market opportunities?
• How many investment deals did you close last year?
• What property managers do you recommend?
• What lenders do investors use most in this market?

Understanding Offers

An offer is MUCH more than just price. Strong offers include purchase price, financing terms, earnest money, due diligence period, inspection contingency, financing contingency, closing timeline, seller concessions, and additional protections.

The goal is NOT just getting under contract. The goal is controlling risk, protecting downside, and maintaining multiple exit options.

How To Actually Submit An Offer

Step 1. Analyze The Property First — Before submitting ANY offer: verify rents, estimate expenses conservatively, understand repairs, and confirm financing. Never submit emotional offers.

Step 2. Discuss Strategy With Your Realtor — Before submitting: discuss pricing strategy, market competition, seller motivation, and contingency structure. Sometimes stronger terms matter more than price.

Step 3. Determine Your Maximum Price — Know your ideal price, your walk-away price, and your maximum risk tolerance. Never negotiate emotionally.

Step 4. Structure The Offer Properly — A strong offer balances competitiveness, flexibility, and protection. You want enough protection to safely exit the deal if financing changes, inspections reveal issues, numbers were inaccurate, or new information appears.

Earnest Money Rules To Live By

Earnest money shows the seller you are serious. BUT you NEVER want to unnecessarily risk losing it.

Rule #1. Keep Earnest Money Reasonable — Do NOT overcommit earnest money. New investors often believe "more earnest money = stronger offer." Not always. Use reasonable amounts appropriate for deal size, market, and risk.

Rule #2. NEVER Release Earnest Money Early — Do NOT release earnest money to the seller before inspections, due diligence, and financing protections are complete.

Rule #3. Make Sure Earnest Money Is Protected During Contingencies — You want contractual outs during inspection periods, due diligence periods, financing contingencies, and appraisal contingencies when possible.

Due Diligence & Inspection Rules

Rule #1. NEVER Waive Inspections As A Beginner — Even if the market is competitive, the seller pressures you, or your realtor pushes you. Inspections protect you from major repairs, hidden damage, structural issues, plumbing problems, electrical issues, and bad assumptions.

Rule #2. Give Yourself Enough Due Diligence Time — Rushing due diligence is dangerous. You need time to inspect the property, verify leases, verify expenses, confirm financing, and validate your analysis.

Rule #3. Verify EVERYTHING — Do NOT trust seller statements, pro formas, rent estimates, or verbal claims. Verify rents, leases, utilities, taxes, insurance, repairs, and operating expenses.

Rule #4. Maintain Financing Outs — Your contract should allow you an exit if financing changes, rates spike, loan terms change, or approval falls apart. Never remove financing protections too early.

Common Offer Mistakes New Investors Make

1. Overpaying Emotionally — Good deals are created through numbers, not excitement.
2. Using Aggressive Assumptions — Never force a deal to work.
3. Waiving Protections — Waiving inspections, financing contingencies, or due diligence protections can create catastrophic risk.
4. Not Understanding Repair Costs — Small issues become very expensive quickly.
5. Trusting Seller Numbers Blindly — Always independently verify everything.

Strong Offer Principles

Strong investors move quickly, analyze conservatively, negotiate professionally, protect downside risk, and submit LOTS of disciplined offers. You do NOT need every offer accepted. You simply need consistent action, disciplined underwriting, and enough quality offers.

Quick Rules To Remember:
• Get pre-approved BEFORE aggressively shopping
• Build lender relationships early
• Use investor-friendly realtors
• Never buy emotionally
• Verify ALL numbers independently
• Protect your earnest money
• NEVER waive inspections as a beginner
• Maintain financing contingencies
• Use conservative underwriting
• Some offers SHOULD be rejected
• Real estate is a numbers game

Understanding Realtor & Lender Incentives

Remember: Realtors usually get paid when deals close. Mortgage brokers usually get paid when loans close. This does NOT mean they are bad people. But you still must verify numbers yourself, analyze conservatively, and make decisions based on YOUR goals.

Today's Suggested Arsenal Contact

Connect with a lender, mortgage broker, or investor-friendly realtor. You should also explain your investing goals, what type of properties you want to buy, and what your long-term plans are.

Strong lender and realtor relationships can help you move faster, improve deal flow, strengthen offers, and help you scale more efficiently.

Your goals today: begin the pre-approval process, ask questions about financing, learn loan requirements, and start building relationships. SUBMIT YOUR FIRST OFFER!`,
    category: "foundation",
    weekNumber: 1,
    weekTitle: "BUILD THE FOUNDATION",
    proofType: "screenshot",
    videoUrl: null,
    transcript: null,
    downloads: [
      { name: 'Submitting An Offer Checklist', url: '/offer-checklist.html' },
    ],
    quiz: {
      required: true,
      scenarios: [
        {
          id: 'day3_financing_offers',
          title: 'Financing & Offers Quiz',
          description: 'Answer all 5 questions correctly to continue.',
          maxAttempts: 3,
          explanationOnFail: `Review the correct answers:

1. Getting pre-approved helps you understand your real buying power and move quickly on deals.
2. You must understand the TOTAL loan structure and cash needed — not just monthly payment or interest rate alone.
3. The inspection contingency protects buyers from hidden property issues like structural damage, plumbing, and electrical problems.
4. Waiving protections and contingencies too early is one of the biggest mistakes — it creates catastrophic risk.
5. The best realtor for investors understands investment analysis and rental properties, not just retail home sales.`,
          inputs: [
            {
              id: 'day3_q1',
              label: '1. Why is getting pre-approved important before submitting offers?',
              type: 'multiple_choice',
              options: [
                'It guarantees the seller accepts your offer',
                'It helps you understand your real buying power and move quickly',
                'It eliminates closing costs',
                'It removes the need for inspections',
              ],
              correctAnswer: 1,
            },
            {
              id: 'day3_q2',
              label: '2. What is one of the MOST important things to understand about a loan?',
              type: 'multiple_choice',
              options: [
                'Only the monthly payment',
                'Only the interest rate',
                'Total loan structure and cash needed',
                'The lender\'s logo',
              ],
              correctAnswer: 2,
            },
            {
              id: 'day3_q3',
              label: '3. Which contingency helps protect buyers from hidden property issues?',
              type: 'multiple_choice',
              options: [
                'Financing contingency',
                'Inspection contingency',
                'Earnest money contingency',
                'Closing contingency',
              ],
              correctAnswer: 1,
            },
            {
              id: 'day3_q4',
              label: '4. What is one of the biggest mistakes new investors make when submitting offers?',
              type: 'multiple_choice',
              options: [
                'Using conservative assumptions',
                'Protecting their earnest money',
                'Waiving protections and contingencies too early',
                'Asking too many questions',
              ],
              correctAnswer: 2,
            },
            {
              id: 'day3_q5',
              label: '5. What type of realtor is BEST for a real estate investor?',
              type: 'multiple_choice',
              options: [
                'A realtor focused only on luxury homes',
                'A realtor who mainly works with first-time retail buyers',
                'A realtor who understands investment analysis and rental properties',
                'Any realtor with the most Instagram followers',
              ],
              correctAnswer: 2,
            },
          ],
        },
      ],
    },
  },
  {
    day: 4,
    title: "Creative Deal Structure",
    caption: "Seller Finance, Negotiation & Structuring Win-Win Deals",
    taskDescription: "",
    trainingContent: `Why Creative Financing Matters

Many investors believe the only way to buy real estate is 20–25% down, through a bank, with standard loan terms. That is NOT true.

Creative financing can lower down payments, improve cash flow, lower interest rates, extend loan terms, reduce closing costs, and create opportunities that traditional financing cannot.

Creative deal structure is one of the MOST powerful tools in real estate investing. But creative financing also creates additional risk if used improperly.

The goal is NOT "creative at all costs." The goal is structuring SAFE deals, improving cash flow, reducing risk where possible, and creating WIN-WIN solutions.

Why Off-Market Deals Matter

Many of the BEST creative finance opportunities happen OFF market. Because many sellers do not want strangers walking through their property, do not want tenants disturbed, do not want to pay realtor commissions, want privacy, want flexibility, or want a simpler sale process.

Off-market deals are often MUCH easier to negotiate creatively because there is less competition, sellers are often more flexible, and you can structure solutions directly with the seller.

Benefits Of Off-Market Seller Finance Deals

Benefits For The Buyer:
• Less competition
• More flexible negotiations
• Lower closing costs
• Potentially lower interest rates
• Flexible down payments
• More room for creative structure
• Avoiding some bank fees and lender costs

Traditional loans can easily add 1–3%+ in additional lender-related costs. Seller finance deals are often significantly cheaper to close.

Benefits For The Seller:
• Monthly income
• Potential tax advantages
• Flexible timing
• Simpler transaction
• No realtor commissions
• Less disruption to tenants
• Potentially higher sale prices
• Faster and more flexible negotiations

Good negotiation is NOT taking advantage of people. The BEST negotiations create solutions that genuinely help BOTH parties.

How To Find Off-Market Seller Finance Opportunities

1. Property Managers — Property managers often know tired landlords, struggling owners, aging investors, and owners considering selling.

2. Realtors — Some realtors know expired listings, landlords open to creative terms, or sellers struggling to sell traditionally.

3. Direct Outreach — Mailers, cold calling, texting, networking, driving for dollars, social media, and referrals.

4. Networking With Investors — Many investors eventually burn out, want passive income, or want simpler ownership structures. Seller finance can solve those problems.

What Is Seller Finance?

Seller finance means the seller acts as the bank. Instead of getting all cash at closing, the seller agrees to receive payments over time. This allows buyers and sellers to negotiate down payments, interest rates, payment structure, loan terms, balloon payments, and other creative solutions.

Why Sellers Accept Seller Finance

Many beginners think "Why would a seller ever do this?" Because seller finance can solve REAL seller problems.

Possible seller motivations: reducing taxes, creating monthly income, difficulty selling traditionally, wanting passive income, avoiding management headaches, avoiding realtor commissions, wanting higher sale prices, or needing flexible timing.

Negotiation is NOT "taking advantage of people." Good negotiation is helping solve problems for BOTH sides.

Creative Financing Is Negotiation

Everything is negotiable: purchase price, interest rate, loan term, balloon payment, down payment, payment timing, repair credits, closing timeline, and even payment structure.

The BEST creative deals help the seller, improve the buyer's cash flow, and reduce risk for both parties.

The MOST Important Rule

A creative deal does NOT magically make a bad property a good deal. You MUST still analyze conservatively, verify rents, verify expenses, and understand risk. Creative financing improves structure. It does NOT fix bad analysis.

Understanding Down Payments

Lower down payments improve cash-on-cash return, preserve liquidity, and allow faster scaling. BUT lower down payments also increase risk.

The Danger Of Low Down Payments

Many investors get excited because a low down payment + low interest rate = massive cash-on-cash returns. But that does NOT automatically mean the deal is safe.

Example: 1% down payment, low interest rate, high leverage, and little reserves can become VERY dangerous if vacancy rises, repairs increase, rents soften, or the market shifts.

Important Rule About Analysis

Even if you negotiate 1% down, 5% down, or no money down, you should STILL analyze the property as if you invested at least 20% down. Why? Because you need to understand the REAL risk, the REAL leverage, and whether the deal is fundamentally strong. Creative financing can improve returns but it can also amplify risk.

Understanding Interest Rates

A lower interest rate lowers payments, improves cash flow, and improves debt coverage. Even small changes matter. Example: 3% seller finance vs. 7% bank financing can completely change monthly cash flow, cash-on-cash return, and long-term profitability.

Understanding Loan Terms

Longer loan terms lower payments, improve cash flow, and improve debt coverage. Shorter terms increase principal paydown but increase monthly payments. Sometimes longer terms create SAFER deals.

What Is A Balloon Payment?

A balloon payment means the loan is NOT fully paid off by the end of the agreement. Instead, a large remaining balance becomes due at a future date. Example: 30-year amortization, but the remaining balance is due in 5 years. This creates lower monthly payments initially but creates refinance or payoff pressure later.

The Dangers Of Balloon Payments

Balloon payments can become VERY dangerous if the market shifts, refinancing becomes difficult, interest rates rise, values decline, cash flow weakens, or analysis was incorrect. Many investors get into trouble because they only focus on today's payment, not the future balloon risk.

Balloon Payment Rules To Live By

1. NEVER Ignore The Balloon — You MUST have a realistic refinance plan, payoff strategy, or exit strategy.

2. Stress Test Worst-Case Scenarios — Ask yourself: What if rates increase? What if values decline? What if rents soften? What if lending tightens?

3. Longer Balloons Usually Reduce Risk — Generally a 10-year balloon is safer than a 3-year balloon. More time creates more flexibility.

4. Strong Deals Matter MORE With Balloons — Weak deals become MUCH riskier when balloons exist.

Interest-Free Principal Paydown Structures

Sometimes sellers may agree to a down payment PLUS monthly principal payments with NO interest. Example: $50,000 down, $4,000/month principal-only payments, no interest for 5 years. This can massively improve cash flow, accelerate equity growth, and reduce interest expense.

Risks Of Principal-Only Structures: These structures can still become dangerous if payments are too aggressive, reserves are too low, rents decline, or repairs rise unexpectedly. High cash-on-cash returns do NOT automatically equal low risk.

Structuring Multiple Offers

One of the BEST negotiation strategies is giving sellers MULTIPLE options. Instead of "take it or leave it," you create flexibility and collaboration.

Example Creative Offer Structure:

Option 1 – Higher Price / Better Terms: Purchase Price $520,000 — 5% interest, 10% down, 30-year amortization, 10-year balloon.

Option 2 – Lower Price / Larger Down Payment: Purchase Price $485,000 — 6% interest, 25% down, 30-year amortization, no balloon.

Option 3 – Principal-Only Structure: Purchase Price $500,000 — $60,000 down, principal-only payments for 5 years, refinance before maturity.

Why Multiple Offers Work

Multiple offers reduce pressure, create flexibility, help sellers feel involved, and increase chances of agreement. It also helps uncover what the seller values MOST. Some sellers prioritize price. Others prioritize monthly income, tax benefits, speed, or simplicity.

Good Negotiation Principles

Good negotiation is NOT manipulation, pressure, or "winning." The best negotiations solve problems, create flexibility, and improve outcomes for BOTH sides.

Questions To Understand Seller Motivation:
• Why are you selling?
• What is most important to you?
• Do you need cash now or income over time?
• How flexible are you on timing?
• What would make this deal work for you?
• Are taxes a concern?
• Would monthly income help you?

The better you understand the seller, the better you can structure solutions.

Common Creative Financing Mistakes

1. Focusing ONLY On Cash Flow — Good monthly cash flow does NOT guarantee safety.
2. Ignoring Balloon Risk — Many investors underestimate refinance risk.
3. Using Low Down Payments Without Reserves — Leverage magnifies risk.
4. Forcing Creative Structures On Bad Deals — Creative financing does NOT fix bad properties.
5. Negotiating Without Understanding Seller Motivation — The best deals come from solving REAL problems.

Quick Rules To Remember:
• Creative financing improves structure — not bad deals
• Analyze conservatively FIRST
• Low down payments increase risk
• Maintain strong reserves
• Understand ALL balloon payment risks
• Stress test refinance scenarios
• Structure multiple options when negotiating
• Find solutions that help BOTH buyer and seller
• Never force a deal to work
• Conservative analysis still matters MOST

Today's Suggested Arsenal Contact

Reach out to a seller, realtor, investor, property manager, or property owner and practice discussing seller finance, down payment flexibility, loan terms, or creative structures.

Your goal is NOT to pressure people. Your goal is to understand seller problems and explore possible win-win solutions.

The best negotiators listen carefully, understand motivations, and create flexible solutions.`,
    category: "foundation",
    weekNumber: 1,
    weekTitle: "BUILD THE FOUNDATION",
    proofType: "screenshot",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: {
      required: true,
      scenarios: [
        {
          id: 'day4_property_analysis',
          title: 'Cash on Cash Return Analysis',
          description: 'Analyze the property below. Plug the information into the CDS Rental Calculator and answer both questions.',
          propertyListing: {
            title: 'Rental Property Analysis',
            price: '$600,000',
            badges: ['Investment Property', '25% Down', '7.5% Rate'],
            highlights: [
              { icon: '💰', label: 'Down Pmt', value: '$150,000' },
              { icon: '🏠', label: 'Rent', value: '$6,000/mo' },
              { icon: '📊', label: 'Loan', value: '30yr @ 7.5%' },
            ],
            sections: [
              {
                heading: 'Purchase & Financing',
                rows: [
                  { label: 'Purchase Price', value: '$600,000' },
                  { label: 'Down Payment', value: '25% ($150,000)' },
                  { label: 'Closing Costs', value: '2% ($9,000)' },
                  { label: 'Costs to Make Rent Ready', value: '$0' },
                  { label: 'Loan Term', value: '30 Years' },
                  { label: 'Interest Rate', value: '7.5%' },
                ],
              },
              {
                heading: 'Income',
                rows: [
                  { label: 'Monthly Rents', value: '$6,000' },
                  { label: 'Other Monthly Income', value: '$0' },
                  { label: 'Vacancy', value: '6%' },
                ],
              },
              {
                heading: 'Expenses',
                rows: [
                  { label: 'Maintenance', value: '12%' },
                  { label: 'Property Management', value: '8%' },
                  { label: 'Insurance', value: '$2,000/yr' },
                  { label: 'Property Taxes', value: '$6,000/yr' },
                  { label: 'Utilities', value: '$0' },
                  { label: 'Additional Expenses', value: '$0' },
                ],
              },
            ],
          },
          maxAttempts: 3,
          showExplanationOnPass: true,
          explanationOnFail: 'Make sure you entered all the property data correctly into the CDS Rental Calculator. Double-check each field — especially the interest rate (7.5%), insurance ($2,000/yr), and taxes ($6,000/yr).',
          cheatSheets: [
            {
              title: 'Returns Analysis',
              color: 'green',
              rows: [
                { label: 'Total Capital Required', value: '$159,000' },
                { label: 'Gross Rent', value: '$72,000/yr' },
                { label: 'Vacancy (6%)', value: '-$4,320' },
                { label: 'Maintenance (12%)', value: '-$8,121.60' },
                { label: 'Management (8%)', value: '-$5,414.40' },
                { label: 'Insurance', value: '-$2,000' },
                { label: 'Property Taxes', value: '-$6,000' },
                { label: 'Net Operating Income', value: '$46,144' },
                { label: 'Debt Service (7.5%, 30yr)', value: '-$37,764' },
                { label: 'Annual Cash Flow', value: '$8,380', highlight: true },
                { label: 'Cash on Cash Return', value: '5.27%', highlight: true },
              ],
            },
          ],
          inputs: [
            {
              id: 'day4_coc',
              label: 'What is the approximate cash-on-cash return for this property?',
              type: 'multiple_choice',
              options: ['10.29%', '5.27%', '6.74%', '8.30%'],
              correctAnswer: 1,
            },
            {
              id: 'day4_rate_for_10',
              label: 'Using the same inputs, what interest rate would make the cash-on-cash return above 10%?',
              type: 'multiple_choice',
              options: ['6%', '6.5%', '5.5%', '5.25%'],
              correctAnswer: 3,
            },
          ],
        },
        {
          id: 'day4_creative_financing',
          title: 'Creative Deal Structure Quiz',
          description: 'Answer all 5 questions correctly to continue.',
          maxAttempts: 3,
          explanationOnFail: `Review the correct answers:

1. Low down payment deals increase leverage and reduce your safety margin — if vacancy, repairs, or market conditions change, you have less cushion.
2. Even with creative terms, analyzing at 20% down helps you understand the true strength and risk of the deal independent of financing.
3. A balloon payment is a large remaining balance that becomes due at a future date, creating refinance or payoff pressure.
4. The best negotiation strategy is structuring multiple options that solve seller problems — not pressure or single take-it-or-leave-it offers.
5. Creative financing can improve returns but it can also increase risk — high cash-on-cash returns do NOT automatically mean low risk.`,
          inputs: [
            {
              id: 'day4_q1',
              label: '1. What is one of the BIGGEST dangers of low down payment creative financing deals?',
              type: 'multiple_choice',
              options: [
                'Lower monthly payments',
                'Increased leverage and reduced safety margin',
                'Better cash flow',
                'Longer amortization',
              ],
              correctAnswer: 1,
            },
            {
              id: 'day4_q2',
              label: '2. Why should you still analyze a property using at least 20% down assumptions?',
              type: 'multiple_choice',
              options: [
                'To increase purchase price',
                'To reduce realtor commissions',
                'To understand the true strength and risk of the deal',
                'To avoid negotiations',
              ],
              correctAnswer: 2,
            },
            {
              id: 'day4_q3',
              label: '3. What is a balloon payment?',
              type: 'multiple_choice',
              options: [
                'A refundable earnest money deposit',
                'A large payment due at a future date',
                'A seller-paid repair credit',
                'A property tax increase',
              ],
              correctAnswer: 1,
            },
            {
              id: 'day4_q4',
              label: '4. What is one of the BEST ways to negotiate creative financing?',
              type: 'multiple_choice',
              options: [
                'Use pressure and urgency',
                'Give the seller only one option',
                'Structure multiple options that solve seller problems',
                'Focus only on getting the lowest purchase price possible',
              ],
              correctAnswer: 2,
            },
            {
              id: 'day4_q5',
              label: '5. Which statement BEST describes strong creative financing?',
              type: 'multiple_choice',
              options: [
                'High cash-on-cash returns always mean low risk',
                'Creative financing can improve returns but also increase risk',
                'Balloon payments are always safe',
                'No-money-down deals eliminate downside risk',
              ],
              correctAnswer: 1,
            },
          ],
        },
      ],
    },
  },
  {
    day: 5,
    title: "Activate 10 Deal Sources",
    caption: "",
    taskDescription: "Reach out to 10 agents, PMs, wholesalers, or direct sellers in your target market. Submit screenshots of your outreach messages or call log.",
    trainingContent: "",
    category: "foundation",
    weekNumber: 1,
    weekTitle: "BUILD THE FOUNDATION",
    proofType: "screenshot",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 6,
    title: "Submit Your First Offer",
    caption: "",
    taskDescription: "Write and submit a real offer on a property. Submit the offer document or screenshot of submission confirmation.",
    trainingContent: "",
    category: "foundation",
    weekNumber: 1,
    weekTitle: "BUILD THE FOUNDATION",
    proofType: "document",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 7,
    title: "Follow Up on Yesterday's Offer",
    caption: "",
    taskDescription: "Follow up on yesterday's offer and document the response. Submit screenshot of follow-up communication.",
    trainingContent: "",
    category: "foundation",
    weekNumber: 1,
    weekTitle: "BUILD THE FOUNDATION",
    proofType: "screenshot",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  // ── Week 2: Build the Pipeline (Days 8-14) ──
  {
    day: 8,
    title: "Analyze 10 More Properties",
    caption: "",
    taskDescription: "Analyze 10 properties today with full financial breakdowns. Submit your analysis spreadsheet.",
    trainingContent: "",
    category: "pipeline",
    weekNumber: 2,
    weekTitle: "BUILD THE PIPELINE",
    proofType: "spreadsheet",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 9,
    title: "Make 3 New Offers",
    caption: "",
    taskDescription: "Submit 3 new offers on different properties. Submit offer confirmations or documents.",
    trainingContent: "",
    category: "pipeline",
    weekNumber: 2,
    weekTitle: "BUILD THE PIPELINE",
    proofType: "document",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 10,
    title: "Build Your Contractor Network",
    caption: "",
    taskDescription: "Find and contact 5 contractors for estimates. Submit your contractor contact list with specialties.",
    trainingContent: "",
    category: "pipeline",
    weekNumber: 2,
    weekTitle: "BUILD THE PIPELINE",
    proofType: "document",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 11,
    title: "Driving for Dollars Session",
    caption: "",
    taskDescription: "Spend 1 hour driving target neighborhoods and identify 5 distressed properties. Submit photos and addresses.",
    trainingContent: "",
    category: "pipeline",
    weekNumber: 2,
    weekTitle: "BUILD THE PIPELINE",
    proofType: "photo",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 12,
    title: "Submit 5 Offers Today",
    caption: "",
    taskDescription: "Submit 5 real offers today — volume is key. Submit all offer confirmations.",
    trainingContent: "",
    category: "pipeline",
    weekNumber: 2,
    weekTitle: "BUILD THE PIPELINE",
    proofType: "document",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 13,
    title: "Review & Adjust Your Buy Box",
    caption: "",
    taskDescription: "Review your results so far and adjust your buy box if needed. Submit updated criteria and reasoning.",
    trainingContent: "",
    category: "pipeline",
    weekNumber: 2,
    weekTitle: "BUILD THE PIPELINE",
    proofType: "document",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 14,
    title: "Activate New Deal Sources",
    caption: "",
    taskDescription: "Contact at least 3 private lenders, wholesalers, or new deal sources. Submit communication screenshots.",
    trainingContent: "",
    category: "pipeline",
    weekNumber: 2,
    weekTitle: "BUILD THE PIPELINE",
    proofType: "screenshot",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  // ── Week 3: Apply Pressure (Days 15-21) ──
  {
    day: 15,
    title: "Negotiate a Counter-Offer",
    caption: "",
    taskDescription: "If you have a counter-offer, negotiate it. If not, follow up on all pending. Submit documentation.",
    trainingContent: "",
    category: "pressure",
    weekNumber: 3,
    weekTitle: "APPLY PRESSURE",
    proofType: "document",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 16,
    title: "Analyze a Commercial Property",
    caption: "",
    taskDescription: "Analyze at least 1 commercial or multifamily property. Submit your analysis.",
    trainingContent: "",
    category: "pressure",
    weekNumber: 3,
    weekTitle: "APPLY PRESSURE",
    proofType: "spreadsheet",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 17,
    title: "Submit Your Boldest Offer Yet",
    caption: "",
    taskDescription: "Submit your most aggressive offer yet on your best lead. Submit the offer.",
    trainingContent: "",
    category: "pressure",
    weekNumber: 3,
    weekTitle: "APPLY PRESSURE",
    proofType: "document",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 18,
    title: "Follow Up Blitz Day",
    caption: "",
    taskDescription: "Follow up on EVERY pending offer and outreach. Submit a log of all follow-ups.",
    trainingContent: "",
    category: "pressure",
    weekNumber: 3,
    weekTitle: "APPLY PRESSURE",
    proofType: "screenshot",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 19,
    title: "Network with 5 Investors",
    caption: "",
    taskDescription: "Connect with 5 local investors via meetups, social media, or calls. Submit proof of outreach.",
    trainingContent: "",
    category: "pressure",
    weekNumber: 3,
    weekTitle: "APPLY PRESSURE",
    proofType: "screenshot",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 20,
    title: "Resubmit Rejected Offers Higher",
    caption: "",
    taskDescription: "Take your best rejected offers and resubmit with better terms. Submit updated offers.",
    trainingContent: "",
    category: "pressure",
    weekNumber: 3,
    weekTitle: "APPLY PRESSURE",
    proofType: "document",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 21,
    title: "Direct Mail Campaign Launch",
    caption: "",
    taskDescription: "Prepare and send direct mail to at least 20 property owners. Submit proof of mailing.",
    trainingContent: "",
    category: "pressure",
    weekNumber: 3,
    weekTitle: "APPLY PRESSURE",
    proofType: "photo",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  // ── Week 4: Full Sprint (Days 22-30) ──
  {
    day: 22,
    title: "Analyze Multifamily Properties",
    caption: "",
    taskDescription: "Analyze at least 3 multifamily properties. Submit your analysis.",
    trainingContent: "",
    category: "sprint",
    weekNumber: 4,
    weekTitle: "FULL SPRINT",
    proofType: "spreadsheet",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 23,
    title: "Submit 10 Offers Today",
    caption: "",
    taskDescription: "Submit 10 offers today — this is your push day. Submit all confirmations.",
    trainingContent: "",
    category: "sprint",
    weekNumber: 4,
    weekTitle: "FULL SPRINT",
    proofType: "document",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 24,
    title: "Door Knock 20 Properties",
    caption: "",
    taskDescription: "Door knock or drop letters at 20 properties. Submit your route log and photos.",
    trainingContent: "",
    category: "sprint",
    weekNumber: 4,
    weekTitle: "FULL SPRINT",
    proofType: "photo",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 25,
    title: "Negotiate Inspection Terms",
    caption: "",
    taskDescription: "If you have a deal progressing, negotiate inspection terms. Otherwise submit 5 offers. Submit documentation.",
    trainingContent: "",
    category: "sprint",
    weekNumber: 4,
    weekTitle: "FULL SPRINT",
    proofType: "document",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 26,
    title: "Lock Down Your Title Company",
    caption: "",
    taskDescription: "Confirm your title company or closing attorney is ready. Submit confirmation of relationship.",
    trainingContent: "",
    category: "sprint",
    weekNumber: 4,
    weekTitle: "FULL SPRINT",
    proofType: "document",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 27,
    title: "Final Offer Push - 15 Offers",
    caption: "",
    taskDescription: "Final push — submit 15 offers. This is where deals happen. Submit all confirmations.",
    trainingContent: "",
    category: "sprint",
    weekNumber: 4,
    weekTitle: "FULL SPRINT",
    proofType: "document",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 28,
    title: "Follow Up on All Active Offers",
    caption: "",
    taskDescription: "Follow up on every single active offer with urgency. Submit complete follow-up log.",
    trainingContent: "",
    category: "sprint",
    weekNumber: 4,
    weekTitle: "FULL SPRINT",
    proofType: "screenshot",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 29,
    title: "Negotiate to Contract",
    caption: "",
    taskDescription: "Negotiate your best lead to a signed contract. Submit the signed contract or latest negotiation.",
    trainingContent: "",
    category: "sprint",
    weekNumber: 4,
    weekTitle: "FULL SPRINT",
    proofType: "document",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 30,
    title: "Close & Celebrate",
    caption: "",
    taskDescription: "Celebrate getting your first deal under contract! Submit your contract or victory documentation.",
    trainingContent: "",
    category: "sprint",
    weekNumber: 4,
    weekTitle: "FULL SPRINT",
    proofType: "document",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
];

export const DEFAULT_PHASES = [
  { label: "Build the Foundation", days: [1, 2, 3, 4, 5, 6, 7], color: "#48c78e", weekNumber: 1 },
  { label: "Build the Pipeline", days: [8, 9, 10, 11, 12, 13, 14], color: "#d4a843", weekNumber: 2 },
  { label: "Apply Pressure", days: [15, 16, 17, 18, 19, 20, 21], color: "#b85c38", weekNumber: 3 },
  { label: "Full Sprint", days: [22, 23, 24, 25, 26, 27, 28, 29, 30], color: "#e94560", weekNumber: 4 },
];

// Kept for backward compatibility
export const PHASES = DEFAULT_PHASES;

// Resolve phases: use custom if provided, fall back to defaults
export function getPhases(customPhases) {
  return (customPhases && customPhases.length > 0) ? customPhases : DEFAULT_PHASES;
}

// Build category color map from phases (for DayView badge coloring)
export function getCategoryColors(phases) {
  const colors = {};
  for (const phase of phases) {
    for (const d of phase.days) {
      colors[d] = { accent: phase.color, label: phase.label };
    }
  }
  return colors;
}

// Merge defaults with admin overrides
export function getDayContent(dayNum, overrides = {}) {
  const defaults = CHALLENGE_DAYS[dayNum - 1];
  if (!defaults) return { day: dayNum, title: '', caption: '', taskDescription: '', trainingContent: '', category: 'foundation', weekNumber: getWeekNumber(dayNum), weekTitle: '', videoUrl: null, transcript: null, downloads: [], quiz: null };
  const dayOverride = overrides[dayNum] || {};
  return {
    ...defaults,
    ...dayOverride,
    downloads: dayOverride.downloads !== undefined ? dayOverride.downloads : (defaults.downloads || []),
    quiz: dayOverride.quiz !== undefined ? dayOverride.quiz : (defaults.quiz || null),
  };
}

export const CATEGORY_COLORS = {
  prelaunch: { accent: "#c9a0ff", label: "Pre-Launch" },
  foundation: { accent: "#48c78e", label: "Build the Foundation" },
  pipeline: { accent: "#d4a843", label: "Build the Pipeline" },
  pressure: { accent: "#b85c38", label: "Apply Pressure" },
  sprint: { accent: "#e94560", label: "Full Sprint" },
  continuation: { accent: "#f0a500", label: "Operator Mode" },
};

// ── Getting Started (pre-Day-1 section) ─────────────────────
export const GETTING_STARTED_DEFAULT = {
  title: "Getting Started",
  taskDescription: "Welcome to the UC30 Sprint! Before Day 1 begins, watch the intro video, review the resources below, and add your social media handles.\n\nYou'll be posting daily about your progress — this builds accountability and helps you find deals.",
  category: "foundation",
  proofType: "screenshot",
  metrics: null,
  videoUrl: null,
  transcript: null,
  downloads: [],
};

export function getGettingStartedContent(overrides = {}) {
  const override = overrides['getting_started'] || {};
  return {
    ...GETTING_STARTED_DEFAULT,
    ...override,
    downloads: override.downloads !== undefined ? override.downloads : (GETTING_STARTED_DEFAULT.downloads || []),
  };
}

// ── Finalized Daily Minimums (per-day, matching compliance metric IDs) ──
export const DAILY_MINIMUMS = {
  // Week 1 — Build the Foundation
  1:  { training_completed: true, properties_analyzed: 2, arsenal_contacts: 1, target_contacts: 3, follow_ups: 0 },
  2:  { training_completed: true, properties_analyzed: 2, arsenal_contacts: 1, target_contacts: 3, follow_ups: 0 },
  3:  { training_completed: true, properties_analyzed: 2, arsenal_contacts: 1, target_contacts: 3, follow_ups: 0 },
  4:  { training_completed: true, properties_analyzed: 2, arsenal_contacts: 1, target_contacts: 3, follow_ups: 0 },
  5:  { training_completed: true, properties_analyzed: 2, arsenal_contacts: 1, target_contacts: 3, follow_ups: 0 },
  6:  { training_completed: true, properties_analyzed: 2, arsenal_contacts: 1, target_contacts: 3, follow_ups: 0 },
  7:  { training_completed: true, properties_analyzed: 2, arsenal_contacts: 1, target_contacts: 3, follow_ups: 0 },
  // Week 2 — Build the Pipeline
  8:  { training_completed: true, properties_analyzed: 3, arsenal_contacts: 1, target_contacts: 5, follow_ups: 2 },
  9:  { training_completed: true, properties_analyzed: 3, arsenal_contacts: 1, target_contacts: 5, follow_ups: 2 },
  10: { training_completed: true, properties_analyzed: 3, arsenal_contacts: 1, target_contacts: 5, follow_ups: 2 },
  11: { training_completed: true, properties_analyzed: 3, arsenal_contacts: 1, target_contacts: 5, follow_ups: 2 },
  12: { training_completed: true, properties_analyzed: 3, arsenal_contacts: 1, target_contacts: 5, follow_ups: 2 },
  13: { training_completed: true, properties_analyzed: 3, arsenal_contacts: 1, target_contacts: 5, follow_ups: 2 },
  14: { training_completed: true, properties_analyzed: 3, arsenal_contacts: 1, target_contacts: 5, follow_ups: 2 },
  // Week 3 — Apply Pressure
  15: { training_completed: true, properties_analyzed: 5, arsenal_contacts: 2, target_contacts: 7, follow_ups: 5 },
  16: { training_completed: true, properties_analyzed: 5, arsenal_contacts: 2, target_contacts: 7, follow_ups: 5 },
  17: { training_completed: true, properties_analyzed: 5, arsenal_contacts: 2, target_contacts: 7, follow_ups: 5 },
  18: { training_completed: true, properties_analyzed: 5, arsenal_contacts: 2, target_contacts: 7, follow_ups: 5 },
  19: { training_completed: true, properties_analyzed: 5, arsenal_contacts: 2, target_contacts: 7, follow_ups: 5 },
  20: { training_completed: true, properties_analyzed: 5, arsenal_contacts: 2, target_contacts: 7, follow_ups: 5 },
  21: { training_completed: true, properties_analyzed: 5, arsenal_contacts: 2, target_contacts: 7, follow_ups: 5 },
  // Week 4 — Full Sprint
  22: { training_completed: true, properties_analyzed: 7, arsenal_contacts: 2, target_contacts: 10, follow_ups: 8 },
  23: { training_completed: true, properties_analyzed: 7, arsenal_contacts: 2, target_contacts: 10, follow_ups: 8 },
  24: { training_completed: true, properties_analyzed: 7, arsenal_contacts: 2, target_contacts: 10, follow_ups: 8 },
  25: { training_completed: true, properties_analyzed: 7, arsenal_contacts: 2, target_contacts: 10, follow_ups: 8 },
  26: { training_completed: true, properties_analyzed: 7, arsenal_contacts: 2, target_contacts: 10, follow_ups: 8 },
  27: { training_completed: true, properties_analyzed: 7, arsenal_contacts: 2, target_contacts: 10, follow_ups: 8 },
  28: { training_completed: true, properties_analyzed: 7, arsenal_contacts: 2, target_contacts: 10, follow_ups: 8 },
  29: { training_completed: true, properties_analyzed: 7, arsenal_contacts: 2, target_contacts: 10, follow_ups: 8 },
  30: { training_completed: true, properties_analyzed: 7, arsenal_contacts: 2, target_contacts: 10, follow_ups: 8 },
};

// Backward compat alias
export const DEFAULT_DAILY_MINIMUMS = DAILY_MINIMUMS;

// Veteran minimums — no Week 1 ramp-up for repeat users (cohortAttempt >= 2)
// Uses Week 3 levels (days 1-21) and Week 4 levels (days 22-30)
export const VETERAN_DAILY_MINIMUMS = Object.fromEntries(
  Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    return [day, day <= 21
      ? { training_completed: true, properties_analyzed: 5, arsenal_contacts: 2, target_contacts: 7, follow_ups: 5 }
      : { training_completed: true, properties_analyzed: 7, arsenal_contacts: 2, target_contacts: 10, follow_ups: 8 },
    ];
  })
);

// Weekly offer targets (per week, not cumulative across weeks)
export const WEEKLY_OFFER_TARGETS = {
  1: 3,
  2: 10,
  3: 12,
  4: 15,
};

// Helper: get which week a day falls in (1-4 for days 1-30, 4 for post-30)
export function getWeekNumber(dayNumber) {
  if (dayNumber <= 7) return 1;
  if (dayNumber <= 14) return 2;
  if (dayNumber <= 21) return 3;
  return 4;
}

// Helper: get the weekly offer target for a given day
export function getWeeklyOfferTarget(dayNumber) {
  return WEEKLY_OFFER_TARGETS[getWeekNumber(dayNumber)] || 0;
}

// Helper: get the day range for a week
export function getWeekDayRange(weekNumber) {
  if (weekNumber === 1) return { start: 1, end: 7 };
  if (weekNumber === 2) return { start: 8, end: 14 };
  if (weekNumber === 3) return { start: 15, end: 21 };
  return { start: 22, end: 30 };
}

// Post-30 "Operator Mode" reduced minimums
export const POST_30_MINIMUMS = {
  training_completed: false,
  properties_analyzed: 1,
  arsenal_contacts: 0,
  target_contacts: 0,
  follow_ups: 1,
  offers_submitted: 0,
};

// Get the daily minimums for a specific day, merging admin overrides
export function getDailyMinimums(dayNum, adminOverrides = {}, cohortAttempt = 1) {
  if (dayNum > 30) return POST_30_MINIMUMS;
  const base = cohortAttempt >= 2
    ? (VETERAN_DAILY_MINIMUMS[dayNum] || VETERAN_DAILY_MINIMUMS[1])
    : (DAILY_MINIMUMS[dayNum] || DAILY_MINIMUMS[1]);
  const override = adminOverrides[dayNum];
  if (override) return { ...base, ...override };
  return base;
}

// ── Post-Day-30 Operator Mode ────────────────────────────────
// Repeating daily task for operators who completed the 30-day sprint
export const POST_30_TASK = {
  title: "Operator Mode",
  taskDescription: "You've completed the sprint. Now execute daily to build your empire:\n\n• Analyze properties in your target market\n• Submit offers on your best leads\n• Activate new deal sources\n• Follow up on all active deals\n\nLog your activity and keep your UC Points growing.",
  category: "continuation",
  proofType: "screenshot",
};

// Get pre-day content by day number (-3, -2, -1)
export function getPreDayContent(dayNum, overrides = {}) {
  const preDay = PRE_DAYS.find(p => p.day === dayNum);
  if (!preDay) return null;
  const key = `pre_${Math.abs(dayNum)}`;
  const dayOverride = overrides[key] || {};
  return {
    ...preDay,
    ...dayOverride,
    downloads: dayOverride.downloads !== undefined ? dayOverride.downloads : (preDay.downloads || []),
    quiz: dayOverride.quiz !== undefined ? dayOverride.quiz : (preDay.quiz || null),
  };
}

// Get day data for any day number (negative = pre-day, 1-30 from sprint, 31+ from Operator Mode)
export function getDayDataForNum(dayNum, overrides = {}) {
  if (dayNum < 0) {
    return getPreDayContent(dayNum, overrides) || { ...POST_30_TASK, day: dayNum };
  }
  if (dayNum <= 30) {
    return getDayContent(dayNum, overrides);
  }
  return { ...POST_30_TASK, day: dayNum };
}

// Calculate current streak (consecutive completed days ending at the most recent)
export function getStreak(completedDays) {
  if (!completedDays || completedDays.length === 0) return 0;
  const sorted = [...completedDays].sort((a, b) => b - a);
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] - 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
