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
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
    const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "https://localai.app.br";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
      return Response.redirect(`${FRONTEND_URL}/dashboard/ads?ads_error=config`, 302);
    }

    if (error || !code || !state) {
      console.error("OAuth error or missing params:", { error, code: !!code, state: !!state });
      return Response.redirect(`${FRONTEND_URL}/dashboard/ads?ads_error=${error || "missing_params"}`, 302);
    }

    // Parse state
    let userId: string;
    try {
      const stateData = JSON.parse(atob(state));
      userId = stateData.user_id;
      if (!userId) throw new Error("No user_id in state");
    } catch {
      console.error("Invalid state parameter");
      return Response.redirect(`${FRONTEND_URL}/dashboard/ads?ads_error=invalid_state`, 302);
    }

    // Exchange code for tokens
    const redirectUri = `${SUPABASE_URL}/functions/v1/google-ads-oauth-callback`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error("Token exchange failed:", tokenRes.status, errBody);
      return Response.redirect(`${FRONTEND_URL}/dashboard/ads?ads_error=token_exchange`, 302);
    }

    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token || null;
    const expiresIn = tokens.expires_in || 3600;

    // Get accessible Google Ads customers
    let customerId: string | null = null;
    let googleEmail = "";
    try {
      const customersRes = await fetch(
        "https://googleads.googleapis.com/v17/customers:listAccessibleCustomers",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (customersRes.ok) {
        const customersData = await customersRes.json();
        const resourceNames: string[] = customersData.resourceNames || [];
        if (resourceNames.length > 0) {
          // Extract first customer ID from "customers/1234567890"
          customerId = resourceNames[0].replace("customers/", "");
        }
      }
    } catch (e) {
      console.warn("Failed to fetch accessible customers:", e);
    }

    // Get user email
    try {
      const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (userinfoRes.ok) {
        const userinfo = await userinfoRes.json();
        googleEmail = userinfo.email || "";
      }
    } catch (e) {
      console.warn("Failed to fetch userinfo:", e);
    }

    // Save tokens encrypted
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const ENCRYPTION_KEY = Deno.env.get("TOKEN_ENCRYPTION_KEY") || "";

    const encryptToken = async (token: string | null) => {
      if (!token || !ENCRYPTION_KEY) return null;
      const { data, error } = await supabase.rpc("encrypt_token", {
        plain_text: token,
        secret_key: ENCRYPTION_KEY,
      });
      if (error) {
        console.warn("Encrypt failed:", error.message);
        return null;
      }
      return data;
    };

    const accessTokenEnc = await encryptToken(accessToken);
    const refreshTokenEnc = await encryptToken(refreshToken);

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Upsert ad_accounts
    const { data: existing } = await supabase
      .from("ad_accounts")
      .select("id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    const payload = {
      user_id: userId,
      google_ads_customer_id: customerId,
      access_token_encrypted: accessTokenEnc,
      refresh_token_encrypted: refreshTokenEnc,
      expires_at: expiresAt,
      status: "connected",
      updated_at: new Date().toISOString(),
    };

    let dbError: unknown = null;
    if (existing) {
      const updatePayload = { ...payload };
      if (!refreshToken) {
        delete (updatePayload as Record<string, unknown>).refresh_token_encrypted;
      }
      const res = await supabase
        .from("ad_accounts")
        .update(updatePayload)
        .eq("id", existing.id);
      dbError = res.error;
    } else {
      const res = await supabase.from("ad_accounts").insert(payload);
      dbError = res.error;
    }

    if (dbError) {
      console.error("DB error saving ad account:", dbError);
      return Response.redirect(`${FRONTEND_URL}/dashboard/ads?ads_error=db_error`, 302);
    }

    console.log(`Google Ads OAuth success for user ${userId}, customer: ${customerId}, email: ${googleEmail}`);

    const params = new URLSearchParams({ ads_success: "1" });
    if (customerId) params.set("customer_id", customerId);
    if (googleEmail) params.set("ads_email", googleEmail);

    return Response.redirect(`${FRONTEND_URL}/dashboard/ads?${params.toString()}`, 302);
  } catch (err) {
    console.error("google-ads-oauth-callback error:", err);
    const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "https://localai.app.br";
    return Response.redirect(`${FRONTEND_URL}/dashboard/ads?ads_error=unknown`, 302);
  }
});
