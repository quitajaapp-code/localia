import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  User, Building2, Bell, CreditCard, Plug, Save, Upload, Loader2,
  AlertTriangle, CheckCircle, XCircle, ExternalLink, Copy, Eye, EyeOff, Brain, Key, MapPin, Star
} from "lucide-react";
import GooglePlacesSearch, { type PlaceResult } from "@/components/shared/GooglePlacesSearch";

const TOM_OPTIONS = [
  "Descontraído e próximo", "Profissional e formal", "Divertido e criativo",
  "Técnico e especializado", "Empático e acolhedor", "Direto e objetivo",
];

const PLANOS: Record<string, { label: string; price: string; features: string[] }> = {
  trial: { label: "Trial", price: "Grátis", features: ["14 dias de teste", "1 negócio", "Posts automáticos", "Score de otimização"] },
  presenca: { label: "Presença", price: "R$97/mês", features: ["1 negócio", "Posts 4x/semana", "Respostas com IA", "Relatório mensal"] },
  presenca_ads: { label: "Presença + Ads", price: "R$197/mês", features: ["3 negócios", "Tudo do Presença", "Google Ads com IA", "Otimização semanal"] },
  agencia: { label: "Agência", price: "R$497/mês", features: ["10 negócios", "Tudo do Presença + Ads", "White-label", "API & webhooks"] },
};

type NotifKey = "nova_avaliacao" | "avaliacao_negativa" | "post_publicado" | "erro_post" | "verba_esgotando" | "relatorio_semanal" | "edicao_perfil";
type NotifSettings = Record<NotifKey, { email: boolean; push: boolean }>;

const DEFAULT_NOTIFS: NotifSettings = {
  nova_avaliacao: { email: true, push: true },
  avaliacao_negativa: { email: true, push: true },
  post_publicado: { email: false, push: true },
  erro_post: { email: true, push: true },
  verba_esgotando: { email: true, push: true },
  relatorio_semanal: { email: true, push: false },
  edicao_perfil: { email: true, push: true },
};

const NOTIF_LABELS: Record<NotifKey, { label: string; emailOnly?: boolean }> = {
  nova_avaliacao: { label: "Nova avaliação recebida" },
  avaliacao_negativa: { label: "Avaliação negativa (1-2★)" },
  post_publicado: { label: "Post publicado com sucesso" },
  erro_post: { label: "Erro ao publicar post" },
  verba_esgotando: { label: "Campanha com verba esgotando (80%)" },
  relatorio_semanal: { label: "Relatório semanal", emailOnly: true },
  edicao_perfil: { label: "Edição não autorizada no perfil" },
};

