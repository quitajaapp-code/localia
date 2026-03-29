/**
 * ADS-SYNC
 * Sincroniza dados com Google Ads (placeholder).
 * Quando a API estiver disponível, puxará métricas reais.
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
    const businessId = body.business_id;

    if (!businessId) throw new Error("business_id é obrigatório");

    // Get active campaigns
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("*")
      .eq("business_id", businessId)
      .in("status", ["ativa", "pausada"]);

    if (!campaigns?.length) {
      return new Response(JSON.stringify({ message: "Nenhuma campanha para sincronizar" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Future: Pull real metrics from Google Ads API
    // For now, log the sync attempt
    for (const campaign of campaigns) {
      await supabase.from("ad_logs").insert({
        campaign_id: campaign.id,
        action: "sync_attempted",
        agent: "ads-sync",
        payload: {
          note: "Aguardando integração com Google Ads API",
          timestamp: new Date().toISOString(),
        },
      });
    }

    return new Response(JSON.stringify({
      synced: campaigns.length,
      status: "simulated",
      message: "Sincronização preparada. Integração com Google Ads API pendente.",
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
