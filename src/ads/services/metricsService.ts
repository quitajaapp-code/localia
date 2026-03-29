import { supabase } from "@/integrations/supabase/client";
import type { AdMetric } from "../types";

/**
 * Get latest metrics for a campaign.
 */
export async function getLatestMetrics(campaignId: string): Promise<AdMetric | null> {
  const { data } = await supabase
    .from("ad_metrics")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data as unknown as AdMetric | null;
}

/**
 * Get metrics history for charts.
 */
export async function getMetricsHistory(campaignId: string, limit = 30): Promise<AdMetric[]> {
  const { data } = await supabase
    .from("ad_metrics")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: true })
    .limit(limit);

  return (data || []) as unknown as AdMetric[];
}

/**
 * Save metrics snapshot.
 */
export async function saveMetricsSnapshot(campaignId: string, metrics: Partial<AdMetric>) {
  const { error } = await supabase.from("ad_metrics").insert({
    campaign_id: campaignId,
    impressions: metrics.impressions || 0,
    clicks: metrics.clicks || 0,
    cost: metrics.cost || 0,
    ctr: metrics.ctr || 0,
    conversions: metrics.conversions || 0,
  });

  if (error) throw error;
}

/**
 * Get campaign-level performance data for optimization.
 */
export async function getCampaignPerformance(campaignId: string) {
  const [kwRes, crRes, metRes] = await Promise.all([
    supabase.from("ad_keywords").select("*").eq("campaign_id", campaignId),
    supabase.from("ad_creatives").select("*").eq("campaign_id", campaignId),
    supabase.from("ad_metrics").select("*").eq("campaign_id", campaignId).order("created_at", { ascending: false }).limit(7),
  ]);

  return {
    keywords: kwRes.data || [],
    creatives: crRes.data || [],
    recentMetrics: metRes.data || [],
  };
}
