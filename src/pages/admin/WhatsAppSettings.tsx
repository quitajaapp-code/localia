import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Settings, Users, FileText, Plus, Trash2, Save, Phone } from "lucide-react";

export default function WhatsAppSettings() {
  const qc = useQueryClient();

  // ── Connection ──
  const connection = useQuery({
    queryKey: ["wa-connection"],
    queryFn: async () => {
      const { data } = await supabase.from("internal_wa_connections").select("*").limit(1).single();
      return data;
    },
  });

  const [connForm, setConnForm] = useState({ twilio_phone_number: "", twilio_account_sid: "", twilio_webhook_url: "" });

  const saveConnection = useMutation({
    mutationFn: async () => {
      if (connection.data) {
        const { error } = await supabase
          .from("internal_wa_connections")
          .update({
            twilio_phone_number: connForm.twilio_phone_number || (connection.data as any).twilio_phone_number,
            twilio_account_sid: connForm.twilio_account_sid || (connection.data as any).twilio_account_sid,
            twilio_webhook_url: connForm.twilio_webhook_url || (connection.data as any).twilio_webhook_url,
          } as any)
          .eq("id", (connection.data as any).id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("internal_wa_connections").insert({
          twilio_phone_number: connForm.twilio_phone_number,
          twilio_account_sid: connForm.twilio_account_sid,
          twilio_webhook_url: connForm.twilio_webhook_url,
          status: "active",
        } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wa-connection"] }); toast.success("Conexão salva"); },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Templates ──
  const templates = useQuery({
    queryKey: ["wa-templates"],
    queryFn: async () => {
      const { data } = await supabase.from("internal_wa_templates").select("*").order("created_at", { ascending: false });
      return (data || []) as any[];
    },
  });

  const [tplForm, setTplForm] = useState({ name: "", body_content: "", category: "sales" as string });
  const [tplDialogOpen, setTplDialogOpen] = useState(false);

  const createTemplate = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("internal_wa_templates").insert({
        name: tplForm.name,
        body_content: tplForm.body_content,
        category: tplForm.category,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wa-templates"] });
      setTplDialogOpen(false);
      setTplForm({ name: "", body_content: "", category: "sales" });
      toast.success("Template criado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleTemplate = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("internal_wa_templates").update({ is_active } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wa-templates"] }),
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("internal_wa_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wa-templates"] }); toast.success("Template removido"); },
  });

  // ── Agent Stats (for agent list) ──
  const agents = useQuery({
    queryKey: ["wa-agent-stats"],
    queryFn: async () => {
      const { data } = await supabase.from("internal_wa_agent_stats").select("*");
      return (data || []) as any[];
    },
  });

  const conn = connection.data as any;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">WhatsApp — Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie a conexão Twilio, agentes e templates.</p>
      </div>

      <Tabs defaultValue="connection">
        <TabsList>
          <TabsTrigger value="connection"><Settings className="h-4 w-4 mr-1" /> Conexão</TabsTrigger>
          <TabsTrigger value="agents"><Users className="h-4 w-4 mr-1" /> Agentes</TabsTrigger>
          <TabsTrigger value="templates"><FileText className="h-4 w-4 mr-1" /> Templates</TabsTrigger>
        </TabsList>

        {/* ── Connection Tab ── */}
        <TabsContent value="connection">
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2"><Phone className="h-4 w-4" /> Twilio WhatsApp</h2>
            {conn && (
              <Badge variant={conn.status === "active" ? "default" : "secondary"} className="capitalize">
                {conn.status}
              </Badge>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Número WhatsApp</Label>
                <Input
                  placeholder={conn?.twilio_phone_number || "+5511999999999"}
                  value={connForm.twilio_phone_number}
                  onChange={(e) => setConnForm((p) => ({ ...p, twilio_phone_number: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Account SID</Label>
                <Input
                  placeholder={conn?.twilio_account_sid || "ACxxxxxxx"}
                  value={connForm.twilio_account_sid}
                  onChange={(e) => setConnForm((p) => ({ ...p, twilio_account_sid: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Webhook URL</Label>
                <Input
                  placeholder={conn?.twilio_webhook_url || "https://...supabase.co/functions/v1/whatsapp-internal-webhook"}
                  value={connForm.twilio_webhook_url}
                  onChange={(e) => setConnForm((p) => ({ ...p, twilio_webhook_url: e.target.value }))}
                />
              </div>
            </div>
            <Button onClick={() => saveConnection.mutate()} disabled={saveConnection.isPending}>
              <Save className="h-4 w-4 mr-1" /> Salvar Conexão
            </Button>
          </Card>
        </TabsContent>

        {/* ── Agents Tab ── */}
        <TabsContent value="agents">
          <Card className="p-6">
            <h2 className="font-semibold mb-4">Agentes Ativos</h2>
            {agents.data?.length === 0 && <p className="text-sm text-muted-foreground">Nenhum agente registrado ainda.</p>}
            <div className="space-y-3">
              {agents.data?.map((a: any) => (
                <div key={a.agent_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{a.agent_id.slice(0, 8)}...</p>
                    <p className="text-xs text-muted-foreground">
                      {a.conversations_open} abertas · {a.conversations_closed} fechadas · {a.messages_sent} enviadas
                    </p>
                  </div>
                  <Badge variant={a.last_activity_at ? "default" : "secondary"}>
                    {a.last_activity_at ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* ── Templates Tab ── */}
        <TabsContent value="templates">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Templates de Mensagem</h2>
              <Dialog open={tplDialogOpen} onOpenChange={setTplDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Template</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Criar Template</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Nome</Label>
                      <Input value={tplForm.name} onChange={(e) => setTplForm((p) => ({ ...p, name: e.target.value }))} placeholder="boas-vindas-lead" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Categoria</Label>
                      <Select value={tplForm.category} onValueChange={(v) => setTplForm((p) => ({ ...p, category: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Vendas</SelectItem>
                          <SelectItem value="support">Suporte</SelectItem>
                          <SelectItem value="onboarding">Onboarding</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Corpo da Mensagem</Label>
                      <Textarea value={tplForm.body_content} onChange={(e) => setTplForm((p) => ({ ...p, body_content: e.target.value }))} placeholder="Olá {{nome}}! ..." rows={4} />
                      <p className="text-[10px] text-muted-foreground">Use {"{{variavel}}"} para variáveis dinâmicas.</p>
                    </div>
                    <Button onClick={() => createTemplate.mutate()} disabled={!tplForm.name || !tplForm.body_content || createTemplate.isPending} className="w-full">
                      Criar Template
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-2">
              {templates.data?.map((t: any) => (
                <div key={t.id} className="flex items-start justify-between p-3 border rounded-lg gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{t.name}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">{t.category}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{t.usage_count}x</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{t.body_content}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={t.is_active} onCheckedChange={(v) => toggleTemplate.mutate({ id: t.id, is_active: v })} />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteTemplate.mutate(t.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {templates.data?.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum template ainda.</p>}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
