// ── 30-Day Challenge Content ────────────────────────────────────────
// Each day has: title, taskDescription, category, proofType, and optional metrics
// Chandler: Replace video URLs, transcripts, and downloadable resources per day

export const CHALLENGE_DAYS = [
  {
    day: 1,
    title: "Define Your Buy Box",
    taskDescription: "Define the exact property criteria you'll target: location, price range, property type, and minimum ROI. Submit a screenshot of your written buy box criteria.",
    category: "foundation",
    proofType: "screenshot",
    metrics: null,
    videoUrl: null, // Chandler: Add video URL
    transcript: null, // Chandler: Add transcript
    downloads: [], // Chandler: Add downloadable resources
  },
  {
    day: 2,
    title: "Set Up Deal-Finding Tools",
    taskDescription: "Set up at least 2 deal-finding platforms (Zillow, PropStream, BatchLeads, etc.). Submit screenshots showing your active accounts and search filters configured.",
    category: "foundation",
    proofType: "screenshot",
    metrics: null,
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 3,
    title: "Analyze Your First 5 Properties",
    taskDescription: "Run numbers on 5 properties using the 70% rule or your preferred analysis method. Submit your completed analysis spreadsheet or screenshots.",
    category: "foundation",
    proofType: "spreadsheet",
    metrics: { key: "propertiesAnalyzed", label: "Properties Analyzed", count: 5 },
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 4,
    title: "Build Your Cash Buyers List",
    taskDescription: "Find and organize at least 20 potential cash buyers. Submit your buyer list with names and contact methods.",
    category: "foundation",
    proofType: "document",
    metrics: null,
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 5,
    title: "Contact 10 Agents",
    taskDescription: "Reach out to 10 real estate agents in your target market. Submit screenshots of your outreach messages or call log.",
    category: "foundation",
    proofType: "screenshot",
    metrics: { key: "agentsContacted", label: "Agents Contacted", count: 10 },
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 6,
    title: "Submit Your First Offer",
    taskDescription: "Write and submit a real offer on a property. Submit the offer document or screenshot of submission confirmation.",
    category: "action",
    proofType: "document",
    metrics: { key: "offersSubmitted", label: "Offers Submitted", count: 1 },
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 7,
    title: "Follow Up on Yesterday's Offer",
    taskDescription: "Follow up on yesterday's offer and document the response. Submit screenshot of follow-up communication.",
    category: "action",
    proofType: "screenshot",
    metrics: null,
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 8,
    title: "Analyze 10 More Properties",
    taskDescription: "Analyze 10 properties today with full financial breakdowns. Submit your analysis spreadsheet.",
    category: "action",
    proofType: "spreadsheet",
    metrics: { key: "propertiesAnalyzed", label: "Properties Analyzed", count: 10 },
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 9,
    title: "Make 3 New Offers",
    taskDescription: "Submit 3 new offers on different properties. Submit offer confirmations or documents.",
    category: "action",
    proofType: "document",
    metrics: { key: "offersSubmitted", label: "Offers Submitted", count: 3 },
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 10,
    title: "Build Your Contractor Network",
    taskDescription: "Find and contact 5 contractors for estimates. Submit your contractor contact list with specialties.",
    category: "action",
    proofType: "document",
    metrics: null,
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 11,
    title: "Driving for Dollars Session",
    taskDescription: "Spend 1 hour driving target neighborhoods and identify 5 distressed properties. Submit photos and addresses.",
    category: "action",
    proofType: "photo",
    metrics: null,
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 12,
    title: "Submit 5 Offers Today",
    taskDescription: "Submit 5 real offers today — volume is key. Submit all offer confirmations.",
    category: "action",
    proofType: "document",
    metrics: { key: "offersSubmitted", label: "Offers Submitted", count: 5 },
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 13,
    title: "Review & Adjust Your Buy Box",
    taskDescription: "Review your results so far and adjust your buy box if needed. Submit updated criteria and reasoning.",
    category: "action",
    proofType: "document",
    metrics: null,
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 14,
    title: "Contact Private Lenders",
    taskDescription: "Contact at least 3 private lenders or hard money lenders. Submit communication screenshots.",
    category: "action",
    proofType: "screenshot",
    metrics: null,
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 15,
    title: "Negotiate a Counter-Offer",
    taskDescription: "If you have a counter-offer, negotiate it. If not, follow up on all pending. Submit documentation.",
    category: "action",
    proofType: "document",
    metrics: null,
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 16,
    title: "Analyze a Commercial Property",
    taskDescription: "Analyze at least 1 commercial or multifamily property. Submit your analysis.",
    category: "momentum",
    proofType: "spreadsheet",
    metrics: { key: "propertiesAnalyzed", label: "Properties Analyzed", count: 1 },
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 17,
    title: "Submit Your Boldest Offer Yet",
    taskDescription: "Submit your most aggressive offer yet on your best lead. Submit the offer.",
    category: "momentum",
    proofType: "document",
    metrics: { key: "offersSubmitted", label: "Offers Submitted", count: 1 },
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 18,
    title: "Follow Up Blitz Day",
    taskDescription: "Follow up on EVERY pending offer and outreach. Submit a log of all follow-ups.",
    category: "momentum",
    proofType: "screenshot",
    metrics: null,
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 19,
    title: "Network with 5 Investors",
    taskDescription: "Connect with 5 local investors via meetups, social media, or calls. Submit proof of outreach.",
    category: "momentum",
    proofType: "screenshot",
    metrics: null,
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 20,
    title: "Resubmit Rejected Offers Higher",
    taskDescription: "Take your best rejected offers and resubmit with better terms. Submit updated offers.",
    category: "momentum",
    proofType: "document",
    metrics: { key: "offersSubmitted", label: "Offers Submitted", count: 1 },
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 21,
    title: "Direct Mail Campaign Launch",
    taskDescription: "Prepare and send direct mail to at least 20 property owners. Submit proof of mailing.",
    category: "momentum",
    proofType: "photo",
    metrics: null,
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 22,
    title: "Analyze Multifamily Properties",
    taskDescription: "Analyze at least 3 multifamily properties. Submit your analysis.",
    category: "momentum",
    proofType: "spreadsheet",
    metrics: { key: "propertiesAnalyzed", label: "Properties Analyzed", count: 3 },
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 23,
    title: "Submit 10 Offers Today",
    taskDescription: "Submit 10 offers today — this is your push day. Submit all confirmations.",
    category: "momentum",
    proofType: "document",
    metrics: { key: "offersSubmitted", label: "Offers Submitted", count: 10 },
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 24,
    title: "Door Knock 20 Properties",
    taskDescription: "Door knock or drop letters at 20 properties. Submit your route log and photos.",
    category: "momentum",
    proofType: "photo",
    metrics: null,
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 25,
    title: "Negotiate Inspection Terms",
    taskDescription: "If you have a deal progressing, negotiate inspection terms. Otherwise submit 5 offers. Submit documentation.",
    category: "momentum",
    proofType: "document",
    metrics: null,
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 26,
    title: "Lock Down Your Title Company",
    taskDescription: "Confirm your title company or closing attorney is ready. Submit confirmation of relationship.",
    category: "closing",
    proofType: "document",
    metrics: null,
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 27,
    title: "Final Offer Push - 15 Offers",
    taskDescription: "Final push — submit 15 offers. This is where deals happen. Submit all confirmations.",
    category: "closing",
    proofType: "document",
    metrics: { key: "offersSubmitted", label: "Offers Submitted", count: 15 },
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 28,
    title: "Follow Up on All Active Offers",
    taskDescription: "Follow up on every single active offer with urgency. Submit complete follow-up log.",
    category: "closing",
    proofType: "screenshot",
    metrics: null,
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 29,
    title: "Negotiate to Contract",
    taskDescription: "Negotiate your best lead to a signed contract. Submit the signed contract or latest negotiation.",
    category: "closing",
    proofType: "document",
    metrics: null,
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
  {
    day: 30,
    title: "Close & Celebrate 🎉",
    taskDescription: "Celebrate getting your first deal under contract! Submit your contract or victory documentation.",
    category: "closing",
    proofType: "document",
    metrics: null,
    videoUrl: null,
    transcript: null,
    downloads: [],
  },
];

export const DEFAULT_PHASES = [
  { label: "Foundation", days: [1, 2, 3, 4, 5], color: "#e94560" },
  { label: "Action Phase", days: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15], color: "#0f3460" },
  { label: "Momentum", days: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25], color: "#533483" },
  { label: "Closing", days: [26, 27, 28, 29, 30], color: "#e94560" },
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
  const dayOverride = overrides[dayNum] || {};
  return {
    ...defaults,
    ...dayOverride,
    // Merge downloads: use override if present, else default
    downloads: dayOverride.downloads !== undefined ? dayOverride.downloads : (defaults.downloads || []),
  };
}

