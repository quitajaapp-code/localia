import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus, Trash2, GripVertical, MessageSquare, ArrowRight,
  Tag, Globe, Bot, Clock, Mail,
} from "lucide-react";
import type { Stage } from "@/pages/admin/AdminCRM";
import { TemplatePicker } from "@/components/crm/TemplatePicker";
import { MessagePreview } from "@/components/crm/MessagePreview";

type StageAction = {
  id: string;
  stage_id: string;
  tipo: string;
  ordem: number;
  config: any;
  delay_minutos: number;
  ativo: boolean;
};

const ACTION_TYPES = [
  { value: "send_whatsapp", label: "Enviar WhatsApp", icon: MessageSquare, color: "text-success" },
  { value: "send_email", label: "Enviar E-mail", icon: Mail, color: "text-primary" },
  { value: "move_stage", label: "Mover para Etapa", icon: ArrowRight, color: "text-warning" },
  { value: "add_tag", label: "Adicionar Tag", icon: Tag, color: "text-accent-foreground" },
  { value: "remove_tag", label: "Remover Tag", icon: Tag, color: "text-muted-foreground" },
  { value: "webhook", label: "Chamar Webhook", icon: Globe, color: "text-primary" },
  { value: "ai_message", label: "Mensagem IA", icon: Bot, color: "text-primary" },
  { value: "delay", label: "Aguardar (delay)", icon: Clock, color: "text-muted-foreground" },
];

interface StageActionsDialogProps {
  stage: Stage;
  stages: Stage[];
  onClose: () => void;
}

export function StageActionsDialog({ stage, stages, onClose }: StageActionsDialogProps) {
  const [actions, setActions] = useState<StageAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadActions(); }, [stage.id]);

  const loadActions = async () => {
    const { data } = await supabase
      .from("stage_actions" as any)
      .select("*")
      .eq("stage_id", stage.id)
      .order("ordem");
    setActions((data as any[]) || []);
    setLoading(false);
  };

  const addAction = async (tipo: string) => {
    const ordem = actions.length;
    const { data, error } = await supabase.from("stage_actions" as any).insert({
      stage_id: stage.id,
      tipo,
      ordem,
      config: {},
      delay_minutos: tipo === "delay" ? 60 : 0,
    } as any).select().single();
    if (error) { toast.error("Erro ao adicionar ação"); return; }
    setActions([...actions, data as any]);
  };

  const updateAction = async (id: string, updates: Partial<StageAction>) => {
    await supabase.from("stage_actions" as any).update(updates as any).eq("id", id);
    setActions(actions.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAction = async (id: string) => {
    await supabase.from("stage_actions" as any).delete().eq("id", id);
    setActions(actions.filter(a => a.id !== id));
    toast.success("Ação removida");
  };

  const renderActionConfig = (action: StageAction) => {
    const config = action.config || {};

    switch (action.tipo) {
      case "send_whatsapp":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TemplatePicker
                onSelect={(msg) => updateAction(action.id, { config: { ...config, message: msg } })}
              />
              <span className="text-[10px] text-muted-foreground">ou escreva abaixo</span>
            </div>
            <Textarea
              value={config.message || ""}
              onChange={(e) => updateAction(action.id, { config: { ...config, message: e.target.value } })}
              placeholder="Olá {{nome}}, tudo bem? Sou da LocalAI..."
              rows={3}
              className="text-xs"
            />
            <p className="text-[10px] text-muted-foreground">
              Variáveis: {"{{nome}}"} {"{{empresa}}"} {"{{cidade}}"} {"{{nicho}}"} {"{{whatsapp}}"} {"{{email}}"}
            </p>
          </div>
        );

      case "send_email":
        return (
          <div className="space-y-2">
            <Input
              value={config.subject || ""}
              onChange={(e) => updateAction(action.id, { config: { ...config, subject: e.target.value } })}
              placeholder="Assunto do e-mail"
              className="text-xs"
            />
            <Textarea
              value={config.body || ""}
              onChange={(e) => updateAction(action.id, { config: { ...config, body: e.target.value } })}
              placeholder="Corpo do e-mail..."
              rows={3}
              className="text-xs"
            />
          </div>
        );

      case "move_stage":
        return (
          <Select
            value={config.target_stage || ""}
            onValueChange={(v) => updateAction(action.id, { config: { ...config, target_stage: v } })}
          >
            <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Selecione a etapa" /></SelectTrigger>
            <SelectContent>
              {stages.filter(s => s.id !== stage.id).map((s) => (
                <SelectItem key={s.slug} value={s.slug}>{s.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "add_tag":
      case "remove_tag":
        return (
          <Input
            value={config.tag || ""}
            onChange={(e) => updateAction(action.id, { config: { ...config, tag: e.target.value } })}
            placeholder="Nome da tag"
            className="text-xs h-8"
          />
        );

      case "webhook":
        return (
          <Input
            value={config.url || ""}
            onChange={(e) => updateAction(action.id, { config: { ...config, url: e.target.value } })}
            placeholder="https://..."
            className="text-xs h-8"
          />
        );

      case "ai_message":
        return (
          <Textarea
            value={config.prompt || ""}
            onChange={(e) => updateAction(action.id, { config: { ...config, prompt: e.target.value } })}
            placeholder="Instrução para o agente IA..."
            rows={2}
            className="text-xs"
          />
        );

      case "delay":
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={action.delay_minutos}
              onChange={(e) => updateAction(action.id, { delay_minutos: parseInt(e.target.value) || 0 })}
              className="w-24 text-xs h-8"
            />
            <span className="text-xs text-muted-foreground">minutos</span>
          </div>
        );

      default:
        return null;
    }
  };

  const getActionType = (tipo: string) => ACTION_TYPES.find(t => t.value === tipo);

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: stage.cor }} />
            Ações — {stage.nome}
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground -mt-1">
          Ações executadas automaticamente quando um lead entra nesta etapa.
        </p>

        {loading ? (
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {actions.map((action, idx) => {
              const type = getActionType(action.tipo);
              const Icon = type?.icon || Globe;
              return (
                <div key={action.id} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <Badge variant="outline" className="text-[10px] py-0">
                      {idx + 1}
                    </Badge>
                    <Icon className={`h-4 w-4 ${type?.color || ""}`} />
                    <span className="text-sm font-medium flex-1">{type?.label || action.tipo}</span>
                    <Switch
                      checked={action.ativo}
                      onCheckedChange={(v) => updateAction(action.id, { ativo: v })}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive"
                      onClick={() => deleteAction(action.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {action.delay_minutos > 0 && action.tipo !== "delay" && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Aguardar {action.delay_minutos} min antes de executar
                    </div>
                  )}

                  {renderActionConfig(action)}
                </div>
              );
            })}

            {actions.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Nenhuma ação configurada. Adicione ações abaixo.
              </div>
            )}

            {/* Add action buttons */}
            <div className="border-t border-border pt-3">
              <Label className="text-xs text-muted-foreground mb-2 block">Adicionar ação</Label>
              <div className="flex flex-wrap gap-1.5">
                {ACTION_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.value}
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => addAction(type.value)}
                    >
                      <Icon className={`h-3 w-3 ${type.color}`} />
                      {type.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
