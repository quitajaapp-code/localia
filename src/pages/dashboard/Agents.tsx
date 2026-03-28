import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Star, FileText, TrendingUp, Megaphone, Bot, Play, History, Check, X, Clock, AlertTriangle, Bell, BellOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const AGENTS = [
  {
    id: "reviews",
    nome: "Agente de Avaliações",
    descricao: "Responde avaliações automaticamente com a voz do seu negócio",
    icon: Star,
    cor: "text-warning",
    bgCor: "bg-warning/10",
    funcao: "agent-reviews",
    configKey: "reviews_auto_reply",
  },
  {
    id: "posts",
    nome: "Agente de Conteúdo",
    descricao: "Cria e publica posts semanais no Google Meu Negócio",
    icon: FileText,
    cor: "text-primary",
    bgCor: "bg-primary/10",
    funcao: "agent-posts",
    configKey: "posts_auto_publish",
  },
  {
    id: "profile",
    nome: "Agente de Perfil",
    descricao: "Audita e otimiza seu perfil GMB para aparecer mais no Google",
    icon: TrendingUp,
    cor: "text-success",
    bgCor: "bg-success/10",
    funcao: "agent-profile",
    configKey: "profile_auto_optimize",
  },
  {
    id: "ads",
    nome: "Agente de Ads",
    descricao: "Cria campanhas Google Ads e gerencia keywords automaticamente",
    icon: Megaphone,
    cor: "text-destructive",
    bgCor: "bg-destructive/10",
    funcao: "agent-ads",
    configKey: "ads_auto_adjust",
  },
];

interface AgentAction {
  id: string;
  agent: string;
  action_type: string;
  status: string;
  auto_applied: boolean;
  output_data: any;
  input_data: any;
  created_at: string;
}

interface AgentAlert {
  id: string;
  business_id: string;
  agent: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string | null;
  read: boolean;
  notified_email: boolean;
  notified_whatsapp: boolean;
  created_at: string;
}

interface AgentSettings {
  reviews_auto_reply: boolean;
  posts_auto_publish: boolean;
  profile_auto_optimize: boolean;
  ads_auto_adjust: boolean;
  [key: string]: any;
}

