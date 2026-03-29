/**
 * adsService.ts — Serviço legado para campanhas na tabela `campaigns`.
 * Usa os novos agentes com a interface atualizada.
 */

import { supabase } from "@/integrations/supabase/client";
import { buildAgentContext } from "./contextEngine";
import { runStrategyAgent } from "../agents/strategyAgent";
import { runKeywordAgent } from "../agents/keywordAgent";
import { runAdCopyAgent } from "../agents/adCopyAgent";
import type { AgentContext } from "../types";

interface CreateCampaignParams {
  businessId: string;
  context: AgentContext;
}

/**
 * Full AI-assisted campaign creation flow (legacy tables).
 */
export async function createCampaignWithAI({ businessId, context }: CreateCampaignParams) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const fullContext = await buildAgentContext(user.id);

  // Override context with provided data
  if (context.business_name) fullContext.business.name = context.business_name;
  if (context.niche) fullContext.business.niche = context.niche;
  if (context.city) fullContext.business.city = context.city;
  if (context.state) fullContext.business.state = context.state;

  // Run agents sequentially (strategy → keywords/adcopy)
  const strategy = await runStrategyAgent(fullContext, context.budget_monthly, context.objective);
  const [keywords, adCopy] = await Promise.all([
    runKeywordAgent(fullContext, strategy.urgency_level),
    runAdCopyAgent(fullContext, strategy.urgency_level),
  ]);

  const budgetDaily = +(context.budget_monthly / 30).toFixed(2);

  // Create campaign in legacy table
  const { data: campaign, error: campErr } = await supabase.from("campaigns").insert({
    business_id: businessId,
    nome: `${context.business_name} — ${context.objective}`,
    status: "rascunho",
    tipo: strategy.campaign_type || "search",
    verba_mensal: context.budget_monthly,
    verba_restante: context.budget_monthly,
    budget_daily: budgetDaily,
  }).select().single();

  if (campErr) throw campErr;

  // Insert keywords
  const positiveKws = (keywords.high_intent_keywords || []).slice(0, 30);
  if (positiveKws.length) {
    await supabase.from("keywords").insert(
      positiveKws.map(k => ({
        campaign_id: campaign.id,
        termo: k.term,
        match_type: k.match_type,
        cpc_atual: k.estimated_cpc || 0,
        status: "ativa",
      }))
    );
  }

  // Insert negative keywords
  const allNegs = Object.values(keywords.negative_keywords || {}).flat();
  if (allNegs.length) {
    await supabase.from("negative_keywords").insert(
      allNegs.slice(0, 50).map(t => ({
        campaign_id: campaign.id,
        termo: String(t),
        match_type: "exact",
      }))
    );
  }

  // Insert ads
  if (adCopy.ads?.length) {
    await supabase.from("ads").insert(
      adCopy.ads.map(a => ({
        campaign_id: campaign.id,
        headline1: a.headline1 || null,
        headline2: a.headline2 || null,
        headline3: a.headline3 || null,
        description_text: a.description || null,
        status: "rascunho",
      }))
    );
  }

  // Log the action
  await supabase.from("ad_logs").insert({
    campaign_id: campaign.id,
    action: "campaign_created_by_ai",
    agent: "strategy+keyword+adcopy",
    payload: {
      strategy_decision: strategy.reasoning,
      urgency: strategy.urgency_level,
      keywords_count: positiveKws.length,
      negatives_count: allNegs.length,
      ads_count: adCopy.ads?.length || 0,
    },
  });

  return { campaign, strategy, keywords, adCopy };
}

export async function launchCampaign(campaignId: string) {
  const { error } = await supabase
    .from("campaigns")
    .update({ status: "ativa" })
    .eq("id", campaignId);
  if (error) throw error;

  await supabase.from("ad_logs").insert({
    campaign_id: campaignId,
    action: "campaign_launched",
    agent: "manual",
  });
}

export async function pauseCampaign(campaignId: string) {
  const { error } = await supabase
    .from("campaigns")
    .update({ status: "pausada" })
    .eq("id", campaignId);
  if (error) throw error;

  await supabase.from("ad_logs").insert({
    campaign_id: campaignId,
    action: "campaign_paused",
    agent: "manual",
  });
}

export async function syncCampaign(campaignId: string) {
  await supabase.from("ad_logs").insert({
    campaign_id: campaignId,
    action: "campaign_synced",
    agent: "system",
    payload: { note: "Preparado para integração com Google Ads API" },
  });
}
