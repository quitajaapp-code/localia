/**
 * ADS-OPTIMIZER
 * Roda periodicamente. Analisa métricas e aplica decisões do OptimizationAgent.
 * - Pausa keywords com CTR baixo
 * - Ajusta lances
 * - Adiciona negativas
 * - Pausa campanha se gasto excessivo
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
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

  try {
    const body = await req.json().catch(() => ({}));
    const businessId = body.business_id;

    // Get active campaigns
    let query = supabase.from("campaigns").select("*").eq("status", "ativa");
    if (businessId) query = query.eq("business_id", businessId);

    const { data: campaigns } = await query;
    if (!campaigns?.length) {
      return new Response(JSON.stringify({ message: "Nenhuma campanha ativa" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = [];

    for (const campaign of campaigns) {
      // Get keywords and ads
      const [kwRes, adRes] = await Promise.all([
        supabase.from("keywords").select("*").eq("campaign_id", campaign.id).eq("status", "ativa"),
        supabase.from("ads").select("*").eq("campaign_id", campaign.id),
      ]);

      const keywords = kwRes.data || [];
      const ads = adRes.data || [];

      // Auto-optimization rules (no AI needed for simple rules)
      const actions: Array<{ type: string; target: string; reason: string }> = [];

      // Rule 1: Pause keywords with 0 clicks and > 100 impressions
      for (const kw of keywords) {
        if ((kw.impressoes || 0) > 100 && (kw.cliques || 0) === 0) {
          await supabase.from("keywords").update({ status: "pausada" }).eq("id", kw.id);
          actions.push({ type: "pause_keyword", target: kw.termo, reason: "0 cliques com 100+ impressões" });
        }
      }

      // Rule 2: Auto-pause if spending > 90% of budget
      const spent = (campaign.verba_mensal || 0) - (campaign.verba_restante || 0);
      const dayOfMonth = new Date().getDate();
      if (dayOfMonth < 20 && spent > (campaign.verba_mensal || 0) * 0.9) {
        await supabase.from("campaigns").update({ status: "pausada" }).eq("id", campaign.id);
        actions.push({ type: "pause_campaign", target: campaign.nome, reason: "Gasto > 90% da verba antes do dia 20" });
      }

      // Rule 3: CTR check - if campaign CTR < 0.5% after significant impressions
      const totalImpr = keywords.reduce((s: number, k: any) => s + (k.impressoes || 0), 0);
      const totalClicks = keywords.reduce((s: number, k: any) => s + (k.cliques || 0), 0);
      const campaignCtr = totalImpr > 500 ? (totalClicks / totalImpr) * 100 : null;

      if (campaignCtr !== null && campaignCtr < 0.5) {
        actions.push({ type: "alert_low_ctr", target: campaign.nome, reason: `CTR campanha: ${campaignCtr.toFixed(2)}% (abaixo de 0.5%)` });
      }

      // Log all actions
      if (actions.length) {
        await supabase.from("ad_logs").insert({
          campaign_id: campaign.id,
          action: "auto_optimization",
          agent: "ads-optimizer",
          payload: { actions, timestamp: new Date().toISOString() },
        });
      }

      results.push({ campaign: campaign.nome, actions_taken: actions.length, actions });
    }

    return new Response(JSON.stringify({ optimized: results.length, results }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