export default function Agents() {
  usePageTitle("Agentes IA");
  const { user } = useAuth();
  const [bizId, setBizId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AgentSettings | null>(null);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [alerts, setAlerts] = useState<AgentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    const { data: biz } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (!biz) { setLoading(false); return; }
    setBizId(biz.id);

    const { data: s } = await supabase
      .from("agent_settings")
      .select("*")
      .eq("business_id", biz.id)
      .maybeSingle();

    if (s) {
      setSettings(s as unknown as AgentSettings);
    } else {
      await supabase.from("agent_settings").insert({ business_id: biz.id });
      setSettings({
        reviews_auto_reply: false,
        posts_auto_publish: false,
        profile_auto_optimize: false,
        ads_auto_adjust: false,
      });
    }

    await loadActions(biz.id);
    await loadAlerts(biz.id);
    setLoading(false);
  };

  const loadAlerts = async (id?: string) => {
    const businessId = id || bizId;
    if (!businessId) return;
    const { data } = await supabase
      .from("agent_alerts")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(20);
    setAlerts((data || []) as unknown as AgentAlert[]);
  };

  const loadActions = async (id?: string) => {
    const businessId = id || bizId;
    if (!businessId) return;
    const { data } = await supabase
      .from("agent_actions")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(20);
    setActions((data || []) as unknown as AgentAction[]);
  };

  useEffect(() => { loadData(); }, [user]);

  const saveConfig = async (key: string, value: boolean) => {
    if (!bizId) return;
    await supabase.from("agent_settings")
      .upsert({ business_id: bizId, [key]: value, updated_at: new Date().toISOString() }, { onConflict: "business_id" });
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const runAgent = async (funcao: string, agentId: string) => {
    if (!bizId) return;
    setRunning(agentId);
    try {
      const { error } = await supabase.functions.invoke(funcao, {
        body: { business_id: bizId, mode: "single" },
      });
      if (error) throw error;
      toast({ title: "Agente executado!", description: "Veja as ações abaixo." });
      await loadActions();
      await loadAlerts();
    } catch {
      toast({ title: "Erro ao executar agente", variant: "destructive" });
    }
    setRunning(null);
  };

  const updateActionStatus = async (actionId: string, newStatus: string) => {
    await supabase.from("agent_actions")
      .update({ status: newStatus, applied_at: newStatus === "applied" ? new Date().toISOString() : null })
      .eq("id", actionId);
    await loadActions();
  };

  const getLastAction = (agentId: string) =>
    actions.find((a) => a.agent === agentId);

  const actionTypeLabel: Record<string, string> = {
    reply_generated: "Resposta gerada",
    post_created: "Post criado",
    profile_audit: "Auditoria de perfil",
    campaign_created: "Campanha criada",
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "auto_applied": return <Badge className="bg-success/20 text-success border-success/30">Aplicado auto</Badge>;
      case "applied": return <Badge className="bg-success/20 text-success border-success/30">Aplicado</Badge>;
      case "pending": return <Badge variant="secondary">Pendente</Badge>;
      case "dismissed": return <Badge variant="outline" className="text-muted-foreground">Descartado</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" /> Agentes de IA
        </h1>
        <p className="text-muted-foreground text-sm">Trabalhando 24h pelo seu negócio</p>
      </div>

      {/* Grid 2x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AGENTS.map((agent) => {
          const Icon = agent.icon;
          const isAuto = settings?.[agent.configKey] ?? false;
          const last = getLastAction(agent.id);

          return (
            <Card key={agent.id} className="card-hover">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${agent.bgCor}`}>
                      <Icon className={`h-5 w-5 ${agent.cor}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{agent.nome}</h3>
                      <p className="text-xs text-muted-foreground">{agent.descricao}</p>
                    </div>
                  </div>
                  <Badge variant={isAuto ? "default" : "secondary"} className="text-[10px]">
                    {isAuto ? "Ativo" : "Manual"}
                  </Badge>
                </div>

                {/* Toggle auto */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Modo automático</span>
                  <Switch
                    checked={isAuto}
                    onCheckedChange={(v) => saveConfig(agent.configKey, v)}
                  />
                </div>

                {/* Last action */}
                {last && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {actionTypeLabel[last.action_type] || last.action_type} —{" "}
                    {formatDistanceToNow(new Date(last.created_at), { addSuffix: true, locale: ptBR })}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => runAgent(agent.funcao, agent.id)}
                    disabled={running === agent.id}
                    className="flex-1 btn-press"
                  >
                    {running === agent.id ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Play className="h-3 w-3 mr-1" />
                    )}
                    Executar agora
                  </Button>

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        <History className="h-3 w-3 mr-1" /> Histórico
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Histórico — {agent.nome}</SheetTitle>
                      </SheetHeader>
                      <div className="mt-4 space-y-3">
                        {actions
                          .filter((a) => a.agent === agent.id)
                          .slice(0, 10)
                          .map((a) => (
                            <div key={a.id} className="p-3 rounded-lg bg-muted/50 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">
                                  {actionTypeLabel[a.action_type] || a.action_type}
                                </span>
                                {statusBadge(a.status)}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: ptBR })}
                              </p>
                              {a.output_data?.reply_preview && (
                                <p className="text-xs text-foreground/80 italic">"{a.output_data.reply_preview}"</p>
                              )}
                              {a.output_data?.texto_preview && (
                                <p className="text-xs text-foreground/80 italic">"{a.output_data.texto_preview}"</p>
                              )}
                              {a.status === "pending" && (
                                <div className="flex gap-2 pt-1">
                                  <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => updateActionStatus(a.id, "applied")}>
                                    <Check className="h-3 w-3 mr-1" /> Aplicar
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateActionStatus(a.id, "dismissed")}>
                                    <X className="h-3 w-3 mr-1" /> Descartar
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        {actions.filter((a) => a.agent === agent.id).length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Nenhuma ação registrada ainda.
                          </p>
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* All recent actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Últimas ações de todos os agentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {actions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhuma ação registrada. Execute um agente para começar.
            </p>
          )}
          {actions.map((a) => {
            const agent = AGENTS.find((ag) => ag.id === a.agent);
            const Icon = agent?.icon || Bot;

            return (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className={`p-1.5 rounded-md ${agent?.bgCor || "bg-muted"}`}>
                  <Icon className={`h-3.5 w-3.5 ${agent?.cor || "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {actionTypeLabel[a.action_type] || a.action_type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(a.status)}
                  {a.status === "pending" && (
                    <>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateActionStatus(a.id, "applied")}>
                        <Check className="h-3 w-3 text-success" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateActionStatus(a.id, "dismissed")}>
                        <X className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
