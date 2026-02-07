# UC30 — 30-Day First Deal Challenge

A self-running 30-day real estate challenge system that enforces daily execution, tracks participant progress, and provides social proof analytics.

## Quick Start

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build
```

## Deploy to Vercel (Recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "New Project" → Import your repo
4. Framework: Vite → Deploy
5. Your site will be live at `your-project.vercel.app`
6. (Optional) Add a custom domain in Vercel project settings

Every push to `main` will auto-deploy.

## Deploy to Netlify (Alternative)

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) → "Add new site" → Import from Git
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy

## Project Structure

```
uc30-challenge/
├── index.html              # Entry HTML
├── vite.config.js          # Vite configuration
├── package.json
├── src/
│   ├── main.jsx            # React mount point
│   ├── App.jsx             # Root component + routing
│   ├── components/
│   │   ├── LoginScreen.jsx       # Login/registration
│   │   ├── Header.jsx            # Navigation header
│   │   ├── Dashboard.jsx         # Participant main view
│   │   ├── ProgressBanner.jsx    # Day progress bar
│   │   ├── TimelineView.jsx      # 30-day timeline grid
│   │   ├── DayView.jsx           # Individual day page (video + task + submission)
│   │   ├── SubmissionsView.jsx   # All past submissions
│   │   ├── StatsView.jsx         # Personal analytics
│   │   └── AdminDashboard.jsx    # Admin control center
│   ├── data/
│   │   └── challengeDays.js      # 30-day content (edit tasks/videos here)
│   ├── hooks/
│   │   └── useAppState.js        # State management hook
│   ├── utils/
│   │   └── storage.js            # Storage layer (swap for backend later)
│   └── styles/
│       └── global.css            # Global styles + animations
└── .gitignore
```

## How It Works

### Participant Flow
1. Log in with name + email
2. See timeline of all 30 days (locked until previous day completed)
3. Click current day → watch video → complete task → submit proof
4. System advances to next day upon submission
5. View all submissions and cumulative stats anytime

### Admin Flow
- Log in with `admin@uc30.com`
- See all participants, their current day, and metrics
- Remove inactive participants / reactivate for re-runs
- Social Proof dashboard with copy-ready marketing stats

### Enforcement
- Days are locked sequentially — no skipping
- Deadline: 11:59 PM Pacific daily
- Missed submission → admin removes participant (automated enforcement coming)
- Removed participants can rejoin (resets progress)

## Adding Content (Chandler)

Edit `src/data/challengeDays.js` to add:

```js
{
  day: 1,
  title: "Define Your Buy Box",
  taskDescription: "...",
  videoUrl: "https://www.youtube.com/embed/VIDEO_ID",  // Add embed URL
  transcript: "Full transcript text here...",            // Add transcript
  downloads: [                                           // Add resources
    { name: "Buy Box Template.pdf", url: "https://..." },
  ],
}
```

## Upcoming: Backend Integration

The current version uses `localStorage` for data persistence. To scale for real users:

1. **Supabase** (recommended) or **Firebase** for auth + database
2. Swap functions in `src/utils/storage.js` — the rest of the app won't change
3. Add email automation (SendGrid/Postmark) for daily reminders + removal notices
4. Add cron job for automatic midnight enforcement

See the storage.js file — it's designed as a clean abstraction layer for this exact upgrade.

## Git Workflow

```bash
main    → production (auto-deploys)
dev     → staging / testing
feature → big changes (branch off dev)
```

## License

Private — UC30 Challenge System

# triggered
