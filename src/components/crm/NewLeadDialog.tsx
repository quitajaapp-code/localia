import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manual",
  whatsapp: "WhatsApp",
  site: "Site",
  indicacao: "Indicação",
  ads: "Ads",
};

interface NewLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  defaultStage: string;
}

export function NewLeadDialog({ open, onOpenChange, onCreated, defaultStage }: NewLeadDialogProps) {
  const [form, setForm] = useState({
    nome: "", email: "", whatsapp: "", telefone: "",
    empresa: "", nicho: "", cidade: "", estado: "",
    source: "manual", notas: "", valor_estimado: "",
  });

  const handleCreate = async () => {
    if (!form.nome.trim()) { toast.error("Nome é obrigatório"); return; }
    const { error } = await supabase.from("leads" as any).insert({
      ...form,
      valor_estimado: form.valor_estimado ? parseFloat(form.valor_estimado) : null,
      pipeline_stage: defaultStage,
    } as any);
    if (error) { toast.error("Erro ao criar lead"); return; }
    toast.success("Lead criado!");
    setForm({ nome: "", email: "", whatsapp: "", telefone: "", empresa: "", nicho: "", cidade: "", estado: "", source: "manual", notas: "", valor_estimado: "" });
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Lead</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nome *</Label><Input value={form.nome} onChange={(e) => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="João Silva" /></div>
            <div><Label>Empresa</Label><Input value={form.empresa} onChange={(e) => setForm(p => ({ ...p, empresa: e.target.value }))} placeholder="Pizzaria..." /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={(e) => setForm(p => ({ ...p, whatsapp: e.target.value }))} placeholder="(51) 99999-9999" /></div>
            <div><Label>E-mail</Label><Input value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@..." /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Nicho</Label><Input value={form.nicho} onChange={(e) => setForm(p => ({ ...p, nicho: e.target.value }))} placeholder="Restaurante" /></div>
            <div><Label>Cidade</Label><Input value={form.cidade} onChange={(e) => setForm(p => ({ ...p, cidade: e.target.value }))} placeholder="Porto Alegre" /></div>
            <div><Label>UF</Label><Input value={form.estado} onChange={(e) => setForm(p => ({ ...p, estado: e.target.value }))} placeholder="RS" maxLength={2} /></div>
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
            <div><Label>Valor estimado (R$)</Label><Input value={form.valor_estimado} onChange={(e) => setForm(p => ({ ...p, valor_estimado: e.target.value }))} placeholder="197" type="number" /></div>
          </div>
          <div><Label>Notas</Label><Textarea value={form.notas} onChange={(e) => setForm(p => ({ ...p, notas: e.target.value }))} placeholder="Observações..." rows={2} /></div>
          <Button onClick={handleCreate} className="w-full">Criar Lead</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
