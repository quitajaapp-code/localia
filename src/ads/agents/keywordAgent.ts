import { supabase } from "@/integrations/supabase/client";
import type { AgentContext, KeywordResult } from "../types";

const SYSTEM_PROMPT = `Você é especialista em pesquisa de palavras-chave para Google Ads de negócios locais brasileiros.

PRINCÍPIOS:
1. INTENÇÃO LOCAL: priorizar keywords com "perto de mim", "em [cidade]", bairro
2. MATCH TYPE: começar com Exact e Phrase — Broad desperdiça verba
3. NEGATIVOS: emprego, DIY, educacional, fora da região, preço irrealista
4. Máximo 30 keywords positivas, 50 negativas

RETORNE JSON puro:
{
  "positives": [{ "termo": "", "match_type": "exact|phrase", "intent": "alta|moderada|branding", "cpc_estimado": 0 }],
  "negatives": {
    "emprego": [],
    "diy_educacional": [],
    "fora_da_regiao": [],
    "preco_irrealista": []
  }
}`;

export async function runKeywordAgent(ctx: AgentContext): Promise<KeywordResult> {
  const { data, error } = await supabase.functions.invoke("agent-ads", {
    body: {
      agent_type: "keywords",
      context: ctx,
      system_prompt: SYSTEM_PROMPT,
      user_prompt: `Gere keywords para: ${ctx.business_name}, nicho ${ctx.niche}, ${ctx.city}/${ctx.state}, produtos: ${ctx.products || "não especificado"}`,
    },
  });

  if (error) throw error;
  return data as KeywordResult;
}
