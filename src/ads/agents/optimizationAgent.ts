/**
 * OptimizationAgent — Sistema de decisão para otimização de campanhas.
 * Aplica regras determinísticas primeiro, depois consulta IA para decisões complexas.
 * Modo PASSIVO: sugere ações, NÃO executa automaticamente.
 */

import { supabase } from "@/integrations/supabase/client";
import type { OptimizationResult } from "../types";

export interface CampaignMetricsInput {
  campaign_id: string;
  campaign_name: string;
  budget_monthly: number;
  budget_spent: number;
  days_in_month: number;
  current_day: number;
  keywords: Array<{
    id: string;
    term: string;
    impressions: number;
    clicks: number;
    cpc: number;
    conversions: number;
    status: string;
  }>;
  ads: Array<{
    id: string;
    headline1: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
}

// Deterministic rules — these run BEFORE AI
function applyDeterministicRules(input: CampaignMetricsInput) {
  const actions: OptimizationResult["actions"] = [];
  const issues: OptimizationResult["issues_detected"] = [];

  // Rule 1: Budget pacing
  const expectedSpend = (input.budget_monthly / input.days_in_month) * input.current_day;
  const pacingRatio = input.budget_spent / expectedSpend;
  if (pacingRatio > 1.3) {
    issues.push({ type: "overspending", severity: "high", detail: `Gasto ${(pacingRatio * 100).toFixed(0)}% acima do esperado para o dia ${input.current_day}` });
    actions.push({ type: "pause_campaign", target: input.campaign_name, reason: `Overspending: R$${input.budget_spent.toFixed(2)} vs esperado R$${expectedSpend.toFixed(2)}`, expected_impact: "Evitar estouro de verba mensal", priority: 1 });
  }

  // Rule 2: Zero-click keywords (>100 impressions)
  for (const kw of input.keywords) {
    if (kw.status !== "active") continue;
    if (kw.impressions > 100 && kw.clicks === 0) {
      issues.push({ type: "zero_clicks", severity: "medium", detail: `"${kw.term}": ${kw.impressions} impressões, 0 cliques` });
      actions.push({ type: "pause_keyword", target: kw.term, reason: `0 cliques após ${kw.impressions} impressões`, expected_impact: "Eliminar desperdício de impressões", priority: 2 });
    }
  }

  // Rule 3: High CPC keywords (>2x average)
  const avgCpc = input.keywords.reduce((s, k) => s + k.cpc, 0) / Math.max(input.keywords.length, 1);
  for (const kw of input.keywords) {
    if (kw.cpc > avgCpc * 2 && kw.conversions === 0) {
      issues.push({ type: "high_cpc", severity: "medium", detail: `"${kw.term}": CPC R$${kw.cpc.toFixed(2)} (média: R$${avgCpc.toFixed(2)})` });
      actions.push({ type: "adjust_bid", target: kw.term, reason: `CPC ${(kw.cpc / avgCpc).toFixed(1)}x acima da média sem conversões`, expected_impact: "Reduzir custo sem perder conversões", priority: 3 });
    }
  }

  // Rule 4: Low CTR ads
  for (const ad of input.ads) {
    if (ad.impressions > 200 && ad.ctr < 0.5) {
      issues.push({ type: "low_ctr_ad", severity: "high", detail: `Ad "${ad.headline1}": CTR ${ad.ctr.toFixed(2)}%` });
      actions.push({ type: "create_ad", target: ad.headline1, reason: `CTR ${ad.ctr.toFixed(2)}% abaixo do mínimo (0.5%)`, expected_impact: "Nova variação pode melhorar CTR em 20-50%", priority: 2 });
    }
  }

  return { actions, issues };
}

function assessPerformance(input: CampaignMetricsInput): OptimizationResult["performance_level"] {
  const totalClicks = input.keywords.reduce((s, k) => s + k.clicks, 0);
  const totalImpr = input.keywords.reduce((s, k) => s + k.impressions, 0);
  const totalConv = input.keywords.reduce((s, k) => s + k.conversions, 0);
  const ctr = totalImpr > 0 ? (totalClicks / totalImpr) * 100 : 0;

  if (ctr > 3 && totalConv > 5) return "excellent";
  if (ctr > 1.5 && totalConv > 2) return "good";
  if (ctr > 0.5) return "needs_attention";
  return "critical";
}

const SYSTEM_PROMPT = `Você é um otimizador de Google Ads para negócios locais.
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

export async function runOptimizationAgent(input: CampaignMetricsInput): Promise<OptimizationResult> {
  // Step 1: Deterministic rules
  const { actions, issues } = applyDeterministicRules(input);
  const performanceLevel = assessPerformance(input);

  // Step 2: AI for complex pattern analysis (only if there's enough data)
  const totalImpressions = input.keywords.reduce((s, k) => s + k.impressions, 0);
  let aiSummary = "Dados insuficientes para análise avançada de IA.";
  let roiAssessment = "Aguardando mais dados para avaliar ROI.";

  if (totalImpressions > 500) {
    try {
      const { data, error } = await supabase.functions.invoke("agent-ads", {
        body: {
          agent_type: "optimization",
          system_prompt: SYSTEM_PROMPT,
          user_prompt: `
CAMPANHA: ${input.campaign_name}
VERBA: R$${input.budget_monthly}/mês, gasto: R$${input.budget_spent}
DIA DO MÊS: ${input.current_day}/${input.days_in_month}
PERFORMANCE: ${performanceLevel}

REGRAS JÁ APLICADAS: ${actions.length} ações
ISSUES DETECTADAS: ${issues.map(i => i.detail).join("; ")}

KEYWORDS: ${JSON.stringify(input.keywords.map(k => ({ t: k.term, imp: k.impressions, cl: k.clicks, cpc: k.cpc, conv: k.conversions })))}
ADS: ${JSON.stringify(input.ads.map(a => ({ h: a.headline1, imp: a.impressions, ctr: a.ctr })))}`,
        },
      });

      if (!error && data) {
        const aiActions = data.additional_actions || [];
        actions.push(...aiActions);
        aiSummary = data.summary || aiSummary;
        roiAssessment = data.roi_assessment || roiAssessment;
      }
    } catch {
      // AI failed — deterministic rules still apply
    }
  }

  // Sort by priority
  actions.sort((a, b) => (a.priority || 99) - (b.priority || 99));

  return {
    performance_level: performanceLevel,
    issues_detected: issues,
    actions,
    summary: aiSummary,
    roi_assessment: roiAssessment,
  };
}
