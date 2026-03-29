import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AdMetric } from "../types";

export function useAdMetrics(campaignId?: string) {
  const [metrics, setMetrics] = useState<AdMetric[]>([]);
  const [latest, setLatest] = useState<AdMetric | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (campaignId) {
          // Campaign-specific metrics
          const { data } = await supabase
            .from("ad_metrics")
            .select("*")
            .eq("campaign_id", campaignId)
            .order("created_at", { ascending: false })
            .limit(30);

          setMetrics((data || []) as unknown as AdMetric[]);
          if (data?.[0]) setLatest(data[0] as unknown as AdMetric);
        } else {
          // All metrics for user's campaigns
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data: camps } = await supabase
            .from("ad_campaigns")
            .select("id")
            .eq("user_id", user.id);

          if (camps?.length) {
            const ids = camps.map(c => c.id);
            const { data } = await supabase
              .from("ad_metrics")
              .select("*")
              .in("campaign_id", ids)
              .order("created_at", { ascending: false })
              .limit(30);

            setMetrics((data || []) as unknown as AdMetric[]);
            if (data?.[0]) setLatest(data[0] as unknown as AdMetric);
          }
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [campaignId]);

  const totals = {
    impressions: metrics.reduce((s, m) => s + m.impressions, 0),
    clicks: metrics.reduce((s, m) => s + m.clicks, 0),
    cost: metrics.reduce((s, m) => s + m.cost, 0),
    conversions: metrics.reduce((s, m) => s + m.conversions, 0),
    ctr: metrics.length ? metrics.reduce((s, m) => s + m.ctr, 0) / metrics.length : 0,
  };

  return { metrics, latest, totals, loading };
}
