import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/usePageTitle";
import { OnboardingTooltip } from "@/components/shared/OnboardingTooltip";
import { MetricSkeleton } from "@/components/shared/LoadingStates";
import {
  Plus, AlertTriangle, Eye, MousePointerClick, DollarSign, TrendingUp,
  BarChart3, Pause, Play, Sparkles, Megaphone, Target, Zap, ArrowRight
}from "lucide-react";

type Campaign = {
  id: string;
  nome: string;
  status: string | null;
  tipo: string | null;
  verba_mensal: number | null;
  verba_restante: number | null;
  created_at: string | null;
  _adCount: number;
  _kwCount: number;
};

type AdsMetrics = {
  impressoes: number | null;
  cliques: number | null;
  cpc_medio: number | null;
  conversoes: number | null;
  gasto_total: number | null;
};

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ativa: { label: "Ativa", variant: "default" },
  pausada: { label: "Pausada", variant: "secondary" },
  rascunho: { label: "Rascunho", variant: "outline" },
  encerrada: { label: "Encerrada", variant: "destructive" },
};

export default function Ads() {
  usePageTitle("Anúncios Google");
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [metrics, setMetrics] = useState<AdsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAdsAccount, setHasAdsAccount] = useState(true);
  const [totalVerba, setTotalVerba] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: biz } = await supabase
        .from("businesses")
        .select("id, ads_customer_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!biz) { setLoading(false); return; }
      setHasAdsAccount(!!biz.ads_customer_id);

      // Campaigns
      const { data: camps } = await supabase
        .from("campaigns")
        .select("*")
        .eq("business_id", biz.id)
        .order("created_at", { ascending: false });

      if (camps && camps.length > 0) {
        // Get counts
        const campIds = camps.map(c => c.id);
        const enriched: Campaign[] = [];
        for (const c of camps) {
          const { count: adCount } = await supabase.from("ads").select("*", { count: "exact", head: true }).eq("campaign_id", c.id);
          const { count: kwCount } = await supabase.from("keywords").select("*", { count: "exact", head: true }).eq("campaign_id", c.id);
          enriched.push({ ...c, _adCount: adCount || 0, _kwCount: kwCount || 0 });
        }
        setCampaigns(enriched);
        setTotalVerba(camps.reduce((s, c) => s + (c.verba_mensal || 0), 0));
      }

      // Metrics
      const { data: met } = await supabase
        .from("ads_metrics")
        .select("*")
        .eq("business_id", biz.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setMetrics(met);
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  };

  const toggleCampaign = async (id: string, currentStatus: string | null) => {
    const newStatus = currentStatus === "ativa" ? "pausada" : "ativa";
    const { error } = await supabase.from("campaigns").update({ status: newStatus }).eq("id", id);
    if (error) { toast.error("Erro ao atualizar campanha"); return; }
    toast.success(newStatus === "ativa" ? "Campanha ativada" : "Campanha pausada");
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const gastoTotal = metrics?.gasto_total || 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <MetricSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Anúncios Google</h1>
        <Button onClick={() => navigate("/dashboard/ads/new")} className="btn-press">
          <Plus className="h-4 w-4 mr-2" />
          Nova campanha
        </Button>
      </div>

      <OnboardingTooltip id="ads-ai">
        Nossa IA pesquisa as melhores palavras-chave para o seu negócio
      </OnboardingTooltip>

      {!hasAdsAccount && (
        <Alert className="mb-6 border-warning/40 bg-warning/5">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm">
            Conecte sua conta Google Ads para ativar este módulo e sincronizar métricas em tempo real.
          </AlertDescription>
        </Alert>
      )}

      {campaigns.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Megaphone className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Você ainda não tem campanhas ativas</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Nossa IA vai criar uma campanha completa de Google Ads otimizada para o seu negócio em segundos.
          </p>
          <Button size="lg" onClick={() => navigate("/dashboard/ads/new")} className="mb-10">
            <Sparkles className="h-5 w-5 mr-2" />
            Criar minha primeira campanha com IA
          </Button>

          <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { icon: Target, title: "Palavras-chave inteligentes", desc: "A IA seleciona e nega termos automaticamente" },
              { icon: Zap, title: "Anúncios otimizados", desc: "Textos criados para maximizar cliques e conversões" },
              { icon: TrendingUp, title: "Otimização contínua", desc: "Ajustes semanais baseados em performance real" },
            ].map((item, i) => (
              <Card key={i} className="text-center">
                <CardContent className="pt-6">
                  <item.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="font-semibold text-sm mb-1">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Gasto / Verba", value: `R$${gastoTotal.toLocaleString("pt-BR")} / R$${totalVerba.toLocaleString("pt-BR")}`, icon: DollarSign },
              { label: "Impressões", value: (metrics?.impressoes || 0).toLocaleString("pt-BR"), icon: Eye },
              { label: "Cliques", value: (metrics?.cliques || 0).toLocaleString("pt-BR"), icon: MousePointerClick },
              { label: "CPC médio", value: `R$${(metrics?.cpc_medio || 0).toFixed(2)}`, icon: BarChart3 },
              { label: "Conversões", value: (metrics?.conversoes || 0).toLocaleString("pt-BR"), icon: TrendingUp },
            ].map((m, i) => (
              <Card key={i}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <m.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{m.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Campaign list */}
          <div className="space-y-4">
            {campaigns.map((camp) => {
              const st = STATUS_MAP[camp.status || "rascunho"] || STATUS_MAP.rascunho;
              const verbaUsada = (camp.verba_mensal || 0) - (camp.verba_restante || 0);
              const pct = camp.verba_mensal ? Math.min(100, (verbaUsada / camp.verba_mensal) * 100) : 0;

              return (
                <Card key={camp.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-5">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground truncate">{camp.nome}</h3>
                          <Badge variant={st.variant}>{st.label}</Badge>
                        </div>

                        {/* Verba bar */}
                        <div className="flex items-center gap-3 mb-3">
                          <Progress value={pct} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            R${verbaUsada.toLocaleString("pt-BR")} / R${(camp.verba_mensal || 0).toLocaleString("pt-BR")}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>{camp._kwCount} keywords</span>
                          <span>{camp._adCount} anúncios</span>
                          <span>Tipo: {camp.tipo || "search"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/ads/${camp.id}`)}>
                          Ver detalhes <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                        {camp.status !== "rascunho" && camp.status !== "encerrada" && (
                          <Button variant="ghost" size="icon" onClick={() => toggleCampaign(camp.id, camp.status)}>
                            {camp.status === "ativa" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
