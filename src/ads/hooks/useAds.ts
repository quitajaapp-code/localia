import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AdCampaign } from "../types";
import { orchestrateCampaignCreation } from "../services/campaignOrchestrator";

export function useAds() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCampaigns = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: camps } = await supabase
        .from("ad_campaigns")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (camps?.length) {
        const enriched: AdCampaign[] = [];
        for (const c of camps) {
          const { count: kwCount } = await supabase.from("ad_keywords").select("*", { count: "exact", head: true }).eq("campaign_id", c.id).eq("is_negative", false);
          const { count: adCount } = await supabase.from("ad_creatives").select("*", { count: "exact", head: true }).eq("campaign_id", c.id);
          const { count: negCount } = await supabase.from("ad_keywords").select("*", { count: "exact", head: true }).eq("campaign_id", c.id).eq("is_negative", true);
          enriched.push({ ...c, _kwCount: kwCount || 0, _adCount: adCount || 0, _negCount: negCount || 0 } as AdCampaign);
        }
        setCampaigns(enriched);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const createCampaign = async (input: {
    businessName: string;
    niche: string;
    city: string;
    state: string;
    budgetDaily: number;
    objective: string;
    radius: string;
  }) => {
    const result = await orchestrateCampaignCreation(input);
    await loadCampaigns();
    return result;
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("ad_campaigns").update({ status }).eq("id", id);
    if (error) { toast.error("Erro ao atualizar campanha"); return; }
    toast.success(status === "active" ? "Campanha ativada" : status === "paused" ? "Campanha pausada" : "Status atualizado");
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status } : c));

    // Log
    await supabase.from("ad_logs").insert({
      campaign_id: id,
      action: `status_changed_to_${status}`,
      agent: "manual",
    });
  };

  return { campaigns, loading, createCampaign, updateStatus, reload: loadCampaigns };
}
