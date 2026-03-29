/**
 * Campaign Orchestrator — Executa o fluxo completo de criação de campanha.
 * 1. Constrói contexto (Context Engine)
 * 2. Roda StrategyAgent (decisão estratégica)
 * 3. Roda KeywordAgent (seleção de keywords usando urgência da estratégia)
 * 4. Roda AdCopyAgent (criação de anúncios usando contexto completo)
 * 5. Salva tudo nas tabelas isoladas
 * 6. Registra log de decisões
 */

import { supabase } from "@/integrations/supabase/client";
import { buildAgentContext } from "./contextEngine";
import { runStrategyAgent } from "../agents/strategyAgent";
import { runKeywordAgent } from "../agents/keywordAgent";
import { runAdCopyAgent } from "../agents/adCopyAgent";

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

  // Step 1: Build full context
  const context = await buildAgentContext(user.id);

  // Override with form input if provided
  if (input.businessName) context.business.name = input.businessName;
  if (input.niche) context.business.niche = input.niche;
  if (input.city) context.business.city = input.city;
  if (input.state) context.business.state = input.state;

  const budgetMonthly = input.budgetDaily * 30;

  // Step 2: Strategy Agent (decides urgency, bidding, focus)
  const strategy = await runStrategyAgent(context, budgetMonthly, input.objective);

  // Step 3: Keyword Agent (uses urgency from strategy)
  const keywords = await runKeywordAgent(context, strategy.urgency_level);

  // Step 4: AdCopy Agent (uses full context + urgency)
  const adCopy = await runAdCopyAgent(context, strategy.urgency_level);

  // Step 5: Save to isolated tables
  const { data: campaign, error: campErr } = await supabase.from("ad_campaigns").insert([{
    user_id: user.id,
    business_name: context.business.name,
    niche: context.business.niche,
    city: context.business.city,
    budget_daily: input.budgetDaily,
    status: "draft",
    strategy_data: strategy as unknown as Record<string, unknown>,
    performance_score: 0,
  }]).select().single();

  if (campErr) throw campErr;

  // Save positive keywords
  const positiveKws = (keywords.high_intent_keywords || []).slice(0, 25);
  if (positiveKws.length) {
    await supabase.from("ad_keywords").insert(
      positiveKws.map(k => ({
        campaign_id: campaign.id,
        keyword: k.term,
        match_type: k.match_type || "phrase",
        is_negative: false,
        status: "active",
      }))
    );
  }

  // Save negative keywords (flatten all categories)
  const negKws = keywords.negative_keywords || {};
  const allNegs = Object.values(negKws).flat().filter(Boolean);
  if (allNegs.length) {
    await supabase.from("ad_keywords").insert(
      allNegs.slice(0, 50).map(k => ({
        campaign_id: campaign.id,
        keyword: String(k),
        match_type: "exact",
        is_negative: true,
        status: "active",
      }))
    );
  }

  // Save ad creatives
  const ads = adCopy.ads || [];
  if (ads.length) {
    await supabase.from("ad_creatives").insert(
      ads.map(a => ({
        campaign_id: campaign.id,
        headline1: a.headline1 || null,
        headline2: a.headline2 || null,
        headline3: a.headline3 || null,
        description: a.description || null,
        status: "draft",
      }))
    );
  }

  // Step 6: Log all decisions
  await supabase.from("ad_logs").insert({
    campaign_id: campaign.id,
    action: "orchestrated_creation",
    agent: "orchestrator",
    payload: {
      strategy_decision: {
        urgency: strategy.urgency_level,
        intent: strategy.search_intent,
        bidding: strategy.bidding_strategy,
        focus: strategy.conversion_focus,
        risk: strategy.risk_level,
        reasoning: strategy.reasoning,
      },
      keywords_count: positiveKws.length,
      negatives_count: allNegs.length,
      ads_count: ads.length,
      timestamp: new Date().toISOString(),
    },
  });

  return { campaign, strategy, keywords, adCopy };
}
