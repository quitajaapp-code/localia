import { supabase } from "@/integrations/supabase/client";
import type { AgentContext } from "../types";
import { runStrategyAgent } from "../agents/strategyAgent";
import { runKeywordAgent } from "../agents/keywordAgent";
import { runAdCopyAgent } from "../agents/adCopyAgent";

interface CreateCampaignParams {
  businessId: string;
  context: AgentContext;
}

/**
 * Full AI-assisted campaign creation flow:
 * 1. Strategy agent defines campaign structure
 * 2. Keyword agent generates keywords
 * 3. AdCopy agent creates ad creatives
 * 4. Save everything to Supabase
 */
export async function createCampaignWithAI({ businessId, context }: CreateCampaignParams) {
  // Run agents in parallel where possible
  const [strategy, keywords, adCopy] = await Promise.all([
    runStrategyAgent(context),
    runKeywordAgent(context),
    runAdCopyAgent(context),
  ]);

  const budgetDaily = +(context.budget_monthly / 30).toFixed(2);

  // Create campaign
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
  if (keywords.positives?.length) {
    await supabase.from("keywords").insert(
      keywords.positives.slice(0, 30).map(k => ({
        campaign_id: campaign.id,
        termo: k.termo,
        match_type: k.match_type,
        cpc_atual: k.cpc_estimado,
        status: "ativa",
      }))
    );
  }

  // Insert negative keywords
  const allNegs = Object.values(keywords.negatives || {}).flat();
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
        headlines: a.headlines,
        descriptions: a.descriptions,
        headline1: a.headlines[0] || null,
        headline2: a.headlines[1] || null,
        headline3: a.headlines[2] || null,
        description_text: a.descriptions[0] || null,
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
      strategy: strategy.reasoning,
      keywords_count: keywords.positives?.length || 0,
      negatives_count: allNegs.length,
      ads_count: adCopy.ads?.length || 0,
    },
  });

  return { campaign, strategy, keywords, adCopy };
}

/**
 * Launch a draft campaign (change status to active).
 */
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

/**
 * Pause an active campaign.
 */
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

/**
 * Sync campaign data (placeholder for future Google Ads API integration).
 */
export async function syncCampaign(campaignId: string) {
  // Future: call Google Ads API to sync metrics
  await supabase.from("ad_logs").insert({
    campaign_id: campaignId,
    action: "campaign_synced",
    agent: "system",
    payload: { note: "Preparado para integração com Google Ads API" },
  });
}
