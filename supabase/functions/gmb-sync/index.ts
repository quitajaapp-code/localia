import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function refreshAccessToken(
  refreshToken: string,
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<string | null> {
  const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
  const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET for token refresh");
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

    // Update token in DB
    await supabase
      .from("oauth_tokens")
      .update({
        access_token: newAccessToken,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      })
      .eq("user_id", userId)
      .eq("provider", "google");

    console.log(`Token refreshed for user ${userId}`);
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all businesses with GMB connected
    const { data: businesses, error: bizError } = await supabase
      .from("businesses")
      .select("id, user_id, gmb_location_id, nome")
      .not("gmb_location_id", "is", null);

    if (bizError) throw bizError;
    if (!businesses?.length) {
      return new Response(JSON.stringify({ message: "No connected businesses" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<{ business_id: string; status: string; reviews_added?: number }> = [];

    for (const biz of businesses) {
      try {
        // Get OAuth token for this user
        const { data: tokenRow } = await supabase
          .from("oauth_tokens")
          .select("access_token, refresh_token, expires_at")
          .eq("user_id", biz.user_id)
          .eq("provider", "google")
          .single();

        if (!tokenRow) {
          results.push({ business_id: biz.id, status: "no_token" });
          continue;
        }

        let accessToken = tokenRow.access_token;

        // Check if token expired
        if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
          if (!tokenRow.refresh_token) {
            results.push({ business_id: biz.id, status: "token_expired_no_refresh" });
            continue;
          }
          const newToken = await refreshAccessToken(tokenRow.refresh_token, supabase, biz.user_id);
          if (!newToken) {
            results.push({ business_id: biz.id, status: "token_refresh_failed" });
            continue;
          }
          accessToken = newToken;
        }

        // Fetch reviews from GMB API
        const locationId = biz.gmb_location_id;
        const reviewsRes = await fetch(
          `https://mybusiness.googleapis.com/v4/${locationId}/reviews?pageSize=50`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!reviewsRes.ok) {
          const statusCode = reviewsRes.status;
          const statusLabel = statusCode === 401 ? "gmb_unauthorized"
            : statusCode === 403 ? "gmb_forbidden"
            : `gmb_error_${statusCode}`;
          results.push({ business_id: biz.id, status: statusLabel });
          continue;
        }

        const reviewsData = await reviewsRes.json();
        const reviews = reviewsData.reviews || [];
        let added = 0;

        for (const review of reviews) {
          const googleReviewId = review.reviewId || review.name;

          // Check if already exists
          const { data: existing } = await supabase
            .from("reviews")
            .select("id")
            .eq("business_id", biz.id)
            .eq("review_id_google", googleReviewId)
            .maybeSingle();

          if (!existing) {
            const ratingMap: Record<string, number> = {
              ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
            };

            await supabase.from("reviews").insert({
              business_id: biz.id,
              review_id_google: googleReviewId,
              autor: review.reviewer?.displayName || "Anônimo",
              rating: ratingMap[review.starRating] || 3,
              texto: review.comment || "",
              respondido: !!review.reviewReply,
            });
            added++;
          }
        }

        // Save snapshot
        await supabase.from("gmb_snapshots").insert({
          business_id: biz.id,
          dados_json: reviewsData,
        });

        results.push({ business_id: biz.id, status: "ok", reviews_added: added });
      } catch (innerErr) {
        console.error(`Error syncing business ${biz.id}:`, innerErr);
        results.push({ business_id: biz.id, status: "error" });
      }
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("gmb-sync error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
