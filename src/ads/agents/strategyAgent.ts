/**
 * StrategyAgent — Sistema de decisão estratégica para campanhas Google Ads locais.
 * NÃO é um gerador de texto. Toma decisões baseadas em regras + contexto + IA.
 */

import { supabase } from "@/integrations/supabase/client";
import type { FullAgentContext, StrategyResult } from "../types";

// Decision rules applied BEFORE calling AI
function applyBudgetRules(budgetMonthly: number) {
  if (budgetMonthly <= 500) {
    return {
      max_campaigns: 1,
      bidding: "maximize_clicks" as const,
      networks: "search_only",
      budget_split: { main_pct: 100, local_pct: 0, remarketing_pct: 0 },
    };
  }
  if (budgetMonthly <= 1500) {
    return {
      max_campaigns: 2,
      bidding: "maximize_clicks" as const,
      networks: "search_only",
      budget_split: { main_pct: 70, local_pct: 30, remarketing_pct: 0 },
    };
  }
  return {
    max_campaigns: 3,
    bidding: "maximize_conversions" as const,
    networks: "search_display",
    budget_split: { main_pct: 60, local_pct: 25, remarketing_pct: 15 },
  };
}

function classifyUrgency(niche: string): "high" | "medium" | "low" {
  const urgentNiches = ["encanador", "eletricista", "chaveiro", "desentupidor", "reboque", "emergência", "urgente", "24h", "veterinário", "dentista emergência"];
  const mediumNiches = ["dentista", "médico", "advogado", "mecânico", "pet shop", "clínica", "restaurante"];
  const nicheL = niche.toLowerCase();
  if (urgentNiches.some(n => nicheL.includes(n))) return "high";
  if (mediumNiches.some(n => nicheL.includes(n))) return "medium";
  return "low";
}

function determineSchedule(urgency: "high" | "medium" | "low"): string {
  if (urgency === "high") return "24/7 — serviço de urgência";
  if (urgency === "medium") return "Seg-Sáb 7h-20h";
  return "Seg-Sex 8h-18h";
}

const SYSTEM_PROMPT = `Você é um estrategista sênior de Google Ads para negócios locais brasileiros.
Você NÃO gera texto criativo. Você TOMA DECISÕES ESTRATÉGICAS baseadas em dados.

REGRAS DE DECISÃO:
1. Analise urgência do serviço → define schedule e bidding
2. Analise ticket médio → define CPA máximo aceitável
3. Analise concorrência local → define raio geográfico
4. Analise histórico → ajuste estratégia baseado em performance passada

RETORNE JSON puro (sem markdown):
{
  "urgency_level": "high|medium|low",
  "search_intent": "transactional|urgent|exploratory",
  "campaign_type": "search|local|performance_max",
  "bidding_strategy": "maximize_conversions|maximize_clicks|target_cpa|manual_cpc",
  "geo_radius_km": 10,
  "conversion_focus": "calls|website|directions|whatsapp",
  "risk_level": "low|medium|high",
  "reasoning": "explicação da decisão em 2-3 frases",
  "schedule": "horário recomendado",
  "budget_split": { "main_pct": 60, "local_pct": 30, "remarketing_pct": 10 }
}`;

export async function runStrategyAgent(
  ctx: FullAgentContext,
  budgetMonthly: number,
  objective: string,
): Promise<StrategyResult> {
  // Pre-compute decision rules
  const budgetRules = applyBudgetRules(budgetMonthly);
  const urgency = classifyUrgency(ctx.business.niche);
  const schedule = determineSchedule(urgency);

  const contextSummary = `
NEGÓCIO: ${ctx.business.name}, nicho: ${ctx.business.niche}, ${ctx.business.city}/${ctx.business.state}
DIFERENCIAIS: ${ctx.business.differential || "não informado"}
PÚBLICO-ALVO: ${ctx.business.target_audience || "não informado"}
VERBA: R$${budgetMonthly}/mês
OBJETIVO: ${objective}

PRÉ-ANÁLISE DO SISTEMA:
- Urgência classificada: ${urgency}
- Schedule sugerido: ${schedule}
- Bidding sugerido: ${budgetRules.bidding}
- Max campanhas: ${budgetRules.max_campaigns}
- Budget split: ${JSON.stringify(budgetRules.budget_split)}

HISTÓRICO:
- Campanhas anteriores: ${ctx.performance.total_campaigns}
- CTR médio: ${ctx.performance.avg_ctr.toFixed(2)}%
- CPC médio: R$${ctx.performance.avg_cpc.toFixed(2)}
- Conversões totais: ${ctx.performance.total_conversions}
- Keywords pausadas: ${ctx.history.paused_keywords.length > 0 ? ctx.history.paused_keywords.join(", ") : "nenhuma"}

Valide ou ajuste as decisões pré-computadas baseado no contexto completo.`;

  const { data, error } = await supabase.functions.invoke("agent-ads", {
    body: {
      agent_type: "strategy",
      system_prompt: SYSTEM_PROMPT,
      user_prompt: contextSummary,
    },
  });

  if (error) throw error;
  return data as StrategyResult;
}
