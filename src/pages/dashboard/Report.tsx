import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import {
  Download, Sparkles, Eye, MousePointerClick, Phone, Star,
  MessageSquare, FileText, TrendingUp, TrendingDown, Megaphone,
  CheckCircle, ArrowRight, Lightbulb, BarChart3, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ReportData {
  // Reviews
  totalReviews: number;
  avgRating: number;
  respondedPct: number;
  recentReviews: Array<{ autor: string; rating: number; texto: string; respondido: boolean; created_at: string }>;
  ratingEvolution: Array<{ semana: string; nota: number }>;
  // Posts
  totalPosts: number;
  publishedThisMonth: number;
  recentPosts: Array<{ texto: string; status: string; created_at: string; publicado_em: string | null }>;
  // Business
  businessName: string;
  businessNicho: string;
  hasGmb: boolean;
  hasAds: boolean;
  // Agent actions
  agentActions: Array<{ agent: string; action_type: string; created_at: string; output_data: Record<string, unknown> }>;
}

function MetricCard({ icon: Icon, label, value, change, positive }: {
  icon: React.ElementType; label: string; value: string; change?: string; positive?: boolean;
}) {
  return (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          {change && (
            <div className={`flex items-center gap-1 text-xs font-medium ${positive ? "text-success" : "text-destructive"}`}>
              {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {change}
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

export default function Report() {
  usePageTitle("Relatório | LocalAI");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("atual");
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => { loadData(); }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: biz } = await supabase
        .from("businesses")
        .select("id, nome, nicho, gmb_location_id, ads_customer_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!biz) { setLoading(false); return; }

      // Period filter
      const now = new Date();
      let since = new Date();
      if (period === "atual") since.setDate(now.getDate() - 7);
      else if (period === "passada") { since.setDate(now.getDate() - 14); now.setDate(now.getDate() - 7); }
      else since.setDate(now.getDate() - 30);

      // Reviews
      const { data: reviews } = await supabase
        .from("reviews")
        .select("autor, rating, texto, respondido, created_at")
        .eq("business_id", biz.id)
        .order("created_at", { ascending: false });

      const allReviews = reviews || [];
      const avgRating = allReviews.length
        ? allReviews.reduce((s, r) => s + (r.rating || 0), 0) / allReviews.length
        : 0;
      const respondedPct = allReviews.length
        ? Math.round(allReviews.filter(r => r.respondido).length / allReviews.length * 100)
        : 0;

      // Rating evolution (últimas 4 semanas)
      const ratingEvolution = Array.from({ length: 4 }, (_, i) => {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (3 - i) * 7 - 7);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - (3 - i) * 7);
        const weekReviews = allReviews.filter(r => {
          const d = new Date(r.created_at || 0);
          return d >= weekStart && d < weekEnd;
        });
        const nota = weekReviews.length
          ? weekReviews.reduce((s, r) => s + (r.rating || 0), 0) / weekReviews.length
          : avgRating;
        return { semana: `Sem ${i + 1}`, nota: parseFloat(nota.toFixed(1)) };
      });

      // Posts
      const { data: posts } = await supabase
        .from("posts")
        .select("texto, status, created_at, publicado_em")
        .eq("business_id", biz.id)
        .order("created_at", { ascending: false })
        .limit(20);

      const allPosts = posts || [];
      const publishedThisMonth = allPosts.filter(p => {
        const d = new Date(p.created_at || 0);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
          && p.status === "publicado";
      }).length;

      // Agent actions (últimas 10)
      const { data: actions } = await supabase
        .from("agent_actions")
        .select("agent, action_type, created_at, output_data")
        .eq("business_id", biz.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setData({
        totalReviews: allReviews.length,
        avgRating,
        respondedPct,
        recentReviews: allReviews.slice(0, 3) as ReportData["recentReviews"],
        ratingEvolution,
        totalPosts: allPosts.length,
        publishedThisMonth,
        recentPosts: allPosts.slice(0, 3) as ReportData["recentPosts"],
        businessName: biz.nome,
        businessNicho: biz.nicho || "",
        hasGmb: !!biz.gmb_location_id,
        hasAds: !!biz.ads_customer_id,
        agentActions: (actions || []) as ReportData["agentActions"],
      });
    } catch (err) {
      console.error("Report load error:", err);
      toast.error("Erro ao carregar relatório");
    } finally {
      setLoading(false);
    }
  };

  const agentActionLabel = (agent: string, type: string) => {
    const labels: Record<string, string> = {
      "reviews:reply_generated": "Resposta sugerida pela IA",
      "posts:post_created": "Post criado pela IA",
      "profile:profile_audit": "Auditoria de perfil GMB",
      "ads:campaign_created": "Campanha de Ads criada",
    };
    return labels[`${agent}:${type}`] || `${agent} — ${type}`;
  };

  const nextSteps = [
    data?.respondedPct !== undefined && data.respondedPct < 80 && {
      titulo: "Responder avaliações pendentes",
      desc: `${100 - data.respondedPct}% das avaliações ainda sem resposta — prejudica o ranking`,
      action: "/dashboard/reviews",
      label: "Ver avaliações",
    },
    data?.hasGmb === false && {
      titulo: "Conectar Google Meu Negócio",
      desc: "Sem conexão GMB os dados de busca e posts automáticos não funcionam",
      action: "/dashboard/settings",
      label: "Conectar agora",
    },
    data?.publishedThisMonth !== undefined && data.publishedThisMonth < 4 && {
      titulo: "Publicar mais posts este mês",
      desc: `Apenas ${data.publishedThisMonth} publicados — recomendamos 4+/mês para manter o perfil ativo`,
      action: "/dashboard/posts",
      label: "Criar posts",
    },
  ].filter(Boolean) as Array<{ titulo: string; desc: string; action: string; label: string }>;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Cadastre um negócio para ver o relatório.</p>
        <Button onClick={() => navigate("/dashboard/settings")}>Configurar negócio</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">{data.businessName}</h1>
          <p className="text-sm text-muted-foreground">{data.businessNicho}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="atual">Esta semana</SelectItem>
              <SelectItem value="passada">Semana passada</SelectItem>
              <SelectItem value="30dias">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-1" /> Exportar
          </Button>
        </div>
      </div>

      {/* 1. Avaliações */}
      <div>
        <h2 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-warning" /> Avaliações
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <MetricCard icon={Star} label="Nota média" value={data.avgRating.toFixed(1) + " ★"} />
          <MetricCard icon={MessageSquare} label="Total de avaliações" value={String(data.totalReviews)} />
          <MetricCard
            icon={CheckCircle}
            label="Respondidas"
            value={data.respondedPct + "%"}
            change={data.respondedPct >= 80 ? "Ótimo" : data.respondedPct >= 50 ? "Regular" : "Atenção"}
            positive={data.respondedPct >= 80}
          />
          <MetricCard icon={TrendingUp} label="Avaliações positivas" value={
            data.totalReviews > 0
              ? Math.round(data.recentReviews.filter(r => (r.rating || 0) >= 4).length / Math.max(data.recentReviews.length, 1) * 100) + "%"
              : "—"
          } />
        </div>

        {/* Evolução da nota */}
        {data.ratingEvolution.some(r => r.nota > 0) && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Evolução da nota — 4 semanas</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data.ratingEvolution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="semana" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Line type="monotone" dataKey="nota" name="Nota" stroke="hsl(var(--warning))" strokeWidth={2} dot={{ fill: "hsl(var(--warning))", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Avaliações recentes */}
        {data.recentReviews.length > 0 && (
          <div className="mt-4 space-y-3">
            {data.recentReviews.map((r, i) => (
              <Card key={i}>
                <CardContent className="py-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                    {(r.autor || "?").charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{r.autor || "Anônimo"}</span>
                      <span className="text-warning text-xs">{"★".repeat(r.rating || 0)}</span>
                      {r.respondido
                        ? <Badge variant="secondary" className="text-xs">Respondida</Badge>
                        : <Badge variant="outline" className="text-xs border-warning/50 text-warning">Pendente</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{r.texto || "Sem texto"}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Link to="/dashboard/reviews" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todas as avaliações <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>

      {/* 2. Posts */}
      <div>
        <h2 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" /> Posts
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <MetricCard icon={FileText} label="Total de posts" value={String(data.totalPosts)} />
          <MetricCard icon={CheckCircle} label="Publicados este mês" value={String(data.publishedThisMonth)} />
          <MetricCard
            icon={data.publishedThisMonth >= 4 ? TrendingUp : AlertCircle}
            label="Meta mensal (4 posts)"
            value={data.publishedThisMonth >= 4 ? "Atingida ✓" : `${data.publishedThisMonth}/4`}
            positive={data.publishedThisMonth >= 4}
          />
        </div>

        {data.recentPosts.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Posts recentes</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {data.recentPosts.map((p, i) => (
                <div key={i} className={`p-3 rounded-lg border text-sm ${i === 0 ? "border-primary/40 bg-primary/5" : ""}`}>
                  {i === 0 && <Badge className="text-xs mb-2 bg-primary/10 text-primary">Mais recente</Badge>}
                  <p className="text-xs text-muted-foreground mb-1">
                    {p.publicado_em
                      ? new Date(p.publicado_em).toLocaleDateString("pt-BR")
                      : new Date(p.created_at || 0).toLocaleDateString("pt-BR")}
                    {" · "}
                    <span className={p.status === "publicado" ? "text-success" : "text-warning"}>{p.status}</span>
                  </p>
                  <p className="text-foreground line-clamp-2">{p.texto}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* 3. Presença GMB (dados via API — placeholder informativo) */}
      {data.hasGmb && (
        <div>
          <h2 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Presença no Google
          </h2>
          <Card>
            <CardContent className="py-8 text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-medium">Métricas de busca e Maps</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Dados de visualizações, cliques e ligações são obtidos via Google Meu Negócio Insights API.
                Disponível após configuração da integração completa com GMB.
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/settings")}>
                Configurar integração GMB
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4. Ações da IA */}
      {data.agentActions.length > 0 && (
        <div>
          <h2 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Ações dos Agentes IA
          </h2>
          <Card>
            <CardContent className="py-4 space-y-3">
              {data.agentActions.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString("pt-BR")}
                    </span>
                    <p className="text-sm text-foreground">{agentActionLabel(a.agent, a.action_type)}</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-success shrink-0 mt-1" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 5. Próximos passos */}
      {nextSteps.length > 0 && (
        <div>
          <h2 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" /> Próximos Passos Recomendados
          </h2>
          <div className="grid gap-3">
            {nextSteps.map((s, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-warning">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-foreground">{s.titulo}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(s.action)}>
                    {s.label} <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
