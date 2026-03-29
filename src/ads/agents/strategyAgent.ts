import { supabase } from "@/integrations/supabase/client";
import type { AgentContext, StrategyResult } from "../types";

const SYSTEM_PROMPT = `Você é um estrategista sênior de Google Ads para negócios locais brasileiros.
Sua missão é definir a melhor estrutura de campanha para maximizar conversões locais.

REGRAS:
- Para verbas até R$500: apenas 1 campanha Search com keywords exatas
- Para verbas R$500-1500: 2 campanhas (principal + local)
- Para verbas acima de R$1500: 3 campanhas (principal + local + remarketing)
- Sempre priorizar horário comercial para negócios locais
- Bid strategy: Maximizar Conversões para verbas > R$1000, Maximizar Cliques para menores

RETORNE JSON puro (sem markdown):
{
  "campaign_type": "search",
  "targeting": { "location_radius": "", "schedule": "", "networks": "", "bid_strategy": "" },
  "budget_split": { "main_pct": 60, "local_pct": 30, "remarketing_pct": 10 },
  "reasoning": ""
}`;

export async function runStrategyAgent(ctx: AgentContext): Promise<StrategyResult> {
  const { data, error } = await supabase.functions.invoke("agent-ads", {
    body: {
      agent_type: "strategy",
      context: ctx,
      system_prompt: SYSTEM_PROMPT,
      user_prompt: `Defina a estratégia para: ${ctx.business_name}, nicho ${ctx.niche}, ${ctx.city}/${ctx.state}, verba R$${ctx.budget_monthly}/mês, objetivo: ${ctx.objective}, raio: ${ctx.radius}`,
    },
  });

  if (error) throw error;
  return data as StrategyResult;
}
