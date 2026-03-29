/**
 * ADS-OPTIMIZER Edge Function
 * Roda periodicamente. Aplica regras determinísticas + análise IA.
 * Salva decisões em ad_logs (modo passivo — não executa ações automaticamente).
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
    const campaignId = body.campaign_id;

    // Get active campaigns
    let query = supabase.from("ad_campaigns").select("*").eq("status", "active");
    if (campaignId) query = query.eq("id", campaignId);

    const { data: campaigns } = await query;
    if (!campaigns?.length) {
      return new Response(JSON.stringify({ message: "Nenhuma campanha ativa" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = [];
    const currentDay = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

    for (const campaign of campaigns) {
      // Fetch keywords and metrics
      const [kwRes, metricsRes, creativesRes] = await Promise.all([
        supabase.from("ad_keywords").select("*").eq("campaign_id", campaign.id).eq("is_negative", false),
        supabase.from("ad_metrics").select("*").eq("campaign_id", campaign.id).order("created_at", { ascending: false }).limit(30),
        supabase.from("ad_creatives").select("*").eq("campaign_id", campaign.id),
      ]);

      const keywords = kwRes.data || [];
      const metrics = metricsRes.data || [];
      const creatives = creativesRes.data || [];

      // Calculate totals
      const totalSpent = metrics.reduce((s: number, m: any) => s + (m.cost || 0), 0);
      const budgetMonthly = (campaign.budget_daily || 0) * 30;

      // Deterministic rules
      const actions: Array<{ type: string; target: string; reason: string; priority: number }> = [];
      const issues: Array<{ type: string; severity: string; detail: string }> = [];

      // Rule 1: Budget pacing
      const expectedSpend = (budgetMonthly / daysInMonth) * currentDay;
      if (totalSpent > expectedSpend * 1.3 && currentDay < 20) {
        actions.push({ type: "pause_campaign", target: campaign.business_name, reason: `Overspending: R$${totalSpent.toFixed(2)} vs esperado R$${expectedSpend.toFixed(2)}`, priority: 1 });
        issues.push({ type: "overspending", severity: "high", detail: `Gasto acima do esperado` });
      }

      // Rule 2: Zero-click keywords
      for (const kw of keywords) {
        const kwMetrics = metrics.filter((m: any) => m.campaign_id === campaign.id);
        const totalImpr = kwMetrics.reduce((s: number, m: any) => s + (m.impressions || 0), 0);
        const totalClicks = kwMetrics.reduce((s: number, m: any) => s + (m.clicks || 0), 0);

        if (totalImpr > 100 && totalClicks === 0) {
          actions.push({ type: "pause_keyword", target: kw.keyword, reason: "0 cliques após 100+ impressões", priority: 2 });
        }
      }

      // Rule 3: Low CTR campaign
      const campImpr = metrics.reduce((s: number, m: any) => s + (m.impressions || 0), 0);
      const campClicks = metrics.reduce((s: number, m: any) => s + (m.clicks || 0), 0);
      const campCtr = campImpr > 500 ? (campClicks / campImpr) * 100 : null;

      if (campCtr !== null && campCtr < 0.5) {
        actions.push({ type: "create_ad", target: campaign.business_name, reason: `CTR campanha: ${campCtr.toFixed(2)}%`, priority: 2 });
        issues.push({ type: "low_ctr", severity: "high", detail: `CTR ${campCtr.toFixed(2)}% abaixo do mínimo` });
      }

      // Assess performance level
      let performanceLevel = "needs_attention";
      if (campCtr && campCtr > 3) performanceLevel = "excellent";
      else if (campCtr && campCtr > 1.5) performanceLevel = "good";
      else if (campCtr !== null && campCtr < 0.5) performanceLevel = "critical";

      // Log decisions
      if (actions.length || issues.length) {
        await supabase.from("ad_logs").insert({
          campaign_id: campaign.id,
          action: "optimization_analysis",
          agent: "ads-optimizer",
          payload: {
            performance_level: performanceLevel,
            issues_detected: issues,
            actions_suggested: actions,
            metrics_snapshot: { impressions: campImpr, clicks: campClicks, ctr: campCtr, spent: totalSpent },
            timestamp: new Date().toISOString(),
          },
        });
      }

      results.push({
        campaign: campaign.business_name,
        performance_level: performanceLevel,
        actions_suggested: actions.length,
        issues: issues.length,
      });
    }

    return new Response(JSON.stringify({ analyzed: results.length, results }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
