import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {
  ArrowLeft, Pause, Play, Edit, Sparkles, Eye, MousePointerClick,
  DollarSign, TrendingUp, BarChart3, Trash2, MinusCircle, Clock,
  CheckCircle, AlertTriangle, Search, ShieldOff, Plus
} from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

type Campaign = {
  id: string; nome: string; status: string | null; tipo: string | null;
  verba_mensal: number | null; verba_restante: number | null;
};

type Keyword = {
  id: string; termo: string; match_type: string | null;
  impressoes: number | null; cliques: number | null; cpc_atual: number | null;
  conversoes: number | null; status: string | null;
};

type Ad = {
  id: string; headlines: Json; descriptions: Json;
  impressoes: number | null; cliques: number | null; ctr: number | null;
  cpc: number | null; status: string | null;
};

type NegKeyword = {
  id: string; termo: string; match_type: string | null;
};

const MATCH_LABELS: Record<string, string> = { exact: "Exata", phrase: "Frase", broad: "Ampla" };

// Mock chart data
const generateChartData = () => {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      dia: `${d.getDate()}/${d.getMonth() + 1}`,
      impressoes: Math.floor(Math.random() * 500 + 100),
      cliques: Math.floor(Math.random() * 40 + 5),
    });
  }
  return data;
};

// Mock search terms
const MOCK_SEARCH_TERMS = [
  { termo: "dentista perto de mim", impressoes: 120, cliques: 18, custo: 54, relevancia: "relevante" },
  { termo: "dentista barato", impressoes: 80, cliques: 10, custo: 35, relevancia: "relevante" },
  { termo: "curso de odontologia", impressoes: 45, cliques: 2, custo: 8, relevancia: "irrelevante" },
  { termo: "vaga dentista", impressoes: 30, cliques: 1, custo: 4, relevancia: "irrelevante" },
  { termo: "clareamento dental preço", impressoes: 95, cliques: 14, custo: 42, relevancia: "relevante" },
  { termo: "como ser dentista", impressoes: 25, cliques: 0, custo: 0, relevancia: "irrelevante" },
  { termo: "implante dentário valor", impressoes: 110, cliques: 16, custo: 64, relevancia: "relevante" },
];

