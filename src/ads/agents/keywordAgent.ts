/**
 * KeywordAgent — Sistema de decisão para seleção de keywords de alta conversão.
 * Aplica regras de filtragem e classificação antes de chamar IA.
 */

import { supabase } from "@/integrations/supabase/client";
import type { FullAgentContext, KeywordResult } from "../types";

// Pre-filter: universal negative keywords every local business needs
const UNIVERSAL_NEGATIVES = {
  employment: ["vaga", "emprego", "trabalhar", "salário", "contratando", "carreira", "estágio", "freelancer"],
  diy_educational: ["como fazer", "tutorial", "curso", "apostila", "faculdade", "graduação", "pdf", "grátis"],
  unrealistic_price: ["barato demais", "de graça", "0800"],
};

function estimateCPC(niche: string, urgency: string): { min: number; max: number } {
  const isUrgent = urgency === "high";
  const nicheL = niche.toLowerCase();

  if (["advogado", "médico", "dentista", "clínica"].some(n => nicheL.includes(n)))
    return isUrgent ? { min: 4, max: 12 } : { min: 3, max: 8 };
  if (["encanador", "eletricista", "chaveiro", "desentupidor"].some(n => nicheL.includes(n)))
    return isUrgent ? { min: 2, max: 6 } : { min: 1.5, max: 4 };
  return isUrgent ? { min: 1.5, max: 5 } : { min: 1, max: 3 };
}

const SYSTEM_PROMPT = `Você é um especialista em pesquisa de palavras-chave para Google Ads de negócios locais brasileiros.
Você NÃO gera texto. Você SELECIONA termos com base em INTENÇÃO DE COMPRA.

REGRAS OBRIGATÓRIAS:
1. TODA keyword deve ter intenção transacional ou de urgência — NUNCA informacional
2. Incluir cidade/bairro em pelo menos 50% das keywords
3. Incluir termos de urgência se o nicho for urgente (ex: "24 horas", "emergência", "agora")
4. Usar EXACT match para termos de alta intenção, PHRASE match para variações
5. Máximo 25 keywords positivas, máximo 40 negativas por categoria
6. Estimar CPC baseado no nicho e região

RETORNE JSON puro:
{
  "high_intent_keywords": [
    { "term": "encanador em [cidade]", "match_type": "exact", "intent": "alta", "urgency": true, "estimated_cpc": 3.5 }
  ],
  "negative_keywords": {
    "employment": [],
    "diy_educational": [],
    "out_of_region": [],
    "unrealistic_price": [],
    "competitors": []
  }
}`;

export async function runKeywordAgent(
  ctx: FullAgentContext,
  urgencyLevel: string,
): Promise<KeywordResult> {
  const cpcRange = estimateCPC(ctx.business.niche, urgencyLevel);

  const contextSummary = `
NEGÓCIO: ${ctx.business.name}, nicho: ${ctx.business.niche}
LOCALIZAÇÃO: ${ctx.business.city}/${ctx.business.state}
PRODUTOS/SERVIÇOS: ${ctx.business.products || "não especificado"}
URGÊNCIA DO NICHO: ${urgencyLevel}
CPC ESTIMADO: R$${cpcRange.min}-${cpcRange.max}

HISTÓRICO DE KEYWORDS:
- Keywords que já funcionaram: ${ctx.performance.best_performing_keywords.join(", ") || "nenhuma"}
- Keywords já pausadas (EVITAR): ${ctx.history.paused_keywords.join(", ") || "nenhuma"}

NEGATIVAS UNIVERSAIS JÁ APLICADAS (não repetir):
${JSON.stringify(UNIVERSAL_NEGATIVES)}

Gere keywords NOVAS que complementem o histórico. Foque em intenção de compra imediata.`;

  const { data, error } = await supabase.functions.invoke("agent-ads", {
    body: {
      agent_type: "keywords",
      system_prompt: SYSTEM_PROMPT,
      user_prompt: contextSummary,
    },
  });

  if (error) throw error;

  const result = data as KeywordResult;

  // Post-process: merge universal negatives
  if (result.negative_keywords) {
    result.negative_keywords.employment = [
      ...new Set([...UNIVERSAL_NEGATIVES.employment, ...(result.negative_keywords.employment || [])]),
    ];
    result.negative_keywords.diy_educational = [
      ...new Set([...UNIVERSAL_NEGATIVES.diy_educational, ...(result.negative_keywords.diy_educational || [])]),
    ];
    result.negative_keywords.unrealistic_price = [
      ...new Set([...UNIVERSAL_NEGATIVES.unrealistic_price, ...(result.negative_keywords.unrealistic_price || [])]),
    ];
  }

  return result;
}
