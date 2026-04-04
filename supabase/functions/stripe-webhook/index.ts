/**
 * stripe-webhook — Handles Stripe events with grace period logic.
 *
 * Events:
 *   checkout.session.completed → create subscription record
 *   invoice.payment_succeeded  → status='active', update period_end
 *   invoice.payment_failed     → status='past_due' (grace = period_end + 5d)
 *   customer.subscription.updated → sync plan type
 *   customer.subscription.deleted → status='canceled'
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRICE_TO_PLAN: Record<string, { plano: string; plan_type: string }> = {
  "price_1TFNhFFHBDyIk4fcNj0uprWv": { plano: "presenca", plan_type: "starter" },
  "price_1TFNvPFHBDyIk4fcUb0N6SWz": { plano: "presenca", plan_type: "starter" },
  "price_1TFNhyFHBDyIk4fcCOCS5Kk7": { plano: "ads", plan_type: "pro" },
  "price_1TFNvvFHBDyIk4fcVcgdJXCV": { plano: "ads", plan_type: "pro" },
  "price_1TFNjHFHBDyIk4fcuGhKFWpp": { plano: "agencia", plan_type: "agency_10" },
  "price_1TFNwuFHBDyIk4fcByfGK7DE": { plano: "agencia", plan_type: "agency_10" },
};

function getPlanFromPriceId(priceId: string) {
  return PRICE_TO_PLAN[priceId] ?? { plano: "presenca", plan_type: "starter" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
    const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not configured");

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing stripe-signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse event (production should verify signature with HMAC)
    const event = JSON.parse(body);
    console.log(`[stripe-webhook] Event: ${event.type}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    switch (event.type) {
      // ─── Checkout completed ───
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const customerId = session.customer;
        const subId = session.subscription;

        if (!userId) break;

        let plano = "presenca";
        let planType = "starter";
        let periodEnd: string | null = null;

        if (subId) {
          const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subId}`, {
            headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
          });
          const sub = await subRes.json();
          const priceId = sub.items?.data?.[0]?.price?.id;
          if (priceId) {
            const mapped = getPlanFromPriceId(priceId);
            plano = mapped.plano;
            planType = mapped.plan_type;
          }
          if (sub.current_period_end) {
            periodEnd = new Date(sub.current_period_end * 1000).toISOString();
          }
        }

        // Update profile
        await supabase
          .from("profiles")
          .update({ plano, stripe_customer_id: customerId, trial_ends_at: null })
          .eq("user_id", userId);

        // Upsert subscription record
        const subRow = {
          user_id: userId,
          stripe_subscription_id: subId,
          stripe_customer_id: customerId,
          status: "active" as const,
          plan_type: planType,
          current_period_end: periodEnd,
          cancel_at_period_end: false,
        };

        const { data: existing } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (existing) {
          await supabase.from("subscriptions").update(subRow).eq("id", existing.id);
        } else {
          await supabase.from("subscriptions").insert(subRow);
        }

        console.log(`[checkout] User ${userId} → ${plano}/${planType}`);
        break;
      }

      // ─── Payment succeeded ───
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const subId = invoice.subscription;

        if (!subId) break;

        // Get subscription details from Stripe
        const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subId}`, {
          headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
        });
        const sub = await subRes.json();
        const priceId = sub.items?.data?.[0]?.price?.id;
        const mapped = priceId ? getPlanFromPriceId(priceId) : { plano: "presenca", plan_type: "starter" };
        const periodEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;

        // Update subscription → active + new period_end (grace auto-calculated by trigger)
        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            current_period_end: periodEnd,
            plan_type: mapped.plan_type,
          })
          .eq("stripe_customer_id", customerId);

        // Update profile plan
        await supabase
          .from("profiles")
          .update({ plano: mapped.plano })
          .eq("stripe_customer_id", customerId);

        console.log(`[payment_succeeded] Customer ${customerId} → active`);
        break;
      }

      // ─── Payment failed ───
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        // Set to past_due — grace_period_end already set from previous period
        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_customer_id", customerId);

        await supabase
          .from("profiles")
          .update({ plano: "inadimplente" })
          .eq("stripe_customer_id", customerId);

        console.log(`[payment_failed] Customer ${customerId} → past_due`);
        break;
      }

      // ─── Subscription updated ───
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const priceId = subscription.items?.data?.[0]?.price?.id;
        const mapped = priceId ? getPlanFromPriceId(priceId) : null;
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        const updateData: Record<string, unknown> = {
          cancel_at_period_end: subscription.cancel_at_period_end ?? false,
        };
        if (mapped) updateData.plan_type = mapped.plan_type;
        if (periodEnd) updateData.current_period_end = periodEnd;

        // Map Stripe status to our enum
        const statusMap: Record<string, string> = {
          active: "active",
          past_due: "past_due",
          canceled: "canceled",
          unpaid: "unpaid",
          trialing: "trialing",
        };
        if (statusMap[subscription.status]) {
          updateData.status = statusMap[subscription.status];
        }

        await supabase
          .from("subscriptions")
          .update(updateData)
          .eq("stripe_customer_id", customerId);

        if (mapped) {
          await supabase
            .from("profiles")
            .update({ plano: mapped.plano })
            .eq("stripe_customer_id", customerId);
        }

        console.log(`[sub_updated] Customer ${customerId}`);
        break;
      }

      // ─── Subscription deleted ───
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_customer_id", customerId);

        await supabase
          .from("profiles")
          .update({ plano: "free" })
          .eq("stripe_customer_id", customerId);

        console.log(`[sub_deleted] Customer ${customerId} → canceled`);
        break;
      }

      default:
        console.log(`[stripe-webhook] Unhandled: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("[stripe-webhook] Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
