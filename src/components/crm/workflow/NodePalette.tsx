import {
  Zap, MessageSquare, Mail, ArrowRight, Clock,
  Tag, Globe, Bot, GitBranch, Filter, Phone,
} from "lucide-react";

const PALETTE_ITEMS = [
  {
    category: "Gatilhos",
    items: [
      { type: "trigger", subtype: "lead_entered", label: "Lead entrou na etapa", icon: Zap, color: "text-warning" },
      { type: "trigger", subtype: "tag_added", label: "Tag adicionada", icon: Tag, color: "text-accent-foreground" },
      { type: "trigger", subtype: "form_submitted", label: "Formulário enviado", icon: Filter, color: "text-primary" },
      { type: "trigger", subtype: "whatsapp_received", label: "WhatsApp recebido", icon: Phone, color: "text-success" },
    ],
  },
  {
    category: "Ações",
    items: [
      { type: "action", subtype: "send_whatsapp", label: "Enviar WhatsApp", icon: MessageSquare, color: "text-success" },
      { type: "action", subtype: "send_email", label: "Enviar E-mail", icon: Mail, color: "text-primary" },
      { type: "action", subtype: "move_stage", label: "Mover Etapa", icon: ArrowRight, color: "text-warning" },
      { type: "action", subtype: "add_tag", label: "Adicionar Tag", icon: Tag, color: "text-accent-foreground" },
      { type: "action", subtype: "remove_tag", label: "Remover Tag", icon: Tag, color: "text-muted-foreground" },
      { type: "action", subtype: "webhook", label: "Webhook", icon: Globe, color: "text-primary" },
      { type: "action", subtype: "ai_message", label: "Mensagem IA", icon: Bot, color: "text-primary" },
    ],
  },
  {
    category: "Controle",
    items: [
      { type: "delay", subtype: "wait", label: "Aguardar", icon: Clock, color: "text-muted-foreground" },
      { type: "condition", subtype: "if_else", label: "Condição (Se/Senão)", icon: GitBranch, color: "text-warning" },
    ],
  },
];

export function NodePalette() {
  const onDragStart = (e: React.DragEvent, type: string, subtype: string, label: string) => {
    e.dataTransfer.setData("application/reactflow-type", type);
    e.dataTransfer.setData("application/reactflow-subtype", subtype);
    e.dataTransfer.setData("application/reactflow-label", label);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-56 border-r border-border bg-card p-3 overflow-y-auto space-y-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Componentes</p>
      {PALETTE_ITEMS.map((group) => (
        <div key={group.category}>
          <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase">
            {group.category}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.subtype}
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type, item.subtype, item.label)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-md border border-border bg-background hover:bg-accent/50 cursor-grab active:cursor-grabbing transition-colors text-xs"
                >
                  <Icon className={`h-3.5 w-3.5 ${item.color} shrink-0`} />
                  <span className="truncate">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
