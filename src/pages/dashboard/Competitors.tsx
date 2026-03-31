import { Search, TrendingUp, TrendingDown, Minus, Users, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/shared/EmptyState";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useCompetitorAnalysis } from "@/hooks/useCompetitorAnalysis";
import { CompetitorCard } from "@/components/analytics/CompetitorCard";
import { CompetitorComparisonChart } from "@/components/analytics/CompetitorComparisonChart";

// Placeholder values for "my business" — replace with real data hook later
const MY_RATING = 4.3;
const MY_REVIEWS = 87;
const MY_RESPONSE_RATE = 72;

export default function CompetitorsPage() {
  usePageTitle("Análise de Concorrência");
  const {
    competitors,
    isLoading,
    metricsHistory,
    triggerScan,
    deleteCompetitor,
    calculateGap,
  } = useCompetitorAnalysis();

  const gapData = calculateGap(MY_RATING, MY_REVIEWS, MY_RESPONSE_RATE, competitors);

  const insights = gapData.map((g) => {
    if (g.status === "worse") {
      return { text: `Você está abaixo da média em "${g.metric}" (gap: ${g.gap}).`, icon: TrendingDown, color: "text-destructive" };
    }
    if (g.status === "better") {
      return { text: `Você supera a concorrência em "${g.metric}" (+${g.gap}).`, icon: TrendingUp, color: "text-emerald-500" };
    }
    return { text: `Você está na média em "${g.metric}".`, icon: Minus, color: "text-muted-foreground" };
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-1">
        <Skeleton className="h-8 w-64" />
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
        </div>
        <Skeleton className="h-72 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Análise de Concorrência</h1>
          <p className="text-sm text-muted-foreground">Compare seu negócio com os concorrentes locais.</p>
        </div>
        <Button onClick={() => triggerScan.mutate()} disabled={triggerScan.isPending}>
          <RefreshCw className={`h-4 w-4 mr-2 ${triggerScan.isPending ? "animate-spin" : ""}`} />
          Buscar Concorrentes
        </Button>
      </div>

      {competitors.length === 0 ? (
        <EmptyState
          icon={<Users className="h-16 w-16 text-muted-foreground/50" />}
          title="Nenhum concorrente monitorado"
          description="Ainda não monitoramos seus concorrentes. Clique para buscar automaticamente via Google Maps."
          actionLabel="Buscar Concorrentes"
          actionIcon={<Search className="h-4 w-4 mr-2" />}
          onAction={() => triggerScan.mutate()}
        />
      ) : (
        <>
          {/* Score Card */}
          <div className="grid md:grid-cols-3 gap-4">
            {gapData.map((g) => {
              const Icon = g.status === "better" ? TrendingUp : g.status === "worse" ? TrendingDown : Minus;
              const colors = {
                better: "text-emerald-500 bg-emerald-500/10",
                worse: "text-destructive bg-destructive/10",
                equal: "text-muted-foreground bg-muted",
              };
              return (
                <Card key={g.metric}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Tooltip>
                        <TooltipTrigger>
                          <p className="text-sm text-muted-foreground">{g.metric}</p>
                        </TooltipTrigger>
                        <TooltipContent>Seu valor vs média dos concorrentes</TooltipContent>
                      </Tooltip>
                      <Badge className={`${colors[g.status]} border-0`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {g.gap > 0 ? `+${g.gap}` : g.gap}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{g.myValue}</p>
                    <p className="text-xs text-muted-foreground">Média concorrentes: {g.avgCompetitor}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {insights.map((ins, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <ins.icon className={`h-4 w-4 shrink-0 ${ins.color}`} />
                    <span className="text-foreground">{ins.text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Chart */}
          <CompetitorComparisonChart gapData={gapData} metricsHistory={metricsHistory} />

          {/* Competitor List */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Concorrentes Monitorados ({competitors.length})
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {competitors.map((c) => (
                <CompetitorCard
                  key={c.id}
                  competitor={c}
                  myRating={MY_RATING}
                  myReviews={MY_REVIEWS}
                  onDelete={(id) => deleteCompetitor.mutate(id)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
