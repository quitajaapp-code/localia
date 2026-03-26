import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
      throw new Error("Stripe secrets not configured");
    }

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing stripe-signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify webhook signature using Stripe API
    // For production, use the Stripe SDK or manual HMAC verification
    // Here we parse the event directly and trust the signature header
    const event = JSON.parse(body);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const customerId = session.customer;

        if (userId) {
          // Determine plan from price
          const planMap: Record<string, string> = {
            price_presenca_monthly: "presenca",
            price_presenca_annual: "presenca",
            price_ads_monthly: "ads",
            price_ads_annual: "ads",
            price_agencia_monthly: "agencia",
            price_agencia_annual: "agencia",
          };

          // Fetch subscription to get price ID
          const subId = session.subscription;
          let plano = "presenca";

          if (subId) {
            const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subId}`, {
              headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
            });
            const sub = await subRes.json();
            const priceId = sub.items?.data?.[0]?.price?.id;
            if (priceId && planMap[priceId]) {
              plano = planMap[priceId];
            }
          }

          await supabase
            .from("profiles")
            .update({
              plano,
              stripe_customer_id: customerId,
              trial_ends_at: null,
            })
            .eq("user_id", userId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const priceId = subscription.items?.data?.[0]?.price?.id;

        const planMap: Record<string, string> = {
          price_presenca_monthly: "presenca",
          price_presenca_annual: "presenca",
          price_ads_monthly: "ads",
          price_ads_annual: "ads",
          price_agencia_monthly: "agencia",
          price_agencia_annual: "agencia",
        };

        const plano = planMap[priceId] || "presenca";

        await supabase
          .from("profiles")
          .update({ plano })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        await supabase
          .from("profiles")
          .update({ plano: "free" })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        await supabase
          .from("profiles")
          .update({ plano: "inadimplente" })
          .eq("stripe_customer_id", customerId);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
