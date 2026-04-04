import { AlertTriangle, TrendingUp, Lightbulb, CheckCircle, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BenchmarkInsight } from "@/hooks/useBenchmark";

interface Props {
  insight: BenchmarkInsight;
  onMarkReviewed: (id: string) => void;
  onMarkImplemented: (id: string) => void;
  isPending?: boolean;
}

const severityConfig = {
  critical: { label: "Crítico", className: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  high: { label: "Alto", className: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  medium: { label: "Médio", className: "bg-warning/10 text-warning border-warning/20", icon: Lightbulb },
  low: { label: "Baixo", className: "bg-success/10 text-success border-success/20", icon: TrendingUp },
};

const typeLabels: Record<string, string> = {
  gap_rating: "Gap de Nota",
  opportunity_content: "Oportunidade de Conteúdo",
  ad_strategy: "Estratégia de Ads",
};

export function InsightCard({ insight, onMarkReviewed, onMarkImplemented, isPending }: Props) {
  const sev = severityConfig[insight.severity];
  const SevIcon = sev.icon;
  const isGap = insight.insight_type === "gap_rating";

  return (
    <Card className={`border ${isGap ? "border-destructive/20" : "border-success/20"} transition-shadow hover:shadow-md`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <SevIcon className={`h-4 w-4 shrink-0 ${isGap ? "text-destructive" : "text-success"}`} />
            <h3 className="font-semibold text-sm text-foreground leading-tight">{insight.title}</h3>
          </div>
          <div className="flex gap-1 shrink-0">
            <Badge variant="outline" className={sev.className}>
              {sev.label}
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              {typeLabels[insight.insight_type] ?? insight.insight_type}
            </Badge>
          </div>
        </div>

        {insight.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
        )}

        {insight.recommended_action && (
          <div className="bg-muted/50 rounded-md p-2">
            <p className="text-xs font-medium text-foreground">💡 Ação recomendada:</p>
            <p className="text-xs text-muted-foreground mt-0.5">{insight.recommended_action}</p>
          </div>
        )}

        {insight.status === "new" && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7"
              disabled={isPending}
              onClick={() => onMarkReviewed(insight.id)}
            >
              <Eye className="h-3 w-3 mr-1" />
              Revisar
            </Button>
            <Button
              size="sm"
              className="text-xs h-7"
              disabled={isPending}
              onClick={() => onMarkImplemented(insight.id)}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Aplicar
            </Button>
          </div>
        )}

        {insight.status !== "new" && (
          <Badge variant="secondary" className="text-xs">
            {insight.status === "reviewed" ? "✓ Revisado" : "✅ Implementado"}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
