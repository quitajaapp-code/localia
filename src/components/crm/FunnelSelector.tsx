import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, GitBranch } from "lucide-react";
import type { Funnel } from "@/pages/admin/AdminCRM";

interface FunnelSelectorProps {
  funnels: Funnel[];
  selected: string | null;
  onSelect: (id: string) => void;
  onFunnelCreated: () => void;
}

export function FunnelSelector({ funnels, selected, onSelect, onFunnelCreated }: FunnelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  const handleCreate = async () => {
    if (!nome.trim()) { toast.error("Nome é obrigatório"); return; }
    const { data, error } = await supabase.from("funnels" as any).insert({
      nome: nome.trim(),
      descricao: descricao.trim() || null,
    } as any).select().single();
    if (error) { toast.error("Erro ao criar funil"); return; }

    // Cria estágios padrão para o novo funil
    const defaultStages = [
      { nome: "Novo Lead", slug: `novo-${(data as any).id.slice(0, 8)}`, ordem: 0, cor: "#6366F1", funnel_id: (data as any).id },
      { nome: "Contato", slug: `contato-${(data as any).id.slice(0, 8)}`, ordem: 1, cor: "#F59E0B", funnel_id: (data as any).id },
      { nome: "Qualificado", slug: `qualificado-${(data as any).id.slice(0, 8)}`, ordem: 2, cor: "#3B82F6", funnel_id: (data as any).id },
      { nome: "Proposta", slug: `proposta-${(data as any).id.slice(0, 8)}`, ordem: 3, cor: "#8B5CF6", funnel_id: (data as any).id },
      { nome: "Ganho", slug: `ganho-${(data as any).id.slice(0, 8)}`, ordem: 4, cor: "#10B981", funnel_id: (data as any).id },
      { nome: "Perdido", slug: `perdido-${(data as any).id.slice(0, 8)}`, ordem: 5, cor: "#EF4444", funnel_id: (data as any).id },
    ];
    await supabase.from("pipeline_stages" as any).insert(defaultStages as any);

    toast.success("Funil criado!");
    setOpen(false);
    setNome("");
    setDescricao("");
    onFunnelCreated();
    onSelect((data as any).id);
  };

  return (
    <div className="flex items-center gap-2">
      <GitBranch className="h-4 w-4 text-muted-foreground" />
      <Select value={selected || ""} onValueChange={onSelect}>
        <SelectTrigger className="w-48 h-9 text-sm">
          <SelectValue placeholder="Selecione um funil" />
        </SelectTrigger>
        <SelectContent>
          {funnels.map((f) => (
            <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Novo Funil</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome *</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Funil de Vendas" /></div>
            <div><Label>Descrição</Label><Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Pipeline para novos clientes..." /></div>
            <Button onClick={handleCreate} className="w-full">Criar Funil</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