export default function SettingsPage() {
  usePageTitle("Configurações");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Account
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState("");
  const [profileId, setProfileId] = useState("");

  // Password modal
  const [pwdOpen, setPwdOpen] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Business
  const [bizId, setBizId] = useState("");
  const [bizNome, setBizNome] = useState("");
  const [bizNicho, setBizNicho] = useState("");
  const [bizTom, setBizTom] = useState("");
  const [bizWebsite, setBizWebsite] = useState("");
  const [bizWhatsapp, setBizWhatsapp] = useState("");
  const [bizCidade, setBizCidade] = useState("");
  const [bizEstado, setBizEstado] = useState("");
  const [hasGmb, setHasGmb] = useState(false);
  const [hasAds, setHasAds] = useState(false);
  const [bizGmbId, setBizGmbId] = useState("");
  const [bizInstagram, setBizInstagram] = useState("");
  const [connectedPlaceName, setConnectedPlaceName] = useState("");

  // AI Provider
  const [iaProvider, setIaProvider] = useState("lovable");
  const [iaApiKey, setIaApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [aiSaving, setAiSaving] = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState<NotifSettings>(DEFAULT_NOTIFS);

  // Plan
  const [plano, setPlano] = useState("trial");
  const [trialEnds, setTrialEnds] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setEmail(user.email || "");

      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).limit(1).maybeSingle();
      if (profile) {
        setProfileId(profile.id);
        setNome(profile.nome || "");
        setPlano(profile.plano || "trial");
        setTrialEnds(profile.trial_ends_at);
        if (profile.notif_settings) {
          setNotifs({ ...DEFAULT_NOTIFS, ...(profile.notif_settings as any) });
        }
      }

      const { data: biz } = await supabase.from("businesses").select("*").eq("user_id", user.id).limit(1).maybeSingle();
      if (biz) {
        setBizId(biz.id);
        setBizNome(biz.nome || "");
        setBizNicho(biz.nicho || "");
        setBizTom(biz.tom_de_voz || "");
        setBizWebsite(biz.website_url || "");
        setBizWhatsapp(biz.whatsapp || "");
        setBizCidade(biz.cidade || "");
        setBizEstado(biz.estado || "");
        setHasGmb(!!biz.gmb_location_id);
        setHasAds(!!biz.ads_customer_id);
        setBizGmbId(biz.gmb_location_id || "");
        setBizInstagram(biz.instagram || "");
        setConnectedPlaceName(biz.gmb_location_id ? biz.nome || "" : "");
        setIaProvider((biz as any).ia_provider || "lovable");
        setIaApiKey((biz as any).ia_api_key || "");
      }
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  };

  const saveAccount = async () => {
    setSaving(true);
    try {
      await supabase.from("profiles").update({ nome }).eq("id", profileId);
      toast.success("Conta atualizada!");
    } catch { toast.error("Erro ao salvar"); }
    finally { setSaving(false); }
  };

  const saveBusiness = async () => {
    setSaving(true);
    try {
      await supabase.from("businesses").update({
        nome: bizNome, nicho: bizNicho, tom_de_voz: bizTom,
        website_url: bizWebsite, whatsapp: bizWhatsapp, cidade: bizCidade, estado: bizEstado,
      }).eq("id", bizId);
      toast.success("Dados do negócio atualizados!");
    } catch { toast.error("Erro ao salvar"); }
    finally { setSaving(false); }
  };

  const saveNotifs = async () => {
    setSaving(true);
    try {
      await supabase.from("profiles").update({ notif_settings: notifs as any }).eq("id", profileId);
      toast.success("Notificações atualizadas!");
    } catch { toast.error("Erro ao salvar"); }
    finally { setSaving(false); }
  };

  const saveAiConfig = async () => {
    if (iaProvider !== "lovable" && !iaApiKey.trim()) {
      toast.error("Insira sua chave de API para usar um provedor externo");
      return;
    }
    setAiSaving(true);
    try {
      await supabase.from("businesses").update({
        ia_provider: iaProvider,
        ia_api_key: iaProvider === "lovable" ? null : iaApiKey.trim(),
      } as any).eq("id", bizId);
      toast.success("Configuração de IA atualizada!");
    } catch { toast.error("Erro ao salvar"); }
    finally { setAiSaving(false); }
  };

  const changePassword = async () => {
    if (newPwd.length < 8) { toast.error("Senha deve ter no mínimo 8 caracteres"); return; }
    if (newPwd !== confirmPwd) { toast.error("Senhas não coincidem"); return; }
    setPwdLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd });
      if (error) throw error;
      toast.success("Senha alterada com sucesso!");
      setPwdOpen(false);
      setOldPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (e: any) { toast.error(e.message || "Erro ao alterar senha"); }
    finally { setPwdLoading(false); }
  };

  const changeEmail = async () => {
    const newEmail = prompt("Digite o novo email:");
    if (!newEmail) return;
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) { toast.error(error.message); return; }
    toast.success("Email de confirmação enviado para o novo endereço!");
  };

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { action: "portal" },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
      else toast.info("Portal de cobrança não disponível no momento");
    } catch { toast.error("Erro ao abrir portal de cobrança"); }
    finally { setPortalLoading(false); }
  };

  const uploadAvatar = async (file: File) => {
    try {
      const path = `${userId}/avatar.${file.name.split(".").pop()}`;
      await supabase.storage.from("business-assets").upload(path, file, { upsert: true });
      const { data } = supabase.storage.from("business-assets").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
      toast.success("Avatar atualizado!");
    } catch { toast.error("Erro no upload"); }
  };

  const toggleNotif = (key: NotifKey, channel: "email" | "push") => {
    setNotifs(prev => ({
      ...prev,
      [key]: { ...prev[key], [channel]: !prev[key][channel] },
    }));
  };

  const initials = nome ? nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";
  const planInfo = PLANOS[plano] || PLANOS.trial;
  const trialDays = trialEnds ? Math.max(0, Math.ceil((new Date(trialEnds).getTime() - Date.now()) / 86400000)) : 0;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Configurações</h1>

      <Tabs defaultValue="conta" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="conta" className="text-xs sm:text-sm"><User className="h-4 w-4 mr-1 hidden sm:inline" />Conta</TabsTrigger>
          <TabsTrigger value="negocio" className="text-xs sm:text-sm"><Building2 className="h-4 w-4 mr-1 hidden sm:inline" />Negócio</TabsTrigger>
          <TabsTrigger value="notificacoes" className="text-xs sm:text-sm"><Bell className="h-4 w-4 mr-1 hidden sm:inline" />Notificações</TabsTrigger>
          <TabsTrigger value="plano" className="text-xs sm:text-sm"><CreditCard className="h-4 w-4 mr-1 hidden sm:inline" />Plano</TabsTrigger>
          <TabsTrigger value="integracoes" className="text-xs sm:text-sm"><Plug className="h-4 w-4 mr-1 hidden sm:inline" />Integrações</TabsTrigger>
        </TabsList>

        {/* CONTA */}
        <TabsContent value="conta" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Perfil</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <button onClick={() => avatarInputRef.current?.click()}
                  className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl overflow-hidden hover:ring-2 ring-primary transition-all">
                  {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : initials}
                </button>
                <div>
                  <p className="text-sm font-medium text-foreground">Foto do perfil</p>
                  <Button variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()}>
                    <Upload className="h-3 w-3 mr-1" /> Enviar foto
                  </Button>
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
              </div>
              <div>
                <Label className="text-sm">Nome completo</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div>
                <Label className="text-sm">Email</Label>
                <div className="flex gap-2">
                  <Input value={email} disabled className="flex-1" />
                  <Button variant="outline" size="sm" onClick={changeEmail}>Alterar</Button>
                </div>
              </div>
              <div>
                <Label className="text-sm">Senha</Label>
                <Button variant="outline" size="sm" onClick={() => setPwdOpen(true)}>Alterar senha</Button>
              </div>
              <Button onClick={saveAccount} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader><CardTitle className="text-base text-destructive flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Zona de perigo</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Ao excluir sua conta, todos os dados serão removidos permanentemente.</p>
              <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>Excluir conta</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NEGÓCIO */}
        <TabsContent value="negocio" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Dados do negócio</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm">Nome</Label><Input value={bizNome} onChange={(e) => setBizNome(e.target.value)} /></div>
                <div><Label className="text-sm">Nicho</Label><Input value={bizNicho} onChange={(e) => setBizNicho(e.target.value)} /></div>
              </div>
              <div>
                <Label className="text-sm">Tom de voz</Label>
                <Select value={bizTom} onValueChange={setBizTom}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{TOM_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-sm">Website</Label><Input value={bizWebsite} onChange={(e) => setBizWebsite(e.target.value)} /></div>
              <div><Label className="text-sm">WhatsApp</Label><Input value={bizWhatsapp} onChange={(e) => setBizWhatsapp(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm">Cidade</Label><Input value={bizCidade} onChange={(e) => setBizCidade(e.target.value)} /></div>
                <div><Label className="text-sm">Estado</Label><Input value={bizEstado} onChange={(e) => setBizEstado(e.target.value)} /></div>
              </div>
              <Button onClick={saveBusiness} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar alterações
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Conexões</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {hasGmb ? <CheckCircle className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                  <div>
                    <p className="text-sm font-medium">Google Meu Negócio</p>
                    <p className="text-xs text-muted-foreground">{hasGmb ? "Conectado" : "Não conectado"}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">{hasGmb ? "Reconectar" : "Conectar"}</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {hasAds ? <CheckCircle className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                  <div>
                    <p className="text-sm font-medium">Google Ads</p>
                    <p className="text-xs text-muted-foreground">{hasAds ? "Conectado" : "Não conectado"}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">{hasAds ? "Reconectar" : "Conectar"}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICAÇÕES */}
        <TabsContent value="notificacoes" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Preferências de notificação</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1 mb-4">
                <div className="grid grid-cols-[1fr_60px_60px] gap-2 text-xs font-medium text-muted-foreground px-1">
                  <span>Notificação</span><span className="text-center">Email</span><span className="text-center">Push</span>
                </div>
              </div>
              <div className="space-y-3">
                {(Object.entries(NOTIF_LABELS) as [NotifKey, typeof NOTIF_LABELS[NotifKey]][]).map(([key, { label, emailOnly }]) => (
                  <div key={key} className="grid grid-cols-[1fr_60px_60px] gap-2 items-center py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm text-foreground">{label}</span>
                    <div className="flex justify-center">
                      <Switch checked={notifs[key].email} onCheckedChange={() => toggleNotif(key, "email")} />
                    </div>
                    <div className="flex justify-center">
                      {emailOnly ? <span className="text-xs text-muted-foreground">—</span> :
                        <Switch checked={notifs[key].push} onCheckedChange={() => toggleNotif(key, "push")} />}
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-6" onClick={saveNotifs} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar preferências
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PLANO */}
        <TabsContent value="plano" className="space-y-6">
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-foreground">{planInfo.label}</h3>
                    <Badge variant={plano === "trial" ? "secondary" : "default"}>{plano === "trial" ? "Trial" : "Ativo"}</Badge>
                  </div>
                  <p className="text-2xl font-bold text-primary">{planInfo.price}</p>
                </div>
                {plano === "trial" && trialDays > 0 && (
                  <Badge variant="outline" className="text-sm">{trialDays} dias restantes</Badge>
                )}
              </div>
              <ul className="space-y-2 mb-6">
                {planInfo.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="h-4 w-4 text-success shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                {plano !== "agencia" && (
                  <Button onClick={() => navigate("/pricing")}>Fazer upgrade</Button>
                )}
                <Button variant="outline" onClick={openPortal} disabled={portalLoading}>
                  {portalLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ExternalLink className="h-4 w-4 mr-2" />}
                  Gerenciar assinatura
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Histórico de faturas</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { data: "01/03/2026", valor: "R$197,00", status: "Pago" },
                  { data: "01/02/2026", valor: "R$197,00", status: "Pago" },
                  { data: "01/01/2026", valor: "R$197,00", status: "Pago" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-foreground">{f.data}</span>
                      <span className="text-sm font-medium">{f.valor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-success/10 text-success text-xs">{f.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">Faturas gerenciadas pelo Stripe. Clique em "Gerenciar assinatura" para acessar recibos e notas fiscais.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* INTEGRAÇÕES */}
        <TabsContent value="integracoes" className="space-y-4">
          {[
            { name: "Google Meu Negócio", desc: hasGmb ? "Conectado — sincronizando avaliações e métricas" : "Não conectado", connected: hasGmb },
            { name: "Google Ads", desc: hasAds ? "Conectado — gerenciando campanhas" : "Não conectado", connected: hasAds },
            { name: "Stripe", desc: "Pagamentos gerenciados automaticamente", connected: true },
          ].map((int, i) => (
            <Card key={i}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {int.connected ? <CheckCircle className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
                  <div>
                    <p className="font-medium text-sm text-foreground">{int.name}</p>
                    <p className="text-xs text-muted-foreground">{int.desc}</p>
                  </div>
                </div>
                {int.name !== "Stripe" && (
                  <Button variant="outline" size="sm">{int.connected ? "Reconectar" : "Conectar"}</Button>
                )}
              </CardContent>
            </Card>
          ))}

          {/* AI PROVIDER CONFIG */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4" /> Provedor de IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Escolha qual provedor de IA será usado para gerar posts, respostas e campanhas.
                Usar sua própria chave pode reduzir custos no seu plano.
              </p>
              <div>
                <Label className="text-sm">Provedor</Label>
                <Select value={iaProvider} onValueChange={(v) => { setIaProvider(v); if (v === "lovable") setIaApiKey(""); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lovable">LocalAI (incluso no plano)</SelectItem>
                    <SelectItem value="openai">OpenAI (sua chave)</SelectItem>
                    <SelectItem value="anthropic">Anthropic / Claude (sua chave)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {iaProvider !== "lovable" && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm flex items-center gap-1">
                      <Key className="h-3 w-3" /> Chave de API
                    </Label>
                    <div className="relative">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value={iaApiKey}
                        onChange={(e) => setIaApiKey(e.target.value)}
                        placeholder={iaProvider === "openai" ? "sk-..." : "sk-ant-..."}
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {iaProvider === "openai"
                        ? "Obtenha em platform.openai.com → API keys"
                        : "Obtenha em console.anthropic.com → API keys"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-warning/10 border border-warning/20 p-3">
                    <p className="text-xs text-warning-foreground">
                      <strong>⚠️ Importante:</strong> Ao usar sua própria chave, os custos de uso da IA serão cobrados diretamente pelo provedor escolhido, não pelo LocalAI. Sua chave é armazenada de forma segura.
                    </p>
                  </div>
                </div>
              )}

              {iaProvider === "lovable" && (
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                  <p className="text-xs text-muted-foreground">
                    ✨ Usando IA inclusa no seu plano. Sem configuração adicional necessária.
                  </p>
                </div>
              )}

              <Button onClick={saveAiConfig} disabled={aiSaving} size="sm">
                {aiSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar configuração de IA
              </Button>
            </CardContent>
          </Card>

          {plano === "agencia" && (
            <Card>
              <CardHeader><CardTitle className="text-base">Webhooks</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Receba eventos em tempo real no seu sistema.</p>
                <div className="flex gap-2">
                  <Input placeholder="https://seusite.com/webhook" className="flex-1" />
                  <Button size="sm"><Save className="h-4 w-4 mr-1" /> Salvar</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Password Dialog */}
      <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
            <DialogDescription>Digite sua nova senha. Mínimo 8 caracteres.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Nova senha</Label>
              <div className="relative">
                <Input type={showPwd ? "text" : "password"} value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
                <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-sm">Confirmar senha</Label>
              <Input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
              {confirmPwd && newPwd !== confirmPwd && <p className="text-xs text-destructive mt-1">Senhas não coincidem</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwdOpen(false)}>Cancelar</Button>
            <Button onClick={changePassword} disabled={pwdLoading || newPwd.length < 8 || newPwd !== confirmPwd}>
              {pwdLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Alterar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Excluir conta</DialogTitle>
            <DialogDescription>Esta ação é irreversível. Todos os seus dados serão removidos.</DialogDescription>
          </DialogHeader>
          <div>
            <Label className="text-sm">Digite <strong>EXCLUIR</strong> para confirmar</Label>
            <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="EXCLUIR" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" disabled={deleteConfirm !== "EXCLUIR"}
              onClick={() => { toast.info("Funcionalidade de exclusão requer implementação server-side"); setDeleteOpen(false); }}>
              Excluir minha conta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