// Mock optimizations
const MOCK_OPTIMIZATIONS = [
  { data: "20/03/2026", acao: "12 keywords negativas adicionadas", impacto: "Economia estimada: R$180/mês" },
  { data: "13/03/2026", acao: "3 keywords com CTR < 0.5% pausadas", impacto: "CPC médio reduzido em 15%" },
  { data: "06/03/2026", acao: "Novo anúncio criado com headlines otimizados", impacto: "CTR esperado +20%" },
  { data: "27/02/2026", acao: "Lance ajustado em 8 keywords de alta intenção", impacto: "Posição média melhorou de 3.2 para 2.1" },
];

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [negKeywords, setNegKeywords] = useState<NegKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [kwFilter, setKwFilter] = useState("todas");
  const [stFilter, setStFilter] = useState("todos");
  const [chartData] = useState(generateChartData);

  useEffect(() => {
    if (id) loadAll();
  }, [id]);

  const loadAll = async () => {
    try {
      const [campRes, kwRes, adRes, negRes] = await Promise.all([
        supabase.from("campaigns").select("*").eq("id", id!).single(),
        supabase.from("keywords").select("*").eq("campaign_id", id!),
        supabase.from("ads").select("*").eq("campaign_id", id!),
        supabase.from("negative_keywords").select("*").eq("campaign_id", id!),
      ]);
      if (campRes.data) setCampaign(campRes.data);
      if (kwRes.data) setKeywords(kwRes.data);
      if (adRes.data) setAds(adRes.data);
      if (negRes.data) setNegKeywords(negRes.data);
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    if (!campaign) return;
    const newStatus = campaign.status === "ativa" ? "pausada" : "ativa";
    const { error } = await supabase.from("campaigns").update({ status: newStatus }).eq("id", campaign.id);
    if (error) { toast.error("Erro ao atualizar"); return; }
    setCampaign({ ...campaign, status: newStatus });
    toast.success(newStatus === "ativa" ? "Campanha ativada" : "Campanha pausada");
  };

  const pauseKeyword = async (kwId: string) => {
    const { error } = await supabase.from("keywords").update({ status: "pausada" }).eq("id", kwId);
    if (error) { toast.error("Erro"); return; }
    setKeywords(prev => prev.map(k => k.id === kwId ? { ...k, status: "pausada" } : k));
    toast.success("Keyword pausada");
  };

  const removeKeyword = async (kwId: string) => {
    const { error } = await supabase.from("keywords").delete().eq("id", kwId);
    if (error) { toast.error("Erro"); return; }
    setKeywords(prev => prev.filter(k => k.id !== kwId));
    toast.success("Keyword removida");
  };

  const addNegative = async (termo: string) => {
    if (!id) return;
    const { error } = await supabase.from("negative_keywords").insert({ campaign_id: id, termo, match_type: "exact" });
    if (error) { toast.error("Erro"); return; }
    toast.success(`"${termo}" adicionada como negativa`);
    loadAll();
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!campaign) {
    return <div className="text-center py-16"><p className="text-muted-foreground">Campanha não encontrada</p><Button variant="outline" onClick={() => navigate("/dashboard/ads")} className="mt-4">Voltar</Button></div>;
  }

  const totalImpr = keywords.reduce((s, k) => s + (k.impressoes || 0), 0);
  const totalClicks = keywords.reduce((s, k) => s + (k.cliques || 0), 0);
  const avgCtr = totalImpr > 0 ? ((totalClicks / totalImpr) * 100).toFixed(2) : "0";
  const avgCpc = totalClicks > 0 ? (keywords.reduce((s, k) => s + (k.cpc_atual || 0) * (k.cliques || 0), 0) / totalClicks).toFixed(2) : "0";
  const totalConv = keywords.reduce((s, k) => s + (k.conversoes || 0), 0);
  const statusInfo = campaign.status === "ativa" ? { label: "Ativa", variant: "default" as const } : campaign.status === "pausada" ? { label: "Pausada", variant: "secondary" as const } : { label: campaign.status || "Rascunho", variant: "outline" as const };

  const getKwPerf = (k: Keyword) => {
    const ctr = k.impressoes && k.cliques ? (k.cliques / k.impressoes) * 100 : 0;
    if (ctr >= 3) return "boa";
    if (ctr >= 1) return "regular";
    return "ruim";
  };

  const filteredKw = kwFilter === "todas" ? keywords : keywords.filter(k => getKwPerf(k) === kwFilter);
  const filteredST = stFilter === "todos" ? MOCK_SEARCH_TERMS : MOCK_SEARCH_TERMS.filter(t => t.relevancia === stFilter);

  const bestAdIdx = ads.length > 0 ? ads.reduce((best, ad, i) => (ad.ctr || 0) > (ads[best].ctr || 0) ? i : best, 0) : -1;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/ads")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-heading font-bold text-foreground truncate">{campaign.nome}</h1>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Verba: R${(campaign.verba_mensal || 0).toLocaleString("pt-BR")}/mês · {keywords.length} keywords · {ads.length} anúncios
          </p>
        </div>
        <div className="flex gap-2">
          {campaign.status !== "rascunho" && campaign.status !== "encerrada" && (
            <Button variant="outline" size="sm" onClick={toggleStatus}>
              {campaign.status === "ativa" ? <><Pause className="h-4 w-4 mr-1" /> Pausar</> : <><Play className="h-4 w-4 mr-1" /> Ativar</>}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="ads">Anúncios</TabsTrigger>
          <TabsTrigger value="optimizations">Otimizações</TabsTrigger>
          <TabsTrigger value="search-terms">Search Terms</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Impressões", value: totalImpr.toLocaleString("pt-BR"), icon: Eye },
              { label: "Cliques", value: totalClicks.toLocaleString("pt-BR"), icon: MousePointerClick },
              { label: "CTR", value: `${avgCtr}%`, icon: BarChart3 },
              { label: "CPC médio", value: `R$${avgCpc}`, icon: DollarSign },
              { label: "Conversões", value: totalConv.toString(), icon: TrendingUp },
            ].map((m, i) => (
              <Card key={i}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <m.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{m.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Cliques e Impressões — Últimos 30 dias</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="dia" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="impressoes" name="Impressões" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="cliques" name="Cliques" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-5">
              <div className="flex items-start gap-3">
                <Sparkles className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground mb-1">Recomendação da IA desta semana</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Identificamos 5 keywords com CPC acima da média e 0 conversões. Pausá-las economizaria ~R$120/mês que pode ser redistribuído para keywords de alta intenção.
                  </p>
                  <Button size="sm"><Sparkles className="h-4 w-4 mr-1" /> Aplicar otimização</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keywords */}
        <TabsContent value="keywords" className="space-y-4">
          <div className="flex items-center justify-between">
            <Select value={kwFilter} onValueChange={setKwFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Filtrar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="boa">Boa performance</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="ruim">Ruim</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm"><Sparkles className="h-4 w-4 mr-1" /> Otimizar com IA</Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Impr.</TableHead>
                    <TableHead className="text-right">Cliques</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">CPC</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKw.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhuma keyword encontrada</TableCell></TableRow>
                  ) : filteredKw.map((kw) => {
                    const perf = getKwPerf(kw);
                    const ctr = kw.impressoes && kw.cliques ? ((kw.cliques / kw.impressoes) * 100).toFixed(2) : "0";
                    return (
                      <TableRow key={kw.id}>
                        <TableCell className="font-medium">{kw.termo}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{MATCH_LABELS[kw.match_type || ""] || kw.match_type}</Badge></TableCell>
                        <TableCell className="text-right">{(kw.impressoes || 0).toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-right">{(kw.cliques || 0).toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-right">{ctr}%</TableCell>
                        <TableCell className="text-right">R${(kw.cpc_atual || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={kw.status === "ativa" ? "default" : "secondary"} className="text-xs">
                            {kw.status || "ativa"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {kw.status !== "pausada" && (
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => pauseKeyword(kw.id)} title="Pausar">
                                <Pause className="h-3 w-3" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeKeyword(kw.id)} title="Remover">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Ads */}
        <TabsContent value="ads" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm"><Sparkles className="h-4 w-4 mr-1" /> Criar variação com IA</Button>
          </div>
          <div className="grid gap-4">
            {ads.map((ad, idx) => {
              const headlines = Array.isArray(ad.headlines) ? (ad.headlines as string[]) : [];
              const descriptions = Array.isArray(ad.descriptions) ? (ad.descriptions as string[]) : [];
              return (
                <Card key={ad.id} className={idx === bestAdIdx ? "border-primary/40 ring-1 ring-primary/20" : ""}>
                  <CardContent className="py-5">
                    {idx === bestAdIdx && (
                      <Badge className="bg-primary/10 text-primary mb-3">⭐ Melhor performance</Badge>
                    )}
                    {/* Google preview */}
                    <div className="p-4 rounded-xl border bg-card mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Patrocinado · exemplo.com.br</p>
                      <p className="text-lg text-primary font-medium leading-snug">
                        {headlines.slice(0, 3).join(" | ")}
                      </p>
                      <p className="text-sm text-foreground mt-1">{descriptions[0]}</p>
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm">
                      <div><span className="text-muted-foreground">Impressões: </span><span className="font-medium">{(ad.impressoes || 0).toLocaleString("pt-BR")}</span></div>
                      <div><span className="text-muted-foreground">Cliques: </span><span className="font-medium">{(ad.cliques || 0).toLocaleString("pt-BR")}</span></div>
                      <div><span className="text-muted-foreground">CTR: </span><span className="font-medium">{(ad.ctr || 0).toFixed(2)}%</span></div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">{headlines.length} headlines · {descriptions.length} descrições</p>
                  </CardContent>
                </Card>
              );
            })}
            {ads.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">Nenhum anúncio criado ainda</div>
            )}
          </div>
        </TabsContent>

        {/* Optimizations */}
        <TabsContent value="optimizations" className="space-y-4">
          <h3 className="font-semibold text-foreground">Histórico de otimizações da IA</h3>
          <div className="space-y-3">
            {MOCK_OPTIMIZATIONS.map((opt, i) => (
              <Card key={i}>
                <CardContent className="py-4 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">{opt.data}</span>
                    </div>
                    <p className="font-medium text-sm text-foreground">{opt.acao}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.impacto}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Search Terms */}
        <TabsContent value="search-terms" className="space-y-4">
          <div className="flex items-center justify-between">
            <Select value={stFilter} onValueChange={setStFilter}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="relevante">Relevantes</SelectItem>
                <SelectItem value="irrelevante">Irrelevantes</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => {
              const irrelevantes = MOCK_SEARCH_TERMS.filter(t => t.relevancia === "irrelevante");
              irrelevantes.forEach(t => addNegative(t.termo));
            }}>
              <ShieldOff className="h-4 w-4 mr-1" /> Negar todos irrelevantes
            </Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Termo de busca</TableHead>
                    <TableHead className="text-right">Impressões</TableHead>
                    <TableHead className="text-right">Cliques</TableHead>
                    <TableHead className="text-right">Custo</TableHead>
                    <TableHead>Relevância</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredST.map((t, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{t.termo}</TableCell>
                      <TableCell className="text-right">{t.impressoes}</TableCell>
                      <TableCell className="text-right">{t.cliques}</TableCell>
                      <TableCell className="text-right">R${t.custo.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={t.relevancia === "relevante" ? "default" : "destructive"} className="text-xs">
                          {t.relevancia === "relevante" ? "Relevante" : "Irrelevante"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {t.relevancia === "irrelevante" && (
                          <Button variant="ghost" size="sm" className="text-xs" onClick={() => addNegative(t.termo)}>
                            <MinusCircle className="h-3 w-3 mr-1" /> Negar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
