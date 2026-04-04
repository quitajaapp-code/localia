import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// ---------- Types ----------

export interface BenchmarkCompetitor {
  id: string;
  business_id: string;
  google_place_id: string | null;
  name: string;
  address: string | null;
  category: string | null;
  website: string | null;
  phone: string | null;
  rating: number;
  review_count: number;
  posts_last_30_days: number;
  response_rate: number;
  price_level: number | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BenchmarkInsight {
  id: string;
  business_id: string;
  insight_type: "gap_rating" | "opportunity_content" | "ad_strategy";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string | null;
  data_context: Record<string, unknown>;
  recommended_action: string | null;
  status: "new" | "reviewed" | "implemented";
  created_at: string;
  updated_at: string;
}

export interface BenchmarkMetricsHistory {
  id: string;
  competitor_id: string;
  rating: number | null;
  review_count: number | null;
  posts_last_30_days: number | null;
  response_rate: number | null;
  snapshot_date: string;
  created_at: string;
}

export interface RadarDataPoint {
  metric: string;
  meu: number;
  mercado: number;
  fullMark: number;
}

// ---------- Business ID helper ----------

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

// ---------- Main Hook ----------

export function useBenchmark() {
  const qc = useQueryClient();
  const { data: businessId } = useBusinessId();

  // Competitors
  const competitorsQuery = useQuery({
    queryKey: ["benchmark-competitors", businessId],
    enabled: !!businessId,
    queryFn: async (): Promise<BenchmarkCompetitor[]> => {
      const { data, error } = await supabase
        .from("benchmark_competitors")
        .select("*")
        .eq("business_id", businessId!)
        .eq("is_active", true)
        .order("rating", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as BenchmarkCompetitor[];
    },
  });

  // Insights
  const insightsQuery = useQuery({
    queryKey: ["benchmark-insights", businessId],
    enabled: !!businessId,
    queryFn: async (): Promise<BenchmarkInsight[]> => {
      const { data, error } = await supabase
        .from("benchmark_insights")
        .select("*")
        .eq("business_id", businessId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as BenchmarkInsight[];
    },
  });

  // Metrics History
  const historyQuery = useQuery({
    queryKey: ["benchmark-history", businessId],
    enabled: !!businessId,
    queryFn: async (): Promise<BenchmarkMetricsHistory[]> => {
      const { data: comps } = await supabase
        .from("benchmark_competitors")
        .select("id")
        .eq("business_id", businessId!)
        .eq("is_active", true);
      if (!comps?.length) return [];
      const ids = comps.map((c) => c.id);
      const { data, error } = await supabase
        .from("benchmark_metrics_history")
        .select("*")
        .in("competitor_id", ids)
        .order("snapshot_date");
      if (error) throw error;
      return (data ?? []) as unknown as BenchmarkMetricsHistory[];
    },
  });

  // My business review stats
  const myStatsQuery = useQuery({
    queryKey: ["benchmark-my-stats", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating, respondido")
        .eq("business_id", businessId!);
      const rows = reviews ?? [];
      const totalReviews = rows.length;
      const avgRating = totalReviews
        ? rows.reduce((s, r) => s + (r.rating ?? 0), 0) / totalReviews
        : 0;
      const responseRate = totalReviews
        ? (rows.filter((r) => r.respondido).length / totalReviews) * 100
        : 0;

      // Posts count last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: postsCount } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId!)
        .gte("created_at", thirtyDaysAgo.toISOString());

      return {
        rating: +avgRating.toFixed(1),
        totalReviews,
        responseRate: +responseRate.toFixed(0),
        postsLast30Days: postsCount ?? 0,
      };
    },
  });

  // Mark insight as implemented/reviewed
  const updateInsightStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "reviewed" | "implemented" }) => {
      const { error } = await supabase
        .from("benchmark_insights")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Insight atualizado!");
      qc.invalidateQueries({ queryKey: ["benchmark-insights"] });
    },
    onError: () => toast.error("Erro ao atualizar insight."),
  });

  // Trigger new analysis (calls edge functions)
  const triggerAnalysis = useMutation({
    mutationFn: async () => {
      // Step 1: Fetch competitor data
      const { error: fetchErr } = await supabase.functions.invoke("fetch-competitor-data", {
        body: { business_id: businessId },
      });
      if (fetchErr) throw fetchErr;

      // Step 2: Generate insights
      const { error: genErr } = await supabase.functions.invoke("generate-benchmark-insights", {
        body: { business_id: businessId },
      });
      if (genErr) throw genErr;
    },
    onSuccess: () => {
      toast.success("Análise de benchmark concluída!");
      qc.invalidateQueries({ queryKey: ["benchmark-competitors"] });
      qc.invalidateQueries({ queryKey: ["benchmark-insights"] });
      qc.invalidateQueries({ queryKey: ["benchmark-history"] });
      qc.invalidateQueries({ queryKey: ["benchmark-my-stats"] });
    },
    onError: () => toast.error("Erro ao executar análise de benchmark."),
  });

  // Calculate competitive index (0-100)
  const competitors = competitorsQuery.data ?? [];
  const myStats = myStatsQuery.data;

  const competitiveIndex = (() => {
    if (!myStats || !competitors.length) return null;
    const avgRating = competitors.reduce((s, c) => s + c.rating, 0) / competitors.length;
    const avgReviews = competitors.reduce((s, c) => s + c.review_count, 0) / competitors.length;
    const avgResponse = competitors.reduce((s, c) => s + c.response_rate, 0) / competitors.length;

    let score = 0;
    // Rating (40%)
    if (avgRating > 0) score += Math.min((myStats.rating / avgRating) * 40, 50);
    else score += 40;
    // Reviews (30%)
    if (avgReviews > 0) score += Math.min((myStats.totalReviews / avgReviews) * 30, 40);
    else score += 30;
    // Response rate (30%)
    if (avgResponse > 0) score += Math.min((myStats.responseRate / avgResponse) * 30, 40);
    else score += myStats.responseRate * 0.3;

    return Math.min(Math.max(Math.round(score), 0), 100);
  })();

  // Radar chart data
  const radarData: RadarDataPoint[] = (() => {
    if (!myStats || !competitors.length) return [];
    const avg = (fn: (c: BenchmarkCompetitor) => number) =>
      competitors.reduce((s, c) => s + fn(c), 0) / competitors.length;

    return [
      { metric: "Nota", meu: myStats.rating, mercado: +avg((c) => c.rating).toFixed(1), fullMark: 5 },
      { metric: "Reviews", meu: myStats.totalReviews, mercado: Math.round(avg((c) => c.review_count)), fullMark: Math.max(myStats.totalReviews, Math.round(avg((c) => c.review_count))) * 1.2 || 100 },
      { metric: "Posts/30d", meu: myStats.postsLast30Days, mercado: Math.round(avg((c) => c.posts_last_30_days)), fullMark: Math.max(myStats.postsLast30Days, Math.round(avg((c) => c.posts_last_30_days))) * 1.2 || 10 },
      { metric: "Resposta %", meu: myStats.responseRate, mercado: +avg((c) => c.response_rate).toFixed(0), fullMark: 100 },
    ];
  })();

  return {
    businessId,
    competitors,
    insights: insightsQuery.data ?? [],
    history: historyQuery.data ?? [],
    myStats,
    competitiveIndex,
    radarData,
    isLoading: competitorsQuery.isLoading || insightsQuery.isLoading || myStatsQuery.isLoading,
    updateInsightStatus,
    triggerAnalysis,
  };
}
