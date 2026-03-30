import { useState, useMemo } from "react";
import { useWhatsApp, WhatsAppMessage } from "@/hooks/useWhatsApp";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, MessageCircle, CheckCircle2, XCircle, Clock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const statusIcon: Record<string, { icon: React.ElementType; cls: string }> = {
  queued: { icon: Clock, cls: "text-muted-foreground" },
  sent: { icon: CheckCircle2, cls: "text-emerald-500" },
  delivered: { icon: CheckCircle2, cls: "text-emerald-500" },
  read: { icon: Eye, cls: "text-blue-500" },
  failed: { icon: XCircle, cls: "text-destructive" },
};

interface Props {
  businessId: string;
  compact?: boolean;
}

export function WhatsAppPanel({ businessId, compact = false }: Props) {
  const { messages, isConnected, sendMessage, isLoading } = useWhatsApp(businessId);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [text, setText] = useState("");

  const contacts = useMemo(() => {
    const set = new Set<string>();
    messages.forEach((m) => {
      if (m.direction === "inbound" && m.from_number) set.add(m.from_number);
      if (m.direction === "outbound" && m.to_number) set.add(m.to_number);
    });
    return Array.from(set);
  }, [messages]);

  const filtered = useMemo(
    () => selectedContact ? messages.filter((m) => m.from_number === selectedContact || m.to_number === selectedContact) : [],
    [messages, selectedContact]
  );

  const handleSend = () => {
    if (!text.trim() || !selectedContact) return;
    sendMessage.mutate({ to_number: selectedContact, content: text.trim() });
    setText("");
  };

  if (!isConnected) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">WhatsApp não conectado</p>
      </Card>
    );
  }

  const height = compact ? "h-64" : "h-96";

  return (
    <Card className={cn("flex flex-col md:flex-row overflow-hidden", height)}>
      {/* Contacts */}
      <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-border">
        <ScrollArea className="h-full">
          {contacts.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedContact(c)}
              className={cn("w-full text-left px-3 py-2 text-xs hover:bg-accent", selectedContact === c && "bg-accent")}
            >
              +{c}
            </button>
          ))}
        </ScrollArea>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-3">
          {filtered.map((msg) => {
            const cfg = statusIcon[msg.status] || statusIcon.queued;
            const Icon = cfg.icon;
            return (
              <div key={msg.id} className={cn("max-w-[80%] p-2 rounded-lg text-xs mb-2", msg.direction === "outbound" ? "ml-auto bg-primary text-primary-foreground" : "mr-auto bg-muted")}>
                <p>{msg.content}</p>
                {msg.direction === "outbound" && <Icon className={cn("h-3 w-3 ml-auto mt-0.5", cfg.cls)} />}
              </div>
            );
          })}
        </ScrollArea>
        <div className="p-2 border-t border-border flex gap-1">
          <Input className="text-xs h-8" placeholder="Mensagem..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} />
          <Button size="icon" className="h-8 w-8" onClick={handleSend} disabled={sendMessage.isPending || !text.trim()}>
            {sendMessage.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          </Button>
        </div>
      </div>
    </Card>
  );
}
