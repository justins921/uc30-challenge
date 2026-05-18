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
          description: `Analyze the property below. Plug the information into the CDS Rental Calculator and determine the Cash on Cash Return. Review the property analysis PDF if you're unclear on the inputs.

Purchase Price: $600,000
Costs to Make Rent Ready: $0 (Turn Key)
Down Payment: 25%
Closing Costs: 2%
Years to Payoff: 30
Interest Rate: 6.5%
Rents: $6,000/mo (4 units × $1,500/unit)
Other Income: $0
Vacancy Rate: 6%
Maintenance & CapEx: 12%
Management: 8%
Utilities: $0
Additional Expenses: $0
Insurance: $1,000/yr
Taxes: $4,000/yr`,
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
    title: "Set Up Deal-Finding Tools",
    caption: "",
    taskDescription: "Set up at least 2 deal-finding platforms (Zillow, PropStream, BatchLeads, etc.). Submit screenshots showing your active accounts and search filters configured.",
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
    day: 3,
    title: "Analyze Your First 5 Properties",
    caption: "",
    taskDescription: "Run numbers on 5 properties using the 70% rule or your preferred analysis method. Submit your completed analysis spreadsheet or screenshots.",
    trainingContent: "",
    category: "foundation",
    weekNumber: 1,
    weekTitle: "BUILD THE FOUNDATION",
    proofType: "spreadsheet",
    videoUrl: null,
    transcript: null,
    downloads: [],
    quiz: null,
  },
  {
    day: 4,
    title: "Build Your Cash Buyers List",
    caption: "",
    taskDescription: "Find and organize at least 20 potential cash buyers. Submit your buyer list with names and contact methods.",
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
