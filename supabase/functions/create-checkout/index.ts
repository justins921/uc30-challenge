import Stripe from "https://esm.sh/stripe@17?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2025-03-31.basil",
});

const CONNECTED_ACCOUNT_ID = Deno.env.get("STRIPE_CONNECTED_ACCOUNT_ID")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { supabase_user_id, email, success_url, cancel_url } = await req.json();

    if (!supabase_user_id || !email) {
      return new Response(
        JSON.stringify({ error: "supabase_user_id and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Use client-provided URLs with fallback to default
    const resolvedSuccessUrl = success_url || "https://uc30-challenge.vercel.app/?success=true";
    const resolvedCancelUrl = cancel_url || "https://uc30-challenge.vercel.app/";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 99700, // $997.00
            recurring: { interval: "year" },
            product_data: {
              name: "UC30 Challenge — 1 Year Access",
              description:
                "30-day real estate challenge with video lessons, daily tasks, accountability, and community access. Includes 1-year re-run access.",
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        application_fee_percent: 15,
        transfer_data: {
          destination: CONNECTED_ACCOUNT_ID,
        },
        metadata: {
          supabase_user_id,
          email,
        },
      },
      metadata: {
        supabase_user_id,
        email,
      },
      customer_email: email,
      success_url: resolvedSuccessUrl,
      cancel_url: resolvedCancelUrl,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("create-checkout error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
