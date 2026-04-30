# UC30 Challenge - Pre-Launch Audit Report

**Date:** April 14, 2026
**Target Launch:** July 2026 (soft launch with real users)

---

## 1. COMPONENT AUDIT (src/components/)

### Summary: 19 components, all functional, no stubs, no orphaned code

| Component | Lines | Status | Data Source |
|-----------|-------|--------|-------------|
| Header.jsx | ~80 | Complete | Real (props) |
| Footer.jsx | ~30 | Complete | Real (dynamic year) |
| ProgressBanner.jsx | ~100 | Complete | Real (user object) |
| Leaderboard.jsx | ~120 | Complete | Real (filtered participants) |
| StatsView.jsx | ~200 | Complete | Real (user.metrics) |
| ShareableStreakCard.jsx | ~150 | Complete | Real (DOM-to-PNG) |
| SubmissionsView.jsx | ~100 | Complete | Real (user.submissions) |
| CommunityBoard.jsx | ~400 | Complete | Real (cohort-filtered) |
| ContactsCRM.jsx | ~300 | Complete | Real (getContacts) |
| TimelineView.jsx | ~200 | Complete | Real (phases, cohort dates) |
| LoginScreen.jsx | ~150 | Complete | Real (validation) |
| OnboardingFlow.jsx | ~200 | Complete | Real (user input) |
| ActivationPhase.jsx | ~250 | Complete | Real (user input) |
| UserProfile.jsx | ~350 | Complete | Real (profile data) |
| LandingPage.jsx | ~400 | Complete | Partial (DEFAULTS + overrides) |
| LandingPageV2.jsx | ~500 | Complete | Partial (DEFAULTS + overrides) |
| Dashboard.jsx | ~1213 | Complete | Real (useAppState) |
| DayView.jsx | ~800 | Complete | Real (challengeDays, metrics) |
| AdminDashboard.jsx | ~3619 | Complete | Real (participants, settings) |

**Key Findings:**
- All components are properly imported and routed through App.jsx
- No TODO/FIXME comments, no placeholder stubs
- All data flows are real (from useAppState hook or storage.js)
- Landing pages use hardcoded DEFAULTS that merge with admin-configurable overrides
- AdminDashboard revenue section uses estimated $497/participant (needs Stripe data)

---

## 2. SUPABASE INTEGRATION AUDIT

### 2.1 Database Schema

**7 migration files, 5 tables + 1 storage bucket:**

| Table | Columns | RLS | Indexes | Foreign Keys |
|-------|---------|-----|---------|--------------|
| participants | 32 | Yes | 4 (email, active, auth_id, uc_points) | None |
| settings | 3 | Yes | 1 (PK) | None |
| contacts | 8 | Yes | 2 (participant, created_at) | participants (CASCADE) |
| follow_ups | 6 | Yes | 2 (contact, participant) | participants, contacts (CASCADE) |
| uploads | 7 | Yes | 1 (participant+day composite) | participants (CASCADE) |

**Storage Bucket:** `uc30-uploads` (private, signed URLs with 1-hour expiry)

### 2.2 RLS Policy Assessment

**participants table:** SOLID
- SELECT: Own row (by auth_id or email) + admins read all
- INSERT: Any authenticated user
- UPDATE: Own row + admins
- DELETE: Admin only
- Uses `is_admin()` SECURITY DEFINER function (correct pattern)

**settings table:** SOLID
- SELECT: Public (landing page needs pre-auth access)
- INSERT/UPDATE: Admins + authenticated users for `support_tickets` key only

**contacts, follow_ups, uploads tables: INCOMPLETE**
- SELECT: Own records + admins -- OK
- INSERT: Own records only -- OK
- UPDATE: **MISSING** -- users cannot edit contacts/follow-ups after creation
- DELETE: **MISSING** -- users cannot delete their own CRM records

### 2.3 CRITICAL: Missing Database Columns

Two columns are referenced in storage.js but **never created in any migration**:

