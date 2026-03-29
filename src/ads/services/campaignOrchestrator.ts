/**
 * Campaign Orchestrator
 * Executa o fluxo completo de criação de campanha usando os agentes IA:
 * 1. Constrói contexto
 * 2. Chama StrategyAgent
 * 3. Chama KeywordAgent
 * 4. Chama AdCopyAgent
 * 5. Salva tudo nas tabelas isoladas (ad_campaigns, ad_keywords, ad_creatives)
 * 6. Registra log
 */

import { supabase } from "@/integrations/supabase/client";
import { buildAgentContext } from "./contextEngine";
import type { AgentContext } from "../types";

interface OrchestratorInput {
  businessName: string;
  niche: string;
  city: string;
  state: string;
  budgetDaily: number;
  objective: string;
  radius: string;
}

export async function orchestrateCampaignCreation(input: OrchestratorInput) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  // Build full context
  const context = await buildAgentContext(user.id);

  // Build agent context for the AI calls
  const agentCtx: AgentContext = {
    business_name: input.businessName || context.business.name,
    niche: input.niche || context.business.niche,
    city: input.city || context.business.city,
    state: input.state || context.business.state,
    budget_monthly: input.budgetDaily * 30,
    objective: input.objective,
    radius: input.radius,
    products: context.business.products,
    differentials: context.business.differential,
    years_experience: context.business.years_experience,
    whatsapp: context.business.whatsapp || undefined,
    website_url: context.business.website_url || undefined,
  };

  // Enrich prompt with history if available
  const historyHint = context.history.paused_keywords.length
    ? `\nKeywords já pausadas anteriormente (evitar): ${context.history.paused_keywords.join(", ")}`
    : "";

  const bestHeadlinesHint = context.history.best_headlines.length
    ? `\nHeadlines com melhor performance: ${context.history.best_headlines.join(", ")}`
    : "";

  // Call all agents via the edge function
  const [strategyRes, keywordsRes, adCopyRes] = await Promise.all([
    supabase.functions.invoke("agent-ads", {
      body: {
        agent_type: "strategy",
        context: agentCtx,
        system_prompt: buildStrategyPrompt(context),
        user_prompt: `Defina estratégia para: ${agentCtx.business_name}, ${agentCtx.niche}, ${agentCtx.city}/${agentCtx.state}, verba R$${agentCtx.budget_monthly}/mês, objetivo: ${agentCtx.objective}${historyHint}`,
      },
    }),
    supabase.functions.invoke("agent-ads", {
      body: {
        agent_type: "keywords",
        context: agentCtx,
        system_prompt: buildKeywordPrompt(),
        user_prompt: `Gere keywords para: ${agentCtx.business_name}, ${agentCtx.niche}, ${agentCtx.city}, produtos: ${agentCtx.products || "não especificado"}${historyHint}`,
      },
    }),
    supabase.functions.invoke("agent-ads", {
      body: {
        agent_type: "adcopy",
        context: agentCtx,
        system_prompt: buildAdCopyPrompt(),
        user_prompt: `Crie anúncios para: ${agentCtx.business_name}, ${agentCtx.niche}, ${agentCtx.city}, diferenciais: ${agentCtx.differentials || "não especificado"}${bestHeadlinesHint}`,
      },
    }),
  ]);

  if (strategyRes.error) throw strategyRes.error;
  if (keywordsRes.error) throw keywordsRes.error;
  if (adCopyRes.error) throw adCopyRes.error;

  const strategy = strategyRes.data;
  const keywords = keywordsRes.data;
  const adCopy = adCopyRes.data;

  // Save campaign to ad_campaigns
  const { data: campaign, error: campErr } = await supabase.from("ad_campaigns").insert({
    user_id: user.id,
    business_name: input.businessName,
    niche: input.niche,
    city: input.city,
    budget_daily: input.budgetDaily,
    status: "draft",
    strategy_data: strategy,
    performance_score: 0,
  }).select().single();

  if (campErr) throw campErr;

  // Save keywords to ad_keywords
  const positiveKws = (keywords.high_intent_keywords || keywords.positives || []).slice(0, 30);
  const negativeKws = keywords.negative_keywords || keywords.negatives || {};

  if (positiveKws.length) {
    await supabase.from("ad_keywords").insert(
      positiveKws.map((k: any) => ({
        campaign_id: campaign.id,
        keyword: typeof k === "string" ? k : k.termo || k.keyword,
        match_type: typeof k === "string" ? "phrase" : k.match_type || "phrase",
        is_negative: false,
        status: "active",
      }))
    );
  }

  // Save negative keywords
  const allNegs = typeof negativeKws === "object" && !Array.isArray(negativeKws)
    ? Object.values(negativeKws).flat()
    : Array.isArray(negativeKws) ? negativeKws : [];

  if (allNegs.length) {
    await supabase.from("ad_keywords").insert(
      allNegs.slice(0, 50).map((k: any) => ({
        campaign_id: campaign.id,
        keyword: String(typeof k === "string" ? k : k.termo || k),
        match_type: "exact",
        is_negative: true,
        status: "active",
      }))
    );
  }

  // Save creatives to ad_creatives
  const ads = adCopy.ads || [];
  if (ads.length) {
    await supabase.from("ad_creatives").insert(
      ads.map((a: any) => ({
        campaign_id: campaign.id,
        headline1: a.headlines?.[0] || null,
        headline2: a.headlines?.[1] || null,
        headline3: a.headlines?.[2] || null,
        description: a.descriptions?.[0] || a.description || null,
        status: "draft",
      }))
    );
  }

  // Log the orchestration
  await supabase.from("ad_logs").insert({
    campaign_id: campaign.id,
    action: "orchestrated_creation",
    agent: "orchestrator",
    payload: {
      strategy_summary: strategy.reasoning || strategy.urgency_level,
      keywords_count: positiveKws.length,
      negatives_count: allNegs.length,
      ads_count: ads.length,
    },
  });

  return { campaign, strategy, keywords, adCopy };
}

function buildStrategyPrompt(ctx: ReturnType<typeof buildAgentContext> extends Promise<infer T> ? T : never) {
  return `Você é um estrategista sênior de Google Ads para negócios locais brasileiros.
Analise o contexto e defina a melhor estratégia.

CONTEXTO DO NEGÓCIO:
- Campanhas anteriores: ${ctx.performance.total_campaigns}
- CTR médio histórico: ${ctx.performance.avg_ctr.toFixed(2)}%
- CPC médio: R$${ctx.performance.avg_cpc.toFixed(2)}

RETORNE JSON puro:
{
  "urgency_level": "high|medium|low",
  "campaign_type": "search|display|local",
  "bidding_strategy": "maximize_conversions|maximize_clicks|target_cpa",
  "geo_radius_km": 10,
  "conversion_focus": "calls|website|directions",
  "reasoning": ""
}`;
}

function buildKeywordPrompt() {
  return `Você é especialista em keywords para Google Ads de negócios locais brasileiros.
Priorize intenção local e urgência. Use Exact e Phrase match.

RETORNE JSON puro:
{
  "high_intent_keywords": [{ "termo": "", "match_type": "exact|phrase", "intent": "alta|moderada" }],
  "negative_keywords": { "emprego": [], "diy": [], "fora_regiao": [], "preco_irrealista": [] }
}`;
}

function buildAdCopyPrompt() {
  return `Você é copywriter sênior de Google Ads para negócios locais.
Máx 30 chars por headline, 90 chars por description. Use cidade, CTA e prova social.

RETORNE JSON puro:
{
  "ads": [{ "headlines": ["h1","h2","h3"], "descriptions": ["desc1"] }]
}`;
}
