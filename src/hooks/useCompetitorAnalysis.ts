import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface CompetitorProfile {
  id: string;
  business_id: string;
  google_place_id: string | null;
  name: string;
  address: string | null;
  category: string | null;
  website: string | null;
  phone: string | null;
  price_level: number | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompetitorMetric {
  id: string;
  competitor_id: string;
  rating: number | null;
  total_reviews: number | null;
  recent_reviews_count: number | null;
  response_rate: number | null;
  avg_response_time_hours: number | null;
  snapshot_date: string;
  raw_data: Record<string, unknown> | null;
  created_at: string;
}

export interface CompetitorWithMetrics extends CompetitorProfile {
  latest_metrics: CompetitorMetric | null;
}

export interface GapAnalysis {
  metric: string;
  myValue: number;
  avgCompetitor: number;
  gap: number;
  status: "better" | "worse" | "equal";
}

function useBusinessId() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-business-id", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user!.id)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data?.id as string | undefined;
    },
  });
}

export function useCompetitorAnalysis() {
  const qc = useQueryClient();
  const { data: businessId } = useBusinessId();

  const competitorsQuery = useQuery({
    queryKey: ["competitors", businessId],
    enabled: !!businessId,
    queryFn: async (): Promise<CompetitorWithMetrics[]> => {
      const { data: profiles, error } = await supabase
        .from("competitor_profiles")
        .select("*")
        .eq("business_id", businessId!)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      if (!profiles?.length) return [];

      const ids = profiles.map((p) => p.id);
      const { data: allMetrics } = await supabase
        .from("competitor_metrics")
        .select("*")
        .in("competitor_id", ids)
        .order("snapshot_date", { ascending: false });

      const latestMap = new Map<string, CompetitorMetric>();
      (allMetrics ?? []).forEach((m) => {
        if (!latestMap.has(m.competitor_id)) {
          latestMap.set(m.competitor_id, m as unknown as CompetitorMetric);
        }
      });

      return profiles.map((p) => ({
        ...(p as unknown as CompetitorProfile),
        latest_metrics: latestMap.get(p.id) ?? null,
      }));
    },
  });

  const metricsHistoryQuery = useQuery({
    queryKey: ["competitor-metrics-history", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from("competitor_profiles")
        .select("id")
        .eq("business_id", businessId!)
        .eq("is_active", true);
      if (!profiles?.length) return [];
      const ids = profiles.map((p) => p.id);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const { data, error } = await supabase
        .from("competitor_metrics")
        .select("*")
        .in("competitor_id", ids)
        .gte("snapshot_date", sixMonthsAgo.toISOString().split("T")[0])
        .order("snapshot_date");
      if (error) throw error;
      return (data ?? []) as unknown as CompetitorMetric[];
    },
  });

  const triggerScan = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("find-competitors", {
        body: { business_id: businessId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Busca de concorrentes iniciada!");
      qc.invalidateQueries({ queryKey: ["competitors"] });
    },
    onError: () => toast.error("Erro ao buscar concorrentes."),
  });

  const addManualCompetitor = useMutation({
    mutationFn: async (placeId: string) => {
      const { error } = await supabase.from("competitor_profiles").insert({
        business_id: businessId!,
        google_place_id: placeId,
        name: "Carregando...",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Concorrente adicionado!");
      qc.invalidateQueries({ queryKey: ["competitors"] });
    },
    onError: () => toast.error("Erro ao adicionar concorrente."),
  });

  const deleteCompetitor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("competitor_profiles")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Concorrente removido.");
      qc.invalidateQueries({ queryKey: ["competitors"] });
    },
    onError: () => toast.error("Erro ao remover."),
  });

  const calculateGap = (
    myRating: number,
    myReviews: number,
    myResponseRate: number,
    competitors: CompetitorWithMetrics[]
  ): GapAnalysis[] => {
    const withMetrics = competitors.filter((c) => c.latest_metrics);
    if (!withMetrics.length) return [];

    const avgRating = withMetrics.reduce((s, c) => s + (c.latest_metrics?.rating ?? 0), 0) / withMetrics.length;
    const avgReviews = withMetrics.reduce((s, c) => s + (c.latest_metrics?.total_reviews ?? 0), 0) / withMetrics.length;
    const avgResponse = withMetrics.reduce((s, c) => s + (c.latest_metrics?.response_rate ?? 0), 0) / withMetrics.length;

    const status = (my: number, avg: number): "better" | "worse" | "equal" =>
      my > avg * 1.05 ? "better" : my < avg * 0.95 ? "worse" : "equal";

    return [
      { metric: "Nota Média", myValue: myRating, avgCompetitor: +avgRating.toFixed(1), gap: +(myRating - avgRating).toFixed(1), status: status(myRating, avgRating) },
      { metric: "Total de Reviews", myValue: myReviews, avgCompetitor: Math.round(avgReviews), gap: myReviews - Math.round(avgReviews), status: status(myReviews, avgReviews) },
      { metric: "Taxa de Resposta (%)", myValue: myResponseRate, avgCompetitor: +avgResponse.toFixed(0), gap: +(myResponseRate - avgResponse).toFixed(0), status: status(myResponseRate, avgResponse) },
    ];
  };

  return {
    businessId,
    competitors: competitorsQuery.data ?? [],
    isLoading: competitorsQuery.isLoading,
    metricsHistory: metricsHistoryQuery.data ?? [],
    triggerScan,
    addManualCompetitor,
    deleteCompetitor,
    calculateGap,
  };
}