| Column | Referenced In | Impact |
|--------|--------------|--------|
| `community_banned` (BOOLEAN) | storage.js:410, 449, 496 | Community ban feature will fail on Supabase |
| `community_warnings` (JSONB) | storage.js:411, 450, 497 | Community warnings will fail on Supabase |

**Fix required:**
```sql
ALTER TABLE participants ADD COLUMN IF NOT EXISTS community_banned BOOLEAN DEFAULT false;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS community_warnings JSONB DEFAULT '[]'::jsonb;
```

### 2.4 localStorage Abstraction

**Status: Production-ready.** The `storage.js` file exports either `supabaseStorage` or `localStorageFallback` based on whether Supabase env vars are set. The abstraction is clean:

- All Supabase calls are async with proper error handling
- `toDbRow()` / `fromDbRow()` handle camelCase <-> snake_case conversion for all 32 columns
- Settings use Supabase-first with localStorage cache fallback
- File uploads use Supabase Storage (production) or base64 localStorage (dev)
- Legacy password migration handled during login (SHA-256 -> Supabase Auth bcrypt)

### 2.5 Supabase Client

`src/utils/supabaseClient.js` -- clean single-instance pattern. Returns `null` when env vars missing, triggering localStorage fallback. Uses anon key (correct for client-side).

---

## 3. PARTICIPANT FLOW STRESS TEST

### 3.1 Registration Flow

**Path:** LoginScreen -> useAppState.register() -> storage.createNewUser() -> storage.addParticipant()

| Check | Result |
|-------|--------|
| Email validation | Client-side only (checks for `@`) |
| Password validation | 6+ chars, confirmation match |
| Duplicate email detection | Checked at registration time |
| Email verification | **NONE** - user gets immediate dashboard access |
| Password hashing | Supabase: bcrypt (server). localStorage: SHA-256 (weak salt = email) |
| Admin auto-assignment | Hardcoded: admin@uc30.com, dev@uc30.com |

### 3.2 Day Completion Flow

**Path:** TimelineView (click day) -> DayView (fill metrics) -> submitDay() -> advance currentDay

**Day-locking logic (TimelineView.jsx:85-99):**
1. All days locked until: cohort started AND Getting Started completed
2. Completed days: always accessible (read-only, shows SubmissionComplete)
3. Current day: accessible only if `day <= calendarDay` (cohort pacing)
4. Future days: locked (greyed out, not clickable)

**Submission validation (DayView.jsx:66-73):**
- Properties analyzed >= minimum (default 5)
- Deal sources (new contacts) >= minimum
- Follow-ups >= minimum (waived on Day 1 if no contacts exist)
- Submit button disabled until `standardsMet === true`

### 3.3 Edge Case Results

| Edge Case | UI Behavior | Server-Side Protection |
|-----------|-------------|----------------------|
| **Submit same day twice** | Blocked -- shows SubmissionComplete, hides submit button | **NONE** -- submitDay() accepts any dayNum |
| **Skip to Day 15** | Blocked -- TimelineView locks future days | **NONE** -- no backend dayNum validation |
| **Video not loaded** | Can submit anyway -- no video completion tracking | **NONE** |
| **Clear localStorage** | Supabase: data persists, re-fetched on login. localStorage: **DATA LOST** | N/A |
| **Submit with empty proof** | Allowed -- proofText textarea is optional | **NONE** |
| **Manipulate localStorage** | Can set isAdmin:true, skip days, inflate metrics | **NONE in localStorage mode** |
| **Day 30 completion** | Triggers Kit tag, sets firstCohortCompleted, enables Operator Mode | Works correctly |

### 3.4 CRITICAL: No Server-Side Submission Validation

`submitDay(dayNum, proof)` in useAppState.js:830-903:
- Does NOT verify `dayNum === user.currentDay`
- Does NOT check if day was already submitted
- Does NOT validate proof content
- Does NOT verify metric values are reasonable
- All enforcement is UI-only

**Risk Level:** MEDIUM in Supabase mode (RLS prevents cross-user manipulation), HIGH in localStorage mode.

---

## 4. ADMIN FLOW STRESS TEST

### 4.1 AdminDashboard Capabilities

