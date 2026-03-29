import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AdMetrics } from "../types";

export function useAdMetrics() {
  const [metrics, setMetrics] = useState<AdMetrics | null>(null);
  const [history, setHistory] = useState<AdMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: biz } = await supabase
          .from("businesses")
          .select("id")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (!biz) return;

        const [latestRes, histRes] = await Promise.all([
          supabase
            .from("ads_metrics")
            .select("*")
            .eq("business_id", biz.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("ads_metrics")
            .select("*")
            .eq("business_id", biz.id)
            .order("created_at", { ascending: true })
            .limit(12),
        ]);

        if (latestRes.data) setMetrics(latestRes.data as unknown as AdMetrics);
        if (histRes.data) setHistory(histRes.data as unknown as AdMetrics[]);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { metrics, history, loading };
}
