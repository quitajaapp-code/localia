/**
 * ADS-METRICS-COLLECTOR
 * Coleta métricas de campanhas ativas e salva em ad_metrics.
 * Preparado para integração real com Google Ads API.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const body = await req.json().catch(() => ({}));

    // Get all active campaigns from ad_campaigns
    let query = supabase.from("ad_campaigns").select("*").eq("status", "active");
    if (body.user_id) query = query.eq("user_id", body.user_id);

    const { data: campaigns } = await query;
    if (!campaigns?.length) {
      return new Response(JSON.stringify({ message: "Nenhuma campanha ativa para coletar métricas" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = [];

    for (const campaign of campaigns) {
      // Future: fetch real metrics from Google Ads API using campaign.google_campaign_id
      // For now, check if we have existing ad_keywords/ad_creatives to calculate basic metrics

      const { data: keywords } = await supabase
        .from("ad_keywords")
        .select("*")
        .eq("campaign_id", campaign.id)
        .eq("is_negative", false);

      const keywordCount = keywords?.length || 0;

      // Save a metrics snapshot
      await supabase.from("ad_metrics").insert({
        campaign_id: campaign.id,
        impressions: 0,
        clicks: 0,
        cost: 0,
        ctr: 0,
        conversions: 0,
      });

      // Log
      await supabase.from("ad_logs").insert({
        campaign_id: campaign.id,
        action: "metrics_collected",
        agent: "ads-metrics-collector",
        payload: {
          keywords_tracked: keywordCount,
          source: "placeholder",
          note: "Aguardando integração com Google Ads API para métricas reais",
        },
      });

      results.push({ campaign_id: campaign.id, name: campaign.business_name, keywords: keywordCount });
    }

    return new Response(JSON.stringify({ collected: results.length, campaigns: results }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
