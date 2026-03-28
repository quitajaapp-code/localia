import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, GitBranch, Trash2, Pencil, Power } from "lucide-react";
import { WorkflowEditor } from "@/components/crm/workflow/WorkflowEditor";

type Workflow = {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  funnel_id: string | null;
  nodes: any[];
  edges: any[];
  created_at: string;
  updated_at: string;
};

type Funnel = {
  id: string;
  nome: string;
};

export default function AdminWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [wfRes, fnRes] = await Promise.all([
      supabase.from("workflows" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("funnels" as any).select("id, nome").eq("ativo", true),
    ]);
    setWorkflows((wfRes.data as any[]) || []);
    setFunnels((fnRes.data as any[]) || []);
    setLoading(false);
  };

  const createWorkflow = async () => {
    setCreating(true);
    const defaultNodes = [
      {
        id: "node_0",
        type: "trigger",
        position: { x: 250, y: 50 },
        data: { label: "Lead entrou na etapa", subtype: "lead_entered", config: {} },
      },
    ];
    const { data, error } = await supabase
      .from("workflows" as any)
      .insert({ nome: "Novo Workflow", nodes: defaultNodes, edges: [] } as any)
      .select()
      .single();
    if (error) {
      toast.error("Erro ao criar workflow");
      setCreating(false);
      return;
    }
    setEditingId((data as any).id);
    setCreating(false);
  };

  const toggleActive = async (wf: Workflow) => {
    await supabase
      .from("workflows" as any)
      .update({ ativo: !wf.ativo } as any)
      .eq("id", wf.id);
    setWorkflows((prev) =>
      prev.map((w) => (w.id === wf.id ? { ...w, ativo: !w.ativo } : w))
    );
  };

  const deleteWorkflow = async (id: string) => {
    await supabase.from("workflows" as any).delete().eq("id", id);
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
    toast.success("Workflow excluído");
  };

  const getFunnelName = (id: string | null) =>
    funnels.find((f) => f.id === id)?.nome || "—";

  // If editing, show the full editor
  if (editingId) {
    return (
      <WorkflowEditor
        workflowId={editingId}
        onBack={() => {
          setEditingId(null);
          loadData();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Workflows de Automação</h1>
          <p className="text-sm text-muted-foreground">
            Crie fluxos visuais com gatilhos, ações, condições e delays.
          </p>
        </div>
        <Button onClick={createWorkflow} disabled={creating}>
          <Plus className="h-4 w-4 mr-2" /> Novo Workflow
        </Button>
      </div>

      {workflows.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg">
          <GitBranch className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum workflow criado ainda.</p>
          <Button variant="outline" className="mt-3" onClick={createWorkflow}>
            <Plus className="h-4 w-4 mr-2" /> Criar primeiro workflow
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors"
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <GitBranch className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{wf.nome}</span>
                  <Badge variant={wf.ativo ? "default" : "secondary"} className="text-[10px]">
                    {wf.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {wf.nodes?.length || 0} nós · {wf.edges?.length || 0} conexões
                  {wf.funnel_id && ` · Funil: ${getFunnelName(wf.funnel_id)}`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleActive(wf)}
                  title={wf.ativo ? "Desativar" : "Ativar"}
                >
                  <Power className={`h-4 w-4 ${wf.ativo ? "text-success" : "text-muted-foreground"}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditingId(wf.id)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteWorkflow(wf.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
