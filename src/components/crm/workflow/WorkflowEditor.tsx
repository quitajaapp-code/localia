import { useCallback, useRef, useState, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  MarkerType,
  Panel,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, ArrowLeft, Play, Trash2 } from "lucide-react";

import { TriggerNode } from "./nodes/TriggerNode";
import { ActionNode } from "./nodes/ActionNode";
import { ConditionNode } from "./nodes/ConditionNode";
import { DelayNode } from "./nodes/DelayNode";
import { NodePalette } from "./NodePalette";

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
};

const defaultEdgeOptions = {
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { strokeWidth: 2 },
};

interface WorkflowEditorProps {
  workflowId?: string;
  funnelId?: string;
  onBack: () => void;
}

export function WorkflowEditor({ workflowId, funnelId, onBack }: WorkflowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = useState("Novo Workflow");
  const [saving, setSaving] = useState(false);
  const [currentId, setCurrentId] = useState(workflowId || "");
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const idCounter = useRef(1);

  useEffect(() => {
    if (workflowId) loadWorkflow(workflowId);
  }, [workflowId]);

  const loadWorkflow = async (id: string) => {
    const { data } = await supabase
      .from("workflows" as any)
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      const wf = data as any;
      setWorkflowName(wf.nome);
      setNodes(wf.nodes || []);
      setEdges(wf.edges || []);
      idCounter.current = (wf.nodes?.length || 0) + 1;
    }
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/reactflow-type");
      const subtype = e.dataTransfer.getData("application/reactflow-subtype");
      const label = e.dataTransfer.getData("application/reactflow-label");
      if (!type) return;

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;

      const position = {
        x: e.clientX - bounds.left - 100,
        y: e.clientY - bounds.top - 30,
      };

      const newNode: Node = {
        id: `node_${idCounter.current++}`,
        type,
        position,
        data: { label, subtype, config: {} },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      nome: workflowName,
      funnel_id: funnelId || null,
      nodes: nodes as any,
      edges: edges as any,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (currentId) {
      ({ error } = await supabase
        .from("workflows" as any)
        .update(payload as any)
        .eq("id", currentId));
    } else {
      const res = await supabase
        .from("workflows" as any)
        .insert(payload as any)
        .select()
        .single();
      error = res.error;
      if (res.data) setCurrentId((res.data as any).id);
    }

    if (error) toast.error("Erro ao salvar workflow");
    else toast.success("Workflow salvo!");
    setSaving(false);
  };

  const deleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
  }, [setNodes, setEdges]);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-3 border-b border-border bg-card rounded-t-lg">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <Input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="max-w-xs h-8 text-sm font-semibold"
        />
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={deleteSelected}>
          <Trash2 className="h-4 w-4 mr-1" /> Excluir
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-1" /> {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Side palette */}
        <NodePalette />

        {/* Canvas */}
        <div ref={reactFlowWrapper} className="flex-1 bg-muted/30">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            deleteKeyCode={["Backspace", "Delete"]}
            className="rounded-b-lg"
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} className="bg-background" />
            <Controls className="bg-card border-border" />
            <Panel position="bottom-center">
              <p className="text-[10px] text-muted-foreground bg-card/80 px-3 py-1 rounded-full border border-border">
                Arraste nós da paleta · Conecte arrastando entre pontos · Delete para remover
              </p>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
