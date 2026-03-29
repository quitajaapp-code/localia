/**
 * AdCopyAgent — Sistema de decisão para criação de anúncios de alta conversão.
 * Aplica validação de caracteres e regras de copywriting antes e depois da IA.
 */

import { supabase } from "@/integrations/supabase/client";
import type { FullAgentContext, AdCopyResult } from "../types";

// Google Ads hard limits
const MAX_HEADLINE_CHARS = 30;
const MAX_DESCRIPTION_CHARS = 90;

function selectCTAs(hasWhatsapp: boolean, hasWebsite: boolean): string[] {
  const ctas: string[] = [];
  if (hasWhatsapp) ctas.push("WhatsApp Agora", "Fale pelo WhatsApp");
  if (hasWebsite) ctas.push("Visite o Site", "Orçamento Online");
  ctas.push("Ligue Agora", "Agende Hoje");
  return ctas.slice(0, 3);
}

function buildSocialProof(ctx: FullAgentContext): string {
  const proofs: string[] = [];
  if (ctx.business.years_experience) proofs.push(`Desde ${new Date().getFullYear() - parseInt(ctx.business.years_experience)} — ${ctx.business.years_experience} anos`);
  if (ctx.performance.total_conversions > 0) proofs.push(`+${ctx.performance.total_conversions} clientes atendidos`);
  return proofs.length ? `Provas sociais disponíveis: ${proofs.join(", ")}` : "Sem prova social disponível — usar benefícios diretos";
}

// Post-validation: truncate anything over limits
function validateAds(ads: AdCopyResult["ads"]): AdCopyResult["ads"] {
  return ads.map(ad => ({
    ...ad,
    headline1: (ad.headline1 || "").slice(0, MAX_HEADLINE_CHARS),
    headline2: (ad.headline2 || "").slice(0, MAX_HEADLINE_CHARS),
    headline3: (ad.headline3 || "").slice(0, MAX_HEADLINE_CHARS),
    description: (ad.description || "").slice(0, MAX_DESCRIPTION_CHARS),
  }));
}

const SYSTEM_PROMPT = `Você é um copywriter sênior de Google Ads para negócios locais brasileiros.
Você cria anúncios de ALTA CONVERSÃO seguindo regras rígidas.

REGRAS OBRIGATÓRIAS:
1. Headlines: MÁXIMO 30 caracteres (HARD LIMIT — conte CADA caractere)
2. Descriptions: MÁXIMO 90 caracteres (HARD LIMIT)
3. Headline 1: benefício principal + cidade
4. Headline 2: diferencial ou prova social
5. Headline 3: CTA direto (Ligue, WhatsApp, Agende)
6. Description: benefício + diferencial + CTA com urgência
7. Gere EXATAMENTE 3 variações de anúncio
8. Use localização explícita em pelo menos 2 headlines por anúncio

RETORNE JSON puro:
{
  "ads": [
    {
      "headline1": "máx 30 chars",
      "headline2": "máx 30 chars",
      "headline3": "máx 30 chars",
      "description": "máx 90 chars",
      "targeting_rationale": "breve explicação de por que este anúncio funciona"
    }
  ]
}`;

export async function runAdCopyAgent(
  ctx: FullAgentContext,
  urgencyLevel: string,
): Promise<AdCopyResult> {
  const ctas = selectCTAs(!!ctx.business.whatsapp, !!ctx.business.website_url);
  const socialProof = buildSocialProof(ctx);

  const contextSummary = `
NEGÓCIO: ${ctx.business.name}, nicho: ${ctx.business.niche}
CIDADE: ${ctx.business.city}
DIFERENCIAIS: ${ctx.business.differential || "não especificado"}
URGÊNCIA: ${urgencyLevel}

${socialProof}

CTAs PRIORITÁRIOS (escolha os melhores): ${ctas.join(", ")}

HEADLINES COM MELHOR PERFORMANCE NO PASSADO:
${ctx.history.best_headlines.length ? ctx.history.best_headlines.join(", ") : "Nenhum histórico — criar do zero"}

LEMBRE: Conte CADA caractere. Headline máx 30, Description máx 90.`;

  const { data, error } = await supabase.functions.invoke("agent-ads", {
    body: {
      agent_type: "adcopy",
      system_prompt: SYSTEM_PROMPT,
      user_prompt: contextSummary,
    },
  });

  if (error) throw error;

  const result = data as AdCopyResult;

  // Post-validate character limits
  result.ads = validateAds(result.ads);

  return result;
}
