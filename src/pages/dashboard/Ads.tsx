import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePageTitle } from "@/hooks/usePageTitle";
import { OnboardingTooltip } from "@/components/shared/OnboardingTooltip";
import { MetricSkeleton } from "@/components/shared/LoadingStates";
import { useAds } from "@/ads/hooks/useAds";
import { useAdMetrics } from "@/ads/hooks/useAdMetrics";
import { useGoogleAdsAuth } from "@/ads/hooks/useGoogleAdsAuth";
import { AdsLogPanel } from "@/ads/components/AdsLogPanel";
import { AgentStatusPanel } from "@/ads/components/AgentStatusPanel";
import { toast } from "sonner";
import {
  Plus, Eye, MousePointerClick, DollarSign, TrendingUp,
  BarChart3, Pause, Play, Sparkles, Megaphone, Target, Zap, ArrowRight,
  Link2, Unlink, CheckCircle2, Loader2
} from "lucide-react";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Ativa", variant: "default" },
  paused: { label: "Pausada", variant: "secondary" },
  draft: { label: "Rascunho", variant: "outline" },
  ended: { label: "Encerrada", variant: "destructive" },
};

export default function Ads() {
  usePageTitle("Anúncios Google");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { campaigns, loading, updateStatus } = useAds();
  const { totals, loading: metricsLoading } = useAdMetrics();
  const { isConnected, loading: authLoading, connect, disconnect, account, refetch } = useGoogleAdsAuth();

  // Handle OAuth callback params
  useEffect(() => {
    if (searchParams.get("ads_success") === "1") {
      const customerId = searchParams.get("customer_id");
      toast.success(
        customerId
          ? `Google Ads conectado! Customer ID: ${customerId}`
          : "Google Ads conectado com sucesso!"
      );
      setSearchParams({}, { replace: true });
      refetch();
    }
    if (searchParams.get("ads_error")) {
      const err = searchParams.get("ads_error");
      toast.error(`Erro na conexão Google Ads: ${err}`);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, refetch]);

  const totalBudget = campaigns.reduce((s, c) => s + (c.budget_daily || 0) * 30, 0);

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Anúncios Google</h1>
        <div className="flex items-center gap-2">
          {authLoading ? (
            <Button variant="outline" disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verificando...
            </Button>
          ) : isConnected ? (
            <div className="flex items-center gap-2">
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Google Ads conectado
                {account?.google_ads_customer_id && (
                  <span className="text-xs opacity-75 ml-1">({account.google_ads_customer_id})</span>
                )}
              </Badge>
              <Button variant="ghost" size="sm" onClick={disconnect}>
                <Unlink className="h-4 w-4 mr-1" />
                Desconectar
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={connect}>
              <Link2 className="h-4 w-4 mr-2" />
              Conectar Google Ads
            </Button>
          )}
          <Button onClick={() => navigate("/dashboard/ads/new")} className="btn-press">
            <Plus className="h-4 w-4 mr-2" />
            Nova campanha
          </Button>
        </div>
      </div>

      <OnboardingTooltip id="ads-ai">
        Nossa IA pesquisa as melhores palavras-chave para o seu negócio
      </OnboardingTooltip>

      {campaigns.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Megaphone className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Você ainda não tem campanhas</h2>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Nossa IA vai criar uma campanha completa de Google Ads otimizada para o seu negócio em segundos.
          </p>

          {!isConnected && !authLoading && (
            <Card className="max-w-md mx-auto mb-6 border-dashed border-primary/30">
              <CardContent className="pt-6 text-center">
                <Link2 className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="font-semibold text-sm mb-2">Conecte sua conta Google Ads</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Para publicar campanhas automaticamente, conecte sua conta do Google Ads.
                </p>
                <Button onClick={connect} variant="outline" size="sm">
                  <Link2 className="h-4 w-4 mr-2" />
                  Conectar Google Ads
                </Button>
              </CardContent>
            </Card>
          )}

          <Button size="lg" onClick={() => navigate("/dashboard/ads/new")} className="mb-10">
            <Sparkles className="h-5 w-5 mr-2" />
            Criar minha primeira campanha com IA
          </Button>

          <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            {[
              { icon: Target, title: "Palavras-chave inteligentes", desc: "A IA seleciona e nega termos automaticamente" },
              { icon: Zap, title: "Anúncios otimizados", desc: "Textos criados para maximizar cliques e conversões" },
              { icon: TrendingUp, title: "Otimização contínua", desc: "Ajustes baseados em performance real" },
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
          <AgentStatusPanel />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Gasto / Verba", value: `R$${totals.cost.toLocaleString("pt-BR")} / R$${totalBudget.toLocaleString("pt-BR")}`, icon: DollarSign },
              { label: "Impressões", value: totals.impressions.toLocaleString("pt-BR"), icon: Eye },
              { label: "Cliques", value: totals.clicks.toLocaleString("pt-BR"), icon: MousePointerClick },
              { label: "CTR médio", value: `${totals.ctr.toFixed(2)}%`, icon: BarChart3 },
              { label: "Conversões", value: totals.conversions.toLocaleString("pt-BR"), icon: TrendingUp },
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

          <div className="space-y-4 mb-8">
            {campaigns.map((camp) => {
              const st = STATUS_MAP[camp.status] || STATUS_MAP.draft;
              const budgetMonthly = (camp.budget_daily || 0) * 30;

              return (
                <Card key={camp.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-5">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground truncate">{camp.business_name}</h3>
                          <Badge variant={st.variant}>{st.label}</Badge>
                          {camp.performance_score > 0 && (
                            <Badge variant="outline" className="text-xs">Score: {camp.performance_score}</Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>R${budgetMonthly.toLocaleString("pt-BR")}/mês</span>
                          <span>{camp._kwCount || 0} keywords</span>
                          <span>{camp._adCount || 0} anúncios</span>
                          <span>{camp._negCount || 0} negativas</span>
                          {camp.city && <span>{camp.city}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/ads/${camp.id}`)}>
                          Ver detalhes <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                        {camp.status !== "draft" && camp.status !== "ended" && (
                          <Button variant="ghost" size="icon" onClick={() => updateStatus(camp.id, camp.status === "active" ? "paused" : "active")}>
                            {camp.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <AgentStatusPanel />
            <AdsLogPanel />
          </div>
        </>
      )}
    </div>
  );
}
