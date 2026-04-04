import { RefreshCw, Search, Trophy, Star, MessageSquare, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useBenchmark } from "@/hooks/useBenchmark";
import { RadarChartComparison } from "@/components/benchmark/RadarChartComparison";
import { InsightCard } from "@/components/benchmark/InsightCard";

function GaugeScore({ score }: { score: number | null }) {
  if (score === null) return null;
  const color =
    score >= 70 ? "text-success" : score >= 40 ? "text-warning" : "text-destructive";
  const bg =
    score >= 70 ? "bg-success/10" : score >= 40 ? "bg-warning/10" : "bg-destructive/10";

  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center justify-center">
        <Tooltip>
          <TooltipTrigger>
            <p className="text-xs text-muted-foreground mb-2">Índice de Competitividade</p>
          </TooltipTrigger>
          <TooltipContent>Baseado em nota, reviews e taxa de resposta vs concorrentes</TooltipContent>
        </Tooltip>
        <div className={`rounded-full ${bg} w-28 h-28 flex items-center justify-center`}>
          <span className={`text-4xl font-bold ${color}`}>{score}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {score >= 70 ? "Excelente" : score >= 40 ? "Precisa melhorar" : "Crítico"}
        </p>
      </CardContent>
    </Card>
  );
}

function StatsCards({ myStats }: { myStats: NonNullable<ReturnType<typeof useBenchmark>["myStats"]> }) {
  const items = [
    { label: "Nota Média", value: myStats.rating.toFixed(1), icon: Star },
    { label: "Total Reviews", value: myStats.totalReviews, icon: MessageSquare },
    { label: "Taxa Resposta", value: `${myStats.responseRate}%`, icon: MessageSquare },
    { label: "Posts/30 dias", value: myStats.postsLast30Days, icon: FileText },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function BenchmarkPage() {
  usePageTitle("Benchmark Competitivo");
  const {
    competitors,
    insights,
    myStats,
    competitiveIndex,
    radarData,
    isLoading,
    updateInsightStatus,
    triggerAnalysis,
  } = useBenchmark();

  if (isLoading) {
    return (
      <div className="space-y-6 p-1">
        <Skeleton className="h-8 w-72" />
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
        <Skeleton className="h-80 rounded-lg" />
      </div>
    );
  }

  const newInsights = insights.filter((i) => i.status === "new");
  const doneInsights = insights.filter((i) => i.status !== "new");

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Benchmark Competitivo
          </h1>
          <p className="text-sm text-muted-foreground">Veja como você se compara ao mercado local.</p>
        </div>
        <Button onClick={() => triggerAnalysis.mutate()} disabled={triggerAnalysis.isPending}>
          <RefreshCw className={`h-4 w-4 mr-2 ${triggerAnalysis.isPending ? "animate-spin" : ""}`} />
          {competitors.length ? "Atualizar Análise" : "Iniciar Análise"}
        </Button>
      </div>

      {competitors.length === 0 ? (
        <EmptyState
          icon={<Search className="h-16 w-16 text-muted-foreground/50" />}
          title="Nenhum concorrente encontrado ainda"
          description="Clique para buscar automaticamente seus concorrentes e gerar insights estratégicos com IA."
          actionLabel="Analisar Mercado"
          actionIcon={<Search className="h-4 w-4 mr-2" />}
          onAction={() => triggerAnalysis.mutate()}
        />
      ) : (
        <>
          {/* Score + Stats */}
          <div className="grid lg:grid-cols-[280px_1fr] gap-4">
            <GaugeScore score={competitiveIndex} />
            {myStats && <StatsCards myStats={myStats} />}
          </div>

          {/* Radar Chart */}
          <RadarChartComparison data={radarData} />

          {/* Insights */}
          {newInsights.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Insights Estratégicos ({newInsights.length})
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {newInsights.map((ins) => (
                  <InsightCard
                    key={ins.id}
                    insight={ins}
                    isPending={updateInsightStatus.isPending}
                    onMarkReviewed={(id) => updateInsightStatus.mutate({ id, status: "reviewed" })}
                    onMarkImplemented={(id) => updateInsightStatus.mutate({ id, status: "implemented" })}
                  />
                ))}
              </div>
            </div>
          )}

          {doneInsights.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                Ver {doneInsights.length} insight(s) já revisado(s)
              </summary>
              <div className="grid sm:grid-cols-2 gap-4 mt-3">
                {doneInsights.map((ins) => (
                  <InsightCard
                    key={ins.id}
                    insight={ins}
                    isPending={false}
                    onMarkReviewed={() => {}}
                    onMarkImplemented={() => {}}
                  />
                ))}
              </div>
            </details>
          )}

          {/* Competitors Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                Concorrentes Monitorados ({competitors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Reviews</TableHead>
                    <TableHead>Resposta %</TableHead>
                    <TableHead>Posts/30d</TableHead>
                    <TableHead>Categoria</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competitors.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>
                        <Badge variant={c.rating >= 4 ? "default" : "secondary"}>
                          ⭐ {c.rating}
                        </Badge>
                      </TableCell>
                      <TableCell>{c.review_count}</TableCell>
                      <TableCell>{c.response_rate}%</TableCell>
                      <TableCell>{c.posts_last_30_days}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{c.category ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
