import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Sparkles, Loader2, TrendingUp, AlertCircle, CheckCircle2,
  Lightbulb, Copy, Check, RefreshCw, Star, FileText,
  Camera, MessageSquare, Search,
} from "lucide-react";

const PRIORIDADE_COLOR: Record<string, string> = {
  alta: "bg-destructive/10 text-destructive border-destructive/30",
  media: "bg-warning/10 text-warning border-warning/30",
  baixa: "bg-success/10 text-success border-success/30",
};

const CATEGORIA_ICON: Record<string, any> = {
  perfil: FileText,
  avaliacoes: Star,
  posts: Sparkles,
  fotos: Camera,
  "palavras-chave": Search,
};

export default function AiOptimizer() {
  usePageTitle("Otimizador GMB | LocalAI");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [bizData, setBizData] = useState<any>(null);

  useEffect(() => { loadBizData(); }, []);

  const loadBizData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: biz } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", user.id).limit(1).maybeSingle();
    if (biz) setBizData(biz);
  };

  const runAnalysis = async () => {
    if (!bizData) { toast.error("Dados do negócio não encontrados"); return; }
    setLoading(true);
    try {
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating, respondido")
        .eq("business_id", bizData.id);

      const { data: posts } = await supabase
        .from("posts")
        .select("id")
        .eq("business_id", bizData.id);

      const avg_rating = reviews?.length
        ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
        : 0;
      const responded_pct = reviews?.length
        ? Math.round(reviews.filter(r => r.respondido).length / reviews.length * 100)
        : 0;

      const { data, error } = await supabase.functions.invoke("ai-gmb-optimizer", {
        body: {
          business_id: bizData.id,
          nome: bizData.nome,
          nicho: bizData.nicho,
          cidade: bizData.cidade,
          estado: bizData.estado,
          tom_de_voz: bizData.tom_de_voz,
          publico_alvo: bizData.publico_alvo,
          diferenciais: bizData.diferenciais,
          produtos: bizData.produtos,
          avg_rating: avg_rating.toFixed(1),
          total_reviews: reviews?.length || 0,
          responded_pct,
          posts_count: posts?.length || 0,
          has_logo: !!bizData.logo_url,
          has_photos: !!bizData.logo_url,
          has_website: !!bizData.website_url,
          has_whatsapp: !!bizData.whatsapp,
        },
      });
      if (error) throw error;
      setReport(data);
    } catch (e: any) {
      toast.error(e.message || "Erro na análise");
    } finally {
      setLoading(false);
    }
  };

  const copyDesc = () => {
    if (report?.descricao_sugerida) {
      navigator.clipboard.writeText(report.descricao_sugerida);
      setCopiedDesc(true);
      toast.success("Descrição copiada!");
      setTimeout(() => setCopiedDesc(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Otimizador GMB</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Análise completa do seu perfil Google Meu Negócio com recomendações personalizadas
          </p>
        </div>
        <Button onClick={runAnalysis} disabled={loading}>
          {loading
            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analisando...</>
            : <><Sparkles className="h-4 w-4 mr-2" /> {report ? "Reanalisar" : "Analisar perfil"}</>}
        </Button>
      </div>

      {/* Estado inicial */}
      {!report && !loading && (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Descubra como otimizar seu perfil</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              A IA analisa todos os dados do seu negócio e gera um diagnóstico completo
              com ações priorizadas para melhorar seu ranking no Google.
            </p>
            <Button onClick={runAnalysis} size="lg">
              <Sparkles className="h-4 w-4 mr-2" /> Iniciar análise gratuita
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">
              Analisando seu perfil, avaliações e atividade...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Resultado */}
      {report && !loading && (
        <div className="space-y-6">
          {/* Score geral */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="md:col-span-2">
              <CardContent className="py-6 flex items-center gap-6">
                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                    <circle
                      cx="40" cy="40" r="32" fill="none"
                      stroke={report.score >= 70 ? "hsl(var(--success))" : report.score >= 40 ? "hsl(var(--warning))" : "hsl(var(--destructive))"}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={2 * Math.PI * 32 * (1 - report.score / 100)}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">{report.score}</span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Score do Perfil</p>
                  <p className="text-xs text-muted-foreground">{report.diagnostico}</p>
                </div>
              </CardContent>
            </Card>
            {report.score_breakdown && Object.entries(report.score_breakdown).map(([key, val]: [string, any]) => (
              <Card key={key}>
                <CardContent className="py-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{val}<span className="text-sm text-muted-foreground">/25</span></p>
                  <p className="text-xs text-muted-foreground capitalize mt-1">{key}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Próxima ação */}
          {report.proxima_acao && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-4 flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-medium text-primary uppercase tracking-wide mb-0.5">Ação prioritária agora</p>
                  <p className="text-sm font-semibold text-foreground">{report.proxima_acao}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Otimizações */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Plano de Otimização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.otimizacoes?.map((o: any, i: number) => {
                const Icon = CATEGORIA_ICON[o.categoria] || Sparkles;
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium">{o.titulo}</span>
                        <Badge className={`text-xs ${PRIORIDADE_COLOR[o.prioridade]}`}>
                          {o.prioridade}
                        </Badge>
                        {o.acao_rapida && (
                          <Badge className="text-xs bg-success/10 text-success">⚡ Rápido</Badge>
                        )}
                        {o.impacto_estimado && (
                          <span className="text-xs text-success font-medium">{o.impacto_estimado}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{o.descricao}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Descrição sugerida */}
          {report.descricao_sugerida && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Descrição otimizada para SEO</CardTitle>
                  <Button variant="outline" size="sm" onClick={copyDesc}>
                    {copiedDesc ? <><Check className="h-3 w-3 mr-1" /> Copiada</> : <><Copy className="h-3 w-3 mr-1" /> Copiar</>}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed bg-muted p-3 rounded-lg">
                  {report.descricao_sugerida}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Cole esta descrição no campo "Descrição" do seu perfil Google Meu Negócio.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Palavras-chave locais */}
          {report.palavras_chave_locais?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Palavras-chave locais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {report.palavras_chave_locais.map((kw: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-sm">{kw}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Use esses termos naturalmente nos seus posts, descrição e respostas às avaliações.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Melhor horário */}
          {report.melhor_horario_posts && (
            <Card>
              <CardContent className="py-4 flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Melhor horário para postar</p>
                  <p className="text-sm font-semibold">{report.melhor_horario_posts}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
