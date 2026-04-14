import Stripe from "https://esm.sh/stripe@17?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2025-03-31.basil",
});

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

// Service-role client to bypass RLS
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log(`Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;

        if (!userId) {
          console.error("No supabase_user_id in checkout session metadata");
          break;
        }

        // Grant 1 year of access from now
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        // Extract Stripe IDs for future lookups (refunds, portal, etc.)
        const stripeCustomerId = typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;
        const stripeSubscriptionId = typeof session.subscription === "string"
          ? session.subscription
          : (session.subscription as Stripe.Subscription | null)?.id;

        const updatePayload: Record<string, unknown> = {
          has_paid: true,
          access_expires_at: expiresAt.toISOString(),
        };
        if (stripeCustomerId) updatePayload.stripe_customer_id = stripeCustomerId;
        if (stripeSubscriptionId) updatePayload.stripe_subscription_id = stripeSubscriptionId;

        const { error } = await supabase
          .from("participants")
          .update(updatePayload)
          .eq("auth_id", userId);

        if (error) {
          console.error("Failed to update participant access:", error);
        } else {
          console.log(`Granted access to user ${userId} until ${expiresAt.toISOString()}`);
        }
        break;
      }

      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        // Extract metadata from subscription
        let userId: string | undefined;

        if (event.type === "customer.subscription.deleted") {
          const subscription = event.data.object as Stripe.Subscription;
          userId = subscription.metadata?.supabase_user_id;
        } else {
          // For invoice.payment_failed, get the subscription to find metadata
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.subscription && typeof invoice.subscription === "string") {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
            userId = subscription.metadata?.supabase_user_id;
          }
        }

        if (!userId) {
          console.error(`No supabase_user_id found for ${event.type} event`);
          break;
        }

        // Revoke access immediately
        const { error } = await supabase
          .from("participants")
          .update({
            access_expires_at: new Date().toISOString(),
          })
          .eq("auth_id", userId);

        if (error) {
          console.error("Failed to revoke participant access:", error);
        } else {
          console.log(`Revoked access for user ${userId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err);
    return new Response(`Webhook handler error: ${err.message}`, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
