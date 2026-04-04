import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const MAX_COMPETITORS = 5;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

// ---------- helpers ----------

async function fetchWithRetry(url: string, attempts = RETRY_ATTEMPTS): Promise<Response> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 400) return res;
      console.warn(`[retry ${i + 1}/${attempts}] status=${res.status}`);
    } catch (err) {
      console.warn(`[retry ${i + 1}/${attempts}] network error:`, err);
    }
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (i + 1)));
  }
  throw new Error(`Failed after ${attempts} attempts for ${url}`);
}

interface PlaceResult {
  place_id: string;
  name: string;
  vicinity?: string;
  geometry?: { location: { lat: number; lng: number } };
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types?: string[];
}

interface PlaceDetails {
  formatted_phone_number?: string;
  website?: string;
  reviews?: unknown[];
}

async function nearbySearch(lat: number, lng: number, type: string, keyword: string): Promise<PlaceResult[]> {
  const radius = 5000;
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${encodeURIComponent(type)}&keyword=${encodeURIComponent(keyword)}&key=${GOOGLE_MAPS_API_KEY}`;
  console.log("[places] nearbySearch:", keyword);
  const res = await fetchWithRetry(url);
  const json = await res.json();
  if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
    console.error("[places] nearbySearch error:", json.status, json.error_message);
    return [];
  }
  return (json.results ?? []) as PlaceResult[];
}

async function placeDetails(placeId: string): Promise<PlaceDetails> {
  const fields = "formatted_phone_number,website,reviews";
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_MAPS_API_KEY}`;
  const res = await fetchWithRetry(url);
  const json = await res.json();
  return (json.result ?? {}) as PlaceDetails;
}

// ---------- main ----------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const businessId = body.business_id as string | undefined;
    if (!businessId) {
      return new Response(JSON.stringify({ error: "business_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Load business
    const { data: biz, error: bizErr } = await supabase
      .from("businesses")
      .select("id, nome, nicho, cidade, estado")
      .eq("id", businessId)
      .single();

    if (bizErr || !biz) {
      console.error("[biz]", bizErr);
      return new Response(JSON.stringify({ error: "Business not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[start] Fetching competitors for "${biz.nome}" (${biz.nicho}) in ${biz.cidade}/${biz.estado}`);

    // 2. Geocode city to get lat/lng
    const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(`${biz.cidade}, ${biz.estado}, Brazil`)}&key=${GOOGLE_MAPS_API_KEY}`;
    const geoRes = await fetchWithRetry(geoUrl);
    const geoJson = await geoRes.json();
    if (!geoJson.results?.length) {
      return new Response(JSON.stringify({ error: "Could not geocode city" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { lat, lng } = geoJson.results[0].geometry.location;
    console.log(`[geo] ${biz.cidade} → ${lat}, ${lng}`);

    // 3. Nearby search
    const keyword = biz.nicho || biz.nome;
    const places = await nearbySearch(lat, lng, "establishment", keyword);
    const top = places.slice(0, MAX_COMPETITORS);
    console.log(`[places] Found ${places.length}, using top ${top.length}`);

    // 4. Upsert competitors + metrics
    const results = [];
    for (const place of top) {
      const details = await placeDetails(place.place_id);

      // Upsert in benchmark_competitors
      const row = {
        business_id: businessId,
        google_place_id: place.place_id,
        name: place.name,
        address: place.vicinity ?? null,
        category: place.types?.[0] ?? null,
        website: details.website ?? null,
        phone: details.formatted_phone_number ?? null,
        rating: place.rating ?? 0,
        review_count: place.user_ratings_total ?? 0,
        price_level: place.price_level ?? null,
        latitude: place.geometry?.location?.lat ?? null,
        longitude: place.geometry?.location?.lng ?? null,
        is_active: true,
      };

      // Check if competitor already exists
      const { data: existing } = await supabase
        .from("benchmark_competitors")
        .select("id")
        .eq("business_id", businessId)
        .eq("google_place_id", place.place_id)
        .maybeSingle();

      let competitorId: string;
      if (existing) {
        competitorId = existing.id;
        await supabase
          .from("benchmark_competitors")
          .update({ ...row, updated_at: new Date().toISOString() })
          .eq("id", competitorId);
        console.log(`[upsert] Updated "${place.name}"`);
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from("benchmark_competitors")
          .insert(row)
          .select("id")
          .single();
        if (insErr) { console.error("[insert]", insErr); continue; }
        competitorId = inserted.id;
        console.log(`[upsert] Inserted "${place.name}"`);
      }

      // Insert metrics snapshot
      const { error: metErr } = await supabase
        .from("benchmark_metrics_history")
        .insert({
          competitor_id: competitorId,
          rating: place.rating ?? null,
          review_count: place.user_ratings_total ?? null,
          response_rate: null,
          posts_last_30_days: null,
          raw_data: { details, place_types: place.types },
        });
      if (metErr) console.error("[metrics]", metErr);

      results.push({ id: competitorId, name: place.name, rating: place.rating });
    }

    console.log(`[done] Processed ${results.length} competitors`);

    return new Response(JSON.stringify({ success: true, competitors: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[fatal]", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
