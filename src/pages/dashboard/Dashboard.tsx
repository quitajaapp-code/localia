import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Map,
  MousePointerClick,
  PhoneCall,
  Navigation,
  DollarSign,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Star,
  Calendar,
  Sparkles,
  Wifi,
  WifiOff,
  Play,
  Pause,
  Plus,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

// Gauge component
function ScoreGauge({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score <= 40 ? "hsl(var(--destructive))" : score <= 70 ? "#eab308" : "#22c55e";

  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, change, changeLabel }: {
  icon: React.ElementType; label: string; value: string; change: number; changeLabel?: string;
}) {
  const positive = change >= 0;
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          {change !== 0 && (
            <div className={`flex items-center gap-1 text-xs font-medium ${positive ? "text-green-600" : "text-destructive"}`}>
              {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {positive ? "+" : ""}{change}%
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{changeLabel || label}</p>
      </CardContent>
    </Card>
  );
}

const MOCK_REVIEWS = [
  { id: "1", autor: "Maria S.", rating: 5, texto: "Atendimento excelente! Voltarei com certeza. Profissionais muito atenciosos e ambiente agradável." },
  { id: "2", autor: "João P.", rating: 4, texto: "Muito bom, mas poderia melhorar o estacionamento. No mais, ótimo serviço." },
  { id: "3", autor: "Ana R.", rating: 3, texto: "Serviço ok, mas demorou um pouco. Esperava mais agilidade no atendimento." },
];

const MOCK_POSTS = [
  { id: "1", texto: "🎉 Novidade! Agora temos delivery para toda a região. Peça já pelo WhatsApp!", agendado_para: "2026-03-28T10:00:00", status: "agendado" },
  { id: "2", texto: "⭐ Obrigado por mais de 100 avaliações 5 estrelas! Vocês são incríveis!", agendado_para: "2026-03-30T14:00:00", status: "agendado" },
  { id: "3", texto: "📸 Confira nosso novo cardápio de verão! Sabores frescos e deliciosos.", agendado_para: "2026-04-01T09:00:00", status: "agendado" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<{ nome: string | null; plano: string | null; trial_ends_at: string | null } | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      toast.call(null, {
        title: "🎉 Bem-vindo ao LocalAI!",
        description: "Seu plano foi ativado com sucesso. Vamos configurar tudo!",
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("nome, plano, trial_ends_at").eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });
    supabase.from("businesses").select("score_materiais").eq("user_id", user.id).limit(1).single()
      .then(({ data }) => { if (data) setScore(data.score_materiais ?? 0); });
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  const trialDays = profile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting()}, {profile?.nome || "usuário"}! 👋
          </h1>
          <p className="text-muted-foreground text-sm">Aqui está o resumo do seu negócio.</p>
        </div>
        <Button asChild>
          <Link to="/onboarding/business"><Plus className="h-4 w-4 mr-2" /> Adicionar negócio</Link>
        </Button>
      </div>

      {/* Trial banner */}
      {profile?.plano === "trial" && trialDays > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {trialDays} {trialDays === 1 ? "dia restante" : "dias restantes"} no seu trial
              </p>
              <p className="text-xs text-muted-foreground">Ative seu plano para não perder acesso.</p>
            </div>
            <Button size="sm" asChild><Link to="/pricing">Ativar plano</Link></Button>
          </CardContent>
        </Card>
      )}

      {/* Score & Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-muted-foreground mb-3">Score de Eficiência</p>
            <ScoreGauge score={score} />
            <Link to="/dashboard/materials" className="text-xs text-primary hover:underline mt-3">
              Melhorar score →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm font-medium text-muted-foreground">Google Meu Negócio</p>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <Wifi className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Conectado</p>
                <p className="text-xs text-muted-foreground">Última sincronização: hoje</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">Reconectar</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm font-medium text-muted-foreground">Google Ads</p>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Play className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">1 campanha ativa</p>
                <p className="text-xs text-muted-foreground">Verba restante: R$ 450</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/dashboard/ads">Ver campanhas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* GMB Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Métricas Google Meu Negócio</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={Map} label="Visualizações no Maps" value="1.247" change={12} />
          <MetricCard icon={MousePointerClick} label="Cliques no site" value="328" change={8} />
          <MetricCard icon={PhoneCall} label="Ligações recebidas" value="47" change={-5} />
          <MetricCard icon={Navigation} label="Pedidos de rota" value="89" change={15} />
        </div>
      </div>

      {/* Ads Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Métricas Google Ads</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={DollarSign} label="Gasto da semana" value="R$ 150" change={0} changeLabel="de R$ 600 total" />
          <MetricCard icon={MousePointerClick} label="Cliques nos anúncios" value="214" change={22} />
          <MetricCard icon={BarChart3} label="CTR médio" value="4.8%" change={10} />
          <MetricCard icon={DollarSign} label="CPC médio" value="R$ 0,70" change={-8} />
        </div>
      </div>

      {/* Reviews & Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reviews */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Avaliações Recentes</CardTitle>
              <Link to="/dashboard/reviews" className="text-xs text-primary hover:underline flex items-center gap-1">
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_REVIEWS.map((r) => (
              <div key={r.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-foreground">{r.autor}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{r.texto}</p>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" /> Responder com IA
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Posts */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Próximos Posts</CardTitle>
              <Link to="/dashboard/posts" className="text-xs text-primary hover:underline flex items-center gap-1">
                Gerenciar posts <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_POSTS.map((p) => (
              <div key={p.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(p.agendado_para).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <Badge variant={p.status === "agendado" ? "secondary" : p.status === "publicado" ? "default" : "destructive"} className="text-xs">
                    {p.status === "agendado" && <Clock className="h-3 w-3 mr-1" />}
                    {p.status === "publicado" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {p.status === "erro" && <XCircle className="h-3 w-3 mr-1" />}
                    {p.status}
                  </Badge>
                </div>
                <p className="text-sm text-foreground line-clamp-2">{p.texto}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestion */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10 shrink-0">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Sugestão da IA esta semana</h3>
            <p className="text-sm text-muted-foreground">
              Esta semana, adicionar fotos do cardápio pode aumentar suas visualizações em 40%. 
              Negócios com fotos atualizadas recebem 2x mais cliques no Google Maps. 
              Que tal enviar 3 fotos novas dos seus pratos mais populares?
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              <Sparkles className="h-3 w-3 mr-1" /> Aplicar sugestão
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
