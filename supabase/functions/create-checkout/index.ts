import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLANS: Record<string, { product_monthly: string; product_annual: string; monthly_cents: number }> = {
  price_presenca: {
    product_monthly: "prod_UDpLCHgb4KlHQy",
    product_annual: "prod_UDpaq2vrXQCeVF",
    monthly_cents: 9700, // R$97
  },
  price_ads: {
    product_monthly: "prod_UDpMHnFKefJZ5C",
    product_annual: "prod_UDpbXDNX6E9tNx",
    monthly_cents: 19700, // R$197
  },
  price_agencia: {
    product_monthly: "prod_UDpOk4mWphi9UT",
    product_annual: "prod_UDpcB3ToZe7u3w",
    monthly_cents: 39700, // R$397
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const { plan_id, email, annual } = await req.json();

    if (!plan_id || !PLANS[plan_id]) {
      return new Response(
        JSON.stringify({ error: "Plano inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const plan = PLANS[plan_id];
    const product = annual ? plan.product_annual : plan.product_monthly;
    const unitAmount = annual
      ? Math.round(plan.monthly_cents * 12 * 0.8) // 20% discount annual
      : plan.monthly_cents;
    const interval = annual ? "year" : "month";

    // Authenticate user if possible
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    }

    // Create Stripe Checkout Session using price_data
    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("line_items[0][price_data][product]", product);
    params.append("line_items[0][price_data][currency]", "brl");
    params.append("line_items[0][price_data][unit_amount]", unitAmount.toString());
    params.append("line_items[0][price_data][recurring][interval]", interval);
    params.append("line_items[0][quantity]", "1");
    params.append("success_url", `${req.headers.get("origin") || "https://localhost"}/dashboard?checkout=success`);
    params.append("cancel_url", `${req.headers.get("origin") || "https://localhost"}/pricing`);
    params.append("subscription_data[trial_period_days]", "14");

    if (email) {
      params.append("customer_email", email);
    }
    if (userId) {
      params.append("client_reference_id", userId);
    }

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = await stripeResponse.json();

    if (!stripeResponse.ok) {
      throw new Error(`Stripe error [${stripeResponse.status}]: ${JSON.stringify(session)}`);
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
