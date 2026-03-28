import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Settings2, Building2, MapPin, MessageSquare, Phone } from "lucide-react";
import { LeadCard } from "@/components/crm/LeadCard";
import { NewLeadDialog } from "@/components/crm/NewLeadDialog";
import { LeadDetailDialog } from "@/components/crm/LeadDetailDialog";
import { FunnelSelector } from "@/components/crm/FunnelSelector";
import { StageActionsDialog } from "@/components/crm/StageActionsDialog";

export type Lead = {
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
  tags: string[] | null;
  ultimo_contato: string | null;
  valor_estimado: number | null;
  created_at: string;
};

export type Stage = {
  id: string;
  nome: string;
  slug: string;
  ordem: number;
  cor: string;
  funnel_id: string | null;
};

export type Funnel = {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
};

export default function AdminCRM() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<string | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<string | null>(null);
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [actionsStage, setActionsStage] = useState<Stage | null>(null);

  useEffect(() => { loadFunnels(); }, []);
  useEffect(() => { if (selectedFunnel) loadData(); }, [selectedFunnel]);

  const loadFunnels = async () => {
    const { data } = await supabase.from("funnels" as any).select("*").eq("ativo", true).order("created_at");
    const funnelList = (data as any[]) || [];
    setFunnels(funnelList);
    if (funnelList.length > 0 && !selectedFunnel) {
      setSelectedFunnel(funnelList[0].id);
    }
    setLoading(false);
  };

  const loadData = async () => {
    const [stagesRes, leadsRes] = await Promise.all([
      supabase.from("pipeline_stages" as any).select("*").eq("funnel_id", selectedFunnel).order("ordem"),
      supabase.from("leads" as any).select("*").order("pipeline_order"),
    ]);
    setStages((stagesRes.data as any[]) || []);
    setLeads((leadsRes.data as any[]) || []);
  };

  const getLeadsForStage = (slug: string) =>
    leads.filter((l) => l.pipeline_stage === slug);

  const handleDragStart = (leadId: string) => setDragging(leadId);

  const handleDrop = async (stage: string) => {
    if (!dragging) return;
    const prevStage = leads.find(l => l.id === dragging)?.pipeline_stage;
    
    await supabase.from("leads" as any)
      .update({ pipeline_stage: stage, updated_at: new Date().toISOString() } as any)
      .eq("id", dragging);
    
    setLeads((prev) =>
      prev.map((l) => l.id === dragging ? { ...l, pipeline_stage: stage } : l)
    );

    // Executa ações automáticas do novo estágio
    if (prevStage !== stage) {
      supabase.functions.invoke("execute-stage-actions", {
        body: { lead_id: dragging, stage_slug: stage },
      }).then(({ error }) => {
        if (error) console.error("Erro ao executar ações:", error);
      });
    }

    setDragging(null);
  };

  const handleLeadCreated = () => {
    setNewLeadOpen(false);
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold">CRM — Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            {leads.length} leads · R${totalValue.toLocaleString("pt-BR")} ganhos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FunnelSelector
            funnels={funnels}
            selected={selectedFunnel}
            onSelect={setSelectedFunnel}
            onFunnelCreated={loadFunnels}
          />
          <Button onClick={() => setNewLeadOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Lead
          </Button>
        </div>
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setActionsStage(stage)}
                  title="Configurar ações automáticas"
                >
                  <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>

              {/* Cards */}
              <div className="space-y-2 min-h-[100px]">
                {stageLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    scoreColor={scoreColor}
                    onDragStart={handleDragStart}
                    onClick={setSelectedLead}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <NewLeadDialog
        open={newLeadOpen}
        onOpenChange={setNewLeadOpen}
        onCreated={handleLeadCreated}
        defaultStage={stages[0]?.slug || "novo"}
      />

      {selectedLead && (
        <LeadDetailDialog
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          scoreColor={scoreColor}
        />
      )}

      {actionsStage && (
        <StageActionsDialog
          stage={actionsStage}
          stages={stages}
          onClose={() => setActionsStage(null)}
        />
      )}
    </div>
  );
}
