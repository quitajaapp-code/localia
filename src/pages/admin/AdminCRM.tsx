import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus, Phone, MessageSquare, Mail, Building2, MapPin,
} from "lucide-react";

type Lead = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  empresa: string | null;
  nicho: string | null;
  cidade: string | null;
  estado: string | null;
  pipeline_stage: string;
  score: number;
  source: string;
  notas: string | null;
  ultimo_contato: string | null;
  valor_estimado: number | null;
  created_at: string;
};

type Stage = {
  id: string;
  nome: string;
  slug: string;
  ordem: number;
  cor: string;
};

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manual",
  whatsapp: "WhatsApp",
  site: "Site",
  indicacao: "Indicação",
  ads: "Ads",
};

export default function AdminCRM() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<string | null>(null);
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [form, setForm] = useState({
    nome: "", email: "", whatsapp: "", telefone: "",
    empresa: "", nicho: "", cidade: "", estado: "",
    source: "manual", notas: "", valor_estimado: "",
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [stagesRes, leadsRes] = await Promise.all([
      supabase.from("pipeline_stages" as any).select("*").order("ordem"),
      supabase.from("leads" as any).select("*").order("pipeline_order"),
    ]);
    setStages((stagesRes.data as any[]) || []);
    setLeads((leadsRes.data as any[]) || []);
    setLoading(false);
  };

  const getLeadsForStage = (slug: string) =>
    leads.filter((l) => l.pipeline_stage === slug);

  const handleDragStart = (leadId: string) => setDragging(leadId);

  const handleDrop = async (stage: string) => {
    if (!dragging) return;
    await supabase.from("leads" as any)
      .update({ pipeline_stage: stage, updated_at: new Date().toISOString() } as any)
      .eq("id", dragging);
    setLeads((prev) =>
      prev.map((l) => l.id === dragging ? { ...l, pipeline_stage: stage } : l)
    );
    setDragging(null);
  };

  const handleCreateLead = async () => {
    if (!form.nome.trim()) { toast.error("Nome é obrigatório"); return; }
    const { error } = await supabase.from("leads" as any).insert({
      ...form,
      valor_estimado: form.valor_estimado ? parseFloat(form.valor_estimado) : null,
      pipeline_stage: "novo",
    } as any);
    if (error) { toast.error("Erro ao criar lead"); return; }
    toast.success("Lead criado!");
    setNewLeadOpen(false);
    setForm({ nome: "", email: "", whatsapp: "", telefone: "", empresa: "", nicho: "", cidade: "", estado: "", source: "manual", notas: "", valor_estimado: "" });
    loadData();
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "bg-success/10 text-success";
    if (score >= 50) return "bg-warning/10 text-warning";
    return "bg-muted text-muted-foreground";
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  const totalValue = leads
    .filter((l) => l.pipeline_stage === "ganho")
    .reduce((s, l) => s + (l.valor_estimado || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">CRM — Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            {leads.length} leads · R${totalValue.toLocaleString("pt-BR")} ganhos
          </p>
        </div>
        <Button onClick={() => setNewLeadOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Novo Lead
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
        {stages.map((stage) => {
          const stageLeads = getLeadsForStage(stage.slug);
          return (
            <div
              key={stage.slug}
              className="flex-shrink-0 w-72"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(stage.slug)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: stage.cor }}
                  />
                  <span className="text-sm font-semibold">{stage.nome}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                    {stageLeads.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-2 min-h-[100px]">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead.id)}
                    onClick={() => setSelectedLead(lead)}
                    className="bg-card border border-border rounded-xl p-3 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {lead.nome.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium leading-tight">{lead.nome}</span>
                      </div>
                      {lead.score > 0 && (
                        <Badge className={`text-xs ${scoreColor(lead.score)}`}>
                          {lead.score}
                        </Badge>
                      )}
                    </div>

                    {lead.empresa && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Building2 className="h-3 w-3" />
                        {lead.empresa}
                      </div>
                    )}
                    {lead.cidade && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <MapPin className="h-3 w-3" />
                        {lead.cidade}, {lead.estado}
                      </div>
                    )}
                    {lead.nicho && (
                      <Badge variant="outline" className="text-xs mt-1">{lead.nicho}</Badge>
                    )}

                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                      {lead.whatsapp && (
                        <a
                          href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-success hover:underline flex items-center gap-0.5"
                        >
                          <MessageSquare className="h-3 w-3" /> WA
                        </a>
                      )}
                      {lead.telefone && (
                        <a
                          href={`tel:${lead.telefone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-primary hover:underline flex items-center gap-0.5"
                        >
                          <Phone className="h-3 w-3" /> Ligar
                        </a>
                      )}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {SOURCE_LABELS[lead.source] || lead.source}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Novo Lead */}
      <Dialog open={newLeadOpen} onOpenChange={setNewLeadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nome *</Label>
                <Input value={form.nome} onChange={(e) => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="João Silva" />
              </div>
              <div>
                <Label>Empresa</Label>
                <Input value={form.empresa} onChange={(e) => setForm(p => ({ ...p, empresa: e.target.value }))} placeholder="Pizzaria..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>WhatsApp</Label>
                <Input value={form.whatsapp} onChange={(e) => setForm(p => ({ ...p, whatsapp: e.target.value }))} placeholder="(51) 99999-9999" />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@..." />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Nicho</Label>
                <Input value={form.nicho} onChange={(e) => setForm(p => ({ ...p, nicho: e.target.value }))} placeholder="Restaurante" />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input value={form.cidade} onChange={(e) => setForm(p => ({ ...p, cidade: e.target.value }))} placeholder="Porto Alegre" />
              </div>
              <div>
                <Label>UF</Label>
                <Input value={form.estado} onChange={(e) => setForm(p => ({ ...p, estado: e.target.value }))} placeholder="RS" maxLength={2} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Origem</Label>
                <Select value={form.source} onValueChange={(v) => setForm(p => ({ ...p, source: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor estimado (R$)</Label>
                <Input value={form.valor_estimado} onChange={(e) => setForm(p => ({ ...p, valor_estimado: e.target.value }))} placeholder="197" type="number" />
              </div>
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea value={form.notas} onChange={(e) => setForm(p => ({ ...p, notas: e.target.value }))} placeholder="Observações sobre o lead..." rows={2} />
            </div>
            <Button onClick={handleCreateLead} className="w-full">Criar Lead</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Detalhes do Lead */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {selectedLead.nome.charAt(0)}
                </div>
                {selectedLead.nome}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              {selectedLead.empresa && <div className="flex gap-2"><Building2 className="h-4 w-4 text-muted-foreground mt-0.5" /><span>{selectedLead.empresa}</span></div>}
              {selectedLead.email && <div className="flex gap-2"><Mail className="h-4 w-4 text-muted-foreground mt-0.5" /><a href={`mailto:${selectedLead.email}`} className="text-primary">{selectedLead.email}</a></div>}
              {selectedLead.whatsapp && <div className="flex gap-2"><MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" /><a href={`https://wa.me/55${selectedLead.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener" className="text-success">{selectedLead.whatsapp}</a></div>}
              {selectedLead.telefone && <div className="flex gap-2"><Phone className="h-4 w-4 text-muted-foreground mt-0.5" /><a href={`tel:${selectedLead.telefone}`} className="text-primary">{selectedLead.telefone}</a></div>}
              {selectedLead.cidade && <div className="flex gap-2"><MapPin className="h-4 w-4 text-muted-foreground mt-0.5" /><span>{selectedLead.cidade}, {selectedLead.estado}</span></div>}
              {selectedLead.notas && <div className="p-3 bg-muted rounded-lg text-muted-foreground">{selectedLead.notas}</div>}
              <div className="flex items-center gap-3 pt-2">
                <Badge className={scoreColor(selectedLead.score)}>Score: {selectedLead.score}</Badge>
                {selectedLead.valor_estimado && <span className="text-success font-medium">R${selectedLead.valor_estimado.toLocaleString("pt-BR")}</span>}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
