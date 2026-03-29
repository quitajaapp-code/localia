import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AdCampaign } from "../types";
import { launchCampaign, pauseCampaign } from "../services/adsService";

export function useAds() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: biz } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!biz) { setLoading(false); return; }
      setBusinessId(biz.id);

      const { data: camps } = await supabase
        .from("campaigns")
        .select("*")
        .eq("business_id", biz.id)
        .order("created_at", { ascending: false });

      if (camps?.length) {
        const enriched: AdCampaign[] = [];
        for (const c of camps) {
          const { count: adCount } = await supabase.from("ads").select("*", { count: "exact", head: true }).eq("campaign_id", c.id);
          const { count: kwCount } = await supabase.from("keywords").select("*", { count: "exact", head: true }).eq("campaign_id", c.id);
          enriched.push({ ...c, _adCount: adCount || 0, _kwCount: kwCount || 0 } as AdCampaign);
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

  const toggleCampaign = async (id: string, currentStatus: string | null) => {
    try {
      if (currentStatus === "ativa") {
        await pauseCampaign(id);
        toast.success("Campanha pausada");
      } else {
        await launchCampaign(id);
        toast.success("Campanha ativada");
      }
      setCampaigns(prev => prev.map(c =>
        c.id === id ? { ...c, status: currentStatus === "ativa" ? "pausada" : "ativa" } : c
      ));
    } catch {
      toast.error("Erro ao atualizar campanha");
    }
  };

  return { campaigns, loading, businessId, toggleCampaign, reload: loadCampaigns };
}
