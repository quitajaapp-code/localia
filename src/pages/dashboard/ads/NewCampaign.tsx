import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, ArrowRight, Sparkles, Target, MapPin, DollarSign, Search,
  ShieldOff, FileText, Settings, X, Plus, Check, Loader2, Zap, Eye,
  MousePointerClick, Phone, Route, Globe
} from "lucide-react";

// CPC médio por nicho (valores realistas para Brasil)
const CPC_POR_NICHO: Record<string, number> = {
  "Restaurante": 1.20, "Pizzaria": 1.00, "Hamburgueria": 0.90, "Padaria": 0.80,
  "Dentista": 4.50, "Médico": 5.00, "Psicólogo": 3.50, "Fisioterapeuta": 2.80,
  "Advogado": 6.00, "Contador": 3.00, "Academia": 2.00, "Barbearia": 1.50,
  "Salão de beleza": 1.80, "Pet shop": 1.60, "Mecânica": 2.20, "Imobiliária": 4.00,
  "Hotel": 3.50, "Clínica veterinária": 2.50, "Escola": 3.00, "Ótica": 2.00,
};

const OBJETIVOS = [
  { value: "ligacoes", label: "Mais ligações", icon: Phone },
  { value: "site", label: "Mais visitas ao site", icon: Globe },
  { value: "presencial", label: "Mais visitas presenciais", icon: MapPin },
  { value: "rota", label: "Mais pedidos de rota", icon: Route },
];

const RAIOS = [
  "3km do endereço", "5km do endereço", "10km do endereço",
  "15km do endereço", "20km do endereço", "Cidade inteira", "Estado inteiro",
];

const PROCESSING_STEPS = [
  { text: "Analisando seu nicho e região", icon: Search },
  { text: "Pesquisando palavras-chave relevantes", icon: Target },
  { text: "Identificando termos negativos para excluir", icon: ShieldOff },
  { text: "Criando textos dos anúncios", icon: FileText },
  { text: "Configurando lances e orçamento", icon: Settings },
];

type Keyword = {
  termo: string;
  match_type: "exact" | "phrase" | "broad";
  volume_estimado: number;
  cpc_estimado: number;
  intencao: "alta" | "moderada" | "branding";
};

type NegativeGroup = {
  explicacao: string;
  termos: string[];
  enabled: boolean;
};

type Ad = {
  headlines: string[];
  descriptions: string[];
};

type CampaignData = {
  keywords: Keyword[];
  negative_keywords: Record<string, NegativeGroup>;
  anuncios: Ad[];
  config: {
    tipo: string;
    orcamento_diario: number;
    estrategia_lance: string;
    idioma: string;
    localizacao: string;
  };
};

const INTENT_COLORS: Record<string, string> = {
  alta: "bg-success/10 text-success",
  moderada: "bg-warning/10 text-warning",
  branding: "bg-primary/10 text-primary",
};

const MATCH_LABELS: Record<string, string> = {
  exact: "Exata", phrase: "Frase", broad: "Ampla",
};

const NEG_GROUP_LABELS: Record<string, string> = {
  pesquisa: "Termos de pesquisa genérica",
  emprego: "Termos de emprego",
  educacional: "Termos educacionais",
  nao_local: "Termos não locais",
};

