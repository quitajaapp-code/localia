import { supabase } from "@/integrations/supabase/client";
import type { AdMetric } from "../types";

/**
 * Get latest metrics for a business.
 */
export async function getLatestMetrics(businessId: string): Promise<AdMetrics | null> {
  const { data } = await supabase
    .from("ads_metrics")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data as unknown as AdMetrics | null;
}

/**
 * Get metrics history for charts.
 */
export async function getMetricsHistory(businessId: string, limit = 12): Promise<AdMetrics[]> {
  const { data } = await supabase
    .from("ads_metrics")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true })
    .limit(limit);

  return (data || []) as unknown as AdMetrics[];
}

/**
 * Save metrics snapshot (used by edge functions).
 */
export async function saveMetricsSnapshot(businessId: string, metrics: Partial<AdMetrics>) {
  const { error } = await supabase.from("ads_metrics").insert({
    business_id: businessId,
    impressoes: metrics.impressoes || 0,
    cliques: metrics.cliques || 0,
    cpc_medio: metrics.cpc_medio || 0,
    conversoes: metrics.conversoes || 0,
    gasto_total: metrics.gasto_total || 0,
    ctr: metrics.ctr || 0,
    semana_ref: new Date().toISOString().split("T")[0],
  });

  if (error) throw error;
}

/**
 * Get campaign-level keyword performance for optimization.
 */
export async function getCampaignPerformance(campaignId: string) {
  const [kwRes, adRes] = await Promise.all([
    supabase.from("keywords").select("*").eq("campaign_id", campaignId),
    supabase.from("ads").select("*").eq("campaign_id", campaignId),
  ]);

  return {
    keywords: kwRes.data || [],
    ads: adRes.data || [],
  };
}
