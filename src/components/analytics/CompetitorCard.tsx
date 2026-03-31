import { useState } from "react";
import { Star, ExternalLink, Trash2, TrendingDown, TrendingUp, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { CompetitorWithMetrics } from "@/hooks/useCompetitorAnalysis";

interface Props {
  competitor: CompetitorWithMetrics;
  myRating?: number;
  myReviews?: number;
  onDelete: (id: string) => void;
}

export function CompetitorCard({ competitor, myRating = 0, myReviews = 0, onDelete }: Props) {
  const [detailOpen, setDetailOpen] = useState(false);
  const m = competitor.latest_metrics;
  const rating = m?.rating ?? 0;
  const reviews = m?.total_reviews ?? 0;
  const responseRate = m?.response_rate ?? 0;

  const losingInReviews = reviews > myReviews;
  const losingInRating = rating > myRating;

  const mapsUrl = competitor.google_place_id
    ? `https://www.google.com/maps/place/?q=place_id:${competitor.google_place_id}`
    : "#";

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-foreground truncate">{competitor.name}</h4>
              {competitor.category && (
                <p className="text-xs text-muted-foreground truncate">{competitor.category}</p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted"}`}
                />
              ))}
              <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="secondary" className="text-xs">{reviews} reviews</Badge>
              </TooltipTrigger>
              <TooltipContent>Total de avaliações no Google</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="secondary" className="text-xs">{responseRate.toFixed(0)}% respostas</Badge>
              </TooltipTrigger>
              <TooltipContent>Taxa de resposta do proprietário</TooltipContent>
            </Tooltip>
            {losingInReviews && (
              <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                <TrendingDown className="h-3 w-3 mr-1" />
                Mais reviews
              </Badge>
            )}
            {losingInRating && (
              <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Nota maior
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setDetailOpen(true)}>
              <Eye className="h-3.5 w-3.5 mr-1" />
              Detalhes
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Maps
              </a>
            </Button>
            <Button variant="ghost" size="icon" className="ml-auto text-muted-foreground hover:text-destructive" onClick={() => onDelete(competitor.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{competitor.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {competitor.address && <p className="text-muted-foreground">{competitor.address}</p>}
            <div className="grid grid-cols-2 gap-3">
              <InfoItem label="Nota" value={rating.toFixed(1)} />
              <InfoItem label="Total Reviews" value={String(reviews)} />
              <InfoItem label="Reviews Recentes (30d)" value={String(m?.recent_reviews_count ?? 0)} />
              <InfoItem label="Taxa de Resposta" value={`${responseRate.toFixed(0)}%`} />
              <InfoItem label="Tempo Médio Resposta" value={m?.avg_response_time_hours ? `${m.avg_response_time_hours.toFixed(0)}h` : "N/A"} />
              <InfoItem label="Nível de Preço" value={competitor.price_level != null ? "$".repeat(competitor.price_level + 1) : "N/A"} />
            </div>
            {competitor.website && (
              <a href={competitor.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                <ExternalLink className="h-3.5 w-3.5" /> {competitor.website}
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}
