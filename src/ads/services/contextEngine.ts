/**
 * Context Engine — Constrói o contexto completo e estruturado para todos os agentes.
 * Centraliza dados do negócio, performance, histórico e localização.
 */

import { supabase } from "@/integrations/supabase/client";
import type { FullAgentContext } from "../types";

export async function buildAgentContext(userId: string): Promise<FullAgentContext> {
  // Fetch business data
  const { data: biz } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  // Fetch campaigns and metrics in parallel
  const [campaignsRes, metricsHistoryRes] = await Promise.all([
    supabase.from("ad_campaigns").select("id, status, performance_score").eq("user_id", userId),
    supabase.from("ad_metrics").select("ctr, cost, clicks, conversions, campaign_id").limit(200),
  ]);

  const campaigns = campaignsRes.data || [];
  const activeCampIds = campaigns.filter(c => c.status === "active").map(c => c.id);

  // Calculate performance metrics
  let avgCtr = 0, avgCpc = 0, totalConv = 0, totalSpend = 0;
  const userMetrics = (metricsHistoryRes.data || []).filter(m =>
    campaigns.some(c => c.id === m.campaign_id)
  );

  if (userMetrics.length) {
    avgCtr = userMetrics.reduce((s, m) => s + (m.ctr || 0), 0) / userMetrics.length;
    const totalClicks = userMetrics.reduce((s, m) => s + (m.clicks || 0), 0);
    totalSpend = userMetrics.reduce((s, m) => s + (m.cost || 0), 0);
    avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
    totalConv = userMetrics.reduce((s, m) => s + (m.conversions || 0), 0);
  }

  // Fetch keyword history and best performing keywords
  const campIds = campaigns.map(c => c.id);
  const [keywordsRes, creativesRes] = await Promise.all([
    campIds.length
      ? supabase.from("ad_keywords").select("keyword, status, performance_score").in("campaign_id", campIds).limit(100)
      : Promise.resolve({ data: [] }),
    campIds.length
      ? supabase.from("ad_creatives").select("headline1, performance_score").in("campaign_id", campIds).order("performance_score", { ascending: false }).limit(10)
      : Promise.resolve({ data: [] }),
  ]);

  const keywords = keywordsRes.data || [];
  const creatives = creativesRes.data || [];

  const bestKeywords = keywords
    .filter(k => k.status === "active" && (k.performance_score || 0) > 50)
    .map(k => k.keyword)
    .slice(0, 10);

  return {
    business: {
      name: biz?.nome || "",
      niche: biz?.nicho || "",
      city: biz?.cidade || "",
      state: biz?.estado || "",
      ticket: "",
      differential: biz?.diferenciais || "",
      products: biz?.produtos || "",
      years_experience: biz?.anos_experiencia || "",
      whatsapp: biz?.whatsapp || null,
      website_url: biz?.website_url || null,
      target_audience: biz?.publico_alvo || "",
    },
    performance: {
      total_campaigns: campaigns.length,
      active_campaigns: activeCampIds.length,
      avg_ctr: avgCtr,
      avg_cpc: avgCpc,
      total_conversions: totalConv,
      total_spend: totalSpend,
      best_performing_keywords: bestKeywords,
    },
    history: {
      previous_keywords: keywords.map(k => k.keyword),
      paused_keywords: keywords.filter(k => k.status === "paused").map(k => k.keyword),
      best_headlines: creatives.map(c => c.headline1).filter(Boolean) as string[],
      failed_ads: creatives.filter(c => (c.performance_score || 0) < 20).map(c => c.headline1).filter(Boolean) as string[],
    },
    location: {
      radius: "10km",
      target_areas: [biz?.cidade || ""].filter(Boolean),
      competitors_density: "medium",
    },
  };
}

export type { FullAgentContext };