export default function NewCampaign() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1 state
  const [verba, setVerba] = useState(500);
  const [objetivo, setObjetivo] = useState("");
  const [raio, setRaio] = useState("5km do endereço");
  const [nicho, setNicho] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [nomeNegocio, setNomeNegocio] = useState("");

  // Step 2 state
  const [processingStep, setProcessingStep] = useState(0);

  // Step 3 state
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [newKeyword, setNewKeyword] = useState("");
  const [editingAd, setEditingAd] = useState<number | null>(null);
  const [editHeadlines, setEditHeadlines] = useState<string[]>([]);
  const [editDescriptions, setEditDescriptions] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load business info
  useEffect(() => {
    const loadBusiness = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("businesses")
        .select("nome, nicho, cidade, estado")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      if (data) {
        setNicho(data.nicho || "");
        setCidade(data.cidade || "");
        setEstado(data.estado || "");
        setNomeNegocio(data.nome || "");
      }
    };
    loadBusiness();
  }, []);

  const cpcMedio = CPC_POR_NICHO[nicho] || 2.5;
  const cliquesEstimados = Math.round(verba / cpcMedio);
  const ligacoesEstimadas = Math.round(cliquesEstimados * 0.08);

  // Step 2: generate campaign
  const generateCampaign = useCallback(async () => {
    setStep(2);
    setProcessingStep(0);

    // Animate steps
    for (let i = 0; i < PROCESSING_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
      setProcessingStep(i + 1);
    }

    try {
      const { data, error } = await supabase.functions.invoke("generate-campaign", {
        body: {
          nicho, cidade, estado, objetivo, verba_mensal: verba, raio, nome_negocio: nomeNegocio,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Add enabled flag to negative keyword groups
      const negGroups: Record<string, NegativeGroup> = {};
      for (const [key, val] of Object.entries(data.negative_keywords || {})) {
        negGroups[key] = { ...(val as any), enabled: true };
      }
      setCampaignData({ ...data, negative_keywords: negGroups });
      setStep(3);
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar campanha. Tente novamente.");
      setStep(1);
    }
  }, [nicho, cidade, estado, objetivo, verba, raio, nomeNegocio]);

  const removeKeyword = (index: number) => {
    if (!campaignData) return;
    setCampaignData({
      ...campaignData,
      keywords: campaignData.keywords.filter((_, i) => i !== index),
    });
  };

  const addKeyword = () => {
    if (!campaignData || !newKeyword.trim()) return;
    setCampaignData({
      ...campaignData,
      keywords: [
        ...campaignData.keywords,
        { termo: newKeyword.trim(), match_type: "phrase", volume_estimado: 0, cpc_estimado: cpcMedio, intencao: "moderada" },
      ],
    });
    setNewKeyword("");
  };

  const toggleNegGroup = (key: string) => {
    if (!campaignData) return;
    setCampaignData({
      ...campaignData,
      negative_keywords: {
        ...campaignData.negative_keywords,
        [key]: { ...campaignData.negative_keywords[key], enabled: !campaignData.negative_keywords[key].enabled },
      },
    });
  };

  const openEditAd = (idx: number) => {
    if (!campaignData) return;
    setEditingAd(idx);
    setEditHeadlines([...campaignData.anuncios[idx].headlines]);
    setEditDescriptions([...campaignData.anuncios[idx].descriptions]);
  };

  const saveAdEdit = () => {
    if (!campaignData || editingAd === null) return;
    const updated = [...campaignData.anuncios];
    updated[editingAd] = { headlines: editHeadlines, descriptions: editDescriptions };
    setCampaignData({ ...campaignData, anuncios: updated });
    setEditingAd(null);
  };

  const saveCampaign = async (activate: boolean) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data: biz } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      if (!biz) throw new Error("Negócio não encontrado");

      const { data: campaign, error: cErr } = await supabase.from("campaigns").insert({
        business_id: biz.id,
        nome: `Campanha ${objetivo} - ${new Date().toLocaleDateString("pt-BR")}`,
        status: activate ? "ativa" : "rascunho",
        tipo: "search",
        verba_mensal: verba,
        verba_restante: verba,
      }).select().single();

      if (cErr) throw cErr;

      // Insert keywords
      if (campaignData?.keywords.length) {
        await supabase.from("keywords").insert(
          campaignData.keywords.map((k) => ({
            campaign_id: campaign.id,
            termo: k.termo,
            match_type: k.match_type,
            cpc_atual: k.cpc_estimado,
            status: "ativa",
          }))
        );
      }

      // Insert negative keywords
      if (campaignData?.negative_keywords) {
        const negs: { campaign_id: string; termo: string; match_type: string }[] = [];
        for (const [, group] of Object.entries(campaignData.negative_keywords)) {
          if (group.enabled) {
            group.termos.forEach((t) => negs.push({ campaign_id: campaign.id, termo: t, match_type: "exact" }));
          }
        }
        if (negs.length) await supabase.from("negative_keywords").insert(negs);
      }

      // Insert ads
      if (campaignData?.anuncios.length) {
        await supabase.from("ads").insert(
          campaignData.anuncios.map((a) => ({
            campaign_id: campaign.id,
            headlines: a.headlines,
            descriptions: a.descriptions,
            status: activate ? "ativo" : "rascunho",
          }))
        );
      }

      toast.success(activate ? "Campanha ativada com sucesso!" : "Rascunho salvo!");
      setConfirmOpen(false);
      navigate("/dashboard/ads");
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar campanha");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep(step - 1) : navigate("/dashboard/ads")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`h-2 rounded-full flex-1 transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
            </div>
          ))}
        </div>
        <span className="text-sm text-muted-foreground font-medium">Etapa {step}/3</span>
      </div>

      <AnimatePresence mode="wait">
        {/* ===== STEP 1 ===== */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Defina sua verba e objetivo</h1>
            <p className="text-muted-foreground mb-8">A IA vai criar uma campanha otimizada para o seu negócio.</p>

            {/* Verba */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-semibold">Verba mensal</Label>
                </div>
                <div className="text-center mb-6">
                  <span className="text-5xl font-heading font-bold text-primary">
                    R${verba.toLocaleString("pt-BR")}
                  </span>
                  <span className="text-muted-foreground text-lg">/mês</span>
                </div>
                <Slider
                  value={[verba]}
                  onValueChange={([v]) => setVerba(v)}
                  min={300} max={5000} step={50}
                  className="mb-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>R$300</span><span>R$5.000</span>
                </div>

                {/* Estimativa IA */}
                <motion.div
                  key={verba}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20"
                >
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">
                      Com <strong>R${verba.toLocaleString("pt-BR")}/mês</strong>, estimamos{" "}
                      <strong className="text-primary">{cliquesEstimados.toLocaleString("pt-BR")} cliques/mês</strong> e{" "}
                      <strong className="text-primary">{ligacoesEstimadas} ligações/mês</strong> para o seu segmento
                      {nicho ? ` (${nicho})` : ""}.
                    </p>
                  </div>
                </motion.div>
              </CardContent>
            </Card>

            {/* Objetivo */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-semibold">Objetivo da campanha</Label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {OBJETIVOS.map((obj) => (
                    <button
                      key={obj.value}
                      onClick={() => setObjetivo(obj.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        objetivo === obj.value
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <obj.icon className={`h-5 w-5 mb-2 ${objetivo === obj.value ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-sm font-medium">{obj.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Localização */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-semibold">Raio de atuação</Label>
                </div>
                <Select value={raio} onValueChange={setRaio}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RAIOS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full text-lg h-14"
              disabled={!objetivo}
              onClick={generateCampaign}
            >
              Próximo: A IA vai criar sua campanha
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}

        {/* ===== STEP 2 — Processing ===== */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh]"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="mb-8"
            >
              <Sparkles className="h-16 w-16 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Criando sua campanha com IA</h2>
            <p className="text-muted-foreground mb-10">Isso pode levar alguns segundos...</p>

            <div className="w-full max-w-md space-y-4">
              {PROCESSING_STEPS.map((ps, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={i < processingStep ? { opacity: 1, x: 0 } : { opacity: 0.3, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="flex items-center gap-3"
                >
                  {i < processingStep ? (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  ) : i === processingStep ? (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <ps.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <span className={`text-sm font-medium ${i < processingStep ? "text-foreground" : "text-muted-foreground"}`}>
                    {ps.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== STEP 3 — Review ===== */}
        {step === 3 && campaignData && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-heading font-bold text-foreground">Revise sua campanha</h1>
                <p className="text-muted-foreground">A IA criou tudo. Revise e ative quando quiser.</p>
              </div>
              <Badge variant="secondary" className="text-base px-4 py-2">
                R${verba.toLocaleString("pt-BR")}/mês
              </Badge>
            </div>

            <Accordion type="multiple" defaultValue={["keywords", "negatives", "ads", "config"]} className="space-y-4">
              {/* Section A: Keywords */}
              <AccordionItem value="keywords" className="border rounded-xl px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Search className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Palavras-chave ({campaignData.keywords.length})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 mb-4">
                    {campaignData.keywords.map((kw, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 group">
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm">{kw.termo}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{MATCH_LABELS[kw.match_type]}</Badge>
                            <Badge className={`text-xs ${INTENT_COLORS[kw.intencao]}`}>{kw.intencao === "alta" ? "Alta intenção" : kw.intencao === "moderada" ? "Moderada" : "Branding"}</Badge>
                            <span className="text-xs text-muted-foreground">{kw.volume_estimado} buscas/mês</span>
                            <span className="text-xs text-muted-foreground">CPC R${kw.cpc_estimado.toFixed(2)}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8" onClick={() => removeKeyword(i)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Adicionar keyword..." value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addKeyword()} />
                    <Button variant="outline" size="icon" onClick={addKeyword}><Plus className="h-4 w-4" /></Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Section B: Negative Keywords */}
              <AccordionItem value="negatives" className="border rounded-xl px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <ShieldOff className="h-5 w-5 text-destructive" />
                    <span className="font-semibold">Palavras-chave negativas</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {Object.entries(campaignData.negative_keywords).map(([key, group]) => (
                      <div key={key} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-medium text-sm">{NEG_GROUP_LABELS[key] || key}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">{group.explicacao}</p>
                          </div>
                          <Switch checked={group.enabled} onCheckedChange={() => toggleNegGroup(key)} />
                        </div>
                        {group.enabled && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {group.termos.map((t, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Section C: Ads */}
              <AccordionItem value="ads" className="border rounded-xl px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Anúncios ({campaignData.anuncios.length})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6">
                    {campaignData.anuncios.map((ad, idx) => (
                      <div key={idx} className="relative">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Anúncio {idx + 1}</p>
                        {/* Google Preview */}
                        <div className="p-4 rounded-xl border bg-card mb-2">
                          <p className="text-xs text-muted-foreground mb-1">Patrocinado · {nomeNegocio || "seunegocio"}.com.br</p>
                          <p className="text-lg text-primary font-medium leading-snug">
                            {ad.headlines.slice(0, 3).join(" | ")}
                          </p>
                          <p className="text-sm text-foreground mt-1">{ad.descriptions[0]}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{ad.headlines.length} headlines</span>
                          <span>·</span>
                          <span>{ad.descriptions.length} descrições</span>
                        </div>
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => openEditAd(idx)}>
                          Editar anúncio
                        </Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Section D: Config */}
              <AccordionItem value="config" className="border rounded-xl px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">Configurações</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ["Tipo", campaignData.config.tipo],
                      ["Orçamento diário", `R$${campaignData.config.orcamento_diario.toFixed(2)}`],
                      ["Estratégia de lance", campaignData.config.estrategia_lance],
                      ["Localização", campaignData.config.localizacao],
                      ["Idioma", campaignData.config.idioma],
                    ].map(([label, value]) => (
                      <div key={label as string} className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="font-medium text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1" onClick={() => saveCampaign(false)} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Salvar como rascunho
              </Button>
              <Button className="flex-1 text-lg h-12" onClick={() => setConfirmOpen(true)}>
                <Zap className="h-5 w-5 mr-2" />
                Ativar campanha
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Ad Dialog */}
      <Dialog open={editingAd !== null} onOpenChange={() => setEditingAd(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Anúncio {editingAd !== null ? editingAd + 1 : ""}</DialogTitle>
            <DialogDescription>Edite os headlines e descrições do anúncio.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="font-semibold mb-2 block">Headlines (máx. 30 caracteres cada)</Label>
              {editHeadlines.map((h, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input
                    value={h}
                    maxLength={30}
                    onChange={(e) => { const u = [...editHeadlines]; u[i] = e.target.value; setEditHeadlines(u); }}
                  />
                  <span className="text-xs text-muted-foreground self-center w-10 text-right">{h.length}/30</span>
                </div>
              ))}
            </div>
            <div>
              <Label className="font-semibold mb-2 block">Descrições (máx. 90 caracteres cada)</Label>
              {editDescriptions.map((d, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Textarea
                    value={d}
                    maxLength={90}
                    rows={2}
                    onChange={(e) => { const u = [...editDescriptions]; u[i] = e.target.value; setEditDescriptions(u); }}
                  />
                  <span className="text-xs text-muted-foreground self-center w-10 text-right">{d.length}/90</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAd(null)}>Cancelar</Button>
            <Button onClick={saveAdEdit}>Salvar alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar ativação da campanha</DialogTitle>
            <DialogDescription>Revise o resumo antes de ativar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex justify-between"><span className="text-muted-foreground">Verba mensal</span><span className="font-semibold">R${verba.toLocaleString("pt-BR")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Orçamento diário</span><span className="font-semibold">R${(verba / 30).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Keywords</span><span className="font-semibold">{campaignData?.keywords.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Anúncios</span><span className="font-semibold">{campaignData?.anuncios.length}</span></div>
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm text-foreground">
              ⚠️ Ao ativar, os débitos da campanha serão iniciados conforme a verba configurada.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button onClick={() => saveCampaign(true)} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
              Confirmar e ativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
