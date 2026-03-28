import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/usePageTitle";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListSkeleton } from "@/components/shared/LoadingStates";
import { ErrorState } from "@/components/shared/ErrorState";
import {
  Plus, Calendar, List, FileText, Clock, CheckCircle2, XCircle, Sparkles, Loader2,
} from "lucide-react";

type Post = {
  id: string;
  texto: string | null;
  tipo: string | null;
  status: string | null;
  agendado_para: string | null;
  publicado_em: string | null;
  created_at: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  publicado: "bg-success/10 text-success",
  agendado: "bg-primary/10 text-primary",
  rascunho: "bg-warning/10 text-warning",
  erro: "bg-destructive/10 text-destructive",
};

export default function Posts() {
  usePageTitle("Posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [autoGen, setAutoGen] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Weekly planner states
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [plannerData, setPlannerData] = useState<any>(null);
  const [plannerLoading, setPlannerLoading] = useState(false);

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: biz } = await supabase.from("businesses").select("id").eq("user_id", user.id).limit(1).maybeSingle();
      if (!biz) { setLoading(false); return; }
      const { data, error: err } = await supabase.from("posts").select("*").eq("business_id", biz.id).order("created_at", { ascending: false });
      if (err) throw err;
      setPosts(data || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const generatePost = async () => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: biz } = await supabase.from("businesses").select("id, nome, nicho, tom_de_voz").eq("user_id", user.id).limit(1).maybeSingle();
      if (!biz) throw new Error("Negócio não encontrado");

      const { data, error } = await supabase.functions.invoke("generate-post", {
        body: { tipo: "generico", business_name: biz.nome, nicho: biz.nicho, tom_de_voz: biz.tom_de_voz },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.variations?.[0]) {
        await supabase.from("posts").insert({
          business_id: biz.id, texto: data.variations[0], status: "rascunho", tipo: "generico",
        });
        toast.success("Post gerado e salvo como rascunho!");
        loadPosts();
      }
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar post");
    } finally {
      setGenerating(false);
    }
  };

  const generateWeeklyPlan = async () => {
    setPlannerLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: biz } = await supabase
        .from("businesses")
        .select("id, nome, nicho, tom_de_voz, produtos, promocoes, diferenciais, cidade")
        .eq("user_id", user.id).limit(1).maybeSingle();
      if (!biz) throw new Error("Negócio não encontrado");

      const { data: revs } = await supabase
        .from("reviews")
        .select("rating")
        .eq("business_id", biz.id);
      const avg = revs?.length
        ? (revs.reduce((s, r) => s + (r.rating || 0), 0) / revs.length).toFixed(1)
        : null;

      const { data, error } = await supabase.functions.invoke("ai-weekly-planner", {
        body: { business_id: biz.id, ...biz, avg_rating: avg },
      });
      if (error) throw error;
      setPlannerData(data);
      toast.success("Plano semanal gerado! 4 rascunhos salvos.");
      loadPosts();
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar plano");
    } finally {
      setPlannerLoading(false);
    }
  };

  if (loading) return <div className="space-y-4"><div className="h-8 w-48 bg-muted rounded animate-pulse" /><ListSkeleton rows={3} /></div>;
  if (error) return <ErrorState onRetry={loadPosts} />;

  const drafts = posts.filter(p => p.status === "rascunho");
  const allSorted = [...posts].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Posts</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Automático</span>
            <Switch checked={autoGen} onCheckedChange={setAutoGen} />
          </div>
          <Button
            variant="outline"
            onClick={() => setPlannerOpen(o => !o)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Planejar semana com IA
          </Button>
          <Button onClick={generatePost} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Post avulso
          </Button>
        </div>
      </div>

      {/* Painel planejador semanal */}
      {plannerOpen && (
        <Card className="mb-6 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Planejador Semanal com IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              A IA cria 4 posts otimizados para a semana, considerando seu nicho, datas comemorativas
              e o melhor horário para publicar. Os posts são salvos como rascunhos para você revisar.
            </p>
            <Button onClick={generateWeeklyPlan} disabled={plannerLoading} className="w-full sm:w-auto">
              {plannerLoading
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gerando plano...</>
                : <><Sparkles className="h-4 w-4 mr-2" /> Gerar plano desta semana</>}
            </Button>

            {plannerData && (
              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {plannerData.semana}
                </p>
                {plannerData.posts?.map((p: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-muted border border-border space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{p.dia}</Badge>
                      <Badge className="text-xs bg-primary/10 text-primary">{p.tipo}</Badge>
                      <span className="text-xs text-muted-foreground">{p.horario_sugerido}</span>
                    </div>
                    <p className="text-sm text-foreground">{p.texto}</p>
                    <p className="text-xs text-muted-foreground italic">{p.justificativa}</p>
                  </div>
                ))}
                {plannerData.dica_semana && (
                  <div className="p-3 rounded-lg bg-success/5 border border-success/20 flex gap-2">
                    <Sparkles className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <p className="text-xs text-success">{plannerData.dica_semana}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {posts.length === 0 ? (
        <EmptyState
          icon={
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="text-primary">
              <rect x="25" y="20" width="70" height="80" rx="8" stroke="currentColor" strokeWidth="3" fill="none" />
              <line x1="40" y1="45" x2="80" y2="45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="40" y1="55" x2="75" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="40" y1="65" x2="65" y2="65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="55" cy="35" r="3" fill="currentColor" />
            </svg>
          }
          title="Nenhum post ainda"
          description="Crie posts automaticamente com IA ou escreva manualmente para publicar no Google Meu Negócio."
          actionLabel="Gerar meu primeiro post"
          actionIcon={<Sparkles className="h-5 w-5 mr-2" />}
          onAction={generatePost}
          secondaryLabel="Criar manualmente"
          onSecondary={() => toast.info("Em breve: editor manual de posts")}
        />
      ) : (
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendar"><Calendar className="h-4 w-4 mr-1" /> Calendário</TabsTrigger>
            <TabsTrigger value="list"><List className="h-4 w-4 mr-1" /> Lista</TabsTrigger>
            <TabsTrigger value="drafts"><FileText className="h-4 w-4 mr-1" /> Rascunhos ({drafts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Visualização de calendário em breve</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="space-y-3">
            {allSorted.map((p) => (
              <Card key={p.id} className="card-hover">
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-xs ${STATUS_COLORS[p.status || "rascunho"]}`}>
                          {p.status === "agendado" && <Clock className="h-3 w-3 mr-1" />}
                          {p.status === "publicado" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {p.status === "erro" && <XCircle className="h-3 w-3 mr-1" />}
                          {p.status || "rascunho"}
                        </Badge>
                        {p.tipo && <Badge variant="outline" className="text-xs">{p.tipo}</Badge>}
                        <span className="text-xs text-muted-foreground">
                          {p.agendado_para ? new Date(p.agendado_para).toLocaleDateString("pt-BR") : p.created_at ? new Date(p.created_at).toLocaleDateString("pt-BR") : ""}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{p.texto || "Sem conteúdo"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="drafts" className="space-y-3">
            {drafts.length === 0 ? (
              <Card><CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Nenhum rascunho</p>
              </CardContent></Card>
            ) : (
              drafts.map((p) => (
                <Card key={p.id} className="card-hover">
                  <CardContent className="py-4">
                    <p className="text-sm text-foreground mb-3">{p.texto}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="btn-press text-xs">Agendar</Button>
                      <Button size="sm" className="btn-press text-xs">Publicar agora</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
