import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/usePageTitle";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListSkeleton } from "@/components/shared/LoadingStates";
import { ErrorState } from "@/components/shared/ErrorState";
import { OnboardingTooltip } from "@/components/shared/OnboardingTooltip";
import { CountUp } from "@/components/shared/CountUp";
import {
  Star, MessageSquare, Search, Filter, Sparkles, Loader2,
  Copy, Check, TrendingUp, AlertCircle, QrCode,
} from "lucide-react";

type Review = {
  id: string;
  autor: string | null;
  rating: number | null;
  texto: string | null;
  respondido: boolean | null;
  resposta_sugerida_ia: string | null;
  created_at: string | null;
};

export default function Reviews() {
  usePageTitle("Avaliações");
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [filterStar, setFilterStar] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => { loadReviews(); }, []);

  const loadReviews = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: biz } = await supabase.from("businesses").select("id").eq("user_id", user.id).limit(1).maybeSingle();
      if (!biz) { setLoading(false); return; }

      const { data, error: err } = await supabase.from("reviews").select("*").eq("business_id", biz.id).order("created_at", { ascending: false });
      if (err) throw err;
      setReviews(data || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const generateReply = async (review: Review) => {
    setGeneratingId(review.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: biz } = await supabase.from("businesses").select("nome, nicho, tom_de_voz").eq("user_id", user.id).limit(1).maybeSingle();

      const { data, error } = await supabase.functions.invoke("generate-review-reply", {
        body: {
          review_text: review.texto,
          rating: review.rating || 3,
          business_name: biz?.nome,
          nicho: biz?.nicho,
          tom_de_voz: biz?.tom_de_voz,
          tone: (review.rating || 3) <= 2 ? "empatico" : "agradecido",
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await supabase.from("reviews").update({ resposta_sugerida_ia: data.reply }).eq("id", review.id);
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, resposta_sugerida_ia: data.reply } : r));
      toast.success("Resposta gerada com sucesso!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar resposta");
    } finally {
      setGeneratingId(null);
    }
  };

  const copyReply = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Resposta copiada!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = reviews.filter(r => {
    if (filterStar !== "all" && r.rating !== Number(filterStar)) return false;
    if (filterStatus === "responded" && !r.respondido) return false;
    if (filterStatus === "pending" && r.respondido) return false;
    if (searchTerm && !(r.texto?.toLowerCase().includes(searchTerm.toLowerCase()) || r.autor?.toLowerCase().includes(searchTerm.toLowerCase()))) return false;
    return true;
  });

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) : 0;
  const respondedPct = reviews.length ? Math.round((reviews.filter(r => r.respondido).length / reviews.length) * 100) : 0;

  if (loading) return <div className="space-y-4"><div className="h-8 w-48 bg-muted rounded animate-pulse" /><ListSkeleton rows={4} /></div>;
  if (error) return <ErrorState onRetry={loadReviews} />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Avaliações</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{autoMode ? "Automático" : "Manual"}</span>
            <Switch checked={autoMode} onCheckedChange={setAutoMode} />
          </div>
          {autoMode && (
            <Badge className="bg-success/10 text-success border-success/30">
              <span className="h-2 w-2 rounded-full bg-success mr-1.5 dot-pulse" />
              Respondendo automaticamente
            </Badge>
          )}
        </div>
      </div>

      <OnboardingTooltip id="reviews-auto">
        Ative o modo automático para não perder nenhuma avaliação
      </OnboardingTooltip>

      {reviews.length === 0 ? (
        <EmptyState
          icon={
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="text-warning">
              <circle cx="60" cy="60" r="45" stroke="currentColor" strokeWidth="3" fill="none" />
              <path d="M60 35l7 14 15 2-11 10 3 15-14-7-14 7 3-15-11-10 15-2z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
            </svg>
          }
          title="Nenhuma avaliação ainda"
          description="Compartilhe seu QR Code para coletar avaliações dos seus clientes no Google."
          actionLabel="Baixar QR Code de avaliação"
          actionIcon={<QrCode className="h-5 w-5 mr-2" />}
          onAction={() => toast.info("QR Code será gerado quando o Google Meu Negócio estiver conectado.")}
        />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="card-hover"><CardContent className="pt-5 pb-4 text-center">
              <div className="flex items-center justify-center gap-0.5 mb-1">
                {[1,2,3,4,5].map(i => <Star key={i} className={`h-4 w-4 ${i <= Math.round(avgRating) ? "fill-warning text-warning" : "text-muted"}`} />)}
              </div>
              <p className="text-3xl font-bold text-foreground"><CountUp end={avgRating} decimals={1} /></p>
              <p className="text-xs text-muted-foreground">Nota média</p>
            </CardContent></Card>
            <Card className="card-hover"><CardContent className="pt-5 pb-4 text-center">
              <p className="text-3xl font-bold text-foreground"><CountUp end={reviews.length} /></p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent></Card>
            <Card className="card-hover"><CardContent className="pt-5 pb-4 text-center">
              <p className="text-3xl font-bold text-foreground"><CountUp end={respondedPct} suffix="%" /></p>
              <p className="text-xs text-muted-foreground">Respondidas</p>
              <Badge className={`text-xs mt-1 ${respondedPct >= 80 ? "bg-success/10 text-success" : respondedPct >= 50 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
                {respondedPct >= 80 ? "Ótimo" : respondedPct >= 50 ? "Regular" : "Atenção"}
              </Badge>
            </CardContent></Card>
            <Card className="card-hover"><CardContent className="pt-5 pb-4 text-center">
              <TrendingUp className="h-6 w-6 text-success mx-auto mb-1" />
              <p className="text-sm font-medium text-foreground">Tendência</p>
              <p className="text-xs text-muted-foreground">Em alta</p>
            </CardContent></Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar avaliação..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterStar} onValueChange={setFilterStar}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Estrelas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {[5,4,3,2,1].map(s => <SelectItem key={s} value={String(s)}>{s}★</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pending">Sem resposta</SelectItem>
                <SelectItem value="responded">Respondidas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          <div className="space-y-4">
            {filtered.map((r) => (
              <Card key={r.id} className="card-hover">
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-bold text-muted-foreground">
                      {r.autor?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-foreground">{r.autor || "Anônimo"}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < (r.rating || 0) ? "fill-warning text-warning" : "text-muted"}`} />
                          ))}
                        </div>
                        {r.respondido && <Badge variant="secondary" className="text-xs">Respondida</Badge>}
                        {!r.respondido && <Badge variant="outline" className="text-xs border-warning/50 text-warning">Pendente</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{r.texto || "Sem texto"}</p>

                      {r.resposta_sugerida_ia && (
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="h-3 w-3 text-primary" />
                            <span className="text-xs font-medium text-primary">Resposta sugerida pela IA</span>
                          </div>
                          <p className="text-sm text-foreground">{r.resposta_sugerida_ia}</p>
                          <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs btn-press" onClick={() => copyReply(r.id, r.resposta_sugerida_ia!)}>
                            {copiedId === r.id ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                            {copiedId === r.id ? "Copiada" : "Copiar"}
                          </Button>
                        </div>
                      )}

                      {!r.resposta_sugerida_ia && (
                        <Button variant="outline" size="sm" className="h-8 text-xs btn-press" onClick={() => generateReply(r)} disabled={generatingId === r.id}>
                          {generatingId === r.id ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                          {generatingId === r.id ? "Gerando..." : "Gerar resposta com IA"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
