import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MessageSquare, Copy, Search, Send, MessageCircle, TrendingUp } from "lucide-react";
import { MessagePreview } from "@/components/crm/MessagePreview";
import { TemplateUsageChart } from "@/components/crm/TemplateUsageChart";

type Template = {
  id: string;
  nome: string;
  categoria: string;
  mensagem: string;
  variaveis: string[];
  ativo: boolean;
  created_at: string;
};

type UsageStats = {
  template_id: string;
  total_envios: number;
  total_entregues: number;
  total_respondidos: number;
};

const CATEGORIAS = [
  { value: "geral", label: "Geral" },
  { value: "onboarding", label: "Onboarding" },
  { value: "followup", label: "Follow-up" },
  { value: "agendamento", label: "Agendamento" },
  { value: "comercial", label: "Comercial" },
  { value: "pos-venda", label: "Pós-venda" },
  { value: "reativacao", label: "Reativação" },
];

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [usageMap, setUsageMap] = useState<Record<string, UsageStats>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [editOpen, setEditOpen] = useState(false);
  const [usageRows, setUsageRows] = useState<any[]>([]);
  const [editing, setEditing] = useState<Partial<Template> | null>(null);

  useEffect(() => { loadTemplates(); }, []);

  const loadTemplates = async () => {
    const [{ data: tplData }, { data: usageData }] = await Promise.all([
      supabase
        .from("whatsapp_templates" as any)
        .select("*")
        .order("categoria")
        .order("nome"),
      supabase
        .from("template_usage" as any)
        .select("template_id, entregue, respondido, enviado_em"),
    ]);

    setTemplates((tplData as any[]) || []);
    const rows = (usageData as any[]) || [];
    setUsageRows(rows);

    // Aggregate usage stats client-side
    const map: Record<string, UsageStats> = {};
    ((usageData as any[]) || []).forEach((row: any) => {
      if (!map[row.template_id]) {
        map[row.template_id] = { template_id: row.template_id, total_envios: 0, total_entregues: 0, total_respondidos: 0 };
      }
      map[row.template_id].total_envios++;
      if (row.entregue) map[row.template_id].total_entregues++;
      if (row.respondido) map[row.template_id].total_respondidos++;
    });
    setUsageMap(map);
    setLoading(false);
  };

  const openNew = () => {
    setEditing({ nome: "", categoria: "geral", mensagem: "", variaveis: [], ativo: true });
    setEditOpen(true);
  };

  const openEdit = (t: Template) => {
    setEditing({ ...t });
    setEditOpen(true);
  };

  const extractVars = (msg: string): string[] => {
    const matches = msg.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map((m) => m.replace(/[{}]/g, "")))];
  };

  const handleSave = async () => {
    if (!editing?.nome || !editing?.mensagem) {
      toast.error("Preencha nome e mensagem");
      return;
    }
    const vars = extractVars(editing.mensagem);
    const payload = {
      nome: editing.nome,
      categoria: editing.categoria || "geral",
      mensagem: editing.mensagem,
      variaveis: vars,
      ativo: editing.ativo ?? true,
      updated_at: new Date().toISOString(),
    };

    if (editing.id) {
      await supabase.from("whatsapp_templates" as any).update(payload as any).eq("id", editing.id);
      toast.success("Template atualizado");
    } else {
      await supabase.from("whatsapp_templates" as any).insert(payload as any);
      toast.success("Template criado");
    }
    setEditOpen(false);
    loadTemplates();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("whatsapp_templates" as any).delete().eq("id", id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.success("Template excluído");
  };

  const copyMessage = (msg: string) => {
    navigator.clipboard.writeText(msg);
    toast.success("Mensagem copiada!");
  };

  const filtered = templates.filter((t) => {
    if (filterCat !== "all" && t.categoria !== filterCat) return false;
    if (search && !t.nome.toLowerCase().includes(search.toLowerCase()) && !t.mensagem.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Global stats
  const globalEnvios = Object.values(usageMap).reduce((s, u) => s + u.total_envios, 0);
  const globalEntregues = Object.values(usageMap).reduce((s, u) => s + u.total_entregues, 0);
  const globalRespondidos = Object.values(usageMap).reduce((s, u) => s + u.total_respondidos, 0);
  const globalTaxaResposta = globalEnvios > 0 ? ((globalRespondidos / globalEnvios) * 100).toFixed(1) : "0";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold">Templates WhatsApp</h1>
          <p className="text-sm text-muted-foreground">
            {templates.length} templates · Reutilize nas ações automáticas do pipeline
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" /> Novo Template
        </Button>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<MessageSquare className="h-4 w-4 text-primary" />} label="Templates" value={templates.length} />
        <StatCard icon={<Send className="h-4 w-4 text-success" />} label="Envios totais" value={globalEnvios} />
        <StatCard icon={<MessageCircle className="h-4 w-4 text-warning" />} label="Respostas" value={globalRespondidos} />
        <StatCard icon={<TrendingUp className="h-4 w-4 text-accent-foreground" />} label="Taxa de resposta" value={`${globalTaxaResposta}%`} />
      </div>

      {/* Weekly Chart */}
      <TemplateUsageChart usageRows={usageRows} />

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {CATEGORIAS.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg">
          <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum template encontrado.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((t) => {
            const usage = usageMap[t.id];
            const envios = usage?.total_envios || 0;
            const respondidos = usage?.total_respondidos || 0;
            const taxa = envios > 0 ? ((respondidos / envios) * 100).toFixed(0) : null;

            return (
              <div
                key={t.id}
                className="p-4 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-success shrink-0" />
                    <span className="font-semibold text-sm">{t.nome}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {CATEGORIAS.find((c) => c.value === t.categoria)?.label || t.categoria}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {t.mensagem}
                </p>

                {/* Usage metrics inline */}
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Send className="h-3 w-3" /> {envios} envio{envios !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MessageCircle className="h-3 w-3" /> {respondidos} resposta{respondidos !== 1 ? "s" : ""}
                  </span>
                  {taxa !== null && (
                    <Badge variant={Number(taxa) >= 30 ? "default" : "secondary"} className="text-[9px] py-0">
                      {taxa}% taxa
                    </Badge>
                  )}
                </div>

                {t.variaveis?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {t.variaveis.map((v) => (
                      <Badge key={v} variant="secondary" className="text-[9px] py-0">
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1 pt-1">
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => copyMessage(t.mensagem)}>
                    <Copy className="h-3 w-3 mr-1" /> Copiar
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEdit(t)}>
                    <Pencil className="h-3 w-3 mr-1" /> Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={() => handleDelete(t.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Excluir
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar Template" : "Novo Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Nome</Label>
              <Input
                value={editing?.nome || ""}
                onChange={(e) => setEditing((p) => ({ ...p, nome: e.target.value }))}
                placeholder="Ex: Boas-vindas"
              />
            </div>
            <div>
              <Label className="text-xs">Categoria</Label>
              <Select
                value={editing?.categoria || "geral"}
                onValueChange={(v) => setEditing((p) => ({ ...p, categoria: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Mensagem</Label>
              <Textarea
                value={editing?.mensagem || ""}
                onChange={(e) => setEditing((p) => ({ ...p, mensagem: e.target.value }))}
                placeholder="Olá {{nome}}, tudo bem? ..."
                rows={5}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Use variáveis: {"{{nome}}"} {"{{empresa}}"} {"{{cidade}}"} {"{{email}}"} {"{{whatsapp}}"} {"{{nicho}}"}
              </p>
              <MessagePreview message={editing?.mensagem || ""} />
            </div>
            <Button onClick={handleSave} className="w-full">
              {editing?.id ? "Salvar alterações" : "Criar template"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 flex items-center gap-3">
      <div className="rounded-md bg-muted p-2">{icon}</div>
      <div>
        <p className="text-lg font-bold leading-none">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
