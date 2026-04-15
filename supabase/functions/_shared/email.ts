/**
 * Shared Resend email utility for Supabase Edge Functions
 *
 * Templates are defined inline — no external files needed.
 * All emails use a consistent UC30 brand style.
 */

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "UC30 <noreply@uc30.com>";

// ── Brand constants ──────────────────────────────────
const BRAND = {
  red: "#e94560",
  dark: "#111214",
  gray: "#888888",
  lightGray: "#cccccc",
  border: "#222222",
  bg: "#0d0d0f",
};

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>UC30</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-family:'Courier New',monospace;font-size:32px;font-weight:700;color:${BRAND.red};letter-spacing:2px;">UC30</span>
    </div>
    <!-- Content card -->
    <div style="background:${BRAND.dark};border:1px solid ${BRAND.border};border-radius:12px;padding:36px 32px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;font-size:12px;color:#444;">
      <p style="margin:0;">UC30 — 30-Day First Deal Challenge</p>
      <p style="margin:8px 0 0;">You're receiving this because you have a UC30 account.</p>
    </div>
  </div>
</body>
</html>`;
}

function button(text: string, url: string): string {
  return `<div style="text-align:center;margin:28px 0 8px;">
    <a href="${url}" style="display:inline-block;padding:14px 36px;background:${BRAND.red};color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;">${text}</a>
  </div>`;
}

// ── Templates ────────────────────────────────────────

interface TemplateData {
  firstName?: string;
  email?: string;
  dayNum?: number;
  nextDay?: number;
  expiresAt?: string;
  cohortAttempt?: number;
  currentDay?: number;
  dashboardUrl?: string;
  [key: string]: unknown;
}

interface TemplateResult {
  subject: string;
  html: string;
}

const templates: Record<string, (data: TemplateData) => TemplateResult> = {
  // ── After registration ──
  welcome: (data) => ({
    subject: "Welcome to the UC30 Challenge",
    html: baseLayout(`
      <h1 style="margin:0 0 16px;font-size:22px;color:#fff;">Welcome, ${data.firstName || "Challenger"}!</h1>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.7;margin:0 0 16px;">
        You've taken the first step. Your UC30 account is ready.
      </p>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.7;margin:0 0 16px;">
        Once the cohort begins, you'll get a daily video lesson and one clear action task.
        Complete it and submit proof before midnight. Miss a day and you're removed — that's
        the accountability that makes this work.
      </p>
      <p style="color:${BRAND.lightGray};font-size:15px;line-height:1.7;margin:0 0 8px;font-weight:600;">
        Here's what to expect:
      </p>
      <ul style="color:${BRAND.gray};font-size:14px;line-height:2;padding-left:20px;margin:0 0 16px;">
        <li>Days 1–10: Foundation (systems, analysis, market research)</li>
        <li>Days 11–20: Execution (agents, offers, follow-ups)</li>
        <li>Days 21–30: Closing (structuring, due diligence, close)</li>
      </ul>
      ${button("Go to Your Dashboard", data.dashboardUrl || "https://uc30-challenge.vercel.app")}
    `),
  }),

  // ── After completing a day ──
  "day-completed": (data) => ({
    subject: `Day ${data.dayNum} complete — keep the momentum`,
    html: baseLayout(`
      <div style="text-align:center;margin-bottom:20px;">
        <span style="font-size:48px;">&#10003;</span>
      </div>
      <h1 style="margin:0 0 16px;font-size:22px;color:#fff;text-align:center;">Day ${data.dayNum} — Done!</h1>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.7;margin:0 0 16px;text-align:center;">
        You showed up. You did the work. That's what separates you from 99% of people who
        "want to get into real estate."
      </p>
      ${data.dayNum && data.dayNum < 30
        ? `<p style="color:${BRAND.lightGray};font-size:15px;line-height:1.7;margin:0 0 16px;text-align:center;">
            <strong>Day ${(data.dayNum || 0) + 1}</strong> is unlocked and waiting for you.
            Same drill — watch the lesson, complete the task, submit before midnight.
          </p>
          ${button("Start Day " + ((data.dayNum || 0) + 1), data.dashboardUrl || "https://uc30-challenge.vercel.app")}`
        : `<p style="color:${BRAND.lightGray};font-size:15px;line-height:1.7;margin:0 0 16px;text-align:center;">
            <strong>You've completed the entire 30-day challenge.</strong> Check your dashboard for your final results.
          </p>
          ${button("View Your Results", data.dashboardUrl || "https://uc30-challenge.vercel.app")}`
      }
      <p style="color:#555;font-size:13px;text-align:center;margin:16px 0 0;">
        ${data.dayNum && data.dayNum < 30 ? `${30 - (data.dayNum || 0)} days remaining` : "Challenge complete!"}
      </p>
    `),
  }),

  // ── Challenge completed (Day 30) ──
  "challenge-completed": (data) => ({
    subject: "You did it — 30 days, done.",
    html: baseLayout(`
      <div style="text-align:center;margin-bottom:20px;">
        <span style="font-size:56px;">&#127942;</span>
      </div>
      <h1 style="margin:0 0 16px;font-size:24px;color:#fff;text-align:center;">Challenge Complete!</h1>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.7;margin:0 0 16px;text-align:center;">
        ${data.firstName || "Challenger"}, you made it through all 30 days. You showed up every single day
        when most people would have quit. That discipline is what closes deals.
      </p>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.7;margin:0 0 16px;text-align:center;">
        Your dashboard has your full progress history, metrics, and results.
        Remember — you have 1-year access, so you can run through the challenge
        again with a future cohort anytime.
      </p>
      ${button("View Your Dashboard", data.dashboardUrl || "https://uc30-challenge.vercel.app")}
    `),
  }),

  // ── Removed from cohort ──
  "removed-from-cohort": (data) => ({
    subject: "You've been removed from the current cohort",
    html: baseLayout(`
      <h1 style="margin:0 0 16px;font-size:22px;color:#fff;">Cohort Update</h1>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.7;margin:0 0 16px;">
        Hi ${data.firstName || "there"}, you've been removed from the current UC30 cohort
        for missing a daily submission.
      </p>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.7;margin:0 0 16px;">
        We know this is tough — but strict accountability is what makes UC30 different
        from every other program that lets you "go at your own pace" and never finish.
      </p>
      <p style="color:${BRAND.lightGray};font-size:15px;line-height:1.7;margin:0 0 16px;font-weight:600;">
        The good news: your 1-year access is still active. You can rejoin a future
        cohort and pick up where you left off.
      </p>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.7;margin:0 0 8px;">
        When you're ready to go again, log in and you'll be placed into the next
        available cohort.
      </p>
      ${button("Log In to Your Account", data.dashboardUrl || "https://uc30-challenge.vercel.app")}
    `),
  }),

  // ── Reactivated ──
  reactivated: (data) => ({
    subject: "You're back in — let's go!",
    html: baseLayout(`
      <h1 style="margin:0 0 16px;font-size:22px;color:#fff;">Welcome Back!</h1>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.7;margin:0 0 16px;">
        ${data.firstName || "Hey"}, you've been reactivated in the UC30 Challenge.
        ${data.currentDay ? `You're starting at <strong style="color:#fff;">Day ${data.currentDay}</strong>.` : ""}
        ${data.cohortAttempt && data.cohortAttempt > 1 ? `This is cohort attempt #${data.cohortAttempt}.` : ""}
      </p>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.7;margin:0 0 16px;">
        Same rules apply: watch the daily video, complete the task, submit proof before
        midnight. Miss a day and you're out again. You already know how this works.
      </p>
      <p style="color:${BRAND.lightGray};font-size:15px;line-height:1.7;margin:0 0 8px;font-weight:600;">
        Let's make this the run that sticks.
      </p>
      ${button("Go to Your Dashboard", data.dashboardUrl || "https://uc30-challenge.vercel.app")}
    `),
  }),

  // ── Payment confirmed (from webhook) ──
  "payment-confirmed": (data) => ({
    subject: "Payment received — you're in!",
    html: baseLayout(`
      <div style="text-align:center;margin-bottom:20px;">
        <span style="font-size:48px;">&#10003;</span>
      </div>
      <h1 style="margin:0 0 16px;font-size:22px;color:#fff;text-align:center;">Payment Confirmed</h1>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.7;margin:0 0 16px;text-align:center;">
        Your payment of <strong style="color:#fff;">$997</strong> has been received.
        You now have 1-year access to the UC30 Challenge.
      </p>
      ${data.expiresAt
        ? `<p style="color:#555;font-size:13px;text-align:center;margin:0 0 16px;">
            Access expires: ${new Date(data.expiresAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>`
        : ""
      }
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.7;margin:0 0 16px;text-align:center;">
        A separate receipt has been sent by Stripe. Log in to your dashboard
        to get started — your first daily lesson will be available when the
        next cohort begins.
      </p>
      ${button("Go to Your Dashboard", data.dashboardUrl || "https://uc30-challenge.vercel.app")}
    `),
  }),

  // ── Payment failed ──
  "payment-failed": (data) => ({
    subject: "Action needed — payment issue with your UC30 account",
    html: baseLayout(`
      <h1 style="margin:0 0 16px;font-size:22px;color:${BRAND.red};">Payment Issue</h1>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.7;margin:0 0 16px;">
        We were unable to process a payment for your UC30 Challenge subscription.
        Your access has been paused until the payment is resolved.
      </p>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.7;margin:0 0 16px;">
        Please update your payment method through Stripe or contact us at
        <a href="mailto:support@uc30.com" style="color:${BRAND.red};text-decoration:none;">support@uc30.com</a>
        for help.
      </p>
      ${button("Update Payment Method", data.dashboardUrl || "https://uc30-challenge.vercel.app")}
    `),
  }),

  // ── Subscription cancelled ──
  "subscription-cancelled": (data) => ({
    subject: "Your UC30 subscription has been cancelled",
    html: baseLayout(`
      <h1 style="margin:0 0 16px;font-size:22px;color:#fff;">Subscription Cancelled</h1>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.7;margin:0 0 16px;">
        Your UC30 Challenge subscription has been cancelled. Your access has been revoked.
      </p>
      <p style="color:${BRAND.gray};font-size:15px;line-height:1.7;margin:0 0 16px;">
        If this was a mistake or you'd like to rejoin, contact us at
        <a href="mailto:support@uc30.com" style="color:${BRAND.red};text-decoration:none;">support@uc30.com</a>
        and we'll help you get sorted.
      </p>
      <p style="color:#555;font-size:13px;margin:16px 0 0;">
        We hope to see you back in a future cohort.
      </p>
    `),
  }),
};

// ── Send function ────────────────────────────────────

export interface SendEmailParams {
  to: string;
  template: string;
  data?: TemplateData;
}

export async function sendEmail({ to, template, data = {} }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const templateFn = templates[template];
  if (!templateFn) {
    return { success: false, error: `Unknown template: ${template}` };
  }

  const { subject, html } = templateFn(data);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`Resend API error (${res.status}):`, errBody);
      return { success: false, error: `Resend error: ${res.status}` };
    }

    const result = await res.json();
    console.log(`Email sent: ${template} → ${to} (id: ${result.id})`);
    return { success: true };
  } catch (err) {
    console.error("Failed to send email:", err);
    return { success: false, error: err.message };
  }
}
