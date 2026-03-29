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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
    const ENCRYPTION_KEY = Deno.env.get("TOKEN_ENCRYPTION_KEY") || "";

    // Verify user
    const anonClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get ad account
    const { data: account } = await supabase
      .from("ad_accounts")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "connected")
      .limit(1)
      .maybeSingle();

    if (!account || !account.refresh_token_encrypted) {
      return new Response(JSON.stringify({ error: "No connected account or missing refresh token" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Decrypt refresh token
    const { data: refreshToken, error: decryptErr } = await supabase.rpc("decrypt_token", {
      encrypted_data: account.refresh_token_encrypted,
      secret_key: ENCRYPTION_KEY,
    });

    if (decryptErr || !refreshToken) {
      return new Response(JSON.stringify({ error: "Failed to decrypt refresh token" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Refresh the token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error("Token refresh failed:", errBody);

      // If refresh fails with invalid_grant, mark account as disconnected
      if (errBody.includes("invalid_grant")) {
        await supabase
          .from("ad_accounts")
          .update({ status: "disconnected", updated_at: new Date().toISOString() })
          .eq("id", account.id);
      }

      return new Response(JSON.stringify({ error: "Token refresh failed", details: errBody }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tokens = await tokenRes.json();
    const newAccessToken = tokens.access_token;
    const expiresIn = tokens.expires_in || 3600;

    // Encrypt and save new access token
    const { data: encryptedToken } = await supabase.rpc("encrypt_token", {
      plain_text: newAccessToken,
      secret_key: ENCRYPTION_KEY,
    });

    await supabase
      .from("ad_accounts")
      .update({
        access_token_encrypted: encryptedToken,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", account.id);

    return new Response(JSON.stringify({ success: true, expires_in: expiresIn }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("google-ads-refresh error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
