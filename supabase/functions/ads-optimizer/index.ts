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

function safeParseJSON(content: string): Record<string, unknown> {
  if (!content?.trim()) return {};
  let cleaned = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  try { return JSON.parse(cleaned); } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) try { return JSON.parse(match[0]); } catch { /* noop */ }
  }
  return {};
}

const OPTIMIZATION_SYSTEM_PROMPT = `Você é um otimizador de Google Ads para negócios locais.
Analise os dados e as regras já aplicadas pelo sistema. Adicione insights que as regras determinísticas não cobrem.

Foque em:
1. Padrões de comportamento do usuário
2. Oportunidades de novas keywords baseadas em termos de busca
3. Ajustes de schedule baseados em performance por horário
4. Recomendações de landing page

RETORNE JSON puro:
{
  "additional_actions": [
    { "type": "add_negative|change_schedule|increase_budget", "target": "", "reason": "", "expected_impact": "", "priority": 4 }
  ],
  "roi_assessment": "análise breve do ROI atual",
  "summary": "resumo em 2-3 frases"
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

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
      const [kwRes, metricsRes, creativesRes] = await Promise.all([
        supabase.from("ad_keywords").select("*").eq("campaign_id", campaign.id).eq("is_negative", false),
        supabase.from("ad_metrics").select("*").eq("campaign_id", campaign.id).order("created_at", { ascending: false }).limit(30),
        supabase.from("ad_creatives").select("*").eq("campaign_id", campaign.id),
      ]);

      const keywords = kwRes.data || [];
      const metrics = metricsRes.data || [];
      const creatives = creativesRes.data || [];

      const totalSpent = metrics.reduce((s: number, m: any) => s + (m.cost || 0), 0);
      const budgetMonthly = (campaign.budget_daily || 0) * 30;

      // Deterministic rules
      const actions: Array<{ type: string; target: string; reason: string; expected_impact?: string; priority: number }> = [];
      const issues: Array<{ type: string; severity: string; detail: string }> = [];

      // Rule 1: Budget pacing
      const expectedSpend = (budgetMonthly / daysInMonth) * currentDay;
      if (totalSpent > expectedSpend * 1.3 && currentDay < 20) {
        actions.push({ type: "pause_campaign", target: campaign.business_name, reason: `Overspending: R$${totalSpent.toFixed(2)} vs esperado R$${expectedSpend.toFixed(2)}`, expected_impact: "Evitar estouro de verba", priority: 1 });
        issues.push({ type: "overspending", severity: "high", detail: `Gasto acima do esperado` });
      }

      // Rule 2: Zero-click keywords
      const campImpr = metrics.reduce((s: number, m: any) => s + (m.impressions || 0), 0);
      const campClicks = metrics.reduce((s: number, m: any) => s + (m.clicks || 0), 0);

      for (const kw of keywords) {
        if (kw.status !== "active") continue;
        if (campImpr > 100 && campClicks === 0) {
          actions.push({ type: "pause_keyword", target: kw.keyword, reason: "0 cliques após 100+ impressões", expected_impact: "Eliminar desperdício", priority: 2 });
        }
      }

      // Rule 3: Low CTR campaign
      const campCtr = campImpr > 500 ? (campClicks / campImpr) * 100 : null;

      if (campCtr !== null && campCtr < 0.5) {
        actions.push({ type: "create_ad", target: campaign.business_name, reason: `CTR campanha: ${campCtr.toFixed(2)}%`, expected_impact: "Nova variação pode melhorar CTR", priority: 2 });
        issues.push({ type: "low_ctr", severity: "high", detail: `CTR ${campCtr.toFixed(2)}% abaixo do mínimo` });
      }

      // Rule 4: High CPC without conversions
      const totalConv = metrics.reduce((s: number, m: any) => s + (m.conversions || 0), 0);
      const avgCpc = campClicks > 0 ? totalSpent / campClicks : 0;
      if (avgCpc > 8 && totalConv === 0 && campClicks > 20) {
        issues.push({ type: "high_cpc_no_conv", severity: "high", detail: `CPC R$${avgCpc.toFixed(2)} sem conversões` });
        actions.push({ type: "adjust_bid", target: campaign.business_name, reason: `CPC alto (R$${avgCpc.toFixed(2)}) sem conversões`, expected_impact: "Reduzir custo por clique", priority: 1 });
      }

      // Assess performance level
      let performanceLevel = "needs_attention";
      if (campCtr && campCtr > 3 && totalConv > 5) performanceLevel = "excellent";
      else if (campCtr && campCtr > 1.5 && totalConv > 2) performanceLevel = "good";
      else if (campCtr !== null && campCtr < 0.5) performanceLevel = "critical";

      // AI analysis for complex patterns (only with sufficient data)
      let aiSummary = "Dados insuficientes para análise avançada.";
      let roiAssessment = "Aguardando mais dados.";

      if (campImpr > 500 && LOVABLE_API_KEY) {
        try {
          const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: OPTIMIZATION_SYSTEM_PROMPT },
                { role: "user", content: `CAMPANHA: ${campaign.business_name}\nVERBA: R$${budgetMonthly}/mês, gasto: R$${totalSpent}\nDIA: ${currentDay}/${daysInMonth}\nPERFORMANCE: ${performanceLevel}\nREGRAS APLICADAS: ${actions.length} ações\nISSUES: ${issues.map(i => i.detail).join("; ")}\nKEYWORDS: ${keywords.length} ativas\nMÉTRICAS: imp=${campImpr}, clicks=${campClicks}, ctr=${campCtr?.toFixed(2) || "N/A"}, conv=${totalConv}` },
              ],
              temperature: 0.2,
              max_tokens: 2000,
            }),
          });
          const aiData = await aiRes.json();
          const aiContent = aiData.choices?.[0]?.message?.content || "{}";
          const aiParsed = safeParseJSON(aiContent);
          if (Array.isArray(aiParsed.additional_actions)) actions.push(...aiParsed.additional_actions as any[]);
          if (aiParsed.summary) aiSummary = String(aiParsed.summary);
          if (aiParsed.roi_assessment) roiAssessment = String(aiParsed.roi_assessment);
        } catch {
          // AI failed — deterministic rules still apply
        }
      }

      // Sort by priority
      actions.sort((a, b) => (a.priority || 99) - (b.priority || 99));

      // Log decisions
      await supabase.from("ad_logs").insert({
        campaign_id: campaign.id,
        action: "optimization_analysis",
        agent: "ads-optimizer",
        payload: {
          performance_level: performanceLevel,
          issues_detected: issues,
          actions_suggested: actions,
          metrics_snapshot: { impressions: campImpr, clicks: campClicks, ctr: campCtr, spent: totalSpent, conversions: totalConv, avg_cpc: avgCpc },
          ai_summary: aiSummary,
          roi_assessment: roiAssessment,
          timestamp: new Date().toISOString(),
        },
      });

      results.push({
        campaign: campaign.business_name,
        performance_level: performanceLevel,
        actions_suggested: actions.length,
        issues: issues.length,
        summary: aiSummary,
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
