import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const event = body;

    // RISC event types: https://developers.google.com/identity/protocols/risc
    const eventType = Object.keys(event.events || {})[0] || "unknown";
    const eventData = event.events?.[eventType] || {};
    const subject = eventData.subject || event.subject || {};
    const googleUserId = subject.sub || subject.iss || null;

    console.log(`RISC event received: ${eventType}`, JSON.stringify({ googleUserId, eventData }));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle critical security events
    switch (eventType) {
      case "https://schemas.openid.net/secevent/risc/event-type/account-disabled":
      case "https://schemas.openid.net/secevent/risc/event-type/account-credential-change-required":
      case "https://schemas.openid.net/secevent/risc/event-type/sessions-revoked":
      case "https://schemas.openid.net/secevent/risc/event-type/tokens-revoked": {
        // Revoke stored OAuth tokens for this Google user
        if (googleUserId) {
          await supabase
            .from("oauth_tokens")
            .update({ access_token_encrypted: null, refresh_token_encrypted: null })
            .eq("google_email", googleUserId);

          await supabase
            .from("ad_accounts")
            .update({ status: "revoked", access_token_encrypted: null, refresh_token_encrypted: null })
            .eq("status", "connected");
        }
        console.log(`Tokens revoked for Google user: ${googleUserId}`);
        break;
      }
      default:
        console.log(`Unhandled RISC event type: ${eventType}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("RISC webhook error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
