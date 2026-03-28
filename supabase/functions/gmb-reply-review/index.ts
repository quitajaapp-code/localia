/**
 * GMB REPLY REVIEW
 * Posts a reply to a Google My Business review using the Business Profile API.
 */
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
    if (error || !data) return null;
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
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return null;

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

    if (!res.ok) return null;

    const data = await res.json();
    const newAccessToken = data.access_token;
    const expiresIn = data.expires_in || 3600;

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
  } catch {
    return null;
  }
}

async function getAccessToken(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  encryptionKey: string,
): Promise<string | null> {
  const { data: tokenRow } = await supabase
    .from("oauth_tokens")
    .select("access_token_encrypted, refresh_token_encrypted, expires_at")
    .eq("user_id", userId)
    .eq("provider", "google")
    .single();

  if (!tokenRow?.access_token_encrypted) return null;

  let accessToken = await decryptToken(supabase, tokenRow.access_token_encrypted, encryptionKey);
  if (!accessToken) return null;

  // Check if expired
  if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
    if (!tokenRow.refresh_token_encrypted) return null;
    const refreshToken = await decryptToken(supabase, tokenRow.refresh_token_encrypted, encryptionKey);
    if (!refreshToken) return null;
    const newToken = await refreshAccessToken(refreshToken, supabase, userId, encryptionKey);
    if (!newToken) return null;
    accessToken = newToken;
  }

  return accessToken;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ENCRYPTION_KEY = Deno.env.get("TOKEN_ENCRYPTION_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate JWT from request
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { review_id, reply_text } = await req.json();

    if (!review_id || !reply_text) {
      return new Response(JSON.stringify({ error: "review_id and reply_text are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the review and associated business
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select("id, business_id, review_id_google")
      .eq("id", review_id)
      .single();

    if (reviewError || !review) {
      return new Response(JSON.stringify({ error: "Review not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user owns this business
    const { data: biz, error: bizError } = await supabase
      .from("businesses")
      .select("id, user_id, gmb_location_id")
      .eq("id", review.business_id)
      .eq("user_id", user.id)
      .single();

    if (bizError || !biz) {
      return new Response(JSON.stringify({ error: "Business not found or unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!biz.gmb_location_id) {
      return new Response(JSON.stringify({ error: "Business not connected to GMB" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!review.review_id_google) {
      return new Response(JSON.stringify({ error: "Review has no Google review ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get access token
    const accessToken = await getAccessToken(supabase, user.id, ENCRYPTION_KEY);
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "Could not get Google access token. Please reconnect GMB." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Post reply to GMB API
    // The review_id_google should be in format: accounts/{accountId}/locations/{locationId}/reviews/{reviewId}
    // or just the reviewId that we need to construct the path for
    const reviewName = review.review_id_google;
    const replyUrl = `https://mybusiness.googleapis.com/v4/${reviewName}/reply`;

    const gmbRes = await fetch(replyUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment: reply_text }),
    });

    if (!gmbRes.ok) {
      const errText = await gmbRes.text();
      console.error(`GMB reply error (${gmbRes.status}):`, errText);
      return new Response(JSON.stringify({ 
        error: `Failed to post reply to Google (${gmbRes.status})`,
        detail: errText.slice(0, 300),
      }), {
        status: gmbRes.status === 401 ? 401 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update review in database
    await supabase
      .from("reviews")
      .update({
        respondido: true,
        respondido_em: new Date().toISOString(),
        resposta_sugerida_ia: reply_text,
      })
      .eq("id", review_id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("gmb-reply-review error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
