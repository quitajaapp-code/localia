import { supabase } from "@/integrations/supabase/client";
import type { OptimizationResult } from "../types";

const SYSTEM_PROMPT = `Você é um otimizador de Google Ads para negócios locais brasileiros.

REGRAS DE OTIMIZAÇÃO:
1. CTR < 1% por 7 dias → pausar keyword
2. CPC > 2x média do nicho → reduzir lance
3. Keyword sem cliques em 14 dias → pausar
4. Search term irrelevante recorrente → adicionar como negativa
5. Se gasto > 80% da verba antes de metade do mês → pausar campanha
6. Se CTR campanha < 0.5% → criar nova variação de anúncio

RETORNE JSON puro:
{
  "actions": [{
    "type": "pause_keyword|adjust_bid|add_negative|pause_campaign|create_ad",
    "target_id": "",
    "reason": "",
    "expected_impact": "",
    "params": {}
  }],
  "summary": ""
}`;

export interface OptimizationInput {
  campaign_id: string;
  campaign_name: string;
  budget_monthly: number;
  budget_spent: number;
  keywords: Array<{
    id: string;
    termo: string;
    impressoes: number;
    cliques: number;
    cpc: number;
    conversoes: number;
    status: string;
  }>;
  ads: Array<{
    id: string;
    impressoes: number;
    cliques: number;
    ctr: number;
  }>;
  days_in_period: number;
}

export async function runOptimizationAgent(input: OptimizationInput): Promise<OptimizationResult> {
  const { data, error } = await supabase.functions.invoke("agent-ads", {
    body: {
      agent_type: "optimization",
      system_prompt: SYSTEM_PROMPT,
      user_prompt: `Analise e otimize a campanha "${input.campaign_name}":
Verba: R$${input.budget_monthly}/mês, Gasto até agora: R$${input.budget_spent}
Keywords: ${JSON.stringify(input.keywords)}
Anúncios: ${JSON.stringify(input.ads)}
Período: ${input.days_in_period} dias`,
    },
  });

  if (error) throw error;
  return data as OptimizationResult;
}
