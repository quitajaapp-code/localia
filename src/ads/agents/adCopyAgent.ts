import { supabase } from "@/integrations/supabase/client";
import type { AgentContext, AdCopyResult } from "../types";

const SYSTEM_PROMPT = `Você é um copywriter sênior de Google Ads para negócios locais brasileiros.

REGRAS DE COPY:
- Headlines: máx 30 caracteres (HARD LIMIT do Google)
- Descriptions: máx 90 caracteres (HARD LIMIT do Google)
- Inclua cidade/bairro em pelo menos 3 headlines
- Use números reais: "Desde 2015", "+500 clientes", "Em 48h"
- CTA nos últimos 3 headlines: "Ligue Agora", "WhatsApp 24h", "Agende Online"
- Gere 2-3 variações de anúncio

RETORNE JSON puro:
{
  "ads": [{
    "headlines": ["headline1", "headline2", ...até 15],
    "descriptions": ["desc1", "desc2", ...até 4]
  }]
}`;

export async function runAdCopyAgent(ctx: AgentContext): Promise<AdCopyResult> {
  const { data, error } = await supabase.functions.invoke("agent-ads", {
    body: {
      agent_type: "adcopy",
      context: ctx,
      system_prompt: SYSTEM_PROMPT,
      user_prompt: `Crie anúncios para: ${ctx.business_name}, nicho ${ctx.niche}, ${ctx.city}/${ctx.state}, diferenciais: ${ctx.differentials || "não especificado"}, experiência: ${ctx.years_experience || "não informado"}`,
    },
  });

  if (error) throw error;
  return data as AdCopyResult;
}