| Feature | Implemented | Uses Real Data | Notes |
|---------|-------------|---------------|-------|
| View all participants | Yes | Yes | Filterable: All/Active/Removed/Refund Eligible |
| View participant details | Yes | Yes | Full submission history, metrics, CRM |
| Remove participant | Yes | Yes | Sets isActive=false, tracks removedAt |
| Reactivate participant | Yes | Yes | Recalculates currentDay from cohort date, increments cohortAttempt |
| Permanently delete | Yes | Yes | Confirmation dialog, removes from DB |
| Toggle admin status | Yes | Yes | Promote/demote any participant |
| Reset password | Yes | Yes | Prompt for new password |
| View-as-user (impersonate) | Yes | Yes | Banner shown during impersonation |
| Community moderation | Yes | Yes | Pin, delete, warn, ban |
| Support ticket queue | Yes | Yes | Open/responded/closed filtering |
| Content management | Yes | N/A | Edit days, phases, landing page, minimums |
| Revenue dashboard | Yes | Estimated | $497 x active users (needs Stripe data) |
| Social proof dashboard | Yes | Yes | Real metrics from participant data |
| Cohort management | Yes | Yes | Set start date, view phase status |
| Live calls scheduling | Yes | Yes | Persisted to settings table |
| Social verification | Yes | Yes | Verify participant social media submissions |

### 4.2 Social Proof Dashboard

**Real data, not hardcoded.** Displays:
- Active operator count
- Total offers submitted (aggregated)
- Properties analyzed (aggregated)
- Retention rate (%)
- Day-by-day operator distribution (30-day chart)

All metrics computed from actual participant records.

### 4.3 Admin Access Control

**VULNERABILITY: Client-side only.**

- Admin status determined by `user.isAdmin` boolean in client state
- App.jsx routes to AdminDashboard if `user.isAdmin === true`
- Admin action functions check `if (!user?.isAdmin)` before executing
- No JWT role claim or server-side middleware validation
- RLS policies use `public.is_admin()` (database function) -- this IS server-side protection for data access, but admin actions are initiated client-side without re-verification

**Mitigating factor:** Supabase RLS does protect data. A non-admin user cannot read other participants' data or modify settings even if they somehow reach admin code paths. The risk is primarily in localStorage mode.

---

## 5. STRIPE CONNECT READINESS

### 5.1 What's Already Built

**Edge Functions (fully implemented):**

| Function | File | Status |
|----------|------|--------|
| `create-checkout` | supabase/functions/create-checkout/index.ts | Complete |
| `stripe-webhook` | supabase/functions/stripe-webhook/index.ts | Complete |

**Checkout flow:**
- Creates Stripe subscription: $997/year
- 15% platform fee via `application_fee_percent: 15`
- 85% routed to connected account via `transfer_data.destination`
- Metadata includes `supabase_user_id` and `email`

**Webhook handling:**
- `checkout.session.completed`: Sets `has_paid=true`, grants 1-year access
- `customer.subscription.deleted`: Revokes access immediately
- `invoice.payment_failed`: Revokes access immediately
- Signature verification with `STRIPE_WEBHOOK_SECRET`
- Uses service_role key to bypass RLS (correct for backend)

**Frontend:**
- Both landing pages have `handleGetStarted()` that calls `/create-checkout`
- Falls back to free registration if `VITE_SUPABASE_FUNCTION_URL` not set
- Access expiration enforced in App.jsx (expired users see "Access Expired" page)

### 5.2 What's Missing

| Item | Priority | Description |
|------|----------|-------------|
| Payment success page | HIGH | After Stripe checkout, user is redirected to `/?success=true` which shows the login/register screen again -- confusing UX |
| Hardcoded redirect URLs | HIGH | Success/cancel URLs in create-checkout are hardcoded to `uc30-challenge.vercel.app` -- won't work on localhost or custom domain |
| Stripe customer/subscription ID storage | MEDIUM | No `stripe_customer_id` or `stripe_subscription_id` columns -- can't look up customers later |
| Admin payment dashboard | MEDIUM | Revenue tab uses estimated $497 x count, not real Stripe data |
| Failed payment notification | MEDIUM | Access revoked on payment failure but user gets no notification explaining why |
| Refund handling | MEDIUM | No webhook for `charge.refunded` events |
| Customer portal (self-serve) | LOW | No way for users to manage subscription, update payment method |
| Payment error UI | LOW | Checkout creation errors logged to console, not shown to user |

