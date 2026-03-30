import { useState, useMemo } from "react";
import { useWhatsApp, WhatsAppMessage } from "@/hooks/useWhatsApp";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Send,
  Settings,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Status helpers ─── */
const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  queued: { icon: Clock, color: "text-muted-foreground", label: "Na fila" },
  sent: { icon: CheckCircle2, color: "text-emerald-500", label: "Enviada" },
  delivered: { icon: CheckCircle2, color: "text-emerald-500", label: "Entregue" },
  read: { icon: Eye, color: "text-blue-500", label: "Lida" },
  failed: { icon: XCircle, color: "text-destructive", label: "Falhou" },
};

function MessageStatusIcon({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.queued;
  const Icon = cfg.icon;
  return <Icon className={cn("h-3.5 w-3.5", cfg.color)} aria-label={cfg.label} />;
}

function ConnectionBadge({ status }: { status: string }) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    pending: "secondary",
    suspended: "destructive",
    disconnected: "outline",
  };
  return <Badge variant={map[status] || "outline"}>{status}</Badge>;
}

/* ─── Setup Form ─── */
function SetupForm({ businessId, onConnect }: { businessId: string; onConnect: (d: any) => void }) {
  const [sid, setSid] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sid || !phoneNumber) return;
    setLoading(true);
    try {
      await onConnect({ business_id: businessId, twilio_account_sid: sid, twilio_phone_number: phoneNumber });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          Conectar WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium" htmlFor="wa-sid">Twilio Account SID</label>
            <Input id="wa-sid" placeholder="ACxxxxxxxx" value={sid} onChange={(e) => setSid(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="wa-phone">Número WhatsApp Twilio</label>
            <Input id="wa-phone" placeholder="+5511999999999" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">
            O Auth Token é configurado nos Supabase Secrets por segurança. Consulte a documentação.
          </p>
          <Button type="submit" disabled={loading || !sid || !phoneNumber} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Phone className="h-4 w-4 mr-2" />}
            Conectar WhatsApp
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/* ─── Chat Area ─── */
function ChatArea({
  messages,
  selectedContact,
  onSend,
  isSending,
}: {
  messages: WhatsAppMessage[];
  selectedContact: string | null;
  onSend: (to: string, content: string) => void;
  isSending: boolean;
}) {
  const [text, setText] = useState("");

  const filtered = useMemo(
    () =>
      selectedContact
        ? messages.filter((m) => m.from_number === selectedContact || m.to_number === selectedContact)
        : [],
    [messages, selectedContact]
  );

  const handleSend = () => {
    if (!text.trim() || !selectedContact) return;
    onSend(selectedContact, text.trim());
    setText("");
  };

  if (!selectedContact) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center space-y-2">
          <MessageCircle className="h-12 w-12 mx-auto opacity-40" />
          <p>Selecione um contato para iniciar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center gap-2">
        <Phone className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">{selectedContact}</span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">Nenhuma mensagem ainda</p>
          )}
          {filtered.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[75%] p-3 rounded-lg text-sm",
                msg.direction === "outbound"
                  ? "ml-auto bg-primary text-primary-foreground rounded-br-none"
                  : "mr-auto bg-muted rounded-bl-none"
              )}
            >
              <p>{msg.content}</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[10px] opacity-70">
                  {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
                {msg.direction === "outbound" && <MessageStatusIcon status={msg.status} />}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border flex gap-2">
        <Input
          placeholder="Digite sua mensagem..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          aria-label="Mensagem"
        />
        <Button size="icon" onClick={handleSend} disabled={isSending || !text.trim()} aria-label="Enviar mensagem">
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function WhatsAppPage() {
  const { user } = useAuth();
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  const { data: business } = useQuery({
    queryKey: ["business", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from("businesses").select("id").eq("user_id", user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const {
    connection,
    messages,
    isLoading,
    createConnection,
    sendMessage,
    isConnected,
  } = useWhatsApp(business?.id);

  // Contatos únicos extraídos das mensagens
  const contacts = useMemo(() => {
    const set = new Set<string>();
    messages.forEach((m) => {
      if (m.direction === "inbound" && m.from_number) set.add(m.from_number);
      if (m.direction === "outbound" && m.to_number) set.add(m.to_number);
    });
    return Array.from(set);
  }, [messages]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!business?.id) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>Configure seu negócio primeiro em Configurações.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          WhatsApp
        </h1>
        {connection && <ConnectionBadge status={connection.status} />}
      </div>

      {!isConnected ? (
        <SetupForm businessId={business.id} onConnect={(d) => createConnection.mutate(d)} />
      ) : (
        <Tabs defaultValue="messages">
          <TabsList>
            <TabsTrigger value="messages" className="gap-1.5">
              <MessageSquare className="h-4 w-4" /> Mensagens
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5">
              <Settings className="h-4 w-4" /> Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages">
            <Card className="h-[calc(100vh-240px)] min-h-[400px] flex flex-col md:flex-row overflow-hidden">
              {/* Contacts sidebar */}
              <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border">
                <div className="p-3 border-b border-border">
                  <h3 className="text-sm font-medium text-muted-foreground">Contatos</h3>
                </div>
                <ScrollArea className="h-32 md:h-full">
                  {contacts.length === 0 ? (
                    <p className="p-4 text-xs text-muted-foreground text-center">Nenhum contato</p>
                  ) : (
                    contacts.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedContact(c)}
                        className={cn(
                          "w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors",
                          selectedContact === c && "bg-accent"
                        )}
                      >
                        <span className="font-medium">+{c}</span>
                      </button>
                    ))
                  )}
                </ScrollArea>
              </div>

              {/* Chat */}
              <ChatArea
                messages={messages}
                selectedContact={selectedContact}
                onSend={(to, content) => sendMessage.mutate({ to_number: to, content })}
                isSending={sendMessage.isPending}
              />
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid gap-2">
                  <p className="text-sm"><strong>Account SID:</strong> {connection?.twilio_account_sid}</p>
                  <p className="text-sm"><strong>Número:</strong> {connection?.twilio_phone_number}</p>
                  <p className="text-sm"><strong>Webhook:</strong></p>
                  <code className="text-xs bg-muted p-2 rounded break-all block">{connection?.twilio_webhook_url}</code>
                  <p className="text-sm"><strong>Status:</strong> <ConnectionBadge status={connection?.status || "disconnected"} /></p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
