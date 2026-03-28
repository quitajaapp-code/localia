import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function decryptToken(
  supabase: ReturnType<typeof createClient>,
  encryptedData: string,
  encryptionKey: string,
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc("decrypt_token", {
      encrypted_data: encryptedData,
      secret_key: encryptionKey,
    });
    if (error || !data) {
      console.error("decrypt_token error:", error);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

async function refreshAccessToken(
  refreshToken: string,
  supabase: ReturnType<typeof createClient>,
  userId: string,
  encryptionKey: string,
): Promise<string | null> {
  const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
  const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error("Missing Google OAuth credentials for token refresh");
    return null;
  }

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Token refresh failed (${res.status}):`, errText);
      return null;
    }

    const data = await res.json();
    const newAccessToken = data.access_token;
    const expiresIn = data.expires_in || 3600;

    // Encrypt new access token
    const { data: encryptedToken } = await supabase.rpc("encrypt_token", {
      plain_text: newAccessToken,
      secret_key: encryptionKey,
    });

    await supabase
      .from("oauth_tokens")
      .update({
        access_token_encrypted: encryptedToken,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      })
      .eq("user_id", userId)
      .eq("provider", "google");

    return newAccessToken;
  } catch (err) {
    console.error("Token refresh error:", err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const ENCRYPTION_KEY = Deno.env.get("TOKEN_ENCRYPTION_KEY") || "";

    // Authenticate user via JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get OAuth token (encrypted)
    const { data: tokenRow } = await supabase
      .from("oauth_tokens")
      .select("access_token_encrypted, refresh_token_encrypted, expires_at")
      .eq("user_id", user.id)
      .eq("provider", "google")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!tokenRow?.access_token_encrypted) {
      console.log("No encrypted token found for user", user.id);
      return new Response(JSON.stringify({ error: "no_token", accounts: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Decrypt access token
    let accessToken = await decryptToken(supabase, tokenRow.access_token_encrypted, ENCRYPTION_KEY);
    if (!accessToken) {
      console.error("Failed to decrypt access token for user", user.id);
      return new Response(JSON.stringify({ error: "decrypt_error", accounts: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Refresh if expired
    if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
      if (!tokenRow.refresh_token_encrypted) {
        return new Response(JSON.stringify({ error: "token_expired_no_refresh", accounts: [] }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const refreshToken = await decryptToken(supabase, tokenRow.refresh_token_encrypted, ENCRYPTION_KEY);
      if (!refreshToken) {
        return new Response(JSON.stringify({ error: "refresh_decrypt_error", accounts: [] }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const newToken = await refreshAccessToken(refreshToken, supabase, user.id, ENCRYPTION_KEY);
      if (!newToken) {
        return new Response(JSON.stringify({ error: "token_refresh_failed", accounts: [] }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      accessToken = newToken;
    }

    // List GMB accounts
    console.log("Fetching GMB accounts for user", user.id);
    const accountsRes = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!accountsRes.ok) {
      const errText = await accountsRes.text();
      console.error(`GMB accounts API error (${accountsRes.status}):`, errText);
      return new Response(JSON.stringify({ error: `gmb_api_error_${accountsRes.status}`, detail: errText, accounts: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accountsData = await accountsRes.json();
    const gmbAccounts = accountsData.accounts || [];
    console.log(`Found ${gmbAccounts.length} GMB account(s)`);

    const result: Array<{
      accountId: string;
      accountName: string;
      locations: Array<{
        name: string;
        title: string;
        address: string;
        phone: string;
        website: string;
      }>;
    }> = [];

    // For each account, list locations
    for (const account of gmbAccounts) {
      const accountName = account.name;

      const locationsRes = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,phoneNumbers,websiteUri,storefrontAddress`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      const locations: Array<{
        name: string;
        title: string;
        address: string;
        phone: string;
        website: string;
      }> = [];

      if (locationsRes.ok) {
        const locData = await locationsRes.json();
        console.log(`Account ${accountName}: ${(locData.locations || []).length} location(s)`);
        for (const loc of locData.locations || []) {
          const addr = loc.storefrontAddress;
          const addressParts: string[] = [];
          if (addr?.addressLines) addressParts.push(...addr.addressLines);
          if (addr?.locality) addressParts.push(addr.locality);
          if (addr?.administrativeArea) addressParts.push(addr.administrativeArea);

          locations.push({
            name: loc.name || "",
            title: loc.title || "",
            address: addressParts.join(", "),
            phone: loc.phoneNumbers?.primaryPhone || "",
            website: loc.websiteUri || "",
          });
        }
      } else {
        const errText = await locationsRes.text();
        console.warn(`Failed to list locations for ${accountName}: ${locationsRes.status} - ${errText}`);
      }

      result.push({
        accountId: accountName,
        accountName: account.accountName || account.name,
        locations,
      });
    }

    return new Response(JSON.stringify({ accounts: result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("gmb-list-locations error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