export const CATEGORY_COLORS = {
  foundation: { accent: "#e94560", label: "Foundation" },
  action: { accent: "#0f3460", label: "Action Phase" },
  momentum: { accent: "#533483", label: "Momentum" },
  closing: { accent: "#e94560", label: "Closing" },
  continuation: { accent: "#f0a500", label: "Continuing" },
};

// ── Getting Started (pre-Day-1 section) ─────────────────────
export const GETTING_STARTED_DEFAULT = {
  title: "Getting Started",
  taskDescription: "Welcome to the UC30 Challenge! Before Day 1 begins, watch the intro video, review the resources below, and add your social media handles.\n\nYou'll be posting daily about your progress — this builds accountability and helps you find deals.",
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

// ── Post-Day-30 Continuation ────────────────────────────────
// Generic repeating daily task for users who completed the 30-day challenge
export const POST_30_TASK = {
  title: "Daily Deal Hustle",
  taskDescription: "Keep your momentum going! Complete these daily tasks to maintain your streak:\n\n• Analyze 3 new properties in your target market\n• Submit 2 offers on your best leads\n• Contact 1 new agent or follow up on existing leads\n• Review your pipeline and update your deal tracker\n\nSubmit a screenshot or document showing your activity for today.",
  category: "continuation",
  proofType: "screenshot",
  multiMetrics: [
    { key: "propertiesAnalyzed", label: "Properties Analyzed", count: 3 },
    { key: "offersSubmitted", label: "Offers Submitted", count: 2 },
    { key: "agentsContacted", label: "Agents Contacted", count: 1 },
  ],
};

// Get day data for any day number (1-30 from challenge, 31+ from generic template)
export function getDayDataForNum(dayNum, overrides = {}) {
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