### 5.3 Setup Steps Remaining

1. Get Stripe Connect platform application approved
2. Add Chandler's account as connected account, get `acct_` ID
3. Set Supabase Edge Function secrets:
   - `STRIPE_SECRET_KEY` (platform key)
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_CONNECTED_ACCOUNT_ID` (Chandler's acct_ ID)
4. Register webhook endpoint in Stripe dashboard:
   - URL: `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`
5. Set `VITE_SUPABASE_FUNCTION_URL` in production env
6. Make redirect URLs dynamic (not hardcoded)
7. Build payment success page component

---

## 6. PRIORITIZED PUNCH LIST (Top 10 for Soft Launch)

### Ordered by risk to real users, not development complexity:

| # | Item | Risk | Effort | Why It Matters |
|---|------|------|--------|---------------|
| **1** | **Add missing DB columns (`community_banned`, `community_warnings`)** | CRITICAL | 5 min | Community moderation will silently fail on production Supabase. Any attempt to ban or warn a user will error out. |
| **2** | **Add server-side submission validation** | HIGH | 2-3 hrs | Without it, a technically savvy user can skip days, inflate metrics, or submit multiple times via DevTools. All challenge integrity depends on client-side JS. Create a Supabase Edge Function or database trigger that validates `dayNum === currentDay` before accepting. |
| **3** | **Build payment success page** | HIGH | 1-2 hrs | After paying $997, users get redirected to a registration form. This will cause confusion, support tickets, and possibly chargebacks. Need a clear "Payment received, welcome!" page. |
| **4** | **Make Stripe redirect URLs dynamic** | HIGH | 30 min | Hardcoded to `uc30-challenge.vercel.app`. If you deploy to a custom domain or need to test locally, checkout will redirect to the wrong URL. Pass origin from the client or use an env var. |
| **5** | **Add UPDATE/DELETE RLS policies for contacts, follow_ups, uploads** | HIGH | 30 min | Users currently cannot edit or delete their own CRM contacts/follow-ups. The ContactsCRM component likely calls update/delete operations that will silently fail in Supabase mode. |
| **6** | **Add email verification on registration** | MEDIUM | 1-2 hrs | Anyone can register with a fake email. Enable Supabase Auth email confirmation (dashboard toggle + handle confirmation redirect). Without this, someone could register as another person's email. |
| **7** | **Add Stripe customer/subscription ID to participants table** | MEDIUM | 1 hr | Without these columns, you can't look up a user's payment history, issue refunds, or debug billing issues. Add `stripe_customer_id` and `stripe_subscription_id` columns, populate them in the webhook handler. |
| **8** | **Add failed payment notification to users** | MEDIUM | 1-2 hrs | When `invoice.payment_failed` fires, access is revoked instantly but the user sees no explanation. They'll think the app is broken. Show a "Payment failed -- update your card" message on login. |
| **9** | **Add video load error handling** | LOW | 1 hr | If a video URL is broken or slow, users see a blank iframe with no feedback. Add an error state with a retry button or fallback message. Not blocking but will generate support tickets. |
| **10** | **Run all 7 SQL migrations in order on production Supabase** | CRITICAL | 15 min | This is a deployment step, not a code change. The migrations must be run in the correct order (setup -> auth -> activation -> uc-points -> crm -> social -> fix-all) to establish the schema before any real user touches the app. |

### Bonus items (post-soft-launch):

- Add `charge.refunded` webhook handler for refund tracking
- Build admin payment dashboard with real Stripe data
- Add Stripe Customer Portal for self-serve subscription management
- Add video completion tracking (proof that user watched before submitting)
- Add server-side metrics validation (prevent inflated offer counts)
- Add rate limiting on registration endpoint
- Consider moving admin email list to environment variable or settings table
