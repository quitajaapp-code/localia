/**
 * Context Engine — Constrói o contexto compartilhado para os agentes de Ads.
 * Centraliza dados do negócio, performance e localização.
 */

import { supabase } from "@/integrations/supabase/client";

export interface AdsAgentContext {
  business: {
    name: string;
    niche: string;
    city: string;
    state: string;
    ticket: string;
    differential: string;
    products: string;
    years_experience: string;
    whatsapp: string | null;
    website_url: string | null;
  };
  performance: {
    total_campaigns: number;
    active_campaigns: number;
    avg_ctr: number;
    avg_cpc: number;
    total_conversions: number;
  };
  history: {
    previous_keywords: string[];
    paused_keywords: string[];
    best_headlines: string[];
  };
  location: {
    radius: string;
    target_areas: string[];
  };
}

export async function buildAgentContext(userId: string): Promise<AdsAgentContext> {
  // Fetch business data
  const { data: biz } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  // Fetch existing campaigns from ad_campaigns
  const { data: campaigns } = await supabase
    .from("ad_campaigns")
    .select("id, status, performance_score")
    .eq("user_id", userId);

  // Fetch metrics from ad_metrics for active campaigns
  const activeCampIds = (campaigns || []).filter(c => c.status === "active").map(c => c.id);
  let avgCtr = 0, avgCpc = 0, totalConv = 0;

  if (activeCampIds.length) {
    const { data: metrics } = await supabase
      .from("ad_metrics")
      .select("ctr, cost, clicks, conversions")
      .in("campaign_id", activeCampIds);

    if (metrics?.length) {
      avgCtr = metrics.reduce((s, m) => s + (m.ctr || 0), 0) / metrics.length;
      const totalClicks = metrics.reduce((s, m) => s + (m.clicks || 0), 0);
      const totalCost = metrics.reduce((s, m) => s + (m.cost || 0), 0);
      avgCpc = totalClicks > 0 ? totalCost / totalClicks : 0;
      totalConv = metrics.reduce((s, m) => s + (m.conversions || 0), 0);
    }
  }

  // Fetch keyword history
  const { data: keywords } = await supabase
    .from("ad_keywords")
    .select("keyword, status")
    .in("campaign_id", (campaigns || []).map(c => c.id))
    .limit(100);

  const previousKeywords = (keywords || []).map(k => k.keyword);
  const pausedKeywords = (keywords || []).filter(k => k.status === "paused").map(k => k.keyword);

  // Fetch best headlines
  const { data: creatives } = await supabase
    .from("ad_creatives")
    .select("headline1, performance_score")
    .in("campaign_id", (campaigns || []).map(c => c.id))
    .order("performance_score", { ascending: false })
    .limit(5);

  const bestHeadlines = (creatives || []).map(c => c.headline1).filter(Boolean) as string[];

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
    },
    performance: {
      total_campaigns: (campaigns || []).length,
      active_campaigns: activeCampIds.length,
      avg_ctr: avgCtr,
      avg_cpc: avgCpc,
      total_conversions: totalConv,
    },
    history: {
      previous_keywords: previousKeywords,
      paused_keywords: pausedKeywords,
      best_headlines: bestHeadlines,
    },
    location: {
      radius: "10km",
      target_areas: [biz?.cidade || ""].filter(Boolean),
    },
  };
}
