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
    const state = url.searchParams.get("state"); // contains user_id
    const error = url.searchParams.get("error");

    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
    const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "https://localai.app.br";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
      return Response.redirect(`${FRONTEND_URL}/onboarding/connect?gmb_error=config`, 302);
    }

    if (error || !code || !state) {
      console.error("OAuth error or missing params:", { error, code: !!code, state: !!state });
      return Response.redirect(`${FRONTEND_URL}/onboarding/connect?gmb_error=${error || "missing_params"}`, 302);
    }

    // Parse state - it contains user_id
    let userId: string;
    try {
      const stateData = JSON.parse(atob(state));
      userId = stateData.user_id;
      if (!userId) throw new Error("No user_id in state");
    } catch {
      console.error("Invalid state parameter");
      return Response.redirect(`${FRONTEND_URL}/onboarding/connect?gmb_error=invalid_state`, 302);
    }

    // Exchange code for tokens
    const redirectUri = `${SUPABASE_URL}/functions/v1/google-oauth-callback`;
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
      return Response.redirect(`${FRONTEND_URL}/onboarding/connect?gmb_error=token_exchange`, 302);
    }

    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token || null;
    const expiresIn = tokens.expires_in || 3600;

    // Get user email from Google
    let googleEmail = "";
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

    // Save tokens to database
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const payload = {
      user_id: userId,
      provider: "google",
      access_token: accessToken,
      refresh_token: refreshToken,
      scope: "business.manage",
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      google_email: googleEmail,
    };

    // Upsert: check if exists first
    const { data: existing } = await supabase
      .from("oauth_tokens")
      .select("id")
      .eq("user_id", userId)
      .eq("provider", "google")
      .order("created_at", { ascending: false })
      .limit(1);

    let dbError: unknown = null;
    if (existing && existing.length > 0) {
      const res = await supabase
        .from("oauth_tokens")
        .update(payload)
        .eq("id", existing[0].id);
      dbError = res.error;
    } else {
      const res = await supabase.from("oauth_tokens").insert(payload);
      dbError = res.error;
    }

    if (dbError) {
      console.error("DB error saving token:", dbError);
      return Response.redirect(`${FRONTEND_URL}/onboarding/connect?gmb_error=db_error`, 302);
    }

    console.log(`GMB OAuth success for user ${userId}, email: ${googleEmail}`);

    // Redirect back to frontend with success
    return Response.redirect(
      `${FRONTEND_URL}/onboarding/connect?gmb_success=1&gmb_email=${encodeURIComponent(googleEmail)}`,
      302,
    );
  } catch (err) {
    console.error("google-oauth-callback error:", err);
    const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "https://localai.app.br";
    return Response.redirect(`${FRONTEND_URL}/onboarding/connect?gmb_error=unknown`, 302);
  }
});