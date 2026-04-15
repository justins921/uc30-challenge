/**
 * send-email Edge Function
 *
 * Called from the client to send transactional emails via Resend.
 * Templates: welcome, day-completed, challenge-completed,
 *            removed-from-cohort, reactivated
 *
 * Server-only templates (payment-confirmed, payment-failed,
 * subscription-cancelled) are called directly from stripe-webhook.
 */

import { sendEmail } from "../_shared/email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, template, data } = await req.json();

    if (!to || !template) {
      return new Response(
        JSON.stringify({ error: "to and template are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Block server-only templates from being called by the client
    const serverOnly = [
      "payment-confirmed",
      "payment-failed",
      "subscription-cancelled",
    ];
    if (serverOnly.includes(template)) {
      return new Response(
        JSON.stringify({ error: "This template can only be sent server-side" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const result = await sendEmail({ to, template, data: data || {} });

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-email error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
